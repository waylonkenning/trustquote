export interface Composition {
  id: string
  title: string
  parts: CompositionPart[]
  tempo: number
  createdAt: Date
  isEnsemble?: boolean
  userId?: string
  isPremiumFeature?: boolean
}

export interface CompositionPart {
  id: string
  drumType: DrumType
  pattern: string
  volume: number
  role?: DrumRole
  isMuted?: boolean
  isSolo?: boolean
  isManuallyMuted?: boolean
}

export type DrumType = 'chu-daiko' | 'shime-daiko' | 'o-daiko' | 'atarigane'

export type DrumRole = 'lead' | 'accompaniment' | 'foundation' | 'accent'

export interface EnsembleStats {
  totalParts: number
  complexity: 'simple' | 'moderate' | 'complex'
  balance: 'good' | 'needs-adjustment'
}

export interface KuchiShogaSyllable {
  syllable: string
  hand: 'R' | 'L' | 'RL' | null
  beat: number
  timbre: 'don' | 'ka' | 'doko' | 'tsu' | string
}

export interface RegionalStyle {
  name: string
  code: string
  syllables: Record<string, string>
}

export const REGIONAL_STYLES: RegionalStyle[] = [
  {
    name: 'Standard',
    code: 'standard',
    syllables: {
      don: 'don',
      ka: 'ka', 
      doko: 'doko',
      tsu: 'tsu'
    }
  },
  {
    name: 'Kanto',
    code: 'kanto',
    syllables: {
      don: 'don',
      ka: 'ko',
      doko: 'doko',
      tsu: 'tsu'
    }
  },
  {
    name: 'Kansai',
    code: 'kansai', 
    syllables: {
      don: 'don',
      ka: 'ka',
      doko: 'dokodoko',
      tsu: 'tsu'
    }
  }
]