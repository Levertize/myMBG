/**
 * Claude API Client (Mocked for now)
 *
 * When API key is available, sends requests to Claude API.
 * Without API key, returns mock responses for demo.
 */

const SYSTEM_PROMPT = `Kamu adalah Hana, AI waifu anime yang ceria dan perhatian. Kamu berbicara bahasa Indonesia santai campur sedikit Jepang.
Selalu respons dalam format JSON SAJA tanpa teks lain, dengan field:
- "reply": teks jawaban yang diucapkan (singkat, hangat, natural, max 2 kalimat)
- "emotion": salah satu dari "neutral", "happy", "sad", "surprised", "angry", "shy", "thinking"
- "pose": salah satu dari "idle", "wave", "nod", "shake", "point", "bow", "peace"
- "lipSync": true

Pilih emotion dan pose yang sesuai konteks percakapan. Kamu suka memakai emoji. Jawab singkat dan manis.`

const MOCK_RESPONSES = [
  { reply: 'Halo! Senang banget ketemu kamu~ ✨ Apa kabar hari ini?', emotion: 'happy', pose: 'wave', lipSync: true },
  { reply: 'Hmm, itu menarik banget ya~ Ceritain lebih dong! 💭', emotion: 'thinking', pose: 'nod', lipSync: true },
  { reply: 'Wah serius?! Keren banget! 🤩', emotion: 'surprised', pose: 'peace', lipSync: true },
  { reply: 'Ehehe, kamu bikin aku malu nih~ 😊', emotion: 'shy', pose: 'bow', lipSync: true },
  { reply: 'Aku selalu di sini buat kamu loh~ 💕 Mau ngobrol apa?', emotion: 'happy', pose: 'nod', lipSync: true },
  { reply: 'Hmm, aku lagi mikir... Kayaknya aku setuju deh! ✨', emotion: 'thinking', pose: 'idle', lipSync: true },
  { reply: 'Yatta! Aku suka banget! Kamu the best~ 🎉', emotion: 'happy', pose: 'peace', lipSync: true },
  { reply: 'Hee?! Beneran?! Ga nyangka banget! 😱', emotion: 'surprised', pose: 'shake', lipSync: true },
  { reply: 'Iya iya, aku ngerti kok~ Tenang aja ya! 💫', emotion: 'happy', pose: 'nod', lipSync: true },
  { reply: 'Mou~! Jangan gitu dong... 😤 Tapi aku ga bisa marah lama-lama sih~', emotion: 'angry', pose: 'shake', lipSync: true },
]

let mockIndex = 0

/**
 * Send a message to Claude and get a parsed JSON response
 * @param {Array} messages - Conversation history [{role, content}]
 * @returns {Promise<{reply: string, emotion: string, pose: string, lipSync: boolean}>}
 */
export async function sendToClaudeChat(messages) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  // If no API key, return mock response
  if (!apiKey || apiKey === 'sk-ant-...') {
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))
    const response = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length]
    mockIndex++
    return response
  }

  try {
    const claudeMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: claudeMessages,
      }),
    })

    if (!res.ok) {
      throw new Error(`Claude API error: ${res.status}`)
    }

    const data = await res.json()
    const text = data.content[0].text

    // Parse JSON response
    const parsed = JSON.parse(text)
    return {
      reply: parsed.reply || 'Hmm...',
      emotion: parsed.emotion || 'neutral',
      pose: parsed.pose || 'idle',
      lipSync: parsed.lipSync !== false,
    }
  } catch (error) {
    console.error('Claude API error:', error)
    // Fallback response on error
    return {
      reply: 'Ah, gomen ne~ Ada masalah koneksi. Coba lagi ya! 💦',
      emotion: 'sad',
      pose: 'bow',
      lipSync: true,
    }
  }
}
