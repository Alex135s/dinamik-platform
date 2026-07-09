function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-gray-500 text-xs">
        Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}–{Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
      </p>
      <div className="flex items-center gap-1">
        {/* Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-700">
          ← Anterior
        </button>

        {/* Números de página */}
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
              ${currentPage === page
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}>
            {page}
          </button>
        ))}

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-700">
          Siguiente →
        </button>
      </div>
    </div>
  )
}

export default Pagination