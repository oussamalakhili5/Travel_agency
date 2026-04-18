import { useTranslation } from 'react-i18next'

function HotelCard({ hotel }) {
  const { i18n, t } = useTranslation()
  const price = new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(hotel.price_per_night || 0))

  return (
    <article className="hotel-card h-100">
      <div className="hotel-card__media">
        <img
          alt={hotel.name}
          className="hotel-card__image"
          loading="lazy"
          src={hotel.image || '/favicon.svg'}
        />
        <span className="badge hotel-card__badge rounded-pill">
          {t('hotels.card.availableRooms', { count: hotel.available_rooms ?? 0 })}
        </span>
      </div>

      <div className="hotel-card__body">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <p className="hotel-card__city mb-1">{hotel.city}</p>
            <h3 className="h5 fw-semibold mb-0">{hotel.name}</h3>
          </div>
          <span className="hotel-card__rating">{hotel.rating} / 5</span>
        </div>

        <p className="mb-4">{hotel.description}</p>

        <div className="d-flex justify-content-between align-items-end gap-3 mt-auto">
          <div>
            <small className="d-block text-uppercase text-muted mb-1">
              {t('hotels.card.from')}
            </small>
            <div className="hotel-card__price">
              {price}
              <span> {t('hotels.card.perNight')}</span>
            </div>
          </div>
          <button className="btn btn-outline-brand" type="button">
            {t('hotels.card.viewDetails')}
          </button>
        </div>
      </div>
    </article>
  )
}

export default HotelCard
