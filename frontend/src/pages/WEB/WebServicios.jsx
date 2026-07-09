import { useOutletContext } from 'react-router-dom'
import Services from '../../components/website/Services'

function WebServicios() {
  const { onWhatsapp } = useOutletContext()
  return (
    <div className="pt-20">
      <Services onWhatsapp={onWhatsapp} />
    </div>
  )
}

export default WebServicios