import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register, loading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await register(form.name, form.email, form.password)
    if (!res.success) toast.error(res.message)
    else toast.success('Account created!')
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">S</div>
          <div>
            <div className="text-white font-black text-lg tracking-tight">StoreOS</div>
            <div className="text-white/40 text-[11px] tracking-widest uppercase">Management System</div>
          </div>
        </div>

        <div className="mb-7">
          <h2 className="text-white text-3xl font-black tracking-tight">Create account</h2>
          <p className="text-white/40 text-sm mt-1">Get started with your store today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-widest">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 px-4 py-3 text-sm outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              placeholder="you@store.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 px-4 py-3 text-sm outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-widest">Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 px-4 py-3 text-sm outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Creating...
              </span>
            ) : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}