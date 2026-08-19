import { createContext, useContext, useState, useCallback } from 'react'
import { LuTriangleAlert } from 'react-icons/lu'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  // confirm(mensaje, { title, confirmLabel, danger }) -> Promise<boolean>
  const confirm = useCallback((message, opts = {}) => {
    return new Promise(resolve => {
      setDialog({
        message,
        title: opts.title || '¿Estás seguro?',
        confirmLabel: opts.confirmLabel || 'Confirmar',
        danger: opts.danger ?? true,
        resolve,
      })
    })
  }, [])

  const close = (result) => {
    dialog?.resolve(result)
    setDialog(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 bg-black/60 z-[9998] flex items-center justify-center p-4"
          onClick={() => close(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${dialog.danger ? 'bg-red-500/15 text-red-400' : 'bg-orange-500/15 text-orange-400'}`}>
                <LuTriangleAlert size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{dialog.title}</h3>
                <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">{dialog.message}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => close(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => close(true)}
                className={`flex-1 text-white py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${dialog.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

// Hook: const confirm = useConfirm(); if (await confirm('¿Eliminar este proyecto?')) { ... }
export function useConfirm() {
  return useContext(ConfirmContext)
}
