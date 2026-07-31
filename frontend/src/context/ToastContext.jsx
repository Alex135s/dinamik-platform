import { createContext, useContext, useState, useCallback } from 'react'
import { LuCircleCheckBig, LuCircleX, LuTriangleAlert, LuInfo, LuX } from 'react-icons/lu'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-orange-500',
    info: 'bg-blue-500',
  }

  const icons = {
    success: LuCircleCheckBig,
    error: LuCircleX,
    warning: LuTriangleAlert,
    info: LuInfo,
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Contenedor de toasts — esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map(toast => {
          const Icon = icons[toast.type]
          return (
          <div
            key={toast.id}
            className={`${bgColors[toast.type]} text-white px-5 py-3 rounded-xl shadow-lg
              flex items-center gap-3 min-w-[280px] max-w-[360px]
              animate-fade-in-up`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white flex-shrink-0 ml-1">
              <LuX size={17} />
            </button>
          </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// Hook para usar toasts en cualquier página
export function useToast() {
  return useContext(ToastContext)
}