# AGENT.md — AI Waifu VTuber Web App

## Gambaran Project
Aplikasi web yang menampilkan AI waifu bergaya VTuber berbasis avatar 3D (format .vrm).
User bisa ngobrol via teks atau suara, avatar merespons secara real-time dengan animasi
ekspresi dan pose sesuai konteks percakapan.

## Tech Stack
| Layer | Teknologi |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Avatar Render | Three.js + @pixiv/three-vrm |
| AI Brain | Claude API (claude-sonnet-4-20250514) |
| Text-to-Speech | ElevenLabs API |
| Speech-to-Text | Web Speech API (browser native, gratis) |
| State Management | Zustand |
| HTTP Client | fetch native (no axios) |

## Struktur Folder
```
waifu-app/
├── public/
│   └── avatar/
│       └── hana.vrm          ← file avatar VRM taruh di sini
├── src/
│   ├── components/
│   │   ├── AvatarCanvas.jsx  ← Three.js + VRM render
│   │   ├── ChatBox.jsx       ← UI percakapan
│   │   ├── VoiceButton.jsx   ← tombol mic / STT
│   │   └── StatusBar.jsx     ← indikator status (thinking, talking, dll)
│   ├── hooks/
│   │   ├── useAvatar.js      ← logic avatar, pose, ekspresi
│   │   ├── useAI.js          ← komunikasi ke Claude API
│   │   ├── useTTS.js         ← ElevenLabs text-to-speech
│   │   └── useSTT.js         ← Web Speech API speech-to-text
│   ├── store/
│   │   └── waifuStore.js     ← global state (Zustand)
│   ├── lib/
│   │   ├── claudeClient.js   ← wrapper Claude API
│   │   └── elevenLabs.js     ← wrapper ElevenLabs API
│   ├── constants/
│   │   └── emotions.js       ← mapping emotion → morph target VRM
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env                      ← API keys (JANGAN di-commit)
├── .env.example
├── AGENT.md                  ← file ini
└── vite.config.js
```

## Environment Variables (.env)
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_ELEVENLABS_API_KEY=...
VITE_ELEVENLABS_VOICE_ID=...
VITE_VRM_PATH=/avatar/hana.vrm
```

## Kontrak API Claude

### System Prompt (claudeClient.js)
Claude HARUS selalu merespons dalam format JSON berikut, tanpa teks di luar JSON:

```json
{
  "reply": "teks jawaban yang diucapkan avatar",
  "emotion": "neutral | happy | sad | surprised | angry | shy | thinking",
  "pose": "idle | wave | nod | shake | point | bow | peace",
  "lipSync": true
}
```

### Contoh System Prompt
```
Kamu adalah Hana, AI waifu anime yang ceria dan perhatian. Kamu berbicara bahasa Indonesia
santai. Selalu respons dalam format JSON dengan field: reply, emotion, pose, lipSync.
Pilih emotion dan pose yang sesuai konteks percakapan. Jawab singkat, hangat, natural.
```

## Sistem Animasi Avatar (VRM)

### Emotion → VRM Morph Target
```js
// src/constants/emotions.js
export const EMOTION_MAP = {
  happy:     { blendShapeGroup: 'Joy',      intensity: 1.0 },
  sad:       { blendShapeGroup: 'Sorrow',   intensity: 1.0 },
  surprised: { blendShapeGroup: 'Surprised',intensity: 1.0 },
  angry:     { blendShapeGroup: 'Angry',    intensity: 0.8 },
  shy:       { blendShapeGroup: 'Joy',      intensity: 0.5 },
  thinking:  { blendShapeGroup: 'Neutral',  intensity: 0.0 },
  neutral:   { blendShapeGroup: 'Neutral',  intensity: 0.0 },
}
```

### Pose → Bone Animation
Pose dikontrol dengan merotasi bone pada VRM skeleton:
- `idle` → animasi napas default, slight sway
- `wave` → rotasi RightArm bone
- `nod`  → rotasi head bone Y-axis
- `shake`→ rotasi head bone X-axis
- `point`→ rotasi RightArm + jari point
- `bow`  → rotasi spine bone forward
- `peace`→ pose tangan peace sign

### Lip Sync
Ketika TTS sedang play, drive morph target `A` / `I` / `U` berdasarkan amplitude audio
menggunakan Web Audio API AnalyserNode.

## Alur Data Utama
```
[User input: teks atau voice]
        ↓
[useSTT] kalau voice → transkrip teks
        ↓
[useAI / claudeClient] → kirim ke Claude API
        ↓
Claude return JSON { reply, emotion, pose, lipSync }
        ↓
    ┌───┴────────────┐
    ↓                ↓
[useTTS]         [useAvatar]
ElevenLabs TTS   set emotion + pose
play audio       di VRM avatar
    ↓
[lip sync via AnalyserNode]
Avatar mulut gerak ngikutin audio
```

## State Global (Zustand)
```js
{
  messages: [],          // history chat
  status: 'idle',        // idle | listening | thinking | talking
  currentEmotion: 'neutral',
  currentPose: 'idle',
  voiceEnabled: true,
  isVrmLoaded: false,
}
```

## UI / UX Guidelines
- Background: dark, semi-transparent — avatar jadi fokus utama
- Avatar: fullscreen atau 60-70% tinggi layar, posisi center/kiri
- Chat: panel kecil di kanan atau overlay bawah, bisa di-toggle hide
- Font: clean sans-serif, warna soft (bukan pure white)
- Animasi UI: smooth fade, jangan ada yang pop tiba-tiba
- Mobile-friendly: avatar tetap kelihatan meski panel chat terbuka

## Hal Penting untuk Agent
1. Jangan pernah hardcode API key — selalu dari `import.meta.env.VITE_*`
2. VRM loading async — semua interaksi avatar harus tunggu `isVrmLoaded: true`
3. Claude response selalu parse sebagai JSON, wrap dalam try/catch
4. ElevenLabs streaming audio lebih smooth dari non-streaming — gunakan streaming
5. Web Speech API tidak tersedia di semua browser — tambah fallback (tombol ketik)
6. Three.js render loop jalan di `requestAnimationFrame` — jangan ada logic berat di sana
7. Dispose Three.js objects saat component unmount untuk cegah memory leak
8. Satu percakapan = satu request Claude, kirim full history tiap request

## Fase Development (urutan pengerjaan)
1. ✅ Setup Vite + React + Tailwind
2. ✅ Render VRM avatar statis di canvas
3. ✅ Tambah animasi idle (napas, kedip mata)
4. ✅ Integrasikan Claude API, tampilkan reply teks
5. ✅ Parse emotion + pose dari Claude response, apply ke avatar
6. ✅ Integrasikan ElevenLabs TTS
7. ✅ Tambah lip sync via AnalyserNode
8. ✅ Tambah Web Speech API (STT)
9. ✅ Polish UI
10. ⏳ (Nanti) Migrasi backend logic ke Python/FastAPI

## Catatan untuk Fase Python (nanti)
Ketika siap migrasi:
- Backend Python (FastAPI) akan handle: Claude API call, ElevenLabs call, session management
- Frontend tinggal kirim teks/audio ke backend, terima JSON response + audio stream
- Keuntungan: API key aman di server, bisa tambah fitur server-side (memory, database, dll)
