import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const quickLinks = [
  { key: 'home', path: '/' },
  { key: 'hotels', path: '/hotels' },
  { key: 'transports', path: '/transports' },
]

const accountLinks = [
  { key: 'login', path: '/login' },
  { key: 'register', path: '/register' },
  { key: 'support', path: '/transports' },
]

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-panel">
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="footer-brand">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="brand-mark">AT</span>
                  <div>
                    <h2 className="h5 mb-1">{t('footer.brandTitle')}</h2>
                    <p className="mb-0">{t('footer.brandSubtitle')}</p>
                  </div>
                </div>
                <p className="mb-0">{t('footer.description')}</p>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="footer-column">
                <h3 className="footer-title">{t('footer.sections.explore')}</h3>
                <ul className="footer-link-list">
                  {quickLinks.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path}>{t(`footer.links.${link.key}`)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="footer-column">
                <h3 className="footer-title">{t('footer.sections.account')}</h3>
                <ul className="footer-link-list">
                  {accountLinks.map((link) => (
                    <li key={link.key}>
                      <Link to={link.path}>{t(`footer.links.${link.key}`)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="footer-column">
                <h3 className="footer-title">{t('footer.sections.contact')}</h3>
                <p className="mb-2">{t('footer.contact.district')}</p>
                <p className="mb-2">support@atlastravel.com</p>
                <p className="mb-0">+212 522 000 000</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom d-flex justify-content-between gap-3">
            <span>
              &copy; {new Date().getFullYear()} {t('footer.bottom.rights')}
            </span>
            <span>{t('footer.bottom.tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
