import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { usePermissions } from '../hooks/usePermissions'

// Calcula días entre dos fechas
const daysBetween = (a, b) => Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24))

// Semáforo de salud del proyecto
const getHealth = (project, tasks) => {
  const hoy = new Date()

  if (project.status === 'completado')
    return { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', label: 'Completado', icon: '✅' }

  if (project.endDate && new Date(project.endDate) < hoy)
    return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'Vencido', icon: '🔴' }

  const total      = tasks.length
  const completadas = tasks.filter(t => t.status === 'completado').length
  const pct        = total > 0 ? (completadas / total) * 100 : project.progress || 0

  if (project.endDate) {
    const diasTotal     = daysBetween(project.startDate, project.endDate)
    const diasTranscurridos = daysBetween(project.startDate, hoy)
    const tiempoPct     = diasTotal > 0 ? (diasTranscurridos / diasTotal) * 100 : 0
    if (tiempoPct > pct + 30)
      return { color: 'text-red-400',    bg: 'bg-red-500/20',    border: 'border-red-500/30',    label: 'En riesgo',  icon: '🔴' }
    if (tiempoPct > pct + 15)
      return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: 'Atención',   icon: '🟡' }
  }
  return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', label: 'En curso', icon: '🟢' }
}

function ProjectTracking() {
  const navigate = useNavigate()
  const perms    = usePermissions()
  const session  = JSON.parse(localStorage.getItem('dinamik_session') || '{}')
  const [projects, setProjects]   = useState([])
  const [allTasks, setAllTasks]   = useState({})
  const [loading, setLoading]     = useState(true)
  const [filterHealth, setFilterHealth] = useState('todos')

  useEffect(() => {
    axios.get('http://localhost:5210/api/projects').then(async res => {
      // El técnico solo ve SUS proyectos asignados; el admin ve todos
      const visibles = perms.isAdmin
        ? res.data
        : res.data.filter(p => p.assignedTo === session.id)
      setProjects(visibles)
      const taskMap = {}
      await Promise.all(
        visibles.map(p =>
          axios.get(`http://localhost:5210/api/tasks/${p.id}`)
            .then(r => { taskMap[p.id] = r.data })
            .catch(() => { taskMap[p.id] = [] })
        )
      )
      setAllTasks(taskMap)
      setLoading(false)
    })
  }, [])

  const hoy = new Date()

  const projectsWithStats = projects.map(p => {
    const tasks       = allTasks[p.id] || []
    const total       = tasks.length
    const completadas = tasks.filter(t => t.status === 'completado').length
    const pendientes  = tasks.filter(t => t.status === 'pendiente').length
    const enProgreso  = tasks.filter(t => t.status === 'en_progreso').length
    const taskPct     = total > 0 ? Math.round((completadas / total) * 100) : (p.progress || 0)
    const health      = getHealth(p, tasks)

    let diasRestantes = null
    let diasTranscurridos = null
    let diasTotal = null
    let tiempoPct = 0

    if (p.startDate) {
      diasTranscurridos = Math.max(0, daysBetween(p.startDate, hoy))
    }
    if (p.startDate && p.endDate) {
      diasTotal     = daysBetween(p.startDate, p.endDate)
      diasRestantes = daysBetween(hoy, p.endDate)
      tiempoPct     = diasTotal > 0 ? Math.min(100, Math.round((diasTranscurridos / diasTotal) * 100)) : 0
    }

    return { ...p, tasks, total, completadas, pendientes, enProgreso, taskPct, health, diasRestantes, diasTranscurridos, diasTotal, tiempoPct }
  })

  const filtered = filterHealth === 'todos'
    ? projectsWithStats
    : projectsWithStats.filter(p => p.health.label.toLowerCase() === filterHealth)

  const resumen = {
    total:      projectsWithStats.length,
    enCurso:    projectsWithStats.filter(p => p.health.label === 'En curso').length,
    atencion:   projectsWithStats.filter(p => p.health.label === 'Atención').length,
    riesgo:     projectsWithStats.filter(p => p.health.label === 'En riesgo' || p.health.label === 'Vencido').length,
    completados:projectsWithStats.filter(p => p.health.label === 'Completado').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Seguimiento de Proyectos</h1>
          <p className="text-gray-400 text-sm mt-1">Estado y avance en tiempo real</p>
        </div>
      </div>

      {/* Resumen semáforo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: '🟢 En curso',    value: resumen.enCurso,     color: 'text-green-400',  bg: 'bg-gray-800', key: 'en curso' },
          { label: '🟡 Atención',    value: resumen.atencion,    color: 'text-yellow-400', bg: 'bg-gray-800', key: 'atención' },
          { label: '🔴 En riesgo',   value: resumen.riesgo,      color: 'text-red-400',    bg: 'bg-gray-800', key: 'en riesgo' },
          { label: '✅ Completados', value: resumen.completados, color: 'text-blue-400',   bg: 'bg-gray-800', key: 'completado' },
        ].map(c => (
          <button key={c.key}
            onClick={() => setFilterHealth(filterHealth === c.key ? 'todos' : c.key)}
            className={`${c.bg} rounded-xl p-5 border transition-all text-left
              ${filterHealth === c.key ? 'border-orange-500' : 'border-gray-700 hover:border-gray-600'}`}>
            <p className="text-gray-400 text-xs">{c.label}</p>
            <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </button>
        ))}
      </div>

      {/* Lista de proyectos */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Cargando seguimiento...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-400 text-sm">No hay proyectos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(p => (
            <div key={p.id}
              className={`bg-gray-800 rounded-xl p-6 border transition-all ${p.health.border}`}>

              {/* Header del proyecto */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold">{p.name}</h3>
                    <span className="text-orange-500 text-xs font-mono">{p.projectCode}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.health.bg} ${p.health.color}`}>
                      {p.health.icon} {p.health.label}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{p.client} · {p.serviceType}</p>
                </div>
                <button
                  onClick={() => navigate(`/projects/${p.id}/tasks`)}
                  className="bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-3">
                  📋 Ver tareas
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progreso de tareas */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-400 text-xs">Progreso de tareas</p>
                    <p className="text-white text-xs font-semibold">{p.taskPct}%</p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all
                        ${p.taskPct >= 75 ? 'bg-green-500' : p.taskPct >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${p.taskPct}%` }}
                    />
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-yellow-400">⏳ {p.pendientes} pendientes</span>
                    <span className="text-blue-400">🔄 {p.enProgreso} en progreso</span>
                    <span className="text-green-400">✅ {p.completadas} listas</span>
                  </div>
                </div>

                {/* Tiempo */}
                <div>
                  {p.diasTotal ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400 text-xs">Tiempo transcurrido</p>
                        <p className="text-white text-xs font-semibold">{p.tiempoPct}%</p>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all
                            ${p.tiempoPct > 80 ? 'bg-red-500' : p.tiempoPct > 50 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                          style={{ width: `${p.tiempoPct}%` }}
                        />
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span className="text-gray-400">📅 {p.diasTranscurridos} días transcurridos</span>
                        {p.diasRestantes >= 0
                          ? <span className={p.diasRestantes <= 7 ? 'text-red-400' : 'text-gray-400'}>
                              ⏰ {p.diasRestantes} días restantes
                            </span>
                          : <span className="text-red-400">🔴 Venció hace {Math.abs(p.diasRestantes)} días</span>
                        }
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-xs">Sin fecha de fin definida</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas */}
              {(p.startDate || p.endDate) && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-700">
                  {p.startDate && (
                    <p className="text-gray-500 text-xs">🗓️ Inicio: <span className="text-gray-400">{p.startDate}</span></p>
                  )}
                  {p.endDate && (
                    <p className="text-gray-500 text-xs">🏁 Fin: <span className="text-gray-400">{p.endDate}</span></p>
                  )}
                  {p.total > 0 && (
                    <p className="text-gray-500 text-xs">📋 <span className="text-gray-400">{p.total} tareas totales</span></p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectTracking