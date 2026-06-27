import React from 'react'
import { Building2, Stethoscope, Users, ShieldAlert, RefreshCw, LogOut, Radio } from 'lucide-react'

const NAV_ITEMS = [
  {
    id: 'doctor',
    icon: <Stethoscope className="w-5 h-5" />,
    label: 'Panel Principal',
    desc: 'Directorio y controles'
  },
  {
    id: 'admin_clinica',
    icon: <Building2 className="w-5 h-5" />,
    label: 'Gestión Clínica',
    desc: 'Administración de la clínica'
  },
]

export default function BarraLateral({ activeTab, setActiveTab, currentUser }) {
  const name = currentUser?.name ?? 'Doctor'
  const email = currentUser?.email ?? ''
  const roleText = currentUser?.role === 'ADMIN_CLINICA' ? 'Admin de Clínica' : 'Médico Obstetra'

  const initials = name
    .split('@')[0]
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm"
      style={{ width: 'var(--doctor-sidebar-width)' }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-50">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-200/50">
          <img src="/logo_awki.png" alt="Logo Awki" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-blue-700 font-extrabold text-xl leading-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            Awki
          </p>
          <p className="text-gray-400 text-[11px]">Panel Médico</p>
        </div>
      </div>

      {/* ── Role badge ── */}
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
          <Radio className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-blue-600 font-semibold text-xs truncate">Sistema de monitoreo activo</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </p>
                <p className={`text-[11px] truncate ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                  {item.desc}
                </p>
              </div>
              {isActive && (
                <span className="w-1.5 h-8 bg-white/40 rounded-full flex-shrink-0" />
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Separador de info ── */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Rol</p>
            <p className="text-xs font-bold text-gray-700 mt-0.5 truncate">Médico</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Estado</p>
            <p className="text-xs font-bold text-green-600 mt-0.5">Activo</p>
          </div>
        </div>
      </div>

      {/* ── User Profile ── */}
      <div className="border-t border-gray-100 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
          {initials || 'Dr'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-bold text-sm truncate">{name}</p>
          <p className="text-gray-400 text-[11px] truncate">{roleText}</p>
        </div>
      </div>
    </aside>
  )
}
