import { FaWhatsapp } from 'react-icons/fa'

function Navbar({ onWhatsapp, onScrollTo, menuOpen, setMenuOpen }) {
  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">DIN<span className="text-orange-500">A</span>MIK</h1>
        <div className="hidden md:flex items-center gap-8">
          {['inicio', 'servicios', 'contacto'].map(s => (
            <button key={s} onClick={() => onScrollTo(s)}
              className="text-gray-600 hover:text-orange-500 text-sm font-medium capitalize transition-colors">
              {s}
            </button>
          ))}
          <button onClick={onWhatsapp}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <FaWhatsapp /> Contáctanos
          </button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700 text-2xl">☰</button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4">
          {['inicio', 'servicios', 'contacto'].map(s => (
            <button key={s} onClick={() => onScrollTo(s)}
              className="text-gray-600 text-sm font-medium capitalize text-left">
              {s}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar