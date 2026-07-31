import { useState } from 'react'
import { LuCopy, LuCheck, LuMessageCircle, LuMail } from 'react-icons/lu'
import { useToast } from '../context/ToastContext'

// Botones para copiar/compartir el código de un proyecto (WhatsApp / Email)
function ShareProjectCode({ code, projectName, client, size = 'sm' }) {
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)
  if (!code) return null

  const message = `Hola${client ? ` ${client}` : ''}, el código de seguimiento de tu proyecto "${projectName || ''}" en DINAMIK es: ${code}`

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      showToast(`Código ${code} copiado al portapapeles.`, 'success')
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
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

  const btnSize = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
  const iconSize = size === 'sm' ? 13 : 15
  const btnClass = `${btnSize} inline-flex items-center justify-center rounded-md border border-gray-600/60 bg-gray-700/80 text-gray-400 transition-colors`

  return (
    <span className="inline-flex items-center gap-1.5">
      <button type="button" onClick={handleCopy} title="Copiar código"
        className={`${btnClass} ${copied ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'hover:bg-orange-500/20 hover:border-orange-500/40 hover:text-orange-400'}`}>
        {copied ? <LuCheck size={iconSize} /> : <LuCopy size={iconSize} />}
      </button>
      <button type="button" onClick={handleWhatsapp} title="Enviar por WhatsApp"
        className={`${btnClass} hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400`}>
        <LuMessageCircle size={iconSize} />
      </button>
      <button type="button" onClick={handleEmail} title="Enviar por correo"
        className={`${btnClass} hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-400`}>
        <LuMail size={iconSize} />
      </button>
    </span>
  )
}

export default ShareProjectCode
