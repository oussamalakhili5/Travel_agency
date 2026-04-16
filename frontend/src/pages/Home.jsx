import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SectionHeader from '../components/SectionHeader'
import {
  featuredDestinations,
  featuredServices,
  heroMetrics,
  whyChooseUs,
} from '../data/home'

function Home() {
  const { t } = useTranslation()

  return (
    <div className="container">
      <section className="hero-section mb-5">
        <div className="row g-4 align-items-center">
          <div className="col-lg-7 hero-content">
            <span className="hero-kicker">{t('home.hero.kicker')}</span>
            <h1 className="section-title text-white mt-4">
              {t('home.hero.title')}
            </h1>
            <p className="hero-description mb-4">{t('home.hero.description')}</p>

            <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
              <Link className="btn btn-brand btn-lg px-4" to="/hotels">
                {t('home.hero.primaryCta')}
              </Link>
              <Link className="btn btn-outline-light btn-lg px-4" to="/transports">
                {t('home.hero.secondaryCta')}
              </Link>
            </div>

            <div className="row g-3">
              {heroMetrics.map((metric) => (
                <div className="col-sm-4" key={metric.key}>
                  <div className="hero-metric h-100">
                    <strong>{metric.value}</strong>
                    <span>{t(`home.metrics.${metric.key}`)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-5 hero-showcase">
            <div className="hero-showcase__card">
              <span className="section-label mb-3">{t('home.hero.highlightLabel')}</span>
              <h2 className="fw-semibold mb-2">{t('home.hero.highlightTitle')}</h2>
              <p className="mb-0 text-white-50">{t('home.hero.highlightDescription')}</p>

              <div className="hero-route">
                <div className="hero-route__segment">
                  <div>
                    <span className="hero-route__label">{t('home.hero.flightLabel')}</span>
                    <div className="hero-route__value">{t('home.hero.packageFlight')}</div>
                  </div>
                  <strong>{t('home.hero.packageFlightDuration')}</strong>
                </div>
                <div className="hero-route__segment">
                  <div>
                    <span className="hero-route__label">{t('home.hero.hotelLabel')}</span>
                    <div className="hero-route__value">{t('home.hero.packageHotel')}</div>
                  </div>
                  <strong>{t('home.hero.packageHotelDuration')}</strong>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <div className="hero-showcase__mini h-100">
                    <strong>{t('home.hero.airportPickupTitle')}</strong>
                    <span>{t('home.hero.airportPickupText')}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="hero-showcase__mini h-100">
                    <strong>{t('home.hero.supportTitle')}</strong>
                    <span>{t('home.hero.supportText')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader
          eyebrow={t('home.services.eyebrow')}
          title={t('home.services.title')}
          description={t('home.services.description')}
        />

        <div className="row g-4 mt-1">
          {featuredServices.map((service) => (
            <div className="col-md-6 col-xl-3" key={service.key}>
              <article className="service-card h-100">
                <span className="service-card__icon">{service.icon}</span>
                <h3 className="h5 fw-semibold">{t(`home.services.items.${service.key}.title`)}</h3>
                <p className="mb-0">{t(`home.services.items.${service.key}.description`)}</p>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <div className="row g-4 align-items-start">
          <div className="col-lg-5">
            <SectionHeader
              eyebrow={t('home.whyChooseUs.eyebrow')}
              title={t('home.whyChooseUs.title')}
              description={t('home.whyChooseUs.description')}
            />
          </div>

          <div className="col-lg-7">
            <div className="row g-4">
              {whyChooseUs.map((item) => (
                <div className="col-md-6 col-xl-4" key={item.key}>
                  <article className="benefit-card h-100">
                    <span className="benefit-card__icon">{item.icon}</span>
                    <h3 className="h5 fw-semibold">{t(`home.whyChooseUs.items.${item.key}.title`)}</h3>
                    <p className="mb-0">{t(`home.whyChooseUs.items.${item.key}.description`)}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader
          align="center"
          eyebrow={t('home.destinations.eyebrow')}
          title={t('home.destinations.title')}
          description={t('home.destinations.description')}
        />

        <div className="row g-4 mt-1">
          {featuredDestinations.map((destination) => (
            <div className="col-md-6 col-xl-4" key={destination.key}>
              <article className="destination-card h-100">
                <img
                  alt={t(`home.destinations.items.${destination.key}.name`)}
                  className="destination-card__image"
                  loading="lazy"
                  src={destination.image}
                />
                <div className="destination-card__body">
                  <div className="destination-card__meta">
                    <span className="badge text-bg-light border rounded-pill">
                      {t(`home.destinations.items.${destination.key}.location`)}
                    </span>
                    <span className="destination-card__price">
                      {t(`home.destinations.items.${destination.key}.price`)}
                    </span>
                  </div>
                  <h3 className="h5 fw-semibold">{t(`home.destinations.items.${destination.key}.name`)}</h3>
                  <p className="mb-3">{t(`home.destinations.items.${destination.key}.description`)}</p>
                  <div className="d-flex justify-content-between align-items-center gap-3">
                    <span className="text-muted small">
                      {t(`home.destinations.items.${destination.key}.duration`)}
                    </span>
                    <Link className="btn btn-outline-brand" to="/register">
                      {t('home.destinations.reserveInterest')}
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="filter-panel mb-2">
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <h2 className="h3 fw-semibold mb-2">{t('home.cta.title')}</h2>
            <p className="mb-0">{t('home.cta.description')}</p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link className="btn btn-brand px-4" to="/register">
              {t('home.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
