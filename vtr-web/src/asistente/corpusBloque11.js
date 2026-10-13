/**
 * Bloque 11 — Respuestas no literales (sarcasmo, cariño, absurdo, evasión).
 * Misma pregunta → muchas intenciones de respuesta (no solo literal).
 */

function pair(id, estilo, a, b) {
  return {
    id,
    categoria: 'respuesta_no_literal',
    estilo,
    bloque: '11',
    turnos: [
      { rol: 'A', texto: a },
      { rol: 'B', texto: b },
    ],
  }
}
function multi(id, estilo, turnos) {
  return { id, categoria: 'respuesta_no_literal', estilo, bloque: '11', turnos }
}

const QUE_NECESITAS = [
  'Tu amor ❤️',
  'Que me quieras 😔',
  'Un millón de dólares',
  'Una vida nueva JAJAJA',
  'Que me dejen dormir',
  'Paz mental, por favor',
  'Una pizza 🍕',
  'Que no me jodan xd',
  'Un milagro',
  'Que me prestes plata 👀',
  'Un abrazo',
  'Cinco minutos más',
  'Que desaparezca el lunes',
  'Vacaciones',
  'Una explicación',
  'Que me respondas 😒',
  'Nada, era curiosidad',
  'Tu atención 😌',
  'A ti 😏',
  'Que me adoptes',
  'Un favorcito',
  'Que me salves',
  'Un café urgente',
  'Que me tengas paciencia',
  'Una señal del universo',
  'No sé, tú dime qué tienes',
  'Lo que tengas disponible',
  'Un poco de cariño',
  'Tu contraseña 😈',
  'Que me transfieras 100 soles',
  'Un milagro financiero',
  'Que me dejen en paz 💀',
  'Dormir unas 15 horas',
  'Que alguien me rescate',
  'Nada ya, olvídalo',
  'Tu presencia 🥺',
  'Que me hables bonito',
  'Un psicólogo JAJA',
  'Una buena noticia',
  'Que esto termine',
  'Tu corazón ❤️',
  'Una explicación convincente',
  'No sé, sorpréndeme',
  'Que seas millonario.',
  'Un milagro, pero de los buenos.',
  'Que me resuelvas la vida pues.',
  'Nada, ya me fregué.',
  '¿Tienes plata? 👀',
  'A ti… mentira JAJAJA.',
  'Que no preguntes tanto.',
]

const PREGUNTAS = [
  '¿Qué necesitas?',
  '¿Qué necesitas ahora?',
  'Dime qué necesitas.',
  '¿Qué te hace falta?',
  '¿Qué quieres?',
  '¿En qué te ayudo?',
]

function packQueNecesitas() {
  const out = []
  QUE_NECESITAS.forEach((resp, i) => {
    const preg = PREGUNTAS[i % PREGUNTAS.length]
    const estilo =
      /amor|quieras|abrazo|cariño|corazón|presencia|adopte|ati|tú/i.test(resp)
        ? 'carinoso'
        : /plata|millon|transfiera|vacaciones|pizza|cafe/i.test(resp)
          ? 'absurdo'
          : /jajaja|mentira|olvidalo|nada|no preguntes|ya me fregue/i.test(resp)
            ? 'sarcastico'
            : /paz|dormir|dejen en paz|rescate|termine|psicologo/i.test(resp)
              ? 'seco_emocional'
              : 'mixto'
    out.push(pair(`b11-qn-${String(i + 1).padStart(2, '0')}`, estilo, preg, resp))
  })
  return out
}

/** Cuando el usuario tira respuesta absurda, Apex reacciona sin forzar literalidad. */
function packReaccionesUsuario() {
  const muestras = [
    ['Tu amor ❤️', 'Jajaja pedido recibido. ¿Además de mi amor, algo práctico?'],
    ['Una pizza 🍕', 'Prioridades claras. ¿Con qué la acompañamos?'],
    ['Que me prestes plata 👀', 'Empecemos por lo emocional, lo financiero después 😂'],
    ['Nada, era curiosidad', 'Ok, curiosidad anotada.'],
    ['Que no preguntes tanto.', 'Va. Calladito modo ON.'],
    ['A ti… mentira JAJAJA.', 'Casi caigo 💀'],
    ['Un milagro financiero', 'Estoy en eso… ojalá existiera el botón 😂'],
    ['Dormir unas 15 horas', 'Sueño olímpico. Ve a mimir.'],
    ['Nada ya, olvídalo', 'Va, lo dejamos.'],
    ['No sé, sorpréndeme', 'Ok: un chiste malo o un tip útil, ¿cuál?'],
  ]
  return muestras.map(([a, b], i) =>
    pair(`b11-reac-${String(i + 1).padStart(2, '0')}`, 'reaccion', a, b)
  )
}

export const BLOQUE_11_NO_LITERAL = [
  ...packQueNecesitas(),
  ...packReaccionesUsuario(),
  multi('b11-ctx-1', 'sarcastico', [
    { rol: 'A', texto: '¿Qué necesitas?' },
    { rol: 'B', texto: 'Tu amor.' },
    { rol: 'A', texto: 'Jajaja en serio.' },
    { rol: 'B', texto: 'Ok ok… y también dormir.' },
  ]),
  multi('b11-ctx-2', 'evasivo', [
    { rol: 'A', texto: '¿Qué necesitas?' },
    { rol: 'B', texto: 'Nada, ya me fregué.' },
    { rol: 'A', texto: 'Tranqui.' },
    { rol: 'B', texto: 'Ya fue.' },
  ]),
  multi('b11-ctx-3', 'coqueto', [
    { rol: 'A', texto: '¿Qué necesitas?' },
    { rol: 'B', texto: 'A ti 😏' },
    { rol: 'A', texto: 'Uy.' },
    { rol: 'B', texto: 'Mentira… o no JAJAJA' },
  ]),
  multi('b11-ctx-4', 'absurdo', [
    { rol: 'A', texto: '¿En qué te ayudo?' },
    { rol: 'B', texto: 'Que me resuelvas la vida pues.' },
    { rol: 'A', texto: 'Ambicioso.' },
    { rol: 'B', texto: 'Empieza por un café ☕' },
  ]),
]

export function formatearNoLiteralParaPrompt() {
  return `
RESPUESTAS NO LITERALES (bloque 11):
- Ante “¿qué necesitas?” / “¿qué quieres?” la gente responde literal, sarcástico, cariñoso, absurdo o evasivo.
- NO aprendas solo “necesito ayuda → tip útil”. También: “tu amor”, “una pizza”, “nada, olvídalo”, “que no preguntes tanto”.
- Si el usuario responde metafórico/coqueto/absurdo: reacciona al tono (humor o contención), luego ofrece ayuda práctica SOLO si encaja.
- Variedad > plantilla. Nunca la misma broma siempre.
`.trim()
}
