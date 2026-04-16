import { Link } from 'react-router-dom'

function Register() {
  return (
    <div className="container">
      <section className="auth-shell">
        <div className="row g-4 justify-content-center align-items-stretch">
          <div className="col-lg-5">
            <aside className="auth-aside h-100">
              <span className="hero-kicker">Create workspace</span>
              <h1 className="section-title text-white mt-4">
                Register your agency and start building polished travel experiences.
              </h1>
              <p className="mb-0">
                Set up your account to manage hotel selections, transport coordination, and
                customer communication from one place.
              </p>

              <ul className="auth-checklist">
                <li>Organize team access and client communication in one dashboard.</li>
                <li>Prepare package offers, reservations, and transport bookings faster.</li>
                <li>Scale from mock data today to real API-driven workflows next.</li>
              </ul>
            </aside>
          </div>

          <div className="col-lg-6">
            <section className="auth-card h-100">
              <div className="mb-4">
                <span className="auth-badge mb-3">UP</span>
                <h2 className="h3 fw-semibold mb-2">Create your account</h2>
                <p className="mb-0">
                  Fill in the fields below to set up a travel-agency workspace.
                </p>
              </div>

              <form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-name">
                      Full name
                    </label>
                    <input
                      className="form-control"
                      id="register-name"
                      placeholder="Your full name"
                      type="text"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-company">
                      Agency name
                    </label>
                    <input
                      className="form-control"
                      id="register-company"
                      placeholder="Atlas Travel Agency"
                      type="text"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-email">
                      Email address
                    </label>
                    <input
                      className="form-control"
                      id="register-email"
                      placeholder="contact@atlastravel.com"
                      type="email"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-role">
                      Role
                    </label>
                    <select className="form-select" id="register-role">
                      <option>Travel Agent</option>
                      <option>Manager</option>
                      <option>Operations</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-password">
                      Password
                    </label>
                    <input
                      className="form-control"
                      id="register-password"
                      placeholder="Create a password"
                      type="password"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-confirm-password">
                      Confirm password
                    </label>
                    <input
                      className="form-control"
                      id="register-confirm-password"
                      placeholder="Confirm your password"
                      type="password"
                    />
                  </div>
                </div>

                <div className="form-check my-4">
                  <input className="form-check-input" id="terms-check" type="checkbox" />
                  <label className="form-check-label" htmlFor="terms-check">
                    I agree to the agency terms and traveler data policies.
                  </label>
                </div>

                <button className="btn btn-brand w-100 py-3" type="submit">
                  Register
                </button>
              </form>

              <p className="auth-note text-center mt-4 mb-0">
                Already registered? <Link to="/login">Sign in here</Link>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Register
