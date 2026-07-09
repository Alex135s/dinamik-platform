import Chatbot from './Chatbot'

// El contexto (proyectos, tareas, documentos, usuarios) ahora lo arma el
// backend en /api/chat leyendo la base de datos. Aquí solo mostramos el chat.
function ChatbotAdmin() {
  return (
    <Chatbot
      title="Asistente DINAMIK"
      placeholder="¿Cuántos proyectos activos hay?"
    />
  )
}

export default ChatbotAdmin