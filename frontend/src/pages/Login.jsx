import { useState } from 'react'
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { FcGoogle } from 'react-icons/fc'

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-10 border border-gray-800 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-dark.png" alt="DINAMIK" className="w-48 mx-auto" />
          <p className="text-gray-400 text-sm mt-2">Panel de Administración</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs block mb-2">Email</label>
            <input
              type="email"
              placeholder="admin@dinamik.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-2">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium text-sm">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-500 text-xs">o</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <button onClick={handleGoogleLogin} disabled={loadingGoogle}
          className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 transition-colors">
          <FcGoogle size={18} />
          {loadingGoogle ? 'Conectando...' : 'Ingresar con Google'}
        </button>
        <p className="text-gray-500 text-xs text-center mt-3">
          Solo para técnicos y administradores con cuenta ya registrada.
        </p>

        <div className="mt-6 bg-gray-800 rounded-xl p-4 space-y-2">
          <p className="text-gray-400 text-xs font-semibold">Credenciales de prueba:</p>
          <p className="text-gray-500 text-xs">Admin: admin@dinamik.com / admin123</p>
          <p className="text-gray-500 text-xs">Técnico: tecnico1@dinamik.com / tecnico123</p>
        </div>
      </div>
    </div>
  )
}

export default Login