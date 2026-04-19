import axios from 'axios'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminTransportForm from '../components/admin/AdminTransportForm'
import AdminShell from '../components/admin/AdminShell'
import adminService from '../services/adminService'

const INITIAL_TRANSPORT_FORM = {
  type: 'flight',
  company: '',
  departure_city: '',
  arrival_city: '',
  departure_time: '',
  arrival_time: '',
  price: '',
  available_seats: '',
  total_seats: '',
  service_class: 'economy',
  notes: '',
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

function formatDateTime(value, locale) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const pad = (part) => String(part).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function buildTransportPayload(formData) {
  return {
    type: formData.type,
    company: formData.company.trim(),
    departure_city: formData.departure_city.trim(),
    arrival_city: formData.arrival_city.trim(),
    departure_time: new Date(formData.departure_time).toISOString(),
    arrival_time: new Date(formData.arrival_time).toISOString(),
    price: formData.price,
    available_seats: Number(formData.available_seats),
    total_seats: Number(formData.total_seats),
    service_class: formData.service_class,
    notes: formData.notes.trim(),
    is_active: formData.is_active,
  }
}

function AdminTransports() {
  const { i18n, t } = useTranslation()
  const [transports, setTransports] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [editingTransportId, setEditingTransportId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_TRANSPORT_FORM)

  async function loadTransports({ showLoading = true } = {}) {
    if (showLoading) {
      setLoading(true)
    }

    setLoadError('')

    try {
      const data = await adminService.getAdminTransports()
      setTransports(data)
    } catch (loadError) {
      setTransports([])
      setLoadError(
        axios.isAxiosError(loadError) && loadError.code === 'ERR_NETWORK'
          ? t('admin.errors.network')
          : t('admin.errors.transports'),
      )
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    let isCancelled = false

    async function loadTransports() {
      try {
        const data = await adminService.getAdminTransports()

        if (!isCancelled) {
          setTransports(data)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setTransports([])
          setLoadError(
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

  function resetForm() {
    setFormMode(null)
    setEditingTransportId(null)
    setFormData(INITIAL_TRANSPORT_FORM)
    setFormErrors({})
    setActionError('')
  }

  function handleCreateClick() {
    setFormMode('create')
    setEditingTransportId(null)
    setFormData(INITIAL_TRANSPORT_FORM)
    setFormErrors({})
    setActionError('')
    setSuccessMessage('')
  }

  function handleEditClick(transport) {
    setFormMode('edit')
    setEditingTransportId(transport.id)
    setFormErrors({})
    setActionError('')
    setSuccessMessage('')
    setFormData({
      type: transport.type ?? 'flight',
      company: transport.company ?? '',
      departure_city: transport.departure_city ?? '',
      arrival_city: transport.arrival_city ?? '',
      departure_time: toDateTimeLocalValue(transport.departure_time),
      arrival_time: toDateTimeLocalValue(transport.arrival_time),
      price: transport.price ?? '',
      available_seats: transport.available_seats ?? '',
      total_seats: transport.total_seats ?? '',
      service_class: transport.service_class ?? 'economy',
      notes: transport.notes ?? '',
      is_active: Boolean(transport.is_active),
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
      const payload = buildTransportPayload(formData)

      if (formMode === 'edit' && editingTransportId) {
        await adminService.updateAdminTransport(editingTransportId, payload)
        setSuccessMessage(t('admin.transports.messages.updated'))
      } else {
        await adminService.createAdminTransport(payload)
        setSuccessMessage(t('admin.transports.messages.created'))
      }

      await loadTransports({ showLoading: false })
      resetForm()
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.data) {
        const responseData = requestError.response.data

        if (typeof responseData === 'object' && !Array.isArray(responseData)) {
          setFormErrors(responseData)
          setActionError(
            normalizeErrorMessage(responseData.detail) || t('admin.errors.transportSave'),
          )
        } else {
          setActionError(t('admin.errors.transportSave'))
        }
      } else {
        setActionError(
          axios.isAxiosError(requestError) && requestError.code === 'ERR_NETWORK'
            ? t('admin.errors.network')
            : t('admin.errors.transportSave'),
        )
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(transport) {
    const shouldDelete = window.confirm(
      t('admin.transports.messages.deleteConfirm', { company: transport.company }),
    )

    if (!shouldDelete) {
      return
    }

    setDeletingId(transport.id)
    setActionError('')
    setSuccessMessage('')

    try {
      await adminService.deleteAdminTransport(transport.id)
      await loadTransports({ showLoading: false })
      setSuccessMessage(t('admin.transports.messages.deleted'))

      if (editingTransportId === transport.id) {
        resetForm()
      }
    } catch (requestError) {
      setActionError(
        axios.isAxiosError(requestError) && requestError.code === 'ERR_NETWORK'
          ? t('admin.errors.network')
          : t('admin.errors.transportDelete'),
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminShell
      description={t('admin.transports.description')}
      eyebrow={t('admin.transports.eyebrow')}
      title={t('admin.transports.title')}
    >
      <div className="surface-panel admin-panel mb-4">
        <div className="admin-toolbar">
          <div>
            <span className="section-label">{t('admin.transports.managementBadge')}</span>
            <h2 className="section-title section-title-sm mb-2">{t('admin.transports.managementTitle')}</h2>
            <p className="mb-0 admin-table__subtext">{t('admin.transports.managementDescription')}</p>
          </div>

          <button className="btn btn-brand" onClick={handleCreateClick} type="button">
            {t('admin.transports.actions.add')}
          </button>
        </div>
      </div>

      {formMode ? (
        <div className="surface-panel admin-panel mb-4">
          <AdminTransportForm
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
          {t('admin.loading.transports')}
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

      {!loading && !loadError && transports.length === 0 ? (
        <div className="not-found-card surface-panel">
          <span className="section-label">{t('admin.transports.emptyBadge')}</span>
          <h2 className="section-title section-title-sm">{t('admin.transports.emptyTitle')}</h2>
          <p className="mb-0">{t('admin.transports.emptyDescription')}</p>
        </div>
      ) : null}

      {!loading && !loadError && transports.length > 0 ? (
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
                  <th>{t('admin.transports.columns.status')}</th>
                  <th>{t('admin.transports.columns.actions')}</th>
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
                    <td>
                      <span
                        className={`admin-status ${
                          transport.is_active
                            ? 'admin-status--active'
                            : 'admin-status--inactive'
                        }`}
                      >
                        {transport.is_active
                          ? t('admin.common.active')
                          : t('admin.common.inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className="btn btn-sm btn-outline-brand"
                          onClick={() => handleEditClick(transport)}
                          type="button"
                        >
                          {t('admin.common.edit')}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={deletingId === transport.id}
                          onClick={() => handleDelete(transport)}
                          type="button"
                        >
                          {deletingId === transport.id
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

export default AdminTransports
