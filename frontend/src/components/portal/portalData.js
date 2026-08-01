// Datos y helpers compartidos del portal del cliente
import {
  LuFileText, LuPencilRuler, LuCuboid, LuClipboardList, LuPaperclip,
  LuHardHat, LuSearch, LuBuilding2, LuRuler,
  LuActivity, LuLoader, LuCircleCheckBig,
} from 'react-icons/lu'

export const typeIcons = {
  plano_pdf: LuFileText, plano_cad: LuPencilRuler, imagen_3d: LuCuboid, informe: LuClipboardList, otro: LuPaperclip,
}

export const typeLabels = {
  plano_pdf: 'Planos PDF',
  plano_cad: 'Planos CAD/DWG',
  imagen_3d: 'Imágenes 3D',
  informe:   'Informes Técnicos',
  otro:      'Otros',
}

export const typeAccent = {
  plano_pdf: 'bg-red-100 text-red-600',
  plano_cad: 'bg-blue-100 text-blue-600',
  imagen_3d: 'bg-purple-100 text-purple-600',
  informe:   'bg-green-100 text-green-600',
  otro:      'bg-gray-100 text-gray-500',
}

export const taskStatusInfo = {
  pendiente:  { label: 'Pendiente',  dot: 'bg-gray-300',   text: 'text-gray-400'  },
  en_proceso: { label: 'En proceso', dot: 'bg-orange-500', text: 'text-orange-500' },
  completado: { label: 'Completada', dot: 'bg-green-500',  text: 'text-green-600' },
}

export const SERVICIOS = [
  { icon: LuHardHat,   title: 'Diseño Estructural',    desc: 'Estructuras sismorresistentes optimizadas.',   tag: 'Ingeniería',  iconBg: 'bg-orange-100 text-orange-600', hover: 'hover:border-orange-300' },
  { icon: LuCuboid,    title: 'Metodología BIM',         desc: 'Coordinación digital antes de construir.',     tag: 'Tecnología',  iconBg: 'bg-blue-100 text-blue-600',     hover: 'hover:border-blue-300'   },
  { icon: LuClipboardList, title: 'Expedientes Técnicos', desc: 'Licencias de construcción y habilitaciones.',  tag: 'Trámites',    iconBg: 'bg-green-100 text-green-600',   hover: 'hover:border-green-300'  },
  { icon: LuSearch,    title: 'Estudio de Suelos',       desc: 'Geotecnia y topografía de precisión.',         tag: 'Geotecnia',   iconBg: 'bg-amber-100 text-amber-600',   hover: 'hover:border-amber-300'  },
  { icon: LuBuilding2, title: 'Construcción y Control',  desc: 'Supervisión técnica con control de calidad.',  tag: 'Supervisión', iconBg: 'bg-purple-100 text-purple-600', hover: 'hover:border-purple-300' },
  { icon: LuRuler,     title: 'Topografía',              desc: 'Levantamientos y fotogrametría con dron.',     tag: 'Topografía',  iconBg: 'bg-rose-100 text-rose-600',     hover: 'hover:border-rose-300'   },
]

export const blueprintGrid = {
  backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

export const isNew = (uploadedAt) => {
  if (!uploadedAt) return false
  return (new Date() - new Date(uploadedAt)) / (1000 * 60 * 60 * 24) <= 7
}

export const isPDF = (type) => type === 'plano_pdf' || type === 'informe'

export const statusInfo = {
  activo:     { label: 'Activo',     Icon: LuActivity },
  en_proceso: { label: 'En proceso', Icon: LuLoader },
  completado: { label: 'Completado', Icon: LuCircleCheckBig },
}

export const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}