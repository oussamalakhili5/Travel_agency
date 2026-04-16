import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Register() {
  const { t } = useTranslation()

  return (
    <div className="container">
      <section className="auth-shell">
        <div className="row g-4 justify-content-center align-items-stretch">
          <div className="col-lg-5">
            <aside className="auth-aside h-100">
              <span className="hero-kicker">{t('register.aside.kicker')}</span>
              <h1 className="section-title text-white mt-4">{t('register.aside.title')}</h1>
              <p className="mb-0">{t('register.aside.description')}</p>

              <ul className="auth-checklist">
                <li>{t('register.aside.checklist.access')}</li>
                <li>{t('register.aside.checklist.offers')}</li>
                <li>{t('register.aside.checklist.scale')}</li>
              </ul>
            </aside>
          </div>

          <div className="col-lg-6">
            <section className="auth-card h-100">
              <div className="mb-4">
                <span className="auth-badge mb-3">UP</span>
                <h2 className="h3 fw-semibold mb-2">{t('register.card.title')}</h2>
                <p className="mb-0">{t('register.card.description')}</p>
              </div>

              <form>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-name">
                      {t('register.form.fullNameLabel')}
                    </label>
                    <input
                      className="form-control"
                      id="register-name"
                      placeholder={t('register.form.fullNamePlaceholder')}
                      type="text"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-company">
                      {t('register.form.agencyNameLabel')}
                    </label>
                    <input
                      className="form-control"
                      id="register-company"
                      placeholder={t('register.form.agencyNamePlaceholder')}
                      type="text"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-email">
                      {t('register.form.emailLabel')}
                    </label>
                    <input
                      className="form-control"
                      id="register-email"
                      placeholder={t('register.form.emailPlaceholder')}
                      type="email"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-role">
                      {t('register.form.roleLabel')}
                    </label>
                    <select className="form-select" id="register-role">
                      <option>{t('register.form.roles.agent')}</option>
                      <option>{t('register.form.roles.manager')}</option>
                      <option>{t('register.form.roles.operations')}</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-password">
                      {t('register.form.passwordLabel')}
                    </label>
                    <input
                      className="form-control"
                      id="register-password"
                      placeholder={t('register.form.passwordPlaceholder')}
                      type="password"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-confirm-password">
                      {t('register.form.confirmPasswordLabel')}
                    </label>
                    <input
                      className="form-control"
                      id="register-confirm-password"
                      placeholder={t('register.form.confirmPasswordPlaceholder')}
                      type="password"
                    />
                  </div>
                </div>

                <div className="form-check my-4">
                  <input className="form-check-input" id="terms-check" type="checkbox" />
                  <label className="form-check-label" htmlFor="terms-check">
                    {t('register.form.terms')}
                  </label>
                </div>

                <button className="btn btn-brand w-100 py-3" type="submit">
                  {t('register.form.submit')}
                </button>
              </form>

              <p className="auth-note text-center mt-4 mb-0">
                {t('register.form.alreadyRegistered')}{' '}
                <Link to="/login">{t('register.form.signIn')}</Link>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Register
