import React, { useState, useEffect } from 'react'
import { Stethoscope, PenLine, Calendar, Tag, AlertTriangle, Check, Frown, Bandage, Eye, Bell, Droplets, Droplet, Flame, Zap, Smile, Meh, Moon, Star } from 'lucide-react'

const SINTOMAS_CLINICOS = [
  { id: 'nauseas',        texto: 'Náuseas / Vómitos',                icon: <Frown className="w-4 h-4" />,    tipo: 'LEVE' },
  { id: 'cefalea',        texto: 'Cefalea / Dolor de Cabeza',        icon: <Bandage className="w-4 h-4" />,  tipo: 'MODERADO' },
  { id: 'vision_borrosa', texto: 'Visión Borrosa / Luces',           icon: <Eye className="w-4 h-4" />,      tipo: 'ALARMA' },
  { id: 'tinnitus',       texto: 'Zumbido de Oídos',                 icon: <Bell className="w-4 h-4" />,     tipo: 'ALARMA' },
  { id: 'epigastralgia',  texto: 'Dolor en la Boca del Estómago',    icon: <Zap className="w-4 h-4" />,      tipo: 'ALARMA' },
  { id: 'sangrado',       texto: 'Sangrado Vaginal',                  icon: <Droplets className="w-4 h-4" />, tipo: 'ALARMA' },
  { id: 'liquido',        texto: 'Pérdida de Líquido',               icon: <Droplet className="w-4 h-4" />,  tipo: 'ALARMA' },
  { id: 'ardor_orinar',   texto: 'Ardor al Orinar',                  icon: <Flame className="w-4 h-4" />,    tipo: 'MODERADO' },
  { id: 'fatiga',         texto: 'Cansancio / Fatiga Extrema',       icon: <Moon className="w-4 h-4" />,     tipo: 'LEVE' },
  { id: 'reflujo',        texto: 'Acidez / Reflujo',                 icon: <Flame className="w-4 h-4" />,    tipo: 'LEVE' },
]

export default function VistaSintomas() {
  const [sintomasHistorial, setSintomasHistorial] = useState([])
  const [bienestarDia, setBienestarDia] = useState('Excelente')
  const [movimientos, setMovimientos] = useState('Normales, como siempre')
  const [hinchazon, setHinchazon] = useState('No, ninguna')
  const [sintomasSeleccionados, setSintomasSeleccionados] = useState([])
  const [detalles, setDetalles] = useState('')
  const [alarmaCritico, setAlarmaCritico] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  const cargarSintomas = () => {
    const data = JSON.parse(localStorage.getItem('awki_diario_sintomas') || '[]')
    const ordenados = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    setSintomasHistorial(ordenados)
  }

  useEffect(() => {
    cargarSintomas()
  }, [])

  const toggleSintoma = (id) => {
    setSintomasSeleccionados(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      
      // Verificar si hay síntomas de alarma seleccionados
      const tieneAlarma = updated.some(sId => {
        const item = SINTOMAS_CLINICOS.find(c => c.id === sId)
        return item && item.tipo === 'ALARMA'
      })
      setAlarmaCritico(tieneAlarma)
      return updated
    })
  }

  const handleGuardar = (e) => {
    e.preventDefault()
    
    const tieneAlarmaSeleccionada = sintomasSeleccionados.some(sId => {
      const item = SINTOMAS_CLINICOS.find(c => c.id === sId)
      return item && item.tipo === 'ALARMA'
    })

    const esCritico = alarmaCritico || tieneAlarmaSeleccionada ||
      movimientos === 'No los he sentido' ||
      hinchazon === 'Sí, en la cara' ||
      hinchazon === 'Sí, en varias partes del cuerpo'

    const nombresSintomas = sintomasSeleccionados.map(sId => {
      const item = SINTOMAS_CLINICOS.find(c => c.id === sId)
      return item ? item.texto : sId
    })

    const lista = JSON.parse(localStorage.getItem('awki_diario_sintomas') || '[]')
    const nuevoReporte = {
      id: `sintoma-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bienestar: bienestarDia,
      movimientos,
      hinchazon,
      sintomas: nombresSintomas.join(', '),
      detalles,
      esCritico,
      fecha: new Date().toISOString()
    }

    lista.push(nuevoReporte)
    localStorage.setItem('awki_diario_sintomas', JSON.stringify(lista))
    
    setSuccessMsg('Reporte clínico de síntomas guardado y sincronizado.')
    setDetalles('')
    setSintomasSeleccionados([])
    setAlarmaCritico(false)
    setMovimientos('Normales, como siempre')
    setHinchazon('No, ninguna')
    setBienestarDia('Excelente')

    setTimeout(() => setSuccessMsg(null), 3500)
    cargarSintomas()
  }

  const getIconBienestar = (b) => {
    switch (b) {
      case 'Excelente': return <Star className="w-6 h-6 text-yellow-400" />
      case 'Bien':      return <Smile className="w-6 h-6 text-green-500" />
      case 'Regular':   return <Meh className="w-6 h-6 text-amber-400" />
      default:          return <Bandage className="w-6 h-6 text-red-400" />
    }
  }

  // Estilo para selects/inputs — evita zoom en iOS
  const selectStyle = { fontSize: '16px', minHeight: '48px' }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Stethoscope className="w-6 h-6 text-pink-500" /> Diario de Síntomas &amp; Clasificación Clínica</h2>
        <p className="text-gray-400 text-sm">Monitoreo activo integrado con el Motor de Evaluación de Riesgos Obstetritos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Formulario de registro — primero en móvil */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-5 h-fit">
          <h3 className="font-bold text-gray-700 text-base flex items-center gap-2"><PenLine className="w-4 h-4 text-pink-400" /> ¿Cómo te sientes hoy?</h3>
          
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
                    className={`py-4 px-2 border rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[72px]
                      ${bienestarDia === b ? 'bg-pink-500 border-pink-500 text-white shadow-sm shadow-pink-100' : 'border-gray-200 hover:border-pink-300 text-gray-600 bg-white'}
                    `}
                  >
                    {getIconBienestar(b)}
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Clasificación de Síntomas Clínicos */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Marcar Síntomas Presentes</label>
              <div className="flex flex-wrap gap-2 mt-1 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-xl bg-gray-50/50">
                {SINTOMAS_CLINICOS.map((item) => {
                  const isSelected = sintomasSeleccionados.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSintoma(item.id)}
                      style={{ minHeight: '40px' }}
                      className={`text-xs font-semibold px-3 py-2.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? item.tipo === 'ALARMA'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse'
                            : 'bg-pink-500 text-white border-pink-500 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {item.icon}{item.texto}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Movimientos fetales */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Movimientos del bebé</label>
              <select
                value={movimientos}
                onChange={e => setMovimientos(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-100 font-medium text-gray-700 mt-1"
                style={selectStyle}
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
                className="w-full border border-gray-200 rounded-xl px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-100 font-medium text-gray-700 mt-1"
                style={selectStyle}
              >
                <option>No, ninguna</option>
                <option>Sí, en los pies</option>
                <option>Sí, en las manos</option>
                <option>Sí, en la cara</option>
                <option>Sí, en varias partes del cuerpo</option>
              </select>
            </div>

            {/* Notas adicionales */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Notas adicionales</label>
              <textarea
                rows={2}
                value={detalles}
                onChange={e => setDetalles(e.target.value)}
                placeholder="Ej: dolor de espalda leve, reflujo nocturno..."
                className="w-full border border-gray-200 rounded-xl px-3 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-100 mt-1"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Avisos SOS */}
            {alarmaCritico && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs leading-relaxed font-semibold">
                <AlertTriangle className="w-4 h-4 inline mr-1" /><strong>Signo de Alarma detectado.</strong> Has marcado síntomas de riesgo clínico. Si sientes dolor abdominal fuerte, sangrado vaginal o falta de movimientos fetales, presiona el botón SOS inmediatamente.
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm font-bold text-center">
                <Check className="w-4 h-4 inline mr-1" />{successMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-base font-bold transition-all shadow-md mt-1"
            >
              Guardar Reporte Clínico
            </button>
          </form>
        </div>

        {/* Historial de reportes — abajo en móvil, col-span-2 en lg */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-pink-400" /> Historial de Bienestar &amp; Signos Registrados</h3>
          
          {sintomasHistorial.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Stethoscope className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Aún no has registrado tus síntomas diarios.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[520px] overflow-y-auto pr-1">
              {sintomasHistorial.map((s, index) => (
                <div
                  key={s.id || `sintoma-hist-${index}-${s.fecha}`}
                  className={`p-5 border rounded-2xl flex flex-col gap-2 transition-all hover:bg-gray-50/50
                    ${s.esCritico ? 'border-rose-200 bg-rose-50/20' : 'border-gray-100'}
                  `}
                >
                  <div className="flex justify-between items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {getIconBienestar(s.bienestar || s.estado)}
                      <span className="font-bold text-sm text-gray-700">Estado: {s.bienestar || s.estado || 'Bien'}</span>
                    </div>
                    
                    <span className="text-xs text-gray-400 font-bold">
                      {new Date(s.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {s.sintomas && (
                    <div className="text-sm bg-pink-50/50 text-pink-700 p-2 rounded-xl border border-pink-100/50 font-medium">
                      <Tag className="w-3 h-3 inline mr-1" /><strong>Síntomas reportados:</strong> {s.sintomas}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 text-sm border-t border-gray-50 pt-2">
                    <div>
                      <span className="font-bold text-gray-400 block uppercase text-xs mb-0.5">Movimientos fetales</span>
                      <span className="text-gray-700 font-medium">{s.movimientos}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-400 block uppercase text-xs mb-0.5">Hinchazón (Edemas)</span>
                      <span className="text-gray-700 font-medium">{s.hinchazon}</span>
                    </div>
                  </div>

                  {s.detalles && (
                    <div className="mt-1 text-sm bg-gray-50 p-2.5 rounded-xl text-gray-600 leading-relaxed italic border border-gray-100">
                      "{s.detalles}"
                    </div>
                  )}

                  {s.esCritico && (
                    <span className="text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full w-fit mt-1 uppercase animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Clasificación: Riesgo Clínico Detectado
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
