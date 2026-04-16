export const DEFAULT_LANGUAGE = 'en'
export const LANGUAGE_STORAGE_KEY = 'atlas-travel-language'

const languages = [
  {
    code: 'en',
    shortLabel: 'EN',
    label: 'English',
    nativeLabel: 'English',
    direction: 'ltr',
  },
  {
    code: 'fr',
    shortLabel: 'FR',
    label: 'French',
    nativeLabel: 'Français',
    direction: 'ltr',
  },
  {
    code: 'ar',
    shortLabel: 'AR',
    label: 'Arabic',
    nativeLabel: 'العربية',
    direction: 'rtl',
  },
  {
    code: 'es',
    shortLabel: 'ES',
    label: 'Spanish',
    nativeLabel: 'Español',
    direction: 'ltr',
  },
]

export const supportedLanguageCodes = languages.map((language) => language.code)

export function isSupportedLanguage(code) {
  return supportedLanguageCodes.includes(code)
}

export function getStoredLanguage() {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

  return isSupportedLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE
}

export function setStoredLanguage(code) {
  if (typeof window !== 'undefined' && isSupportedLanguage(code)) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
  }
}

export function getLanguageDirection(code) {
  return languages.find((language) => language.code === code)?.direction ?? 'ltr'
}

export default languages
