/**
 * Clientes que NO aceptan el cambio a fibra.
 * Guarda en Firestore (colección 'no_acepta_fibra') con respaldo local.
 *
 * Mismo patrón «semilla + en vivo» que migracionesStore.js.
 */

import { ASESORES_SEED } from './asesoresStore'

const LS_KEY = 'vtr-no-acepta-fibra:local'
const FS_COLLECTION = 'no_acepta_fibra'

/**
 * Opción «Otro» del selector de motivo: al elegirla se habilita el detalle
 * (igual que «4- OTROS (ALGUN ERROR DIFERENTE - TIPIFICAR)» en Migraciones).
 */
export const MOTIVO_NO_ACEPTA_OTROS = 'OTRO'

/** Motivos por los que un cliente no acepta el cambio a fibra (selector). */
export const MOTIVOS_NO_ACEPTA = [
  'DESCONFIA DE LA FIBRA',
  'ESTA CONFORME CON SUS SERVICIOS NO QUIERE CAMBIAR',
  'LO PENSARÁ',
  'NO ENTIENDE QUE ES LA FIBRA NO QUIERE CAMBIAR',
  'NO TIENE TIEMPO PARA LA VISITA',
  'QUIERE DAR DE BAJA EL SERVICIO',
  'YA LE OFRECIERON ANTES Y NO QUIERE',
  'YA VINIERON Y NO SE PUDO',
  MOTIVO_NO_ACEPTA_OTROS,
]

export const CAMPOS_NO_ACEPTA = [
  'fecha',
  'asesor',
  'supervisor',
  'rutCliente',
  'motivoNoAcepta',
  'detalleError',
]

export const LABELS_NO_ACEPTA = {
  fecha: 'Fecha',
  asesor: 'Asesor',
  supervisor: 'Supervisor',
  rutCliente: 'RUT cliente',
  motivoNoAcepta: 'Motivo no acepta',
  detalleError: 'Detalle del error / Tipificación',
}

export function labelNoAcepta(key) {
  return LABELS_NO_ACEPTA[key] || key
}

/** Legajo independiente del nombre del asesor */
function obtenerLegajoAsesor(asesor) {
  if (!asesor) return ''
  const s = String(asesor).trim()
  if (!s) return ''
  if (/ - LEGAJO\s+/i.test(s)) {
    const m = s.match(/ - LEGAJO\s+(.+)$/i)
    return m?.[1]?.trim() || ''
  }
  // Buscar en la lista base de asesores por nombre
  const base = ASESORES_SEED.find(
    (a) => typeof a === 'object' ? a.nombre === s : a === s
  )
  const legajo = typeof base === 'object' ? base.legajo : ''
  if (legajo) return legajo
  return ''
}

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `naf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

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

function sanitizeNoAcepta(r) {
  const clean = sanitizeFirestore(r)
  if (!clean || typeof clean !== 'object') return null
  if (!clean.id) clean.id = uid()
  clean.fecha = aDia(clean.fecha)
  clean.asesor = String(clean.asesor || '').trim().toUpperCase()
  clean.supervisor = String(clean.supervisor || '').trim().toUpperCase()
  clean.rutCliente = String(clean.rutCliente || '').trim()
  clean.motivoNoAcepta = String(clean.motivoNoAcepta || '').trim()
  clean.detalleError = String(clean.detalleError || '').trim()
  // Legajo independiente
  if (!clean.legajoAsesor) {
    clean.legajoAsesor = obtenerLegajoAsesor(clean.asesor)
  } else {
    clean.legajoAsesor = String(clean.legajoAsesor).trim()
  }
  clean.creado = aISO(clean.creado) || new Date().toISOString()
  clean.actualizado = aISO(clean.actualizado) || clean.creado
  clean.email = normalizarEmail(clean.email)
  return clean
}

function sanitizeItems(items) {
  return (items || []).map(sanitizeNoAcepta).filter(Boolean).slice(0, 5000)
}

/** ---------- Local (respaldo) ---------- */

export function cargarNoAceptaLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function guardarNoAceptaLocal(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sanitizeItems(items)))
  } catch (err) {
    console.error('No se pudo guardar registros locales (no acepta fibra):', err)
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

export function exportarNoAceptaExcel(items, nombreArchivo = 'no-acepta-fibra.xls') {
  const escapeHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
  const cols = CAMPOS_NO_ACEPTA
  const headCols = [
    'Fecha registro',
    'Hora',
    'Asesor',
    'RUT asesor',
    ...cols.map(labelNoAcepta),
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

/** ---------- Firestore ---------- */

async function leerNoAceptaFirestore(db) {
  if (!db) return []
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db, FS_COLLECTION))
  const out = []
  snap.forEach((s) => {
    const reg = sanitizeNoAcepta({ ...(s.data() || {}), id: s.id })
    if (reg) out.push(reg)
  })
  return out
}

async function escribirNoAceptaFirestore(db, item) {
  if (!db) return false
  const { doc, setDoc } = await import('firebase/firestore')
  const clean = sanitizeNoAcepta(item)
  if (!clean) throw new Error('Datos de no acepta inválidos')
  await setDoc(doc(db, FS_COLLECTION, clean.id), clean, { merge: true })
  return true
}

/** Actualiza únicamente el estado en Firestore (sin tocar el resto del registro). */
async function actualizarEstadoNoAceptaFirestore(db, id, estado, actualizado) {
  if (!db) return false
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db, FS_COLLECTION, id), { estado, actualizado })
  return true
}

/**
 * Guarda un registro de no acepta (local + nube si hay Firestore).
 * @returns {Promise<{registro: object, cloud: boolean, cloudError?: string}>}
 */
export async function guardarNoAceptaFibra({ db, campos, email = '' }) {
  const ahora = new Date().toISOString()
  const registro = sanitizeNoAcepta({
    id: uid(),
    email,
    ...(campos || {}),
    creado: ahora,
    actualizado: ahora,
  })

  const local = mergePorId([registro], cargarNoAceptaLocal())
  guardarNoAceptaLocal(local)

  if (!db) return { registro, cloud: false, cloudError: 'Sin conexión a Firestore' }

  try {
    await escribirNoAceptaFirestore(db, registro)
    return { registro, cloud: true }
  } catch (err) {
    const cloudError = err?.code || err?.message || String(err)
    console.error('No acepta NO guardada en Firestore:', cloudError, err)
    return { registro, cloud: false, cloudError }
  }
}

/** Carga todos los registros (nube + respaldo local). */
export async function listarNoAceptaFibra(db) {
  if (!db) return sanitizeItems(cargarNoAceptaLocal())
  try {
    const remoto = await leerNoAceptaFirestore(db)
    const merged = mergePorId(cargarNoAceptaLocal(), remoto)
    guardarNoAceptaLocal(merged)
    return merged
  } catch (err) {
    console.warn('No se pudieron leer no acepta de la nube:', err?.message || err)
    return sanitizeItems(cargarNoAceptaLocal())
  }
}

/** Suscripción en tiempo real a la colección de no acepta. */
export function suscribirNoAceptaFibra(db, onData) {
  if (!db) return () => {}
  let unsub = () => {}
  import('firebase/firestore').then(({ collection, onSnapshot }) => {
    try {
      unsub = onSnapshot(
        collection(db, FS_COLLECTION),
        (snap) => {
          const docs = []
          snap.forEach((s) => {
            const reg = sanitizeNoAcepta({ ...(s.data() || {}), id: s.id })
            if (reg) docs.push(reg)
          })
          if (!docs.length) {
            onData(sanitizeItems(cargarNoAceptaLocal()))
            return
          }
          const merged = mergePorId(cargarNoAceptaLocal() || [], docs)
          guardarNoAceptaLocal(merged)
          onData(merged)
        },
        (err) => {
          console.warn(`onSnapshot no acepta falló:`, err?.message || err)
          onData(sanitizeItems(cargarNoAceptaLocal()))
        }
      )
    } catch (err) {
      console.warn(`No se pudo suscribir a no acepta:`, err?.message || err)
      onData(sanitizeItems(cargarNoAceptaLocal()))
    }
  })

  return () => unsub()
}

/** Elimina un registro (admin). */
export async function eliminarNoAceptaFibra(db, id) {
  const local = cargarNoAceptaLocal().filter((m) => m.id !== id)
  guardarNoAceptaLocal(local)
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