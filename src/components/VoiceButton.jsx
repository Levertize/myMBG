/**
 * VoiceButton — Mockup-aligned minimalist microphone controller
 */

import { useState, useCallback, useEffect, memo } from 'react'
import useWaifuStore from '../store/waifuStore'
import { useSTT } from '../hooks/useSTT'
import { useAI } from '../hooks/useAI'
import { useTTS } from '../hooks/useTTS'

function VoiceButton() {
  const status = useWaifuStore((s) => s.status)
  const { isSupported, transcript, startListening, stopListening, setTranscript } = useSTT()
  const { sendMessage } = useAI()
  const { speak } = useTTS()
  const [isHolding, setIsHolding] = useState(false)

  useEffect(() => {
    if (transcript && status !== 'listening' && !isHolding) {
      const text = transcript.trim()
      if (text) {
        setTranscript('')
        ;(async () => {
          const response = await sendMessage(text)
          if (response) speak(response.reply)
        })()
      }
    }
  }, [status, isHolding])

  const handleDown = useCallback(() => {
    if (status !== 'idle') return
    setIsHolding(true)
    startListening()
  }, [status, startListening])

  const handleUp = useCallback(() => {
    setIsHolding(false)
    stopListening()
  }, [stopListening])

  const isListening = status === 'listening'
  const isBusy = status === 'thinking' || status === 'talking'

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4" id="voice-section">
      {/* Transcript preview overlay */}
      {transcript && isListening && (
        <div className="bg-zinc-950/60 border border-white/5 backdrop-blur-xl rounded-xl px-4 py-2 max-w-[260px] anim-fade-in shadow-xl">
          <p className="text-[12px] text-zinc-300 font-sans font-light truncate">"{transcript}"</p>
        </div>
      )}

      {/* Circle Microphone Button */}
      <button
        onMouseDown={isSupported ? handleDown : undefined}
        onMouseUp={isSupported ? handleUp : undefined}
        onMouseLeave={isHolding ? handleUp : undefined}
        onTouchStart={isSupported ? handleDown : undefined}
        onTouchEnd={isSupported ? handleUp : undefined}
        disabled={isBusy || !isSupported}
        className={`w-[60px] h-[60px] rounded-full border flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
          isListening
            ? 'bg-zinc-100 border-zinc-100 text-zinc-950 shadow-[0_0_25px_0_rgba(255,255,255,0.25)] scale-105'
            : 'bg-zinc-950/20 border-white/10 text-zinc-400 hover:text-zinc-100 hover:border-white/20 hover:bg-zinc-900/30'
        } disabled:opacity-20 disabled:cursor-not-allowed`}
        id="voice-btn"
      >
        <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0014 0" />
          <line x1="12" y1="17" x2="12" y2="22" />
        </svg>
      </button>
    </div>
  )
}

export default memo(VoiceButton)
