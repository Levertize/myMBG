/**
 * Emotion → VRM Expression Mapping
 *
 * Maps emotion names (from Claude response) to VRM expression presets.
 * VRM v1/v2 uses preset expression names: happy, angry, sad, relaxed, surprised
 * VRM v0 uses blendShapeGroup names: Joy, Angry, Sorrow, Fun, Surprised
 *
 * We support both by trying preset names first, then falling back.
 */

export const EMOTION_MAP = {
  happy: {
    preset: 'happy',         // VRM v1/v2
    fallback: 'Joy',         // VRM v0
    intensity: 1.0,
  },
  sad: {
    preset: 'sad',
    fallback: 'Sorrow',
    intensity: 1.0,
  },
  surprised: {
    preset: 'surprised',
    fallback: 'Surprised',
    intensity: 1.0,
  },
  angry: {
    preset: 'angry',
    fallback: 'Angry',
    intensity: 0.8,
  },
  shy: {
    preset: 'happy',
    fallback: 'Joy',
    intensity: 0.5,
  },
  thinking: {
    preset: null,
    fallback: null,
    intensity: 0.0,
  },
  neutral: {
    preset: null,
    fallback: null,
    intensity: 0.0,
  },
}

/**
 * Viseme presets for lip sync (VRM expression names)
 */
export const VISEME_MAP = {
  aa: 'aa',
  ih: 'ih',
  ou: 'ou',
  ee: 'ee',
  oh: 'oh',
}

/**
 * All expression preset names to reset before applying new ones
 */
export const ALL_EMOTION_PRESETS = ['happy', 'angry', 'sad', 'relaxed', 'surprised']
export const ALL_VISEME_PRESETS = ['aa', 'ih', 'ou', 'ee', 'oh']
