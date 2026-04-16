function Register() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-7 col-xl-6">
          <section className="auth-card">
            <div className="page-header">
              <h1 className="h2 fw-semibold mb-2">Create your agency account</h1>
              <p className="mb-0">
                Register your team workspace to manage bookings, clients, and travel services.
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
                    type="text"
                    placeholder="Your full name"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="register-company">
                    Agency name
                  </label>
                  <input
                    className="form-control"
                    id="register-company"
                    type="text"
                    placeholder="Atlas Travel Agency"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="register-email">
                    Email address
                  </label>
                  <input
                    className="form-control"
                    id="register-email"
                    type="email"
                    placeholder="contact@atlastravel.com"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="register-password">
                    Password
                  </label>
                  <input
                    className="form-control"
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="register-confirm-password">
                    Confirm password
                  </label>
                  <input
                    className="form-control"
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <button className="btn btn-dark w-100 py-3 mt-4" type="submit">
                Register
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Register
