import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useFarm } from '../context/FarmContext'

const empty = { name: '', type: 'Chicken', breed: '', count: '', house: '', purpose: 'Eggs', dateAcquired: '', avgWeight: '', status: 'Active', mortality: 0 }

export default function Flocks() {
  const { flocks, addFlock, updateFlock, deleteFlock } = useFarm()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true) }
  const openEdit = (f) => { setForm(f); setEditId(f.id); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) updateFlock(editId, form)
    else addFlock(form)
    setModal(false)
  }

  return (
    <Layout title="Flocks">
      <div className="flex justify-end mb-6">
        <button className="btn-primary" onClick={openAdd}><Plus size={16} />Add Flock</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {flocks.map(f => (
          <div key={f.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{f.name}</h3>
                <p className="text-sm text-gray-400">{f.type} · {f.breed}</p>
              </div>
              <Badge label={f.status} />
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-400">Birds</span>
              <span className="font-medium text-gray-800">{f.count.toLocaleString()}</span>
              <span className="text-gray-400">House</span>
              <span className="text-gray-700">{f.house}</span>
              <span className="text-gray-400">Purpose</span>
              <span className="text-gray-700">{f.purpose}</span>
              <span className="text-gray-400">Avg Weight</span>
              <span className="text-gray-700">{f.avgWeight} kg</span>
              <span className="text-gray-400">Acquired</span>
              <span className="text-gray-700">{f.dateAcquired}</span>
              <span className="text-gray-400">Mortality</span>
              <span className={`font-medium ${f.mortality > 10 ? 'text-red-600' : 'text-gray-700'}`}>{f.mortality}</span>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => openEdit(f)} className="btn-secondary flex-1 justify-center text-xs py-1.5"><Pencil size={13} />Edit</button>
              <button onClick={() => deleteFlock(f.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} />Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Flock' : 'Add Flock'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Flock Name</label>
            <input className="input" required value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                {['Chicken','Turkey','Duck','Guinea Fowl'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Breed</label>
              <input className="input" value={form.breed} onChange={e => setForm(f=>({...f,breed:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Count</label>
              <input className="input" type="number" required value={form.count} onChange={e => setForm(f=>({...f,count:e.target.value}))} />
            </div>
            <div>
              <label className="label">House / Location</label>
              <input className="input" value={form.house} onChange={e => setForm(f=>({...f,house:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Purpose</label>
              <select className="input" value={form.purpose} onChange={e => setForm(f=>({...f,purpose:e.target.value}))}>
                {['Eggs','Meat','Eggs & Meat'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date Acquired</label>
              <input className="input" type="date" value={form.dateAcquired} onChange={e => setForm(f=>({...f,dateAcquired:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Avg Weight (kg)</label>
              <input className="input" type="number" step="0.1" value={form.avgWeight} onChange={e => setForm(f=>({...f,avgWeight:e.target.value}))} />
            </div>
            <div>
              <label className="label">Mortality</label>
              <input className="input" type="number" value={form.mortality} onChange={e => setForm(f=>({...f,mortality:e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{editId ? 'Save Changes' : 'Add Flock'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
