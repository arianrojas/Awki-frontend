import React, { useState, useEffect } from 'react'

export default function VistaRecordatorios() {
  const [recordatorios, setRecordatorios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  const cargarRecordatorios = () => {
    const data = JSON.parse(localStorage.getItem('awki_recordatorios') || '[]')
    // Ordenar por fecha y hora más cercana
    const ordenados = [...data].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
    setRecordatorios(ordenados)
  }

  useEffect(() => {
    cargarRecordatorios()
  }, [])

  const handleCrear = (e) => {
    e.preventDefault()
    if (!titulo || !fecha || !hora) return

    const lista = JSON.parse(localStorage.getItem('awki_recordatorios') || '[]')
    const nuevo = {
      id: `rec-${Date.now()}`,
      titulo,
      fecha,
      hora,
      completado: false
    }

    lista.push(nuevo)
    localStorage.setItem('awki_recordatorios', JSON.stringify(lista))

    setTitulo('')
    setFecha('')
    setHora('')
    setShowForm(false)
    cargarRecordatorios()
  }

  const handleMarcarCompletado = (id) => {
    const actualizados = recordatorios.map(r => r.id === id ? { ...r, completado: !r.completado } : r)
    localStorage.setItem('awki_recordatorios', JSON.stringify(actualizados))
    cargarRecordatorios()
  }

  const handleEliminar = (id) => {
    const filtrados = recordatorios.filter(r => r.id !== id)
    localStorage.setItem('awki_recordatorios', JSON.stringify(filtrados))
    cargarRecordatorios()
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-800">🔔 Recordatorios y Medicamentos</h2>
          <p className="text-gray-400 text-sm">Organiza y activa alarmas para tus vitaminas (ácido fólico, hierro) y medicamentos durante tu gestación.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex-shrink-0"
        >
          {showForm ? '✕ Cancelar' : '＋ Nuevo Recordatorio'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-3xl p-5 border border-pink-100/50 shadow-sm flex flex-col gap-4 animate-fade-in h-fit">
            <h4 className="font-bold text-gray-800 text-sm">🔔 Agregar Alarma</h4>
            <form onSubmit={handleCrear} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">¿De qué recordarte?</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ácido Fólico, Tomar hierro..."
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Hora</label>
                  <input
                    type="time"
                    required
                    value={hora}
                    onChange={e => setHora(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none mt-1"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm mt-1">
                Crear Alarma
              </button>
            </form>
          </div>
        )}

        {/* Listado de alarmas */}
        <div className={`${showForm ? 'md:col-span-2' : 'md:col-span-3'} bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-4`}>
          <h3 className="font-bold text-gray-800 text-base">Mis Recordatorios Activos</h3>
          
          {recordatorios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-3">🔔</span>
              <p className="text-gray-400 text-sm">No tienes alarmas o recordatorios activos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[450px] overflow-y-auto pr-1">
              {recordatorios.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 border rounded-2xl flex items-center justify-between gap-3 transition-all hover:bg-gray-50/50
                    ${r.completado ? 'border-green-200 bg-green-50/10 opacity-60' : 'border-gray-100 bg-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Botón de checkbox */}
                    <button
                      onClick={() => handleMarcarCompletado(r.id)}
                      className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-colors
                        ${r.completado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 hover:border-pink-300 bg-white'}
                      `}
                    >
                      {r.completado && <span className="text-xs font-bold">✓</span>}
                    </button>

                    <div className="flex flex-col gap-0.5">
                      <span className={`text-sm font-bold ${r.completado ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {r.titulo}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mt-0.5">
                        <span>📅 {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</span>
                        <span>⏰ {r.hora}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEliminar(r.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 flex items-center justify-center transition-colors text-sm"
                    title="Eliminar recordatorio"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
