/**
 * Entrenamiento correcto de Apex (NO fine-tune de Gemini).
 *
 * Capas:
 * 1. HECHOS  → conocimiento_portal / corpus (RAG). Admin escribe, chat busca.
 * 2. TONO    → few-shots curados (apex_aprendizaje + diálogo Google). Pocos y buenos.
 * 3. MEMORIA → preferencias del usuario (nombre, “más corto”). No cada “hola”.
 * 4. CHARLA  → Gemini + historial. Local solo fallback. No se guarda como “conocimiento”.
 * 5. CANDIDATOS → baja confianza en tip → knowledge_candidates → admin aprueba.
 */

const MICRO_CHARLA_RE =
  /^(hola+|holi+|ola|hla|hi|hey|buenas?|ok+|oki|oka|vale|dale|sip|nop|nel|nah|na+|ya+|mmm+|hmm+|aea+|aja+|xd+|xddd*|jaja+|jeje+|lol|bruh|nada+|nada\s*(xd|pe|po|ps|che)?|gracias+|grax|chao+|adios+|bye+)\s*[.!?😂💀]*$/i

const EVASION_RE =
  /\b(que te importa|y a ti que|no es tu asunto|no te metas|eso no te importa|no te incumbe|no preguntes tanto|deja de preguntar)\b/i

const OFENSIVO_RE =
  /\b(puta|puto|mierda|culiao|imbecil|idiota|estupido|pendejo|ctm|conchetumare)\b/i

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/** Micro / evasión: Gemini responde; no se “entrena” como ejemplo ni candidato. */
export function esTurnoMicroOEvasion(pregunta) {
  const q = norm(pregunta)
  if (!q) return true
  if (q.length <= 4) return true
  if (MICRO_CHARLA_RE.test(q)) return true
  if (EVASION_RE.test(q)) return true
  return false
}

/**
 * ¿Guardar en apex_aprendizaje (few-shot compartido)?
 * Solo turnos con sustancia: tip portal, cine, o charla larga útil.
 */
export function debeAprenderComoEjemplo({
  pregunta,
  respuesta,
  tema,
  charla = false,
  conGuia = false,
  esCine = false,
} = {}) {
  const q = String(pregunta || '').trim()
  const r = String(respuesta || '').trim()
  if (q.length < 8 || r.length < 20) return false
  if (OFENSIVO_RE.test(q) || OFENSIVO_RE.test(r)) return false
  if (esTurnoMicroOEvasion(q)) return false

  // Hechos / cine: sí
  if (esCine || conGuia) return true
  if (tema === 'cine' || tema === 'portal' || tema === 'soporte_tecnico') return true

  // Charla: solo si aporta (no monosílabos ni evasión)
  if (charla || tema === 'charla') {
    if (q.length < 18 || r.length < 40) return false
    // Evitar aprender plantillas locales cortas tipo “Ok. Sin presión.”
    if (/^(ok|va|dale|tranqui|listo)\b/i.test(r) && r.length < 50) return false
    return true
  }

  return q.length >= 12 && r.length >= 40
}

/** Few-shots de tono para evasión / micro (enseña a Gemini, no reemplaza al modelo). */
export const FEWSHOTS_TONO_CHARLA = [
  {
    pregunta: 'nada',
    respuesta: 'Ok. Sin presión. Aquí ando si se te ocurre algo.',
    tema: 'evasion',
  },
  {
    pregunta: 'nada pe',
    respuesta: 'Va pe. Avisas si aparece algo.',
    tema: 'evasion',
  },
  {
    pregunta: 'qué te importa',
    respuesta: 'Justo. Bajo el volumen. Tú marcas el tema.',
    tema: 'evasion',
  },
  {
    pregunta: 'y a ti qué',
    respuesta: 'Ok, respeto. Sin fisgonear. ¿De qué hablamos entonces?',
    tema: 'evasion',
  },
  {
    pregunta: 'no es tu asunto',
    respuesta: 'Entendido. Espacio personal. Cuando quieras, disparas.',
    tema: 'evasion',
  },
]

export function formatearFewshotsTonoParaPrompt(max = 4) {
  const items = FEWSHOTS_TONO_CHARLA.slice(0, max)
  if (!items.length) return ''
  return (
    '\n\nEstilo ante evasión/micro (inspírate, no copies siempre igual; no interrogues):\n' +
    items.map((e, i) => `${i + 1}. Usuario: "${e.pregunta}" → Apex: "${e.respuesta}"`).join('\n')
  )
}

/** Texto corto para Admin / docs internas. */
export const GUIA_ENTRENAMIENTO_APEX = [
  ['Hechos', 'Procedimientos Andes/portal y Somos Clave van al corpus (Admin → Publicar Somos Clave). Gemini los explica con RAG.'],
  ['Tono', 'Pocos ejemplos buenos en “Nutrir diálogos”. Charla la lleva Gemini, no listas locales.'],
  ['Memoria', 'Solo preferencias del usuario (nombre, más corto). No “entrenar” con hola/nada/xd.'],
  ['Revisar', 'Si un tip sale con baja confianza → candidato pendiente → apruebas tú. Charla no crea candidatos.'],
]
