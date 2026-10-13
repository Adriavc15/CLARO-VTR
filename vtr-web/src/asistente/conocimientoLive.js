import { collection, doc, getDocs, query, orderBy, limit, setDoc, writeBatch, deleteDoc } from 'firebase/firestore'
import { docsParaFirestore, INDICE_PORTAL_LOCAL } from './indicePortal.js'
import { docsKbAndesLocales } from './conocimientoKbAndes.js'

export const COL_CONOCIMIENTO = 'conocimiento_portal'

/** Convierte una noticia de Firestore en documento de conocimiento */
export function noticiaADoc(n) {
  const titulo = n.titulo || n.title || 'Noticia'
  const cuerpo = [n.resumen, n.contenido, n.texto, n.descripcion, n.cuerpo]
    .filter(Boolean)
    .map((x) => String(x).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  const imgRaw = [n.driveUrl, n.src, n.imagen, n.imageUrl, n.urlImagen, ...(Array.isArray(n.imagenes) ? n.imagenes : [])]
    .map((x) => String(x || '').trim())
    .filter((u) => u && /^https?:\/\//i.test(u))
  const imagenes = [...new Set(imgRaw)]
  const cat = String(n.categoria || '').trim()
  const toksTitulo = String(titulo)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9+]+/i)
    .filter((w) => w.length >= 3)
    .slice(0, 10)
  return {
    id: `noticia-${n.id}`,
    titulo,
    categoria: cat || 'NOTICIA',
    tipo: 'noticia',
    seccionPortal: cat ? `Noticias · ${cat}` : 'Noticias',
    sinonimos: [
      'noticia',
      'noticias',
      'comunicado',
      'aviso',
      'actualizacion',
      ...(cat ? [cat] : []),
      ...toksTitulo,
    ],
    contenido: cuerpo.length ? cuerpo : [`Noticia publicada: ${titulo}`],
    fuente: 'firestore-noticias',
    enlace: null,
    imagenes,
    noticiaId: String(n.id || ''),
  }
}

/** Carga índice local + KB Andes/VTR + conocimiento_portal + noticias recientes */
export async function cargarConocimientoLive(db) {
  const base = [
    ...INDICE_PORTAL_LOCAL.map((d) => ({ ...d })),
    ...docsKbAndesLocales().map((d) => ({ ...d })),
  ]
  if (!db) return base

  const porId = new Map(base.map((d) => [d.id, d]))

  try {
    const snap = await getDocs(collection(db, COL_CONOCIMIENTO))
    snap.forEach((s) => {
      const data = s.data() || {}
      const id = data.id || s.id
      porId.set(id, {
        id,
        titulo: data.titulo || id,
        categoria: data.categoria || 'PORTAL',
        tipo: data.tipo || 'doc',
        seccionPortal: data.seccionPortal || '',
        sinonimos: data.sinonimos || [],
        contenido: data.contenido || [],
        fuente: data.fuente || 'firestore',
        enlace: data.enlace || null,
        imagenes: Array.isArray(data.imagenes) ? data.imagenes : [],
        scId: data.scId || null,
        intent: data.intent || '',
      })
    })
  } catch {
    // Sin permisos o colección vacía: seguimos con índice local
  }

  try {
    const q = query(collection(db, 'noticias'), orderBy('creado', 'desc'), limit(40))
    const snap = await getDocs(q)
    snap.forEach((s) => {
      const docN = noticiaADoc({ id: s.id, ...s.data() })
      porId.set(docN.id, docN)
    })
  } catch {
    // Noticias opcionales
  }

  return Array.from(porId.values())
}

/** Sube el índice del portal (guías Andes, pago, secciones…) a Firestore */
export async function sincronizarConocimientoPortal(db) {
  if (!db) throw new Error('Firestore no disponible')
  const docs = docsParaFirestore()
  const CHUNK = 400
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = writeBatch(db)
    const slice = docs.slice(i, i + CHUNK)
    for (const d of slice) {
      const { id, ...rest } = d
      batch.set(doc(db, COL_CONOCIMIENTO, id), { id, ...rest }, { merge: true })
    }
    await batch.commit()
  }
  return { ok: true, total: docs.length }
}

export async function sincronizarConocimientoPortalSimple(db) {
  if (!db) throw new Error('Firestore no disponible')
  const docs = docsParaFirestore()
  for (const d of docs) {
    const { id, ...rest } = d
    await setDoc(doc(db, COL_CONOCIMIENTO, id), { id, ...rest }, { merge: true })
  }
  return { ok: true, total: docs.length }
}

export function slugId(texto) {
  return (
    String(texto || 'doc')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'doc'
  )
}

export function textoAContenido(texto) {
  return String(texto || '')
    .replace(/add_circle_outline|record_voice_over|folder_special|receipt|expand_more|expand_less|\berror\b/gi, '')
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 1)
}

export function dividirPorSecciones(tituloBase, texto) {
  const lineas = textoAContenido(texto)
  if (!lineas.length) return []

  const esTitulo = (l) =>
    (/^[A-ZÁÉÍÓÚÑ0-9][A-ZÁÉÍÓÚÑ0-9\s\/\-]{4,80}$/.test(l) && l.length < 90) ||
    /^(OBJETIVO|ALCANCE|CONSIDERACIONES|VERIFICACIONES|MATRIZ|IMPORTANTES|GESTIÓN|GESTION|INFORMA|ESCALA|REGISTRA|PAGO NO |TRASLADO|REVERSA|SERVICIO SUSPENDIDO)/i.test(
      l
    )

  const bloques = []
  let actual = { tituloSeccion: tituloBase, contenido: [] }

  for (const l of lineas) {
    if (esTitulo(l) && actual.contenido.length > 2) {
      bloques.push(actual)
      actual = { tituloSeccion: `${tituloBase} — ${l}`.slice(0, 120), contenido: [l] }
    } else {
      actual.contenido.push(l)
    }
  }
  if (actual.contenido.length) bloques.push(actual)
  return bloques.length ? bloques : [{ tituloSeccion: tituloBase, contenido: lineas }]
}

function docDesdeSnap(s) {
  const d = s.data() || {}
  const id = d.id || s.id
  return {
    id,
    titulo: d.titulo || id,
    categoria: d.categoria || '',
    tipo: d.tipo || 'doc',
    seccionPortal: d.seccionPortal || '',
    sinonimos: d.sinonimos || [],
    contenido: d.contenido || [],
    actualizadoEn: d.actualizadoEn || null,
    fuente: d.fuente || 'firestore',
    intent: d.intent || '',
  }
}

/** Todo el corpus en Firestore (lo que el chat puede pisar/sumar al bundle). */
export async function listarCorpusFirestore(db) {
  if (!db) return []
  const snap = await getDocs(collection(db, COL_CONOCIMIENTO))
  const out = []
  snap.forEach((s) => out.push(docDesdeSnap(s)))
  return out.sort((a, b) => String(b.actualizadoEn || '').localeCompare(String(a.actualizadoEn || '')))
}

export function grupoFuente(fuente, id = '') {
  const f = String(fuente || '').toLowerCase()
  const i = String(id || '').toLowerCase()
  if (f === 'admin' || f === 'admin-aprobado' || i.startsWith('admin-')) return 'admin'
  if (f.includes('somosclave') || i.startsWith('sc-')) return 'somosclave'
  if (f.includes('sucursal') || i.startsWith('sucursal-')) return 'sucursales'
  if (f.includes('kb-andes') || i.startsWith('kb-') || i.startsWith('tr-')) return 'andes'
  if (f.includes('noticia')) return 'noticias'
  if (
    f.includes('entrenamiento') ||
    f.includes('dialogo') ||
    f.includes('corpus') ||
    f.includes('google') ||
    f.includes('training')
  )
    return 'dialogos'
  if (f.includes('portal') || f === 'portal') return 'portal'
  return 'otro'
}

/**
 * Cuenta los documentos que trae la app (bundle local) por grupo, para
 * comparar contra lo publicado en Firestore y saber qué falta.
 */
export async function contarFuentesLocales() {
  const porId = new Map()
  const add = (d) => {
    const id = String(d?.id || '')
    if (!id) return
    porId.set(id, d)
  }
  try {
    for (const d of docsParaFirestore()) add(d)
  } catch {
    /* opcional */
  }
  try {
    for (const d of docsKbAndesLocales()) add(d)
  } catch {
    /* opcional */
  }
  try {
    const { docsSomosClaveLocales } = await import('./contenidosSomosClave.js')
    const scDocs = await docsSomosClaveLocales()
    for (const d of scDocs || []) add(d)
  } catch {
    /* Somos Clave es opcional */
  }
  const porGrupo = {}
  for (const d of porId.values()) {
    const g = grupoFuente(d?.fuente, d?.id)
    porGrupo[g] = (porGrupo[g] || 0) + 1
  }
  return porGrupo
}

/**
 * Publica TODO el conocimiento local a Firestore en una sola acción:
 * guías del portal, base Andes/VTR (+ intents), Somos Clave, tono Google y
 * corpus de diálogos cotidianos. Devuelve cuántos documentos escribió cada uno.
 */
export async function sincronizarTodoConocimiento(db, { onProgress } = {}) {
  if (!db) throw new Error('Firestore no disponible')
  const res = {}

  onProgress?.('Guías del portal')
  res.portal = (await sincronizarConocimientoPortal(db)).total

  onProgress?.('Base Andes/VTR')
  const kb = await (await import('./conocimientoKbAndes.js')).sincronizarKbAndesVtr(db)
  res.andes = kb.total
  res.intents = kb.trainingExamples || 0

  onProgress?.('Somos Clave')
  const { docsSomosClaveLocales } = await import('./contenidosSomosClave.js')
  const scDocs = await docsSomosClaveLocales()
  const { sincronizarSomosClaveLocalAFirestore } = await import('./conocimientoSomosClave.js')
  res.somosclave = (await sincronizarSomosClaveLocalAFirestore(db, scDocs)).total

  onProgress?.('Tono y diálogos')
  const { nutrirDialogosGoogleEnFirestore } = await import('./dialogosGoogle.js')
  const { nutrirCorpusCotidianosEnFirestore } = await import('./corpusDialogosCotidianos.js')
  const g = await nutrirDialogosGoogleEnFirestore(db)
  const c = await nutrirCorpusCotidianosEnFirestore(db)
  res.google = g.conocimiento || 0
  res.corpus = c.conocimiento || 0

  return res
}

export async function listarConocimientoAdmin(db) {
  const all = await listarCorpusFirestore(db)
  return all.filter((d) => grupoFuente(d.fuente, d.id) === 'admin')
}

export async function guardarConocimientoDesdeAdmin(
  db,
  { titulo, categoria, seccionPortal, sinonimos, texto, dividir }
) {
  if (!db) throw new Error('Firestore no disponible')
  const tituloLimpio = String(titulo || '').trim()
  if (!tituloLimpio) throw new Error('Falta el título')
  if (!String(texto || '').trim()) throw new Error('Pega el contenido del procedimiento')

  const sinos = String(sinonimos || '')
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)

  const bloques = dividir
    ? dividirPorSecciones(tituloLimpio, texto)
    : [{ tituloSeccion: tituloLimpio, contenido: textoAContenido(texto) }]

  const ahora = new Date().toISOString()
  const guardados = []

  for (let i = 0; i < bloques.length; i++) {
    const b = bloques[i]
    const id =
      bloques.length === 1
        ? `admin-${slugId(tituloLimpio)}`
        : `admin-${slugId(tituloLimpio)}-${i + 1}-${slugId(b.tituloSeccion).slice(0, 40)}`
    const payload = {
      id,
      titulo: b.tituloSeccion,
      categoria: categoria || 'PROCEDIMIENTO',
      tipo: bloques.length > 1 ? 'micro' : 'guia',
      seccionPortal: seccionPortal || 'Admin → Conocimiento IA',
      sinonimos: sinos.length ? sinos : [tituloLimpio.toLowerCase()],
      contenido: b.contenido,
      fuente: 'admin',
      enlace: null,
      actualizadoEn: ahora,
    }
    await setDoc(doc(db, COL_CONOCIMIENTO, id), payload, { merge: true })
    guardados.push(payload)
  }

  return { ok: true, total: guardados.length, docs: guardados }
}

export async function eliminarConocimientoAdmin(db, id) {
  if (!db || !id) throw new Error('Falta id')
  await deleteDoc(doc(db, COL_CONOCIMIENTO, id))
  return { ok: true }
}
