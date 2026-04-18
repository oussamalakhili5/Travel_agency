const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

function isBlank(value) {
  return !String(value ?? '').trim()
}

function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim())
}

export function validateLoginForm(values, t) {
  const errors = {}

  if (isBlank(values.email)) {
    errors.email = t('login.validation.requiredEmail')
  } else if (!isValidEmail(values.email)) {
    errors.email = t('login.validation.invalidEmail')
  }

  if (isBlank(values.password)) {
    errors.password = t('login.validation.requiredPassword')
  }

  return errors
}

export function validateRegisterForm(values, t) {
  const errors = {}

  if (isBlank(values.firstName)) {
    errors.firstName = t('register.validation.requiredFirstName')
  }

  if (isBlank(values.lastName)) {
    errors.lastName = t('register.validation.requiredLastName')
  }

  if (isBlank(values.email)) {
    errors.email = t('register.validation.requiredEmail')
  } else if (!isValidEmail(values.email)) {
    errors.email = t('register.validation.invalidEmail')
  }

  if (isBlank(values.phone)) {
    errors.phone = t('register.validation.requiredPhone')
  }

  if (isBlank(values.password)) {
    errors.password = t('register.validation.requiredPassword')
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = t('register.validation.passwordMinLength', {
      count: MIN_PASSWORD_LENGTH,
    })
  }

  if (isBlank(values.confirmPassword)) {
    errors.confirmPassword = t('register.validation.requiredConfirmPassword')
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = t('register.validation.passwordMismatch')
  }

  return errors
}

export function buildLoginPayload(values) {
  return {
    email: values.email.trim(),
    password: values.password,
  }
}

export function buildRegisterPayload(values) {
  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    password: values.password,
    confirm_password: values.confirmPassword,
  }
}
