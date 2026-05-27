/**
 * ChatBox — Minimal
 *
 * Clean chat panel, no glow effects.
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

  return (
    <div className="fixed right-5 top-14 bottom-24 w-[360px] max-w-[calc(100vw-2.5rem)] flex flex-col z-30 anim-slide-in" id="chat-box">
      <div className="flex flex-col h-full bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
          <span className="text-[13px] text-white/40 font-medium tracking-wide">Chat</span>
          <button
            onClick={() => useWaifuStore.getState().toggleChat()}
            className="text-white/15 hover:text-white/35 transition-colors text-sm"
            id="chat-close-btn"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16 anim-fade-in">
              <p className="text-white/15 text-sm font-light">Mulai ngobrol~</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={msg.timestamp + '-' + i}
              className={`anim-fade-in-up ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-white/[0.06]">
                  <p className="text-[13px] text-white/70 leading-relaxed">{msg.content}</p>
                </div>
              ) : (
                <div className="max-w-[80%] px-4 py-2.5">
                  <p className="text-[13px] text-white/55 leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))}

          {/* Thinking dots */}
          {status === 'thinking' && (
            <div className="flex justify-start anim-fade-in">
              <div className="px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/20"
                    style={{ animation: `thinking-dot 1.2s ${i * 0.15}s ease-in-out infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              disabled={status === 'thinking' || status === 'talking'}
              className="flex-1 bg-transparent border-b border-white/[0.06] focus:border-white/[0.15] px-1 py-2 text-[13px] text-white/70 placeholder-white/15 outline-none transition-colors duration-200 disabled:opacity-30 font-light"
              id="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || status === 'thinking' || status === 'talking'}
              className="text-white/20 hover:text-white/45 transition-colors disabled:opacity-15 disabled:cursor-not-allowed p-1"
              id="send-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
