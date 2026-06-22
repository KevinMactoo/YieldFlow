import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', farm: '', password: '', confirm: '' })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    register(form.name, form.email, form.farm)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Leaf size={24} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">Create account</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Set up your YieldFlow farm</p>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {[['name','Full Name','text','John Doe'],['email','Email','email','you@farm.com'],['farm','Farm Name','text','My Farm']].map(([k,l,t,ph]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input className="input" type={t} required placeholder={ph}
                  value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
            {[['password','Password'],['confirm','Confirm Password']].map(([k,l]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input className="input" type="password" required placeholder="••••••••"
                  value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
            <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2">Create Account</button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
