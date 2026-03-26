import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import API from '../../utils/api'

const StatCard = ({ label, value, sub, from, to, icon }) => (
  <div className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center text-white text-xl mb-4 shadow-lg`}>
      {icon}
    </div>
    <div className="text-white font-black text-2xl tracking-tight">{value}</div>
    <div className="text-white/50 text-sm mt-1">{label}</div>
    {sub && <div className="text-white/25 text-xs mt-1">{sub}</div>}
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${from} ${to} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-blue-400 font-bold text-sm">PKR {payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([API.get('/reports/summary'), API.get('/reports/monthly')])
      .then(([s, m]) => { setSummary(s.data.data); setMonthly(m.data.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
    </div>
  )

  const chartData = monthly?.dailyBreakdown?.map(d => ({
    day: `${d._id}`, revenue: d.totalRevenue, sales: d.count,
  })) || []

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Products"   value={summary?.totalProducts ?? 0}  sub="Active inventory"   from="from-blue-400"   to="to-cyan-400"   icon="◈" />
        <StatCard label="Today's Revenue"  value={`PKR ${(summary?.todayRevenue ?? 0).toLocaleString()}`}   sub={`${summary?.todaySalesCount ?? 0} sales today`}       from="from-emerald-400" to="to-teal-400"   icon="◎" />
        <StatCard label="Monthly Revenue"  value={`PKR ${(summary?.monthRevenue ?? 0).toLocaleString()}`}   sub={`${summary?.monthlySalesCount ?? 0} this month`}      from="from-amber-400"  to="to-orange-400" icon="◇" />
        <StatCard label="Low Stock Alerts" value={summary?.lowStockProducts ?? 0} sub="Products ≤ 10 units" from="from-purple-400" to="to-pink-400"   icon="▲" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold text-base">Revenue Overview</h3>
              <p className="text-white/30 text-xs mt-0.5">{new Date().toLocaleString('default',{month:'long',year:'numeric'})}</p>
            </div>
            <span className="text-xs bg-white/6 border border-white/8 text-white/40 px-3 py-1 rounded-full">Monthly</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill:'#ffffff30', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#ffffff30', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#60a5fa" strokeWidth={2} fill="url(#blueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-white/20 text-sm">No sales data yet</div>}
        </div>

        <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold text-base">Daily Sales Count</h3>
              <p className="text-white/30 text-xs mt-0.5">Transactions per day</p>
            </div>
            <span className="text-xs bg-white/6 border border-white/8 text-white/40 px-3 py-1 rounded-full">Count</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill:'#ffffff30', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#ffffff30', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', color:'#fff' }} />
                <Bar dataKey="sales" fill="#4fd1c5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-white/20 text-sm">No sales data yet</div>}
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Top Products</h3>
            <span className="text-white/30 text-xs">This month</span>
          </div>
          {monthly?.topProducts?.length > 0 ? (
            <div className="space-y-2">
              {monthly.topProducts.slice(0,5).map((p,i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-white/40 text-xs font-bold shrink-0">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-white/30 text-xs">{p.quantity} units sold</div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">PKR {p.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : <div className="h-40 flex items-center justify-center text-white/20 text-sm">No sales this month</div>}
        </div>

        {/* Low Stock */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Low Stock Alert</h3>
            <span className="bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              {summary?.lowStockProducts ?? 0} items
            </span>
          </div>
          {monthly?.lowStock?.length > 0 ? (
            <div className="space-y-2">
              {monthly.lowStock.slice(0,5).map((p,i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold shrink-0 ${p.quantity === 0 ? 'bg-red-400/15 text-red-400' : p.quantity <= 5 ? 'bg-amber-400/15 text-amber-400' : 'bg-yellow-400/15 text-yellow-400'}`}>
                    {p.quantity === 0 ? 'OUT' : p.quantity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{p.name}</div>
                    <div className="text-white/30 text-xs">{p.category}</div>
                  </div>
                  <span className={`text-xs font-semibold ${p.quantity === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {p.quantity === 0 ? 'Out of stock' : 'Low stock'}
                  </span>
                </div>
              ))}
            </div>
          ) : <div className="h-40 flex items-center justify-center text-white/20 text-sm">✓ All products well stocked</div>}
        </div>
      </div>
    </div>
  )
}