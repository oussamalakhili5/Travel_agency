import { Link } from 'react-router-dom'

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Hotels', path: '/hotels' },
  { label: 'Transports', path: '/transports' },
]

const accountLinks = [
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
  { label: 'Traveler Support', path: '/transports' },
]

function Footer() {
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
                    <h2 className="h5 mb-1">Atlas Travel Agency</h2>
                    <p className="mb-0">Professional journeys for business and leisure.</p>
                  </div>
                </div>
                <p className="mb-0">
                  Plan hotels, transport, and curated packages with a frontend designed for clear
                  traveler experiences and scalable agency workflows.
                </p>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="footer-column">
                <h3 className="footer-title">Explore</h3>
                <ul className="footer-link-list">
                  {quickLinks.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-6 col-lg-2">
              <div className="footer-column">
                <h3 className="footer-title">Account</h3>
                <ul className="footer-link-list">
                  {accountLinks.map((link) => (
                    <li key={link.label}>
                      <Link to={link.path}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="footer-column">
                <h3 className="footer-title">Contact</h3>
                <p className="mb-2">Casablanca Business District</p>
                <p className="mb-2">support@atlastravel.com</p>
                <p className="mb-0">+212 522 000 000</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom d-flex justify-content-between gap-3">
            <span>&copy; {new Date().getFullYear()} Atlas Travel Agency. All rights reserved.</span>
            <span>Designed for modern booking, planning, and traveler support.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
