import { useState, useRef, useEffect } from 'react'

const CHAT_API = '' + import.meta.env.VITE_PROJECTS_API + ''

const QUICK_QUESTIONS = [
  '¿Cómo va mi proyecto?',
  '¿Qué documentos tengo?',
  '¿Cuándo termina mi proyecto?',
  '¿Cómo los contacto?',
]

function Chatbot({ placeholder = '¿En qué puedo ayudarte?', isPortal = false }) {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async (text) => {
    const userMsg = (text || input).trim()
    if (!userMsg || loading) return
    setInput('')
    setShowWelcome(false)
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      // Llamamos a NUESTRO backend; la API key de Groq vive allí, escondida.
      const res = await fetch(`${CHAT_API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withContext: !isPortal, // el panel interno recibe los datos; el portal público no
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      })

      const data  = await res.json()
      const reply = data.reply || 'Lo siento, no pude procesar tu consulta.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Tuve un problema al conectarme. Por favor intenta de nuevo o contáctanos al +51 962 744 341 💬'
      }])
    }
    setLoading(false)
  }

  const clearChat = () => {
    setMessages([])
    setShowWelcome(true)
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl transition-all
          ${open
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}>
        <span className="text-xl">{open ? '✕' : '💬'}</span>
        {!open && <span className="text-sm font-semibold pr-1">Asistente IA</span>}
      </button>

      {/* Ventana del chat */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[560px] bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl flex flex-col z-40 overflow-hidden">

          {/* Header mejorado */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm">DINA</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-orange-100 text-xs">Asistente DINAMIK · En línea</p>
                </div>
              </div>
            </div>
            <button onClick={clearChat}
              className="text-white/60 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
              🗑 Limpiar
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {/* Pantalla de bienvenida */}
            {showWelcome && messages.length === 0 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🤖</span>
                </div>
                <p className="text-white font-semibold text-sm">¡Hola! Soy DINA 👋</p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Tu asistente virtual de DINAMIK.<br/>
                  Puedo ayudarte con tu proyecto, documentos y más.
                </p>

                {/* Preguntas rápidas */}
                {isPortal && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button key={i}
                        onClick={() => sendMessage(q)}
                        className="bg-gray-800 hover:bg-orange-500/20 hover:border-orange-500 text-gray-300 hover:text-orange-400 text-xs px-3 py-2 rounded-xl border border-gray-700 transition-all text-left leading-snug">
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mensajes */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* Avatar asistente */}
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                    <span className="text-xs">🤖</span>
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 border border-gray-700/50 rounded-bl-sm'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="bg-gray-800 border border-gray-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input mejorado */}
          <div className="p-3 border-t border-gray-800 flex-shrink-0 bg-gray-900">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={placeholder}
                disabled={loading}
                className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2.5 border border-gray-700 focus:border-orange-500 outline-none disabled:opacity-50 placeholder-gray-500"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 hover:scale-105 active:scale-95">
                <span className="text-sm">➤</span>
              </button>
            </div>
            <p className="text-gray-600 text-xs text-center mt-2">DINA · Powered by Groq AI</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot