import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import { Heart, Microscope, Pill, ClipboardList, Paperclip, FolderOpen, Folder, Upload, FileText, Image, Eye, X, AlertTriangle, Check } from 'lucide-react'

const TIPO_DOCS = [
  { value: 'ECOGRAFIA',      label: 'Ecografías',                icon: <Heart className="w-4 h-4" />,        color: 'border-pink-200 hover:border-pink-400 bg-pink-50/30' },
  { value: 'LABORATORIO',    label: 'Exámenes de Laboratorio',   icon: <Microscope className="w-4 h-4" />,   color: 'border-blue-200 hover:border-blue-400 bg-blue-50/30' },
  { value: 'RECETA',         label: 'Recetas Médicas',           icon: <Pill className="w-4 h-4" />,         color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30' },
  { value: 'CARNET_PRENATAL',label: 'Carnet Prenatal',           icon: <ClipboardList className="w-4 h-4" />,color: 'border-purple-200 hover:border-purple-400 bg-purple-50/30' },
  { value: 'OTRO',           label: 'Otros Documentos',          icon: <Paperclip className="w-4 h-4" />,    color: 'border-gray-200 hover:border-gray-400 bg-gray-50/30' }
]

export default function VistaDocumentos({ embarazoId: propEmbarazoId, isDoctor = false }) {
  const [documentos, setDocumentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [generandoEpicrisis, setGenerandoEpicrisis] = useState(false)

  const handleGenerarEpicrisis = async () => {
    if (!embarazoId) return
    if (!window.confirm('¿Desea generar el documento PDF de Epicrisis para este embarazo?')) return
    setGenerandoEpicrisis(true)
    setError(null)
    setSuccess(null)

    try {
      const resp = await api.post('/api/v1/epicrisis/generar', {
        embarazoId,
        motivoDerivacion: 'Alta regular / Control / Cierre de Expediente',
        observacionesAdicionales: 'Documento generado automáticamente desde el sistema Awki.'
      })
      
      const jobId = resp?.id || resp?.jobId // Dependiendo de EpicrisisJobResponse
      if (!jobId) throw new Error("No se obtuvo Job ID")
      
      // Polling
      let successStatus = false
      let epicrisisId = null
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const statusResp = await api.get(`/api/v1/epicrisis/estado/${jobId}`)
        if (statusResp.estado === 'COMPLETADO') {
          successStatus = true
          epicrisisId = statusResp.epicrisisId
          break
        }
        if (statusResp.estado === 'FALLIDO') {
          throw new Error("La generación falló en el servidor.")
        }
      }

      if (!successStatus) {
        throw new Error("Tiempo de espera agotado generando Epicrisis.")
      }

      // Descargar PDF
      const token = localStorage.getItem('awki_token')
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
      const pdfResp = await fetch(`${baseUrl}/api/v1/epicrisis/${epicrisisId}/descargar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!pdfResp.ok) throw new Error("Error al descargar el PDF generado")

      const blob = await pdfResp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Epicrisis_${epicrisisId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setSuccess('Epicrisis generada y descargada con éxito.')
    } catch (err) {
      setError(err.message || 'Error al generar Epicrisis')
    } finally {
      setGenerandoEpicrisis(false)
    }
  }

  // Estados del Formulario de subida
  const [archivo, setArchivo] = useState(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState('ECOGRAFIA')

  // Obtener embarazoId del usuario logueado si no se proporciona como prop
  const user = JSON.parse(localStorage.getItem('awki_user') || 'null')
  const embarazoId = propEmbarazoId ?? user?.embarazoId ?? null

  const cargarDocumentos = useCallback(async () => {
    if (!embarazoId) {
      setCargando(false)
      return
    }
    setCargando(true)
    setError(null)
    try {
      const resp = await api.get('/api/v1/documentos', { embarazoId, page: 0, size: 50 })
      const content = Array.isArray(resp) ? resp : (resp?.content ?? [])
      setDocumentos(content)
    } catch (err) {
      setError('Error al listar documentos: ' + err.message)
    } finally {
      setCargando(false)
    }
  }, [embarazoId])

  useEffect(() => {
    cargarDocumentos()
  }, [cargarDocumentos])

  const handleArchivoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0])
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!archivo || !embarazoId) return

    setSubiendo(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('embarazoId', embarazoId)
    formData.append('tipoDocumento', tipoSeleccionado)
    formData.append('archivo', archivo)

    try {
      const token = localStorage.getItem('awki_token')
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

      const response = await fetch(`${baseUrl}/api/v1/documentos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error en la subida del documento')
      }

      setSuccess('Documento subido con éxito')
      setArchivo(null)
      // Reset input element
      const fileInput = document.getElementById('archivo-input')
      if (fileInput) fileInput.value = ''

      cargarDocumentos()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  const handleDescargar = async (documentoId) => {
    try {
      const resp = await api.get(`/api/v1/documentos/${documentoId}/url`)
      if (resp && resp.url) {
        window.open(resp.url, '_blank')
      } else {
        throw new Error('No se pudo generar la URL de descarga')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleEliminar = async (documentoId) => {
    if (!window.confirm('¿Está seguro de eliminar este documento? Esta acción no se puede deshacer.')) return
    try {
      await api.delete(`/api/v1/documentos/${documentoId}`)
      setSuccess('Documento eliminado correctamente')
      cargarDocumentos()
    } catch (err) {
      setError('Error al eliminar: ' + err.message)
    }
  }

  const getBadgeStyle = (tipo) => {
    switch (tipo) {
      case 'ECOGRAFIA':
        return 'bg-pink-100 text-pink-700 border-pink-200'
      case 'LABORATORIO':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'RECETA':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'CARNET_PRENATAL':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (!embarazoId && !cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl p-8 border border-pink-100 shadow-sm max-w-xl mx-auto">
        <FolderOpen className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">No se detectó un embarazo activo</h3>
        <p className="text-gray-400 text-sm max-w-sm">
          Se requiere un registro de embarazo activo para poder gestionar o visualizar sus documentos clínicos.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Folder className="w-6 h-6 text-pink-500" /> Ecografías y Exámenes Clínicos</h2>
        <p className="text-gray-400 text-sm">Gestiona y comparte tus documentos médicos (recetas, ecografías y carnets) de manera segura.</p>
      </div>

      {/* Grid: Subida a la izquierda, listado a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario de Subida (Sólo si no está restringido o según rol) */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-5 h-fit">
          <h3 className="font-bold text-gray-700 text-base flex items-center gap-2"><Upload className="w-4 h-4 text-pink-400" /> Subir Nuevo Documento</h3>
          
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            {/* Categoría / Tipo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Tipo de Documento</label>
              <select
                value={tipoSeleccionado}
                onChange={(e) => setTipoSeleccionado(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all font-medium text-gray-700"
              >
                <option value="ECOGRAFIA">Ecografía</option>
                <option value="LABORATORIO">Exámenes de Laboratorio</option>
                <option value="RECETA">Recetas Médicas</option>
                <option value="CARNET_PRENATAL">Carnet Prenatal</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            {/* Selector de Archivo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Archivo</label>
              <div className="border-2 border-dashed border-pink-200 hover:border-pink-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-pink-50/10 transition-colors relative">
                <input
                  id="archivo-input"
                  type="file"
                  onChange={handleArchivoChange}
                  accept=".pdf,image/*"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="w-6 h-6 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 text-center">
                  {archivo ? archivo.name : 'Haz clic para seleccionar o arrastra una imagen o PDF'}
                </span>
                {archivo && (
                  <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">
                    {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            </div>

            {/* Mensajes de feedback */}
            {error && <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}</div>}
            {success && <div className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-xl flex items-center gap-1"><Check className="w-3.5 h-3.5 flex-shrink-0" /> {success}</div>}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={subiendo || !archivo}
              className="w-full py-3 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-200 disabled:to-gray-300 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              {subiendo ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : 'Subir Documento'}
            </button>
          </form>
        </div>

        {/* Listado de Documentos */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-pink-100/50 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-700 text-base flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-pink-400" /> Documentos Almacenados
              <span className="text-xs font-medium bg-pink-100 text-pink-600 px-2.5 py-0.5 rounded-full">
                {documentos.length} total
              </span>
            </div>
            {isDoctor && (
              <button
                onClick={handleGenerarEpicrisis}
                disabled={generandoEpicrisis}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-xs font-bold hover:from-purple-600 hover:to-indigo-700 shadow-sm disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                {generandoEpicrisis ? 'Generando...' : 'Generar Epicrisis (Alta)'}
              </button>
            )}
          </h3>

          {cargando ? (
            <div className="flex justify-center items-center py-20">
              <span className="w-8 h-8 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
            </div>
          ) : documentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Folder className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Aún no se han subido documentos a esta ficha.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  {/* Icono de extensión */}
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {doc.nombreArchivo?.toLowerCase().endsWith('.pdf')
                      ? <FileText className="w-5 h-5 text-gray-500" />
                      : <Image className="w-5 h-5 text-gray-500" />}
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">{doc.nombreOriginal || doc.nombreArchivo}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(doc.tipoDocumento)}`}>
                        {doc.tipoDocumento}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleDescargar(doc.id)}
                      title="Ver / Descargar"
                      className="w-8.5 h-8.5 rounded-lg border border-gray-200 hover:border-pink-300 hover:text-pink-600 flex items-center justify-center transition-colors bg-white text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!isDoctor && (
                      <button
                        onClick={() => handleEliminar(doc.id)}
                        title="Eliminar"
                        className="w-8.5 h-8.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
