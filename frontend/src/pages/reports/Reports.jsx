import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import API from '../../utils/api'
import toast from 'react-hot-toast'

const COLORS = ['#60a5fa','#4fd1c5','#68d391','#f6ad55','#fc8181','#b794f4']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Reports() {
  const [tab,     setTab]     = useState('daily')
  const [daily,   setDaily]   = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [loading, setLoading] = useState(false)
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0])
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [month,   setMonth]   = useState(new Date().getMonth()+1)

  const fetchDaily = async () => {
    setLoading(true)
    try { const { data } = await API.get('/reports/daily', { params:{ date } }); setDaily(data.data) }
    catch { toast.error('Failed to load daily report') }
    finally { setLoading(false) }
  }

  const fetchMonthly = async () => {
    setLoading(true)
    try { const { data } = await API.get('/reports/monthly', { params:{ year, month } }); setMonthly(data.data) }
    catch { toast.error('Failed to load monthly report') }
    finally { setLoading(false) }
  }

  useEffect(() => { if(tab==='daily') fetchDaily(); else fetchMonthly() }, [tab])

  const inputCls = "bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 transition-all cursor-pointer"
  const tooltipStyle = { background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', color:'#fff', fontSize:'12px' }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2 bg-white/4 border border-white/8 rounded-2xl p-1.5 w-fit">
        {['daily','monthly'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${tab===t ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-500/25' : 'text-white/40 hover:text-white/70'}`}>
            {t} Report
          </button>
        ))}
      </div>

      {/* ── DAILY ── */}
      {tab === 'daily' && (
        <div className="space-y-5">
          <div className="flex gap-3 items-center flex-wrap">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className={inputCls} />
            <button onClick={fetchDaily} disabled={loading} className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center gap-2">
              {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Loading...</> : 'Generate Report'}
            </button>
          </div>

          {daily && (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label:'Total Sales',    value: daily.totalSales,                                               color:'text-white' },
                  { label:'Revenue',        value:`PKR ${daily.totalRevenue.toLocaleString()}`,                    color:'text-emerald-400' },
                  { label:'Items Sold',     value: daily.totalItems,                                               color:'text-blue-400' },
                  { label:'Avg Sale Value', value:`PKR ${daily.totalSales>0?(daily.totalRevenue/daily.totalSales).toFixed(0):0}`, color:'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all">
                    <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">{label}</div>
                    <div className={`font-black text-xl tracking-tight ${color}`}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
                  <h3 className="text-white font-bold text-base mb-4">Top Products</h3>
                  {daily.topProducts?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={daily.topProducts} margin={{ bottom:40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill:'#ffffff30', fontSize:10 }} angle={-25} textAnchor="end" axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill:'#ffffff30', fontSize:10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="revenue" fill="#60a5fa" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-48 flex items-center justify-center text-white/20 text-sm">No sales today</div>}
                </div>

                <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
                  <h3 className="text-white font-bold text-base mb-4">Payment Breakdown</h3>
                  {Object.keys(daily.paymentBreakdown||{}).length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={Object.entries(daily.paymentBreakdown).map(([k,v])=>({name:k,value:v}))} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                          {Object.keys(daily.paymentBreakdown).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v=>`PKR ${v.toLocaleString()}`} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-48 flex items-center justify-center text-white/20 text-sm">No payments today</div>}
                </div>
              </div>

              {daily.sales?.length > 0 && (
                <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/6">
                    <h3 className="text-white font-bold">All Transactions — {date}</h3>
                  </div>
                  <table className="w-full">
                    <thead><tr className="border-b border-white/6 bg-white/2">{['Invoice','Customer','Items','Total','Payment','Time'].map(h=><th key={h} className="text-left text-white/30 text-xs font-semibold uppercase tracking-widest px-5 py-3">{h}</th>)}</tr></thead>
                    <tbody>
                      {daily.sales.map(s => (
                        <tr key={s._id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                          <td className="px-5 py-3"><span className="text-blue-400 font-mono text-xs">{s.invoiceNumber}</span></td>
                          <td className="px-5 py-3 text-white text-sm">{s.customerName}</td>
                          <td className="px-5 py-3 text-white/40 text-sm">{s.items.length} item(s)</td>
                          <td className="px-5 py-3"><span className="text-emerald-400 font-bold text-sm">PKR {s.totalAmount.toLocaleString()}</span></td>
                          <td className="px-5 py-3"><span className="text-white/50 text-xs capitalize">{s.paymentMethod}</span></td>
                          <td className="px-5 py-3 text-white/30 text-xs">{new Date(s.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── MONTHLY ── */}
      {tab === 'monthly' && (
        <div className="space-y-5">
          <div className="flex gap-3 items-center flex-wrap">
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className={inputCls}>
              {MONTHS.map((m,i) => <option key={i} value={i+1} className="bg-[#1a1a2e]">{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className={inputCls}>
              {[2024,2025,2026].map(y => <option key={y} value={y} className="bg-[#1a1a2e]">{y}</option>)}
            </select>
            <button onClick={fetchMonthly} disabled={loading} className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center gap-2">
              {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Loading...</> : 'Generate Report'}
            </button>
          </div>

          {monthly && (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label:'Total Sales',    value: monthly.totalSales,                             color:'text-white' },
                  { label:'Total Revenue',  value:`PKR ${monthly.totalRevenue.toLocaleString()}`,  color:'text-emerald-400' },
                  { label:'Top Product',    value: monthly.topProducts?.[0]?.name || '—',          color:'text-blue-400' },
                  { label:'Low Stock',      value: monthly.lowStock?.length ?? 0,                  color:'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all">
                    <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">{label}</div>
                    <div className={`font-black text-xl tracking-tight truncate ${color}`}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 bg-white/4 border border-white/8 rounded-2xl p-5">
                  <h3 className="text-white font-bold text-base mb-4">Daily Revenue Trend</h3>
                  {monthly.dailyBreakdown?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={monthly.dailyBreakdown.map(d=>({ day:`${d._id}`, revenue:d.totalRevenue, sales:d.count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="day" tick={{ fill:'#ffffff30', fontSize:11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill:'#ffffff30', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} width={40} />
                        <Tooltip contentStyle={tooltipStyle} formatter={v=>`PKR ${v.toLocaleString()}`} />
                        <Bar dataKey="revenue" fill="#4fd1c5" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-48 flex items-center justify-center text-white/20 text-sm">No sales this month</div>}
                </div>

                <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
                  <h3 className="text-white font-bold text-base mb-4">Top Products</h3>
                  {monthly.topProducts?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={monthly.topProducts.slice(0,6)} cx="50%" cy="50%" outerRadius={75} dataKey="revenue">
                          {monthly.topProducts.slice(0,6).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v,n,p)=>[`PKR ${v.toLocaleString()}`, p.payload.name]} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-48 flex items-center justify-center text-white/20 text-sm">No data</div>}
                </div>
              </div>

              {monthly.lowStock?.length > 0 && (
                <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
                    <span className="text-amber-400">⚠</span>
                    <h3 className="text-white font-bold">Low Stock Products</h3>
                    <span className="ml-auto bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full">{monthly.lowStock.length} items</span>
                  </div>
                  <table className="w-full">
                    <thead><tr className="border-b border-white/6 bg-white/2">{['Product','Category','Stock','Status'].map(h=><th key={h} className="text-left text-white/30 text-xs font-semibold uppercase tracking-widest px-5 py-3">{h}</th>)}</tr></thead>
                    <tbody>
                      {monthly.lowStock.map(p => (
                        <tr key={p._id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                          <td className="px-5 py-3 text-white text-sm font-semibold">{p.name}</td>
                          <td className="px-5 py-3"><span className="bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">{p.category}</span></td>
                          <td className="px-5 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${p.quantity===0?'bg-red-400/10 border-red-400/20 text-red-400':'bg-amber-400/10 border-amber-400/20 text-amber-400'}`}>{p.quantity} units</span></td>
                          <td className="px-5 py-3"><span className={`text-xs font-semibold ${p.quantity===0?'text-red-400':'text-amber-400'}`}>{p.quantity===0?'Out of Stock':'Low Stock'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}