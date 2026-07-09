import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import { usePermissions } from '../hooks/usePermissions'

const STATUS_TASK = ['pendiente', 'en_progreso', 'completado']
const PRIORITY    = ['baja', 'media', 'alta']

const statusColors = {
  pendiente:   { bg: 'bg-gray-500/20',   text: 'text-gray-400'   },
  en_progreso: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  completado:  { bg: 'bg-green-500/20',  text: 'text-green-400'  },
}

const priorityColors = {
  baja:  { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
  media: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  alta:  { bg: 'bg-red-500/20',    text: 'text-red-400'    },
}

const priorityIcons = { baja: '🔵', media: '🟡', alta: '🔴' }

const emptyForm = {
  title: '', description: '', status: 'pendiente',
  priority: 'media', assignedTo: '', dueDate: ''
}

function Tasks() {
  const { projectId } = useParams()
  const navigate      = useNavigate()
  const { showToast } = useToast()
  const perms         = usePermissions()

  const [project, setProject]           = useState(null)
  const [tasks, setTasks]               = useState([])
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [editingId, setEditingId]       = useState(null)
  const [form, setForm]                 = useState(emptyForm)
  const [deletingId, setDeletingId]     = useState(null)
  const [filterStatus, setFilterStatus] = useState('todos')

  const fetchData = async () => {
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5210/api/projects'),
        axios.get(`http://localhost:5210/api/tasks/${projectId}`),
        axios.get('http://localhost:5210/api/users'),
      ])
      const found = projRes.data.find(p => p.id === projectId)
      setProject(found || null)
      setTasks(tasksRes.data)
      setUsers(usersRes.data.filter(u => u.role === 'tecnico'))
    } catch {
      showToast('Error al cargar las tareas.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [projectId])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (t) => {
    setEditingId(t.id)
    setForm({
      title:       t.title       || '',
      description: t.description || '',
      status:      t.status      || 'pendiente',
      priority:    t.priority    || 'media',
      assignedTo:  t.assignedTo  || '',
      dueDate:     t.dueDate     || '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast('El título de la tarea es obligatorio.', 'warning')
      return
    }
    try {
      if (editingId) {
        await axios.put(`http://localhost:5210/api/tasks/${editingId}`, {
          projectId,
          title:       form.title,
          description: form.description || null,
          status:      form.status,
          priority:    form.priority,
          assignedTo:  form.assignedTo || null,
          dueDate:     form.dueDate    || null,
        })
        showToast('Tarea actualizada correctamente.', 'success')
      } else {
        await axios.post('http://localhost:5210/api/tasks', {
          projectId,
          title:       form.title,
          description: form.description || null,
          status:      form.status,
          priority:    form.priority,
          assignedTo:  form.assignedTo || null,
          dueDate:     form.dueDate    || null,
        })
        showToast('Tarea creada correctamente.', 'success')
      }
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
      fetchData()
    } catch {
      showToast('Error al guardar la tarea.', 'error')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5210/api/tasks/${id}/status`, { status: newStatus })
      fetchData()
    } catch {
      showToast('Error al actualizar el estado.', 'error')
    }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`¿Eliminar tarea "${title}"?`)) return
    setDeletingId(id)
    try {
      await axios.delete(`http://localhost:5210/api/tasks/${id}`)
      showToast('Tarea eliminada.', 'success')
      fetchData()
    } catch {
      showToast('Error al eliminar la tarea.', 'error')
    }
    setDeletingId(null)
  }

  const filteredTasks = filterStatus === 'todos'
    ? tasks
    : tasks.filter(t => t.status === filterStatus)

  const completadas = tasks.filter(t => t.status === 'completado').length
  const progresoPct = tasks.length > 0 ? Math.round((completadas / tasks.length) * 100) : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/projects')}
          className="text-gray-400 hover:text-white text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
          ← Proyectos
        </button>
        <h1 className="text-2xl font-bold text-white">Tareas</h1>
      </div>

      {/* Info del proyecto */}
      {project && (
        <div className="bg-gray-800 rounded-xl px-5 py-4 border border-gray-700 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold">{project.name}</p>
                <span className="text-orange-500 text-xs font-mono">{project.projectCode}</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">{project.client} · {project.serviceType}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs mb-1">
                {completadas}/{tasks.length} tareas completadas
              </p>
              <div className="w-40 bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${progresoPct}%` }} />
              </div>
              <p className="text-orange-400 text-xs mt-1 font-semibold">{progresoPct}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {['todos', ...STATUS_TASK].map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filterStatus === s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}>
              {s === 'todos' ? '📋 Todas' :
               s === 'pendiente' ? '⏳ Pendiente' :
               s === 'en_progreso' ? '🔄 En progreso' : '✅ Completadas'}
              <span className="ml-1 opacity-70">
                {s === 'todos' ? tasks.length : tasks.filter(t => t.status === s).length}
              </span>
            </button>
          ))}
        </div>
        {perms.tasks.canCreate && (
          <button onClick={openNew}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Nueva Tarea
          </button>
        )}
      </div>

      {/* Formulario crear/editar */}
      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-orange-500/30">
          <h2 className="text-white font-semibold mb-4">
            {editingId ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Título de la tarea *" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm col-span-2 border border-gray-600 focus:border-orange-500 outline-none" />
            <textarea placeholder="Descripción (opcional)" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm col-span-2 border border-gray-600 focus:border-orange-500 outline-none resize-none" />
            <select value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              {PRIORITY.map(p => <option key={p} value={p}>{priorityIcons[p]} {p}</option>)}
            </select>
            <select value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              {STATUS_TASK.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.assignedTo}
              onChange={e => setForm({ ...form, assignedTo: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              <option value="">👤 Sin asignar</option>
              {users.map(u => (
                <option key={u.id} value={u.name}>👷 {u.name}</option>
              ))}
            </select>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Fecha límite</label>
              <input type="date" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              {editingId ? 'Actualizar Tarea' : 'Guardar Tarea'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando tareas...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-400 text-sm">
            {filterStatus === 'todos' ? 'No hay tareas aún.' : `No hay tareas "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTasks.map(t => {
            const sc = statusColors[t.status]     || statusColors.pendiente
            const pc = priorityColors[t.priority] || priorityColors.media
            const isVencida = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completado'
            return (
              <div key={t.id}
                className={`bg-gray-800 rounded-xl px-5 py-4 border transition-all
                  ${isVencida ? 'border-red-500/30' : 'border-gray-700'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${t.status === 'completado' ? 'line-through text-gray-500' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                        {priorityIcons[t.priority]} {t.priority}
                      </span>
                      {isVencida && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          🔴 Vencida
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-gray-500 text-xs mt-1">{t.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {t.assignedTo && (
                        <span className="text-blue-400 text-xs bg-blue-500/10 px-2 py-0.5 rounded-full">
                          👷 {t.assignedTo}
                        </span>
                      )}
                      {t.dueDate && (
                        <span className={`text-xs ${isVencida ? 'text-red-400' : 'text-gray-400'}`}>
                          📅 {t.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select value={t.status}
                      onChange={e => handleStatusChange(t.id, e.target.value)}
                      className={`text-xs px-3 py-1.5 rounded-lg border-0 outline-none cursor-pointer font-medium ${sc.bg} ${sc.text}`}>
                      {STATUS_TASK.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {perms.tasks.canCreate && (
                      <button onClick={() => openEdit(t)}
                        className="bg-gray-700 hover:bg-blue-500/20 hover:text-blue-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors">
                        ✏️
                      </button>
                    )}
                    {perms.tasks.canDelete && (
                      <button onClick={() => handleDelete(t.id, t.title)} disabled={deletingId === t.id}
                        className="bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === t.id ? '...' : '🗑'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Tasks