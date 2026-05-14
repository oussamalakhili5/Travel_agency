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

const EMPTY_CARD_FORM = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
}

const RETRYABLE_PAYMENT_STATUSES = ['failed', 'cancelled']
const MOCK_FAILURE_REASON = 'Mock payment failure selected by the user.'

function formatCardNumberInput(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiryInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function getApiErrorMessage(requestError, fallbackMessage) {
  if (!axios.isAxiosError(requestError)) {
    return fallbackMessage
  }

  const responseData = requestError.response?.data

  if (typeof responseData === 'string') {
    return responseData
  }

  if (!responseData || typeof responseData !== 'object') {
    return fallbackMessage
  }

  if (typeof responseData.detail === 'string') {
    return responseData.detail
  }

  if (Array.isArray(responseData.non_field_errors)) {
    return responseData.non_field_errors.join(' ')
  }

  for (const value of Object.values(responseData)) {
    if (typeof value === 'string') {
      return value
    }

    if (Array.isArray(value)) {
      const fieldMessage = value.filter((item) => typeof item === 'string').join(' ')

      if (fieldMessage) {
        return fieldMessage
      }
    }
  }

  return fallbackMessage
}

function validateCardForm(cardForm, t) {
  const validationErrors = {}
  const cardNumberDigits = cardForm.cardNumber.replace(/\s+/g, '')
  const expiryValue = cardForm.expiry.trim()
  const cvcValue = cardForm.cvc.trim()

  if (!cardForm.cardholderName.trim()) {
    validationErrors.cardholderName = t('payments.validation.cardholderRequired')
  }

  if (!cardNumberDigits) {
    validationErrors.cardNumber = t('payments.validation.cardNumberRequired')
  } else if (!/^\d{16}$/.test(cardNumberDigits)) {
    validationErrors.cardNumber = t('payments.validation.cardNumberInvalid')
  }

  if (!expiryValue) {
    validationErrors.expiry = t('payments.validation.expiryRequired')
  } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryValue)) {
    validationErrors.expiry = t('payments.validation.expiryInvalid')
  }

  if (!cvcValue) {
    validationErrors.cvc = t('payments.validation.cvcRequired')
  } else if (!/^\d{3,4}$/.test(cvcValue)) {
    validationErrors.cvc = t('payments.validation.cvcInvalid')
  }

  return validationErrors
}

function PaymentPage() {
  const { i18n, t } = useTranslation()
  const { reservationId } = useParams()
  const [reservation, setReservation] = useState(null)
  const [payment, setPayment] = useState(null)
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM)
  const [cardErrors, setCardErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const canCreatePayment = !payment || RETRYABLE_PAYMENT_STATUSES.includes(payment.status)
  const canResolvePayment = payment?.status === 'pending'
  const paymentIsPaid = payment?.status === 'paid' || reservation?.payment_status === 'paid'
  const canUseCardForm =
    reservation &&
    reservation.status !== 'cancelled' &&
    reservation.payment_status !== 'paid' &&
    (canCreatePayment || canResolvePayment)
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

  function clearCardError(fieldName) {
    setCardErrors((currentErrors) => {
      if (!currentErrors[fieldName]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[fieldName]
      return nextErrors
    })
  }

  function updateCardFormValue(fieldName, value) {
    setCardForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
    clearCardError(fieldName)
  }

  async function getPaymentReadyForAction() {
    if (payment && !RETRYABLE_PAYMENT_STATUSES.includes(payment.status)) {
      return payment
    }

    const createdPayment = await paymentService.initiatePayment({
      reservation: reservation.id,
      method: 'mock_card',
    })

    setPayment(createdPayment)
    return createdPayment
  }

  async function handleCardPaymentSubmit(event) {
    event.preventDefault()

    const validationErrors = validateCardForm(cardForm, t)
    setCardErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setActionLoading(true)
    setError('')
    setStatusMessage('')

    try {
      const paymentToConfirm = await getPaymentReadyForAction()
      const updatedPayment = await paymentService.confirmPayment(paymentToConfirm.id)
      const updatedReservation = await reservationService.getReservationById(reservation.id)

      setPayment(updatedPayment)
      setReservation(updatedReservation)
      setCardForm(EMPTY_CARD_FORM)
      setCardErrors({})
      setStatusMessage(t('payments.messages.success'))
    } catch (paymentError) {
      setError(getApiErrorMessage(paymentError, t('payments.errors.process')))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleFailPayment() {
    setActionLoading(true)
    setError('')
    setStatusMessage('')

    try {
      const paymentToFail = await getPaymentReadyForAction()
      const updatedPayment = await paymentService.failPayment(
        paymentToFail.id,
        MOCK_FAILURE_REASON,
      )
      const updatedReservation = await reservationService.getReservationById(reservation.id)

      setPayment(updatedPayment)
      setReservation(updatedReservation)
      setStatusMessage(t('payments.messages.failed'))
    } catch (paymentError) {
      setError(getApiErrorMessage(paymentError, t('payments.errors.fail')))
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
          <div
            className={`alert ${payment?.status === 'failed' ? 'alert-warning' : 'alert-success'} mt-4`}
            role="status"
          >
            {statusMessage}
          </div>
        ) : null}

        {!loading && reservation ? (
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

            {paymentIsPaid ? (
              <div className="payment-success mt-4" role="status">
                <span className="payment-success__mark" aria-hidden="true">
                  OK
                </span>
                <div>
                  <h3 className="h5 fw-semibold mb-1">{t('payments.form.successTitle')}</h3>
                  <p className="mb-0">{t('payments.form.successDescription')}</p>
                </div>
              </div>
            ) : null}

            {canUseCardForm ? (
              <form className="payment-form mt-4" noValidate onSubmit={handleCardPaymentSubmit}>
                <div className="payment-form__header">
                  <div>
                    <span className="section-label">{t('payments.form.badge')}</span>
                    <h3 className="h5 fw-semibold mt-2 mb-1">{t('payments.form.title')}</h3>
                    <p className="auth-helper-text mb-0">{t('payments.form.description')}</p>
                  </div>
                  <div className="payment-brand-strip" aria-label={t('payments.form.acceptedCards')}>
                    <span>VISA</span>
                    <span>MC</span>
                    <span>AMEX</span>
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-12">
                    <label className="form-label" htmlFor="cardholderName">
                      {t('payments.form.cardholderName')}
                    </label>
                    <input
                      autoComplete="cc-name"
                      className={`form-control ${cardErrors.cardholderName ? 'is-invalid' : ''}`}
                      id="cardholderName"
                      onChange={(event) => updateCardFormValue('cardholderName', event.target.value)}
                      placeholder={t('payments.form.cardholderPlaceholder')}
                      type="text"
                      value={cardForm.cardholderName}
                    />
                    {cardErrors.cardholderName ? (
                      <div className="invalid-feedback">{cardErrors.cardholderName}</div>
                    ) : null}
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="cardNumber">
                      {t('payments.form.cardNumber')}
                    </label>
                    <input
                      autoComplete="cc-number"
                      className={`form-control ${cardErrors.cardNumber ? 'is-invalid' : ''}`}
                      id="cardNumber"
                      inputMode="numeric"
                      onChange={(event) =>
                        updateCardFormValue('cardNumber', formatCardNumberInput(event.target.value))
                      }
                      placeholder={t('payments.form.cardNumberPlaceholder')}
                      type="text"
                      value={cardForm.cardNumber}
                    />
                    {cardErrors.cardNumber ? (
                      <div className="invalid-feedback">{cardErrors.cardNumber}</div>
                    ) : null}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="expiry">
                      {t('payments.form.expiry')}
                    </label>
                    <input
                      autoComplete="cc-exp"
                      className={`form-control ${cardErrors.expiry ? 'is-invalid' : ''}`}
                      id="expiry"
                      inputMode="numeric"
                      onChange={(event) => updateCardFormValue('expiry', formatExpiryInput(event.target.value))}
                      placeholder={t('payments.form.expiryPlaceholder')}
                      type="text"
                      value={cardForm.expiry}
                    />
                    {cardErrors.expiry ? <div className="invalid-feedback">{cardErrors.expiry}</div> : null}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="cvc">
                      {t('payments.form.cvc')}
                    </label>
                    <input
                      autoComplete="cc-csc"
                      className={`form-control ${cardErrors.cvc ? 'is-invalid' : ''}`}
                      id="cvc"
                      inputMode="numeric"
                      onChange={(event) => updateCardFormValue('cvc', event.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder={t('payments.form.cvcPlaceholder')}
                      type="text"
                      value={cardForm.cvc}
                    />
                    {cardErrors.cvc ? <div className="invalid-feedback">{cardErrors.cvc}</div> : null}
                  </div>
                </div>

                <div className="payment-form__demo-note mt-3">
                  <span>DEMO</span>
                  <p className="mb-0">{t('payments.form.demoNotice')}</p>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button className="btn btn-brand payment-form__submit" disabled={actionLoading} type="submit">
                    {actionLoading ? t('payments.actions.processing') : t('payments.actions.paySecurely')}
                  </button>
                  <button
                    className="btn btn-link payment-form__fail-link"
                    disabled={actionLoading}
                    onClick={handleFailPayment}
                    type="button"
                  >
                    {t('payments.actions.simulateFailureSecondary')}
                  </button>
                </div>
              </form>
            ) : null}

            <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
              <Link className="btn btn-outline-secondary" to="/my-reservations">
                {t('payments.actions.backToReservations')}
              </Link>
              <Link className="btn btn-outline-brand" to="/payments">
                {t('payments.actions.myPayments')}
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default PaymentPage
