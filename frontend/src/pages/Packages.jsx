import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import FilterPanel from '../components/FilterPanel'
import PackageCard from '../components/PackageCard'
import SectionHeader from '../components/SectionHeader'
import { getPackages } from '../services/catalogService'

const INITIAL_PACKAGE_FILTERS = {
  destination: '',
  city: '',
  max_price: '',
}

function getPackageFiltersFromSearch(search) {
  const params = new URLSearchParams(search)

  return {
    destination: params.get('destination')?.trim() ?? '',
    city: params.get('city')?.trim() ?? '',
    max_price: params.get('max_price')?.trim() ?? '',
  }
}

function Packages() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draftFilters, setDraftFilters] = useState(INITIAL_PACKAGE_FILTERS)
  const filters = useMemo(
    () => getPackageFiltersFromSearch(location.search),
    [location.search],
  )

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  useEffect(() => {
    let isCancelled = false

    async function loadPackages() {
      setLoading(true)
      setError('')

      try {
        const data = await getPackages(filters)

        if (!isCancelled) {
          setPackages(data)
        }
      } catch {
        if (!isCancelled) {
          setPackages([])
          setError(t('packages.status.error'))
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadPackages()

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

    const searchParams = new URLSearchParams()
    Object.entries({
      destination: draftFilters.destination.trim(),
      city: draftFilters.city.trim(),
      max_price: draftFilters.max_price,
    }).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value)
      }
    })

    navigate({
      pathname: '/packages',
      search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    })
  }

  return (
    <div className="container">
      <section className="mb-4">
        <SectionHeader
          eyebrow={t('packages.eyebrow')}
          title={t('packages.pageTitle')}
          description={t('packages.intro')}
        />
      </section>

      <form onSubmit={handleFilterSubmit}>
        <FilterPanel
          description={t('packages.filters.description')}
          title={t('packages.filters.title')}
        >
          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="package-destination">
              {t('packages.filters.destination')}
            </label>
            <input
              className="form-control"
              id="package-destination"
              name="destination"
              onChange={handleFilterChange}
              placeholder={t('packages.filters.destinationPlaceholder')}
              type="text"
              value={draftFilters.destination}
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="package-city">
              {t('packages.filters.city')}
            </label>
            <input
              className="form-control"
              id="package-city"
              name="city"
              onChange={handleFilterChange}
              placeholder={t('packages.filters.cityPlaceholder')}
              type="text"
              value={draftFilters.city}
            />
          </div>

          <div className="col-md-6 col-xl-3">
            <label className="form-label" htmlFor="package-budget">
              {t('packages.filters.budget')}
            </label>
            <select
              className="form-select"
              id="package-budget"
              name="max_price"
              onChange={handleFilterChange}
              value={draftFilters.max_price}
            >
              <option value="">{t('packages.filters.budgetOptions.any')}</option>
              <option value="500">{t('packages.filters.budgetOptions.rangeOne')}</option>
              <option value="1000">{t('packages.filters.budgetOptions.rangeTwo')}</option>
              <option value="2000">{t('packages.filters.budgetOptions.rangeThree')}</option>
            </select>
          </div>

          <div className="col-xl-2 d-grid">
            <button className="btn btn-dark btn-lg mt-xl-4" disabled={loading} type="submit">
              {t('packages.filters.search')}
            </button>
          </div>
        </FilterPanel>
      </form>

      <div className="listing-summary">
        <p>{t('packages.summary', { count: packages.length })}</p>
        <span className="results-pill">{t('packages.summaryBadge')}</span>
      </div>

      {loading ? (
        <div className="alert alert-light border text-center" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          {t('packages.status.loading')}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && packages.length === 0 ? (
        <div className="alert alert-secondary" role="status">
          {t('packages.status.empty')}
        </div>
      ) : null}

      {!loading && !error && packages.length > 0 ? (
        <section>
          <div className="row g-4">
            {packages.map((travelPackage) => (
              <div className="col-md-6 col-xl-4" key={travelPackage.id}>
                <PackageCard travelPackage={travelPackage} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default Packages
