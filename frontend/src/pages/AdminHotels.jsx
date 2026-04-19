import axios from 'axios'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminHotelForm from '../components/admin/AdminHotelForm'
import AdminShell from '../components/admin/AdminShell'
import adminService from '../services/adminService'

const INITIAL_HOTEL_FORM = {
  name: '',
  city: '',
  address: '',
  description: '',
  price_per_night: '',
  rating: '0',
  available_rooms: '',
  number_of_rooms: '',
  image: '',
  is_active: true,
}

function formatCurrency(value, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function normalizeErrorMessage(value) {
  if (Array.isArray(value)) {
    return value.join(' ')
  }

  if (typeof value === 'string') {
    return value
  }

  return ''
}

function buildHotelPayload(formData) {
  return {
    name: formData.name.trim(),
    city: formData.city.trim(),
    address: formData.address.trim(),
    description: formData.description.trim(),
    price_per_night: formData.price_per_night,
    rating: formData.rating,
    available_rooms: Number(formData.available_rooms),
    number_of_rooms: Number(formData.number_of_rooms),
    image: formData.image.trim(),
    is_active: formData.is_active,
  }
}

function AdminHotels() {
  const { i18n, t } = useTranslation()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [editingHotelId, setEditingHotelId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_HOTEL_FORM)

  async function loadHotels({ showLoading = true } = {}) {
    if (showLoading) {
      setLoading(true)
    }

    setLoadError('')

    try {
      const data = await adminService.getAdminHotels()
      setHotels(data)
    } catch (loadError) {
      setHotels([])
      setLoadError(
        axios.isAxiosError(loadError) && loadError.code === 'ERR_NETWORK'
          ? t('admin.errors.network')
          : t('admin.errors.hotels'),
      )
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    let isCancelled = false

    async function loadHotels() {
      try {
        const data = await adminService.getAdminHotels()

        if (!isCancelled) {
          setHotels(data)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setHotels([])
          setLoadError(
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

  function resetForm() {
    setFormMode(null)
    setEditingHotelId(null)
    setFormData(INITIAL_HOTEL_FORM)
    setFormErrors({})
    setActionError('')
  }

  function handleCreateClick() {
    setFormMode('create')
    setEditingHotelId(null)
    setFormData(INITIAL_HOTEL_FORM)
    setFormErrors({})
    setActionError('')
    setSuccessMessage('')
  }

  function handleEditClick(hotel) {
    setFormMode('edit')
    setEditingHotelId(hotel.id)
    setFormErrors({})
    setActionError('')
    setSuccessMessage('')
    setFormData({
      name: hotel.name ?? '',
      city: hotel.city ?? '',
      address: hotel.address ?? '',
      description: hotel.description ?? '',
      price_per_night: hotel.price_per_night ?? '',
      rating: hotel.rating ?? '',
      available_rooms: hotel.available_rooms ?? '',
      number_of_rooms: hotel.number_of_rooms ?? '',
      image: hotel.image ?? '',
      is_active: Boolean(hotel.is_active),
    })
  }

  function handleFormChange(event) {
    const { checked, name, type, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setSaving(true)
    setFormErrors({})
    setActionError('')
    setSuccessMessage('')

    try {
      const payload = buildHotelPayload(formData)

      if (formMode === 'edit' && editingHotelId) {
        await adminService.updateAdminHotel(editingHotelId, payload)
        setSuccessMessage(t('admin.hotels.messages.updated'))
      } else {
        await adminService.createAdminHotel(payload)
        setSuccessMessage(t('admin.hotels.messages.created'))
      }

      await loadHotels({ showLoading: false })
      resetForm()
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.data) {
        const responseData = requestError.response.data

        if (typeof responseData === 'object' && !Array.isArray(responseData)) {
          setFormErrors(responseData)
          setActionError(
            normalizeErrorMessage(responseData.detail) || t('admin.errors.hotelSave'),
          )
        } else {
          setActionError(t('admin.errors.hotelSave'))
        }
      } else {
        setActionError(
          axios.isAxiosError(requestError) && requestError.code === 'ERR_NETWORK'
            ? t('admin.errors.network')
            : t('admin.errors.hotelSave'),
        )
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(hotel) {
    const shouldDelete = window.confirm(
      t('admin.hotels.messages.deleteConfirm', { name: hotel.name }),
    )

    if (!shouldDelete) {
      return
    }

    setDeletingId(hotel.id)
    setActionError('')
    setSuccessMessage('')

    try {
      await adminService.deleteAdminHotel(hotel.id)
      await loadHotels({ showLoading: false })
      setSuccessMessage(t('admin.hotels.messages.deleted'))

      if (editingHotelId === hotel.id) {
        resetForm()
      }
    } catch (requestError) {
      setActionError(
        axios.isAxiosError(requestError) && requestError.code === 'ERR_NETWORK'
          ? t('admin.errors.network')
          : t('admin.errors.hotelDelete'),
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminShell
      description={t('admin.hotels.description')}
      eyebrow={t('admin.hotels.eyebrow')}
      title={t('admin.hotels.title')}
    >
      <div className="surface-panel admin-panel mb-4">
        <div className="admin-toolbar">
          <div>
            <span className="section-label">{t('admin.hotels.managementBadge')}</span>
            <h2 className="section-title section-title-sm mb-2">{t('admin.hotels.managementTitle')}</h2>
            <p className="mb-0 admin-table__subtext">{t('admin.hotels.managementDescription')}</p>
          </div>

          <button className="btn btn-brand" onClick={handleCreateClick} type="button">
            {t('admin.hotels.actions.add')}
          </button>
        </div>
      </div>

      {formMode ? (
        <div className="surface-panel admin-panel mb-4">
          <AdminHotelForm
            errors={formErrors}
            mode={formMode}
            onCancel={resetForm}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            saving={saving}
            values={formData}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="alert alert-light border text-center" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          {t('admin.loading.hotels')}
        </div>
      ) : null}

      {successMessage ? (
        <div className="alert alert-success" role="status">
          {successMessage}
        </div>
      ) : null}

      {actionError ? (
        <div className="alert alert-danger" role="alert">
          {actionError}
        </div>
      ) : null}

      {loadError ? (
        <div className="alert alert-danger" role="alert">
          {loadError}
        </div>
      ) : null}

      {!loading && !loadError && hotels.length === 0 ? (
        <div className="not-found-card surface-panel">
          <span className="section-label">{t('admin.hotels.emptyBadge')}</span>
          <h2 className="section-title section-title-sm">{t('admin.hotels.emptyTitle')}</h2>
          <p className="mb-0">{t('admin.hotels.emptyDescription')}</p>
        </div>
      ) : null}

      {!loading && !loadError && hotels.length > 0 ? (
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
                  <th>{t('admin.hotels.columns.status')}</th>
                  <th>{t('admin.hotels.columns.actions')}</th>
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
                    <td>
                      {hotel.available_rooms} / {hotel.number_of_rooms}
                    </td>
                    <td>
                      <span
                        className={`admin-status ${
                          hotel.is_active ? 'admin-status--active' : 'admin-status--inactive'
                        }`}
                      >
                        {hotel.is_active
                          ? t('admin.common.active')
                          : t('admin.common.inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className="btn btn-sm btn-outline-brand"
                          onClick={() => handleEditClick(hotel)}
                          type="button"
                        >
                          {t('admin.common.edit')}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={deletingId === hotel.id}
                          onClick={() => handleDelete(hotel)}
                          type="button"
                        >
                          {deletingId === hotel.id
                            ? t('admin.common.deleting')
                            : t('admin.common.delete')}
                        </button>
                      </div>
                    </td>
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
