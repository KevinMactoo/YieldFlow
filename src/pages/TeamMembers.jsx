import { useEffect, useState } from 'react'
import { UserPlus, Trash2, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ROLE_META } from '../lib/permissions'

const ROLES = ['manager', 'accountant', 'farmer']

export default function TeamMembers() {
  const { user, inviteUser } = useAuth()
  const [members,  setMembers]  = useState([])
  const [invites,  setInvites]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({ name: '', email: '', role: 'farmer' })
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function load() {
    setLoading(true)
    const [{ data: profiles }, { data: pendingInvites }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, role, created_at')
        .eq('farm_id', user.farmId),
      supabase
        .from('invites')
        .select('id, email, role, created_at')
        .eq('farm_id', user.farmId)
        .is('accepted_at', null),
    ])
    setMembers(profiles || [])
    setInvites(pendingInvites || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [user.farmId])

  async function handleChangeRole(memberId, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
  }

  async function handleRemove(memberId) {
    if (!window.confirm('Remove this team member?')) return
    await supabase.from('profiles').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  async function handleCancelInvite(inviteId) {
    await supabase.from('invites').delete().eq('id', inviteId)
    setInvites(prev => prev.filter(i => i.id !== inviteId))
  }

  async function handleInvite(e) {
    e.preventDefault()
    setSubmitting(true)
    setFeedback('')
    const result = await inviteUser(form.email, form.name, form.role)
    setSubmitting(false)
    if (result === true) {
      setFeedback(`Invite sent to ${form.email}.`)
      setForm({ name: '', email: '', role: 'farmer' })
      load()
      setTimeout(() => { setModal(false); setFeedback('') }, 1500)
    } else {
      setFeedback(result)
    }
  }

  return (
    <Layout title="Team Members">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''} in <span className="font-medium text-gray-800">{user.farm}</span></p>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary py-2"><RefreshCw size={15} /></button>
          <button onClick={() => setModal(true)} className="btn-primary"><UserPlus size={16} />Invite Member</button>
        </div>
      </div>

      {/* Active members */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Active Members</h2>
        {loading ? (
          <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>
        ) : (
          <div className="space-y-3">
            {members.map(m => {
              const meta = ROLE_META[m.role] || {}
              const isSelf = m.id === user.id
              return (
                <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{m.name} {isSelf && <span className="text-xs text-gray-400">(you)</span>}</p>
                  </div>
                  {/* Role selector — owner can change any non-self role */}
                  {!isSelf ? (
                    <select
                      value={m.role}
                      onChange={e => handleChangeRole(m.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none"
                    >
                      {['owner', ...ROLES].map(r => (
                        <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                  )}
                  {!isSelf && (
                    <button onClick={() => handleRemove(m.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pending Invites</h2>
          <div className="space-y-2">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{inv.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_META[inv.role]?.color}`}>
                  {ROLE_META[inv.role]?.label}
                </span>
                <Badge label="Pending" />
                <button onClick={() => handleCancelInvite(inv.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite modal */}
      <Modal open={modal} onClose={() => { setModal(false); setFeedback('') }} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          {feedback && (
            <p className={`text-sm px-3 py-2 rounded-lg ${feedback.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}>
              {feedback}
            </p>
          )}
          <div>
            <label className="label">Full Name</label>
            <input className="input" required placeholder="Jane Doe"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required placeholder="jane@farm.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => (
                <option key={r} value={r}>{ROLE_META[r]?.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {form.role === 'manager'    && 'Full farm operations access, no finances.'}
              {form.role === 'accountant' && 'Read farm data, full access to finances and sales.'}
              {form.role === 'farmer'     && 'Read-only access. Can add daily logs and tasks.'}
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Sending…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
