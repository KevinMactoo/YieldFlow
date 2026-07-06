import { useState } from 'react'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useFarm } from '../context/FarmContext'
import { useAuth } from '../context/AuthContext'
import { usePermission } from '../hooks/usePermission'

const CATEGORIES = ['Crops', 'Livestock', 'Flocks', 'Infrastructure', 'Finance', 'General']

const empty = { date: new Date().toISOString().slice(0, 10), category: 'General', title: '', description: '', author: '' }

export default function DailyLogs() {
  const { logs, addLog, deleteLog } = useFarm()
  const { user } = useAuth()
  const { can } = usePermission()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ ...empty, author: user?.name ?? '' })
  const [catFilter, setCatFilter] = useState('All')

  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  const filtered = sorted.filter(l => catFilter === 'All' || l.category === catFilter)

  // Group by date
  const grouped = filtered.reduce((acc, log) => {
    const d = log.date
    if (!acc[d]) acc[d] = []
    acc[d].push(log)
    return acc
  }, {})

  const handleSubmit = (e) => {
    e.preventDefault()
    addLog(form)
    setModal(false)
    setForm({ ...empty, author: user?.name ?? '' })
  }

  return (
    <Layout title="Daily Logs">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 flex-wrap">
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                catFilter === c ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {c}
            </button>
          ))}
        </div>
        {can('logs:add') && <button className="btn-primary ml-auto" onClick={() => setModal(true)}><Plus size={16} />Add Log</button>}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{date}</h3>
            <div className="space-y-2">
              {entries.map(log => (
                <div key={log.id} className="card flex gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{log.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge label={log.category} variant="blue" />
                        {can('logs:delete') && <button onClick={() => deleteLog(log.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">By {log.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card py-12 text-center text-gray-400">No log entries found.</div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Log Entry">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" required value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" required value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} required value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
          </div>
          <div>
            <label className="label">Author</label>
            <input className="input" value={form.author} onChange={e => setForm(f=>({...f,author:e.target.value}))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Save Log</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
