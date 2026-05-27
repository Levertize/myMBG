/**
 * AvatarCanvas — Polished placeholder
 */

import { useRef, memo } from 'react'
import { useAvatar } from '../hooks/useAvatar'
import useWaifuStore from '../store/waifuStore'

function AvatarCanvas() {
  const containerRef = useRef(null)
  const isVrmLoaded = useWaifuStore((s) => s.isVrmLoaded)

  useAvatar(containerRef)

  return (
    <div className="absolute inset-0 z-0" id="avatar-canvas">
      <div ref={containerRef} className="w-full h-full" />

      {!isVrmLoaded && (
        <div className="absolute inset-0 flex items-center justify-center anim-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-elevated border border-[rgba(148,163,184,0.06)] flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <p className="loading-shimmer text-sm font-semibold mb-1.5">Loading Avatar</p>
            <p className="text-[12px] text-[#64748b]">
              Place your <span className="text-accent-purple font-medium">.vrm</span> file in{' '}
              <span className="text-[#94a3b8] font-mono text-[11px]">public/avatar/</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(AvatarCanvas)
