import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import { useFarm } from '../context/FarmContext'

// Derive monthly revenue vs expenses from live sales/expense data
function buildMonthlyData(salesData, expenseData) {
  const map = {}
  const key = (dateStr) => {
    const d = new Date(dateStr)
    if (isNaN(d)) return null
    return d.toLocaleString('en', { month: 'short', year: '2-digit' })
  }
  for (const s of salesData) {
    const k = key(s.date)
    if (!k) continue
    if (!map[k]) map[k] = { month: k, revenue: 0, expenses: 0, _ts: new Date(s.date).getTime() }
    map[k].revenue += Number(s.total) || 0
  }
  for (const e of expenseData) {
    const k = key(e.date)
    if (!k) continue
    if (!map[k]) map[k] = { month: k, revenue: 0, expenses: 0, _ts: new Date(e.date).getTime() }
    map[k].expenses += Number(e.amount) || 0
  }
  return Object.values(map)
    .sort((a, b) => a._ts - b._ts)
    .map(({ month, revenue, expenses }) => ({ month, revenue, expenses }))
}

export default function Reports() {
  const { crops, livestock, flocks, tasks, salesData, expenseData } = useFarm()

  const totalRevenue  = salesData.reduce((s, x) => s + Number(x.total), 0)
  const totalExpenses = expenseData.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit     = totalRevenue - totalExpenses

  const monthlyData = useMemo(() => buildMonthlyData(salesData, expenseData), [salesData, expenseData])

  const cropsByStatus = useMemo(() => {
    const acc = {}
    for (const c of crops) acc[c.status] = (acc[c.status] || 0) + 1
    return Object.entries(acc).map(([status, count]) => ({ status, count }))
  }, [crops])

  const tasksByStatus = useMemo(() => {
    const acc = {}
    for (const t of tasks) acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, [tasks])

  const productData = useMemo(() => {
    const acc = {}
    for (const s of salesData) acc[s.product] = (acc[s.product] || 0) + Number(s.total)
    return Object.entries(acc)
      .map(([product, revenue]) => ({ product, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  }, [salesData])

  return (
    <Layout title="Reports & Analytics">
      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue',  value: `KSH ${totalRevenue.toLocaleString()}`,        color: 'text-primary-700 bg-primary-50' },
          { label: 'Total Expenses', value: `KSH ${totalExpenses.toLocaleString()}`,       color: 'text-red-700 bg-red-50' },
          { label: 'Net Profit',     value: `KSH ${Math.abs(netProfit).toLocaleString()}`, color: netProfit >= 0 ? 'text-primary-700 bg-primary-50' : 'text-red-700 bg-red-50' },
          { label: 'Active Flocks',  value: flocks.filter(f => f.status === 'Active').length, color: 'text-blue-700 bg-blue-50' },
        ].map(k => (
          <div key={k.label} className={`rounded-xl p-4 ${k.color}`}>
            <p className="text-xs font-medium opacity-70">{k.label}</p>
            <p className="text-2xl font-bold mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue vs Expenses */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue vs Expenses</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => `KSH ${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue"  fill="#16a34a" name="Revenue"  radius={[4,4,0,0]} />
                <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No financial data yet.</p>
          )}
        </div>

        {/* Revenue by product */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue by Product</h2>
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="product" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(v) => `KSH ${Number(v).toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No sales data yet.</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Crop status breakdown */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Crops by Status</h2>
          {cropsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={cropsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No crop data yet.</p>
          )}
        </div>

        {/* Task summary */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Task Overview</h2>
          <div className="space-y-3">
            {Object.entries(tasksByStatus).map(([status, count]) => {
              const colors = { Completed: 'bg-primary-500', 'In Progress': 'bg-blue-500', Pending: 'bg-gray-300' }
              const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-medium">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {tasks.length === 0 && <p className="text-sm text-gray-400">No tasks yet.</p>}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{livestock.length}</p>
              <p className="text-xs text-gray-400">Animals</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{flocks.reduce((s,f)=>s+Number(f.count||0),0).toLocaleString()}</p>
              <p className="text-xs text-gray-400">Birds</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{crops.length}</p>
              <p className="text-xs text-gray-400">Crops</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
