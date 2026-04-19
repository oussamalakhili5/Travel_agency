import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import FilterPanel from '../components/FilterPanel'
import SectionHeader from '../components/SectionHeader'
import TransportCard from '../components/TransportCard'
import { getTransports } from '../services/catalogService'

const INITIAL_TRANSPORT_FILTERS = {
  departure_city: '',
  arrival_city: '',
  type: '',
}

function getTransportFiltersFromSearch(search) {
  const params = new URLSearchParams(search)

  return {
    departure_city: params.get('departure_city')?.trim() ?? '',
    arrival_city: params.get('arrival_city')?.trim() ?? '',
    type: params.get('type')?.trim() ?? '',
  }
}

function Transports() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [transports, setTransports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draftFilters, setDraftFilters] = useState(INITIAL_TRANSPORT_FILTERS)
  const filters = useMemo(
    () => getTransportFiltersFromSearch(location.search),
    [location.search],
  )

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  useEffect(() => {
    let isCancelled = false

    async function loadTransports() {
      setLoading(true)
      setError('')

      try {
        const data = await getTransports(filters)

        if (!isCancelled) {
          setTransports(data)
        }
      } catch {
        if (!isCancelled) {
          setError(t('transports.status.error'))
          setTransports([])
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadTransports()

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

    const nextFilters = {
      departure_city: draftFilters.departure_city.trim(),
      arrival_city: draftFilters.arrival_city.trim(),
      type: draftFilters.type,
    }
    const searchParams = new URLSearchParams()

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (!value) {
        return
      }

      searchParams.set(key, value)
    })

    navigate({
      pathname: '/transports',
      search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    })
  }

  return (
    <div className="container">
      <section className="mb-4">
        <SectionHeader
          eyebrow={t('transports.eyebrow')}
          title={t('transports.pageTitle')}
          description={t('transports.intro')}
        />
      </section>

      <form onSubmit={handleFilterSubmit}>
        <FilterPanel
          description={t('transports.filters.description')}
          title={t('transports.filters.title')}
        >
          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="departure-city">
              {t('transports.filters.departure')}
            </label>
            <input
              className="form-control"
              id="departure-city"
              name="departure_city"
              onChange={handleFilterChange}
              placeholder={t('transports.filters.departurePlaceholder')}
              type="text"
              value={draftFilters.departure_city}
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="arrival-city">
              {t('transports.filters.destination')}
            </label>
            <input
              className="form-control"
              id="arrival-city"
              name="arrival_city"
              onChange={handleFilterChange}
              placeholder={t('transports.filters.destinationPlaceholder')}
              type="text"
              value={draftFilters.arrival_city}
            />
          </div>

          <div className="col-md-6 col-xl-2">
            <label className="form-label" htmlFor="travel-type">
              {t('transports.filters.type')}
            </label>
            <select
              className="form-select"
              id="travel-type"
              name="type"
              onChange={handleFilterChange}
              value={draftFilters.type}
            >
              <option value="">{t('transports.filters.allTypes')}</option>
              <option value="flight">{t('transports.types.flight')}</option>
              <option value="train">{t('transports.types.train')}</option>
              <option value="bus">{t('transports.types.bus')}</option>
            </select>
          </div>

          <div className="col-xl-2 d-grid">
            <button className="btn btn-dark btn-lg mt-xl-4" disabled={loading} type="submit">
              {t('transports.filters.search')}
            </button>
          </div>
        </FilterPanel>
      </form>

      <div className="listing-summary">
        <p>{t('transports.summary', { count: transports.length })}</p>
        <span className="results-pill">{t('transports.summaryBadge')}</span>
      </div>

      {loading ? (
        <div className="alert alert-light border text-center" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          {t('transports.status.loading')}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && transports.length === 0 ? (
        <div className="alert alert-secondary" role="status">
          {t('transports.status.empty')}
        </div>
      ) : null}

      {!loading && !error && transports.length > 0 ? (
        <section>
          <div className="row g-4">
            {transports.map((transport) => (
              <div className="col-lg-6" key={transport.id}>
                <TransportCard transport={transport} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default Transports
