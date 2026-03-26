import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const nav = [
  { to: '/',         label: 'Dashboard', icon: '▦' },
  { to: '/products', label: 'Products',  icon: '◈' },
  { to: '/sales',    label: 'Sales',     icon: '◎' },
  { to: '/reports',  label: 'Reports',   icon: '◇' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-64 z-50
        bg-[#0d0d1a] border-r border-white/6
        flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30 shrink-0">
            S
          </div>
          <div>
            <div className="text-white font-black text-base tracking-tight">StoreOS</div>
            <div className="text-white/30 text-[10px] tracking-widest uppercase">Management System</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Main Menu</p>
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span className="flex-1">{label}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30">›</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/6 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 bg-white/4 rounded-xl border border-white/6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
              <div className={`text-xs font-medium ${user?.role === 'admin' ? 'text-amber-400' : 'text-cyan-400'}`}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/8 text-white/40 text-sm font-medium hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all"
          >
            <span>⎋</span> Logout
          </button>
        </div>
      </aside>
    </>
  )
}