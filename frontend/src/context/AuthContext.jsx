import { createContext, startTransition, useContext, useEffect, useState } from 'react'

import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const response = await authService.getCurrentUser()

        if (isMounted) {
          startTransition(() => {
            setUser(response.data.user)
          })
        }
      } catch {
        // Token invalid or missing — clear it
        localStorage.removeItem('auth_token')
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setBootstrapping(false)
        }
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (payload) => {
    const response = await authService.login(payload)
    // Save token to localStorage so it works in incognito mode too
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    startTransition(() => {
      setUser(response.data.user)
    })
    return response
  }

  const register = async (payload) => {
    const response = await authService.register(payload)
    // Save token to localStorage so it works in incognito mode too
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
    }
    startTransition(() => {
      setUser(response.data.user)
    })
    return response
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      // Always clear token from localStorage on logout
      localStorage.removeItem('auth_token')
      startTransition(() => {
        setUser(null)
      })
    }
  }

  const refreshSession = async () => {
    const response = await authService.getCurrentUser()
    startTransition(() => {
      setUser(response.data.user)
    })
    return response
  }

  return (
    <AuthContext.Provider
      value={{
        bootstrapping,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refreshSession,
        register,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}