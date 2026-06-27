/**
 * Servicio Integrador de IA Obstétrica (Awki AI)
 * Conectado con el Backend de Spring Boot (GeminiClient) y preparado para Vite.
 * Incluye reconocimiento de intenciones para modificar activamente el historial, síntomas, peso y recordatorios.
 */

const AI_ENDPOINT = import.meta.env.VITE_AI_API_URL || 'http://localhost:8080/api/v1/chat/mensaje'

export const aiAssistantService = {
  /**
   * Procesa el mensaje del usuario y ejecuta acciones automáticas en los módulos del sistema
   */
  async processUserMessage(userInput, conversationHistory = []) {
    console.log('🤖 Procesando mensaje con Awki AI:', userInput)

    let aiResponseText = ''
    let detectedAction = null
    let actionData = null

    // 1. Intentar llamada al backend Spring Boot (Gemini Client)
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('awki_user') || '{}')
    const embarazoId = user.embarazoId

    if (token && embarazoId) {
      try {
        const response = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            embarazoId: embarazoId,
            contenido: userInput
          })
        })
        if (response.ok) {
          const data = await response.json()
          if (data.data && data.data.respuesta) {
            aiResponseText = data.data.respuesta
          }
        }
      } catch (err) {
        console.warn('⚠️ No se pudo conectar con el endpoint de Gemini en el backend. Usando motor auxiliar.', err)
      }
    }

    // 2. Motor de Inteligencia y Reconocimiento de Intenciones para Modificar Estado Local/UI
    const cleanInput = userInput.toLowerCase()

    // ── INTENCIÓN A: Registrar o Modificar Síntomas ──────────────────────────────
    if (cleanInput.includes('siento') || cleanInput.includes('tengo') || cleanInput.includes('dolor') || cleanInput.includes('náusea') || cleanInput.includes('mareo') || cleanInput.includes('hinchad')) {
      detectedAction = 'UPDATE_SYMPTOMS'
      let nivel = 'Bien'
      let listSintomas = []

      if (cleanInput.includes('sangrado') || cleanInput.includes('fiebre') || cleanInput.includes('fuerte dolor')) {
        nivel = 'Mal'
        listSintomas.push('Síntomas de alarma detectados')
      } else if (cleanInput.includes('náusea') || cleanInput.includes('vomit') || cleanInput.includes('cansad')) {
        nivel = 'Regular'
        if (cleanInput.includes('náusea')) listSintomas.push('Náuseas')
        if (cleanInput.includes('cansad')) listSintomas.push('Fatiga')
      } else {
        listSintomas.push('Molestia general leve')
      }

      actionData = {
        id: `sintoma-${Date.now()}-${Math.random()}`,
        fecha: new Date().toISOString().split('T')[0],
        estado: nivel,
        sintomas: listSintomas.join(', '),
        notas: userInput
      }

      const prevSintomas = JSON.parse(localStorage.getItem('awki_diario_sintomas') || '[]')
      localStorage.setItem('awki_diario_sintomas', JSON.stringify([actionData, ...prevSintomas]))

      if (!aiResponseText) {
        aiResponseText = `Entiendo perfectamente. He registrado en tu **Diario de Síntomas** que te sientes "${nivel}" y he guardado tus observaciones ("${userInput}"). ` +
          (nivel === 'Mal' ? '⚠️ **¡Importante!** Debido a los síntomas descritos, te sugiero comunicarte de inmediato con tu médico o presionar el botón SOS.' : 'Recuerda descansar, mantenerte hidratada y consultar si las molestias persisten.')
      }
    }

    // ── INTENCIÓN B: Registrar o Modificar Peso ──────────────────────────────────
    else if (cleanInput.includes('peso') || cleanInput.includes('pesé') || cleanInput.includes('kilo') || cleanInput.includes('kg')) {
      const match = cleanInput.match(/(\d+([.,]\d+)?)\s*(kg|kilos)?/)
      if (match) {
        const valorPeso = parseFloat(match[1].replace(',', '.'))
        detectedAction = 'UPDATE_WEIGHT'
        actionData = {
          fecha: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
          peso: valorPeso,
          fuente: 'IA Virtual Assistant'
        }

        const prevPesos = JSON.parse(localStorage.getItem('awki_auto_pesos') || '[]')
        localStorage.setItem('awki_auto_pesos', JSON.stringify([...prevPesos, actionData]))

        if (!aiResponseText) {
          aiResponseText = `¡Excelente! He actualizado tu gráfico de evolución gestacional y registrado un peso de **${valorPeso} kg** para la fecha de hoy. Tu médico podrá visualizar este progreso en tu próximo control.`
        }
      } else if (!aiResponseText) {
        aiResponseText = `Puedo ayudarte a registrar tu peso. ¿Podrías indicarme cuántos kilos pesaste hoy? (Por ejemplo: "Hoy me pesé y estoy en 62.5 kg").`
      }
    }

    // ── INTENCIÓN C: Agregar Recordatorio o Vitamina ────────────────────────────
    else if (cleanInput.includes('recordar') || cleanInput.includes('vitamina') || cleanInput.includes('pastilla') || cleanInput.includes('hierro') || cleanInput.includes('ácido fólico')) {
      detectedAction = 'ADD_REMINDER'
      actionData = {
        id: Date.now(),
        titulo: cleanInput.includes('hierro') ? 'Tomar Hierro' : cleanInput.includes('ácido fólico') ? 'Tomar Ácido Fólico' : 'Recordatorio de Salud',
        hora: '08:00 AM',
        completado: false
      }

      const prevRec = JSON.parse(localStorage.getItem('awki_recordatorios') || '[]')
      localStorage.setItem('awki_recordatorios', JSON.stringify([...prevRec, actionData]))

      if (!aiResponseText) {
        aiResponseText = `¡Listo! He creado un nuevo recordatorio en tu sección de **Recordatorios** para "${actionData.titulo}". Te enviaré una alerta diaria para cuidar de ti y tu bebé.`
      }
    }

    // ── INTENCIÓN D: Modificar Historial / Antecedentes ──────────────────────────
    else if (cleanInput.includes('alergia') || cleanInput.includes('cesárea') || cleanInput.includes('antecedente') || cleanInput.includes('enfermedad') || cleanInput.includes('embarazo anterior')) {
      detectedAction = 'UPDATE_HISTORY'
      actionData = { nota: userInput, fecha: new Date().toISOString() }

      const prevHist = JSON.parse(localStorage.getItem('awki_notas_historial') || '[]')
      localStorage.setItem('awki_notas_historial', JSON.stringify([...prevHist, actionData]))

      if (!aiResponseText) {
        aiResponseText = `He anotado esta información relevante en tu **Historial Clínico**: "${userInput}". Tu equipo obstétrico tendrá acceso a esta actualización en tu expediente.`
      }
    }

    // ── RESPUESTA POR DEFECTO SI NO HABÍA RESPUESTA DEL BACKEND ───────────────────
    if (!aiResponseText) {
      aiResponseText = "Hola. Gracias por tu consulta. Es normal tener dudas durante la gestación. Recuerda mantener tus controles al día y alimentarte de manera saludable. Si tienes algún dolor de cabeza fuerte, zumbido de oídos o sangrado, avísale a tu obstetra de inmediato."
    }

    return {
      contenido: aiResponseText,
      action: detectedAction,
      data: actionData,
      createdAt: new Date().toISOString()
    }
  }
}
