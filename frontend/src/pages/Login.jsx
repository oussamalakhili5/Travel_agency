import { Link } from 'react-router-dom'

function Login() {
  return (
    <div className="container">
      <section className="auth-shell">
        <div className="row g-4 justify-content-center align-items-stretch">
          <div className="col-lg-5">
            <aside className="auth-aside h-100">
              <span className="hero-kicker">Secure access</span>
              <h1 className="section-title text-white mt-4">Sign in to manage travelers and bookings.</h1>
              <p className="mb-0">
                Access reservations, hotel inquiries, transport requests, and client updates from
                one central dashboard.
              </p>

              <ul className="auth-checklist">
                <li>Review upcoming itineraries and booking requests.</li>
                <li>Track hotels, transport, and traveler support tasks.</li>
                <li>Keep your agency workflow organized across every destination.</li>
              </ul>
            </aside>
          </div>

          <div className="col-lg-5">
            <section className="auth-card h-100">
              <div className="mb-4">
                <span className="auth-badge mb-3">IN</span>
                <h2 className="h3 fw-semibold mb-2">Welcome back</h2>
                <p className="mb-0">
                  Sign in with your agency email to continue planning and managing trips.
                </p>
              </div>

              <form>
                <div className="mb-3">
                  <label className="form-label" htmlFor="login-email">
                    Email address
                  </label>
                  <input
                    className="form-control"
                    id="login-email"
                    placeholder="agent@atlastravel.com"
                    type="email"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    className="form-control"
                    id="login-password"
                    placeholder="Enter your password"
                    type="password"
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                  <div className="form-check">
                    <input className="form-check-input" id="remember-me" type="checkbox" />
                    <label className="form-check-label" htmlFor="remember-me">
                      Remember me
                    </label>
                  </div>
                  <Link className="small text-decoration-none text-primary" to="/register">
                    Need access?
                  </Link>
                </div>

                <button className="btn btn-brand w-100 py-3" type="submit">
                  Sign In
                </button>
              </form>

              <p className="auth-note text-center mt-4 mb-0">
                New here? <Link to="/register">Create your account</Link>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login
