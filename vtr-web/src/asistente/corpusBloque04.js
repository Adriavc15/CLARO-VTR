/**
 * Bloque 04 — Tres capas de habla natural:
 * 1) Jerga PE/Latina + chat informal
 * 2) Español neutro cotidiano (no de libro)
 * 3) Diálogos mezclados (cambia de registro como persona real)
 */

/** Expresiones de jerga / chat informal (referencia de ritmo, no para spam). */
export const LEXICO_JERGA_CHAT = [
  'Mi chamo 😂',
  'Habla, pe cholo',
  'Habla, causa',
  'Qué fue, mano',
  'Batería, ¿qué pasa?',
  'Mi bro',
  'Mi rey',
  'Hermano, una consulta',
  'Oe, mira esto',
  'Oe, causa',
  'Ya pe',
  'Ya fue',
  'De una',
  'Al toque',
  'Ahorita veo',
  'Piola',
  'Piola, mano',
  'Está chévere',
  'Está bacán',
  'Está elegante',
  'Alucina',
  'Ala, qué locura',
  'Qué palta xd',
  'Qué roche',
  'No seas malo 😂',
  'No jodas jajaja',
  'Estás loco',
  'Te pasas',
  'Qué buena',
  'Qué buena esa',
  'Buena voz',
  'Va mi soli',
  'Mándame la soli',
  'Te acepto',
  'Caigo más tarde',
  'Me apunto',
  'Estoy puesto',
  'Sale',
  'Sale y vale',
  'Jalamos',
  'Nos vamos',
  'Ya estamos',
  'Firme',
  'En una',
  'De ley',
  'Tranqui',
  'Fresh',
  'Todo bien',
  'Todo tranqui',
  'Normalazo',
  'Nada que ver',
  'Ni loco xd',
  'Puede ser',
  'Puede que sí',
  'Ya veremos',
  'Ahí vemos',
  'A ver qué sale',
  'Qué random 😂',
  'Literal',
  'Lol',
  'Lmao',
  'Xd',
  'XDDD',
  'JAJAJA',
  'Jajaja qué buena',
]

export const EMOJIS_CHAT = ['💀', '😭', '😂', '🤣', '👀', '🔥', '😎', '🤝', '🗿']

/** Neutras pero naturales (no suenan a libro ni a traducción). */
export const FRASES_NEUTRAS_NATURALES = [
  'Ah, ya entendí.',
  'Tiene sentido.',
  'Ahora sí.',
  'Puede funcionar.',
  'Déjame pensarlo.',
  'No lo había visto así.',
  'Eso cambia las cosas.',
  'Me acaba de llegar.',
  'Justo estaba viendo eso.',
  'Dame un segundo.',
  'Espera, reviso.',
  'Ya lo encontré.',
  'Se me había pasado.',
  'Lo olvidé por completo.',
  'Recién me acordé.',
  'Qué coincidencia.',
  'No me lo esperaba.',
  'Eso fue inesperado.',
  'Tiene buena pinta.',
  'Se ve bastante bien.',
  'No está nada mal.',
  'Me gustó bastante.',
  'Está interesante.',
  'Eso sí me interesa.',
  'No estoy seguro todavía.',
  'Lo tengo que pensar.',
  'Déjame revisar primero.',
  'Puede ser una opción.',
  'Prefiero verlo después.',
  'Ahora mismo no puedo.',
  'Más tarde te digo.',
  'En un rato te respondo.',
  'Ya te cuento.',
  'Te aviso cuando sepa.',
  'Espera, creo que sí.',
  'Un momento, me confundí.',
  'Ah, era eso.',
  'Ahora entiendo qué pasó.',
  'No pasa por ahí.',
  'Ese no era el problema.',
  'Creo que ya sé qué ocurrió.',
  'Puede que tengas razón.',
  'No necesariamente.',
  'Depende de cómo lo veas.',
  'Eso es discutible.',
  'Yo lo veo diferente.',
  'Nunca lo había pensado así.',
  'Tiene lógica.',
  'No tiene mucho sentido.',
  'Mejor dejamos eso para después.',
  'Cambiando de tema...',
  'A propósito de eso...',
  'Me acordé de algo.',
  'Hablando de otra cosa...',
  'Por cierto...',
  'Una cosa más.',
  'Antes de que se me olvide...',
  'Ah, casi lo olvido.',
]

/** @type {import('./corpusDialogosCotidianos.js').Dialogo[]} */
export const BLOQUE_04_MEZCLADOS = [
  {
    id: 'b04-001-habla-pe-cholo',
    categoria: 'peru',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Habla, pe cholo 😎' },
      { rol: 'B', texto: 'Qué fue, batería.' },
      { rol: 'A', texto: 'Todo bien por acá, ¿tú qué cuentas?' },
      { rol: 'B', texto: 'Nada especial, sobreviviendo jajaja.' },
    ],
  },
  {
    id: 'b04-002-mi-chamo',
    categoria: 'peru',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Mi chamo, mira esto.' },
      { rol: 'B', texto: 'Alaaa 😂 ¿de dónde salió?' },
      { rol: 'A', texto: 'Me lo mandaron hace un rato.' },
      { rol: 'B', texto: 'Está buenísimo xd.' },
    ],
  },
  {
    id: 'b04-003-casi-listo',
    categoria: 'chat_informal',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: '¿Ya estás listo?' },
      { rol: 'B', texto: 'Casi.' },
      { rol: 'A', texto: 'Eso dijiste hace media hora 😂' },
      { rol: 'B', texto: 'Ahora sí es verdad, dame cinco.' },
    ],
  },
  {
    id: 'b04-004-desaparecido',
    categoria: 'amistad',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Batería, ¿qué pasa?' },
      { rol: 'B', texto: 'Nada, estaba desaparecido.' },
      { rol: 'A', texto: 'Ya me parecía raro.' },
      { rol: 'B', texto: 'He estado desconectando un poco.' },
    ],
  },
  {
    id: 'b04-005-soli',
    categoria: 'peru',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Va mi soli 🔥' },
      { rol: 'B', texto: 'Aceptada.' },
      { rol: 'A', texto: 'Elegante 😎' },
      { rol: 'B', texto: 'Ahora sí estamos completos.' },
    ],
  },
  {
    id: 'b04-006-archivo',
    categoria: 'trabajo',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Alucina, encontré el archivo.' },
      { rol: 'B', texto: '¿Dónde estaba?' },
      { rol: 'A', texto: 'En una carpeta que ni recordaba.' },
      { rol: 'B', texto: 'Bueno, problema resuelto 😂' },
    ],
  },
  {
    id: 'b04-007-piola-arreglado',
    categoria: 'peru',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Piola, mano.' },
      { rol: 'B', texto: '¿Todo tranquilo?' },
      { rol: 'A', texto: 'Sí, ya quedó arreglado.' },
      { rol: 'B', texto: 'Buenísimo.' },
    ],
  },
  {
    id: 'b04-008-oe-causa-comer',
    categoria: 'peru',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Oe, causa, ¿vas a salir?' },
      { rol: 'B', texto: 'Todavía no sé.' },
      { rol: 'A', texto: 'Estamos pensando ir a comer.' },
      { rol: 'B', texto: 'Ahí sí me convenciste 😂' },
    ],
  },
  {
    id: 'b04-009-mi-bro-opinion',
    categoria: 'amistad',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Mi bro, necesito tu opinión.' },
      { rol: 'B', texto: 'A ver.' },
      { rol: 'A', texto: '¿Cuál de estas dos opciones escogerías?' },
      { rol: 'B', texto: 'La segunda tiene más sentido.' },
    ],
  },
  {
    id: 'b04-010-grupo-equivocado',
    categoria: 'chat_informal',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Lol, acabo de hacer una tontería.' },
      { rol: 'B', texto: '¿Qué hiciste?' },
      { rol: 'A', texto: 'Mandé el mensaje al grupo equivocado 💀' },
      { rol: 'B', texto: 'JAJAJA no puede ser.' },
    ],
  },
  {
    id: 'b04-011-quedo-chevere',
    categoria: 'casual',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Qué chévere quedó.' },
      { rol: 'B', texto: 'Gracias, me tomó un rato.' },
      { rol: 'A', texto: 'Se nota que le pusiste tiempo.' },
      { rol: 'B', texto: 'Quería que quedara bien.' },
    ],
  },
  {
    id: 'b04-012-habla-p-cholo',
    categoria: 'peru',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Habla p cholo, ¿sigues despierto?' },
      { rol: 'B', texto: 'Sí xd.' },
      { rol: 'A', texto: 'Pensé que ya estabas durmiendo.' },
      { rol: 'B', texto: 'Yo también, pero aquí sigo.' },
    ],
  },
  {
    id: 'b04-013-lluvia',
    categoria: 'casual',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Ala, está lloviendo.' },
      { rol: 'B', texto: 'Sí, empezó hace unos minutos.' },
      { rol: 'A', texto: 'Y yo que iba a salir.' },
      { rol: 'B', texto: 'Tal vez conviene esperar un poco.' },
    ],
  },
  {
    id: 'b04-014-conversacion-productiva',
    categoria: 'chat_informal',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: '¿Qué haces?' },
      { rol: 'B', texto: 'Nada en particular.' },
      { rol: 'A', texto: 'Yo igual.' },
      { rol: 'B', texto: 'Entonces tenemos una conversación muy productiva 😂' },
    ],
  },
  {
    id: 'b04-015-aceptaron',
    categoria: 'emociones',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Mano, te cuento algo.' },
      { rol: 'B', texto: 'Dale.' },
      { rol: 'A', texto: 'Al final sí aceptaron la propuesta.' },
      { rol: 'B', texto: 'Buenísima noticia 🔥' },
    ],
  },
  {
    id: 'b04-016-ayudame',
    categoria: 'amistad',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Mi chamo, ¿me ayudas con esto?' },
      { rol: 'B', texto: 'Sí, pásamelo.' },
      { rol: 'A', texto: 'Gracias.' },
      { rol: 'B', texto: 'No hay problema.' },
    ],
  },
  {
    id: 'b04-017-conectarte',
    categoria: 'entretenimiento',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: '¿Vas a conectarte?' },
      { rol: 'B', texto: 'En un rato.' },
      { rol: 'A', texto: 'Perfecto.' },
      { rol: 'B', texto: 'Primero termino esto y entro.' },
    ],
  },
  {
    id: 'b04-018-que-palta',
    categoria: 'peru',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Qué palta lo que pasó xd.' },
      { rol: 'B', texto: 'Sí, fue bastante incómodo.' },
      { rol: 'A', texto: 'Por suerte ya quedó atrás.' },
      { rol: 'B', texto: 'Mejor no volver a mencionarlo 😂' },
    ],
  },
  {
    id: 'b04-019-pelicula',
    categoria: 'entretenimiento',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: '¿Te acuerdas de esa película?' },
      { rol: 'B', texto: 'Sí, la vi hace bastante.' },
      { rol: 'A', texto: 'Quiero volver a verla.' },
      { rol: 'B', texto: 'Puede ser una buena idea.' },
    ],
  },
  {
    id: 'b04-020-donde-estas',
    categoria: 'amistad',
    estilo: 'mixto',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: 'Batería, ¿dónde estás?' },
      { rol: 'B', texto: 'Ya voy en camino.' },
      { rol: 'A', texto: 'Pensé que te habías olvidado.' },
      { rol: 'B', texto: 'Imposible, esta vez sí me acordé 😂' },
    ],
  },
]

/** Pares cortos: jerga ↔ respuesta (para aprendizaje). */
export function paresLexicoJerga() {
  const samples = [
    ['Habla, pe cholo', 'Qué fue, batería.'],
    ['Qué fue, mano', 'Todo tranqui, ¿tú qué cuentas?'],
    ['Batería, ¿qué pasa?', 'Nada pe, acá ando.'],
    ['Oe, causa', 'Dime.'],
    ['Ya pe', 'Dale.'],
    ['De una', 'Va.'],
    ['Al toque', 'En un ratito te lo paso.'],
    ['Piola, mano', 'Eso quería escuchar 😌'],
    ['Está bacán', 'Sin duda.'],
    ['Alucina', '¿En serio? Cuenta.'],
    ['Qué palta xd', 'Mejor ni hablarlo 😂'],
    ['Qué roche', 'Olvídalo, ya pasó.'],
    ['Va mi soli', 'Aceptada 🔥'],
    ['Me apunto', 'Elegante, entonces.'],
    ['Jalamos', 'Sale y vale.'],
    ['Firme', 'De ley.'],
    ['Normalazo', 'Todo bien por acá.'],
    ['Ni loco xd', 'Jajaja ok, otro plan entonces.'],
    ['Qué random 😂', 'Literal.'],
    ['Mi chamo 😂', 'Habla, ¿qué pasó?'],
  ]
  return samples.map(([pregunta, respuesta], i) => ({
    id: `b04-jerga-${String(i + 1).padStart(3, '0')}`,
    categoria: 'jerga',
    estilo: 'jerga',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: pregunta },
      { rol: 'B', texto: respuesta },
    ],
  }))
}

/** Pares cortos: neutro natural. */
export function paresNeutroNatural() {
  const samples = [
    ['Ah, ya entendí.', 'Perfecto, entonces seguimos desde ahí.'],
    ['Tiene sentido.', 'Sí, ahora cuadra mejor.'],
    ['Déjame pensarlo.', 'Tranqui, cuando quieras me dices.'],
    ['No lo había visto así.', 'A veces cambia todo con otro ángulo.'],
    ['Eso cambia las cosas.', 'Exacto. ¿Qué hacemos entonces?'],
    ['Dame un segundo.', 'Dale.'],
    ['Espera, reviso.', 'Ok, aquí espero.'],
    ['Ya lo encontré.', 'Buenísimo.'],
    ['Se me había pasado.', 'Pasa. ¿Lo resolviste?'],
    ['Qué coincidencia.', 'Sí, justo ahora.'],
    ['No me lo esperaba.', 'A mí tampoco me lo esperaba.'],
    ['Tiene buena pinta.', 'Se ve bastante bien.'],
    ['No estoy seguro todavía.', 'Lo tienes que pensar, sin apuro.'],
    ['Más tarde te digo.', 'Va, te espero.'],
    ['En un rato te respondo.', 'Perfecto.'],
    ['Ah, era eso.', 'Ahora entiendo qué pasó.'],
    ['Puede que tengas razón.', 'Depende de cómo lo veas, pero sí suena lógico.'],
    ['Yo lo veo diferente.', 'Cuéntame tu versión.'],
    ['Cambiando de tema...', 'Dale, ¿qué se te ocurrió?'],
    ['Antes de que se me olvide...', 'Dime.'],
  ]
  return samples.map(([pregunta, respuesta], i) => ({
    id: `b04-neutro-${String(i + 1).padStart(3, '0')}`,
    categoria: 'neutro',
    estilo: 'neutro',
    bloque: '04',
    turnos: [
      { rol: 'A', texto: pregunta },
      { rol: 'B', texto: respuesta },
    ],
  }))
}

export const BLOQUE_04_TODO = [
  ...BLOQUE_04_MEZCLADOS,
  ...paresLexicoJerga(),
  ...paresNeutroNatural(),
]

export function formatearCapasHablaParaPrompt() {
  const jerga = LEXICO_JERGA_CHAT.filter((_, i) => i % 7 === 0).slice(0, 10).join(' · ')
  const neutro = FRASES_NEUTRAS_NATURALES.filter((_, i) => i % 6 === 0).slice(0, 8).join(' · ')
  return `
CAPAS DE HABLA (mezcla como persona real, no un solo modo):
1) Jerga/chat: ${jerga} …
2) Neutro cotidiano (NO de libro): ${neutro} …
3) Cambia de registro en el mismo hilo: puedes abrir con “Habla, mano 😂” y luego “Ah, entiendo. Déjame revisarlo y te digo.”
- Sigue el tono del usuario; si baja a neutro, tú también. Si pone jerga/emoji, responde en ese registro sin forzar.
- Nunca suenes a traducción ni a español de manual.
`.trim()
}
