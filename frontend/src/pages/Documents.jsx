import { useState, useEffect } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import axios from 'axios'

const DOC_TYPES = ['plano_pdf', 'plano_cad', 'imagen_3d', 'informe', 'otro']

const typeIcons = {
  plano_pdf: '📄',
  plano_cad: '📐',
  imagen_3d: '🏗️',
  informe: '📋',
  otro: '📎',
}

function Documents() {
  const [projects, setProjects] = useState([])
  const [docs, setDocs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', projectId: '', type: 'plano_pdf' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const fetchData = async () => {
    const [p, d] = await Promise.all([
      axios.get('http://localhost:5210/api/projects'),
      axios.get('http://localhost:5034/api/documents')
    ])
    setProjects(p.data)
    setDocs(d.data)
  }

  useEffect(() => { fetchData() }, [])

  const handleUpload = async () => {
    if (!file || !form.name || !form.projectId) return
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
      },
      async () => {
        const fileUrl = await getDownloadURL(uploadTask.snapshot.ref)
        await axios.post('http://localhost:5034/api/documents', {
          projectId: form.projectId,
          name: form.name,
          type: form.type,
          fileUrl,
          enabled: true
        })
        setForm({ name: '', projectId: '', type: 'plano_pdf' })
        setFile(null)
        setProgress(0)
        setUploading(false)
        setShowForm(false)
        fetchData()
      }
    )
  }

  const toggleEnabled = async (id, currentEnabled) => {
    try {
      await axios.patch(`http://localhost:5034/api/documents/${id}/toggle`, {
        enabled: !currentEnabled
      })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const getProjectName = (id) => projects.find(p => p.id === id)?.name || 'Sin proyecto'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Documentos</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Subir Documento
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-white font-semibold mb-4">Subir Documento</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Nombre del documento *" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm col-span-2" />
            <select value={form.projectId}
              onChange={e => setForm({ ...form, projectId: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm">
              <option value="">Seleccionar proyecto *</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm">
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="col-span-2">
              <input type="file" accept=".pdf,.dwg,.jpg,.png"
                onChange={e => setFile(e.target.files[0])}
                className="bg-gray-700 text-white rounded-lg px-4 py-2 text-sm w-full" />
            </div>
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-gray-400 text-xs mt-1">{progress}% subido</p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={handleUpload} disabled={uploading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium">
              {uploading ? 'Subiendo...' : 'Subir'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {docs.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <p className="text-4xl mb-3">📁</p>
            <p className="text-gray-400 text-sm">No hay documentos aún. Sube el primero.</p>
          </div>
        ) : docs.map(d => (
          <div key={d.id} className="bg-gray-800 rounded-xl px-5 py-4 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{typeIcons[d.type] || '📎'}</span>
              <div>
                <p className={`text-sm font-medium ${d.enabled ? 'text-white' : 'text-gray-500'}`}>{d.name}</p>
                <p className="text-gray-500 text-xs mt-1">{getProjectName(d.projectId)} · {d.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleEnabled(d.id, d.enabled)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors
                  ${d.enabled
                    ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-gray-700 text-gray-400 hover:bg-green-500/20 hover:text-green-400'
                  }`}>
                {d.enabled ? 'Habilitado' : 'Deshabilitado'}
              </button>
              {d.enabled && (
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg">
                  Descargar
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Documents