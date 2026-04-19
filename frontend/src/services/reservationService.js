import api from './api'

export async function createReservation(payload) {
  const response = await api.post('reservations/', payload)
  return response.data
}

export async function getMyReservations() {
  const response = await api.get('reservations/')
  return response.data
}

export async function getReservationById(id) {
  const response = await api.get(`reservations/${id}/`)
  return response.data
}

export async function cancelReservation(id) {
  const response = await api.post(`reservations/${id}/cancel/`)
  return response.data
}

const reservationService = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
}

export default reservationService
