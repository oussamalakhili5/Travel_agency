import api from './api'

export async function getMyPayments() {
  const response = await api.get('payments/')
  return response.data
}

export async function getPaymentById(id) {
  const response = await api.get(`payments/${id}/`)
  return response.data
}

export async function initiatePayment(payload) {
  const response = await api.post('payments/', payload)
  return response.data
}

export async function confirmPayment(id) {
  const response = await api.post(`payments/${id}/confirm/`)
  return response.data
}

export async function failPayment(id, reason = 'Mock payment failed.') {
  const response = await api.post(`payments/${id}/fail/`, { reason })
  return response.data
}

export async function cancelPayment(id) {
  const response = await api.post(`payments/${id}/cancel/`)
  return response.data
}

const paymentService = {
  getMyPayments,
  getPaymentById,
  initiatePayment,
  confirmPayment,
  failPayment,
  cancelPayment,
}

export default paymentService
