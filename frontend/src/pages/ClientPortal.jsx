import { useState } from 'react'
import axios from 'axios'
import Chatbot from '../components/Chatbot'
import PDFViewerProtected from '../components/PDFViewerProtected'
import { isPDF } from '../components/portal/portalData'
import ProjectHero from '../components/portal/ProjectHero'
import StatsRow from '../components/portal/StatsRow'
import Timeline from '../components/portal/Timeline'
import Deliverables from '../components/portal/Deliverables'
import ServicesGrid from '../components/portal/ServicesGrid'
import Sidebar from '../components/portal/Sidebar'

function ClientPortal() {
  const [code, setCode]             = useState('')
  const [project, setProject]       = useState(null)
  const [docs, setDocs]             = useState([])
  const [allDocs, setAllDocs]       = useState([])
  const [tasks, setTasks]           = useState([])
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [pdfViewer, setPdfViewer]   = useState(null)
  const [previewImg, setPreviewImg] = useState(null)

  const handleLogin = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('http://localhost:5210/api/projects')
      const found = res.data.find(
        p => p.projectCode?.toUpperCase() === code.toUpperCase().trim()
      )
      if (!found) {
        setError('Código de proyecto no válido. Verifique e intente nuevamente.')
        setLoading(false)
        return
      }
      setProject(found)
      const [docsRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:5034/api/documents/project/${found.id}`),
        axios.get(`http://localhost:5210/api/tasks/${found.id}`).catch(() => ({ data: [] })),
      ])
      setDocs(docsRes.data.filter(d => d.enabled))
      setAllDocs(docsRes.data)
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : [])
    } catch {
      setError('Error al conectar. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsapp = () => {
    const number = project?.whatsapp?.replace(/\D/g, '') || '51962744341'
    window.open(
      `https://wa.me/${number}?text=Hola, soy cliente del proyecto ${project?.name} (${project?.projectCode}). Necesito soporte.`,
      '_blank'
    )
  }

  const handleLogout = () => {
    setProject(null); setCode(''); setDocs([]); setAllDocs([]); setTasks([])
  }

  // ── Pantalla de ingreso ──────────────────────────────
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl shadow-orange-500/5 w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/logo-light.png" alt="DINAMIK" className="w-48 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Portal del Cliente</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm block mb-2 font-medium">Código de Proyecto</label>
              <input
                placeholder="Ej: DIN-3AAC68"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-gray-50 text-gray-900 rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 transition">
              {loading ? 'Verificando...' : 'Ingresar al Portal'}
            </button>
          </div>
          <p className="text-gray-400 text-xs text-center mt-6">
            ¿No tienes tu código? Contáctanos al +51 962 744 341
          </p>
        </div>
      </div>
    )
  }

  const docsDeshabilitados = allDocs.filter(d => !d.enabled && isPDF(d.type))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-gray-100 px-6 sm:px-10 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="/logo-light.png" alt="DINAMIK" className="h-9 w-auto object-contain" />
          <div className="hidden sm:block border-l border-gray-200 pl-3">
            <p className="text-gray-400 text-xs">Portal del Cliente</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
          Cerrar sesión
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10">

        {/* Bienvenida */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Hola, {project.client} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenido al portal de seguimiento de tu proyecto.
          </p>
        </div>

        {/* Layout 2 columnas (responsive) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectHero project={project} />
            <StatsRow project={project} docsCount={docs.length} tasks={tasks} />
            <Timeline tasks={tasks} />
            <Deliverables
              docs={docs}
              docsDeshabilitados={docsDeshabilitados}
              onPdf={setPdfViewer}
              onImg={setPreviewImg}
            />
            <ServicesGrid onRequest={handleWhatsapp} />
          </div>

          {/* Barra lateral */}
          <div className="lg:col-span-1">
            <Sidebar docs={docs} tasks={tasks} onWhatsapp={handleWhatsapp} />
          </div>
        </div>
      </div>

      <Chatbot placeholder="¿Cómo va mi proyecto?" isPortal={true} />

      {/* Modal PDF Protegido */}
      {pdfViewer && (
        <PDFViewerProtected
          url={pdfViewer.fileUrl}
          name={pdfViewer.name}
          clientName={project.client}
          projectCode={project.projectCode}
          onClose={() => setPdfViewer(null)}
        />
      )}

      {/* Modal imagen */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImg(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-3xl w-full border border-gray-200 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-900 font-semibold">{previewImg.name}</p>
              <button onClick={() => setPreviewImg(null)}
                className="text-gray-400 hover:text-gray-900 text-xl px-2">✕</button>
            </div>
            <img src={previewImg.fileUrl} alt={previewImg.name}
              className="w-full rounded-lg object-contain max-h-[70vh]" />
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientPortal