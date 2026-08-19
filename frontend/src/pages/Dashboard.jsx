import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts'
import {
  LuBell, LuCircleAlert, LuTriangleAlert, LuClock, LuHourglass, LuRefreshCw,
  LuCircleCheckBig, LuAlarmClock, LuFolderKanban, LuActivity, LuLoader,
  LuChartPie, LuArrowRight, LuTable2, LuListChecks, LuCalendarClock,
  LuBuilding2, LuFlag, LuHardHat, LuCuboid, LuMap, LuClipboardCheck,
} from 'react-icons/lu'
import { useToast } from '../context/ToastContext'
import LoadingState from '../components/LoadingState'

const statusColors = {
  activo:     { bg: 'bg-green-500/20',  text: 'text-green-400'  },
  en_proceso: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  completado: { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
}

const serviceIcons = {
  estructural:  { Icon: LuHardHat,        bg: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  BIM:          { Icon: LuCuboid,         bg: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  topografia:   { Icon: LuMap,            bg: 'bg-gradient-to-br from-rose-500 to-rose-600' },
  viabilidad:   { Icon: LuClipboardCheck, bg: 'bg-gradient-to-br from-teal-500 to-teal-600' },
  construccion: { Icon: LuBuilding2,      bg: 'bg-gradient-to-br from-amber-500 to-amber-600' },
}
const serviceIconDefault = { Icon: LuFolderKanban, bg: 'bg-gradient-to-br from-gray-500 to-gray-600' }

const taskStatusColors = {
  pendiente:   { bg: 'bg-gray-500/20',   text: 'text-gray-400'   },
  en_progreso: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  completado:  { bg: 'bg-green-500/20',  text: 'text-green-400'  },
}

const taskStatusLabels = { pendiente: 'Pendiente', en_progreso: 'En progreso', completado: 'Completado' }

const priorityColors = {
  baja:  { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
  media: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  alta:  { bg: 'bg-red-500/20',    text: 'text-red-400'    },
}

const isNew = (uploadedAt) => {
  if (!uploadedAt) return false
  return (new Date() - new Date(uploadedAt)) / (1000 * 60 * 60 * 24) <= 7
}

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const tooltipStyle = { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }

function SectionHeader({ icon: Icon, title, badge, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white font-semibold text-lg flex items-center gap-2">
        <Icon size={18} className="text-orange-500" /> {title}
        {badge}
      </h2>
      {action}
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [projects, setProjects] = useState([])
  const [docs, setDocs]         = useState([])
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [chartYear, setChartYear] = useState(new Date().getFullYear())

  const fetchData = async () => {
    setLoading(true)
    try {
      const [p, d] = await Promise.all([
        axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects'),
        axios.get('' + import.meta.env.VITE_DOCUMENTS_API + '/api/documents'),
      ])
      setProjects(p.data)
      setDocs(d.data)
    } catch {
      showToast('Error al cargar los datos del dashboard.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Cargar tareas de todos los proyectos
  useEffect(() => {
    if (projects.length === 0) return
    Promise.all(
      projects.map(p => axios.get(`${import.meta.env.VITE_PROJECTS_API}/api/tasks/${p.id}`))
    ).then(results => {
      setTasks(results.flatMap((r, i) => r.data.map(t => ({ ...t, projectId: t.projectId || projects[i].id }))))
    }).catch(() => showToast('Error al cargar las tareas.', 'error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  // ── Estadísticas ────────────────────────────────────────
  const total       = projects.length
  const activos     = projects.filter(p => p.status === 'activo').length
  const enProceso   = projects.filter(p => p.status === 'en_proceso').length
  const completados = projects.filter(p => p.status === 'completado').length
  const docsNuevos  = docs.filter(d => isNew(d.uploadedAt))

  const getProject = (id) => projects.find(p => p.id === id)
  const getProjectName = (id) => getProject(id)?.name || 'Sin proyecto'

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
  const añosDisponibles = Array.from(new Set(
    projects.filter(p => p.createdAt).map(p => new Date(p.createdAt).getFullYear())
  )).sort((a, b) => b - a)
  if (!añosDisponibles.includes(chartYear)) añosDisponibles.unshift(chartYear)

  const conteoPorMes = Array(12).fill(0)
  projects.forEach(p => {
    if (p.createdAt && new Date(p.createdAt).getFullYear() === chartYear) {
      conteoPorMes[new Date(p.createdAt).getMonth()]++
    }
  })
  const dataLinea = MESES.map((mes, i) => ({ mes, proyectos: conteoPorMes[i] }))

  const projectCards = [
    { label: 'Total Proyectos', value: total,       color: 'text-white',      iconBg: 'bg-gray-700',       iconColor: 'text-gray-300',   Icon: LuFolderKanban },
    { label: 'Activos',         value: activos,     color: 'text-green-400',  iconBg: 'bg-green-500/15',   iconColor: 'text-green-400',  Icon: LuActivity },
    { label: 'En Proceso',      value: enProceso,   color: 'text-yellow-400', iconBg: 'bg-yellow-500/15',  iconColor: 'text-yellow-400', Icon: LuLoader },
    { label: 'Completados',     value: completados, color: 'text-blue-400',   iconBg: 'bg-blue-500/15',    iconColor: 'text-blue-400',   Icon: LuCircleCheckBig },
  ]

  // ── Tablas ───────────────────────────────────────────────
  const proyectosTabla = [...projects]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8)

  const tareasTabla = [...tasks]
    .sort((a, b) => {
      if (a.status === 'completado' && b.status !== 'completado') return 1
      if (b.status === 'completado' && a.status !== 'completado') return -1
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
    .slice(0, 8)

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">Resumen general de proyectos DINAMIK</p>
        <LoadingState label="Cargando dashboard..." />
      </div>
    )
  }

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
        <div className="grid gap-2 mb-8">
          {vencidos.map(p => (
            <div key={p.id} className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
              <LuCircleAlert size={18} className="text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-semibold">{p.name}</p>
                <p className="text-red-400/70 text-xs">Venció el {fmtDate(p.endDate)}</p>
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
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* KPIs — proyectos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {projectCards.map(c => (
          <div key={c.label} className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
              <c.Icon size={20} className={c.iconColor} />
            </div>
            <div className="min-w-0">
              <p className="text-gray-400 text-xs truncate">{c.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${c.color}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs — tareas */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-500/15">
              <LuHourglass size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Tareas Pendientes</p>
              <p className="text-2xl font-bold mt-0.5 text-yellow-400">{tareasPendientes}</p>
              <p className="text-gray-500 text-xs">de {tasks.length} totales</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/15">
              <LuRefreshCw size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">En Progreso</p>
              <p className="text-2xl font-bold mt-0.5 text-blue-400">{tareasEnProgreso}</p>
              <p className="text-gray-500 text-xs">de {tasks.length} totales</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-500/15">
                <LuCircleCheckBig size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Completadas</p>
                <p className="text-2xl font-bold mt-0.5 text-green-400">{tareasCompletadas}</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
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
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <LuAlarmClock size={16} className="text-orange-500" /> Proyectos por Finalizar
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

      {/* Análisis */}
      <SectionHeader icon={LuChartPie} title="Análisis" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dona */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-1">Proyectos por Estado</h3>
          <p className="text-gray-500 text-xs mb-4">Distribución actual</p>
          {dataDona.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">Sin datos aún</p>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={dataDona} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="#1f2937" strokeWidth={2}>
                    {dataDona.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#d1d5db' }} />
                  <Legend formatter={value => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: 36 }}>
                <p className="text-white text-2xl font-bold">{total}</p>
                <p className="text-gray-500 text-xs">proyectos</p>
              </div>
            </div>
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
              <BarChart data={dataBarras} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#d1d5db' }} cursor={{ fill: '#37415155' }} />
                <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Línea */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold mb-1">Proyectos Registrados por Mes</h3>
            <p className="text-gray-500 text-xs">Año {chartYear}</p>
          </div>
          <select
            value={chartYear}
            onChange={e => setChartYear(Number(e.target.value))}
            className="bg-gray-700 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:border-orange-500 outline-none">
            {añosDisponibles.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dataLinea}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#d1d5db' }} cursor={{ stroke: '#374151' }} />
            <Line type="monotone" dataKey="proyectos" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#1f2937' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de Proyectos */}
      <SectionHeader
        icon={LuTable2}
        title="Proyectos"
        badge={<span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{total}</span>}
        action={
          <Link to="/projects" className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium">
            Ver todos <LuArrowRight size={14} />
          </Link>
        }
      />
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
        {proyectosTabla.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-10">No hay proyectos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Proyecto</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cliente</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Progreso</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide text-right">Vence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {proyectosTabla.map(p => {
                  const colors = statusColors[p.status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
                  const vencido = p.endDate && p.status !== 'completado' && new Date(p.endDate) < hoy
                  const service = serviceIcons[p.serviceType] || serviceIconDefault
                  return (
                    <tr key={p.id}
                      onClick={() => navigate(`/projects/${p.id}/detail`)}
                      className="hover:bg-gray-700/30 cursor-pointer transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${service.bg}`}>
                            <service.Icon size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">{p.name}</p>
                            <p className="text-gray-500 text-xs">
                              {p.projectCode}{p.serviceType && ` · ${p.serviceType}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-300">{p.client || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                          </div>
                          <span className="text-gray-400 text-xs w-8 text-right">{p.progress || 0}%</span>
                        </div>
                      </td>
                      <td className={`px-5 py-4 text-right whitespace-nowrap ${vencido ? 'text-red-400' : 'text-gray-400'}`}>
                        <span className="inline-flex items-center gap-1.5"><LuCalendarClock size={13} /> {fmtDate(p.endDate)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabla de Tareas */}
      <SectionHeader
        icon={LuListChecks}
        title="Tareas"
        badge={<span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>}
        action={
          <Link to="/tracking" className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-medium">
            Ver seguimiento <LuArrowRight size={14} />
          </Link>
        }
      />
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
        {tareasTabla.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-10">No hay tareas registradas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="px-5 py-3 font-medium text-gray-400">Tarea</th>
                  <th className="px-5 py-3 font-medium text-gray-400">Proyecto</th>
                  <th className="px-5 py-3 font-medium text-gray-400">Prioridad</th>
                  <th className="px-5 py-3 font-medium text-gray-400">Estado</th>
                  <th className="px-5 py-3 font-medium text-gray-400">Vence</th>
                </tr>
              </thead>
              <tbody>
                {tareasTabla.map(t => {
                  const sc = taskStatusColors[t.status]     || taskStatusColors.pendiente
                  const pc = priorityColors[t.priority]     || priorityColors.media
                  const vencida = t.dueDate && t.status !== 'completado' && new Date(t.dueDate) < hoy
                  return (
                    <tr key={t.id}
                      onClick={() => t.projectId && navigate(`/projects/${t.projectId}/tasks`)}
                      className="border-b border-gray-700/60 last:border-0 hover:bg-gray-700/40 cursor-pointer transition-colors">
                      <td className="px-5 py-3">
                        <p className={`font-medium ${t.status === 'completado' ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {t.title}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-gray-300 flex items-center gap-1.5">
                        <LuBuilding2 size={13} className="text-gray-500" /> {getProjectName(t.projectId)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${pc.bg} ${pc.text}`}>
                          <LuFlag size={11} /> {t.priority || 'media'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                          {taskStatusLabels[t.status] || t.status}
                        </span>
                      </td>
                      <td className={`px-5 py-3 ${vencida ? 'text-red-400' : 'text-gray-400'}`}>
                        {fmtDate(t.dueDate)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documentos recientes */}
      {docsNuevos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <LuBell size={16} className="text-orange-500" /> Documentos recientes
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
    </div>
  )
}

export default Dashboard
