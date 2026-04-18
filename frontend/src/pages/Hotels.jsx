import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FilterPanel from '../components/FilterPanel'
import HotelCard from '../components/HotelCard'
import SectionHeader from '../components/SectionHeader'
import { getHotels } from '../services/catalogService'

const INITIAL_HOTEL_FILTERS = {
  city: '',
  max_price: '',
}

function Hotels() {
  const { t } = useTranslation()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draftFilters, setDraftFilters] = useState(INITIAL_HOTEL_FILTERS)
  const [filters, setFilters] = useState(INITIAL_HOTEL_FILTERS)

  useEffect(() => {
    let isCancelled = false

    async function loadHotels() {
      setLoading(true)
      setError('')

      try {
        const data = await getHotels(filters)

        if (!isCancelled) {
          setHotels(data)
        }
      } catch {
        if (!isCancelled) {
          setError(t('hotels.status.error'))
          setHotels([])
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadHotels()

    return () => {
      isCancelled = true
    }
  }, [filters, t])

  function handleFilterChange(event) {
    const { name, value } = event.target

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function handleFilterSubmit(event) {
    event.preventDefault()

    setFilters({
      city: draftFilters.city.trim(),
      max_price: draftFilters.max_price,
    })
  }

  return (
    <div className="container">
      <section className="mb-4">
        <SectionHeader
          eyebrow={t('hotels.eyebrow')}
          title={t('hotels.pageTitle')}
          description={t('hotels.intro')}
        />
      </section>

      <form onSubmit={handleFilterSubmit}>
        <FilterPanel
          description={t('hotels.filters.description')}
          title={t('hotels.filters.title')}
        >
          <div className="col-md-6 col-xl-4">
            <label className="form-label" htmlFor="hotel-destination">
              {t('hotels.filters.destination')}
            </label>
            <input
              className="form-control"
              id="hotel-destination"
              name="city"
              onChange={handleFilterChange}
              placeholder={t('hotels.filters.destinationPlaceholder')}
              type="text"
              value={draftFilters.city}
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="budget">
              {t('hotels.filters.budget')}
            </label>
            <select
              className="form-select"
              id="budget"
              name="max_price"
              onChange={handleFilterChange}
              value={draftFilters.max_price}
            >
              <option value="">{t('hotels.filters.budgetOptions.any')}</option>
              <option value="150">{t('hotels.filters.budgetOptions.rangeOne')}</option>
              <option value="250">{t('hotels.filters.budgetOptions.rangeTwo')}</option>
              <option value="500">{t('hotels.filters.budgetOptions.rangeThree')}</option>
            </select>
          </div>

          <div className="col-xl-3 d-grid">
            <button className="btn btn-dark btn-lg mt-xl-4" disabled={loading} type="submit">
              {t('hotels.filters.search')}
            </button>
          </div>
        </FilterPanel>
      </form>

      <div className="listing-summary">
        <p>{t('hotels.summary', { count: hotels.length })}</p>
        <span className="results-pill">{t('hotels.summaryBadge')}</span>
      </div>

      {loading ? (
        <div className="alert alert-light border text-center" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          {t('hotels.status.loading')}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && hotels.length === 0 ? (
        <div className="alert alert-secondary" role="status">
          {t('hotels.status.empty')}
        </div>
      ) : null}

      {!loading && !error && hotels.length > 0 ? (
        <section>
          <div className="row g-4">
            {hotels.map((hotel) => (
              <div className="col-md-6 col-xl-4" key={hotel.id}>
                <HotelCard hotel={hotel} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default Hotels
