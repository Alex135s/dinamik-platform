import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import LoadingState from '../components/LoadingState'
import { exportProjectsPDF, exportProjectsExcel } from '../utils/exportUtils'
import Pagination from '../components/Pagination'
import { usePermissions } from '../hooks/usePermissions'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LuLayoutGrid, LuList, LuFileText, LuFileSpreadsheet, LuPlus, LuX, LuSearch,
  LuPencil, LuTrash2, LuMapPin, LuGlobe, LuLightbulb, LuHardHat, LuCuboid, LuMap,
  LuClipboardCheck, LuBuilding2, LuCalendar, LuFlag, LuCircleAlert, LuTriangleAlert,
  LuClock, LuClipboardList,
} from 'react-icons/lu'
import ShareProjectCode from '../components/ShareProjectCode'

const SERVICE_TYPES = ['estructural', 'BIM', 'topografia', 'viabilidad', 'construccion']
const STATUS_TYPES  = ['activo', 'en_proceso', 'completado']

const statusColors = {
  activo:     { bg: 'bg-green-500/20',  text: 'text-green-400'  },
  en_proceso: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  completado: { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
}

const serviceIcons = {
  estructural:  LuHardHat,
  BIM:          LuCuboid,
  topografia:   LuMap,
  viabilidad:   LuClipboardCheck,
  construccion: LuBuilding2,
}

const alertIcons = { vencido: LuCircleAlert, urgente: LuTriangleAlert, proximo: LuClock }

const emptyForm = {
  name: '', client: '', serviceType: '', status: 'activo',
  startDate: '', endDate: '', progress: 0, assignedTo: '',
  location: '', latitude: '', longitude: '',
  clientDocType: 'DNI', clientDocNumber: '', clientEmail: ''
}

const getAlertInfo = (endDate, status) => {
  if (!endDate || status === 'completado') return null
  const hoy  = new Date()
  const fin  = new Date(endDate)
  const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24))
  if (diff < 0)   return { tipo: 'vencido', label: `Venció hace ${Math.abs(diff)} días`, color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  if (diff <= 7)  return { tipo: 'urgente', label: `Vence en ${diff} día${diff !== 1 ? 's' : ''}`, color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  if (diff <= 30) return { tipo: 'proximo', label: `Vence en ${diff} días`, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
  return null
}

function Projects() {
  const { showToast } = useToast()
  const confirm = useConfirm()
  const perms          = usePermissions()
  const navigate       = useNavigate()
  const location       = useLocation()
  const session        = JSON.parse(localStorage.getItem('dinamik_session') || '{}')

  const [projects, setProjects]       = useState([])
  const [users, setUsers]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [deletingId, setDeletingId]   = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode]       = useState('cards') // 'cards' | 'list'
  const ITEMS_PER_PAGE = 12

  const [search, setSearch]               = useState('')
  const [filterStatus, setFilterStatus]   = useState('todos')
  const [filterService, setFilterService] = useState('todos')
  const [filterLocation, setFilterLocation] = useState('todos')
  const [searchingDoc, setSearchingDoc]   = useState(false)

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects'),
        axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/users'),
      ])
      setProjects(projRes.data)
      setUsers(usersRes.data.filter(u => u.role === 'ingeniero'))
    } catch {
      showToast('Error al cargar los proyectos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const myProjects = perms.seesAllProjects
    ? projects
    : projects.filter(p => p.assignedTo === session.id)

  // Ciudades únicas para el filtro
  const cities = [...new Set(
    myProjects.map(p => p.location?.split(',').pop()?.trim()).filter(Boolean)
  )]

  const filteredProjects = myProjects.filter(p => {
    const matchSearch   = search.trim() === '' ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
    const matchStatus   = filterStatus   === 'todos' || p.status      === filterStatus
    const matchService  = filterService  === 'todos' || p.serviceType === filterService
    const matchLocation = filterLocation === 'todos' ||
      p.location?.toLowerCase().includes(filterLocation.toLowerCase())
    return matchSearch && matchStatus && matchService && matchLocation
  })

  const handleFilterChange = (fn) => { fn(); setCurrentPage(1) }
  const hayFiltros = search !== '' || filterStatus !== 'todos' || filterService !== 'todos' || filterLocation !== 'todos'
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE
  )

  const alertas   = myProjects.filter(p => getAlertInfo(p.endDate, p.status) !== null)
  const getUserName = (id) => users.find(u => u.id === id)?.name || null

  const openNew = () => { setEditingId(null); setForm(emptyForm); setShowForm(true) }

  const openEdit = (p) => {
    setEditingId(p.id)
    setForm({
      name: p.name || '', client: p.client || '',
      serviceType: p.serviceType || '', status: p.status || 'activo',
      startDate: p.startDate || '', endDate: p.endDate || '',
      progress: p.progress ?? 0, assignedTo: p.assignedTo || '',
      location: p.location || '',
      latitude: p.latitude || '', longitude: p.longitude || '',
      clientDocType: p.clientDocType || 'DNI', clientDocNumber: p.clientDocNumber || '',
      clientEmail: p.clientEmail || '',
    })
    setShowForm(true)
  }

  // Si venimos de "Editar" en el Detalle del proyecto, abrir el formulario directamente
  useEffect(() => {
    const editId = location.state?.editProjectId
    if (!editId || projects.length === 0) return
    const target = projects.find(p => p.id === editId)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (target) openEdit(target)
    navigate(location.pathname, { replace: true, state: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, location.state])

  const handleSearchDoc = async () => {
    const number = form.clientDocNumber.trim()
    const expectedLength = form.clientDocType === 'DNI' ? 8 : 11
    if (number.length !== expectedLength || !/^\d+$/.test(number)) {
      showToast(`El ${form.clientDocType} debe tener ${expectedLength} dígitos.`, 'warning')
      return
    }
    setSearchingDoc(true)
    try {
      const endpoint = form.clientDocType === 'DNI' ? 'dni' : 'ruc'
      const res = await axios.get(`${import.meta.env.VITE_PROJECTS_API}/api/lookup/${endpoint}/${number}`)
      if (res.data?.found) {
        setForm(f => ({ ...f, client: res.data.name }))
        showToast('Cliente encontrado y autocompletado.', 'success')
      } else {
        showToast(res.data?.error || `No se encontró el ${form.clientDocType}.`, 'warning')
      }
    } catch {
      showToast('Error al consultar el documento.', 'error')
    } finally {
      setSearchingDoc(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim())   { showToast('El nombre es obligatorio.', 'warning'); return }
    if (!form.client.trim()) { showToast('El cliente es obligatorio.', 'warning'); return }
    if (!form.serviceType)   { showToast('Selecciona un tipo de servicio.', 'warning'); return }
    if (!form.startDate)     { showToast('La fecha de inicio es obligatoria.', 'warning'); return }
    if (form.endDate && form.endDate < form.startDate) {
      showToast('La fecha de fin no puede ser menor a la de inicio.', 'warning'); return
    }
    try {
      const payload = {
        name: form.name, client: form.client,
        serviceType: form.serviceType, status: form.status,
        startDate: form.startDate || null, endDate: form.endDate || null,
        progress: Number(form.progress) || 0,
        assignedTo: form.assignedTo || null,
        location: form.location || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        clientDocType: form.clientDocNumber ? form.clientDocType : null,
        clientDocNumber: form.clientDocNumber || null,
        clientEmail: form.clientEmail || null,
      }
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_PROJECTS_API}/api/projects/${editingId}`, payload)
        showToast('Proyecto actualizado correctamente.', 'success')
      } else {
        await axios.post('' + import.meta.env.VITE_PROJECTS_API + '/api/projects', payload)
        showToast('Proyecto creado correctamente.', 'success')
      }
      setForm(emptyForm); setEditingId(null); setShowForm(false); fetchData()
    } catch { showToast('Error al guardar el proyecto.', 'error') }
  }

  const handleDelete = async (id, name) => {
    const ok = await confirm(`Esta acción eliminará el proyecto "${name}" de forma permanente.`, {
      title: 'Eliminar proyecto', confirmLabel: 'Eliminar',
    })
    if (!ok) return
    setDeletingId(id)
    try {
      await axios.delete(`${import.meta.env.VITE_PROJECTS_API}/api/projects/${id}`)
      showToast(`Proyecto "${name}" eliminado.`, 'success')
      fetchData()
    } catch { showToast('Error al eliminar el proyecto.', 'error') }
    setDeletingId(null)
  }

  const resetFiltros = () => {
    setSearch(''); setFilterStatus('todos'); setFilterService('todos'); setFilterLocation('todos')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Proyectos</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredProjects.length} de {myProjects.length} proyectos
            {!perms.seesAllProjects && <span className="text-blue-400 ml-1">(asignados a ti)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle vista */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${viewMode === 'cards' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              <LuLayoutGrid size={14} /> Cards
            </button>
            <button onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              <LuList size={14} /> Lista
            </button>
          </div>
          {perms.projects.canExport && (
            <>
              <button onClick={() => exportProjectsPDF(projects)} disabled={projects.length === 0}
                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <LuFileText size={15} /> PDF
              </button>
              <button onClick={() => exportProjectsExcel(projects)} disabled={projects.length === 0}
                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <LuFileSpreadsheet size={15} /> Excel
              </button>
            </>
          )}
          {perms.projects.canCreate && (
            <button onClick={openNew}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <LuPlus size={15} /> Nuevo Proyecto
            </button>
          )}
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-6 grid gap-2">
          {alertas.map(p => {
            const alert = getAlertInfo(p.endDate, p.status)
            const AlertIcon = alertIcons[alert.tipo]
            return (
              <div key={p.id} className={`rounded-xl px-5 py-3 border flex items-center justify-between ${alert.color}`}>
                <div className="flex items-center gap-3">
                  <AlertIcon size={18} className="flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs opacity-80">{p.client} · {alert.label}</p>
                  </div>
                </div>
                <button onClick={() => openEdit(p)}
                  className="text-xs px-3 py-1 rounded-lg bg-black/20 hover:bg-black/30">
                  Ver proyecto →
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <LuSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Buscar nombre, cliente, lugar..."
              value={search}
              onChange={e => handleFilterChange(() => setSearch(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg pl-9 pr-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
          </div>
          <select value={filterStatus}
            onChange={e => handleFilterChange(() => setFilterStatus(e.target.value))}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="en_proceso">En proceso</option>
            <option value="completado">Completado</option>
          </select>
          <select value={filterService}
            onChange={e => handleFilterChange(() => setFilterService(e.target.value))}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
            <option value="todos">Todos los servicios</option>
            {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterLocation}
            onChange={e => handleFilterChange(() => setFilterLocation(e.target.value))}
            className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
            <option value="todos">Todas las ubicaciones</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {hayFiltros && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <p className="text-orange-400 text-xs flex items-center gap-1.5">
              <LuSearch size={13} /> {filteredProjects.length} resultado{filteredProjects.length !== 1 ? 's' : ''}
            </p>
            <button onClick={resetFiltros}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs bg-gray-700 px-3 py-1 rounded-lg">
              <LuX size={13} /> Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-orange-500/30">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            {editingId ? <LuPencil size={16} /> : <LuPlus size={16} />}
            {editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre del proyecto *" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm col-span-2 border border-gray-600 focus:border-orange-500 outline-none" />

            {/* Documento del cliente (DNI / RUC) */}
            <div className="col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">Buscar cliente por documento</label>
              <div className="flex gap-2">
                <select value={form.clientDocType}
                  onChange={e => setForm({ ...form, clientDocType: e.target.value, clientDocNumber: '' })}
                  className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                </select>
                <input placeholder={form.clientDocType === 'DNI' ? '8 dígitos' : '11 dígitos'}
                  value={form.clientDocNumber}
                  maxLength={form.clientDocType === 'DNI' ? 8 : 11}
                  onChange={e => setForm({ ...form, clientDocNumber: e.target.value.replace(/\D/g, '') })}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
                <button type="button" onClick={handleSearchDoc} disabled={searchingDoc}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                  {searchingDoc ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>

            <input placeholder="Cliente *" value={form.client}
              onChange={e => setForm({ ...form, client: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            <input placeholder={form.clientDocType === 'RUC' ? 'Correo corporativo (para el portal)' : 'Correo Gmail (para el portal)'}
              type="email" value={form.clientEmail}
              onChange={e => setForm({ ...form, clientEmail: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            <select value={form.serviceType}
              onChange={e => setForm({ ...form, serviceType: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              <option value="">Tipo de servicio *</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {perms.projects.canEdit && (
              <select value={form.assignedTo}
                onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
                <option value="">Sin ingeniero asignado</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            )}

            {/* Ubicación */}
            <div className="col-span-2">
              <label className="text-gray-400 text-xs mb-1 flex items-center gap-1"><LuMapPin size={12} /> Ubicación del proyecto</label>
              <input placeholder="Ej: Av. Javier Prado 123, San Isidro, Lima" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 flex items-center gap-1"><LuGlobe size={12} /> Latitud</label>
              <input placeholder="-12.0464" value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 flex items-center gap-1"><LuGlobe size={12} /> Longitud</label>
              <input placeholder="-77.0428" value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            </div>
            <p className="text-gray-500 text-xs col-span-2 flex items-start gap-1.5">
              <LuLightbulb size={13} className="flex-shrink-0 mt-0.5" />
              Para obtener latitud/longitud: ve a Google Maps, haz clic derecho en la ubicación → "¿Qué hay aquí?" y copia las coordenadas.
            </p>

            <div>
              <label className="text-gray-400 text-xs mb-1 block">Fecha de inicio *</label>
              <input type="date" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Fecha de fin</label>
              <input type="date" value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">
                Progreso: <span className="text-orange-400 font-semibold">{form.progress}%</span>
              </label>
              <input type="range" min="0" max="100" value={form.progress}
                onChange={e => setForm({ ...form, progress: e.target.value })}
                className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista / Cards */}
      {loading ? (
        <LoadingState label="Cargando proyectos..." />
      ) : filteredProjects.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <div className="flex justify-center mb-3 text-gray-500">
            {hayFiltros ? <LuSearch size={40} /> : <LuHardHat size={40} />}
          </div>
          <p className="text-gray-400 text-sm">
            {hayFiltros ? 'No se encontraron proyectos.' : 'No hay proyectos aún.'}
          </p>
          {hayFiltros && (
            <button onClick={resetFiltros}
              className="mt-3 text-orange-400 text-xs underline">Limpiar filtros</button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        // ── VISTA CARDS ──────────────────────────────────
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProjects.map(p => {
            const colors  = statusColors[p.status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
            const alert   = getAlertInfo(p.endDate, p.status)
            const ingeniero = getUserName(p.assignedTo)
            const ServiceIcon = serviceIcons[p.serviceType] || LuHardHat
            const AlertIcon = alert ? alertIcons[alert.tipo] : null
            return (
              <div key={p.id}
                className={`bg-gray-800 rounded-xl p-5 border flex flex-col transition-all hover:border-orange-500/50
                  ${alert?.tipo === 'vencido' || alert?.tipo === 'urgente' ? 'border-red-500/30' :
                    alert?.tipo === 'proximo' ? 'border-yellow-500/30' : 'border-gray-700'}`}>

                {/* Header card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 flex-shrink-0">
                    <ServiceIcon size={22} />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                    {p.status}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-white font-semibold text-sm mb-0.5 line-clamp-2">{p.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-orange-500 text-xs font-mono">{p.projectCode}</p>
                  <ShareProjectCode code={p.projectCode} projectName={p.name} client={p.client} />
                </div>
                <p className="text-gray-400 text-xs mt-1 truncate">
                  {p.client}
                  {p.clientDocNumber && <span className="text-gray-500"> · {p.clientDocType} {p.clientDocNumber}</span>}
                </p>
                {p.location && (
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <LuMapPin size={12} className="flex-shrink-0" /> <span className="truncate">{p.location}</span>
                  </p>
                )}

                {/* Mini mapa */}
                {p.latitude && p.longitude && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-700" style={{ height: '120px' }}>
                    <iframe
                      title={`mapa-${p.id}`}
                      src={`https://maps.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed`}
                      width="100%"
                      height="120"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Progreso */}
                {p.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progreso</span>
                      <span className="text-orange-400 font-semibold">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-orange-500 h-1.5 rounded-full"
                        style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                )}

                {/* Alerta */}
                {alert && (
                  <div className={`mt-2 text-xs px-2 py-1 rounded-lg flex items-center gap-1.5 ${alert.color}`}>
                    <AlertIcon size={13} className="flex-shrink-0" /> {alert.label}
                  </div>
                )}

                {/* Ingeniero asignado */}
                {ingeniero && (
                  <p className="text-blue-400 text-xs mt-2 flex items-center gap-1"><LuHardHat size={12} /> {ingeniero}</p>
                )}

                {/* Fechas */}
                {(p.startDate || p.endDate) && (
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    {p.startDate && <span className="flex items-center gap-1"><LuCalendar size={12} /> {p.startDate}</span>}
                    {p.endDate   && <span className="flex items-center gap-1"><LuFlag size={12} /> {p.endDate}</span>}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700">
                  <button onClick={() => navigate(`/projects/${p.id}/detail`)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-blue-500/20 hover:text-blue-400 text-gray-400 text-xs py-1.5 rounded-lg transition-colors">
                    <LuSearch size={13} /> Detalle
                  </button>
                  <button onClick={() => navigate(`/projects/${p.id}/tasks`)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 text-xs py-1.5 rounded-lg transition-colors">
                    <LuClipboardList size={13} /> Tareas
                  </button>
                  {perms.projects.canEdit && (
                    <button onClick={() => openEdit(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-blue-500/20 hover:text-blue-400 text-gray-400 text-xs py-1.5 rounded-lg transition-colors">
                      <LuPencil size={13} /> Editar
                    </button>
                  )}
                  {perms.projects.canDelete && (
                    <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id}
                      aria-label={`Eliminar proyecto ${p.name}`}
                      className="flex items-center justify-center bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors">
                      {deletingId === p.id ? '...' : <LuTrash2 size={13} />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // ── VISTA LISTA ──────────────────────────────────
        <div className="grid gap-3">
          {paginatedProjects.map(p => {
            const colors  = statusColors[p.status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
            const alert   = getAlertInfo(p.endDate, p.status)
            const ingeniero = getUserName(p.assignedTo)
            const AlertIcon = alert ? alertIcons[alert.tipo] : null
            return (
              <div key={p.id}
                className={`bg-gray-800 rounded-xl px-5 py-4 border flex items-center justify-between hover:border-gray-600 transition-colors
                  ${alert?.tipo === 'vencido' || alert?.tipo === 'urgente' ? 'border-red-500/30' :
                    alert?.tipo === 'proximo' ? 'border-yellow-500/30' : 'border-gray-700'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold text-sm">{p.name}</h3>
                    {p.projectCode && <span className="text-orange-500 text-xs font-mono">{p.projectCode}</span>}
                    {p.projectCode && <ShareProjectCode code={p.projectCode} projectName={p.name} client={p.client} />}
                    {alert && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${alert.color}`}>
                        <AlertIcon size={12} /> {alert.label}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    {p.client} · {p.serviceType}
                    {p.clientDocNumber && <span className="text-gray-500"> · {p.clientDocType} {p.clientDocNumber}</span>}
                  </p>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    {p.location && <p className="text-gray-500 text-xs flex items-center gap-1"><LuMapPin size={12} /> {p.location}</p>}
                    {p.startDate && <p className="text-gray-500 text-xs flex items-center gap-1"><LuCalendar size={12} /> {p.startDate}</p>}
                    {p.endDate   && <p className="text-gray-500 text-xs flex items-center gap-1"><LuFlag size={12} /> {p.endDate}</p>}
                    {ingeniero   && <p className="text-blue-400 text-xs flex items-center gap-1"><LuHardHat size={12} /> {ingeniero}</p>}
                  </div>
                  {p.progress > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-32 bg-gray-700 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-gray-400 text-xs">{p.progress}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className={`${colors.bg} ${colors.text} text-xs px-3 py-1 rounded-full font-medium`}>
                    {p.status}
                  </span>
                  <button onClick={() => navigate(`/projects/${p.id}/tasks`)}
                    className="flex items-center gap-1.5 bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors">
                    <LuClipboardList size={13} /> Tareas
                  </button>
                  {perms.projects.canEdit && (
                    <button onClick={() => openEdit(p)}
                      className="flex items-center gap-1.5 bg-gray-700 hover:bg-blue-500/20 hover:text-blue-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors">
                      <LuPencil size={13} /> Editar
                    </button>
                  )}
                  {perms.projects.canDelete && (
                    <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id}
                      className="flex items-center bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      {deletingId === p.id ? '...' : <LuTrash2 size={13} />}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination
        totalItems={filteredProjects.length}
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default Projects