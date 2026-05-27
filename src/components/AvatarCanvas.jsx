/**
 * AvatarCanvas — Mockup-aligned 3D avatar card
 */

import { useRef, memo } from 'react'
import { useAvatar } from '../hooks/useAvatar'
import useWaifuStore from '../store/waifuStore'

function AvatarCanvas() {
  const containerRef = useRef(null)
  const isVrmLoaded = useWaifuStore((s) => s.isVrmLoaded)

  useAvatar(containerRef)

  return (
    <div className="relative flex-1 h-full bg-zinc-950/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col" id="avatar-canvas-card">
      {/* White silhouette spotlight glow behind the avatar */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06)_0%,transparent_60%)] pointer-events-none z-0" />

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-10" />

      {/* Top-Right Floating Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* Online Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/40 border border-white/5 backdrop-blur-md text-[11.5px] font-medium text-zinc-300 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Online
        </div>

        {/* Volume Mute Toggle Button */}
        <button className="w-8 h-8 rounded-full bg-zinc-950/40 border border-white/5 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </button>
      </div>

      {/* Loading Placeholder */}
      {!isVrmLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md anim-fade-in">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center">
              <span className="text-lg">🎭</span>
            </div>
            <p className="loading-shimmer text-xs font-semibold mb-1">Loading Virtual Environment</p>
            <p className="text-[10px] text-zinc-500">Preparing VRM bones and expressions...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(AvatarCanvas)
