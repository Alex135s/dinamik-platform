import { useOutletContext } from 'react-router-dom'
import Hero from '../components/website/Hero'

function Website() {
  const { onWhatsapp, goTo } = useOutletContext()

  const scrollTo = (id) => {
    if (id === 'servicios') goTo('servicios')
    else if (id === 'contacto') goTo('contacto')
  }

  return (
    <Hero onWhatsapp={onWhatsapp} onScrollTo={scrollTo} />
  )
}

export default Website