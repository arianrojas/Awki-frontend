/**
 * Servicio Integrador de IA Obstetrica (Awki AI)
 * Preparado para conexion directa con APIs de LLM (Gemini, OpenAI, Claude o backend propio).
 * Incluye reconocimiento de intenciones para modificar activamente el historial, sintomas, peso y recordatorios de la gestante.
 */

// URL del endpoint de IA (Backend Spring Boot o directo)
const AI_ENDPOINT = process.env.VITE_AI_API_URL || 'http://localhost:8080/api/v1/ai/chat'
const AI_API_KEY = process.env.VITE_AI_API_KEY || ''

export const aiAssistantService = {
  /**
   * Procesa el mensaje del usuario y ejecuta acciones automaticas en los módulos del sistema
   */
  async processUserMessage(userInput, conversationHistory = []) {
    console.log('🤖 Procesando mensaje con Awki AI:', userInput)

    let aiResponseText = ''
    let detectedAction = null
    let actionData = null

    // 1. Intentar llamada a API real si estuviera configurada
    try {
      if (AI_API_KEY) {
        const response = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_API_KEY}`
          },
          body: JSON.stringify({
            prompt: userInput,
            history: conversationHistory
          })
        })
        if (response.ok) {
          const data = await response.json()
          return data // Estructura devuelta por el servidor
        }
      }
    } catch (err) {
      console.warn('⚠️ API remota de IA no alcanzada. Ejecutando motor local de IA Awki.', err)
    }

    // 2. Motor de IA Inteligente Local con Reconocimiento de Intenciones y Modificación del Sistema
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
        fecha: new Date().toISOString().split('T')[0],
        estado: nivel,
        sintomas: listSintomas.join(', '),
        notas: userInput
      }

      // Guardar en LocalStorage
      const prevSintomas = JSON.parse(localStorage.getItem('awki_diario_sintomas') || '[]')
      localStorage.setItem('awki_diario_sintomas', JSON.stringify([actionData, ...prevSintomas]))

      aiResponseText = `Entiendo perfectamente. He registrado en tu **Diario de Síntomas** que te sientes "${nivel}" y he guardado tus observaciones ("${userInput}"). ` +
        (nivel === 'Mal' ? '⚠️ **¡Importante!** Debido a los síntomas descritos, te sugiero comunicarte de inmediato con tu médico o presionar el botón SOS.' : 'Recuerda descansar, mantenerte hidratada y consultar si las molestias persisten.')
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

        // Guardar en LocalStorage
        const prevPesos = JSON.parse(localStorage.getItem('awki_auto_pesos') || '[]')
        localStorage.setItem('awki_auto_pesos', JSON.stringify([...prevPesos, actionData]))

        aiResponseText = `¡Excelente! He actualizado tu gráfico de evolución gestacional y registrado un peso de **${valorPeso} kg** para la fecha de hoy. Tu médico podrá visualizar este progreso en tu próximo control.`
      } else {
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

      aiResponseText = `¡Listo! He creado un nuevo recordatorio en tu sección de **Recordatorios** para "${actionData.titulo}". Te enviaré una alerta diaria para cuidar de ti y tu bebé.`
    }

    // ── INTENCIÓN D: Modificar Historial / Antecedentes ──────────────────────────
    else if (cleanInput.includes('alergia') || cleanInput.includes('cesárea') || cleanInput.includes('antecedente') || cleanInput.includes('enfermedad') || cleanInput.includes('embarazo anterior')) {
      detectedAction = 'UPDATE_HISTORY'
      actionData = { nota: userInput, fecha: new Date().toISOString() }

      const prevHist = JSON.parse(localStorage.getItem('awki_notas_historial') || '[]')
      localStorage.setItem('awki_notas_historial', JSON.stringify([...prevHist, actionData]))

      aiResponseText = `He anotado esta información relevante en tu **Historial Clínico**: "${userInput}". Tu equipo obstétrico tendrá acceso a esta actualización en tu expediente.`
    }

    // ── CONVERSACIÓN NATURAL GENERAL ─────────────────────────────────────────────
    else {
      const respuestasGenerales = [
        "¡Hola! Soy Awki AI, tu asistente obstétrica virtual. Puedo ayudarte a registrar tus síntomas, actualizar tu peso corporal, agendar recordatorios de vitaminas o responder dudas sobre tu embarazo. ¿Cómo te sientes el día de hoy?",
        "Es un gusto conversar contigo. Recuerda que durante el segundo y tercer trimestre es muy importante monitorear los movimientos de tu bebé y mantener una nutrición rica en hierro y calcio. ¿Hay algo específico que te gustaría registrar hoy?",
        "Estoy aquí para acompañarte en cada semana de tu gestación. Puedes decirme cosas como: 'Hoy me pesé 64kg' o 'Tengo un poco de náuseas' y yo actualizaré tus registros automáticamente."
      ]
      aiResponseText = respuestasGenerales[Math.floor(Math.random() * respuestasGenerales.length)]
    }

    return {
      contenido: aiResponseText,
      action: detectedAction,
      data: actionData,
      createdAt: new Date().toISOString()
    }
  }
}
