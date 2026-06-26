import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import InicioView from './components/views/InicioView'
import PlaceholderView from './components/views/PlaceholderView'

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio')

  const renderView = () => {
    if (activeTab === 'inicio') {
      return <InicioView />
    }
    return <PlaceholderView tab={activeTab} />
  }

  return (
    <div className="flex h-screen bg-[#f9f5ff] overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 ml-[220px] h-screen overflow-hidden">
        {/* Header */}
        <Header activeTab={activeTab} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
