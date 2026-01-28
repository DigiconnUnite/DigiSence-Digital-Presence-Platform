'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string, force?: boolean) => Promise<{ success: boolean; error?: string; user?: AuthUser }>
  logout: () => Promise<void>
  loading: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  
  const checkAuth = useCallback(async () => {
    try {
      console.log('[DEBUG] AuthContext - checkAuth starting');
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch('/api/auth/me', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      })

      clearTimeout(timeoutId)

      console.log('[DEBUG] AuthContext - /api/auth/me response:', response.ok, response.status);

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        console.log('[DEBUG] AuthContext - User set to:', data.user);
      } else {
        setUser(null)
        console.log('[DEBUG] AuthContext - No valid auth, user set to null');
      }
    } catch (error) {
      console.log('[DEBUG] AuthContext - checkAuth error:', error);
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const refreshAuth = useCallback(async () => {
    await checkAuth()
  }, [checkAuth])

  const login = useCallback(async (email: string, password: string, force = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, force }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, user: data.user }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }))
        return { success: false, error: errorData.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Silent fail for logout
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshAuth }}>
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
