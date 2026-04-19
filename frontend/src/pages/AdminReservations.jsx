import axios from 'axios'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminShell from '../components/admin/AdminShell'
import adminService from '../services/adminService'

function formatDate(value, locale) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function AdminReservations() {
  const { i18n, t } = useTranslation()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadReservations() {
      setLoading(true)
      setError('')

      try {
        const data = await adminService.getAdminReservations()

        if (!isCancelled) {
          setReservations(data)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setReservations([])
          setError(
            axios.isAxiosError(loadError) && loadError.code === 'ERR_NETWORK'
              ? t('admin.errors.network')
              : t('admin.errors.reservations'),
          )
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadReservations()

    return () => {
      isCancelled = true
    }
  }, [t])

  return (
    <AdminShell
      description={t('admin.reservations.description')}
      eyebrow={t('admin.reservations.eyebrow')}
      notice={t('admin.reservations.scopeNotice')}
      title={t('admin.reservations.title')}
    >
      {loading ? (
        <div className="alert alert-light border text-center" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          {t('admin.loading.reservations')}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && reservations.length === 0 ? (
        <div className="not-found-card surface-panel">
          <span className="section-label">{t('admin.reservations.emptyBadge')}</span>
          <h2 className="section-title section-title-sm">{t('admin.reservations.emptyTitle')}</h2>
          <p className="mb-0">{t('admin.reservations.emptyDescription')}</p>
        </div>
      ) : null}

      {!loading && !error && reservations.length > 0 ? (
        <div className="row g-4">
          {reservations.map((reservation) => (
            <div className="col-12" key={reservation.id}>
              <article className="surface-panel reservation-card">
                <div className="reservation-card__top">
                  <div>
                    <span className="results-pill">{t(`reservations.types.${reservation.reservation_type}`)}</span>
                    <p className="auth-helper-text mt-3 mb-0">
                      {t('reservations.fields.reservedAt')} {formatDate(reservation.reserved_at, i18n.language)}
                    </p>
                  </div>
                  <span className={`reservation-status reservation-status--${reservation.status}`}>
                    {t(`reservations.statuses.${reservation.status}`)}
                  </span>
                </div>

                <div className="admin-reservation-grid mt-4">
                  <div>
                    <span className="admin-table__subtext">{t('admin.reservations.columns.item')}</span>
                    <strong>
                      {reservation.hotel?.name ||
                        reservation.transport?.company ||
                        t('admin.reservations.fallbackItem')}
                    </strong>
                  </div>
                  <div>
                    <span className="admin-table__subtext">{t('admin.reservations.columns.routeOrStay')}</span>
                    <strong>
                      {reservation.hotel
                        ? `${formatDate(reservation.check_in_date, i18n.language)} -> ${formatDate(reservation.check_out_date, i18n.language)}`
                        : `${reservation.transport?.departure_city || ''} ${t('admin.routeSeparator')} ${reservation.transport?.arrival_city || ''}`}
                    </strong>
                  </div>
                  <div>
                    <span className="admin-table__subtext">{t('admin.reservations.columns.party')}</span>
                    <strong>{reservation.guests_count || reservation.passengers_count || 0}</strong>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      ) : null}
    </AdminShell>
  )
}

export default AdminReservations
