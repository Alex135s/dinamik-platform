import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import AuthSplitPanel from '../components/AuthSplitPanel'
import { FcGoogle } from 'react-icons/fc'
import { LuArrowLeft } from 'react-icons/lu'

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const handleLogin = async () => {
    if (!form.email || !form.password) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('' + import.meta.env.VITE_PROJECTS_API + '/api/auth/login', form)
      onLogin(res.data)
    } catch {
      setError('Email o contraseña incorrectos.')
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
      const res = await axios.post('' + import.meta.env.VITE_PROJECTS_API + '/api/auth/google', { idToken })
      onLogin(res.data)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.response?.data?.error || 'No se pudo iniciar sesión con Google.')
      }
    } finally {
      setLoadingGoogle(false)
    }
  }

  return (
    <AuthSplitPanel tagline="Plataforma de Gestión de Proyectos" subtitle="Arquitectura, Ingeniería & Construcción">
      <Link to="/web" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm mb-8 transition-colors w-fit">
        <LuArrowLeft size={15} /> Volver al sitio
      </Link>

      <h1 className="text-3xl font-black text-gray-900">Panel de Administración</h1>
      <p className="text-gray-500 text-sm mt-2 mb-8">Ingresa tus datos para acceder.</p>

      <button onClick={handleGoogleLogin} disabled={loadingGoogle}
        className="w-full bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 border border-gray-200 transition-colors">
        <FcGoogle size={18} />
        {loadingGoogle ? 'Conectando...' : 'Ingresar con Google'}
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400 text-xs">O</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-gray-700 text-sm font-medium block mb-1.5">Correo</label>
          <input
            type="email"
            placeholder="admin@dinamik.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
          />
        </div>
        <div>
          <label className="text-gray-700 text-sm font-medium block mb-1.5">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 text-sm border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition"
          />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button onClick={handleLogin} disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 transition">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>

      <p className="text-gray-400 text-xs text-center mt-4">
        Google solo funciona con cuentas ya registradas por un administrador.
      </p>

      <div className="mt-8 bg-gray-50 rounded-xl p-4 space-y-1.5 border border-gray-100">
        <p className="text-gray-500 text-xs font-semibold">Credenciales de prueba:</p>
        <p className="text-gray-400 text-xs">Admin: admin@dinamik.com / admin123</p>
        <p className="text-gray-400 text-xs">Técnico: tecnico1@dinamik.com / tecnico123</p>
      </div>
    </AuthSplitPanel>
  )
}

export default Login
