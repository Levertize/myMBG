/**
 * App.jsx — Minimal Shell
 */

import AvatarCanvas from './components/AvatarCanvas'
import ChatBox from './components/ChatBox'
import VoiceButton from './components/VoiceButton'
import StatusBar from './components/StatusBar'

function App() {
  return (
    <div className="relative w-full h-full" id="app-root">
      <AvatarCanvas />
      <StatusBar />
      <ChatBox />
      <VoiceButton />
    </div>
  )
}

export default App
