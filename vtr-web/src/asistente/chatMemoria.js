const KEY_CHAT = 'vtr-chatbot-mensajes'
const KEY_MEMORIA = 'vtr-chatbot-memoria'
const MAX_MENSAJES = 60
const MAX_MEMORIAS = 24

export function saludoInicialAleatorio() {
  const saludos = [
    '¡Hola! Qué bueno verte. Cuéntame cómo vas… si quieres charlar, un tip o resolver algo, aquí estoy.',
    '¡Hey! Aquí presente. ¿Cómo viene el día?',
    '¡Buenas! Sin apuros: dime si quieres conversar o te ayudo con algo puntual.',
    '¡Holi! Listo para acompañarte. ¿Qué tienes en mente?',
  ]
  return saludos[Math.floor(Math.random() * saludos.length)]
}

export function cargarMensajesGuardados() {
  try {
    const raw = localStorage.getItem(KEY_CHAT)
    if (!raw) return null
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr) || !arr.length) return null
    return arr
      .filter((m) => m && (m.rol === 'user' || m.rol === 'bot') && m.texto)
      .slice(-MAX_MENSAJES)
      .map((m) => ({
        rol: m.rol,
        texto: String(m.texto),
        ...(Array.isArray(m.fuentes) ? { fuentes: m.fuentes } : {}),
        ...(Array.isArray(m.alternativas) ? { alternativas: m.alternativas } : {}),
        ...(Array.isArray(m.imagenes) ? { imagenes: m.imagenes.slice(0, 8) } : {}),
      }))
  } catch {
    return null
  }
}

export function guardarMensajes(mensajes) {
  try {
    const slim = (mensajes || [])
      .filter((m) => m && m.texto && (m.rol === 'user' || m.rol === 'bot'))
      .slice(-MAX_MENSAJES)
      .map((m) => ({
        rol: m.rol,
        texto: m.texto,
        ...(m.fuentes ? { fuentes: m.fuentes } : {}),
        ...(m.alternativas ? { alternativas: m.alternativas } : {}),
        ...(Array.isArray(m.imagenes) ? { imagenes: m.imagenes.slice(0, 8) } : {}),
      }))
    localStorage.setItem(KEY_CHAT, JSON.stringify(slim))
  } catch {
    // ignore quota
  }
}

export function cargarMemoriaAprendida() {
  try {
    const raw = localStorage.getItem(KEY_MEMORIA)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .filter((m) => m && m.texto)
      .slice(-MAX_MEMORIAS)
      .map((m) => ({
        texto: String(m.texto).slice(0, 180),
        actualizadoEn: m.actualizadoEn || null,
      }))
  } catch {
    return []
  }
}

export function guardarMemoriaAprendida(items) {
  try {
    localStorage.setItem(KEY_MEMORIA, JSON.stringify((items || []).slice(-MAX_MEMORIAS)))
  } catch {
    // ignore
  }
}

/** Extrae aprendizajes simples del turno (sin API). */
const OFENSIVO_RE =
  /\b(puta|puto|mierda|culiao|imbecil|idiota|estupido|pendejo|ctm|conchetumare|hijo\s+de\s+puta)\b/i

export function aprenderDelTurno(preguntaUsuario, historial = [], memoriaPrev = []) {
  const q = String(preguntaUsuario || '').trim()
  if (!q || q.length < 3) return memoriaPrev
  // No aprender de mensajes ofensivos: solo preferencias/temas útiles y respetuosos
  if (OFENSIVO_RE.test(q)) {
    const ahora = new Date().toISOString()
    const out = [...(memoriaPrev || [])]
    const t = 'Prefiere que se le responda con respeto aunque esté molesto'
    const i = out.findIndex((m) => m.texto.toLowerCase() === t.toLowerCase())
    if (i >= 0) out[i] = { texto: t, actualizadoEn: ahora }
    else out.push({ texto: t, actualizadoEn: ahora })
    return out.slice(-MAX_MEMORIAS)
  }

  const ahora = new Date().toISOString()
  const out = [...(memoriaPrev || [])]
  const push = (texto) => {
    const t = String(texto || '').trim().slice(0, 180)
    if (!t || OFENSIVO_RE.test(t)) return
    const i = out.findIndex((m) => m.texto.toLowerCase() === t.toLowerCase())
    if (i >= 0) out[i] = { texto: t, actualizadoEn: ahora }
    else out.push({ texto: t, actualizadoEn: ahora })
  }

  const ql = q
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const nombre = q.match(/(?:me llamo|soy|mi nombre es)\s+([A-Za-zÁÉÍÓÚáéíóúÑñ]{2,30})/i)
  if (nombre?.[1]) push(`El usuario se llama ${nombre[1]}`)

  if (/\b(prefiero|mejor)\b.{0,40}\b(corto|breve|rapido|resumen)\b/.test(ql)) {
    push('Prefiere respuestas cortas y directas')
  }
  if (/\b(expl[ií]came|con detalle|paso a paso|mas largo)\b/.test(ql)) {
    push('Prefiere explicaciones con más detalle / paso a paso')
  }
  if (/\b(estres|cansad|agotad|mal dia|ansied|triste|quemad)\b/.test(ql)) {
    push('Ha comentado cansancio o estrés; responder con calma y apoyo')
  }
  if (/\b(andes|pedido|boleta|pago|d-?box|modem|fibra|tipific)\b/.test(ql)) {
    push(`Tema reciente de trabajo: ${q.slice(0, 90)}`)
  }
  if (/\b(emoji|chiste|broma|musica|serie)\b/.test(ql)) {
    push('A veces pide charla liviana (emoji/chiste/ocio); seguirle el tono')
  }
  if (/\b(no me digas|deja de|no quiero)\b.{0,50}/.test(ql)) {
    push(`Preferencia/límite dicho por el usuario: ${q.slice(0, 100)}`)
  }

  // Si hay varios mensajes del usuario, recordar el último tema concreto (>12 chars, no solo saludo)
  if (q.length > 12 && !/^(hola|ok|vale|dale|si|gracias|jaja)/i.test(ql)) {
    push(`Último tema que trajo: ${q.slice(0, 100)}`)
  }

  return out.slice(-MAX_MEMORIAS)
}

export function formatearMemoriaParaPrompt(memoria) {
  const items = (memoria || []).slice(-12)
  if (!items.length) return ''
  return (
    '\n\nMemoria aprendida de conversaciones previas con este usuario (úsalas con naturalidad, no las enumeres como lista):\n' +
    items.map((m) => `- ${m.texto}`).join('\n')
  )
}

export function reiniciarChatLocal() {
  try {
    localStorage.removeItem(KEY_CHAT)
  } catch {
    // ignore
  }
}
