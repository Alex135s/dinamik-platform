import { useEffect, useState } from 'react'
import { LuFileText, LuLock, LuX, LuBan } from 'react-icons/lu'

function PDFViewerProtected({ url, name, clientName, projectCode, onClose }) {
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ['s', 'S', 'p', 'P', 'a', 'A', 'c', 'C', 'u', 'U'].includes(e.key)
      ) {
        e.preventDefault()
        e.stopPropagation()
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
        return false
      }
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        navigator.clipboard?.writeText('').catch(() => {})
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      }
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return false
    }

    document.addEventListener('keydown',      handleKeyDown,     true)
    document.addEventListener('contextmenu',  handleContextMenu, true)

    return () => {
      document.removeEventListener('keydown',     handleKeyDown,     true)
      document.removeEventListener('contextmenu', handleContextMenu, true)
    }
  }, [])

  const watermarkText = `${clientName} · ${projectCode} · CONFIDENCIAL`

  return (
    <div
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
      onContextMenu={e => { e.preventDefault(); return false }}>

      <div
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-5xl h-[92vh] flex flex-col"
        onContextMenu={e => { e.preventDefault(); return false }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 flex-shrink-0 bg-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-orange-500"><LuFileText size={20} /></span>
            <div>
              <p className="text-white font-semibold text-sm">{name}</p>
              <p className="text-gray-400 text-xs">{projectCode} · Solo visualización</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1">
              <LuLock size={12} /> Protegido · Sin descarga
            </span>
            <button onClick={onClose}
              className="text-gray-400 hover:text-white px-2 transition-colors">
              <LuX size={20} />
            </button>
          </div>
        </div>

        {/* Alerta */}
        {showAlert && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <LuBan size={16} /> Acción bloqueada — Documento protegido
          </div>
        )}

        {/* Visor */}
        <div
          className="flex-1 relative overflow-hidden rounded-b-2xl select-none"
          onContextMenu={e => { e.preventDefault(); return false }}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>

          {/* iFrame */}
          <iframe
            src={url}
            className="w-full h-full rounded-b-2xl"
            title={name}
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          />

          {/* Overlay — bloquea clic derecho en el iframe */}
          <div
            className="absolute inset-0"
            style={{ zIndex: 5, cursor: 'default', userSelect: 'none' }}
            onContextMenu={e => {
              e.preventDefault()
              e.stopPropagation()
              setShowAlert(true)
              setTimeout(() => setShowAlert(false), 3000)
              return false
            }}
          />

          {/* Watermarks diagonales */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden"
            style={{ zIndex: 10 }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i}
                className="absolute text-white/[0.07] font-bold whitespace-nowrap select-none"
                style={{
                  top:       `${(i % 8) * 13}%`,
                  left:      `${Math.floor(i / 8) * 25 - 10}%`,
                  transform: 'rotate(-35deg)',
                  fontSize:  '12px',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  pointerEvents: 'none',
                }}>
                {watermarkText}
              </div>
            ))}

            {/* Watermark central */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 11 }}>
              <div
                className="text-center select-none pointer-events-none"
                style={{
                  color:      'rgba(255,255,255,0.04)',
                  fontSize:   '42px',
                  fontWeight: 900,
                  transform:  'rotate(-35deg)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  lineHeight: '1.2',
                }}>
                <div>{clientName}</div>
                <div style={{ fontSize: '22px' }}>{projectCode}</div>
                <div style={{ fontSize: '16px' }}>CONFIDENCIAL</div>
              </div>
            </div>
          </div>

          {/* Barra inferior */}
          <div
            className="absolute bottom-0 left-0 right-0 py-2 text-center select-none pointer-events-none"
            style={{ zIndex: 12, backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <p className="text-yellow-400 text-xs flex items-center justify-center gap-1.5">
              <LuLock size={12} /> Documento confidencial · {clientName} · {projectCode} · Solo visualización — descarga no autorizada
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PDFViewerProtected