import { useState, useEffect } from 'react'
import axios from 'axios'

const statusColors = {
  activo: 'text-green-400',
  en_proceso: 'text-yellow-400',
  completado: 'text-blue-400',
}

function Dashboard() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios.get('http://localhost:5210/api/projects')
      .then(res => setProjects(res.data))
  }, [])

  const total = projects.length
  const activos = projects.filter(p => p.status === 'activo').length
  const enProceso = projects.filter(p => p.status === 'en_proceso').length
  const completados = projects.filter(p => p.status === 'completado').length

  const cards = [
    { label: 'Total Proyectos', value: total, color: 'text-white', bg: 'bg-gray-700' },
    { label: 'Activos', value: activos, color: 'text-green-400', bg: 'bg-gray-800' },
    { label: 'En Proceso', value: enProceso, color: 'text-yellow-400', bg: 'bg-gray-800' },
    { label: 'Completados', value: completados, color: 'text-blue-400', bg: 'bg-gray-800' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Resumen general de proyectos DINAMIK</p>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-6 border border-gray-700`}>
            <p className="text-gray-400 text-sm">{c.label}</p>
            <p className={`text-4xl font-bold mt-2 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-white font-semibold mb-4">Proyectos recientes</h2>
      <div className="grid gap-3">
        {projects.slice(0, 5).map(p => (
          <div key={p.id} className="bg-gray-800 rounded-xl px-5 py-4 border border-gray-700 flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">{p.name}</p>
              <p className="text-gray-500 text-xs mt-1">{p.client} · {p.serviceType}</p>
            </div>
            <span className={`text-xs font-semibold ${statusColors[p.status] || 'text-gray-400'}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard