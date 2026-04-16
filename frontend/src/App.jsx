import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { DEFAULT_LANGUAGE, getLanguageDirection } from './data/languages'
import AppRoutes from './routes/AppRoutes'

function App() {
  const { i18n } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage ?? DEFAULT_LANGUAGE
  const direction = getLanguageDirection(currentLanguage)

  useEffect(() => {
    document.documentElement.lang = currentLanguage
    document.documentElement.dir = direction
    document.body.dir = direction
  }, [currentLanguage, direction])

  return (
    <div className="app-shell d-flex flex-column min-vh-100" dir={direction}>
      <Navbar />

      <main className="site-main flex-grow-1 py-4 py-lg-5">
        <AppRoutes />
      </main>

      <Footer />
    </div>
  )
}

export default App
