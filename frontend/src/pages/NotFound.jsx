import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <section className="page-section text-center">
            <span className="badge text-bg-dark mb-3">404</span>
            <h1 className="h2 fw-semibold mb-3">The page you requested could not be found.</h1>
            <p className="page-copy mb-4">
              The route may have changed or is not available yet. Head back to the homepage to
              continue exploring the travel platform.
            </p>
            <Link className="btn btn-dark px-4" to="/">
              Return Home
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}

export default NotFound
