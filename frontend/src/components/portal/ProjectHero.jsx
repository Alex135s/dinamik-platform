import { blueprintGrid, statusInfo } from './portalData'
import { LuWrench, LuCalendar, LuHardHat } from 'react-icons/lu'

function ProjectHero({ project }) {
  const st = statusInfo[project.status] || statusInfo.activo
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-7 shadow-xl shadow-orange-500/20">
      <div className="absolute inset-0 opacity-10" style={blueprintGrid} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="text-orange-100 text-xs font-semibold tracking-wider">{project.projectCode}</span>
          <h2 className="text-white text-2xl font-black mt-1">{project.name}</h2>
          <p className="text-orange-50 text-sm mt-1">{project.client}</p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-white/20 text-white backdrop-blur flex items-center gap-1.5 flex-shrink-0">
          <st.Icon size={13} /> {st.label}
        </span>
      </div>
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-white/15">
        <span className="flex items-center gap-1.5 text-orange-50 text-xs">
          <LuWrench size={13} /> {project.serviceType || 'Sin tipo'}
        </span>
        <span className="flex items-center gap-1.5 text-orange-50 text-xs">
          <LuCalendar size={13} /> Inicio: {project.startDate || '—'}
        </span>
        <span className="flex items-center gap-1.5 text-orange-50 text-xs">
          <LuHardHat size={13} /> {project.assignedToName ? `Ingeniero: ${project.assignedToName}` : 'Ingeniero sin asignar'}
        </span>
      </div>
    </div>
  )
}

export default ProjectHero