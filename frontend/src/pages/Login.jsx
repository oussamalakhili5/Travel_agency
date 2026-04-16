function Login() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          <section className="auth-card">
            <div className="page-header">
              <h1 className="h2 fw-semibold mb-2">Welcome back</h1>
              <p className="mb-0">
                Sign in to manage reservations, traveler requests, and upcoming itineraries.
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
                  type="email"
                  placeholder="agent@atlastravel.com"
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  className="form-control"
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                />
              </div>

              <button className="btn btn-dark w-100 py-3" type="submit">
                Sign In
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Login
