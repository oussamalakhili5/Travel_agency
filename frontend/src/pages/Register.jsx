import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { buildRegisterPayload, validateRegisterForm } from '../utils/authForms'
import { mapAuthErrors } from '../utils/authErrors'

function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, register: registerUser } = useAuth()
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate replace to="/profile" />
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

    const nextErrors = validateRegisterForm(formValues, t)

    setErrors(nextErrors)
    setStatusMessage('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const payload = buildRegisterPayload(formValues)

    setIsSubmitting(true)

    try {
      const response = await registerUser(payload)
      setErrors({})
      navigate('/verify-email', {
        replace: true,
        state: {
          email: payload.email,
          message: response.message || t('register.success.message'),
        },
      })
    } catch (error) {
      setErrors(mapAuthErrors(error, t, 'register'))
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

              {statusMessage ? (
                <div className="alert alert-success auth-alert" role="status">
                  {statusMessage}
                </div>
              ) : null}

              {errors.form ? (
                <div className="alert alert-danger auth-alert" role="alert">
                  {errors.form}
                </div>
              ) : null}

              <form noValidate onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-first-name">
                      {t('register.form.firstNameLabel')}
                    </label>
                    <input
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      id="register-first-name"
                      name="firstName"
                      onChange={handleChange}
                      placeholder={t('register.form.firstNamePlaceholder')}
                      type="text"
                      value={formValues.firstName}
                    />
                    {errors.firstName ? (
                      <div className="invalid-feedback d-block">{errors.firstName}</div>
                    ) : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-last-name">
                      {t('register.form.lastNameLabel')}
                    </label>
                    <input
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      id="register-last-name"
                      name="lastName"
                      onChange={handleChange}
                      placeholder={t('register.form.lastNamePlaceholder')}
                      type="text"
                      value={formValues.lastName}
                    />
                    {errors.lastName ? (
                      <div className="invalid-feedback d-block">{errors.lastName}</div>
                    ) : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-email">
                      {t('register.form.emailLabel')}
                    </label>
                    <input
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="register-email"
                      name="email"
                      onChange={handleChange}
                      placeholder={t('register.form.emailPlaceholder')}
                      type="email"
                      value={formValues.email}
                    />
                    {errors.email ? (
                      <div className="invalid-feedback d-block">{errors.email}</div>
                    ) : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-phone">
                      {t('register.form.phoneLabel')}
                    </label>
                    <input
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="register-phone"
                      name="phone"
                      onChange={handleChange}
                      placeholder={t('register.form.phonePlaceholder')}
                      type="tel"
                      value={formValues.phone}
                    />
                    {errors.phone ? (
                      <div className="invalid-feedback d-block">{errors.phone}</div>
                    ) : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-password">
                      {t('register.form.passwordLabel')}
                    </label>
                    <input
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="register-password"
                      name="password"
                      onChange={handleChange}
                      placeholder={t('register.form.passwordPlaceholder')}
                      type="password"
                      value={formValues.password}
                    />
                    {errors.password ? (
                      <div className="invalid-feedback d-block">{errors.password}</div>
                    ) : null}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="register-confirm-password">
                      {t('register.form.confirmPasswordLabel')}
                    </label>
                    <input
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="register-confirm-password"
                      name="confirmPassword"
                      onChange={handleChange}
                      placeholder={t('register.form.confirmPasswordPlaceholder')}
                      type="password"
                      value={formValues.confirmPassword}
                    />
                    {errors.confirmPassword ? (
                      <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                    ) : null}
                  </div>
                </div>

                <div className="auth-helper-text mt-4">
                  {t('register.form.passwordHint', { count: 8 })}
                </div>

                <div className="auth-helper-text mt-2">
                  {t('register.form.verificationNotice')}
                </div>

                <button className="btn btn-brand w-100 py-3 mt-4" disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      {t('register.form.submitting')}
                    </span>
                  ) : (
                    t('register.form.submit')
                  )}
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
