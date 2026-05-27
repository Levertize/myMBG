/**
 * AvatarCanvas — Minimal
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
            <div className="w-8 h-8 mx-auto mb-4 border border-white/[0.08] rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white/20 rounded-full" style={{ animation: 'pulse-soft 2s ease-in-out infinite' }} />
            </div>
            <p className="text-[13px] text-white/20 font-light">Waiting for avatar</p>
            <p className="text-[11px] text-white/10 mt-1.5">
              Place <span className="text-white/20">.vrm</span> in public/avatar/
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(AvatarCanvas)
