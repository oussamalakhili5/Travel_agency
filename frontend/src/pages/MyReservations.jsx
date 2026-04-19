import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import reservationService from '../services/reservationService'
import SectionHeader from '../components/SectionHeader'
import { getReservationErrorMessage } from '../utils/reservationErrors'

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

function ReservationStatusBadge({ status, t }) {
  return (
    <span className={`reservation-status reservation-status--${status}`}>
      {t(`reservations.statuses.${status}`)}
    </span>
  )
}

function ReservationSummary({ reservation, locale, t }) {
  if (reservation.reservation_type === 'hotel' && reservation.hotel) {
    return (
      <>
        <h3 className="h5 fw-semibold mb-2">{reservation.hotel.name}</h3>
        <p className="mb-2">
          {reservation.hotel.city}
          {' · '}
          {reservation.hotel.address}
        </p>
        <div className="reservation-card__meta">
          <span>
            {t('reservations.fields.stay')}:{' '}
            {formatDate(reservation.check_in_date, locale)} - {formatDate(reservation.check_out_date, locale)}
          </span>
          <span>{t('reservations.fields.guests', { count: reservation.guests_count ?? 0 })}</span>
          <span>{t('reservations.fields.rooms', { count: reservation.rooms_reserved ?? 0 })}</span>
          <span>
            {t('reservations.fields.price')} {formatCurrency(reservation.hotel.price_per_night, locale)}
          </span>
        </div>
      </>
    )
  }

  if (reservation.reservation_type === 'transport' && reservation.transport) {
    return (
      <>
        <h3 className="h5 fw-semibold mb-2">
          {reservation.transport.departure_city} {t('reservations.routeSeparator')}{' '}
          {reservation.transport.arrival_city}
        </h3>
        <p className="mb-2">{reservation.transport.company}</p>
        <div className="reservation-card__meta">
          <span>{t(`transports.types.${reservation.transport.type}`)}</span>
          <span>{t('reservations.fields.passengers', { count: reservation.passengers_count ?? 0 })}</span>
          <span>{formatDate(reservation.transport.departure_time, locale)}</span>
          <span>
            {t('reservations.fields.price')} {formatCurrency(reservation.transport.price, locale)}
          </span>
        </div>
        {reservation.special_request ? (
          <p className="mb-0 mt-3">{reservation.special_request}</p>
        ) : null}
      </>
    )
  }

  return null
}

function MyReservations() {
  const { i18n, t } = useTranslation()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [cancelingReservationId, setCancelingReservationId] = useState(null)
  const hasReservations = reservations.length > 0

  useEffect(() => {
    let isCancelled = false

    async function loadReservations() {
      setLoading(true)
      setError('')
      setStatusMessage('')
      setCancelError('')

      try {
        const data = await reservationService.getMyReservations()

        if (!isCancelled) {
          setReservations(data)
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setReservations([])

          if (axios.isAxiosError(fetchError) && fetchError.code === 'ERR_NETWORK') {
            setError(t('reservations.errors.network'))
          } else {
            setError(t('reservations.errors.loadList'))
          }
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

  async function handleCancelReservation(reservation) {
    const shouldCancel = window.confirm(
      t('reservations.cancel.confirmation', {
        item: reservation.hotel?.name || reservation.transport?.company || t('reservations.types.transport'),
      }),
    )

    if (!shouldCancel) {
      return
    }

    setStatusMessage('')
    setCancelError('')
    setCancelingReservationId(reservation.id)

    try {
      const updatedReservation = await reservationService.cancelReservation(reservation.id)

      setReservations((currentReservations) =>
        currentReservations.map((currentReservation) =>
          currentReservation.id === reservation.id ? updatedReservation : currentReservation,
        ),
      )
      setStatusMessage(t('reservations.success.cancelled'))
    } catch (cancelRequestError) {
      setCancelError(getReservationErrorMessage(cancelRequestError, t))
    } finally {
      setCancelingReservationId(null)
    }
  }

  return (
    <div className="container">
      <section className="detail-shell">
        <SectionHeader
          eyebrow={t('reservations.page.eyebrow')}
          title={t('reservations.page.title')}
          description={t('reservations.page.description')}
        />

        {loading ? (
          <div className="alert alert-light border text-center mt-4" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            {t('reservations.page.loading')}
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-danger mt-4" role="alert">
            {error}
          </div>
        ) : null}

        {!error && statusMessage ? (
          <div className="alert alert-success mt-4" role="status">
            {statusMessage}
          </div>
        ) : null}

        {!error && cancelError ? (
          <div className="alert alert-danger mt-4" role="alert">
            {cancelError}
          </div>
        ) : null}

        {!loading && !error && !hasReservations ? (
          <div className="not-found-card surface-panel mt-4">
            <span className="section-label">{t('reservations.page.emptyBadge')}</span>
            <h2 className="section-title section-title-sm">{t('reservations.page.emptyTitle')}</h2>
            <p className="mb-4">{t('reservations.page.emptyDescription')}</p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Link className="btn btn-brand px-4" to="/hotels">
                {t('reservations.page.exploreHotels')}
              </Link>
              <Link className="btn btn-outline-brand px-4" to="/transports">
                {t('reservations.page.exploreTransports')}
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && !error && hasReservations ? (
          <div className="row g-4 mt-1">
            {reservations.map((reservation) => (
              <div className="col-12" key={reservation.id}>
                <article className="surface-panel reservation-card">
                  <div className="reservation-card__top">
                    <div>
                      <span className="results-pill">
                        {t(`reservations.types.${reservation.reservation_type}`)}
                      </span>
                      <p className="auth-helper-text mt-3 mb-0">
                        {t('reservations.fields.reservedAt')} {formatDate(reservation.reserved_at, i18n.language)}
                      </p>
                    </div>
                    <ReservationStatusBadge status={reservation.status} t={t} />
                  </div>

                  <div className="mt-4">
                    <ReservationSummary reservation={reservation} locale={i18n.language} t={t} />
                  </div>

                  {reservation.status !== 'cancelled' ? (
                    <div className="d-flex justify-content-end mt-4">
                      <button
                        className="btn btn-outline-danger"
                        disabled={cancelingReservationId === reservation.id}
                        onClick={() => handleCancelReservation(reservation)}
                        type="button"
                      >
                        {cancelingReservationId === reservation.id
                          ? t('reservations.cancel.cancelling')
                          : t('reservations.cancel.button')}
                      </button>
                    </div>
                  ) : null}
                </article>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default MyReservations
