/**
 * useAvatar Hook
 *
 * Manages the Three.js scene, VRM model loading, post-processing bloom
 * (for glow outline), idle animations, emotion expressions, pose bone
 * rotations, and lip sync.
 */

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import useWaifuStore from '../store/waifuStore'
import { EMOTION_MAP, ALL_EMOTION_PRESETS, ALL_VISEME_PRESETS } from '../constants/emotions'

export function useAvatar(containerRef) {
  const vrmRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const composerRef = useRef(null)
  const cameraRef = useRef(null)
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
    sceneRef.current = scene

    // ---- Camera ----
    const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100)
    camera.position.set(0, 1.3, 3.5)
    camera.lookAt(0, 1.0, 0)
    cameraRef.current = camera

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ---- Lighting for rim/backlight glow effect ----
    // Soft ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    // Main key light (front-top)
    const keyLight = new THREE.DirectionalLight(0xfff5ee, 0.8)
    keyLight.position.set(1, 2, 3)
    scene.add(keyLight)

    // Fill light (soft, from left)
    const fillLight = new THREE.DirectionalLight(0xe0e8ff, 0.3)
    fillLight.position.set(-2, 1, 1)
    scene.add(fillLight)

    // Rim light — cyan glow from behind-right (creates glowing edge)
    const rimLight = new THREE.PointLight(0x00f0ff, 2.5, 10)
    rimLight.position.set(1.5, 1.5, -1.5)
    scene.add(rimLight)

    // Rim light — magenta glow from behind-left
    const rimLight2 = new THREE.PointLight(0xff00e6, 1.8, 10)
    rimLight2.position.set(-1.5, 1.2, -1.0)
    scene.add(rimLight2)

    // Subtle bottom light for dramatic feel
    const bottomLight = new THREE.PointLight(0xa855f7, 0.8, 8)
    bottomLight.position.set(0, -0.5, 1)
    scene.add(bottomLight)

    // ---- Post-Processing (Bloom for Glow Outline) ----
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.2,    // strength — visible glow
      0.6,    // radius — soft spread
      0.3     // threshold — catch rim-lit edges
    )
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())
    composerRef.current = composer

    // ---- Load VRM Model ----
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

        // Rotate model to face camera (VRM default looks +Z, we want -Z)
        vrm.scene.rotation.y = Math.PI

        scene.add(vrm.scene)
        vrmRef.current = vrm

        useWaifuStore.getState().setVrmLoaded(true)
        console.log('✅ VRM model loaded successfully')
      },
      (progress) => {
        const pct = (progress.loaded / progress.total * 100).toFixed(0)
        console.log(`Loading VRM: ${pct}%`)
      },
      (error) => {
        console.error('❌ VRM load error:', error)
      }
    )

    // ---- Animation Loop ----
    function animate() {
      frameIdRef.current = requestAnimationFrame(animate)
      const delta = clockRef.current.getDelta()

      if (vrmRef.current) {
        updateIdleAnimation(vrmRef.current, delta)
        updateBlinkAnimation(vrmRef.current, delta)
        updateEmotionSmooth(vrmRef.current, delta)
        updatePoseSmooth(vrmRef.current, delta)
        updateLipSync(vrmRef.current)
        vrmRef.current.update(delta)
      }

      composer.render()
    }

    animate()

    // ---- Resize Handler ----
    function onResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      composer.setSize(w, h)
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
      composer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      useWaifuStore.getState().setVrmLoaded(false)
    }
  }, [containerRef])

  // ---- Idle Animation: Breathing + Subtle Sway ----
  function updateIdleAnimation(vrm, delta) {
    breathPhaseRef.current += delta * 1.2
    swayPhaseRef.current += delta * 0.5

    const spineNode = vrm.humanoid?.getNormalizedBoneNode('spine')
    const chestNode = vrm.humanoid?.getNormalizedBoneNode('chest')

    if (spineNode) {
      // Subtle breathing — spine slight forward/back
      const breathVal = Math.sin(breathPhaseRef.current) * 0.008
      spineNode.rotation.x = breathVal
    }

    if (chestNode) {
      // Subtle sway
      const swayVal = Math.sin(swayPhaseRef.current) * 0.005
      chestNode.rotation.z = swayVal
    }
  }

  // ---- Eye Blink Animation ----
  function updateBlinkAnimation(vrm, delta) {
    blinkTimerRef.current += delta

    if (!blinkingRef.current) {
      // Random blink every 2-6 seconds
      if (blinkTimerRef.current > 2.5 + Math.random() * 3.5) {
        blinkingRef.current = true
        blinkTimerRef.current = 0
      }
    } else {
      // Blink duration: ~0.15s
      const t = blinkTimerRef.current / 0.15
      if (t < 0.5) {
        // Closing
        safeSetExpression(vrm, 'blink', t * 2)
      } else if (t < 1.0) {
        // Opening
        safeSetExpression(vrm, 'blink', (1.0 - t) * 2)
      } else {
        safeSetExpression(vrm, 'blink', 0)
        blinkingRef.current = false
        blinkTimerRef.current = 0
      }
    }
  }

  // ---- Smooth Emotion Transition ----
  function updateEmotionSmooth(vrm, delta) {
    const target = targetEmotionRef.current
    const speed = 4.0 // transition speed

    // Smoothly interpolate intensity
    currentEmotionIntensityRef.current = THREE.MathUtils.lerp(
      currentEmotionIntensityRef.current,
      target.intensity,
      delta * speed
    )

    // Reset all emotion expressions
    ALL_EMOTION_PRESETS.forEach((preset) => {
      safeSetExpression(vrm, preset, 0)
    })

    // Apply target emotion
    if (target.preset) {
      safeSetExpression(vrm, target.preset, currentEmotionIntensityRef.current)
    }
  }

  // ---- Smooth Pose Transition ----
  function updatePoseSmooth(vrm, delta) {
    const speed = 3.0
    const targets = targetPoseRef.current

    Object.entries(targets).forEach(([boneName, targetRotation]) => {
      const bone = vrm.humanoid?.getNormalizedBoneNode(boneName)
      if (!bone) return

      if (!currentPoseBonesRef.current[boneName]) {
        currentPoseBonesRef.current[boneName] = { x: 0, y: 0, z: 0 }
      }
      const current = currentPoseBonesRef.current[boneName]

      current.x = THREE.MathUtils.lerp(current.x, targetRotation.x || 0, delta * speed)
      current.y = THREE.MathUtils.lerp(current.y, targetRotation.y || 0, delta * speed)
      current.z = THREE.MathUtils.lerp(current.z, targetRotation.z || 0, delta * speed)

      bone.rotation.x += current.x
      bone.rotation.y += current.y
      bone.rotation.z += current.z
    })
  }

  // ---- Lip Sync from AnalyserNode ----
  function updateLipSync(vrm) {
    const analyserNode = useWaifuStore.getState().analyserNode
    if (!analyserNode) return

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount)
    analyserNode.getByteFrequencyData(dataArray)

    // Get average amplitude
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    const average = sum / dataArray.length / 255 // normalize to 0-1

    // Drive viseme based on amplitude
    if (average > 0.02) {
      const aaVal = Math.min(average * 2.5, 1.0)
      safeSetExpression(vrm, 'aa', aaVal)
      safeSetExpression(vrm, 'oh', aaVal * 0.3)
    } else {
      safeSetExpression(vrm, 'aa', 0)
      safeSetExpression(vrm, 'oh', 0)
    }
  }

  // ---- Safe Expression Setter (handles both VRM v0 and v1) ----
  function safeSetExpression(vrm, name, value) {
    try {
      if (vrm.expressionManager) {
        vrm.expressionManager.setValue(name, value)
      }
    } catch {
      // Expression not found, silently ignore
    }
  }

  // ---- Apply Emotion (called from store subscription) ----
  const applyEmotion = useCallback((emotionName) => {
    const mapping = EMOTION_MAP[emotionName]
    if (!mapping) return

    targetEmotionRef.current = {
      preset: mapping.preset,
      intensity: mapping.intensity,
    }
  }, [])

  // ---- Apply Pose ----
  const applyPose = useCallback((poseName) => {
    // Reset current pose targets
    targetPoseRef.current = {}
    currentPoseBonesRef.current = {}

    switch (poseName) {
      case 'wave':
        targetPoseRef.current = {
          rightUpperArm: { z: -1.2, x: 0.2 },
          rightLowerArm: { z: -0.5 },
        }
        break
      case 'nod':
        targetPoseRef.current = {
          head: { x: 0.15 },
        }
        // Auto-reset nod after a moment
        setTimeout(() => {
          if (targetPoseRef.current.head) {
            targetPoseRef.current.head = { x: -0.1 }
            setTimeout(() => {
              targetPoseRef.current.head = { x: 0 }
            }, 400)
          }
        }, 400)
        break
      case 'shake':
        targetPoseRef.current = {
          head: { y: 0.2 },
        }
        setTimeout(() => {
          targetPoseRef.current.head = { y: -0.2 }
          setTimeout(() => {
            targetPoseRef.current.head = { y: 0 }
          }, 350)
        }, 350)
        break
      case 'point':
        targetPoseRef.current = {
          rightUpperArm: { z: -0.8, x: -0.3 },
          rightLowerArm: { z: -0.3, x: -0.2 },
        }
        break
      case 'bow':
        targetPoseRef.current = {
          spine: { x: 0.3 },
          head: { x: 0.15 },
        }
        // Auto-unbowed after 1.5s
        setTimeout(() => {
          targetPoseRef.current = {
            spine: { x: 0 },
            head: { x: 0 },
          }
        }, 1500)
        break
      case 'peace':
        targetPoseRef.current = {
          rightUpperArm: { z: -0.9 },
          rightLowerArm: { z: -0.7, y: 0.3 },
        }
        break
      case 'idle':
      default:
        targetPoseRef.current = {}
        break
    }
  }, [])

  // Subscribe to store changes (Zustand v5 API: full state listener)
  useEffect(() => {
    let prevEmotion = useWaifuStore.getState().currentEmotion
    let prevPose = useWaifuStore.getState().currentPose

    const unsub = useWaifuStore.subscribe((state) => {
      if (state.currentEmotion !== prevEmotion) {
        prevEmotion = state.currentEmotion
        applyEmotion(state.currentEmotion)
      }
      if (state.currentPose !== prevPose) {
        prevPose = state.currentPose
        applyPose(state.currentPose)
      }
    })

    return () => unsub()
  }, [applyEmotion, applyPose])

  return { vrmRef }
}
