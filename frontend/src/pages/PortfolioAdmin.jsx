import { useState, useEffect } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import axios from 'axios'
import { useToast } from '../context/ToastContext'

const GALLERY_API = '' + import.meta.env.VITE_DOCUMENTS_API + ''

const CATEGORIES = [
  { key: 'estructuras_metalicas', label: 'Estructuras metálicas', icon: '🏗️' },
  { key: 'cielo_raso',           label: 'Cielo raso / Drywall',   icon: '🔲' },
  { key: 'policarbonato',        label: 'Policarbonato / Coberturas', icon: '☀️' },
  { key: 'obra_civil',           label: 'Obra civil / Concreto',  icon: '🧱' },
]

const labelOf = (key) => CATEGORIES.find(c => c.key === key)?.label || key

// Comprime la imagen en el navegador antes de subirla (reduce el peso)
function compressImage(file, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen')),
          'image/jpeg', quality
        )
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Sube una sola imagen a Firebase y la registra en la galería
function subirUna(file, title, category, onProgress) {
  return new Promise((resolve, reject) => {
    compressImage(file).then(blob => {
      const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
      const storageRef = ref(storage, `gallery/${Date.now()}_${safeName}.jpg`)
      const task = uploadBytesResumable(storageRef, blob)

      task.on('state_changed',
        snap => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        err => reject(err),
        () => {
          getDownloadURL(task.snapshot.ref)
            .then(imageUrl => axios.post(`${GALLERY_API}/api/gallery`, { title, category, imageUrl, enabled: true }))
            .then(res => resolve(res.data?.id))
            .catch(reject)
        }
      )
    }).catch(reject)
  })
}

function PortfolioAdmin() {
  const { showToast } = useToast()

  const [photos, setPhotos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [title, setTitle]         = useState('')
  const [category, setCategory]   = useState('estructuras_metalicas')
  const [files, setFiles]         = useState([])
  const [uploading, setUploading] = useState(false)
  const [current, setCurrent]     = useState(0)
  const [progress, setProgress]   = useState(0)
  const [filter, setFilter]       = useState('todos')
  const [busyAlbum, setBusyAlbum] = useState(null)
  const [drag, setDrag]           = useState(null) // { title, index }

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${GALLERY_API}/api/gallery`)
      setPhotos(Array.isArray(res.data) ? res.data : [])
    } catch {
      showToast('Error al cargar la galería.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPhotos() }, [])

  const handleFiles = (e) => setFiles(Array.from(e.target.files || []))
  const quitarArchivo = (index) => setFiles(files.filter((_, i) => i !== index))

  const handleUpload = async () => {
    if (!title.trim()) { showToast('Escribe un título para el álbum.', 'warning'); return }
    if (files.length === 0) { showToast('Selecciona al menos una foto.', 'warning'); return }

    setUploading(true)
    let ok = 0, fail = 0
    const base = title.trim()

    for (let i = 0; i < files.length; i++) {
      setCurrent(i + 1)
      setProgress(0)
      try {
        await subirUna(files[i], base, category, setProgress) // mismo título -> álbum
        ok++
      } catch {
        fail++
      }
    }

    setUploading(false)
    setFiles([]); setTitle(''); setCurrent(0); setProgress(0)

    if (fail === 0) showToast(`${ok} foto(s) subidas al álbum "${base}".`, 'success')
    else showToast(`${ok} subidas, ${fail} con error.`, fail > ok ? 'error' : 'warning')

    fetchPhotos()
  }

  // ── Acciones por foto ────────────────────────────────
  const togglePhoto = async (id, currentEnabled) => {
    try {
      await axios.patch(`${GALLERY_API}/api/gallery/${id}/toggle`, { enabled: !currentEnabled })
      fetchPhotos()
    } catch {
      showToast('Error al cambiar la visibilidad.', 'error')
    }
  }

  const deletePhoto = async (id) => {
    if (!confirm('¿Quitar esta foto del portafolio?')) return
    try {
      await axios.delete(`${GALLERY_API}/api/gallery/${id}`)
      showToast('Foto eliminada.', 'success')
      fetchPhotos()
    } catch {
      showToast('Error al eliminar la foto.', 'error')
    }
  }

  // ── Acciones por álbum completo ──────────────────────
  const toggleAlbum = async (album) => {
    const target = !album.photos.every(p => p.enabled) // si no todas visibles -> mostrar todas
    setBusyAlbum(album.title)
    try {
      for (const p of album.photos) {
        if (p.enabled !== target) {
          await axios.patch(`${GALLERY_API}/api/gallery/${p.id}/toggle`, { enabled: target })
        }
      }
      fetchPhotos()
    } catch {
      showToast('Error al cambiar la visibilidad del álbum.', 'error')
    }
    setBusyAlbum(null)
  }

  const deleteAlbum = async (album) => {
    if (!confirm(`¿Borrar el álbum "${album.title}" completo (${album.photos.length} fotos)?`)) return
    setBusyAlbum(album.title)
    try {
      for (const p of album.photos) {
        await axios.delete(`${GALLERY_API}/api/gallery/${p.id}`)
      }
      showToast(`Álbum "${album.title}" eliminado.`, 'success')
      fetchPhotos()
    } catch {
      showToast('Error al eliminar el álbum.', 'error')
    }
    setBusyAlbum(null)
  }

  // ── Agregar más fotos a un álbum existente ───────────
  const addToAlbum = async (album, fileList) => {
    const arr = Array.from(fileList || [])
    if (arr.length === 0) return
    setBusyAlbum(album.title)
    let ok = 0, fail = 0
    const nuevosIds = []
    for (const f of arr) {
      try {
        const id = await subirUna(f, album.title, album.category, () => {})
        if (id) nuevosIds.push(id)
        ok++
      } catch { fail++ }
    }
    // Colocar las nuevas fotos al final del álbum (después de las que ya estaban)
    try {
      const idsActuales = album.photos.map(ph => ph.id)
      await axios.patch(`${GALLERY_API}/api/gallery/reorder`, { ids: [...idsActuales, ...nuevosIds] })
    } catch { /* si falla el orden, no es crítico */ }
    setBusyAlbum(null)
    if (fail === 0) showToast(`${ok} foto(s) agregadas a "${album.title}".`, 'success')
    else showToast(`${ok} agregadas, ${fail} con error.`, 'warning')
    fetchPhotos()
  }

  // ── Reordenar fotos arrastrando ──────────────────────
  const handleDrop = async (album, dropIndex) => {
    if (!drag || drag.title !== album.title) { setDrag(null); return }
    const from = drag.index
    setDrag(null)
    if (from === dropIndex) return

    const reordenadas = [...album.photos]
    const [movida] = reordenadas.splice(from, 1)
    reordenadas.splice(dropIndex, 0, movida)

    // Actualización optimista (se ve al instante) + guardar en el backend
    setPhotos(prev => {
      const otras = prev.filter(ph => ph.title !== album.title)
      return [...reordenadas, ...otras]
    })
    try {
      await axios.patch(`${GALLERY_API}/api/gallery/reorder`, { ids: reordenadas.map(ph => ph.id) })
      fetchPhotos()
    } catch {
      showToast('Error al guardar el nuevo orden.', 'error')
      fetchPhotos()
    }
  }

  // ── Agrupar fotos por título -> álbumes ──────────────
  const visibles = filter === 'todos' ? photos : photos.filter(p => p.category === filter)
  const albumsMap = new Map()
  for (const p of visibles) {
    if (!albumsMap.has(p.title)) albumsMap.set(p.title, [])
    albumsMap.get(p.title).push(p)
  }
  const albums = Array.from(albumsMap, ([t, ps]) => ({ title: t, category: ps[0].category, photos: ps }))

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">🖼️ Galería del Portafolio</h1>
        <p className="text-gray-400 text-sm mt-1">
          Sube fotos de obra agrupadas por álbum. Aparecerán en el portafolio de la web pública.
        </p>
      </div>

      {/* Formulario de subida */}
      <div className="bg-gray-800 rounded-xl p-6 border border-orange-500/30 mb-6">
        <h2 className="text-white font-semibold mb-4">📤 Subir álbum de fotos</h2>

        <input
          placeholder="Título del álbum (ej: Cielo raso San Ramón) *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none w-full mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-xs block mb-1">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-orange-500 outline-none w-full">
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Fotos (puedes elegir varias)</label>
            <input type="file" accept="image/*" multiple
              onChange={handleFiles}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm w-full border border-gray-600" />
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-400 text-xs mb-2">
              {files.length} foto(s) formarán el álbum: <span className="text-orange-400">
                {title.trim() || '(escribe un título arriba)'}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="flex items-center gap-2 bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded-full">
                  🖼️ {f.name.length > 22 ? f.name.slice(0, 22) + '…' : f.name}
                  {!uploading && (
                    <button onClick={() => quitarArchivo(i)} className="text-gray-400 hover:text-red-400">✕</button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Subiendo foto {current} de {files.length}...</span><span>{progress}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={uploading || files.length === 0 || !title.trim()}
          className="mt-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium">
          {uploading ? `Subiendo ${current}/${files.length}...` : '📤 Subir álbum'}
        </button>
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter('todos')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
            ${filter === 'todos' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
          Todas ({photos.length})
        </button>
        {CATEGORIES.map(c => {
          const count = photos.filter(p => p.category === c.key).length
          return (
            <button key={c.key} onClick={() => setFilter(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filter === c.key ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              {c.icon} {c.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Álbumes */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando galería...</p>
      ) : albums.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
          <p className="text-4xl mb-3">🖼️</p>
          <p className="text-gray-400 text-sm">No hay álbumes en esta categoría todavía.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {albums.map(album => {
            const allVisible = album.photos.every(p => p.enabled)
            const busy = busyAlbum === album.title
            return (
              <div key={album.title} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {/* Cabecera del álbum */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{album.title}</p>
                    <p className="text-orange-400 text-xs">{labelOf(album.category)} · {album.photos.length} fotos</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <label className={`text-xs px-3 py-1.5 rounded-lg font-medium bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors cursor-pointer ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
                      ➕ Agregar fotos
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={e => { addToAlbum(album, e.target.files); e.target.value = '' }} />
                    </label>
                    <button onClick={() => toggleAlbum(album)} disabled={busy}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50
                        ${allVisible
                          ? 'bg-green-500/20 text-green-400 hover:bg-gray-700'
                          : 'bg-gray-700 text-gray-400 hover:bg-green-500/20 hover:text-green-400'}`}>
                      {busy ? '...' : allVisible ? '👁 Ocultar álbum' : '👁 Mostrar álbum'}
                    </button>
                    <button onClick={() => deleteAlbum(album)} disabled={busy}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-700 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50">
                      🗑 Borrar álbum
                    </button>
                  </div>
                </div>

                {/* Miniaturas del álbum */}
                <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {album.photos.map((p, idx) => (
                    <div key={p.id}
                      draggable
                      onDragStart={() => setDrag({ title: album.title, index: idx })}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(album, idx)}
                      className={`relative rounded-lg overflow-hidden bg-gray-900 aspect-square group cursor-move
                        ${p.enabled ? '' : 'opacity-40'}
                        ${drag && drag.title === album.title && drag.index === idx ? 'ring-2 ring-orange-500 opacity-50' : ''}`}>
                      <img src={p.imageUrl} alt={p.title} loading="lazy"
                        className="w-full h-full object-cover pointer-events-none" />
                      {/* Número de orden */}
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] w-5 h-5 rounded flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {/* Controles por foto (aparecen al pasar el cursor) */}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => togglePhoto(p.id, p.enabled)}
                          title={p.enabled ? 'Ocultar foto' : 'Mostrar foto'}
                          className="bg-black/60 hover:bg-black/80 text-white text-xs w-7 h-7 rounded-md flex items-center justify-center">
                          {p.enabled ? '👁' : '🚫'}
                        </button>
                        <button onClick={() => deletePhoto(p.id)} title="Borrar foto"
                          className="bg-black/60 hover:bg-red-500/80 text-white text-xs w-7 h-7 rounded-md flex items-center justify-center">
                          🗑
                        </button>
                      </div>
                      {!p.enabled && (
                        <span className="absolute bottom-1 left-1 bg-black/70 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">
                          oculta
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PortfolioAdmin