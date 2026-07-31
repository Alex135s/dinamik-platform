import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { LuImages, LuX } from 'react-icons/lu'

const GALLERY_API = '' + import.meta.env.VITE_DOCUMENTS_API + ''

const categories = [
  { key: 'todos',                label: 'Todos' },
  { key: 'estructuras_metalicas', label: 'Estructuras metálicas' },
  { key: 'cielo_raso',           label: 'Cielo raso / Drywall' },
  { key: 'policarbonato',        label: 'Policarbonato / Coberturas' },
  { key: 'obra_civil',           label: 'Obra civil / Concreto' },
]

const categoryLabels = {
  estructuras_metalicas: 'Estructuras metálicas',
  cielo_raso:            'Cielo raso / Drywall',
  policarbonato:         'Policarbonato / Coberturas',
  obra_civil:            'Obra civil / Concreto',
}

function Portfolio() {
  const [active, setActive]   = useState('todos')
  const [photos, setPhotos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [openAlbum, setOpenAlbum] = useState(null) // álbum abierto en galería
  const [zoomPhoto, setZoomPhoto] = useState(null)  // foto individual ampliada

  useEffect(() => {
    axios.get(`${GALLERY_API}/api/gallery/public`)
      .then(res => setPhotos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false))
  }, [])

  // Agrupa las fotos por título -> cada título es un álbum (una tarjeta)
  const albums = useMemo(() => {
    const visibles = active === 'todos'
      ? photos
      : photos.filter(p => p.category === active)

    const mapa = new Map()
    for (const p of visibles) {
      if (!mapa.has(p.title)) {
        mapa.set(p.title, { title: p.title, category: p.category, photos: [] })
      }
      mapa.get(p.title).photos.push(p)
    }
    return Array.from(mapa.values())
  }, [photos, active])

  return (
    <section id="portafolio" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-12">
          <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Nuestro trabajo</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">Portafolio</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Proyectos que demuestran nuestra experiencia y compromiso con la excelencia.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map(c => (
            <button key={c.key} onClick={() => setActive(c.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${active === c.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-500'
                }`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Estados */}
        {loading ? (
          <p className="text-center text-gray-400 text-sm">Cargando proyectos...</p>
        ) : albums.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-3 text-gray-300"><LuImages size={48} /></div>
            <p className="text-gray-400 text-sm">
              {photos.length === 0
                ? 'Aún no hay fotos en el portafolio.'
                : 'No hay proyectos en esta categoría.'}
            </p>
          </div>
        ) : (
          /* Grid de álbumes (una tarjeta por título) */
          <div className="grid md:grid-cols-3 gap-6">
            {albums.map(album => (
              <button key={album.title} onClick={() => setOpenAlbum(album)}
                className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all overflow-hidden group text-left">
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <img src={album.photos[0].imageUrl} alt={album.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {/* Contador de fotos */}
                  <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <LuImages size={12} /> {album.photos.length} {album.photos.length === 1 ? 'foto' : 'fotos'}
                  </span>
                </div>
                <div className="p-5">
                  <span className="text-orange-500 text-xs font-semibold">
                    {categoryLabels[album.category] || album.category}
                  </span>
                  <h3 className="text-gray-900 font-bold text-base mt-1">{album.title}</h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Galería del álbum: muestra todas las fotos del título */}
      {openAlbum && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto p-4"
          onClick={() => setOpenAlbum(null)}>
          <div className="max-w-5xl mx-auto my-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-white text-xl font-bold">{openAlbum.title}</h3>
                <p className="text-orange-400 text-sm">
                  {categoryLabels[openAlbum.category] || openAlbum.category} · {openAlbum.photos.length} fotos
                </p>
              </div>
              <button onClick={() => setOpenAlbum(null)}
                className="text-white hover:text-orange-400 px-2"><LuX size={30} /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {openAlbum.photos.map(p => (
                <button key={p.id} onClick={() => setZoomPhoto(p.imageUrl)}
                  className="aspect-square overflow-hidden rounded-xl bg-gray-800 group">
                  <img src={p.imageUrl} alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Foto individual ampliada */}
      {zoomPhoto && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setZoomPhoto(null)}>
          <button onClick={() => setZoomPhoto(null)}
            className="absolute top-4 right-6 text-white hover:text-orange-400"><LuX size={36} /></button>
          <img src={zoomPhoto} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </section>
  )
}

export default Portfolio