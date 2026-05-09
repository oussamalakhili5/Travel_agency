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

export async function getHotelById(id) {
  const response = await api.get(`hotels/${id}/`)
  return response.data
}

export async function getTransports(filters = {}) {
  const response = await api.get('transports/', {
    params: buildParams(filters),
  })

  return response.data
}

export async function getTransportById(id) {
  const response = await api.get(`transports/${id}/`)
  return response.data
}

export async function getPackages(filters = {}) {
  const response = await api.get('packages/', {
    params: buildParams(filters),
  })

  return response.data
}

export async function getPackageById(id) {
  const response = await api.get(`packages/${id}/`)
  return response.data
}

const catalogService = {
  getHotels,
  getHotelById,
  getTransports,
  getTransportById,
  getPackages,
  getPackageById,
}

export default catalogService
