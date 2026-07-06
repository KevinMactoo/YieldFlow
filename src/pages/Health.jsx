import { useState } from 'react'
import { Plus, Pencil, HeartPulse } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import { useFarm } from '../context/FarmContext'
import { usePermission } from '../hooks/usePermission'

const empty = { date: new Date().toISOString().slice(0, 10), animal: '', type: 'Treatment', diagnosis: '', treatment: '', vet: '', cost: '', followUp: '', status: 'Ongoing' }

export default function Health() {
  const { health, addHealth, updateHealth } = useFarm()
  const { can } = usePermission()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)

  const ongoing = health.filter(h => h.status === 'Ongoing').length
  const totalCost = health.reduce((s, h) => s + Number(h.cost), 0)

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true) }
  const openEdit = (h) => { setForm(h); setEditId(h.id); setModal(true) }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) updateHealth(editId, form)
    else addHealth(form)
    setModal(false)
  }

  return (
    <Layout title="Health Records">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={HeartPulse} label="Total Records"  value={health.length}                          color="primary" />
        <StatCard icon={HeartPulse} label="Ongoing Cases"  value={ongoing}                               color={ongoing > 0 ? 'red' : 'primary'} />
        <StatCard icon={HeartPulse} label="Total Vet Cost" value={`KSH ${totalCost.toLocaleString()}`}   color="amber" />
      </div>

      <div className="flex justify-end mb-4">
        {can('health:add') && (
          <button className="btn-primary" onClick={openAdd}><Plus size={16} />Add Record</button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-medium">
              {['Date','Animal','Type','Diagnosis','Treatment','Vet','Cost','Follow-up','Status',''].map(h => (
                <th key={h} className="text-left py-3 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {health.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 text-gray-500">{r.date}</td>
                <td className="py-3 pr-4 font-medium text-gray-900">{r.animal}</td>
                <td className="py-3 pr-4 text-gray-500">{r.type}</td>
                <td className="py-3 pr-4 text-gray-700">{r.diagnosis}</td>
                <td className="py-3 pr-4 text-gray-500 max-w-[160px] truncate">{r.treatment}</td>
                <td className="py-3 pr-4 text-gray-500">{r.vet}</td>
                <td className="py-3 pr-4 text-gray-700">KSH {r.cost}</td>
                <td className="py-3 pr-4 text-gray-500">{r.followUp || '—'}</td>
                <td className="py-3 pr-4"><Badge label={r.status} /></td>
                <td className="py-3">
                  {can('health:edit') && (
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400"><Pencil size={15} /></button>
                  )}
                </td>
              </tr>
            ))}
            {health.length === 0 && (
              <tr><td colSpan={10} className="py-8 text-center text-gray-400">No health records.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Health Record' : 'Add Health Record'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" required value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                {['Treatment','Vaccination','Routine Check','Surgery'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Animal / Group</label>
            <input className="input" required value={form.animal} onChange={e => setForm(f=>({...f,animal:e.target.value}))} />
          </div>
          <div>
            <label className="label">Diagnosis / Reason</label>
            <input className="input" required value={form.diagnosis} onChange={e => setForm(f=>({...f,diagnosis:e.target.value}))} />
          </div>
          <div>
            <label className="label">Treatment / Vaccine</label>
            <input className="input" value={form.treatment} onChange={e => setForm(f=>({...f,treatment:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Vet / Handler</label>
              <input className="input" value={form.vet} onChange={e => setForm(f=>({...f,vet:e.target.value}))} />
            </div>
            <div>
              <label className="label">Cost (KSH)</label>
              <input className="input" type="number" value={form.cost} onChange={e => setForm(f=>({...f,cost:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Follow-up Date</label>
              <input className="input" type="date" value={form.followUp} onChange={e => setForm(f=>({...f,followUp:e.target.value}))} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                {['Ongoing','Done'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{editId ? 'Save Changes' : 'Add Record'}</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
