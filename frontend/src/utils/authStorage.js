const STORAGE_KEYS = {
  accessToken: 'atlasTravel.accessToken',
  refreshToken: 'atlasTravel.refreshToken',
  user: 'atlasTravel.user',
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getAccessToken() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(STORAGE_KEYS.accessToken)
}

export function getRefreshToken() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(STORAGE_KEYS.refreshToken)
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(STORAGE_KEYS.accessToken)
  window.localStorage.removeItem(STORAGE_KEYS.refreshToken)
  window.localStorage.removeItem(STORAGE_KEYS.user)
}

export function getStoredUser() {
  if (!canUseStorage()) {
    return null
  }

  const rawUser = window.localStorage.getItem(STORAGE_KEYS.user)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    clearAuthSession()
    return null
  }
}

export function storeUser(user) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function storeAuthSession({ access, refresh, user }) {
  if (!canUseStorage()) {
    return
  }

  if (access) {
    window.localStorage.setItem(STORAGE_KEYS.accessToken, access)
  }

  if (refresh) {
    window.localStorage.setItem(STORAGE_KEYS.refreshToken, refresh)
  }

  if (user) {
    storeUser(user)
  }
}
