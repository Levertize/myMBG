/**
 * VoiceButton — Polished, colorful
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3" id="voice-section">
      {/* Transcript preview */}
      {transcript && isListening && (
        <div className="bg-elevated border border-[rgba(148,163,184,0.08)] rounded-xl px-4 py-2 max-w-[260px] anim-fade-in">
          <p className="text-[12px] text-[#94a3b8] font-light truncate">"{transcript}"</p>
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
        className={`voice-btn ${isListening ? 'voice-btn--active' : ''}`}
        id="voice-btn"
      >
        {isListening ? (
          <div className="flex gap-[3px] items-center h-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-accent-indigo"
                style={{ animation: `bar-wave 0.7s ${i * 0.12}s ease-in-out infinite` }}
              />
            ))}
          </div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0014 0" />
            <line x1="12" y1="17" x2="12" y2="22" />
          </svg>
        )}
      </button>

      {/* Label */}
      <span className="text-[10px] text-[#64748b] font-medium tracking-widest uppercase">
        {!isSupported ? 'Unavailable' : isListening ? 'Listening...' : isBusy ? '' : 'Hold to talk'}
      </span>
    </div>
  )
}

export default memo(VoiceButton)
