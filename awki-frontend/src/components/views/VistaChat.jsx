import React, { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../../services/api'

// ─── Badges ───────────────────────────────────────────────────────────────────
function Badge({ color, icon, label }) {
  const colors = {
    red:    'bg-red-100 text-red-600 border-red-200',
    gray:   'bg-gray-100 text-gray-500 border-gray-200',
    amber:  'bg-amber-100 text-amber-600 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${colors[color]}`}>
      {icon} {label}
    </span>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MensajeBurbuja({ msg }) {
  const esPaciente = msg.rol === 'PACIENTE'
  const esIA       = msg.rol === 'IA'

  const hora = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={`flex ${esPaciente ? 'justify-end' : 'justify-start'} gap-2`}>
      {/* Avatar IA */}
      {!esPaciente && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
          <span className="text-sm">🤰</span>
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col gap-1 ${esPaciente ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          esPaciente
            ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
        }`}>
          {msg.contenido}
        </div>

        {/* Badges + timestamp */}
        <div className={`flex items-center gap-1.5 flex-wrap ${esPaciente ? 'justify-end' : 'justify-start'}`}>
          {msg.alarmaProbable && <Badge color="red"   icon="🔴" label="Posible signo de alerta" />}
          {msg.desdeCache      && <Badge color="gray"  icon="⚡"  label="Caché" />}
          {msg.fallbackUsado   && <Badge color="amber" icon="⚠️"  label="Modo fallback" />}
          {hora && <span className="text-[10px] text-gray-400">{hora}</span>}
        </div>
      </div>

      {/* Avatar Paciente */}
      {esPaciente && (
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-1 border border-pink-200">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-sm">🤰</span>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Suggested Questions ──────────────────────────────────────────────────────
const SUGERENCIAS = [
  '¿Qué debo comer en el segundo trimestre?',
  'Tengo náuseas constantes, ¿es normal?',
  '¿Cuándo debería sentir los movimientos del bebé?',
  'Me duele la espalda baja, ¿qué hago?',
]

function Sugerencias({ onSelect }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-3xl">
        💬
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-700 mb-1">¡Hola! Soy tu asistente IA prenatal</p>
        <p className="text-gray-400 text-sm">Puedo responder tus preguntas sobre el embarazo. ¿Por dónde empezamos?</p>
      </div>
      <div className="w-full max-w-sm flex flex-col gap-2 mt-2">
        {SUGERENCIAS.map(q => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-left text-sm text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-all duration-150"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main VistaChat ───────────────────────────────────────────────────────────
export default function VistaChat() {
  const [mensajes,  setMensajes]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [cargando,  setCargando]  = useState(true)
  const [error,     setError]     = useState(null)
  const bottomRef = useRef(null)

  // Read session from localStorage
  const user     = JSON.parse(localStorage.getItem('awki_user') || 'null')
  const embarazoId = user?.embarazoId ?? null

  // ── Scroll to bottom ──
  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [])

  // ── Load history ──
  useEffect(() => {
    if (!embarazoId) { setCargando(false); return }

    api.get('/api/v1/chat/historial', { embarazoId, page: 0, size: 30 })
      .then(data => {
        // Backend returns a Spring Page object: { content: [...], totalPages, ... }
        const content = Array.isArray(data) ? data : (data?.content ?? [])
        // Content comes newest-first from the backend (sorted DESC) → reverse to show oldest first
        setMensajes([...content].reverse())
        scrollToBottom()
      })
      .catch(err => setError(err.message))
      .finally(() => setCargando(false))
  }, [embarazoId, scrollToBottom])

  // ── Send message ──
  const enviarMensaje = async (texto) => {
    const contenido = texto.trim()
    if (!contenido || loading || !embarazoId) return

    setInput('')
    setError(null)

    // Optimistic update: show patient message immediately
    const tempMsg = {
      id: `temp-${Date.now()}`,
      rol: 'PACIENTE',
      contenido,
      alarmaProbable: false,
      desdeCache: false,
      fallbackUsado: false,
      createdAt: new Date().toISOString(),
    }
    setMensajes(prev => [...prev, tempMsg])
    setLoading(true)
    scrollToBottom()

    try {
      // POST /api/v1/chat/mensaje → ChatMensajeResponse
      const resp = await api.post('/api/v1/chat/mensaje', { embarazoId, contenido })

      // Add IA response
      const iaMsg = {
        id: resp.mensajeIaId,
        rol: 'IA',
        contenido: resp.respuesta,
        alarmaProbable: resp.alarmaProbable,
        desdeCache:     resp.desdeCache,
        fallbackUsado:  resp.fallbackUsado,
        createdAt: resp.timestamp,
      }
      setMensajes(prev => [...prev, iaMsg])
      scrollToBottom()
    } catch (err) {
      setError(err.message)
      // Remove the optimistic message on failure
      setMensajes(prev => prev.filter(m => m.id !== tempMsg.id))
    } finally {
      setLoading(false)
    }
  }

  // ── No embarazo registered ──
  if (!embarazoId && !cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-4xl">
          🤰
        </div>
        <div>
          <p className="font-bold text-gray-800 text-lg mb-2">Primero registra tu embarazo</p>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Para usar el asistente de IA necesitas tener un embarazo activo registrado en el sistema.
            Habla con tu médico para que lo registre.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#f9f5ff] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-sm">
          <span className="text-lg">🤰</span>
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">Asistente Prenatal IA</p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
            En línea · Powered by Gemini
          </p>
        </div>
        {user?.semanasGestacion && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-pink-50 text-pink-600 border border-pink-200 px-2.5 py-1 rounded-full font-medium">
              Semana {user.semanasGestacion} · T{user.trimestre}
            </span>
          </div>
        )}
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

        {cargando && (
          <div className="flex justify-center items-center py-12">
            <span className="w-6 h-6 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
          </div>
        )}

        {!cargando && mensajes.length === 0 && (
          <Sugerencias onSelect={enviarMensaje} />
        )}

        {mensajes.map(msg => (
          <MensajeBurbuja key={msg.id} msg={msg} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-red-600 max-w-sm">
              <span>⚠</span> {error}
              <button onClick={() => setError(null)} className="ml-1 text-red-400 hover:text-red-600">✕</button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); enviarMensaje(input) }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviarMensaje(input)
              }
            }}
            placeholder="Escribe tu pregunta... (Enter para enviar)"
            rows={1}
            disabled={loading || !embarazoId}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 focus:bg-white transition-all disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ minHeight: '44px' }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !embarazoId}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-200 disabled:to-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-pink-200 flex-shrink-0"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <span className="text-white text-lg">↑</span>
            }
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">
          Las respuestas son orientativas. Consulta siempre a tu médico ante cualquier duda.
        </p>
      </div>
    </div>
  )
}
