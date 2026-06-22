import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FarmProvider } from './context/FarmContext'

// Pages
import Dashboard    from './pages/Dashboard'
import Crops        from './pages/Crops'
import Livestock    from './pages/Livestock'
import Flocks       from './pages/Flocks'
import Tasks        from './pages/Tasks'
import DailyLogs    from './pages/DailyLogs'
import Health       from './pages/Health'
import Sales        from './pages/Sales'
import Finances     from './pages/Finances'
import Reports      from './pages/Reports'
import Login        from './pages/auth/Login'
import Register     from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login"          element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register"       element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/reset-password"  element={<GuestRoute><ResetPassword /></GuestRoute>} />

      {/* Protected app routes */}
      <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/crops"     element={<ProtectedRoute><Crops /></ProtectedRoute>} />
      <Route path="/livestock" element={<ProtectedRoute><Livestock /></ProtectedRoute>} />
      <Route path="/flocks"    element={<ProtectedRoute><Flocks /></ProtectedRoute>} />
      <Route path="/tasks"     element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/daily-logs" element={<ProtectedRoute><DailyLogs /></ProtectedRoute>} />
      <Route path="/health"    element={<ProtectedRoute><Health /></ProtectedRoute>} />
      <Route path="/sales"     element={<ProtectedRoute><Sales /></ProtectedRoute>} />
      <Route path="/finances"  element={<ProtectedRoute><Finances /></ProtectedRoute>} />
      <Route path="/reports"   element={<ProtectedRoute><Reports /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <AppRoutes />
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
