/**
 * Tipificaciones personales por correo Apex.
 * Cada correo = su propio bloc tipo Excel (localStorage + Firestore).
 */

const LS_PREFIX = 'vtr-tipificaciones:'
const FS_COLLECTION = 'tipificaciones_bloc'

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tip_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

/** Separa fecha y hora en formato chileno (18-09-2026 / 7:08:18 p. m.). */
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
    second: '2-digit',
    hour12: true,
  })
  return { fecha, hora }
}

export const TIPOS_TIPIFICACION = {
  Basico: 'Plantilla General',
  N1: 'N1 Técnico',
  RequerimientoCritico: 'Requerimiento crítico',
  Genesys: 'Registro Genesys',
}

/** Etiquetas legibles de los campos de cada plantilla */
export const CAMPO_LABELS = {
  razon: 'Razón',
  servicioTipif: 'Servicio tipificación',
  motivo: 'Motivo',
  detalleRazon: 'Detalle razón',
  asesor: 'Asesor',
  rut: 'RUT',
  cliente: 'Nombre del cliente',
  nombre: 'Nombre del cliente',
  correo: 'Correo',
  inconveniente: 'Inconveniente',
  solucion: 'Solución',
  telefono: 'Teléfono',
  canal: 'Canal de ingreso',
  observacion: 'Observación',
  plataformaTitulo: 'Plataforma (título)',
  plataforma: 'Plataforma',
  marca: 'Marca',
  servicio: 'Servicio',
  servicioOpcion: 'Opción de servicio',
  tipoActividad: 'Tipo de actividad',
  usuarioCreador: 'Usuario creador',
  cel: 'Celular',
  pedido: 'Pedido',
  actividad: 'Actividad',
  comuna: 'Comuna',
  tecnologia: 'Tecnología',
  fecha: 'Fecha',
  bloque: 'Bloque',
  fechaDeseada: 'Fecha deseada',
  bloqueDeseado: 'Bloque deseado',
  supervisor: 'Supervisor',
  rutAsesor: 'RUT asesor',
  horaLlamada: 'Hora llamada',
  fechaLlamada: 'Fecha llamada',
  rutCliente: 'RUT cliente',
  telefonoCliente: 'Teléfono cliente',
  incidencia: 'Incidencia',
  idAndes: 'ID Andes',
  accion: 'Acción',
  capturaUrl: 'Captura',
}

export function labelCampo(key) {
  return CAMPO_LABELS[key] || key
}

function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function keyEmail(email) {
  return LS_PREFIX + normalizarEmail(email)
}

/** Firestore no acepta undefined; deja solo datos JSON-safe. */
function sanitizeFirestore(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

function sanitizeRegistro(registro) {
  const clean = sanitizeFirestore(registro)
  if (!clean || typeof clean !== 'object') return null
  if (!clean.id) clean.id = uid()
  if (!clean.campos || typeof clean.campos !== 'object') clean.campos = {}

  // Normalizar nombres a mayúsculas (para consistencia con asesores/migraciones)
  if (clean.campos?.asesor) {
    clean.campos.asesor = String(clean.campos.asesor).trim().toUpperCase()
  }
  if (clean.campos?.supervisor) {
    clean.campos.supervisor = String(clean.campos.supervisor).trim().toUpperCase()
  }
  if (clean.campos?.rutAsesor) {
    clean.campos.rutAsesor = String(clean.campos.rutAsesor).trim().toUpperCase()
  }

  clean.texto = String(clean.texto || '')
  clean.tipo = String(clean.tipo || '')
  clean.tipoLabel = String(clean.tipoLabel || clean.tipo || '')
  clean.email = normalizarEmail(clean.email)
  clean.creado = String(clean.creado || new Date().toISOString())
  const captura =
    String(clean.capturaUrl || clean.campos?.capturaUrl || '').trim()
  if (captura && /^https?:\/\//i.test(captura)) {
    clean.capturaUrl = captura.slice(0, 800)
    clean.campos = { ...clean.campos, capturaUrl: clean.capturaUrl }
  } else {
    delete clean.capturaUrl
    if (clean.campos?.capturaUrl) {
      const { capturaUrl: _drop, ...rest } = clean.campos
      clean.campos = rest
    }
  }
  return clean
}

function sanitizeItems(items) {
  return (items || []).map(sanitizeRegistro).filter(Boolean).slice(0, 400)
}

export function cargarTipificacionesLocal(email) {
  const correo = normalizarEmail(email)
  if (!correo) return []
  try {
    const raw = localStorage.getItem(keyEmail(correo))
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function guardarTipificacionesLocal(email, items) {
  const correo = normalizarEmail(email)
  if (!correo) return
  try {
    localStorage.setItem(keyEmail(correo), JSON.stringify(items))
  } catch (err) {
    console.error('No se pudo guardar tipificaciones locales:', err)
  }
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
    const tCreado = Date.parse(t.creado || 0) || 0
    const pCreado = Date.parse(prev.creado || 0) || 0
    if (tCreado >= pCreado) map.set(t.id, { ...prev, ...t })
  }
  return [...map.values()].sort((a, b) => {
    const da = Date.parse(a.creado || 0) || 0
    const db = Date.parse(b.creado || 0) || 0
    return db - da
  })
}

async function leerBlocFirestore(db, correo) {
  if (!db || !correo) return null
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db, FS_COLLECTION, correo))
  if (!snap.exists()) return null
  const data = snap.data() || {}
  return Array.isArray(data.items) ? data.items : []
}

async function escribirBlocFirestore(db, correo, items) {
  if (!db || !correo) return false
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const limpios = sanitizeItems(items)
  const payload = sanitizeFirestore({
    email: correo,
    items: limpios,
    actualizadoIso: new Date().toISOString(),
    total: limpios.length,
  })
  if (!payload) throw new Error('Datos de tipificación inválidos')

  await setDoc(
    doc(db, FS_COLLECTION, correo),
    {
      ...payload,
      actualizado: serverTimestamp(),
    },
    { merge: false }
  )
  return true
}

/**
 * Carga el bloc del correo Apex: une local + nube y deja cache local al día.
 */
export async function sincronizarTipificaciones(email, db) {
  const correo = normalizarEmail(email)
  if (!correo) return []

  const local = cargarTipificacionesLocal(correo)
  let remoto = []
  if (db) {
    try {
      remoto = (await leerBlocFirestore(db, correo)) || []
    } catch (err) {
      console.warn('No se pudo leer tipificaciones en la nube:', err?.message || err)
    }
  }

  const merged = sanitizeItems(mergePorId(local, remoto))
  guardarTipificacionesLocal(correo, merged)

  // Si hay datos locales nuevos que no estaban en nube, subir el bloc completo
  if (db && merged.length && JSON.stringify(merged) !== JSON.stringify(sanitizeItems(remoto))) {
    try {
      await escribirBlocFirestore(db, correo, merged)
    } catch (err) {
      console.error('No se pudo sincronizar tipificaciones a la nube:', err?.code || err?.message || err)
    }
  }

  return merged
}

/**
 * Guarda una tipificación en el bloc personal del correo Apex.
 * @returns {Promise<{registro: object, cloud: boolean, cloudError?: string}>}
 */
export async function guardarTipificacion({ email, tipo, campos, texto, db, capturaUrl }) {
  const correo = normalizarEmail(email)
  if (!correo) throw new Error('Necesitas identificarte con tu correo Apex')

  const captura = String(capturaUrl || campos?.capturaUrl || '').trim()
  const camposLimpios = { ...(campos || {}) }
  if (captura && /^https?:\/\//i.test(captura)) {
    camposLimpios.capturaUrl = captura.slice(0, 800)
  } else {
    delete camposLimpios.capturaUrl
  }

  const registro = sanitizeRegistro({
    id: uid(),
    email: correo,
    tipo,
    tipoLabel: TIPOS_TIPIFICACION[tipo] || tipo,
    campos: camposLimpios,
    texto: String(texto || ''),
    capturaUrl: camposLimpios.capturaUrl || '',
    creado: new Date().toISOString(),
  })

  const actuales = cargarTipificacionesLocal(correo)
  const siguiente = sanitizeItems([registro, ...actuales])
  guardarTipificacionesLocal(correo, siguiente)

  if (!db) {
    return { registro, cloud: false, cloudError: 'Sin conexión a Firestore' }
  }

  try {
    const remoto = (await leerBlocFirestore(db, correo)) || []
    const merged = sanitizeItems(mergePorId(siguiente, remoto))
    guardarTipificacionesLocal(correo, merged)
    await escribirBlocFirestore(db, correo, merged)
    return { registro, cloud: true }
  } catch (err) {
    const cloudError = err?.code || err?.message || String(err)
    console.error('Tipificación NO guardada en Firestore:', cloudError, err)
    return { registro, cloud: false, cloudError }
  }
}

export async function eliminarTipificacion(email, id, db) {
  const correo = normalizarEmail(email)
  const items = cargarTipificacionesLocal(correo).filter((t) => t.id !== id)
  guardarTipificacionesLocal(correo, items)

  if (db) {
    try {
      const remoto = (await leerBlocFirestore(db, correo)) || []
      const merged = mergePorId(items, remoto).filter((t) => t.id !== id)
      guardarTipificacionesLocal(correo, merged)
      await escribirBlocFirestore(db, correo, merged)
      return merged
    } catch (err) {
      console.warn('Eliminación solo local (Firestore no disponible):', err?.message || err)
    }
  }

  return items
}

/** @deprecated usar eliminarTipificacion */
export function eliminarTipificacionLocal(email, id) {
  const correo = normalizarEmail(email)
  const items = cargarTipificacionesLocal(correo).filter((t) => t.id !== id)
  guardarTipificacionesLocal(correo, items)
  return items
}

/** Orden de la plantilla: Asesor → RUT → Nombre → Correo → Inconveniente → Solución */
const ORDEN_CAMPOS = [
  'razon',
  'servicioTipif',
  'motivo',
  'detalleRazon',
  'supervisor',
  'asesor',
  'rutAsesor',
  'rut',
  'cliente',
  'nombre',
  'correo',
  'inconveniente',
  'solucion',
  'plataformaTitulo',
  'plataforma',
  'marca',
  'servicio',
  'servicioOpcion',
  'telefono',
  'canal',
  'observacion',
  'tipoActividad',
  'usuarioCreador',
  'cel',
  'pedido',
  'actividad',
  'comuna',
  'tecnologia',
  'fecha',
  'bloque',
  'fechaDeseada',
  'bloqueDeseado',
  'horaLlamada',
  'fechaLlamada',
  'rutCliente',
  'telefonoCliente',
  'idAndes',
  'incidencia',
  'accion',
  'capturaUrl',
]

export function columnasCamposDeItems(items) {
  const keys = new Set()
  for (const t of items) {
    Object.keys(t.campos || {}).forEach((k) => {
      const v = t.campos[k]
      if (v !== undefined && v !== null && String(v).trim() !== '') keys.add(k)
    })
  }
  const ordenados = ORDEN_CAMPOS.filter((k) => keys.has(k))
  const resto = [...keys].filter((k) => !ORDEN_CAMPOS.includes(k)).sort()
  return [...ordenados, ...resto]
}

/** Campos de un registro en el mismo orden que la plantilla / columnas. */
export function entradasCamposOrdenadas(campos) {
  const keys = Object.keys(campos || {}).filter((k) => {
    const v = campos[k]
    return v !== undefined && v !== null && String(v).trim() !== ''
  })
  const ordenados = ORDEN_CAMPOS.filter((k) => keys.includes(k))
  const resto = keys.filter((k) => !ORDEN_CAMPOS.includes(k))
  return [...ordenados, ...resto].map((k) => [k, campos[k]])
}

function valorCampo(campos, key) {
  const v = campos?.[key]
  if (v === undefined || v === null) return ''
  return String(v)
}

/** Exporta a CSV (Excel lo abre bien con BOM UTF-8) */
export function exportarTipificacionesCsv(items, nombreArchivo = 'tipificaciones.csv') {
  const cols = columnasCamposDeItems(items)
  const filas = [
    ['Fecha', 'Hora', 'Tipo', 'Correo Apex', ...cols.map(labelCampo), 'Texto completo'],
  ]
  for (const t of items) {
    const { fecha, hora } = partesFechaHora(t.creado)
    filas.push([
      fecha,
      hora,
      t.tipoLabel || t.tipo || '',
      t.email || '',
      ...cols.map((k) => valorCampo(t.campos, k)),
      String(t.texto || '').replace(/\r?\n/g, ' · '),
    ])
  }
  const escape = (cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`
  const csv = '\uFEFF' + filas.map((r) => r.map(escape).join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}

/** Exporta como .xls (tabla HTML que Excel abre) */
export function exportarTipificacionesExcel(items, nombreArchivo = 'tipificaciones.xls') {
  const escapeHtml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const cols = columnasCamposDeItems(items)
  const headCols = ['Fecha', 'Hora', 'Tipo', 'Correo Apex', ...cols.map(labelCampo), 'Texto completo']
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join('')

  const rows = items
    .map((t) => {
      const { fecha, hora } = partesFechaHora(t.creado)
      const cells = [
        fecha,
        hora,
        t.tipoLabel || t.tipo || '',
        t.email || '',
        ...cols.map((k) => valorCampo(t.campos, k)),
        String(t.texto || ''),
      ]
      return `<tr>${cells
        .map((c, i) =>
          i === cells.length - 1
            ? `<td>${escapeHtml(c).replace(/\n/g, '<br/>')}</td>`
            : `<td>${escapeHtml(c)}</td>`
        )
        .join('')}</tr>`
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

/**
 * Lista tipificaciones de todos los blocs (admin).
 * Por defecto solo correos @apexamerica.com.
 */
export async function listarTipificacionesAdmin(db, { dominio = 'apexamerica.com' } = {}) {
  if (!db) return []
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db, FS_COLLECTION))
  const out = []
  snap.forEach((s) => {
    const data = s.data() || {}
    const email = normalizarEmail(data.email || s.id)
    if (dominio && !email.endsWith(`@${dominio}`)) return
    for (const raw of data.items || []) {
      const reg = sanitizeRegistro({ ...raw, email })
      if (reg) out.push(reg)
    }
  })
  return out.sort((a, b) => {
    const da = Date.parse(a.creado || 0) || 0
    const dbTs = Date.parse(b.creado || 0) || 0
    return dbTs - da
  })
}

/** URL de captura de un registro (campo dedicado o dentro de campos). */
export function urlCapturaTipificacion(item) {
  const u = String(item?.capturaUrl || item?.campos?.capturaUrl || '').trim()
  return /^https?:\/\//i.test(u) ? u : ''
}
