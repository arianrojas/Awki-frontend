import React, { useState } from 'react'
import { decodeJwt } from '../../services/api'
import { AlertTriangle, X, Heart, CheckCircle, Check } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
        active ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {label}
    </button>
  )
}

function Campo({ label, type = 'text', value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 focus:bg-white transition-all disabled:opacity-50"
      />
    </div>
  )
}

function ErrorBanner({ msg, onClose }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <p className="text-red-600 text-sm flex-1">{msg}</p>
      <button onClick={onClose} className="text-red-400 hover:text-red-600 ml-auto"><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

// ─── After login: fetch active pregnancy and build user object ────────────────
async function buildUserSession(token, email) {
  // 1. Fetch user info from /api/v1/auth/me
  let meData = null
  try {
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (meRes.ok) {
      const body = await meRes.json()
      meData = body?.data ?? null
    }
  } catch (err) {
    console.error("Error al obtener info de usuario:", err)
  }

  const userId = meData?.id ?? null
  const rol = meData?.rol ?? 'PACIENTE'
  const name = meData ? `${meData.nombres} ${meData.apellidos}`.trim() : email
  const perfilId = meData?.perfilId ?? null

  // 2. Try to get active pregnancy (only PACIENTE has one)
  let embarazoData = null
  if (rol === 'PACIENTE') {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/embarazos/activo`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const body = await res.json()
        embarazoData = body?.data ?? null
      }
    } catch {
      // Network error on this secondary call → continue without embarazo
    }
  }

  // 3. Build and save user object
  const user = {
    userId,
    role:  rol,
    email: meData?.email ?? email,
    name:  name || email,
    medicoId:                rol === 'MEDICO' ? perfilId : null,
    pacienteId:              rol === 'PACIENTE' ? perfilId : null,
    embarazoId:              embarazoData?.id                      ?? null,
    semanasGestacion:        embarazoData?.semanasGestacionActuales ?? null,
    trimestre:               embarazoData?.trimestre                ?? null,
    fechaProbableParto:      embarazoData?.fechaProbableParto       ?? null,
  }

  localStorage.setItem('awki_token', token)
  localStorage.setItem('awki_user',  JSON.stringify(user))

  return user
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function FormLogin({ onSuccess }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)

    try {
      // POST /api/v1/auth/login → ApiResponse<AuthResponse{ token }>
      const res  = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const body = await res.json()

      if (!res.ok) {
        throw new Error(body?.error?.message ?? 'Credenciales inválidas. Revisa tu correo y contraseña.')
      }

      // Unwrap ApiResponse envelope
      const token = body?.data?.token
      if (!token) throw new Error('El servidor no devolvió un token válido.')

      await buildUserSession(token, email)
      onSuccess()
    } catch (err) {
      setError(err.message ?? 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Campo label="Correo electrónico" type="email" value={email} onChange={setEmail} placeholder="tu@correo.com" disabled={loading} />
      <Campo label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••" disabled={loading} />

      {error && <ErrorBanner msg={error} onClose={() => setError(null)} />}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-200 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-pink-200 flex items-center justify-center gap-2 mt-1"
      >
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Iniciando sesión...</>
          : 'Iniciar sesión →'}
      </button>
    </form>
  )
}

// ─── Register Form ────────────────────────────────────────────────────────────
function FormRegistro({ onRegistroExitoso }) {
  const [form, setForm] = useState({
    nombres: '', apellidos: '', email: '', password: '',
    telefono: '', fechaNacimiento: '', dni: '', departamento: '',
    consentimientoIa: true,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [exito,   setExito]   = useState(false)

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res  = await fetch(`${BASE_URL}/api/v1/auth/register/paciente`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const body = await res.json()

      if (!res.ok) throw new Error(body?.error?.message ?? 'Error al registrar. Verifica los datos.')

      setExito(true)
    } catch (err) {
      setError(err.message ?? 'No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  if (exito) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
          <CheckCircle className="w-9 h-9 text-green-500" />
        </div>
        <div>
          <p className="font-bold text-gray-800 text-lg mb-1">¡Cuenta creada!</p>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Ya puedes iniciar sesión con tu correo y contraseña.
          </p>
        </div>
        <button
          onClick={onRegistroExitoso}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm hover:from-pink-600 hover:to-purple-700 transition-all shadow-md"
        >
          Iniciar sesión →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Nombres"   value={form.nombres}   onChange={set('nombres')}   placeholder="Ana"    disabled={loading} />
        <Campo label="Apellidos" value={form.apellidos} onChange={set('apellidos')} placeholder="García" disabled={loading} />
      </div>
      <Campo label="Correo electrónico" type="email"    value={form.email}    onChange={set('email')}    placeholder="ana@correo.com"    disabled={loading} />
      <Campo label="Contraseña"         type="password" value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" disabled={loading} />
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Teléfono"           value={form.telefono}        onChange={set('telefono')}        placeholder="+51 999 999 999" disabled={loading} />
        <Campo label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} disabled={loading} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="DNI (opcional)"        value={form.dni}         onChange={set('dni')}         placeholder="12345678"  disabled={loading} />
        <Campo label="Departamento (opcional)" value={form.departamento} onChange={set('departamento')} placeholder="Lima"  disabled={loading} />
      </div>

      {/* Consentimiento IA */}
      <label className="flex items-start gap-3 cursor-pointer group mt-1">
        <div
          onClick={() => set('consentimientoIa')(!form.consentimientoIa)}
          className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
            form.consentimientoIa ? 'bg-pink-500 border-pink-500' : 'border-gray-300 bg-white'
          }`}
        >
          {form.consentimientoIa && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
          Acepto el uso de <span className="font-semibold text-pink-500">inteligencia artificial</span> para el análisis y seguimiento de mis síntomas durante el embarazo
        </span>
      </label>

      {error && <ErrorBanner msg={error} onClose={() => setError(null)} />}

      <button
        type="submit"
        disabled={loading || !form.email || !form.password || !form.nombres || !form.apellidos || !form.consentimientoIa}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-200 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md hover:shadow-pink-200 flex items-center justify-center gap-2 mt-1"
      >
        {loading
          ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creando cuenta...</>
          : 'Crear cuenta →'}
      </button>
    </form>
  )
}

// ─── Main VistaLogin ──────────────────────────────────────────────────────────
export default function VistaLogin({ onLoginSuccess }) {
  const [tab, setTab] = useState('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-400 to-purple-600 items-center justify-center shadow-xl shadow-pink-200/50 mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Awki</h1>
          <p className="text-gray-400 text-sm mt-1.5">Tu acompañante de salud prenatal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/50 border border-gray-100/80 p-6">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <TabBtn label="Iniciar sesión" active={tab === 'login'}    onClick={() => setTab('login')} />
            <TabBtn label="Crear cuenta"   active={tab === 'registro'} onClick={() => setTab('registro')} />
          </div>

          {tab === 'login'
            ? <FormLogin onSuccess={onLoginSuccess} />
            : <FormRegistro onRegistroExitoso={() => setTab('login')} />
          }
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-5 leading-relaxed">
          Al usar Awki, aceptas nuestros términos de servicio.<br />
          Tu información clínica está protegida y encriptada.
        </p>
      </div>
    </div>
  )
}
