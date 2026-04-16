const transportOptions = [
  {
    title: 'Airport Transfers',
    description: 'Reliable pickup scheduling for arrivals, departures, and VIP travelers.',
  },
  {
    title: 'Intercity Connections',
    description: 'Coordinate train, shuttle, and private transfer options between destinations.',
  },
  {
    title: 'Corporate Mobility',
    description: 'Organize executive transport plans with clear timing and routing details.',
  },
]

function Transports() {
  return (
    <div className="container">
      <section className="page-section">
        <div className="page-header">
          <h1 className="h2 fw-semibold mb-2">Transports</h1>
          <p className="page-copy mb-0">
            Showcase transportation services with space for schedules, pricing, and future API
            integrations.
          </p>
        </div>

        <div className="row g-4">
          {transportOptions.map((option) => (
            <div className="col-md-6 col-xl-4" key={option.title}>
              <article className="info-card">
                <div className="feature-icon">{option.title.charAt(0)}</div>
                <h2 className="h5 fw-semibold">{option.title}</h2>
                <p className="mb-0">{option.description}</p>
              </article>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Transports
