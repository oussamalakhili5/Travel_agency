const hotelOptions = [
  {
    name: 'Atlas Marina Hotel',
    location: 'Casablanca, Morocco',
    details: 'Modern waterfront stay for business travelers and premium city tours.',
  },
  {
    name: 'Desert Pearl Resort',
    location: 'Marrakech, Morocco',
    details: 'A refined resort experience with guided excursions and spa packages.',
  },
  {
    name: 'Blue Horizon Suites',
    location: 'Tangier, Morocco',
    details: 'Comfortable suites close to transport hubs and coastal attractions.',
  },
]

function Hotels() {
  return (
    <div className="container">
      <section className="page-section">
        <div className="page-header">
          <h1 className="h2 fw-semibold mb-2">Hotels</h1>
          <p className="page-copy mb-0">
            Browse featured hotel listings and prepare this page for live search, filtering,
            and room availability integrations.
          </p>
        </div>

        <div className="row g-4">
          {hotelOptions.map((hotel) => (
            <div className="col-md-6 col-xl-4" key={hotel.name}>
              <article className="info-card">
                <span className="badge text-bg-light border mb-3">{hotel.location}</span>
                <h2 className="h5 fw-semibold">{hotel.name}</h2>
                <p className="mb-0">{hotel.details}</p>
              </article>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Hotels
