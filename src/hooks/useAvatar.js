/**
 * useAvatar Hook
 *
 * Clean Three.js scene, VRM loading, natural rest pose (arms down),
 * cute idle animations (breathing, blink, sway, arm movement).
 */

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import useWaifuStore from '../store/waifuStore'
import { EMOTION_MAP, ALL_EMOTION_PRESETS } from '../constants/emotions'

// Natural rest pose — arms down, relaxed stance
const REST_POSE = {
  rightUpperArm:  { x: 0, y: 0, z: 1.15 },
  leftUpperArm:   { x: 0, y: 0, z: -1.15 },
  rightLowerArm:  { x: 0, y: 0, z: -0.08 },
  leftLowerArm:   { x: 0, y: 0, z: 0.08 },
  spine:          { x: 0, y: 0, z: 0 },
  chest:          { x: 0, y: 0, z: 0 },
  head:           { x: 0, y: 0, z: 0 },
}

export function useAvatar(containerRef) {
  const vrmRef = useRef(null)
  const rendererRef = useRef(null)
  const clockRef = useRef(new THREE.Clock())
  const frameIdRef = useRef(null)

  // Animation phases
  const blinkTimerRef = useRef(0)
  const blinkingRef = useRef(false)
  const timeRef = useRef(0)

  // Emotion & Pose
  const targetEmotionRef = useRef({ preset: null, intensity: 0 })
  const currentEmotionIntensityRef = useRef(0)
  const poseOverridesRef = useRef({}) // additional bone rotations from poses (wave, nod, etc.)
  const poseOverrideCurrentRef = useRef({})

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // ---- Scene ----
    const scene = new THREE.Scene()

    // ---- Camera ----
    const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100)
    camera.position.set(0, 1.3, 3.5)
    camera.lookAt(0, 1.0, 0)

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ---- Lighting ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7)
    keyLight.position.set(1, 2, 3)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xe8ecf0, 0.25)
    fillLight.position.set(-2, 1, 1)
    scene.add(fillLight)

    const backLight = new THREE.DirectionalLight(0xd0d8e0, 0.15)
    backLight.position.set(0, 1, -2)
    scene.add(backLight)

    // ---- Load VRM ----
    const vrmPath = import.meta.env.VITE_VRM_PATH || '/avatar/Elena.vrm'
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      vrmPath,
      (gltf) => {
        const vrm = gltf.userData.vrm
        if (!vrm) { console.error('No VRM data in GLTF'); return }

        VRMUtils.removeUnnecessaryJoints(vrm.scene)

        // DO NOT rotate — VRM faces +Z which is towards our camera at +Z
        scene.add(vrm.scene)
        vrmRef.current = vrm

        // Apply rest pose immediately (arms down from T-pose)
        applyRestPose(vrm)

        useWaifuStore.getState().setVrmLoaded(true)
        console.log('✅ VRM loaded — rest pose applied')
      },
      (progress) => {
        if (progress.total > 0) console.log(`VRM: ${(progress.loaded / progress.total * 100).toFixed(0)}%`)
      },
      (error) => console.error('VRM load error:', error)
    )

    // ---- Animation Loop ----
    function animate() {
      frameIdRef.current = requestAnimationFrame(animate)
      const delta = clockRef.current.getDelta()
      timeRef.current += delta

      if (vrmRef.current) {
        // 1. Start from rest pose
        applyRestPose(vrmRef.current)

        // 2. Layer cute idle animation on top
        applyIdleAnimation(vrmRef.current, timeRef.current)

        // 3. Layer pose overrides (wave, nod, etc.)
        applyPoseOverrides(vrmRef.current, delta)

        // 4. Blink
        updateBlink(vrmRef.current, delta)

        // 5. Emotion expression
        updateEmotionSmooth(vrmRef.current, delta)

        // 6. Lip sync
        updateLipSync(vrmRef.current)

        // 7. Update VRM (spring bones, etc.)
        vrmRef.current.update(delta)
      }

      renderer.render(scene, camera)
    }
    animate()

    // ---- Resize ----
    function onResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ---- Cleanup ----
    return () => {
      window.removeEventListener('resize', onResize)
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current)
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene)
        VRMUtils.deepDispose(vrmRef.current.scene)
        vrmRef.current = null
      }
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      useWaifuStore.getState().setVrmLoaded(false)
    }
  }, [containerRef])

  // ============================================================
  //  REST POSE — bring arms down from T-pose
  // ============================================================
  function applyRestPose(vrm) {
    const h = vrm.humanoid
    if (!h) return

    Object.entries(REST_POSE).forEach(([boneName, rot]) => {
      const bone = h.getNormalizedBoneNode(boneName)
      if (bone) {
        bone.rotation.x = rot.x
        bone.rotation.y = rot.y
        bone.rotation.z = rot.z
      }
    })
  }

  // ============================================================
  //  CUTE IDLE ANIMATION — layered on top of rest pose
  // ============================================================
  function applyIdleAnimation(vrm, time) {
    const h = vrm.humanoid
    if (!h) return

    // Breathing — spine gently moves forward/back
    const spine = h.getNormalizedBoneNode('spine')
    if (spine) {
      spine.rotation.x += Math.sin(time * 1.2) * 0.01
    }

    // Upper body sway — gentle side to side
    const chest = h.getNormalizedBoneNode('chest')
    if (chest) {
      chest.rotation.z += Math.sin(time * 0.6) * 0.008
      chest.rotation.x += Math.sin(time * 0.9) * 0.005
    }

    // Head — gentle look-around, slight tilt
    const head = h.getNormalizedBoneNode('head')
    if (head) {
      head.rotation.y += Math.sin(time * 0.4) * 0.04   // look left-right slowly
      head.rotation.z += Math.sin(time * 0.7) * 0.02    // slight tilt
      head.rotation.x += Math.sin(time * 0.5) * 0.01    // tiny nod
    }

    // Arms — gentle sway (additive to rest pose)
    const rArm = h.getNormalizedBoneNode('rightUpperArm')
    const lArm = h.getNormalizedBoneNode('leftUpperArm')
    if (rArm) {
      rArm.rotation.z += Math.sin(time * 0.8) * 0.03
      rArm.rotation.x += Math.sin(time * 0.5) * 0.02
    }
    if (lArm) {
      lArm.rotation.z += Math.sin(time * 0.8 + 0.5) * 0.03
      lArm.rotation.x += Math.sin(time * 0.5 + 0.5) * 0.02
    }

    // Hips — very subtle weight shift
    const hips = h.getNormalizedBoneNode('hips')
    if (hips) {
      hips.rotation.z += Math.sin(time * 0.3) * 0.005
    }
  }

  // ============================================================
  //  BLINK — random natural blinking
  // ============================================================
  function updateBlink(vrm, delta) {
    blinkTimerRef.current += delta

    if (!blinkingRef.current) {
      if (blinkTimerRef.current > 2.5 + Math.random() * 3.5) {
        blinkingRef.current = true
        blinkTimerRef.current = 0
      }
    } else {
      const t = blinkTimerRef.current / 0.15
      if (t < 0.5) safeExpr(vrm, 'blink', t * 2)
      else if (t < 1.0) safeExpr(vrm, 'blink', (1.0 - t) * 2)
      else {
        safeExpr(vrm, 'blink', 0)
        blinkingRef.current = false
        blinkTimerRef.current = 0
      }
    }
  }

  // ============================================================
  //  EMOTION — smooth transitions
  // ============================================================
  function updateEmotionSmooth(vrm, delta) {
    const target = targetEmotionRef.current
    currentEmotionIntensityRef.current = THREE.MathUtils.lerp(
      currentEmotionIntensityRef.current, target.intensity, delta * 4
    )
    ALL_EMOTION_PRESETS.forEach((p) => safeExpr(vrm, p, 0))
    if (target.preset) safeExpr(vrm, target.preset, currentEmotionIntensityRef.current)
  }

  // ============================================================
  //  POSE OVERRIDES — wave, nod, bow, etc. (additive)
  // ============================================================
  function applyPoseOverrides(vrm, delta) {
    const speed = 4.0
    const targets = poseOverridesRef.current

    Object.entries(targets).forEach(([boneName, targetRot]) => {
      const bone = vrm.humanoid?.getNormalizedBoneNode(boneName)
      if (!bone) return

      if (!poseOverrideCurrentRef.current[boneName]) {
        poseOverrideCurrentRef.current[boneName] = { x: 0, y: 0, z: 0 }
      }
      const cur = poseOverrideCurrentRef.current[boneName]

      cur.x = THREE.MathUtils.lerp(cur.x, targetRot.x || 0, delta * speed)
      cur.y = THREE.MathUtils.lerp(cur.y, targetRot.y || 0, delta * speed)
      cur.z = THREE.MathUtils.lerp(cur.z, targetRot.z || 0, delta * speed)

      // Add on top of rest + idle
      bone.rotation.x += cur.x
      bone.rotation.y += cur.y
      bone.rotation.z += cur.z
    })
  }

  // ============================================================
  //  LIP SYNC
  // ============================================================
  function updateLipSync(vrm) {
    const analyser = useWaifuStore.getState().analyserNode
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) sum += data[i]
    const avg = sum / data.length / 255
    if (avg > 0.02) {
      safeExpr(vrm, 'aa', Math.min(avg * 2.5, 1))
      safeExpr(vrm, 'oh', avg * 0.3)
    } else {
      safeExpr(vrm, 'aa', 0)
      safeExpr(vrm, 'oh', 0)
    }
  }

  // ============================================================
  //  HELPERS
  // ============================================================
  function safeExpr(vrm, name, val) {
    try { vrm.expressionManager?.setValue(name, val) } catch {}
  }

  const applyEmotion = useCallback((name) => {
    const m = EMOTION_MAP[name]
    if (m) targetEmotionRef.current = { preset: m.preset, intensity: m.intensity }
  }, [])

  const applyPose = useCallback((pose) => {
    // Clear overrides — they smoothly lerp back to 0
    poseOverridesRef.current = {}
    poseOverrideCurrentRef.current = {}

    switch (pose) {
      case 'wave':
        // Right arm up and waving — override relative to rest pose
        poseOverridesRef.current = {
          rightUpperArm: { z: -1.8, x: 0.2 },  // lift arm up from rest
          rightLowerArm: { z: -0.5, x: 0.2 },
        }
        break
      case 'nod':
        poseOverridesRef.current = { head: { x: 0.2 } }
        setTimeout(() => {
          poseOverridesRef.current.head = { x: -0.1 }
          setTimeout(() => { poseOverridesRef.current.head = { x: 0 } }, 400)
        }, 400)
        break
      case 'shake':
        poseOverridesRef.current = { head: { y: 0.25 } }
        setTimeout(() => {
          poseOverridesRef.current.head = { y: -0.25 }
          setTimeout(() => { poseOverridesRef.current.head = { y: 0 } }, 350)
        }, 350)
        break
      case 'point':
        poseOverridesRef.current = {
          rightUpperArm: { z: -1.5, x: -0.3 },
          rightLowerArm: { z: -0.3, x: -0.2 },
        }
        break
      case 'bow':
        poseOverridesRef.current = { spine: { x: 0.3 }, head: { x: 0.15 } }
        setTimeout(() => { poseOverridesRef.current = { spine: { x: 0 }, head: { x: 0 } } }, 1500)
        break
      case 'peace':
        poseOverridesRef.current = {
          rightUpperArm: { z: -1.5 },
          rightLowerArm: { z: -0.5, y: 0.3 },
        }
        break
      default: break
    }
  }, [])

  // Store subscription
  useEffect(() => {
    let prevEmotion = useWaifuStore.getState().currentEmotion
    let prevPose = useWaifuStore.getState().currentPose
    const unsub = useWaifuStore.subscribe((state) => {
      if (state.currentEmotion !== prevEmotion) { prevEmotion = state.currentEmotion; applyEmotion(state.currentEmotion) }
      if (state.currentPose !== prevPose) { prevPose = state.currentPose; applyPose(state.currentPose) }
    })
    return () => unsub()
  }, [applyEmotion, applyPose])

  return { vrmRef }
}
