import React, { useState } from 'react'
import { createPortal } from 'react-dom'

// ─── Articulos y consejos ──────────────────────────────────────────────────────────────
const articles = [
  {
    id: 1,
    emoji: <img src='/ensalada.png' alt="Nutrición" />,
    title: 'Alimentación en el segundo trimestre',
    tag: 'Nutrición',
    tagColor: 'bg-green-100 text-green-600',
    headerGradient: 'from-green-100 to-emerald-100',
    readTime: '5 min lectura',
    content: {
      intro: 'El segundo trimestre (semanas 13–27) es una etapa de crecimiento acelerado para tu bebé. Una alimentación equilibrada garantiza el desarrollo óptimo de su cerebro, huesos y órganos.',
      sections: [
        {
          title: 'Nutrientes esenciales',
          items: [
            { label: 'Hierro', desc: 'Previene la anemia. Fuentes: lentejas, espinacas, carne roja magra. Consume junto con vitamina C para mejor absorción.' },
            { label: 'Calcio', desc: 'Fortalece huesos y dientes del bebé. Fuentes: leche, yogur, brócoli, sardinas.' },
            { label: 'Ácido fólico', desc: 'Protege el tubo neural. Dosis: 400–600 µg/día. Fuentes: frijoles, cereales fortificados, espárragos.' },
            { label: 'Omega-3 (DHA)', desc: 'Desarrollo cerebral y visual. Fuentes: salmón, chía, nueces. Evita pescados con alto mercurio.' },
          ]
        },
        {
          title: 'Guía de porciones diarias',
          items: [
            { label: 'Frutas y verduras', desc: '5 porciones al día. Prioriza colores variados: naranja (betacaroteno), verde oscuro (folato), rojo (licopeno).' },
            { label: 'Proteínas', desc: '3 porciones: huevo, pollo sin piel, legumbres o tofu. Evita embutidos y carnes procesadas.' },
            { label: 'Lácteos', desc: '3 porciones de productos bajos en grasa. Aportan calcio y proteína.' },
            { label: 'Carbohidratos complejos', desc: 'Arroz integral, avena, papa con cáscara. Aportan energía sostenida y fibra.' },
          ]
        },
        {
          title: 'Alimentos a evitar',
          items: [
            { label: 'Pescado crudo y sushi', desc: 'Riesgo de parásitos y listeria.' },
            { label: 'Quesos blandos no pasteurizados', desc: 'Camembert, brie, quesos azules artesanales.' },
            { label: 'Cafeína en exceso', desc: 'Máximo 200 mg/día (≈ 1 taza de café). El exceso aumenta riesgo de bajo peso al nacer.' },
            { label: 'Alcohol', desc: 'No existe cantidad segura durante el embarazo.' },
          ]
        }
      ],
      tip: 'Consejo de tu nutricionista: Come 5–6 veces al día en porciones pequeñas para reducir náuseas y mantener niveles de glucosa estables.',
    }
  },
  {
    id: 2,
    emoji: <img src="/dormir.png" alt="Descanso" />,
    title: 'Cómo mejorar tu descanso durante el embarazo',
    tag: 'Bienestar',
    tagColor: 'bg-blue-100 text-blue-600',
    headerGradient: 'from-blue-100 to-indigo-100',
    readTime: '4 min lectura',
    content: {
      intro: 'Dormir bien durante el embarazo es fundamental tanto para ti como para tu bebé. Los cambios hormonales y físicos pueden dificultar el sueño, pero existen estrategias comprobadas para mejorar tu descanso.',
      sections: [
        {
          title: 'Posición para dormir',
          items: [
            { label: 'Posición SOS (Side On Sleep)', desc: 'Dormir sobre el lado izquierdo mejora la circulación hacia la placenta y reduce la presión sobre el hígado. Es la posición más recomendada.' },
            { label: 'Almohada de embarazo', desc: 'Coloca una almohada entre las rodillas y otra bajo el vientre para alinear la columna y reducir la presión en la cadera.' },
            { label: 'Evitar dormir boca arriba', desc: 'Después de la semana 20, puede comprimir la vena cava inferior y reducir el flujo sanguíneo al bebé.' },
          ]
        },
        {
          title: 'Rutina para dormir mejor',
          items: [
            { label: 'Horario consistente', desc: 'Acuéstate y despierta a la misma hora todos los días, incluyendo fines de semana.' },
            { label: 'Baño tibio antes de dormir', desc: '10 minutos de baño tibio (no caliente) relajan los músculos y bajan la temperatura corporal.' },
            { label: 'Sin pantallas 1 hora antes', desc: 'La luz azul inhibe la melatonina. Opta por leer, escuchar música suave o meditación guiada.' },
            { label: 'Ventilación del cuarto', desc: 'La temperatura ideal para dormir es 18–20°C. Usa ventilador o abre la ventana si es necesario.' },
          ]
        },
        {
          title: 'Técnicas de relajación',
          items: [
            { label: 'Respiración 4-7-8', desc: 'Inhala 4 seg, retén 7 seg, exhala 8 seg. Activa el sistema nervioso parasimpático y reduce la ansiedad.' },
            { label: 'Meditación prenatal', desc: 'Apps como Headspace o Calm tienen sesiones específicas para embarazadas. 10 minutos son suficientes.' },
            { label: 'Yoga prenatal suave', desc: 'Posturas de apertura de cadera y estiramiento de espalda baja antes de dormir alivian tensiones comunes.' },
          ]
        }
      ],
      tip: 'Si te despiertas de madrugada para ir al baño, usa una luz tenue (no enciendas la luz general) para no interrumpir completamente tu ciclo de sueño.',
    }
  },
  {
    id: 3,
    emoji: <img src="/ejercicio.png" alt="Ejercicio" />,
    title: 'Ejercicios seguros para embarazadas',
    tag: 'Ejercicio',
    tagColor: 'bg-purple-100 text-purple-600',
    headerGradient: 'from-purple-100 to-pink-100',
    readTime: '6 min lectura',
    content: {
      intro: 'El ejercicio moderado durante el embarazo reduce el riesgo de diabetes gestacional, mejora el estado de ánimo, prepara el cuerpo para el parto y acelera la recuperación postparto. La clave es la constancia y la moderación.',
      sections: [
        {
          title: 'Ejercicios recomendados',
          items: [
            { label: 'Caminata', desc: '30 minutos diarios a ritmo moderado. Sin impacto, mejora la circulación y el estado de ánimo. Usa calzado de soporte adecuado.' },
            { label: 'Natación y aquagym', desc: 'Ideal en el segundo y tercer trimestre. El agua alivia el peso y reduce la presión articular. Evita cloro en exceso.' },
            { label: 'Yoga prenatal', desc: 'Mejora la flexibilidad, reduce el dolor de espalda y prepara la mente para el parto. Busca instructores certificados.' },
            { label: 'Pilates prenatal', desc: 'Fortalece el suelo pélvico, la espalda y el core. Reduce el riesgo de incontinencia postparto.' },
            { label: 'Ejercicios de Kegel', desc: 'Contrae y relaja el suelo pélvico 3 series de 10 repeticiones al día. Pueden hacerse en cualquier lugar.' },
          ]
        },
        {
          title: 'Ejercicios a evitar',
          items: [
            { label: 'Deportes de contacto', desc: 'Boxeo, artes marciales, rugby. Riesgo de golpes abdominales.' },
            { label: 'Actividades con riesgo de caída', desc: 'Esquí, ciclismo en terreno irregular, patinaje sobre hielo.' },
            { label: 'Ejercicio boca arriba (>sem. 20)', desc: 'Comprime la vena cava. Modifica las posiciones a decúbito lateral o sentada.' },
            { label: 'Altitudes elevadas', desc: 'Senderismo o entrenamiento por encima de 2.500 m puede reducir el oxígeno disponible para el bebé.' },
          ]
        },
        {
          title: 'Señales para detenerte',
          items: [
            { label: 'Para inmediatamente si sientes:', desc: 'Sangrado vaginal, contracciones, dolor de cabeza intenso, mareos, dificultad para respirar, dolor en el pecho o reducción de movimientos fetales.' },
          ]
        }
      ],
      tip: 'Regla del "hablar": Si puedes mantener una conversación mientras haces ejercicio, estás en la intensidad correcta. Si no puedes hablar, reduce el ritmo.',
    }
  },
  {
    id: 4,
    emoji: <img src="/cerebro.png" alt="Salud mental" />,
    title: 'Salud mental en el embarazo',
    tag: 'Salud mental',
    tagColor: 'bg-pink-100 text-pink-600',
    headerGradient: 'from-pink-100 to-rose-100',
    readTime: '5 min lectura',
    content: {
      intro: 'La salud emocional durante el embarazo es tan importante como la física. Los cambios hormonales, los miedos y las expectativas pueden generar ansiedad o tristeza. Reconocerlos y buscar ayuda es un acto de amor hacia ti y tu bebé.',
      sections: [
        {
          title: 'Emociones frecuentes y normales',
          items: [
            { label: 'Ansiedad por el parto', desc: 'Es muy común. Las clases de preparación al parto, la información clara y el apoyo de tu pareja reducen significativamente el miedo.' },
            { label: 'Cambios de humor', desc: 'Causados por fluctuaciones de estrógeno y progesterona. Son normales y generalmente disminuyen en el segundo trimestre.' },
            { label: 'Miedo a "no ser buena madre"', desc: 'El simple hecho de preocuparte ya indica que eres una madre cuidadosa. Confía en tu instinto.' },
            { label: 'Fatiga emocional', desc: 'El embarazo implica un trabajo enorme a nivel físico y mental. Está bien pedir ayuda y descansar.' },
          ]
        },
        {
          title: 'Señales que requieren atención profesional',
          items: [
            { label: 'Tristeza persistente (>2 semanas)', desc: 'La depresión prenatal afecta al 10–15% de embarazadas y tiene tratamiento efectivo. No es "solo hormonas".' },
            { label: 'Ataques de pánico', desc: 'Palpitaciones, dificultad para respirar y sensación de peligro inminente requieren evaluación psicológica.' },
            { label: 'Pensamientos intrusivos frecuentes', desc: 'Si tienes pensamientos que te angustian repetidamente, habla con tu médico o psicólogo prenatal.' },
          ]
        },
        {
          title: 'Estrategias de bienestar emocional',
          items: [
            { label: 'Red de apoyo', desc: 'Comunica tus sentimientos a tu pareja, familia o amigos de confianza. El aislamiento empeora la ansiedad.' },
            { label: 'Diario emocional', desc: 'Escribir 5 minutos al día sobre tus emociones ayuda a procesarlas y detectar patrones.' },
            { label: 'Grupos de madres gestantes', desc: 'Compartir experiencias con otras embarazadas reduce la sensación de soledad y normaliza tus vivencias.' },
            { label: 'Mindfulness prenatal', desc: '10 minutos de atención plena al día reducen los niveles de cortisol y mejoran el vínculo prenatal.' },
          ]
        }
      ],
      tip: 'Pedir ayuda psicológica durante el embarazo no es debilidad, es responsabilidad. Tu bienestar emocional influye directamente en el desarrollo de tu bebé.',
    }
  },
  {
    id: 5,
    emoji: <img src="/estetoscopio.png" alt="Atención médica" />,
    title: 'Controles prenatales: qué esperar',
    tag: 'Atención médica',
    tagColor: 'bg-orange-100 text-orange-600',
    headerGradient: 'from-orange-100 to-amber-100',
    readTime: '7 min lectura',
    content: {
      intro: 'Los controles prenatales son visitas médicas programadas para monitorear la salud de la madre y el desarrollo del bebé. Asistir a todas las citas reduce significativamente el riesgo de complicaciones.',
      sections: [
        {
          title: 'Calendario de controles recomendado',
          items: [
            { label: 'Primer trimestre (sem. 6–12)', desc: 'Confirmación del embarazo, análisis de sangre completos, ecografía de datación, descarte de embarazo ectópico.' },
            { label: 'Semana 11–14 (NT)', desc: 'Ecografía de translucencia nucal para detección de cromosomiopatías (síndrome de Down, entre otras).' },
            { label: 'Semana 18–22 (morfológica)', desc: 'Ecografía detallada de órganos. Puede conocerse el sexo del bebé. Evaluación de placenta y líquido amniótico.' },
            { label: 'Semana 24–28 (glucosa)', desc: 'Prueba de O\'Sullivan para detección de diabetes gestacional. Fundamental para prevenir complicaciones.' },
            { label: 'Semana 35–37 (GBS)', desc: 'Cultivo para estreptococo del grupo B. Determina si se necesita antibiótico durante el parto.' },
          ]
        },
        {
          title: 'Qué se evalúa en cada control',
          items: [
            { label: 'Peso y talla materna', desc: 'Para calcular la ganancia de peso esperada según tu IMC pregestacional.' },
            { label: 'Presión arterial', desc: 'Para detectar preeclampsia precozmente (presión >140/90 es señal de alerta).' },
            { label: 'Altura uterina', desc: 'El médico mide el tamaño del útero para verificar el crecimiento fetal acorde a la semana.' },
            { label: 'Latidos fetales', desc: 'Con doppler desde la semana 10–12. Frecuencia normal: 110–160 latidos por minuto.' },
          ]
        },
        {
          title: 'Preguntas que puedes hacer en tu control',
          items: [
            { label: 'Preguntas recomendadas:', desc: '¿Cuánto debería ganar de peso? ¿Qué vacunas necesito? ¿Cuáles son los signos de alarma? ¿Cuándo debo ir a urgencias? ¿Es normal lo que estoy sintiendo?' },
          ]
        }
      ],
      tip: 'Lleva siempre tu carnet perinatal a todos los controles y urgencias. Contiene información vital para cualquier profesional que te atienda.',
    }
  },
  {
    id: 6,
    emoji: <img src="/vitamina.png" alt="Suplementación" />,
    title: 'Suplementos y vitaminas en el embarazo',
    tag: 'Suplementación',
    tagColor: 'bg-teal-100 text-teal-600',
    headerGradient: 'from-teal-100 to-cyan-100',
    readTime: '4 min lectura',
    content: {
      intro: 'Una dieta variada es la base, pero durante el embarazo el cuerpo tiene necesidades adicionales que generalmente requieren suplementación. Siempre consulta con tu médico antes de iniciar cualquier suplemento.',
      sections: [
        {
          title: 'Suplementos esenciales',
          items: [
            { label: 'Ácido fólico (B9)', desc: '400–800 µg/día desde antes de la concepción hasta el final del primer trimestre. Previene defectos del tubo neural.' },
            { label: 'Hierro', desc: '27–30 mg/día. Muchas embarazadas desarrollan anemia ferropénica en el segundo trimestre. Tómalo con vitamina C y lejos del calcio.' },
            { label: 'Vitamina D', desc: '600–2000 UI/día. Fundamental para la absorción de calcio y el sistema inmune. La mayoría de embarazadas tienen deficiencia.' },
            { label: 'Yodo', desc: '150–200 µg/día. Esencial para el desarrollo tiroideo y neurológico del bebé. Fuente: sal yodada y mariscos.' },
            { label: 'Omega-3 (DHA)', desc: '200–300 mg de DHA/día. Desarrollo cerebral y retiniano del bebé. Especialmente importante en tercer trimestre.' },
          ]
        },
        {
          title: 'Precauciones importantes',
          items: [
            { label: 'Vitamina A en exceso', desc: 'Dosis >10,000 UI puede ser teratogénica. Evita suplementos de vitamina A de origen animal en altas dosis.' },
            { label: 'Hierbas y remedios naturales', desc: 'No todos son seguros. Evita valeriana, salvia, perejil en grandes cantidades, y cualquier producto sin aval médico.' },
            { label: 'Suplementos de calcio y hierro juntos', desc: 'Compiten por absorción. Tómalos en horarios distintos (ej: hierro en ayunas, calcio con las comidas).' },
          ]
        },
        {
          title: 'Análisis de sangre recomendados',
          items: [
            { label: 'Hemograma completo', desc: 'Detecta anemia. Valor objetivo: hemoglobina >11 g/dL en embarazadas.' },
            { label: 'Ferritina sérica', desc: 'Reservas de hierro. Valor objetivo: >30 ng/mL para prevenir anemia por déficit.' },
            { label: 'Vitamina D (25-OH)', desc: 'Nivel óptimo >30 ng/mL. Muchas embarazadas tienen niveles insuficientes, especialmente en invierno.' },
          ]
        }
      ],
      tip: 'El complejo vitamínico prenatal no reemplaza una dieta saludable, pero sí cubre las brechas nutricionales que la dieta sola no puede garantizar durante el embarazo.',
    }
  },
]

// ─── Article Modal ─────────────────────────────────────────────────────────────
function ArticleModal({ article, onClose }) {
  if (!article) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: 'modalSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-br ${article.headerGradient} p-6 relative flex-shrink-0`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all duration-200 shadow-sm"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center text-4xl shadow-inner">
              {article.emoji}
            </div>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${article.tagColor} mb-1`}>
                {article.tag}
              </span>
              <h2 className="text-gray-800 font-extrabold text-lg leading-tight">{article.title}</h2>
              <p className="text-gray-500 text-xs mt-1">{article.readTime}</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Intro */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50 rounded-xl p-4 border-l-4 border-pink-300">
            {article.content.intro}
          </p>

          {/* Sections */}
          {article.content.sections.map((section, si) => (
            <div key={si} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {section.icon && <span className="text-xl">{section.icon}</span>}
                <h3 className="font-bold text-gray-700 text-[15px]">{section.title}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {section.items.map((item, ii) => (
                  <div key={ii} className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-pink-100 hover:bg-pink-50/30 transition-all duration-200">
                    <p className="font-semibold text-gray-700 text-[13px]">{item.label}</p>
                    <p className="text-gray-500 text-[12px] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tip */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-4 mt-2">
            <p className="text-gray-600 text-[13px] leading-relaxed font-medium">{article.content.tip}</p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-pink-200"
          >
            Cerrar artículo
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function SeccionArticulos() {
  const [selectedArticle, setSelectedArticle] = useState(null)

  return (
    <>
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-700 text-[15px]">Artículos y consejos para ti</h3>
          <span className="text-xs text-gray-400 font-medium">Toca un artículo para leerlo</span>
        </div>
        <p className="text-gray-400 text-[12px] mb-4">Información especializada para madres gestantes</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((art) => (
            <button
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="group rounded-2xl overflow-hidden bg-gray-50 hover:bg-pink-50 border border-transparent hover:border-pink-200 transition-all duration-200 text-left hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Card image area */}
              <div className={`h-24 bg-gradient-to-br ${art.headerGradient} flex items-center justify-center text-4xl relative`}>
                <div className="absolute inset-0 bg-white/10" />
                <span className="relative z-10 drop-shadow-sm">{art.emoji}</span>
                <span className="absolute top-2 right-2 text-[10px] font-semibold text-gray-500 bg-white/70 rounded-full px-2 py-0.5">
                  {art.readTime}
                </span>
              </div>
              {/* Card body */}
              <div className="p-3">
                <p className="text-gray-700 text-[12px] font-semibold leading-snug group-hover:text-pink-600 transition-colors">
                  {art.title}
                </p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${art.tagColor}`}>
                  {art.tag}
                </span>
                <p className="text-gray-400 text-[10px] mt-2 flex items-center gap-1">
                  <span>👆</span> Toca para leer
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
