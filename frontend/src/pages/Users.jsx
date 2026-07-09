import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'

const ROLES = ['admin', 'tecnico']

const roleColors = {
  admin:   { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  tecnico: { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
}

const emptyForm = { name: '', email: '', password: '', role: 'tecnico' }

function Users() {
  const { showToast } = useToast()
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [deletingId, setDeletingId] = useState(null)
  // Usuario actual logueado
  const session = JSON.parse(localStorage.getItem('dinamik_session') || '{}')

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5210/api/users')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('El nombre es obligatorio.', 'warning')
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      showToast('Ingresa un email válido.', 'warning')
      return
    }
    if (!form.password || form.password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'warning')
      return
    }
    try {
      await axios.post('http://localhost:5210/api/users', form)
      showToast(`Usuario "${form.name}" creado correctamente.`, 'success')
      setForm(emptyForm)
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear el usuario.'
      showToast(msg, 'error')
    }
  }

  const handleChangeRole = async (id, currentRole, name) => {
    const newRole = currentRole === 'admin' ? 'tecnico' : 'admin'
    if (!window.confirm(`¿Cambiar rol de "${name}" a ${newRole}?`)) return
    try {
      await axios.patch(`http://localhost:5210/api/users/${id}/role`, { role: newRole })
      showToast(`Rol de "${name}" cambiado a ${newRole}.`, 'success')
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
    if (!window.confirm(`¿Eliminar usuario "${name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    try {
      await axios.delete(`http://localhost:5210/api/users/${id}`)
      showToast(`Usuario "${name}" eliminado.`, 'success')
      fetchUsers()
    } catch {
      showToast('Error al eliminar el usuario.', 'error')
    }
    setDeletingId(null)
  }

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
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nuevo Usuario
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-orange-500/30">
          <h2 className="text-white font-semibold mb-4">➕ Nuevo Usuario</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Nombre completo *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm col-span-2 border border-gray-600 focus:border-orange-500 outline-none"
            />
            <input
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none"
            />
            <input
              placeholder="Contraseña * (mín. 6 caracteres)"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none"
            />
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
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

      {/* Lista */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando usuarios...</p>
      ) : (
        <div className="grid gap-3">
          {users.map(u => {
            const colors = roleColors[u.role] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
            const isMe = u.id === session.id
            return (
              <div key={u.id}
                className={`bg-gray-800 rounded-xl px-5 py-4 border flex items-center justify-between
                  ${isMe ? 'border-orange-500/30' : 'border-gray-700'}`}>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {u.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{u.name}</p>
                      {isMe && (
                        <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                          Tú
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{u.email}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Registrado: {new Date(u.createdAt).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <span className={`${colors.bg} ${colors.text} text-xs px-3 py-1 rounded-full font-medium`}>
                    {u.role}
                  </span>
                  {!isMe && (
                    <>
                      <button
                        onClick={() => handleChangeRole(u.id, u.role, u.name)}
                        className="bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors">
                        🔄 Cambiar Rol
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        disabled={deletingId === u.id}
                        className="bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {deletingId === u.id ? '...' : '🗑'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Users