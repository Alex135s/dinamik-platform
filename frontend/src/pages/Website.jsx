import { useState } from 'react'

function Website() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleWhatsapp = () => {
    window.open('https://wa.me/51962744341?text=Hola, me gustaría obtener más información sobre sus servicios.', '_blank')
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">DIN<span className="text-orange-500">A</span>MIK</h1>
          <div className="hidden md:flex items-center gap-8">
            {['inicio', 'servicios', 'contacto'].map(s => (
              <button key={s} onClick={() => scrollTo(s)}
                className="text-gray-600 hover:text-orange-500 text-sm font-medium capitalize transition-colors">
                {s}
              </button>
            ))}
            <button onClick={handleWhatsapp}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Contáctanos
            </button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700 text-2xl">☰</button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4">
            {['inicio', 'servicios', 'contacto'].map(s => (
              <button key={s} onClick={() => scrollTo(s)}
                className="text-gray-600 text-sm font-medium capitalize text-left">
                {s}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* INICIO */}
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
            <p className="text-gray-400 mt-6 text-lg leading-relaxed">
              En DINAMIK eliminamos la brecha entre arquitectura, estructura y ejecución.
              Protegemos la rentabilidad de tu proyecto desde el primer trazo.
            </p>
            <div className="flex gap-4 mt-8">
              <button onClick={() => scrollTo('servicios')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium">
                Ver Servicios
              </button>
              <button onClick={handleWhatsapp}
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

      {/* SERVICIOS */}
      <section id="servicios" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Lo que hacemos</span>
            <h2 className="text-4xl font-black text-gray-900 mt-3">Nuestros Servicios</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Soluciones integrales de ingeniería para desarrolladores, inversionistas y propietarios.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏗️',
                title: 'Diseño Estructural',
                desc: 'Estructuras sismorresistentes optimizadas para el contexto peruano. Análisis sísmico avanzado y reforzamiento estructural.',
                items: ['Diseño y análisis sísmico', 'Reforzamiento estructural', 'Optimización técnica', 'Auditoría estructural']
              },
              {
                icon: '📐',
                title: 'Metodología BIM',
                desc: 'Construimos digitalmente antes de ejecutar. Detectamos interferencias y coordinamos especialidades en entorno digital.',
                items: ['Detección de interferencias', 'Control de metrados', 'Coordinación multidisciplinaria', 'Reducción de sobrecostos']
              },
              {
                icon: '📋',
                title: 'Viabilidad y Licencias',
                desc: 'Gestionamos el ciclo técnico-administrativo completo para que tu inversión avance sin fricciones.',
                items: ['Licencias de construcción', 'Habilitaciones urbanas', 'Expedientes técnicos', 'Gestión municipal']
              },
              {
                icon: '🔍',
                title: 'Topografía y Geotecnia',
                desc: 'Información técnica precisa para la toma de decisiones en diseño y construcción.',
                items: ['Levantamientos topográficos', 'Fotogrametría con dron', 'Estudio de mecánica de suelos', 'Cálculo de capacidad portante']
              },
              {
                icon: '🏢',
                title: 'Construcción y Control',
                desc: 'No solo construimos, garantizamos que cada sol invertido se refleje en la calidad final de la obra.',
                items: ['Construcciones nuevas', 'Remodelaciones', 'Control de costos', 'Gestión de riesgos']
              },
              {
                icon: '👁️',
                title: 'Supervisión de Obras',
                desc: 'Supervisión técnica especializada para garantizar calidad, plazos y presupuesto en cada etapa.',
                items: ['Control de plazos', 'Control de calidad', 'Informes de avance', 'Gestión de incidencias']
              },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
                <span className="text-4xl">{s.icon}</span>
                <h3 className="text-gray-900 font-bold text-lg mt-4">{s.title}</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{s.desc}</p>
                <ul className="mt-4 space-y-1">
                  {s.items.map((item, j) => (
                    <li key={j} className="text-gray-600 text-xs flex items-center gap-2">
                      <span className="text-orange-500">→</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-24 bg-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Hablemos</span>
            <h2 className="text-4xl font-black text-white mt-3">Contáctanos</h2>
            <p className="text-gray-400 mt-4">Cuéntanos tu proyecto y te respondemos a la brevedad.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                { icon: '📍', label: 'Dirección', value: 'Av. República de Chile Nro 478, Jesús María, Lima' },
                { icon: '📞', label: 'Teléfono', value: '+51 962 744 341' },
                { icon: '✉️', label: 'Email', value: 'dinamiksac@gmail.com' },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <p className="text-gray-400 text-xs">{c.label}</p>
                    <p className="text-white text-sm font-medium mt-1">{c.value}</p>
                  </div>
                </div>
              ))}
              <button onClick={handleWhatsapp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 mt-4">
                💬 Escribir por WhatsApp
              </button>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
              <input placeholder="Tu nombre"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none" />
              <input placeholder="Tu email"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none" />
              <textarea placeholder="Cuéntanos tu proyecto..." rows={4}
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none resize-none" />
              <button onClick={handleWhatsapp}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium">
                Enviar mensaje
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-8 text-center">
        <p className="text-gray-500 text-sm">© 2026 DINAMIK DK GROUP SAC · Ingeniería que construye confianza</p>
      </footer>

    </div>
  )
}

export default Website