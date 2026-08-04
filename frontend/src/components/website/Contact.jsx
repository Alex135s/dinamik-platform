import { useState } from 'react'
import { FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaLinkedin, FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa'

function Contact({ onWhatsapp }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  return (
      <section id="contacto" className="py-16 sm:py-24 bg-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Hablemos</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">Contáctanos</h2>
            <p className="text-gray-400 mt-4">Cuéntanos tu proyecto y te respondemos a la brevedad.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 p-3 rounded-xl">
                  <FaMapMarkerAlt className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Dirección</p>
                  <p className="text-white text-sm font-medium mt-1">Av. República de Chile Nro 478, Jesús María, Lima</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 p-3 rounded-xl">
                  <FaPhone className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Teléfono</p>
                  <p className="text-white text-sm font-medium mt-1">+51 962 744 341</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 p-3 rounded-xl">
                  <FaEnvelope className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="text-white text-sm font-medium mt-1">dinamiksac@gmail.com</p>
                </div>
              </div>
              <button onClick={onWhatsapp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                <FaWhatsapp className="text-xl" /> Escribir por WhatsApp
              </button>
              <div className="flex gap-3">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-blue-700 p-3 rounded-xl transition-colors">
                  <FaLinkedin className="text-white text-lg" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-pink-600 p-3 rounded-xl transition-colors">
                  <FaInstagram className="text-white text-lg" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-blue-600 p-3 rounded-xl transition-colors">
                  <FaFacebook className="text-white text-lg" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-600 p-3 rounded-xl transition-colors">
                  <FaTiktok className="text-white text-lg" />
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-800">
                <iframe
                  title="DINAMIK ubicación"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.5!2d-77.0428!3d-12.0734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5b5b5b5b5%3A0x1!2sAv.+Rep%C3%BAblica+de+Chile+478%2C+Jes%C3%BAs+Mar%C3%ADa+15072!5e0!3m2!1ses!2spe!4v1"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy">
                </iframe>
              </div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
              <input placeholder="Tu nombre"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none" />
              <input placeholder="Tu email"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none" />
              <textarea placeholder="Cuéntanos tu proyecto..." rows={4}
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-orange-500 focus:outline-none resize-none" />
              <button onClick={onWhatsapp}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium">
                Enviar mensaje
              </button>
            </div>
          </div>
        </div>
      </section>
  )
}

export default Contact