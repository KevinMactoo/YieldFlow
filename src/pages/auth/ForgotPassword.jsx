import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, CheckCircle, Copy, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const result = requestPasswordReset(email)
    if (typeof result === 'string') {
      setError(result)
      return
    }

    // Build the reset URL using the current origin so it works on any host
    const link = `${window.location.origin}/reset-password?token=${result.token}`
    setResetLink(link)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(resetLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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
          {resetLink ? (
            <div className="text-center py-2">
              <CheckCircle size={40} className="text-primary-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Reset link ready</h2>
              <p className="text-sm text-gray-500 mb-4">
                Copy the link below and open it to set your new password. It expires in 30 minutes.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-left mb-3">
                <p className="text-xs text-gray-500 break-all">{resetLink}</p>
              </div>
              <button
                onClick={handleCopy}
                className="btn-primary w-full justify-center py-2 gap-2"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <Link to="/login" className="block mt-3 text-sm text-primary-600 hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Forgot password?</h1>
              <p className="text-sm text-gray-500 mb-4">
                Enter your account email to generate a password reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    required
                    placeholder="you@farm.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-2.5">
                  Generate Reset Link
                </button>
              </form>
            </>
          )}
        </div>

        {!resetLink && (
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
