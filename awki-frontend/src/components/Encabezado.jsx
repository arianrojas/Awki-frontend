import React from 'react'

export default function Encabezado({ activeTab, currentUser, onLogout }) {
  const firstName = currentUser?.name?.split(' ')[0] ?? 'Bienvenida'
  const greetings = {
    inicio: { title: `¡Hola, ${firstName}!`, subtitle: 'Estás en tu viaje más importante. Estamos contigo.', image: '/ola.png' },
    embarazo: { title: 'Mi Embarazo', subtitle: 'Sigue el progreso de tu bebé semana a semana.', image: '/embarazo.png' },
    controles: { title: 'Controles y Citas', subtitle: 'Gestiona tus citas prenatales con facilidad.', image: '/calendario.png' },
    historial: { title: 'Historial Médico', subtitle: 'Tu historial clínico completo en un solo lugar.', image: '/historial.png' },
    sintomas: { title: 'Síntomas', subtitle: 'Registra y monitorea cómo te sientes cada día.', image: '/capsula.png' },
    ecografias: { title: 'Ecografías y Exámenes', subtitle: 'Todos tus estudios y resultados organizados.', image: '/microscopio.png' },
    educacion: { title: 'Educación', subtitle: 'Aprende todo sobre tu embarazo y parto.', image: '/educacion.png' },
    recordatorios: { title: 'Recordatorios', subtitle: 'No te pierdas ningún momento importante.', image: '/notificacion.png' },
    mensajes: { title: 'Mensajes', subtitle: 'Comunícate con tu equipo de salud.', image: '/mensaje.png' },
  }

  const current = greetings[activeTab] || greetings.inicio

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="animate-fade-in" key={activeTab}>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">
            {current.title}
          </h1>

          <img
            src={current.image}
            alt={current.title}
            className="w-7 h-7 object-contain"
          />
        </div>

        <p className="text-gray-400 text-sm mt-0.5">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-10 h-10 rounded-full bg-gray-50 hover:bg-pink-50 flex items-center justify-center transition-all duration-200 group">
          <span className="text-lg"><img src="/notificacion.png" alt="logo_notificacion" className='w-full h-full object-cover'></img></span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            ..
          </span>
        </button>

        {/* Chat */}
        <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-pink-50 flex items-center justify-center transition-all duration-200">
          <span className="text-lg"><img src="/mensaje.png" alt="logo_mensaje" className='w-full h-full object-cover'></img></span>
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-500 text-sm font-medium hover:border-pink-300 hover:text-pink-500 transition-all duration-200"
        >
          <span>Cerrar sesión</span>
          <span><img src="/cerrar_sesion.png" alt="logo_cerrar_sesion" className='w-5 h-5 object-cover'></img></span>
        </button>
      </div>
    </header>
  )
}