/**
 * Sidebar component matching the 3-panel dashboard design.
 */
import { memo } from 'react'

const MENU_ITEMS = [
  { name: 'Chat', icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )},
  { name: 'Settings', icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )},
  { name: 'About', icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )}
]

function Sidebar() {
  return (
    <div className="w-[260px] h-full flex flex-col p-6 bg-zinc-950/20 border border-white/5 rounded-2xl backdrop-blur-xl relative overflow-hidden flex-shrink-0" id="sidebar">
      {/* Sparkles / Paws Decorative Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none z-0">
        {/* Faint sparkles */}
        <span className="absolute top-[35%] left-[10%] text-[10px]">✦</span>
        <span className="absolute top-[40%] right-[15%] text-[12px]">✦</span>
        <span className="absolute top-[60%] left-[15%] text-[14px]">🐾</span>
        
        {/* Faint cat face SVG outline near the bottom */}
        <svg className="absolute bottom-28 left-8 w-24 h-24 text-zinc-700/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 21c-4.418 0-8-3.582-8-8 0-3 2.5-6.5 4.5-8.5.5-.5 1 .5 1.5 1.5.5-.5 1-1.5 1.5-1.5 2 2 4.5 5.5 4.5 8.5 0 4.418-3.582 8-8 8z" />
          <path d="M8 12s.5-1 1-1 1 1 1 1M14 12s.5-1 1-1 1 1 1 1" />
          <path d="M12 14.5c-.5 0-.75-.5-1-.5m1 .5c.5 0 .75-.5 1-.5" />
          <path d="M3 12h3M21 12h-3" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Brand Header */}
          <div className="flex flex-col gap-1 mb-8 select-none">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl text-purple-300 tracking-wider uppercase">Hana</span>
              <span className="text-xl text-purple-400/80">🐾</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-sans tracking-widest uppercase">Virtual Companion</span>
          </div>

          {/* Navigation Stack */}
          <nav className="flex flex-col gap-2">
            {MENU_ITEMS.map((item) => {
              const isActive = item.name === 'Chat'
              return (
                <button
                  key={item.name}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13.5px] transition-all duration-200 select-none w-full ${
                    isActive
                      ? 'bg-purple-500/10 border border-purple-500/20 text-purple-200 font-medium'
                      : 'text-zinc-500 hover:text-zinc-300 font-normal hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          {/* Circular avatar image */}
          <img
            src="/avatar/avatar_headshot.png"
            alt="Hana Avatar"
            className="w-9 h-9 rounded-full object-cover border border-white/10"
          />
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-zinc-200 leading-tight">Hana</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 tracking-wide font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Sidebar)
