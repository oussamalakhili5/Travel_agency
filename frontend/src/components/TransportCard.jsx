import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function formatDuration(duration, t) {
  if (!duration) {
    return ''
  }

  const [hours = '0', minutes = '0'] = String(duration).split(':')

  return t('transports.card.durationValue', {
    hours: Number(hours),
    minutes: Number(minutes),
  })
}

function TransportCard({ transport }) {
  const { i18n, t } = useTranslation()
  const typeClass = `transport-card__type transport-card__type--${transport.type}`
  const price = new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(transport.price || 0))

  function getFormattedDate() {
    if (!transport.departure_time) {
      return ''
    }

    return new Intl.DateTimeFormat(i18n.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(transport.departure_time))
  }

  return (
    <article className="transport-card h-100">
      <div className="transport-card__top mb-4">
        <div>
          <span className={typeClass}>{t(`transports.types.${transport.type}`)}</span>
          <h3 className="h5 fw-semibold mt-3 mb-1">{transport.company}</h3>
          <p className="mb-0">{transport.notes || t('transports.card.noNotes')}</p>
        </div>
        <div className="text-lg-end">
          <small className="d-block text-uppercase text-muted mb-1">
            {t('transports.card.price')}
          </small>
          <div className="transport-card__price">{price}</div>
        </div>
      </div>

      <div className="transport-card__route">
        <div className="row g-3">
          <div className="col-sm-4">
            <span>{t('transports.card.departure')}</span>
            <strong>{transport.departure_city}</strong>
          </div>
          <div className="col-sm-4">
            <span>{t('transports.card.arrival')}</span>
            <strong>{transport.arrival_city}</strong>
          </div>
          <div className="col-sm-4">
            <span>{t('transports.card.date')}</span>
            <strong>{getFormattedDate()}</strong>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="transport-card__meta">
          <span>{formatDuration(transport.duration, t)}</span>
          <span>{t(`transports.serviceClasses.${transport.service_class}`)}</span>
        </div>
        <Link className="btn btn-brand" to={`/transports/${transport.id}`}>
          {t('transports.card.bookNow')}
        </Link>
      </div>
    </article>
  )
}

export default TransportCard
