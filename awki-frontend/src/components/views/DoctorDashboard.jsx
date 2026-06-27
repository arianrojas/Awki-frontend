import React, { useState, useEffect, useRef } from 'react'
import { api } from '../../services/api'
import { StompClient } from '../../services/WebSocketService'
import VistaDocumentos from './VistaDocumentos'
import {
  Radio, AlertTriangle, Siren, BellOff, Check, Stethoscope,
  RefreshCw, Users, FolderOpen, X, Activity, ShieldAlert,
  Link2, CalendarDays, Wifi, WifiOff, Clock, ChevronRight,
  CircleDot, TrendingUp, UserCheck
} from 'lucide-react'

// ─── Sirena sintética usando Web Audio API para notificaciones críticas ─────
function triggerSynthesizedAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(660, ctx.currentTime)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, ctx.currentTime)

    gain.gain.setValueAtTime(0.2, ctx.currentTime)

    osc1.start()
    osc2.start()

    setTimeout(() => {
      osc1.stop()
      osc2.stop()
      ctx.close()
    }, 800)
  } catch (e) {
    console.error('Web Audio API falló:', e)
  }
}

// ─── Estilos globales inline (CSS-in-JS para el panel lateral) ──────────────
const slideInStyle = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes fadeInUp {
    from { transform: translateY(12px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  .panel-slide-in  { animation: slideInRight 0.32s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-in-up      { animation: fadeInUp 0.28s ease both; }
  .row-hover:hover .action-btns { opacity: 1; transform: translateX(0); }
  .action-btns { opacity: 0; transform: translateX(8px); transition: opacity .2s ease, transform .2s ease; }
`

export default function DoctorDashboard() {
  const [vinculos, setVinculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Tabs
  const [activeTab, setActiveTab] = useState('directorio')

  // Modales y formularios
  const [showControlPanel, setShowControlPanel] = useState(false)
  const [showDocsModal, setShowDocsModal] = useState(false)
  const [docsEmbarazoId, setDocsEmbarazoId] = useState(null)
  const [codigoGenerado, setCodigoGenerado] = useState(null)
  const [codigoIngresado, setCodigoIngresado] = useState('')
  const [pacienteSeleccionada, setPacienteSeleccionada] = useState(null)

  const handleOpenDocsModal = (embId) => {
    setDocsEmbarazoId(embId)
    setShowDocsModal(true)
  }

  // Estados de Emergencias y WebSocket
  const [alertas, setAlertas] = useState([])
  const [wsStatus, setWsStatus] = useState('disconnected')
  const [alarmaSonando, setAlarmaSonando] = useState(false)
  const alarmIntervalRef = useRef(null)
  const socketRef = useRef(null)

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

  // ─── Cargar directorio de pacientes ──────────────────────────────────────
  const cargarDirectorio = async () => {
    setCargando(true)
    setError(null)
    try {
      const listaVinculos = await api.get('/api/v1/vinculacion/mis-vinculos')
      const listaConDetalles = await Promise.all(
        listaVinculos.map(async (v) => {
          try {
            const emb = await api.get('/api/v1/embarazos/activo', { pacienteId: v.pacienteId })
            return { ...v, embarazo: emb, tieneEmbarazo: true }
          } catch {
            return { ...v, embarazo: null, tieneEmbarazo: false }
          }
        })
      )
      setVinculos(listaConDetalles)
      return listaConDetalles
    } catch (err) {
      setError(err.message ?? 'No se pudo cargar el directorio de pacientes')
      return []
    } finally {
      setCargando(false)
    }
  }

  // ─── Cargar alertas iniciales no leídas ──────────────────────────────────
  const cargarAlertasIniciales = async () => {
    try {
      const res = await api.get('/api/v1/alertas')
      const noLeidas = (res?.content ?? res ?? []).filter(a => a.estadoEntrega === 'PENDIENTE')
      setAlertas(noLeidas)
    } catch (err) {
      console.error('Error al precargar alertas:', err)
    }
  }

  // ─── Marcar alerta como leída ─────────────────────────────────────────────
  const handleMarcarLeida = async (alertaId) => {
    try {
      await api.patch(`/api/v1/alertas/${alertaId}/marcar-leida`)
      setAlertas(prev => prev.filter(a => a.id !== alertaId))
      const restantesRojas = alertas.filter(
        a => a.id !== alertaId && (a.nivelUrgencia === 'ROJO' || a.nivelUrgencia === 'ALTO')
      )
      if (restantesRojas.length === 0) handleSilenciarAlarma()
    } catch (err) {
      console.error('Error al marcar alerta como leída:', err)
    }
  }

  // ─── Sirena ───────────────────────────────────────────────────────────────
  const iniciarAlarmaSonora = () => {
    if (alarmaSonando) return
    setAlarmaSonando(true)
    triggerSynthesizedAlarm()
    alarmIntervalRef.current = setInterval(() => {
      triggerSynthesizedAlarm()
    }, 1500)
  }

  const handleSilenciarAlarma = () => {
    setAlarmaSonando(false)
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current)
      alarmIntervalRef.current = null
    }
  }

  // ─── WebSocket + Polling de Resiliencia ──────────────────────────────────
  useEffect(() => {
    let pollingInterval = null
    const token = localStorage.getItem('awki_token')
    const user = JSON.parse(localStorage.getItem('awki_user') || 'null')

    cargarAlertasIniciales()

    cargarDirectorio().then((vinculosActuales) => {
      const medicoId = user?.medicoId ?? vinculosActuales[0]?.medicoId

      if (!token || !medicoId) {
        console.warn('No se pudo iniciar WebSocket: Token o MedicoId ausentes.')
        setWsStatus('polling')
        return
      }

      const wsUrl = 'ws://localhost:8080/ws'
      const client = new StompClient(
        wsUrl,
        token,
        () => {
          setWsStatus('connected')
          console.log('WebSocket conectado al broker STOMP.')
          if (pollingInterval) {
            clearInterval(pollingInterval)
            pollingInterval = null
          }
        },
        (destination, payload) => {
          console.log('Mensaje de tiempo real recibido:', destination, payload)
          if (destination.includes('/alertas')) {
            setAlertas(prev => {
              if (prev.some(a => a.id === payload.id)) return prev
              return [payload, ...prev]
            })
            if (payload.nivelUrgencia === 'ROJO' || payload.nivelUrgencia === 'ALTO') {
              iniciarAlarmaSonora()
            }
          } else if (destination.includes('/riesgo')) {
            setVinculos(prev =>
              prev.map(p => {
                if (p.embarazo && p.embarazo.id === payload.embarazoId) {
                  return {
                    ...p,
                    embarazo: { ...p.embarazo, nivelRiesgoActual: payload.nivelRiesgoNuevo }
                  }
                }
                return p
              })
            )
          }
        },
        (err) => {
          console.error('Error en conexión WebSocket:', err)
          setWsStatus('error')
        },
        () => {
          setWsStatus('disconnected')
          console.warn('WebSocket desconectado. Iniciando fallback de Polling...')
          if (!pollingInterval) {
            setWsStatus('polling')
            pollingInterval = setInterval(() => {
              console.log('Ejecutando Polling de resiliencia obstétrica...')
              cargarAlertasIniciales()
              cargarDirectorio()
            }, 15000)
          }
        }
      )

      client.connect()
      socketRef.current = client
      client.subscribe('sub-alertas', `/topic/medico/${medicoId}/alertas`)
      client.subscribe('sub-riesgo', `/topic/medico/${medicoId}/riesgo`)
    })

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
      if (pollingInterval) clearInterval(pollingInterval)
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current)
    }
  }, [])

  // ─── Generar código de vinculación ───────────────────────────────────────
  const handleGenerarCodigo = async () => {
    setError(null)
    try {
      const res = await api.post('/api/v1/vinculacion/generar-codigo')
      setCodigoGenerado(res.codigo)
    } catch (err) {
      setError(err.message ?? 'Error al generar el código')
    }
  }

  // ─── Vincular paciente por código ────────────────────────────────────────
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
      setActiveTab('directorio')
      cargarDirectorio()
    } catch (err) {
      setError(err.message ?? 'El código es inválido o expiró')
    }
  }

  // ─── Desvincular paciente ─────────────────────────────────────────────────
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

  // ─── Registrar Control Prenatal ───────────────────────────────────────────
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
        frecuenciaCardiacaFetal: controlForm.frecuenciaCardiacaFetal
          ? parseInt(controlForm.frecuenciaCardiacaFetal, 10)
          : null,
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
      setShowControlPanel(false)
      cargarDirectorio()
    } catch (err) {
      setError(err.message ?? 'Error al registrar el control prenatal')
    }
  }

  const handleOpenControlPanel = (p) => {
    setPacienteSeleccionada(p)
    setControlForm(prev => ({
      ...prev,
      semanasGestacion: p.embarazo?.semanasGestacionActuales ?? 20,
      fechaControl: new Date().toISOString().split('T')[0]
    }))
    setShowControlPanel(true)
  }

  // ─── KPI helpers ──────────────────────────────────────────────────────────
  const pacientesVerdes   = vinculos.filter(v => (v.embarazo?.nivelRiesgoActual ?? 'VERDE') === 'VERDE').length
  const pacientesAmarillo = vinculos.filter(v => v.embarazo?.nivelRiesgoActual === 'AMARILLO').length
  const pacientesRojo     = vinculos.filter(v => v.embarazo?.nivelRiesgoActual === 'ROJO').length

  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const wsLabel =
    wsStatus === 'connected'    ? 'Tiempo Real' :
    wsStatus === 'polling'      ? 'Polling 15s' :
    wsStatus === 'error'        ? 'Error WS'    :
                                  'Desconectado'

  const wsColor =
    wsStatus === 'connected'    ? '#22c55e' :
    wsStatus === 'polling'      ? '#f59e0b' :
                                  '#ef4444'

  const tabs = [
    { id: 'directorio',  label: 'Directorio',        icon: <Users className="w-4 h-4" /> },
    { id: 'alertas',     label: `Alertas${alertas.length > 0 ? ` (${alertas.length})` : ''}`, icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'vincular',    label: 'Vincular Paciente',  icon: <Link2 className="w-4 h-4" /> },
  ]

  // ─── Campo de formulario helper ───────────────────────────────────────────
  const FormField = ({ label, children }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
        {label}
      </label>
      {children}
    </div>
  )

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
  const selectCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inject keyframe animations */}
      <style>{slideInStyle}</style>

      <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>

        {/* ── Banner del médico ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #7c3aed 100%)',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(79,70,229,0.25)'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '120px', width: '160px', height: '160px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '1rem', padding: '0.75rem', backdropFilter: 'blur(8px)' }}>
              <Stethoscope style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
                Panel de Control Obstétrico
              </p>
              <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                Hola, Dr. de Guardia
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                {vinculos.length} paciente{vinculos.length !== 1 ? 's' : ''} vinculada{vinculos.length !== 1 ? 's' : ''} · {today}
              </p>
            </div>
          </div>

          {/* WS Status badge */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', borderRadius: '2rem', padding: '0.5rem 1rem', backdropFilter: 'blur(8px)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: wsColor, display: 'inline-block', boxShadow: `0 0 0 3px ${wsColor}44` }} />
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>{wsLabel}</span>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {/* Total pacientes */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#eff6ff', borderRadius: '0.75rem', padding: '0.75rem' }}>
              <Users style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pacientes</p>
              <p style={{ color: '#1e293b', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{vinculos.length}</p>
            </div>
          </div>

          {/* Alertas activas */}
          <div style={{ background: alertas.length > 0 ? '#fff1f2' : 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: alertas.length > 0 ? '1px solid #fecdd3' : '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: alertas.length > 0 ? '#fee2e2' : '#f1f5f9', borderRadius: '0.75rem', padding: '0.75rem' }}>
              <Siren style={{ width: '1.5rem', height: '1.5rem', color: alertas.length > 0 ? '#dc2626' : '#94a3b8' }} />
            </div>
            <div>
              <p style={{ color: alertas.length > 0 ? '#b91c1c' : '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alertas Activas</p>
              <p style={{ color: alertas.length > 0 ? '#dc2626' : '#1e293b', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{alertas.length}</p>
            </div>
          </div>

          {/* Con embarazo registrado */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#ecfdf5', borderRadius: '0.75rem', padding: '0.75rem' }}>
              <Activity style={{ width: '1.5rem', height: '1.5rem', color: '#059669' }} />
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Con Embarazo</p>
              <p style={{ color: '#1e293b', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{vinculos.filter(v => v.tieneEmbarazo).length}</p>
            </div>
          </div>

          {/* Estado WebSocket */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: wsStatus === 'connected' ? '#f0fdf4' : '#fffbeb', borderRadius: '0.75rem', padding: '0.75rem' }}>
              {wsStatus === 'connected'
                ? <Wifi style={{ width: '1.5rem', height: '1.5rem', color: '#22c55e' }} />
                : <WifiOff style={{ width: '1.5rem', height: '1.5rem', color: '#f59e0b' }} />}
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>WebSocket</p>
              <p style={{ color: wsColor, fontSize: '1rem', fontWeight: 800, lineHeight: 1.4 }}>{wsLabel}</p>
            </div>
          </div>
        </div>

        {/* ── Estadísticas de Riesgo ── */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Riesgo Verde',    count: pacientesVerdes,   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
            { label: 'Riesgo Amarillo', count: pacientesAmarillo, color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
            { label: 'Riesgo Rojo',     count: pacientesRojo,     color: '#dc2626', bg: '#fff1f2', border: '#fecdd3', dot: '#ef4444' },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '0.75rem', padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.dot, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: s.color, fontSize: '0.8rem', fontWeight: 700 }}>{s.count} {s.label}</span>
            </div>
          ))}

          {alarmaSonando && (
            <button
              onClick={handleSilenciarAlarma}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.6rem 1.1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <BellOff style={{ width: '0.9rem', height: '0.9rem' }} /> Silenciar Alarma
            </button>
          )}

          {/* Recarga */}
          <button
            onClick={cargarDirectorio}
            style={{ marginLeft: alarmaSonando ? '0' : 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.6rem 1.1rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <RefreshCw style={{ width: '0.9rem', height: '0.9rem' }} /> Recargar
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
            <AlertTriangle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} /> {error}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1rem' }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              const isAlert  = tab.id === 'alertas' && alertas.length > 0
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.45rem',
                    padding: '1rem 1.25rem',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                    background: 'none',
                    color: isActive ? '#2563eb' : isAlert ? '#dc2626' : '#64748b',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'color .15s',
                    marginBottom: '-1px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {isAlert && (
                    <span style={{ background: '#dc2626', color: 'white', borderRadius: '2rem', fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.45rem', minWidth: '1.2rem', textAlign: 'center' }}>
                      {alertas.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ──── TAB: Directorio ──── */}
          {activeTab === 'directorio' && (
            <div style={{ padding: '1.5rem' }} className="fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    Directorio de Pacientes Vinculadas
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Gestantes activamente enlazadas a tu consulta
                  </p>
                </div>
              </div>

              {cargando ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
                  <span style={{ width: '2rem', height: '2rem', border: '2px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : vinculos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                  <Users style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', opacity: 0.4 }} />
                  <p style={{ fontWeight: 700, color: '#475569', fontSize: '1rem' }}>Aún no tienes pacientes vinculadas</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', maxWidth: '320px', margin: '0.4rem auto 0' }}>
                    Comparte un código o ingresa el de una paciente en la pestaña "Vincular Paciente".
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '27%' }} />
                    </colgroup>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        {['Paciente', 'DNI', 'Edad', 'Sem. Gestación', 'Último Control', 'Riesgo', 'Acciones'].map((h, i) => (
                          <th key={h} style={{ padding: '0.6rem 0.75rem', fontWeight: 700, fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i === 6 ? 'right' : 'left' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vinculos.map((p, idx) => {
                        const riesgo = p.embarazo?.nivelRiesgoActual ?? 'VERDE'
                        const semanas = p.embarazo?.semanasGestacionActuales ?? null
                        const ultimoControl = p.embarazo?.ultimoControl
                          ? new Date(p.embarazo.ultimoControl).toLocaleDateString('es-PE')
                          : '—'

                        const badgeBg    = riesgo === 'ROJO' ? '#fee2e2' : riesgo === 'AMARILLO' ? '#fef9c3' : '#dcfce7'
                        const badgeColor = riesgo === 'ROJO' ? '#b91c1c' : riesgo === 'AMARILLO' ? '#92400e' : '#15803d'
                        const badgeBord  = riesgo === 'ROJO' ? '#fecaca' : riesgo === 'AMARILLO' ? '#fde68a' : '#bbf7d0'

                        const rowBg = idx % 2 === 0 ? 'white' : '#fafbff'

                        return (
                          <tr
                            key={p.id}
                            className="row-hover"
                            style={{ background: rowBg, transition: 'background .15s', borderBottom: '1px solid #f1f5f9' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff' }}
                            onMouseLeave={e => { e.currentTarget.style.background = rowBg }}
                          >
                            {/* Paciente */}
                            <td style={{ padding: '0.9rem 0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{
                                  width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #60a5fa, #818cf8)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0
                                }}>
                                  {(p.pacienteNombres?.[0] ?? 'P') + (p.pacienteApellidos?.[0] ?? '')}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.875rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.pacienteNombres} {p.pacienteApellidos}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                    Vinculado: {new Date(p.vinculadoAt).toLocaleDateString('es-PE')}
                                  </span>
                                </div>
                              </div>
                            </td>
                            {/* DNI */}
                            <td style={{ padding: '0.9rem 0.75rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                              {p.pacienteDni ?? '—'}
                            </td>
                            {/* Edad */}
                            <td style={{ padding: '0.9rem 0.75rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                              {p.pacienteEdad != null ? `${p.pacienteEdad} a.` : '—'}
                            </td>
                            {/* Semanas */}
                            <td style={{ padding: '0.9rem 0.75rem' }}>
                              {p.tieneEmbarazo ? (
                                <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.7rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                  Sem. {semanas}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>Sin embarazo</span>
                              )}
                            </td>
                            {/* Último control */}
                            <td style={{ padding: '0.9rem 0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.8rem' }}>
                                <Clock style={{ width: '0.8rem', height: '0.8rem', flexShrink: 0, color: '#94a3b8' }} />
                                {ultimoControl}
                              </div>
                            </td>
                            {/* Riesgo */}
                            <td style={{ padding: '0.9rem 0.75rem' }}>
                              <span style={{
                                background: badgeBg, color: badgeColor, border: `1px solid ${badgeBord}`,
                                padding: '0.25rem 0.7rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 800,
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                animation: riesgo === 'ROJO' ? 'pulse 1.5s infinite' : 'none'
                              }}>
                                <CircleDot style={{ width: '0.6rem', height: '0.6rem', display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                                {riesgo}
                              </span>
                            </td>
                            {/* Acciones */}
                            <td style={{ padding: '0.9rem 0.75rem', textAlign: 'right' }}>
                              <div className="action-btns" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                {p.tieneEmbarazo && (
                                  <>
                                    <button
                                      onClick={() => handleOpenDocsModal(p.embarazo.id)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '0.6rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                      <FolderOpen style={{ width: '0.8rem', height: '0.8rem' }} /> Expediente
                                    </button>
                                    <button
                                      onClick={() => handleOpenControlPanel(p)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.6rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
                                    >
                                      + Control
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDesvincular(p.id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3', borderRadius: '0.6rem', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  <X style={{ width: '0.75rem', height: '0.75rem' }} /> Desvincular
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
          )}

          {/* ──── TAB: Alertas ──── */}
          {activeTab === 'alertas' && (
            <div style={{ padding: '1.5rem' }} className="fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    Alertas Obstétricas Activas
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Notificaciones pendientes de atención clínica
                  </p>
                </div>
                {alarmaSonando && (
                  <button
                    onClick={handleSilenciarAlarma}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.6rem 1.1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    <BellOff style={{ width: '0.9rem', height: '0.9rem' }} /> Silenciar Alarma
                  </button>
                )}
              </div>

              {alertas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                  <Check style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#22c55e', opacity: 0.7 }} />
                  <p style={{ fontWeight: 700, color: '#475569' }}>Sin alertas pendientes</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Todas las alertas han sido atendidas.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {alertas.map((a) => (
                    <div key={a.id} style={{
                      background: a.nivelUrgencia === 'ROJO' || a.nivelUrgencia === 'ALTO' ? '#fff1f2' : '#fffbeb',
                      border: `1px solid ${a.nivelUrgencia === 'ROJO' || a.nivelUrgencia === 'ALTO' ? '#fecdd3' : '#fde68a'}`,
                      borderRadius: '1rem',
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{
                            background: a.nivelUrgencia === 'ROJO' ? '#dc2626' : '#d97706',
                            color: 'white', padding: '0.15rem 0.6rem', borderRadius: '2rem',
                            fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase'
                          }}>
                            {a.nivelUrgencia}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                            {new Date(a.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', margin: '0 0 0.3rem' }}>
                          Paciente: {a.paciente?.nombres} {a.paciente?.apellidos}
                          {a.paciente?.dni && <span style={{ color: '#64748b', fontWeight: 500 }}> · DNI {a.paciente.dni}</span>}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                          {a.descripcion}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarcarLeida(a.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.55rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                      >
                        <Check style={{ width: '0.85rem', height: '0.85rem' }} /> Atendida
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── TAB: Vincular Paciente ──── */}
          {activeTab === 'vincular' && (
            <div style={{ padding: '1.5rem' }} className="fade-in-up">
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Vincular Paciente
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Genera un código para la gestante o ingresa el que ella generó
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: '900px' }}>
                {/* Generar código */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div style={{ background: '#eff6ff', borderRadius: '0.6rem', padding: '0.5rem' }}>
                      <UserCheck style={{ width: '1.1rem', height: '1.1rem', color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', margin: 0 }}>
                      Dar código a paciente
                    </h3>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    Genera un código alfanumérico de 8 dígitos para que la gestante lo ingrese en su aplicación móvil.
                  </p>
                  {codigoGenerado ? (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                      <p style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                        Código Generado
                      </p>
                      <p style={{ color: '#1d4ed8', fontSize: '2rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.2em', margin: '0 0 0.35rem', userSelect: 'all' }}>
                        {codigoGenerado}
                      </p>
                      <p style={{ color: '#93c5fd', fontSize: '0.72rem' }}>Válido por 48 horas</p>
                      <button
                        onClick={() => setCodigoGenerado(null)}
                        style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Generar otro código
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerarCodigo}
                      style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(37,99,235,0.3)' }}
                    >
                      Generar Código Alfanumérico
                    </button>
                  )}
                </div>

                {/* Ingresar código de paciente */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div style={{ background: '#eff6ff', borderRadius: '0.6rem', padding: '0.5rem' }}>
                      <Link2 style={{ width: '1.1rem', height: '1.1rem', color: '#2563eb' }} />
                    </div>
                    <h3 style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', margin: 0 }}>
                      Vincular por código de paciente
                    </h3>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    Ingresa el código que la gestante generó en su aplicación para completar la vinculación.
                  </p>
                  <form onSubmit={handleVincularPaciente} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      maxLength={8}
                      value={codigoIngresado}
                      onChange={e => setCodigoIngresado(e.target.value.toUpperCase())}
                      placeholder="Ej: 4KR9MT2X"
                      style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid #cbd5e1', borderRadius: '0.75rem', fontSize: '0.875rem', fontFamily: 'monospace', letterSpacing: '0.1em', background: 'white', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={codigoIngresado.length !== 8}
                      style={{ padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', cursor: codigoIngresado.length !== 8 ? 'not-allowed' : 'pointer', opacity: codigoIngresado.length !== 8 ? 0.5 : 1 }}
                    >
                      Vincular
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel Lateral: Registro de Control Prenatal ── */}
        {showControlPanel && pacienteSeleccionada && (
          <>
            {/* Overlay */}
            <div
              onClick={() => setShowControlPanel(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }}
            />
            {/* Side Panel */}
            <div
              className="panel-slide-in"
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: '480px', background: 'white',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
                zIndex: 201, display: 'flex', flexDirection: 'column',
                overflowY: 'auto'
              }}
            >
              {/* Panel header */}
              <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)', padding: '1.5rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                      Registro de Control
                    </p>
                    <h2 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, margin: '0.3rem 0 0' }}>
                      Control Prenatal
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                      {pacienteSeleccionada.pacienteNombres} {pacienteSeleccionada.pacienteApellidos}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowControlPanel(false)}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0 }}
                  >
                    <X style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>
              </div>

              {/* Panel form */}
              <form onSubmit={handleGuardarControl} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                {/* Sección: Datos Generales */}
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e0e7ff' }}>
                    Datos Generales
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <FormField label="Fecha Control">
                      <input type="date" required value={controlForm.fechaControl}
                        onChange={e => setControlForm({ ...controlForm, fechaControl: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="Semanas Gestación">
                      <input type="number" min={4} max={42} required value={controlForm.semanasGestacion}
                        onChange={e => setControlForm({ ...controlForm, semanasGestacion: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="Peso (kg)">
                      <input type="number" step="0.1" min={30} max={200} required value={controlForm.pesoKg}
                        onChange={e => setControlForm({ ...controlForm, pesoKg: e.target.value })}
                        className={inputCls} />
                    </FormField>
                  </div>
                </div>

                {/* Sección: Signos Vitales */}
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e0e7ff' }}>
                    Signos Vitales
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FormField label="PA Sistólica (mmHg)">
                      <input type="number" required value={controlForm.presionArterialSistolica}
                        onChange={e => setControlForm({ ...controlForm, presionArterialSistolica: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="PA Diastólica (mmHg)">
                      <input type="number" required value={controlForm.presionArterialDiastolica}
                        onChange={e => setControlForm({ ...controlForm, presionArterialDiastolica: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="Altura Uterina (cm)">
                      <input type="number" step="0.1" value={controlForm.alturaUterinaCm}
                        onChange={e => setControlForm({ ...controlForm, alturaUterinaCm: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="FC Fetal (lpm)">
                      <input type="number" value={controlForm.frecuenciaCardiacaFetal}
                        onChange={e => setControlForm({ ...controlForm, frecuenciaCardiacaFetal: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="Fiebre (ºC)">
                      <input type="number" step="0.1" value={controlForm.fiebre}
                        onChange={e => setControlForm({ ...controlForm, fiebre: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="Talla (cm)">
                      <input type="number" step="0.5" value={controlForm.tallaCm}
                        onChange={e => setControlForm({ ...controlForm, tallaCm: e.target.value })}
                        className={inputCls} />
                    </FormField>
                  </div>
                </div>

                {/* Sección: Datos Fetales y Laboratorio */}
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e0e7ff' }}>
                    Datos Fetales y Laboratorio
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FormField label="Presentación Fetal">
                      <select value={controlForm.presentacionFetal}
                        onChange={e => setControlForm({ ...controlForm, presentacionFetal: e.target.value })}
                        className={selectCls}>
                        <option value="CEFALICA">Cefálica</option>
                        <option value="PODALICA">Podálica</option>
                        <option value="TRANSVERSA">Transversa</option>
                        <option value="NO_DETERMINADA">No Determinada</option>
                      </select>
                    </FormField>
                    <FormField label="Movimientos Fetales">
                      <select value={controlForm.movimientosFetalesReporte}
                        onChange={e => setControlForm({ ...controlForm, movimientosFetalesReporte: e.target.value })}
                        className={selectCls}>
                        <option value="PRESENTES_NORMALES">Presentes normales</option>
                        <option value="DISMINUIDOS">Disminuidos</option>
                        <option value="AUSENTES">Ausentes</option>
                      </select>
                    </FormField>
                    <FormField label="Hemoglobina (g/dL)">
                      <input type="number" step="0.1" value={controlForm.hemoglobinaGdl}
                        onChange={e => setControlForm({ ...controlForm, hemoglobinaGdl: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="Glucosa (mg/dL)">
                      <input type="number" step="0.1" value={controlForm.glucosaMgdl}
                        onChange={e => setControlForm({ ...controlForm, glucosaMgdl: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <FormField label="Proteinuria">
                      <select value={controlForm.proteinuria}
                        onChange={e => setControlForm({ ...controlForm, proteinuria: e.target.value })}
                        className={selectCls}>
                        <option value="NEGATIVA">Negativa</option>
                        <option value="TRAZAS">Trazas</option>
                        <option value="UNA_CRUZ">1 Cruz (+)</option>
                        <option value="DOS_CRUCES">2 Cruces (++)</option>
                        <option value="TRES_CRUCES">3 Cruces (+++)</option>
                      </select>
                    </FormField>
                    <FormField label="Edemas">
                      <select value={controlForm.edemas}
                        onChange={e => setControlForm({ ...controlForm, edemas: e.target.value })}
                        className={selectCls}>
                        <option value="AUSENTES">Ausentes</option>
                        <option value="MANOS">Manos</option>
                        <option value="PIES">Pies</option>
                        <option value="CARA">Cara</option>
                        <option value="GENERALIZADO">Generalizado</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                {/* Sección: Seguimiento */}
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.4rem', borderBottom: '1px solid #e0e7ff' }}>
                    Seguimiento
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <FormField label="Próxima Cita (Recordatorio)">
                      <input type="date" value={controlForm.proximaCita}
                        onChange={e => setControlForm({ ...controlForm, proximaCita: e.target.value })}
                        className={inputCls} />
                    </FormField>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.65rem 0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={controlForm.contracciones}
                        onChange={e => setControlForm({ ...controlForm, contracciones: e.target.checked })}
                        style={{ width: '1.1rem', height: '1.1rem', accentColor: '#2563eb' }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        ¿Presenta Contracciones?
                      </span>
                    </label>
                    <FormField label="Observaciones Médicas (Internas)">
                      <textarea
                        rows={3}
                        value={controlForm.observacionesMedico}
                        onChange={e => setControlForm({ ...controlForm, observacionesMedico: e.target.value })}
                        placeholder="Añadir notas de seguimiento..."
                        className={inputCls}
                        style={{ resize: 'none' }}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShowControlPanel(false)}
                    style={{ flex: 1, padding: '0.7rem', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 2, padding: '0.7rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(37,99,235,0.3)' }}
                  >
                    Guardar Control Prenatal
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* ── Modal de Gestión Documental ── */}
        {showDocsModal && docsEmbarazoId && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem', backdropFilter: 'blur(2px)' }}>
            <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', width: '100%', maxWidth: '900px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FolderOpen style={{ width: '1.2rem', height: '1.2rem', color: '#2563eb' }} />
                  Expediente Clínico de Gestante
                </h2>
                <button
                  onClick={() => setShowDocsModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  <X style={{ width: '1rem', height: '1rem' }} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <VistaDocumentos embarazoId={docsEmbarazoId} isDoctor={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
