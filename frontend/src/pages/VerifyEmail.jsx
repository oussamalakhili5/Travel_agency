import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { mapAuthErrors } from '../utils/authErrors'

function isBlank(value) {
  return !String(value ?? '').trim()
}

function VerifyEmail() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, verifyEmail, resendVerificationCode } = useAuth()
  const emailFromQuery = useMemo(
    () => new URLSearchParams(location.search).get('email') ?? '',
    [location.search],
  )
  const [formValues, setFormValues] = useState({
    email: location.state?.email ?? emailFromQuery,
    verificationCode: '',
  })
  const [errors, setErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState(location.state?.message ?? '')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

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
    setSuccessMessage('')
  }

  function validateForm() {
    const nextErrors = {}

    if (isBlank(formValues.email)) {
      nextErrors.email = t('verifyEmail.validation.requiredEmail')
    }

    if (isBlank(formValues.verificationCode)) {
      nextErrors.verificationCode = t('verifyEmail.validation.requiredCode')
    }

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateForm()
    setErrors(nextErrors)
    setSuccessMessage('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await verifyEmail({
        email: formValues.email.trim(),
        verification_code: formValues.verificationCode.trim(),
      })

      setErrors({})
      setStatusMessage('')
      setSuccessMessage(t('verifyEmail.success.verified'))

      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            email: formValues.email.trim(),
            message: t('login.success.emailVerified'),
          },
        })
      }, 1200)
    } catch (error) {
      setErrors(mapAuthErrors(error, t, 'verifyEmail'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    const trimmedEmail = formValues.email.trim()

    if (isBlank(trimmedEmail)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        email: t('verifyEmail.validation.requiredEmail'),
      }))
      return
    }

    setIsResending(true)
    setErrors((currentErrors) => ({
      ...currentErrors,
      email: '',
      form: '',
    }))
    setSuccessMessage('')

    try {
      await resendVerificationCode({ email: trimmedEmail })
      setStatusMessage(t('verifyEmail.success.resent'))
    } catch (error) {
      setErrors(mapAuthErrors(error, t, 'verifyEmail'))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container">
      <section className="auth-shell">
        <div className="row g-4 justify-content-center align-items-stretch">
          <div className="col-lg-5">
            <aside className="auth-aside h-100">
              <span className="hero-kicker">{t('verifyEmail.aside.kicker')}</span>
              <h1 className="section-title text-white mt-4">{t('verifyEmail.aside.title')}</h1>
              <p className="mb-0">{t('verifyEmail.aside.description')}</p>

              <ul className="auth-checklist">
                <li>{t('verifyEmail.aside.checklist.stepOne')}</li>
                <li>{t('verifyEmail.aside.checklist.stepTwo')}</li>
                <li>{t('verifyEmail.aside.checklist.stepThree')}</li>
              </ul>
            </aside>
          </div>

          <div className="col-lg-5">
            <section className="auth-card h-100">
              <div className="mb-4">
                <span className="auth-badge mb-3">{t('verifyEmail.card.badge')}</span>
                <h2 className="h3 fw-semibold mb-2">{t('verifyEmail.card.title')}</h2>
                <p className="mb-0">{t('verifyEmail.card.description')}</p>
              </div>

              {statusMessage ? (
                <div className="alert alert-info auth-alert" role="status">
                  {statusMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="alert alert-success auth-alert" role="status">
                  {successMessage}
                </div>
              ) : null}

              {errors.form ? (
                <div className="alert alert-danger auth-alert" role="alert">
                  {errors.form}
                </div>
              ) : null}

              <form noValidate onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="verify-email">
                    {t('verifyEmail.form.emailLabel')}
                  </label>
                  <input
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="verify-email"
                    name="email"
                    onChange={handleChange}
                    placeholder={t('verifyEmail.form.emailPlaceholder')}
                    type="email"
                    value={formValues.email}
                  />
                  {errors.email ? <div className="invalid-feedback d-block">{errors.email}</div> : null}
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="verification-code">
                    {t('verifyEmail.form.codeLabel')}
                  </label>
                  <input
                    className={`form-control ${errors.verificationCode ? 'is-invalid' : ''}`}
                    id="verification-code"
                    name="verificationCode"
                    onChange={handleChange}
                    placeholder={t('verifyEmail.form.codePlaceholder')}
                    type="text"
                    value={formValues.verificationCode}
                  />
                  {errors.verificationCode ? (
                    <div className="invalid-feedback d-block">{errors.verificationCode}</div>
                  ) : null}
                </div>

                <div className="auth-helper-text mb-4">{t('verifyEmail.form.helper')}</div>

                <button className="btn btn-brand w-100 py-3" disabled={isSubmitting || isResending} type="submit">
                  {isSubmitting ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      {t('verifyEmail.form.submitting')}
                    </span>
                  ) : (
                    t('verifyEmail.form.submit')
                  )}
                </button>
              </form>

              <div className="border-top mt-4 pt-4">
                <p className="auth-note mb-3">{t('verifyEmail.form.resendPrompt')}</p>
                <button
                  className="btn btn-outline-secondary w-100"
                  disabled={isSubmitting || isResending}
                  onClick={handleResend}
                  type="button"
                >
                  {isResending ? (
                    <span className="d-inline-flex align-items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      {t('verifyEmail.form.resending')}
                    </span>
                  ) : (
                    t('verifyEmail.form.resend')
                  )}
                </button>
              </div>

              <p className="auth-note text-center mt-4 mb-0">
                {t('verifyEmail.form.backToLogin')}{' '}
                <Link to="/login">{t('verifyEmail.form.loginLink')}</Link>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default VerifyEmail
