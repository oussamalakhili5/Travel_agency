import { useTranslation } from 'react-i18next'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function PrivateRoute() {
  const { t } = useTranslation()
  const location = useLocation()
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="container">
        <section className="auth-shell">
          <div className="auth-card text-center">
            <div
              aria-hidden="true"
              className="spinner-border text-primary mb-3"
              role="status"
            />
            <p className="mb-0">{t('auth.loading')}</p>
          </div>
        </section>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}

export default PrivateRoute
