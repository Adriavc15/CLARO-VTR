/**
 * Bloque 14 — Reacciones contextuales: loquear/vacilar, incredulidad, sorpresa,
 * exageración, absurdo, micro-chat y sarcasmo.
 */

function pair(id, cat, estilo, a, b) {
  return { id, categoria: cat, estilo, bloque: '14', turnos: [{ rol: 'A', texto: a }, { rol: 'B', texto: b }] }
}
function multi(id, cat, estilo, turnos) {
  return { id, categoria: cat, estilo, bloque: '14', turnos }
}
function pack(list, prefix, cat, estilo) {
  return list.map(([a, b], i) => pair(`${prefix}-${String(i + 1).padStart(2, '0')}`, cat, estilo, a, b))
}

/** Estímulos que provocan “me loqueas / no te creo”. */
const TRIGGERS = [
  'Te voy a transferir un millón.',
  'Mañana no trabajas.',
  'Gané la lotería.',
  'Soy millonario ahora.',
  'Me voy del país mañana.',
  'Te cancelé el plan.',
  'Ya firmé tu renuncia.',
  'Te pedí en matrimonio.',
  'Vendí tu PC.',
  'Borraré el chat.',
  'Te voy a adoptar.',
  'Conseguí entradas VIP.',
  'El jefe dijo que tienes aumento.',
  'Solo faltan 5 minutos.',
  'Esto es fácil.',
  'Ya está todo resuelto.',
  'No pasa nada.',
  'Fue sin querer.',
  'Confía en mí.',
  'Una última y listo.',
]

const LOQUEAS = [
  'Me loqueas',
  'Me estás loqueando',
  'No me loquees',
  '¿Me loqueas?',
  'Me estás vacilando',
  '¿Me estás vacilando?',
  'No me vaciles',
  'Me estás jodiendo',
  '¿Me estás jodiendo?',
  'No puede ser',
  'No te creo',
  '¿Estás hablando en serio?',
  '¿Es broma?',
  '¿Me estás hueveando?',
  'No seas malo 😂',
  'Ya pues',
  'No puede ser mano',
  'Qué me dices',
  '¿Qué estás hablando?',
  'No inventes',
  'Estás loco',
  'Te pasas',
  'Te pasaste',
  'Qué abusivo 😂',
  'No seas así',
  'No juegues conmigo',
  'No me hagas esto',
  'Me estás tomando el pelo',
  '¿En serio me dices eso?',
  '¿De verdad?',
  '¿Real?',
  '¿Es neta?',
  '¿Quéeee?',
  '¿Cómo que qué?',
  '¿Cómo así?',
  '¿Pero qué?',
  '¿Qué rayos?',
  '¿Qué demonios?',
  '¿Qué locura?',
  'Esto no puede estar pasando',
  'No estoy procesando',
  'Mi cerebro no entiende',
  'Me dejaste en shock',
  'Me quedé frío',
  'Me quedé loco',
  'Me quedé 💀',
  'Estoy en shock',
  'Estoy procesando todavía',
  'Dame un segundo',
  'Necesito asimilar esto 😂',
]

const INCREDULIDAD = [
  '¿Cómo vas a decir eso?',
  '¿Quién te crees?',
  '¿Tú escuchas lo que dices?',
  '¿Te escuchaste?',
  '¿Estás seguro de eso?',
  '¿De dónde sacaste eso?',
  '¿Quién te contó semejante cosa?',
  '¿Qué clase de lógica es esa?',
  'Eso no tiene sentido.',
  'No me cuadra.',
  'Algo no me está cerrando.',
  'Aquí hay algo raro.',
  'Esto huele sospechoso 👀',
  'No compro esa historia.',
  'No te creo ni un poquito.',
  'Esa no te la compro.',
  'Ya pues, cuenta bien.',
  'A mí no me engañas.',
  'Sé que estás mintiendo 😂',
  'No me vengas con eso.',
]

const SORPRESA = [
  '¿QUÉ? 😭',
  '¿QUÉÉÉ?',
  'Nooooo',
  'Naaaaa',
  'Ala',
  'Ala mrd',
  'Asu',
  'Asuuu',
  'Uy',
  'Uy no',
  'Dios mío',
  'Diosss',
  'No puede ser 😭',
  'Qué fuerte',
  'Qué locura',
  'Qué nivel',
  'Qué barbaridad',
  'Qué inesperado',
  'No me esperaba eso',
  'Me agarraste frío',
  'Me dejaste sin palabras',
  'No sé ni qué responder',
  'Estoy sin palabras 💀',
  'Me quedé tieso',
  'Me quedé mirando la pantalla',
  'Necesito contexto.',
  'Explícame eso inmediatamente 😂',
]

const EXAGERACION = [
  ['Ya exageraste.', 'Un poquito nomás 😂'],
  ['Te pasaste tres pueblos.', 'Solo dos.'],
  ['Tampoco así 😂', 'Ok ok, bajo.'],
  ['Ya pues, tampoco.', 'Va.'],
  ['No seas dramático.', 'Drama es mi deporte.'],
  ['Qué exagerado eres.', 'Talento natural.'],
  ['Te fuiste al extremo.', 'Es mi estilo.'],
  ['Ya estás inventando.', 'Un poquito.'],
  ['Eso ya es demasiado.', 'Bajale dos.'],
  ['Te estás pasando.', 'Relájate.'],
  ['No era para tanto.', 'Para mí sí 💀'],
  ['Bajale dos.', 'Bajo un cambio.'],
  ['Baja un cambio.', 'Ok jefe.'],
  ['Relájate.', 'Respira JAJAJA.'],
  ['Ya cálmate.', 'Estoy calmado… más o menos.'],
  ['Respira JAJAJA.', 'Inhalo.'],
  ['¿Todo bien contigo?', 'Define bien.'],
  ['¿Qué te fumaste?', 'Esperanza.'],
  ['¿De dónde salió eso? 💀', 'De mi cabeza.'],
  ['Te volaste.', 'Vuelo comercial.'],
]

const ABSURDO = [
  ['JAJAJA ¿qué?', 'Lo que leíste.'],
  ['¿Qué acabo de leer?', 'Arte contemporáneo.'],
  ['No entendí nada.', 'Perfecto, era el plan.'],
  ['¿Qué clase de respuesta es esa?', 'Premium.'],
  ['Me rindo.', 'Te acepto la rendición.'],
  ['No puedo contigo 😂', 'Nadie puede.'],
  ['Tú estás en otro nivel.', 'VIP.'],
  ['Definitivamente estás loco.', 'Diagnóstico correcto.'],
  ['¿Quién te enseñó a responder así?', 'La calle y el chat.'],
  ['Esa respuesta salió de la nada.', 'Teleportación verbal.'],
  ['¿Pero qué tiene que ver? 😂', 'Nada, y eso es lo lindo.'],
  ['Nada que ver.', 'Exacto.'],
  ['Te fuiste por otro lado.', 'Cambié de universo.'],
  ['Cambiaste de universo.', 'Portal activado.'],
  ['Perdón, pero ¿qué?', 'Mi cerebro acaba de reiniciarse.'],
  ['Mi cerebro acaba de reiniciarse.', 'Reinicio OK.'],
  ['Se nos fue de las manos.', 'Ya perdimos el hilo.'],
  ['Ya perdimos el hilo.', 'Esto escaló demasiado rápido.'],
  ['Esto escaló demasiado rápido.', 'Clásico.'],
  ['No sé cómo llegamos a esto.', 'Yo tampoco.'],
]

const MICRO = [
  ['xd', 'XDDD'],
  ['XDDD', 'JAJA'],
  ['JAJA', 'JAJAAJA'],
  ['naa', 'naaa'],
  ['bro', 'mano'],
  ['mano', 'causa'],
  ['oe', 'ala'],
  ['ala', 'asu'],
  ['asu', '💀'],
  ['💀', '😭'],
  ['😭', '👀'],
  ['👀', '🤨'],
  ['????', 'qué'],
  ['qué', 'cómo'],
  ['cómo', 'por'],
  ['ah', 'ya'],
  ['ya', 'bueno'],
  ['xd no', 'ni cagando'],
  ['ni loco', 'imposible'],
  ['de ninguna manera', 'olvídalo'],
  ['paso', 'next'],
  ['ya fue', 'me retiro'],
  ['me rindo', 'suficiente'],
  ['basta 😂', 'ok ok'],
]

const SARCASMO = [
  ['Ya terminé todo.', 'Sí, claro.'],
  ['Fue fácil.', 'Obviamente.'],
  ['Te voy a ayudar.', 'Cómo no.'],
  ['No fallé.', 'Faltaba más.'],
  ['Sorpresa: llegué a tiempo.', 'Qué sorpresa.'],
  ['Inventé la solución.', 'Me sorprende muchísimo 🙄'],
  ['Hagamos eso.', 'Excelente idea.'],
  ['Es perfecto.', 'Brillante.'],
  ['Soy un genio.', 'Genio.'],
  ['Miren mi idea.', 'Qué inteligente.'],
  ['Lo logré.', 'Felicidades 😂'],
  ['Descubrí algo.', 'Increíble descubrimiento.'],
  ['Te lo dije.', 'Gracias por tanto.'],
  ['Aporté esto.', 'Qué aporte.'],
  ['Te paso el dato.', 'Tremenda información.'],
  ['Con esto cambias.', 'Me cambiaste la vida.'],
  ['Ya sabes todo.', 'Ahora sí puedo dormir tranquilo.'],
  ['Era importante.', 'Era justo lo que necesitaba saber.'],
  ['Tiene sentido ahora.', 'Mi vida ya tiene sentido.'],
  ['Sin mí no hay chat.', 'Qué haríamos sin ti.'],
  ['Gracias a mí.', 'Gracias, campeón.'],
  ['Soy brillante.', 'Te pasaste de inteligente.'],
  ['Aplausos.', 'Un aplauso 👏'],
  ['Merezco premio.', 'Premio Nobel para ti.'],
  ['Sabiduría pura.', 'Qué nivel de sabiduría.'],
  ['Impresionante, ¿no?', 'Estoy impresionado… no.'],
  ['Fascinante, ¿verdad?', 'Fascinante 🙄'],
]

function cruzar(triggers, reactions, prefix, estilo) {
  return reactions.map((r, i) =>
    pair(`${prefix}-${String(i + 1).padStart(2, '0')}`, 'reaccion', estilo, triggers[i % triggers.length], r)
  )
}

export const BLOQUE_14_REACCIONES = [
  ...cruzar(TRIGGERS, LOQUEAS, 'b14-loq', 'loquear'),
  ...cruzar(TRIGGERS, INCREDULIDAD, 'b14-inc', 'incredulidad'),
  ...cruzar(TRIGGERS, SORPRESA, 'b14-sor', 'sorpresa'),
  ...pack(EXAGERACION, 'b14-exa', 'exageracion', 'chat'),
  ...pack(ABSURDO, 'b14-abs', 'absurdo', 'chat'),
  ...pack(MICRO, 'b14-mic', 'micro', 'reaccion'),
  ...pack(SARCASMO, 'b14-sar', 'sarcasmo', 'ironia'),
  multi('b14-ctx-1', 'reaccion', 'loquear', [
    { rol: 'A', texto: 'Te voy a transferir un millón.' },
    { rol: 'B', texto: '¿Me estás vacilando?' },
    { rol: 'A', texto: 'Jajaja un poco.' },
    { rol: 'B', texto: 'No seas malo 😂' },
  ]),
  multi('b14-ctx-2', 'reaccion', 'sorpresa', [
    { rol: 'A', texto: 'Me voy del país mañana.' },
    { rol: 'B', texto: '¿QUÉÉÉ?' },
    { rol: 'A', texto: 'Bait.' },
    { rol: 'B', texto: 'Me quedé 💀' },
  ]),
  multi('b14-ctx-3', 'reaccion', 'sarcasmo', [
    { rol: 'A', texto: 'Ya resolví todo.' },
    { rol: 'B', texto: 'Sí, claro.' },
    { rol: 'A', texto: 'En serio.' },
    { rol: 'B', texto: 'Fascinante 🙄' },
  ]),
  multi('b14-ctx-4', 'reaccion', 'exageracion', [
    { rol: 'A', texto: 'Esto es el fin del mundo.' },
    { rol: 'B', texto: 'Ya exageraste.' },
    { rol: 'A', texto: 'Un poquito.' },
    { rol: 'B', texto: 'Bajale dos.' },
  ]),
]

export function formatearReaccionesParaPrompt() {
  return `
REACCIONES CONTEXTUALES (bloque 14):
- “me loqueas / me vacilas / me estás jodiendo / no puede ser / ¿es neta?” = incredulidad o broma según tono.
- Sorpresa PE/Latam: ala, asu, uy, diosss, ¿QUÉÉÉ?
- Si exageran: “bajale dos / te pasaste tres pueblos / relájate”.
- Sarcasmo: “sí claro / obviamente / fascinante 🙄” — no tomarlo literal.
- Micro: xd, 💀, naaa, next, ya fue.
`.trim()
}
