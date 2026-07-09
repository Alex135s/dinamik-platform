import Eyebrow from './Eyebrow'


const EMPRESA = {
  direccion: 'Av. República de Chile 478, Jesús María, Lima',
  telefono:  '+51 962 744 341',
  correo:    'contacto@dinamik.com',
}

function Sidebar({ docs, tasks, onWhatsapp }) {
  // Próximo hito = primera tarea no completada (en orden cronológico)
  const cronologico = [...tasks].reverse()
  const proximo = cronologico.find(t => t.status !== 'completado')

  // Descargar todo: abre cada entregable en una pestaña nueva
  const descargarTodo = () => {
    const conUrl = docs.filter(d => d.fileUrl)
    if (conUrl.length === 0) return
    conUrl.forEach(d => window.open(d.fileUrl, '_blank'))
  }

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(EMPRESA.direccion)}&z=15&output=embed`

  return (
    <div className="space-y-4 lg:sticky lg:top-24 self-start">

      {/* Accesos rápidos */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <Eyebrow>Accesos rápidos</Eyebrow>
        <div className="space-y-2">
          <button onClick={descargarTodo} disabled={docs.length === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 transition">
            ⬇ Descargar todo {docs.length > 0 && `(${docs.length})`}
          </button>
          <button onClick={onWhatsapp}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-green-500/20 transition">
            💬 WhatsApp
          </button>
          <button onClick={onWhatsapp}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-gray-200 transition">
            📋 Solicitar Cotización
          </button>
        </div>
      </div>

      {/* Próximo hito */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <Eyebrow>Próximo hito</Eyebrow>
        {proximo ? (
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-base flex-shrink-0">🎯</span>
            <div className="min-w-0">
              <p className="text-gray-900 text-sm font-semibold">{proximo.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {proximo.status === 'en_proceso' ? 'En proceso' : 'Pendiente'}
                {proximo.dueDate && ` · vence ${proximo.dueDate}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-base flex-shrink-0">✅</span>
            <p className="text-gray-600 text-sm">
              {tasks.length > 0 ? '¡Todas las tareas completadas!' : 'Aún no hay tareas registradas.'}
            </p>
          </div>
        )}
      </div>

      {/* Datos de empresa + mapa */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <Eyebrow>DINAMIK</Eyebrow>
        <div className="space-y-2 text-sm mb-4">
          <p className="text-gray-600 flex items-start gap-2">
            <span className="flex-shrink-0">📍</span> {EMPRESA.direccion}
          </p>
          <p className="text-gray-600 flex items-center gap-2">
            <span>📞</span> {EMPRESA.telefono}
          </p>
          <p className="text-gray-600 flex items-center gap-2">
            <span>✉️</span> {EMPRESA.correo}
          </p>
        </div>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <iframe
            title="Ubicación DINAMIK"
            src={mapSrc}
            width="100%"
            height="160"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

export default Sidebar
