import { useState } from 'react'
import axios from 'axios'

const typeIcons = {
  plano_pdf: '📄',
  plano_cad: '📐',
  imagen_3d: '🏗️',
  informe: '📋',
  otro: '📎',
}

function ClientPortal() {
  const [code, setCode] = useState('')
  const [project, setProject] = useState(null)
  const [docs, setDocs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('http://localhost:5210/api/projects')
      const found = res.data.find(p => p.projectCode?.toUpperCase() === code.toUpperCase().trim())
      if (!found) {
        setError('Código de proyecto no válido. Verifique e intente nuevamente.')
        setLoading(false)
        return
      }
      setProject(found)
      const docsRes = await axios.get(`http://localhost:5034/api/documents/project/${found.id}`)
      setDocs(docsRes.data.filter(d => d.enabled))
    } catch (err) {
      setError('Error al conectar. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsapp = () => {
    const number = project?.whatsapp?.replace(/\D/g, '') || '51962744341'
    window.open(`https://wa.me/${number}?text=Hola, soy cliente del proyecto ${project?.name} (${project?.projectCode}). Necesito soporte.`, '_blank')
  }

  // Vista login
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl p-10 border border-gray-800 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">DINAMIK</h1>
            <p className="text-gray-400 text-sm mt-2">Portal del Cliente</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Código de Proyecto</label>
              <input
                placeholder="Ej: DIN-3AAC68"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium text-sm">
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </div>
          <p className="text-gray-600 text-xs text-center mt-6">
            ¿No tienes tu código? Contáctanos al +51 962 744 341
          </p>
        </div>
      </div>
    )
  }

  // Vista del cliente
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">DINAMIK</h1>
          <p className="text-gray-400 text-xs">Portal del Cliente</p>
        </div>
        <button
          onClick={() => { setProject(null); setCode(''); setDocs([]) }}
          className="text-gray-400 hover:text-white text-sm">
          Cerrar sesión
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Info del proyecto */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-orange-500 text-xs font-semibold">{project.projectCode}</span>
              <h2 className="text-white text-xl font-bold mt-1">{project.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{project.client}</p>
              <p className="text-gray-500 text-xs mt-2">Tipo: {project.serviceType} · Inicio: {project.startDate}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium
              ${project.status === 'activo' ? 'bg-green-500/20 text-green-400' :
                project.status === 'en_proceso' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'}`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Entregables */}
        <h3 className="text-white font-semibold mb-4">Entregables disponibles</h3>

{docs.length === 0 ? (
  <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center mb-8">
    <p className="text-3xl mb-3">📭</p>
    <p className="text-gray-400 text-sm">Aún no hay entregables disponibles para este proyecto.</p>
  </div>
) : (
  <div className="mb-8">
    {['plano_pdf', 'plano_cad', 'imagen_3d', 'informe', 'otro'].map(tipo => {
      const grupo = docs.filter(d => d.type === tipo)
      if (grupo.length === 0) return null
      const labels = {
        plano_pdf: '📄 Planos PDF',
        plano_cad: '📐 Planos CAD/DWG',
        imagen_3d: '🏗️ Imágenes 3D',
        informe: '📋 Informes Técnicos',
        otro: '📎 Otros',
      }
      return (
        <div key={tipo} className="mb-6">
          <p className="text-orange-400 text-xs font-semibold uppercase mb-2">{labels[tipo]}</p>
          <div className="grid gap-2">
            {grupo.map(d => (
              <div key={d.id} className="bg-gray-900 rounded-xl px-5 py-4 border border-gray-800 flex items-center justify-between">
                <p className="text-white text-sm font-medium">{d.name}</p>
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-lg">
                  Descargar
                </a>
              </div>
            ))}
          </div>
        </div>
      )
    })}
  </div>
)}

        {/* Botones de contacto */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleWhatsapp}
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            💬 Contactar por WhatsApp
          </button>
          <button onClick={handleWhatsapp}
            className="bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
            📋 Solicitar Cotización
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClientPortal