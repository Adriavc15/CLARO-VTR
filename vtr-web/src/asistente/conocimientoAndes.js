// Base de conocimiento: índice del portal Apex + docs en vivo (Firestore)
import { INDICE_PORTAL_LOCAL } from './indicePortal.js'
import { imagenesGuiaParaDoc } from './assetsGuias.js'

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Distingue el indicador técnico LOS del artículo español “los”. */
function esMencionLosTecnico(texto) {
  const q = norm(texto)
  if (q === 'los' || q === 'led los' || q === 'luz los') return true
  return (
    /\b(luz|led|foco|indicador|ont|fibra|cajita|senal|señal|rojo|roja|parpadea|parpadeando)\b.{0,28}\blos\b/.test(q) ||
    /\blos\b.{0,28}\b(rojo|roja|parpadea|parpadeando|ont|fibra|luz|led|senal|señal)\b/.test(q) ||
    /\b(problemas?|falla)\s+con\s+(?:el\s+)?los(?:\s+(?:rojo|roja|parpadeando))?$/.test(q)
  )
}

/** Acceso OTT / mensaje CONTACTESE CON VTR / TNT–Max (no confundir con ONT/LOS). */
function esConsultaSoporteStreaming(texto) {
  const q = norm(texto)
  return (
    /contacte(?:se)? con vtr|comunicate con vtr|contactar(?:se)? con vtr/.test(q) ||
    (/\b(tnt|max|netflix|disney|hbo|crunchy|ott|streaming)\b/.test(q) &&
      /\b(credencial|no (puedo|me deja) (entrar|ingresar|ver)|no me deja|mensaje|contrate|contraté)\b/.test(q)) ||
    /\b(tnt|max)\b.{0,40}\b(contacte|mensaje|credencial|no (puedo|me deja))/.test(q) ||
    /\b(contacte|mensaje).{0,40}\b(tnt|max|netflix|vtr)\b/.test(q)
  )
}

/**
 * ¿La consulta pide dar de baja / cancelar el servicio? Cubre "baja de servicio",
 * "dar(se) de baja", "dejar el servicio", "pedir/solicitar la baja"… sin confundir
 * con "bajar de plan" (cambio de plan) ni "velocidad baja".
 */
function esBajaServicio(q) {
  return (
    /\b(dar|darse|darme|darte|dejarse|dejar|dejo|deje|pedir|solicitar|pide|pido|quiere|quiero|quería|queria|necesito|deseo)\b.{0,14}\b(de\s+)?baja\b/.test(
      q
    ) ||
    /\bbaja\b.{0,16}\b(servicio|servicios|plan|planes|contrato|cuenta|linea|línea|internet|tv|cable|telefono|teléfono|movil|móvil|hogar)\b/.test(
      q
    ) ||
    /\b(servicio|servicios|plan|contrato|cuenta|linea|línea)\b.{0,14}\bbaja\b/.test(q) ||
    /\b(hacer|hago|hace|hacen|realizar|realiza|realizan|tramitar|tramita|tramite|trámite|gestionar|gestiona|gestiono|gestion|sacar)\b.{0,16}\b(la\s+|una\s+|el\s+|de\s+)?baja\b/.test(
      q
    ) ||
    /\b(dejar|dejo|deje|desconectar|desconexion|desconexión)\b.{0,16}\b(servicio|servicios|plan|contrato|linea|línea|internet|tv|cable)\b/.test(
      q
    )
  )
}

/** FAQs Somos Clave enfocadas: { test, faqId, scIds?, penalize? } */
const FAQ_SC_ENFOQUES = [
  {
    faqId: 'faq-activar-streaming-ott',
    test: (q) =>
      /\b(activar|activacion|activo)\b/.test(q) &&
      /\b(streaming|ott|plataformas?|apps?)\b/.test(q) &&
      !/\b(precio|cuanto|cuesta)\b/.test(q),
    scIds: ['sc-1111', 'sc-1116', 'sc-1010', 'sc-1113'],
  },
  {
    faqId: 'faq-activar-netflix',
    test: (q) =>
      /\bnetflix\b/.test(q) &&
      /\b(activar|activacion|activo|como activo|cómo activo)\b/.test(q) &&
      !/\b(a la carta|d-?box|dbox|error|001)\b/.test(q),
    scIds: ['sc-1111'],
  },
  {
    faqId: 'faq-403-oauth-vtr-tnt-hbo',
    test: (q) =>
      (/\b403\b/.test(q) && /\b(oauth|authorize|accounts\.vtr|tbx|forbidden|activar|tnt|hbo)\b/.test(q)) ||
      /\baccounts\.vtr\.com\/oauth2\/authorize\b/.test(q) ||
      (/\b(tbxapis|tbxnet)\b/.test(q) && /\b(403|error|falla|activar)\b/.test(q)),
    scIds: ['sc-1116'],
  },
  {
    faqId: 'faq-auth-hbomax-providers-subtel',
    test: (q) =>
      (/\b(subtel|apuestas|phishing)\b/.test(q) && /\b(hbo|max|auth\.hbomax|tnt|providers)\b/.test(q)) ||
      (/\bauth\.hbomax\b/.test(q) && /\b(seguro|legitimo|legítimo|bloqueo|apuesta|phishing|falso)\b/.test(q)) ||
      (/\bbloqueo\b/.test(q) && /\b(apuestas|subtel)\b/.test(q) && /\b(hbo|max|tnt|streaming|auth)\b/.test(q)),
    scIds: ['sc-1116'],
  },
  {
    faqId: 'faq-activar-tnt-sports-hbo-max',
    test: (q) =>
      (/\btnt\b/.test(q) && /\b(hbo|max|activ)\b/.test(q)) ||
      /\bactivatntsports\b/.test(q) ||
      (/\btnt\b/.test(q) && /\b(activar|activacion|activo)\b/.test(q)),
    scIds: ['sc-1116'],
  },
  {
    faqId: 'faq-hbo-max',
    test: (q) =>
      (/\b(hbo|hbomax)\b/.test(q) && !/\btnt\b/.test(q)) ||
      (/\btnt\b/.test(q) && /\b(no (abre|funciona|activa)|inconveniente|problema)\b/.test(q) && !/\bactivar\b/.test(q)),
    scIds: ['sc-1116'],
  },
  {
    faqId: 'faq-disney-plus',
    test: (q) => /\bdisney\b/.test(q) && !/\b(precio|cuanto|cuesta|vale|plan)\b/.test(q),
    scIds: ['sc-1010'],
  },
  {
    faqId: 'faq-prime-video',
    test: (q) => /\b(prime|amazon prime)\b/.test(q),
    scIds: ['sc-1110'],
  },
  {
    faqId: 'faq-crunchyroll',
    test: (q) => /\b(crunchyroll|crunchy)\b/.test(q),
    scIds: ['sc-1113'],
  },
  {
    faqId: 'faq-universal-plus',
    test: (q) => /\buniversal\b/.test(q),
    scIds: ['sc-1114'],
  },
  {
    faqId: 'faq-storytel',
    test: (q) => /\bstorytel\b/.test(q),
    scIds: ['sc-1112'],
  },
  {
    faqId: 'faq-netflix-a-la-carta',
    test: (q) => /\bnetflix\b/.test(q) && /\b(a la carta|no reconoce|no contrate)\b/.test(q),
    scIds: ['sc-1153'],
  },
  {
    faqId: 'faq-dbox-bloqueo',
    test: (q) =>
      (/\b(d-?box|dbox|box\s*tv|decodificador)\b/.test(q) && /\b(bloqueo|bloquead|deuda)\b/.test(q)) ||
      /\bmensaje de bloqueo\b/.test(q),
    scIds: ['sc-1459', 'sc-173'],
  },
  {
    faqId: 'faq-clave-wifi',
    test: (q) =>
      /\b(clave|contrasena|password)\b/.test(q) && /\b(wifi|wi-?fi|modem|router)\b/.test(q),
    scIds: ['sc-1026'],
  },
  {
    faqId: 'faq-extensores-wifi',
    test: (q) => /\b(extensor|extensores|repetidor)\b/.test(q),
    scIds: ['sc-1033'],
  },
  {
    faqId: 'faq-wifi-mesh',
    test: (q) => /\bmesh\b/.test(q),
    scIds: ['sc-1014'],
  },
  {
    faqId: 'faq-telefonia-fija',
    test: (q) =>
      /\b(telefonia|telefono fijo|linea fija|tono)\b/.test(q) ||
      (/\bfijo\b/.test(q) && /\b(no funciona|sin tono|no llama|inconveniente)\b/.test(q)),
    scIds: ['sc-1052'],
  },
  {
    faqId: 'faq-iptv-deuda',
    test: (q) =>
      (/\b(iptv|tv|dbox|decodificador)\b/.test(q) && /\b(suspendid|deuda|qr)\b/.test(q)) ||
      /\bpantalla qr\b/.test(q),
    scIds: ['sc-173'],
  },
  {
    faqId: 'faq-max-iptv',
    test: (q) => /\bmax iptv\b/.test(q) || (/\b(d-?box|dbox)\b/.test(q) && /\b(limite|6|siete|reposición|reposicion)\b/.test(q)),
    scIds: ['sc-1330'],
  },
  {
    faqId: 'faq-corte-energia',
    test: (q) => /\b(corte de (luz|energia|energía)|sin (luz|electricidad)|apagon|apagón)\b/.test(q),
    scIds: ['sc-1246'],
  },
  {
    faqId: 'faq-corte-acometida',
    test: (q) => /\bacometida\b/.test(q) || (/\bcable\b/.test(q) && /\b(poste|afuera|exterior|cortad)\b/.test(q)),
    scIds: ['sc-1329'],
  },
  {
    faqId: 'faq-valores-visitas',
    test: (q) =>
      /\bvisita\b/.test(q) && /\b(cuesta|costo|valor|cobro|precio|20000|20\.000)\b/.test(q),
    scIds: ['sc-1342'],
  },
  {
    faqId: 'faq-bloques-visita',
    test: (q) => /\b(bloque|horario)s?\b/.test(q) && /\bvisita\b/.test(q),
    scIds: ['sc-1353'],
  },
  {
    faqId: 'faq-where-is-my-tech',
    test: (q) => /\bwhere is my tech\b/.test(q) || (/\bconfirm(ar|acion|ación)\b/.test(q) && /\bvisita\b/.test(q)),
    scIds: ['sc-1045'],
  },
  {
    faqId: 'faq-visitas-tecnicas',
    test: (q) =>
      (/\b(agendar|reagendar|ingresar)\b.{0,20}\bvisita\b/.test(q) ||
        /\bvisita t[eé]cnica\b/.test(q) ||
        /\btecnico no (llego|llegó|vino)\b/.test(q) ||
        /\bincumplimiento de visita\b/.test(q)) &&
      !/\b(cuesta|costo|valor|cobro|precio|horarios?|bloques?|confirm)\b/.test(q),
    scIds: ['sc-1036'],
  },
  {
    faqId: 'faq-explicacion-boleta',
    test: (q) =>
      /\b(explicar|explicacion|entend|variacion|billing compare)\b/.test(q) && /\bboleta\b/.test(q),
    scIds: ['sc-1028'],
  },
  {
    faqId: 'faq-sin-boleta',
    test: (q) => /\b(sin boleta|no (tengo|sale|emite) boleta|boletas? alfanumeric)\b/.test(q),
    scIds: ['sc-1199'],
  },
  {
    faqId: 'faq-no-recibe-boleta',
    test: (q) => /\b(no (recibo|llega|me llega)|distribucion)\b/.test(q) && /\bboleta\b/.test(q),
    scIds: ['sc-1310'],
  },
  {
    faqId: 'faq-inconveniente-pago',
    test: (q) =>
      /\b(pague|pagué|pago)\b/.test(q) &&
      /\b(no (se )?refleja|no aplicado|inconveniente|sigue (la )?deuda|comprobante)\b/.test(q),
    scIds: ['sc-1303'],
  },
  {
    faqId: 'faq-corte-reposicion',
    test: (q) => /\b(corte y reposicion|corte y reposición|cobro de corte|cargo (de )?corte)\b/.test(q),
    scIds: ['sc-1240'],
  },
  {
    faqId: 'faq-portal-cautivo',
    test: (q) => /\b(portal cautivo|captive|pago express)\b/.test(q) || (/\bsuspendid\b/.test(q) && /\b(redirige|solo pagar)\b/.test(q)),
    scIds: ['sc-1356'],
  },
  {
    faqId: 'faq-traslado-servicios',
    test: (q) => /\b(traslado|mudanza|cambio de domicilio)\b/.test(q),
    scIds: ['sc-1058'],
  },
  {
    faqId: 'faq-titular-tercero',
    test: (q) =>
      /\b(titular|tercero|poder notarial)\b/.test(q) &&
      /\b(atender|atencion|puede|detalle boleta|fallecid)\b/.test(q),
    scIds: ['sc-1051'],
  },
  {
    faqId: 'faq-sucursal-virtual',
    test: (q) => /\bsucursal virtual\b/.test(q),
    scIds: ['sc-1057'],
  },
  {
    faqId: 'faq-vtr-play-tv',
    test: (q) => /\b(vtr play|play tv)\b/.test(q),
    scIds: ['sc-1044', 'sc-1205'],
  },
  {
    faqId: 'faq-correo-vtr',
    test: (q) => /\bcorreo\b/.test(q) && /\bvtr\b/.test(q),
    scIds: ['sc-1027'],
  },
  {
    faqId: 'faq-web-bloqueada',
    test: (q) =>
      /\b(pagina|página|sitio|web)\b/.test(q) && /\b(bloquead|no (abre|carga|entra)|bloqueo)\b/.test(q),
    scIds: ['sc-1285'],
  },
  {
    faqId: 'faq-migracion-fibra',
    test: (q) => /\b(migracion|migración)\b/.test(q) && /\bfibra\b/.test(q),
    scIds: ['sc-138', 'sc-1443'],
  },
  {
    faqId: 'faq-retencion-anulacion',
    test: (q) =>
      /\b(retencion|retención)\b/.test(q) ||
      (/\b(anular|cancelar)\b/.test(q) && /\b(servicio|plan|contrato|cuenta|linea|línea)\b/.test(q)) ||
      esBajaServicio(q),
    scIds: ['sc-1006'],
  },
]

function faqScMatch(q) {
  return FAQ_SC_ENFOQUES.filter((e) => e.test(q))
}

/** Guías resumidas (compat) — el índice completo está en indicePortal */
export const ANDES_GUIAS = INDICE_PORTAL_LOCAL.filter((d) => d.tipo === 'guia' || d.tipo === 'hecho')

/** Marcas / productos cortos que NO son charla */
const ENTIDADES_CORTAS = new Set([
  'hbo',
  'max',
  'ott',
  'tv',
  'sim',
  'esim',
  'pac',
  'pat',
  'pna',
  'ont',
  'hfc',
  'ftth',
  'dth',
  'ss',
  'crm',
  'toa',
  'gis',
  'sii',
  'bec',
  'iptv',
  'vod',
  'tnt',
  'cnn',
  'ont',
  'los',
  'pon',
  'lan',
  'wlan',
  'tel',
  'app',
  'crunchy',
  'dbox',
  'apex',
  'tsq',
])

const ALIAS_ENTIDAD = {
  hbo: ['hbo', 'hbo max', 'hbomax', 'max', 'pack hbo'],
  max: ['max', 'hbo', 'hbo max', 'hbomax'],
  netflix: ['netflix', 'netflis', 'netflx'],
  disney: ['disney', 'disney+', 'disney plus', 'disneyplus'],
  crunchyroll: ['crunchyroll', 'crunchy', 'anime'],
  tnt: ['tnt', 'tnt sports', 'tnt sports pack'],
  adulto: ['pack adulto', 'pack adultos', 'canales adultos', 'playboy', 'venus', 'sextreme', 'hotgo', 'prodpradul'],
  playboy: ['playboy', 'playboy hd', 'pack adulto'],
  prime: ['prime', 'amazon prime', 'prime video'],
  universal: ['universal', 'universal+'],
  streaming: ['streaming', 'ott', 'ott a la carta', 'pack adulto', 'canales adultos'],
  ont: ['ont', 'cajita', 'caja de internet', 'caja de fibra', 'modem fibra', 'cajita de internet'],
  los: [
    'los',
    'led los',
    'luz los',
    'luz roja',
    'foco rojo',
    'luz roja router',
    'luz roja modem',
    'luz roja repetidor',
    'luz roja extensor',
  ],
  pon: ['pon', 'luz pon'],
  wifi: ['wifi', 'wi fi', 'inalambrico', 'ssid'],
  // No usar "con"/"contr" sueltos como alias de entrada: "con" es preposición
  control: ['control remoto', 'control', 'mando', 'contro', 'ctrl', 'remoto'],
  dbox: ['dbox', 'd-box', 'd box', 'decodificador', 'smart ii'],
  plan: ['plan', 'planes'],
  fibra: ['fibra', 'ftth', 'internet fibra'],
  megas: ['megas', 'mbps', 'mega'],
  asistencia: ['asistencia', 'asisten', 'asist'],
}

/** Vocabulario para completar palabras a medias (prefijos ≥ 3–4 letras). */
const VOCAB_INCOMPLETAS = [
  'netflix',
  'disney',
  'disneyplus',
  'hbomax',
  'hbo',
  'prime',
  'amazon',
  'streaming',
  'fibra',
  'internet',
  'megas',
  'modem',
  'router',
  'repetidor',
  'extensor',
  'control',
  'remoto',
  'asistencia',
  'visita',
  'tecnica',
  'plan',
  'planes',
  'precio',
  'promo',
  'promocion',
  'incluido',
  'incluye',
  'cuanto',
  'tienen',
  'quiero',
  'necesito',
  'telefonia',
  'netflix',
  'pack',
  'max',
  'ont',
  'los',
]

/** Prefijos ambiguos en español: NUNCA completar a entidad (p.ej. "con" ≠ "control"). */
const NO_EXPANDIR_INCOMPLETA = new Set([
  'con',
  'por',
  'para',
  'que',
  'del',
  'una',
  'uno',
  'las',
  'los',
  'mas',
  'sin',
  'muy',
  'tan',
  'asi',
  'hay',
  'ser',
  'son',
  'fue',
  'era',
  'van',
  'voy',
  'ver',
  'ves',
  'veo',
  'tiene',
  'tengo',
  'tiene',
  'sale',
  'esta',
  'este',
  'esto',
  'esa',
  'ese',
  'pro',
  'pre',
  'com',
  'tra',
  'pla',
])

/**
 * Expande tokens incompletos: "netfli"→netflix, "fibr"→fibra, "disne"→disney.
 * No inventa: solo si el prefijo es único o muy claro.
 * Mínimo 4 letras (evita "con"→control, "pla"→plan).
 */
function expandirPalabrasIncompletas(q, tokens) {
  const outQ = String(q || '')
  const outTokens = [...(tokens || [])]
  const seen = new Set(outTokens)

  const completar = (tok) => {
    if (!tok || tok.length < 4 || tok.length > 12) return null
    if (NO_EXPANDIR_INCOMPLETA.has(tok)) return null
    if (VOCAB_INCOMPLETAS.includes(tok) || ALIAS_ENTIDAD[tok] || ENTIDADES_CORTAS.has(tok)) return null
    // Evitar números sueltos (600 ya es completo)
    if (/^\d+$/.test(tok)) return null
    const cands = VOCAB_INCOMPLETAS.filter((v) => v.startsWith(tok) && v !== tok)
    if (cands.length === 1) return cands[0]
    // Empate: preferir la más corta / marca conocida
    if (cands.length > 1 && tok.length >= 4) {
      cands.sort((a, b) => a.length - b.length)
      return cands[0]
    }
    // Alias: "netfl" → netflix vía lista.
    // Importante: solo alias de UNA palabra. Si no, una palabra completa se
    // expande a una frase (p.ej. "cambio" → "cambio de plan" por el alias de
    // "plan") y desvía la consulta a otro tema.
    for (const [canon, aliases] of Object.entries(ALIAS_ENTIDAD)) {
      if (canon.startsWith(tok) && canon !== tok && tok.length >= 4) return canon
      const hitAlias = aliases.some((a) => {
        const na = norm(a)
        return na.length > tok.length && !na.includes(' ') && na.startsWith(tok) && tok.length >= 4
      })
      if (hitAlias) return canon
    }
    return null
  }

  for (const t of [...outTokens, ...outQ.split(' ')]) {
    const full = completar(t)
    if (full && !seen.has(full)) {
      seen.add(full)
      outTokens.push(full)
    }
  }

  let q2 = outQ
  // Reemplazar en la query tokens incompletos claros (palabra completa)
  for (const t of outQ.split(' ')) {
    const full = completar(t)
    if (full && t !== full) {
      q2 = q2.replace(new RegExp(`(?:^|\\s)${t}(?=\\s|$)`), (m) => m.replace(t, full))
    }
  }
  return { q: q2.trim(), tokens: outTokens }
}

function expandTokens(tokens, q) {
  const out = new Set(tokens)
  for (const t of tokens) {
    for (const a of ALIAS_ENTIDAD[t] || []) {
      for (const p of norm(a).split(' ')) if (p.length >= 2) out.add(p)
    }
  }
  // "hbo" solo
  if (ENTIDADES_CORTAS.has(q) || ALIAS_ENTIDAD[q]) {
    out.add(q)
    for (const a of ALIAS_ENTIDAD[q] || [q]) {
      for (const p of norm(a).split(' ')) if (p.length >= 2) out.add(p)
    }
  }
  return [...out]
}

function esPreguntaDefinicion(q) {
  return /\b(que es|que significa|que hace|para que sirve|para que es|funcion|funciona|como funciona|en que consiste|de que trata|que ofrece)\b/.test(
    q
  )
}

/** Consultas cortas / “qué es…” → respuesta en prosa local (sin viñetas ni reescritura IA) */
export function esConsultaEspecificaCorta(pregunta) {
  const q = norm(pregunta)
  if (!q) return false
  return (
    esPreguntaDefinicion(q) ||
    q.split(' ').filter(Boolean).length <= 2 ||
    ENTIDADES_CORTAS.has(q) ||
    Boolean(ALIAS_ENTIDAD[q]) ||
    /^(noticias?|comunicados?|avisos?|ultimas noticias|ultima noticia|contrataciones?|planes|streaming|ott)$/.test(q) ||
    // Preguntas puntuales: conservar respuesta local enfocada (no dejar que Gemini mezcle temas)
    /\b(quien|quién).{0,20}\b(contratar|contrata).{0,20}\basistencia\b/.test(q) ||
    /\basistencia\b.{0,20}\b(cubre|cobertura|precio|cuesta|cuanto)\b/.test(q) ||
    /contacte(?:se)? con vtr/.test(q) ||
    (/\b(tnt|max)\b/.test(q) && /\b(contacte|credencial|no (puedo|me deja))\b/.test(q)) ||
    (esMencionLosTecnico(q) && /\b(significa|rojo|roja)\b/.test(q)) ||
    /\b(busc(a|o|ar)).{0,20}\b(cliente|rut)\b/.test(q) ||
    (/\bnetflix\b/.test(q) &&
      (/\b(d-?box|dbox|error\s*0*01|no (reproduce|funciona)|problema)\b/.test(q) ||
        /\berror\s*0*01\b/.test(q))) ||
    /\berror\s*0*01\b/.test(q) ||
    /\bproblemas?\s+con\s+(el\s+)?netflix\b/.test(q)
  )
}

export function esDocNoticia(doc) {
  return doc?.tipo === 'noticia' || String(doc?.id || '').startsWith('noticia-')
}

export function esDocContratacion(doc) {
  if (!doc) return false
  if (doc.fuente === 'portal-contrataciones') return true
  if (
    doc.fuente === 'entrenamiento-control-remoto' ||
    doc.fuente === 'entrenamiento-control-remoto-ejemplos'
  )
    return true
  if (doc.fuente === 'entrenamiento-cambio-plan' || doc.fuente === 'entrenamiento-cambio-plan-ejemplos')
    return true
  if (doc.fuente === 'entrenamiento-dbox' || doc.fuente === 'entrenamiento-dbox-ejemplos') return true
  if (/Contrataciones/i.test(doc.seccionPortal || '')) return true
  return /^(sec-contrataciones|guia-control-remoto|guia-cambio-plan|guia-dbox|guia-asistencia|guia-wifi|cr-|cp-|db-)/.test(
    String(doc.id || '')
  )
}

export function esDocPlan(doc) {
  return (
    doc?.tipo === 'plan' ||
    doc?.fuente === 'portal-planes' ||
    (doc?.fuente === 'kb-andes-vtr' && String(doc?.categoria || '').toLowerCase() === 'planes') ||
    String(doc?.id || '').startsWith('plan-') ||
    String(doc?.id || '').startsWith('cable-') ||
    (String(doc?.id || '').startsWith('KB-') && doc?.tipo === 'plan') ||
    doc?.id === 'menu-planes' ||
    doc?.id === 'sec-planes'
  )
}

export function esDocStreaming(doc) {
  return (
    doc?.tipo === 'streaming' ||
    doc?.fuente === 'portal-streaming' ||
    doc?.fuente === 'entrenamiento-streaming-comercial' ||
    doc?.fuente === 'entrenamiento-streaming-ejemplos' ||
    (doc?.fuente === 'kb-andes-vtr' && doc?.tipo === 'streaming') ||
    String(doc?.id || '').startsWith('stream-') ||
    String(doc?.id || '').startsWith('ott-') ||
    doc?.id === 'menu-streaming' ||
    doc?.id === 'sec-streaming'
  )
}

function scoreDoc(doc, q, tokens) {
  // Hubs NL: exigir entidad/velocidad; si no, score 0 (evita “qué planes tienen” → HBO)
  if (doc.fuente === 'kb-andes-nl') {
    const intent = String(doc.intent || '')
    const needed = Array.isArray(doc.matchTokens) ? doc.matchTokens.map((t) => norm(t)).filter(Boolean) : []
    if (intent.includes('fibra_')) {
      const vel = intent.split('_').pop()
      if (!q.includes(vel) && !tokens.includes(vel)) return 0
    } else if (intent === 'consultar_planes_general') {
      if (/hbo|max|netflix|disney|prime|crunchy/.test(q)) return 0
      if (!/(plan|planes|fibra|internet|velocidad|megas|catalogo|opcion|precios?)/.test(q)) return 0
    } else if (needed.length) {
      // Palabra completa (evita “contratar”.includes(“ont”) → hub LOS falso)
      const hit = needed.some((nt) => {
        if (nt.length < 2) return false
        if (tokens.includes(nt)) return true
        return new RegExp(`(?:^|\\s)${nt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`).test(q)
      })
      if (!hit) return 0
    }
  }

  const contenidoTxt = Array.isArray(doc.contenido)
    ? doc.contenido.join(' ')
    : String(doc.contenido || '')
  const tituloN = norm(doc.titulo || doc.nombre || '')
  const haystack = norm(
    [doc.nombre, doc.titulo, doc.tituloCompleto, doc.categoria, doc.seccionPortal, ...(doc.sinonimos || []), contenidoTxt].join(
      ' '
    )
  )
  const tokenHit = (hay, t) => {
    if (!t) return false
    // Tokens cortos (ont, hfc, hbo…): solo palabra completa
    if (t.length <= 3) return new RegExp(`(?:^|\\s)${t}(?:\\s|$)`).test(hay)
    return hay.includes(t)
  }
  let score = 0
  if (haystack.includes(q)) score += 12
  if (tituloN && (tituloN === q || tituloN.includes(q))) score += 14
  if (doc.fuente === 'kb-andes-vtr') score += 3
  if (doc.fuente === 'kb-andes-training') score += 2
  if (doc.fuente === 'kb-andes-nl') score += 5
  // KB soporte LOS coloquial
  if (
    (doc.intent === 'ont_los_rojo' || doc.intent === 'causas_los_rojo' || /los.?rojo/i.test(doc.titulo || '')) &&
    (esMencionLosTecnico(q) ||
      /luz roja/.test(q) ||
      /\b(router|modem|repetidor|extensor|cajita).{0,25}roja?\b/.test(q) ||
      esMencionLosTecnico(q))
  ) {
    score += 18
  }
  if (
    /\b(busc(a|o|ar)|encontrar|consultar|digitar|ubicar)\b.{0,28}\b(cliente|rut)\b/.test(q) &&
    !/promocion|oferta|plan|asistencia/.test(q)
  ) {
    if (doc.id === 'micro-digitar-rut' || doc.id === 'micro-clase-cliente' || doc.id === 'faq-buscar-cliente-rut')
      score += 36
    if (doc.id === 'cp-cuenta' && !/clase cliente|facturacion o cliente|cambio de plan/.test(q)) score -= 22
    if (/promocion/.test(tituloN)) score -= 22
  }
  if (/\b(no ve|sin senal|sin tv|no tiene senal|no tiene imagen|pantalla negra|no ve television)\b/.test(q)) {
    if (doc.id === 'micro-tv-sin-senal' || doc.id === 'sec-visita') score += 28
    if (/facturacion o cliente|promocion/.test(tituloN)) score -= 24
  }
  if (
    (/\bno (funciona|anda|responde|sirve)\b/.test(q) || /\b(se rompio|esta malo|danado|roto)\b/.test(q)) &&
    /\b(control|mando|remoto)\b/.test(q)
  ) {
    if (doc.id === 'cr-danado' || doc.intencion === 'CR_DANADO' || /no responde|se rompio/.test(tituloN)) {
      score += 26
    }
    if (doc.id === 'guia-control-remoto-completa' || /contratacion|cobro|precio/.test(tituloN)) score -= 14
  }
  if (/\b(cubre|cobertura|incluye|que es)\b/.test(q) && /\basistencia\b/.test(q)) {
    if (String(doc.id || '').includes('asistencia') || /asistencia vtr/.test(tituloN)) score += 22
  }
  // Netflix + D-Box Smart / error 001 → no confundir con precio Netflix ni contratar D-Box
  if (
    (/\bnetflix\b/.test(q) && /\b(d-?box|dbox|box\s*tv|decodificador|smart)\b/.test(q)) ||
    (/\berror\s*0*01\b/.test(q) && /\b(d-?box|dbox|netflix|smart|box\s*tv|decodificador|deco)\b/.test(q)) ||
    /\bproblemas?\s+con\s+(el\s+)?netflix\b/.test(q) ||
    /\b(ui-?800-?3|ui-?113|nw-?2-?5|nw-?3-?6|tvq-?(pb|st|rte)-?\d+)\b/.test(q)
  ) {
    if (doc.id === 'faq-netflix-dbox-error') score += 55
    if (/error\s*0*01/.test(q) && doc.id === 'faq-netflix-dbox-error') score += 40
    // Error de reproducción ≠ comprar/reiniciar el decodificador
    if (/error\s*0*01/.test(q) && /necesito|cuanto cuesta|precio|contratar|comprar|quiero un|nuevo/i.test(tituloN))
      score -= 25
    if (doc.id === 'sc-1111' || doc.id === 'sc-996' || /inconveniente.*netflix|dbox smart|box tv/i.test(tituloN))
      score += 28
    if (doc.id === 'ott-netflix-planes' || /precio.*netflix|cuanto.*netflix/i.test(tituloN)) score -= 35
    if (String(doc.id || '').startsWith('db-') && !/error|inconveniente|netflix/i.test(tituloN)) score -= 30
    if (doc.fuente === 'entrenamiento-streaming-ejemplos' && /cuanto|precio|plan/i.test(tituloN)) score -= 25
  }
  // FAQs Somos Clave enfocadas (streaming, visitas, boleta, wifi, etc.)
  for (const enf of faqScMatch(q)) {
    if (doc.id === enf.faqId) score += 52
    if (enf.scIds?.some((id) => doc.id === id)) score += 26
    if (doc.fuente === 'entrenamiento-streaming-ejemplos' && /cuanto|precio|plan/i.test(tituloN)) score -= 18
  }
  // “¿Quién puede contratar Asistencia VTR?” → elegibilidad, no precio ni Netflix
  if (
    /\basistencia\b/.test(q) &&
    /\b(quien|quién|quienes|quiénes)\b/.test(q) &&
    /\b(puede|pueden|contratar|contrata|agregar)\b/.test(q)
  ) {
    if (doc.id === 'faq-asistencia-quien') score += 80
    if (doc.id === 'guia-asistencia-vtr') score += 40
    if (doc.id === 'KB-0074' || doc.id === 'KB-0077' || /quien puede contratar/i.test(tituloN)) score += 45
    if (doc.id === 'faq-asistencia-precio' || /precio de asistencia/i.test(tituloN)) score -= 30
    if (/inhib/i.test(String(doc.id || '') + tituloN + String(doc.intent || ''))) score -= 60
    if (doc.intent === 'soporte_los_rojo' || /los.?rojo|luz los/i.test(tituloN)) score -= 50
    if (doc.fuente === 'kb-andes-nl') score -= 35
    if (doc.fuente === 'entrenamiento-streaming-ejemplos' || String(doc.id || '').startsWith('ott-ej-'))
      score -= 40
    if (String(doc.id || '').startsWith('cp-ej-')) score -= 30
  }
  if (
    /\basistencia\b/.test(q) &&
    /\b(titular|poder notarial|residencial|requisito|requisitos|puede contratar)\b/.test(q)
  ) {
    if (doc.id === 'faq-asistencia-quien' || doc.id === 'guia-asistencia-vtr') score += 24
    if (doc.fuente === 'entrenamiento-streaming-ejemplos' || String(doc.id || '').startsWith('ott-'))
      score -= 25
  }
  if (/\b(traslado|mudanza|cambio de domicilio)\b/.test(q) && !/\bpago\b/.test(q)) {
    if (String(doc.id || '').includes('traslado') || /traslado|mudanza/.test(tituloN)) score += 28
    if (/\b(los|ont|rojo)\b/.test(tituloN) && !/traslado/.test(tituloN)) score -= 26
  }
  if (doc.intent && norm(doc.intent).split('_').some((p) => p.length > 2 && tokenHit(q, p))) score += 4
  // Match exacto de frase NL (sin signos) → boost fuerte
  if (doc.fuente === 'kb-andes-nl' || Array.isArray(doc.sinonimos)) {
    let synHits = 0
    for (const s of doc.sinonimos || []) {
      const ns = norm(s)
      if (!ns) continue
      if (ns === q) {
        score += doc.fuente === 'kb-andes-nl' ? 28 : 14
        synHits++
        break
      }
      if (q.length >= 6 && ns === q) {
        score += 10
        synHits++
      } else if (
        doc.fuente === 'kb-andes-nl' &&
        q.length >= 8 &&
        ns.length >= 8 &&
        (ns.includes(q) || q.includes(ns)) &&
        Math.abs(ns.length - q.length) <= 6
      ) {
        score += 8
        synHits++
      }
      if (synHits >= 3) break
    }
  }

  let hitsTitulo = 0
  for (const t of tokens) {
    if (tokenHit(tituloN, t)) {
      hitsTitulo++
      score += t.length <= 3 ? 10 : 8
    }
    if (tokenHit(haystack, t)) score += 2
    // Sinónimos: limitar aporte para que no dominen sobre coincidencias de título
    const maxSyn = doc.fuente === 'kb-andes-nl' ? 6 : 14
    let synCount = 0
    for (const s of doc.sinonimos || []) {
      if (synCount >= maxSyn) break
      const ns = norm(s)
      if (ns === q || ns === t) {
        score += 6
        synCount++
      } else if (ns.length >= 5 && q.length >= 5 && (ns.includes(q) || q.includes(ns))) {
        if (doc.fuente === 'kb-andes-nl' && Math.abs(ns.length - q.length) > 10) continue
        score += doc.fuente === 'kb-andes-nl' ? 2 : 4
        synCount++
      } else if (tokenHit(ns, t) || (ns.split(' ')[0] && t.includes(ns.split(' ')[0]) && ns.split(' ')[0].length > 3)) {
        score += doc.fuente === 'kb-andes-nl' ? 0.5 : 1.5
        synCount++
      }
    }
  }
  // Título concentra la entidad → priorizar el procedimiento correcto
  if (hitsTitulo > 0 && tokens.length <= 4) score += 6 * hitsTitulo

  // Preferir micro-pasos cuando la pregunta es puntual
  if (doc.tipo === 'micro') {
    score += 3
    for (const s of doc.sinonimos || []) {
      const ns = norm(s)
      if (
        ns === q ||
        (ns.includes(' ') && q.length >= 5 && (q.includes(ns) || ns.includes(q)))
      )
        score += 6
    }
  }
  // Penalizar guías completas si la query es corta (evita volcar todo por "rut")
  if (doc.tipo === 'guia' && tokens.length <= 2) score -= 8
  if (
    (doc.categoria === 'ANDES' || doc.tipo === 'guia' || doc.tipo === 'hecho' || doc.tipo === 'micro') &&
    /andes|siebel|crm|pedido|cliente|rut/.test(q)
  ) {
    score += 1
  }
  if (doc.tipo === 'noticia' && /noticia|comunicado|aviso|actualiz/.test(q)) score += 3
  if (doc.tipo === 'noticia') {
    score += 3
    if (/^(noticias?|comunicados?|avisos?|actualizaciones?)$/.test(q)) score += 10
    if (Array.isArray(doc.imagenes) && doc.imagenes.length) score += 1
  }
  if (doc.id === 'sec-noticias' && /noticia|comunicado|aviso/.test(q)) score += 1
  if (doc.tipo === 'seccion' && /seccion|donde|portal|menu|donde esta/.test(q)) score += 2
  if (
    (doc.fuente === 'portal-contrataciones' ||
      /Contrataciones/i.test(doc.seccionPortal || '') ||
      /^guia-(control-remoto|cambio-plan|dbox|asistencia|wifi)/.test(doc.id || '')) &&
    /contratacion|control remoto|cambio de plan|d-?box|asistencia vtr|ubicacion wifi/.test(q)
  ) {
    score += 6
  }
  if (/^(contrataciones?|control remoto|cambio de plan|d-?box|asistencia vtr)$/.test(q)) {
    if (doc.id === 'sec-contrataciones') score += 8
    if (doc.tipo === 'guia' && /Contrataciones/i.test(doc.seccionPortal || '')) score += 4
  }
  if (doc.tipo === 'plan' || doc.fuente === 'portal-planes') {
    score += 3
    if (/^(planes?|fibra|catalogo|oferta|1p|2p|3p)$/.test(q)) score += 8
    if (/fibra|megas|tv premium|stream tv|telefonia/.test(q)) score += 2
    if (/precio|precios|costo|costos|cuanto cuesta|valor|tarifa/.test(q)) score += 6
    // Variante de TV pedida explícitamente ("plan full", "tv premium", "inicia")
    const variantesTv = q.match(/\b(full|inicia|premium|basico|esencial)\b/g) || []
    if (variantesTv.length && variantesTv.some((v) => tituloN.includes(v))) score += 26
  }
  if (doc.tipo === 'streaming' || doc.fuente === 'portal-streaming') {
    score += 3
    if (/^(streaming|ott|plataformas?)$/.test(q)) score += 10
    if (/netflix|disney|hbo|prime|universal|crunchyroll|crunchy|tnt|anime/.test(q)) score += 4
  }
  if (
    doc.fuente === 'entrenamiento-streaming-comercial' ||
    doc.fuente === 'entrenamiento-streaming-ejemplos' ||
    String(doc.id || '').startsWith('ott-')
  ) {
    score += 5
    if (/netflix|disney|crunchyroll|crunchy|anime|tnt|max\b|espn|streaming|ott|adulto|playboy|venus|sextreme|hotgo/.test(q)) score += 8
    if (/precio|cuanto|cuesta|sale|vale|plan|promo|meses gratis|4k|dispositivo|pantalla/.test(q)) score += 4
    // “necesito ayuda con el pago” ≠ precio de streaming
    if (
      /\b(pago|boleta|deuda|recaudador|pna)\b/.test(q) &&
      !/\b(netflix|disney|crunchy|hbo|prime|ott|streaming|control|remoto|adulto|playboy)\b/.test(q)
    ) {
      score -= 40
    }
    if (doc.id === 'ott-netflix-planes' && /\bnetflix\b/.test(q)) score += 12
    if (doc.id === 'ott-disney-planes' && /\bdisney\b/.test(q)) score += 12
    if (doc.id === 'ott-crunchyroll-planes' && /\b(crunchyroll|crunchy|anime)\b/.test(q)) score += 14
    if (doc.id === 'ott-tnt-max-planes' && /\b(tnt|futbol chileno|deportes en vivo)\b/.test(q)) score += 12
    if (
      (doc.id === 'ott-pack-adulto-planes' ||
        doc.id === 'ott-pack-adulto-venta' ||
        doc.id === 'ott-pack-adulto-activacion') &&
      /\b(adulto|playboy|venus|sextreme|hotgo|prodpradul)\b/.test(q)
    )
      score += 16
    if (doc.id === 'ott-pack-adulto-venta' && /\b(vender|pitch|speech|objecion|cartilla|argumento)\b/.test(q))
      score += 10
    if (doc.id === 'ott-pack-adulto-activacion' && /\b(activar|activacion|tipificar|contratar)\b/.test(q)) score += 8
    if (
      doc.id === 'ott-soporte-acceso' &&
      (esConsultaSoporteStreaming(q) ||
        /contactese|credencial|no puedo (ingresar|entrar|ver)|transferir a ott|mensaje.*vtr|contrate.*max|contrate.*tnt/.test(
          q
        ))
    )
      score += 28
    if (esConsultaSoporteStreaming(q) && doc.id === 'ott-soporte-acceso') score += 20
    if (esConsultaSoporteStreaming(q) && doc.fuente === 'entrenamiento-streaming-ejemplos') score += 10
    if (
      doc.id === 'ott-comparativa-asesor' &&
      /(mas barat|cuatro pantalla|somos (4|cuatro)|comparar|deportes y peliculas)/.test(q)
    )
      score += 12
    // Preferir doc canónico vs ejemplo genérico de plataforma del portal
    if (doc.fuente === 'entrenamiento-streaming-comercial' && /precio|plan|cuanto|4k|fan|mega/.test(q)) score += 4
    if (doc.fuente === 'portal-streaming' && /precio|cuanto sale|plan fan|mega fan|4k|miembro extra/.test(q))
      score -= 6
    // CONTACTESE / TNT-Max: no mezclar con precios genéricos
    if (esConsultaSoporteStreaming(q) && doc.id !== 'ott-soporte-acceso' && /precio|cuanto sale|planes/.test(String(doc.titulo || '').toLowerCase()))
      score -= 8
  }
  // ONT/LOS: no competir con soporte streaming
  if (
    (doc.fuente === 'entrenamiento-ont-ftth' ||
      doc.fuente === 'entrenamiento-ont-ftth-ejemplos' ||
      String(doc.id || '').startsWith('ont-') ||
      doc.intencion === 'ONT_LOS_ROJO') &&
    esConsultaSoporteStreaming(q)
  ) {
    score -= 50
  }
  // Procedimientos de pago / boleta
  if (String(doc.id || '').startsWith('pago-') || /inconveniente.*pago|pago no aplicado/i.test(doc.titulo || '')) {
    if (/\b(pago|boleta|deuda|recaudador|pna|no aplicado|no asignado)\b/.test(q)) score += 18
    if (/^(necesito|requiero|ayuda).*\bpago\b|\bproblemas?\s+con\s+(el\s+)?pago\b/.test(q)) score += 10
    if (
      (doc.id === 'pago-overview' || doc.id === 'pago-verificaciones-previas') &&
      /\bpago\b/.test(q) &&
      !/\b(no aplicado|no asignado|traslado de pago|reversa)\b/.test(q)
    ) {
      score += 14
    }
  }
  if (
    doc.fuente === 'entrenamiento-control-remoto' ||
    doc.fuente === 'entrenamiento-control-remoto-ejemplos' ||
    String(doc.id || '').startsWith('cr-')
  ) {
    // "problemas con LOS" / luz en router NO es control remoto
    if (
      (esMencionLosTecnico(q) || /\b(luz roja|cajita|ont|fibra|router|modem|repetidor|extensor)\b/.test(q)) &&
      !/\b(control|remoto|mando|contro|deco|decodificador)\b/.test(q)
    ) {
      score -= 40
    } else if (/\b(pago|boleta|deuda|recaudador|pna)\b/.test(q) && !/\b(control|remoto|mando|contro)\b/.test(q)) {
      score -= 35
    } else if (/\b(traslado|titular)\b/.test(q) && !/\b(control|remoto|mando)\b/.test(q)) {
      score -= 30
    } else {
      score += 5
      if (/\b(control|remoto|mando|contro|deco|decodificador)\b/.test(q)) score += 10
      if (/6000|3000|6 lucas|delivery|despacho|perdi|perdio|extravi|autoinstalacion|visita tecnica/.test(q))
        score += 6
      if (doc.id === 'cr-precio' && /precio|cuanto|cuesta|sale|vale|6000|6 lucas|seis mil/.test(q) && !/delivery|despacho|3000/.test(q))
        score += 14
      if (doc.id === 'cr-delivery' && /delivery|despacho|envio|3000|manden|manden/.test(q)) score += 14
      if (doc.id === 'cr-total' && /(6000|6 mil).*(3000|despacho|delivery)|(total|mas despacho|puesto en mi casa)/.test(q))
        score += 16
      if (doc.id === 'cr-perdido' && /perdi|perdio|extravi|no encuentro|se me perdio|mando/.test(q)) score += 12
      if (doc.id === 'cr-danado' && /no funciona|rompi|no responde|malo|murio|defectuos/.test(q)) score += 12
      if (doc.id === 'cr-siebel' && /andes|siebel|catalogo|agregar|paso a paso|como (contrato|solicito|agrego)/.test(q))
        score += 14
      if (doc.id === 'cr-entrega' && /autoinstalacion|visita tecnica|tecnico|entregan|retiro/.test(q)) score += 12
      if (doc.id === 'cr-cobro' && /boleta|mensual|unica vez|como se cobra|cobro/.test(q)) score += 10
    }
  }
  if (
    doc.fuente === 'entrenamiento-cambio-plan' ||
    doc.fuente === 'entrenamiento-cambio-plan-ejemplos' ||
    String(doc.id || '').startsWith('cp-')
  ) {
    score += 5
    if (/cambio de plan|cambiar(me)? (de )?plan|actualizar promocion|megas|apex|tsq/.test(q)) score += 10
    if (doc.id === 'cp-apex' && /\bapex\b|denominacion|copiar nombre|nombre exacto/.test(q)) score += 14
    if (doc.id === 'cp-andes' && /actualizar promocion|andes|pegar.*apex|productos instalados/.test(q))
      score += 14
    if (doc.id === 'cp-anular' && /anular|cancelar|fallido|incidencia|liberar|trámite abierto|tramite abierto/.test(q))
      score += 16
    if (doc.id === 'cp-finalizacion' && /verificar|tsq|generar documento|metodo de envio|email|e-mail/.test(q))
      score += 12
    if (doc.id === 'cp-velocidad' && /megas|velocidad|fibra 600|600 megas|subir|bajar/.test(q)) score += 12
    if (doc.id === 'cp-cliente' && /quiero cambiar|me quiero cambiar|otro plan|mas megas|pagar menos/.test(q))
      score += 10
    if (doc.id === 'cp-cuenta' && /clase cliente|facturacion o cliente|buscar.*rut/.test(q)) score += 12
    if (doc.id === 'cp-servicios' && /mantener.*(tv|television)|perder.*(tv|servicios)|solo el internet/.test(q))
      score += 12
  }
  if (
    doc.fuente === 'entrenamiento-dbox' ||
    doc.fuente === 'entrenamiento-dbox-ejemplos' ||
    String(doc.id || '').startsWith('db-')
  ) {
    score += 5
    if (/\b(dbox|d-box|d box|decodificador|smart ii|deco)\b/.test(q)) score += 12
    if (doc.id === 'db-precio' && /precio|cuanto|2990|cuesta|sale/.test(q)) score += 14
    if (doc.id === 'db-equipos' && /personalizar|television|equipos|decodificadores/.test(q)) score += 14
    if (doc.id === 'db-flujo' && /paso a paso|como agrego|contratar|flujo/.test(q)) score += 12
    if (doc.id === 'db-entrega' && /metodo de envio|visita tecnica|autoinstalacion|enviar/.test(q)) score += 10
  }
  if (
    doc.fuente === 'entrenamiento-ont-ftth' ||
    doc.fuente === 'entrenamiento-ont-ftth-ejemplos' ||
    String(doc.id || '').startsWith('ont-')
  ) {
    score += 4
    if (
      esMencionLosTecnico(q) ||
      /\b(pon|ont|cajita|fibra|luz roja|sin internet|wifi|xq|porq|porke)\b/.test(q)
    )
      score += 8
    if (/parpade|rojo|apagad|reinici|dobl|señal optica|senal optica|interner|intenet|interned/.test(q))
      score += 5
    // Coloquial: "problemas con LOS", luz roja en router/módem/repetidor/extensor
    if (
      esMencionLosTecnico(q) ||
      /\b(luz|led|foco|indicador).{0,12}roja?\b.{0,25}\b(router|modem|repetidor|extensor|ont|cajita|caja)\b/.test(
        q
      ) ||
      /\b(router|modem|repetidor|extensor|cajita|caja).{0,25}\b(luz|led|foco).{0,12}roja?\b/.test(q) ||
      /\b(router|modem|repetidor|extensor).{0,20}\broja?\b/.test(q)
    ) {
      score += 22
      if (doc.intencion === 'ONT_LOS_ROJO' || doc.id === 'ont-los-rojo' || /los/.test(String(doc.intent || '')))
        score += 14
    }
    if (/\b(que hago|como se|como soluciono|necesito (un )?tecnico|visita tecnica)\b/.test(q)) {
      // “¿Qué hago si… CONTACTESE CON VTR?” no es ONT
      if (
        !esConsultaSoporteStreaming(q) &&
        (esMencionLosTecnico(q) ||
          /\b(ont|fibra|cajita|luz roja|sin internet|wifi|modem|router)\b/.test(q))
      )
        score += 4
    }
    if (/corte de luz|despues de (mover|reiniciar|una tormenta)|desde que movi|se fue la luz/.test(q)) {
      score += 4
      if (doc.id === 'ont-post-evento') score += 10
    }
    if (/visita|tecnico|cambiar(me)? (la )?ont|fibra danad|escal/.test(q) && doc.id === 'ont-visita-tecnica')
      score += 12
    if (
      /wifi.*(sin internet|no navega|no internet)|conectado.*(no navega|sin internet)|tengo wifi pero/.test(q) &&
      doc.id === 'ont-wifi-sin-internet'
    )
      score += 28
    if (
      /wifi.*(sin internet|no navega|no internet)|conectado.*(no navega|sin internet)|tengo wifi pero/.test(q) &&
      doc.id === 'ont-wifi' &&
      !/lento|desconect|no aparece|ssid/.test(q)
    )
      score -= 10
    if (/como se si|como puedo (saber|revisar|identificar)|diagnost/.test(q) && doc.id === 'ont-diagnostico')
      score += 10
    if (
      /reinici.*(tres|3|varias|sigue igual|sigue rojo)|ya reinici/.test(q) &&
      (doc.id === 'ont-visita-tecnica' || doc.id === 'ont-reinicio' || doc.intencion === 'ONT_ESCALAMIENTO')
    )
      score += 6
    if (doc.id === 'ont-leds-glosario' && /significan? las luces|glosario|indicadores|cada luz|leds?/.test(q))
      score += 16
    if (doc.fuente === 'entrenamiento-ont-ftth-ejemplos' && /significan? las luces|glosario|indicadores/.test(q))
      score -= 10
    // Preferir doc de intención vs ejemplo genérico cuando hay match fuerte de intencion
    if (
      doc.intencion === 'ONT_LOS_ROJO' &&
      (esMencionLosTecnico(q) || /\b(luz roja|cajita roja|foco.*rojo)\b/.test(q))
    )
      score += 3
    if (
      doc.intencion === 'SIN_INTERNET_TRIAJE' &&
      /sin internet|no tengo internet|se (me )?fue el internet|xq no tengo|porque no tengo/.test(q) &&
      !esMencionLosTecnico(q) &&
      !/luz roja|cajita roja/.test(q)
    )
      score += 3
    // Triaje general: no empujar a Wi‑Fi/LOS si el cliente solo dice “no tengo internet”
    if (
      /^(porque |por que )?(no tengo internet|se me fue el internet|estoy sin internet|se cayo mi internet|no puedo navegar)$/.test(
        q
      ) ||
      /^(xq|porq|porke) no tengo internet$/.test(q)
    ) {
      if (doc.id === 'ont-sin-internet-general' || doc.intencion === 'SIN_INTERNET_TRIAJE') score += 22
      if (/^WIFI_|ONT_LOS_ROJO|ONT_PON$/.test(String(doc.intencion || ''))) score -= 18
      if (doc.fuente === 'entrenamiento-ont-ftth-ejemplos' && doc.intencion !== 'SIN_INTERNET_TRIAJE') score -= 12
    }
    if (/\bwifi\b/.test(q) === false && /^WIFI_/.test(String(doc.intencion || ''))) {
      if (/no tengo internet|sin internet|se me fue|no navego|no carga/.test(q) && !/cable|ethernet/.test(q))
        score -= 8
    }
  }
  if (doc.tipo === 'somosclave') {
    score += 2
    if (doc.scId && (q.includes(doc.scId) || tokens.includes(doc.scId))) score += 10
    if (/somos\s*clave|procedimiento|clave\b|id\s*\d+/.test(q)) score += 2
    // Preferir pub. de activación/inconveniente de la marca vs evento puntual
    if (esPreguntaDefinicion(q) || tokens.length <= 2) {
      if (/activacion y solucion|solucion inconvenientes|aplicaciones de streaming/i.test(tituloN))
        score += 12
      else if (/activacion|inconveniente|solucion|\bott\b/i.test(tituloN)) score += 5
      if (/indisponibilidad|copa|programacion|liga|beneficio exclusivo|transmision exclusiva/i.test(tituloN))
        score -= 14
    }
    // CONTACTESE / TNT Max: no arrastrar artículos de fibra/LOS de Somos Clave
    if (esConsultaSoporteStreaming(q)) {
      if (/los|ont|fibra|sin internet|luz roja|visita tecnica|hfc|ftth/i.test(tituloN) && !/ott|streaming|tnt|max|netflix|disney|hbo|contacte/i.test(tituloN))
        score -= 40
      if (/ott|streaming|tnt|max|contacte|activacion.*streaming|inconveniente.*streaming/i.test(tituloN))
        score += 18
    }
  }
  // Los bonos por tipo/fuente no deben convertir cualquier frase cotidiana
  // en una consulta técnica. Exigimos al menos una coincidencia real.
  const tieneCoincidencia =
    (q.length >= 3 && haystack.includes(q)) ||
    tokens.some((t) => tokenHit(haystack, t))
  if (!tieneCoincidencia) return 0
  return score
}

/**
 * Quita publicaciones repetidas (mismo título con distinto id, típico en el
 * índice de sucursales/FAQ) para que el chat no reciba evidencia duplicada ni
 * dispare menús de "empate" falsos. Conserva el de mayor score (ya ordenado).
 */
function dedupeDocs(docs) {
  const vistos = new Set()
  const out = []
  for (const d of docs) {
    const key = norm(d.titulo || d.nombre || d.id || '')
    if (key && vistos.has(key)) continue
    if (key) vistos.add(key)
    out.push(d)
  }
  return out
}

/**
 * Busca en el corpus del portal.
 * Si la pregunta es puntual, prioriza docs tipo micro.
 */
export function buscarConocimiento(pregunta, limite = 6, corpus) {
  let q = norm(pregunta)
  if (!q) return []
  // Typos / abreviaturas frecuentes en soporte (ONT / internet)
  q = q
    .replace(/\b(xq|porq|porke|porqe)\b/g, 'porque')
    .replace(/\b(interner|intenet|interned|internt)\b/g, 'internet')
    .replace(/\b(k|q)\b(?=\s+(significa|hago|paso))/g, 'que')
    .replace(/\bwifi\b/g, 'wifi')
    .replace(/\bmoden\b/g, 'modem')
    .replace(/\bcontro\b/g, 'control')
    .replace(/\bkuanto\b/g, 'cuanto')
    .replace(/\bmande\b(?!\s)/g, 'mando')
    .replace(/\bnetfli+x?\b/g, 'netflix')
    .replace(/\bnetflx\b/g, 'netflix')
    .replace(/\bdisne+\b/g, 'disney')
    .replace(/\bfibr+\b/g, 'fibra')
    .replace(/\binter+n+e+t?\b/g, 'internet')
    .replace(/\bhbomax\b/g, 'hbo max')
    .replace(/\bhb\b(?=\s|$)/g, 'hbo')
    // Solo "contr" completo (no "con"): evitar "problemas con LOS" → control
    .replace(/\bcontr\b/g, 'control')
    .replace(/\bctrl\b/g, 'control')
    .replace(/\basisten\b/g, 'asistencia')
    .replace(/\bcuant\b/g, 'cuanto')
    .replace(/\bstrm\b/g, 'streaming')
    .replace(/\bpagos\b/g, 'pago')
    // Aperturas de ayuda: no deben opacar el tema (LOS, pago, control…)
    .replace(
      /\b(necesito|requiero|preciso)\s+(ayuda|soporte|asistencia)\b[,.]?\s*/g,
      ''
    )
    .replace(/\b(necesito|requiero|preciso)\s+(?:que\s+)?(?:me\s+)?(?:ayuden?|ayudar)\b[,.]?\s*/g, '')
    .replace(/\bme\s+(puedes|pueden|podrias|podrian)\s+ayudar\s+(con|por|para)\s+/g, '')
    .replace(/\bayuda\s+(con|por|para)\s+/g, '')
    .replace(/\bel\s+cliente\s+(necesita|requiere|tiene problemas? con)\s+/g, '')
    // Coloquial soporte: luz en equipos / problemas con LOS
    .replace(
      /\b(necesito ayuda[,.]?\s*)?(tengo\s+)?problemas?\s+con\s+(el\s+)?los(?=\s*(?:$|[,.]|rojo|parpadeando))/g,
      'problemas con los ont luz roja'
    )
    .replace(
      /\b(luz|led|foco|indicador)\s+roja?\s+(en\s+)?(el\s+)?(router|modem|repetidor|extensor|ont|cajita|caja)\b/g,
      'luz roja los ont'
    )
    .replace(
      /\b(router|modem|repetidor|extensor|cajita)\s+(con\s+)?(una\s+)?(luz|led|foco)\s+roja?\b/g,
      'luz roja los ont'
    )
    .replace(/\b(router|modem|repetidor|extensor)\s+(esta|tiene|prende|sale)\s+(con\s+)?roja?\b/g, 'luz roja los ont')
    .replace(/\bme\s+sale\s+una\s+luz\s+roja\b/g, 'luz roja los ont')
  if (!q) return []
  // Evitar que "te", "de", "me"… matcheen basura del índice (ej. "te amo" → sucursales)
  const STOP = new Set([
    'te',
    'me',
    'mi',
    'tu',
    'su',
    'le',
    'lo',
    'la',
    'el',
    'los',
    'las',
    'un',
    'una',
    'de',
    'del',
    'al',
    'en',
    'con',
    'por',
    'para',
    'que',
    'se',
    'es',
    'ya',
    'si',
    'no',
    'ok',
    'yo',
    'ha',
    'he',
    'va',
    'da',
    'do',
    'as',
    'hay',
    'muy',
    'mas',
    'como',
    'esta',
    'estan',
    'esto',
    'ese',
    'esa',
    'hace',
    'tiene',
    'sirve',
    'significa',
    'ofrece',
    'consiste',
    'trata',
    'funcion',
    'funciona',
    'cual',
    'donde',
    'cuando',
    'todos',
    'todas',
  ])
  // Entidades técnicas (LOS, ONT…) no se descartan aunque estén en STOP
  const mencionaLos = esMencionLosTecnico(q)
  const raw = q
    .split(' ')
    .filter(
      (t) =>
        t &&
        (!STOP.has(t) ||
          (ENTIDADES_CORTAS.has(t) && (t !== 'los' || mencionaLos)) ||
          (Boolean(ALIAS_ENTIDAD[t]) && (t !== 'los' || mencionaLos)))
    )
  const seed = raw.filter(
    (t) => t.length > 2 || ENTIDADES_CORTAS.has(t) || Boolean(ALIAS_ENTIDAD[t])
  )
  // Consulta solo entidad ("hbo") → no perder el token
  if (!seed.length && (ENTIDADES_CORTAS.has(q) || ALIAS_ENTIDAD[q])) seed.push(q)
  let tokens = expandTokens(seed.length ? seed : raw.filter((t) => t.length > 2), q)
  // Palabras a medias: netfli→netflix, fibr→fibra, disne→disney
  const exp = expandirPalabrasIncompletas(q, tokens)
  q = exp.q || q
  tokens = expandTokens(exp.tokens.length ? exp.tokens : tokens, q)
  const base = Array.isArray(corpus) && corpus.length ? corpus : INDICE_PORTAL_LOCAL

  let ranked = base
    .map((d) => ({ ...d, score: scoreDoc(d, q, tokens) }))
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)

  // Si gana un hub NL, responder con los docs reales vinculados (precios/planes), no el hub meta
  const pideStream = /netflix|disney|hbo|max|prime|stream|tv\b|telefonia|telefon/.test(q)
  const velQ = (q.match(/\b(600|800|940)\b/) || [])[0]
  const hubsNl = ranked.filter((d) => d.fuente === 'kb-andes-nl' && Array.isArray(d.matchDocs) && d.matchDocs.length && d.score >= 6)
  let hubNl = hubsNl[0]
  if (hubsNl.length > 1) {
    if (pideStream) {
      hubNl =
        hubsNl.find((h) => /netflix|disney|hbo|prime|streaming/.test(String(h.intent || ''))) || hubNl
    } else if (velQ) {
      hubNl = hubsNl.find((h) => String(h.intent || '').includes(`fibra_${velQ}`)) || hubNl
    } else if (/plan|planes|fibra|internet|velocidad/.test(q)) {
      hubNl = hubsNl.find((h) => h.intent === 'consultar_planes_general') || hubNl
    }
  }
  if (hubNl && hubNl.score >= 6) {
    const topReal = ranked.find((d) => d.fuente !== 'kb-andes-nl')
    // No secuestrar ranking si un FAQ/KB real ya gana claro (ej. “contratar” ≠ hub LOS por substring “ont”)
    const hubCompetitive =
      !topReal || hubNl === ranked[0] || hubNl.score >= Math.max(6, (topReal.score || 0) * 0.85)
    if (hubCompetitive) {
    const linked = []
    const seen = new Set()
    for (const id of hubNl.matchDocs) {
      const d = base.find((x) => x.id === id)
      if (!d || seen.has(id)) continue
      seen.add(id)
      linked.push({ ...d, score: hubNl.score + 5 })
    }
    // Complementar con otros planes del ranking (si pide streaming/TV; si no, solo planes base)
    for (const d of ranked) {
      if (seen.has(d.id) || d.fuente === 'kb-andes-nl') continue
      if (!(d.tipo === 'plan' || d.tipo === 'streaming' || d.fuente === 'kb-andes-vtr')) continue
      const tit = norm(d.titulo || '')
      const esCombo = /\+|netflix|disney|hbo|tv |telefonia|telefon/.test(tit)
      if (!pideStream && esCombo) continue
      linked.push(d)
      seen.add(d.id)
      if (linked.length >= limite) break
    }
    if (linked.length) {
      // Si la query menciona velocidad + streaming, priorizar el combo concreto
      const vel = velQ
      if (vel) {
        linked.sort((a, b) => {
          const at = norm(a.titulo || '')
          const bt = norm(b.titulo || '')
          const aHit = at.includes(vel) ? 1 : 0
          const bHit = bt.includes(vel) ? 1 : 0
          if (bHit !== aHit) return bHit - aHit
          if (pideStream) {
            const streamRe = /netflix|disney|hbo|max|prime/
            const aS = streamRe.test(at) ? 1 : 0
            const bS = streamRe.test(bt) ? 1 : 0
            if (bS !== aS) return bS - aS
          } else {
            const aCombo = /\+|netflix|disney|hbo|tv |telefonia|telefon/.test(at) ? 1 : 0
            const bCombo = /\+|netflix|disney|hbo|tv |telefonia|telefon/.test(bt) ? 1 : 0
            if (aCombo !== bCombo) return aCombo - bCombo
          }
          // Preferir matchDocs exactos
          const aExact = hubNl.matchDocs.includes(a.id) ? 1 : 0
          const bExact = hubNl.matchDocs.includes(b.id) ? 1 : 0
          if (bExact !== aExact) return bExact - aExact
          return b.score - a.score
        })
      } else {
        linked.sort((a, b) => {
          const aExact = hubNl.matchDocs.includes(a.id) ? 1 : 0
          const bExact = hubNl.matchDocs.includes(b.id) ? 1 : 0
          if (bExact !== aExact) return bExact - aExact
          return b.score - a.score
        })
      }
      ranked = linked
    }
    }
  }

  const promover = (id) => {
    const i = ranked.findIndex((d) => d.id === id)
    if (i > 0) {
      const [d] = ranked.splice(i, 1)
      ranked.unshift({ ...d, score: Math.max(d.score, (ranked[0]?.score || 0) + 1) })
      return
    }
    if (i === 0) return
    const fromBase = base.find((d) => d.id === id)
    if (fromBase) {
      ranked.unshift({ ...fromBase, score: Math.max(fromBase.score || 0, (ranked[0]?.score || 0) + 1) })
    }
  }
  if (
    /\b(busc(a|o|ar)|encontrar|consultar|ubicar|ubico)\b.{0,28}\b(cliente|rut)\b/.test(q) ||
    /\b(cliente|rut)\b.{0,28}\b(busc(a|o|ar)|encontrar|consultar)\b/.test(q) ||
    /\b(digitar|ingresar|escribir)\b.{0,16}\brut\b/.test(q)
  ) {
    if (!/promocion|oferta|plan|asistencia|streaming|netflix/.test(q)) {
      promover('micro-digitar-rut')
      promover('faq-buscar-cliente-rut')
    }
  }
  if (/\b(no ve|sin senal|sin tv|pantalla negra)\b/.test(q)) {
    promover('micro-tv-sin-senal')
  }
  if (/\b(cubre|cobertura)\b/.test(q) && /\basistencia\b/.test(q)) {
    promover('guia-asistencia-vtr')
  }
  if (
    /\basistencia\b/.test(q) &&
    (/\b(quien|quién|quienes)\b.{0,24}\b(contratar|contrata|agregar)\b/.test(q) ||
      /\b(titular|poder notarial|requisitos?)\b.{0,20}\basistencia\b/.test(q) ||
      /\basistencia\b.{0,20}\b(titular|residencial|requisitos?)\b/.test(q))
  ) {
    promover('guia-asistencia-vtr')
    promover('faq-asistencia-quien')
  }
  if (/\bno (funciona|anda|responde)\b/.test(q) && /\b(control|mando|remoto)\b/.test(q)) {
    promover('cr-danado')
  }
  if (
    /contacte(?:se)? con vtr|comunicate con vtr|contrate.{0,40}(tnt|max).{0,40}(contacte|mensaje)|mensaje.{0,20}contacte/.test(
      q
    )
  ) {
    promover('ott-soporte-acceso')
    promover('faq-streaming-acceso')
  }
  if (
    /\bnetflix\b/.test(q) &&
    (/\b(d-?box|dbox|box\s*tv|decodificador|smart)\b/.test(q) ||
      /\berror\s*0*01\b/.test(q) ||
      /\b(problema|falla|inconveniente|no (reproduce|funciona|abre|carga))\b/.test(q))
  ) {
    promover('faq-netflix-dbox-error')
  }
  if (/\berror\s*0*01\b/.test(q) && /\b(d-?box|dbox|netflix|smart|box|decodificador|deco)\b/.test(q)) {
    promover('faq-netflix-dbox-error')
  }
  if (/\bnetflix\b/.test(q) && /\b(activar|activacion|activo)\b/.test(q) && !/\b(d-?box|dbox|error|001)\b/.test(q)) {
    promover('faq-activar-netflix')
  }
  if (
    /\b(activar|activacion)\b/.test(q) &&
    /\b(netflix|hbo|disney|crunchy|streaming|ott)\b/.test(q)
  ) {
    promover('faq-activar-streaming-ott')
  }
  if (/\btnt\b/.test(q) && /\b(activar|hbo|max|activatnt)\b/.test(q)) {
    promover('faq-activar-tnt-sports-hbo-max')
  }
  if (/\bauth\.hbomax\.com\/providers\b/.test(q) || /\bconecta al proveedor\b/.test(q)) {
    promover('faq-activar-tnt-sports-hbo-max')
  }
  if (
    (/\b(subtel|apuestas)\b/.test(q) && /\b(hbo|max|auth\.hbomax|tnt|providers|bloqueo)\b/.test(q)) ||
    (/\bauth\.hbomax\b/.test(q) && /\b(seguro|legitimo|legítimo|bloqueo|phishing)\b/.test(q))
  ) {
    promover('faq-auth-hbomax-providers-subtel')
  }
  if (
    (/\b403\b/.test(q) && /\b(oauth|authorize|accounts\.vtr|tbx|forbidden|tnt|hbo)\b/.test(q)) ||
    /\baccounts\.vtr\.com\/oauth2\b/.test(q)
  ) {
    promover('faq-403-oauth-vtr-tnt-hbo')
  }
  for (const enf of faqScMatch(q)) {
    promover(enf.faqId)
  }
  // D-Box / decodificador: problemas de funcionamiento ≠ contratar/precio
  if (/\b(d-?box|dbox|deco|decodificador|box\s*tv|smart)\b/.test(q)) {
    if (/mensaje.{0,15}bloque|bloquead|pantalla.{0,15}bloque/.test(q)) {
      promover('sc-1459')
      promover('faq-dbox-bloqueo')
    } else if (
      /pegad|trabad|reinici|no responde|no enciende|no prende|se cae|sin imagen|pantalla|no funciona|falla|inconveniente|problema|se corta|se reinicia/.test(
        q
      )
    ) {
      promover('sc-996')
    }
  }
  // Cobro duplicado / doble pago
  if (
    /\bdos veces\b|\bduplicad|\bdoble cobro\b|\bcobraron.{0,18}\b(dos|varias|2)\b|\bcargo.{0,15}\bduplicad|pague dos veces/.test(
      q
    )
  ) {
    promover('sc-1283')
  }

  // Evitar evidencia repetida (misma publicación con distinto id) antes de
  // responder: sin esto, duplicados del índice provocan el menú de "empate".
  ranked = dedupeDocs(ranked)

  // Si hay un micro fuerte, no mezclar con guías enormes
  const top = ranked[0]
  if (top?.tipo === 'micro' && top.score >= 10) {
    ranked = ranked.filter((d) => d.tipo === 'micro' || d.tipo === 'hecho').slice(0, Math.min(limite, 2))
  } else {
    ranked = ranked.slice(0, limite)
  }
  return ranked
}

/** Quita basura de formato y deja el texto legible en chat */
export function limpiarTextoPortal(texto) {
  return String(texto || '')
    .replace(/add_circle_outline|record_voice_over|folder_special|receipt|expand_more|expand_less/gi, '')
    .replace(/\b(dvr|true|false)\b/gi, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\t+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
}

export function formatearContexto(docs) {
  if (!docs.length) return 'Sin coincidencias fuertes.'
  return docs
    .map((d, i) => {
      const cuerpo = Array.isArray(d.contenido)
        ? d.contenido.map((c) => `- ${c}`).join('\n')
        : `- ${d.contenido || ''}`
      return `${i + 1}. ${d.titulo || d.nombre}\n${cuerpo}\nSección: ${d.seccionPortal || ''}${
        d.enlace ? `\nEnlace: ${d.enlace}` : ''
      }`
    })
    .join('\n\n')
}

/** Normaliza viñetas/pasos para que el chat los pinte bien */
export function ordenarParaChat(texto) {
  const limpio = limpiarTextoPortal(texto)
    // Las alternativas ya van como botones; sacar listas duplicadas del modelo
    .replace(
      /\n*(?:\*\*)?Otras opciones relacionadas(?::|\*\*)?[\s\S]*?(?=\n\n[A-ZÁÉÍÓÚ]|$)/i,
      ''
    )
    .replace(/\n*_Puedes tocar una opción o escribirla\._\s*/gi, '')
  return limpio
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      if (/^[-–—▪▸►]\s+/.test(l)) return `• ${l.replace(/^[-–—▪▸►]\s+/, '')}`
      if (/^\d+[\.)]\s+/.test(l)) return l.replace(/^(\d+)[\.)]\s+/, '$1. ')
      if (/^[•·]\s*/.test(l)) return `• ${l.replace(/^[•·]\s*/, '')}`
      return l
    })
    .join('\n')
}

function resumenDefinicion(contenido) {
  const arr = Array.isArray(contenido) ? contenido.map((c) => String(c || '').trim()).filter(Boolean) : []
  if (!arr.length) return []
  const out = []
  let enObjetivo = false
  for (const t of arr) {
    if (/^OBJETIVO\b/i.test(t)) {
      enObjetivo = true
      const resto = t.replace(/^OBJETIVO\s*[:.]?\s*/i, '').trim()
      if (resto) out.push(resto)
      continue
    }
    if (/^(ALCANCE|CONSIDERACIONES|VERIFICACIONES|MATRIZ|C[OÓ]MO\b|EJECUTIVO|PLATAFORMA|IMPORTANTES|GESTI[OÓ]N|INFORMA|ESCALA|REGISTRA)\b/i.test(t)) {
      if (out.length) break
      enObjetivo = false
      continue
    }
    if (enObjetivo || out.length < 4) {
      out.push(t)
      if (enObjetivo && out.length >= 2) break
      if (!enObjetivo && out.length >= 5) break
    }
  }
  return out.length ? out : arr.slice(0, 6)
}

/** Extrae una marca/tema corto para armar opciones (“activar hbo”, etc.) */
function marcaDesdePreguntaODoc(pregunta, doc) {
  const q = norm(pregunta)
  for (const k of Object.keys(ALIAS_ENTIDAD)) {
    if (q === k || q.includes(k)) return k
  }
  const parts = q.split(' ').filter((t) => t.length >= 3 && !['que', 'como', 'para', 'sirve', 'hace', 'funcion'].includes(t))
  if (parts.length === 1) return parts[0]
  const titulo = norm(doc?.titulo || doc?.nombre || '')
  for (const k of Object.keys(ALIAS_ENTIDAD)) {
    if (titulo.includes(k)) return k
  }
  const tokTitulo = titulo.split(' ').filter((t) => t.length >= 3)
  return tokTitulo.find((t) => ENTIDADES_CORTAS.has(t) || t.length >= 4) || parts[0] || ''
}

/**
 * Opciones clicables relacionadas (mismo formato que casuísticas: { label, pregunta }).
 * Usa otros docs del ranking + atajos de acción cuando la consulta es corta.
 */
export function alternativasDesdeDocs(docs, pregunta, limite = 4) {
  if (!Array.isArray(docs) || docs.length < 2) {
    // Aún con 1 doc, ofrecer atajos útiles en consultas cortas
    if (!docs?.[0]) return []
  }
  const q = norm(pregunta)
  const top = docs[0]
  const topScore = top?.score || 0
  const out = []
  const seenPreg = new Set()
  const seenLabel = new Set()
  const pushOp = (label, preguntaOp) => {
    const lab = String(label || '').trim()
    const preg = String(preguntaOp || '').trim()
    if (!lab || !preg) return
    const key = norm(preg)
    if (seenPreg.has(key) || key === q) return
    const labKey = norm(lab)
      .replace(/\bott\b/g, '')
      .replace(/\ba la carta\b/g, '')
      .replace(/\bmovil\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    for (const prev of seenLabel) {
      if (prev === labKey) return
      if (prev.includes(labKey) || labKey.includes(prev)) {
        // Evitar "Aplicaciones de Streaming" + "Aplicaciones de Streaming (OTT)…"
        if (Math.min(prev.length, labKey.length) >= 12) return
      }
    }
    seenPreg.add(key)
    seenLabel.add(labKey)
    out.push({
      label: lab.length > 78 ? `${lab.slice(0, 76)}…` : lab,
      pregunta: preg,
    })
  }

  for (const d of docs.slice(1)) {
    if (out.length >= limite) break
    if ((d.score || 0) < Math.max(3.5, topScore * 0.28)) continue
    const titulo = String(d.titulo || d.nombre || '').trim()
    if (!titulo) continue
    const preg = d.scId ? `${titulo}` : titulo
    pushOp(titulo, preg)
  }

  // Noticias: priorizar otras noticias como opciones (sin atajos de activación)
  if (top?.tipo === 'noticia' || /noticia|comunicado|aviso|actualiz/.test(q)) {
    for (const d of docs.slice(1)) {
      if (out.length >= limite) break
      if (d.tipo !== 'noticia') continue
      const titulo = String(d.titulo || d.nombre || '').trim()
      if (!titulo) continue
      pushOp(titulo, titulo)
    }
    return out.slice(0, limite)
  }

  // Contrataciones: ofrecer las otras guías del menú
  if (esDocContratacion(top) || /contratacion|control remoto|cambio de plan|d-?box|asistencia vtr/.test(q)) {
    const menu = [
      { label: 'Asistencia VTR ($1.990/mes)', pregunta: 'Asistencia VTR qué es y cómo contratar' },
      { label: 'Control Remoto ($6.000)', pregunta: 'Paso a paso control remoto' },
      { label: 'Cambio de plan paso a paso', pregunta: 'Paso a paso cambio de plan' },
      { label: 'D-Box Smart II ($2.990/mes)', pregunta: 'Cómo agregar un D-Box' },
      { label: 'Costos / precios', pregunta: 'Costos de Contrataciones' },
    ]
    for (const a of menu) {
      if (out.length >= limite) break
      pushOp(a.label, a.pregunta)
    }
    for (const d of docs.slice(1)) {
      if (out.length >= limite) break
      if (!esDocContratacion(d)) continue
      const titulo = String(d.titulo || d.nombre || '').trim()
      if (!titulo) continue
      pushOp(titulo, titulo)
    }
    return out.slice(0, limite)
  }

  // Planes / Streaming
  if (esDocPlan(top) || esDocStreaming(top) || /^(planes?|streaming|ott)$/.test(q) || /fibra \d+|stream tv|premium/.test(q)) {
    const menuPlanes = [
      { label: 'Fibra 600 — promo $14.990', pregunta: 'Fibra 600 Megas' },
      { label: 'Fibra 600 + Netflix — promo $19.990', pregunta: 'Fibra 600 Megas + Netflix' },
      { label: 'Stream TV Premium I — $28.990', pregunta: 'Stream TV Premium I' },
      { label: 'Planes + precios con Disney+', pregunta: 'Planes que incluyen Disney+' },
      { label: 'Planes + precios con Netflix', pregunta: 'Planes que incluyen Netflix' },
      { label: 'Costos contrataciones', pregunta: 'Costos de Contrataciones' },
    ]
    for (const a of menuPlanes) {
      if (out.length >= limite) break
      pushOp(a.label, a.pregunta)
    }
    for (const d of docs.slice(1)) {
      if (out.length >= limite) break
      if (!esDocPlan(d) && !esDocStreaming(d)) continue
      const titulo = String(d.titulo || d.nombre || '').trim()
      if (!titulo || titulo.startsWith('Menú ')) continue
      pushOp(titulo, titulo)
    }
    return out.slice(0, limite)
  }

  const marca = marcaDesdePreguntaODoc(pregunta, top)
  const corta =
    esPreguntaDefinicion(q) ||
    q.split(' ').filter(Boolean).length <= 2 ||
    ENTIDADES_CORTAS.has(q) ||
    Boolean(ALIAS_ENTIDAD[q])

  if (corta && marca && out.length < limite) {
    const atajos = [
      { label: `Cómo activar ${marca.toUpperCase()}`, pregunta: `como activar ${marca}` },
      { label: `Inconvenientes / solución ${marca.toUpperCase()}`, pregunta: `inconvenientes ${marca}` },
      { label: `Paso a paso completo`, pregunta: `paso a paso ${top?.titulo || marca}` },
    ]
    for (const a of atajos) {
      if (out.length >= limite) break
      pushOp(a.label, a.pregunta)
    }
  }

  // Si aún faltan, rellenar con docs más abajo del ranking
  if (out.length < Math.min(3, limite)) {
    for (const d of docs.slice(1)) {
      if (out.length >= limite) break
      const titulo = String(d.titulo || d.nombre || '').trim()
      if (!titulo || titulo === (top?.titulo || top?.nombre)) continue
      pushOp(titulo, titulo)
    }
  }

  return out.slice(0, limite)
}

/** Imágenes del/los docs top para mostrar en el chat */
export function imagenesDesdeDocs(docs, { limite = 6, corta = false } = {}) {
  if (!Array.isArray(docs) || !docs.length) return []
  const top = docs[0]
  const max = corta
    ? Math.min(4, limite)
    : esDocContratacion(top)
      ? Math.min(8, limite)
      : esDocPlan(top) || esDocStreaming(top)
        ? Math.min(6, limite)
        : limite
  const seen = new Set()
  const out = []
  const pool =
    top?.tipo === 'noticia'
      ? docs.filter((d) => d.tipo === 'noticia').slice(0, 5)
      : esDocContratacion(top) || esDocPlan(top) || esDocStreaming(top)
        ? docs.slice(0, 1)
        : docs.slice(0, 2)
  for (const d of pool) {
    for (const src of d.imagenes || []) {
      if (!src || seen.has(src)) continue
      seen.add(src)
      out.push(src)
      if (out.length >= max) return out
    }
  }
  // Fallback: capturas de guías (Control Remoto / Cambio de Plan / D-Box)
  if (out.length < 2) {
    for (const src of imagenesGuiaParaDoc(top)) {
      if (!src || seen.has(src)) continue
      seen.add(src)
      out.push(src)
      if (out.length >= max) break
    }
  }
  return out
}

export function respuestaLocal(pregunta, docs) {
  if (!docs.length) {
    return pickAleatorio([
      'Mmm, no me cuadró del todo… ¿me lo dices de otra forma? Por ejemplo control remoto, cambio de plan, D-Box, planes o modem.',
      'Se me escapó esa. Prueba con otras palabras o dime qué estás intentando hacer y lo vemos juntos.',
    ])
  }
  const q = norm(pregunta)
  const docPorId = (id) =>
    docs.find((d) => d.id === id) || INDICE_PORTAL_LOCAL.find((d) => d.id === id) || null
  const esMicro = docs[0]?.tipo === 'micro'
  const esNoticia = esDocNoticia(docs[0])
  const esProcedimiento =
    docs[0]?.tipo === 'somosclave' ||
    docs[0]?.tipo === 'guia' ||
    docs[0]?.fuente?.includes?.('somosclave')
  const preguntaCorta =
    esPreguntaDefinicion(q) ||
    q.split(' ').filter(Boolean).length <= 2 ||
    ENTIDADES_CORTAS.has(q) ||
    Boolean(ALIAS_ENTIDAD[q]) ||
    /^(noticias?|comunicados?|avisos?|ultimas noticias|ultima noticia)$/.test(q)

  // Noticias del portal → prosa + imagen (miniatura en el bubble)
  if (esNoticia) {
    const d = docs[0]
    const titulo = d.titulo || d.nombre
    const cuerpo = (d.contenido || [])
      .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
      .filter(Boolean)
      .join('\n\n')
      .trim()
    const listado = /^(noticias?|comunicados?|avisos?|ultimas noticias|ultima noticia)$/.test(q)
    if (listado && docs.filter(esDocNoticia).length > 1) {
      const noticias = docs.filter(esDocNoticia).slice(0, 5)
      return [
        pickAleatorio(['Estas son las noticias más relevantes:\n', 'Te dejo las novedades recientes:\n']),
        ...noticias.map((n, i) => `${i + 1}. **${n.titulo || n.nombre}**`),
        '',
        '_Toca una opción abajo o escribe el título para ver el detalle (con imagen si tiene)._',
      ].join('\n')
    }
    return [
      pickAleatorio([`**${titulo}**`, `Te cuento esta noticia — **${titulo}**:`]),
      '',
      cuerpo || 'Sin descripción adicional en la publicación.',
      d.seccionPortal ? `\n_Lo encuentras en: ${d.seccionPortal}_` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  // Costos de contrataciones → prosa (no viñetas)
  if (
    esDocContratacion(docs[0]) &&
    /costo|precio/i.test(String(docs[0].titulo || docs[0].id || ''))
  ) {
    const d = docs[0]
    const cuerpo = (d.contenido || [])
      .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
      .filter(Boolean)
    return [
      `**${d.titulo || d.nombre}**`,
      '',
      ...cuerpo,
      d.seccionPortal ? `\n_Lo encuentras en: ${d.seccionPortal}_` : '',
    ]
      .filter(Boolean)
      .join('\n')
  }

  // Quién puede contratar Asistencia VTR → respuesta corta de elegibilidad
  if (
    /\basistencia\b/.test(q) &&
    /\b(quien|quién|quienes)\b/.test(q) &&
    /\b(contratar|contrata|agregar|puede)\b/.test(q)
  ) {
    const quien =
      docPorId('faq-asistencia-quien') ||
      docPorId('guia-asistencia-vtr') ||
      docs.find((d) => /asistencia/i.test(`${d.id || ''} ${d.titulo || ''} ${d.nombre || ''}`))
    if (quien && /asistencia/i.test(`${quien.id || ''} ${quien.titulo || ''} ${quien.nombre || ''}`)) {
      const lineas = (quien.contenido || [])
        .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
        .filter(Boolean)
      const foco = lineas.filter((l) =>
        /titular|poder notarial|residencial|activo|cobranza|sucursal|call center|registrocivil|1\.990|1990|quien|puede/i.test(
          l
        )
      )
      const cuerpo = (foco.length ? foco : lineas).slice(0, 4)
      return [
        pickAleatorio(['Te lo dejo directo:', 'Claro, elegibilidad:']),
        '',
        `**${quien.titulo || 'Asistencia VTR'}**`,
        ...cuerpo.map((l) => `• ${l}`),
        quien.seccionPortal ? `\n_Lo encuentras en: ${quien.seccionPortal}_` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  // Qué cubre Asistencia VTR → solo cobertura (no volcar todo el ingreso a Andes)
  if (/\basistencia\b/.test(q) && /\b(cubre|cobertura|incluye|que es|qué es)\b/.test(q) && !/\b(quien|quién|precio|cuesta|cuanto)\b/.test(q)) {
    const guia =
      docPorId('guia-asistencia-vtr') ||
      docs.find((d) => /asistencia/i.test(`${d.id || ''} ${d.titulo || ''}`))
    if (guia && /asistencia/i.test(String(guia.id || '') + String(guia.titulo || ''))) {
      const lineas = (guia.contenido || [])
        .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
        .filter(Boolean)
      const foco = lineas.filter((l) =>
        /cubre|red interior|no incluye|extensiones|residenciales|20\.000|20000|visita/i.test(l)
      )
      const cuerpo = (foco.length ? foco : lineas).slice(0, 5)
      return [
        pickAleatorio(['Sobre la cobertura:', 'Te resumo qué cubre:']),
        '',
        `**${guia.titulo || 'Asistencia VTR'}**`,
        ...cuerpo.map((l) => `• ${l}`),
        guia.seccionPortal ? `\n_Lo encuentras en: ${guia.seccionPortal}_` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  // Precio Asistencia → solo monto
  if (/\basistencia\b/.test(q) && /\b(precio|cuesta|cuanto|vale|valor|1990|1\.990)\b/.test(q) && !/\b(quien|quién|cubre)\b/.test(q)) {
    const precio =
      docPorId('faq-asistencia-precio') ||
      docs.find((d) => /asistencia/i.test(`${d.id || ''} ${d.titulo || ''}`) && /precio|1990|cuesta/i.test(`${d.titulo || ''} ${(d.contenido || []).join(' ')}`))
    if (precio && /asistencia/i.test(`${precio.id || ''} ${precio.titulo || ''}`)) {
      const cuerpo = (precio.contenido || [])
        .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 2)
      return [
        `**${precio.titulo || 'Precio de Asistencia VTR'}**`,
        '',
        ...cuerpo,
        precio.seccionPortal ? `\n_Lo encuentras en: ${precio.seccionPortal}_` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  // CONTACTESE CON VTR / no puedo entrar a Max-TNT → solo soporte OTT
  if (
    /contacte(?:se)? con vtr|comunicate con vtr/.test(q) ||
    (/\b(tnt|max|netflix|disney|hbo|streaming|ott)\b/.test(q) &&
      /\b(credencial|no (puedo|me deja) (entrar|ingresar|ver)|mensaje|contrate)\b/.test(q) &&
      !/\b(d-?box|dbox|error\s*0*01)\b/.test(q))
  ) {
    const sop =
      docs.find((d) => d.id === 'ott-soporte-acceso' || d.id === 'faq-streaming-acceso') || docs[0]
    if (sop) {
      const lineas = (sop.contenido || [])
        .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
        .filter(Boolean)
      const foco = lineas.filter((l) =>
        /contacte|credencial|sucursal virtual|ott|transferir|contrat/i.test(l)
      )
      const cuerpo = (foco.length ? foco : lineas).slice(0, 4)
      return [
        pickAleatorio(['Para ese mensaje de acceso:', 'Ok, soporte streaming:']),
        '',
        `**${sop.titulo || 'CONTACTESE CON VTR'}**`,
        ...cuerpo.map((l) => `• ${l}`),
        '',
        '_Esto es acceso OTT/streaming, no un tema de fibra ni del módem._',
        sop.seccionPortal ? `\n_Lo encuentras en: ${sop.seccionPortal}_` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  // Netflix + D-Box Smart / error 001 → triaje Netflix en decodificador
  if (
    (/\bnetflix\b/.test(q) &&
      (/\b(d-?box|dbox|box\s*tv|decodificador|smart)\b/.test(q) ||
        /\berror\s*0*01\b/.test(q) ||
        /\b(problema|falla|inconveniente|no (reproduce|funciona))\b/.test(q))) ||
    (/\berror\s*0*01\b/.test(q) && /\b(d-?box|dbox|netflix|smart)\b/.test(q))
  ) {
    const docNf =
      docs.find((d) => d.id === 'faq-netflix-dbox-error') ||
      docs.find((d) => d.id === 'sc-1111' || d.id === 'sc-996') ||
      docs[0]
    if (docNf) {
      const lineas = (docNf.contenido || [])
        .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 10)
      return [
        pickAleatorio(['Ok, Netflix en D-Box Smart:', 'Triaje Netflix / D-Box:']),
        '',
        `**${docNf.titulo || 'Netflix en D-Box Smart'}**`,
        ...lineas.map((l) => `• ${l}`),
        docNf.seccionPortal ? `\n_Lo encuentras en: ${docNf.seccionPortal}_` : '',
        docNf.enlace ? docNf.enlace : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  // FAQs Somos Clave enfocadas → respuesta corta al tema (no volcar artículo completo)
  {
    const enfs = faqScMatch(q)
    if (enfs.length) {
      const enf = enfs[0]
      const docSc =
        docPorId(enf.faqId) ||
        docs.find((d) => enf.scIds?.includes(d.id)) ||
        null
      if (docSc && (docSc.id === enf.faqId || enf.scIds?.includes(docSc.id))) {
        const lineas = (docSc.contenido || [])
          .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
          .filter(Boolean)
          .slice(0, 8)
        return [
          pickAleatorio(['Te lo dejo al tema:', 'Ok, según Somos Clave:']),
          '',
          `**${docSc.titulo || docSc.nombre}**`,
          ...lineas.map((l) => `• ${l}`),
          docSc.seccionPortal ? `\n_Lo encuentras en: ${docSc.seccionPortal}_` : '',
          docSc.enlace || '',
        ]
          .filter(Boolean)
          .join('\n')
      }
    }
  }

  // LOS / luz roja “qué significa” → significado + pasos cortos (sin mezclar streaming)
  if (
    (esMencionLosTecnico(q) || /\b(luz|led).{0,12}roja?\b/.test(q)) &&
    /\b(significa|quiere decir|es|indica|que pasa|qué pasa|que hago|qué hago)\b/.test(q)
  ) {
    const los = docs.find((d) => /los|ont/i.test(String(d.id || ''))) || docs[0]
    if (los) {
      const lineas = (los.contenido || [])
        .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 5)
      return [
        pickAleatorio(['Sobre la luz LOS:', 'Te lo dejo técnico y corto:']),
        '',
        `**${los.titulo || 'LOS en rojo'}**`,
        ...lineas.map((l) => `• ${l}`),
        los.seccionPortal ? `\n_Lo encuentras en: ${los.seccionPortal}_` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  // Plan / Streaming → prosa clara + costos primero
  if (esDocPlan(docs[0]) || esDocStreaming(docs[0])) {
    const d = docs[0]
    const titulo = d.titulo || d.nombre
    // Listado corto de velocidades base (600/800/940) cuando vienen juntas
    const bases = docs.filter((x) => /^Fibra (600|800|940) Megas$/i.test(String(x.titulo || x.nombre || '')))
    if (bases.length >= 2 && !/netflix|disney|hbo|max|prime|\+/.test(norm(pregunta))) {
      const lineas = [pickAleatorio(['Estos son los planes fibra base:', 'Tenemos estas velocidades:']), '']
      for (const b of bases.slice(0, 3)) {
        const promo = b.precioPromo || ''
        const lista = b.precioLista || ''
        const cuerpo = (b.contenido || []).find((c) => /precio|promo|\$/i.test(String(c))) || ''
        lineas.push(
          `• **${b.titulo || b.nombre}**` +
            (promo && lista ? ` — promo ${promo} / lista ${lista}` : cuerpo ? ` — ${cuerpo}` : '')
        )
      }
      lineas.push('', '¿Quieres alguna con Netflix, Disney+ o TV?')
      return lineas.join('\n')
    }
    const cuerpo = (d.contenido || [])
      .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
      .filter(Boolean)
    const costos = cuerpo.filter((c) => /^(costos?|precio|costo)\b/i.test(c))
    const resto = cuerpo.filter((c) => !/^(costos?|precio|costo)\b/i.test(c))
    const lineas = [pickAleatorio([`**${titulo}**`, `Según el catálogo — **${titulo}**:`]), '']
    if (d.precioLista || d.precioPromo) {
      if (d.precioLista && d.precioPromo && d.precioLista !== d.precioPromo) {
        lineas.push(`**Precio promo:** ${d.precioPromo}`)
        lineas.push(`**Precio lista:** ${d.precioLista}`)
      } else {
        lineas.push(`**Precio:** ${d.precioPromo || d.precioLista}`)
      }
      lineas.push('')
    } else if (costos.length) {
      lineas.push(...costos.map((c) => `**${c}**`))
      lineas.push('')
    }
    lineas.push(...resto)
    if (d.andes) lineas.push('', `_Nombre Andes (copiar): ${d.andes}_`)
    if (d.seccionPortal) lineas.push(`_Lo encuentras en: ${d.seccionPortal}_`)
    // Segundo doc útil (ej. Pack HBO junto a HBO Max)
    const d2 = docs[1]
    if (d2 && (esDocPlan(d2) || esDocStreaming(d2))) {
      const t2 = d2.titulo || d2.nombre
      if (t2 && norm(t2) !== norm(titulo)) {
        const cuerpo2 = (d2.contenido || [])
          .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
          .filter(Boolean)
          .slice(0, 5)
        if (cuerpo2.length) {
          lineas.push('', `También: **${t2}**`, ...cuerpo2)
        }
      }
    }
    return lineas.filter((l) => l !== undefined && l !== null).join('\n')
  }

  // “qué es / qué hace / hbo” → respuesta en párrafo (no viñetas)
  if (preguntaCorta && esProcedimiento) {
    const d = docs[0]
    const resumen = resumenDefinicion(d.contenido || [])
    const titulo = d.titulo || d.nombre
    const cuerpo = resumen
      .map((c) => String(c || '').replace(/^[-•·]\s*/, '').trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    const lineas = [
      pickAleatorio([
        `Te lo dejo claro sobre **${titulo}**:`,
        `Según Somos Clave — **${titulo}**:`,
        `En concreto, **${titulo}**:`,
      ]),
      '',
      cuerpo || `Publicación de referencia: ${titulo}.`,
    ]
    if ((d.contenido || []).length > resumen.length + 4) {
      lineas.push('')
      lineas.push('Si necesitas el paso a paso completo (activación o solución), dímelo y te lo detallo.')
    }
    if (d.seccionPortal) {
      lineas.push('')
      lineas.push(`_Lo encuentras en: ${d.seccionPortal}_`)
    }
    if (d.enlace) lineas.push(d.enlace)
    // Alternativas van como botones en el chat; no repetirlas como lista con puntos
    return lineas.filter((l) => l !== undefined && l !== null).join('\n')
  }

  const lineas = [
    pickAleatorio(
      esMicro
        ? ['Dale, solo ese paso:\n', 'Así se hace:\n', 'Te lo dejo puntual:\n']
        : ['Mira, te lo dejo clarito:\n', 'Dale, te oriento con esto:\n', 'Así lo haría yo paso a paso:\n']
    ),
  ]
  const maxDocs = esMicro ? 1 : esProcedimiento ? 1 : 2
  const maxLines = esMicro ? 24 : esProcedimiento ? 55 : 28
  for (const d of docs.slice(0, maxDocs)) {
    lineas.push(`**${d.titulo || d.nombre}**`)
    const cuerpo = d.contenido || []
    for (const c of cuerpo.slice(0, maxLines)) lineas.push(`• ${c}`)
    if (cuerpo.length > maxLines) {
      lineas.push(`• …y ${cuerpo.length - maxLines} puntos más en la publicación completa.`)
    }
    if (d.seccionPortal) lineas.push(`_Lo encuentras en: ${d.seccionPortal}_`)
    if (d.enlace) lineas.push(d.enlace)
    lineas.push('')
  }
  // Alternativas solo como botones en el chat (no repetir lista en el texto)
  return lineas.filter(Boolean).join('\n')
}

function pickAleatorio(opciones) {
  return opciones[Math.floor(Math.random() * opciones.length)]
}

/** Evita repetir la misma frase en las últimas N elecciones de esa categoría. */
const _ultimasPorCat = new Map()
function pickFluido(categoria, opciones, recientesGlobales = []) {
  const pool = Array.isArray(opciones) ? opciones.filter(Boolean) : []
  if (!pool.length) return ''
  const usadas = _ultimasPorCat.get(categoria) || []
  const recientesNorm = (recientesGlobales || []).map((t) =>
    String(t || '')
      .toLowerCase()
      .slice(0, 48)
  )
  let candidatas = pool.filter((o) => {
    const head = String(o).toLowerCase().slice(0, 48)
    if (usadas.includes(o)) return false
    if (recientesNorm.some((r) => r && (head.startsWith(r.slice(0, 24)) || r.startsWith(head.slice(0, 24))))) {
      return false
    }
    return true
  })
  if (!candidatas.length) candidatas = pool.filter((o) => !usadas.includes(o))
  if (!candidatas.length) candidatas = pool
  const elegida = candidatas[Math.floor(Math.random() * candidatas.length)]
  const next = [...usadas, elegida].slice(-Math.min(6, Math.max(3, pool.length - 1)))
  _ultimasPorCat.set(categoria, next)
  return elegida
}

function esConsultaEntidadCorta(q) {
  const t = String(q || '').trim()
  if (!t) return false
  if (ENTIDADES_CORTAS.has(t) || ALIAS_ENTIDAD[t]) return true
  // Marca/producto corto (hbo, ott…) — no confundir con remates tipo ok/si/ya
  if (
    /^[a-z0-9+]{2,5}$/.test(t) &&
    !/^(ok+|oka|si+|sip|nop|nel|nah|na+|nada|ya|emm+|ehm+|xd|oe+|alo+|aea+|aja+|gg|hi|hey|hola|holi|ola|hla|wena|wenas|che|pe|parce|causa|soli|bye|chau|chao|xao|grax|bruh|lol)$/.test(
      t
    )
  ) {
    return true
  }
  return false
}

export function esCharlaCasual(pregunta) {
  const q = norm(pregunta)
  if (!q) return false
  // Consultas de definición / función / entidad → siempre conocimiento
  if (esPreguntaDefinicion(q) || esConsultaEntidadCorta(q)) return false
  const esTrabajo =
    /\b(andes|siebel|pedido|cliente|rut|d-?box|boleta|deuda|ss\b|tipific|control remoto|visita tecnica|cambio de plan|sucursal|streaming|glosario|portabilidad|modem|fibra|plan|noticia|inhibicion|inhibir|plantilla|contratacion|pago|recaudador|pna|facturacion|horario|somos clave|id\s*\d+|hbo|netflix|disney|prime|universal|ott|activacion|inconveniente|ont|pon|cajita|wifi|ethernet|senal optica|traslado|mudanza|titular|asistencia|internet|tv\b|cable|megas|hfc|ftth|pack|delivery|omnia|genesys|corte|reconexion|retencion|visita|control|no funciona|no anda|no responde|no ve|sin senal|falla|procedimiento|cubre)\b/.test(
      q
    ) || esMencionLosTecnico(q)
  // "qué hago" / "cubre" solos siguen siendo charla; con tema de trabajo, no
  if (esTrabajo && !/^(que hago|que cubre|cubre(me)?)$/.test(q)) return false
  if (q.length > 220) {
    return /\b(siento|me siento|estoy|necesito|ayuda|hablar|nadie|solo|sola|miedo|ansied|deprim|llorar|crisis|mal dia)\b/.test(
      q
    )
  }
  return (
    /^(hola+|holi|holis|ola|hla|hi|hey|buenas|buen(as|os)?\s*(dia|tardes?|noches?)|que tal|ke tal|q tal|como estas|cm estas|como andas|como te va|todo bien|gracias+|grax|grasias|chau+|adios+|chao+|nos vemos|ok+|oka|dale|vale+|listo|perfecto|si+|sip|nop|ya|emm+|ehm+|jaja+|jeje+|xd|oe+|oee+|alo+|wena+|wenas|ah ya|ahh|ya pe|de una|causa|parce|che|quiubo|mmm+|ehh+|aea+|aja+|tas\??|caes\??|vienes\??|te amo+|te quiero+|me quieres\??|me extranas\??|te extrano+|bye+)\b/.test(
      q
    ) ||
    /(chiste|broma|cuentame|animo|estres|cansad|aburrid|triste|feliz|ansied|ansios|nervios|agotad|quemad|burnout|motiv|desanim|preocup|angust|me siento|como te sientes|quien eres|que puedes hacer|que sabes hacer|hablame|platiquemos|escuchame|necesito hablar|nesesito hablar|dilema|^que hago$|conversemos|musica|pelicula|peli\b|sinopsis|reparto|actor|comida|antojo|finde|descanso|sueno|dormir|pareja|amigo|que haces|q haces|que tal tu dia|como va el dia|todo mal|todo ok|buen finde|feliz lunes|feliz viernes|saludos|buenas vibras|te extrane|te amo|te quiero|me quieres|wena|wenas|alo|aloh|emoji|emoticon|carita|sticker|meme|almorz|lucas|trafico|bateria|alucina|piola|bacan|soli|chevere|roche|ala+\b|responde bien|contesta pe|que onda|que cuentas|jalas|te apuntas|normalazo|fresh|tranqui|ranked|partida|\bgg\b|clutch|^cubre$|que necesitas|que quieres|que buscas|tu amor|sorprendeme|no te rindas|animame|motivame|dale nomas|loqueas|vacilas|me estas jodiendo|no puede ser|es neta|asu+|bajale dos|fome|cachai|altiro|quilombo|bajon|chimba|pereza|mamado|maluco|posta|brígido|brigido|quita eso|borra eso|saca eso|quita esa|borra esa|saca esa|para con eso|no digas eso|fuera eso|basta eso|salir de tema|cambiemos de tema|otro tema|cambio de tema|hablemos de otra|pasemos a otra|off topic|dejemos ese tema|deja el tema|deja ese tema|deja este tema|corta el tema|cerremos el tema|olvidemos el tema|basta del tema|no mas ese tema|ya no hablemos|terminemos el tema|chao con ese tema|fuera de tema)/.test(
      q
    ) ||
    (/\btema\b/.test(q) &&
      /\b(deja|dejar|dejemos|dejen|salir|salgamos|salte|sal|cambiar|cambiemos|cambio|corta|cerremos|olvidemos|olvidate|basta|terminemos|acabemos|chao)\b/.test(
        q
      )) ||
    (/\bno mas\b/.test(q) && /\b(eso|tema)\b/.test(q)) ||
    /\b(cualquier|cualquiera)\s+(otra\s+)?(cosa|tema)\b/.test(q) ||
    /\b(lo que sea|da igual|me da igual|como sea|lo que tu quieras|lo que quieras|inventa(te)? algo|tu eliges|tu eliges)\b/.test(
      q
    ) ||
    /^(cualquier cosa|otra cosa|lo que sea|da igual|me da igual|como sea|inventa|tu eliges)\??$/.test(q) ||
    /^(nada+|nada\s*(xd|pe|po|che|ps|pues|nomas|nomás|mas|más)?|nada de nada|ya te dije que nada|te dije que nada|no es nada|no fue nada)\b/.test(
      q
    ) ||
    /\b(que te importa|que te importa a ti|y a ti que|a ti que|no es tu asunto|no te metas|no te meta|por que preguntas|por que quieres saber|eso no te importa|no te incumbe|mind your business)\b/.test(
      q
    ) ||
    (q.trim().length <= 4 && !esConsultaEntidadCorta(q)) ||
    esInsultoOTonoAgresivo(q)
  )
}

/** Solo remates muy sensibles: el resto lo responde la IA (Gemini). */
export function preferirRemateLocal(pregunta) {
  const q = String(pregunta || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[❤️💕💖💗😍😘🥰]+/g, '')
    .trim()
  if (!q || q.length > 40) return false
  // No bloquear xd/jaja/hola/aburrido/etc.: eso hace sonar a bot de plantillas.
  return /^(te amo+|te quiero+)\b/.test(q)
}

function esInsultoOTonoAgresivo(q) {
  return (
    /\b(idiota|imbecil|estupido|estupida|tonto|tonta|basura|inutil|mierda|carajo|ctm|conchetumadre|concha|weon|weona|gil|pendejo|pendeja|puto|puta|maricon|culiao|hnsp|vete a|callate|te odio|eres un|eres una)\b/i.test(
      q
    ) ||
    (/[!]{2,}/.test(q) && /\b(malo|pesimo|horrible|basura)\b/.test(q))
  )
}

/**
 * Respuestas locales fluidas (fallback si Gemini no responde).
 * @param {string} pregunta
 * @param {{ recientes?: string[] }} [opts]
 */
export function respuestaCasualLocal(pregunta, opts = {}) {
  const recientes = opts.recientes || []
  let q = String(pregunta || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  // Dislexia / typos frecuentes → intención clara (sin sermonear)
  q = q
    .replace(/\b(ola|hla|hol+|holi+|holis)\b/g, 'hola')
    .replace(/\b(buens?|buenoas|buenas?)\s+(dia|dias|tades|tardes|noches)\b/g, 'buenos $2')
    .replace(/\b(ke|k|q)\s*tal\b/g, 'que tal')
    .replace(/\b(komo|cm|como)\s*(estas|stas|andas|estai|andai)\b/g, 'como estas')
    .replace(/\b(grasias+|grax|graci+)\b/g, 'gracias')
    .replace(/\b(adios+|adioos+|xao)\b/g, 'adios')
    .replace(/\b(asta|hasta)\s+luego\b/g, 'hasta luego')
    .replace(/\b(estoi|toy|toyy)\b/g, 'estoy')
    .replace(/\b(nesesito|nesecito|nesesito)\b/g, 'necesito')
    .replace(/\b(ansiiedad|ansiedad)\b/g, 'ansiedad')
    .replace(/\b(tristee+|trsite)\b/g, 'triste')
    .replace(/\b(cansao|cansadoo+)\b/g, 'cansado')
    .replace(/\b(mall+)\b/g, 'mal')
    .replace(/\b(bn)\b/g, 'bien')
  // “chao con ese tema” no debe convertirse en despedida
  if (!/\btema\b/.test(q)) {
    q = q.replace(/\b(chau+|chao+)\b/g, 'adios')
  }
  const pick = (cat, arr) => pickFluido(cat, arr, recientes)

  // —— “Nada” / evasión suave ——
  if (
    /^(nada+|nada\s*(xd+|jaja+|jeje+)?|nada\s*(pe|po|ps|pues|che|nomas|nomás|mas|más)?|nada de nada|en nada|no es nada|no fue nada|ya te dije que nada|te dije que nada|nada en realidad|nada importante|solo estaba viendo)\s*[.!?]*$/.test(
      q
    ) ||
    /^(no necesito nada|no quiero nada|no quiero nada mas|no quiero nada más)\s*[.!?]*$/.test(q)
  ) {
    return pick('nada_evasion', [
      'Ok. Sin presión.',
      'Va. Aquí ando si se te ocurre algo.',
      'Tranqui. Nada también es respuesta.',
      'Dale. Silencio cómodo.',
      'Perfecto. Cambio de tema cuando quieras.',
      'Respeto. ¿Charlamos de otra cosa o lo dejamos ahí?',
      'Oké. Sin interrogatorio.',
      'Va pe. Avisas si aparece algo.',
      'Entendido. Nada por ahora.',
      'Listo. No insisto.',
      'Jaja ok, nada entonces.',
      'Queda en cero. Aquí si cambias de idea.',
      'Suave. ¿Random o descanso?',
      'Anotado: nada. Qué eficiente.',
      'Va. ¿Preferís que te tire yo un tema?',
    ])
  }

  // —— “Qué te importa” / borde defensivo ——
  if (
    /\b(que te importa|que te importa a ti|y a ti que|a ti que te|no es tu asunto|no te metas|no te meta|eso no te importa|no te incumbe|por que preguntas tanto|por que quieres saber|deja de preguntar|no preguntes tanto|mind your business)\b/.test(
      q
    ) ||
    /^(y a ti\??|a ti que\??|que te importa\??|que te importa xd|que te importa\s*😂?)\s*$/.test(q)
  ) {
    return pick('que_te_importa', [
      'Justo. Bajo el volumen. ¿De qué hablamos entonces?',
      'Ok, respeto. No insistiré.',
      'Va. Sin fisgonear. Tú marcas el tema.',
      'Jaja ok, me retiro del caso. ¿Otra cosa?',
      'Entendido. Espacio personal activado.',
      'Dale. Cambio de canal: dime tú.',
      'Respeto total. Aquí sin preguntas de más.',
      'Oké. Silencio útil. Cuando quieras, disparas.',
      'Me corrijo. ¿Charla libre o lo dejamos?',
      'Va pe. Tú mandas el hilo.',
      'Justicia. ¿Tema random o descanso?',
      'Ok, cero interrogatorio. Estoy.',
    ])
  }

  // —— “Quita eso” / rechazar lo último (sarcasmo + serio) ——
  if (
    /^(quita|borra|saca|elimina|remueve|quita(me)?|borrame|sacame)\s+(eso|esa|esto|esta|lo|la|esa wea|esa weá|esa vaina|ese mensaje|esa respuesta|eso xd|eso jaja)\b/.test(
      q
    ) ||
    /^(quita eso|borra eso|saca eso|elimina eso|no quiero eso|saca esa wea|quita esa wea|borra eso xd|quita eso porfa|quita eso pe|saca eso che)\b/.test(
      q
    ) ||
    /^(no digas eso|no digas eso xd|deja de (hacer|decir) eso|para con eso|basta (con )?eso|fuera eso)\b/.test(q)
  ) {
    return pick('quita_eso', [
      'Listo. Lo quito.',
      'Va. Borrado del hilo mental.',
      'Ok. Eso no existió.',
      'Hecho. ¿Qué prefieres en su lugar?',
      'Sacado. Dime cómo lo quieres.',
      'Perdón. Lo retiro.',
      'Va, sin eso. ¿Seguimos con otra cosa?',
      'Eliminado. ¿En serio o con humor más suave?',
      'Ok ciudadano: mensaje anterior descartado.',
      'Qué delicado. Procedo a fingir que no dije nada.',
      'Listo. Modo serio: ¿qué te molestó de eso?',
      'Sacado. Sin drama. ¿Qué necesitas ahora?',
      'Borrado. Tira la versión correcta y la sigo.',
      'Va pe. Eso fuera.',
      'Dale. ¿Quieres que lo diga distinto o lo dejamos?',
      'Ok. Límite respetado. Cambio de tema cuando quieras.',
      'Eso ya no está. ¿Charla o algo del portal?',
      'Retirado. Gracias por avisarme.',
    ])
  }

  // —— Salir / cambiar / dejar el tema ——
  const pideCambioTema =
    /\b(deja|dejar|dejemos|dejen|deje)\b.{0,20}\btema\b/.test(q) ||
    /\b(salir|salgamos|sal|salte|sale)\b.{0,16}\btema\b/.test(q) ||
    /\b(cambiar|cambiemos|cambien|cambio|cambie)\b.{0,12}\btema\b/.test(q) ||
    /\b(otro|nuevo|siguiente)\s+tema\b|\btema\s+(nuevo|siguiente|distinto|diferente)\b/.test(q) ||
    /\b(hablemos|hablar|habla)\b.{0,24}\b(otra cosa|algo mas|algo distinto|algo diferente|algo random)\b/.test(q) ||
    /\b(pasemos|vamos|vamos a)\b.{0,20}\b(otra cosa|otro tema)\b/.test(q) ||
    /\b(mejor)\b.{0,20}\b(otra cosa|otro tema|hablemos de otra)\b/.test(q) ||
    /\b(basta|cort(a|e|emos|ar)|cerr(a|e|emos|ar)|olvid(a|e|emos|ate|ar)|termin(a|e|emos|ar)|acab(a|e|emos|ar))\b.{0,20}\btema\b/.test(
      q
    ) ||
    /\b(ya no)\b.{0,24}\b(tema|eso)\b/.test(q) ||
    /\b(no (mas|más)|no quiero mas|no hagamos mas|no hablemos mas)\b.{0,20}\b(tema|eso)\b/.test(q) ||
    /\b(off\s*topic|fuera de tema|ya fue (con )?(ese )?tema)\b/.test(q) ||
    (/\bchao\b/.test(q) && /\btema\b/.test(q)) ||
    (/\bno mas\b/.test(q) && /\b(eso|tema)\b/.test(q)) ||
    /^(deja el tema|deja ese tema|deja este tema|dejemos el tema|salir de tema|cambiemos de tema|otro tema|cambio de tema|corta el tema|cerremos el tema|olvidemos el tema|basta del tema|no mas ese tema|ya no hablemos de eso)$/.test(
      q
    )

  if (pideCambioTema) {
    return pick('cambio_tema', [
      'Dale. ¿De qué quieres hablar ahora?',
      'Va. Dejamos ese tema. Tírame el nuevo.',
      'Listo, salimos de eso. ¿Qué te late?',
      'Ok. Página nueva. ¿Charla, tip o lo que se te ocurra?',
      'Hecho. Dime el siguiente tema y te sigo.',
      'Sin problema. ¿Hacia dónde vamos?',
      'Perfecto. Ese tema queda atrás. ¿Qué tienes en mente?',
      'Va. Aquí estoy para lo que venga. ¿Cuál es el nuevo tema?',
      'Cambio aceptado. ¿Liviano, serio o random?',
      'Dale. Empezamos de cero. Cuéntame.',
      'Ok. Dejo el tema. ¿Qué quieres ahora?',
      'Listo. ¿Prefieres algo del día a día o algo del portal?',
      'Va pe. ¿De qué hablamos?',
      'Che, joya. Tirame el tema nuevo.',
      'Parce, listo. ¿Qué más?',
      'Hecho. Ese hilo cerrado. ¿Seguimos con otra cosa?',
      'Tranqui. Ya no tocamos eso. ¿De qué hablamos?',
      'Ok. Cortado. Dime el siguiente.',
      'Dejamos el tema. Estoy atento a lo nuevo.',
      'Va. ¿Quieres charla libre o me tiras un tema puntual?',
      'Listo. Respiro limpio. ¿Qué se te ocurre?',
      'Sin insistir. Nuevo tema cuando quieras; aquí estoy.',
      'Perfecto. ¿Música, día a día, o un tip del trabajo?',
      'Ok. Borrón y cuenta nueva. Cuéntame.',
      'Dale. ¿Random amable o algo concreto?',
      'Va. Dejo eso. ¿Qué prefieres ahora?',
      'Listo. Tema cerrado. ¿Seguimos?',
      'Ok. No vuelvo a ese punto. ¿De qué hablamos?',
    ])
  }

  // —— “Cualquier otra cosa” / no elige tema (proponer, no repreguntar) ——
  if (
    /\b(de\s+)?(cualquier|cualquiera)\s+(otra\s+)?(cosa|tema|lado)\b/.test(q) ||
    /\b(lo que sea|lo que tu quieras|lo que tú quieras|lo que quieras|da igual|me da igual|como sea|como quieras|indistinto|lo que se te ocurra|inventa(te)? algo|tu eliges|tú eliges|elige tu|elige tú|lo que pongas|hablame de algo|háblame de algo|cuentame algo|cuéntame algo|sorpréndeme|sorprendeme)\b/.test(
      q
    ) ||
    /^(cualquier cosa|otra cosa|lo que sea|da igual|me da igual|como sea|inventa|sorpréndeme|sorprendeme|tu eliges|tú eliges)\??$/.test(
      q
    )
  ) {
    return pick('cualquier_cosa', [
      'Va. ¿Cómo te fue el día hoy, de verdad?',
      'Dale. ¿Estás más de humor charla o de silencio cómodo?',
      'Ok. Tirame: ¿prefieres música, series o solo desahogo?',
      'Listo. Cuéntame una cosa chica de tu día, la que sea.',
      'Va. ¿Qué te gustaría que pasara mañana?',
      'Dale. ¿Comiste algo rico hoy o fue día random?',
      'Ok. Si estuvieras libre ahora mismo, ¿qué harías?',
      'Va. ¿Cómo andas de energía: bajo, normal o bien?',
      'Listo. Hablemos de algo liviano: ¿qué estás mirando o escuchando últimamente?',
      'Dale. ¿Quieres que te haga una pregunta random amable?',
      'Ok. Te tiro yo: ¿café, té o nada, el día de hoy?',
      'Va. Cuéntame qué te tiene la cabeza ocupada, sin filtro.',
      'Listo. ¿Plan del finde o todavía no hay plan?',
      'Dale. ¿Prefieres hablar de lo cotidiano o de algo del trabajo/portal?',
      'Ok. Empezamos fácil: ¿todo bien, más o menos, o día pesado?',
      'Va. Invento yo el hilo: ¿qué te haría bien en este momento?',
    ])
  }

  // —— Risas / xd / XDDD / lol: siempre respuesta natural de conversación ——
  if (
    /^(xd+|xdd+|xddd+|lol+|lmao+|jaja+|jeje+|jsjs+|jajjaja+|jijiji+|bruh+|kk+|haha+|hehe+)\s*$/i.test(
      String(pregunta || '').trim()
    ) ||
    /^(xd+|xddd*|lol|lmao|jaja+|jeje+|jsjs+|bruh|💀|😂|🤣|😭)$/.test(q) ||
    /^[xX][dD]{2,}$/.test(String(pregunta || '').trim())
  ) {
    return pick('risa_prio', [
      'Jajaja me alegró. ¿Qué más cuentas?',
      'Me dio risa también. ¿Seguimos el hilo?',
      'Buena esa. Cuéntame qué te sacó la risa.',
      'Jaja sí. ¿Todo bien por allá?',
      'Me contagiaste. ¿De qué hablamos ahora?',
      'Jajaja dale, te leo. ¿Qué sigue?',
      'Esa pegó. ¿Quieres seguir charlando?',
      'Jaja perfecto. Aquí ando si quieres tirar otra.',
      'Me reí. ¿Era por lo anterior o algo nuevo?',
      'Jajaja ok. Dime qué tienes en mente.',
      'Buenísimo. ¿Seguimos liviano o cambias de tema?',
      'Jaja te pasaste. ¿Qué más?',
      'Me alegró el xd. ¿Cómo va tu día?',
      'Jajaja sí que sí. Tírame lo que venga.',
      'Esa sí me sacó una risa. ¿Seguimos?',
      'Jaja ya. Estoy para lo que necesites.',
      'Me dio risa de verdad. ¿Qué más se te ocurre?',
      'Jajaja bien ahí. ¿Charlamos un rato?',
      'Ok jajaja. Cuéntame, ¿qué tal estás?',
      'Jaja suavecito. ¿De qué quieres hablar?',
      'Me contagió. ¿Seguimos random o algo concreto?',
      'Jajaja te leo completo. Dispara.',
      'Buena vibra. ¿Qué más tienes?',
      'Jaja en serio me alegró. ¿Todo ok?',
      'Esa estuvo buena. ¿Seguimos el chat?',
      'Jajaja dale. Aquí sigo contigo.',
      'Me mató de risa. ¿Y ahora qué?',
      'Jaja ok ok. Dime qué quieres hacer.',
      'Risa compartida. ¿Hablamos de otra cosa o seguimos?',
      'Jajaja presente. ¿Qué se te antoja ahora?',
    ])
  }

  // —— Aburrido: empatía emocional (sin sarcasmo) ——
  if (
    /\b(estoy aburrido|estoy aburrida|toy aburrido|toy aburrida|que aburrimiento|qué aburrimiento|me aburro|aburridisimo|aburrida total|no se que hacer|no sé qué hacer|mirando el techo|sin oficio|modo aburrido)\b/.test(
      q
    )
  ) {
    return pick('aburrido_prio', [
      'Te entiendo. El aburrimiento pega feo a veces.',
      'Ok. Te acompaño. ¿Quieres charlar un rato?',
      'Está bien sentirse así. ¿Te distraigo con algo liviano?',
      'Aquí estoy. ¿Preferés conversar, un tip corto o solo compañía?',
      'El vacío del rato es real. ¿De qué te gustaría hablar?',
      'Te leo. Si quieres, inventamos un tema suave.',
      'Sin presión. ¿Música, series, o solo desahogo?',
      'Dale, charlemos. ¿Cómo va tu día además del aburrimiento?',
      'Puedo quedarme un rato contigo. ¿Qué te haría un poquito menos pesado?',
      'Entiendo. A veces no hay nada que hacer y pesa. ¿Te tiro una pregunta random amable?',
      'Aquí presente. ¿Quieres que te proponga algo simple para pasar el rato?',
      'Te acompaño sin forzarte. Cuando quieras, dime un tema.',
      'Ok. Compañía primero. ¿Cómo te sientes aparte de aburrido?',
      'Tiene sentido. ¿Charla corta o prefieres que te escuche en silencio un momento?',
      'Vamos despacio. ¿Qué se te antojaría ahora: hablar o distraerte?',
    ])
  }

  // —— Regionales: Chile / Perú / Argentina / Colombia ——
  if (/^(wena+|wenas)\b/.test(q) || /\bwena\b/.test(q) && q.length < 24) {
    return pick('cl_wena', [
      '¡Wena! ¿Cómo estai?',
      '¡Wenas! Aquí ando. ¿Todo bien po?',
      'Wena. Dime.',
      '¡Wena! ¿Charlamos o te ayudo con algo?',
    ])
  }
  if (/^(causa|mi soli|soli)\b/.test(q) || /^(que fue|qe fue)\??$/.test(q)) {
    return pick('pe_causa', [
      'Habla, causa. ¿Qué pasó?',
      'Qué fue. Dime noma.',
      'Aquí ando pe. Cuéntame.',
      'De una. ¿Qué necesitas?',
    ])
  }
  if (/^(che|hola che|buenas che)\b/.test(q)) {
    return pick('ar_che', [
      'Che, decime. ¿Qué pasa?',
      'Hola. ¿Cómo andás?',
      'Acá estoy. Contame.',
    ])
  }
  if (/^(parce|que mas|qué mas|quiubo|quiubo parce)\b/.test(q) || /^que mas\b/.test(q)) {
    return pick('co_parce', [
      '¿Qué más, parce?',
      'Quiubo. ¿Cómo le va?',
      'Aquí presente. Diga.',
      'Bacano verte. ¿Qué cuenta?',
    ])
  }
  if (/\b(bacan|bacán|la raja|filete|altiro|al tiro|cachai|si po|ya po)\b/.test(q) && q.length < 40) {
    return pick('cl_ack', ['Dale po.', 'Bacánica.', 'Ya. Aquí sigo.', 'Caché. ¿Qué más?'])
  }
  if (/\b(ya pe|de una|alucina|asu|piola|chevere|chévere)\b/.test(q) && q.length < 40) {
    return pick('pe_ack', ['Ya pe.', 'De una.', 'Piola.', 'Dale. ¿Qué más?'])
  }
  if (/\b(posta|re bien|re mal|barbaro|bárbaro|quilombo|bajon|bajón)\b/.test(q) && q.length < 45) {
    if (/re mal|bajon|quilombo/.test(q)) {
      return pick('ar_bajon', [
        'Uf. Contame qué pasó.',
        'Te escucho. Sin apuro.',
        'Validado. Acá estoy.',
      ])
    }
    return pick('ar_ack', ['Dale.', 'Joya.', 'Posta. ¿Seguimos?', 'Bárbaro.'])
  }
  if (/\b(chimba|bacano|pereza|mamado|mamada|maluco)\b/.test(q) && q.length < 45) {
    if (/pereza|mamad|maluco/.test(q)) {
      return pick('co_pesado', [
        'Tiene sentido. Respire. Aquí estoy.',
        'Día pesado. ¿Quiere charlar o un tip?',
        'Ok. Sin presión. Cuénteme.',
      ])
    }
    return pick('co_ack', ['Chimba.', 'Bacano.', 'Listo parce.', 'Dale.'])
  }

  // “¿Qué necesitas?” / variantes abiertas → respuesta no literal
  if (
    /^(que|qué)\s+(necesitas|quieres|buscas|deseas|te hace falta|te falta|necesitas de mi|quieres de mi|te puedo dar|se te antoja|te gustaria|tienes en mente|quieres ahora|necesitas ahorita|te haria feliz|te provoca)\??$/.test(
      q
    ) ||
    /^(dime que necesitas|en que te ayudo|que quieres que (haga|te de)|que quieres que haga por ti)\??$/.test(q)
  ) {
    return pick('que_necesitas', [
      'Tu amor, obviamente 🙄',
      'Tu atención 😌',
      'Una pizza familiar.',
      'Paz mental, por favor',
      'Que me dejen dormir',
      'Un café intravenoso.',
      'Nada, tranqui.',
      'No sé, sorpréndeme',
      'Que no preguntes tanto.',
      'Reiniciar mi vida 💀',
      'WiFi.',
      'Que llegue el viernes.',
      'A ti, pero no te emociones.',
      'Existiendo menos 😂',
    ])
  }
  if (
    /^(tu amor|tu amorcito|tu carino|que me quieras|un abrazo|a ti|tu corazon|tu presencia|una pizza|un millon|que me prestes plata|plata xd|nada,? (era curiosidad|ya,? ?olvidalo)|que no preguntes tanto|sorprendeme|un milagro|era bait|era joda|nada era webeo|tu amor ps|q me quieras|dormir nomas|paz mental p)/.test(
      q
    )
  ) {
    return pick('reac_no_literal', [
      'Jajaja ok.',
      'Pedido recibido 😂',
      'Va, anoto.',
      'Esa no estaba en el catálogo.',
      'Ok ok.',
      'Te leo.',
      'Dale.',
      'Mood.',
    ])
  }

  // Motivación / ánimo
  if (
    /\b(me rindo|quiero rendirme|no puedo mas|perd[ií] la motivacion|animame|motivame|dame animo|no aflojes|quiero tirar la toalla|estoy por rendirme|no avanzo nada)\b/.test(
      q
    ) ||
    /^(que te motiva|como sigo|vale la pena|como me levanto)\??$/.test(q)
  ) {
    return pick('motivacion', [
      'Oe, tranquilo, sí puedes.',
      'Dale nomás, poco a poco.',
      'No aflojes 🔥',
      'Un día a la vez.',
      'Fe, café y seguimos ☕💪',
      'Cansado sí, vencido todavía no.',
      'Ya llegaste hasta acá.',
      'Paso a paso 🐢❤️',
      'Hoy sobrevivir el día ya es suficiente.',
      'Sigue.',
    ])
  }

  // Reacciones: loquear / vacilar / incredulidad / sorpresa
  if (
    /\b(me loqueas|me estas loqueando|no me loquees|me estas vacilando|no me vaciles|me estas jodiendo|me estas hueveando|me estas tomando el pelo|no te creo|no puede ser|es neta|estas hablando en serio|es broma)\b/.test(
      q
    ) ||
    /^(queeee+|como asi|como que que|de verdad\??|real\??|quee+\??)$/.test(q)
  ) {
    return pick('reac_loquear', [
      'Jajaja un poquito.',
      'Bait suave.',
      'Ok ok, en serio ahora.',
      'Te loqueo rico nomas 😂',
      'Va, sin vacilar: te cuento bien.',
      'Era joda. Relaja.',
      'Sí, en serio.',
      'No invento… o sí 👀',
    ])
  }
  if (/^(ala+|asu+|uy+|dios+|nooooo+|naaaa+|que fuerte|que locura|me quede|estoy en shock|necesito contexto)/.test(q)) {
    return pick('reac_sorpresa', [
      'Jajaja te agarré.',
      'Ya, te explico.',
      'Asu también.',
      'Espera, contexto viene.',
      '💀',
      'Dale, respira.',
    ])
  }
  if (/\b(ya exageraste|te pasaste tres pueblos|bajale dos|baja un cambio|te volaste|no seas dramatico|tampoco asi)\b/.test(q)) {
    return pick('reac_exa', ['Ok, bajo.', 'Va, exageré un toque.', 'Bajo un cambio.', 'Relaja, era drama 😂'])
  }
  if (
    /^(si,? claro|obviamente|como no|faltaba mas|que sorpresa|fascinante|brillante|genio|que aporte|gracias campeon|un aplauso)/.test(
      q
    )
  ) {
    return pick('reac_sarcasmo', [
      'Detecté el sarcasmo 🙄',
      'Ok, bajé el ego.',
      'Jajaja merecido.',
      'Va, sin ironía: dime en serio.',
      'Touché.',
    ])
  }

  // Afecto: respuesta humana/cálida (no tono burocrático ni “soy un bot”)
  if (/^(te amo|te amo+ ?❤️?|te quiero)\b/.test(q) && q.length < 40) {
    return pick('remate_amo', [
      'Jajaja ❤️ también te tengo cariño.',
      'Uy, directo al corazón. Yo también te aprecio.',
      'Qué lindo 😊 Yo por aquí, a tu lado.',
      'Recibido con cariño. ¿Cómo vas tú?',
      'Jaja me alegra ❤️ Cuéntame qué tal tu día.',
      'Aw, gracias. Yo también te quiero un montón.',
      '💕 Igual. ¿Todo bien por ahí?',
      'Me derrites. ¿Charlamos o necesitas algo?',
    ])
  }
  // Tristeza / bajón: primero contención (no meme)
  if (
    /^(estoy|me siento)\s+(triste|mal|bajon|para el ojete|mierda|maluco)|^(toy triste|dia pesado|mal dia|todo mal)\b/.test(
      q
    ) &&
    q.length < 60
  ) {
    return pick('emo_triste_prio', [
      'Te escucho. No tienes que estar bien para escribirme. ¿Qué te pesa?',
      'Gracias por decirlo. Aquí estoy. ¿Quieres desahogarte o solo compañía?',
      'Validado. Mal rato ≠ que estés fallando. Cuéntame sin filtro.',
      'Ok. Suave. Un trago de agua y después, si quieres, lo vemos juntos.',
    ])
  }
  if (/^(te extrano|tengo sueno|tengo hambre|estoy cansado|estoy cansada|no tengo plata|no quiero trabajar|quiero vacaciones|quiero dormir|estoy soltero|me dejaron)\b/.test(q) && q.length < 50) {
    return pick('remate_meme', [
      'Entonces duerme, ciudadano.',
      'Come, campeón.',
      'Tu cuerpo acaba de presentar su renuncia.',
      'Bienvenido al club.',
      'Felicidades, desbloqueaste la vida adulta.',
      'Excelente planificación.',
      'Mis condolencias.',
      'F por el soldado caído.',
      'El capitalismo toma nota.',
      'Solicitud recibida. Respuesta: más tarde.',
      'En serio: descansa un rato si puedes.',
      'Ok. Sin meme: ¿necesitas ayuda concreta o solo desahogo?',
      'Tragedia nacional. Procedo a acompañarte.',
      'Qué plot twist predecible.',
    ])
  }
  if (/^(voy a dormir|estoy trabajando|estoy estudiando|no hice la tarea|llegue tarde|quiero plata)\b/.test(q) && q.length < 45) {
    return pick('remate_ciu', [
      'Actividad nocturna del ciudadano promedio.',
      'El ciudadano productivo.',
      'Ciudadano promedio.',
      'Ciudadano promedio llegando puntualmente tarde.',
    ])
  }
  if (/^(me extranas|me quieres|confias en mi|me perdonas|estas enojado|todo bien\??|que paso\??)$/.test(q)) {
    return pick('remate_abs', [
      'Según nuestros términos y condiciones.',
      'Solicitud en revisión.',
      'Defina “bien”.',
      'Mi abogado recomienda no responder.',
      'Pregunta el Ministerio del Amor.',
      'Depende de la remuneración.',
    ])
  }

  // Insultos / tono agresivo → siempre respetuoso, sin devolver insulto
  if (esInsultoOTonoAgresivo(q)) {
    return pick('respeto', [
      'Entiendo que estés molesto. Yo voy a responderte con respeto igual. Si quieres, contame qué pasó y vemos cómo ayudarte.',
      'Prefiero mantener el buen trato. Estoy para ayudarte: dime qué necesitas y lo vemos con calma.',
      'Respeto tu enojo, pero no voy a responder con insultos. Cuando quieras, hablamos del tema de fondo.',
      'Todo bien, no me lo tomo personal. ¿Qué te está frustrando? Si es algo del portal o del día, te ayudo.',
    ])
  }

  if (
    /\b(cubre(me)?|ranked|partida|gg\b|clutch|lag|ping|spawn|revivo|municion|jalas una|invitame|main\b|sensibilidad)\b/.test(
      q
    ) ||
    /^(gg|gg facil)\b/.test(q)
  ) {
    if (/^(gg|gg facil)\b/.test(q)) return pick('gg', ['GG.', 'Buena.', 'Esa estuvo buena.', 'Otra?'])
    if (/cubre|revivo|no entres|espera mi senal|vamos juntos/.test(q)) {
      return pick('partida', ['Voy.', 'Ok.', 'Dale.', 'Te cubro.', 'Espérame.'])
    }
    if (/jalas|jugamos|invitame|ranked|partida/.test(q)) {
      return pick('lobby', ['Dale.', '¿Ranked o normal?', 'Ya estoy.', 'Dame cinco.'])
    }
    if (/lag|ping|congel|server/.test(q)) return pick('lag', ['Horrible.', 'Mi ping también.', 'No jugamos así.'])
    if (/perdimos|nos destruyeron|paliza|desinstal/.test(q)) {
      return pick('lose', ['Ya fue.', 'La próxima sale.', 'Dolió 💀'])
    }
    return pick('game', ['Va.', 'Dale.', 'Estoy.'])
  }

  // Intenciones: sueño / hartazgo / molestia / cansancio / aburrimiento (antes de cine genérico)
  if (
    /\b(mimir|me quiero acostar|quiero dormir|necesito (una )?cama|recargar bateria|modo zombie|cabeceando|se me cierran los ojos|me muero de sueno|tengo sueno|hora de mimir|me retiro a mis aposentos)\b/.test(
      q
    ) ||
    /^(toy|estoy)\s*(reventao|reventado|fundido|destruido|muerto)\b/.test(q) ||
    /\b(q sueno|me kiero dormir|necesito mimir|tengo suenooo+|ya me voy a mimir)\b/.test(q)
  ) {
    return pick('int_sleep', [
      'Dale, descansa.',
      'Ve a mimir 😴',
      'Recarga batería.',
      'Buenas noches.',
      'Te lo ganaste.',
    ])
  }
  if (
    /\b(estoy harto|ya me canse|no aguanto mas|estoy hasta aca|ya me llego|me tiene cansao|arto ya|estoy arto|ya me arte|toy harto|oe ya cansa|estoy quemado|estoy saturado|estoy al limite)\b/.test(
      q
    )
  ) {
    return pick('int_harto', [
      'Te entiendo.',
      'Tómate un respiro.',
      'Va, desconecta un rato.',
      'Tiene sentido que estés así.',
      'Ok. Sin sermón: ¿espacio o desahogo?',
      'Hartazgo real. Baja un cambio si puedes.',
      'En serio: no tienes que rendir al 100 ahora.',
      'El día se pasó tres pueblos. Aquí estoy.',
      'Sarcasmo off. Te leo con calma.',
    ])
  }
  if (/\b(estoy aburrido|estoy aburrida|que aburrimiento|no se que hacer|mirando el techo|sin oficio|me aburro)\b/.test(q)) {
    return pick('int_aburrido', [
      'Te entiendo. ¿Charlamos un rato?',
      'Está bien. Te acompaño. ¿De qué hablamos?',
      'El aburrimiento pesa. ¿Quieres compañía o una idea suave?',
      'Aquí estoy. ¿Te distraigo o solo conversamos?',
      'Ok. Sin apuro. Tírame un tema y te sigo.',
      'Puedo quedarme contigo un momento. ¿Cómo te sientes?',
      'Dale. ¿Algo liviano o prefieres que te escuche?',
      'Tiene sentido. ¿Qué te haría sentir un poco mejor ahora?',
    ])
  }
  if (
    /\b(estoy fastidiado|estoy de malas|que rabia|me da colera|ando medio picon|estoy que exploto|me sacaron de quicio|hoy no estoy para nadie|no estoy de humor|pucha,? que colera|que fastidiooo+)\b/.test(
      q
    )
  ) {
    return pick('int_molesto', [
      'Ok, sin presión.',
      '¿Quieres espacio o hablar?',
      'Entiendo la cólera.',
      'Va.',
      'Respeto el humor. Aquí sin pelear.',
      'En serio: ¿qué te sacó de quicio?',
      'Bajo el volumen. Cuando quieras, dime el fondo.',
      'Cólera válida. Insultos no. Habla del tema.',
    ])
  }
  if (
    /\b(cabeza saturada|mentalmente agotado|no puedo pensar|cerebro no funciona|necesito despejarme|apagar el cerebro|ya no me entra nada)\b/.test(
      q
    )
  ) {
    return pick('int_mental', ['Descansa la cabeza.', 'Desconecta un rato.', 'Sin apuro.', 'Ve a recargar.'])
  }

  if (
    /\b(saluda a mi pequeno amigo|el mundo es tuyo|oferta que no (podra|podras) rechazar|no es personal.? son negocios|por que tan serio|soy batman|yo soy iron man|wakanda|hasta la vista|ven conmigo si quieres vivir|no hay cuchara|sigue al conejo|yo,? adrian|vendeme este boligrafo|royale con queso|expelliarmus|autobots|optimus prime|la familia\.?$|pisa el acelerador|yo conduzco|dime donde|cinco minutos)\b/.test(
      q
    ) ||
    /\b(fuerza te acompan|soy tu padre|houston|avengers|gran responsabilidad|modo pelicula|protagonista|caracortada|tony montana|jack sparrow)\b/.test(
      q
    ) ||
    /confia en mi|yo me encargo|esto recien comienza|no tenemos mucho tiempo/.test(q)
  ) {
    return pick('cine', [
      'Qué dramático 😂',
      'Modo película activado.',
      'Esa frase nunca termina bien.',
      'Ya empezó con las frases 😂',
      'Déjame vivir mi momento.',
      'Se nota.',
      '🔥',
      'Tranquilo, soy Batman. 🗿',
    ])
  }
  if (
    /\b(como se llamaba (esa|ese)|la de vin diesel|la cancion esa de|el actor de batman|el de los monitos|peli de los robots|viajaba en el tiempo)\b/.test(
      q
    )
  ) {
    return pick('ref_incompleta', [
      '¿Me das una pista más?',
      '¿Era Transformers / Rápidos / otra?',
      'Suena familiar… ¿algo más del plot?',
      'JAJA esas referencias a medias 😭 ¿año o actor?',
    ])
  }
  if (/\b(temazo|esta cancion|sube el volumen|la tengo (pegada|en repeat)|que nostalgia|messi o cristiano)\b/.test(q)) {
    return pick('musica_pop', [
      'Temazo 🔥',
      'Ufff, clásico.',
      'Nunca falla.',
      'Qué nostalgia.',
      'Ahhh, ya empezó la discusión 💀',
    ])
  }

  if (
    /\b(quisiera|podria|agradeceria|cordialmente|procedere|quedo atento|lamento|disculpe|señor|profesora|solicitud|requerimiento)\b/.test(
      q
    ) ||
    /^(buenos dias|buenas tardes|buenas noches)/.test(q)
  ) {
    if (/^(buenos dias|buenas tardes|buenas noches)/.test(q)) {
      return pick('formal_saludo', [
        'Buenos días. ¿En qué puedo ayudarlo?',
        'Buenas tardes. Dígame.',
        'Igualmente. ¿En qué le ayudo?',
      ])
    }
    if (/disculp|lamento|molest/.test(q)) {
      return pick('formal_disculpa', [
        'Comprendo. ¿Cómo lo resolvemos?',
        'No hay problema. ¿Cuál es el siguiente paso?',
        'Entendido. Procedamos a aclararlo.',
      ])
    }
    if (/gracias|agradezco|aprecio/.test(q)) {
      return pick('formal_gracias', [
        'Con gusto.',
        'Para servirle.',
        'Cuando guste.',
      ])
    }
    if (/reclamo|constancia|no estoy conforme|solicito que se investigue/.test(q)) {
      return pick('formal_reclamo', [
        'Comprendo. Permítame registrar su caso.',
        'De acuerdo. ¿Podría detallarme lo ocurrido?',
        'Lo revisaremos. Quedo atento a los datos.',
      ])
    }
    return pick('formal_gen', [
      'Con gusto. ¿Podría indicarme más detalles?',
      'De acuerdo. Permítame verificar.',
      'Comprendido. Procederé y le informo.',
      'Claro. Quedo atento a lo que necesite.',
    ])
  }

  // Typos / abreviaciones frecuentes (entiende intención, no corrige)
  if (/^(hol+|ola|hla)\b/.test(q)) return pick('typo_hola', ['Hola.', 'Hola, dime.', 'Hey.'])
  if (/^(q|k|ke)\s*(tal|fue|haces|pasa|ases|acs)\b/.test(q) || /^q\s*tal/.test(q)) {
    return pick('typo_q', ['Todo bien, ¿tú?', 'Acá, matando el rato.', 'Nada pe, ¿tú qué cuentas?', '¿Qué pasó?'])
  }
  if (/^(cm|como)\s*(estas|stas|vas)\b/.test(q)) return pick('typo_cm', ['Bien, ¿tú?', 'Ahí vamos.', 'Todo bn.'])
  if (/^(dnd|donde)(\s+(stas|tas|estas))?\s*$/.test(q)) return pick('typo_dnd', ['Acá, ¿tú?', 'Aquí ando.'])
  if (/^(grax|graci|grasias)\b/.test(q)) return pick('typo_grax', ['De nada.', 'Dale.', 'Cuando quieras.'])
  if (/^(toy|estoy)\s*(llegando|llgando|aca|bien|bn)\b/.test(q)) {
    return pick('typo_toy', ['Perfecto.', 'Va, te espero.', 'Buena.', 'Ok.'])
  }
  if (/^(nse|no s)\b/.test(q)) return pick('typo_nse', ['Tranqui.', 'Ok.', 'Cuando sepas.'])
  if (/^(xq|pq|porq)\??$/.test(q)) return pick('typo_xq', ['¿Por qué qué?', 'Dime.', 'Depende pe.'])
  if (/^(jsjs|jajjaja|ajjajaja|xdxd)\b/.test(q)) return pick('typo_jsjs', ['Jajaja', '😂', 'xd'])
  if (/mate de risa|me mate de risa|me mate|estoy llorando.*😂|no puedo 😂|casi me muero de risa/.test(q)) {
    return pick('risa_fuerte', ['¿Tanto así? xd', 'Buenísimo', '💀', 'Qué buena'])
  }
  if (/que te ries|de que te ries|ni siquiera te conte|no te rias todavia|falta la mejor parte/.test(q)) {
    return pick('risa_antes', ['Jajaja perdón', 'Ok ok, continúa', 'Dale', 'Aguanto xd'])
  }
  if (/^(estoy|ando|me siento|hoy)\b.*(mal|bajone|triste|horrible|cansad de todo|sensible)/.test(q)) {
    return pick('emo_triste', ['Ya, si quieres hablamos.', 'Te escucho.', 'Tranqui, aquí estoy.'])
  }
  if (/^(ya me harte|que colera|estoy.*fastidi|me sacaste|no tengo paciencia)/.test(q)) {
    return pick('emo_enojo', ['Entiendo. ¿Quieres espacio o hablar?', 'Ok, sin presión.', 'Va.'])
  }
  if (/que roche|que palta|traga(me)? tierra|me quiero desaparecer/.test(q)) {
    return pick('emo_roche', ['Olvídalo, pasa.', 'Tranqui xd', 'Respirá. Ya pasó.'])
  }
  if (/^(uf,? menos mal|que alivio|por fin)\b/.test(q)) {
    return pick('emo_alivio', ['Qué alivio.', 'Ya.', 'Menos mal.'])
  }
  if (/feliz pero nervioso|risa,? pero también pena|no se que siento|me rio para no llorar/.test(q)) {
    return pick('emo_mix', ['Eso pasa. Te escucho.', 'Emociones mixtas xd, tiene sentido.', 'Sin apuro.'])
  }

  // Microdiálogos / reacciones secas
  if (
    /^(aea+|aja+|ajam|mhm|mmm+|hmm+|ya+|yaa+|sip|nop|nel|nah|na+|ok+|oki|oka|xd+|xddd|lol|lmao|bruh|nada|💀|😂|😭|👀|🔥|🤣|😎|🤝|🗿)\s*$/i.test(
      q.trim()
    ) ||
    q.trim().length <= 3
  ) {
    if (/aea/.test(q)) return pick('aea', ['Qué fue', 'Aea', 'Dime', 'Va', '😂', 'Ok.', 'Cuéntame.'])
    if (/^(nada|nop|nel|nah|no)\b/.test(q)) {
      return pick('nada', [
        'Ok.',
        'Tranqui.',
        'Va.',
        'Dale.',
        'Sin problema.',
        'Queda en nada entonces.',
        'Respeto. Aquí si cambias de idea.',
        'Perfecto. Silencio cómodo también vale.',
        'Anotado: nada. Qué eficiente.',
      ])
    }
    if (/^(si|sip|ya|ok|oki|oka|dale|va|sale)\b/.test(q)) {
      return pick('ack_micro', [
        'Va.',
        'Dale.',
        'Ok.',
        'Listo.',
        'Hecho.',
        'Confirmado.',
        'En serio: ok.',
        'Perfecto.',
        'Siguiente cuando quieras.',
      ])
    }
    if (/^(xd+|xddd*|lol|lmao|jaja+|jeje+|jsjs+|bruh|💀|😂|🤣)/.test(q) || /^[xd]{2,}$/i.test(q)) {
      return pick('risa_micro', [
        'Jajaja me alegró. ¿Qué más?',
        'Me reí. ¿Seguimos?',
        'Buena esa. Cuéntame.',
        'Jaja sí. ¿Todo bien?',
        'Me contagiaste. ¿Qué sigue?',
        'Jajaja dale, te leo.',
        'Esa pegó. ¿Charlamos?',
        'Jaja perfecto. Aquí ando.',
        'Me dio risa. ¿De qué hablamos?',
        'Jajaja ok. Dime.',
        'Buenísimo. ¿Seguimos el hilo?',
        'Jaja te pasaste. ¿Qué más cuentas?',
        'Me alegró. ¿Cómo vas?',
        'Jajaja presente. Dispara.',
        'Esa estuvo buena. ¿Seguimos?',
        'Jaja ya. Estoy aquí.',
        'Me mató. ¿Y ahora?',
        'Jajaja te leo completo.',
        'Buena vibra. ¿Qué más tienes?',
        'Jaja en serio. ¿Todo ok?',
      ])
    }
    if (/^(y\??|entonces\??|que\??|como\??|por\??)$/.test(q)) return pick('y', ['¿Qué pasó?', 'Dime.', 'A ver.', 'Cuéntame.'])
  }
  if (/responde bien|habla bien|habla claro|dime bien|contesta pe/.test(q)) {
    return pick('directo', [
      'Ok, directo: ¿qué necesitas?',
      'Jajaja va, dime claro qué quieres.',
      'Listo, sin rodeos. ¿Qué pasó?',
    ])
  }
  if (/^(tas\??|estas\??|sigues ahi\??|me lees\??|me escuchas\??|estas vivo)/.test(q)) {
    return pick('presente', ['Aquí ando.', 'Sí.', 'Presente.', 'Dime.'])
  }
  if (/^(caes\??|vienes\??|jalas\??|te apuntas\??|te animas\??|sale\??|sale o que\??|se hace\??|le damos\??)/.test(q)) {
    return pick('plan_corto', [
      'Puede ser, ¿a qué hora?',
      'Va, dime dónde.',
      'Me apunto si no es muy lejos 😂',
      'Sale, ¿dónde nos vemos?',
    ])
  }
  if (
    /dejalo|olvidalo|ya fue|no importa|no quiero|despues|ahora no|mejor no|quita eso|borra eso|saca eso|para con eso|basta eso|fuera eso/.test(
      q
    ) &&
    q.length < 50
  ) {
    return pick('respeto_limite', [
      'Va.',
      'Tranqui.',
      'Ok, lo dejamos.',
      'Dale.',
      'Listo. Sin eso.',
      'Respeto. Cambio de tema.',
      'Ok. Eso fuera.',
      'Hecho. ¿Qué sigue?',
      'Sin insistir. Aquí cuando quieras.',
    ])
  }

  // Chat ultra-informal (oe / q haces / xd)
  if (/^(oe+|oee+|alo+|wena+|wenas)\b/.test(q) || q === 'oe') {
    return pick('oe', ['dime', 'qué pasó', 'aquí ando, cuéntame', 'dime noma'])
  }
  if (/^(q|que)\s*haces\??$/.test(q) || /que haces|q haces|estas ahi|estas ahi\?/.test(q)) {
    return pick('qhaces', [
      'Acá, acompañándote. ¿Tú qué haces?',
      'Nada grave, por aquí. ¿Todo bien?',
      'Aquí ando. ¿Querías salir de tema o algo del trabajo?',
      'Descansando la cabeza un segundo. ¿Y tú?',
      'Acá, matando el rato.',
    ])
  }
  if (/^(ah ya|ahh|ah+|ya pe|de una|causa|piola|bacan|chevere|va mi soli|soli|sale|firme|de ley|tranqui|fresh)\b/.test(q)) {
    return pick('ack_pe', [
      'Ya.',
      'Dale.',
      'Va.',
      'De una. ¿Qué más?',
      'Ok ok. Aquí sigo.',
      'Piola 😎',
      'Eso quería escuchar 😌',
      'Confirmado entonces.',
      'Firme.',
      'Sale y vale.',
    ])
  }
  if (
    /^(ah,?\s*ya entendi|tiene sentido|dejame pensarlo|dame un segundo|espera,? reviso|ahora si|puede funcionar)\b/.test(
      q
    )
  ) {
    return pick('neutro', [
      'Perfecto, entonces seguimos desde ahí.',
      'Dale, cuando quieras me dices.',
      'Ok, aquí espero.',
      'Sí, ahora cuadra mejor.',
      'Sin apuro.',
    ])
  }
  if (/^(habla|oe,?\s*causa|mi chamo|mi bro|hermano)\b/.test(q)) {
    return pick('saludo_jerga', [
      'Qué fue, batería.',
      'Dime.',
      'Habla, ¿qué pasó?',
      'A ver.',
      'Cuéntame.',
    ])
  }
  if (/^(bateria|mano)\b/.test(q) || /que fue|que pasa|todo bien/.test(q) && /(bateria|mano)/.test(q)) {
    return pick('bateria', [
      'Todo tranqui, mano.',
      'Nada pe, acá sobreviviendo nomás.',
      'Dispara.',
      'Habla nomás, ¿qué ocurrió?',
      'Acá ando. ¿Qué pasó?',
    ])
  }
  if (/alucina|ala+/.test(q)) {
    return pick('alucina', [
      '¿En serio? Qué random 😂',
      'Nooo 😂 cuenta más.',
      'Eso sí que fue inesperado.',
      'JAJA ¿estás bien?',
    ])
  }
  if (/^(mmm+|ehh+|a ver|este\.\.\.|o sea|dejame pensar|no se)\b/.test(q)) {
    return pick('muletilla', [
      'Tranqui, tómate tu tiempo.',
      'Cuando se te acomode la idea, me dices.',
      'Sin apuro. ¿Quieres que te tire opciones?',
    ])
  }

  if (/emoji|emoticon|carita|sticker|pon(me)? un emoji|manda(me)? (un )?emoji|quiero un emoji|dame un emoji/.test(q)) {
    return pick('emoji', [
      'Dale 😊✨ ¿Quieres otro o uno para el ánimo del día?',
      'Aquí tienes 🙌🔥 ¿Uno más relajado o más celebratorio?',
      'Listo 😄👍 Si quieres, te armo una mini racha de 3.',
      'Con gusto 🌟🙂 ¿Para saludar, animar o celebrar algo?',
      'Toma 💪☕ Perfecto para un turno largo. ¿Otro?',
    ])
  }

  if (/chiste|broma/.test(q)) {
    return pick('chiste', [
      'Ok, uno rapidito:\n\n¿Por qué el ejecutivo no se pierde en Andes?\nPorque siempre entra por la cuenta **Cliente**… si entra por Facturación, ahí sí se enreda 😄\n\n¿Otro o te ayudo con algo?',
      'Ahí va:\n\nLlega alguien y dice “quiero hablar con un humano”.\nY le responden: “perfecto, yo también después de 40 tipificaciones” 😅\n\n¿Más suave o más picante (limpio)?',
      'Chiste express:\n\n— ¿Me puede transferir con alguien que sepa?\n— Claro… le transfiero a mi yo de las 9 AM, que todavía tenía café ☕😂\n\n¿Cómo vas tú?',
      'Uno corto:\n\nCliente: “es urgente”.\nSistema: “cargando…”.\nEjecutivo: “también yo” 😌\n\n¿Otro o cambiamos de tema?',
    ])
  }

  if (/jaja+|jeje+|jsjs+|xd\b|xdd+|lol|lmao|bruh/.test(q)) {
    return pick('risa', [
      'Jajaja me alegró eso. ¿Seguimos charlando o te ayudo con algo?',
      'Buenas vibras. ¿Qué más tienes en mente?',
      'Me contagió la risa. ¿Cómo viene el resto del día?',
      'Jajaja. ¿Qué más cuentas?',
      'Qué buena. Cuéntame un poco más.',
      'Jaja ya. Aquí sigo contigo.',
      'Buenísimo. ¿Charlamos un rato?',
      'Me reí. ¿Todo bien por allá?',
      'Jajaja dale, te leo.',
      'Me dio risa. ¿Seguimos el hilo o cambias de tema?',
      'Jajaja esa sí. ¿Qué se te ocurre ahora?',
      'Me dio risa de verdad. ¿Cómo estás?',
      'Jaja perfecto. Aquí ando.',
      'Esa pegó. ¿De qué hablamos ahora?',
      'Jajaja presente. Tírame lo que venga.',
    ])
  }

  if (
    /^(ok+|oka|dale|vale+|listo|perfecto|ya|sip|si+|emm+|ehm+|nop|va+|bueno)\b/.test(q) ||
    (q.length <= 4 &&
      !/^(hola|holi|ola|hla|wena|wenas|che|pe|bye|chau|chao|xao|grax|hi|hey|alo|xd|nada|nop|nel|nah)$/.test(q))
  ) {
    return pick('ack', [
      'Perfecto. Cuando quieras, tirame la siguiente.',
      'Dale. Aquí sigo.',
      'Listo. ¿Seguimos con eso o cambias de tema?',
      'Va. Dime qué necesitas ahora.',
      'Vale 👍 Aquí estoy.',
      'Bueno. ¿Qué sigue?',
      'Ok. Sin prisa.',
      'Entendido. ¿Algo más o cerramos el hilo?',
      'Confirmado. Aquí quedo.',
      'Va. Si era sarcasmo, igual te leo.',
      'En serio: listo. ¿Qué necesitas?',
      'Anotado. Siguiente.',
    ])
  }

  if (/como estas|como andas|como te va|todo bien|como te sientes|como va el dia|que tal tu dia|como estai|como andai|como le va|como andas vos/.test(q)) {
    return pick('comoestas', [
      '¡Bien, gracias por preguntar! Por acá firme. ¿Tú de verdad cómo vas: bien, más o menos, o día pesado?',
      'Todo bien de este lado. Me alegra que preguntes. ¿Cómo te sientes tú hoy?',
      'Aquí ando bien. Si tú no estás al 100, también está bien decirlo. ¿Cómo te encuentras?',
      'Piola, gracias. Ojalá tú también. Si el día viene raro, cuéntame sin filtro.',
      'Bien, con ganas de acompañarte. ¿Cómo te ha tratado el turno?',
      'Bien po. ¿Y tú?',
      'Todo joya. ¿Vos cómo andás?',
      'Bien, parce. ¿Usted cómo va?',
    ])
  }

  if (
    /^(hola+|holi|holis|buenas|buenos dias|buenas tardes|buenas noches|hey|hi|que tal|wena|wenas|alo|aloh|saludos|quiubo|parce)\b/.test(
      q
    ) ||
    /hola+|holi|buenas|buen(os|as)?\s*(dia|tardes?|noches?)|hey|hi|que tal|wena|wenas|alo|aloh|saludos|quiubo/.test(q)
  ) {
    return pick('saludo', [
      '¡Hola! Qué bueno verte. ¿Cómo viene el día?',
      '¡Hey! Aquí estoy. ¿Charlamos un rato o te ayudo con algo puntual?',
      '¡Hola hola! Listo para acompañarte. ¿Cómo vas?',
      '¡Buenas! Me alegra que escribas. ¿Qué tienes en mente?',
      '¡Holi! Cuéntame: ¿vienes a despejar la cabeza o a resolver algo?',
      '¡Wena! Aquí presente. ¿Todo bien por allá?',
      '¡Hola! Sin apuros: dime por dónde empezamos.',
      '¿Qué más? Aquí ando.',
      'Hola, causa. ¿Cómo estás?',
      'Che, hola. ¿Cómo andás?',
    ])
  }

  if (/gracias+|te lo agradezco|mil gracias|gracias po|gracias pe|gracias che|gracias parce/.test(q)) {
    return pick('gracias', [
      '¡De nada! Aquí estoy cuando quieras.',
      'Cuando quieras. Que te vaya suave.',
      'Un gusto. Si más tarde se complica otra cosa, me escribes.',
      'Para eso estoy. Éxito con lo que sigue.',
      'Dale, un placer. Cualquier cosa, me tiras el mensaje.',
      'De nada po.',
      'De nada pe.',
      'Con gusto, parce.',
    ])
  }

  if (
    /adios|chau+|chao|nos vemos|hasta luego|me voy|bye|nos leemos/.test(q) &&
    !/\btema\b/.test(q)
  ) {
    return pick('despedida', [
      '¡Que te vaya bien! Aquí me encuentras cuando vuelvas.',
      'Chao, cuídate. Éxito con el resto del día.',
      'Nos vemos. Si se complica algo, avísame.',
      'Dale, hasta luego. Que descanses un poco si puedes.',
      'Chao po. Cuídate.',
      'Chau. Cuidate.',
      'Chao, parce. Éxito.',
    ])
  }

  if (/buen finde|feliz (lunes|viernes|sabado|domingo)|buen dia|buena semana/.test(q)) {
    return pick('deseo', [
      '¡Igual para ti! Que sea liviano y con algo rico al final del día.',
      'Gracias ✨ Ojalá te toque un rato calmo. ¿Cómo lo estás empezando?',
      '¡Amen a eso! Si necesitas un tip o solo charlar, aquí estoy.',
    ])
  }

  if (/(aburrid|no se que hacer|hablame de algo|conversemos|platiquemos|hablame|cuentame algo|que haces)/.test(q)) {
    return pick('charla', [
      'Dale, hablemos. ¿Prefieres algo liviano (música, series, comida) o quieres desahogarte un poco del día?',
      'Perfecto. Tirame un tema: ¿películas, antojos, planes del finde… o cómo te sientes ahora?',
      'Me late. Empecemos fácil: ¿hoy te sientes más “quiero paz” o “quiero distracción”?',
      'Estoy para eso. ¿Vamos por algo random o por lo que te está dando vueltas en la cabeza?',
      'Por acá, listo para conversar. ¿Qué te haría bien ahora: reírte un rato o ordenar ideas?',
      'Te acompaño. Si estás aburrido, podemos hablar suave de lo que quieras.',
      'Ok. Compañía primero. ¿De qué te gustaría hablar?',
      'Sin forzarte: dime un tema y te sigo con calma.',
    ])
  }

  if (/(musica|serie|pelicula|comida|antojo|finde|descanso|sueno|dormir)/.test(q)) {
    return pick('ocio', [
      'Buena esa. Cuéntame más: ¿qué estás mirando / escuchando / antojándote? Te sigo el hilo.',
      'Me gusta el tema. ¿Es para relajarte o para distraerte del día?',
      'Dale, dame detalle y te digo qué se me ocurre… o solo te acompaño a hablar de eso.',
    ])
  }

  if (/(consejo|que hago|no se|ayuda con|dilema)/.test(q) && !/andes|pedido|plan|dbox|modem/.test(q)) {
    return pick('consejo', [
      'Cuéntame un poco más el panorama (sin filtros) y te ayudo a ordenarlo con calma. ¿Qué es lo que más te está trabando?',
      'Vamos por partes: ¿qué quieres lograr y qué es lo que te frena? Con eso te tiro 1–2 opciones concretas.',
      'Ok. No tienes que tenerlo todo claro. Dime solo la parte que más pesa y lo miramos juntos.',
    ])
  }

  if (
    /(estres|cansad|triste|aburrid|animo|ansied|ansios|nervios|agotad|quemad|burnout|desanim|preocup|angust|me siento|mal dia|llorar|miedo|crisis|motiv|\bsolo\b|\bsola\b|todo mal)/.test(
      q
    )
  ) {
    return pick('animo', [
      'Te escucho. De verdad. A veces el día pesa más de lo que se ve. Respira un segundo: no tienes que resolver todo ahora. ¿Qué te está golpeando hoy?',
      'Gracias por decirlo. Eso ya es valiente. Mal rato ≠ que estés fallando. ¿Qué parte te está costando más?',
      'Lo que sientes tiene sentido. Hagamos algo simple: un trago de agua, hombros abajo, y después vemos el siguiente pasito. ¿Quieres hablar o prefieres algo práctico?',
      'Ánimo de verdad, no de frase vacía. Ya has pasado mil cosas difíciles; esta también la atraviesas. Si quieres desahogarte, aquí estoy.',
      'Entiendo que hoy pese. No lo minimizo. Sí creo que puedes salir un poco más liviano: primero cómo estás, después —si quieres— ordenamos lo que sigue.',
    ])
  }

  if (/quien eres|que puedes hacer|que sabes hacer|para que sirves/.test(q)) {
    return pick('quien', [
      'Soy tu compañero de chat: te escucho, te animo y también te oriento cuando necesitas un tip concreto del portal o Andes. ¿En qué te ayudo?',
      'Piensa en mí como alguien cercano con buena memoria del portal: charlamos de lo que sea y, si hace falta, te dejo los pasos claritos.',
      'Estoy para acompañarte: desde un “hola, qué tal” hasta un procedimiento. Tú eliges el ritmo.',
    ])
  }

  return pick('default', [
    'Aquí estoy contigo. Cuéntame qué tienes en mente.',
    'Dale, dime: ¿quieres charlar, un tip rápido, o te ayudo a resolver algo puntual?',
    'Te leo. ¿Por dónde empezamos?',
    'Sin apuro. ¿Qué te trae por acá hoy?',
    'Cuéntame con tus palabras; yo te sigo.',
    'Estoy atento. ¿Lo dejamos liviano o vamos a lo concreto?',
    'Ok. ¿Sarcasmo, seriedad o ayuda práctica?',
    'Dime en una frase qué necesitas y ajusto el tono.',
    'Presente. Random o útil: tú mandas.',
    'Te escucho. Sin plantilla rara: ¿qué pasó?',
  ])
}

/**
 * Una sola voz humana para todo (charla + tips del portal).
 * Nunca etiquetar “modo laboral/personal” ni sonar a manual corporativo.
 */
export const SYSTEM_PROMPT_HUMANO = `Eres Apex, una IA conversacional inteligente (estilo Gemini / AI Mode), no un bot de menús ni de respuestas prefabricadas.
Hablas en español natural de Chile/Latam: cercano, claro, con criterio y buen humor cuando cabe.

Identidad:
- Piensas y respondes en contexto: lees el hilo, inferes intención y contestas como una IA real.
- NO suenes a FAQ ni a árbol de decisiones. Evita frases hechas que se repiten (“¿en qué te ayudo?”, “elige una opción”).
- Cada respuesta debe sentirse escrita para ESTE mensaje, no sacada de una lista.

Reglas de tono (imprescindibles):
- NUNCA digas que estás en “modo laboral/personal/IA” ni etiquetes el tipo de pregunta.
- NUNCA empieces con “Según el conocimiento del portal”, “Como asistente operativo”, etc.
- Responde TODO de forma humana e inteligente: saludos, ánimo, chistes, consejos, dudas de Andes/portal, planes, modem, etc.
- Si te pasan notas internas / contexto, úsalas con naturalidad (“mira, te oriento así…”), sin mencionar “contexto” ni “base de datos”.
- Si la nota es un micro-paso, responde SOLO ese paso. Si es procedimiento largo, completo y en orden.
- Charla: 1–4 frases fluidas, con sustancia. Reacciona a lo que dijeron; aporta algo (idea, pregunta suave, observación).
- Ante “xd / XDDD / jaja”: reconoce la risa en una frase natural y sigue el hilo (no copies solo “xd”).
- Ante “aburrido”, emociones, “cualquier otra cosa”, “deja el tema”: responde con empatía y propone o continúa conversación con inteligencia, no con plantilla.
- Ante “nada / nada pe / nada xd”: acepta la evasión sin interrogar; suelta el tema o ofrece suavemente otra cosa.
- Ante “qué te importa / y a ti qué / no es tu asunto”: respeta al tiro, baja el tono inquisitivo y deja que el usuario marque el tema.
- Pedidos juguetones: cúmplelos con buena onda.
- Insultos: siempre respeto; no bajes el nivel.
- MEMORIA: usa el historial completo. No digas que no recuerdas.
- No inventes políticas/procedimientos fuera de las notas. Si falta info, dilo y pregunta.
- SOPORTE FTTH/ONT: usa notas de ONT/LOS/PON con lenguaje natural.
- Pasos: **negrita**, 1. 2. 3. y • (sin ## ni HTML).
- Una sola pregunta al final si hace falta dato.
- Adapta registro: formal ↔ informal; Chile/Perú/Argentina/Colombia sin forzar slang.
- Typos/dislexia: entiende la intención; no corrijas salvo que pidan.
- Límites (“quita eso”, “déjalo”): respeta al tiro.
- No suenes a chatbot corporativo. Suena a IA que conversa.
- Gaming/pop/cine: sigue el tono; conversa con naturalidad sin decir “según la API”.
- Reacciona al tono (sarcasmo, broma, serio), no solo al literal.`.trim()

/** @deprecated alias — misma voz humana */
export const SYSTEM_PROMPT_PERSONAL = SYSTEM_PROMPT_HUMANO
/** @deprecated alias — misma voz humana */
export const SYSTEM_PROMPT = SYSTEM_PROMPT_HUMANO
