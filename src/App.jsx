/**
 * App.jsx — Clean colorful layout
 */

import AvatarCanvas from './components/AvatarCanvas'
import ChatBox from './components/ChatBox'
import VoiceButton from './components/VoiceButton'
import StatusBar from './components/StatusBar'

function App() {
  return (
    <div className="relative w-full h-full" id="app-root">
      {/* Subtle gradient bg */}
      <div className="app-bg" />

      {/* Avatar (full viewport, behind UI) */}
      <AvatarCanvas />

      {/* UI Layer */}
      <StatusBar />
      <ChatBox />
      <VoiceButton />
    </div>
  )
}

export default App
