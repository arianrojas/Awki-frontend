import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, Heart, Scale, Bell, AlertTriangle } from 'lucide-react'

export default function AccionesRapidas({ onActionComplete }) {
  const [modalAbierto, setModalAbierto] = useState(null)

  // Estados para Registrar Peso
  const [pesoVal, setPesoVal] = useState('')
  const [pesoFecha, setPesoFecha] = useState(new Date().toISOString().split('T')[0])

  // Estados para Agendar Cita
  const [citaTipo, setCitaTipo] = useState('Control Prenatal')
  const [citaEspecialista, setCitaEspecialista] = useState('Dr. Mendoza (Obstetra)')
  const [citaFecha, setCitaFecha] = useState('')
  const [citaHora, setCitaHora] = useState('')
  const [citaMotivo, setCitaMotivo] = useState('')

  // Estados para Registrar Control / Síntomas
  const [sintomaMovimientos, setSintomaMovimientos] = useState('Normales, como siempre')
  const [sintomaHinchazon, setSintomaHinchazon] = useState('No, ninguna')
  const [sintomaDetalles, setSintomaDetalles] = useState('')
  const [sintomaAlarmaCritico, setSintomaAlarmaCritico] = useState(false)

  // Estados para Recordatorios
  const [recTitulo, setRecTitulo] = useState('')
  const [recFecha, setRecFecha] = useState('')
  const [recHora, setRecHora] = useState('')

  // Mensajes de Alerta/Feedback
  const [feedbackError, setFeedbackError] = useState(null)

  const checkSintomaAlarma = (texto) => {
    const terminosAlarma = ['sangrado', 'sangre', 'hemorragia', 'liquido', 'líquido', 'fiebre', 'dolor fuerte', 'contraccion', 'contracción', 'no siento', 'sin movimientos', 'vision borrosa', 'visión borrosa', 'zumbido']
    const textLower = (texto || '').toLowerCase()
    const esCritico = terminosAlarma.some(term => textLower.includes(term))
    setSintomaAlarmaCritico(esCritico)
  }

  const handleGuardarPeso = (e) => {
    e.preventDefault()
    if (!pesoVal) return

    const listaPesos = JSON.parse(localStorage.getItem('awki_auto_pesos') || '[]')
    const nuevoRegistro = {
      id: `peso-${Date.now()}`,
      pesoKg: parseFloat(pesoVal),
      fechaControl: pesoFecha,
      semanasGestacion: 0, // Se calculará dinámicamente si es posible
      tipo: 'AUTO'
    }

    listaPesos.push(nuevoRegistro)
    localStorage.setItem('awki_auto_pesos', JSON.stringify(listaPesos))

    // Resetear formulario
    setPesoVal('')
    setModalAbierto(null)

    if (onActionComplete) onActionComplete('peso')
  }

  const handleGuardarCita = (e) => {
    e.preventDefault()
    if (!citaFecha || !citaHora) return

    const listaCitas = JSON.parse(localStorage.getItem('awki_citas_agendadas') || '[]')
    const nuevaCita = {
      id: `cita-${Date.now()}`,
      tipo: citaTipo,
      especialista: citaEspecialista,
      fecha: citaFecha,
      hora: citaHora,
      motivo: citaMotivo,
      completado: false
    }

    listaCitas.push(nuevaCita)
    localStorage.setItem('awki_citas_agendadas', JSON.stringify(listaCitas))

    // Resetear formulario
    setCitaTipo('Control Prenatal')
    setCitaEspecialista('Dr. Mendoza (Obstetra)')
    setCitaFecha('')
    setCitaHora('')
    setCitaMotivo('')
    setModalAbierto(null)

    if (onActionComplete) onActionComplete('cita')
  }

  const handleGuardarControl = (e) => {
    e.preventDefault()

    // Determinar si hay síntomas críticos
    const tieneSintomasCriticos = sintomaAlarmaCritico || 
      sintomaMovimientos === 'No los he sentido' ||
      sintomaHinchazon === 'Sí, en la cara' ||
      sintomaHinchazon === 'Sí, en varias partes del cuerpo'

    const listaControles = JSON.parse(localStorage.getItem('awki_diario_sintomas') || '[]')
    const nuevoReporte = {
      id: `sintoma-${Date.now()}`,
      movimientos: sintomaMovimientos,
      hinchazon: sintomaHinchazon,
      detalles: sintomaDetalles,
      esCritico: tieneSintomasCriticos,
      fecha: new Date().toISOString()
    }

    listaControles.push(nuevoReporte)
    localStorage.setItem('awki_diario_sintomas', JSON.stringify(listaControles))

    if (tieneSintomasCriticos) {
      alert("ALERTA DE RIESGO: Has reportado síntomas que podrían ser signos de alarma obstétrica. Por favor, pulsa el botón rojo SOS para contactar de inmediato a tu contacto de emergencia.")
    }

    // Resetear formulario
    setSintomaMovimientos('Normales, como siempre')
    setSintomaHinchazon('No, ninguna')
    setSintomaDetalles('')
    setSintomaAlarmaCritico(false)
    setModalAbierto(null)

    if (onActionComplete) onActionComplete('control')
  }

  const handleGuardarRecordatorio = (e) => {
    e.preventDefault()
    if (!recTitulo || !recFecha || !recHora) return

    const listaRecordatorios = JSON.parse(localStorage.getItem('awki_recordatorios') || '[]')
    const nuevoRecordatorio = {
      id: `rec-${Date.now()}`,
      titulo: recTitulo,
      fecha: recFecha,
      hora: recHora,
      completado: false
    }

    listaRecordatorios.push(nuevoRecordatorio)
    localStorage.setItem('awki_recordatorios', JSON.stringify(listaRecordatorios))

    // Resetear formulario
    setRecTitulo('')
    setRecFecha('')
    setRecHora('')
    setModalAbierto(null)

    if (onActionComplete) onActionComplete('recordatorio')
  }

  // Clases reutilizables para inputs y selects en modales (evitan zoom en iOS)
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-pink-100 mt-1 bg-gray-50 text-gray-700 font-medium"
  const inputStyle = { fontSize: '16px', minHeight: '48px' }

  return (
    <>
      {createPortal(
        <>
          {/* MODAL: Agendar Cita */}
          {modalAbierto === 'cita' && (
            <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
              <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-xl border border-pink-100 max-h-[90vh] overflow-y-auto">
                <h2 className="font-bold text-lg text-gray-800 mb-1 flex items-center gap-2"><Calendar className="w-5 h-5 text-pink-500" /> Agendar Cita Obstétrica</h2>
                <p className="text-sm text-gray-400 mb-4">Elige cuándo te gustaría agendar tu próxima consulta médica.</p>
                
                <form onSubmit={handleGuardarCita} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Tipo de Cita</label>
                    <select
                      value={citaTipo}
                      onChange={e => setCitaTipo(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option>Control Prenatal</option>
                      <option>Ecografía</option>
                      <option>Nutrición</option>
                      <option>Psicología Perinatal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Médico o Especialista</label>
                    <select
                      value={citaEspecialista}
                      onChange={e => setCitaEspecialista(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option>Cualquier especialista disponible</option>
                      <option>Dr. Mendoza (Obstetra)</option>
                      <option>Dra. Rojas (Ginecóloga)</option>
                      <option>Lic. Torres (Nutricionista)</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Fecha</label>
                      <input
                        type="date"
                        required
                        value={citaFecha}
                        onChange={e => setCitaFecha(e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Hora</label>
                      <input
                        type="time"
                        required
                        value={citaHora}
                        onChange={e => setCitaHora(e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Motivo o Síntomas</label>
                    <textarea
                      rows={2}
                      value={citaMotivo}
                      onChange={e => setCitaMotivo(e.target.value)}
                      placeholder="Ej: control mensual, dolores ligeros..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-100 mt-1"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalAbierto(null)}
                      className="flex-1 py-4 rounded-xl border text-base font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-base font-bold shadow-md transition-colors"
                    >
                      Agendar Cita
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: Registrar Control (Diario de Síntomas) */}
          {modalAbierto === 'control' && (
            <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
              <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-xl border border-pink-100 max-h-[90vh] overflow-y-auto">
                <h2 className="font-bold text-lg text-gray-800 mb-1 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-500" /> Registro de Bienestar Diario</h2>
                <p className="text-sm text-gray-400 mb-4">Anota tus síntomas diarios para el seguimiento clínico de tu embarazo.</p>
                
                <form onSubmit={handleGuardarControl} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">¿Cómo sientes los movimientos del bebé?</label>
                    <select
                      value={sintomaMovimientos}
                      onChange={e => setSintomaMovimientos(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option>Normales, como siempre</option>
                      <option>Los siento menos que antes</option>
                      <option>No los he sentido</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">¿Tienes hinchazón (Edemas)?</label>
                    <select
                      value={sintomaHinchazon}
                      onChange={e => setSintomaHinchazon(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option>No, ninguna</option>
                      <option>Sí, en los pies</option>
                      <option>Sí, en las manos</option>
                      <option>Sí, en la cara</option>
                      <option>Sí, en varias partes del cuerpo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Describe otros síntomas</label>
                    <textarea
                      rows={2}
                      value={sintomaDetalles}
                      onChange={e => {
                        setSintomaDetalles(e.target.value)
                        checkSintomaAlarma(e.target.value)
                      }}
                      placeholder="Ej: dolor de cabeza leve, náuseas, calambres..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-100 mt-1"
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  {sintomaAlarmaCritico && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs leading-relaxed font-semibold flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> ¡Alerta! El síntoma escrito coincide con un signo de alarma obstétrica. Si el dolor es severo, sangras o pierdes líquido, usa el botón rojo SOS de emergencia.
                    </div>
                  )}

                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalAbierto(null)}
                      className="flex-1 py-4 rounded-xl border text-base font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-md"
                    >
                      Guardar Reporte
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: Registrar Peso */}
          {modalAbierto === 'peso' && (
            <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
              <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-xl border border-pink-100 max-h-[90vh] overflow-y-auto">
                <h2 className="font-bold text-lg text-gray-800 mb-1 flex items-center gap-2"><Scale className="w-5 h-5 text-green-500" /> Registrar Peso Corporal</h2>
                <p className="text-sm text-gray-400 mb-4">Lleva el seguimiento diario de tu peso para auditar la curva de evolución.</p>
                
                <form onSubmit={handleGuardarPeso} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Tu Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="200"
                      required
                      placeholder="Ej: 64.5"
                      value={pesoVal}
                      onChange={e => setPesoVal(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Fecha de Registro</label>
                    <input
                      type="date"
                      required
                      value={pesoFecha}
                      onChange={e => setPesoFecha(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalAbierto(null)}
                      className="flex-1 py-4 rounded-xl border text-base font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-base font-bold shadow-md"
                    >
                      Guardar Peso
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: Recordatorios */}
          {modalAbierto === 'recordatorio' && (
            <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
              <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-xl border border-pink-100 max-h-[90vh] overflow-y-auto">
                <h2 className="font-bold text-lg text-gray-800 mb-1 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" /> Crear Nuevo Recordatorio</h2>
                <p className="text-sm text-gray-400 mb-4">Crea una alarma para tus vitaminas, medicamentos o actividades clínicas.</p>
                
                <form onSubmit={handleGuardarRecordatorio} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Título del Recordatorio</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Tomar Ácido Fólico, control médico..."
                      value={recTitulo}
                      onChange={e => setRecTitulo(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Fecha</label>
                      <input
                        type="date"
                        required
                        value={recFecha}
                        onChange={e => setRecFecha(e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Hora</label>
                      <input
                        type="time"
                        required
                        value={recHora}
                        onChange={e => setRecHora(e.target.value)}
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setModalAbierto(null)}
                      className="flex-1 py-4 rounded-xl border text-base font-semibold text-gray-500 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-base font-bold shadow-md"
                    >
                      Guardar Alarma
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>,
        document.body
      )}

      {/* Quick Actions Grid — 2x2 en móvil, 4 cols en desktop */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { id: 'cita', icon: <img src='/calendario.png' alt='logo_calendario' className="w-8 h-8" />, label: 'Agendar cita', sub: 'Reservar nueva cita', color: 'bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-200' },
          { id: 'control', icon: <img src='/control.png' alt='logo_control' className="w-8 h-8" />, label: 'Registrar control', sub: 'Añadir nuevo control', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200' },
          { id: 'peso', icon: <img src='/peso.png' alt='logo_peso' className="w-8 h-8" />, label: 'Registrar peso', sub: 'Llevar seguimiento', color: 'bg-green-50 text-green-600 border-green-100 hover:border-green-200' },
          { id: 'recordatorio', icon: <img src='/notificacion.png' alt='logo_notificacion' className="w-8 h-8" />, label: 'Recordatorios', sub: 'Nueva alarma/vitamina', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200' },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => setModalAbierto(a.id)}
            className={`flex flex-col items-start p-4 rounded-2xl border ${a.color} hover:scale-[1.03] transition-all duration-200 shadow-sm text-left min-h-[90px]`}
          >
            <span className="mb-2">{a.icon}</span>
            <p className="font-bold text-sm leading-tight">{a.label}</p>
            <p className="text-xs opacity-70 mt-0.5">{a.sub}</p>
          </button>
        ))}
      </div>
    </>
  )
}
