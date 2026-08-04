import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { LuMenu, LuX } from 'react-icons/lu'

const NAV_LINKS = [
  { path: '/web',           label: 'Inicio'     },
  { path: '/web/nosotros',  label: 'Nosotros'   },
  { path: '/web/portafolio',label: 'Portafolio' },
  { path: '/web/servicios', label: 'Servicios'  },
  { path: '/web/contacto',  label: 'Contacto'   },
]

function WebNavbar({ onWhatsapp }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/web" className="flex items-center" onClick={() => setMenuOpen(false)}>
          <img src="/logo-light.png" alt="DINAMIK" className="h-9 w-auto" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors
                ${location.pathname === item.path
                  ? 'text-orange-500 font-semibold'
                  : 'text-gray-600 hover:text-orange-500'
                }`}>
              {item.label}
            </Link>
          ))}
          <button onClick={onWhatsapp}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <FaWhatsapp /> Contáctanos
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700">
          {menuOpen ? <LuX size={26} /> : <LuMenu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium capitalize
                ${location.pathname === item.path ? 'text-orange-500' : 'text-gray-600'}`}>
              {item.label}
            </Link>
          ))}
          <button onClick={() => { onWhatsapp(); setMenuOpen(false) }}
            className="bg-orange-500 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            <FaWhatsapp /> Contáctanos
          </button>
        </div>
      )}
    </nav>
  )
}

export default WebNavbar
