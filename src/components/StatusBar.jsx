/**
 * StatusBar — Polished
 */

import { memo } from 'react'
import useWaifuStore from '../store/waifuStore'

const STATUS_CONFIG = {
  idle: { label: 'Online', dotColor: '#818cf8', modifier: '' },
  listening: { label: 'Listening...', dotColor: '#f472b6', modifier: 'status-badge--listening' },
  thinking: { label: 'Thinking...', dotColor: '#a78bfa', modifier: 'status-badge--thinking' },
  talking: { label: 'Speaking...', dotColor: '#67e8f9', modifier: 'status-badge--talking' },
}

function StatusBar() {
  const status = useWaifuStore((s) => s.status)
  const chatVisible = useWaifuStore((s) => s.chatVisible)
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" id="status-bar">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Brand + Status */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <h1 className="brand-glow text-xl select-none">MyMBG</h1>

          <div className={`status-badge ${config.modifier}`}>
            <div
              className="w-[6px] h-[6px] rounded-full"
              style={{
                backgroundColor: config.dotColor,
                animation: status !== 'idle' ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
              }}
            />
            <span className="text-[11px] font-medium tracking-wide" style={{ color: config.dotColor, opacity: 0.8 }}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Right: Chat toggle */}
        {!chatVisible && (
          <button
            onClick={() => useWaifuStore.getState().toggleChat()}
            className="pointer-events-auto w-9 h-9 rounded-xl bg-elevated border border-[rgba(148,163,184,0.08)] flex items-center justify-center hover:border-accent-indigo/25 transition-colors"
            id="chat-toggle-btn"
          >
            <svg className="w-4 h-4 text-accent-indigo/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(StatusBar)
