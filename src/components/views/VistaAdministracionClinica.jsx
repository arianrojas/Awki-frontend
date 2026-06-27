import React, { useState, useEffect } from 'react'

export default function VistaAdministracionClinica() {
  const [metricas, setMetricas] = useState({
    nombreClinica: 'Clínica Materno Infantil San Pablo',
    totalMedicos: 8,
    maxMedicosPermitidos: 10,
    totalPacientes: 45,
    embarazosAltoRiesgo: 6,
    controlesEsteMes: 128
  })

  const [medicos, setMedicos] = useState([
    { id: '1', nombre: 'Dr. Marco Silva', especialidad: 'Ginecobstetra', email: 'msilva@clinica.com', colegioMedico: 'CMP-45892', estado: 'ACTIVO', pacientesAsignadas: 18 },
    { id: '2', nombre: 'Dra. Elena Ramos', especialidad: 'Obstetricia de Alto Riesgo', email: 'eramos@clinica.com', colegioMedico: 'CMP-51204', estado: 'ACTIVO', pacientesAsignadas: 14 },
    { id: '3', nombre: 'Dr. Roberto Vargas', especialidad: 'Ecografía Fetal', email: 'rvargas@clinica.com', colegioMedico: 'CMP-39871', estado: 'ACTIVO', pacientesAsignadas: 13 },
  ])

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [newMedico, setNewMedico] = useState({
    nombre: '',
    email: '',
    password: '',
    colegioMedico: '',
    especialidad: 'Ginecología y Obstetricia'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const resMetricas = await fetch('http://localhost:8080/api/v1/clinica/metricas', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resMetricas.ok) {
        const data = await resMetricas.json()
        if (data.data) setMetricas(data.data)
      }

      const resMedicos = await fetch('http://localhost:8080/api/v1/clinica/medicos', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resMedicos.ok) {
        const data = await resMedicos.json()
        if (data.data && data.data.length > 0) setMedicos(data.data)
      }
    } catch (err) {
      console.log('Usando datos de demostración clínica')
    }
  }

  const handleRegisterMedico = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const token = localStorage.getItem('token')

    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/register/medico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newMedico)
      })

      if (res.ok) {
        setMessage('✅ Médico registrado exitosamente en la clínica.')
        setShowRegisterModal(false)
        setNewMedico({ nombre: '', email: '', password: '', colegioMedico: '', especialidad: 'Ginecología y Obstetricia' })
        fetchData()
      } else {
        const errData = await res.json()
        setMessage(`❌ Error: ${errData.message || 'No se pudo registrar al médico.'}`)
      }
    } catch (err) {
      // Demo fallback
      setMedicos(prev => [...prev, {
        id: Date.now().toString(),
        nombre: newMedico.nombre,
        email: newMedico.email,
        especialidad: newMedico.especialidad,
        colegioMedico: newMedico.colegioMedico,
        estado: 'ACTIVO',
        pacientesAsignadas: 0
      }])
      setMetricas(prev => ({ ...prev, totalMedicos: prev.totalMedicos + 1 }))
      setMessage('✅ Médico registrado localmente (Modo Demo).')
      setShowRegisterModal(false)
    } finally {
      setLoading(false)
    }
  }

  const toggleEstadoMedico = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    setMedicos(prev => prev.map(m => m.id === id ? { ...m, estado: nuevoEstado } : m))
    
    const token = localStorage.getItem('token')
    try {
      await fetch(`http://localhost:8080/api/v1/clinica/medicos/${id}/estado?activo=${nuevoEstado === 'ACTIVO'}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      console.log('Estado actualizado localmente')
    }
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              🏥 Panel de Administración Institucional
            </span>
            <h2 className="text-3xl font-black">{metricas.nombreClinica}</h2>
            <p className="text-white/80 text-sm mt-1">Gestión de staff médico, licencias SaaS y métricas materno-infantiles.</p>
          </div>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-5 py-3 bg-white text-purple-700 hover:bg-purple-50 font-bold rounded-2xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 self-start md:self-auto text-sm"
          >
            ➕ Registrar Nuevo Médico
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-semibold ${message.startsWith('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {message}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-bold">
            👨‍⚕️
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">Staff Médico</p>
            <p className="text-2xl font-black text-gray-800">{metricas.totalMedicos} <span className="text-xs font-normal text-gray-400">/ {metricas.maxMedicosPermitidos} cupos</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-2xl font-bold">
            🤰
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">Gestantes Activas</p>
            <p className="text-2xl font-black text-gray-800">{metricas.totalPacientes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">
            ⚠️
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">Casos de Alto Riesgo</p>
            <p className="text-2xl font-black text-rose-600">{metricas.embarazosAltoRiesgo}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold">
            📅
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium">Controles este Mes</p>
            <p className="text-2xl font-black text-gray-800">{metricas.controlesEsteMes}</p>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Directorio de Médicos Obstetras</h3>
            <p className="text-xs text-gray-400">Administra los accesos y estado operativo del cuerpo médico.</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
            Licencias activas: {metricas.totalMedicos} de {metricas.maxMedicosPermitidos}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Médico Especialista</th>
                <th className="py-3 px-4">Especialidad / CMP</th>
                <th className="py-3 px-4">Pacientes</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {medicos.map(medico => (
                <tr key={medico.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {medico.nombre.split(' ').map(n => n[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{medico.nombre}</p>
                      <p className="text-xs font-normal text-gray-400">{medico.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700 font-medium">{medico.especialidad}</p>
                    <p className="text-xs text-gray-400">{medico.colegioMedico}</p>
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-700">
                    {medico.pacientesAsignadas} gestantes
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${medico.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${medico.estado === 'ACTIVO' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {medico.estado}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => toggleEstadoMedico(medico.id, medico.estado)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${medico.estado === 'ACTIVO' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      {medico.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 animate-fade-in relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-gray-800 mb-1">Registrar Nuevo Médico</h3>
            <p className="text-xs text-gray-400 mb-6">Asigna credenciales de acceso para el personal médico colegiado.</p>

            <form onSubmit={handleRegisterMedico} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dr. Carlos Mendoza"
                  value={newMedico.nombre}
                  onChange={e => setNewMedico({ ...newMedico, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="medico@clinica.com"
                  value={newMedico.email}
                  onChange={e => setNewMedico({ ...newMedico, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newMedico.password}
                  onChange={e => setNewMedico({ ...newMedico, password: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">CMP / Colegiatura</label>
                  <input
                    type="text"
                    required
                    placeholder="CMP-12345"
                    value={newMedico.colegioMedico}
                    onChange={e => setNewMedico({ ...newMedico, colegioMedico: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Especialidad</label>
                  <select
                    value={newMedico.especialidad}
                    onChange={e => setNewMedico({ ...newMedico, especialidad: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="Ginecología y Obstetricia">Obstetricia General</option>
                    <option value="Alto Riesgo Obstétrico">Alto Riesgo</option>
                    <option value="Ecografía Fetal">Ecografía Fetal</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {loading ? 'Registrando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
