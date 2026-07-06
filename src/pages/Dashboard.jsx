import { Bird, CheckSquare, ShoppingCart, AlertCircle, TrendingUp, TrendingDown, Egg } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import { useFarm } from '../context/FarmContext'

const ksh = (v) => `KSH ${Number(v).toLocaleString()}`

// Derive the monthly revenue/expense chart data from live per-user records.
function buildMonthlyData(salesData, expenseData) {
  const map = {}

  const key = (dateStr) => {
    const d = new Date(dateStr)
    if (isNaN(d)) return null
    return d.toLocaleString('en', { month: 'short', year: '2-digit' }) // e.g. "Jan '26"
  }

  for (const s of salesData) {
    const k = key(s.date)
    if (!k) continue
    map[k] = map[k] || { month: k, revenue: 0, expenses: 0, _date: new Date(s.date) }
    map[k].revenue += Number(s.total) || 0
  }

  for (const e of expenseData) {
    const k = key(e.date)
    if (!k) continue
    if (!map[k]) map[k] = { month: k, revenue: 0, expenses: 0, _date: new Date(e.date) }
    map[k].expenses += Number(e.amount) || 0
  }

  return Object.values(map)
    .sort((a, b) => a._date - b._date)
    .map(({ month, revenue, expenses }) => ({ month, revenue, expenses }))
}

export default function Dashboard() {
  const { flocks, tasks, salesData, expenseData, eggProduction } = useFarm()

  const monthlyRevenue = buildMonthlyData(salesData, expenseData)

  const totalRevenue  = salesData.reduce((s, x) => s + Number(x.total), 0)
  const totalExpenses = expenseData.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit     = totalRevenue - totalExpenses
  const pendingTasks  = tasks.filter(t => t.status !== 'Completed').length
  const totalBirds    = flocks.reduce((s, f) => s + f.count, 0)

  // Last 7 days egg production
  const recentEggs = [...eggProduction]
    .filter(e => e.eggsCollected)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7)
    .reverse()

  const todayEggs = recentEggs[recentEggs.length - 1]
  const recentSales = [...salesData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)
  const urgentTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').slice(0, 4)

  return (
    <Layout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp}   label="Total Revenue"   value={ksh(totalRevenue)}   sub="Egg sales" color="primary" />
        <StatCard icon={TrendingDown} label="Total Expenses"  value={ksh(totalExpenses)}  sub="Feed, chicks, infra" color="red" />
        <StatCard icon={Bird}         label="Total Birds"     value={totalBirds.toLocaleString()} sub={`${flocks.length} flocks`} color="amber" />
        <StatCard icon={Egg}          label="Today's Eggs"    value={todayEggs?.eggsCollected ?? '—'} sub={todayEggs ? todayEggs.date : 'No record yet'} color="blue" />
      </div>

      {/* Net profit banner */}
      <div className={`rounded-xl px-6 py-4 mb-6 flex items-center justify-between ${netProfit >= 0 ? 'bg-primary-50 border border-primary-100' : 'bg-red-50 border border-red-100'}`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${netProfit >= 0 ? 'text-primary-600' : 'text-red-500'}`}>Net Profit / Loss</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary-700' : 'text-red-600'}`}>{ksh(Math.abs(netProfit))} {netProfit < 0 ? '(Loss)' : ''}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Revenue: <span className="font-semibold text-primary-700">{ksh(totalRevenue)}</span></p>
          <p>Expenses: <span className="font-semibold text-red-600">{ksh(totalExpenses)}</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue vs Expenses (KSH)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `KSH ${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue"  stroke="#16a34a" strokeWidth={2} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Egg production — last 7 days */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Egg Production (Last 7 Days)</h2>
          <div className="space-y-2">
            {recentEggs.map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{e.date}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{e.eggsCollected}</span>
                  {e.broken > 0 && <span className="text-xs text-red-400">({e.broken} broken)</span>}
                </div>
              </div>
            ))}
            {recentEggs.length === 0 && <p className="text-sm text-gray-400">No records yet.</p>}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            Total records: {eggProduction.length} days
          </div>
        </div>
      </div>

      {/* Recent sales */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Recent Egg Sales</h2>
          <ShoppingCart size={16} className="text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                <th className="text-left py-2 text-gray-500 font-medium">Qty</th>
                <th className="text-right py-2 text-gray-500 font-medium">Price/Tray</th>
                <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                <th className="text-left py-2 text-gray-500 font-medium pl-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(s => (
                <tr key={s.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-500">{s.date}</td>
                  <td className="py-2.5 text-gray-700">{s.quantity} {s.unit}</td>
                  <td className="py-2.5 text-right text-gray-500">KSH {s.unitPrice}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">KSH {s.total.toLocaleString()}</td>
                  <td className="py-2.5 pl-4"><Badge label={s.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Urgent tasks (if any) */}
      {urgentTasks.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">High-Priority Tasks</h2>
          <div className="space-y-3">
            {urgentTasks.map(t => (
              <div key={t.id} className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">Due {t.dueDate} · {t.assignee}</p>
                </div>
                <Badge label={t.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}
