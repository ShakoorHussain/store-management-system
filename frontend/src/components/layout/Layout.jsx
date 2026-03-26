import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const pageTitles = {
  '/':         { title: 'Dashboard', sub: 'Overview of your store' },
  '/products': { title: 'Products',  sub: 'Manage your inventory' },
  '/sales':    { title: 'Sales',     sub: 'Track transactions' },
  '/reports':  { title: 'Reports',   sub: 'Analytics & insights' },
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const page = pageTitles[location.pathname] || { title: 'StoreOS', sub: '' }

  return (
    <div className="flex min-h-screen bg-[#080810]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#080810]/80 backdrop-blur-xl border-b border-white/6 flex items-center gap-4 px-6">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex flex-col gap-1.5 p-1"
          >
            <span className="block w-5 h-0.5 bg-white/50 rounded" />
            <span className="block w-5 h-0.5 bg-white/50 rounded" />
            <span className="block w-5 h-0.5 bg-white/50 rounded" />
          </button>

          <div className="flex-1">
            <h1 className="text-white font-black text-xl tracking-tight">{page.title}</h1>
            <p className="text-white/30 text-xs mt-0.5">{page.sub}</p>
          </div>

          {/* Date + Live badge */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-white/30 text-xs">
              {new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
            </span>
            <div className="flex items-center gap-1.5 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Live</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}