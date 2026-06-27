import React, { useState, useEffect } from 'react'
import BarraLateral from './components/BarraLateral'
import Encabezado from './components/Encabezado'
import VistaInicio from './components/views/VistaInicio'
import VistaPendiente from './components/views/VistaPendiente'
import FormularioPaciente from './components/views/FormularioPaciente'
import DoctorDashboard from './components/views/DoctorDashboard'
import VistaLogin from './components/views/VistaLogin'

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
    }
  }, [])

  const handleLoginSuccess = () => {
    const user = JSON.parse(localStorage.getItem('awki_user') || 'null')
    setCurrentUser(user)
    setIsLoggedIn(true)
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

  const renderView = () => {
    if (activeTab === 'inicio') return <VistaInicio />
    if (activeTab === 'perfil') return <FormularioPaciente />
    if (activeTab === 'doctor') return <DoctorDashboard />
    return <VistaPendiente tab={activeTab} />
  }

  return (
    <div className="flex h-screen bg-[#f9f5ff] overflow-hidden">
      <BarraLateral activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 ml-[220px] h-screen overflow-hidden">
        <Encabezado activeTab={activeTab} currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
