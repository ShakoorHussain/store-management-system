import { useState, useEffect, useCallback } from 'react'
import API from '../../utils/api'
import toast from 'react-hot-toast'

export default function Sales() {
  const [sales,      setSales]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [products,   setProducts]   = useState([])
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [form, setForm] = useState({ customerName:'', paymentMethod:'cash', notes:'', items:[{ productId:'', quantity:1 }] })
  const [preview, setPreview] = useState({ total:0 })

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await API.get('/sales', { params:{ page, limit:8 } })
      setSales(data.data); setTotalPages(data.pages)
    } catch { toast.error('Failed to load sales') }
    finally  { setLoading(false) }
  }, [page])

  useEffect(() => { fetchSales() }, [fetchSales])
  useEffect(() => { API.get('/products', { params:{ limit:100 } }).then(({ data }) => setProducts(data.data)).catch(()=>{}) }, [])

  useEffect(() => {
    let total = 0
    form.items.forEach(item => {
      const prod = products.find(p => p._id === item.productId)
      if (prod) total += prod.price * item.quantity
    })
    setPreview({ total })
  }, [form.items, products])

  const addItem    = () => setForm(f => ({ ...f, items:[...f.items,{ productId:'', quantity:1 }] }))
  const removeItem = i  => setForm(f => ({ ...f, items:f.items.filter((_,idx)=>idx!==i) }))
  const updateItem = (i, field, value) => setForm(f => { const items=[...f.items]; items[i]={...items[i],[field]:value}; return {...f,items} })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.items.some(it => !it.productId)) { toast.error('Please select a product for each item'); return }
    setSaving(true)
    try {
      await API.post('/sales', form)
      toast.success('Sale recorded!')
      setModal(false)
      setForm({ customerName:'', paymentMethod:'cash', notes:'', items:[{ productId:'', quantity:1 }] })
      fetchSales()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create sale') }
    finally { setSaving(false) }
  }

  const paymentColor = { cash:'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', card:'text-blue-400 bg-blue-400/10 border-blue-400/20', online:'text-purple-400 bg-purple-400/10 border-purple-400/20' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-2xl tracking-tight">Sales</h2>
          <p className="text-white/30 text-sm mt-0.5">Manage transactions</p>
        </div>
        <button onClick={() => setModal(true)} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25">
          + New Sale
        </button>
      </div>

      <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" /></div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <span className="text-4xl opacity-20">◎</span>
            <p className="text-white/30 text-sm">No sales recorded yet</p>
            <button onClick={() => setModal(true)} className="text-blue-400 text-sm font-semibold hover:underline">Record first sale</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6 bg-white/2">
                {['Invoice','Customer','Items','Total','Payment','Staff','Date'].map(h => (
                  <th key={h} className="text-left text-white/30 text-xs font-semibold uppercase tracking-widest px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s._id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5"><span className="text-blue-400 font-mono text-xs font-semibold">{s.invoiceNumber}</span></td>
                  <td className="px-5 py-3.5"><span className="text-white text-sm">{s.customerName}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {s.items.slice(0,2).map((it,j) => <span key={j} className="bg-white/6 border border-white/8 text-white/50 text-xs px-2 py-0.5 rounded-full">{it.productName} ×{it.quantity}</span>)}
                      {s.items.length > 2 && <span className="bg-white/6 border border-white/8 text-white/30 text-xs px-2 py-0.5 rounded-full">+{s.items.length-2}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-emerald-400 font-bold text-sm">PKR {s.totalAmount.toLocaleString()}</span></td>
                  <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${paymentColor[s.paymentMethod]}`}>{s.paymentMethod}</span></td>
                  <td className="px-5 py-3.5"><span className="text-white/40 text-sm">{s.createdBy?.name}</span></td>
                  <td className="px-5 py-3.5"><span className="text-white/30 text-xs">{new Date(s.createdAt).toLocaleDateString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="bg-white/5 border border-white/10 text-white/50 text-sm font-semibold px-4 py-2 rounded-xl hover:border-blue-400/40 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">← Prev</button>
          <span className="text-white/30 text-sm">Page {page} of {totalPages}</span>
          <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="bg-white/5 border border-white/10 text-white/50 text-sm font-semibold px-4 py-2 rounded-xl hover:border-blue-400/40 hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next →</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-[#0f0f1e] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8 sticky top-0 bg-[#0f0f1e] z-10">
              <h3 className="text-white font-black text-lg tracking-tight">New Sale Transaction</h3>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 flex items-center justify-center text-sm transition-all">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-widest">Customer Name</label>
                  <input value={form.customerName} onChange={e => setForm({...form,customerName:e.target.value})} placeholder="Walk-in Customer" className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-widest">Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm({...form,paymentMethod:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 transition-all cursor-pointer">
                    <option value="cash"   className="bg-[#1a1a2e]">Cash</option>
                    <option value="card"   className="bg-[#1a1a2e]">Card</option>
                    <option value="online" className="bg-[#1a1a2e]">Online</option>
                  </select>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-widest">Items *</label>
                  <button type="button" onClick={addItem} className="bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-400/20 transition-all">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => {
                    const prod = products.find(p => p._id === item.productId)
                    const subtotal = prod ? prod.price * item.quantity : 0
                    return (
                      <div key={i} className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-center bg-white/3 border border-white/6 rounded-xl p-3">
                        <select value={item.productId} onChange={e => updateItem(i,'productId',e.target.value)} required className="bg-white/5 border border-white/10 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-blue-400/50 transition-all cursor-pointer">
                          <option value="">Select product...</option>
                          {products.map(p => <option key={p._id} value={p._id} disabled={p.quantity===0} className="bg-[#1a1a2e]">{p.name} — PKR {p.price.toLocaleString()} (Stock: {p.quantity})</option>)}
                        </select>
                        <input type="number" min="1" max={prod?.quantity||999} value={item.quantity} onChange={e => updateItem(i,'quantity',Number(e.target.value))} required className="bg-white/5 border border-white/10 rounded-lg text-white text-sm px-3 py-2 outline-none focus:border-blue-400/50 transition-all text-center" />
                        <div className="text-emerald-400 font-bold text-sm text-right">PKR {subtotal.toLocaleString()}</div>
                        {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-white/20 hover:text-red-400 transition-colors text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-400/10">✕</button>}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-400/8 to-cyan-400/5 border border-blue-400/20 rounded-xl px-5 py-4">
                <span className="text-white/50 text-sm font-semibold">Total Amount</span>
                <span className="text-cyan-400 font-black text-2xl tracking-tight">PKR {preview.total.toLocaleString()}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-white/40 text-xs font-semibold uppercase tracking-widest">Notes (optional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} placeholder="Any notes..." className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 transition-all resize-none" />
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/8">
                <button type="button" onClick={() => setModal(false)} className="flex-1 bg-white/5 border border-white/10 text-white/50 font-semibold py-2.5 rounded-xl text-sm hover:bg-white/8 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold py-2.5 rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {saving ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Processing...</> : 'Complete Sale →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}