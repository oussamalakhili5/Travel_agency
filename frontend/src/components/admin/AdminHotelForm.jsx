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

function AdminHotelForm({ errors, mode, onCancel, onChange, onSubmit, saving, values }) {
  const { t } = useTranslation()

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <span className="section-label">{t('admin.hotels.form.badge')}</span>
          <h2 className="section-title section-title-sm mb-2">
            {mode === 'edit'
              ? t('admin.hotels.form.editTitle')
              : t('admin.hotels.form.createTitle')}
          </h2>
          <p className="mb-0 admin-table__subtext">{t('admin.hotels.form.description')}</p>
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
          <label className="form-label" htmlFor="hotel-name">
            {t('admin.hotels.form.fields.name')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'name') ? 'is-invalid' : ''}`}
            id="hotel-name"
            name="name"
            onChange={onChange}
            required
            type="text"
            value={values.name}
          />
          {getFieldError(errors, 'name') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'name')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="hotel-city">
            {t('admin.hotels.form.fields.city')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'city') ? 'is-invalid' : ''}`}
            id="hotel-city"
            name="city"
            onChange={onChange}
            required
            type="text"
            value={values.city}
          />
          {getFieldError(errors, 'city') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'city')}</div>
          ) : null}
        </div>

        <div className="admin-form-grid__full">
          <label className="form-label" htmlFor="hotel-address">
            {t('admin.hotels.form.fields.address')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'address') ? 'is-invalid' : ''}`}
            id="hotel-address"
            name="address"
            onChange={onChange}
            required
            type="text"
            value={values.address}
          />
          {getFieldError(errors, 'address') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'address')}</div>
          ) : null}
        </div>

        <div className="admin-form-grid__full">
          <label className="form-label" htmlFor="hotel-description">
            {t('admin.hotels.form.fields.description')}
          </label>
          <textarea
            className={`form-control ${getFieldError(errors, 'description') ? 'is-invalid' : ''}`}
            id="hotel-description"
            name="description"
            onChange={onChange}
            required
            rows="4"
            value={values.description}
          />
          {getFieldError(errors, 'description') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'description')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="hotel-price">
            {t('admin.hotels.form.fields.price')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'price_per_night') ? 'is-invalid' : ''}`}
            id="hotel-price"
            min="0"
            name="price_per_night"
            onChange={onChange}
            required
            step="0.01"
            type="number"
            value={values.price_per_night}
          />
          {getFieldError(errors, 'price_per_night') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'price_per_night')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="hotel-rating">
            {t('admin.hotels.form.fields.rating')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'rating') ? 'is-invalid' : ''}`}
            id="hotel-rating"
            max="5"
            min="0"
            name="rating"
            onChange={onChange}
            required
            step="0.01"
            type="number"
            value={values.rating}
          />
          {getFieldError(errors, 'rating') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'rating')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="hotel-total-rooms">
            {t('admin.hotels.form.fields.totalRooms')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'number_of_rooms') ? 'is-invalid' : ''}`}
            id="hotel-total-rooms"
            min="1"
            name="number_of_rooms"
            onChange={onChange}
            required
            type="number"
            value={values.number_of_rooms}
          />
          {getFieldError(errors, 'number_of_rooms') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'number_of_rooms')}</div>
          ) : null}
        </div>

        <div>
          <label className="form-label" htmlFor="hotel-available-rooms">
            {t('admin.hotels.form.fields.availableRooms')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'available_rooms') ? 'is-invalid' : ''}`}
            id="hotel-available-rooms"
            min="0"
            name="available_rooms"
            onChange={onChange}
            required
            type="number"
            value={values.available_rooms}
          />
          {getFieldError(errors, 'available_rooms') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'available_rooms')}</div>
          ) : null}
        </div>

        <div className="admin-form-grid__full">
          <label className="form-label" htmlFor="hotel-image">
            {t('admin.hotels.form.fields.image')}
          </label>
          <input
            className={`form-control ${getFieldError(errors, 'image') ? 'is-invalid' : ''}`}
            id="hotel-image"
            name="image"
            onChange={onChange}
            type="url"
            value={values.image}
          />
          {getFieldError(errors, 'image') ? (
            <div className="invalid-feedback">{getFieldError(errors, 'image')}</div>
          ) : null}
        </div>
      </div>

      <div className="form-check form-switch mt-4">
        <input
          checked={values.is_active}
          className="form-check-input"
          id="hotel-is-active"
          name="is_active"
          onChange={onChange}
          type="checkbox"
        />
        <label className="form-check-label" htmlFor="hotel-is-active">
          {t('admin.hotels.form.fields.isActive')}
        </label>
      </div>
    </form>
  )
}

export default AdminHotelForm
