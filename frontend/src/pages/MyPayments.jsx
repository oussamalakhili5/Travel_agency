import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import paymentService from '../services/paymentService'
import SectionHeader from '../components/SectionHeader'

function formatCurrency(value, locale, currency = 'USD') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
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

function getPaymentTitle(payment, t) {
  const reservation = payment.reservation

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

function MyPayments() {
  const { i18n, t } = useTranslation()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadPayments() {
      setLoading(true)
      setError('')

      try {
        const data = await paymentService.getMyPayments()

        if (!isCancelled) {
          setPayments(data)
        }
      } catch (loadError) {
        if (!isCancelled) {
          setPayments([])
          setError(
            axios.isAxiosError(loadError) && loadError.code === 'ERR_NETWORK'
              ? t('payments.errors.network')
              : t('payments.errors.loadList'),
          )
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadPayments()

    return () => {
      isCancelled = true
    }
  }, [t])

  return (
    <div className="container">
      <section className="detail-shell">
        <SectionHeader
          eyebrow={t('payments.list.eyebrow')}
          title={t('payments.list.title')}
          description={t('payments.list.description')}
        />

        {loading ? (
          <div className="alert alert-light border text-center mt-4" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            {t('payments.list.loading')}
          </div>
        ) : null}

        {error ? (
          <div className="alert alert-danger mt-4" role="alert">
            {error}
          </div>
        ) : null}

        {!loading && !error && payments.length === 0 ? (
          <div className="not-found-card surface-panel mt-4">
            <span className="section-label">{t('payments.list.emptyBadge')}</span>
            <h2 className="section-title section-title-sm">{t('payments.list.emptyTitle')}</h2>
            <p className="mb-4">{t('payments.list.emptyDescription')}</p>
            <Link className="btn btn-brand px-4" to="/my-reservations">
              {t('payments.actions.backToReservations')}
            </Link>
          </div>
        ) : null}

        {!loading && !error && payments.length > 0 ? (
          <div className="row g-4 mt-1">
            {payments.map((payment) => (
              <div className="col-12" key={payment.id}>
                <article className="surface-panel reservation-card">
                  <div className="reservation-card__top">
                    <div>
                      <span className="results-pill">{payment.reference_id}</span>
                      <h2 className="h5 fw-semibold mt-3 mb-1">{getPaymentTitle(payment, t)}</h2>
                      <p className="auth-helper-text mb-0">
                        {t('payments.fields.createdAt')} {formatDate(payment.created_at, i18n.language)}
                      </p>
                    </div>
                    <span className={`reservation-status reservation-status--${payment.status}`}>
                      {t(`payments.statuses.${payment.status}`)}
                    </span>
                  </div>

                  <div className="reservation-card__meta mt-4">
                    <span>{formatCurrency(payment.amount, i18n.language, payment.currency)}</span>
                    <span>{t(`payments.methods.${payment.method}`)}</span>
                    <span>{t(`reservations.types.${payment.reservation?.reservation_type}`)}</span>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <Link className="btn btn-outline-brand" to={`/payments/reservations/${payment.reservation?.id}`}>
                      {t('payments.actions.openPayment')}
                    </Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default MyPayments
