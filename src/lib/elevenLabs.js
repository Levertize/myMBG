/**
 * ElevenLabs TTS Client (Mocked for now)
 *
 * When API key is available, streams audio from ElevenLabs.
 * Without API key, TTS is silently skipped.
 */

/**
 * Synthesize speech from text using ElevenLabs streaming API
 * @param {string} text - Text to speak
 * @returns {Promise<{audioBuffer: ArrayBuffer|null, analyserNode: AnalyserNode|null}>}
 */
export async function synthesizeSpeech(text) {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID

  if (!apiKey || !voiceId) {
    // No API key — skip TTS silently
    return { audioBuffer: null, analyserNode: null }
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
          },
        }),
      }
    )

    if (!res.ok) {
      throw new Error(`ElevenLabs API error: ${res.status}`)
    }

    const audioBuffer = await res.arrayBuffer()
    return { audioBuffer, analyserNode: null }
  } catch (error) {
    console.error('ElevenLabs TTS error:', error)
    return { audioBuffer: null, analyserNode: null }
  }
}

/**
 * Play audio buffer and return an AnalyserNode for lip sync
 * @param {ArrayBuffer} audioBuffer
 * @returns {Promise<{analyserNode: AnalyserNode, source: AudioBufferSourceNode}>}
 */
export function playAudioWithAnalyser(audioBuffer) {
  return new Promise(async (resolve, reject) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const decodedAudio = await audioContext.decodeAudioData(audioBuffer)

      const source = audioContext.createBufferSource()
      source.buffer = decodedAudio

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8

      source.connect(analyser)
      analyser.connect(audioContext.destination)

      source.start(0)
      resolve({ analyserNode: analyser, source, audioContext })
    } catch (error) {
      console.error('Audio playback error:', error)
      reject(error)
    }
  })
}
