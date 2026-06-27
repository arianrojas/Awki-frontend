import React from 'react'

export default function DoctorDashboard() {
  const stats = [
    { label: 'Pacientes Activas', value: '142', icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Citas Hoy', value: '8', icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Alertas', value: '3', icon: '⚠️', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ]

  const upcomingAppointments = [
    { time: '09:00 AM', patient: 'María Fernanda', type: 'Control Prenatal (Sem 22)', status: 'En espera' },
    { time: '10:30 AM', patient: 'Lucía Gómez', type: 'Primera Cita', status: 'Confirmada' },
    { time: '11:45 AM', patient: 'Ana Silva', type: 'Revisión de Ecografía', status: 'Confirmada' },
    { time: '02:00 PM', patient: 'Carla Ruiz', type: 'Control Prenatal (Sem 35)', status: 'Confirmada' },
  ]

  const patients = [
    { id: 1, name: 'María Fernanda', age: 24, weeks: 22, nextAppt: 'Hoy, 09:00 AM', risk: 'Bajo', initials: 'MF', color: 'bg-green-100 text-green-700' },
    { id: 2, name: 'Carla Ruiz', age: 31, weeks: 35, nextAppt: 'Hoy, 02:00 PM', risk: 'Moderado', initials: 'CR', color: 'bg-amber-100 text-amber-700' },
    { id: 3, name: 'Elena Torres', age: 28, weeks: 12, nextAppt: '15 Jun, 10:00 AM', risk: 'Bajo', initials: 'ET', color: 'bg-green-100 text-green-700' },
    { id: 4, name: 'Sofía Vargas', age: 35, weeks: 28, nextAppt: '18 Jun, 04:30 PM', risk: 'Alto', initials: 'SV', color: 'bg-red-100 text-red-700' },
  ]

  return (
    <div className="animate-fade-in max-w-6xl mx-auto flex flex-col gap-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-60" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👨‍⚕️</span>
            <p className="text-sm font-bold text-blue-500 uppercase tracking-wider">Panel Médico</p>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Hola, Dr. Mendoza</h1>
          <p className="text-gray-500 font-medium max-w-2xl">
            Aquí tienes un resumen de tu agenda para hoy y el estado general de tus pacientes. Tienes 3 alertas que requieren tu atención.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-2xl p-6 shadow-sm border ${stat.border} flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300`}>
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center text-3xl shadow-inner`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Próximas Citas */}
        <div className="xl:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Citas de Hoy</h2>
            <button className="text-blue-500 text-sm font-bold hover:text-blue-700 transition-colors">Ver Calendario</button>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {upcomingAppointments.map((appt, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="flex flex-col items-center">
                  <p className="text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">{appt.time.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-400">{appt.time.split(' ')[1]}</p>
                  {i !== upcomingAppointments.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-100 my-1 group-hover:bg-blue-100 transition-colors" />
                  )}
                </div>
                <div className={`flex-1 rounded-2xl p-4 border transition-all duration-200 shadow-sm ${appt.status === 'En espera' ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:border-blue-200 hover:shadow-md'}`}>
                  <p className="font-bold text-gray-800 text-[14px]">{appt.patient}</p>
                  <p className="text-blue-600 font-medium text-[12px] my-1">{appt.type}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${appt.status === 'En espera' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-bold hover:bg-gray-50 hover:text-blue-500 hover:border-blue-200 transition-all">
            + Agendar nueva cita
          </button>
        </div>

        {/* Pacientes Activas */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold text-gray-800">Directorio de Pacientes</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Buscar paciente..." className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
                Buscar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-semibold text-gray-400 text-[12px] uppercase">Paciente</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[12px] uppercase">Edad</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[12px] uppercase">Semanas</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[12px] uppercase">Nivel de Riesgo</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[12px] uppercase">Próxima Cita</th>
                  <th className="pb-3 font-semibold text-gray-400 text-[12px] uppercase">Acción</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-300 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {p.initials}
                        </div>
                        <span className="font-bold text-gray-800 text-[14px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 text-sm font-medium">{p.age}</td>
                    <td className="py-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Sem. {p.weeks}</span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.color}`}>
                        {p.risk}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600 text-sm font-medium">{p.nextAppt}</td>
                    <td className="py-4">
                      <button className="text-blue-500 hover:text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg transition-colors hover:bg-blue-100">
                        Ver ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  )
}
