import React, { useState, useEffect } from 'react'
import AccionesRapidas from './AccionesRapidas'
import SeccionArticulos from './SeccionArticulos'
import { api } from '../../services/api'

// ─── Dynamic Line Chart ───────────────────────────────────────────────────────────
function MiniLineChart({ weights, weeks }) {
  const W = 320, H = 120
  
  if (!weights || weights.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center text-xs text-gray-400 italic text-center p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
        Registra tu primer control obstétrico con tu médico para visualizar la evolución del peso.
      </div>
    )
  }

  const minV = Math.min(...weights) - 2
  const maxV = Math.max(...weights) + 2
  const valDiff = maxV === minV ? 1 : (maxV - minV)

  const pts = weights.map((v, i) => {
    const x = 30 + (i / (weights.length - 1 || 1)) * (W - 50)
    const y = H - 10 - ((v - minV) / valDiff) * (H - 25)
    return { x, y, v }
  })
  
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${pts[0].x},${H - 10} ${polyline} ${pts[pts.length - 1].x},${H - 10}`

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Guías horizontales */}
      {[0, 1, 2, 3].map((i) => {
        const v = Math.round(minV + (i / 3) * valDiff)
        const y = H - 10 - ((v - minV) / valDiff) * (H - 25)
        return (
          <g key={i}>
            <line x1="30" y1={y} x2={W - 20} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x="24" y={y + 4} fontSize="9" fill="#9ca3af" textAnchor="end">{v}</text>
          </g>
        )
      })}
      <polygon points={area} fill="rgba(236,72,153,0.08)" />
      <polyline points={polyline} fill="none" stroke="#e91e8c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#e91e8c" strokeWidth="2.5" />
      ))}
      {weeks.map((w, i) => {
        const x = 30 + (i / (weeks.length - 1 || 1)) * (W - 50)
        return (
          <text key={i} x={x} y={H + 2} fontSize="8.5" fill="#9ca3af" textAnchor="middle">{w}</text>
        )
      })}
    </svg>
  )
}

// ─── Pregnancy Registration Form ──────────────────────────────────────────────
function FormRegistroEmbarazo({ currentUser, onCreated }) {
  const [fum, setFum] = useState('')
  const [gestaciones, setGestaciones] = useState('1')
  const [partos, setPartos] = useState('0')
  const [abortos, setAbortos] = useState('0')
  const [cesareas, setCesareas] = useState('0')
  const [esMultiple, setEsMultiple] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fum) return
    setLoading(true)
    setError(null)

    try {
      const res = await api.post('/api/v1/embarazos', {
        pacienteId: currentUser.userId,
        fechaUltimaMenstruacion: fum,
        numeroGestacion: parseInt(gestaciones, 10),
        numeroPartos: parseInt(partos, 10),
        numeroAbortos: parseInt(abortos, 10),
        numeroCesareas: parseInt(cesareas, 10),
        embarazoMultiple: esMultiple,
      })
      onCreated(res)
    } catch (err) {
      setError(err.message ?? 'Error al registrar el embarazo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-pink-100 p-8 shadow-sm animate-fade-in">
      <div className="text-center mb-6">
        <span className="text-4xl">🤰</span>
        <h2 className="text-2xl font-bold text-gray-800 mt-2">Registra tu embarazo</h2>
        <p className="text-gray-400 text-sm mt-1">
          Completa los datos para iniciar el asistente prenatal inteligente y realizar tu seguimiento médico.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Fecha de Última Menstruación (FUM) *
          </label>
          <input
            type="date"
            required
            value={fum}
            onChange={e => setFum(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 focus:bg-white transition-all disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Gestaciones totales (incluyendo esta) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={gestaciones}
              onChange={e => setGestaciones(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Partos previos
            </label>
            <input
              type="number"
              min="0"
              value={partos}
              onChange={e => setPartos(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Abortos previos
            </label>
            <input
              type="number"
              min="0"
              value={abortos}
              onChange={e => setAbortos(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Cesáreas previas
            </label>
            <input
              type="number"
              min="0"
              value={cesareas}
              onChange={e => setCesareas(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer mt-1">
          <div
            onClick={() => !loading && setEsMultiple(!esMultiple)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
              esMultiple ? 'bg-pink-500 border-pink-500' : 'border-gray-300 bg-white'
            }`}
          >
            {esMultiple && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <span className="text-xs text-gray-500 leading-relaxed">
            Tengo un diagnóstico de <span className="font-semibold text-pink-500">embarazo múltiple</span> (gemelos, mellizos, etc.)
          </span>
        </label>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <span className="text-red-500">⚠</span>
            <p className="text-red-600 text-sm flex-1">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !fum}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-200 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md hover:shadow-pink-200 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? 'Registrando...' : 'Registrar Embarazo →'}
        </button>
      </form>
    </div>
  )
}

// ─── Main View ─────────────────────────────────────────────────────────────────
export default function VistaInicio({ currentUser, onPregnancyCreated }) {
  const [controles, setControles] = useState([])
  const [cargando, setCargando] = useState(false)
  const [autoPesos, setAutoPesos] = useState([])
  const [proximaCitaLocal, setProximaCitaLocal] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const embarazoId = currentUser?.embarazoId ?? null

  const handleActionComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Cargar controles obstétricos reales y datos locales
  useEffect(() => {
    if (!embarazoId) return
    setCargando(true)
    
    // 1. Obtener controles oficiales del backend
    api.get('/api/v1/controles', { embarazo_id: embarazoId })
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.content ?? [])
        const sorted = [...list].sort((a, b) => a.numeroControl - b.numeroControl)
        setControles(sorted)
      })
      .catch(err => console.error("Error al obtener controles prenatales:", err))
      .finally(() => setCargando(false))

    // 2. Obtener pesos auto-registrados de LocalStorage
    const localPesos = JSON.parse(localStorage.getItem('awki_auto_pesos') || '[]')
    setAutoPesos(localPesos)

    // 3. Obtener citas agendadas locales
    const localCitas = JSON.parse(localStorage.getItem('awki_citas_agendadas') || '[]')
    const hoyStr = new Date().toISOString().split('T')[0]
    const futuras = localCitas
      .filter(c => !c.completado && c.fecha >= hoyStr)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    setProximaCitaLocal(futuras[0] ?? null)

  }, [embarazoId, refreshTrigger])

  // Si el paciente no tiene un embarazo activo, mostrar el formulario de registro
  if (!embarazoId) {
    return (
      <div className="py-8">
        <FormRegistroEmbarazo currentUser={currentUser} onCreated={onPregnancyCreated} />
      </div>
    )
  }

  const semanas = currentUser.semanasGestacion ?? 0
  const fpp = currentUser.fechaProbableParto
    ? new Date(currentUser.fechaProbableParto + 'T00:00:00').toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'No registrada'

  const progressPercent = Math.min(Math.max(Math.round((semanas / 40) * 100), 0), 100)

  const trimestreText =
    currentUser.trimestre === 1
      ? 'Primer Trimestre'
      : currentUser.trimestre === 2
      ? 'Segundo Trimestre'
      : 'Tercer Trimestre'

  const fruitSize =
    semanas < 8
      ? 'una semilla de frambuesa'
      : semanas < 13
      ? 'un limón'
      : semanas < 20
      ? 'un aguacate (palta)'
      : semanas < 28
      ? 'una papaya pequeña'
      : 'una sandía mediana'

  // Procesar controles para la UI
  const ultimoControl = controles[controles.length - 1] ?? null
  
  // Obtener último peso (puede ser oficial o auto-registrado)
  const ultimoAutoPeso = autoPesos[autoPesos.length - 1] ?? null
  let pesoActual = 'No registrado'
  if (ultimoControl && ultimoAutoPeso) {
    pesoActual = ultimoControl.fechaControl >= ultimoAutoPeso.fechaControl
      ? `${ultimoControl.pesoKg} kg`
      : `${ultimoAutoPeso.pesoKg} kg`
  } else if (ultimoControl) {
    pesoActual = `${ultimoControl.pesoKg} kg`
  } else if (ultimoAutoPeso) {
    pesoActual = `${ultimoAutoPeso.pesoKg} kg`
  }

  const presionActual = ultimoControl ? `${ultimoControl.presionArterial} mmHg` : 'No registrada'
  const hemoglobinaActual = ultimoControl ? `${ultimoControl.hemoglobinaGdl} g/dL` : 'No registrada'

  // Combinar y ordenar evolución del peso
  const todosLosPesos = []
  
  // Agregar controles oficiales
  controles.forEach(c => {
    todosLosPesos.push({
      pesoKg: c.pesoKg,
      fecha: c.fechaControl,
      label: `Sem. ${c.semanasGestacion}`
    })
  })

  // Agregar auto-registros estimando semanas gestacionales
  autoPesos.forEach(p => {
    const diffDias = Math.round((new Date(p.fechaControl) - new Date()) / (24 * 60 * 60 * 1000))
    const semEstimadas = Math.max(1, semanas + Math.round(diffDias / 7))
    todosLosPesos.push({
      pesoKg: p.pesoKg,
      fecha: p.fechaControl,
      label: `Sem. ${semEstimadas}`
    })
  })

  // Ordenar cronológicamente por fecha
  todosLosPesos.sort((a, b) => a.fecha.localeCompare(b.fecha))

  const pesosList = todosLosPesos.map(x => x.pesoKg)
  const semanasList = todosLosPesos.map(x => x.label)

  // Consolidar Próxima Cita (Oficial vs Local)
  let proximaCitaAVisualizar = null
  let esCitaLocal = false

  const citaOficial = ultimoControl?.proximaCita ?? null
  const citaLocal = proximaCitaLocal?.fecha ?? null

  if (citaOficial && citaLocal) {
    if (citaOficial <= citaLocal) {
      proximaCitaAVisualizar = { fecha: citaOficial, tipo: 'Control Prenatal', especialista: 'Médico Obstetra' }
    } else {
      proximaCitaAVisualizar = { fecha: citaLocal, tipo: proximaCitaLocal.tipo, especialista: proximaCitaLocal.especialista }
      esCitaLocal = true
    }
  } else if (citaOficial) {
    proximaCitaAVisualizar = { fecha: citaOficial, tipo: 'Control Prenatal', especialista: 'Médico Obstetra' }
  } else if (citaLocal) {
    proximaCitaAVisualizar = { fecha: citaLocal, tipo: proximaCitaLocal.tipo, especialista: proximaCitaLocal.especialista }
    esCitaLocal = true
  }

  // Generar checklist dinámico de controles obstétricos
  const checklist = [
    { label: 'Primer control (Sem. 8)', targetSemana: 8 },
    { label: 'Segundo control (Sem. 12)', targetSemana: 12 },
    { label: 'Tercer control (Sem. 16)', targetSemana: 16 },
    { label: 'Cuarto control (Sem. 22)', targetSemana: 22 },
    { label: 'Quinto control (Sem. 28)', targetSemana: 28 },
    { label: 'Sexto control (Sem. 35)', targetSemana: 35 },
  ].map(item => {
    // Buscar si ya se realizó un control cercano (rango +/- 2 semanas)
    const realizado = controles.find(c => Math.abs(c.semanasGestacion - item.targetSemana) <= 2)
    const active = !realizado && (semanas >= item.targetSemana - 2 && semanas <= item.targetSemana + 2)
    
    return {
      label: item.label,
      sub: realizado 
        ? `Completado el ${new Date(realizado.fechaControl).toLocaleDateString('es-PE')}` 
        : active 
          ? 'Próxima cita recomendada' 
          : 'Pendiente',
      done: !!realizado,
      active
    }
  })

  return (
    <>
      <div className="animate-fade-in">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ── LEFT + CENTER (2 cols) ── */}
          <div className="xl:col-span-2 flex flex-col gap-5">

            {/* Tarjeta de semanas gestacionales */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 relative overflow-hidden">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium mb-1">Semana actual</p>
                  <h2 className="text-4xl font-extrabold text-gray-800 leading-none">{semanas} semanas</h2>
                  <p className="text-pink-500 font-semibold text-sm mt-1">({trimestreText})</p>
                  <p className="text-gray-500 text-sm mt-2 max-w-[200px]">Tu bebé es del tamaño de {fruitSize}.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex items-center justify-center text-5xl">
                    <span className="text-6xl animate-pulse">🤰</span>
                  </div>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-400 text-xs font-medium">Progreso del embarazo</p>
                  <p className="text-gray-400 text-xs">FPP: {fpp} 📅</p>
                </div>
                <div className="bg-pink-50 rounded-full h-2 overflow-hidden">
                  <div className="progress-pregnancy" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-pink-600 font-bold text-sm mt-1.5">{progressPercent}%</p>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <AccionesRapidas onActionComplete={handleActionComplete} />

            {/* Resumen de Salud e Historial */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Métricas Clínicas */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
                <h3 className="font-bold text-gray-700 text-[15px] mb-4">Resumen de salud (Último Control)</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: '⚖️', label: 'Peso registrado', value: pesoActual, color: 'text-pink-500' },
                    { icon: '💉', label: 'Presión arterial', value: presionActual, color: 'text-orange-500' },
                    { icon: '🩸', label: 'Hemoglobina', value: hemoglobinaActual, color: 'text-red-500' },
                    { icon: '📋', label: 'Semáforo de riesgo', value: ultimoControl?.nivelRiesgoCalculado ?? 'Verde', color: ultimoControl?.nivelRiesgoCalculado === 'ROJO' ? 'text-red-600' : ultimoControl?.nivelRiesgoCalculado === 'AMARILLO' ? 'text-amber-500' : 'text-green-500' },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span>{m.icon}</span>
                        <span className="text-gray-500 text-xs">{m.label}</span>
                      </div>
                      <span className={`font-bold text-xs ${m.color}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfico del Peso */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
                <h3 className="font-bold text-gray-700 text-[15px] mb-3">Evolución del peso (kg)</h3>
                <div className="mt-2">
                  <MiniLineChart weights={pesosList} weeks={semanasList} />
                </div>
              </div>
            </div>

            {/* Sección Artículos */}
            <SeccionArticulos />
          </div>

          {/* ── COLUMNA DERECHA ── */}
          <div className="flex flex-col gap-5">
            
            {/* Próximo control */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-700 text-[15px]">Próximo control</h3>
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg">
                  📅
                </div>
              </div>
              <p className="text-pink-600 font-semibold text-sm mb-3">
                {proximaCitaAVisualizar ? proximaCitaAVisualizar.tipo : 'Control prenatal programado'}
              </p>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium">Fecha:</span>
                  <span className="text-gray-800 text-xs font-bold">
                    {proximaCitaAVisualizar 
                      ? new Date(proximaCitaAVisualizar.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'No programada'}
                  </span>
                </div>
                {proximaCitaAVisualizar?.especialista && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">Especialista:</span>
                    <span className="text-gray-800 text-xs font-semibold">{proximaCitaAVisualizar.especialista}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium">Estado:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${proximaCitaAVisualizar ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400'}`}>
                    {proximaCitaAVisualizar ? (esCitaLocal ? 'Confirmada (Local)' : 'Programada (Médico)') : 'Sin fecha'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist Prenatal */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex-1">
              <h3 className="font-bold text-gray-700 text-[15px] mb-4">Checklist de controles prenatales</h3>
              
              {cargando ? (
                <div className="flex justify-center items-center py-10">
                  <span className="w-5 h-5 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {checklist.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                        ${item.active ? 'border-pink-200 bg-pink-50' : 'border-gray-50 hover:border-gray-100'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${item.done ? 'bg-green-500 border-green-500'
                            : item.active ? 'border-pink-400 bg-white'
                              : 'border-gray-200 bg-white'}`}
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
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
