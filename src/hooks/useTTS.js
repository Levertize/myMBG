/**
 * useTTS Hook
 *
 * Handles text-to-speech via ElevenLabs.
 * Plays audio and provides AnalyserNode to store for lip sync.
 */

import { useCallback, useRef } from 'react'
import { synthesizeSpeech, playAudioWithAnalyser } from '../lib/elevenLabs'
import useWaifuStore from '../store/waifuStore'

export function useTTS() {
  const audioContextRef = useRef(null)
  const sourceRef = useRef(null)

  const speak = useCallback(async (text) => {
    const store = useWaifuStore.getState()

    // Stop any currently playing audio
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        // Already stopped
      }
    }

    store.setStatus('talking')

    try {
      const { audioBuffer } = await synthesizeSpeech(text)

      if (!audioBuffer) {
        // No TTS available — just show as talking briefly then idle
        await new Promise((r) => setTimeout(r, 1500))
        store.setStatus('idle')
        return
      }

      const { analyserNode, source, audioContext } = await playAudioWithAnalyser(audioBuffer)

      sourceRef.current = source
      audioContextRef.current = audioContext

      // Set analyser for lip sync
      store.setAnalyserNode(analyserNode)

      // When audio ends, reset status
      source.onended = () => {
        store.setAnalyserNode(null)
        store.setStatus('idle')
        store.setPose('idle')
        sourceRef.current = null
      }
    } catch (error) {
      console.error('TTS error:', error)
      store.setAnalyserNode(null)
      store.setStatus('idle')
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        // Already stopped
      }
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    const store = useWaifuStore.getState()
    store.setAnalyserNode(null)
    store.setStatus('idle')
  }, [])

  return { speak, stopSpeaking }
}
