import Eyebrow from './Eyebrow'
import { typeIcons, typeLabels, typeAccent, isNew, isPDF } from './portalData'

function Deliverables({ docs, docsDeshabilitados, onPdf, onImg }) {
  return (
    <div>
      <Eyebrow>Entregables</Eyebrow>
      <h3 className="text-gray-900 font-bold text-lg mb-4 -mt-2">
        Documentos disponibles
        {docs.length > 0 && (
          <span className="ml-2 text-gray-400 text-sm font-normal">({docs.length})</span>
        )}
      </h3>

      {docs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center mb-8">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-gray-500 text-sm">Aún no hay entregables disponibles.</p>
        </div>
      ) : (
        <div className="mb-8">
          {['plano_pdf', 'plano_cad', 'imagen_3d', 'informe', 'otro'].map(tipo => {
            const grupo = docs.filter(d => d.type === tipo)
            if (grupo.length === 0) return null
            return (
              <div key={tipo} className="mb-6">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  {typeIcons[tipo]} {typeLabels[tipo]}
                </p>
                <div className="grid gap-2">
                  {grupo.map(d => (
                    <div key={d.id}
                      className={`bg-white rounded-2xl px-5 py-4 border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow
                        ${isNew(d.uploadedAt) ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {tipo === 'imagen_3d' && d.fileUrl ? (
                          <img src={d.fileUrl} alt={d.name}
                            className="w-11 h-11 object-cover rounded-xl border border-gray-200 cursor-pointer flex-shrink-0"
                            onClick={() => onImg(d)} />
                        ) : (
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeAccent[tipo]}`}>
                            {typeIcons[tipo]}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900 text-sm font-semibold truncate">{d.name}</p>
                            {isNew(d.uploadedAt) && (
                              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                                NUEVO
                              </span>
                            )}
                          </div>
                          {d.uploadedAt && (
                            <p className="text-gray-400 text-xs mt-0.5">
                              Subido el {new Date(d.uploadedAt).toLocaleDateString('es-PE', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {isPDF(d.type) && d.fileUrl && (
                          <button onClick={() => onPdf(d)}
                            className="bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs px-3 py-2 rounded-lg transition-colors border border-gray-200">
                            👁 Ver PDF
                          </button>
                        )}
                        {tipo === 'imagen_3d' && d.fileUrl && (
                          <button onClick={() => onImg(d)}
                            className="bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs px-3 py-2 rounded-lg transition-colors border border-gray-200">
                            👁 Ver
                          </button>
                        )}
                        <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs px-4 py-2 rounded-lg transition-colors shadow-sm shadow-orange-500/20">
                          Descargar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Documentos solo visualización */}
      {docsDeshabilitados.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-500 font-semibold mb-3 flex items-center gap-2">
            🔒 Solo visualización
            <span className="text-xs font-normal text-gray-400">(sin descarga)</span>
          </h3>
          <div className="grid gap-2">
            {docsDeshabilitados.map(d => (
              <div key={d.id}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${typeAccent[d.type] || 'bg-gray-100 text-gray-500'}`}>
                    {typeIcons[d.type]}
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm font-medium">{d.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Solo previsualización</p>
                  </div>
                </div>
                <button onClick={() => onPdf(d)}
                  className="bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-xs px-3 py-2 rounded-lg border border-gray-200">
                  👁 Ver (sin descarga)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Deliverables
