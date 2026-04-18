import axios from 'axios'

const FIELD_NAME_MAP = {
  first_name: 'firstName',
  last_name: 'lastName',
  confirm_password: 'confirmPassword',
  verification_code: 'verificationCode',
  non_field_errors: 'form',
  detail: 'form',
}

function getFirstMessage(value) {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  if (typeof value === 'string') {
    return value
  }

  return ''
}

function getFallbackMessage(mode, error, t) {
  if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
    return t(`${mode}.errors.network`)
  }

  return t(`${mode}.errors.generic`)
}

function mapKnownMessage(mode, message, t) {
  const normalizedMessage = message.toLowerCase()

  if (mode === 'login' && normalizedMessage.includes('invalid email or password')) {
    return t('login.errors.invalidCredentials')
  }

  if (mode === 'login' && normalizedMessage.includes('inactive')) {
    return t('login.errors.inactiveAccount')
  }

  if (mode === 'login' && normalizedMessage.includes('email verification is required')) {
    return t('login.errors.emailVerificationRequired')
  }

  return message
}

export function getAuthErrorCode(error) {
  if (!axios.isAxiosError(error)) {
    return null
  }

  const code = error.response?.data?.code

  if (Array.isArray(code)) {
    return code[0] ?? null
  }

  return typeof code === 'string' ? code : null
}

export function mapAuthErrors(error, t, mode) {
  if (!axios.isAxiosError(error)) {
    return { form: getFallbackMessage(mode, error, t) }
  }

  const responseData = error.response?.data

  if (!responseData) {
    return { form: getFallbackMessage(mode, error, t) }
  }

  if (typeof responseData === 'string') {
    return { form: mapKnownMessage(mode, responseData, t) }
  }

  const formattedErrors = Object.entries(responseData).reduce((errors, [key, value]) => {
    const message = getFirstMessage(value)

    if (!message) {
      return errors
    }

    const fieldKey = FIELD_NAME_MAP[key] ?? key
    errors[fieldKey] = mapKnownMessage(mode, message, t)
    return errors
  }, {})

  if (Object.keys(formattedErrors).length > 0) {
    return formattedErrors
  }

  return { form: getFallbackMessage(mode, error, t) }
}
