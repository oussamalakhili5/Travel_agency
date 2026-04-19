import axios from 'axios'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminShell from '../components/admin/AdminShell'
import adminService from '../services/adminService'

function formatCurrency(value, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDateTime(value, locale) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function AdminTransports() {
  const { i18n, t } = useTranslation()
  const [transports, setTransports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadTransports() {
      setLoading(true)
      setError('')

      try {
        const data = await adminService.getAdminTransports()

        if (!isCancelled) {
          setTransports(data)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setTransports([])
          setError(
            axios.isAxiosError(loadError) && loadError.code === 'ERR_NETWORK'
              ? t('admin.errors.network')
              : t('admin.errors.transports'),
          )
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadTransports()

    return () => {
      isCancelled = true
    }
  }, [t])

  return (
    <AdminShell
      description={t('admin.transports.description')}
      eyebrow={t('admin.transports.eyebrow')}
      title={t('admin.transports.title')}
    >
      {loading ? (
        <div className="alert alert-light border text-center" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          {t('admin.loading.transports')}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && transports.length === 0 ? (
        <div className="not-found-card surface-panel">
          <span className="section-label">{t('admin.transports.emptyBadge')}</span>
          <h2 className="section-title section-title-sm">{t('admin.transports.emptyTitle')}</h2>
          <p className="mb-0">{t('admin.transports.emptyDescription')}</p>
        </div>
      ) : null}

      {!loading && !error && transports.length > 0 ? (
        <div className="surface-panel admin-panel">
          <div className="table-responsive">
            <table className="table admin-table align-middle mb-0">
              <thead>
                <tr>
                  <th>{t('admin.transports.columns.company')}</th>
                  <th>{t('admin.transports.columns.route')}</th>
                  <th>{t('admin.transports.columns.type')}</th>
                  <th>{t('admin.transports.columns.departure')}</th>
                  <th>{t('admin.transports.columns.price')}</th>
                </tr>
              </thead>
              <tbody>
                {transports.map((transport) => (
                  <tr key={transport.id}>
                    <td>
                      <strong>{transport.company}</strong>
                      <div className="admin-table__subtext">
                        {t(`transports.serviceClasses.${transport.service_class}`)}
                      </div>
                    </td>
                    <td>
                      {transport.departure_city} {t('admin.routeSeparator')} {transport.arrival_city}
                    </td>
                    <td>{t(`transports.types.${transport.type}`)}</td>
                    <td>{formatDateTime(transport.departure_time, i18n.language)}</td>
                    <td>{formatCurrency(transport.price, i18n.language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}

export default AdminTransports
