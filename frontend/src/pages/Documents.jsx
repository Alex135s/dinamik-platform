import { useState, useEffect } from 'react'
import axios from 'axios'

function Documents() {
  const [projects, setProjects] = useState([])
  const [docs, setDocs] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [form, setForm] = useState({ name: '', fileUrl: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    axios.get('http://localhost:5210/api/projects')
      .then(res => setProjects(res.data))
    axios.get('http://localhost:5230/api/documents')
      .then(res => setDocs(res.data))
      .catch(() => {})
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Documentos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Subir Documento
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
        <p className="text-4xl mb-3">📁</p>
        <p className="text-gray-400 text-sm">El módulo de documentos se configurará en la Semana 2.</p>
        <p className="text-gray-500 text-xs mt-2">Conectado a DocumentsApi + Firebase Storage</p>
      </div>
    </div>
  )
}

export default Documents