import React, { useState, useEffect } from 'react'

export default function VistaSintomas() {
  const [sintomasHistorial, setSintomasHistorial] = useState([])
  const [bienestarDia, setBienestarDia] = useState('Excelente')
  const [movimientos, setMovimientos] = useState('Normales, como siempre')
  const [hinchazon, setHinchazon] = useState('No, ninguna')
  const [detalles, setDetalles] = useState('')
  const [alarmaCritico, setAlarmaCritico] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  const cargarSintomas = () => {
    const data = JSON.parse(localStorage.getItem('awki_diario_sintomas') || '[]')
    // Ordenar del más reciente al más antiguo
    const ordenados = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    setSintomasHistorial(ordenados)
  }

  useEffect(() => {
    cargarSintomas()
  }, [])

  const checkSintomaAlarma = (texto) => {
    const terminosAlarma = ['sangrado', 'sangre', 'hemorragia', 'liquido', 'líquido', 'fiebre', 'dolor fuerte', 'contraccion', 'contracción', 'no siento', 'sin movimientos', 'vision borrosa', 'visión borrosa', 'zumbido']
    const textLower = (texto || '').toLowerCase()
    const esCritico = terminosAlarma.some(term => textLower.includes(term))
    setAlarmaCritico(esCritico)
  }

  const handleGuardar = (e) => {
    e.preventDefault()
    
    const esCritico = alarmaCritico || 
      movimientos === 'No los he sentido' ||
      hinchazon === 'Sí, en la cara' ||
      hinchazon === 'Sí, en varias partes del cuerpo'

    const lista = JSON.parse(localStorage.getItem('awki_diario_sintomas') || '[]')
    const nuevoReporte = {
      id: `sintoma-${Date.now()}`,
      bienestar: bienestarDia,
      movimientos,
      hinchazon,
      detalles,
      esCritico,
      fecha: new Date().toISOString()
    }

    lista.push(nuevoReporte)
    localStorage.setItem('awki_diario_sintomas', JSON.stringify(lista))
    
    setSuccessMsg('Reporte de síntomas guardado correctamente.')
    setDetalles('')
    setAlarmaCritico(false)
    setMovimientos('Normales, como siempre')
    setHinchazon('No, ninguna')
    setBienestarDia('Excelente')

    setTimeout(() => setSuccessMsg(null), 3000)
    cargarSintomas()
  }

  const getEmojiBienestar = (b) => {
    switch (b) {
      case 'Excelente': return '🌟'
      case 'Bien': return '😊'
      case 'Regular': return '😐'
      default: return '🤕'
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-800">🩺 Diario de Síntomas y Bienestar</h2>
        <p className="text-gray-400 text-sm">Registra cómo te sientes hoy y mantén un historial de autocuidado clínico para tu próxima consulta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulario de registro */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-5 h-fit">
          <h3 className="font-bold text-gray-700 text-base">📝 ¿Cómo te sientes hoy?</h3>
          
          <form onSubmit={handleGuardar} className="flex flex-col gap-4">
            
            {/* Escala de Bienestar */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Estado General</label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {['Excelente', 'Bien', 'Regular', 'Mal'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBienestarDia(b)}
                    className={`py-2 px-1 border rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1
                      ${bienestarDia === b ? 'bg-pink-500 border-pink-500 text-white shadow-sm shadow-pink-100' : 'border-gray-200 hover:border-pink-300 text-gray-600 bg-white'}
                    `}
                  >
                    <span className="text-lg">{getEmojiBienestar(b)}</span>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Movimientos fetales */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Movimientos del bebé</label>
              <select
                value={movimientos}
                onChange={e => setMovimientos(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-100 font-medium text-gray-700 mt-1"
              >
                <option>Normales, como siempre</option>
                <option>Los siento menos que antes</option>
                <option>No los he sentido</option>
              </select>
            </div>

            {/* Hinchazón / Edemas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Hinchazón (Edemas)</label>
              <select
                value={hinchazon}
                onChange={e => setHinchazon(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-100 font-medium text-gray-700 mt-1"
              >
                <option>No, ninguna</option>
                <option>Sí, en los pies</option>
                <option>Sí, en las manos</option>
                <option>Sí, en la cara</option>
                <option>Sí, en varias partes del cuerpo</option>
              </select>
            </div>

            {/* Otros síntomas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Otros Síntomas o Detalles</label>
              <textarea
                rows={2.5}
                value={detalles}
                onChange={e => {
                  setDetalles(e.target.value)
                  checkSintomaAlarma(e.target.value)
                }}
                placeholder="Ej: dolor de espalda leve, reflujo nocturno..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-pink-100 mt-1"
              />
            </div>

            {/* Avisos SOS */}
            {alarmaCritico && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs leading-relaxed font-semibold">
                ⚠️ Signo de Alarma detectado. Si presentas dolor abdominal fuerte, sangrado vaginal, fiebre o pérdida de líquido, pulsa el botón SOS inmediatamente.
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl p-3 text-xs font-bold text-center">
                ✓ {successMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-1"
            >
              Guardar Reporte Diario
            </button>
          </form>
        </div>

        {/* Historial de reportes */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-800 text-base">📅 Historial de Bienestar Diario</h3>
          
          {sintomasHistorial.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-3">🩺</span>
              <p className="text-gray-400 text-sm">Aún no has registrado tus síntomas diarios.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[480px] overflow-y-auto pr-1">
              {sintomasHistorial.map((s, index) => (
                <div
                  key={s.id || s.fecha || index}
                  className={`p-4 border rounded-2xl flex flex-col gap-2 transition-all hover:bg-gray-50/50
                    ${s.esCritico ? 'border-red-200 bg-red-50/10' : 'border-gray-100'}
                  `}
                >
                  <div className="flex justify-between items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getEmojiBienestar(s.bienestar)}</span>
                      <span className="font-bold text-sm text-gray-700">Estado: {s.bienestar}</span>
                    </div>
                    
                    <span className="text-[10px] text-gray-400 font-bold">
                      {new Date(s.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 text-xs border-t border-gray-50 pt-3">
                    <div>
                      <span className="font-bold text-gray-400 block uppercase text-[9px]">Movimientos fetales</span>
                      <span className="text-gray-700 font-medium">{s.movimientos}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 block uppercase text-[9px]">Hinchazón (Edemas)</span>
                      <span className="text-gray-700 font-medium">{s.hinchazon}</span>
                    </div>
                  </div>

                  {s.detalles && (
                    <div className="mt-2 text-xs bg-gray-50/50 p-2.5 rounded-xl text-gray-600 leading-relaxed italic border border-gray-100/50">
                      "{s.detalles}"
                    </div>
                  )}

                  {s.esCritico && (
                    <span className="text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full w-fit mt-1 uppercase animate-pulse">
                      Signo de Advertencia Clínico
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
