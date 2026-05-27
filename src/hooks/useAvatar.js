/**
 * useAvatar Hook — Minimal
 *
 * Clean Three.js scene, VRM loading, simple lighting (no bloom).
 * Idle breathing + blink, emotion expressions, pose rotations, lip sync.
 */

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import useWaifuStore from '../store/waifuStore'
import { EMOTION_MAP, ALL_EMOTION_PRESETS } from '../constants/emotions'

export function useAvatar(containerRef) {
  const vrmRef = useRef(null)
  const rendererRef = useRef(null)
  const clockRef = useRef(new THREE.Clock())
  const frameIdRef = useRef(null)
  const blinkTimerRef = useRef(0)
  const blinkingRef = useRef(false)
  const breathPhaseRef = useRef(0)
  const swayPhaseRef = useRef(0)
  const targetEmotionRef = useRef({ preset: null, intensity: 0 })
  const currentEmotionIntensityRef = useRef(0)
  const targetPoseRef = useRef({})
  const currentPoseBonesRef = useRef({})

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

    // ---- Renderer (clean, no post-processing) ----
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ---- Simple Clean Lighting ----
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.7)
    keyLight.position.set(1, 2, 3)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xe8ecf0, 0.25)
    fillLight.position.set(-2, 1, 1)
    scene.add(fillLight)

    // Subtle backlight for depth
    const backLight = new THREE.DirectionalLight(0xd0d8e0, 0.15)
    backLight.position.set(0, 1, -2)
    scene.add(backLight)

    // ---- Load VRM ----
    const vrmPath = import.meta.env.VITE_VRM_PATH || '/avatar/model.vrm'
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      vrmPath,
      (gltf) => {
        const vrm = gltf.userData.vrm
        if (!vrm) {
          console.error('No VRM data found in GLTF')
          return
        }

        VRMUtils.removeUnnecessaryJoints(vrm.scene)
        vrm.scene.rotation.y = Math.PI
        scene.add(vrm.scene)
        vrmRef.current = vrm
        useWaifuStore.getState().setVrmLoaded(true)
        console.log('✅ VRM loaded')
      },
      (progress) => {
        if (progress.total > 0) {
          console.log(`VRM: ${(progress.loaded / progress.total * 100).toFixed(0)}%`)
        }
      },
      (error) => console.error('VRM load error:', error)
    )

    // ---- Animation Loop (direct render, no composer) ----
    function animate() {
      frameIdRef.current = requestAnimationFrame(animate)
      const delta = clockRef.current.getDelta()

      if (vrmRef.current) {
        updateIdle(vrmRef.current, delta)
        updateBlink(vrmRef.current, delta)
        updateEmotionSmooth(vrmRef.current, delta)
        updatePoseSmooth(vrmRef.current, delta)
        updateLipSync(vrmRef.current)
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      useWaifuStore.getState().setVrmLoaded(false)
    }
  }, [containerRef])

  // ---- Idle: breathing + sway ----
  function updateIdle(vrm, delta) {
    breathPhaseRef.current += delta * 1.2
    swayPhaseRef.current += delta * 0.5

    const spine = vrm.humanoid?.getNormalizedBoneNode('spine')
    const chest = vrm.humanoid?.getNormalizedBoneNode('chest')

    if (spine) spine.rotation.x = Math.sin(breathPhaseRef.current) * 0.008
    if (chest) chest.rotation.z = Math.sin(swayPhaseRef.current) * 0.005
  }

  // ---- Blink ----
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
      else { safeExpr(vrm, 'blink', 0); blinkingRef.current = false; blinkTimerRef.current = 0 }
    }
  }

  // ---- Smooth Emotion ----
  function updateEmotionSmooth(vrm, delta) {
    const target = targetEmotionRef.current
    currentEmotionIntensityRef.current = THREE.MathUtils.lerp(
      currentEmotionIntensityRef.current, target.intensity, delta * 4
    )
    ALL_EMOTION_PRESETS.forEach((p) => safeExpr(vrm, p, 0))
    if (target.preset) safeExpr(vrm, target.preset, currentEmotionIntensityRef.current)
  }

  // ---- Smooth Pose ----
  function updatePoseSmooth(vrm, delta) {
    const speed = 3.0
    Object.entries(targetPoseRef.current).forEach(([boneName, rot]) => {
      const bone = vrm.humanoid?.getNormalizedBoneNode(boneName)
      if (!bone) return
      if (!currentPoseBonesRef.current[boneName]) currentPoseBonesRef.current[boneName] = { x: 0, y: 0, z: 0 }
      const c = currentPoseBonesRef.current[boneName]
      c.x = THREE.MathUtils.lerp(c.x, rot.x || 0, delta * speed)
      c.y = THREE.MathUtils.lerp(c.y, rot.y || 0, delta * speed)
      c.z = THREE.MathUtils.lerp(c.z, rot.z || 0, delta * speed)
      bone.rotation.x += c.x
      bone.rotation.y += c.y
      bone.rotation.z += c.z
    })
  }

  // ---- Lip Sync ----
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

  function safeExpr(vrm, name, val) {
    try { vrm.expressionManager?.setValue(name, val) } catch {}
  }

  // ---- Apply Emotion ----
  const applyEmotion = useCallback((name) => {
    const m = EMOTION_MAP[name]
    if (m) targetEmotionRef.current = { preset: m.preset, intensity: m.intensity }
  }, [])

  // ---- Apply Pose ----
  const applyPose = useCallback((pose) => {
    targetPoseRef.current = {}
    currentPoseBonesRef.current = {}
    switch (pose) {
      case 'wave':
        targetPoseRef.current = { rightUpperArm: { z: -1.2, x: 0.2 }, rightLowerArm: { z: -0.5 } }
        break
      case 'nod':
        targetPoseRef.current = { head: { x: 0.15 } }
        setTimeout(() => { targetPoseRef.current.head = { x: -0.1 }; setTimeout(() => { targetPoseRef.current.head = { x: 0 } }, 400) }, 400)
        break
      case 'shake':
        targetPoseRef.current = { head: { y: 0.2 } }
        setTimeout(() => { targetPoseRef.current.head = { y: -0.2 }; setTimeout(() => { targetPoseRef.current.head = { y: 0 } }, 350) }, 350)
        break
      case 'point':
        targetPoseRef.current = { rightUpperArm: { z: -0.8, x: -0.3 }, rightLowerArm: { z: -0.3, x: -0.2 } }
        break
      case 'bow':
        targetPoseRef.current = { spine: { x: 0.3 }, head: { x: 0.15 } }
        setTimeout(() => { targetPoseRef.current = { spine: { x: 0 }, head: { x: 0 } } }, 1500)
        break
      case 'peace':
        targetPoseRef.current = { rightUpperArm: { z: -0.9 }, rightLowerArm: { z: -0.7, y: 0.3 } }
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
