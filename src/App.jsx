/**
 * App.jsx — MyMBG Main Application Shell
 *
 * Composes all components with animated particle background,
 * avatar canvas, chat panel, voice button, and status bar.
 */

import { useMemo } from 'react'
import AvatarCanvas from './components/AvatarCanvas'
import ChatBox from './components/ChatBox'
import VoiceButton from './components/VoiceButton'
import StatusBar from './components/StatusBar'

// Generate floating particles data (static, created once)
function generateParticles(count) {
  const colors = ['cyan', 'magenta', 'purple']
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 15,
    driftX: (Math.random() - 0.5) * 80,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: Math.random() * 0.4 + 0.1,
  }))
}

function App() {
  const particles = useMemo(() => generateParticles(35), [])

  return (
    <div className="relative w-full h-full overflow-hidden" id="app-root">
      {/* ---- Animated Background ---- */}
      <div className="app-background" />

      {/* ---- Floating Particles ---- */}
      <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`particle particle--${p.color}`}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.x}%`,
              bottom: `-${p.size + 10}px`,
              opacity: 0,
              '--drift-x': `${p.driftX}px`,
              animation: `particle-float ${p.duration}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* ---- Avatar (Full Viewport) ---- */}
      <AvatarCanvas />

      {/* ---- UI Overlay Layer ---- */}
      <div className="relative z-20">
        {/* Status Bar */}
        <StatusBar />

        {/* Chat Box */}
        <ChatBox />

        {/* Voice Button */}
        <VoiceButton />
      </div>

      {/* ---- Vignette Overlay (subtle dark edges) ---- */}
      <div
        className="fixed inset-0 z-[15] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,5,16,0.6) 100%)',
        }}
      />
    </div>
  )
}

export default App
