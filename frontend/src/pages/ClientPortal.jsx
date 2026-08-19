import { useState } from 'react'
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import AuthSplitPanel from '../components/AuthSplitPanel'
import Chatbot from '../components/Chatbot'
import PDFViewerProtected from '../components/PDFViewerProtected'
import { isPDF } from '../components/portal/portalData'
import ProjectHero from '../components/portal/ProjectHero'
import StatsRow from '../components/portal/StatsRow'
import Timeline from '../components/portal/Timeline'
import Deliverables from '../components/portal/Deliverables'
import ServicesGrid from '../components/portal/ServicesGrid'
import Sidebar from '../components/portal/Sidebar'
import { getInitials } from '../components/portal/portalData'
import { LuX, LuLogOut, LuArrowLeft, LuArrowRight, LuFolderKanban } from 'react-icons/lu'
import { FcGoogle } from 'react-icons/fc'

function ClientPortal() {
  const [code, setCode]             = useState('')
  const [project, setProject]       = useState(null)
  const [docs, setDocs]             = useState([])
  const [allDocs, setAllDocs]       = useState([])
  const [tasks, setTasks]           = useState([])
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [pdfViewer, setPdfViewer]   = useState(null)
  const [previewImg, setPreviewImg] = useState(null)
  // Selector de proyecto cuando un cliente con Google tiene más de uno
  const [clientProjects, setClientProjects] = useState(null)
  const [clientName, setClientName]         = useState('')
  // Solicitud de acceso (cliente nuevo, sin proyecto todavía)
  const [showSignup, setShowSignup]     = useState(false)
  const [signupForm, setSignupForm]     = useState({ name: '', email: '' })
  const [signupSending, setSignupSending] = useState(false)
  const [signupDone, setSignupDone]     = useState(false)

  const loadProjectData = async (found) => {
    setProject(found)
    const [docsRes, tasksRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_DOCUMENTS_API}/api/documents/project/${found.id}`),
      axios.get(`${import.meta.env.VITE_PROJECTS_API}/api/tasks/${found.id}`).catch(() => ({ data: [] })),
    ])
    setDocs(docsRes.data.filter(d => d.enabled))
    setAllDocs(docsRes.data)
    setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : [])
  }

  const handleLogin = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects')
      const found = res.data.find(
        p => p.projectCode?.toUpperCase() === code.toUpperCase().trim()
      )
      if (!found) {
        setError('Código de proyecto no válido. Verifique e intente nuevamente.')
        setLoading(false)
        return
      }
      await loadProjectData(found)
    } catch {
      setError('Error al conectar. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoadingGoogle(true)
    try {
      const result  = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const res = await axios.post('' + import.meta.env.VITE_PROJECTS_API + '/api/portal/auth/google', { idToken })
      if (res.data.projects.length === 1) {
        const proyectosRes = await axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects')
        const found = proyectosRes.data.find(p => p.id === res.data.projects[0].id)
        if (found) await loadProjectData(found)
      } else {
        setClientName(res.data.clientName)
        setClientProjects(res.data.projects)
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.response?.data?.error || 'No se pudo iniciar sesión con Google.')
      }
    } finally {
      setLoadingGoogle(false)
    }
  }

  const selectClientProject = async (projectId) => {
    setLoading(true)
    try {
      const res = await axios.get('' + import.meta.env.VITE_PROJECTS_API + '/api/projects')
      const found = res.data.find(p => p.id === projectId)
      if (found) await loadProjectData(found)
    } catch {
      setError('Error al conectar. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignupRequest = async () => {
    if (!signupForm.name.trim() || !signupForm.email.trim()) {
      setError('Nombre y correo son obligatorios.')
      return
    }
    setSignupSending(true)
    setError('')
    try {
      await axios.post('' + import.meta.env.VITE_PROJECTS_API + '/api/clients', {
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
      })
      setSignupDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar la solicitud. Intenta de nuevo.')
    } finally {
      setSignupSending(false)
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
    setClientProjects(null); setClientName('')
    setShowSignup(false); setSignupDone(false); setSignupForm({ name: '', email: '' })
  }

  // ── Selector de proyecto (cliente con Google y varios proyectos) ────
  if (!project && clientProjects) {
    return (
      <AuthSplitPanel tagline="Portal del Cliente" subtitle="Seguimiento de tu proyecto en un solo lugar">
        <button onClick={() => { setClientProjects(null); setClientName('') }}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm mb-8 transition-colors w-fit">
          <LuArrowLeft size={15} /> Volver
        </button>

        <h1 className="text-2xl font-black text-gray-900">Hola, {clientName}</h1>
        <p className="text-gray-500 text-sm mt-2 mb-6">Selecciona el proyecto que quieres ver.</p>

        <div className="space-y-2">
          {clientProjects.map(p => (
            <button key={p.id} onClick={() => selectClientProject(p.id)} disabled={loading}
              className="w-full flex items-center justify-between gap-3 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl px-5 py-4 text-left transition disabled:opacity-50">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0"><LuFolderKanban size={17} /></span>
                <div className="min-w-0">
                  <p className="text-gray-900 text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-gray-400 text-xs">{p.projectCode} · {p.progress || 0}% completado</p>
                </div>
              </div>
              <LuArrowRight size={16} className="text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
      </AuthSplitPanel>
    )
  }

  // ── Solicitud de acceso (cliente nuevo, sin proyecto todavía) ────────
  if (!project && showSignup) {
    return (
      <AuthSplitPanel tagline="Portal del Cliente" subtitle="Seguimiento de tu proyecto en un solo lugar">
        <button onClick={() => { setShowSignup(false); setSignupDone(false); setError('') }}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm mb-8 transition-colors w-fit">
          <LuArrowLeft size={15} /> Volver
        </button>

        {signupDone ? (
          <>
            <h1 className="text-2xl font-black text-gray-900">Solicitud enviada</h1>
            <p className="text-gray-500 text-sm mt-3">
              Un asesor de DINAMIK se pondrá en contacto contigo para vincular tu proyecto a este correo.
              Mientras tanto, puedes escribirnos directo:
            </p>
            <button onClick={() => window.open('https://wa.me/51962744341?text=Hola, acabo de solicitar acceso al Portal del Cliente.', '_blank')}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold mt-5">
              Escribir por WhatsApp
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black text-gray-900">Solicitar acceso</h1>
            <p className="text-gray-500 text-sm mt-2 mb-8">
              ¿Aún no tienes un proyecto con nosotros? Déjanos tus datos y te contactamos.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1.5">Nombre completo</label>
                <input
                  placeholder="Tu nombre o el de tu empresa"
                  value={signupForm.name}
                  onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1.5">Correo</label>
                <input
                  type="email"
                  placeholder="tucorreo@gmail.com"
                  value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSignupRequest()}
                  className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button onClick={handleSignupRequest} disabled={signupSending}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 transition">
                {signupSending ? 'Enviando...' : 'Solicitar acceso'}
              </button>
            </div>
          </>
        )}
      </AuthSplitPanel>
    )
  }

  // ── Pantalla de ingreso ──────────────────────────────
  if (!project) {
    return (
      <AuthSplitPanel tagline="Portal del Cliente" subtitle="Seguimiento de tu proyecto en un solo lugar">
        <h1 className="text-3xl font-black text-gray-900">Portal del Cliente</h1>
        <p className="text-gray-500 text-sm mt-2 mb-8">Ingresa con Google o tu código de proyecto.</p>

        <button onClick={handleGoogleLogin} disabled={loadingGoogle}
          className="w-full bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 border border-gray-200 transition-colors">
          <FcGoogle size={18} />
          {loadingGoogle ? 'Conectando...' : 'Ingresar con Google'}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs">O con tu código de proyecto</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-1.5">Código de Proyecto</label>
            <input
              placeholder="Ej: DIN-3AAC68"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 transition">
            {loading ? 'Verificando...' : 'Ingresar al Portal'}
          </button>
        </div>
        <p className="text-gray-400 text-xs text-center mt-6">
          ¿No tienes cuenta?{' '}
          <button onClick={() => { setShowSignup(true); setError('') }} className="text-orange-500 hover:text-orange-600 font-medium">
            Solicitar acceso
          </button>
        </p>
      </AuthSplitPanel>
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-full py-1 pl-1 pr-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(project.client)}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-gray-900 text-xs font-semibold truncate max-w-[160px]">{project.client}</p>
              <p className="text-gray-400 text-[10px] font-mono">{project.projectCode}</p>
            </div>
          </div>
          <button onClick={handleLogout} title="Cerrar sesión" aria-label="Cerrar sesión"
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <LuLogOut size={17} />
          </button>
        </div>
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
              <button onClick={() => setPreviewImg(null)} aria-label="Cerrar vista previa"
                className="text-gray-400 hover:text-gray-900 px-2"><LuX size={20} /></button>
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