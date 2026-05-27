/**
 * App.jsx — 3-Panel Dashboard Layout matching the design reference.
 */

import AvatarCanvas from './components/AvatarCanvas'
import ChatBox from './components/ChatBox'
import VoiceButton from './components/VoiceButton'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <div className="relative w-screen h-screen p-6 flex flex-col gap-4 justify-between overflow-hidden bg-zinc-950" id="app-root">
      {/* Background spotlight */}
      <div className="app-bg" />

      {/* 3-Panel Card Grid */}
      <div className="flex-1 w-full h-full flex gap-6 z-10 relative overflow-hidden">
        <Sidebar />
        <AvatarCanvas />
        <ChatBox />
      </div>

      {/* Floating Microphone Capsule (renders centered at bottom) */}
      <VoiceButton />

      {/* Footer Branding Text */}
      <div className="w-full text-center z-20 py-0.5 select-none pointer-events-none">
        <span className="text-[11px] text-zinc-600 font-sans tracking-wide">
          Hana will speak your replies out loud <span className="text-purple-500/80">💜</span>
        </span>
      </div>
    </div>
  )
}

export default App
