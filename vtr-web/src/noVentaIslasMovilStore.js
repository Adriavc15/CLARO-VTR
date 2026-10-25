/**
 * Ventas Isla / Transferencias al S2 14111 (antes «No venta Islas/Móvil»).
 * Guarda en Firestore (colección 'no_venta_islas_movil') con respaldo local.
 *
 * Mismo patrón «semilla + en vivo» que migracionesStore.js.
 */

import { ASESORES_SEED } from './asesoresStore'

const LS_KEY = 'vtr-no-venta-islas-movil:local'
const FS_COLLECTION = 'no_venta_islas_movil'

/**
 * Opción «Otro» del selector de estado: al elegirla se habilita el detalle
 * (igual que «4- OTROS (ALGUN ERROR DIFERENTE - TIPIFICAR)» en Migraciones).
 */
export const ESTADO_NO_VENTA_OTROS = 'OTRO (MOTIVO)'

/** Estados principales que siempre aparecen (selector nivel 1). */
export const ESTADOS_NO_VENTA_PRINCIPALES = [
  'SE OFRECE Y NO DESEA',
  'DESEA Y SE TRANSFIERE',
]

/** Estados secundarios que aparecen solo cuando se selecciona «SE OFRECE Y NO DESEA». */
export const ESTADOS_NO_VENTA_SECUNDARIOS = [
  'CONFORME CON SU OPERADOR',
  'TIENE CONTRATO DE PERMANENCIA',
  'TIENE MEJOR PROPUESTA DE SU OPERADOR',
  ESTADO_NO_VENTA_OTROS,
]

/** Estados de una gestión de Ventas Isla / Transferencias al S2 14111 (selector completo - para compatibilidad). */
export const ESTADOS_NO_VENTA = [
  ...ESTADOS_NO_VENTA_PRINCIPALES,
  ...ESTADOS_NO_VENTA_SECUNDARIOS,
]

/** Compatibilidad con estados anteriores del selector. */
const ESTADOS_LEGADOS = {
  'NO DESEA': 'SE OFRECE Y NO DESEA',
}

export const CAMPOS_NO_VENTA = [
  'fecha',
  'asesor',
  'supervisor',
  'rutCliente',
  'estado',
  'subestado',
  'detalleError',
]

export const LABELS_NO_VENTA = {
  fecha: 'Fecha de ingreso',
  asesor: 'Asesor',
  supervisor: 'Supervisor',
  rutCliente: 'RUT cliente',
  estado: 'Estado',
  detalleError: 'Detalle / Tipificación',
}

export function labelNoVenta(key) {
  return LABELS_NO_VENTA[key] || key
}

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `nvi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

export function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function sanitizeFirestore(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

function aISO(v) {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (typeof v.toDate === 'function') {
    try {
      return v.toDate().toISOString()
    } catch {
      return ''
    }
  }
  if (typeof v.seconds === 'number') return new Date(v.seconds * 1000).toISOString()
  return ''
}

function aDia(v) {
  const s = String(v || '').trim()
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildAsesoresLegajoMap() {
  const map = new Map()
  for (const a of ASESORES_SEED) {
    const nombre = typeof a === 'string' ? a : a?.nombre
    const legajo = typeof a === 'object' ? a?.legajo : ''
    if (nombre && legajo) {
      map.set(String(nombre).trim().toUpperCase(), String(legajo).trim())
    }
  }
  return map
}

function aplicarLegajoAAsesor(asesor) {
  if (!asesor) return ''
  const s = String(asesor).trim()
  if (!s) return ''
  if (/ - LEGAJO\s+/i.test(s)) {
    const m = s.match(/ - LEGAJO\s+(.+)$/i)
    return m?.[1]?.trim() || ''
  }
  const map = buildAsesoresLegajoMap()
  return map.get(s.toUpperCase()) || ''
}

function sanitizeNoVenta(r) {
  const clean = sanitizeFirestore(r)
  if (!clean || typeof clean !== 'object') return null
  if (!clean.id) clean.id = uid()
  clean.fecha = aDia(clean.fecha)
  clean.asesor = String(clean.asesor || '').trim().toUpperCase()
  clean.supervisor = String(clean.supervisor || '').trim().toUpperCase()
  clean.rutCliente = String(clean.rutCliente || '').trim()
  // Compatibilidad con registros antiguos («NO DESEA» pasó a «SE OFRECE Y NO DESEA»).
  const estado = String(clean.estado || '').trim()
  clean.estado = ESTADOS_LEGADOS[estado] || estado
  clean.detalleError = String(clean.detalleError || '').trim()
  // El campo subestado es solo temporal del formulario, no se guarda en Firestore
  delete clean.subestado
  // Legajo independiente del nombre del asesor
  if (!clean.legajoAsesor) {
    clean.legajoAsesor = aplicarLegajoAAsesor(clean.asesor)
  } else {
    clean.legajoAsesor = String(clean.legajoAsesor).trim()
  }
  // Si el asesor no tiene nombre pero sí tiene legajo, recuperar el nombre desde la lista base
  if (!clean.asesor && clean.legajoAsesor) {
    const base = ASESORES_SEED.find((s) => String(s?.legajo || '').trim() === clean.legajoAsesor)
    if (base) {
      clean.asesor = String(base?.nombre || '').trim().toUpperCase()
    }
  }
  clean.creado = aISO(clean.creado) || new Date().toISOString()
  clean.actualizado = aISO(clean.actualizado) || clean.creado
  clean.email = normalizarEmail(clean.email)
  return clean
}

function sanitizeItems(items) {
  return (items || []).map(sanitizeNoVenta).filter(Boolean).slice(0, 5000)
}

/** ---------- Local (respaldo) ---------- */

export function cargarNoVentaLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function guardarNoVentaLocal(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sanitizeItems(items)))
  } catch (err) {
    console.error('No se pudo guardar registros locales (no venta islas):', err)
  }
}

function tsDe(m) {
  const a = Date.parse(m?.actualizado || 0) || 0
  const b = Date.parse(m?.creado || 0) || 0
  return Math.max(a, b)
}

function mergePorId(localItems, remotoItems) {
  const map = new Map()
  for (const t of [...(remotoItems || []), ...(localItems || [])]) {
    if (!t?.id) continue
    const prev = map.get(t.id)
    if (!prev) {
      map.set(t.id, t)
      continue
    }
    const a = tsDe(t)
    const b = tsDe(prev)
    if (a >= b) map.set(t.id, { ...prev, ...t })
  }
  return [...map.values()].sort((a, b) => tsDe(b) - tsDe(a))
}

/** ---------- Firestore ---------- */

async function leerNoVentaFirestore(db) {
  if (!db) return []
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db, FS_COLLECTION))
  const out = []
  snap.forEach((s) => {
    const reg = sanitizeNoVenta({ ...(s.data() || {}), id: s.id })
    if (reg) out.push(reg)
  })
  return out
}

async function escribirNoVentaFirestore(db, item) {
  if (!db) return false
  const { doc, setDoc } = await import('firebase/firestore')
  const clean = sanitizeNoVenta(item)
  if (!clean) throw new Error('Datos de no venta inválidos')
  await setDoc(doc(db, FS_COLLECTION, clean.id), clean, { merge: true })
  return true
}

/** Actualiza únicamente el estado en Firestore (sin tocar el resto del registro). */
async function actualizarEstadoNoVentaFirestore(db, id, estado, actualizado) {
  if (!db) return false
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, FS_COLLECTION, id), { estado, actualizado })
  return true
}

/**
 * Guarda un registro de no venta islas (local + nube si hay Firestore).
 * @returns {Promise<{registro: object, cloud: boolean, cloudError?: string}>}
 */
export async function guardarNoVentaIslasMovil({ db, campos, email = '' }) {
  const ahora = new Date().toISOString()
  const registro = sanitizeNoVenta({
    id: uid(),
    email,
    ...(campos || {}),
    creado: ahora,
    actualizado: ahora,
  })

  const local = mergePorId([registro], cargarNoVentaLocal())
  guardarNoVentaLocal(local)

  if (!db) return { registro, cloud: false, cloudError: 'Sin conexión a Firestore' }

  try {
    await escribirNoVentaFirestore(db, registro)
    return { registro, cloud: true }
  } catch (err) {
    const cloudError = err?.code || err?.message || String(err)
    console.error('No venta islas NO guardada en Firestore:', cloudError, err)
    return { registro, cloud: false, cloudError }
  }
}

/** Carga todos los registros (nube + respaldo local). */
export async function listarNoVentaIslasMovil(db) {
  if (!db) return sanitizeItems(cargarNoVentaLocal())
  try {
    const remoto = await leerNoVentaFirestore(db)
    const merged = mergePorId(cargarNoVentaLocal(), remoto)
    guardarNoVentaLocal(merged)
    return merged
  } catch (err) {
    console.warn('No se pudieron leer no venta islas de la nube:', err?.message || err)
    return sanitizeItems(cargarNoVentaLocal())
  }
}

/** Suscripción en tiempo real a la colección de no venta islas. */
export function suscribirNoVentaIslasMovil(db, onData) {
  if (!db) return () => {}
  let unsub = () => {}
  import('firebase/firestore').then(({ collection, onSnapshot }) => {
    try {
      unsub = onSnapshot(
        collection(db, FS_COLLECTION),
        (snap) => {
          const docs = []
          snap.forEach((s) => {
            const reg = sanitizeNoVenta({ ...(s.data() || {}), id: s.id })
            if (reg) docs.push(reg)
          })
          if (!docs.length) {
            onData(sanitizeItems(cargarNoVentaLocal()))
            return
          }
          const merged = mergePorId(cargarNoVentaLocal(), docs)
          guardarNoVentaLocal(merged)
          onData(merged)
        },
        (err) => {
          console.warn(`onSnapshot no venta islas falló:`, err?.message || err)
          onData(sanitizeItems(cargarNoVentaLocal()))
        }
      )
    } catch (err) {
      console.warn(`No se pudo suscribir a no venta islas:`, err?.message || err)
      onData(sanitizeItems(cargarNoVentaLocal()))
    }
  })

  return () => unsub()
}

/** Elimina un registro (admin). */
export async function eliminarNoVentaIslasMovil(db, id) {
  const local = cargarNoVentaLocal().filter((m) => m.id !== id)
  guardarNoVentaLocal(local)
  if (db) {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      await deleteDoc(doc(db, FS_COLLECTION, id))
    } catch (err) {
      console.warn('Eliminación solo local (Firestore no disponible):', err?.message || err)
    }
  }
  return local
}

/** Parte fecha/hora en formato chileno. */
export function partesFechaHora(iso) {
  if (!iso) return { fecha: '', hora: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { fecha: '', hora: '' }
  const fecha = d
    .toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-')
  const hora = d.toLocaleTimeString('es-CL', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return { fecha, hora }
}

/** Normaliza 'YYYY-MM-DD' y devuelve el mismo día como iso local (medianoche). */
export function isoDia(dia) {
  return dia ? `${dia}T00:00:00` : ''
}

/** Nombre corto de un día para ejes (ej. "12/09"). */
function etiquetaDia(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
}

/** Extrae solo el nombre del asesor, eliminando " - LEGAJO ..." si está presente. */
function nombreAsesorLimpio(asesor) {
  if (!asesor) return ''
  const s = String(asesor).trim()
  return s.replace(/\s*-\s*LEGAJO\s+.+$/i, '').trim()
}

/** Obtiene el valor de un campo según su key. */
function valorCampo(m, key) {
  return m?.[key] || ''
}

/** Exporta como .xls (tabla HTML que Excel abre). */

export function exportarNoVentaExcel(items, nombreArchivo = 'no-venta-islas-movil.xls') {
  const escapeHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
  // Excluir subestado de las columnas de exportación (es solo temporal del formulario)
  const cols = CAMPOS_NO_VENTA.filter((k) => k !== 'subestado')
  const headCols = [
    'Fecha registro',
    'Hora',
    'Asesor',
    'RUT asesor',
    ...cols.map(labelNoVenta),
  ]
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join('')
  const rows = items
    .map((m) => {
      const { fecha, hora } = partesFechaHora(m.creado)
      const asesorLimpio = nombreAsesorLimpio(m.asesor)
      const cells = [fecha, hora, asesorLimpio, m.legajoAsesor || '', ...cols.map((k) => valorCampo(m, k))]
      return `<tr>${cells.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`
    })
    .join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>
    <table border="1">
      <thead><tr>${headCols}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}