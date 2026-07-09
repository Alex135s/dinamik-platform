function About() {
  const team = [
    {
      name: 'Equipo de Arquitectura',
      role: 'Diseño y planificación',
      icon: '🏛️',
      desc: 'Especialistas en diseño arquitectónico integrado con enfoque en funcionalidad y estética.'
    },
    {
      name: 'Equipo Estructural',
      role: 'Ingeniería y cálculo',
      icon: '⚙️',
      desc: 'Ingenieros especializados en estructuras sismorresistentes optimizadas para el contexto peruano.'
    },
    {
      name: 'Equipo BIM',
      role: 'Modelado y coordinación',
      icon: '💻',
      desc: 'Expertos en metodología BIM para coordinación digital y detección temprana de interferencias.'
    },
    {
      name: 'Equipo de Obra',
      role: 'Ejecución y supervisión',
      icon: '🦺',
      desc: 'Profesionales en campo garantizando calidad, plazos y presupuesto en cada etapa constructiva.'
    },
  ]

  const values = [
    { icon: '🎯', title: 'Precisión', desc: 'Cada detalle importa en ingeniería. Trabajamos con exactitud técnica en cada proyecto.' },
    { icon: '🤝', title: 'Confianza', desc: 'Construimos relaciones duraderas basadas en transparencia y cumplimiento.' },
    { icon: '🚀', title: 'Innovación', desc: 'Adoptamos tecnología de vanguardia como BIM y drones para mejores resultados.' },
  ]

  return (
    <section id="nosotros" className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">

        {/* Título */}
        <div className="text-center mb-16">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Quiénes somos</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">Sobre Nosotros</h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            DINAMIK es una empresa peruana de arquitectura, ingeniería y construcción comprometida
            con la excelencia técnica y la satisfacción de nuestros clientes.
          </p>
        </div>

        {/* Misión y Visión */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-3">Nuestra Misión</h3>
            <p className="text-gray-500 leading-relaxed">
              Brindar soluciones integrales de ingeniería y arquitectura que transformen
              la complejidad técnica en ventajas competitivas, protegiendo la inversión
              de nuestros clientes desde el primer trazo hasta la entrega final.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-xl">🔭</span>
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-3">Nuestra Visión</h3>
            <p className="text-gray-500 leading-relaxed">
              Ser la empresa líder en ingeniería integrada del Perú, reconocida por
              nuestra innovación tecnológica, calidad técnica y el impacto positivo
              en cada proyecto que emprendemos.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {values.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:border-orange-200 hover:shadow-lg transition-all">
              <span className="text-4xl">{v.icon}</span>
              <h3 className="text-gray-900 font-bold text-lg mt-4">{v.title}</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Equipo */}
        <div className="text-center mb-10">
          <h3 className="text-2xl font-black text-gray-900">Nuestro Equipo</h3>
          <p className="text-gray-500 mt-2">Ingenieros y arquitectos comprometidos con la excelencia</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all text-center">
              <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{t.icon}</span>
              </div>
              <h4 className="text-gray-900 font-bold text-sm">{t.name}</h4>
              <p className="text-orange-500 text-xs font-medium mt-1">{t.role}</p>
              <p className="text-gray-500 text-xs mt-3 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default About