import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Profile() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
  const displayName = fullName || user?.email

  return (
    <div className="container">
      <section className="auth-shell">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-5">
            <aside className="auth-aside h-100">
              <span className="hero-kicker">{t('profile.badge')}</span>
              <h1 className="section-title text-white mt-4">{t('profile.title', { name: displayName })}</h1>
              <p className="mb-0">{t('profile.description')}</p>
            </aside>
          </div>

          <div className="col-lg-7">
            <section className="auth-card h-100">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="auth-helper-text">{t('profile.fields.firstName')}</div>
                  <div className="fw-semibold">{user?.first_name || '-'}</div>
                </div>

                <div className="col-md-6">
                  <div className="auth-helper-text">{t('profile.fields.lastName')}</div>
                  <div className="fw-semibold">{user?.last_name || '-'}</div>
                </div>

                <div className="col-md-6">
                  <div className="auth-helper-text">{t('profile.fields.email')}</div>
                  <div className="fw-semibold">{user?.email || '-'}</div>
                </div>

                <div className="col-md-6">
                  <div className="auth-helper-text">{t('profile.fields.phone')}</div>
                  <div className="fw-semibold">{user?.phone || '-'}</div>
                </div>

                <div className="col-md-6">
                  <div className="auth-helper-text">{t('profile.fields.role')}</div>
                  <div className="fw-semibold text-capitalize">{user?.role || '-'}</div>
                </div>
              </div>

              <div className="border-top mt-4 pt-4">
                <h2 className="h5 fw-semibold mb-2">{t('profile.next.title')}</h2>
                <p className="mb-4">{t('profile.next.description')}</p>

                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Link className="btn btn-brand" to="/hotels">
                    {t('profile.next.hotels')}
                  </Link>
                  <Link className="btn btn-outline-secondary" to="/transports">
                    {t('profile.next.transports')}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Profile
