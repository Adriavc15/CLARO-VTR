/**
 * Filtro de contenido Somos Clave por marca (Claro / VTR).
 *
 * Los artículos de Somos Clave mezclan tres tipos de contenido:
 *  - compartido  → "Aplica para Clientes Claro y VTR"
 *  - solo Claro  → "Aplica solo para Clientes Claro"
 *  - solo VTR    → "Aplica solo para Clientes VTR"
 *
 * Este módulo deja el contenido de la marca elegida y descarta los bloques
 * exclusivos de la otra, conservando siempre los compartidos.
 */

const RE_CLARO = /\bclaros?\b/
const RE_VTR = /\bvtr\b/
const RE_AMBAS =
  /\b(?:claro\s*(?:y|e|o|\+|\/|,|&)\s*vtr|vtr\s*(?:y|e|o|\+|\/|,|&)\s*claro|ambos|ambas|ambas\s+marcas|todas\s+las\s+marcas)\b/
const RE_EXCLUSIVO =
  /\b(?:solo|exclusivamente|unicamente|exclusiv[oa]s?)\b\s*:?\s*(?:para\s+|de\s+)?:?\s*(?:clientes?|usuarios?)\b\s*(?:de\s+)?(claro|vtr|ambos?)\b/g

/** Palabras admitidas en una etiqueta de marca ("Cliente Claro", "SUCURSAL VIRTUAL VTR"). */
const PALABRAS_ETIQUETA = new Set([
  'cliente', 'clientes', 'usuario', 'usuarios', 'suscriptor', 'suscripcion', 'marca', 'marcas',
  'plan', 'planes', 'proveedor', 'proveedores', 'web', 'pagina', 'aplicacion', 'app', 'sucursal',
  'virtual', 'movil', 'hogar', 'fijo', 'internet', 'tv', 'dbox', 'box', 'solo', 'de', 'la', 'el',
  'los', 'las', 'y', 'o', 'a', 'en', 'para', 'con', 'del', 'n1', 'n2', 'n3', 'ejecutivo',
])

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/&nbsp;/gi, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s:/+&-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function normalizarMarca(marca) {
  const m = norm(marca)
  if (m === 'claro') return 'claro'
  if (m === 'vtr') return 'vtr'
  return ''
}

/** "Cliente Claro" / "SUCURSAL VIRTUAL VTR" → 'claro' | 'vtr' | 'ambos' */
function ambitoEtiqueta(t) {
  if (!t) return null
  const palabras = t.split(' ').filter(Boolean)
  if (!palabras.length || palabras.length > 8) return null
  const marcas = []
  let todoEtiqueta = true
  for (const w of palabras) {
    if (w === 'claro' || w === 'claros') marcas.push('claro')
    else if (w === 'vtr') marcas.push('vtr')
    else if (!PALABRAS_ETIQUETA.has(w)) { todoEtiqueta = false; break }
  }
  if (!todoEtiqueta || !marcas.length) return null
  if (marcas.includes('claro') && marcas.includes('vtr')) return 'ambos'
  return marcas[0]
}

/** "Aplica solo para Clientes Claro" → 'claro' */
function ambitoExclusivo(t) {
  if (!t) return null
  const set = new Set()
  RE_EXCLUSIVO.lastIndex = 0
  let m
  while ((m = RE_EXCLUSIVO.exec(t)) !== null) {
    const desde = m.index
    const hasta = desde + m[0].length
    if (RE_AMBAS.test(t.slice(desde, hasta + 26))) continue
    if (m[1] === 'ambos') { set.clear(); set.add('ambos'); continue }
    set.add(m[1])
  }
  if (!set.size) return null
  if (set.size > 1) return 'ambos'
  return [...set][0]
}

/** Ámbito de un bloque: 'claro' | 'vtr' | 'ambos' | null (neutro / compartido) */
export function ambitoDeMarca(texto) {
  const t = norm(texto)
  if (!t) return null
  return ambitoEtiqueta(t) || ambitoExclusivo(t) || (RE_CLARO.test(t) && RE_VTR.test(t) ? 'ambos' : null)
}

/** Marca de una línea tipo "VTR: https://..." o "Cliente Claro" */
function marcaDeLinea(t) {
  if (!t) return null
  const s = t.replace(/^[\s\-–—•*·]+/, '').trim()
  if (!s) return null
  let m = s.match(/^(?:cliente|clientes|usuario|usuarios|marca|proveedor|plan|web|pagina|aplicacion|sucursal virtual)\s+(?:de\s+)?(claro|vtr)\b\s*[:：\-]\s*(.*)$/)
  if (m) return m[1]
  m = s.match(/^(claro|vtr)\b\s*[:：]\s*(.+)$/)
  if (m) return m[1]
  m = s.match(/^(?:cliente|clientes|usuario|usuarios|marca|proveedor|sucursal virtual)\s+(claro|vtr)\s*$/)
  if (m) return m[1]
  // Marcadores entre paréntesis o al inicio: "NETFLIX (solo VTR)", "SOLO VTR"
  m = s.match(/\(\s*(?:solo|exclusiv[oa]s?|unicamente)\s+(claro|vtr)\s*\)/)
  if (m) return m[1]
  m = s.match(/^(?:solo|exclusiv[oa]s?|unicamente)\s+(?:para\s+)?(?:clientes?\s+)?(claro|vtr)\b/)
  if (m) return m[1]
  return null
}

/** Texto del bloque sin los íconos de Material (no aportan contenido) */
function textoBloque(el) {
  if (el.querySelector('.material-icons')) {
    const copia = el.cloneNode(true)
    copia.querySelectorAll('.material-icons').forEach((n) => n.remove())
    return copia.textContent || ''
  }
  return el.textContent || ''
}

/**
 * Ámbito de un nodo del DOM. Se mira primero el encabezado/inicio del bloque,
 * porque los marcadores "Aplica solo para..." siempre aparecen al comienzo
 * de la sección a la que aplican.
 */
function ambitoDeNodo(el) {
  const texto = textoBloque(el)
  const completo = norm(texto)
  if (!completo) return null
  const mencionaAmbas = RE_CLARO.test(completo) && RE_VTR.test(completo)
  const ex = ambitoExclusivo(completo.slice(0, 400))
  if (ex === 'ambos' || (mencionaAmbas && ex)) return 'ambos'
  const inicio = norm(texto.slice(0, 400))
  const exInicio = ambitoEtiqueta(inicio) || ambitoExclusivo(inicio.slice(0, 300))
  if (exInicio) return exInicio
  // Párrafos que arrancan con una etiqueta de marca: "<p>Cliente Claro: Tipo de registro...</p>"
  const cab = norm(String(el.innerHTML || '').split(/<br\s*\/?>/i)[0].replace(/<[^>]*>/g, ''))
  if (cab) {
    const mb = marcaDeLinea(cab)
    if (mb && !(RE_CLARO.test(cab) && RE_VTR.test(cab))) return mb
  }
  if (mencionaAmbas) return 'ambos'
  return null
}

function esBloque(hijo) {
  return /^(P|LI|UL|OL|DIV|H[1-6]|TD|TH|TR|TABLE|TBODY|BLOCKQUOTE|SECTION|ARTICLE)$/.test(hijo.tagName)
}

const BLOQUES = 'p,li,div,ul,ol,table,tbody,tr,td,th,h1,h2,h3,h4,h5,h6,br'

/** El elemento es "hoja": su texto es una sola línea y no contiene otros bloques */
function esHoja(el) {
  return !el.querySelector(BLOQUES)
}

/** Quita de un elemento las líneas internas (separadas por <br>) de la otra marca */
function filtrarLineasInternas(el, marca) {
  const html = el.innerHTML
  if (!/<br\s*\/?>/i.test(html)) return false
  if ((html.match(/<br\s*\/?>/gi) || []).length > 8) return false
  if ((textoBloque(el) || '').length > 2000) return false
  const partes = html.split(/(<br\s*\/?>)/i)
  const salida = []
  let quitarBr = false
  let cambio = false
  for (const parte of partes) {
    if (/^<br/i.test(parte)) {
      if (quitarBr) { quitarBr = false; cambio = true; continue }
      salida.push(parte)
      continue
    }
    const texto = parte.replace(/<[^>]*>/g, '')
    const mb = marcaDeLinea(norm(texto))
    if (mb && mb !== marca) { quitarBr = true; cambio = true; continue }
    quitarBr = false
    salida.push(parte)
  }
  if (!cambio) return false
  el.innerHTML = salida.join('')
  return true
}

function limpiarNodo(padre, marca) {
  let removidos = 0
  for (const hijo of [...padre.children]) {
    if (!esBloque(hijo)) continue
    const texto = textoBloque(hijo)
    const ambito = ambitoDeNodo(hijo)
    if (ambito && ambito !== 'ambos' && ambito !== marca) {
      hijo.remove()
      removidos += 1
      continue
    }
    const mb = esHoja(hijo) ? marcaDeLinea(norm(texto)) : null
    if (mb && mb !== marca) {
      hijo.remove()
      removidos += 1
      continue
    }
    if (filtrarLineasInternas(hijo, marca)) removidos += 1
    removidos += limpiarNodo(hijo, marca)
  }
  return removidos
}

const soloTexto = (html) => String(html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim()

/** Filtra el HTML de un artículo para una marca. Devuelve { html, vacio } */
export function filtrarHtmlPorMarca(html, marca) {
  const m = normalizarMarca(marca)
  const original = String(html || '')
  if (!m || !original) return { html: original, vacio: false }
  if (typeof DOMParser === 'undefined') return { html: original, vacio: false }

  const doc = new DOMParser().parseFromString(`<div id="__sc_marca_raiz">${original}</div>`, 'text/html')
  const raiz = doc.getElementById('__sc_marca_raiz')
  if (!raiz) return { html: original, vacio: false }

  limpiarNodo(raiz, m)
  const out = raiz.innerHTML
  return { html: out, vacio: soloTexto(out).length < 12 }
}

/** Línea corta tipo "A3PLAYER" / "PASO 1" que da inicio a una sección nueva */
function esEncabezado(linea) {
  const t = String(linea || '').trim()
  if (!t || t.length > 90) return false
  if (/[.!?]$/.test(t)) return false
  if (!/^[\wÁÉÍÓÚÑáéíóúñ()\/&.+-]+( [\wÁÉÍÓÚÑáéíóúñ()\/&.+-]+)*$/.test(t)) return false
  return t.split(/\s+/).length <= 6
}

/** Filtra el texto plano de un artículo para una marca. Devuelve { texto, vacio } */
export function filtrarTextoPorMarca(texto, marca) {
  const m = normalizarMarca(marca)
  const original = String(texto || '')
  if (!m || !original) return { texto: original, vacio: false }

  const salida = []
  let ambito = null
  for (const linea of original.split('\n')) {
    if (!linea.trim()) {
      salida.push(linea)
      continue
    }
    const t = norm(linea)
    const mb = marcaDeLinea(t)
    if (mb && mb !== m) continue
    const amb = ambitoDeMarca(linea)
    if (amb) {
      if (amb === 'ambos' || amb === m) ambito = 'ambos'
      else {
        // El encabezado de la sección anterior queda sin contenido: se elimina
        for (let k = salida.length - 1; k >= 0; k--) {
          if (!salida[k].trim()) continue
          if (esEncabezado(salida[k])) salida.splice(k, 1)
          break
        }
        ambito = amb
        continue
      }
    } else if (esEncabezado(linea)) {
      ambito = null
    }
    if (ambito && ambito !== 'ambos' && ambito !== m) continue
    salida.push(linea)
  }
  const t = salida.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  return { texto: t, vacio: t.length < 12 }
}

/** Filtra el artículo completo según la marca elegida */
export function filtrarContenidoPorMarca(articulo, marca) {
  if (!articulo) return null
  if (articulo.html) return filtrarHtmlPorMarca(articulo.html, marca)
  if (articulo.texto) return filtrarTextoPorMarca(articulo.texto, marca)
  return null
}

export const NOMBRE_MARCA = { claro: 'Claro', vtr: 'VTR' }
