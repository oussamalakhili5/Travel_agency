import { useTranslation } from 'react-i18next'

function TransportCard({ transport }) {
  const { i18n, t } = useTranslation()
  const typeClass = `transport-card__type transport-card__type--${transport.type}`

  function getFormattedDate() {
    if (transport.dateLabelKey) {
      return t(`transports.data.dateLabels.${transport.dateLabelKey}`)
    }

    if (!transport.date) {
      return ''
    }

    return new Intl.DateTimeFormat(i18n.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(transport.date))
  }

  return (
    <article className="transport-card h-100">
      <div className="transport-card__top mb-4">
        <div>
          <span className={typeClass}>{t(`transports.types.${transport.type}`)}</span>
          <h3 className="h5 fw-semibold mt-3 mb-1">{transport.company}</h3>
          <p className="mb-0">{t(`transports.data.notes.${transport.noteKey}`)}</p>
        </div>
        <div className="text-lg-end">
          <small className="d-block text-uppercase text-muted mb-1">
            {t('transports.card.price')}
          </small>
          <div className="transport-card__price">{transport.price}</div>
        </div>
      </div>

      <div className="transport-card__route">
        <div className="row g-3">
          <div className="col-sm-4">
            <span>{t('transports.card.departure')}</span>
            <strong>{transport.departure}</strong>
          </div>
          <div className="col-sm-4">
            <span>{t('transports.card.arrival')}</span>
            <strong>{transport.arrival}</strong>
          </div>
          <div className="col-sm-4">
            <span>{t('transports.card.date')}</span>
            <strong>{getFormattedDate()}</strong>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="transport-card__meta">
          <span>{t(`transports.data.durations.${transport.durationKey}`)}</span>
          <span>{t(`transports.data.classes.${transport.serviceClassKey}`)}</span>
        </div>
        <button className="btn btn-brand" type="button">
          {t('transports.card.bookNow')}
        </button>
      </div>
    </article>
  )
}

export default TransportCard
