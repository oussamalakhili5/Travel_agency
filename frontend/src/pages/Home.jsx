import { Link } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import {
  featuredDestinations,
  featuredServices,
  heroMetrics,
  whyChooseUs,
} from '../data/home'

function Home() {
  return (
    <div className="container">
      <section className="hero-section mb-5">
        <div className="row g-4 align-items-center">
          <div className="col-lg-7 hero-content">
            <span className="hero-kicker">Travel planning with business-class polish</span>
            <h1 className="section-title text-white mt-4">
              Professional travel booking for hotels, transport, and memorable journeys.
            </h1>
            <p className="hero-description mb-4">
              Atlas Travel helps agencies and independent travelers move from searching to
              booking with a clear, elegant interface built for confidence and speed.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
              <Link className="btn btn-brand btn-lg px-4" to="/hotels">
                Explore Hotels
              </Link>
              <Link className="btn btn-outline-light btn-lg px-4" to="/transports">
                Plan Transport
              </Link>
            </div>

            <div className="row g-3">
              {heroMetrics.map((metric) => (
                <div className="col-sm-4" key={metric.label}>
                  <div className="hero-metric h-100">
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-5 hero-showcase">
            <div className="hero-showcase__card">
              <span className="section-label mb-3">Next curated departure</span>
              <h2 className="fw-semibold mb-2">Casablanca to Dubai executive package</h2>
              <p className="mb-0 text-white-50">
                A polished travel flow with flights, airport transfers, and a premium city stay.
              </p>

              <div className="hero-route">
                <div className="hero-route__segment">
                  <div>
                    <span className="hero-route__label">Flight</span>
                    <div className="hero-route__value">BlueSky Airways</div>
                  </div>
                  <strong>7h 40m</strong>
                </div>
                <div className="hero-route__segment">
                  <div>
                    <span className="hero-route__label">Hotel</span>
                    <div className="hero-route__value">Skyline Grand Dubai</div>
                  </div>
                  <strong>4 Nights</strong>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <div className="hero-showcase__mini h-100">
                    <strong>Airport pickup</strong>
                    <span>Included on arrival</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="hero-showcase__mini h-100">
                    <strong>Priority support</strong>
                    <span>24/7 itinerary help</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <SectionHeader
          eyebrow="Featured Services"
          title="Travel services designed around real booking needs."
          description="From flights and hotels to curated packages and ongoing support, the experience is built to feel trustworthy, efficient, and easy to navigate."
        />

        <div className="row g-4 mt-1">
          {featuredServices.map((service) => (
            <div className="col-md-6 col-xl-3" key={service.title}>
              <article className="service-card h-100">
                <span className="service-card__icon">{service.icon}</span>
                <h3 className="h5 fw-semibold">{service.title}</h3>
                <p className="mb-0">{service.description}</p>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <div className="row g-4 align-items-start">
          <div className="col-lg-5">
            <SectionHeader
              eyebrow="Why Choose Us"
              title="A dependable travel partner for business trips and premium escapes."
              description="The interface is structured to support confident decisions, realistic travel planning, and a professional agency presentation."
            />
          </div>

          <div className="col-lg-7">
            <div className="row g-4">
              {whyChooseUs.map((item) => (
                <div className="col-md-6 col-xl-4" key={item.title}>
                  <article className="benefit-card h-100">
                    <span className="benefit-card__icon">{item.icon}</span>
                    <h3 className="h5 fw-semibold">{item.title}</h3>
                    <p className="mb-0">{item.description}</p>
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
          eyebrow="Featured Destinations"
          title="Popular offers that make your agency feel ready for real customers."
          description="These highlighted destination cards show how featured trips or promotional offers can be presented in a modern travel storefront."
        />

        <div className="row g-4 mt-1">
          {featuredDestinations.map((destination) => (
            <div className="col-md-6 col-xl-4" key={destination.name}>
              <article className="destination-card h-100">
                <img
                  alt={destination.name}
                  className="destination-card__image"
                  loading="lazy"
                  src={destination.image}
                />
                <div className="destination-card__body">
                  <div className="destination-card__meta">
                    <span className="badge text-bg-light border rounded-pill">
                      {destination.location}
                    </span>
                    <span className="destination-card__price">{destination.price}</span>
                  </div>
                  <h3 className="h5 fw-semibold">{destination.name}</h3>
                  <p className="mb-3">{destination.description}</p>
                  <div className="d-flex justify-content-between align-items-center gap-3">
                    <span className="text-muted small">{destination.duration}</span>
                    <Link className="btn btn-outline-brand" to="/register">
                      Reserve Interest
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
            <h2 className="h3 fw-semibold mb-2">Ready to turn this polished UI into a full booking flow?</h2>
            <p className="mb-0">
              The frontend is now shaped like a realistic agency platform, making it easier to
              connect forms, search filters, and live API data next.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link className="btn btn-brand px-4" to="/register">
              Create Agency Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
