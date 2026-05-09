import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPackageById } from '../services/catalogService'
import reservationService from '../services/reservationService'
import { useAuth } from '../hooks/useAuth'
import { mapReservationErrors } from '../utils/reservationErrors'

function formatCurrency(value, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

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

function PackageDetail() {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [travelPackage, setTravelPackage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [reservationValues, setReservationValues] = useState({
    guests_count: 1,
    special_request: '',
  })
  const [reservationErrors, setReservationErrors] = useState({})
  const [createdReservation, setCreatedReservation] = useState(null)
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false)
  const price = travelPackage ? formatCurrency(travelPackage.price, i18n.language) : ''

  useEffect(() => {
    let isCancelled = false

    async function loadPackage() {
      setLoading(true)
      setError('')
      setNotFound(false)

      try {
        const data = await getPackageById(id)

        if (!isCancelled) {
          setTravelPackage(data)
        }
      } catch (fetchError) {
        if (isCancelled) {
          return
        }

        setTravelPackage(null)

        if (axios.isAxiosError(fetchError) && fetchError.response?.status === 404) {
          setNotFound(true)
        } else {
          setError(t('packageDetail.status.error'))
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadPackage()

    return () => {
      isCancelled = true
    }
  }, [id, t])

  function handleReserveClick() {
    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: {
          from: location,
          message: t('reservations.auth.loginRequired'),
        },
      })
      return
    }

    setShowReservationForm((currentValue) => !currentValue)
    setCreatedReservation(null)
  }

  function handleReservationChange(event) {
    const { name, value } = event.target

    setReservationValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
    setReservationErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
      form: '',
    }))
    setCreatedReservation(null)
  }

  async function handleReservationSubmit(event) {
    event.preventDefault()

    setIsSubmittingReservation(true)
    setReservationErrors({})
    setCreatedReservation(null)

    try {
      const reservation = await reservationService.createReservation({
        reservation_type: 'package',
        package: travelPackage.id,
        guests_count: Number(reservationValues.guests_count),
        special_request: reservationValues.special_request.trim(),
      })

      setCreatedReservation(reservation)
      setReservationValues({
        guests_count: 1,
        special_request: '',
      })
    } catch (submitError) {
      setReservationErrors(mapReservationErrors(submitError, t))
    } finally {
      setIsSubmittingReservation(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <section className="detail-shell">
          <div className="alert alert-light border text-center" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            {t('packageDetail.status.loading')}
          </div>
        </section>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container">
        <section className="detail-shell">
          <div className="not-found-card surface-panel">
            <span className="section-label">{t('packageDetail.status.notFoundBadge')}</span>
            <h1 className="section-title section-title-sm">{t('packageDetail.status.notFoundTitle')}</h1>
            <p className="mb-4">{t('packageDetail.status.notFoundDescription')}</p>
            <Link className="btn btn-outline-brand px-4" to="/packages">
              {t('packageDetail.actions.back')}
            </Link>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <section className="detail-shell">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <Link className="btn btn-outline-brand" to="/packages">
            {t('packageDetail.actions.back')}
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="container">
      <section className="detail-shell">
        <div className="detail-toolbar">
          <Link className="btn btn-outline-brand" to="/packages">
            {t('packageDetail.actions.back')}
          </Link>
        </div>

        <div className="detail-hero surface-panel">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-6">
              <img
                alt={travelPackage.title}
                className="detail-hero__image"
                loading="lazy"
                src={travelPackage.image_url || '/favicon.svg'}
              />
            </div>

            <div className="col-lg-6">
              <div className="detail-hero__content h-100">
                <span className="section-label">{t('packageDetail.badge')}</span>
                <h1 className="section-title section-title-sm mt-3">{travelPackage.title}</h1>
                <p className="detail-lead mb-4">{travelPackage.description}</p>

                <div className="detail-price mb-4">
                  {price}
                  <span> {t('packageDetail.fields.priceSuffix')}</span>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span>{t('packageDetail.fields.destination')}</span>
                    <strong>{travelPackage.destination}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('packageDetail.fields.city')}</span>
                    <strong>{travelPackage.city}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('packageDetail.fields.duration')}</span>
                    <strong>{t('packageDetail.fields.durationValue', { count: travelPackage.duration_days })}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('packageDetail.fields.dates')}</span>
                    <strong>
                      {travelPackage.start_date && travelPackage.end_date
                        ? `${formatDate(travelPackage.start_date, i18n.language)} - ${formatDate(travelPackage.end_date, i18n.language)}`
                        : t('packageDetail.fields.flexibleDates')}
                    </strong>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                  <button className="btn btn-brand" onClick={handleReserveClick} type="button">
                    {t('packageDetail.actions.reserve')}
                  </button>
                  <Link className="btn btn-outline-secondary" to="/packages">
                    {t('packageDetail.actions.back')}
                  </Link>
                </div>

                {showReservationForm ? (
                  <div className="surface-panel reservation-panel mt-4">
                    <div className="mb-4">
                      <h2 className="h4 fw-semibold mb-2">{t('reservations.packageForm.title')}</h2>
                      <p className="mb-0">{t('reservations.packageForm.description')}</p>
                    </div>

                    {createdReservation ? (
                      <div className="alert alert-success auth-alert" role="status">
                        {t('reservations.success.created')}{' '}
                        <Link className="fw-semibold" to={`/payments/reservations/${createdReservation.id}`}>
                          {t('payments.actions.payNow')}
                        </Link>
                      </div>
                    ) : null}

                    {reservationErrors.form ? (
                      <div className="alert alert-danger" role="alert">
                        {reservationErrors.form}
                      </div>
                    ) : null}

                    <form noValidate onSubmit={handleReservationSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="package-guests-count">
                            {t('reservations.packageForm.guests')}
                          </label>
                          <input
                            className={`form-control ${reservationErrors.guests_count ? 'is-invalid' : ''}`}
                            id="package-guests-count"
                            min="1"
                            name="guests_count"
                            onChange={handleReservationChange}
                            type="number"
                            value={reservationValues.guests_count}
                          />
                          {reservationErrors.guests_count ? (
                            <div className="invalid-feedback d-block">{reservationErrors.guests_count}</div>
                          ) : null}
                        </div>

                        <div className="col-12">
                          <label className="form-label" htmlFor="package-special-request">
                            {t('reservations.packageForm.specialRequest')}
                          </label>
                          <textarea
                            className={`form-control ${reservationErrors.special_request ? 'is-invalid' : ''}`}
                            id="package-special-request"
                            name="special_request"
                            onChange={handleReservationChange}
                            placeholder={t('reservations.packageForm.specialRequestPlaceholder')}
                            rows="4"
                            value={reservationValues.special_request}
                          />
                          {reservationErrors.special_request ? (
                            <div className="invalid-feedback d-block">{reservationErrors.special_request}</div>
                          ) : null}
                        </div>
                      </div>

                      <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                        <button className="btn btn-brand" disabled={isSubmittingReservation} type="submit">
                          {isSubmittingReservation ? t('reservations.actions.submitting') : t('reservations.actions.submit')}
                        </button>
                        <Link className="btn btn-outline-secondary" to="/my-reservations">
                          {t('reservations.actions.viewMine')}
                        </Link>
                      </div>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PackageDetail
