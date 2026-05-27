/**
 * ChatBox — Mockup-aligned chat interface
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
    <div className="w-[420px] h-full flex-shrink-0 z-30 anim-slide-in" id="chat-box">
      <div className="chat-panel flex flex-col h-full bg-zinc-950/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        {/* Chat Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 select-none">
            <span className="font-sans font-semibold text-[15px] text-zinc-100">Chat with Hana</span>
            <span className="text-sm text-purple-400">🐾</span>
          </div>
          {/* Sparkles decoration */}
          <div className="flex items-center gap-1 text-purple-400/80">
            <span className="text-[10px]">✦</span>
            <span className="text-[13px] animate-pulse">✦</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Mockup-aligned System Message */}
          <div className="bg-purple-950/10 border border-purple-900/15 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden select-none">
            <span className="text-[10.5px] font-semibold text-purple-300 uppercase tracking-wider">
              (System)
            </span>
            <p className="text-[12.5px] text-zinc-400 leading-relaxed font-light pr-6">
              Hana is online. Send a message to start chatting!
            </p>
            {/* Watermark Paw in System Card */}
            <span className="absolute bottom-2 right-3 text-[14px] text-purple-500/15">🐾</span>
          </div>

          {messages.map((msg, i) => {
            const isUser = msg.role === 'user'
            const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })

            return (
              <div
                key={msg.timestamp + '-' + i}
                className={`flex gap-3 anim-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
              >
                {/* AI Avatar icon on Left */}
                {!isUser && (
                  <img
                    src="/avatar/avatar_headshot.png"
                    alt="Hana"
                    className="w-8 h-8 rounded-full object-cover border border-white/5 select-none flex-shrink-0 mt-0.5"
                  />
                )}

                {/* Message Speech Bubble */}
                <div
                  className={`relative max-w-[75%] px-4 py-3 rounded-2xl text-[13px] font-light leading-relaxed ${
                    isUser
                      ? 'bg-purple-600/25 border border-purple-500/20 text-purple-100 rounded-tr-sm'
                      : 'bg-zinc-900/40 border border-white/5 text-zinc-300 rounded-tl-sm'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Metadata and checkmarks / heart */}
                  <div className="flex items-center justify-end gap-1 mt-1.5 select-none text-[9.5px] text-zinc-500 font-mono">
                    <span>{formattedTime}</span>
                    {isUser ? (
                      <span className="text-purple-400 font-sans font-medium">✓✓</span>
                    ) : (
                      <span className="text-purple-500/80">💜</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Thinking Indicator */}
          {status === 'thinking' && (
            <div className="flex gap-3 anim-fade-in">
              <img
                src="/avatar/avatar_headshot.png"
                alt="Hana"
                className="w-8 h-8 rounded-full object-cover border border-white/5 select-none flex-shrink-0 mt-0.5"
              />
              <div className="bg-zinc-900/40 border border-white/5 text-zinc-300 rounded-2xl rounded-tl-sm px-4 py-3.5">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                      style={{ animation: `thinking-dot 1.2s ${i * 0.15}s ease-in-out infinite` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-6 py-5 border-t border-white/5 bg-zinc-950/10">
          <div className="flex items-center gap-3 bg-zinc-950/30 border border-white/5 rounded-full pl-5 pr-2 py-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isBusy}
              className="flex-1 bg-transparent border-none text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none font-light"
              id="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isBusy}
              className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-colors duration-200 flex-shrink-0"
              id="send-btn"
            >
              {/* Paper airplane SVG */}
              <svg className="w-3.5 h-3.5 transform rotate-45 -translate-x-[1px] translate-y-[0.5px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
