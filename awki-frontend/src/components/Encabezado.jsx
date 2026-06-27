import React from 'react'

// Header compacto para gestantes en móvil
function EncabezadoGestante({ activeTab, currentUser }) {
  const firstName = currentUser?.name?.split(' ')[0] ?? 'Hola'

  const titles = {
    inicio:        { title: `¡Hola, ${firstName}! 👋`, sub: 'Tu compañera prenatal inteligente' },
    embarazo:      { title: 'Mi Embarazo 🤰',           sub: 'Semana a semana con tu bebé' },
    controles:     { title: 'Controles y Citas 📅',      sub: 'Tu agenda prenatal' },
    historial:     { title: 'Historial Médico 📋',        sub: 'Tu historia clínica completa' },
    sintomas:      { title: 'Síntomas 🩺',               sub: 'Cuéntanos cómo te sientes' },
    ecografias:    { title: 'Ecografías 🔬',             sub: 'Tus estudios organizados' },
    educacion:     { title: 'Educación 📚',              sub: 'Todo sobre tu embarazo' },
    recordatorios: { title: 'Recordatorios 🔔',          sub: 'Tus alarmas y vitaminas' },
    mensajes:      { title: 'Mensajes 💬',               sub: 'Chatea con tu IA prenatal' },
    perfil:        { title: 'Mi Perfil 👤',              sub: 'Tus datos personales' },
  }

  const current = titles[activeTab] || titles.inicio

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="px-4 py-3" key={activeTab}>
        <h1 className="text-lg font-extrabold text-gray-800 leading-tight animate-fade-in">
          {current.title}
        </h1>
        <p className="text-gray-400 text-xs mt-0.5 animate-fade-in">
          {current.sub}
        </p>
      </div>
    </header>
  )
}

// Header completo para doctores en desktop
function EncabezadoDoctor({ currentUser, onLogout }) {
  const firstName = currentUser?.name?.split(' ')[0] ?? 'Doctor'

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold text-gray-800">
          Panel Médico — Dr. {firstName}
        </h1>
        <p className="text-gray-400 text-xs mt-0.5">
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <span>Cerrar sesión</span>
          <img src="/cerrar_sesion.png" alt="Salir" className="w-4 h-4 object-cover" />
        </button>
      </div>
    </header>
  )
}

export default function Encabezado({ activeTab, currentUser, onLogout }) {
  const isDoctor = currentUser?.role === 'MEDICO' || currentUser?.role === 'ADMIN_CLINICA'

  if (isDoctor) {
    return <EncabezadoDoctor currentUser={currentUser} onLogout={onLogout} />
  }

  return <EncabezadoGestante activeTab={activeTab} currentUser={currentUser} />
}