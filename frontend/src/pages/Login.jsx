import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  buildLoginPayload,
  simulateAuthRequest,
  validateLoginForm,
} from '../utils/authForms'

function Login() {
  const { t } = useTranslation()
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))

    setStatusMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateLoginForm(formValues, t)

    setErrors(nextErrors)
    setStatusMessage('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const payload = buildLoginPayload(formValues)

    setIsSubmitting(true)

    try {
      await simulateAuthRequest(payload)
      setStatusMessage(t('login.success.message'))
      setFormValues({
        email: '',
        password: '',
      })
      setErrors({})
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <section className="auth-shell">
        <div className="row g-4 justify-content-center align-items-stretch">
          <div className="col-lg-5">
            <aside className="auth-aside h-100">
              <span className="hero-kicker">{t('login.aside.kicker')}</span>
              <h1 className="section-title text-white mt-4">{t('login.aside.title')}</h1>
              <p className="mb-0">{t('login.aside.description')}</p>

              <ul className="auth-checklist">
                <li>{t('login.aside.checklist.review')}</li>
                <li>{t('login.aside.checklist.track')}</li>
                <li>{t('login.aside.checklist.organize')}</li>
              </ul>
            </aside>
          </div>

          <div className="col-lg-5">
            <section className="auth-card h-100">
              <div className="mb-4">
                <span className="auth-badge mb-3">IN</span>
                <h2 className="h3 fw-semibold mb-2">{t('login.card.title')}</h2>
                <p className="mb-0">{t('login.card.description')}</p>
              </div>

              {statusMessage ? (
                <div className="alert alert-success auth-alert" role="status">
                  {statusMessage}
                </div>
              ) : null}

              <form noValidate onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="login-email">
                    {t('login.form.emailLabel')}
                  </label>
                  <input
                    className="form-control"
                    id="login-email"
                    name="email"
                    onChange={handleChange}
                    placeholder={t('login.form.emailPlaceholder')}
                    type="email"
                    value={formValues.email}
                  />
                  {errors.email ? <div className="invalid-feedback d-block">{errors.email}</div> : null}
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="login-password">
                    {t('login.form.passwordLabel')}
                  </label>
                  <input
                    className="form-control"
                    id="login-password"
                    name="password"
                    onChange={handleChange}
                    placeholder={t('login.form.passwordPlaceholder')}
                    type="password"
                    value={formValues.password}
                  />
                  {errors.password ? (
                    <div className="invalid-feedback d-block">{errors.password}</div>
                  ) : null}
                </div>

                <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                  <div className="form-check">
                    <input className="form-check-input" id="remember-me" type="checkbox" />
                    <label className="form-check-label" htmlFor="remember-me">
                      {t('login.form.remember')}
                    </label>
                  </div>
                  <Link className="small text-decoration-none text-primary" to="/register">
                    {t('login.form.supportLink')}
                  </Link>
                </div>

                <button className="btn btn-brand w-100 py-3" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      {t('login.form.submitting')}
                    </span>
                  ) : (
                    t('login.form.submit')
                  )}
                </button>
              </form>

              <p className="auth-note text-center mt-4 mb-0">
                {t('login.form.newHere')}{' '}
                <Link to="/register">{t('login.form.createAccount')}</Link>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Login
