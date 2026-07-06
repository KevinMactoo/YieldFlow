import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { useFarm } from '../context/FarmContext'
import { usePermission } from '../hooks/usePermission'

const empty = { name: '', variety: '', field: '', area: '', unit: 'ha', plantedDate: '', expectedHarvest: '', status: 'Growing', health: 'Good', notes: '' }

export default function Crops() {
  const { crops, addCrop, updateCrop, deleteCrop } = useFarm()
  const { can } = usePermission()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const filtered = crops.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.field.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true) }
  const openEdit = (c) => { setForm(c); setEditId(c.id); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) updateCrop(editId, form)
    else addCrop(form)
    setModal(false)
  }

  return (
    <Layout title="Crops">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Search crops…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {can('crops:add') && <button className="btn-primary ml-auto" onClick={openAdd}><Plus size={16} />Add Crop</button>}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-medium">
              {['Crop','Variety','Field','Area','Planted','Expected Harvest','Status','Health',''].map(h => (
                <th key={h} className="text-left py-3 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium text-gray-900">{c.name}</td>
                <td className="py-3 pr-4 text-gray-500">{c.variety}</td>
                <td className="py-3 pr-4 text-gray-500">{c.field}</td>
                <td className="py-3 pr-4 text-gray-500">{c.area} {c.unit}</td>
                <td className="py-3 pr-4 text-gray-500">{c.plantedDate}</td>
                <td className="py-3 pr-4 text-gray-500">{c.expectedHarvest}</td>
                <td className="py-3 pr-4"><Badge label={c.status} /></td>
                <td className="py-3 pr-4 text-gray-500">{c.health}</td>
                <td className="py-3 flex gap-2">
                  {can('crops:edit') && <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Pencil size={15} /></button>}
                  {can('crops:delete') && <button onClick={() => deleteCrop(c.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-gray-400">No crops found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Crop' : 'Add Crop'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[['name','Crop Name'],['variety','Variety'],['field','Field / Location']].map(([k,l]) => (
            <div key={k}>
              <label className="label">{l}</label>
              <input className="input" required value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Area</label>
              <input className="input" type="number" required value={form.area} onChange={e => setForm(f=>({...f,area:e.target.value}))} />
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))}>
                {['ha','acres','m²'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Planted Date</label>
              <input className="input" type="date" required value={form.plantedDate} onChange={e => setForm(f=>({...f,plantedDate:e.target.value}))} />
            </div>
            <div>
              <label className="label">Expected Harvest</label>
              <input className="input" type="date" value={form.expectedHarvest} onChange={e => setForm(f=>({...f,expectedHarvest:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                {['Seedling','Growing','Flowering','Harvesting'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Health</label>
              <select className="input" value={form.health} onChange={e => setForm(f=>({...f,health:e.target.value}))}>
                {['Excellent','Good','Fair','Poor'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{editId ? 'Save Changes' : 'Add Crop'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
