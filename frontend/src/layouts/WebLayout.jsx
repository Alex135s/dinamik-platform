import { Outlet, useNavigate } from 'react-router-dom'
import WebNavbar from '../components/website/WebNavbar'

function WebLayout() {
  const navigate  = useNavigate()

  const handleWhatsapp = () => {
    window.open('https://wa.me/51962744341?text=Hola, me gustaría obtener más información sobre sus servicios.', '_blank')
  }

  const goTo = (path) => navigate(`/web/${path}`)

  return (
    <div className="min-h-screen bg-white font-sans">
      <WebNavbar onWhatsapp={handleWhatsapp} goTo={goTo} />
      <Outlet context={{ onWhatsapp: handleWhatsapp, goTo }} />
    </div>
  )
}

export default WebLayout