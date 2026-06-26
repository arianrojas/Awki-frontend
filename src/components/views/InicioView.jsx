import React from 'react'

// Mini chart data points (simulated weight evolution)
const chartPoints = [47, 49, 50, 52, 53, 55, 57, 60, 61, 62, 62.5]
const weeks = ['Sem. 4', 'Sem. 8', 'Sem. 12', 'Sem. 16', 'Sem. 20', 'Sem. 22']
const chartWeightPoints = [48, 50, 52, 55, 59, 62]

function MiniLineChart() {
  const W = 320, H = 120
  const minV = 44, maxV = 72
  const pts = chartWeightPoints.map((v, i) => {
    const x = 30 + (i / (chartWeightPoints.length - 1)) * (W - 50)
    const y = H - 10 - ((v - minV) / (maxV - minV)) * (H - 25)
    return { x, y, v }
  })
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${pts[0].x},${H - 10} ${polyline} ${pts[pts.length - 1].x},${H - 10}`

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y labels */}
      {[70, 60, 50, 40].map((v) => {
        const y = H - 10 - ((v - minV) / (maxV - minV)) * (H - 25)
        return (
          <g key={v}>
            <line x1="30" y1={y} x2={W - 20} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x="24" y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{v}</text>
          </g>
        )
      })}
      {/* Area fill */}
      <polygon points={area} fill="rgba(236,72,153,0.08)" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#e91e8c" strokeWidth="2.5" />
      ))}
      {/* X labels */}
      {weeks.map((w, i) => {
        const x = 30 + (i / (weeks.length - 1)) * (W - 50)
        return (
          <text key={i} x={x} y={H + 2} fontSize="8.5" fill="#9ca3af" textAnchor="middle">{w}</text>
        )
      })}
    </svg>
  )
}

export default function InicioView() {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT + CENTER (2 cols) ── */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* Pregnancy Week Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-50 rounded-full opacity-60" />
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <p className="text-gray-400 text-sm font-medium mb-1">Semana actual</p>
                <h2 className="text-4xl font-extrabold text-gray-800 leading-none">22 semanas</h2>
                <p className="text-pink-500 font-semibold text-sm mt-1">(Segundo Trimestre)</p>
                <p className="text-gray-500 text-sm mt-2 max-w-[200px]">Tu bebé es del tamaño de una papaya.</p>
                <button className="mt-4 px-5 py-2 rounded-full border-2 border-pink-400 text-pink-600 font-semibold text-sm hover:bg-pink-50 transition-all duration-200">
                  Ver detalles
                </button>
              </div>
              {/* Baby illustration placeholder */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center text-5xl shadow-inner">
                  👶
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-4xl">
                  🥭
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 text-xs font-medium">Progreso del embarazo</p>
                <p className="text-gray-400 text-xs">FPP: 10 de agosto de 2025 📅</p>
              </div>
              <div className="bg-pink-50 rounded-full h-2 overflow-hidden">
                <div className="progress-pregnancy" style={{ width: '55%' }} />
              </div>
              <p className="text-pink-600 font-bold text-sm mt-1.5">55%</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '📅', label: 'Agendar cita',     sub: 'Reservar nueva cita',    color: 'bg-pink-50 text-pink-600 border-pink-100' },
              { icon: '📊', label: 'Registrar control', sub: 'Añadir nuevo control',   color: 'bg-blue-50 text-blue-600 border-blue-100' },
              { icon: '⚖️', label: 'Registrar peso',    sub: 'Llevar seguimiento',     color: 'bg-green-50 text-green-600 border-green-100' },
              { icon: '🔔', label: 'Recordatorios',     sub: 'Ver mis alertas',        color: 'bg-amber-50 text-amber-600 border-amber-100' },
            ].map((a) => (
              <button key={a.label} className={`flex flex-col items-start p-4 rounded-2xl border ${a.color} hover:scale-[1.03] transition-all duration-200 shadow-sm text-left`}>
                <span className="text-2xl mb-2">{a.icon}</span>
                <p className="font-bold text-[13px] leading-tight">{a.label}</p>
                <p className="text-[11px] opacity-70 mt-0.5">{a.sub}</p>
              </button>
            ))}
          </div>

          {/* Health Summary + Chart */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Health metrics */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <h3 className="font-bold text-gray-700 text-[15px] mb-4">Resumen de salud</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '❤️', label: 'Peso actual',           value: '62.5 kg',        color: 'text-pink-500' },
                  { icon: '💉', label: 'Presión arterial',       value: '110/70 mmHg',    color: 'text-orange-500' },
                  { icon: '💓', label: 'Frecuencia cardíaca',    value: '78 lpm',         color: 'text-red-500' },
                  { icon: '📏', label: 'Índice de masa corporal',value: '23.4 (Normal)',  color: 'text-blue-500' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{m.icon}</span>
                      <span className="text-gray-500 text-sm">{m.label}</span>
                    </div>
                    <span className={`font-bold text-sm ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weight Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <h3 className="font-bold text-gray-700 text-[15px] mb-3">Evolución del peso (kg)</h3>
              <div className="mt-2">
                <MiniLineChart />
              </div>
            </div>
          </div>

          {/* Articles Section */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 text-[15px]">Artículos y consejos para ti</h3>
              <button className="text-pink-500 text-sm font-semibold hover:text-pink-600 transition-colors">Ver todos</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { emoji: '🥗', title: 'Alimentación en el segundo trimestre', tag: 'Nutrición',  tagColor: 'bg-green-100 text-green-600' },
                { emoji: '😴', title: 'Cómo mejorar tu descanso',             tag: 'Bienestar',  tagColor: 'bg-blue-100 text-blue-600' },
                { emoji: '🏃', title: 'Ejercicios seguros para embarazadas',   tag: 'Ejercicio',  tagColor: 'bg-purple-100 text-purple-600' },
              ].map((art) => (
                <button key={art.title} className="group rounded-xl overflow-hidden bg-gray-50 hover:bg-pink-50 border border-transparent hover:border-pink-100 transition-all duration-200 text-left">
                  <div className="h-24 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-4xl">
                    {art.emoji}
                  </div>
                  <div className="p-3">
                    <p className="text-gray-700 text-[12px] font-medium leading-snug group-hover:text-pink-600 transition-colors">{art.title}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${art.tagColor}`}>{art.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-5">

          {/* Next Appointment */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 text-[15px]">Próximo control</h3>
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg">📅</div>
            </div>
            <p className="text-pink-600 font-semibold text-sm mb-3">Control prenatal</p>
            <div className="flex flex-col gap-2 mb-4">
              {[
                { icon: '📅', text: '24 de mayo de 2025' },
                { icon: '🕙', text: '10:00 a. m.' },
                { icon: '📍', text: 'Centro de Salud San Miguel' },
              ].map((d) => (
                <div key={d.text} className="flex items-center gap-2">
                  <span className="text-base">{d.icon}</span>
                  <span className="text-gray-600 text-sm">{d.text}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold text-sm hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-purple-200">
              Ver mis citas
            </button>
          </div>

          {/* Prenatal Checklist */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex-1">
            <h3 className="font-bold text-gray-700 text-[15px] mb-4">Checklist de controles prenatales</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Primer control (Sem. 8)',  sub: 'Completado el 12/01/2025', done: true,    active: false },
                { label: 'Segundo control (Sem. 12)', sub: 'Completado el 09/02/2025', done: true,   active: false },
                { label: 'Tercer control (Sem. 16)', sub: 'Completado el 09/03/2025',  done: true,   active: false },
                { label: 'Cuarto control (Sem. 22)', sub: 'Próxima cita: 24/05/2025',  done: false,  active: true  },
                { label: 'Quinto control (Sem. 28)', sub: 'Pendiente',                  done: false,  active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                    ${item.active ? 'border-pink-200 bg-pink-50' : 'border-gray-50 hover:border-gray-100'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${item.done   ? 'bg-green-500 border-green-500'
                      : item.active ? 'border-pink-400 bg-white'
                      :               'border-gray-200 bg-white'}`}
                    >
                      {item.done && <span className="text-white text-xs">✓</span>}
                      {item.active && <span className="w-2.5 h-2.5 bg-pink-400 rounded-full block" />}
                    </div>
                    <div>
                      <p className={`text-[13px] font-semibold ${item.active ? 'text-pink-600' : item.done ? 'text-gray-600' : 'text-gray-400'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[11px] ${item.active ? 'text-pink-400' : 'text-gray-400'}`}>{item.sub}</p>
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
