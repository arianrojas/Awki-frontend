import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'

export default function DoctorDashboard() {
  const [vinculos, setVinculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  
  // Modales
  const [showCitaModal, setShowCitaModal] = useState(false)
  const [showVincularModal, setShowVincularModal] = useState(false)
  const [showControlModal, setShowControlModal] = useState(false)
  
  // Datos temporales de vinculación y alertas
  const [codigoGenerado, setCodigoGenerado] = useState(null)
  const [codigoIngresado, setCodigoIngresado] = useState('')
  const [pacienteSeleccionada, setPacienteSeleccionada] = useState(null)
  
  // Formulario de Control Prenatal
  const [controlForm, setControlForm] = useState({
    fechaControl: new Date().toISOString().split('T')[0],
    semanasGestacion: 20,
    pesoKg: 65,
    tallaCm: 160,
    presionArterialSistolica: 120,
    presionArterialDiastolica: 80,
    alturaUterinaCm: 18,
    frecuenciaCardiacaFetal: 140,
    presentacionFetal: 'CEFALICA',
    hemoglobinaGdl: 11.5,
    proteinuria: 'NEGATIVA',
    glucosaMgdl: 90,
    movimientosFetalesReporte: 'PRESENTES_NORMALES',
    edemas: 'AUSENTES',
    proximaCita: '',
    observacionesMedico: '',
    fiebre: '',
    contracciones: false
  })

  // Cargar datos
  const cargarDirectorio = async () => {
    setCargando(true)
    setError(null)
    try {
      // 1. Obtener vínculos activos del médico
      const listaVinculos = await api.get('/api/v1/vinculacion/mis-vinculos')
      
      // 2. Cargar detalles de embarazo para cada paciente vinculada
      const listaConDetalles = await Promise.all(
        listaVinculos.map(async (v) => {
          try {
            const emb = await api.get('/api/v1/embarazos/activo', { pacienteId: v.pacienteId })
            return {
              ...v,
              embarazo: emb,
              tieneEmbarazo: true
            }
          } catch {
            return {
              ...v,
              embarazo: null,
              tieneEmbarazo: false
            }
          }
        })
      )
      setVinculos(listaConDetalles)
    } catch (err) {
      setError(err.message ?? 'No se pudo cargar el directorio de pacientes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDirectorio()
  }, [])

  // Generar código de vinculación (Médico -> Paciente)
  const handleGenerarCodigo = async () => {
    setError(null)
    try {
      const res = await api.post('/api/v1/vinculacion/generar-codigo')
      setCodigoGenerado(res.codigo)
    } catch (err) {
      setError(err.message ?? 'Error al generar el código')
    }
  }

  // Vincular usando código dictado por paciente
  const handleVincularPaciente = async (e) => {
    e.preventDefault()
    if (!codigoIngresado.trim() || codigoIngresado.length !== 8) {
      setError('El código debe tener exactamente 8 caracteres')
      return
    }
    setError(null)
    try {
      await api.post('/api/v1/vinculacion/usar-codigo', { codigo: codigoIngresado.toUpperCase().trim() })
      setCodigoIngresado('')
      setShowVincularModal(false)
      cargarDirectorio()
    } catch (err) {
      setError(err.message ?? 'El código es inválido o expiró')
    }
  }

  // Desvincular paciente
  const handleDesvincular = async (vinculoId) => {
    if (!window.confirm('¿Estás seguro de que deseas finalizar la vinculación con esta paciente?')) return
    setError(null)
    try {
      await api.delete(`/api/v1/vinculacion/${vinculoId}`)
      cargarDirectorio()
    } catch (err) {
      setError(err.message ?? 'No se pudo finalizar la vinculación')
    }
  }

  // Registrar Control Prenatal
  const handleGuardarControl = async (e) => {
    e.preventDefault()
    if (!pacienteSeleccionada || !pacienteSeleccionada.embarazo) return
    setError(null)
    try {
      const payload = {
        embarazoId: pacienteSeleccionada.embarazo.id,
        fechaControl: controlForm.fechaControl,
        semanasGestacion: parseInt(controlForm.semanasGestacion, 10),
        pesoKg: parseFloat(controlForm.pesoKg),
        tallaCm: parseFloat(controlForm.tallaCm),
        presionArterialSistolica: parseInt(controlForm.presionArterialSistolica, 10),
        presionArterialDiastolica: parseInt(controlForm.presionArterialDiastolica, 10),
        alturaUterinaCm: controlForm.alturaUterinaCm ? parseFloat(controlForm.alturaUterinaCm) : null,
        frecuenciaCardiacaFetal: controlForm.frecuenciaCardiacaFetal ? parseInt(controlForm.frecuenciaCardiacaFetal, 10) : null,
        presentacionFetal: controlForm.presentacionFetal,
        hemoglobinaGdl: controlForm.hemoglobinaGdl ? parseFloat(controlForm.hemoglobinaGdl) : null,
        proteinuria: controlForm.proteinuria,
        glucosaMgdl: controlForm.glucosaMgdl ? parseFloat(controlForm.glucosaMgdl) : null,
        movimientosFetalesReporte: controlForm.movimientosFetalesReporte,
        edemas: controlForm.edemas,
        proximaCita: controlForm.proximaCita || null,
        observacionesMedico: controlForm.observacionesMedico || null,
        fiebre: controlForm.fiebre ? parseFloat(controlForm.fiebre) : null,
        contracciones: controlForm.contracciones
      }

      await api.post('/api/v1/controles', payload)
      alert('¡Control prenatal registrado exitosamente!')
      setShowControlModal(false)
      cargarDirectorio()
    } catch (err) {
      setError(err.message ?? 'Error al registrar el control prenatal')
    }
  }

  const handleOpenControlModal = (p) => {
    setPacienteSeleccionada(p)
    setControlForm(prev => ({
      ...prev,
      semanasGestacion: p.embarazo?.semanasGestacionActuales ?? 20,
      fechaControl: new Date().toISOString().split('T')[0]
    }))
    setShowControlModal(true)
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto flex flex-col gap-6 p-4">
      
      {/* Banner Principal */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-60" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🩺</span>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Módulo de Vinculación y Clínicas</p>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Hola, Dr. de Guardia</h1>
          <p className="text-gray-500 font-medium">
            Gestiona la vinculación de pacientes, revisa sus niveles de riesgo clínico y registra controles obstétricos en tiempo real.
          </p>
        </div>
      </div>

      {/* Acciones de Códigos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Generar Código */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 flex flex-col gap-3">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Dar código a paciente</h3>
          <p className="text-gray-400 text-xs">Genera un código de 8 dígitos para que la gestante lo ingrese en su PWA.</p>
          {codigoGenerado ? (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center mt-1">
              <span className="text-[10px] font-bold text-blue-500 uppercase">Código Generado</span>
              <span className="text-2xl font-black text-blue-700 tracking-widest select-all font-mono">{codigoGenerado}</span>
              <span className="text-[10px] text-gray-400">Válido por 48 horas.</span>
            </div>
          ) : (
            <button
              onClick={handleGenerarCodigo}
              className="w-full mt-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Generar Código Alfanumérico
            </button>
          )}
        </div>

        {/* Ingresar Código de Paciente */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 flex flex-col gap-3">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Vincular paciente por código</h3>
          <p className="text-gray-400 text-xs">Ingresa el código que la gestante generó en su aplicación móvil.</p>
          <form onSubmit={handleVincularPaciente} className="flex gap-2 mt-1">
            <input
              type="text"
              maxLength={8}
              value={codigoIngresado}
              onChange={e => setCodigoIngresado(e.target.value.toUpperCase())}
              placeholder="Código de 8 dígitos (ej: 4KR9MT2X)"
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={codigoIngresado.length !== 8}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              Vincular
            </button>
          </form>
        </div>

      </div>

      {/* Alertas y Errores */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600 flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Directorio de Pacientes */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Directorio de Pacientes Vinculadas</h2>
            <p className="text-gray-400 text-xs mt-0.5">Gestantes activamente enlazadas a tu consulta.</p>
          </div>
          <button onClick={cargarDirectorio} className="text-xs text-blue-500 font-bold hover:text-blue-700 transition-colors">
            🔄 Recargar Lista
          </button>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center py-16">
            <span className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : vinculos.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl">👥</span>
            <p className="font-bold text-gray-700 mt-3">Aún no tienes pacientes vinculadas</p>
            <p className="text-gray-400 text-xs max-w-xs mx-auto mt-1">Comparte un código de vinculación o ingresa el de una paciente para comenzar el seguimiento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-semibold text-gray-400 text-[11px] uppercase">Paciente</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[11px] uppercase">DNI</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[11px] uppercase">Edad</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[11px] uppercase">Semanas (Gestación)</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[11px] uppercase">Riesgo Semáforo</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[11px] uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vinculos.map((p) => {
                  const riesgo = p.embarazo?.nivelRiesgoActual ?? 'DESCONOCIDO'
                  const semanas = p.embarazo?.semanasGestacionActuales ?? null
                  
                  const badgeColor = 
                    riesgo === 'ROJO' ? 'bg-red-50 text-red-600 border-red-100' :
                    riesgo === 'AMARILLO' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    riesgo === 'VERDE' ? 'bg-green-50 text-green-600 border-green-100' :
                    'bg-gray-50 text-gray-400 border-gray-100'

                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {(p.pacienteNombres?.[0] ?? 'P') + (p.pacienteApellidos?.[0] ?? '')}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 text-sm block">
                              {p.pacienteNombres} {p.pacienteApellidos}
                            </span>
                            <span className="text-[10px] text-gray-400">Vinculado: {new Date(p.vinculadoAt).toLocaleDateString('es-PE')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 text-xs font-semibold">{p.pacienteDni ?? '-'}</td>
                      <td className="py-4 text-gray-600 text-xs font-semibold">{p.pacienteEdad ?? '-'} años</td>
                      <td className="py-4">
                        {p.tieneEmbarazo ? (
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[11px] font-bold">Sem. {semanas}</span>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Sin embarazo registrado</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                          {riesgo}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {p.tieneEmbarazo && (
                            <button
                              onClick={() => handleOpenControlModal(p)}
                              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition-all shadow-sm shadow-blue-100"
                            >
                              + Registrar Control
                            </button>
                          )}
                          <button
                            onClick={() => handleDesvincular(p.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all"
                          >
                            Desvincular
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro de Control Prenatal */}
      {showControlModal && pacienteSeleccionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="mb-4">
              <h2 className="font-extrabold text-xl text-gray-800">Registrar Control Obstetrico Prenatal</h2>
              <p className="text-xs text-gray-400 mt-0.5">Registrando consulta para {pacienteSeleccionada.pacienteNombres} {pacienteSeleccionada.pacienteApellidos}.</p>
            </div>
            
            <form onSubmit={handleGuardarControl} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
              
              {/* Sección General */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">FECHA CONTROL</label>
                  <input
                    type="date"
                    required
                    value={controlForm.fechaControl}
                    onChange={e => setControlForm({...controlForm, fechaControl: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">SEMANAS GESTACIÓN (4-42)</label>
                  <input
                    type="number"
                    min={4}
                    max={42}
                    required
                    value={controlForm.semanasGestacion}
                    onChange={e => setControlForm({...controlForm, semanasGestacion: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">PESO (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={30}
                    max={200}
                    required
                    value={controlForm.pesoKg}
                    onChange={e => setControlForm({...controlForm, pesoKg: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Presión y Frecuencia */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">PA SISTÓLICA (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={controlForm.presionArterialSistolica}
                    onChange={e => setControlForm({...controlForm, presionArterialSistolica: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">PA DIASTÓLICA (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={controlForm.presionArterialDiastolica}
                    onChange={e => setControlForm({...controlForm, presionArterialDiastolica: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">ALTURA UTERINA (CM)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={controlForm.alturaUterinaCm}
                    onChange={e => setControlForm({...controlForm, alturaUterinaCm: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">FC FETAL (LPM)</label>
                  <input
                    type="number"
                    value={controlForm.frecuenciaCardiacaFetal}
                    onChange={e => setControlForm({...controlForm, frecuenciaCardiacaFetal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Datos del feto y laboratorio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">PRESENTACIÓN FETAL</label>
                  <select
                    value={controlForm.presentacionFetal}
                    onChange={e => setControlForm({...controlForm, presentacionFetal: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="CEFALICA">Cefálica</option>
                    <option value="PODALICA">Podálica</option>
                    <option value="TRANSVERSA">Transversa</option>
                    <option value="NO_DETERMINADA">No Determinada</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">HEMOGLOBINA (G/DL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={controlForm.hemoglobinaGdl}
                    onChange={e => setControlForm({...controlForm, hemoglobinaGdl: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">PROTEINURIA</label>
                  <select
                    value={controlForm.proteinuria}
                    onChange={e => setControlForm({...controlForm, proteinuria: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="NEGATIVA">Negativa</option>
                    <option value="TRAZAS">Trazas</option>
                    <option value="UNA_CRUZ">1 Cruz (+)</option>
                    <option value="DOS_CRUCES">2 Cruces (++)</option>
                    <option value="TRES_CRUCES">3 Cruces (+++)</option>
                  </select>
                </div>
              </div>

              {/* Glucosa, edemas y otros */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">GLUCOSA (MG/DL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={controlForm.glucosaMgdl}
                    onChange={e => setControlForm({...controlForm, glucosaMgdl: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">MOV. FETALES</label>
                  <select
                    value={controlForm.movimientosFetalesReporte}
                    onChange={e => setControlForm({...controlForm, movimientosFetalesReporte: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="PRESENTES_NORMALES">Presentes normales</option>
                    <option value="DISMINUIDOS">Disminuidos</option>
                    <option value="AUSENTES">Ausentes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">EDEMAS</label>
                  <select
                    value={controlForm.edemas}
                    onChange={e => setControlForm({...controlForm, edemas: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="AUSENTES">Ausentes</option>
                    <option value="MANOS">Manos</option>
                    <option value="PIES">Pies</option>
                    <option value="CARA">Cara</option>
                    <option value="GENERALIZADO">Generalizado</option>
                  </select>
                </div>
              </div>

              {/* Próxima cita e info adicional */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">PRÓXIMA CITA (RECORDATORIO)</label>
                  <input
                    type="date"
                    value={controlForm.proximaCita}
                    onChange={e => setControlForm({...controlForm, proximaCita: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">FIEBRE (Tº CELSIUS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={controlForm.fiebre}
                    onChange={e => setControlForm({...controlForm, fiebre: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex items-center mt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={controlForm.contracciones}
                      onChange={e => setControlForm({...controlForm, contracciones: e.target.checked})}
                      className="h-5 w-5 border-gray-200 text-blue-600 focus:ring-blue-100 rounded"
                    />
                    <span className="text-xs font-bold text-gray-500 uppercase">¿Presenta Contracciones?</span>
                  </label>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">OBSERVACIONES MÉDICAS (INTERNAS)</label>
                <textarea
                  rows={2}
                  value={controlForm.observacionesMedico}
                  onChange={e => setControlForm({...controlForm, observacionesMedico: e.target.value})}
                  placeholder="Añadir notas de seguimiento..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowControlModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Guardar Control Prenatal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
