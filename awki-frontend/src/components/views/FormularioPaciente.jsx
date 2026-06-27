import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Stethoscope, AlertTriangle, Check } from 'lucide-react'

export default function PacienteForm({ currentUser, onVinculacionComplete }) {
  const [codigoInput, setCodigoInput] = useState('')
  const [codigoGenerado, setCodigoGenerado] = useState(null)
  const [expiracion, setExpiracion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleGenerarCodigo = async () => {
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await api.post('/api/v1/vinculacion/generar-codigo')
      setCodigoGenerado(res.codigo)
      if (res.expiraAt) {
        const date = new Date(res.expiraAt)
        setExpiracion(date.toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))
      }
    } catch (err) {
      setError(err.message ?? 'No se pudo generar el código')
    } finally {
      setLoading(false)
    }
  }

  const handleVincularCodigo = async (e) => {
    e.preventDefault()
    if (!codigoInput.trim() || codigoInput.length !== 8) {
      setError('El código debe tener exactamente 8 caracteres')
      return
    }
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await api.post('/api/v1/vinculacion/usar-codigo', { codigo: codigoInput.toUpperCase().trim() })
      setSuccessMsg('¡Vinculación exitosa con tu médico!')
      setCodigoInput('')
      if (onVinculacionComplete) {
        await onVinculacionComplete()
      }
    } catch (err) {
      setError(err.message ?? 'El código es inválido o ha expirado')
    } finally {
      setLoading(false)
    }
  }

  const isVinculado = !!currentUser?.medicoId

  return (
    <div className="animate-fade-in max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Banner de Bienvenida */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-pink-50 to-purple-50 rounded-full opacity-60" />
        <div className="relative">
          <p className="text-xs font-bold text-pink-500 mb-2 uppercase tracking-wider">Mi Perfil</p>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">¡Hola, {currentUser?.name ?? 'Paciente'}!</h1>
          <p className="text-gray-500 font-medium">
            Gestiona la vinculación con tu médico tratante y revisa tus datos de seguimiento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Datos Personales */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-50 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Información de Cuenta</h2>
            <p className="text-gray-400 text-xs mt-0.5">Datos registrados en el sistema.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Correo electrónico</span>
              <span className="font-semibold text-gray-800 text-sm">{currentUser?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Rol de usuario</span>
              <span className="bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {currentUser?.role ?? 'Paciente'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Semanas de Gestación</span>
              <span className="font-semibold text-gray-800 text-sm">
                {currentUser?.semanasGestacion ? `${currentUser.semanasGestacion} semanas` : 'No registrado'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-gray-500 text-sm">Modo de Uso</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                isVinculado 
                  ? 'bg-purple-50 text-purple-600 border-purple-100' 
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {isVinculado ? 'Vinculada' : 'Autónomo'}
              </span>
            </div>
          </div>
        </div>

        {/* Vinculación Médica */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-50 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Vinculación Médica</h2>
            <p className="text-gray-400 text-xs mt-0.5">Conéctate con tu obstetra/ginecólogo de confianza.</p>
          </div>

          {isVinculado ? (
            <div className="flex flex-col items-center gap-4 text-center py-6 flex-1 justify-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <p className="font-bold text-gray-800">¡Tu cuenta está vinculada!</p>
                <p className="text-gray-500 text-xs leading-relaxed max-w-xs mt-1.5">
                  Tu médico tratante tiene acceso a tu historial, síntomas y alertas en tiempo real para brindarte un mejor soporte.
                </p>
                <p className="text-gray-400 text-[10px] mt-4 font-mono">
                  ID Médico: {currentUser.medicoId}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Opción A: Ingresar código del médico */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Opción A: Ingresar código del médico</p>
                <form onSubmit={handleVincularCodigo} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    value={codigoInput}
                    onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                    placeholder="Código de 8 dígitos (ej: 4KR9MT2X)"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || codigoInput.length !== 8}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md disabled:from-gray-200 disabled:to-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Vinculando...' : 'Vincular'}
                  </button>
                </form>
              </div>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-300">ó</span></div>
              </div>

              {/* Opción B: Generar mi propio código */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Opción B: Dar mi código al médico</p>
                {codigoGenerado ? (
                  <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wide">Código de vinculación</span>
                    <span className="text-2xl font-black text-purple-700 tracking-widest select-all font-mono">{codigoGenerado}</span>
                    <span className="text-[10px] text-gray-400">Díctale este código a tu médico. Válido hasta: {expiracion}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerarCodigo}
                    disabled={loading}
                    className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-pink-200 hover:bg-pink-50/30 text-gray-500 hover:text-pink-600 font-bold text-xs rounded-xl transition-all"
                  >
                    Generar código para mi médico
                  </button>
                )}
              </div>

            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-green-600 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 flex-shrink-0" /> {successMsg}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
