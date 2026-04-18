import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getTransportById } from '../services/catalogService'

function formatDateTime(value, locale) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDuration(value, t) {
  if (!value) {
    return t('transportDetail.fields.durationFallback')
  }

  const [hours = '0', minutes = '0'] = String(value).split(':')

  return t('transportDetail.fields.durationValue', {
    hours: Number(hours),
    minutes: Number(minutes),
  })
}

function TransportDetail() {
  const { i18n, t } = useTranslation()
  const { id } = useParams()
  const [transport, setTransport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const price = transport
    ? new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(Number(transport.price || 0))
    : ''

  useEffect(() => {
    let isCancelled = false

    async function loadTransport() {
      setLoading(true)
      setError('')
      setNotFound(false)

      try {
        const data = await getTransportById(id)

        if (!isCancelled) {
          setTransport(data)
        }
      } catch (fetchError) {
        if (isCancelled) {
          return
        }

        setTransport(null)

        if (axios.isAxiosError(fetchError) && fetchError.response?.status === 404) {
          setNotFound(true)
        } else {
          setError(t('transportDetail.status.error'))
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadTransport()

    return () => {
      isCancelled = true
    }
  }, [id, t])

  if (loading) {
    return (
      <div className="container">
        <section className="detail-shell">
          <div className="alert alert-light border text-center" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            {t('transportDetail.status.loading')}
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
            <span className="section-label">{t('transportDetail.status.notFoundBadge')}</span>
            <h1 className="section-title section-title-sm">{t('transportDetail.status.notFoundTitle')}</h1>
            <p className="mb-4">{t('transportDetail.status.notFoundDescription')}</p>
            <Link className="btn btn-outline-brand px-4" to="/transports">
              {t('transportDetail.actions.back')}
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
          <Link className="btn btn-outline-brand" to="/transports">
            {t('transportDetail.actions.back')}
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="container">
      <section className="detail-shell">
        <div className="detail-toolbar">
          <Link className="btn btn-outline-brand" to="/transports">
            {t('transportDetail.actions.back')}
          </Link>
        </div>

        <div className="detail-hero surface-panel">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-5">
              <aside className="auth-aside detail-aside h-100">
                <span className="hero-kicker">{t('transportDetail.badge')}</span>
                <h1 className="section-title text-white mt-4">
                  {transport.departure_city} {t('transportDetail.routeSeparator')} {transport.arrival_city}
                </h1>
                <p className="mb-4">{transport.notes || t('transportDetail.fields.noNotes')}</p>

                <ul className="auth-checklist">
                  <li>{t('transportDetail.fields.type')}: {t(`transports.types.${transport.type}`)}</li>
                  <li>{t('transportDetail.fields.company')}: {transport.company}</li>
                  <li>{t('transportDetail.fields.serviceClass')}: {t(`transports.serviceClasses.${transport.service_class}`)}</li>
                </ul>
              </aside>
            </div>

            <div className="col-lg-7">
              <div className="detail-hero__content h-100">
                <div className="transport-card__top mb-4">
                  <div>
                    <span className={`transport-card__type transport-card__type--${transport.type}`}>
                      {t(`transports.types.${transport.type}`)}
                    </span>
                    <h2 className="section-title section-title-sm mt-3 mb-2">{transport.company}</h2>
                    <p className="detail-lead mb-0">{t('transportDetail.summary')}</p>
                  </div>
                  <div className="text-lg-end">
                    <small className="d-block text-uppercase text-muted mb-1">
                      {t('transportDetail.fields.price')}
                    </small>
                    <div className="detail-price">
                      {price}
                    </div>
                  </div>
                </div>

                <div className="transport-card__route mb-4">
                  <div className="row g-3">
                    <div className="col-sm-4">
                      <span>{t('transportDetail.fields.departureCity')}</span>
                      <strong>{transport.departure_city}</strong>
                    </div>
                    <div className="col-sm-4">
                      <span>{t('transportDetail.fields.arrivalCity')}</span>
                      <strong>{transport.arrival_city}</strong>
                    </div>
                    <div className="col-sm-4">
                      <span>{t('transportDetail.fields.duration')}</span>
                      <strong>{formatDuration(transport.duration, t)}</strong>
                    </div>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span>{t('transportDetail.fields.departureTime')}</span>
                    <strong>{formatDateTime(transport.departure_time, i18n.language)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('transportDetail.fields.arrivalTime')}</span>
                    <strong>{formatDateTime(transport.arrival_time, i18n.language)}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('transportDetail.fields.availableSeats')}</span>
                    <strong>
                      {t('transportDetail.fields.availableSeatsValue', {
                        count: transport.available_seats ?? 0,
                      })}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('transportDetail.fields.serviceClass')}</span>
                    <strong>{t(`transports.serviceClasses.${transport.service_class}`)}</strong>
                  </div>
                  <div className="detail-item detail-item--full">
                    <span>{t('transportDetail.fields.notes')}</span>
                    <strong>{transport.notes || t('transportDetail.fields.noNotes')}</strong>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                  <button className="btn btn-brand" type="button">
                    {t('transportDetail.actions.reserve')}
                  </button>
                  <Link className="btn btn-outline-secondary" to="/transports">
                    {t('transportDetail.actions.back')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TransportDetail
