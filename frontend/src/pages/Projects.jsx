import { useState, useEffect } from 'react'
import axios from 'axios'

const SERVICE_TYPES = ['estructural', 'BIM', 'topografia', 'viabilidad', 'construccion']
const STATUS_TYPES = ['activo', 'en_proceso', 'completado']

const statusColors = {
  activo: 'bg-green-500',
  en_proceso: 'bg-yellow-500',
  completado: 'bg-blue-500',
}

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', client: '', serviceType: '', status: 'activo', startDate: '' })

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:5210/api/projects')
      setProjects(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const handleSubmit = async () => {
    if (!form.name) return
    try {
      await axios.post('http://localhost:5210/api/projects', {
        name: form.name,
        client: form.client,
        serviceType: form.serviceType,
        status: form.status,
        startDate: form.startDate || null,
      })
      setForm({ name: '', client: '', serviceType: '', status: 'activo', startDate: '' })
      setShowForm(false)
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Proyectos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-white font-semibold mb-4">Nuevo Proyecto</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Nombre del proyecto *" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm col-span-2" />
            <input placeholder="Cliente" value={form.client}
              onChange={e => setForm({ ...form, client: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm" />
            <select value={form.serviceType}
              onChange={e => setForm({ ...form, serviceType: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm">
              <option value="">Tipo de servicio</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm">
              {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Guardar
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Cargando proyectos...</p>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">{p.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{p.client} · {p.serviceType}</p>
                <p className="text-gray-500 text-xs mt-1">Inicio: {p.startDate}</p>
              </div>
              <span className={`${statusColors[p.status] || 'bg-gray-500'} text-white text-xs px-3 py-1 rounded-full`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects