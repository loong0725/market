'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '../lib/api'

type User = {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  is_verified?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (data: {
    username: string
    email: string
    password: string
    confirm_password?: string
    first_name?: string
    last_name?: string
    ait_email?: string
  }) => Promise<{ success: boolean; error?: string; fieldErrors?: Record<string, string>; registrationSucceeded?: boolean }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null
    if (token) {
      try {
        await refreshUser()
      } catch (err) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
      }
    }
    setLoading(false)
  }

  const refreshUser = async () => {
    try {
      const response = await apiClient.getProfile()
      if (response.data) {
        setUser(response.data)
      } else {
        throw new Error('Failed to get profile')
      }
    } catch (err) {
      setUser(null)
      throw err
    }
  }

  const login = async (username: string, password: string) => {
    try {
      // JWT expects 'username' not 'email'
      const response = await apiClient.login({ email: username, password: password })
      if (response.data?.access) {
        localStorage.setItem('access', response.data.access)
        if (response.data.refresh) {
          localStorage.setItem('refresh', response.data.refresh)
        }
        await refreshUser()
        return { success: true }
      } else {
        return { success: false, error: response.error || 'Login failed' }
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' }
    }
  }

  const register = async (data: {
    username: string
    email: string
    password: string
    confirm_password?: string
  }) => {
    try {
      // Ensure confirm_password is included
      const registerData = {
        ...data,
        confirm_password: data.confirm_password || data.password
      }
      const response = await apiClient.register(registerData)
      if (response.status === 201 || response.data) {
        // Registration successful - try auto login
        // Use username for login (JWT expects username field)
        try {
          const loginResponse = await login(data.username, data.password)
          if (loginResponse.success) {
            return loginResponse
          } else {
            // Auto-login failed but registration succeeded
            // Return success with a note that user needs to login manually
            return { 
              success: false, 
              error: 'Registration successful but automatic login failed. Please login manually.',
              registrationSucceeded: true 
            }
          }
        } catch (loginErr) {
          // Auto-login failed but registration succeeded
          return { 
            success: false, 
            error: 'Registration successful but automatic login failed. Please login manually.',
            registrationSucceeded: true 
          }
        }
      } else {
        // Extract field-specific errors from DRF response
        const fieldErrors: Record<string, string> = {}
        
        if (response.data && typeof response.data === 'object') {
          Object.entries(response.data).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              // DRF returns errors as arrays
              fieldErrors[key] = value[0] // Take first error message
            } else if (typeof value === 'string') {
              fieldErrors[key] = value
            } else if (typeof value === 'object' && value !== null) {
              // Handle nested errors
              Object.entries(value).forEach(([subKey, subValue]) => {
                if (Array.isArray(subValue) && subValue.length > 0) {
                  fieldErrors[`${key}.${subKey}`] = subValue[0]
                } else if (typeof subValue === 'string') {
                  fieldErrors[`${key}.${subKey}`] = subValue
                }
              })
            }
          })
        }
        
        // If we have field errors, return them; otherwise use general error
        if (Object.keys(fieldErrors).length > 0) {
          return { 
            success: false, 
            error: 'Validation failed', 
            fieldErrors: fieldErrors 
          }
        }
        
        return { 
          success: false, 
          error: response.error || 'Registration failed' 
        }
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

