/**
 * useSTT Hook
 *
 * Speech-to-Text using Web Speech API (browser native).
 * Falls back gracefully if not supported.
 */

import { useCallback, useRef, useEffect, useState } from 'react'
import useWaifuStore from '../store/waifuStore'

export function useSTT() {
  const recognitionRef = useRef(null)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')

  useEffect(() => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.lang = 'id-ID' // Indonesian
      recognition.interimResults = true
      recognition.continuous = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript)
        } else {
          setTranscript(interimTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.error('STT error:', event.error)
        useWaifuStore.getState().setStatus('idle')
      }

      recognition.onend = () => {
        useWaifuStore.getState().setStatus('idle')
      }

      recognitionRef.current = recognition
    } else {
      console.warn('Web Speech API not supported in this browser')
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // Already stopped
        }
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return

    setTranscript('')
    useWaifuStore.getState().setStatus('listening')

    try {
      recognitionRef.current.start()
    } catch (error) {
      // May already be running
      console.warn('STT start error:', error)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
    } catch {
      // Already stopped
    }
  }, [])

  return {
    isSupported,
    transcript,
    startListening,
    stopListening,
    setTranscript,
  }
}
