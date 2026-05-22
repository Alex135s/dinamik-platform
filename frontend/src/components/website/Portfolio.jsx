import { useState } from 'react'

const projects = [
  {
    title: 'Edificio Residencial San Isidro',
    category: 'estructural',
    type: 'Diseño Estructural',
    location: 'San Isidro, Lima',
    year: '2025',
    desc: 'Diseño estructural sismorresistente de edificio multifamiliar de 12 pisos con sótano.',
    color: 'bg-orange-500',
    icon: '🏢'
  },
  {
    title: 'Habilitación Urbana Surco',
    category: 'viabilidad',
    type: 'Viabilidad y Licencias',
    location: 'Santiago de Surco, Lima',
    year: '2025',
    desc: 'Gestión completa de habilitación urbana incluyendo expedientes técnicos y licencias municipales.',
    color: 'bg-blue-600',
    icon: '🗺️'
  },
  {
    title: 'Estudio de Suelos Miraflores',
    category: 'topografia',
    type: 'Topografía y Geotecnia',
    location: 'Miraflores, Lima',
    year: '2024',
    desc: 'Estudio completo de mecánica de suelos con calicatas, ensayos de laboratorio y cálculo de capacidad portante.',
    color: 'bg-yellow-600',
    icon: '🔍'
  },
  {
    title: 'Centro Comercial BIM',
    category: 'bim',
    type: 'Metodología BIM',
    location: 'Jesús María, Lima',
    year: '2025',
    desc: 'Modelado BIM completo de centro comercial de 3 niveles con detección de interferencias y coordinación multidisciplinaria.',
    color: 'bg-green-600',
    icon: '📐'
  },
  {
    title: 'Remodelación Casa Jesús María',
    category: 'construccion',
    type: 'Construcción y Control',
    location: 'Jesús María, Lima',
    year: '2024',
    desc: 'Remodelación integral de vivienda unifamiliar con reforzamiento estructural y acabados de alta calidad.',
    color: 'bg-red-600',
    icon: '🏠'
  },
  {
    title: 'Supervisión Edificio Lince',
    category: 'supervision',
    type: 'Supervisión de Obras',
    location: 'Lince, Lima',
    year: '2024',
    desc: 'Supervisión técnica de obra de edificio de 8 pisos con control de calidad, costos y plazos.',
    color: 'bg-purple-600',
    icon: '👁️'
  },
]

const categories = [
  { key: 'todos', label: 'Todos' },
  { key: 'estructural', label: 'Estructural' },
  { key: 'bim', label: 'BIM' },
  { key: 'viabilidad', label: 'Viabilidad' },
  { key: 'topografia', label: 'Topografía' },
  { key: 'construccion', label: 'Construcción' },
  { key: 'supervision', label: 'Supervisión' },
]

function Portfolio() {
  const [active, setActive] = useState('todos')

  const filtered = active === 'todos'
    ? projects
    : projects.filter(p => p.category === active)

  return (
    <section id="portafolio" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-12">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Nuestro trabajo</span>
          <h2 className="text-4xl font-black text-gray-900 mt-3">Portafolio</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Proyectos que demuestran nuestra experiencia y compromiso con la excelencia.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map(c => (
            <button key={c.key} onClick={() => setActive(c.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${active === c.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-500'
                }`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid proyectos */}
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden group">
              <div className={`${p.color} h-40 flex items-center justify-center relative`}>
                <span className="text-7xl opacity-30">{p.icon}</span>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-medium">{p.year}</span>
                </div>
              </div>
              <div className="p-5">
                <span className="text-orange-500 text-xs font-semibold">{p.type}</span>
                <h3 className="text-gray-900 font-bold text-base mt-1">{p.title}</h3>
                <p className="text-gray-400 text-xs mt-1">📍 {p.location}</p>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Portfolio