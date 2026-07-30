import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import ShareProjectCode from '../components/ShareProjectCode'

const API = '' + import.meta.env.VITE_PROJECTS_API + ''        // ProjectsApi
const DOCS_API = '' + import.meta.env.VITE_DOCUMENTS_API + ''    // DocumentsApi

const statusColors = {
  activo:     { bg: 'bg-green-500/20',  text: 'text-green-400'  },
  en_proceso: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  completado: { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
}

const serviceIcons = {
  estructural:  '🏗️',
  BIM:          '💻',
  topografia:   '🗺️',
  viabilidad:   '📋',
  construccion: '🏢',
}

const taskStatusColors = {
  pendiente:  'bg-gray-500/20 text-gray-300',
  en_proceso: 'bg-yellow-500/20 text-yellow-400',
  completado: 'bg-green-500/20 text-green-400',
}

// Iguales a los de tu página Documents.jsx
const docTypeIcons = {
  plano_pdf: '📄', plano_cad: '📐', imagen_3d: '🏗️', informe: '📋', otro: '📎',
}
const docTypeLabels = {
  plano_pdf: 'Plano PDF', plano_cad: 'CAD / DWG',
  imagen_3d: 'Imagen 3D', informe: 'Informe', otro: 'Otro',
}

function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [project, setProject]     = useState(null)
  const [tasks, setTasks]         = useState([])
  const [documents, setDocuments] = useState([])
  const [tecnico, setTecnico]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        // No existe GET /api/projects/{id}, así que traemos todos y filtramos
        const [projRes, usersRes, tasksRes] = await Promise.all([
          axios.get(`${API}/api/projects`),
          axios.get(`${API}/api/users`),
          axios.get(`${API}/api/tasks/${projectId}`),
        ])

        const found = projRes.data.find(p => p.id === projectId)
        if (!found) { setNotFound(true); return }

        setProject(found)
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : [])

        const tech = usersRes.data.find(u => u.id === found.assignedTo)
        setTecnico(tech?.name || null)

        // Documentos del proyecto (ruta real de tu DocumentsApi)
        try {
          const docsRes = await axios.get(`${DOCS_API}/api/documents/project/${projectId}`)
          setDocuments(Array.isArray(docsRes.data) ? docsRes.data : [])
        } catch {
          setDocuments([])
        }
      } catch {
        showToast('Error al cargar el detalle del proyecto.', 'error')
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  // ── Cálculos derivados ──────────────────────────────
  const completadas = tasks.filter(t => t.status === 'completado').length
  const progress = project?.progress ?? (tasks.length > 0
    ? Math.round((completadas / tasks.length) * 100)
    : 0)

  const daysLeft = project?.endDate
    ? Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  const colors = statusColors[project?.status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }

  // ── Estados de carga / error ────────────────────────
  if (loading) {
    return <p className="text-gray-400 text-sm">Cargando detalle del proyecto...</p>
  }

  if (notFound || !project) {
    return (
      <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-gray-400 text-sm mb-4">No se encontró el proyecto.</p>
        <button onClick={() => navigate('/projects')}
          className="text-orange-400 text-xs underline">
          ← Volver a proyectos
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <button onClick={() => navigate('/projects')}
        className="text-gray-400 hover:text-white text-sm">
        ← Volver a proyectos
      </button>

      {/* Encabezado */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {serviceIcons[project.serviceType] || '🏗️'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-orange-500 text-sm font-mono">{project.projectCode}</p>
                <ShareProjectCode code={project.projectCode} projectName={project.name} client={project.client} size="md" />
              </div>
              <p className="text-gray-400 text-sm mt-0.5">
                {project.client}{project.serviceType ? ` · ${project.serviceType}` : ''}
              </p>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors.bg} ${colors.text}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Progreso */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-xs mb-2">Progreso</p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold text-white">{progress}%</span>
            <span className="text-gray-500 text-xs">{completadas}/{tasks.length} tareas</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Técnico asignado */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-xs mb-2">Técnico asignado</p>
          <p className="text-lg font-semibold text-blue-400">
            {tecnico ? `👷 ${tecnico}` : 'Sin asignar'}
          </p>
        </div>

        {/* Días restantes */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-xs mb-2">Días restantes</p>
          {daysLeft === null ? (
            <p className="text-lg font-semibold text-gray-400">Sin fecha de fin</p>
          ) : project.status === 'completado' ? (
            <p className="text-lg font-semibold text-blue-400">✅ Completado</p>
          ) : daysLeft < 0 ? (
            <p className="text-lg font-semibold text-red-400">
              🔴 Venció hace {Math.abs(daysLeft)} días
            </p>
          ) : (
            <p className={`text-lg font-semibold ${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 30 ? 'text-yellow-400' : 'text-white'}`}>
              {daysLeft} día{daysLeft !== 1 ? 's' : ''}
            </p>
          )}
          {project.endDate && (
            <p className="text-gray-500 text-xs mt-1">🏁 {project.endDate}</p>
          )}
        </div>
      </div>

      {/* Tareas */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Tareas ({tasks.length})</h2>
          <button onClick={() => navigate(`/projects/${projectId}/tasks`)}
            className="bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors">
            📋 Gestionar tareas
          </button>
        </div>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay tareas registradas.</p>
        ) : (
          <div className="divide-y divide-gray-700">
            {tasks.map(task => (
              <div key={task.id} className="py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-gray-500 text-xs mt-0.5">📅 Vence: {task.dueDate}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {task.priority && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                      {task.priority}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${taskStatusColors[task.status] || 'bg-gray-500/20 text-gray-300'}`}>
                    {task.status || '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentos */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Documentos ({documents.length})</h2>
          <button onClick={() => navigate('/documents')}
            className="bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors">
            📁 Gestionar documentos
          </button>
        </div>
        {documents.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay documentos para este proyecto.</p>
        ) : (
          <div className="grid gap-2">
            {documents.map(doc => (
              <div key={doc.id}
                className={`flex items-center justify-between bg-gray-700/40 rounded-lg px-4 py-3 transition-colors
                  ${doc.enabled ? '' : 'opacity-60'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{docTypeIcons[doc.type] || '📎'}</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {docTypeLabels[doc.type] || 'Documento'}
                      {doc.uploadedAt && ` · ${new Date(doc.uploadedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                      {!doc.enabled && ' · ✗ Deshabilitado'}
                    </p>
                  </div>
                </div>
                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-gray-700 hover:bg-blue-500/20 hover:text-blue-400 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-3">
                    ⬇ Abrir
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ubicación / Mapa */}
      <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
        <h2 className="text-white font-semibold mb-3">Ubicación</h2>
        {project.location && (
          <p className="text-gray-400 text-sm mb-3 flex items-center gap-1">
            📍 {project.location}
          </p>
        )}
        {project.latitude && project.longitude ? (
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <iframe
              title="Ubicación del proyecto"
              src={`https://maps.google.com/maps?q=${project.latitude},${project.longitude}&z=15&output=embed`}
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Sin coordenadas registradas.</p>
        )}
      </div>
    </div>
  )
}

export default ProjectDetail