import React from 'react'

export default function VistaEmbarazo() {
  const user = JSON.parse(localStorage.getItem('awki_user') || 'null')
  const semanas = user?.semanasGestacion ?? 0
  const trimestre = user?.trimestre ?? 1
  const fpp = user?.fechaProbableParto

  // Información semanal estimativa
  const getFetalDevelopment = (w) => {
    if (w < 8) {
      return {
        size: 'Semilla de frambuesa (2 mm)',
        details: 'El corazón de tu bebé empieza a latir y se empiezan a esbozar sus primeros órganos y extremidades.',
        tips: 'Mantén una hidratación constante y consume ácido fólico diariamente.'
      }
    } else if (w < 13) {
      return {
        size: 'Limón (6 cm, 15g)',
        details: 'El bebé ya puede moverse de forma refleja. Sus deditos y rasgos faciales ya están definidos.',
        tips: 'Momento de realizar tus primeros análisis de laboratorio y control obstétrico.'
      }
    } else if (w < 20) {
      return {
        size: 'Aguacate / Palta (15 cm, 240g)',
        details: 'El bebé empieza a oír sonidos del exterior y su esqueleto cartilaginoso se endurece.',
        tips: 'Realiza estiramientos ligeros para evitar el dolor de espalda baja.'
      }
    } else if (w < 28) {
      return {
        size: 'Papaya pequeña (35 cm, 1 kg)',
        details: 'Abre los ojos y reacciona fuertemente a la luz y a los sonidos intensos. Pestañea y traga líquido amniótico.',
        tips: 'Controla el consumo de azúcar y vigila la hinchazón en pies o piernas.'
      }
    } else {
      return {
        size: 'Sandía mediana (48 cm, 3 kg)',
        details: 'El bebé está completamente formado y acumulando grasa bajo la piel para regular su temperatura al nacer.',
        tips: 'Prepara el bolso de maternidad y ten a la mano tus números de emergencia.'
      }
    }
  }

  const devInfo = getFetalDevelopment(semanas)

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-800">🤰 Mi Embarazo Semana a Semana</h2>
        <p className="text-gray-400 text-sm">Monitorea el crecimiento de tu bebé y recibe recomendaciones adaptadas a tu etapa gestacional.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progreso Circular */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col items-center justify-center text-center gap-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Semana Actual</span>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Círculo de Progreso */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="#fce7f3" strokeWidth="6" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#gradient)"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * Math.min(semanas, 40)) / 40}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-800">{semanas}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Semana {trimestre}°T</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-pink-600">
              {trimestre === 1 ? 'Primer Trimestre' : trimestre === 2 ? 'Segundo Trimestre' : 'Tercer Trimestre'}
            </p>
            {fpp && (
              <p className="text-xs text-gray-400">
                FPP: {new Date(fpp + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Desarrollo Fetal */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-pulse">👶</span>
            <div>
              <h3 className="font-bold text-gray-800 text-base">Tu bebé esta semana</h3>
              <p className="text-xs text-pink-500 font-medium">Tamaño de {devInfo.size}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase">¿Qué está pasando?</h4>
              <p className="text-gray-600 text-sm leading-relaxed mt-1">{devInfo.details}</p>
            </div>
            
            <div className="bg-pink-50/30 border border-pink-100 rounded-2xl p-4 mt-2">
              <h4 className="text-xs font-bold text-pink-600 uppercase flex items-center gap-1.5">
                💡 Consejo Prenatal Especial
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mt-1">{devInfo.tips}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Artículos Recomendados */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 text-base">📘 Consejos y Cuidado Integral</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { t: 'Nutrición del Embarazo', d: 'Consejos sobre hierro, ácido fólico, calcio y alimentos prohibidos durante la gestación.', e: '🍎' },
            { t: 'Ejercicio Seguro', d: 'Prácticas recomendadas como yoga prenatal, caminatas y respiración abdominal.', e: '🧘‍♀️' },
            { t: 'Salud Emocional', d: 'Cómo controlar el estrés de la gestante, conectar con la respiración y prepararse mentalmente.', e: '🧠' }
          ].map(art => (
            <div key={art.t} className="p-4 border border-gray-100 rounded-2xl hover:border-pink-200 transition-colors flex flex-col gap-2">
              <span className="text-3xl">{art.e}</span>
              <h4 className="font-bold text-gray-800 text-sm">{art.t}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{art.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
