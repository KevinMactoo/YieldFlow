import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useFarm } from '../context/FarmContext'

const empty = { tag: '', name: '', type: 'Cattle', breed: '', sex: 'Female', dob: '', weight: '', status: 'Active', notes: '' }

export default function Livestock() {
  const { livestock, addAnimal, updateAnimal, deleteAnimal } = useFarm()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const types = ['All', ...new Set(livestock.map(a => a.type))]

  const filtered = livestock.filter(a => {
    const matchType = typeFilter === 'All' || a.type === typeFilter
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.tag.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true) }
  const openEdit = (a) => { setForm(a); setEditId(a.id); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) updateAnimal(editId, form)
    else addAnimal(form)
    setModal(false)
  }

  return (
    <Layout title="Livestock">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or tag…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                typeFilter === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {t}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} />Add Animal</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-medium">
              {['Tag','Name','Type','Breed','Sex','DOB','Weight (kg)','Status',''].map(h => (
                <th key={h} className="text-left py-3 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-xs text-gray-500">{a.tag}</td>
                <td className="py-3 pr-4 font-medium text-gray-900">{a.name}</td>
                <td className="py-3 pr-4 text-gray-500">{a.type}</td>
                <td className="py-3 pr-4 text-gray-500">{a.breed}</td>
                <td className="py-3 pr-4 text-gray-500">{a.sex}</td>
                <td className="py-3 pr-4 text-gray-500">{a.dob}</td>
                <td className="py-3 pr-4 text-gray-500">{a.weight}</td>
                <td className="py-3 pr-4"><Badge label={a.status} /></td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Pencil size={15} /></button>
                  <button onClick={() => deleteAnimal(a.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-gray-400">No animals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Animal' : 'Add Animal'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[['tag','Tag ID'],['name','Name']].map(([k,l]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input className="input" required value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                {['Cattle','Goat','Pig','Sheep','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Breed</label>
              <input className="input" value={form.breed} onChange={e => setForm(f=>({...f,breed:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Sex</label>
              <select className="input" value={form.sex} onChange={e => setForm(f=>({...f,sex:e.target.value}))}>
                {['Female','Male'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input className="input" type="date" value={form.dob} onChange={e => setForm(f=>({...f,dob:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Weight (kg)</label>
              <input className="input" type="number" value={form.weight} onChange={e => setForm(f=>({...f,weight:e.target.value}))} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                {['Active','Sick','Sold','Deceased'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{editId ? 'Save Changes' : 'Add Animal'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
