// Hook que devuelve los permisos según el rol del usuario logueado
export function usePermissions() {
  const session = JSON.parse(localStorage.getItem('dinamik_session') || '{}')
  const role    = session.role || 'tecnico'
  const isAdmin = role === 'admin'

  return {
    role,
    isAdmin,

    // Proyectos
    projects: {
      canCreate: isAdmin,
      canEdit:   isAdmin,
      canDelete: isAdmin,
      canView:   true,
      canExport: isAdmin,
    },

    // Documentos
    documents: {
      canUpload:  true,       // Admin y Técnico
      canDelete:  isAdmin,    // Solo Admin
      canToggle:  isAdmin,    // Solo Admin
      canExport:  isAdmin,
      canView:    true,
    },

    // Tareas
    tasks: {
      canCreate:       isAdmin,
      canDelete:       isAdmin,
      canChangeStatus: true,  // Ambos pueden cambiar estado
      canView:         true,
    },

    // Usuarios
    users: {
      canAccess:       isAdmin,
      canCreate:       isAdmin,
      canDelete:       isAdmin,
      canChangeRole:   isAdmin,
    },

    // Seguimiento
    tracking: {
      canView: true,
    },
  }
}