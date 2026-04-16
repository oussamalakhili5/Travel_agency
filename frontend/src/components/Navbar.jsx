import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Hotels', path: '/hotels' },
  { label: 'Transports', path: '/transports' },
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
]

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg site-navbar sticky-top" data-bs-theme="dark">
      <div className="container py-2">
        <NavLink className="navbar-brand d-flex align-items-center gap-3" to="/">
          <span className="brand-mark">A</span>
          <span className="brand-copy">
            <span className="d-block fw-semibold text-white">Atlas Travel</span>
            <small>Professional travel planning</small>
          </span>
        </NavLink>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2 pt-3 pt-lg-0">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                className={({ isActive }) =>
                  `nav-link px-lg-3 ${isActive ? 'active' : ''}`
                }
                to={item.path}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
