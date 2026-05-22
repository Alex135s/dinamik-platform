import { useState } from 'react'
import Navbar from '../components/website/Navbar'
import Hero from '../components/website/Hero'
import Services from '../components/website/Services'
import Contact from '../components/website/Contact'
import About from '../components/website/About'

function Website() {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleWhatsapp = () => {
    window.open('https://wa.me/51962744341?text=Hola, me gustaría obtener más información sobre sus servicios.', '_blank')
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar
        onWhatsapp={handleWhatsapp}
        onScrollTo={scrollTo}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <Hero
        onWhatsapp={handleWhatsapp}
        onScrollTo={scrollTo}
      />
      <About />
      <Services onWhatsapp={handleWhatsapp} />
      <Contact onWhatsapp={handleWhatsapp} />
    </div>
  )
}

export default Website