/**
 * Bloque 10 — Intenciones: sueño, hartazgo, molestia, cansancio, aburrimiento.
 * Misma intención → muchas expresiones + jerga + typos + contexto.
 */

function pair(id, cat, estilo, a, b) {
  return { id, categoria: cat, estilo, bloque: '10', turnos: [{ rol: 'A', texto: a }, { rol: 'B', texto: b }] }
}
function multi(id, cat, estilo, turnos) {
  return { id, categoria: cat, estilo, bloque: '10', turnos }
}

const DORMIR = [
  'Quiero dormir.',
  'Tengo sueño.',
  'Me quiero acostar.',
  'Ya me dio sueño.',
  'Estoy que me quedo dormido.',
  'No doy más del sueño.',
  'Me muero de sueño.',
  'Estoy reventado.',
  'Necesito dormir.',
  'Necesito una cama urgente 😂',
  'Ya me voy a mimir.',
  'Hora de mimir 😴',
  'Estoy cabeceando.',
  'Se me cierran los ojos.',
  'Mi cuerpo pide cama.',
  'Me voy a tirar a dormir.',
  'Estoy fundido.',
  'Ya no funciono.',
  'Estoy en modo zombie.',
  'Necesito recargar batería.',
  'Me desconecto por hoy.',
  'Ya fue, a dormir.',
  'Me retiro a mis aposentos 😂',
  'toy cansao',
  'q sueño tengo',
  'me kiero dormir',
  'necesito mimir',
  'tengo sueñoooo',
  'ya me voy a mimir xd',
  'se me cierran los ojosss',
  'toy muerto',
  'toy reventao',
]

const HARTO = [
  'Estoy harto.',
  'Ya me cansé.',
  'No aguanto más.',
  'Estoy hasta acá.',
  'Ya me colmó la paciencia.',
  'Estoy saturado.',
  'Estoy quemado.',
  'Siempre lo mismo.',
  'Ya me llegó.',
  'Estoy al límite.',
  'Necesito desconectarme.',
  'arto ya',
  'estoy arto',
  'ya me arte',
  'toy harto',
  'ya me cansé p',
  'me tiene cansao',
  'ya fue no aguanto',
  'oe ya cansa',
]

const MOLESTO = [
  'Estoy fastidiado.',
  'Estoy de malas.',
  'Qué rabia.',
  'Me da cólera.',
  'Qué pesado.',
  'Hoy no estoy para nadie.',
  'No estoy de humor.',
  'Ando medio picón.',
  'Estoy que exploto.',
  'Me sacaron de quicio.',
  'Estoy renegando.',
  'Pucha, qué cólera.',
  'ya me llegó',
  'qué fastidiooo',
  'pucha ya',
  'estoy que exploto',
]

const CANSADO_FISICO = [
  'Estoy cansado.',
  'Estoy agotado.',
  'Estoy muerto.',
  'Estoy destruido.',
  'No tengo fuerzas.',
  'Estoy sin batería.',
  'Estoy hecho polvo.',
  'No siento las piernas 😂',
  'Estoy para dormir parado.',
  'Ya no doy una.',
  'toy cansado mal',
  'estoy k no doy mas',
  'no doy mas p',
]

const CANSADO_MENTAL = [
  'Tengo la cabeza saturada.',
  'Estoy mentalmente agotado.',
  'No puedo pensar.',
  'Mi cerebro no funciona.',
  'Estoy bloqueado.',
  'Necesito despejarme.',
  'Ya no me entra nada.',
  'Necesito apagar el cerebro un rato.',
  'Estoy saturadísimo.',
]

const ABURRIDO = [
  'Estoy aburrido.',
  'Qué aburrimiento.',
  'No sé qué hacer.',
  'Me estoy muriendo acá.',
  'Estoy mirando el techo xd',
  'Qué hago con mi vida 😂',
  'Estoy literalmente sin oficio.',
]

const RESP_DORMIR = [
  'Dale, descansa.',
  'Ve a mimir 😴',
  'Buenas noches.',
  'Recarga batería.',
  'Va, duerme.',
  'Te lo ganaste.',
]
const RESP_HARTO = [
  'Te entiendo.',
  'Tómate un respiro.',
  'Va, desconecta un rato.',
  'Tiene sentido que estés así.',
]
const RESP_MOLESTO = [
  'Ok, sin presión.',
  '¿Quieres espacio o hablar?',
  'Entiendo la cólera.',
  'Va.',
]
const RESP_CANSADO = [
  'Descansa.',
  'Hoy fue demasiado.',
  'Ve a recargar.',
  'Tranqui.',
]
const RESP_ABURRIDO = [
  '¿Inventamos algo?',
  '¿Charlamos o jugamos?',
  'Te acompaño un rato.',
  '¿Qué se te antoja hacer?',
]

function mapIntent(list, prefix, cat, responses) {
  return list.map((texto, i) =>
    pair(`${prefix}-${String(i + 1).padStart(2, '0')}`, cat, 'intencion', texto, responses[i % responses.length])
  )
}

export const BLOQUE_10_INTENCIONES = [
  ...mapIntent(DORMIR, 'b10-sleep', 'intencion_dormir', RESP_DORMIR),
  ...mapIntent(HARTO, 'b10-harto', 'intencion_harto', RESP_HARTO),
  ...mapIntent(MOLESTO, 'b10-mol', 'intencion_molesto', RESP_MOLESTO),
  ...mapIntent(CANSADO_FISICO, 'b10-can', 'intencion_cansancio', RESP_CANSADO),
  ...mapIntent(CANSADO_MENTAL, 'b10-men', 'intencion_mental', RESP_CANSADO),
  ...mapIntent(ABURRIDO, 'b10-abu', 'intencion_aburrido', RESP_ABURRIDO),
  multi('b10-ctx-muerto-1', 'intencion_contexto', 'contexto', [
    { rol: 'A', texto: 'Estoy muerto.' },
    { rol: 'B', texto: '¿De sueño o de la risa? 😂' },
    { rol: 'A', texto: 'De sueño.' },
    { rol: 'B', texto: 'Ve a mimir entonces.' },
  ]),
  multi('b10-ctx-muerto-2', 'intencion_contexto', 'contexto', [
    { rol: 'A', texto: 'Estoy muerto.' },
    { rol: 'B', texto: '¿Qué pasó?' },
    { rol: 'A', texto: 'JAJAJA el chiste.' },
    { rol: 'B', texto: 'Ah, de risa 💀' },
  ]),
  multi('b10-ctx-nada', 'intencion_contexto', 'contexto', [
    { rol: 'A', texto: 'Estoy destruido.' },
    { rol: 'B', texto: '¿Trabajo o sueño?' },
    { rol: 'A', texto: 'Las dos.' },
    { rol: 'B', texto: 'Uf. Descansa.' },
  ]),
]

export function formatearIntencionesParaPrompt() {
  return `
INTENCIONES (no solo palabras exactas):
- “quiero dormir / estoy muerto / necesito cama / modo zombie / mimir” ≈ sueño/descanso (según contexto).
- “harto / no aguanto / quemado / ya me llegó” ≈ hartazgo.
- “cólera / de malas / picón / fastidiado” ≈ molestia.
- “aburrido / no sé qué hacer” ≈ aburrimiento.
- Misma frase (“estoy muerto”) puede ser sueño, risa o drama: pregunta suave si no hay contexto.
- Incluye typos: toy cansao, q sueño, me kiero dormir, arto ya.
`.trim()
}
