import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SectionHeader from '../SectionHeader'

const adminLinks = [
  { key: 'dashboard', path: '/admin' },
  { key: 'hotels', path: '/admin/hotels' },
  { key: 'transports', path: '/admin/transports' },
  { key: 'reservations', path: '/admin/reservations' },
]

function AdminShell({ eyebrow, title, description, children, notice }) {
  const { t } = useTranslation()

  return (
    <div className="container">
      <section className="admin-shell">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />

        <div className="admin-nav surface-panel mt-4">
          {adminLinks.map((link) => (
            <NavLink
              key={link.path}
              className={({ isActive }) => `admin-nav__link ${isActive ? 'active' : ''}`}
              end={link.path === '/admin'}
              to={link.path}
            >
              {t(`admin.nav.${link.key}`)}
            </NavLink>
          ))}
        </div>

        {notice ? (
          <div className="alert alert-info mt-4 mb-0" role="status">
            {notice}
          </div>
        ) : null}

        <div className="mt-4">{children}</div>
      </section>
    </div>
  )
}

export default AdminShell
