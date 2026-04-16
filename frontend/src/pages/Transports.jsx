import { useTranslation } from 'react-i18next'
import FilterPanel from '../components/FilterPanel'
import SectionHeader from '../components/SectionHeader'
import TransportCard from '../components/TransportCard'
import transports from '../data/transports'

function Transports() {
  const { t } = useTranslation()

  return (
    <div className="container">
      <section className="mb-4">
        <SectionHeader
          eyebrow={t('transports.eyebrow')}
          title={t('transports.pageTitle')}
          description={t('transports.intro')}
        />
      </section>

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
            placeholder={t('transports.filters.departurePlaceholder')}
            type="text"
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <label className="form-label" htmlFor="arrival-city">
            {t('transports.filters.destination')}
          </label>
          <input
            className="form-control"
            id="arrival-city"
            placeholder={t('transports.filters.destinationPlaceholder')}
            type="text"
          />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="travel-date">
            {t('transports.filters.date')}
          </label>
          <input className="form-control" id="travel-date" type="date" />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="travel-type">
            {t('transports.filters.type')}
          </label>
          <select className="form-select" id="travel-type">
            <option>{t('transports.filters.allTypes')}</option>
            <option>{t('transports.types.flight')}</option>
            <option>{t('transports.types.train')}</option>
            <option>{t('transports.types.bus')}</option>
          </select>
        </div>

        <div className="col-xl-2 d-grid">
          <button className="btn btn-dark btn-lg mt-xl-4" type="button">
            {t('transports.filters.search')}
          </button>
        </div>
      </FilterPanel>

      <div className="listing-summary">
        <p>{t('transports.summary', { count: transports.length })}</p>
        <span className="results-pill">{t('transports.summaryBadge')}</span>
      </div>

      <section>
        <div className="row g-4">
          {transports.map((transport) => (
            <div className="col-lg-6" key={transport.id}>
              <TransportCard transport={transport} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Transports
