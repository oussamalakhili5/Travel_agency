import { useEffect, useState } from 'react'
import authService from '../services/authService'
import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  storeAuthSession,
  storeUser,
} from '../utils/authStorage'
import AuthContext from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      const accessToken = getAccessToken()
      const storedUser = getStoredUser()

      if (!accessToken) {
        clearAuthSession()

        if (isMounted) {
          setUser(null)
          setIsInitializing(false)
        }

        return
      }

      if (storedUser && isMounted) {
        setUser(storedUser)
      }

      try {
        const currentUser = await authService.getCurrentUser()

        storeUser(currentUser)

        if (isMounted) {
          setUser(currentUser)
        }
      } catch {
        clearAuthSession()

        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  async function login(credentials) {
    const authData = await authService.login(credentials)

    storeAuthSession(authData)
    setUser(authData.user)

    return authData
  }

  async function register(payload) {
    return authService.register(payload)
  }

  async function refreshUser() {
    const currentUser = await authService.getCurrentUser()

    storeUser(currentUser)
    setUser(currentUser)

    return currentUser
  }

  function logout() {
    clearAuthSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        login,
        register,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
