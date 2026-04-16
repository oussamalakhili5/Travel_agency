import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="container">
      <section className="not-found-shell">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="not-found-card">
              <span className="section-label">404 Error</span>
              <h1 className="section-title section-title-sm">This destination is not on the map yet.</h1>
              <p className="mb-4">
                The page you requested may have moved or does not exist. Head back to the main
                experience and continue exploring hotels, transport, and travel offers.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link className="btn btn-brand px-4" to="/">
                  Return Home
                </Link>
                <Link className="btn btn-outline-brand px-4" to="/hotels">
                  Browse Hotels
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NotFound
