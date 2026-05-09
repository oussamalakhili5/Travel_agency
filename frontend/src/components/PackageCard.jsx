import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function formatCurrency(value, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function PackageCard({ travelPackage }) {
  const { i18n, t } = useTranslation()
  const price = formatCurrency(travelPackage.price, i18n.language)

  return (
    <article className="hotel-card h-100">
      <div className="hotel-card__media">
        <img
          alt={travelPackage.title}
          className="hotel-card__image"
          loading="lazy"
          src={travelPackage.image_url || '/favicon.svg'}
        />
        <span className="badge hotel-card__badge rounded-pill">
          {t('packages.card.duration', { count: travelPackage.duration_days ?? 0 })}
        </span>
      </div>

      <div className="hotel-card__body">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <p className="hotel-card__city mb-1">{travelPackage.destination}</p>
            <h3 className="h5 fw-semibold mb-0">{travelPackage.title}</h3>
          </div>
          <span className="results-pill">{travelPackage.city}</span>
        </div>

        <p className="mb-4">{travelPackage.description}</p>

        <div className="d-flex justify-content-between align-items-end gap-3 mt-auto">
          <div>
            <small className="d-block text-uppercase text-muted mb-1">
              {t('packages.card.from')}
            </small>
            <div className="hotel-card__price">
              {price}
              <span> {t('packages.card.perTraveler')}</span>
            </div>
          </div>
          <Link className="btn btn-outline-brand" to={`/packages/${travelPackage.id}`}>
            {t('packages.card.viewDetails')}
          </Link>
        </div>
      </div>
    </article>
  )
}

export default PackageCard
