import { Link } from 'react-router-dom'

const highlights = [
  {
    title: 'Hotel selection',
    description: 'Compare curated stays with clean details for every destination.',
    icon: 'H',
  },
  {
    title: 'Transport planning',
    description: 'Organize airport pickups, transfers, and city movement with confidence.',
    icon: 'T',
  },
  {
    title: 'Customer support',
    description: 'Keep traveler updates, confirmations, and trip changes within reach.',
    icon: 'S',
  },
]

function Home() {
  return (
    <div className="container">
      <section className="hero-card mb-4 mb-lg-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span className="hero-badge mb-3">Professional travel management made simple</span>
            <h1 className="fw-semibold mb-3">Plan smooth journeys with a polished agency dashboard.</h1>
            <p className="lead mb-4 text-white-50">
              Build memorable trips with one streamlined platform for hotel discovery,
              transport coordination, and traveler onboarding.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <Link className="btn btn-brand btn-lg px-4" to="/hotels">
                Explore Hotels
              </Link>
              <Link className="btn btn-outline-light btn-lg px-4" to="/transports">
                View Transport Options
              </Link>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="hero-stats">
              <div className="row g-3">
                <div className="col-6">
                  <strong>120+</strong>
                  <span className="text-white-50">Curated stays</span>
                </div>
                <div className="col-6">
                  <strong>24/7</strong>
                  <span className="text-white-50">Traveler assistance</span>
                </div>
                <div className="col-6">
                  <strong>35</strong>
                  <span className="text-white-50">Popular destinations</span>
                </div>
                <div className="col-6">
                  <strong>99%</strong>
                  <span className="text-white-50">Reservation accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4 mb-lg-5">
        <div className="section-heading mb-4">
          <h2 className="fw-semibold">Everything your travel agency frontend needs to start strong.</h2>
          <p className="mb-0">
            This starter interface is organized for growth, with shared routing, reusable
            components, and a clean UI foundation built on Bootstrap.
          </p>
        </div>

        <div className="row g-4">
          {highlights.map((item) => (
            <div className="col-md-6 col-xl-4" key={item.title}>
              <article className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3 className="h5 fw-semibold">{item.title}</h3>
                <p className="mb-0">{item.description}</p>
              </article>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-panel">
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <h2 className="h3 fw-semibold mb-2">Ready to connect this frontend to your backend API?</h2>
            <p className="mb-0">
              Axios is configured and ready for authentication, hotels, and transport endpoints.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link className="btn btn-outline-dark px-4" to="/register">
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
