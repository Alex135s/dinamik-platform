import Eyebrow from './Eyebrow'
import { taskStatusInfo } from './portalData'

function Timeline({ tasks }) {
  if (tasks.length === 0) return null
  const timeline = [...tasks].reverse() // del más antiguo al más reciente

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <Eyebrow>Avance del proyecto</Eyebrow>
      <div className="mt-1">
        {timeline.map((t, i) => {
          const info = taskStatusInfo[t.status] || taskStatusInfo.pendiente
          const last = i === timeline.length - 1
          return (
            <div key={t.id} className="relative pl-7 pb-5 last:pb-0">
              {!last && <span className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200" />}
              <span className={`absolute left-0 top-1 w-4 h-4 rounded-full ring-4 ring-white ${info.dot}`} />
              <p className="text-gray-900 text-sm font-semibold">{t.title}</p>
              <p className={`text-xs mt-0.5 ${info.text}`}>
                {info.label}
                {t.dueDate && <span className="text-gray-400"> · vence {t.dueDate}</span>}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
