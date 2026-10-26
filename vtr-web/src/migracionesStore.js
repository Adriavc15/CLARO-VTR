/**
 * Migraciones por cambio de tecnología (comisión S/ 5.50 por migración).
 * Guarda en Firestore (colección 'migraciones') con respaldo local.
 */

const LS_KEY = 'vtr-migraciones:local'
const FS_COLLECTION = 'migraciones'

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })

export const COMISION_MIGRACION = 5.5

/** Estados de una migración (selector «Estado»). */
export const ESTADO_CURSADA = '1-MIGRACIÓN CURSADA'
export const ESTADO_ERROR_TSQ = '2-ERROR TSQ (SE GENERÓ TICKET GSA)'
export const ESTADO_CORNESTONE = '3- CLIENTE CORNESTONE (NO MIGRABLE)'
export const ESTADO_OTROS = '4- OTROS (ALGUN ERROR DIFERENTE - TIPIFICAR)'

export const ESTADOS_MIGRACION = [
  ESTADO_CURSADA,
  ESTADO_ERROR_TSQ,
  ESTADO_CORNESTONE,
  ESTADO_OTROS,
]

/** Clases Tailwind por estado (badges y selectores). */
export const ESTADO_CLASES = {
  [ESTADO_CURSADA]:
    'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700',
  [ESTADO_ERROR_TSQ]:
    'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-700',
  [ESTADO_CORNESTONE]:
    'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700',
  [ESTADO_OTROS]:
    'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700',
  // Compatibilidad con registros antiguos
  'Migración Cursada':
    'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700',
  'Migración No Cursada':
    'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-700',
}

export function claseEstado(estado) {
  return ESTADO_CLASES[estado] || ESTADO_CLASES[ESTADO_CURSADA]
}

/**
 * Normaliza el estado. Los registros antiguos o sin estado válido se consideran
 * «1-MIGRACIÓN CURSADA».
 */
export function normalizarEstado(estado) {
  if (ESTADOS_MIGRACION.includes(estado)) return estado
  if (estado === 'Migración Cursada') return ESTADO_CURSADA
  if (estado === 'Migración No Cursada') return ESTADO_OTROS
  return ESTADO_CURSADA
}

export const CAMPOS_MIGRACION = [
  'fechaIngreso',
  'asesor',
  'supervisor',
  'rutCliente',
  'nPedido',
  'estado',
  'detalleError',
]

export const LABELS_MIGRACION = {
  fechaIngreso: 'Fecha ingreso de migración',
  asesor: 'Nombre y apellido del asesor',
  supervisor: 'Supervisor',
  rutCliente: 'RUT del cliente',
  nPedido: 'N° de pedido',
  estado: 'Estado',
  detalleError: 'Motivo',
  fechaAgendamiento: 'Fecha de agendamiento',
  rangoHorario: 'Rango de horario',
}

export function labelMigracion(key) {
  return LABELS_MIGRACION[key] || key
}

import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { ASESORES_SEED } from './asesoresStore'

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

function obtenerLegajoAsesor(asesor) {
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

/** Convierte Timestamps de Firestore o strings a ISO. */
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

function sanitizeMigracion(m) {
  const clean = sanitizeFirestore(m)
  if (!clean || typeof clean !== 'object') return null
  if (!clean.id) clean.id = uid()
  clean.asesor = String(clean.asesor || '').trim().toUpperCase()
  clean.supervisor = String(clean.supervisor || '').trim().toUpperCase()
  clean.rutCliente = String(clean.rutCliente || '').trim()
  clean.rangoHorario = String(clean.rangoHorario || '').trim()
  clean.nPedido = String(clean.nPedido || '').trim()
  clean.detalleError = String(clean.detalleError || '').trim()
  // Legajo independiente del nombre del asesor
  if (!clean.legajoAsesor) {
    clean.legajoAsesor = obtenerLegajoAsesor(clean.asesor)
  } else {
    clean.legajoAsesor = String(clean.legajoAsesor).trim()
  }
  // Normaliza fechaIngreso a YYYY-MM-DD (sin hora, sin zona horaria)
  let fechaIngreso = String(clean.fechaIngreso || '').trim()
  if (fechaIngreso && fechaIngreso.includes('T')) {
    const d = new Date(fechaIngreso)
    if (!Number.isNaN(d.getTime())) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      fechaIngreso = `${year}-${month}-${day}`
    }
  }
  clean.fechaIngreso = fechaIngreso
  clean.fechaAgendamiento = String(clean.fechaAgendamiento || '')
  clean.estado = normalizarEstado(clean.estado)
  clean.comision = Number(clean.comision) || COMISION_MIGRACION
  clean.creado = aISO(clean.creado) || new Date().toISOString()
  clean.actualizado = aISO(clean.actualizado) || clean.creado
  clean.email = normalizarEmail(clean.email)
  return clean
}

function sanitizeItems(items) {
  return (items || []).map(sanitizeMigracion).filter(Boolean).slice(0, 3000)
}

/** ---------- Local (respaldo) ---------- */

export function cargarMigracionesLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function guardarMigracionesLocal(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sanitizeItems(items)))
  } catch (err) {
    console.error('No se pudo guardar migraciones locales:', err)
  }
}

/** Marca temporal de un registro (usa «actualizado» si es más reciente). */
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

async function leerMigracionesFirestore(db) {
  if (!db) return []
  const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db, FS_COLLECTION), orderBy('creado', 'desc')))
  const out = []
  snap.forEach((s) => {
    const reg = sanitizeMigracion({ ...(s.data() || {}), id: s.id })
    if (reg) out.push(reg)
  })
  return out
}

async function escribirMigracionFirestore(db, registro) {
  if (!db) return false
  const { collection, doc, setDoc } = await import('firebase/firestore')
  const clean = sanitizeMigracion(registro)
  const payload = sanitizeFirestore({ ...clean })
  if (!payload) throw new Error('Datos de migración inválidos')
  delete payload.id
  await setDoc(
    doc(db, FS_COLLECTION, clean.id),
    { ...payload, creado: clean.creado, actualizado: clean.actualizado },
    { merge: true }
  )
  return true
}

/** Actualiza únicamente el estado en Firestore (sin tocar el resto del registro). */
async function actualizarEstadoFirestore(db, id, estado, actualizado) {
  if (!db) return false
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, FS_COLLECTION, id), { estado, actualizado })
  return true
}

/**
 * Guarda una migración (local + nube si hay Firestore).
 * @returns {Promise<{registro: object, cloud: boolean, cloudError?: string}>}
 */
export async function guardarMigracion({ db, campos, email = '' }) {
  const ahora = new Date().toISOString()
  const registro = sanitizeMigracion({
    id: uid(),
    email,
    ...(campos || {}),
    comision: COMISION_MIGRACION,
    creado: ahora,
    actualizado: ahora,
  })

  const local = mergePorId([registro], cargarMigracionesLocal())
  guardarMigracionesLocal(local)

  if (!db) return { registro, cloud: false, cloudError: 'Sin conexión a Firestore' }

  try {
    await escribirMigracionFirestore(db, registro)
    return { registro, cloud: true }
  } catch (err) {
    const cloudError = err?.code || err?.message || String(err)
    console.error('Migración NO guardada en Firestore:', cloudError, err)
    return { registro, cloud: false, cloudError }
  }
}

/**
 * Cambia el estado de una migración ya registrada (local + nube).
 * Solo se usa desde el panel de administrador.
 */
export async function actualizarEstadoMigracion({ db, id, migracion = null, estado }) {
  const mid = id || migracion?.id
  if (!mid) throw new Error('Falta el id de la migración')

  const nuevo = normalizarEstado(estado)
  const actualizado = new Date().toISOString()

  const local = cargarMigracionesLocal()
  const idx = local.findIndex((m) => m.id === mid)
  const base = idx >= 0 ? local[idx] : migracion || { id: mid }
  const registro = sanitizeMigracion({ ...base, id: mid, estado: nuevo, actualizado })

  if (idx >= 0) local[idx] = registro
  else local.unshift(registro)
  guardarMigracionesLocal(local)

  if (!db) return { registro, cloud: false, cloudError: 'Sin conexión a Firestore' }

  try {
    await actualizarEstadoFirestore(db, mid, nuevo, actualizado)
    return { registro, cloud: true }
  } catch (err) {
    const cloudError = err?.code || err?.message || String(err)
    console.error('Estado NO actualizado en Firestore:', cloudError, err)
    return { registro, cloud: false, cloudError }
  }
}

/** Carga todas las migraciones (nube + respaldo local). */
export async function listarMigraciones(db) {
  if (!db) return sanitizeItems(cargarMigracionesLocal())
  try {
    const remoto = await leerMigracionesFirestore(db)
    const merged = mergePorId(cargarMigracionesLocal(), remoto)
    guardarMigracionesLocal(merged)
    return merged
  } catch (err) {
    console.warn('No se pudieron leer migraciones de la nube:', err?.message || err)
    return sanitizeItems(cargarMigracionesLocal())
  }
}

/** Suscripción en tiempo real a la colección de migraciones. */
export function suscribirMigraciones(db, onData) {
  if (!db) return () => {}
  let unsub = () => {}
  import('firebase/firestore').then(({ collection, query, orderBy, onSnapshot }) => {
    try {
      unsub = onSnapshot(
        query(collection(db, FS_COLLECTION), orderBy('creado', 'desc')),
        (snap) => {
          const out = []
          snap.forEach((s) => {
            const reg = sanitizeMigracion({ ...(s.data() || {}), id: s.id })
            if (reg) out.push(reg)
          })
          onData(out)
        },
        (err) => {
          console.warn('onSnapshot migraciones falló:', err?.message || err)
        }
      )
    } catch (err) {
      console.warn('No se pudo suscribir a migraciones:', err?.message || err)
    }
  })
  return () => unsub()
}

/** Elimina una migración (admin). */
export async function eliminarMigracion(db, id) {
  const local = cargarMigracionesLocal().filter((m) => m.id !== id)
  guardarMigracionesLocal(local)
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

function valorCampo(m, key) {
  const v = m?.[key]
  if (v === undefined || v === null) return ''
  return String(v)
}

/** Exporta como .xls (tabla HTML que Excel abre). */
/** Extrae solo el nombre del asesor, eliminando " - LEGAJO ..." si está presente. */
function nombreAsesorLimpio(asesor) {
  if (!asesor) return ''
  const s = String(asesor).trim()
  return s.replace(/\s*-\s*LEGAJO\s+.+$/i, '').trim()
}

export function exportarMigracionesExcel(items, nombreArchivo = 'migraciones.xls') {
  const escapeHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  const cols = CAMPOS_MIGRACION
  const headCols = ['Fecha registro', 'Hora', 'Asesor', 'RUT asesor', 'Comisión (S/)', ...cols.map(labelMigracion)]
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join('')
  const rows = items
    .map((m) => {
      const { fecha, hora } = partesFechaHora(m.creado)
      const asesorLimpio = nombreAsesorLimpio(m.asesor)
      const cells = [
        fecha,
        hora,
        asesorLimpio,
        m.legajoAsesor || '',
        String(m.comision || COMISION_MIGRACION),
        ...cols.map((k) => valorCampo(m, k)),
      ]
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

/** Normaliza 'YYYY-MM-DD' y devuelve el mismo día como iso local (medianoche). */
export function isoDia(dia) {
  return dia ? `${dia}T00:00:00` : ''
}

/** Nombre corto de un día para ejes (ej. "12/09"). */
export function etiquetaDia(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
}