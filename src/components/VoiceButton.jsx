/**
 * VoiceButton — Mockup-aligned floating capsule controller
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
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 select-none" id="voice-section">
      {/* Transcript preview overlay */}
      {transcript && isListening && (
        <div className="bg-zinc-950/80 border border-white/5 backdrop-blur-xl rounded-xl px-4 py-2 max-w-[260px] anim-fade-in shadow-xl mb-1">
          <p className="text-[12px] text-zinc-300 font-sans font-light truncate">"{transcript}"</p>
        </div>
      )}

      {/* Floating Pill Capsule Controller */}
      <div className="flex items-center gap-5 px-6 py-2.5 rounded-full bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-2xl">
        {/* Left Waveform SVG */}
        <div className="flex gap-[3px] items-center h-4 w-10 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={'w-left-' + i}
              className="w-[2px] rounded-full bg-purple-400/50"
              style={{
                height: isListening ? '12px' : '4px',
                animation: isListening ? `bar-wave 0.8s ${i * 0.12}s ease-in-out infinite` : 'none',
                transition: 'height 0.2s ease'
              }}
            />
          ))}
        </div>

        {/* Center Mic Button */}
        <button
          onMouseDown={isSupported ? handleDown : undefined}
          onMouseUp={isSupported ? handleUp : undefined}
          onMouseLeave={isHolding ? handleUp : undefined}
          onTouchStart={isSupported ? handleDown : undefined}
          onTouchEnd={isSupported ? handleUp : undefined}
          disabled={isBusy || !isSupported}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
            isListening
              ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_0_rgba(168,85,247,0.4)] scale-105'
              : 'bg-zinc-800/80 border-white/5 text-zinc-300 hover:text-white hover:bg-zinc-700'
          } disabled:opacity-20 disabled:cursor-not-allowed`}
          id="voice-btn"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0014 0" />
            <line x1="12" y1="17" x2="12" y2="22" />
          </svg>
        </button>

        {/* Status Text Stack */}
        <div className="flex flex-col select-none pr-1">
          <span className="text-[11.5px] font-semibold text-zinc-200 tracking-wide leading-tight">
            {isListening ? 'Listening...' : 'Hold to speak'}
          </span>
          <span className="text-[9.5px] text-zinc-500 leading-tight mt-0.5">
            {isListening ? 'Hana is listening...' : 'Ready to talk'}
          </span>
        </div>

        {/* Right Waveform SVG */}
        <div className="flex gap-[3px] items-center h-4 w-10 justify-center">
          {[3, 2, 1, 0].map((i) => (
            <div
              key={'w-right-' + i}
              className="w-[2px] rounded-full bg-purple-400/50"
              style={{
                height: isListening ? '12px' : '4px',
                animation: isListening ? `bar-wave 0.8s ${i * 0.12}s ease-in-out infinite` : 'none',
                transition: 'height 0.2s ease'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(VoiceButton)
