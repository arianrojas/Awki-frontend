import React from 'react'

const navItems = [
  { id: 'inicio',       icon: '🏠', label: 'Inicio' },
  { id: 'embarazo',     icon: '🤰', label: 'Mi Embarazo' },
  { id: 'controles',    icon: '📅', label: 'Controles y Citas' },
  { id: 'historial',    icon: '📋', label: 'Historial Médico' },
  { id: 'sintomas',     icon: '💊', label: 'Síntomas' },
  { id: 'ecografias',   icon: '🔬', label: 'Ecografías y Exámenes' },
  { id: 'educacion',    icon: '📖', label: 'Educación' },
  { id: 'recordatorios',icon: '🔔', label: 'Recordatorios' },
  { id: 'mensajes',     icon: '💬', label: 'Mensajes' },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-white border-r border-pink-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-pink-50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
          🤱
        </div>
        <div>
          <p className="text-pink-600 font-bold text-[15px] leading-tight">Mamá Segura</p>
          <p className="text-gray-400 text-[11px]">Cuidado para ti y tu bebé</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-5 py-3 text-left text-sm font-medium transition-all duration-200 rounded-lg mx-2 mb-0.5
              ${activeTab === item.id
                ? 'bg-pink-50 text-pink-600 font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            style={{ width: 'calc(100% - 16px)' }}
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-[13px]">{item.label}</span>
            {activeTab === item.id && (
              <span className="ml-auto w-1.5 h-6 bg-pink-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Motivational Banner */}
      <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-4">
        <div className="flex items-start gap-2">
          <span className="text-2xl">👶</span>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Cada pequeño paso te acerca a conocer a tu bebé. <span className="text-pink-500">❤️</span>
          </p>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-pink-50 px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
          MF
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-semibold text-[13px] truncate">María Fernanda</p>
          <p className="text-gray-400 text-[11px]">24 años</p>
        </div>
        <button className="text-gray-400 hover:text-pink-500 transition-colors text-xs">›</button>
      </div>
    </aside>
  )
}
