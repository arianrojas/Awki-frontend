import React, { useState } from 'react'

export default function PacienteForm() {
  const [paciente, setPaciente] = useState({
    nombres: '', apellidos: '', email: '', password_hash: '',
    telefono: '', dni: '', fecha_nacimiento: '', departamento: '',
    modo_uso: 'autonomo', consentimiento_ia: false,
    consentimiento_fecha: '', activa: true
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setPaciente(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50 relative overflow-hidden mb-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-pink-50 to-purple-50 rounded-full opacity-60" />
        <div className="relative">
          <p className="text-sm font-bold text-pink-500 mb-2">Entidad: pacientes</p>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Registro de Paciente Gestante</h1>
          <p className="text-gray-500 font-medium">
            Formulario para registrar datos personales, acceso a la PWA, ubicacion y consentimiento.
          </p>
        </div>
      </div>

      <form className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-lg font-bold text-gray-800">Datos de la paciente</h2>
          <p className="text-gray-500 text-sm mt-1">Datos sensibles bajo la Ley 29733.</p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            ['Nombres', 'nombres', 'text', 'Ingrese los nombres'],
            ['Apellidos', 'apellidos', 'text', 'Ingrese los apellidos'],
            ['Email', 'email', 'email', 'correo@ejemplo.com'],
            ['Contrasena', 'password_hash', 'password', 'Ingrese una contrasena'],
            ['Telefono', 'telefono', 'tel', 'Numero para alertas SOS'],
            ['DNI o CE', 'dni', 'text', 'Documento opcional'],
            ['Fecha de nacimiento', 'fecha_nacimiento', 'date', ''],
            ['Departamento', 'departamento', 'text', 'Ej. Lima, Cusco, Arequipa'],
            ['Fecha de consentimiento', 'consentimiento_fecha', 'datetime-local', '']
          ].map(([label, name, type, placeholder]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">{label}</label>
              <input
                type={type}
                name={name}
                value={paciente[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Modo de uso</label>
            <select name="modo_uso" value={paciente.modo_uso} onChange={handleChange} className={inputClass}>
              <option value="autonomo">Autonomo</option>
              <option value="vinculada">Vinculada</option>
            </select>
          </div>

          <label className="md:col-span-2 flex items-start gap-3 p-4 rounded-2xl border border-pink-100 bg-pink-50/50">
            <input type="checkbox" name="consentimiento_ia" checked={paciente.consentimiento_ia} onChange={handleChange} className="mt-1 h-5 w-5 rounded border-pink-300 text-pink-500" />
            <span>
              <span className="block text-sm font-bold text-gray-800">Consentimiento para analisis con IA</span>
              <span className="block text-sm text-gray-500 mt-1">Acepta que sus chats sean analizados por IA.</span>
            </span>
          </label>

          <label className="md:col-span-2 flex items-start gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/70">
            <input type="checkbox" name="activa" checked={paciente.activa} onChange={handleChange} className="mt-1 h-5 w-5 rounded border-pink-300 text-pink-500" />
            <span>
              <span className="block text-sm font-bold text-gray-800">Cuenta activa</span>
              <span className="block text-sm text-gray-500 mt-1">Estado actual de la cuenta de la paciente.</span>
            </span>
          </label>
        </div>

        <div className="p-8 flex justify-end border-t border-gray-50 bg-gray-50/40">
          <button type="button" className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-200 hover:-translate-y-0.5 transition-all">
            Registrar Paciente
          </button>
        </div>
      </form>
    </div>
  )
}
