/**
 * AvatarCanvas Component
 *
 * Full-viewport Three.js canvas that renders the VRM avatar
 * with bloom post-processing for glow outline effect.
 */

import { useRef, memo } from 'react'
import { useAvatar } from '../hooks/useAvatar'
import useWaifuStore from '../store/waifuStore'

function AvatarCanvas() {
  const containerRef = useRef(null)
  const isVrmLoaded = useWaifuStore((s) => s.isVrmLoaded)

  useAvatar(containerRef)

  return (
    <div className="absolute inset-0 z-10" id="avatar-canvas">
      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full"
      />

      {/* Loading placeholder when VRM is not loaded */}
      {!isVrmLoaded && (
        <div className="absolute inset-0 flex items-center justify-center vrm-placeholder">
          <div className="text-center animate-fade-in">
            {/* Animated glow orb */}
            <div className="relative mx-auto mb-8 w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-glow-cyan/20 to-glow-magenta/20 animate-pulse-glow-slow blur-xl" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-glow-cyan/10 to-glow-purple/10 animate-pulse-glow blur-lg" />
              <div className="absolute inset-8 rounded-full border border-glow-cyan/20 animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-glow-cyan/60 animate-float"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <circle cx="9" cy="10" r="1" fill="currentColor" />
                  <circle cx="15" cy="10" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
            <p className="text-white/40 text-sm font-light tracking-wide">
              Loading avatar...
            </p>
            <p className="text-white/20 text-xs mt-2 font-light">
              Place your <span className="text-glow-cyan/50">.vrm</span> file in{' '}
              <span className="text-glow-cyan/50">public/avatar/</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(AvatarCanvas)
