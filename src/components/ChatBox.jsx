/**
 * ChatBox — Polished, colorful
 */

import { useState, useRef, useEffect, memo } from 'react'
import useWaifuStore from '../store/waifuStore'
import { useAI } from '../hooks/useAI'
import { useTTS } from '../hooks/useTTS'

function ChatBox() {
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)
  const messages = useWaifuStore((s) => s.messages)
  const status = useWaifuStore((s) => s.status)
  const chatVisible = useWaifuStore((s) => s.chatVisible)
  const { sendMessage } = useAI()
  const { speak } = useTTS()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim() || status === 'thinking' || status === 'talking') return
    const text = inputText.trim()
    setInputText('')
    const response = await sendMessage(text)
    if (response) speak(response.reply)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  if (!chatVisible) return null

  const isBusy = status === 'thinking' || status === 'talking'

  return (
    <div className="fixed right-5 top-16 bottom-24 w-[380px] max-w-[calc(100vw-2.5rem)] z-30 anim-slide-in" id="chat-box">
      <div className="chat-panel flex flex-col h-full">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-title">
            <div className="chat-header-dot" />
            <span className="text-[13px] font-semibold text-[#e2e8f0] tracking-wide">
              Chat with Hana
            </span>
          </div>
          <button onClick={() => useWaifuStore.getState().toggleChat()} className="close-btn" id="chat-close-btn">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-20 anim-fade-in">
              <div className="text-3xl mb-3">✨</div>
              <p className="text-[14px] text-[#94a3b8] font-medium">Halo! Mau ngobrol apa?</p>
              <p className="text-[12px] text-[#64748b] mt-1">Ketik pesan atau tekan tombol mic</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={msg.timestamp + '-' + i}
              className={`anim-fade-in-up ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
            >
              {msg.role === 'user' ? (
                <div className="msg-user">
                  <p className="text-[13px] leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="msg-ai pl-4">
                  <p className="text-[13px] leading-relaxed">{msg.content}</p>
                  {msg.emotion && msg.emotion !== 'neutral' && (
                    <span className="inline-block mt-1.5 text-[10px] text-accent-purple/50 font-medium uppercase tracking-wider">
                      {msg.emotion}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {status === 'thinking' && (
            <div className="flex justify-start anim-fade-in">
              <div className="msg-ai pl-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent-purple"
                      style={{ animation: `thinking-dot 1.2s ${i * 0.15}s ease-in-out infinite` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-wrap">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              disabled={isBusy}
              className="chat-input"
              id="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isBusy}
              className="send-btn"
              id="send-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatBox)
