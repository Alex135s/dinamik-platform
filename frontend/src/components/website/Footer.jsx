import { Link } from 'react-router-dom'
import { FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLinkedin, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa'

const NAV_LINKS = [
  { path: '/web',            label: 'Inicio'     },
  { path: '/web/nosotros',   label: 'Nosotros'   },
  { path: '/web/portafolio', label: 'Portafolio' },
  { path: '/web/servicios',  label: 'Servicios'  },
  { path: '/web/contacto',   label: 'Contacto'   },
]

const SOCIALS = [
  { Icon: FaLinkedin,  href: 'https://linkedin.com',  hover: 'hover:bg-blue-700' },
  { Icon: FaInstagram, href: 'https://instagram.com', hover: 'hover:bg-pink-600' },
  { Icon: FaFacebook,  href: 'https://facebook.com',  hover: 'hover:bg-blue-600' },
  { Icon: FaTiktok,    href: 'https://tiktok.com',    hover: 'hover:bg-gray-600' },
]

function Footer({ onWhatsapp }) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 border-t border-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-[1.3fr_1fr_1fr] gap-10">
        <div>
          <img src="/logo-dark.png" alt="DINAMIK" className="h-9 w-auto mb-4" />
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Ingeniería que construye confianza. Eliminamos la brecha entre arquitectura,
            estructura y ejecución para proteger la rentabilidad de tu proyecto.
          </p>
          <div className="flex gap-3 mt-5">
            {SOCIALS.map(({ Icon, href, hover }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                className={`bg-gray-800 ${hover} p-2.5 rounded-lg transition-colors`}>
                <Icon className="text-white text-base" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-4">Navegación</h4>
          <ul className="space-y-2.5">
            {NAV_LINKS.map(item => (
              <li key={item.path}>
                <Link to={item.path} className="text-gray-400 hover:text-orange-500 text-sm transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-4">Contacto</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-gray-400 text-sm">
              <FaMapMarkerAlt className="text-orange-500 mt-0.5 shrink-0" />
              Av. República de Chile Nro 478, Jesús María, Lima
            </li>
            <li className="flex items-center gap-2.5 text-gray-400 text-sm">
              <FaPhone className="text-orange-500 shrink-0" /> +51 962 744 341
            </li>
            <li className="flex items-center gap-2.5 text-gray-400 text-sm">
              <FaEnvelope className="text-orange-500 shrink-0" /> dinamiksac@gmail.com
            </li>
          </ul>
          <button onClick={onWhatsapp}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <FaWhatsapp /> Escribir por WhatsApp
          </button>
        </div>
      </div>

      <div className="border-t border-gray-900 py-6 text-center">
        <p className="text-gray-500 text-xs">
          © {year} DINAMIK DK GROUP SAC · Ingeniería que construye confianza
        </p>
      </div>
    </footer>
  )
}

export default Footer
