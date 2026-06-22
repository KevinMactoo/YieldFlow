import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useFarm } from '../context/FarmContext'

const empty = { title: '', category: 'Crops', priority: 'Medium', dueDate: '', assignee: '', status: 'Pending', notes: '' }

const STATUSES = ['Pending', 'In Progress', 'Completed']
const PRIORITIES = ['High', 'Medium', 'Low']
const CATEGORIES = ['Crops', 'Livestock', 'Flocks', 'Infrastructure', 'Supplies', 'Finance', 'Other']

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useFarm()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const filtered = tasks.filter(t => {
    const ms = statusFilter === 'All' || t.status === statusFilter
    const mq = t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee.toLowerCase().includes(search.toLowerCase())
    return ms && mq
  })

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true) }
  const openEdit = (t) => { setForm(t); setEditId(t.id); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) updateTask(editId, form)
    else addTask(form)
    setModal(false)
  }

  const toggleStatus = (task) => {
    const next = { Pending: 'In Progress', 'In Progress': 'Completed', Completed: 'Pending' }
    updateTask(task.id, { status: next[task.status] })
  }

  return (
    <Layout title="Tasks">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {['All', ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {s}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} />Add Task</button>
      </div>

      <div className="space-y-2">
        {filtered.map(t => (
          <div key={t.id} className={`card flex items-center gap-4 py-3 px-4 ${t.status === 'Completed' ? 'opacity-60' : ''}`}>
            <button onClick={() => toggleStatus(t)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              t.status === 'Completed' ? 'bg-primary-600 border-primary-600' :
              t.status === 'In Progress' ? 'border-blue-400' : 'border-gray-300'
            }`}>
              {t.status === 'Completed' && <div className="w-2 h-2 bg-white rounded-full" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${t.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.category} · {t.assignee} · Due {t.dueDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge label={t.priority} />
              <Badge label={t.status} />
              <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Pencil size={14} /></button>
              <button onClick={() => deleteTask(t.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card py-12 text-center text-gray-400">No tasks found.</div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Task Title</label>
            <input className="input" required value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input className="input" type="date" required value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} />
            </div>
            <div>
              <label className="label">Assignee</label>
              <input className="input" value={form.assignee} onChange={e => setForm(f=>({...f,assignee:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{editId ? 'Save Changes' : 'Add Task'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
