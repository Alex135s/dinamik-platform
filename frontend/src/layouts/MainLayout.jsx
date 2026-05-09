import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/projects', label: 'Proyectos', icon: '🏗️' },
  { path: '/documents', label: 'Documentos', icon: '📁' },
]

function MainLayout({ children }) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">DINAMIK</h1>
          <p className="text-xs text-gray-400 mt-1">Plataforma de Gestión</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === item.path
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">© 2026 Dinamik SAC</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

export default MainLayout