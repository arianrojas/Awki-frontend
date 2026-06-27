import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import { Calendar, Clock, Check, X, Plus } from 'lucide-react'

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
    <div className="flex flex-col gap-5 pb-4">
      {/* Header + Botón */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" /> Controles y Citas
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Gestiona tus consultas y controla el cumplimiento de tus controles prenatales.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          {showForm
            ? <><X className="w-4 h-4" /> Cancelar</>
            : <><Plus className="w-4 h-4" /> Programar Nueva Cita</>
          }
        </button>
      </div>

      <div className="flex flex-col gap-5">

        {/* Formulario inline (aparece cuando showForm=true) */}
        {showForm && (
          <div className="bg-white rounded-3xl p-5 border border-pink-200 shadow-sm flex flex-col gap-4 animate-slide-up">
            <h4 className="font-bold text-gray-700 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-400" /> Nueva Cita
            </h4>
            <form onSubmit={handleCrearCita} className="flex flex-col gap-3">
              <select
                value={citaTipo}
                onChange={e => setCitaTipo(e.target.value)}
                style={{ fontSize: '16px' }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200 font-medium text-gray-700"
              >
                <option>Control Prenatal</option>
                <option>Ecografía</option>
                <option>Nutrición</option>
                <option>Psicología Perinatal</option>
              </select>
              <select
                value={citaEspecialista}
                onChange={e => setCitaEspecialista(e.target.value)}
                style={{ fontSize: '16px' }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200 font-medium text-gray-700"
              >
                <option>Dr. Mendoza (Obstetra)</option>
                <option>Dra. Rojas (Ginecóloga)</option>
                <option>Lic. Torres (Nutricionista)</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  required
                  value={citaFecha}
                  onChange={e => setCitaFecha(e.target.value)}
                  style={{ fontSize: '16px' }}
                  className="border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
                <input
                  type="time"
                  required
                  value={citaHora}
                  onChange={e => setCitaHora(e.target.value)}
                  style={{ fontSize: '16px' }}
                  className="border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                />
              </div>
              <textarea
                rows={2}
                value={citaMotivo}
                onChange={e => setCitaMotivo(e.target.value)}
                placeholder="Motivo de consulta..."
                style={{ fontSize: '16px' }}
                className="border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md active:scale-95"
              >
                Confirmar Cita
              </button>
            </form>
          </div>
        )}

        {/* Checklist Clínico */}
        <div className="bg-white rounded-3xl p-5 border border-pink-100/50 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-800 text-base">✅ Checklist de Controles Prenatales</h3>

          {cargando ? (
            <div className="flex justify-center items-center py-16">
              <span className="w-8 h-8 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {CONTROLES_FICHA.map((item) => (
                <div
                  key={item.label}
                  className={`p-4 border rounded-2xl flex items-center gap-4 transition-all ${
                    item.realizado
                      ? 'border-green-200 bg-green-50/30'
                      : item.active
                      ? 'border-pink-200 bg-pink-50/30'
                      : 'border-gray-100'
                  }`}
                >
                  {/* Indicador visual */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.realizado
                      ? 'bg-green-500 text-white'
                      : item.active
                      ? 'bg-pink-100 text-pink-500 border-2 border-pink-300'
                      : 'bg-gray-100 text-gray-300'
                  }`}>
                    {item.realizado
                      ? <Check className="w-5 h-5" />
                      : item.active
                      ? <span className="w-3 h-3 bg-pink-400 rounded-full block animate-pulse" />
                      : <span className="w-3 h-3 bg-gray-300 rounded-full block" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${
                      item.realizado ? 'text-green-800' : item.active ? 'text-pink-700' : 'text-gray-500'
                    }`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{item.desc}</p>
                    {item.fechaRealizado && (
                      <p className="text-xs font-bold text-green-600 mt-1">
                        Realizado el {new Date(item.fechaRealizado).toLocaleDateString('es-PE')}
                      </p>
                    )}
                    {item.active && !item.realizado && (
                      <p className="text-xs font-bold text-pink-500 mt-1">⚡ Es tu próximo control</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citas Agendadas */}
        <div className="bg-white rounded-3xl p-5 border border-pink-100/50 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-800 text-base">📅 Mis Citas Agendadas</h3>

          {citasLocales.length === 0 ? (
            <div className="text-center py-12 flex flex-col gap-2 items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-200 mb-1" />
              <p className="text-gray-600 font-semibold">Sin citas agendadas</p>
              <p className="text-gray-400 text-sm">Toca el botón de arriba para programar tu próxima consulta.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {citasLocales.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 border rounded-2xl flex flex-col gap-2 transition-all ${
                    c.completado ? 'opacity-50 bg-gray-50 border-gray-100' : 'bg-white border-pink-100'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{c.tipo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Con {c.especialista}</p>
                    </div>
                    <div className="flex gap-2">
                      {!c.completado && (
                        <button
                          onClick={() => handleCompletarCita(c.id)}
                          title="Marcar completada"
                          className="w-8 h-8 bg-green-50 text-green-600 border border-green-200 rounded-lg font-bold flex items-center justify-center active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminarCita(c.id)}
                        title="Eliminar"
                        className="w-8 h-8 bg-red-50 text-red-500 border border-red-200 rounded-lg font-bold flex items-center justify-center active:scale-95"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium border-t border-gray-50 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(c.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {c.hora}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
