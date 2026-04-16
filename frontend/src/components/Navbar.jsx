import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelector from './LanguageSelector'

const mainLinks = [
  { key: 'home', path: '/' },
  { key: 'hotels', path: '/hotels' },
  { key: 'transports', path: '/transports' },
]

function Navbar() {
  const { t } = useTranslation()

  return (
    <nav className="navbar navbar-expand-lg site-navbar sticky-top" data-bs-theme="dark">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-3" to="/">
          <span className="brand-mark">AT</span>
          <span className="brand-copy">
            <span className="brand-copy__name d-block fw-semibold text-white">
              Atlas Travel
            </span>
            <small>{t('navbar.brandSubtitle')}</small>
          </span>
        </NavLink>

        <button
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
          className="navbar-toggler border-0 shadow-none"
          data-bs-target="#mainNavbar"
          data-bs-toggle="collapse"
          type="button"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav mx-lg-auto gap-lg-2 pt-3 pt-lg-0">
            {mainLinks.map((item) => (
              <NavLink
                key={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.path === '/'}
                to={item.path}
              >
                {t(`navbar.${item.key}`)}
              </NavLink>
            ))}
          </div>

          <div className="navbar-utility-group d-flex flex-column flex-lg-row align-items-lg-center gap-2 pt-3 pt-lg-0">
            <LanguageSelector />
            <NavLink
              className={({ isActive }) =>
                `nav-link nav-link-soft px-3 ${isActive ? 'active' : ''}`
              }
              to="/login"
            >
              {t('navbar.login')}
            </NavLink>
            <NavLink className="btn btn-brand nav-cta" to="/register">
              {t('navbar.register')}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
