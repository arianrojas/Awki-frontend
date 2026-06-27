import React, { useState, useEffect } from 'react'
import BarraLateral from './components/BarraLateral'
import Encabezado from './components/Encabezado'
import VistaInicio from './components/views/VistaInicio'
import VistaPendiente from './components/views/VistaPendiente'
import FormularioPaciente from './components/views/FormularioPaciente'
import DoctorDashboard from './components/views/DoctorDashboard'
import VistaLogin from './components/views/VistaLogin'
import VistaChat from './components/views/VistaChat'
import VistaDocumentos from './components/views/VistaDocumentos'
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
    if (activeTab === 'inicio')     return <VistaInicio currentUser={currentUser} onPregnancyCreated={handlePregnancyCreated} />
    if (activeTab === 'mensajes')   return <VistaChat />
    if (activeTab === 'perfil')     return <FormularioPaciente currentUser={currentUser} onVinculacionComplete={handleReloadEmbarazo} />
    if (activeTab === 'ecografias') return <VistaDocumentos />
    if (activeTab === 'doctor')     return <DoctorDashboard />
    return <VistaPendiente tab={activeTab} />
  }

  return (
    <div className="flex h-screen bg-[#f9f5ff] overflow-hidden">
      <BarraLateral activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
      <div className="flex flex-col flex-1 ml-[220px] h-screen overflow-hidden">
        <Encabezado activeTab={activeTab} currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
      <BotonSos currentUser={currentUser} />
    </div>
  )
}
