import axios from 'axios'

function getFirstMessage(value) {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  if (typeof value === 'string') {
    return value
  }

  return ''
}

export function mapReservationErrors(error, t) {
  if (!axios.isAxiosError(error)) {
    return { form: t('reservations.errors.generic') }
  }

  if (error.code === 'ERR_NETWORK') {
    return { form: t('reservations.errors.network') }
  }

  const responseData = error.response?.data

  if (!responseData || typeof responseData === 'string') {
    return { form: t('reservations.errors.generic') }
  }

  const formattedErrors = Object.entries(responseData).reduce((errors, [key, value]) => {
    const message = getFirstMessage(value)

    if (!message) {
      return errors
    }

    if (key === 'detail' || key === 'non_field_errors') {
      errors.form = message
      return errors
    }

    errors[key] = message
    return errors
  }, {})

  if (Object.keys(formattedErrors).length > 0) {
    return formattedErrors
  }

  return { form: t('reservations.errors.generic') }
}
