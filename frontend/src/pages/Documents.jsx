import { useState, useEffect } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { exportDocumentsPDF, exportDocumentsExcel } from '../utils/exportUtils'
import PDFPreview from '../components/PDFPreview'
import LoadingState from '../components/LoadingState'
import { usePermissions } from '../hooks/usePermissions'
import {
  LuFileText, LuFileSpreadsheet, LuSearch, LuFolder, LuPencilRuler, LuCuboid, LuCamera,
  LuImages, LuClipboardList, LuPaperclip, LuPlus, LuUpload, LuCheck, LuX, LuEye, LuDownload,
  LuTrash2, LuArrowLeft,
} from 'react-icons/lu'

const DOC_TYPES = ['plano_pdf', 'plano_cad', 'imagen_3d', 'foto', 'informe', 'otro']

const typeIcons = {
  plano_pdf: LuFileText, plano_cad: LuPencilRuler, imagen_3d: LuCuboid, foto: LuCamera, informe: LuClipboardList, otro: LuPaperclip,
}

const typeLabels = {
  plano_pdf: 'Plano PDF', plano_cad: 'CAD / DWG',
  imagen_3d: 'Imagen 3D', foto: 'Avance de obra', informe: 'Informe', otro: 'Otro',
}

const ACCEPT_BY_TYPE = {
  plano_pdf: '.pdf', plano_cad: '.dwg,.dxf,.dxb',
  imagen_3d: '.jpg,.jpeg,.png,.webp', foto: 'image/*', informe: '.pdf,.docx,.xlsx', otro: '*',
}

const statusColors = {
  activo:     { bg: 'bg-green-500/20',  text: 'text-green-400'  },
  en_proceso: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  completado: { bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
}

function Documents() {
  const { showToast } = useToast()
  const confirm        = useConfirm()
  const perms         = usePermissions()
  const session       = JSON.parse(localStorage.getItem('dinamik_session') || '{}')

  const [projects, setProjects]         = useState([])
  const [docs, setDocs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showForm, setShowForm]         = useState(false)
  const [form, setForm]                 = useState({ name: '', projectId: '', type: 'plano_pdf' })
  const [file, setFile]                 = useState(null)
  const [uploading, setUploading]       = useState(false)
  const [progress, setProgress]         = useState(0)
  const [previewDoc, setPreviewDoc]     = useState(null)
  const [previewPDF, setPreviewPDF]     = useState(null)
  const [deletingId, setDeletingId]     = useState(null)
  const [searchProject, setSearchProject] = useState('')
  const [photoBusy, setPhotoBusy]       = useState(false)
  const [photoStat, setPhotoStat]       = useState({ done: 0, total: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [p, d] = await Promise.all([
        axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects'),
        axios.get('' + import.meta.env.VITE_DOCUMENTS_API + '/api/documents')
      ])
      setProjects(p.data)
      setDocs(d.data)
    } catch {
      showToast('Error al cargar documentos.', 'error')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // Filtrar proyectos según rol
  const myProjects = perms.seesAllProjects
    ? projects
    : projects.filter(p => p.assignedTo === session.id)

  const filteredProjects = myProjects.filter(p =>
    p.name?.toLowerCase().includes(searchProject.toLowerCase()) ||
    p.client?.toLowerCase().includes(searchProject.toLowerCase())
  )

  // Docs del proyecto seleccionado
  const projectDocs = selectedProject
    ? docs.filter(d => d.projectId === selectedProject.id)
    : []

  const handleUpload = async () => {
    if (!file || !form.name || !form.projectId) {
      showToast('Completa todos los campos y selecciona un archivo.', 'warning')
      return
    }
    setUploading(true)
    const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed',
      snapshot => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        setProgress(pct)
      },
      error => {
        console.error(error)
        setUploading(false)
        showToast('Error al subir el archivo.', 'error')
      },
      async () => {
        const fileUrl = await getDownloadURL(uploadTask.snapshot.ref)
        await axios.post('' + import.meta.env.VITE_DOCUMENTS_API + '/api/documents', {
          projectId: form.projectId,
          name: form.name, type: form.type, fileUrl, enabled: true
        })
        showToast('Documento subido correctamente.', 'success')
        setForm({ name: '', projectId: selectedProject?.id || '', type: 'plano_pdf' })
        setFile(null)
        setProgress(0)
        setUploading(false)
        setShowForm(false)
        fetchData()
      }
    )
  }

  // Subir varias fotos (desde cámara o galería) como documentos tipo 'foto'
  const handlePhotos = async (fileList) => {
    const arr = Array.from(fileList || [])
    if (arr.length === 0 || !selectedProject) return
    setPhotoBusy(true)
    setPhotoStat({ done: 0, total: arr.length })
    let ok = 0
    for (let i = 0; i < arr.length; i++) {
      const f = arr[i]
      try {
        const safe = (f.name || 'foto').replace(/[^a-zA-Z0-9._-]/g, '_')
        const storageRef = ref(storage, `documents/fotos/${Date.now()}_${i}_${safe}`)
        await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, f)
          task.on('state_changed', null, reject, async () => {
            try {
              const fileUrl = await getDownloadURL(task.snapshot.ref)
              const fecha = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
              const hora  = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
              const nombre = `Foto ${fecha} ${hora}` + (arr.length > 1 ? ` (${i + 1})` : '')
              await axios.post('' + import.meta.env.VITE_DOCUMENTS_API + '/api/documents', {
                projectId: selectedProject.id, name: nombre, type: 'foto', fileUrl, enabled: true
              })
              resolve()
            } catch (e) { reject(e) }
          })
        })
        ok++
      } catch { /* continúa con la siguiente foto */ }
      setPhotoStat({ done: i + 1, total: arr.length })
    }
    setPhotoBusy(false)
    setPhotoStat({ done: 0, total: 0 })
    showToast(`${ok} foto(s) subidas al proyecto.`, ok > 0 ? 'success' : 'error')
    fetchData()
  }

  const toggleEnabled = async (id, currentEnabled) => {
    try {
      await axios.patch(`${import.meta.env.VITE_DOCUMENTS_API}/api/documents/${id}/toggle`, { enabled: !currentEnabled })
      fetchData()
    } catch {
      showToast('Error al cambiar el estado.', 'error')
    }
  }

  const handleDelete = async (id, name) => {
    const ok = await confirm(`Esta acción eliminará el documento "${name}" de forma permanente.`, {
      title: 'Eliminar documento', confirmLabel: 'Eliminar',
    })
    if (!ok) return
    setDeletingId(id)
    try {
      await axios.delete(`${import.meta.env.VITE_DOCUMENTS_API}/api/documents/${id}`)
      showToast('Documento eliminado.', 'success')
      fetchData()
    } catch {
      showToast('Error al eliminar el documento.', 'error')
    }
    setDeletingId(null)
  }

  const openProject = (p) => {
    setSelectedProject(p)
    setForm({ name: '', projectId: p.id, type: 'plano_pdf' })
    setShowForm(false)
  }

  const isImage = (type) => type === 'imagen_3d' || type === 'foto'
  const isPDF   = (type) => type === 'plano_pdf' || type === 'informe'

  // ── VISTA: Lista de proyectos ──────────────────────────
  if (!selectedProject) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Documentos</h1>
            <p className="text-gray-400 text-sm mt-1">
              {docs.length} archivos en {myProjects.length} proyectos
            </p>
          </div>
          {perms.documents.canExport && (
            <div className="flex gap-2">
              <button onClick={() => exportDocumentsPDF(docs, projects)} disabled={docs.length === 0}
                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <LuFileText size={15} /> PDF
              </button>
              <button onClick={() => exportDocumentsExcel(docs, projects)} disabled={docs.length === 0}
                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <LuFileSpreadsheet size={15} /> Excel
              </button>
            </div>
          )}
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <LuSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Buscar proyecto..."
            value={searchProject}
            onChange={e => setSearchProject(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-700 focus:border-orange-500 outline-none"
          />
        </div>

        {/* Grid de proyectos */}
        {loading ? (
          <LoadingState label="Cargando documentos..." />
        ) : filteredProjects.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
            <div className="flex justify-center mb-3 text-gray-500"><LuFolder size={40} /></div>
            <p className="text-gray-400 text-sm">No hay proyectos disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(p => {
              const projDocs  = docs.filter(d => d.projectId === p.id)
              const colors    = statusColors[p.status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
              return (
                <button key={p.id}
                  onClick={() => openProject(p)}
                  className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-orange-500 transition-all text-left group">

                  {/* Icono y estado */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                      <LuFolder size={22} />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Info */}
                  <h3 className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors truncate">
                    {p.name}
                  </h3>
                  <p className="text-orange-500 text-xs font-mono mt-0.5">{p.projectCode}</p>
                  <p className="text-gray-400 text-xs mt-1 truncate">{p.client}</p>

                  {/* Contador de docs */}
                  <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex gap-2">
                      {['plano_pdf', 'plano_cad', 'imagen_3d', 'foto', 'informe'].map(tipo => {
                        const count = projDocs.filter(d => d.type === tipo).length
                        if (count === 0) return null
                        const TypeIcon = typeIcons[tipo]
                        return (
                          <span key={tipo} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TypeIcon size={11} /> {count}
                          </span>
                        )
                      })}
                      {projDocs.length === 0 && (
                        <span className="text-xs text-gray-500">Sin documentos</span>
                      )}
                    </div>
                    <span className="text-orange-400 text-xs font-medium group-hover:underline">
                      Ver →
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── VISTA: Documentos del proyecto seleccionado ────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => { setSelectedProject(null); setShowForm(false) }}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
          <LuArrowLeft size={14} /> Proyectos
        </button>
        <h1 className="text-2xl font-bold text-white">Documentos</h1>
      </div>

      {/* Info del proyecto */}
      <div className="bg-gray-800 rounded-xl px-5 py-4 border border-gray-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold">{selectedProject.name}</p>
              <span className="text-orange-500 text-xs font-mono">{selectedProject.projectCode}</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">{selectedProject.client} · {selectedProject.serviceType}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">{projectDocs.length} documentos</span>
            {perms.documents.canUpload && (
              <>
                <label className={`cursor-pointer flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium ${photoBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                  <LuCamera size={15} /> Tomar foto
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={e => { handlePhotos(e.target.files); e.target.value = '' }} />
                </label>
                <label className={`cursor-pointer flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium ${photoBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                  <LuImages size={15} /> Subir fotos
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={e => { handlePhotos(e.target.files); e.target.value = '' }} />
                </label>
                <button onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  <LuPlus size={15} /> Subir Documento
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progreso de subida de fotos */}
      {photoBusy && (
        <div className="bg-gray-800 rounded-xl px-5 py-3 border border-orange-500/30 mb-6">
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span className="flex items-center gap-1.5"><LuCamera size={13} /> Subiendo fotos...</span>
            <span>{photoStat.done}/{photoStat.total}</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${photoStat.total ? (photoStat.done / photoStat.total) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && perms.documents.canUpload && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-orange-500/30">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><LuUpload size={16} /> Subir Documento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre del documento *" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm col-span-2 border border-gray-600 focus:border-orange-500 outline-none" />
            <select value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none">
              {DOC_TYPES.map(t => (
                <option key={t} value={t}>{typeLabels[t]}</option>
              ))}
            </select>
            <div>
              <p className="text-gray-400 text-xs mb-1">
                Archivos: <strong className="text-orange-400">{ACCEPT_BY_TYPE[form.type]}</strong>
              </p>
              <input type="file" accept={ACCEPT_BY_TYPE[form.type]}
                onChange={e => setFile(e.target.files[0])}
                className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm w-full border border-gray-600" />
              {file && (
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <LuCheck size={13} /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Subiendo...</span><span>{progress}%</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button onClick={handleUpload} disabled={uploading}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium">
              {uploading ? `Subiendo ${progress}%...` : <><LuUpload size={14} /> Subir</>}
            </button>
            <button onClick={() => { setShowForm(false); setFile(null) }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Documentos agrupados por tipo */}
      {projectDocs.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <div className="flex justify-center mb-3 text-gray-500"><LuFolder size={40} /></div>
          <p className="text-gray-400 text-sm">No hay documentos en este proyecto.</p>
          {perms.documents.canUpload && (
            <button onClick={() => setShowForm(true)}
              className="mt-4 flex items-center gap-1.5 mx-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              <LuPlus size={15} /> Subir primer documento
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {DOC_TYPES.map(tipo => {
            const grupo = projectDocs.filter(d => d.type === tipo)
            if (grupo.length === 0) return null
            const TypeIcon = typeIcons[tipo]
            return (
              <div key={tipo}>
                <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <TypeIcon size={13} /> {typeLabels[tipo]} ({grupo.length})
                </p>
                <div className="grid gap-2">
                  {grupo.map(d => (
                    <div key={d.id}
                      className={`bg-gray-800 rounded-xl px-5 py-4 border flex items-center justify-between transition-all
                        ${d.enabled ? 'border-gray-700' : 'border-gray-700/40 opacity-60'}`}>

                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {isImage(d.type) && d.fileUrl ? (
                          <img src={d.fileUrl} alt={d.name}
                            className="w-12 h-12 object-cover rounded-lg cursor-pointer border border-gray-600 hover:border-orange-500 flex-shrink-0"
                            onClick={() => setPreviewDoc(d)} />
                        ) : (
                          <div
                            onClick={() => isPDF(d.type) ? setPreviewPDF(d) : null}
                            className={`w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0
                              ${isPDF(d.type) ? 'cursor-pointer hover:border hover:border-orange-500' : ''}`}>
                            <TypeIcon size={22} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${d.enabled ? 'text-white' : 'text-gray-500'}`}>
                            {d.name}
                          </p>
                          {d.uploadedAt && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              Subido: {new Date(d.uploadedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {perms.documents.canToggle ? (
                          <button onClick={() => toggleEnabled(d.id, d.enabled)}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1
                              ${d.enabled
                                ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                                : 'bg-gray-700 text-gray-400 hover:bg-green-500/20 hover:text-green-400'
                              }`}>
                            {d.enabled ? <><LuCheck size={12} /> Habilitado</> : <><LuX size={12} /> Deshabilitado</>}
                          </button>
                        ) : (
                          <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1
                            ${d.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            {d.enabled ? <><LuCheck size={12} /> Habilitado</> : <><LuX size={12} /> Deshabilitado</>}
                          </span>
                        )}
                        {isImage(d.type) && d.fileUrl && (
                          <button onClick={() => setPreviewDoc(d)}
                            className="flex items-center gap-1.5 bg-gray-700 hover:bg-blue-500/20 hover:text-blue-400 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">
                            <LuEye size={13} /> Ver
                          </button>
                        )}
                        {isPDF(d.type) && d.fileUrl && (
                          <button onClick={() => setPreviewPDF(d)}
                            className="flex items-center gap-1.5 bg-gray-700 hover:bg-blue-500/20 hover:text-blue-400 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">
                            <LuEye size={13} /> Ver PDF
                          </button>
                        )}
                        {d.fileUrl && (
                          <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                            <LuDownload size={13} /> Descargar
                          </a>
                        )}
                        {perms.documents.canDelete && (
                          <button onClick={() => handleDelete(d.id, d.name)} disabled={deletingId === d.id}
                            className="flex items-center bg-gray-700 hover:bg-red-500/20 hover:text-red-400 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                            {deletingId === d.id ? '...' : <LuTrash2 size={13} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modales */}
      {previewPDF && (
        <PDFPreview url={previewPDF.fileUrl} name={previewPDF.name} onClose={() => setPreviewPDF(null)} />
      )}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDoc(null)}>
          <div className="bg-gray-900 rounded-2xl p-4 max-w-3xl w-full border border-gray-700"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-semibold">{previewDoc.name}</p>
              <button onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-white px-2"><LuX size={20} /></button>
            </div>
            <img src={previewDoc.fileUrl} alt={previewDoc.name}
              className="w-full rounded-lg object-contain max-h-[70vh]" />
            <a href={previewDoc.fileUrl} target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium">
              <LuDownload size={14} /> Descargar imagen completa
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents