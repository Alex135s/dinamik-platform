import { Outlet, useNavigate } from 'react-router-dom'
import WebNavbar from '../components/website/WebNavbar'
import Footer from '../components/website/Footer'
import Chatbot from '../components/Chatbot'

const WEB_QUICK_QUESTIONS = [
  '¿Qué servicios ofrecen?',
  '¿Cómo cotizo mi proyecto?',
  '¿Dónde están ubicados?',
  '¿Cómo los contacto?',
]

function WebLayout() {
  const navigate  = useNavigate()

  const handleWhatsapp = () => {
    window.open('https://wa.me/51962744341?text=Hola, me gustaría obtener más información sobre sus servicios.', '_blank')
  }

  const goTo = (path) => navigate(`/web/${path}`)

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <WebNavbar onWhatsapp={handleWhatsapp} goTo={goTo} />
      <div className="flex-1">
        <Outlet context={{ onWhatsapp: handleWhatsapp, goTo }} />
      </div>
      <Footer onWhatsapp={handleWhatsapp} />
      <Chatbot
        isPortal
        placeholder="¿En qué puedo ayudarte?"
        quickQuestions={WEB_QUICK_QUESTIONS}
        welcomeLines={['Tu asistente virtual de DINAMIK.', 'Pregúntame sobre nuestros servicios, cotizaciones y proyectos.']}
      />
    </div>
  )
}

export default WebLayout
