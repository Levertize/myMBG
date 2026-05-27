/**
 * useAvatar Hook — Fixed rotation
 *
 * Sets absolute bone rotations each frame (no accumulation).
 * Rest pose once on load, idle animation as direct values.
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
  const timeRef = useRef(0)
  const blinkTimerRef = useRef(0)
  const blinkingRef = useRef(false)
  const targetEmotionRef = useRef({ preset: null, intensity: 0 })
  const currentEmotionIntensityRef = useRef(0)
  const poseOverridesRef = useRef({})
  const poseCurrentRef = useRef({})
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetHeadYawRef = useRef(0)
  const targetHeadPitchRef = useRef(0)
  const spineRotRef = useRef({ x: 0, y: 0, z: 0 })
  const chestRotRef = useRef({ x: 0, y: 0, z: 0 })
  const neckRotRef = useRef({ x: 0, y: 0, z: 0 })
  const headRotRef = useRef({ x: 0, y: 0, z: 0 })
  const rightArmRotRef = useRef({ x: 0, y: 0, z: 0 })
  const leftArmRotRef = useRef({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100)
    camera.position.set(0, 1.3, 3.5)
    camera.lookAt(0, 1.0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting - Minimalist studio setup
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 0.75)
    key.position.set(1, 2, 3)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.3)
    fill.position.set(-2, 1, 1)
    scene.add(fill)
    const back = new THREE.DirectionalLight(0xffffff, 0.2)
    back.position.set(0, 1, -2)
    scene.add(back)

    // Load VRM
    const vrmPath = import.meta.env.VITE_VRM_PATH || '/avatar/Elena.vrm'
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      vrmPath,
      (gltf) => {
        const vrm = gltf.userData.vrm
        if (!vrm) return

        VRMUtils.removeUnnecessaryJoints(vrm.scene)
        scene.add(vrm.scene)
        vrmRef.current = vrm

        // Set rest pose once — arms down
        setBone(vrm, 'rightUpperArm', 0, 0, 1.22)
        setBone(vrm, 'leftUpperArm', 0, 0, -1.22)
        setBone(vrm, 'rightLowerArm', 0, 0, -0.06)
        setBone(vrm, 'leftLowerArm', 0, 0, 0.06)

        useWaifuStore.getState().setVrmLoaded(true)
        console.log('✅ VRM loaded')
      },
      undefined,
      (err) => console.error('VRM error:', err)
    )

    // Mouse tracking listener
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    function animate() {
      frameIdRef.current = requestAnimationFrame(animate)
      // Cap delta to 0.1s to prevent physics/rotation explosion when resuming from tab suspension
      const delta = Math.min(clockRef.current.getDelta(), 0.1)
      timeRef.current += delta

      const vrm = vrmRef.current
      if (vrm) {
        const t = timeRef.current

        // === INTERACTIVE: Mouse tracking calculations ===
        // Smoothly lerp towards target mouse coordinates (limits gaze range)
        targetHeadYawRef.current = THREE.MathUtils.lerp(targetHeadYawRef.current, mouseRef.current.x * 0.32, delta * 3.5)
        targetHeadPitchRef.current = THREE.MathUtils.lerp(targetHeadPitchRef.current, mouseRef.current.y * 0.2, delta * 3.5)

        // === LIVE2D-STYLE IDLE ANIMATIONS (Slow, Overlapping, Lerped) ===
        const lerpSpeed = 2.5 // Low multiplier for ultra-smooth fluid lag

        // 1. Spine (Slow lateral weight shift)
        const targetSpineX = Math.sin(t * 0.5) * 0.018 // Breathing pitch
        const targetSpineY = Math.sin(t * 0.3) * 0.025 // Yaw sway
        const targetSpineZ = Math.cos(t * 0.3) * 0.022 // Roll sway
        const spine = spineRotRef.current
        spine.x = THREE.MathUtils.lerp(spine.x, targetSpineX, delta * lerpSpeed)
        spine.y = THREE.MathUtils.lerp(spine.y, targetSpineY, delta * lerpSpeed)
        spine.z = THREE.MathUtils.lerp(spine.z, targetSpineZ, delta * lerpSpeed)
        setBone(vrm, 'spine', spine.x, spine.y, spine.z)

        // 2. Chest (Breathing sway, lagged phase)
        const targetChestX = Math.sin(t * 0.5 - 0.4) * 0.008
        const targetChestZ = Math.sin(t * 0.25) * 0.008
        const chest = chestRotRef.current
        chest.x = THREE.MathUtils.lerp(chest.x, targetChestX, delta * lerpSpeed)
        chest.z = THREE.MathUtils.lerp(chest.z, targetChestZ, delta * lerpSpeed)
        setBone(vrm, 'chest', chest.x, 0, chest.z)

        // 3. Neck (follows head with a slight delay)
        const targetNeckX = targetHeadPitchRef.current * 0.25
        const targetNeckY = targetHeadYawRef.current * 0.25
        const neck = neckRotRef.current
        neck.x = THREE.MathUtils.lerp(neck.x, targetNeckX, delta * lerpSpeed)
        neck.y = THREE.MathUtils.lerp(neck.y, targetNeckY, delta * lerpSpeed)
        setBone(vrm, 'neck', neck.x, neck.y, 0)

        // 4. Head (Tilt and sway, lagged phase + mouse tracking)
        const targetHeadX = targetHeadPitchRef.current * 0.75 + Math.sin(t * 0.5 - 0.8) * 0.012
        const targetHeadY = targetHeadYawRef.current * 0.75 + Math.sin(t * 0.25) * 0.025
        const targetHeadZ = Math.sin(t * 0.25 - 0.5) * 0.022 // Head tilt roll
        const head = headRotRef.current
        head.x = THREE.MathUtils.lerp(head.x, targetHeadX, delta * lerpSpeed)
        head.y = THREE.MathUtils.lerp(head.y, targetHeadY, delta * lerpSpeed)
        head.z = THREE.MathUtils.lerp(head.z, targetHeadZ, delta * lerpSpeed)
        setBone(vrm, 'head', head.x, head.y, head.z)

        // 5. Upper Arms (Counter-balance sway, relaxed forward hang)
        const targetArmRX = -0.05 + Math.sin(t * 0.35) * 0.02
        const targetArmRZ = 1.22 + Math.sin(t * 0.5) * 0.015
        const armR = rightArmRotRef.current
        armR.x = THREE.MathUtils.lerp(armR.x, targetArmRX, delta * lerpSpeed)
        armR.z = THREE.MathUtils.lerp(armR.z, targetArmRZ, delta * lerpSpeed)
        setBone(vrm, 'rightUpperArm', armR.x, -0.05, armR.z)

        const targetArmLX = -0.05 - Math.sin(t * 0.35) * 0.02
        const targetArmLZ = -1.22 + Math.sin(t * 0.5 + 0.3) * 0.015
        const armL = leftArmRotRef.current
        armL.x = THREE.MathUtils.lerp(armL.x, targetArmLX, delta * lerpSpeed)
        armL.z = THREE.MathUtils.lerp(armL.z, targetArmLZ, delta * lerpSpeed)
        setBone(vrm, 'leftUpperArm', armL.x, 0.05, armL.z)

        // 6. Forearms (Relaxed forward elbow bend on X-axis)
        const targetLowerArmRX = 0.35 + Math.sin(t * 0.5 - 0.2) * 0.02
        const targetLowerArmLX = 0.35 + Math.sin(t * 0.5 - 0.2 + 0.3) * 0.02
        setBone(vrm, 'rightLowerArm', targetLowerArmRX, 0.1, 0)
        setBone(vrm, 'leftLowerArm', targetLowerArmLX, -0.1, 0)

        // 7. Fingers (Slow breath curl)
        const curl = 0.22 + Math.sin(t * 0.5) * 0.07
        setBone(vrm, 'rightIndexProximal', curl, 0, 0)
        setBone(vrm, 'rightMiddleProximal', curl * 1.1, 0, 0)
        setBone(vrm, 'rightRingProximal', curl * 1.1, 0, 0)
        setBone(vrm, 'rightLittleProximal', curl * 0.9, 0, 0)
        setBone(vrm, 'leftIndexProximal', curl, 0, 0)
        setBone(vrm, 'leftMiddleProximal', curl * 1.1, 0, 0)
        setBone(vrm, 'leftRingProximal', curl * 1.1, 0, 0)
        setBone(vrm, 'leftLittleProximal', curl * 0.9, 0, 0)

        // === Pose overrides (smooth lerp) ===
        const currentPose = useWaifuStore.getState().currentPose
        Object.entries(poseOverridesRef.current).forEach(([boneName, target]) => {
          if (!poseCurrentRef.current[boneName]) poseCurrentRef.current[boneName] = { x: 0, y: 0, z: 0 }
          const c = poseCurrentRef.current[boneName]
          c.x = THREE.MathUtils.lerp(c.x, target.x || 0, delta * 4)
          c.y = THREE.MathUtils.lerp(c.y, target.y || 0, delta * 4)
          c.z = THREE.MathUtils.lerp(c.z, target.z || 0, delta * 4)

          const bone = vrm.humanoid?.getNormalizedBoneNode(boneName)
          if (bone) {
            bone.rotation.x += c.x
            bone.rotation.y += c.y
            bone.rotation.z += c.z

            // Active wave swing animation
            if (boneName === 'rightUpperArm' && currentPose === 'wave') {
              bone.rotation.z += Math.sin(t * 10) * 0.18
            }
          }
        })

        // === Blink ===
        updateBlink(vrm, delta)

        // === Emotion ===
        updateEmotion(vrm, delta)

        // === Lip sync ===
        updateLipSync(vrm)

        // === VRM update (spring bones etc) ===
        vrm.update(delta)
      }

      renderer.render(scene, camera)
    }
    animate()

    function onResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', handleMouseMove)
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

  // ---- Set bone rotation (absolute) ----
  function setBone(vrm, name, x, y, z) {
    const bone = vrm.humanoid?.getNormalizedBoneNode(name)
    if (bone) { bone.rotation.x = x; bone.rotation.y = y; bone.rotation.z = z }
  }

  // ---- Blink ----
  function updateBlink(vrm, delta) {
    blinkTimerRef.current += delta
    if (!blinkingRef.current) {
      if (blinkTimerRef.current > 3 + Math.random() * 3) {
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

  // ---- Emotion ----
  function updateEmotion(vrm, delta) {
    const target = targetEmotionRef.current
    currentEmotionIntensityRef.current = THREE.MathUtils.lerp(
      currentEmotionIntensityRef.current, target.intensity, delta * 4
    )
    
    // Clear all possible presets and fallbacks (both cases)
    const list = [
      'happy', 'sad', 'angry', 'surprised', 'relaxed',
      'joy', 'sorrow', 'fun',
      'Joy', 'Sorrow', 'Angry', 'Fun', 'Surprised', 'Blink'
    ]
    list.forEach((p) => safeExpr(vrm, p, 0))

    if (target.preset) safeExpr(vrm, target.preset, currentEmotionIntensityRef.current)
    if (target.fallback) safeExpr(vrm, target.fallback, currentEmotionIntensityRef.current)
  }

  // ---- Lip sync ----
  function updateLipSync(vrm) {
    const analyser = useWaifuStore.getState().analyserNode
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) sum += data[i]
    const avg = sum / data.length / 255
    safeExpr(vrm, 'aa', avg > 0.02 ? Math.min(avg * 2.5, 1) : 0)
    safeExpr(vrm, 'oh', avg > 0.02 ? avg * 0.3 : 0)
  }

  function safeExpr(vrm, name, val) {
    try { vrm.expressionManager?.setValue(name, val) } catch {}
  }

  const applyEmotion = useCallback((name) => {
    const m = EMOTION_MAP[name]
    if (m) {
      targetEmotionRef.current = {
        preset: m.preset,
        fallback: m.fallback,
        intensity: m.intensity
      }
    }
  }, [])

  const applyPose = useCallback((pose) => {
    poseOverridesRef.current = {}
    poseCurrentRef.current = {}
    switch (pose) {
      case 'wave':
        poseOverridesRef.current = { rightUpperArm: { z: -1.8, x: 0.2 }, rightLowerArm: { z: -0.5 } }
        break
      case 'nod':
        poseOverridesRef.current = { head: { x: 0.2 } }
        setTimeout(() => { poseOverridesRef.current.head = { x: -0.1 }; setTimeout(() => { poseOverridesRef.current.head = { x: 0 } }, 400) }, 400)
        break
      case 'shake':
        poseOverridesRef.current = { head: { y: 0.25 } }
        setTimeout(() => { poseOverridesRef.current.head = { y: -0.25 }; setTimeout(() => { poseOverridesRef.current.head = { y: 0 } }, 350) }, 350)
        break
      case 'bow':
        poseOverridesRef.current = { spine: { x: 0.3 }, head: { x: 0.15 } }
        setTimeout(() => { poseOverridesRef.current = { spine: { x: 0 }, head: { x: 0 } } }, 1500)
        break
      case 'peace':
        poseOverridesRef.current = { rightUpperArm: { z: -1.5 }, rightLowerArm: { z: -0.5, y: 0.3 } }
        break
      default: break
    }
  }, [])

  // Store subscription
  useEffect(() => {
    let prevE = useWaifuStore.getState().currentEmotion
    let prevP = useWaifuStore.getState().currentPose
    const unsub = useWaifuStore.subscribe((s) => {
      if (s.currentEmotion !== prevE) { prevE = s.currentEmotion; applyEmotion(s.currentEmotion) }
      if (s.currentPose !== prevP) { prevP = s.currentPose; applyPose(s.currentPose) }
    })
    return () => unsub()
  }, [applyEmotion, applyPose])

  return { vrmRef }
}
