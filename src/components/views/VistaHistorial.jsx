import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'

export default function VistaHistorial() {
  const [antecedentes, setAntecedentes] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const user = JSON.parse(localStorage.getItem('awki_user') || 'null')
  const embarazoId = user?.embarazoId ?? null

  useEffect(() => {
    if (!embarazoId) {
      setCargando(false)
      return
    }
    setCargando(true)
    setError(null)
    api.get(`/api/v1/embarazos/${embarazoId}/antecedentes`)
      .then(resp => {
        setAntecedentes(resp)
      })
      .catch(err => {
        console.error("Error al cargar antecedentes:", err)
        setError("No se pudo cargar la información de antecedentes médicos.")
      })
      .finally(() => setCargando(false))
  }, [embarazoId])

  if (!embarazoId && !cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl p-8 border border-pink-100 shadow-sm max-w-xl mx-auto">
        <span className="text-5xl mb-4">📋</span>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No hay embarazo activo registrado</h3>
        <p className="text-gray-400 text-sm max-w-sm">
          Se requiere un registro de embarazo activo para visualizar los antecedentes médicos.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-800">📋 Historial Clínico y Antecedentes</h2>
        <p className="text-gray-400 text-sm">Resumen de antecedentes personales, obstétricos y familiares registrados por tu obstetra.</p>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center py-24 bg-white rounded-3xl border border-pink-50 shadow-sm">
          <span className="w-8 h-8 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-3xl p-6 text-sm text-center">
          ⚠️ {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Tarjeta 1: Antecedentes Obstétricos */}
          <div className="bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-700 text-base flex items-center gap-2">
              🤰 Ficha Obstétrica
            </h3>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4">
              <div className="p-3 bg-gray-50 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Gestaciones</span>
                <span className="text-xl font-extrabold text-gray-800">{antecedentes?.numeroGestaciones ?? user?.numeroGestacion ?? 1}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Partos previos</span>
                <span className="text-xl font-extrabold text-gray-800">{antecedentes?.numeroPartos ?? user?.numeroPartos ?? 0}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Abortos</span>
                <span className="text-xl font-extrabold text-gray-800">{antecedentes?.numeroAbortos ?? user?.numeroAbortos ?? 0}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Cesáreas</span>
                <span className="text-xl font-extrabold text-gray-800">{antecedentes?.numeroCesareas ?? user?.numeroCesareas ?? 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-pink-50/20 border border-pink-100/30 p-3 rounded-2xl">
              <span>🧬</span>
              <span>Embarazo Múltiple: <strong className="text-pink-600">{antecedentes?.embarazoMultiple ? 'SÍ' : 'NO'}</strong></span>
            </div>
          </div>

          {/* Tarjeta 2: Antecedentes Clínicos y Alergias */}
          <div className="bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-700 text-base flex items-center gap-2">
              📋 Antecedentes Personales
            </h3>
            
            <div className="flex flex-col gap-3.5 border-t border-gray-50 pt-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase">Alergias o Contraindicaciones</h4>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  {antecedentes?.alergias || 'Ninguna alergia registrada.'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase">Antecedentes Patológicos Personales</h4>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">
                  {antecedentes?.antecedentesPatologicosPersonales || 'Sin antecedentes patológicos personales de relevancia clínica.'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase">Antecedentes Familiares</h4>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">
                  {antecedentes?.antecedentesFamiliares || 'Sin antecedentes patológicos familiares declarados.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
