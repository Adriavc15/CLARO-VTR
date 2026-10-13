import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore'
import { PLANES_SEED, PLANES_GRUPOS, slugPlan } from './planesSeed.js'

export const COL_PLANES = 'catalogo_planes'

export function normalizarPlan(raw, fallbackGrupo = '1p-internet') {
  const grupo = String(raw.grupo || fallbackGrupo)
  const g = PLANES_GRUPOS.find((x) => x.id === grupo) || PLANES_GRUPOS[0]
  const comercial = String(raw.comercial || raw.plan || '').trim()
  if (!comercial) return null
  const id = String(raw.id || `${grupo}__${slugPlan(comercial)}`).slice(0, 80)
  const streams = Array.isArray(raw.streams) ? raw.streams.filter(Boolean) : []
  const tags = Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : []
  return {
    id,
    grupo: g.id,
    tag: String(raw.tag || g.tag),
    comercial,
    andes: String(raw.andes || raw.modalidad || ''),
    normal: String(raw.normal || raw.precio || ''),
    promo: String(raw.promo || ''),
    streams,
    tags,
    canales: String(raw.canales || ''),
    hd: String(raw.hd || ''),
    incluyeExtras: !!raw.incluyeExtras,
    orden: Number(raw.orden) || 0,
    actualizadoEn: raw.actualizadoEn || new Date().toISOString(),
  }
}

/** Fila lista para las tarjetas de la sección Planes */
export function planAFila(p) {
  return {
    ...p,
    plan: p.comercial,
    precio: p.normal,
    modalidad: p.andes,
  }
}

export function agruparPlanes(lista) {
  const out = {}
  for (const g of PLANES_GRUPOS) out[g.id] = []
  for (const raw of lista) {
    const p = normalizarPlan(raw)
    if (!p) continue
    if (!out[p.grupo]) out[p.grupo] = []
    out[p.grupo].push(planAFila(p))
  }
  for (const k of Object.keys(out)) {
    out[k].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.comercial.localeCompare(b.comercial))
  }
  return out
}

export function gruposDesdeSeed() {
  return agruparPlanes(PLANES_SEED)
}

export async function cargarPlanes(db) {
  const snap = await getDocs(collection(db, COL_PLANES))
  if (snap.empty) return PLANES_SEED.map((p) => ({ ...p }))
  return snap.docs.map((d) => normalizarPlan({ id: d.id, ...d.data() })).filter(Boolean)
}

export function suscribirPlanes(db, onData) {
  return onSnapshot(
    collection(db, COL_PLANES),
    (snap) => {
      if (snap.empty) {
        onData(agruparPlanes(PLANES_SEED), false)
        return
      }
      const lista = snap.docs.map((d) => normalizarPlan({ id: d.id, ...d.data() })).filter(Boolean)
      onData(agruparPlanes(lista), true)
    },
    () => onData(agruparPlanes(PLANES_SEED), false)
  )
}

export async function guardarPlan(db, raw) {
  const item = normalizarPlan(raw)
  if (!item) throw new Error('Falta el nombre comercial del plan')
  item.actualizadoEn = new Date().toISOString()
  await setDoc(doc(db, COL_PLANES, item.id), item, { merge: true })
  return item
}

export async function eliminarPlan(db, id) {
  await deleteDoc(doc(db, COL_PLANES, String(id)))
}

export async function sincronizarPlanes(db, lista = PLANES_SEED) {
  const items = lista.map((p) => normalizarPlan(p)).filter(Boolean)
  const col = collection(db, COL_PLANES)
  let i = 0
  while (i < items.length) {
    const batch = writeBatch(db)
    const chunk = items.slice(i, i + 400)
    for (const item of chunk) {
      batch.set(doc(col, item.id), item, { merge: true })
    }
    await batch.commit()
    i += chunk.length
  }
  return { total: items.length }
}
