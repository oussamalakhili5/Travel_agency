import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import paymentService from '../services/paymentService'
import reservationService from '../services/reservationService'
import SectionHeader from '../components/SectionHeader'

function formatCurrency(value, locale, currency = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function getReservationTitle(reservation, t) {
  if (reservation?.hotel) {
    return reservation.hotel.name
  }

  if (reservation?.transport) {
    return `${reservation.transport.departure_city} ${t('reservations.routeSeparator')} ${reservation.transport.arrival_city}`
  }

  if (reservation?.package) {
    return reservation.package.title
  }

  return t('payments.reservationFallback')
}

function PaymentPage() {
  const { i18n, t } = useTranslation()
  const { reservationId } = useParams()
  const [reservation, setReservation] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const canCreatePayment = !payment || ['failed', 'cancelled'].includes(payment.status)
  const canResolvePayment = payment?.status === 'pending'
  const estimatedAmount = useMemo(() => {
    if (!reservation) {
      return 0
    }

    if (reservation.hotel) {
      const checkIn = reservation.check_in_date ? new Date(reservation.check_in_date) : null
      const checkOut = reservation.check_out_date ? new Date(reservation.check_out_date) : null
      const nights = checkIn && checkOut ? Math.max((checkOut - checkIn) / 86400000, 1) : 1
      return Number(reservation.hotel.price_per_night || 0) * nights * Number(reservation.rooms_reserved || 1)
    }

    if (reservation.transport) {
      return Number(reservation.transport.price || 0) * Number(reservation.passengers_count || 1)
    }

    if (reservation.package) {
      return Number(reservation.package.price || 0) * Number(reservation.guests_count || 1)
    }

    return 0
  }, [reservation])

  useEffect(() => {
    let isCancelled = false

    async function loadPaymentContext() {
      setLoading(true)
      setError('')
      setStatusMessage('')

      try {
        const [reservationData, paymentsData] = await Promise.all([
          reservationService.getReservationById(reservationId),
          paymentService.getMyPayments(),
        ])

        if (isCancelled) {
          return
        }

        setReservation(reservationData)
        setPayment(
          paymentsData.find(
            (candidate) => String(candidate.reservation?.id) === String(reservationId),
          ) ?? null,
        )
      } catch (loadError) {
        if (!isCancelled) {
          setReservation(null)
          setPayment(null)
          setError(
            axios.isAxiosError(loadError) && loadError.response?.status === 404
              ? t('payments.errors.notFound')
              : t('payments.errors.load'),
          )
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadPaymentContext()

    return () => {
      isCancelled = true
    }
  }, [reservationId, t])

  async function handleInitiatePayment() {
    setActionLoading(true)
    setError('')
    setStatusMessage('')

    try {
      const createdPayment = await paymentService.initiatePayment({
        reservation: reservation.id,
        method: 'mock_card',
      })

      setPayment(createdPayment)
      setStatusMessage(t('payments.messages.pending'))
    } catch {
      setError(t('payments.errors.create'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConfirmPayment() {
    setActionLoading(true)
    setError('')
    setStatusMessage('')

    try {
      const updatedPayment = await paymentService.confirmPayment(payment.id)
      const updatedReservation = await reservationService.getReservationById(reservation.id)

      setPayment(updatedPayment)
      setReservation(updatedReservation)
      setStatusMessage(t('payments.messages.success'))
    } catch {
      setError(t('payments.errors.confirm'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleFailPayment() {
    setActionLoading(true)
    setError('')
    setStatusMessage('')

    try {
      const updatedPayment = await paymentService.failPayment(
        payment.id,
        'Mock payment failure selected by the user.',
      )
      const updatedReservation = await reservationService.getReservationById(reservation.id)

      setPayment(updatedPayment)
      setReservation(updatedReservation)
      setStatusMessage(t('payments.messages.failed'))
    } catch {
      setError(t('payments.errors.fail'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="container">
      <section className="detail-shell">
        <SectionHeader
          eyebrow={t('payments.page.eyebrow')}
          title={t('payments.page.title')}
          description={t('payments.page.description')}
        />

        {loading ? (
          <div className="alert alert-light border text-center mt-4" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            {t('payments.page.loading')}
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

        {!loading && !error && reservation ? (
          <div className="surface-panel reservation-card mt-4">
            <div className="reservation-card__top">
              <div>
                <span className="results-pill">{t(`reservations.types.${reservation.reservation_type}`)}</span>
                <h2 className="h4 fw-semibold mt-3 mb-1">{getReservationTitle(reservation, t)}</h2>
                <p className="mb-0">{t('payments.page.mockNotice')}</p>
              </div>
              <span className={`reservation-status reservation-status--${payment?.status || 'pending'}`}>
                {payment ? t(`payments.statuses.${payment.status}`) : t('payments.statuses.notStarted')}
              </span>
            </div>

            <div className="detail-grid mt-4">
              <div className="detail-item">
                <span>{t('payments.fields.amount')}</span>
                <strong>{formatCurrency(payment?.amount ?? estimatedAmount, i18n.language, payment?.currency || 'USD')}</strong>
              </div>
              <div className="detail-item">
                <span>{t('payments.fields.reservationStatus')}</span>
                <strong>{t(`reservations.statuses.${reservation.status}`)}</strong>
              </div>
              <div className="detail-item">
                <span>{t('payments.fields.paymentStatus')}</span>
                <strong>{t(`reservations.paymentStatuses.${reservation.payment_status}`)}</strong>
              </div>
              <div className="detail-item">
                <span>{t('payments.fields.reference')}</span>
                <strong>{payment?.reference_id || t('payments.fields.referencePending')}</strong>
              </div>
            </div>

            {payment?.failure_reason ? (
              <div className="alert alert-warning mt-4" role="status">
                {payment.failure_reason}
              </div>
            ) : null}

            <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
              {canCreatePayment ? (
                <button
                  className="btn btn-brand"
                  disabled={actionLoading || reservation.payment_status === 'paid'}
                  onClick={handleInitiatePayment}
                  type="button"
                >
                  {actionLoading ? t('payments.actions.processing') : t('payments.actions.startMock')}
                </button>
              ) : null}

              {canResolvePayment ? (
                <>
                  <button
                    className="btn btn-brand"
                    disabled={actionLoading}
                    onClick={handleConfirmPayment}
                    type="button"
                  >
                    {actionLoading ? t('payments.actions.processing') : t('payments.actions.simulateSuccess')}
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    disabled={actionLoading}
                    onClick={handleFailPayment}
                    type="button"
                  >
                    {t('payments.actions.simulateFailure')}
                  </button>
                </>
              ) : null}

              <Link className="btn btn-outline-secondary" to="/my-reservations">
                {t('payments.actions.backToReservations')}
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default PaymentPage
