import axios from 'axios'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminShell from '../components/admin/AdminShell'
import AdminStatCard from '../components/admin/AdminStatCard'
import adminService from '../services/adminService'

function AdminDashboard() {
  const { t } = useTranslation()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const data = await adminService.getAdminDashboardData()

        if (!isCancelled) {
          setDashboard(data)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setDashboard(null)
          setError(
            axios.isAxiosError(loadError) && loadError.code === 'ERR_NETWORK'
              ? t('admin.errors.network')
              : t('admin.errors.dashboard'),
          )
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isCancelled = true
    }
  }, [t])

  return (
    <AdminShell
      description={t('admin.dashboard.description')}
      eyebrow={t('admin.dashboard.eyebrow')}
      title={t('admin.dashboard.title')}
    >
      {loading ? (
        <div className="alert alert-light border text-center" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          {t('admin.loading.dashboard')}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && dashboard ? (
        <>
          <div className="admin-stat-grid">
            <AdminStatCard
              accent="blue"
              label={t('admin.dashboard.cards.hotels.label')}
              note={t('admin.dashboard.cards.hotels.note')}
              value={dashboard.hotelsCount}
            />
            <AdminStatCard
              accent="cyan"
              label={t('admin.dashboard.cards.transports.label')}
              note={t('admin.dashboard.cards.transports.note')}
              value={dashboard.transportsCount}
            />
            <AdminStatCard
              accent="gold"
              label={t('admin.dashboard.cards.reservations.label')}
              note={t('admin.dashboard.cards.reservations.note', {
                count: dashboard.accessibleReservationsCount,
              })}
              value="—"
            />
          </div>

          <div className="surface-panel admin-panel mt-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
              <div>
                <span className="section-label">{t('admin.dashboard.activity.badge')}</span>
                <h2 className="h4 fw-semibold mt-3 mb-2">{t('admin.dashboard.activity.title')}</h2>
                <p className="mb-0">{t('admin.dashboard.activity.description')}</p>
              </div>
            </div>

            {dashboard.recentActivity.length > 0 ? (
              <div className="row g-3">
                {dashboard.recentActivity.map((item) => (
                  <div className="col-md-4" key={`${item.kind}-${item.title}`}>
                    <article className="admin-activity-card">
                      <span className="results-pill">{t(`admin.activityKinds.${item.kind}`)}</span>
                      <h3 className="h6 fw-semibold mt-3 mb-2">{item.title}</h3>
                      <p className="mb-0">{item.description}</p>
                    </article>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-light border mb-0" role="status">
                {t('admin.dashboard.activity.empty')}
              </div>
            )}
          </div>
        </>
      ) : null}
    </AdminShell>
  )
}

export default AdminDashboard
