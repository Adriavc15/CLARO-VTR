/**
 * Contenidos Somos Clave (texto local) para el modal "Ver aquí"
 * y como corpus del chatbot Apex.
 * Fuente: /somosclave-contenidos.json (~340 artículos).
 */

import { articuloSomosClaveADoc } from './conocimientoSomosClave'

let cache = null
let loading = null
let docsCache = null

export async function cargarContenidosSomosClave() {
  if (cache) return cache
  if (loading) return loading
  loading = (async () => {
    const res = await fetch('/somosclave-contenidos.json')
    if (!res.ok) throw new Error('No se pudo cargar el catálogo local de Somos Clave')
    const arr = await res.json()
    const list = Array.isArray(arr) ? arr : arr.items || arr.docs || []
    cache = new Map(
      list
        .filter((a) => a && (a.id || a.scId))
        .map((a) => [
          String(a.id || a.scId),
          {
            id: String(a.id || a.scId),
            nombre: a.nombre || a.titulo || a.title || `Artículo ${a.id}`,
            enlace: a.enlace || `https://somosclave.cl/respuesta.php?q=${a.categoriaPath || 'actualizado'}/${a.id}`,
            categoriaPath: a.categoriaPath || '',
            texto: String(a.texto || a.contenido || a.body || '').trim(),
            html: String(a.html || '').trim(),
          },
        ])
    )
    return cache
  })()
  try {
    return await loading
  } finally {
    loading = null
  }
}

export async function getContenidoSomosClave(id) {
  const map = await cargarContenidosSomosClave()
  return map.get(String(id)) || null
}

/** Docs RAG listos para el chatbot (sc-{id}) desde el JSON local */
export async function docsSomosClaveLocales() {
  if (docsCache) return docsCache
  const map = await cargarContenidosSomosClave()
  const docs = []
  for (const a of map.values()) {
    const d = articuloSomosClaveADoc(a)
    if (!d) continue
    const extra = String(a.nombre || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9+]+/i)
      .filter((w) => w.length >= 3)
      .slice(0, 12)
    // Marcas cortas del título (hbo, ott, tnt…) para preguntas tipo "hbo" / "qué es hbo"
    const marcas = extra.filter((w) => w.length <= 5)
    d.sinonimos = [
      ...new Set([...(d.sinonimos || []), ...extra, ...marcas, 'somos clave', 'procedimiento']),
    ]
    docs.push(d)
  }
  docsCache = docs
  return docs
}
