import React, { useState } from 'react'
import BarraLateral from './components/BarraLateral'
import Encabezado from './components/Encabezado'
import VistaInicio from './components/views/VistaInicio'
import VistaPendiente from './components/views/VistaPendiente'
import FormularioPaciente from './components/views/FormularioPaciente'
import DoctorDashboard from './components/views/DoctorDashboard'

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio')

  const renderView = () => {
    if (activeTab === 'inicio') {
      return <VistaInicio />
    }
    if (activeTab === 'perfil') {
      return <FormularioPaciente />
    }
    if (activeTab === 'doctor') {
      return <DoctorDashboard />
    }
    return <VistaPendiente tab={activeTab} />
  }

  return (
    <div className="flex h-screen bg-[#f9f5ff] overflow-hidden">
      {/* Sidebar */}
      <BarraLateral activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 ml-[220px] h-screen overflow-hidden">
        {/* Header */}
        <Encabezado activeTab={activeTab} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
