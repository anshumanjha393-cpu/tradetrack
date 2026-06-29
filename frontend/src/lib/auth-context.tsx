import { createContext, useContext, useState, ReactNode } from 'react'
import { getToken, removeToken, setToken } from './api'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * Provides authentication state (user, token) to the component tree.
 * Persists token and user to localStorage for session recovery.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken())
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (token: string, user: User) => {
    setToken(token)
    localStorage.setItem('user', JSON.stringify(user))
    setTokenState(token)
    setUser(user)
  }

  const logout = () => {
    removeToken()
    localStorage.removeItem('user')
    setTokenState(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook to access auth context. Throws if used outside `<AuthProvider>`. */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
