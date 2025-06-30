import { ref } from 'vue'
import type { KuchiShogaSyllable } from '@/types/composition'

const VALID_SYLLABLES = [
  'don', 'ka', 'doko', 'tsu', 'ko', 'dokodoko', 'su', 'ra', 'te', 'tsuku'
]

const PATTERN_LIBRARY = [
  { name: 'matsuri-basic', pattern: 'don ka doko don ka doko don tsu' },
  { name: 'matsuri-advanced', pattern: 'don ka doko tsu don ka doko don' },
  { name: 'yatai-basic', pattern: 'don don ka don don ka tsu' },
  { name: 'oroshi-basic', pattern: 'don ka don ka don ka tsu' },
  { name: 'jiuchi-basic', pattern: 'ka ka ka ka ka ka ka ka' }
]

// Audio context for playing syllables
let audioContext: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null

export function useKuchiShoga() {
  const isPlaying = ref(false)

  const validatePattern = (pattern: string) => {
    if (!pattern.trim()) {
      return { isValid: true, error: null }
    }

    const syllables = pattern.toLowerCase().split(/\s+/)
    const invalidSyllables = syllables.filter(s => {
      // Remove hand sticking notation if present
      const cleanSyllable = s.replace(/\([RL]+\)/g, '')
      return !VALID_SYLLABLES.includes(cleanSyllable)
    })

    if (invalidSyllables.length > 0) {
      return {
        isValid: false,
        error: `Unknown syllable: ${invalidSyllables[0]}`
      }
    }

    return { isValid: true, error: null }
  }

  const parseSyllables = (pattern: string) => {
    if (!pattern.trim()) {
      return { syllables: [], beats: 0 }
    }

    const syllables: KuchiShogaSyllable[] = []
    const parts = pattern.trim().split(/\s+/)
    
    parts.forEach((part, index) => {
      // Parse hand sticking notation
      const handMatch = part.match(/\(([RL]+)\)/)
      const hand = handMatch ? handMatch[1] as 'R' | 'L' | 'RL' : null
      const syllable = part.replace(/\([RL]+\)/g, '')
      
      if (syllable) {
        syllables.push({
          syllable,
          hand,
          beat: index + 1,
          timbre: mapSyllableToTimbre(syllable)
        })
      }
    })

    return { syllables, beats: syllables.length }
  }

  const mapSyllableToTimbre = (syllable: string): 'don' | 'ka' | 'doko' | 'tsu' | string => {
    const lowerSyllable = syllable.toLowerCase()
    if (['don'].includes(lowerSyllable)) return 'don'
    if (['ka', 'ko'].includes(lowerSyllable)) return 'ka'
    if (['doko', 'dokodoko'].includes(lowerSyllable)) return 'doko'
    if (['tsu', 'su'].includes(lowerSyllable)) return 'tsu'
    return lowerSyllable
  }

  const getPatternSuggestions = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return PATTERN_LIBRARY.filter(pattern => 
      pattern.name.toLowerCase().includes(lowerQuery)
    )
  }

  const initAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  const generateSyllableAudio = async (syllable: string, frequency: number, duration: number) => {
    if (!audioContext) return null

    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate different waveforms based on syllable type
    for (let i = 0; i < data.length; i++) {
      const t = i / audioContext.sampleRate
      
      switch (mapSyllableToTimbre(syllable)) {
        case 'don':
          // Deep, resonant sound
          data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.5
          break
        case 'ka':
          // Sharp, percussive sound
          data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.3
          break
        case 'doko':
          // Compound don-ka sound
          data[i] = (Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.4) +
                   ((Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.2)
          break
        case 'tsu':
          // Light, quick sound
          data[i] = Math.sin(2 * Math.PI * frequency * 2 * t) * Math.exp(-t * 6) * 0.2
          break
        default:
          data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 4) * 0.3
      }
    }
    
    return buffer
  }

  const playPattern = async (pattern: string, tempo: number = 120, loop: boolean = false) => {
    initAudioContext()
    if (!audioContext) return

    const { syllables } = parseSyllables(pattern)
    if (syllables.length === 0) return

    const beatDuration = 60 / tempo // seconds per beat
    isPlaying.value = true

    const playSequence = async () => {
      for (let i = 0; i < syllables.length; i++) {
        if (!isPlaying.value) break

        const syllable = syllables[i]
        const frequency = getFrequencyForSyllable(syllable.syllable)
        const buffer = await generateSyllableAudio(syllable.syllable, frequency, beatDuration * 0.8)
        
        if (buffer && isPlaying.value) {
          const source = audioContext!.createBufferSource()
          source.buffer = buffer
          source.connect(audioContext!.destination)
          source.start(audioContext!.currentTime + i * beatDuration)
          
          if (i === syllables.length - 1) {
            source.onended = () => {
              if (loop && isPlaying.value) {
                setTimeout(playSequence, 100)
              } else {
                isPlaying.value = false
              }
            }
          }
        }
      }
    }

    await playSequence()
  }

  const getFrequencyForSyllable = (syllable: string): number => {
    const timbre = mapSyllableToTimbre(syllable)
    switch (timbre) {
      case 'don': return 80  // Deep bass
      case 'ka': return 400  // Sharp mid
      case 'doko': return 200 // Mid-range
      case 'tsu': return 600  // Higher pitch
      default: return 200
    }
  }

  const stopAudio = () => {
    isPlaying.value = false
    if (currentSource) {
      currentSource.stop()
      currentSource = null
    }
  }

  return {
    validatePattern,
    parseSyllables,
    getPatternSuggestions,
    playPattern,
    stopAudio,
    isPlaying
  }
}