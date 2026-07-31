import { useSettings } from '../context/SettingsContext'
import { LuSettings, LuPalette, LuMoon, LuSun, LuCheck, LuGlobe, LuInfo } from 'react-icons/lu'

function Settings() {
  const { theme, language, toggleTheme, toggleLanguage, t } = useSettings()

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><LuSettings size={22} /> {t.settings}</h1>
      <p className="text-gray-400 text-sm mb-8">Personaliza tu experiencia en DinamikPlatform</p>

      <div className="grid gap-6 max-w-2xl">

        {/* Tema */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2"><LuPalette size={16} /> {t.theme}</h2>
          <p className="text-gray-400 text-xs mb-4">Elige entre modo oscuro o modo claro</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${theme === 'dark'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}>
              <div className="w-10 h-10 bg-gray-950 rounded-lg flex items-center justify-center flex-shrink-0 text-white">
                <LuMoon size={18} />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{t.darkMode}</p>
                <p className="text-gray-400 text-xs">Fondo oscuro</p>
              </div>
              {theme === 'dark' && (
                <span className="ml-auto text-orange-500"><LuCheck size={18} /></span>
              )}
            </button>

            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${theme === 'light'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 text-yellow-600">
                <LuSun size={18} />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{t.lightMode}</p>
                <p className="text-gray-400 text-xs">Fondo claro</p>
              </div>
              {theme === 'light' && (
                <span className="ml-auto text-orange-500"><LuCheck size={18} /></span>
              )}
            </button>
          </div>
        </div>

        {/* Idioma */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2"><LuGlobe size={16} /> {t.language}</h2>
          <p className="text-gray-400 text-xs mb-4">Selecciona el idioma de la interfaz</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => language !== 'es' && toggleLanguage()}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${language === 'es'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}>
              <span className="text-3xl">🇵🇪</span>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{t.spanish}</p>
                <p className="text-gray-400 text-xs">Español</p>
              </div>
              {language === 'es' && (
                <span className="ml-auto text-orange-500"><LuCheck size={18} /></span>
              )}
            </button>

            <button
              onClick={() => language !== 'en' && toggleLanguage()}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${language === 'en'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}>
              <span className="text-3xl">🇺🇸</span>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{t.english}</p>
                <p className="text-gray-400 text-xs">English</p>
              </div>
              {language === 'en' && (
                <span className="ml-auto text-orange-500"><LuCheck size={18} /></span>
              )}
            </button>
          </div>
        </div>

        {/* Info del sistema */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><LuInfo size={16} /> Información del Sistema</h2>
          <div className="space-y-2">
            {[
              { label: 'Plataforma',  value: 'DinamikPlatform v1.0' },
              { label: 'Empresa',     value: 'DINAMIK DK GROUP SAC' },
              { label: 'Frontend',    value: 'React + Vite + Tailwind CSS' },
              { label: 'Backend',     value: '.NET 8 Minimal API' },
              { label: 'Base de datos', value: 'PostgreSQL' },
              { label: 'IA',          value: 'Groq · Llama 3.3 70B' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-700 last:border-0">
                <span className="text-gray-400 text-sm">{item.label}</span>
                <span className="text-white text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Settings