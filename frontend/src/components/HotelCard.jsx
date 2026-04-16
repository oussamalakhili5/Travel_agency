import { useTranslation } from 'react-i18next'

function HotelCard({ hotel }) {
  const { t } = useTranslation()

  return (
    <article className="hotel-card h-100">
      <div className="hotel-card__media">
        <img
          alt={hotel.name}
          className="hotel-card__image"
          loading="lazy"
          src={hotel.image}
        />
        <span className="badge hotel-card__badge rounded-pill">
          {t(`hotels.data.tags.${hotel.tagKey}`)}
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

        <p className="mb-4">{t(`hotels.data.descriptions.${hotel.descriptionKey}`)}</p>

        <div className="d-flex justify-content-between align-items-end gap-3 mt-auto">
          <div>
            <small className="d-block text-uppercase text-muted mb-1">
              {t('hotels.card.from')}
            </small>
            <div className="hotel-card__price">
              {hotel.pricePerNight}
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
