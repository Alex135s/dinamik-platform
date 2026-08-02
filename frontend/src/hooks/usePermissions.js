// Hook que devuelve los permisos según el rol del usuario logueado.
//
// Jerarquía del negocio:
// - admin:     acceso total.
// - empleado:  gestiona la parte administrativa (crea el proyecto, cliente,
//              dirección, requisitos). No asigna tareas ni cierra trabajo técnico.
// - ingeniero: queda asignado al proyecto (projects.assignedTo), reparte
//              tareas a los técnicos y ve el avance/requerimientos/permisos.
// - tecnico:   cierra las tareas que le asigna el ingeniero y sube evidencias.
export function usePermissions() {
  const session = JSON.parse(localStorage.getItem('dinamik_session') || '{}')
  const role    = session.role || 'tecnico'
  const isAdmin = role === 'admin'

  // Quién ve el listado completo de proyectos (no solo los suyos)
  const seesAllProjects = role === 'admin' || role === 'empleado'

  return {
    role,
    isAdmin,
    seesAllProjects,

    // Proyectos (datos administrativos: nombre, cliente, dirección, fechas)
    projects: {
      canCreate: role === 'admin' || role === 'empleado',
      canEdit:   role === 'admin' || role === 'empleado',
      canDelete: isAdmin,
      canView:   true,
      canExport: role === 'admin' || role === 'empleado',
    },

    // Documentos (requisitos del cliente, permisos, evidencias de avance)
    documents: {
      canUpload: true, // los 4 roles suben algo distinto (requisitos/permisos/evidencias)
      canDelete: role === 'admin' || role === 'ingeniero',
      canToggle: role === 'admin' || role === 'ingeniero',
      canExport: isAdmin,
      canView:   true,
    },

    // Tareas
    tasks: {
      canCreate:       role === 'admin' || role === 'ingeniero',
      canDelete:       role === 'admin' || role === 'ingeniero',
      canChangeStatus: role !== 'empleado', // admin, ingeniero y tecnico cierran tareas
      canView:         true,
    },

    // Usuarios internos (staff)
    users: {
      canAccess:     isAdmin,
      canCreate:     isAdmin,
      canDelete:     isAdmin,
      canChangeRole: isAdmin,
    },

    // Clientes
    clients: {
      canAccess: role === 'admin' || role === 'empleado',
      canEdit:   role === 'admin' || role === 'empleado',
    },

    // Seguimiento (salud/avance técnico del proyecto)
    tracking: {
      canView: role === 'admin' || role === 'ingeniero',
    },
  }
}
