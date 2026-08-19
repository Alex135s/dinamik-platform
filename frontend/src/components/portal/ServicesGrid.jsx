import Eyebrow from './Eyebrow'
import { SERVICIOS } from './portalData'

function ServicesGrid({ onRequest }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Eyebrow>Más servicios</Eyebrow>
          <p className="text-gray-900 font-bold text-lg -mt-1">Lo que hacemos</p>
        </div>
        <p className="text-gray-400 text-xs">Toca para solicitar</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {SERVICIOS.map((s, i) => (
          <div key={i} onClick={() => onRequest(`Quisiera solicitar información sobre ${s.title}.`)}
            className={`bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer transition-all group shadow-sm hover:shadow-lg ${s.hover}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                <s.icon size={20} />
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s.tag}</span>
            </div>
            <p className="text-gray-900 text-sm font-bold group-hover:text-orange-600 transition-colors">{s.title}</p>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">{s.desc}</p>
            <p className="text-orange-500 text-xs mt-3 font-semibold">Solicitar →</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ServicesGrid
