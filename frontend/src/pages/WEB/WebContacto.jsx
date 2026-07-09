import { useOutletContext } from 'react-router-dom'
import Contact from '../../components/website/Contact'

function WebContacto() {
  const { onWhatsapp } = useOutletContext()
  return (
    <div className="pt-20">
      <Contact onWhatsapp={onWhatsapp} />
    </div>
  )
}

export default WebContacto