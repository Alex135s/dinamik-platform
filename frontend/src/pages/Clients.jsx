import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { getInitials } from '../components/portal/portalData'
import LoadingState from '../components/LoadingState'
import Pagination from '../components/Pagination'
import { exportClientsPDF, exportClientsExcel } from '../utils/exportUtils'
import { LuContact, LuMail, LuFolderKanban, LuPencil, LuCheck, LuX, LuSearch, LuFileText, LuFileSpreadsheet, LuPlus, LuTrash2 } from 'react-icons/lu'
import { FcGoogle } from 'react-icons/fc'

const tipoInfo = {
  empresa: { label: 'Empresa', avatar: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  persona: { label: 'Persona', avatar: 'bg-gradient-to-br from-green-500 to-green-600' },
}
const tipoDefault = { label: 'Sin definir', avatar: 'bg-gradient-to-br from-gray-500 to-gray-600' }

const emptyEdit = { name: '', email: '' }
const emptyNew  = { name: '', email: '', docType: 'DNI', docNumber: '' }
const PAGE_SIZE = 10

function Clients() {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [clients, setClients]     = useState([])
  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState(emptyEdit)
  const [saving, setSaving]       = useState(false)
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [showNew, setShowNew]     = useState(false)
  const [newForm, setNewForm]     = useState(emptyNew)
  const [creating, setCreating]   = useState(false)
  const [deletingId, setDeletingId] = useState(null)

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

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.docNumber?.toLowerCase().includes(search.toLowerCase())
  )
  const pagedClients = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = async () => {
    if (!newForm.name.trim()) {
      showToast('El nombre es obligatorio.', 'warning')
      return
    }
    setCreating(true)
    try {
      await axios.post(`${import.meta.env.VITE_PROJECTS_API}/api/clients`, {
        name: newForm.name.trim(),
        email: newForm.email.trim() || null,
        docType: newForm.docNumber.trim() ? newForm.docType : null,
        docNumber: newForm.docNumber.trim() || null,
      })
      showToast(`Cliente "${newForm.name}" creado correctamente.`, 'success')
      setNewForm(emptyNew)
      setShowNew(false)
      fetchData()
    } catch {
      showToast('Error al crear el cliente.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (c) => {
    const ok = await confirm(`Esta acción eliminará al cliente "${c.name}" de forma permanente.`, {
      title: 'Eliminar cliente', confirmLabel: 'Eliminar',
    })
    if (!ok) return
    setDeletingId(c.id)
    try {
      await axios.delete(`${import.meta.env.VITE_PROJECTS_API}/api/clients/${c.id}`)
      showToast(`Cliente "${c.name}" eliminado.`, 'success')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al eliminar el cliente.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

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
        <div className="flex items-center gap-2">
          <button onClick={() => exportClientsPDF(clients, projects)} disabled={clients.length === 0}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <LuFileText size={15} /> PDF
          </button>
          <button onClick={() => exportClientsExcel(clients, projects)} disabled={clients.length === 0}
            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <LuFileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => { setNewForm(emptyNew); setShowNew(!showNew) }}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <LuPlus size={15} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Formulario de nuevo cliente */}
      {showNew && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-orange-500/30">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><LuPlus size={16} /> Nuevo Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre *" value={newForm.name}
              onChange={e => setNewForm({ ...newForm, name: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            <input placeholder="Correo (acceso al portal)" type="email" value={newForm.email}
              onChange={e => setNewForm({ ...newForm, email: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            <select value={newForm.docType}
              onChange={e => setNewForm({ ...newForm, docType: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
            </select>
            <input placeholder="Número de documento (opcional)" value={newForm.docNumber}
              onChange={e => setNewForm({ ...newForm, docNumber: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} disabled={creating}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium">
              {creating ? 'Creando...' : 'Crear Cliente'}
            </button>
            <button onClick={() => setShowNew(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      {!loading && clients.length > 0 && (
        <div className="relative mb-4">
          <LuSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Buscar por nombre, correo o documento..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-gray-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-700 focus:border-orange-500 outline-none"
          />
        </div>
      )}

      {loading ? (
        <LoadingState label="Cargando clientes..." />
      ) : clients.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <div className="flex justify-center mb-3 text-gray-500"><LuContact size={40} /></div>
          <p className="text-gray-400 text-sm">No hay clientes registrados aún.</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">No se encontraron clientes.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Header interno de la tarjeta */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
            <div>
              <h2 className="text-white font-semibold">Lista de clientes</h2>
              <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1.5">
                <LuFolderKanban size={12} /> Se crean automáticamente al registrar un proyecto, o manualmente con "Nuevo Cliente"
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cliente</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Correo (acceso al portal)</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Proyectos</th>
                  <th className="px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {pagedClients.map(c => {
                  const tipo = tipoInfo[c.tipo] || tipoDefault
                  const misProyectos = proyectosDe(c.id)
                  const isEditing = editingId === c.id
                  return (
                    <tr key={c.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <input value={editForm.name} autoFocus
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm border border-gray-600 focus:border-orange-500 outline-none w-full" />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${tipo.avatar}`}>
                              {getInitials(c.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">{c.name}</p>
                              <p className="text-gray-500 text-xs">
                                {tipo.label}{c.docNumber && ` · ${c.docType} ${c.docNumber}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
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
                      <td className="px-5 py-4">
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
                      <td className="px-5 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => saveEdit(c.id)} disabled={saving} aria-label="Guardar cambios"
                              className="flex items-center bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                              <LuCheck size={14} />
                            </button>
                            <button onClick={cancelEdit} aria-label="Cancelar edición"
                              className="flex items-center bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors">
                              <LuX size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => startEdit(c)} aria-label={`Editar cliente ${c.name}`}
                              className="flex items-center bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors">
                              <LuPencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(c)} disabled={deletingId === c.id}
                              aria-label={`Eliminar cliente ${c.name}`}
                              className="flex items-center bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                              {deletingId === c.id ? '...' : <LuTrash2 size={13} />}
                            </button>
                          </div>
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

      {!loading && filteredClients.length > 0 && (
        <Pagination
          totalItems={filteredClients.length}
          itemsPerPage={PAGE_SIZE}
          currentPage={page}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default Clients
