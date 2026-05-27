/**
 * StatusBar — Redesigned as Live Stream Header
 */

import { memo } from 'react'
import useWaifuStore from '../store/waifuStore'

const STATUS_CONFIG = {
  idle: { label: 'Online', dotColor: '#a1a1aa', modifier: '' },
  listening: { label: 'Listening', dotColor: '#ffffff', modifier: 'status-badge--listening' },
  thinking: { label: 'Thinking', dotColor: '#71717a', modifier: 'status-badge--thinking' },
  talking: { label: 'Speaking', dotColor: '#ffffff', modifier: 'status-badge--talking' },
}

function StatusBar() {
  const status = useWaifuStore((s) => s.status)
  const chatVisible = useWaifuStore((s) => s.chatVisible)
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" id="status-bar">
      <div className="flex items-center justify-between px-10 py-8">
        {/* Left: Empty to clear space for Sidebar logo */}
        <div />

        {/* Right: Chatbot Connection State & Live Actions */}
        <div className="flex items-center gap-5 pointer-events-auto select-none">
          {/* Connection Status Pill */}
          <div className={`status-badge ${config.modifier} mr-1`}>
            <div
              className="w-[5px] h-[5px] rounded-full"
              style={{
                backgroundColor: config.dotColor,
                animation: status !== 'idle' ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
              }}
            />
            <span className="text-[11px] font-medium tracking-wider uppercase text-zinc-400">
              {config.label}
            </span>
          </div>

          {/* Live Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900/60 border border-white/5 text-[11px] font-semibold text-zinc-200 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-100 animate-pulse" />
            Live
          </div>

          {/* Viewers */}
          <span className="text-[12px] text-zinc-500 font-sans tracking-wide">
            12.4K Viewers
          </span>

          {/* Follow Button */}
          <button className="px-4 py-1.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-[12px] font-medium transition-colors border border-white/5">
            Follow
          </button>

          {/* Subs Button */}
          <button className="px-4 py-1.5 rounded border border-white/5 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[12px] font-medium transition-all">
            Subs
          </button>

          {/* Chat Toggle (if chat is hidden) */}
          {!chatVisible && (
            <button
              onClick={() => useWaifuStore.getState().toggleChat()}
              className="w-8 h-8 rounded-md bg-zinc-900/40 border border-white/5 flex items-center justify-center hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors"
              id="chat-toggle-btn"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(StatusBar)
