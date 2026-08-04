import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// Rutas del panel admin / portal de clientes: se cargan bajo demanda para que
// la web pública (el punto de entrada más visitado) no descargue su peso.
const MainLayout       = lazy(() => import('./layouts/MainLayout'))
const Dashboard        = lazy(() => import('./pages/Dashboard'))
const Projects         = lazy(() => import('./pages/Projects'))
const Documents        = lazy(() => import('./pages/Documents'))
const Users            = lazy(() => import('./pages/Users'))
const Clients          = lazy(() => import('./pages/Clients'))
const Tasks            = lazy(() => import('./pages/Tasks'))
const ProjectTracking  = lazy(() => import('./pages/ProjectTracking'))
const ProjectDetail    = lazy(() => import('./pages/ProjectDetail'))
const PortfolioAdmin   = lazy(() => import('./pages/PortfolioAdmin'))
const ClientPortal     = lazy(() => import('./pages/ClientPortal'))
const Login            = lazy(() => import('./pages/Login'))
const Settings         = lazy(() => import('./pages/Settings'))

import Website from './pages/Website'
import WebNosotros from './pages/WEB/WebNosotros'
import WebPortafolio from './pages/WEB/WebPortafolio'
import WebServicios from './pages/WEB/WebServicios'
import WebContacto from './pages/WEB/WebContacto'
import WebLayout from './layouts/WebLayout'
import { ToastProvider } from './context/ToastContext'
import { SettingsProvider } from './context/SettingsContext'

function RouteLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <img src="/logo-dark.png" alt="DINAMIK" className="w-56 mx-auto mb-4" />
        <p className="text-gray-400 text-sm animate-pulse">Cargando...</p>
      </div>
    </div>
  )
}
function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('dinamik_session')
    if (session) {
      try {
        const parsed = JSON.parse(session)
        // Verificar que el token no esté expirado leyendo la fecha del JWT
        if (parsed.token) {
          const payload = JSON.parse(atob(parsed.token.split('.')[1]))
          const expiry = payload.exp * 1000
          if (Date.now() < expiry) {
            setUser(parsed) // Token válido → mantener sesión
          } else {
            localStorage.removeItem('dinamik_session') // Token expirado → logout
          }
        }
      } catch {
        localStorage.removeItem('dinamik_session')
      }
    }
    setChecking(false)
  }, [])

  const handleLogin = (userData) => {
    localStorage.setItem('dinamik_session', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('dinamik_session')
    setUser(null)
  }

  // Mientras verifica la sesión, muestra pantalla de carga
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo-dark.png" alt="DINAMIK" className="w-56 mx-auto mb-4" />
          <p className="text-gray-400 text-sm animate-pulse">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsProvider>
    <ToastProvider>
    <BrowserRouter>
      <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/web" element={<WebLayout />}>
          <Route index element={<Website />} />
          <Route path="nosotros"   element={<WebNosotros />} />
          <Route path="portafolio" element={<WebPortafolio />} />
          <Route path="servicios"  element={<WebServicios />} />
          <Route path="contacto"   element={<WebContacto />} />
        </Route>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/*" element={
          !user ? <Navigate to="/login" /> : (
            <MainLayout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/users" element={

                  user.role === 'admin'
                    ? <Users />
                    : <Navigate to="/" />
                } />
                <Route path="/clients" element={
                  user.role === 'admin' || user.role === 'empleado'
                    ? <Clients />
                    : <Navigate to="/" />
                } />
                <Route path="/projects/:projectId/tasks" element={<Tasks />} />
                <Route path="/tracking" element={
                  user.role === 'admin' || user.role === 'ingeniero'
                    ? <ProjectTracking />
                    : <Navigate to="/" />
                } />
                <Route path="/projects/:projectId/detail" element={<ProjectDetail />} />
                <Route path="/portfolio-admin" element={
                  user.role === 'admin'
                    ? <PortfolioAdmin />
                    : <Navigate to="/" />
                } />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </MainLayout>
          )
        } />
      </Routes>
      </Suspense>
    </BrowserRouter>
    </ToastProvider>
    </SettingsProvider>
  )
}

export default App