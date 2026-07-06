import { useMemo, useState } from 'react'
import { Plus, Trash2, Wallet, TrendingDown, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import { useFarm } from '../context/FarmContext'
import { usePermission } from '../hooks/usePermission'

const COLORS = ['#16a34a','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#ec4899']
const EXPENSE_CATS = ['Feed','Labour','Veterinary','Fuel','Seeds/Inputs','Utilities','Equipment','Other']
const METHODS = ['Cash','Bank Transfer','Mobile Money','Cheque']

const empty = { date: new Date().toISOString().slice(0, 10), category: 'Feed', description: '', amount: '', vendor: '', paymentMethod: 'Cash' }

export default function Finances() {
  const { expenseData, addExpense, deleteExpense, salesData } = useFarm()
  const { can } = usePermission()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [tab, setTab] = useState('expenses')

  const totalExpenses = expenseData.reduce((s, e) => s + Number(e.amount), 0)
  const totalRevenue  = salesData.reduce((s, x) => s + Number(x.total), 0)
  const netProfit     = totalRevenue - totalExpenses

  // Derive expenses-by-category from live data instead of static mockData
  const expensesByCategory = useMemo(() => {
    const map = {}
    for (const e of expenseData) {
      map[e.category] = (map[e.category] || 0) + Number(e.amount)
    }
    return Object.entries(map).map(([category, amount]) => ({ category, amount }))
  }, [expenseData])

  const handleSubmit = (e) => {
    e.preventDefault()
    addExpense({ ...form, amount: Number(form.amount) })
    setModal(false)
    setForm(empty)
  }

  return (
    <Layout title="Finances">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard icon={TrendingUp}   label="Total Revenue"  value={`KSH ${totalRevenue.toLocaleString()}`}        color="primary" />
        <StatCard icon={TrendingDown} label="Total Expenses" value={`KSH ${totalExpenses.toLocaleString()}`}       color="red" />
        <StatCard icon={Wallet}       label="Net Profit"     value={`KSH ${Math.abs(netProfit).toLocaleString()}`} color={netProfit >= 0 ? 'primary' : 'red'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <div className="flex gap-4 mb-4 border-b border-gray-100 pb-3">
            {['expenses', 'income'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${tab === t ? 'text-primary-600 border-primary-600' : 'text-gray-400 border-transparent'}`}>
                {t === 'expenses' ? 'Expenses' : 'Income (Sales)'}
              </button>
            ))}
            {tab === 'expenses' && can('expenses:add') && (
              <button className="btn-primary text-xs py-1 px-3 ml-auto" onClick={() => setModal(true)}><Plus size={14} />Add Expense</button>
            )}
          </div>

          {tab === 'expenses' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-medium">
                    {['Date','Category','Description','Vendor','Method','Amount', can('expenses:delete') ? '' : null]
                      .filter(h => h !== null)
                      .map(h => <th key={h} className="text-left py-2 pr-4">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...expenseData].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(e => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-gray-500">{e.date}</td>
                      <td className="py-2.5 pr-4 font-medium text-gray-800">{e.category}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{e.description}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{e.vendor}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{e.paymentMethod}</td>
                      <td className="py-2.5 pr-4 font-semibold text-red-600">KSH {Number(e.amount).toLocaleString()}</td>
                      {can('expenses:delete') && (
                        <td className="py-2.5">
                          <button onClick={() => deleteExpense(e.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {expenseData.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-gray-400">No expenses recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-medium">
                    {['Date','Product','Buyer','Qty','Total','Status'].map(h => (
                      <th key={h} className="text-left py-2 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...salesData].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s => (
                    <tr key={s.id} className="border-b border-gray-50">
                      <td className="py-2.5 pr-4 text-gray-500">{s.date}</td>
                      <td className="py-2.5 pr-4 font-medium text-gray-800">{s.product}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{s.buyer}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{s.quantity} {s.unit}</td>
                      <td className="py-2.5 pr-4 font-semibold text-primary-700">KSH {Number(s.total).toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-gray-500">{s.paymentStatus}</td>
                    </tr>
                  ))}
                  {salesData.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">No sales recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie chart — derived from live data */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Expenses by Category</h2>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expensesByCategory} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {expensesByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `KSH ${Number(v).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No expense data yet.</p>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Expense">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" required value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" required value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Vendor</label>
              <input className="input" value={form.vendor} onChange={e => setForm(f=>({...f,vendor:e.target.value}))} />
            </div>
            <div>
              <label className="label">Amount (KSH)</label>
              <input className="input" type="number" step="0.01" required value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={form.paymentMethod} onChange={e => setForm(f=>({...f,paymentMethod:e.target.value}))}>
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Save Expense</button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
