import { useState } from 'react'
import { FaWhatsapp, FaTimes, FaComments } from 'react-icons/fa'

function Support({ project }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      from: 'dinamik',
      text: `Hola, bienvenido al soporte de DINAMIK. Estamos aquí para ayudarte con tu proyecto ${project?.name || ''}. ¿En qué podemos ayudarte?`,
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const handleSend = () => {
    if (!message.trim()) return
    const newMsg = {
      from: 'client',
      text: message,
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([...messages, newMsg])
    setMessage('')

    // Auto respuesta
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'dinamik',
        text: 'Gracias por tu mensaje. Un especialista te contactará pronto por WhatsApp.',
        time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      }])
    }, 1000)
  }

  const handleWhatsapp = () => {
    const number = project?.whatsapp?.replace(/\D/g, '') || '51962744341'
    const text = `Hola, soy cliente del proyecto ${project?.name} (${project?.projectCode}). Necesito soporte.`
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all">
          <FaComments className="text-xl" />
          <span className="text-sm font-medium">Soporte</span>
        </button>
      )}

      {/* Chat */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 z-50 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaComments className="text-white" />
              <div>
                <p className="text-white text-sm font-bold">Soporte DINAMIK</p>
                <p className="text-orange-100 text-xs">En línea</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-orange-200">
              <FaTimes />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-72">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-xl text-xs
                  ${m.from === 'client'
                    ? 'bg-orange-500 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                  }`}>
                  <p>{m.text}</p>
                  <p className={`text-xs mt-1 ${m.from === 'client' ? 'text-orange-200' : 'text-gray-500'}`}>
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp */}
          <button onClick={handleWhatsapp}
            className="mx-4 mb-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2">
            <FaWhatsapp className="text-base" /> Continuar en WhatsApp
          </button>

          {/* Input */}
          <div className="px-4 pb-4 flex gap-2">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-gray-800 text-white rounded-xl px-3 py-2 text-xs border border-gray-700 focus:border-orange-500 focus:outline-none"
            />
            <button onClick={handleSend}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl text-xs font-medium">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Support