/**
 * Sidebar component matching the minimalist mockup design.
 */
import { memo } from 'react'

const MENU_ITEMS = ['Profile', 'Interaction', 'Creation', 'Settings', 'Outfit']

function Sidebar() {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[240px] z-50 flex flex-col p-10 pointer-events-none" id="sidebar">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-12 pointer-events-auto select-none">
        {/* Double-pill / Mask-like minimalist logo */}
        <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="4" width="7" height="16" rx="2" />
          <rect x="14" y="4" width="7" height="16" rx="2" />
        </svg>
        <span className="font-display font-bold text-[17px] text-white tracking-widest uppercase">Hana</span>
      </div>

      {/* Navigation Stack */}
      <nav className="flex flex-col gap-5 pointer-events-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = item === 'Interaction'
          return (
            <button
              key={item}
              className={`text-left text-[14px] font-sans transition-colors duration-150 select-none ${
                isActive
                  ? 'text-zinc-200 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300 font-normal'
              }`}
            >
              {item}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default memo(Sidebar)
