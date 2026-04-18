import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getHotelById } from '../services/catalogService'

function HotelDetail() {
  const { i18n, t } = useTranslation()
  const { id } = useParams()
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const price = hotel
    ? new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(Number(hotel.price_per_night || 0))
    : ''

  useEffect(() => {
    let isCancelled = false

    async function loadHotel() {
      setLoading(true)
      setError('')
      setNotFound(false)

      try {
        const data = await getHotelById(id)

        if (!isCancelled) {
          setHotel(data)
        }
      } catch (fetchError) {
        if (isCancelled) {
          return
        }

        setHotel(null)

        if (axios.isAxiosError(fetchError) && fetchError.response?.status === 404) {
          setNotFound(true)
        } else {
          setError(t('hotelDetail.status.error'))
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadHotel()

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
            {t('hotelDetail.status.loading')}
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
            <span className="section-label">{t('hotelDetail.status.notFoundBadge')}</span>
            <h1 className="section-title section-title-sm">{t('hotelDetail.status.notFoundTitle')}</h1>
            <p className="mb-4">{t('hotelDetail.status.notFoundDescription')}</p>
            <Link className="btn btn-outline-brand px-4" to="/hotels">
              {t('hotelDetail.actions.back')}
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
          <Link className="btn btn-outline-brand" to="/hotels">
            {t('hotelDetail.actions.back')}
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="container">
      <section className="detail-shell">
        <div className="detail-toolbar">
          <Link className="btn btn-outline-brand" to="/hotels">
            {t('hotelDetail.actions.back')}
          </Link>
        </div>

        <div className="detail-hero surface-panel">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-6">
              <img
                alt={hotel.name}
                className="detail-hero__image"
                loading="lazy"
                src={hotel.image || '/favicon.svg'}
              />
            </div>

            <div className="col-lg-6">
              <div className="detail-hero__content h-100">
                <span className="section-label">{t('hotelDetail.badge')}</span>
                <h1 className="section-title section-title-sm mt-3">{hotel.name}</h1>
                <p className="detail-lead mb-4">{hotel.description}</p>

                <div className="d-flex flex-wrap gap-3 mb-4">
                  <span className="hotel-card__rating">{hotel.rating} / 5</span>
                  <span className="results-pill">
                    {t('hotelDetail.fields.availableRoomsValue', {
                      count: hotel.available_rooms ?? 0,
                    })}
                  </span>
                </div>

                <div className="detail-price mb-4">
                  {price}
                  <span> {t('hotelDetail.fields.priceSuffix')}</span>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span>{t('hotelDetail.fields.city')}</span>
                    <strong>{hotel.city}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('hotelDetail.fields.address')}</span>
                    <strong>{hotel.address}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('hotelDetail.fields.price')}</span>
                    <strong>{price}</strong>
                  </div>
                  <div className="detail-item">
                    <span>{t('hotelDetail.fields.availableRooms')}</span>
                    <strong>
                      {t('hotelDetail.fields.availableRoomsValue', {
                        count: hotel.available_rooms ?? 0,
                      })}
                    </strong>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                  <button className="btn btn-brand" type="button">
                    {t('hotelDetail.actions.reserve')}
                  </button>
                  <Link className="btn btn-outline-secondary" to="/hotels">
                    {t('hotelDetail.actions.back')}
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

export default HotelDetail
