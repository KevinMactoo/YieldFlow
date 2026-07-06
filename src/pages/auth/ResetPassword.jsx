import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Leaf, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Validate the token exists on mount — give early feedback if link is broken
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.')
    }
  }, [token])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    const result = resetPassword(token, form.password)
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
                  <input
                    className="input"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    disabled={!token}
                  />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    className="input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    disabled={!token}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center py-2.5"
                  disabled={!token}
                >
                  Reset Password
                </button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
