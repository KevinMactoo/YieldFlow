import { useState } from 'react'
import { Plus, Trash2, Search, ShoppingCart, TrendingUp, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import { useFarm } from '../context/FarmContext'

const empty = { date: new Date().toISOString().slice(0, 10), product: '', quantity: '', unit: 'kg', unitPrice: '', total: '', buyer: '', paymentStatus: 'Paid' }

export default function Sales() {
  const { salesData, addSale, deleteSale } = useFarm()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)

  const totalRevenue = salesData.reduce((s, x) => s + Number(x.total), 0)
  const pendingPayment = salesData.filter(s => s.paymentStatus === 'Pending').reduce((s, x) => s + Number(x.total), 0)

  const filtered = [...salesData]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(s => s.product.toLowerCase().includes(search.toLowerCase()) || s.buyer.toLowerCase().includes(search.toLowerCase()))

  const handleSubmit = (e) => {
    e.preventDefault()
    const total = (Number(form.quantity) * Number(form.unitPrice)).toFixed(2)
    addSale({ ...form, total: Number(total) })
    setModal(false)
    setForm(empty)
  }

  return (
    <Layout title="Sales">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={ShoppingCart} label="Total Revenue"      value={`KSH ${totalRevenue.toLocaleString()}`}    color="primary" />
        <StatCard icon={TrendingUp}   label="Total Transactions" value={salesData.length}                           color="blue" />
        <StatCard icon={Clock}        label="Pending Payments"   value={`KSH ${pendingPayment.toLocaleString()}`}   color="amber" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Search product or buyer…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-primary ml-auto" onClick={() => setModal(true)}><Plus size={16} />Record Sale</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-medium">
              {['Date','Product','Qty','Unit Price','Total','Buyer','Payment',''].map(h => (
                <th key={h} className="text-left py-3 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 text-gray-500">{s.date}</td>
                <td className="py-3 pr-4 font-medium text-gray-900">{s.product}</td>
                <td className="py-3 pr-4 text-gray-500">{s.quantity} {s.unit}</td>
                <td className="py-3 pr-4 text-gray-500">KSH {s.unitPrice}</td>
                <td className="py-3 pr-4 font-semibold text-gray-900">KSH {Number(s.total).toLocaleString()}</td>
                <td className="py-3 pr-4 text-gray-500">{s.buyer}</td>
                <td className="py-3 pr-4"><Badge label={s.paymentStatus} /></td>
                <td className="py-3">
                  <button onClick={() => deleteSale(s.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-gray-400">No sales records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Record Sale">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" required value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
            </div>
            <div>
              <label className="label">Product</label>
              <input className="input" required value={form.product} onChange={e => setForm(f=>({...f,product:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input className="input" type="number" required value={form.quantity} onChange={e => setForm(f=>({...f,quantity:e.target.value}))} />
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="input" value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))}>
                {['kg','tonnes','litres','pieces','bags','crates'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit Price (KSH)</label>
              <input className="input" type="number" step="0.01" required value={form.unitPrice} onChange={e => setForm(f=>({...f,unitPrice:e.target.value}))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Buyer</label>
              <input className="input" value={form.buyer} onChange={e => setForm(f=>({...f,buyer:e.target.value}))} />
            </div>
            <div>
              <label className="label">Payment Status</label>
              <select className="input" value={form.paymentStatus} onChange={e => setForm(f=>({...f,paymentStatus:e.target.value}))}>
                {['Paid','Pending'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {form.quantity && form.unitPrice && (
            <p className="text-sm font-medium text-primary-700 bg-primary-50 rounded-lg px-3 py-2">
              Total: KSH {(Number(form.quantity) * Number(form.unitPrice)).toLocaleString()}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Record Sale</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
