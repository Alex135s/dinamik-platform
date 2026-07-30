import { useToast } from '../context/ToastContext'

// Botones para copiar/compartir el código de un proyecto (WhatsApp / Email)
function ShareProjectCode({ code, projectName, client, size = 'sm' }) {
  const { showToast } = useToast()
  if (!code) return null

  const message = `Hola${client ? ` ${client}` : ''}, el código de seguimiento de tu proyecto "${projectName || ''}" en DINAMIK es: ${code}`

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      showToast(`Código ${code} copiado al portapapeles.`, 'success')
    } catch {
      showToast('No se pudo copiar el código.', 'error')
    }
  }

  const handleWhatsapp = (e) => {
    e.stopPropagation()
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const handleEmail = (e) => {
    e.stopPropagation()
    const subject = `Código de proyecto ${code} - DINAMIK`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
  }

  const btnClass = size === 'sm'
    ? 'w-6 h-6 text-xs'
    : 'w-8 h-8 text-sm'

  return (
    <span className="inline-flex items-center gap-1">
      <button type="button" onClick={handleCopy} title="Copiar código"
        className={`${btnClass} inline-flex items-center justify-center rounded-md bg-gray-700 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 transition-colors`}>
        📋
      </button>
      <button type="button" onClick={handleWhatsapp} title="Enviar por WhatsApp"
        className={`${btnClass} inline-flex items-center justify-center rounded-md bg-gray-700 hover:bg-green-500/20 hover:text-green-400 text-gray-400 transition-colors`}>
        💬
      </button>
      <button type="button" onClick={handleEmail} title="Enviar por correo"
        className={`${btnClass} inline-flex items-center justify-center rounded-md bg-gray-700 hover:bg-blue-500/20 hover:text-blue-400 text-gray-400 transition-colors`}>
        ✉️
      </button>
    </span>
  )
}

export default ShareProjectCode
