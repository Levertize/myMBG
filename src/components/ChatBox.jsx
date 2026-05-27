/**
 * ChatBox — Mockup-aligned minimalist chat stream
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
    <div className="fixed right-10 top-28 bottom-28 w-[350px] max-w-[calc(100vw-5rem)] z-30 anim-slide-in" id="chat-box">
      <div className="chat-panel flex flex-col h-full bg-zinc-950/20 border border-white/5 rounded-xl overflow-hidden backdrop-blur-xl">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="py-20 text-left anim-fade-in space-y-1.5">
              <span className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase select-none">
                (System)
              </span>
              <p className="text-[13px] text-zinc-400 font-light leading-relaxed">
                Hana is online. Send a message to start streaming.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={msg.timestamp + '-' + i}
              className="anim-fade-in-up flex flex-col items-start gap-1"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
            >
              {/* Message Role Label */}
              <span className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase select-none">
                {msg.role === 'user' ? '(User)' : '(Hana)'}
              </span>
              
              {/* Message Content */}
              <p className="text-[13px] text-zinc-200 leading-relaxed font-sans font-light">
                {msg.content}
                {msg.role !== 'user' && (
                  <span className="text-[10px] text-zinc-500 ml-2 select-none font-mono">
                    ({new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}
              </p>
            </div>
          ))}

          {/* Thinking Indicator */}
          {status === 'thinking' && (
            <div className="flex flex-col items-start gap-1.5 anim-fade-in">
              <span className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase select-none">
                (Hana)
              </span>
              <div className="flex gap-1 py-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                    style={{ animation: `thinking-dot 1.2s ${i * 0.15}s ease-in-out infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <div className="p-5 border-t border-white/5 bg-zinc-950/10">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type message..."
              disabled={isBusy}
              className="flex-1 bg-zinc-950/20 border border-white/10 rounded-md px-4 py-2 text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-light"
              id="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isBusy}
              className="text-zinc-500 hover:text-zinc-200 disabled:text-zinc-700 disabled:hover:text-zinc-700 p-1.5 transition-colors flex-shrink-0"
              id="send-btn"
            >
              {/* Paper airplane send icon */}
              <svg className="w-[18px] h-[18px] transform rotate-45 -translate-x-[2px] translate-y-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatBox)
