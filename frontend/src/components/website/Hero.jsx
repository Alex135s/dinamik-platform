import { FaHardHat, FaEye, FaFileAlt } from 'react-icons/fa'

function Hero({ onWhatsapp, onScrollTo }) {
  return (
    <section id="inicio" className="pt-20 min-h-screen bg-gray-950 flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
            Arquitectura · Ingeniería · Construcción
          </span>
          <h2 className="text-5xl font-black text-white mt-4 leading-tight">
            Ingeniería que<br />
            <span className="text-orange-500">construye</span><br />
            confianza
          </h2>
          <div className="w-16 h-1.5 bg-orange-500 rounded-full mt-4" />
          <p className="text-gray-400 mt-6 text-lg leading-relaxed">
            En DINAMIK eliminamos la brecha entre arquitectura, estructura y ejecución.
            Protegemos la rentabilidad de tu proyecto desde el primer trazo.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { Icon: FaHardHat, label: 'Ingeniería de Valor' },
              { Icon: FaEye, label: 'Mitigación de Riesgos' },
              { Icon: FaFileAlt, label: 'Seguridad Normativa' },
            ].map((p, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-3 border border-gray-700 flex flex-col items-center gap-2 text-center">
                <p.Icon className="text-orange-500 text-xl" />
                <p className="text-gray-300 text-xs font-medium">{p.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={() => onScrollTo('servicios')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium">
              Ver Servicios
            </button>
            <button onClick={onWhatsapp}
              className="border border-gray-600 hover:border-orange-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Contáctanos
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { num: '50+', label: 'Proyectos completados' },
            { num: '100%', label: 'Cumplimiento normativo' },
            { num: 'BIM', label: 'Metodología estándar' },
            { num: '24/7', label: 'Soporte al cliente' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <p className="text-3xl font-black text-orange-500">{s.num}</p>
              <p className="text-gray-400 text-sm mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero