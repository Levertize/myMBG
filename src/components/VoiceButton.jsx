/**
 * VoiceButton — Minimal
 *
 * Simple circle mic button, no glow rings.
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
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2" id="voice-section">
      {/* Live transcript */}
      {transcript && isListening && (
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-1.5 max-w-[240px] anim-fade-in">
          <p className="text-[12px] text-white/30 font-light truncate">"{transcript}"</p>
        </div>
      )}

      {/* Button */}
      <button
        onMouseDown={isSupported ? handleDown : undefined}
        onMouseUp={isSupported ? handleUp : undefined}
        onMouseLeave={isHolding ? handleUp : undefined}
        onTouchStart={isSupported ? handleDown : undefined}
        onTouchEnd={isSupported ? handleUp : undefined}
        disabled={isBusy}
        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 disabled:opacity-15
          ${isListening
            ? 'bg-white/[0.06] border-white/[0.15]'
            : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
          }`}
        id="voice-btn"
      >
        {isListening ? (
          <div className="flex gap-[3px] items-center h-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[2px] bg-white/30 rounded-full transition-all"
                style={{
                  height: `${8 + Math.sin(Date.now() / 200 + i * 1.2) * 6}px`,
                  animation: `pulse-soft 0.6s ${i * 0.1}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        ) : (
          <svg className="w-4 h-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0014 0" />
            <line x1="12" y1="17" x2="12" y2="22" />
          </svg>
        )}
      </button>

      {/* Hint */}
      <p className="text-[10px] text-white/10 font-light tracking-widest uppercase">
        {!isSupported ? 'Unavailable' : isListening ? 'Listening' : isBusy ? '' : 'Hold to talk'}
      </p>
    </div>
  )
}

export default memo(VoiceButton)
