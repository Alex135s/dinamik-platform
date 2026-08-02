import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LuLayoutDashboard, LuHardHat, LuFolder, LuImage, LuTrendingUp, LuUsers, LuContact, LuSettings, LuMenu, LuBriefcase } from 'react-icons/lu'
import ChatbotAdmin from '../components/ChatbotAdmin'
import { useSettings } from '../context/SettingsContext'
import { roleLabels } from '../constants/roles'

const navItems = [
  { path: '/',          label: 'dashboard',  Icon: LuLayoutDashboard },
  { path: '/projects',  label: 'projects',   Icon: LuHardHat },
  { path: '/documents', label: 'documents',  Icon: LuFolder },
  { path: '/portfolio-admin', label: 'Galería Web', Icon: LuImage },
  { path: '/tracking',  label: 'tracking',   Icon: LuTrendingUp },
  { path: '/clients',   label: 'clients',    Icon: LuContact },
  { path: '/users',     label: 'users',      Icon: LuUsers },
  { path: '/settings',  label: 'settings',   Icon: LuSettings },
]

function MainLayout({ children, user, onLogout }) {
  const location = useLocation()
  const { t, theme } = useSettings()
  const [menuOpen, setMenuOpen] = useState(false)

  // Logo según el tema: blanco para oscuro, negro para claro
  const logoSrc = theme === 'light' ? '/logo-light.png' : '/logo-dark.png'

  const visibleItems = navItems
    .filter(item => item.path !== '/users'           || user?.role === 'admin')
    .filter(item => item.path !== '/clients'         || user?.role === 'admin' || user?.role === 'empleado')
    .filter(item => item.path !== '/portfolio-admin' || user?.role === 'admin')
    .filter(item => item.path !== '/tracking'        || user?.role === 'admin' || user?.role === 'ingeniero')

  return (
    <div className="flex min-h-screen bg-gray-950">

      {/* Fondo oscuro al abrir el menú en móvil */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMenuOpen(false)} />
      )}

      {/* Barra lateral (fija al viewport siempre, deslizable en móvil) */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col
        transform transition-transform duration-200 md:translate-x-0
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <img src={logoSrc} alt="DINAMIK" className="w-full object-contain" />
          <p className="text-xs text-gray-400 mt-1 text-center">Plataforma de Gestión</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map(item => (
            <Link key={item.path} to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === item.path
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
              <item.Icon size={18} className="flex-shrink-0" />
              {t[item.label] || item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-white text-xs font-medium">{user?.name}</p>
              <p className="text-gray-500 text-xs">{roleLabels[user?.role] || user?.role}</p>
            </div>
          </div>
          {user?.role && user.role !== 'admin' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 mb-2">
              <p className="text-blue-400 text-xs text-center flex items-center justify-center gap-1.5">
                <LuBriefcase size={13} /> Modo {roleLabels[user.role] || user.role}
              </p>
            </div>
          )}
          <button onClick={onLogout}
            className="w-full text-gray-500 hover:text-red-400 text-xs text-left transition-colors">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Columna derecha: barra superior móvil + contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior solo en móvil (con botón hamburguesa) */}
        <div className="md:hidden flex items-center gap-3 bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-20">
          <button onClick={() => setMenuOpen(true)}
            className="text-gray-200 leading-none" aria-label="Abrir menú">
            <LuMenu size={24} />
          </button>
          <img src={logoSrc} alt="DINAMIK" className="h-7 object-contain" />
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">{children}</main>
      </div>

      <ChatbotAdmin />
    </div>
  )
}

export default MainLayout
