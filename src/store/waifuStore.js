import { create } from 'zustand'

const useWaifuStore = create((set, get) => ({
  // Chat messages: { role: 'user' | 'assistant', content: string, emotion?: string, timestamp: number }
  messages: [],

  // App status: idle | listening | thinking | talking
  status: 'idle',

  // Current avatar state
  currentEmotion: 'neutral',
  currentPose: 'idle',

  // Feature toggles
  voiceEnabled: true,
  chatVisible: true,

  // VRM loading state
  isVrmLoaded: false,

  // Audio analyser for lip sync
  analyserNode: null,

  // ---- Actions ----
  addMessage: (role, content, emotion = null) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          role,
          content,
          emotion,
          timestamp: Date.now(),
        },
      ],
    })),

  setStatus: (status) => set({ status }),

  setEmotion: (emotion) => set({ currentEmotion: emotion }),

  setPose: (pose) => set({ currentPose: pose }),

  toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),

  toggleChat: () => set((state) => ({ chatVisible: !state.chatVisible })),

  setVrmLoaded: (loaded) => set({ isVrmLoaded: loaded }),

  setAnalyserNode: (node) => set({ analyserNode: node }),

  // Clear conversation
  clearMessages: () => set({ messages: [] }),
}))

export default useWaifuStore
