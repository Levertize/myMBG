/**
 * StatusBar Component
 *
 * Top bar showing MyMBG branding and current status
 * with animated glow indicators.
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
  const isVrmLoaded = useWaifuStore((s) => s.isVrmLoaded)
  const chatVisible = useWaifuStore((s) => s.chatVisible)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" id="status-bar">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <h1 className="brand-title text-xl">MyMBG</h1>
          <div className="flex items-center gap-2 ml-2">
            <div className={`status-dot status-dot--${status}`} />
            <span className="text-[11px] text-white/35 font-light tracking-wider uppercase">
              {STATUS_LABELS[status] || 'Offline'}
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* VRM status */}
          {!isVrmLoaded && (
            <span className="text-[10px] text-glow-cyan/30 font-light animate-pulse">
              VRM loading...
            </span>
          )}

          {/* Chat toggle */}
          {!chatVisible && (
            <button
              onClick={() => useWaifuStore.getState().toggleChat()}
              className="toggle-btn rounded-lg px-3 py-1.5 text-white/40 hover:text-white/70 text-xs flex items-center gap-1.5"
              id="chat-toggle-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Chat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(StatusBar)
