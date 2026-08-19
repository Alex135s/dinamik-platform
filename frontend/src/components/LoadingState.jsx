import Spinner from './Spinner'

function LoadingState({ label = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
      <Spinner size={20} className="text-orange-500" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default LoadingState
