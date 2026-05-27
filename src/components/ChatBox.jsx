/**
 * ChatBox Component
 *
 * Glassmorphism chat panel with message bubbles, glow accents,
 * input field with neon glow on focus, and send button.
 */

import { useState, useRef, useEffect, memo } from 'react'
import useWaifuStore from '../store/waifuStore'
import { useAI } from '../hooks/useAI'
import { useTTS } from '../hooks/useTTS'

function ChatBox() {
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messages = useWaifuStore((s) => s.messages)
  const status = useWaifuStore((s) => s.status)
  const chatVisible = useWaifuStore((s) => s.chatVisible)
  const { sendMessage } = useAI()
  const { speak } = useTTS()

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim() || status === 'thinking' || status === 'talking') return

    const text = inputText.trim()
    setInputText('')

    const response = await sendMessage(text)
    if (response) {
      speak(response.reply)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!chatVisible) return null

  return (
    <div
      className="fixed right-4 top-16 bottom-28 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col z-30 animate-slide-right"
      id="chat-box"
    >
      {/* Chat Panel */}
      <div className="glass glow-border-cyan rounded-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-glow-cyan shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
            <h2 className="font-display font-semibold text-sm text-white/80 tracking-wide">
              Chat
            </h2>
          </div>
          <button
            onClick={() => useWaifuStore.getState().toggleChat()}
            className="toggle-btn rounded-lg px-2 py-1 text-white/30 hover:text-white/60 text-xs"
            id="chat-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-3xl mb-3">💬</div>
              <p className="text-white/25 text-sm font-light">
                Mulai ngobrol dengan Hana~
              </p>
              <p className="text-white/15 text-xs mt-1 font-light">
                Ketik pesan atau tekan tombol mic
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={msg.timestamp + '-' + i}
              className={`animate-fade-in-up ${
                msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {msg.role === 'user' ? (
                /* User message */
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-r from-glow-cyan/15 to-glow-purple/10 border border-glow-cyan/10">
                  <p className="text-sm text-white/85 leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                /* AI message */
                <div className="msg-bubble msg-bubble--ai max-w-[85%] pl-4 pr-3 py-2.5">
                  <p className="text-sm text-white/75 leading-relaxed">{msg.content}</p>
                  {msg.emotion && msg.emotion !== 'neutral' && (
                    <span className="inline-block mt-1 text-[10px] text-glow-cyan/40 font-light">
                      {msg.emotion}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {status === 'thinking' && (
            <div className="flex justify-start animate-fade-in">
              <div className="msg-bubble msg-bubble--ai px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-glow-purple/60"
                      style={{
                        animation: `thinking-dots 1.4s ${i * 0.2}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
          <div className="flex gap-2 items-end">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              disabled={status === 'thinking' || status === 'talking'}
              className="chat-input flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white/85 placeholder-white/20 disabled:opacity-40 font-light"
              id="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || status === 'thinking' || status === 'talking'}
              className="send-btn rounded-xl px-4 py-2.5 text-glow-cyan/80 disabled:opacity-25 disabled:cursor-not-allowed"
              id="send-btn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatBox)
