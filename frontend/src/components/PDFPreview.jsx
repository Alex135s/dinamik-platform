function PDFPreview({ url, name, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-5xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 flex-shrink-0">
          <p className="text-white font-semibold text-sm">📄 {name}</p>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-4 py-2 rounded-lg transition-colors">
              ⬇ Descargar
            </a>
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg transition-colors">
              🔗 Nueva pestaña
            </a>
            <button onClick={onClose}
              className="text-gray-400 hover:text-white text-xl px-2 transition-colors">
              ✕
            </button>
          </div>
        </div>

        {/* iFrame viewer */}
        <div className="flex-1 relative">
          <iframe
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full rounded-b-2xl"
            title={name}
            onError={() => {}}
          />
        </div>
      </div>
    </div>
  )
}

export default PDFPreview