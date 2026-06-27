import React from 'react'

const navItems = [
  { id: 'inicio', icon: <img src="/inicio.png" alt="logo_inicio" className='w-full h-full object-cover'></img>, label: 'Inicio' },
  { id: 'embarazo', icon: <img src="/embarazo.png" alt="logo_embarazo" className='w-full h-full object-cover'></img>, label: 'Mi Embarazo' },
  { id: 'controles', icon: <img src="/calendario.png" alt="logo_calendario" className='w-full h-full object-cover'></img>, label: 'Controles y Citas' },
  { id: 'historial', icon: <img src="/historial.png" alt="logo_historial" className='w-full h-full object-cover'></img>, label: 'Historial Médico' },
  { id: 'sintomas', icon: <img src="/capsula.png" alt="logo_sintomas" className='w-full h-full object-cover'></img>, label: 'Síntomas' },
  { id: 'ecografias', icon: <img src="/microscopio.png" alt="logo_microscopio" className='w-full h-full object-cover'></img>, label: 'Ecografías y Exámenes' },
  { id: 'educacion', icon: <img src="/educacion.png" alt="logo_educacion" className='w-full h-full object-cover'></img>, label: 'Educación' },
  { id: 'recordatorios', icon: <img src="/notificacion.png" alt="logo_notificacion" className='w-full h-full object-cover'></img>, label: 'Recordatorios' },
  { id: 'mensajes', icon: <img src="/mensaje.png" alt="logo_mensaje" className='w-full h-full object-cover'></img>, label: 'Mensajes' },
  { id: 'doctor', icon: <img src="/doctor_barralateral.png" alt="logo_doctorr" className='w-full h-full object-cover'></img>, label: 'Panel Médico' },
]

export default function BarraLateral({ activeTab, setActiveTab }) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-white border-r border-pink-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-pink-50">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-md shadow-pink-300/50">
          <img
            src="/logo_awki.png"
            alt="Logo Awki"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-pink-600 font-extrabold text-[25px] leading-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Awki</p>
          <p className="text-gray-400 text-[12px]" style={{ fontFamily: '"Arial", Times, serif' }}>Cuidando cada nueva vida</p>
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

      {/* User Profile */}
      <div
        onClick={() => setActiveTab('perfil')}
        className={`border-t border-pink-50 px-4 py-4 flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'perfil' ? 'bg-pink-50' : 'hover:bg-gray-50'}`}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          MF
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-semibold text-[13px] truncate">María Fernanda</p>
          <p className="text-gray-400 text-[11px]">24 años</p>
        </div>
        <button className={`text-xs transition-colors ${activeTab === 'perfil' ? 'text-pink-600' : 'text-gray-400 hover:text-pink-500'}`}>
          ›
        </button>
      </div>
    </aside>
  )
}
