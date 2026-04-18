import api from './api'

function buildParams(filters) {
  return Object.entries(filters).reduce((params, [key, value]) => {
    if (value === '' || value === null || value === undefined) {
      return params
    }

    params[key] = value
    return params
  }, {})
}

export async function getHotels(filters = {}) {
  const response = await api.get('hotels/', {
    params: buildParams(filters),
  })

  return response.data
}

export async function getTransports(filters = {}) {
  const response = await api.get('transports/', {
    params: buildParams(filters),
  })

  return response.data
}

const catalogService = {
  getHotels,
  getTransports,
}

export default catalogService
