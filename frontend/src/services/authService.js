import api from './api'

export async function register(payload) {
  const response = await api.post('auth/register/', payload)
  return response.data
}

export async function login(payload) {
  const response = await api.post('auth/login/', payload)
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get('auth/me/')
  return response.data
}

const authService = {
  register,
  login,
  getCurrentUser,
}

export default authService
