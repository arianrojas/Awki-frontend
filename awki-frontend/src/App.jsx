import React, { useState, useEffect } from 'react'
import BarraLateral from './components/BarraLateral'
import BottomNavGestante from './components/BottomNavGestante'
import Encabezado from './components/Encabezado'
import VistaInicio from './components/views/VistaInicio'
import VistaPendiente from './components/views/VistaPendiente'
import FormularioPaciente from './components/views/FormularioPaciente'
import DoctorDashboard from './components/views/DoctorDashboard'
import VistaLogin from './components/views/VistaLogin'
import VistaChat from './components/views/VistaChat'
import VistaDocumentos from './components/views/VistaDocumentos'
import VistaEmbarazo from './components/views/VistaEmbarazo'
import VistaControlesCitas from './components/views/VistaControlesCitas'
import VistaHistorial from './components/views/VistaHistorial'
import VistaSintomas from './components/views/VistaSintomas'
import VistaRecordatorios from './components/views/VistaRecordatorios'
import VistaEducacion from './components/views/VistaEducacion'
import VistaAdministracionClinica from './components/views/VistaAdministracionClinica'
import BotonSos from './components/BotonSos'

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Verificar sesión guardada al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('awki_token')
    const user = JSON.parse(localStorage.getItem('awki_user') || 'null')
    if (token && user) {
      setIsLoggedIn(true)
      setCurrentUser(user)
      if (user.role === 'MEDICO' || user.role === 'ADMIN_CLINICA') {
        setActiveTab('doctor')
      } else {
        setActiveTab('inicio')
      }
    }
  }, [])

  const handleLoginSuccess = () => {
    const user = JSON.parse(localStorage.getItem('awki_user') || 'null')
    setCurrentUser(user)
    setIsLoggedIn(true)
    if (user && (user.role === 'MEDICO' || user.role === 'ADMIN_CLINICA')) {
      setActiveTab('doctor')
    } else {
      setActiveTab('inicio')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('awki_token')
    localStorage.removeItem('awki_user')
    setIsLoggedIn(false)
    setCurrentUser(null)
    setActiveTab('inicio')
  }

  // Si no hay sesión, mostrar pantalla de login
  if (!isLoggedIn) {
    return <VistaLogin onLoginSuccess={handleLoginSuccess} />
  }

  const handlePregnancyCreated = (embarazoData) => {
    const updatedUser = {
      ...currentUser,
      embarazoId:         embarazoData.id,
      semanasGestacion:   embarazoData.semanasGestacionActuales,
      trimestre:          embarazoData.trimestre,
      fechaProbableParto: embarazoData.fechaProbableParto,
    }
    localStorage.setItem('awki_user', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  const handleReloadEmbarazo = async () => {
    const token = localStorage.getItem('awki_token')
    if (!token || !currentUser) return
    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
      const res = await fetch(`${baseUrl}/api/v1/embarazos/activo`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const body = await res.json()
        const embarazoData = body?.data ?? null
        if (embarazoData) {
          const updatedUser = {
            ...currentUser,
            embarazoId:         embarazoData.id,
            semanasGestacion:   embarazoData.semanasGestacionActuales,
            trimestre:          embarazoData.trimestre,
            fechaProbableParto: embarazoData.fechaProbableParto,
            medicoId:           embarazoData.medicoId,
          }
          localStorage.setItem('awki_user', JSON.stringify(updatedUser))
          setCurrentUser(updatedUser)
        }
      }
    } catch (err) {
      console.error("Error al recargar embarazo:", err)
    }
  }

  const renderView = () => {
    if (activeTab === 'inicio')        return <VistaInicio currentUser={currentUser} onPregnancyCreated={handlePregnancyCreated} />
    if (activeTab === 'mensajes')      return <VistaChat />
    if (activeTab === 'perfil')        return <FormularioPaciente currentUser={currentUser} onVinculacionComplete={handleReloadEmbarazo} />
    if (activeTab === 'ecografias')    return <VistaDocumentos />
    if (activeTab === 'embarazo')      return <VistaEmbarazo />
    if (activeTab === 'controles')     return <VistaControlesCitas />
    if (activeTab === 'historial')     return <VistaHistorial />
    if (activeTab === 'sintomas')      return <VistaSintomas />
    if (activeTab === 'recordatorios') return <VistaRecordatorios />
    if (activeTab === 'educacion')     return <VistaEducacion />
    if (activeTab === 'doctor')        return <DoctorDashboard />
    if (activeTab === 'admin_clinica') return <VistaAdministracionClinica />
    return <VistaPendiente tab={activeTab} />
  }

  const isDoctor = currentUser?.role === 'MEDICO' || currentUser?.role === 'ADMIN_CLINICA'

  // ── LAYOUT DOCTOR (Desktop-First) ──────────────────────────────────────────
  if (isDoctor) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar fija de 240px solo para doctores */}
        <BarraLateral
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
        />
        {/* Contenido principal con margen para sidebar */}
        <div
          className="flex flex-col flex-1 h-screen overflow-hidden"
          style={{ marginLeft: 'var(--doctor-sidebar-width)' }}
        >
          <Encabezado
            activeTab={activeTab}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-y-auto p-6">
            {renderView()}
          </main>
        </div>
      </div>
    )
  }

  // ── LAYOUT GESTANTE (Mobile-First) ─────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#f9f5ff] overflow-hidden">
      {/* Header compacto */}
      <Encabezado
        activeTab={activeTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main — con padding-bottom para bottom nav */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        <div className="px-4 py-4 max-w-2xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Botón SOS flotante */}
      <BotonSos currentUser={currentUser} />

      {/* Bottom navigation fija */}
      <BottomNavGestante
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </div>
  )
}
