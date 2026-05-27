/**
 * useAI Hook
 *
 * Handles sending messages to Claude API and processing responses.
 * Updates the store with emotion, pose, and reply.
 */

import { useCallback } from 'react'
import { sendToClaudeChat } from '../lib/claudeClient'
import useWaifuStore from '../store/waifuStore'

export function useAI() {
  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim()) return

    const store = useWaifuStore.getState()

    // Add user message to store
    store.addMessage('user', userText.trim())
    store.setStatus('thinking')
    store.setEmotion('thinking')

    try {
      // Build message history for Claude
      const history = useWaifuStore.getState().messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      // Send to Claude
      const response = await sendToClaudeChat(history)

      // Update store with response
      store.addMessage('assistant', response.reply, response.emotion)
      store.setEmotion(response.emotion || 'neutral')
      store.setPose(response.pose || 'idle')

      return response
    } catch (error) {
      console.error('AI error:', error)
      store.setStatus('idle')
      store.setEmotion('sad')
      store.addMessage('assistant', 'Gomen, ada error nih... Coba lagi ya~ 💦', 'sad')
      return null
    }
  }, [])

  return { sendMessage }
}
