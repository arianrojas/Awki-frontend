import React, { useState } from 'react'
import { Home, Baby, MessageCircle, Stethoscope, Menu, X, Calendar, FileText, BookOpen, Bell, User, LogOut, History, Building2 } from 'lucide-react'

const MAIN_TABS = [
  { id: 'inicio',    icon: Home,          label: 'Inicio' },
  { id: 'embarazo',  icon: Baby,          label: 'Embarazo' },
  { id: 'mensajes',  icon: MessageCircle, label: 'Mensajes', highlight: true },
  { id: 'sintomas',  icon: Stethoscope,   label: 'Síntomas' },
]

const MORE_TABS = [
  { id: 'controles',    icon: Calendar,   label: 'Controles y Citas',      desc: 'Agenda tus consultas prenatales' },
  { id: 'historial',    icon: History,    label: 'Historial Médico',        desc: 'Tu historial clínico completo' },
  { id: 'ecografias',   icon: FileText,   label: 'Ecografías y Exámenes',   desc: 'Tus estudios y resultados' },
  { id: 'educacion',    icon: BookOpen,   label: 'Educación',               desc: 'Aprende sobre tu embarazo' },
  { id: 'recordatorios',icon: Bell,       label: 'Recordatorios',           desc: 'No olvides tus vitaminas y citas' },
  { id: 'perfil',       icon: User,       label: 'Mi Perfil',               desc: 'Actualiza tus datos personales' },
]

export default function BottomNavGestante({ activeTab, setActiveTab, currentUser, onLogout }) {
  const [showDrawer, setShowDrawer] = useState(false)

  const name = currentUser?.name?.split(' ')[0] ?? 'Gestante'
  const initials = (currentUser?.name ?? 'U')
    .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const handleTabPress = (id) => {
    setActiveTab(id)
    setShowDrawer(false)
  }

  const handleMoreTabPress = (id) => {
    setActiveTab(id)
    setShowDrawer(false)
  }

  // Determine if current active tab is in the "more" group
  const moreTabIds = MORE_TABS.map(t => t.id)
  const isMoreActive = moreTabIds.includes(activeTab)

  return (
    <>
      {/* ── Drawer Overlay ── */}
      {showDrawer && (
        <div
          className="drawer-overlay"
          onClick={() => setShowDrawer(false)}
        />
      )}

      {/* ── Más Drawer (slide up) ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[90] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          showDrawer ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Drawer handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-5 py-3 mb-1 border-b border-gray-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {initials}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{name}</p>
            <p className="text-gray-400 text-xs">Gestante · Awki</p>
          </div>
        </div>

        {/* More tabs grid */}
        <div className="grid grid-cols-2 gap-2 px-4 py-3">
          {MORE_TABS.map(({ id, icon: Icon, label, desc }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => handleMoreTabPress(id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all active:scale-95 ${
                  isActive
                    ? 'bg-pink-50 border-2 border-pink-200'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-pink-50/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 shadow-sm'
                }`}>
                  <Icon className="w-4.5 h-4.5" size={18} />
                </div>
                <div className="min-w-0">
                  <p className={`font-semibold text-xs leading-tight ${isActive ? 'text-pink-700' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-1">{desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Logout */}
        <div className="px-4 pb-2">
          <button
            onClick={() => { setShowDrawer(false); onLogout() }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-semibold text-sm">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[85] bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] bottom-nav-safe"
        style={{ height: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-around h-[68px] px-1">
          {/* First two tabs */}
          {MAIN_TABS.slice(0, 2).map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => handleTabPress(id)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-90"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-pink-500 shadow-md shadow-pink-200' : ''
                }`}>
                  <Icon
                    className={`transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-400'}`}
                    size={isActive ? 20 : 22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-pink-600' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </button>
            )
          })}

          {/* Center — Mensajes (prominent) */}
          {(() => {
            const { id, icon: Icon, label } = MAIN_TABS[2] // mensajes
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => handleTabPress(id)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full -mt-3 transition-all active:scale-90"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-300/60 scale-110'
                    : 'bg-gradient-to-br from-pink-400 to-purple-500 shadow-pink-200/50'
                }`}>
                  <Icon className="text-white" size={26} strokeWidth={2} />
                </div>
                <span className={`text-[10px] font-bold mt-0.5 transition-colors duration-200 ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </button>
            )
          })()}

          {/* Last tab — Síntomas */}
          {(() => {
            const { id, icon: Icon, label } = MAIN_TABS[3]
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => handleTabPress(id)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-90"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-pink-500 shadow-md shadow-pink-200' : ''
                }`}>
                  <Icon
                    className={`transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-400'}`}
                    size={isActive ? 20 : 22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-pink-600' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </button>
            )
          })()}

          {/* Más button */}
          <button
            onClick={() => setShowDrawer(prev => !prev)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-90"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              showDrawer || isMoreActive ? 'bg-pink-500 shadow-md shadow-pink-200' : ''
            }`}>
              {showDrawer
                ? <X className="text-white" size={20} strokeWidth={2.5} />
                : <Menu
                    className={`transition-all duration-200 ${isMoreActive ? 'text-white' : 'text-gray-400'}`}
                    size={22}
                    strokeWidth={isMoreActive ? 2.5 : 1.8}
                  />
              }
            </div>
            <span className={`text-[10px] font-semibold transition-colors duration-200 ${
              showDrawer || isMoreActive ? 'text-pink-600' : 'text-gray-400'
            }`}>
              Más
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
