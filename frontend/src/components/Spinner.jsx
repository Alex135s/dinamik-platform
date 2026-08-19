function Spinner({ size = 20, className = '' }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default Spinner
