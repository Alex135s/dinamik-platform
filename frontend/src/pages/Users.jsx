import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import LoadingState from '../components/LoadingState'
import Pagination from '../components/Pagination'
import { LuPlus, LuTrash2, LuIdCard, LuMapPin, LuFolderKanban, LuSearch } from 'react-icons/lu'
import { FcGoogle } from 'react-icons/fc'
import { ROLES, roleLabels, roleColors } from '../constants/roles'

const SEDES = ['Lima', 'Ica', 'Arequipa']
const PAGE_SIZE = 10

const emptyForm = { firstName: '', lastName: '', dni: '', email: '', password: '', role: 'tecnico', sede: '' }

function Users() {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [users, setUsers]           = useState([])
  const [projects, setProjects]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(emptyForm)
  const [deletingId, setDeletingId] = useState(null)
  const [searchingDni, setSearchingDni] = useState(false)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  // Usuario actual logueado
  const session = JSON.parse(localStorage.getItem('dinamik_session') || '{}')

  const fetchUsers = async () => {
    try {
      const res = await axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/users')
      setUsers(res.data)
    } catch {
      showToast('Error al cargar los usuarios.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers()
    axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects')
      .then(res => setProjects(res.data)).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearchDni = async () => {
    const number = form.dni.trim()
    if (number.length !== 8 || !/^\d+$/.test(number)) {
      showToast('El DNI debe tener 8 dígitos.', 'warning')
      return
    }
    setSearchingDni(true)
    try {
      const res = await axios.get(`${import.meta.env.VITE_PROJECTS_API}/api/lookup/dni/${number}`)
      if (res.data?.found) {
        setForm(f => ({
          ...f,
          firstName: res.data.firstName || f.firstName,
          lastName:  res.data.lastName  || f.lastName,
        }))
        showToast('Persona encontrada y autocompletada.', 'success')
      } else {
        showToast(res.data?.error || 'No se encontró el DNI.', 'warning')
      }
    } catch {
      showToast('Error al consultar el DNI.', 'error')
    } finally {
      setSearchingDni(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showToast('Nombre y apellido son obligatorios.', 'warning')
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      showToast('Ingresa un email válido.', 'warning')
      return
    }
    if (form.password && form.password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'warning')
      return
    }
    if (form.dni && (form.dni.length !== 8 || !/^\d+$/.test(form.dni))) {
      showToast('El DNI debe tener 8 dígitos.', 'warning')
      return
    }
    try {
      await axios.post('' + import.meta.env.VITE_PROJECTS_API + '/api/users', {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        password:  form.password || null,
        role:      form.role,
        dni:       form.dni || null,
        sede:      form.sede || null,
      })
      showToast(`Usuario "${form.firstName} ${form.lastName}" creado correctamente.`, 'success')
      setForm(emptyForm)
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear el usuario.'
      showToast(msg, 'error')
    }
  }

  const handleChangeRole = async (id, newRole, name) => {
    const ok = await confirm(
      `El rol de "${name}" cambiará a "${roleLabels[newRole] || newRole}". Esto afecta directamente sus permisos y accesos en el sistema.`,
      { title: 'Cambiar rol', confirmLabel: 'Cambiar rol', danger: false }
    )
    if (!ok) return
    try {
      await axios.patch(`${import.meta.env.VITE_PROJECTS_API}/api/users/${id}/role`, { role: newRole })
      showToast(`Rol de "${name}" cambiado a ${roleLabels[newRole] || newRole}.`, 'success')
      fetchUsers()
    } catch {
      showToast('Error al cambiar el rol.', 'error')
    }
  }

  const handleDelete = async (id, name) => {
    if (id === session.id) {
      showToast('No puedes eliminar tu propia cuenta.', 'warning')
      return
    }
    const ok = await confirm(`Esta acción eliminará al usuario "${name}" de forma permanente y no se puede deshacer.`, {
      title: 'Eliminar usuario', confirmLabel: 'Eliminar',
    })
    if (!ok) return
    setDeletingId(id)
    try {
      await axios.delete(`${import.meta.env.VITE_PROJECTS_API}/api/users/${id}`)
      showToast(`Usuario "${name}" eliminado.`, 'success')
      fetchUsers()
    } catch {
      showToast('Error al eliminar el usuario.', 'error')
    }
    setDeletingId(null)
  }

  const proyectosDe = (userId) => projects.filter(p => p.assignedTo === userId)

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setShowForm(!showForm) }}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <LuPlus size={15} /> Nuevo Usuario
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-orange-500/30">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><LuPlus size={16} /> Nuevo Usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Buscar por DNI */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">Buscar por DNI (opcional)</label>
              <div className="flex gap-2">
                <input placeholder="8 dígitos" value={form.dni} maxLength={8}
                  onChange={e => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
                <button type="button" onClick={handleSearchDni} disabled={searchingDni}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                  {searchingDni ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>

            <input placeholder="Nombres *" value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            <input placeholder="Apellidos *" value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />

            <input placeholder="Email *" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            <input placeholder="Contraseña (opcional si ingresará con Google)" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />

            <select value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={form.sede}
              onChange={e => setForm({ ...form, sede: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              <option value="">Sede (opcional)</option>
              {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-3">
            <FcGoogle size={14} /> Si dejas la contraseña vacía, el usuario solo podrá ingresar con "Ingresar con Google" usando este mismo correo.
          </p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Crear Usuario
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-4">
        <LuSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-gray-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-700 focus:border-orange-500 outline-none"
        />
      </div>

      {/* Lista */}
      {loading ? (
        <LoadingState label="Cargando usuarios..." />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {pagedUsers.map(u => {
            const colors = roleColors[u.role] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
            const isMe = u.id === session.id
            const misProyectos = proyectosDe(u.id)
            return (
              <div key={u.id}
                className={`bg-gray-800 rounded-xl px-5 py-4 border
                  ${isMe ? 'border-orange-500/30' : 'border-gray-700'}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        {isMe && (
                          <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                            Tú
                          </span>
                        )}
                        {u.firebaseLinked && (
                          <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FcGoogle size={11} /> Google
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">{u.email}</p>
                      <div className="flex items-center gap-3 flex-wrap mt-1">
                        {u.dni && (
                          <span className="text-gray-500 text-xs flex items-center gap-1"><LuIdCard size={12} /> {u.dni}</span>
                        )}
                        {u.sede && (
                          <span className="text-gray-500 text-xs flex items-center gap-1"><LuMapPin size={12} /> {u.sede}</span>
                        )}
                        <span className="text-gray-500 text-xs">
                          Registrado: {new Date(u.createdAt).toLocaleDateString('es-PE', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    {isMe ? (
                      <span className={`${colors.bg} ${colors.text} text-xs px-3 py-1 rounded-full font-medium`}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    ) : (
                      <select value={u.role}
                        onChange={e => handleChangeRole(u.id, e.target.value, u.name)}
                        className={`text-xs font-medium pl-3 pr-2 py-1.5 rounded-full border-0 outline-none cursor-pointer ${colors.bg} ${colors.text}`}>
                        {ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                      </select>
                    )}
                    {!isMe && (
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={deletingId === u.id}
                        className="flex items-center bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === u.id ? '...' : <LuTrash2 size={13} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Proyectos asociados (los ingenieros quedan asignados a nivel de proyecto) */}
                {u.role === 'ingeniero' && (
                  <div className="mt-3 pt-3 border-t border-gray-700/60 flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 text-xs flex items-center gap-1 flex-shrink-0">
                      <LuFolderKanban size={12} /> Proyectos:
                    </span>
                    {misProyectos.length === 0 ? (
                      <span className="text-gray-600 text-xs">Sin proyectos asignados</span>
                    ) : (
                      misProyectos.map(p => (
                        <span key={p.id} className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                          {p.name}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && (
        <Pagination
          totalItems={filteredUsers.length}
          itemsPerPage={PAGE_SIZE}
          currentPage={page}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default Users
