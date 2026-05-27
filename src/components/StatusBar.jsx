/**
 * StatusBar — Minimal
 *
 * Glowing "MyMBG" title + subtle status indicator
 */

import { memo } from 'react'
import useWaifuStore from '../store/waifuStore'

const STATUS_LABELS = {
  idle: 'Online',
  listening: 'Listening',
  thinking: 'Thinking',
  talking: 'Speaking',
}

function StatusBar() {
  const status = useWaifuStore((s) => s.status)
  const chatVisible = useWaifuStore((s) => s.chatVisible)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" id="status-bar">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Brand — the ONLY glow in the app */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <h1 className="brand-glow text-xl select-none">MyMBG</h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" style={{ animation: status !== 'idle' ? 'pulse-soft 1s ease-in-out infinite' : 'none' }} />
            <span className="text-[11px] text-white/20 font-light tracking-widest uppercase">
              {STATUS_LABELS[status]}
            </span>
          </div>
        </div>

        {/* Chat toggle (only when chat is hidden) */}
        {!chatVisible && (
          <button
            onClick={() => useWaifuStore.getState().toggleChat()}
            className="pointer-events-auto text-white/20 hover:text-white/40 transition-colors duration-200"
            id="chat-toggle-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(StatusBar)
