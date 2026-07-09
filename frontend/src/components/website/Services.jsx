import { FaHardHat, FaCubes, FaFileAlt, FaMountain, FaBuilding, FaEye, FaWhatsapp } from 'react-icons/fa'

function Services({ onWhatsapp }) {
  const services = [
    {
      Icon: FaHardHat,
      color: 'bg-orange-500',
      title: 'Diseño Estructural',
      desc: 'Estructuras sismorresistentes optimizadas para el contexto peruano. Análisis sísmico avanzado y reforzamiento estructural.',
      items: ['Diseño y análisis sísmico', 'Reforzamiento estructural', 'Optimización técnica', 'Auditoría estructural']
    },
    {
      Icon: FaCubes,
      color: 'bg-blue-600',
      title: 'Metodología BIM',
      desc: 'Construimos digitalmente antes de ejecutar. Detectamos interferencias y coordinamos especialidades en entorno digital.',
      items: ['Detección de interferencias', 'Control de metrados', 'Coordinación multidisciplinaria', 'Reducción de sobrecostos']
    },
    {
      Icon: FaFileAlt,
      color: 'bg-green-600',
      title: 'Viabilidad y Licencias',
      desc: 'Gestionamos el ciclo técnico-administrativo completo para que tu inversión avance sin fricciones.',
      items: ['Licencias de construcción', 'Habilitaciones urbanas', 'Expedientes técnicos', 'Gestión municipal']
    },
    {
      Icon: FaMountain,
      color: 'bg-yellow-600',
      title: 'Topografía y Geotecnia',
      desc: 'Información técnica precisa para la toma de decisiones en diseño y construcción.',
      items: ['Levantamientos topográficos', 'Fotogrametría con dron', 'Estudio de mecánica de suelos', 'Cálculo de capacidad portante']
    },
    {
      Icon: FaBuilding,
      color: 'bg-red-600',
      title: 'Construcción y Control',
      desc: 'No solo construimos, garantizamos que cada sol invertido se refleje en la calidad final de la obra.',
      items: ['Construcciones nuevas', 'Remodelaciones', 'Control de costos', 'Gestión de riesgos']
    },
    {
      Icon: FaEye,
      color: 'bg-purple-600',
      title: 'Supervisión de Obras',
      desc: 'Supervisión técnica especializada para garantizar calidad, plazos y presupuesto en cada etapa.',
      items: ['Control de plazos', 'Control de calidad', 'Informes de avance', 'Gestión de incidencias']
    },
  ]

  return (
    <section id="servicios" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Lo que hacemos</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">Nuestros Servicios</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Soluciones integrales de ingeniería para desarrolladores, inversionistas y propietarios.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-xl transition-all group overflow-hidden">
              <div className={`h-1.5 w-full ${s.color} group-hover:h-2 transition-all`} />
              <div className="p-6">
                <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <s.Icon className="text-white text-xl" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg">{s.title}</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{s.desc}</p>
                <ul className="mt-4 space-y-1">
                  {s.items.map((item, j) => (
                    <li key={j} className="text-gray-600 text-xs flex items-center gap-2">
                      <span className="text-orange-500 font-bold">→</span> {item}
                    </li>
                  ))}
                </ul>
                <button onClick={onWhatsapp}
                  className="mt-5 w-full border border-orange-300 hover:bg-orange-500 hover:text-white text-orange-500 text-xs py-2 rounded-xl font-medium transition-colors">
                  Solicitar este servicio
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services