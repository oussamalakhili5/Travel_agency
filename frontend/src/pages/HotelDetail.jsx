import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getHotelById } from '../services/catalogService'
import reservationService from '../services/reservationService'
import { useAuth } from '../hooks/useAuth'
import { mapReservationErrors } from '../utils/reservationErrors'

function HotelDetail() {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [reservationValues, setReservationValues] = useState({
    check_in_date: '',
    check_out_date: '',
    guests_count: 1,
    rooms_reserved: 1,
  })
  const [reservationErrors, setReservationErrors] = useState({})
  const [reservationSuccess, setReservationSuccess] = useState('')
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false)
  const price = hotel
    ? new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(Number(hotel.price_per_night || 0))
    : ''

  useEffect(() => {
    let isCancelled = false

    async function loadHotel() {
      setLoading(true)
      setError('')
      setNotFound(false)

      try {
        const data = await getHotelById(id)

        if (!isCancelled) {
          setHotel(data)
        }
      } catch (fetchError) {
        if (isCancelled) {
          return
        }

        setHotel(null)

        if (axios.isAxiosError(fetchError) && fetchError.response?.status === 404) {
          setNotFound(true)
        } else {
          setError(t('hotelDetail.status.error'))
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadHotel()

    return () => {
      isCancelled = true
    }
  }, [id, t])

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
    setReservationSuccess('')
  }

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
    setReservationSuccess('')
  }

  async function handleReservationSubmit(event) {
    event.preventDefault()

    setIsSubmittingReservation(true)
    setReservationErrors({})
    setReservationSuccess('')

    try {
      await reservationService.createReservation({
        reservation_type: 'hotel',
        hotel: hotel.id,
        check_in_date: reservationValues.check_in_date,
        check_out_date: reservationValues.check_out_date,
        guests_count: Number(reservationValues.guests_count),
        rooms_reserved: Number(reservationValues.rooms_reserved),
      })

      setReservationSuccess(t('reservations.success.created'))
      setReservationValues({
        check_in_date: '',
        check_out_date: '',
        guests_count: 1,
        rooms_reserved: 1,
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
            {t('hotelDetail.status.loading')}
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
            <span className="section-label">{t('hotelDetail.status.notFoundBadge')}</span>
            <h1 className="section-title section-title-sm">{t('hotelDetail.status.notFoundTitle')}</h1>
            <p className="mb-4">{t('hotelDetail.status.notFoundDescription')}</p>
            <Link className="btn btn-outline-brand px-4" to="/hotels">
              {t('hotelDetail.actions.back')}
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
          <Link className="btn btn-outline-brand" to="/hotels">
            {t('hotelDetail.actions.back')}
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="container">
      <section className="detail-shell">
        <div className="detail-toolbar">
          <Link className="btn btn-outline-brand" to="/hotels">
            {t('hotelDetail.actions.back')}
          </Link>
        </div>

        <div className="detail-hero surface-panel">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-6">
              <img
                alt={hotel.name}
                className="detail-hero__image"
                loading="lazy"
                src={hotel.image || '/favicon.svg'}
              />
            </div>

            <div className="col-lg-6">
              <div className="detail-hero__content h-100">
                <span className="section-label">{t('hotelDetail.badge')}</span>
                <h1 className="section-title section-title-sm mt-3">{hotel.name}</h1>
                <p className="detail-lead mb-4">{hotel.description}</p>

                <div className="d-flex flex-wrap gap-3 mb-4">
                  <span className="hotel-card__rating">{hotel.rating} / 5</span>
                  <span className="results-pill">
                    {t('hotelDetail.fields.availableRoomsValue', {
                      count: hotel.available_rooms ?? 0,
                    })}
                  </span>
                </div>

                <div className="detail-price mb-4">
                  {price}
                  <span> {t('hotelDetail.fields.priceSuffix')}</span>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span>{t('hotelDetail.fields.city')}</span>
                    <strong>{hotel.city}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('hotelDetail.fields.address')}</span>
                    <strong>{hotel.address}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('hotelDetail.fields.price')}</span>
                    <strong>{price}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('hotelDetail.fields.availableRooms')}</span>
                    <strong>
                      {t('hotelDetail.fields.availableRoomsValue', {
                        count: hotel.available_rooms ?? 0,
                      })}
                    </strong>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                  <button className="btn btn-brand" onClick={handleReserveClick} type="button">
                    {t('hotelDetail.actions.reserve')}
                  </button>
                  <Link className="btn btn-outline-secondary" to="/hotels">
                    {t('hotelDetail.actions.back')}
                  </Link>
                </div>

                {showReservationForm ? (
                  <div className="surface-panel reservation-panel mt-4">
                    <div className="mb-4">
                      <h2 className="h4 fw-semibold mb-2">{t('reservations.hotelForm.title')}</h2>
                      <p className="mb-0">{t('reservations.hotelForm.description')}</p>
                    </div>

                    {reservationSuccess ? (
                      <div className="alert alert-success auth-alert" role="status">
                        {reservationSuccess}{' '}
                        <Link className="fw-semibold" to="/my-reservations">
                          {t('reservations.actions.viewMine')}
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
                          <label className="form-label" htmlFor="check-in-date">
                            {t('reservations.hotelForm.checkIn')}
                          </label>
                          <input
                            className={`form-control ${reservationErrors.check_in_date ? 'is-invalid' : ''}`}
                            id="check-in-date"
                            name="check_in_date"
                            onChange={handleReservationChange}
                            type="date"
                            value={reservationValues.check_in_date}
                          />
                          {reservationErrors.check_in_date ? (
                            <div className="invalid-feedback d-block">{reservationErrors.check_in_date}</div>
                          ) : null}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="check-out-date">
                            {t('reservations.hotelForm.checkOut')}
                          </label>
                          <input
                            className={`form-control ${reservationErrors.check_out_date ? 'is-invalid' : ''}`}
                            id="check-out-date"
                            name="check_out_date"
                            onChange={handleReservationChange}
                            type="date"
                            value={reservationValues.check_out_date}
                          />
                          {reservationErrors.check_out_date ? (
                            <div className="invalid-feedback d-block">{reservationErrors.check_out_date}</div>
                          ) : null}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="guests-count">
                            {t('reservations.hotelForm.guests')}
                          </label>
                          <input
                            className={`form-control ${reservationErrors.guests_count ? 'is-invalid' : ''}`}
                            id="guests-count"
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

                        <div className="col-md-6">
                          <label className="form-label" htmlFor="rooms-reserved">
                            {t('reservations.hotelForm.rooms')}
                          </label>
                          <input
                            className={`form-control ${reservationErrors.rooms_reserved ? 'is-invalid' : ''}`}
                            id="rooms-reserved"
                            min="1"
                            name="rooms_reserved"
                            onChange={handleReservationChange}
                            type="number"
                            value={reservationValues.rooms_reserved}
                          />
                          {reservationErrors.rooms_reserved ? (
                            <div className="invalid-feedback d-block">{reservationErrors.rooms_reserved}</div>
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

export default HotelDetail
