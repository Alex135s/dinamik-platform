import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import { LuContact, LuBuilding2, LuUserRound, LuMail, LuIdCard, LuFolderKanban, LuPencil, LuCheck, LuX } from 'react-icons/lu'
import { FcGoogle } from 'react-icons/fc'

const tipoInfo = {
  empresa: { label: 'Empresa', bg: 'bg-blue-500/20',   text: 'text-blue-400',   Icon: LuBuilding2 },
  persona: { label: 'Persona', bg: 'bg-green-500/20',  text: 'text-green-400',  Icon: LuUserRound },
}

const emptyEdit = { name: '', email: '' }

function Clients() {
  const { showToast } = useToast()
  const [clients, setClients]     = useState([])
  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState(emptyEdit)
  const [saving, setSaving]       = useState(false)

  const fetchData = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/clients'),
        axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects'),
      ])
      setClients(clientsRes.data)
      setProjects(projectsRes.data)
    } catch {
      showToast('Error al cargar los clientes.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const proyectosDe = (clientId) => projects.filter(p => p.clientId === clientId)

  const startEdit = (c) => {
    setEditingId(c.id)
    setEditForm({ name: c.name || '', email: c.email || '' })
  }

  const cancelEdit = () => { setEditingId(null); setEditForm(emptyEdit) }

  const saveEdit = async (id) => {
    if (!editForm.name.trim()) {
      showToast('El nombre no puede quedar vacío.', 'warning')
      return
    }
    setSaving(true)
    try {
      await axios.put(`${import.meta.env.VITE_PROJECTS_API}/api/clients/${id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim() || null,
      })
      showToast('Cliente actualizado correctamente.', 'success')
      cancelEdit()
      fetchData()
    } catch {
      showToast('Error al actualizar el cliente.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400 text-sm mt-1">{clients.length} clientes registrados</p>
        </div>
      </div>

      <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-4">
        <LuFolderKanban size={13} /> Los clientes se crean automáticamente al registrar un proyecto con su DNI/RUC y correo.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando clientes...</p>
      ) : clients.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <div className="flex justify-center mb-3 text-gray-500"><LuContact size={40} /></div>
          <p className="text-gray-400 text-sm">No hay clientes registrados aún.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="px-5 py-3 font-medium text-gray-400">Cliente</th>
                  <th className="px-5 py-3 font-medium text-gray-400">Tipo</th>
                  <th className="px-5 py-3 font-medium text-gray-400">Documento</th>
                  <th className="px-5 py-3 font-medium text-gray-400">Correo (acceso al portal)</th>
                  <th className="px-5 py-3 font-medium text-gray-400">Proyectos</th>
                  <th className="px-5 py-3 font-medium text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => {
                  const tipo = tipoInfo[c.tipo] || { label: 'Sin definir', bg: 'bg-gray-500/20', text: 'text-gray-400', Icon: LuContact }
                  const misProyectos = proyectosDe(c.id)
                  const isEditing = editingId === c.id
                  return (
                    <tr key={c.id} className="border-b border-gray-700/60 last:border-0">
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input value={editForm.name} autoFocus
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm border border-gray-600 focus:border-orange-500 outline-none w-full" />
                        ) : (
                          <p className="text-white font-medium">{c.name}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${tipo.bg} ${tipo.text}`}>
                          <tipo.Icon size={12} /> {tipo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-300 flex items-center gap-1.5">
                        {c.docNumber ? <><LuIdCard size={13} className="text-gray-500" /> {c.docType} {c.docNumber}</> : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input value={editForm.email} type="email" placeholder="correo@ejemplo.com"
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                            className="bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm border border-gray-600 focus:border-orange-500 outline-none w-full" />
                        ) : c.email ? (
                          <span className="text-gray-300 flex items-center gap-1.5">
                            <LuMail size={13} className="text-gray-500" /> {c.email}
                            {c.firebaseLinked && (
                              <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <FcGoogle size={11} /> Google
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">Sin correo — no puede usar el portal con Google</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {misProyectos.length === 0 ? (
                          <span className="text-gray-600 text-xs">Sin proyectos</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {misProyectos.map(p => (
                              <span key={p.id} className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{p.name}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => saveEdit(c.id)} disabled={saving}
                              className="flex items-center bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                              <LuCheck size={14} />
                            </button>
                            <button onClick={cancelEdit}
                              className="flex items-center bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors">
                              <LuX size={14} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(c)}
                            className="flex items-center bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors">
                            <LuPencil size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clients
