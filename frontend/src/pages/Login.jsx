import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { buildLoginPayload, validateLoginForm } from '../utils/authForms'
import { getAuthErrorCode, mapAuthErrors } from '../utils/authErrors'

function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [formValues, setFormValues] = useState({
    email: location.state?.email ?? '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState(location.state?.message ?? '')
  const redirectPath =
    location.state?.from?.pathname && location.state.from.pathname !== '/login'
      ? location.state.from.pathname
      : '/profile'

  if (isAuthenticated) {
    return <Navigate replace to={redirectPath} />
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
      form: '',
    }))

    setStatusMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateLoginForm(formValues, t)

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const payload = buildLoginPayload(formValues)

    setIsSubmitting(true)

    try {
      await login(payload)
      setErrors({})
      navigate(redirectPath, { replace: true })
    } catch (error) {
      if (getAuthErrorCode(error) === 'email_verification_required') {
        navigate('/verify-email', {
          replace: true,
          state: {
            email: payload.email,
            message: t('verifyEmail.status.loginRedirect'),
          },
        })
        return
      }

      setErrors(mapAuthErrors(error, t, 'login'))
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
                <div className="alert alert-info auth-alert" role="status">
                  {statusMessage}
                </div>
              ) : null}

              {errors.form ? (
                <div className="alert alert-danger auth-alert" role="alert">
                  {errors.form}
                </div>
              ) : null}

              <form noValidate onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="login-email">
                    {t('login.form.emailLabel')}
                  </label>
                  <input
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
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
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
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

                <div className="auth-helper-text mb-4">
                  {t('login.form.verificationNotice')}
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
