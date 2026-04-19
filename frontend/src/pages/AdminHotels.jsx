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

function AdminHotels() {
  const { i18n, t } = useTranslation()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadHotels() {
      setLoading(true)
      setError('')

      try {
        const data = await adminService.getAdminHotels()

        if (!isCancelled) {
          setHotels(data)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setHotels([])
          setError(
            axios.isAxiosError(loadError) && loadError.code === 'ERR_NETWORK'
              ? t('admin.errors.network')
              : t('admin.errors.hotels'),
          )
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadHotels()

    return () => {
      isCancelled = true
    }
  }, [t])

  return (
    <AdminShell
      description={t('admin.hotels.description')}
      eyebrow={t('admin.hotels.eyebrow')}
      title={t('admin.hotels.title')}
    >
      {loading ? (
        <div className="alert alert-light border text-center" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          {t('admin.loading.hotels')}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && hotels.length === 0 ? (
        <div className="not-found-card surface-panel">
          <span className="section-label">{t('admin.hotels.emptyBadge')}</span>
          <h2 className="section-title section-title-sm">{t('admin.hotels.emptyTitle')}</h2>
          <p className="mb-0">{t('admin.hotels.emptyDescription')}</p>
        </div>
      ) : null}

      {!loading && !error && hotels.length > 0 ? (
        <div className="surface-panel admin-panel">
          <div className="table-responsive">
            <table className="table admin-table align-middle mb-0">
              <thead>
                <tr>
                  <th>{t('admin.hotels.columns.name')}</th>
                  <th>{t('admin.hotels.columns.city')}</th>
                  <th>{t('admin.hotels.columns.price')}</th>
                  <th>{t('admin.hotels.columns.rating')}</th>
                  <th>{t('admin.hotels.columns.rooms')}</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td>
                      <strong>{hotel.name}</strong>
                      <div className="admin-table__subtext">{hotel.address}</div>
                    </td>
                    <td>{hotel.city}</td>
                    <td>{formatCurrency(hotel.price_per_night, i18n.language)}</td>
                    <td>{hotel.rating}</td>
                    <td>{hotel.available_rooms}</td>
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

export default AdminHotels
