import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Supabase automatically detects the token from the URL
  // (detectSessionInUrl: true in supabase.js) and establishes a session,
  // so we just call updateUser({ password }) directly.

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    const result = await resetPassword(form.password)
    setLoading(false)

    if (result === true) {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } else {
      setError(result)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Leaf size={24} className="text-white" />
          </div>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-primary-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Password updated</h2>
              <p className="text-sm text-gray-500">Redirecting you to login…</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Reset password</h1>
              <p className="text-sm text-gray-500 mb-4">Enter your new password below.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}
                <div>
                  <label className="label">New Password</label>
                  <input className="input" type="password" required minLength={6} placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input className="input" type="password" required placeholder="••••••••"
                    value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                  {loading ? 'Updating…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to login</Link>
          </p>
        )}
      </div>
    </div>
  )
}
