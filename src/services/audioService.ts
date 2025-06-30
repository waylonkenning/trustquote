import type { DrumType } from '@/types/composition'

interface SyllableDefinition {
  frequency: number
  envelope: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
  harmonics: number[]
  noise: boolean
}

interface DrumCharacteristics {
  baseFrequency: number
  resonance: number
  dampening: number
  attack: number
  decay: number
}

export class AudioService {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isInitialized = false
  private metronomeInterval: number | null = null
  private playbackInterval: number | null = null
  private currentBeat = 0
  private isPlaying = false
  private isLooping = false
  private tempo = 120
  private pattern = ''
  private onBeatCallback: ((beat: number) => void) | null = null

  // Syllable definitions for different timbres
  private syllableDefinitions: Record<string, SyllableDefinition> = {
    don: {
      frequency: 80,
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5 },
      harmonics: [1, 0.5, 0.25, 0.125],
      noise: true
    },
    ka: {
      frequency: 200,
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.2 },
      harmonics: [1, 0.3, 0.1],
      noise: true
    },
    doko: {
      frequency: 120,
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.6 },
      harmonics: [1, 0.6, 0.3, 0.15],
      noise: true
    },
    tsu: {
      frequency: 300,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0.05, release: 0.1 },
      harmonics: [1, 0.2],
      noise: true
    }
  }

  // Drum type characteristics
  private drumCharacteristics: Record<DrumType, DrumCharacteristics> = {
    'chu-daiko': {
      baseFrequency: 1.0,
      resonance: 0.8,
      dampening: 0.6,
      attack: 1.0,
      decay: 1.0
    },
    'shime-daiko': {
      baseFrequency: 1.5,
      resonance: 0.3,
      dampening: 0.9,
      attack: 1.2,
      decay: 0.5
    },
    'o-daiko': {
      baseFrequency: 0.7,
      resonance: 1.2,
      dampening: 0.4,
      attack: 0.8,
      decay: 1.5
    },
    'atarigane': {
      baseFrequency: 3.0,
      resonance: 0.1,
      dampening: 1.5,
      attack: 2.0,
      decay: 0.3
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = 0.7

      // Resume context if suspended (required by browser policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      throw error
    }
  }

  getAudioContextState(): string {
    if (!this.audioContext) return 'not-initialized'
    return this.audioContext.state
  }

  async playSyllable(
    syllable: string, 
    drumType: DrumType, 
    volume: number = 1.0,
    pitchAdjustment: number = 0
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.audioContext || !this.masterGain) return

    const syllableType = this.extractSyllableType(syllable)
    const syllableDef = this.syllableDefinitions[syllableType] || this.syllableDefinitions.don
    const drumChar = this.drumCharacteristics[drumType]

    // Create oscillator for base tone
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filterNode = this.audioContext.createBiquadFilter()

    // Apply drum characteristics and pitch adjustment
    const baseFreq = syllableDef.frequency * drumChar.baseFrequency
    const finalFreq = baseFreq * Math.pow(2, pitchAdjustment / 12) // semitone adjustment
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(finalFreq, this.audioContext.currentTime)

    // Add harmonics
    const harmonicGains: GainNode[] = []
    const harmonicOscs: OscillatorNode[] = []
    
    for (let i = 1; i < syllableDef.harmonics.length; i++) {
      const harmOsc = this.audioContext.createOscillator()
      const harmGain = this.audioContext.createGain()
      
      harmOsc.type = 'sine'
      harmOsc.frequency.setValueAtTime(finalFreq * (i + 1), this.audioContext.currentTime)
      harmGain.gain.value = syllableDef.harmonics[i] * volume
      
      harmOsc.connect(harmGain)
      harmGain.connect(filterNode)
      
      harmonicOscs.push(harmOsc)
      harmonicGains.push(harmGain)
    }

    // Configure filter for drum resonance
    filterNode.type = 'lowpass'
    filterNode.frequency.value = finalFreq * 4 * drumChar.resonance
    filterNode.Q.value = drumChar.resonance * 5

    // Add noise component for realistic drum sound
    let noiseNode: AudioBufferSourceNode | null = null
    let noiseGain: GainNode | null = null
    
    if (syllableDef.noise) {
      noiseNode = this.createNoiseNode()
      noiseGain = this.audioContext.createGain()
      noiseGain.gain.value = 0.1 * volume * drumChar.dampening
      
      if (noiseNode && noiseGain) {
        noiseNode.connect(noiseGain)
        noiseGain.connect(filterNode)
      }
    }

    // Connect audio graph
    oscillator.connect(gainNode)
    gainNode.connect(filterNode)
    filterNode.connect(this.masterGain)

    // Apply envelope
    const now = this.audioContext.currentTime
    const attackTime = syllableDef.envelope.attack * drumChar.attack
    const decayTime = syllableDef.envelope.decay * drumChar.decay
    const releaseTime = syllableDef.envelope.release * drumChar.decay
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + attackTime)
    gainNode.gain.linearRampToValueAtTime(
      volume * syllableDef.envelope.sustain, 
      now + attackTime + decayTime
    )
    gainNode.gain.linearRampToValueAtTime(0, now + attackTime + decayTime + releaseTime)

    // Start and stop
    oscillator.start(now)
    oscillator.stop(now + attackTime + decayTime + releaseTime)
    
    harmonicOscs.forEach(osc => {
      osc.start(now)
      osc.stop(now + attackTime + decayTime + releaseTime)
    })
    
    if (noiseNode) {
      noiseNode.start(now)
      noiseNode.stop(now + attackTime + decayTime + releaseTime)
    }
  }

  private extractSyllableType(syllable: string): string {
    const cleanSyllable = syllable.toLowerCase().trim()
    
    // Handle compound syllables
    if (cleanSyllable.includes('doko')) return 'doko'
    if (cleanSyllable.includes('don')) return 'don'
    if (cleanSyllable.includes('ka') || cleanSyllable.includes('ko')) return 'ka'
    if (cleanSyllable.includes('tsu')) return 'tsu'
    
    return 'don' // default
  }

  private createNoiseNode(): AudioBufferSourceNode | null {
    if (!this.audioContext) return null

    const bufferSize = this.audioContext.sampleRate * 0.1 // 100ms of noise
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1
    }

    const noiseNode = this.audioContext.createBufferSource()
    noiseNode.buffer = buffer
    return noiseNode
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  async playPattern(
    pattern: string, 
    drumType: DrumType, 
    tempo: number = 120, 
    volume: number = 1.0,
    loop: boolean = false
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    this.pattern = pattern
    this.tempo = tempo
    this.isLooping = loop
    this.currentBeat = 0
    this.isPlaying = true

    const beatDuration = (60 / tempo) * 1000 // ms per beat
    const syllables = pattern.split(' ').filter(s => s.trim() !== '')

    const playNextBeat = () => {
      if (!this.isPlaying) return

      const syllable = syllables[this.currentBeat % syllables.length]
      
      if (syllable && syllable !== '-') {
        this.playSyllable(syllable, drumType, volume)
      }

      // Notify beat callback
      if (this.onBeatCallback) {
        this.onBeatCallback(this.currentBeat % syllables.length)
      }

      this.currentBeat++

      // Check if we should continue
      if (this.currentBeat >= syllables.length && !loop) {
        this.stopPattern()
        return
      }

      this.playbackInterval = window.setTimeout(playNextBeat, beatDuration)
    }

    playNextBeat()
  }

  stopPattern(): void {
    this.isPlaying = false
    if (this.playbackInterval) {
      clearTimeout(this.playbackInterval)
      this.playbackInterval = null
    }
    this.currentBeat = 0
  }

  isPatternPlaying(): boolean {
    return this.isPlaying
  }

  getCurrentBeat(): number {
    return this.currentBeat
  }

  setOnBeatCallback(callback: (beat: number) => void): void {
    this.onBeatCallback = callback
  }

  // Metronome functionality
  startMetronome(tempo: number, volume: number = 0.3): void {
    this.stopMetronome()
    
    const beatInterval = (60 / tempo) * 1000
    let beatCount = 0

    const playMetronomeBeat = () => {
      const isAccent = beatCount % 4 === 0
      const freq = isAccent ? 800 : 400
      this.playMetronomeClick(freq, volume, isAccent)
      beatCount++
    }

    playMetronomeBeat() // Play immediately
    this.metronomeInterval = window.setInterval(playMetronomeBeat, beatInterval)
  }

  stopMetronome(): void {
    if (this.metronomeInterval) {
      clearInterval(this.metronomeInterval)
      this.metronomeInterval = null
    }
  }

  private async playMetronomeClick(frequency: number, volume: number, isAccent: boolean): Promise<void> {
    if (!this.audioContext || !this.masterGain) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    
    const now = this.audioContext.currentTime
    const duration = isAccent ? 0.1 : 0.05
    
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, now + duration)

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(now)
    oscillator.stop(now + duration)
  }

  // Ensemble coordination
  async playEnsemblePattern(
    parts: Array<{
      pattern: string
      drumType: DrumType
      volume: number
      isMuted: boolean
    }>,
    tempo: number = 120,
    loop: boolean = false
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Stop any existing playback
    this.stopPattern()

    this.tempo = tempo
    this.isLooping = loop
    this.currentBeat = 0
    this.isPlaying = true

    const beatDuration = (60 / tempo) * 1000
    
    // Find the longest pattern to determine cycle length
    const maxBeats = Math.max(...parts.map(part => 
      part.pattern.split(' ').filter(s => s.trim() !== '').length
    ))

    const playEnsembleBeat = () => {
      if (!this.isPlaying) return

      // Play all parts simultaneously for this beat
      parts.forEach(part => {
        if (part.isMuted) return

        const syllables = part.pattern.split(' ').filter(s => s.trim() !== '')
        const syllable = syllables[this.currentBeat % syllables.length]
        
        if (syllable && syllable !== '-') {
          this.playSyllable(syllable, part.drumType, part.volume)
        }
      })

      // Notify beat callback
      if (this.onBeatCallback) {
        this.onBeatCallback(this.currentBeat)
      }

      this.currentBeat++

      // Check if we should continue
      if (this.currentBeat >= maxBeats && !loop) {
        this.stopPattern()
        return
      }

      this.playbackInterval = window.setTimeout(playEnsembleBeat, beatDuration)
    }

    playEnsembleBeat()
  }

  destroy(): void {
    this.stopPattern()
    this.stopMetronome()
    
    if (this.audioContext) {
      this.audioContext.close()
    }
    
    this.audioContext = null
    this.masterGain = null
    this.isInitialized = false
  }
}

// Global instance
export const audioService = new AudioService()