import React, { useState } from 'react'

const CATEGORIES = [
  { id: 'todos', name: 'Todos' },
  { id: 'nutricion', name: '🥗 Nutrición' },
  { id: 'ejercicio', name: '🧘 Ejercicio & Yoga' },
  { id: 'parto', name: '🏥 Preparación al Parto' },
  { id: 'lactancia', name: '🍼 Lactancia Materna' },
  { id: 'bebe', name: '👶 Cuidado del Recién Nacido' },
]

const ARTICLES = [
  {
    id: 1,
    category: 'nutricion',
    title: 'Alimentación en el Embarazo: Superalimentos Esenciales',
    author: 'Dra. Elena Ramos - Nutricionista Prenatal',
    readTime: '5 min de lectura',
    image: '🥗',
    summary: 'Descubre los micronutrientes esenciales como el hierro, calcio, DHA y ácido fólico que tu bebé necesita para un desarrollo óptimo en cada trimestre.',
    content: `Durante la gestación, los requerimientos nutricionales aumentan para apoyar el crecimiento fetal y la placenta.
    
    • Hierro: Fundamental para prevenir anemia. Encuéntralo en carnes magras, espinacas y lentejas acompañadas de vitamina C para mejorar su absorción.
    • Ácido Fólico: Crucial en los primeros meses para prevenir defectos del tubo neural.
    • Calcio y Vitamina D: Para el desarrollo de huesos y dientes fuertes.`
  },
  {
    id: 2,
    category: 'ejercicio',
    title: 'Yoga Prenatal: 5 Posturas para Aliviar el Dolor Lumbar',
    author: 'Lic. Sofía Mendoza - Fisioterapeuta',
    readTime: '7 min de lectura',
    image: '🧘‍♀️',
    summary: 'Ejercicios de estiramiento y respiración adaptados para cada etapa del embarazo, ayudando a preparar tu pelvis y reducir el estrés.',
    content: `El ejercicio moderado durante el embarazo mejora la circulación, fortalece el piso pélvico y reduce la ansiedad.
    
    1. Postura del Gato-Vaca: Excelente para liberar la tensión en la columna.
    2. Mariposa Sentada: Abre suavemente las caderas.
    3. Respira profundo con el diafragma durante 10 minutos al día.`
  },
  {
    id: 3,
    category: 'parto',
    title: 'Plan de Parto: Qué es y Cómo Prepararlo con tu Obstetriz',
    author: 'Dr. Marco Silva - Ginecobstetra',
    readTime: '6 min de lectura',
    image: '📋',
    summary: 'Aprende a redactar tus preferencias para el día del nacimiento: manejo del dolor, acompañamiento, contacto piel con piel inmediato y corte tardío del cordón.',
    content: `Un plan de parto es un documento que guía al equipo médico sobre tus deseos respetados durante el trabajo de parto.
    
    • Elige a tu acompañante de confianza.
    • Define tus preferencias sobre analgesia o métodos naturales de alivio.
    • Prioriza la hora dorada: contacto piel con piel tras el nacimiento.`
  },
  {
    id: 4,
    category: 'lactancia',
    title: 'Guía de Inicio Rápido para una Lactancia Exitosa',
    author: 'Dra. Carmen Luz - Consultora IBCLC',
    readTime: '8 min de lectura',
    image: '🍼',
    summary: 'Técnicas de agarre correcto, prevención de grietas y comprensión del calostro en los primeros días tras el nacimiento.',
    content: `La lactancia materna es un proceso de aprendizaje mutuo entre la mamá y el bebé.
    
    • El agarre debe ser profundo, abarcando gran parte de la areola y no solo el pezón.
    • El calostro es la primera leche, cargada de anticuerpos y defensas naturales.
    • Lactancia a libre demanda: alimenta a tu bebé cada vez que muestre señales de hambre.`
  },
  {
    id: 5,
    category: 'bebe',
    title: 'Primeros Cuidados del Recién Nacido en Casa',
    author: 'Dr. Roberto Vargas - Pediatra',
    readTime: '10 min de lectura',
    image: '👶',
    summary: 'Limpieza del cordón umbilical, patrón de sueño seguro, baño del bebé y señales de alerta pediátricas.',
    content: `Llegar a casa con el bebé puede generar dudas. Aquí están las pautas fundamentales:
    
    • Sueño Seguro: Siempre colocar al bebé boca arriba en su cuna firme sin peluches ni cobijas sueltas.
    • Cordón Umbilical: Mantener limpio y seco hasta que caiga naturalmente (7-14 días).
    • Baño: Con agua tibia (36-37°C) y jabón neutro prenatal.`
  }
]

export default function VistaEducacion() {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedArticle, setSelectedArticle] = useState(null)

  const filteredArticles = selectedCategory === 'todos' 
    ? ARTICLES 
    : ARTICLES.filter(a => a.category === selectedCategory)

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            📚 Portal Educativo Materno
          </span>
          <h2 className="text-3xl font-black mb-2">Aprende y Prepárate para la Maternidad</h2>
          <p className="text-white/90 text-sm leading-relaxed">
            Guías clínicas, artículos validados por especialistas y recursos interactivos para acompañar cada paso de tu embarazo y los primeros días de tu bebé.
          </p>
        </div>
        <div className="absolute right-4 bottom-[-10px] text-8xl opacity-30 select-none">
          🎓
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-105'
                : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map(article => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-50 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {article.image}
                </span>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  ⏱️ {article.readTime}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-500 text-xs mb-4 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-700 truncate max-w-[200px]">
                👨‍⚕️ {article.author}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Leer artículo →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-8 animate-fade-in relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{selectedArticle.image}</span>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                  {selectedArticle.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 pb-4 mb-6 border-b border-gray-100">
              <span>✍️ {selectedArticle.author}</span>
              <span>•</span>
              <span>⏱️ {selectedArticle.readTime}</span>
            </div>

            <div className="prose prose-emerald max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/60 mb-6">
              {selectedArticle.content}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-200 transition-all text-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
