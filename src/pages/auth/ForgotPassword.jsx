import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
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
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-primary-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Check your email</h2>
              <p className="text-sm text-gray-500">We sent a reset link to <strong>{email}</strong>.</p>
              <Link to="/login" className="btn-primary mt-4 justify-center">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Forgot password?</h1>
              <p className="text-sm text-gray-500 mb-4">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" required placeholder="you@farm.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-2.5">Send Reset Link</button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
