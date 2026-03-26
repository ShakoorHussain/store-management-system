import { useState, useEffect, useCallback } from 'react'
import API from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const EMPTY = { name:'', category:'', price:'', quantity:'', description:'', sku:'' }

const Input = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-white/40 text-xs font-semibold uppercase tracking-widest">{label}</label>
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10 transition-all" />
  </div>
)

export default function Products() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [categories, setCategories] = useState([])
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 8 }
      if (search)   params.search   = search
      if (category) params.category = category
      const { data } = await API.get('/products', { params })
      setProducts(data.data)
      setTotalPages(data.pages)
      setTotal(data.total)
    } catch { toast.error('Failed to load products') }
    finally  { setLoading(false) }
  }, [page, search, category])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    API.get('/products/categories').then(({ data }) => setCategories(data.data)).catch(() => {})
  }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = p => { setEditing(p); setForm({ name:p.name, category:p.category, price:p.price, quantity:p.quantity, description:p.description||'', sku:p.sku||'' }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { await API.put(`/products/${editing._id}`, form); toast.success('Product updated') }
      else         { await API.post('/products', form); toast.success('Product created') }
      setModal(false); fetchProducts()
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try { await API.delete(`/products/${id}`); toast.success('Deleted'); fetchProducts() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-2xl tracking-tight">Products</h2>
          <p className="text-white/30 text-sm mt-0.5">{total} total items</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25">
            + Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg">⌕</span>
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400/50 transition-all"
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1) }}
          className="bg-white/5 border border-white/10 rounded-xl text-white/70 px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 transition-all cursor-pointer min-w-40"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c} className="bg-[#1a1a2e]">{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-white/10 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <span className="text-4xl opacity-20">◈</span>
            <p className="text-white/30 text-sm">No products found</p>
            {isAdmin && <button onClick={openCreate} className="text-blue-400 text-sm font-semibold hover:underline">Add first product</button>}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6 bg-white/2">
                {['Product','Category','Price','Stock','SKU', isAdmin && 'Actions'].filter(Boolean).map(h => (
                  <th key={h} className="text-left text-white/30 text-xs font-semibold uppercase tracking-widest px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p._id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-white text-sm font-semibold">{p.name}</div>
                    {p.description && <div className="text-white/30 text-xs mt-0.5 truncate max-w-48">{p.description}</div>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-emerald-400 font-bold text-sm">PKR {Number(p.price).toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      p.quantity === 0 ? 'bg-red-400/10 border-red-400/20 text-red-400' :
                      p.quantity <= 10 ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' :
                      'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                    }`}>
                      {p.quantity === 0 ? 'Out of Stock' : `${p.quantity} units`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-white/30 text-xs font-mono">{p.sku || '—'}</span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-400/20 transition-all">Edit</button>
                        <button onClick={() => handleDelete(p._id)} className="bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-400/20 transition-all">Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
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
          <div className="bg-[#0f0f1e] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <h3 className="text-white font-black text-lg tracking-tight">{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setModal(false)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 flex items-center justify-center text-sm transition-all">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Product Name *" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="e.g. iPhone 15" required />
                <Input label="Category *" value={form.category} onChange={e => setForm({...form,category:e.target.value})} placeholder="e.g. Electronics" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (PKR) *" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form,price:e.target.value})} placeholder="0.00" required />
                <Input label="Quantity *" type="number" min="0" value={form.quantity} onChange={e => setForm({...form,quantity:e.target.value})} placeholder="0" required />
              </div>
              <Input label="SKU (optional)" value={form.sku} onChange={e => setForm({...form,sku:e.target.value})} placeholder="e.g. PROD-001" />
              <div className="space-y-1.5">
                <label className="text-white/40 text-xs font-semibold uppercase tracking-widest">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Brief description..." className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 px-4 py-2.5 text-sm outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10 transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2 border-t border-white/8">
                <button type="button" onClick={() => setModal(false)} className="flex-1 bg-white/5 border border-white/10 text-white/50 font-semibold py-2.5 rounded-xl text-sm hover:bg-white/8 transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold py-2.5 rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {saving ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Saving...</> : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}