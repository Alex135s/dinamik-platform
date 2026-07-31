import { LuChartColumn, LuFolder, LuCircleCheckBig, LuClock, LuCheck } from 'react-icons/lu'

function StatsRow({ project, docsCount, tasks }) {
  const tareasComp = tasks.filter(t => t.status === 'completado').length

  // Días restantes
  const endD = project.endDate ? new Date(project.endDate) : null
  const hoy  = new Date()
  let diasValue = '—', diasLabel = 'Sin fecha de fin'
  if (project.status === 'completado') {
    diasValue = <LuCheck size={20} />; diasLabel = 'Completado'
  } else if (endD) {
    const dr = Math.ceil((endD - hoy) / (1000 * 60 * 60 * 24))
    if (dr < 0) { diasValue = Math.abs(dr); diasLabel = 'Días de retraso' }
    else { diasValue = dr; diasLabel = 'Días restantes' }
  }

  const stats = [
    { label: 'Progreso',    value: `${project.progress || 0}%`,      Icon: LuChartColumn,    bg: 'bg-orange-100 text-orange-600' },
    { label: 'Entregables', value: docsCount,                        Icon: LuFolder,         bg: 'bg-blue-100 text-blue-600'   },
    { label: 'Tareas',      value: `${tareasComp}/${tasks.length}`,  Icon: LuCircleCheckBig, bg: 'bg-green-100 text-green-600' },
    { label: diasLabel,     value: diasValue,                        Icon: LuClock,          bg: 'bg-amber-100 text-amber-600' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.bg}`}>
            <s.Icon size={17} />
          </div>
          <p className="text-gray-900 text-xl font-black leading-none">{s.value}</p>
          <p className="text-gray-400 text-xs mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

export default StatsRow