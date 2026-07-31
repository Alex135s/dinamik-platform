import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [theme, setTheme]       = useState('dark')
  const [language, setLanguage] = useState('es')

  // Cargar configuración guardada
  useEffect(() => {
    const saved = localStorage.getItem('dinamik_settings')
    if (saved) {
      const { theme: t, language: l } = JSON.parse(saved)
      if (t) setTheme(t)
      if (l) setLanguage(l)
    }
  }, [])

  // Guardar cuando cambia
  useEffect(() => {
    localStorage.setItem('dinamik_settings', JSON.stringify({ theme, language }))
    // Aplicar tema al documento
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode')
      document.documentElement.classList.remove('dark-mode')
    } else {
      document.documentElement.classList.add('dark-mode')
      document.documentElement.classList.remove('light-mode')
    }
  }, [theme, language])

  const toggleTheme   = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const toggleLanguage = () => setLanguage(l => l === 'es' ? 'en' : 'es')

  // Textos traducidos
  const t = {
    es: {
      dashboard:    'Dashboard',
      projects:     'Proyectos',
      documents:    'Documentos',
      tracking:     'Seguimiento',
      users:        'Usuarios',
      settings:     'Configuración',
      logout:       'Cerrar sesión',
      newProject:   'Nuevo Proyecto',
      newDocument:  'Subir Documento',
      newUser:      'Nuevo Usuario',
      search:       'Buscar por nombre o cliente...',
      allStatus:    'Todos los estados',
      allServices:  'Todos los servicios',
      active:       'activo',
      inProcess:    'en_proceso',
      completed:    'completado',
      loading:      'Cargando...',
      noProjects:   'No hay proyectos aún.',
      save:         'Guardar',
      cancel:       'Cancelar',
      edit:         'Editar',
      delete:       'Eliminar',
      tasks:        'Tareas',
      enabled:      'Habilitado',
      disabled:     'Deshabilitado',
      download:     'Descargar',
      upload:       'Subir',
      totalProjects:'Total Proyectos',
      actives:      'Activos',
      inProgress:   'En Proceso',
      completedP:   'Completados',
      recentProjects: 'Proyectos recientes',
      recentDocs:   'Documentos recientes',
      theme:        'Tema',
      language:     'Idioma',
      darkMode:     'Modo Oscuro',
      lightMode:    'Modo Claro',
      spanish:      'Español',
      english:      'Inglés',
    },
    en: {
      dashboard:    'Dashboard',
      projects:     'Projects',
      documents:    'Documents',
      tracking:     'Tracking',
      users:        'Users',
      settings:     'Settings',
      logout:       'Log out',
      newProject:   'New Project',
      newDocument:  'Upload Document',
      newUser:      'New User',
      search:       'Search by name or client...',
      allStatus:    'All statuses',
      allServices:  'All services',
      active:       'active',
      inProcess:    'in_process',
      completed:    'completed',
      loading:      'Loading...',
      noProjects:   'No projects yet.',
      save:         'Save',
      cancel:       'Cancel',
      edit:         'Edit',
      delete:       'Delete',
      tasks:        'Tasks',
      enabled:      'Enabled',
      disabled:     'Disabled',
      download:     'Download',
      upload:       'Upload',
      totalProjects:'Total Projects',
      actives:      'Active',
      inProgress:   'In Progress',
      completedP:   'Completed',
      recentProjects: 'Recent Projects',
      recentDocs:   'Recent Documents',
      theme:        'Theme',
      language:     'Language',
      darkMode:     'Dark Mode',
      lightMode:    'Light Mode',
      spanish:      'Spanish',
      english:      'English',
    }
  }

  return (
    <SettingsContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t: t[language] }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}