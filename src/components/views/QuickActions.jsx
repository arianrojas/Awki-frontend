import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export default function QuickActions() {
  const [modalAbierto, setModalAbierto] = useState(null)

  return (
    <>
      {createPortal(
        <>
          {modalAbierto === 'cita' && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="font-bold text-lg mb-1">Agendar cita</h2>
                <p className="text-sm text-gray-500 mb-4">Elige cuándo te gustaría que sea tu próxima cita.</p>
                <form className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">¿Qué día prefieres?</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">¿Para qué es la cita? (opcional)</label>
                    <textarea rows={2} placeholder="Ej: control mensual, dudas, ecografía..." className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button type="button" onClick={() => setModalAbierto(null)} className="px-4 py-2 rounded-lg border text-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-medium">Solicitar cita</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {modalAbierto === 'control' && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="font-bold text-lg mb-1">Registrar control</h2>
                <p className="text-sm text-gray-500 mb-4">Cuéntanos cómo te has sentido.</p>
                <form className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">¿Cómo sientes los movimientos del bebé?</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>Normales, como siempre</option>
                      <option>Los siento menos que antes</option>
                      <option>No los he sentido</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">¿Tienes hinchazón en alguna parte?</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>No, ninguna</option>
                      <option>Sí, en los pies</option>
                      <option>Sí, en las manos</option>
                      <option>Sí, en la cara</option>
                      <option>Sí, en varias partes del cuerpo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">¿Algún otro síntoma? (opcional)</label>
                    <textarea rows={2} placeholder="Ej: dolor de cabeza, náuseas, mareos..." className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button type="button" onClick={() => setModalAbierto(null)} className="px-4 py-2 rounded-lg border text-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {modalAbierto === 'peso' && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="font-bold text-lg mb-1">Registrar peso</h2>
                <p className="text-sm text-gray-500 mb-4">Anota tu peso de hoy para llevar el seguimiento.</p>
                <form className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Tu peso (kg)</label>
                    <input type="number" step="0.1" min="0" placeholder="Ej: 62.5" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Fecha</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button type="button" onClick={() => setModalAbierto(null)} className="px-4 py-2 rounded-lg border text-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {modalAbierto === 'recordatorio' && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="font-bold text-lg mb-1">Nuevo recordatorio</h2>
                <p className="text-sm text-gray-500 mb-4">Te avisaremos en la fecha y hora que elijas.</p>
                <form className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">¿De qué quieres que te recuerde?</label>
                    <input type="text" placeholder="Ej: Tomar mi vitamina, próxima cita..." className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium block mb-1">Fecha</label>
                      <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium block mb-1">Hora</label>
                      <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button type="button" onClick={() => setModalAbierto(null)} className="px-4 py-2 rounded-lg border text-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>,
        document.body
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'cita', icon: <img src='/calendario.png' alt='logo_calendario' className="w-7 h-7" />, label: 'Agendar cita', sub: 'Reservar nueva cita', color: 'bg-pink-50 text-pink-600 border-pink-100' },
          { id: 'control', icon: <img src='/control.png' alt='logo_control' className="w-7 h-7" />, label: 'Registrar control', sub: 'Añadir nuevo control', color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { id: 'peso', icon: <img src='/peso.png' alt='logo_peso' className="w-7 h-7" />, label: 'Registrar peso', sub: 'Llevar seguimiento', color: 'bg-green-50 text-green-600 border-green-100' },
          { id: 'recordatorio', icon: <img src='/notificacion.png' alt='logo_notificacion' className="w-7 h-7" />, label: 'Recordatorios', sub: 'Ver mis alertas', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => setModalAbierto(a.id)}
            className={`flex flex-col items-start p-4 rounded-2xl border ${a.color} hover:scale-[1.03] transition-all duration-200 shadow-sm text-left`}
          >
            <span className="mb-2">{a.icon}</span>
            <p className="font-bold text-[13px] leading-tight">{a.label}</p>
            <p className="text-[11px] opacity-70 mt-0.5">{a.sub}</p>
          </button>
        ))}
      </div>
    </>
  )
}
