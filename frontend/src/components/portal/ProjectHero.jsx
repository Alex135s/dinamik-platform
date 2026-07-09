import { blueprintGrid } from './portalData'

function ProjectHero({ project }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-7 shadow-xl shadow-orange-500/20">
      <div className="absolute inset-0 opacity-10" style={blueprintGrid} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="text-orange-100 text-xs font-semibold tracking-wider">{project.projectCode}</span>
          <h2 className="text-white text-2xl font-black mt-1">{project.name}</h2>
          <p className="text-orange-50 text-sm mt-1">{project.client}</p>
          <p className="text-orange-100/80 text-xs mt-2">
            Tipo: {project.serviceType} · Inicio: {project.startDate}
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-semibold bg-white/20 text-white backdrop-blur flex-shrink-0">
          {project.status}
        </span>
      </div>
    </div>
  )
}

export default ProjectHero