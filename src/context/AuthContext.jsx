import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('yieldflow_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (email, password) => {
    // Mock auth — accept any credentials
    const mockUser = { id: 1, name: 'Farm Manager', email, role: 'admin', farm: 'KukuFarm' }
    localStorage.setItem('yieldflow_user', JSON.stringify(mockUser))
    setUser(mockUser)
    return true
  }

  const register = (name, email, farm) => {
    const mockUser = { id: 1, name, email, role: 'admin', farm }
    localStorage.setItem('yieldflow_user', JSON.stringify(mockUser))
    setUser(mockUser)
    return true
  }

  const logout = () => {
    localStorage.removeItem('yieldflow_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
