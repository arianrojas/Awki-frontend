/**
 * Servicio Integrador de IA Obstétrica (Awki AI)
 * Conectado con el Backend de Spring Boot (GeminiClient) preparado para Vite.
 * Incluye reconocimiento de intenciones para modificar activamente el historial,
 * síntomas, peso y recordatorios — con campos 100% alineados al esquema del backend
 * y validación defensiva para que ningún error rompa la app.
 */

const AI_ENDPOINT = import.meta.env.VITE_AI_API_URL || 'http://localhost:8080/api/v1/chat/mensaje'

// ── Helpers de localStorage robustos ──────────────────────────────────────────
function lsGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', key, e)
  }
}

// ── Helpers de extracción ──────────────────────────────────────────────────────
function extractNumber(text) {
  // Extrae el primer número (entero o decimal con punto o coma)
  const match = text.match(/(\d+(?:[.,]\d+)?)/)
  if (!match) return null
  const val = parseFloat(match[1].replace(',', '.'))
  return isNaN(val) ? null : val
}

function extractWeightNumber(text) {
  // Intenta extraer un número razonable de peso (20–300 kg)
  // Patrones: "71 kg", "mi peso es 71", "peso 71.5", "kilo 65", "pesé 60"
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos)/i,
    /(?:peso|pesé|pesé|soy de|tengo|estoy en|mido|marca)\s+(?:de\s+)?(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilos|libras)?/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const val = parseFloat(m[1].replace(',', '.'))
      if (!isNaN(val) && val >= 20 && val <= 300) return val
    }
  }
  return null
}

export const aiAssistantService = {
  /**
   * Procesa el mensaje del usuario y ejecuta acciones automáticas en los módulos del sistema.
   * @param {string} userInput - Texto del usuario
   * @param {Array}  conversationHistory - Historial de mensajes previos (opcional)
   * @returns {Promise<{contenido: string, action: string|null, data: object|null, createdAt: string}>}
   */
  async processUserMessage(userInput = '', conversationHistory = []) {
    console.log('Procesando mensaje con Awki AI:', userInput)

    if (!userInput || typeof userInput !== 'string') {
      return {
        contenido: 'No entendí tu mensaje. ¿Podrías repetirlo?',
        action: null,
        data: null,
        createdAt: new Date().toISOString(),
      }
    }

    let aiResponseText = ''
    let detectedAction = null
    let actionData = null

    // ── 1. Llamada al backend Spring Boot (Gemini) ─────────────────────────────
    let token = null
    let user = {}
    let embarazoId = null
    let semanasGestacion = 0

    try {
      token = localStorage.getItem('token')
      user = JSON.parse(localStorage.getItem('awki_user') || '{}')
      embarazoId = user.embarazoId || null
      semanasGestacion = user.semanasGestacion || 0
    } catch {
      console.warn('No se pudo leer datos de usuario del localStorage.')
    }

    if (token && embarazoId) {
      try {
        const response = await fetch(AI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            embarazoId,
            contenido: userInput,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          if (data?.data?.respuesta) {
            aiResponseText = data.data.respuesta
          }
        }
      } catch (err) {
        console.warn('No se pudo conectar con Gemini backend. Usando motor local.', err.message)
      }
    }

    // ── 2. Motor de reconocimiento de intenciones ──────────────────────────────
    const cleanInput = userInput.toLowerCase().trim()
    const ahora = new Date()
    const fechaISO = ahora.toISOString()
    const fechaLocal = ahora.toISOString().split('T')[0] // YYYY-MM-DD

    // ── INTENCIÓN A: Síntomas / Malestar ──────────────────────────────────────
    const esSintoma =
      cleanInput.includes('siento') ||
      cleanInput.includes('tengo') ||
      cleanInput.includes('dolor') ||
      cleanInput.includes('náusea') ||
      cleanInput.includes('nausea') ||
      cleanInput.includes('mareo') ||
      cleanInput.includes('hinchad') ||
      cleanInput.includes('registra') ||
      cleanInput.includes('síntoma') ||
      cleanInput.includes('sintoma') ||
      cleanInput.includes('vomit') ||
      cleanInput.includes('cansad') ||
      cleanInput.includes('reflujo') ||
      cleanInput.includes('acidez') ||
      cleanInput.includes('fiebre') ||
      cleanInput.includes('ardor') ||
      cleanInput.includes('sangrado') ||
      cleanInput.includes('líquido') ||
      cleanInput.includes('liquido') ||
      cleanInput.includes('contraccion') ||
      cleanInput.includes('contracción')

    // ── INTENCIÓN B: Peso ──────────────────────────────────────────────────────
    const esPeso =
      !esSintoma &&
      (cleanInput.includes('peso') ||
        cleanInput.includes('pesé') ||
        cleanInput.includes('pese') ||
        cleanInput.includes('kilo') ||
        cleanInput.includes('kg') ||
        /\bpeso\b/.test(cleanInput) ||
        /\bpesé\b/.test(cleanInput))

    // ── INTENCIÓN C: Recordatorio ──────────────────────────────────────────────
    const esRecordatorio =
      !esSintoma &&
      !esPeso &&
      (cleanInput.includes('recordar') ||
        cleanInput.includes('recordatorio') ||
        cleanInput.includes('vitamina') ||
        cleanInput.includes('pastilla') ||
        cleanInput.includes('hierro') ||
        cleanInput.includes('ácido fólico') ||
        cleanInput.includes('acido folico'))

    // ── INTENCIÓN D: Historial / Antecedentes ─────────────────────────────────
    const esHistorial =
      !esSintoma &&
      !esPeso &&
      !esRecordatorio &&
      (cleanInput.includes('alergia') ||
        cleanInput.includes('cesárea') ||
        cleanInput.includes('cesarea') ||
        cleanInput.includes('antecedente') ||
        cleanInput.includes('enfermedad') ||
        cleanInput.includes('embarazo anterior'))

    // ══════════════════════════════════════════════════════════════════════════
    if (esSintoma) {
      detectedAction = 'UPDATE_SYMPTOMS'
      let nivelBienestar = 'Bien'
      let listSintomas = []
      let esCritico = false
      let hinchazonDetalle = 'No, ninguna'
      let movimientosDetalle = 'Normales, como siempre'

      // Extracción detallada de síntomas
      if (cleanInput.includes('náusea') || cleanInput.includes('nausea') || cleanInput.includes('vomit') || cleanInput.includes('vómito')) {
        listSintomas.push('Náuseas / Vómitos')
      }
      if (cleanInput.includes('cabeza') || cleanInput.includes('cefalea')) {
        listSintomas.push('Cefalea / Dolor de Cabeza')
      }
      if (cleanInput.includes('hinchad') || cleanInput.includes('hinchazon') || cleanInput.includes('edema')) {
        listSintomas.push('Hinchazón / Edemas')
        if (cleanInput.includes('pie')) hinchazonDetalle = 'Sí, en los pies'
        else if (cleanInput.includes('mano')) hinchazonDetalle = 'Sí, en las manos'
        else if (cleanInput.includes('cara') || cleanInput.includes('rostro')) {
          hinchazonDetalle = 'Sí, en la cara'
          esCritico = true
        } else hinchazonDetalle = 'Sí, en varias partes del cuerpo'
      }
      if (cleanInput.includes('cansad') || cleanInput.includes('fatiga') || cleanInput.includes('sueño')) {
        listSintomas.push('Cansancio / Fatiga Extrema')
      }
      if (cleanInput.includes('reflujo') || cleanInput.includes('acidez') || cleanInput.includes('ardor')) {
        listSintomas.push('Acidez / Reflujo')
      }
      if (cleanInput.includes('mareo') || cleanInput.includes('mareada')) {
        listSintomas.push('Mareos / Vértigo')
      }
      if (cleanInput.includes('sangrado') || cleanInput.includes('sangre')) {
        listSintomas.push('Sangrado Vaginal')
        esCritico = true
      }
      if (cleanInput.includes('fiebre')) {
        listSintomas.push('Fiebre')
        esCritico = true
      }
      if (cleanInput.includes('liquido') || cleanInput.includes('líquido')) {
        listSintomas.push('Pérdida de Líquido Amniótico')
        esCritico = true
      }
      if (cleanInput.includes('contraccion') || cleanInput.includes('contracción')) {
        listSintomas.push('Contracciones')
        esCritico = true
      }
      if (cleanInput.includes('vision') || cleanInput.includes('visión') || cleanInput.includes('borrosa')) {
        listSintomas.push('Visión Borrosa')
        esCritico = true
      }
      if (cleanInput.includes('no siento') && (cleanInput.includes('bebé') || cleanInput.includes('bebe') || cleanInput.includes('movimiento'))) {
        movimientosDetalle = 'No los he sentido'
        listSintomas.push('Sin Movimientos Fetales')
        esCritico = true
      }
      if (listSintomas.length === 0) listSintomas.push('Malestar General')

      // Clasificar bienestar
      if (esCritico || cleanInput.includes('fuerte') || cleanInput.includes('intenso') || cleanInput.includes('insoportable')) {
        nivelBienestar = 'Mal'
        esCritico = true
      } else if (listSintomas.length >= 2 || cleanInput.includes('náusea') || cleanInput.includes('nausea') || cleanInput.includes('regular') || cleanInput.includes('mal')) {
        nivelBienestar = 'Regular'
      }

      actionData = {
        id: `sintoma-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        bienestar: nivelBienestar,
        movimientos: movimientosDetalle,
        hinchazon: hinchazonDetalle,
        sintomas: listSintomas.join(', '),
        detalles: userInput,
        esCritico,
        fecha: fechaISO,
      }

      const prev = lsGet('awki_diario_sintomas')
      lsSet('awki_diario_sintomas', [actionData, ...prev])

      if (!aiResponseText) {
        aiResponseText =
          `¡Entendido! He registrado en tu **Diario de Síntomas**:\n` +
          `• **Bienestar:** ${nivelBienestar}\n` +
          `• **Síntomas:** ${listSintomas.join(', ')}\n\n` +
          (esCritico
            ? '**ATENCION:** Has reportado síntomas de alarma obstétrica. Por favor contacta a tu médico o presiona el botón **SOS** de inmediato.'
            : '¿Hay alguna otra molestia o cambio que deseas agregar a tu reporte de hoy?')
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    else if (esPeso) {
      const valorPeso = extractWeightNumber(cleanInput)

      if (valorPeso !== null) {
        detectedAction = 'UPDATE_WEIGHT'
        // ✅ Estructura ALINEADA con AccionesRapidas y VistaInicio
        actionData = {
          id: `peso-${Date.now()}`,
          pesoKg: valorPeso,                   // campo esperado por VistaInicio
          fechaControl: fechaLocal,             // campo esperado por VistaInicio
          semanasGestacion: semanasGestacion || 0,
          tipo: 'AUTO',
          fuente: 'IA Virtual Assistant',
        }

        const prev = lsGet('awki_auto_pesos')
        lsSet('awki_auto_pesos', [...prev, actionData])

        if (!aiResponseText) {
          aiResponseText = `¡Excelente! He registrado un peso de **${valorPeso} kg** en tu gráfico de evolución gestacional para el día de hoy (${ahora.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}). Tu médico podrá ver este progreso en tu próximo control prenatal.`
        }
      } else if (!aiResponseText) {
        aiResponseText = `Puedo ayudarte a registrar tu peso. ¿Cuántos kilos pesaste hoy? (Ejemplo: "hoy peso 62.5 kg" o "mi peso es 71").`
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    else if (esRecordatorio) {
      detectedAction = 'ADD_REMINDER'
      const titulo = cleanInput.includes('hierro')
        ? 'Tomar Hierro'
        : cleanInput.includes('ácido fólico') || cleanInput.includes('acido folico')
        ? 'Tomar Ácido Fólico'
        : cleanInput.includes('vitamina')
        ? 'Tomar Vitaminas'
        : 'Recordatorio de Salud'

      actionData = {
        id: Date.now(),
        titulo,
        hora: '08:00 AM',
        completado: false,
        creadoPor: 'IA',
      }

      const prev = lsGet('awki_recordatorios')
      lsSet('awki_recordatorios', [...prev, actionData])

      if (!aiResponseText) {
        aiResponseText = `¡Listo! He creado un recordatorio **"${titulo}"** en tu sección de Recordatorios para las 8:00 AM diariamente. ¿Deseas ajustar el horario?`
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    else if (esHistorial) {
      detectedAction = 'UPDATE_HISTORY'
      actionData = {
        id: `hist-${Date.now()}`,
        nota: userInput,
        fecha: fechaISO,
        tipo: 'antecedente',
      }

      const prev = lsGet('awki_notas_historial')
      lsSet('awki_notas_historial', [...prev, actionData])

      if (!aiResponseText) {
        aiResponseText = `He anotado esta información en tu **Historial Clínico**: "${userInput}". Tu equipo obstétrico tendrá acceso a esta actualización en tu próximo control.`
      }
    }

    // ── Respuesta por defecto si ningún módulo respondió ──────────────────────
    if (!aiResponseText) {
      aiResponseText =
        'Hola, soy Awki, tu asistente de salud gestacional. Puedo ayudarte a:\n' +
        '• Registrar síntomas o molestias\n' +
        '• Anotar tu peso del día\n' +
        '• Crear recordatorios de medicamentos\n' +
        '• Agregar notas a tu historial clínico\n\n' +
        '¿Cómo te sientes hoy?'
    }

    return {
      contenido: aiResponseText,
      action: detectedAction,
      data: actionData,
      createdAt: fechaISO,
    }
  },
}
