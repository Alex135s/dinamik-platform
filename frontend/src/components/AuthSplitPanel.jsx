import { blueprintGrid } from './portal/portalData'

// Layout compartido de las pantallas de acceso (staff /login y portal /portal):
// formulario a la izquierda, panel de marca a la derecha (oculto en móvil).
function AuthSplitPanel({ children, tagline, subtitle }) {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
          <div className="max-w-sm mx-auto w-full">{children}</div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700">
        <div className="absolute inset-0 opacity-10" style={blueprintGrid} />
        <div className="relative m-auto text-center px-10">
          <img src="/logo-dark.png" alt="DINAMIK" className="w-56 mx-auto mb-6" />
          <p className="text-orange-50 text-lg font-medium">{tagline}</p>
          {subtitle && <p className="text-orange-100/80 text-sm mt-2">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

export default AuthSplitPanel
