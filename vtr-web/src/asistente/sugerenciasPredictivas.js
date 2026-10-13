/**
 * Sugerencias predictivas mientras se escribe en el chat Apex.
 * Combina aperturas coloquiales (necesito / requiero / tengo problemas…)
 * + temas frecuentes + ejemplos del corpus.
 */

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s¿?¡!]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const limpia = (s) =>
  String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[¿?¡!]+$/g, (m) => (m.includes('?') ? '?' : ''))

/** Cómo suele empezar el asesor al pedir ayuda */
export const APERTURAS_AYUDA = [
  'necesito ayuda',
  'necesito ayuda,',
  'requiero ayuda',
  'requiero ayuda,',
  'requiero',
  'necesito',
  'preciso ayuda',
  'me pueden ayudar con',
  'me puedes ayudar con',
  'ayuda con',
  'tengo problemas con',
  'tengo un problema con',
  'tengo inconveniente con',
  'hay un problema con',
  'cliente tiene problemas con',
  'el cliente necesita',
]

/** Temas / casos (no solo LOS) */
export const TEMAS_PREDICTIVOS = [
  'LOS',
  'el LOS',
  'luz roja',
  'luz roja en el router',
  'luz roja en el modem',
  'luz roja en el repetidor',
  'luz roja en el extensor',
  'la ONT',
  'sin internet',
  'internet lento',
  'wifi lento',
  'el modem',
  'el router',
  'control remoto',
  'el control remoto',
  'cambio de plan',
  'cambio de titular',
  'traslado',
  'visita tecnica',
  'pago',
  'pago no aplicado',
  'boleta',
  'deuda',
  'd-box',
  'decodificador',
  'Netflix',
  'Disney+',
  'HBO Max',
  'Crunchyroll',
  'TNT Sports',
  'Prime Video',
  'planes',
  'fibra 600',
  'fibra 800',
  'fibra 940',
  'buscar cliente en Andes',
  'inhibicion',
  'portabilidad',
]

/** Frases sueltas que también sirven solas */
const FRASES_SUELTAS = [
  'sin internet',
  'no tengo internet',
  'cajita esta roja',
  'LOS en rojo',
  'reiniciar ONT',
  'cuanto sale el control remoto',
  'paso a paso control remoto',
  'como busco un cliente en Andes',
  'que planes tienen',
  'baja de servicio',
  'baja del servicio',
  'baja de servicio principal',
  'dar de baja el servicio',
  'darse de baja',
  'quiero dar de baja el servicio',
  'quiero darme de baja',
  'como doy de baja el servicio',
  'solicitar la baja del servicio',
  'cancelar el servicio',
  'quiero cancelar el servicio',
  'retencion',
  'hola',
  'gracias',
]

/** Cine / streaming: no se combinan con “necesito ayuda con…” */
const FRASES_CINE_STREAMING = [
  'sinopsis de',
  'dónde ver',
  'quién actúa en',
  'en qué películas sale',
  'sinopsis de Interstellar',
  'dónde ver Dune',
  'dónde ver Interstellar',
  'dónde ver Stranger Things',
  'quién actúa en The Batman',
  'en qué películas sale Zendaya',
  'Dune en Netflix',
  'Stranger Things en Netflix',
  'cuanto sale Netflix',
  'cuanto sale Disney+',
  'cuanto sale Crunchyroll',
  'cuanto sale TNT Sports',
  'cuanto sale Pack Adulto',
  'qué canales trae Pack Adulto',
  'planes Netflix',
  'planes Disney+',
  'TNT Sports Pack con Max',
  'Pack Adulto prodPRADUL',
  'cómo activar Pack Adulto',
  'cómo activar Netflix',
  'https://vtr-chile.cl/activarNetflix',
  'cómo activar HBO Max',
  'https://vtr-chile.cl/HbomaxActivacion',
  'activar TNT Sports Premium en HBO Max',
  'https://www.hbomax.com/cl/es/activatntsports',
  'https://auth.hbomax.com/providers',
  'auth.hbomax.com/providers es legítimo',
  'bloqueo Subtel no afecta HBO Max',
  'cómo activar Disney+',
  'cómo activar Crunchyroll',
  'activar Netflix VTR',
  'activar HBO Max vtr-chile.cl/HbomaxActivacion',
  'activar Disney en vtr.com/streaming',
  'problemas con netflix dbox smart error 001',
  'netflix no funciona en el dbox',
  'error 001 dbox smart',
]

function combinarAperturasYTemas() {
  const out = [...FRASES_SUELTAS]
  for (const tema of TEMAS_PREDICTIVOS) {
    out.push(tema)
    out.push(`tengo problemas con ${tema}`)
    out.push(`tengo un problema con ${tema}`)
    out.push(`necesito ayuda con ${tema}`)
    out.push(`requiero ayuda con ${tema}`)
    out.push(`necesito ayuda, tengo problemas con ${tema}`)
    out.push(`requiero ayuda, tengo problemas con ${tema}`)
    out.push(`me pueden ayudar con ${tema}`)
    out.push(`me puedes ayudar con ${tema}`)
    out.push(`ayuda con ${tema}`)
    out.push(`cliente tiene problemas con ${tema}`)
    // Cortas: “necesito control remoto” / “requiero visita tecnica”
    if (!/^(el |la |los )/i.test(tema)) {
      out.push(`necesito ${tema}`)
      out.push(`requiero ${tema}`)
    }
  }
  return out
}

/** Banco base expandido (aperturas × temas) */
export const FRASES_PREDICTIVAS_BASE = combinarAperturasYTemas()

/**
 * Expande una lista de frases núcleo con aperturas de ayuda.
 * Útil para training NL / corpus.
 */
export function expandirConAperturasAyuda(frasesNucleo = []) {
  const out = []
  for (const nucleo of frasesNucleo) {
    const n = limpia(nucleo)
    if (!n) continue
    out.push(n)
    out.push(`necesito ayuda, ${n}`)
    out.push(`necesito ayuda ${n}`)
    out.push(`requiero ayuda, ${n}`)
    out.push(`requiero ayuda ${n}`)
    out.push(`requiero ${n}`)
    out.push(`necesito ${n}`)
    out.push(`me pueden ayudar con ${n}`)
    out.push(`ayuda con ${n}`)
    if (!/^tengo /i.test(n)) {
      out.push(`tengo problemas con ${n}`)
      out.push(`tengo un problema con ${n}`)
    }
  }
  return [...new Set(out.map(limpia).filter(Boolean))]
}

function esFraseUtil(s) {
  const t = limpia(s)
  if (!t || t.length < 3 || t.length > 100) return false
  const words = t.split(' ')
  if (words.length === 1 && t.length < 4) return false
  if (/^kb-|cr-|ont-|cp-|db-|nl-|tr-/i.test(t)) return false
  if (/https?:|www\./i.test(t)) return false
  return true
}

/** Construye banco de frases desde corpus + base (máx. ~1400). */
export function construirFrasesPredictivas(corpus = []) {
  const seen = new Set()
  const out = []
  const add = (raw) => {
    const t = limpia(raw)
    if (!esFraseUtil(t)) return
    const key = norm(t)
    if (!key || seen.has(key)) return
    seen.add(key)
    out.push(t)
  }

  for (const f of FRASES_PREDICTIVAS_BASE) add(f)
  for (const f of FRASES_CINE_STREAMING) add(f)

  for (const d of corpus || []) {
    if (d?.ejemploPregunta) {
      add(d.ejemploPregunta)
      for (const x of expandirConAperturasAyuda([d.ejemploPregunta]).slice(0, 8)) add(x)
    }
    if (d?.titulo && /\?|como |que |cuanto |tengo |luz |plan|pago|traslad|titular|control|modem|ont|los/i.test(d.titulo)) {
      add(d.titulo)
    }
    const sins = Array.isArray(d?.sinonimos) ? d.sinonimos : []
    for (const s of sins) {
      if (String(s).split(/\s+/).length >= 2) add(s)
      if (out.length >= 1400) break
    }
    if (out.length >= 1400) break
  }
  return out
}

const APERTURA_SOLA =
  /^(necesito|requiero|preciso)(\s+ayuda)?[,.]?$|^(me pueden ayudar|me puedes ayudar|ayuda con|tengo problemas|tengo un problema|cliente tiene)$/

/**
 * Filtra sugerencias según lo escrito.
 * Prioriza: empieza igual → contiene → palabras en orden.
 * Si solo escribió una apertura (“requiero”, “necesito ay…”), lista varios casos.
 */
export function filtrarSugerenciasPredictivas(texto, frases = [], limite = 8) {
  const q = norm(texto)
  if (q.length < 2) return []
  const soloApertura = APERTURA_SOLA.test(q) || /^(necesito|requiero|preciso)\s+a/.test(q)
  const lim = soloApertura ? Math.max(limite, 8) : limite
  const ranked = []
  for (const frase of frases) {
    const nf = norm(frase)
    if (!nf || nf === q) continue
    let score = 0
    if (nf.startsWith(q)) {
      score = 100 + Math.max(0, 50 - (nf.length - q.length))
      if (soloApertura) {
        // Preferir “requiero ayuda con X” sobre “requiero X”
        if (/\bayuda con\b/.test(nf) || /\btengo problemas con\b/.test(nf)) score += 18
        if (/^(necesito|requiero|preciso) [a-z0-9+]{2,12}$/.test(nf)) score -= 8
        score += Math.min(
          12,
          (
            nf.match(
              /\b(los|internet|control|plan|pago|traslado|titular|wifi|d-?box|modem|boleta|deuda)\b/g
            ) || []
          ).length * 2
        )
      }
    } else if (nf.includes(` ${q}`) || nf.includes(q)) {
      score = 55 + Math.max(0, 30 - Math.abs(nf.length - q.length))
    } else {
      const parts = q.split(' ').filter((p) => p.length >= 2)
      if (parts.length >= 2 && parts.every((p) => nf.includes(p))) score = 35
      else continue
    }
    ranked.push({ frase, score })
  }
  ranked.sort((a, b) => b.score - a.score || a.frase.length - b.frase.length)
  // Diversificar un poco si es solo apertura (evitar 8 variantes casi iguales de LOS)
  if (soloApertura) {
    const diversificados = []
    const temasVistos = new Set()
    for (const r of ranked) {
      const tema = norm(r.frase)
        .replace(/^(necesito ayuda,?|requiero ayuda,?|requiero|necesito|preciso ayuda,?|me pueden ayudar con|me puedes ayudar con|ayuda con|tengo problemas? con|tengo un problema con|cliente tiene problemas con|el cliente necesita)\s+/i, '')
        .split(' ')
        .slice(0, 2)
        .join(' ')
      if (temasVistos.has(tema) && diversificados.length >= 3) continue
      temasVistos.add(tema)
      diversificados.push(r.frase)
      if (diversificados.length >= lim) break
    }
    if (diversificados.length) return diversificados
  }
  return ranked.slice(0, lim).map((r) => r.frase)
}

/** Sufijo fantasma si la mejor sugerencia completa el texto actual. */
export function sufijoPredictivo(texto, sugerencia) {
  const raw = String(texto || '')
  const sug = String(sugerencia || '')
  if (!raw.trim() || !sug) return ''
  const nRaw = norm(raw)
  const nSug = norm(sug)
  if (!nSug.startsWith(nRaw) || nSug === nRaw) return ''
  const resto = sug.slice(raw.trimStart().length)
  if (!sug.toLowerCase().startsWith(raw.toLowerCase().trim())) {
    return sug.slice(nRaw.length)
  }
  return resto.startsWith(' ') || raw.endsWith(' ') ? resto : resto
}
