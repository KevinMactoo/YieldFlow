import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FarmProvider } from './context/FarmContext'
import { can } from './lib/permissions'

// ─── Lazy-loaded pages (splits the bundle per route) ─────────────────────────
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Crops         = lazy(() => import('./pages/Crops'))
const Livestock     = lazy(() => import('./pages/Livestock'))
const Flocks        = lazy(() => import('./pages/Flocks'))
const Tasks         = lazy(() => import('./pages/Tasks'))
const DailyLogs     = lazy(() => import('./pages/DailyLogs'))
const Health        = lazy(() => import('./pages/Health'))
const Sales         = lazy(() => import('./pages/Sales'))
const Finances      = lazy(() => import('./pages/Finances'))
const Reports       = lazy(() => import('./pages/Reports'))
const TeamMembers   = lazy(() => import('./pages/TeamMembers'))
const Login         = lazy(() => import('./pages/auth/Login'))
const Register      = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'))

// ─── Full-screen loading spinner ─────────────────────────────────────────────
function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ─── Route guards ─────────────────────────────────────────────────────────────

// Redirect to /login if not authenticated.
// Shows spinner while the initial Supabase session check is in flight.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageSpinner />
  return user ? children : <Navigate to="/login" replace />
}

// Redirect to / if already authenticated.
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageSpinner />
  return !user ? children : <Navigate to="/" replace />
}

// Require a specific permission — redirects to / with no flash if denied.
function RoleRoute({ action, children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!can(user.role, action)) return <Navigate to="/" replace />
  return children
}

// ─── FarmProvider bridge ──────────────────────────────────────────────────────
// Must live inside AuthProvider so it can read user.farmId.
// key={user?.farmId} forces a full remount when the farm changes.
function FarmProviderBridge({ children }) {
  const { user } = useAuth()
  return (
    <FarmProvider key={user?.farmId ?? 'no-farm'} farmId={user?.farmId}>
      {children}
    </FarmProvider>
  )
}

// ─── Routes ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Guest-only auth routes */}
        <Route path="/login"           element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        {/* Reset-password is reached via email link — allow even if guest */}
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Protected app routes */}
        <Route path="/"           element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/crops"      element={<ProtectedRoute><Crops /></ProtectedRoute>} />
        <Route path="/livestock"  element={<ProtectedRoute><Livestock /></ProtectedRoute>} />
        <Route path="/flocks"     element={<ProtectedRoute><Flocks /></ProtectedRoute>} />
        <Route path="/tasks"      element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/daily-logs" element={<ProtectedRoute><DailyLogs /></ProtectedRoute>} />
        <Route path="/health"     element={<ProtectedRoute><Health /></ProtectedRoute>} />
        <Route path="/sales"      element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/finances"   element={<ProtectedRoute><Finances /></ProtectedRoute>} />
        <Route path="/reports"    element={<ProtectedRoute><Reports /></ProtectedRoute>} />

        {/* Owner-only: team member management */}
        <Route path="/team" element={
          <RoleRoute action="users:view"><TeamMembers /></RoleRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProviderBridge>
          <AppRoutes />
        </FarmProviderBridge>
      </AuthProvider>
    </BrowserRouter>
  )
}
