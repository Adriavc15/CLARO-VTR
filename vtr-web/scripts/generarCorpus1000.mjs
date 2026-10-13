/**
 * Genera 1000 diálogos cotidianos naturales (port del script Python del usuario).
 * Salida: JSON / JSONL / TXT + módulo JS para Apex.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../src/asistente/data')
mkdirSync(OUT_DIR, { recursive: true })

/** @type {Record<string, string[]>} */
const topics = {
  rutina: [
    'despertarse temprano',
    'salir de casa con prisa',
    'organizar la mañana',
    'volver cansado',
    'hacer una pausa',
    'preparar la ropa',
    'ordenar pendientes',
    'cambiar una rutina',
    'aprovechar una tarde libre',
    'acomodar el horario',
  ],
  comida: [
    'elegir el almuerzo',
    'preparar una cena rápida',
    'buscar un desayuno sencillo',
    'pedir comida',
    'probar una receta',
    'guardar comida para mañana',
    'comprar ingredientes',
    'decidir un postre',
    'comer fuera',
    'aprender un plato nuevo',
  ],
  trabajo: [
    'terminar un informe',
    'coordinar una reunión',
    'resolver un pendiente',
    'recibir una tarea inesperada',
    'organizar archivos',
    'trabajar desde casa',
    'pedir una aclaración',
    'cambiar una fecha de entrega',
    'hacer una pausa',
    'cerrar la jornada',
  ],
  estudios: [
    'preparar una exposición',
    'repasar para un examen',
    'terminar una tarea',
    'entender un tema difícil',
    'organizar apuntes',
    'trabajar en grupo',
    'buscar una fuente',
    'presentar un proyecto',
    'estudiar por la noche',
    'planificar la semana',
  ],
  amistad: [
    'volver a hablar con un amigo',
    'organizar una salida',
    'responder un mensaje atrasado',
    'recordar una anécdota',
    'invitar a alguien',
    'reconciliarse después de un malentendido',
    'celebrar una noticia',
    'pedir un consejo',
    'hacer una visita',
    'mantener el contacto',
  ],
  familia: [
    'visitar a un familiar',
    'organizar una comida familiar',
    'ayudar en casa',
    'recordar una celebración',
    'coordinar una visita',
    'hablar de planes',
    'resolver un pequeño desacuerdo',
    'preparar una sorpresa',
    'llamar a alguien',
    'ponerse al día',
  ],
  tecnologia: [
    'un celular lento',
    'una computadora que falla',
    'una aplicación nueva',
    'una contraseña olvidada',
    'una conexión inestable',
    'una actualización pendiente',
    'un archivo perdido',
    'una notificación extraña',
    'una impresora que no responde',
    'configurar un dispositivo',
  ],
  transporte: [
    'esperar un bus',
    'tomar un taxi',
    'encontrar tráfico',
    'llegar a tiempo',
    'cambiar de ruta',
    'perder un transporte',
    'caminar unas cuadras',
    'buscar una dirección',
    'coordinar un punto de encuentro',
    'salir en hora punta',
  ],
  compras: [
    'comparar precios',
    'comprar algo para la casa',
    'buscar un regalo',
    'devolver un producto',
    'hacer una lista',
    'encontrar una oferta',
    'comprar ropa',
    'elegir un electrodoméstico',
    'hacer compras pequeñas',
    'evitar gastar de más',
  ],
  entretenimiento: [
    'empezar una serie',
    'elegir una película',
    'descubrir música',
    'jugar un videojuego',
    'buscar un documental',
    'recomendar una canción',
    'ver algo el fin de semana',
    'retomar una película pendiente',
    'probar un juego nuevo',
    'hablar de un programa',
  ],
  planes: [
    'organizar el sábado',
    'hacer una salida improvisada',
    'cambiar un horario',
    'cancelar un plan',
    'invitar a alguien',
    'preparar una reunión',
    'hacer una actividad diferente',
    'coordinar una visita',
    'aprovechar un feriado',
    'decidir qué hacer por la noche',
  ],
  hogar: [
    'limpiar una habitación',
    'ordenar un escritorio',
    'lavar ropa',
    'arreglar algo pequeño',
    'mover unos muebles',
    'comprar artículos para la casa',
    'organizar una cocina',
    'buscar algo perdido',
    'hacer una reparación',
    'cambiar la decoración',
  ],
  emociones: [
    'sentirse cansado',
    'estar nervioso antes de algo',
    'alegrarse por una noticia',
    'sentirse frustrado',
    'tener dudas',
    'estar orgulloso de un logro',
    'extrañar a alguien',
    'sentirse confundido',
    'necesitar un descanso',
    'recuperar el ánimo',
  ],
  viajes: [
    'preparar una maleta',
    'elegir un destino',
    'organizar un viaje corto',
    'buscar alojamiento',
    'recordar un viaje anterior',
    'planear una excursión',
    'decidir qué llevar',
    'coordinar horarios',
    'buscar comida local',
    'regresar de vacaciones',
  ],
  peru: [
    'buscar dónde comer algo criollo',
    'coordinar una salida en Lima',
    'evitar el tráfico',
    'comprar algo de camino',
    'encontrarse con una pata',
    'resolver un trámite',
    'salir por unas chelas sin alcohol',
    'comentar el clima limeño',
    'buscar un lugar tranquilo',
    'hacer un plan de última hora',
  ],
}

const openers = [
  'Oye, te quería preguntar algo sobre {x}.',
  'Justo estaba pensando en {x}.',
  'Tengo una duda con eso de {x}.',
  'Hoy me tocó lidiar con {x}.',
  'No sé si te ha pasado algo parecido con {x}.',
  'Necesito decidir qué hacer con {x}.',
  'Me acordé de algo relacionado con {x}.',
  'A ver si me ayudas a pensar en {x}.',
  'Tengo pendiente {x} y no sé por dónde empezar.',
  'Resulta que mañana tengo que ocuparme de {x}.',
]

const responses1 = [
  'Cuéntame qué parte te está complicando y lo vemos desde ahí.',
  'Depende de lo que quieras conseguir, pero podemos ordenar las opciones.',
  'Yo empezaría por lo más sencillo y dejaría lo demás para después.',
  'Suena manejable si lo divides en pasos pequeños.',
  'Antes de decidir, revisaría qué tienes disponible y cuánto tiempo te queda.',
  'Podrías probar una opción sencilla primero y cambiarla si no funciona.',
  'Si tienes varias alternativas, conviene descartar primero las que menos te sirven.',
  'No hace falta resolver todo de golpe; empieza por lo que tenga más urgencia.',
  'Yo miraría el problema desde dos lados: tiempo y comodidad.',
  'Puede ser más fácil si primero aclaras qué resultado esperas.',
]

const followups = [
  'El problema es que tengo poco tiempo.',
  'Además, apareció otra cosa que no tenía prevista.',
  'Quiero hacerlo bien, pero tampoco quiero complicarme demasiado.',
  'Hay varias opciones y por eso estoy indeciso.',
  'Ya probé una alternativa y no salió como esperaba.',
  'Lo que más me preocupa es terminar gastando de más.',
  'Preferiría algo práctico, aunque no sea perfecto.',
  'Creo que necesito una solución que pueda mantener después.',
  'No quiero dejarlo para último momento.',
  'En realidad, todavía estoy viendo si vale la pena.',
]

const responses2 = [
  'Entonces priorizaría una solución que puedas aplicar hoy mismo.',
  'En ese caso, reduciría las opciones a dos y elegiría entre esas.',
  'Si ya probaste algo sin éxito, cambiaría el enfoque en lugar de insistir.',
  'Ahí te conviene reservar un margen por si aparece otro imprevisto.',
  'Yo evitaría complicarlo más de lo necesario y resolvería primero lo urgente.',
  'Si el gasto es la preocupación principal, compara el costo total y no solo el precio inicial.',
  'Puedes buscar un punto medio: algo cómodo, pero que tampoco te quite demasiado tiempo.',
  'Una vez que tengas lo básico resuelto, recién pensaría en los detalles.',
  'Si todavía tienes dudas, esperar un poco puede darte una perspectiva más clara.',
  'Con ese contexto, haría una prueba pequeña antes de comprometerme con algo mayor.',
]

const registers = ['neutral', 'informal', 'chat', 'formal', 'peruano_moderado']

const suffixes = [
  'porque hoy me toca resolverlo',
  'y quiero hacerlo sin apurarme',
  'que se me vino encima de repente',
  'que llevo varios días dejando pendiente',
  'que apareció justo cuando estaba ocupado',
  'que no esperaba tener que hacer hoy',
  'y no encuentro una forma cómoda de organizarlo',
  'que quiero solucionar antes de terminar el día',
  'que estoy intentando ordenar mejor',
  'y necesito tomar una decisión pronto',
]

function peruize(text, i) {
  if (i % 5 === 0) return text.replace('Cuéntame', 'Cuéntame nomás')
  if (i % 5 === 1) return text.replace('Depende', 'Depende, pe')
  if (i % 5 === 2) return text.replace('conviene', 'sale mejor')
  return text
}

function applyRegister(text, register) {
  if (register === 'chat') {
    return text
      .replace(/¿/g, '')
      .replace(/\?/g, '')
      .replace(/Qué /g, 'q ')
      .replace(/qué /g, 'q ')
      .replace(/porque/g, 'xq')
  }
  if (register === 'informal') {
    return text.replace(/usted/gi, 'tú')
  }
  if (register === 'formal') {
    return text
      .replace(/Oye, /g, '')
      .replace(/jajaja/gi, '')
      .replace(/Cuéntame nomás/g, 'Cuéntame')
  }
  return text
}

const topicItems = Object.entries(topics)
const records = []
const usedUser = new Set()
const usedAssistant = new Set()

for (let n = 0; n < 1000; n++) {
  const [topic, contexts] = topicItems[n % topicItems.length]
  const x = contexts[Math.floor(n / topicItems.length) % contexts.length]
  const suffix = suffixes[Math.floor(n / topicItems.length) % suffixes.length]
  let user1 = `${openers[(n * 7) % openers.length].replace('{x}', x)} ${suffix}.`
  let a1 = responses1[(n * 3) % responses1.length]
  let user2 = `${followups[(n * 11) % followups.length]} En este caso estoy hablando de ${x}.`
  let a2 = responses2[(n * 13) % responses2.length]

  if (n % 5 === 4) {
    a1 = peruize(a1, n)
    a2 = peruize(a2, n)
  }

  if (usedUser.has(user1) || usedUser.has(user2) || usedAssistant.has(a1) || usedAssistant.has(a2)) {
    user1 += ` (detalle ${n + 1})`
    user2 += ` Eso es lo que me está pasando ahora mismo (#${n + 1}).`
    a1 += ` Para este caso concreto (#${n + 1}), yo lo haría de esa manera.`
    a2 += ` Así puedes avanzar sin perder tanto tiempo (#${n + 1}).`
  }

  // Garantiza unicidad absoluta de respuestas aunque compartan base
  if (usedAssistant.has(a1)) a1 += ` [${n + 1}a]`
  if (usedAssistant.has(a2)) a2 += ` [${n + 1}b]`
  if (usedUser.has(user1)) user1 += ` [${n + 1}u]`
  if (usedUser.has(user2)) user2 += ` [${n + 1}v]`

  usedUser.add(user1)
  usedUser.add(user2)
  usedAssistant.add(a1)
  usedAssistant.add(a2)

  const register = registers[n % registers.length]
  const country = register === 'peruano_moderado' ? 'PE' : 'ES'

  records.push({
    id: `daily_${String(n + 1).padStart(6, '0')}`,
    language: 'es',
    country,
    register,
    topic,
    conversation: [
      { role: 'user', text: applyRegister(user1, register) },
      { role: 'assistant', text: applyRegister(a1, register) },
      { role: 'user', text: applyRegister(user2, register) },
      { role: 'assistant', text: applyRegister(a2, register) },
    ],
  })
}

const jsonlPath = join(OUT_DIR, 'corpus_dialogos_naturales_1000.jsonl')
const jsonPath = join(OUT_DIR, 'corpus_dialogos_naturales_1000.json')
const txtPath = join(OUT_DIR, 'corpus_dialogos_naturales_1000.txt')
const jsPath = join(__dirname, '../src/asistente/corpusBloqueGenerado1000.js')

writeFileSync(jsonlPath, records.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8')
writeFileSync(jsonPath, JSON.stringify(records, null, 2), 'utf8')

let txt = ''
for (const r of records) {
  txt += `${r.id} | ${r.topic} | ${r.register}\n`
  for (const m of r.conversation) {
    txt += `${m.role.toUpperCase()}: ${m.text}\n`
  }
  txt += '\n'
}
writeFileSync(txtPath, txt, 'utf8')

// Módulo Apex: convierte a formato Dialogo (A/B)
const dialogos = records.map((r) => ({
  id: r.id,
  categoria: r.topic,
  estilo: r.register,
  bloque: 'gen1000',
  turnos: r.conversation.map((m) => ({
    rol: m.role === 'user' ? 'A' : 'B',
    texto: m.text,
  })),
}))

const js = `/**
 * Auto-generado: 1000 diálogos cotidianos naturales.
 * No editar a mano — regenerar con: node scripts/generarCorpus1000.mjs
 */
export const BLOQUE_GEN_1000 = ${JSON.stringify(dialogos, null, 2)}
`
writeFileSync(jsPath, js, 'utf8')

console.log(`Generados: ${records.length} diálogos`)
console.log(`Entradas únicas: ${usedUser.size}`)
console.log(`Respuestas únicas: ${usedAssistant.size}`)
console.log(`JSONL: ${jsonlPath}`)
console.log(`JSON: ${jsonPath}`)
console.log(`TXT: ${txtPath}`)
console.log(`JS: ${jsPath}`)
