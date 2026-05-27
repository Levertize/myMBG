/**
 * VoiceButton Component
 *
 * Circular mic button with animated glow ring.
 * Pulsing animation when listening, visual feedback per state.
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

  // When transcript is finalized and we stop listening, send it
  useEffect(() => {
    if (transcript && status !== 'listening' && !isHolding) {
      const text = transcript.trim()
      if (text) {
        setTranscript('')
        handleVoiceMessage(text)
      }
    }
  }, [status, isHolding])

  const handleVoiceMessage = async (text) => {
    const response = await sendMessage(text)
    if (response) {
      speak(response.reply)
    }
  }

  const handleMouseDown = useCallback(() => {
    if (status !== 'idle') return
    setIsHolding(true)
    startListening()
  }, [status, startListening])

  const handleMouseUp = useCallback(() => {
    setIsHolding(false)
    stopListening()
  }, [stopListening])

  const handleClick = useCallback(() => {
    if (!isSupported) return
    if (status === 'listening') {
      stopListening()
      setIsHolding(false)
    } else if (status === 'idle') {
      startListening()
    }
  }, [status, isSupported, startListening, stopListening])

  const isListening = status === 'listening'
  const isThinking = status === 'thinking'
  const isTalking = status === 'talking'
  const isDisabled = isThinking || isTalking

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3" id="voice-section">
      {/* Transcript preview */}
      {transcript && isListening && (
        <div className="glass rounded-xl px-4 py-2 max-w-xs animate-fade-in">
          <p className="text-sm text-white/60 font-light italic">"{transcript}"</p>
        </div>
      )}

      {/* Voice Button */}
      <button
        onMouseDown={isSupported ? handleMouseDown : undefined}
        onMouseUp={isSupported ? handleMouseUp : undefined}
        onMouseLeave={isSupported && isHolding ? handleMouseUp : undefined}
        onTouchStart={isSupported ? handleMouseDown : undefined}
        onTouchEnd={isSupported ? handleMouseUp : undefined}
        onClick={!isSupported ? undefined : handleClick}
        disabled={isDisabled}
        className={`voice-btn w-16 h-16 rounded-full flex items-center justify-center
          border-2 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
          ${isListening
            ? 'voice-btn--listening bg-gradient-to-br from-glow-magenta/25 to-glow-purple/20'
            : 'bg-gradient-to-br from-glow-cyan/10 to-glow-magenta/8 border-glow-cyan/20 hover:border-glow-cyan/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]'
          }`}
        id="voice-btn"
        title={isSupported ? 'Hold to talk' : 'Voice not supported'}
      >
        {isListening ? (
          /* Mic active — animated wave bars */
          <div className="flex gap-0.5 items-center h-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-glow-magenta/80 rounded-full"
                style={{
                  animation: `wave-bar 0.8s ${i * 0.1}s ease-in-out infinite`,
                  height: '4px',
                }}
              />
            ))}
          </div>
        ) : (
          /* Mic icon */
          <svg
            className={`w-6 h-6 ${isDisabled ? 'text-white/20' : 'text-glow-cyan/70'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0014 0" />
            <line x1="12" y1="17" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        )}
      </button>

      {/* Hint text */}
      <p className="text-[10px] text-white/15 font-light tracking-wider uppercase">
        {!isSupported
          ? 'Voice not supported'
          : isListening
          ? 'Listening...'
          : isThinking
          ? 'Thinking...'
          : isTalking
          ? 'Speaking...'
          : 'Hold to talk'}
      </p>
    </div>
  )
}

export default memo(VoiceButton)
