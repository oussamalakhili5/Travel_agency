import { useTranslation } from 'react-i18next'
import languages, {
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  setStoredLanguage,
} from '../data/languages'

function LanguageSelector({ onLanguageChange }) {
  const { i18n, t } = useTranslation()
  const selectedLanguage = i18n.resolvedLanguage ?? getStoredLanguage()
  const currentLanguage =
    languages.find((language) => language.code === selectedLanguage) ?? languages[0]

  function handleLanguageSelect(languageCode) {
    const nextLanguage = languageCode || DEFAULT_LANGUAGE
    setStoredLanguage(nextLanguage)
    i18n.changeLanguage(nextLanguage)
    onLanguageChange?.(nextLanguage)
  }

  return (
    <div className="dropdown language-selector">
      <button
        aria-label={t('navbar.language')}
        aria-expanded="false"
        className="btn language-selector__toggle dropdown-toggle"
        data-bs-toggle="dropdown"
        type="button"
      >
        <span className="language-selector__code">{currentLanguage.shortLabel}</span>
        <span className="language-selector__label">{currentLanguage.nativeLabel}</span>
      </button>

      <ul className="dropdown-menu dropdown-menu-end language-selector__menu">
        {languages.map((language) => (
          <li key={language.code}>
            <button
              className={`dropdown-item language-selector__option ${
                language.code === selectedLanguage ? 'active' : ''
              }`}
              dir={language.direction}
              onClick={() => handleLanguageSelect(language.code)}
              type="button"
            >
              <span className="language-selector__option-copy">
                <span className="language-selector__option-code">{language.shortLabel}</span>
                <span className="language-selector__option-text">
                  <strong>{language.nativeLabel}</strong>
                  <small>{language.label}</small>
                </span>
              </span>
              {language.code === selectedLanguage ? (
                <span className="language-selector__status">{t('navbar.languageCurrent')}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LanguageSelector
