import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Simple deterministic hash — good enough for a localStorage-only app.
// Not cryptographic; just prevents plain-text password storage.
function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    hash = (Math.imul(31, hash) + password.charCodeAt(i)) | 0
  }
  return hash.toString(16)
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem('yieldflow_users') || '{}')
  } catch {
    return {}
  }
}

function saveUsers(users) {
  localStorage.setItem('yieldflow_users', JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('yieldflow_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Returns true on success, or an error string on failure.
  const login = (email, password) => {
    const users = loadUsers()
    const key = email.toLowerCase().trim()
    const record = users[key]

    if (!record) return 'No account found for this email.'
    if (record.passwordHash !== hashPassword(password)) return 'Incorrect password.'

    const sessionUser = {
      id: record.id,
      name: record.name,
      email: record.email,
      farm: record.farm,
      role: record.role,
    }
    localStorage.setItem('yieldflow_user', JSON.stringify(sessionUser))
    setUser(sessionUser)
    return true
  }

  // Returns true on success, or an error string on failure.
  const register = (name, email, farm, password) => {
    const users = loadUsers()
    const key = email.toLowerCase().trim()

    if (users[key]) return 'An account with this email already exists.'

    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email: key,
      farm,
      role: 'admin',
      passwordHash: hashPassword(password),
    }
    users[key] = newUser
    saveUsers(users)

    const sessionUser = { id: newUser.id, name, email: key, farm, role: 'admin' }
    localStorage.setItem('yieldflow_user', JSON.stringify(sessionUser))
    setUser(sessionUser)
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
