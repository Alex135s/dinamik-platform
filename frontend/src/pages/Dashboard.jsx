import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts'
import { LuBell, LuCircleAlert, LuTriangleAlert, LuClock, LuHourglass, LuRefreshCw, LuCircleCheckBig, LuAlarmClock } from 'react-icons/lu'

const statusColors = {
  activo:     { bg: 'bg-green-500/20',  text: 'text-green-400'  },
  en_proceso: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  completado: { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
}

const isNew = (uploadedAt) => {
  if (!uploadedAt) return false
  return (new Date() - new Date(uploadedAt)) / (1000 * 60 * 60 * 24) <= 7
}

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [docs, setDocs]         = useState([])
  const [tasks, setTasks]       = useState([])

  useEffect(() => {
    axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects').then(res => setProjects(res.data))
    axios.get('' + import.meta.env.VITE_DOCUMENTS_API + '/api/documents').then(res => setDocs(res.data))
  }, [])

  // Cargar tareas de todos los proyectos
  useEffect(() => {
    if (projects.length === 0) return
    Promise.all(
      projects.map(p => axios.get(`${import.meta.env.VITE_PROJECTS_API}/api/tasks/${p.id}`))
    ).then(results => {
      setTasks(results.flatMap(r => r.data))
    }).catch(() => {})
  }, [projects])

  // ── Estadísticas ────────────────────────────────────────
  const total       = projects.length
  const activos     = projects.filter(p => p.status === 'activo').length
  const enProceso   = projects.filter(p => p.status === 'en_proceso').length
  const completados = projects.filter(p => p.status === 'completado').length
  const docsNuevos  = docs.filter(d => isNew(d.uploadedAt))

  const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Sin proyecto'

  // ── Proyectos por finalizar (próximos 30 días) ──────────
  const hoy = new Date()
  const porFinalizar = projects
    .filter(p => {
      if (!p.endDate || p.status === 'completado') return false
      const fin  = new Date(p.endDate)
      const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24))
      return diff >= 0 && diff <= 30
    })
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))

  const vencidos = projects.filter(p => {
    if (!p.endDate || p.status === 'completado') return false
    return new Date(p.endDate) < hoy
  })

  // ── Tareas pendientes ───────────────────────────────────
  const tareasPendientes  = tasks.filter(t => t.status === 'pendiente').length
  const tareasEnProgreso  = tasks.filter(t => t.status === 'en_progreso').length
  const tareasCompletadas = tasks.filter(t => t.status === 'completado').length

  // ── Gráfico dona ────────────────────────────────────────
  const dataDona = [
    { name: 'Activos',     value: activos,     color: '#22c55e' },
    { name: 'En Proceso',  value: enProceso,   color: '#eab308' },
    { name: 'Completados', value: completados, color: '#3b82f6' },
  ].filter(d => d.value > 0)

  // ── Gráfico barras ──────────────────────────────────────
  const tipoLabels = {
    plano_pdf: 'PDFs', plano_cad: 'CAD/DWG',
    imagen_3d: 'Img 3D', informe: 'Informes', otro: 'Otros',
  }
  const dataBarras = Object.entries(tipoLabels).map(([key, label]) => ({
    name: label, total: docs.filter(d => d.type === key).length,
  })).filter(d => d.total > 0)

  // ── Gráfico línea ───────────────────────────────────────
  const conteoPorMes = Array(12).fill(0)
  projects.forEach(p => {
    if (p.createdAt) conteoPorMes[new Date(p.createdAt).getMonth()]++
  })
  const dataLinea = MESES.map((mes, i) => ({ mes, proyectos: conteoPorMes[i] }))

  const cards = [
    { label: 'Total Proyectos', value: total,       color: 'text-white',      bg: 'bg-gray-700' },
    { label: 'Activos',         value: activos,     color: 'text-green-400',  bg: 'bg-gray-800' },
    { label: 'En Proceso',      value: enProceso,   color: 'text-yellow-400', bg: 'bg-gray-800' },
    { label: 'Completados',     value: completados, color: 'text-blue-400',   bg: 'bg-gray-800' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Resumen general de proyectos DINAMIK</p>
        </div>
        {docsNuevos.length > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-2">
            <div className="relative text-orange-400">
              <LuBell size={20} />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {docsNuevos.length}
              </span>
            </div>
            <p className="text-orange-400 text-sm font-medium">
              {docsNuevos.length === 1 ? '1 documento nuevo' : `${docsNuevos.length} documentos nuevos`} esta semana
            </p>
          </div>
        )}
      </div>

      {/* Alertas de vencimiento */}
      {(vencidos.length > 0 || porFinalizar.length > 0) && (
        <div className="grid gap-2 mb-6">
          {vencidos.map(p => (
            <div key={p.id} className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
              <LuCircleAlert size={18} className="text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-semibold">{p.name}</p>
                <p className="text-red-400/70 text-xs">
                  Venció el {new Date(p.endDate).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })}
                </p>
              </div>
              <span className="text-red-400 text-xs bg-red-500/20 px-2 py-1 rounded-full">VENCIDO</span>
            </div>
          ))}
          {porFinalizar.map(p => {
            const diff = Math.ceil((new Date(p.endDate) - hoy) / (1000 * 60 * 60 * 24))
            return (
              <div key={p.id} className={`border rounded-xl px-5 py-3 flex items-center gap-3
                ${diff <= 7 ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                {diff <= 7
                  ? <LuTriangleAlert size={18} className="text-red-400 flex-shrink-0" />
                  : <LuClock size={18} className="text-yellow-400 flex-shrink-0" />}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${diff <= 7 ? 'text-red-400' : 'text-yellow-400'}`}>{p.name}</p>
                  <p className={`text-xs ${diff <= 7 ? 'text-red-400/70' : 'text-yellow-400/70'}`}>
                    Vence en {diff} día{diff !== 1 ? 's' : ''} · {p.client}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${diff <= 7 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {p.progress || 0}% completado
                  </p>
                  <div className="w-24 bg-gray-700 rounded-full h-1.5 mt-1">
                    <div className="bg-orange-500 h-1.5 rounded-full"
                      style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cards estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl p-6 border border-gray-700`}>
            <p className="text-gray-400 text-sm">{c.label}</p>
            <p className={`text-4xl font-bold mt-2 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Resumen de tareas */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><LuHourglass size={14} /> Tareas Pendientes</p>
            <p className="text-3xl font-bold text-yellow-400">{tareasPendientes}</p>
            <p className="text-gray-500 text-xs mt-1">de {tasks.length} totales</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><LuRefreshCw size={14} /> En Progreso</p>
            <p className="text-3xl font-bold text-blue-400">{tareasEnProgreso}</p>
            <p className="text-gray-500 text-xs mt-1">de {tasks.length} totales</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-1.5"><LuCircleCheckBig size={14} /> Completadas</p>
            <p className="text-3xl font-bold text-green-400">{tareasCompletadas}</p>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
              <div className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${tasks.length > 0 ? Math.round((tareasCompletadas / tasks.length) * 100) : 0}%` }} />
            </div>
            <p className="text-green-400 text-xs mt-1 font-semibold">
              {tasks.length > 0 ? Math.round((tareasCompletadas / tasks.length) * 100) : 0}% del total
            </p>
          </div>
        </div>
      )}

      {/* Proyectos por finalizar */}
      {porFinalizar.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <LuAlarmClock size={16} /> Proyectos por Finalizar
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
              próximos 30 días
            </span>
          </h3>
          <div className="grid gap-3">
            {porFinalizar.slice(0, 4).map(p => {
              const diff = Math.ceil((new Date(p.endDate) - hoy) / (1000 * 60 * 60 * 24))
              const pct  = p.progress || 0
              return (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm font-medium truncate">{p.name}</p>
                      <span className="text-gray-400 text-xs ml-2 flex-shrink-0">
                        {diff} día{diff !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{p.client} · {pct}% completado</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Gráficos — fila 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dona */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-1">Proyectos por Estado</h3>
          <p className="text-gray-500 text-xs mb-4">Distribución actual</p>
          {dataDona.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={dataDona} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {dataDona.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} itemStyle={{ color: '#d1d5db' }} />
                <Legend formatter={value => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Barras */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-1">Documentos por Tipo</h3>
          <p className="text-gray-500 text-xs mb-4">Total de archivos subidos</p>
          {dataBarras.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">Sin documentos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataBarras} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} itemStyle={{ color: '#d1d5db' }} />
                <Bar dataKey="total" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Línea */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h3 className="text-white font-semibold mb-1">Proyectos Registrados por Mes</h3>
        <p className="text-gray-500 text-xs mb-4">Año {new Date().getFullYear()}</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dataLinea}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="mes" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} itemStyle={{ color: '#d1d5db' }} />
            <Line type="monotone" dataKey="proyectos" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Documentos recientes */}
      {docsNuevos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <LuBell size={16} /> Documentos recientes
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {docsNuevos.length} nuevos
            </span>
          </h2>
          <div className="grid gap-2">
            {docsNuevos.slice(0, 5).map(d => (
              <div key={d.id} className="bg-gray-800 rounded-xl px-5 py-3 border border-orange-500/20 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{d.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{getProjectName(d.projectId)} · {d.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">NUEVO</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(d.uploadedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proyectos recientes */}
      <h2 className="text-white font-semibold mb-4">Proyectos recientes</h2>
      <div className="grid gap-3">
        {projects.slice(0, 5).map(p => {
          const colors = statusColors[p.status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
          return (
            <div key={p.id} className="bg-gray-800 rounded-xl px-5 py-4 border border-gray-700 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{p.name}</p>
                <p className="text-gray-500 text-xs mt-1">{p.client} · {p.serviceType}</p>
                {p.progress > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-32 bg-gray-700 rounded-full h-1.5">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-gray-400 text-xs">{p.progress}%</span>
                  </div>
                )}
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ml-3 ${colors.bg} ${colors.text}`}>
                {p.status}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard