import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Documents from './pages/Documents'
import Users from './pages/Users'
import Tasks from './pages/Tasks'
import ProjectTracking from './pages/ProjectTracking'
import ProjectDetail from './pages/ProjectDetail'
import PortfolioAdmin from './pages/PortfolioAdmin'
import ClientPortal from './pages/ClientPortal'
import Website from './pages/Website'
import WebNosotros from './pages/WEB/WebNosotros'
import WebPortafolio from './pages/WEB/WebPortafolio'
import WebServicios from './pages/WEB/WebServicios'
import WebContacto from './pages/WEB/WebContacto'
import WebLayout from './layouts/WebLayout'
import Login from './pages/Login'
import { ToastProvider } from './context/ToastContext'
import { SettingsProvider } from './context/SettingsContext'
import Settings from './pages/Settings'
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
                <Route path="/documents" element={
                  
                  user.role === 'admin' || user.role === 'tecnico'
                    ? <Documents />
                    : <Navigate to="/" />
                } />
                <Route path="/users" element={
                  
                  user.role === 'admin'
                    ? <Users />
                    : <Navigate to="/" />
                } />
                <Route path="/projects/:projectId/tasks" element={<Tasks />} />
                <Route path="/tracking" element={<ProjectTracking />} />
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
    </BrowserRouter>
    </ToastProvider>
    </SettingsProvider>
  )
}

export default App