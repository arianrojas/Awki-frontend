import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'

export default function VistaControlesCitas() {
  const [controles, setControles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [citasLocales, setCitasLocales] = useState([])

  // Estado del Formulario Local
  const [showForm, setShowForm] = useState(false)
  const [citaTipo, setCitaTipo] = useState('Control Prenatal')
  const [citaEspecialista, setCitaEspecialista] = useState('Dr. Mendoza (Obstetra)')
  const [citaFecha, setCitaFecha] = useState('')
  const [citaHora, setCitaHora] = useState('')
  const [citaMotivo, setCitaMotivo] = useState('')

  const user = JSON.parse(localStorage.getItem('awki_user') || 'null')
  const embarazoId = user?.embarazoId ?? null
  const semanas = user?.semanasGestacion ?? 0

  const cargarDatos = useCallback(async () => {
    if (!embarazoId) {
      setCargando(false)
      return
    }
    setCargando(true)
    try {
      // 1. Cargar del servidor
      const data = await api.get('/api/v1/controles', { embarazo_id: embarazoId })
      const list = Array.isArray(data) ? data : (data?.content ?? [])
      setControles([...list].sort((a, b) => a.numeroControl - b.numeroControl))
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }

    // 2. Cargar de LocalStorage
    const localCitas = JSON.parse(localStorage.getItem('awki_citas_agendadas') || '[]')
    setCitasLocales(localCitas)
  }, [embarazoId])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const handleCrearCita = (e) => {
    e.preventDefault()
    if (!citaFecha || !citaHora) return

    const lista = JSON.parse(localStorage.getItem('awki_citas_agendadas') || '[]')
    const nueva = {
      id: `cita-${Date.now()}`,
      tipo: citaTipo,
      especialista: citaEspecialista,
      fecha: citaFecha,
      hora: citaHora,
      motivo: citaMotivo,
      completado: false
    }

    lista.push(nueva)
    localStorage.setItem('awki_citas_agendadas', JSON.stringify(lista))

    // Resetear formulario
    setCitaTipo('Control Prenatal')
    setCitaEspecialista('Dr. Mendoza (Obstetra)')
    setCitaFecha('')
    setCitaHora('')
    setCitaMotivo('')
    setShowForm(false)

    cargarDatos()
  }

  const handleCompletarCita = (id) => {
    const actualizadas = citasLocales.map(c => c.id === id ? { ...c, completado: true } : c)
    localStorage.setItem('awki_citas_agendadas', JSON.stringify(actualizadas))
    cargarDatos()
  }

  const handleEliminarCita = (id) => {
    const filtradas = citasLocales.filter(c => c.id !== id)
    localStorage.setItem('awki_citas_agendadas', JSON.stringify(filtradas))
    cargarDatos()
  }

  // Generar checklist dinámico cruzando datos
  const CONTROLES_FICHA = [
    { label: 'Primer control (Sem. 8)', targetSemana: 8, desc: 'Confirmación y datación ecográfica inicial.' },
    { label: 'Segundo control (Sem. 12)', targetSemana: 12, desc: 'Ecografía genética y descarte de anomalías.' },
    { label: 'Tercer control (Sem. 16)', targetSemana: 16, desc: 'Control de latidos y descarte de anemia materna.' },
    { label: 'Cuarto control (Sem. 22)', targetSemana: 22, desc: 'Ecografía morfológica y chequeo de presión.' },
    { label: 'Quinto control (Sem. 28)', targetSemana: 28, desc: 'Chequeo de niveles de azúcar y vacunas básicas.' },
    { label: 'Sexto control (Sem. 35)', targetSemana: 35, desc: 'Plan de parto y monitoreo de contracciones.' },
  ].map(item => {
    const realizado = controles.find(c => Math.abs(c.semanasGestacion - item.targetSemana) <= 2)
    const active = !realizado && (semanas >= item.targetSemana - 2 && semanas <= item.targetSemana + 2)
    return {
      ...item,
      realizado: !!realizado,
      fechaRealizado: realizado ? realizado.fechaControl : null,
      active
    }
  })

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-800">📅 Agenda de Citas y Controles</h2>
          <p className="text-gray-400 text-sm">Gestiona tus consultas médicas programadas y monitorea el cumplimiento de tus controles obstétricos obligatorios.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex-shrink-0"
        >
          {showForm ? '✕ Cerrar Agenda' : '＋ Programar Cita'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Panel Izquierdo: Checklist oficial */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-800 text-base">Checklist Clínico Obligatorio</h3>
          
          {cargando ? (
            <div className="flex justify-center items-center py-20">
              <span className="w-8 h-8 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CONTROLES_FICHA.map((item) => (
                <div
                  key={item.label}
                  className={`p-4 border rounded-2xl flex flex-col gap-1.5 transition-all
                    ${item.realizado ? 'border-green-200 bg-green-50/20' : item.active ? 'border-pink-200 bg-pink-50/20' : 'border-gray-100'}
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.realizado ? 'bg-green-100 text-green-700' : item.active ? 'bg-pink-100 text-pink-700 animate-pulse' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.realizado ? '✓ Completado' : item.active ? 'Próximo control' : 'Pendiente'}
                    </span>
                    {item.fechaRealizado && (
                      <span className="text-[10px] text-gray-400 font-bold">
                        {new Date(item.fechaRealizado).toLocaleDateString('es-PE')}
                      </span>
                    )}
                  </div>
                  <h4 className={`font-bold text-sm ${item.realizado ? 'text-green-800' : 'text-gray-700'}`}>{item.label}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel Derecho: Formulario y Citas Locales */}
        <div className="flex flex-col gap-5">
          {/* Formulario */}
          {showForm && (
            <div className="bg-white rounded-3xl p-5 border border-pink-100/50 shadow-sm flex flex-col gap-4 animate-fade-in">
              <h4 className="font-bold text-gray-700 text-sm">📅 Nueva Cita</h4>
              <form onSubmit={handleCrearCita} className="flex flex-col gap-3">
                <select
                  value={citaTipo}
                  onChange={e => setCitaTipo(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium text-gray-700"
                >
                  <option>Control Prenatal</option>
                  <option>Ecografía</option>
                  <option>Nutrición</option>
                  <option>Psicología Perinatal</option>
                </select>
                <select
                  value={citaEspecialista}
                  onChange={e => setCitaEspecialista(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-pink-300 font-medium text-gray-700"
                >
                  <option>Dr. Mendoza (Obstetra)</option>
                  <option>Dra. Rojas (Ginecóloga)</option>
                  <option>Lic. Torres (Nutricionista)</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={citaFecha}
                    onChange={e => setCitaFecha(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                  <input
                    type="time"
                    required
                    value={citaHora}
                    onChange={e => setCitaHora(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  value={citaMotivo}
                  onChange={e => setCitaMotivo(e.target.value)}
                  placeholder="Motivo de consulta..."
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none"
                />
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                  Agendar
                </button>
              </form>
            </div>
          )}

          {/* Listado de Citas Agendadas */}
          <div className="bg-white rounded-3xl p-5 border border-pink-100/50 shadow-sm flex-1 flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 text-sm">Mis Citas Agendadas</h3>
            
            {citasLocales.length === 0 ? (
              <div className="text-center py-10 flex flex-col gap-1 items-center justify-center">
                <span className="text-2xl">📅</span>
                <p className="text-gray-400 text-xs">No tienes citas agendadas aún.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                {citasLocales.map((c) => (
                  <div key={c.id} className={`p-3 border border-gray-100 rounded-2xl flex flex-col gap-1.5 transition-opacity ${c.completado ? 'opacity-50 bg-gray-50' : 'bg-white'}`}>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-bold text-gray-800">{c.tipo}</span>
                      <div className="flex gap-1">
                        {!c.completado && (
                          <button
                            onClick={() => handleCompletarCita(c.id)}
                            title="Marcar completada"
                            className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded font-bold"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminarCita(c.id)}
                          title="Eliminar"
                          className="text-[10px] bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">Con {c.especialista}</p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-1.5 mt-0.5">
                      <span>📅 {new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                      <span>⏰ {c.hora}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
