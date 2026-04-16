import { useTranslation } from 'react-i18next'
import FilterPanel from '../components/FilterPanel'
import HotelCard from '../components/HotelCard'
import SectionHeader from '../components/SectionHeader'
import hotels from '../data/hotels'

function Hotels() {
  const { t } = useTranslation()

  return (
    <div className="container">
      <section className="mb-4">
        <SectionHeader
          eyebrow={t('hotels.eyebrow')}
          title={t('hotels.pageTitle')}
          description={t('hotels.intro')}
        />
      </section>

      <FilterPanel
        description={t('hotels.filters.description')}
        title={t('hotels.filters.title')}
      >
        <div className="col-md-6 col-xl-3">
          <label className="form-label" htmlFor="hotel-destination">
            {t('hotels.filters.destination')}
          </label>
          <input
            className="form-control"
            id="hotel-destination"
            placeholder={t('hotels.filters.destinationPlaceholder')}
            type="text"
          />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="check-in">
            {t('hotels.filters.checkIn')}
          </label>
          <input className="form-control" id="check-in" type="date" />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="check-out">
            {t('hotels.filters.checkOut')}
          </label>
          <input className="form-control" id="check-out" type="date" />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="budget">
            {t('hotels.filters.budget')}
          </label>
          <select className="form-select" id="budget">
            <option>{t('hotels.filters.budgetOptions.any')}</option>
            <option>{t('hotels.filters.budgetOptions.rangeOne')}</option>
            <option>{t('hotels.filters.budgetOptions.rangeTwo')}</option>
            <option>{t('hotels.filters.budgetOptions.rangeThree')}</option>
          </select>
        </div>

        <div className="col-xl-3 d-grid">
          <button className="btn btn-dark btn-lg mt-xl-4" type="button">
            {t('hotels.filters.search')}
          </button>
        </div>
      </FilterPanel>

      <div className="listing-summary">
        <p>{t('hotels.summary', { count: hotels.length })}</p>
        <span className="results-pill">{t('hotels.summaryBadge')}</span>
      </div>

      <section>
        <div className="row g-4">
          {hotels.map((hotel) => (
            <div className="col-md-6 col-xl-4" key={hotel.id}>
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Hotels
