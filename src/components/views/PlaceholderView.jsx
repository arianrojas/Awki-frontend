import React from 'react'

const placeholderViews = {
  embarazo: {
    icon: <img src='/embarazo_2.png' alt='logo_embarazo'></img>,
    title: 'Mi Embarazo',
    description: 'Aquí verás el desarrollo semana a semana de tu bebé, cambios en tu cuerpo y consejos personalizados.',
    color: 'from-pink-400 to-rose-500',
    items: ['Desarrollo del bebé por semana', 'Cambios físicos esperados', 'Tips de bienestar', 'Videos educativos'],
  },
  controles: {
    icon: <img src='/calendario_embarazo.png' alt='logo_calendario'></img>,
    title: 'Controles y Citas',
    description: 'Gestiona todas tus citas prenatales, agenda nuevas y recibe recordatorios automáticos.',
    color: 'from-blue-400 to-indigo-500',
    items: ['Agendar nueva cita', 'Ver citas programadas', 'Historial de controles', 'Notificaciones de citas'],
  },
  historial: {
    icon: '📋',
    title: 'Historial Médico',
    description: 'Tu expediente clínico completo, resultados de exámenes y notas de tus médicos.',
    color: 'from-teal-400 to-cyan-500',
    items: ['Expediente clínico', 'Resultados de laboratorio', 'Notas médicas', 'Documentos compartidos'],
  },
  sintomas: {
    icon: '💊',
    title: 'Síntomas',
    description: 'Registra cómo te sientes cada día y monitorea la evolución de tus síntomas.',
    color: 'from-amber-400 to-orange-500',
    items: ['Registrar nuevo síntoma', 'Historial de síntomas', 'Alertas importantes', 'Gráfico de evolución'],
  },
  ecografias: {
    icon: '🔬',
    title: 'Ecografías y Exámenes',
    description: 'Guarda y visualiza todas tus ecografías, análisis de sangre y otros estudios.',
    color: 'from-purple-400 to-violet-500',
    items: ['Subir nueva ecografía', 'Ver galería de imágenes', 'Resultados de exámenes', 'Compartir con médico'],
  },
  educacion: {
    icon: '📖',
    title: 'Educación',
    description: 'Artículos, videos y cursos sobre embarazo, parto y cuidado del recién nacido.',
    color: 'from-green-400 to-emerald-500',
    items: ['Artículos de nutrición', 'Clases de preparación al parto', 'Videos de ejercicios', 'Guías de lactancia'],
  },
  recordatorios: {
    icon: '🔔',
    title: 'Recordatorios',
    description: 'Configura alertas para medicamentos, vitaminas, citas y momentos importantes.',
    color: 'from-yellow-400 to-amber-500',
    items: ['Recordatorios de medicamentos', 'Alertas de citas', 'Recordatorios de controles', 'Notificaciones personalizadas'],
  },
  mensajes: {
    icon: '💬',
    title: 'Mensajes',
    description: 'Comunícate directamente con tu médico, partera o enfermera de manera segura.',
    color: 'from-sky-400 to-blue-500',
    items: ['Chat con tu médico', 'Consultas frecuentes', 'Archivo de mensajes', 'Contactos de emergencia'],
  },
}

export default function PlaceholderView({ tab }) {
  const info = placeholderViews[tab]
  if (!info) return null

  return (
    <div className="animate-fade-in flex flex-col items-center justify-start py-8">
      {/* Hero Card */}
      <div className={`w-full max-w-2xl rounded-3xl bg-gradient-to-br ${info.color} p-8 text-white shadow-xl mb-8`}>
        <div className="text-6xl mb-4">{info.icon}</div>
        <h2 className="text-3xl font-extrabold mb-3">{info.title}</h2>
        <p className="text-white/80 text-base leading-relaxed">{info.description}</p>
      </div>

      {/* Feature Cards */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
        {info.items.map((item, i) => (
          <div
            key={item}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 hover:shadow-md hover:border-pink-100 transition-all duration-200 cursor-pointer group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 group-hover:bg-pink-100 flex items-center justify-center text-2xl mb-3 transition-colors">
              {['📌', '📝', '🔍', '📊', '🖼️', '🎯', '⚡', '📤'][i % 8]}
            </div>
            <p className="font-semibold text-gray-700 text-sm group-hover:text-pink-600 transition-colors">{item}</p>
            <p className="text-gray-400 text-xs mt-1">Próximamente disponible</p>
          </div>
        ))}
      </div>

      {/* Coming soon badge */}
      <div className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-50 border border-pink-100">
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
        <span className="text-pink-500 text-sm font-medium">Sección en desarrollo</span>
      </div>
    </div>
  )
}
