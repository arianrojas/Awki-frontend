import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function BotonSos({ currentUser }) {
  const [showModal, setShowModal] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [estado, setEstado] = useState('idle') // idle, counting, sending, success, offline_fallback
  const [contactos, setContactos] = useState([])
  const [gps, setGps] = useState({ lat: null, lon: null })

  // Cargar contactos de emergencia al iniciar
  useEffect(() => {
    if (currentUser && currentUser.role === 'PACIENTE') {
      api.get('/api/v1/contactos-emergencia')
        .then(res => {
          setContactos(res || [])
        })
        .catch(err => console.error("Error al cargar contactos de emergencia:", err))

      // Obtener ubicación GPS de forma pasiva
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          err => {
            console.warn("No se pudo obtener ubicación GPS real. Asignando coordenadas simuladas de prueba.");
            setGps({ lat: -12.046374, lon: -77.042793 });
          },
          { timeout: 5000 }
        )
      } else {
        setGps({ lat: -12.046374, lon: -77.042793 });
      }
    }
  }, [currentUser])

  // Escuchar reconexión a Internet para sincronizar SOS offline (Nivel 4)
  useEffect(() => {
    const handleOnline = async () => {
      const offlineQueue = JSON.parse(localStorage.getItem('awki_sos_offline') || '[]')
      if (offlineQueue.length === 0) return

      console.log("¡Conexión recuperada! Sincronizando alertas SOS offline pendientes...")
      for (const alert of offlineQueue) {
        try {
          await api.post('/api/v1/alertas/sos', alert)
        } catch (err) {
          console.error("Error al sincronizar alerta offline:", err)
        }
      }
      localStorage.removeItem('awki_sos_offline')
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  // Iniciar la secuencia de SOS
  const handleStartSos = () => {
    setCountdown(3)
    setEstado('counting')
    setShowModal(true)
  }

  // Manejar la cuenta regresiva
  useEffect(() => {
    let timer
    if (estado === 'counting') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      } else {
        triggerSosAlert()
      }
    }
    return () => clearTimeout(timer)
  }, [countdown, estado])

  // Cancelar SOS
  const handleCancel = () => {
    setEstado('idle')
    setShowModal(false)
  }

  // Disparar la alerta SOS (Niveles 1, 2 y 3)
  const triggerSosAlert = async () => {
    setEstado('sending')
    
    const embarazoId = currentUser?.embarazoId ?? null
    const payload = {
      embarazoId,
      latitud: gps.lat,
      longitud: gps.lon,
      mensajeLibre: "¡ALERTA DE EMERGENCIA SOS DISPARADA DESDE LA APP!"
    }

    // Timeout de 3 segundos usando AbortController (Nivel 1)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
      const token = localStorage.getItem('awki_token')
      const res = await fetch(`${baseUrl}/api/v1/alertas/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (res.ok) {
        setEstado('success')
        setTimeout(() => setShowModal(false), 2000)
      } else {
        throw new Error('Servidor respondió con error')
      }
    } catch (err) {
      console.warn("Fallo de red en Nivel 1. Activando Nivel 2 y 3 (Offline Fallbacks).", err)
      
      // Nivel 2: Guardar en cola offline de LocalStorage
      const offlineQueue = JSON.parse(localStorage.getItem('awki_sos_offline') || '[]')
      offlineQueue.push(payload)
      localStorage.setItem('awki_sos_offline', JSON.stringify(offlineQueue))

      setEstado('offline_fallback')
    }
  }

  // Obtener datos del contacto de emergencia prioritario o usar genérico
  const contactoPrioritario = contactos[0] ?? { nombre: 'Contacto de Emergencia', telefono: '106' }
  const mapsUrl = gps.lat ? `http://maps.google.com/?q=${gps.lat},${gps.lon}` : ''
  const smsBody = `EMERGENCIA SOS: Requiero asistencia medica inmediata. Mi ubicacion: ${mapsUrl}`
  const smsUri = `sms:${contactoPrioritario.telefono}?body=${encodeURIComponent(smsBody)}`
  const telUri = `tel:${contactoPrioritario.telefono}`

  if (!currentUser || currentUser.role !== 'PACIENTE') return null

  return (
    <>
      {/* Botón Flotante de SOS */}
      <button
        onClick={handleStartSos}
        className="fixed bottom-6 right-6 z-[80] w-16 h-16 rounded-full bg-red-600 text-white font-extrabold shadow-2xl hover:bg-red-700 transition-all duration-300 hover:scale-110 flex items-center justify-center border-4 border-white animate-bounce-slow"
      >
        <span className="text-xl tracking-wider select-none">SOS</span>
      </button>

      {/* Modal de Emergencia */}
      {showModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-red-50 flex flex-col items-center gap-6 relative overflow-hidden">
            
            {/* Animación del fondo del radar */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-50/40 rounded-full animate-ping pointer-events-none" />

            {estado === 'counting' && (
              <>
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-5xl font-black animate-pulse relative z-10">
                  {countdown}
                </div>
                <div className="z-10">
                  <h3 className="text-xl font-black text-gray-800">Iniciando Alerta SOS</h3>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                    La alerta se enviará automáticamente en {countdown} segundos. Prepárate para reportar tu estado clínico.
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="z-10 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Cancelar SOS
                </button>
              </>
            )}

            {estado === 'sending' && (
              <>
                <div className="w-20 h-20 rounded-full border-4 border-red-200 border-t-red-600 animate-spin z-10" />
                <div className="z-10">
                  <h3 className="text-lg font-bold text-gray-800">Enviando Alerta...</h3>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">Conectando con el servidor médico obstétrico de guardia.</p>
                </div>
              </>
            )}

            {estado === 'success' && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-4xl z-10">
                  ✓
                </div>
                <div className="z-10">
                  <h3 className="text-xl font-bold text-gray-800">¡Alerta Recibida!</h3>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">Tu médico y la clínica han sido notificados. Mantén la calma.</p>
                </div>
              </>
            )}

            {estado === 'offline_fallback' && (
              <>
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-4xl z-10 animate-bounce">
                  ⚠
                </div>
                <div className="z-10">
                  <h3 className="text-lg font-extrabold text-gray-800">Canal Fuera de Línea</h3>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                    No pudimos conectar con el servidor. Se ha guardado la alerta y activamos los canales locales de auxilio prioritario.
                  </p>
                </div>
                <div className="w-full flex flex-col gap-2.5 z-10">
                  {/* Nivel 2: SMS Nativo */}
                  <a
                    href={smsUri}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl text-center shadow-md transition-colors"
                  >
                    💬 Enviar SMS de Emergencia
                  </a>
                  {/* Nivel 3: Llamar directo */}
                  <a
                    href={telUri}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl text-center shadow-md transition-colors animate-pulse"
                  >
                    📞 Llamar a {contactoPrioritario.nombre}
                  </a>
                  <button
                    onClick={handleCancel}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-[10px] transition-colors mt-1"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  )
}
