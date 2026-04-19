import { useTranslation } from 'react-i18next'

function getFieldError(errors, field) {
  const value = errors[field]

  if (Array.isArray(value)) {
    return value.join(' ')
  }

  if (typeof value === 'string') {
    return value
  }

  return ''
}

function AdminTransportForm({ errors, mode, onCancel, onChange, onSubmit, saving, values }) {
  const { t } = useTranslation()

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <span className="section-label">{t('admin.transports.form.badge')}</span>
          <h2 className="section-title section-title-sm mb-2">
            {mode === 'edit'
              ? t('admin.transports.form.editTitle')
              : t('admin.transports.form.createTitle')}
          </h2>
          <p className="mb-0 admin-table__subtext">{t('admin.transports.form.description')}</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-brand" onClick={onCancel} type="button">
            {t('admin.common.cancel')}
          </button>
          <button className="btn btn-brand" disabled={saving} type="submit">
            {saving
              ? t('admin.common.saving')
              : mode === 'edit'
                ? t('admin.common.update')
                : t('admin.common.create')}
          </button>
        </div>
      </div>

      <div className="admin-form-grid">
        <div>
          <label className="form-label" htmlFor="transport-type">
            {t('admin.transports.form.fields.type')}
          </label>
          <select
            className={`form-select ${getFieldError(errors, 'type') ? 'is-invalid' : ''}`}
            id="transport-type"
            name="type"
            onChange={onChange}
            required
            value={values.type}
          >
            <option value="flight">{t('transports.types.flight')}</option>
            <option value="train">{t('transports.types.train')}</option>
            <option value="bus">{t('transports.types.bus')}</option>
          </select>
          {getFieldError(errors, 'type') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'type')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-company">
            {t('admin.transports.form.fields.company')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'company') ? 'is-invalid' : ''}`}
            id="transport-company"
            name="company"
            onChange={onChange}
            required
            type="text"
            value={values.company}
          />
          {getFieldError(errors, 'company') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'company')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-departure-city">
            {t('admin.transports.form.fields.departureCity')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'departure_city') ? 'is-invalid' : ''}`}
            id="transport-departure-city"
            name="departure_city"
            onChange={onChange}
            required
            type="text"
            value={values.departure_city}
          />
          {getFieldError(errors, 'departure_city') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'departure_city')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-arrival-city">
            {t('admin.transports.form.fields.arrivalCity')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'arrival_city') ? 'is-invalid' : ''}`}
            id="transport-arrival-city"
            name="arrival_city"
            onChange={onChange}
            required
            type="text"
            value={values.arrival_city}
          />
          {getFieldError(errors, 'arrival_city') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'arrival_city')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-departure-time">
            {t('admin.transports.form.fields.departureTime')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'departure_time') ? 'is-invalid' : ''}`}
            id="transport-departure-time"
            name="departure_time"
            onChange={onChange}
            required
            type="datetime-local"
            value={values.departure_time}
          />
          {getFieldError(errors, 'departure_time') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'departure_time')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-arrival-time">
            {t('admin.transports.form.fields.arrivalTime')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'arrival_time') ? 'is-invalid' : ''}`}
            id="transport-arrival-time"
            name="arrival_time"
            onChange={onChange}
            required
            type="datetime-local"
            value={values.arrival_time}
          />
          {getFieldError(errors, 'arrival_time') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'arrival_time')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-price">
            {t('admin.transports.form.fields.price')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'price') ? 'is-invalid' : ''}`}
            id="transport-price"
            min="0"
            name="price"
            onChange={onChange}
            required
            step="0.01"
            type="number"
            value={values.price}
          />
          {getFieldError(errors, 'price') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'price')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-total-seats">
            {t('admin.transports.form.fields.totalSeats')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'total_seats') ? 'is-invalid' : ''}`}
            id="transport-total-seats"
            min="1"
            name="total_seats"
            onChange={onChange}
            required
            type="number"
            value={values.total_seats}
          />
          {getFieldError(errors, 'total_seats') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'total_seats')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-available-seats">
            {t('admin.transports.form.fields.availableSeats')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'available_seats') ? 'is-invalid' : ''}`}
            id="transport-available-seats"
            min="0"
            name="available_seats"
            onChange={onChange}
            required
            type="number"
            value={values.available_seats}
          />
          {getFieldError(errors, 'available_seats') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'available_seats')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="transport-service-class">
            {t('admin.transports.form.fields.serviceClass')}
          </label>
          <select
            className={`form-select ${getFieldError(errors, 'service_class') ? 'is-invalid' : ''}`}
            id="transport-service-class"
            name="service_class"
            onChange={onChange}
            required
            value={values.service_class}
          >
            <option value="economy">{t('transports.serviceClasses.economy')}</option>
            <option value="premium_economy">{t('transports.serviceClasses.premium_economy')}</option>
            <option value="business">{t('transports.serviceClasses.business')}</option>
            <option value="first">{t('transports.serviceClasses.first')}</option>
            <option value="vip">{t('transports.serviceClasses.vip')}</option>
          </select>
          {getFieldError(errors, 'service_class') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'service_class')}</div>
          ) : null}
        </div>

        <div className="admin-form-grid__full">
          <label className="form-label" htmlFor="transport-notes">
            {t('admin.transports.form.fields.notes')}
          </label>
          <textarea
            className={`form-control ${getFieldError(errors, 'notes') ? 'is-invalid' : ''}`}
            id="transport-notes"
            name="notes"
            onChange={onChange}
            rows="4"
            value={values.notes}
          />
          {getFieldError(errors, 'notes') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'notes')}</div>
          ) : null}
        </div>
      </div>

      <div className="form-check form-switch mt-4">
        <input
          checked={values.is_active}
          className="form-check-input"
          id="transport-is-active"
          name="is_active"
          onChange={onChange}
          type="checkbox"
        />
        <label className="form-check-label" htmlFor="transport-is-active">
          {t('admin.transports.form.fields.isActive')}
        </label>
      </div>
    </form>
  )
}

export default AdminTransportForm
