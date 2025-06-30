import { ref, reactive } from 'vue'
import { REGIONAL_STYLES } from '@/types/composition'

interface NotationSettings {
  regionalStyle: string
  customSyllables: Record<string, string>
  showRomanization: boolean
  showHandSticking: boolean
  autoplayOnInput: boolean
  audioVolume: number
  sampleSet: 'traditional' | 'modern' | 'synthesized'
  isCustomized: boolean
}

const DEFAULT_SETTINGS: NotationSettings = {
  regionalStyle: 'standard',
  customSyllables: {
    don: 'don',
    ka: 'ka',
    doko: 'doko',
    tsu: 'tsu'
  },
  showRomanization: true,
  showHandSticking: false,
  autoplayOnInput: false,
  audioVolume: 75,
  sampleSet: 'traditional',
  isCustomized: false
}

// Load settings from localStorage
const loadSettings = (): NotationSettings => {
  try {
    const saved = localStorage.getItem('taiko-notation-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load notation settings:', error)
  }
  return { ...DEFAULT_SETTINGS }
}

// Save settings to localStorage
const saveSettings = (settings: NotationSettings) => {
  try {
    localStorage.setItem('taiko-notation-settings', JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save notation settings:', error)
  }
}

export function useNotationSettings() {
  const settings = ref<NotationSettings>(loadSettings())

  const updateSettings = (newSettings: Partial<NotationSettings>) => {
    Object.assign(settings.value, newSettings)
    saveSettings(settings.value)
  }

  const resetSettings = () => {
    settings.value = { ...DEFAULT_SETTINGS }
    saveSettings(settings.value)
  }

  const getCurrentSyllables = () => {
    if (settings.value.isCustomized) {
      return settings.value.customSyllables
    }
    
    const style = REGIONAL_STYLES.find(s => s.code === settings.value.regionalStyle)
    return style?.syllables || DEFAULT_SETTINGS.customSyllables
  }

  const convertStylePatterns = (fromStyle: string, toStyle: string) => {
    const fromStyleData = REGIONAL_STYLES.find(s => s.code === fromStyle)
    const toStyleData = REGIONAL_STYLES.find(s => s.code === toStyle)
    
    if (!fromStyleData || !toStyleData) {
      console.warn('Invalid style conversion requested')
      return
    }

    // Create a mapping from old syllables to new syllables
    const conversionMap: Record<string, string> = {}
    
    // Create reverse mapping for the from style
    const fromReverse: Record<string, string> = {}
    Object.entries(fromStyleData.syllables).forEach(([key, value]) => {
      fromReverse[value] = key
    })
    
    // Create conversion map
    Object.entries(fromReverse).forEach(([syllable, key]) => {
      const newSyllable = toStyleData.syllables[key]
      if (newSyllable) {
        conversionMap[syllable] = newSyllable
      }
    })

    // This would be used by the pattern editor to convert existing patterns
    // For now, we'll just store the conversion map
    console.log('Style conversion map:', conversionMap)
    
    // Update the current syllables to match the new style
    settings.value.customSyllables = { ...toStyleData.syllables }
    saveSettings(settings.value)
    
    // Emit an event or call a callback to notify components of the conversion
    // In a real implementation, this would update all existing patterns
  }

  const validateSyllable = (syllable: string): boolean => {
    const currentSyllables = getCurrentSyllables()
    const validSyllables = Object.values(currentSyllables)
    return validSyllables.includes(syllable)
  }

  const getSyllableByKey = (key: string): string => {
    const currentSyllables = getCurrentSyllables()
    return currentSyllables[key] || key
  }

  const getKeyBySyllable = (syllable: string): string | null => {
    const currentSyllables = getCurrentSyllables()
    for (const [key, value] of Object.entries(currentSyllables)) {
      if (value === syllable) {
        return key
      }
    }
    return null
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    getCurrentSyllables,
    convertStylePatterns,
    validateSyllable,
    getSyllableByKey,
    getKeyBySyllable
  }
}