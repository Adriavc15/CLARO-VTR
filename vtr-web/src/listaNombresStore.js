/**
 * Fábrica de listas de nombres administrables (asesores, supervisores, etc.).
 *
 * Cada lista se guarda en Firestore (una colección, un documento por nombre)
 * con respaldo en localStorage para trabajar sin conexión, y usa una lista
 * base (seed) definida en el código mientras no haya nada administrado.
 */

export function crearListaNombres({ coleccion, lsKey, seed = [], etiqueta = 'nombre' }) {
  const FS_COLLECTION = coleccion
  const LS_KEY = lsKey
  const SEED = seed

  /** Deja el nombre sin espacios dobles ni extremos. */
  function normalizarNombre(nombre) {
    return String(nombre || '').trim().replace(/\s+/g, ' ')
  }

  /** Clave para comparar/duplicar (sin tildes, sin mayúsculas, sin espacios extra). */
  function claveNombre(nombre) {
    return normalizarNombre(nombre)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  /** Identificador estable del documento (slug del nombre). */
  function idDe(nombre) {
    const base = claveNombre(nombre)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return base || `item_${Date.now()}`
  }

  function sanear(a) {
    const nombre = normalizarNombre(a?.nombre ?? a)
    if (!nombre) return null
    return { id: String(a?.id || idDe(nombre)), nombre, creado: String(a?.creado || '') }
  }

  function ordenar(lista) {
    return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
  }

  function seedOrdenado() {
    return ordenar(SEED.map((n) => sanear(n)).filter(Boolean))
  }

  /** ---------- Local (respaldo) ---------- */

  /** Lee la lista guardada localmente. Devuelve null si nunca se guardó nada
   * (permite distinguir «sin lista» de «lista vaciada a propósito»). */
  function leerLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw === null) return null
      const arr = JSON.parse(raw)
      if (!Array.isArray(arr)) return null
      return arr.map(sanear).filter(Boolean)
    } catch {
      return null
    }
  }

  function listarLocal() {
    return leerLocal() || []
  }

  function guardarLocal(lista) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(lista.map(sanear).filter(Boolean)))
    } catch (err) {
      console.error(`No se pudo guardar ${etiqueta} locales:`, err)
    }
  }

  /** Mezcla local + nube por nombre (sin duplicados). */
  function combinar(localItems, remotoItems) {
    const mapa = new Map()
    for (const a of [...(remotoItems || []), ...(localItems || [])]) {
      const s = sanear(a)
      if (!s) continue
      const k = claveNombre(s.nombre)
      const prev = mapa.get(k)
      mapa.set(k, prev ? { ...prev, ...s, id: prev.id || s.id } : s)
    }
    return ordenar([...mapa.values()])
  }

  /** ---------- Firestore ---------- */

  async function leerFirestore(db) {
    if (!db) return []
    const { collection, getDocs } = await import('firebase/firestore')
    const snap = await getDocs(collection(db, FS_COLLECTION))
    const out = []
    snap.forEach((s) => {
      const reg = sanear({ ...(s.data() || {}), id: s.id })
      if (reg) out.push(reg)
    })
    return out
  }

  async function escribirFirestore(db, item) {
    if (!db) return false
    const { doc, setDoc } = await import('firebase/firestore')
    const clean = sanear(item)
    if (!clean) throw new Error(`Nombre de ${etiqueta} inválido`)
    await setDoc(
      doc(db, FS_COLLECTION, clean.id),
      { nombre: clean.nombre, creado: clean.creado || new Date().toISOString(), actualizado: new Date().toISOString() },
      { merge: true }
    )
    return true
  }

  async function eliminarFirestore(db, id) {
    if (!db) return false
    const { doc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, FS_COLLECTION, id))
    return true
  }

  /** Lista completa (nube + respaldo local). Si no hay nada guardado, la base. */
  async function listar(db) {
    const local = leerLocal()
    const base = () => (local ? ordenar(local) : seedOrdenado())
    if (!db) return base()
    try {
      const remoto = await leerFirestore(db)
      const merged = combinar(local || [], remoto)
      if (merged.length) {
        guardarLocal(merged)
        return merged
      }
      return base()
    } catch (err) {
      console.warn(`No se pudieron leer ${etiqueta} de la nube:`, err?.message || err)
      return base()
    }
  }

  /** Suscripción en tiempo real. Si aún no hay nada administrado, la base. */
  function suscribir(db, onData) {
    const base = () => {
      const local = leerLocal()
      return local ? ordenar(local) : seedOrdenado()
    }

    if (!db) {
      onData(base())
      return () => {}
    }

    let unsub = () => {}
    import('firebase/firestore')
      .then(({ collection, onSnapshot }) => {
        try {
          unsub = onSnapshot(
            collection(db, FS_COLLECTION),
            (snap) => {
              const docs = []
              snap.forEach((s) => {
                const reg = sanear({ ...(s.data() || {}), id: s.id })
                if (reg) docs.push(reg)
              })
              if (!docs.length) {
                onData(base())
                return
              }
              const merged = combinar(leerLocal() || [], docs)
              guardarLocal(merged)
              onData(merged)
            },
            (err) => {
              console.warn(`onSnapshot ${etiqueta} falló:`, err?.message || err)
              onData(base())
            }
          )
        } catch (err) {
          console.warn(`No se pudo suscribir a ${etiqueta}:`, err?.message || err)
          onData(base())
        }
      })
      .catch(() => onData(base()))

    return () => unsub()
  }

  /**
   * Refleja en Firestore la lista local: crea los documentos que falten y
   * elimina los que ya no están.
   */
  async function sincronizarConNube(db, listaLocal) {
    if (!db) return false
    try {
      const remotos = await leerFirestore(db)
      const idsRemotos = new Set(remotos.map((r) => r.id))
      const idsLocales = new Set(listaLocal.map((a) => a.id))
      const pendientes = listaLocal.filter((a) => !idsRemotos.has(a.id))
      const sobrantes = remotos.filter((r) => !idsLocales.has(r.id))
      await Promise.all(pendientes.map((a) => escribirFirestore(db, a).catch(() => false)))
      await Promise.all(sobrantes.map((r) => eliminarFirestore(db, r.id).catch(() => false)))
      return true
    } catch (err) {
      console.warn(`No se pudieron sincronizar ${etiqueta} en Firestore:`, err?.message || err)
      return false
    }
  }

  /** Agrega un nombre. Evita duplicados (sin tildes ni mayúsculas). */
  async function agregar(db, nombre) {
    const clean = sanear({ nombre })
    if (!clean) throw new Error(`Ingresa el ${etiqueta}`)

    const actuales = await listar(db)
    const existe = actuales.some((a) => claveNombre(a.nombre) === claveNombre(clean.nombre))
    if (existe) return { item: clean, duplicado: true, cloud: false }

    const nuevo = { ...clean, creado: new Date().toISOString() }
    const local = combinar(actuales, [nuevo])
    guardarLocal(local)

    const cloud = await sincronizarConNube(db, local)
    return { item: nuevo, duplicado: false, cloud }
  }

  /** Renombra un nombre existente (nube + local). */
  async function renombrar(db, id, nombre) {
    const clean = sanear({ nombre })
    if (!clean) throw new Error(`Ingresa el ${etiqueta}`)

    const actuales = await listar(db)
    const actual = actuales.find((a) => a.id === id) || { id }
    const resto = actuales.filter((a) => a.id !== id)

    if (resto.some((a) => claveNombre(a.nombre) === claveNombre(clean.nombre))) {
      return { item: null, duplicado: true, cloud: false }
    }

    const actualizado = {
      id: idDe(clean.nombre),
      nombre: clean.nombre,
      creado: actual.creado || new Date().toISOString(),
    }
    const local = combinar(resto, [actualizado])
    guardarLocal(local)

    const cloud = await sincronizarConNube(db, local)
    return { item: actualizado, duplicado: false, cloud }
  }

  /** Elimina un nombre por id (nube + local). */
  async function eliminar(db, id) {
    const actuales = await listar(db)
    const objetivo = actuales.find((a) => a.id === id) || null
    const local = actuales.filter((a) => a.id !== id)
    guardarLocal(local)

    await sincronizarConNube(db, local)
    return { local, objetivo }
  }

  /** Reemplaza la lista administrada por la lista base. */
  async function restaurarBase(db) {
    const base = SEED.map((n, i) => ({ ...sanear(n), creado: new Date(Date.now() + i).toISOString() }))
    guardarLocal(base)
    await sincronizarConNube(db, base)
    return base
  }

  return {
    etiqueta,
    SEED,
    normalizarNombre,
    claveNombre,
    listarLocal,
    listar,
    suscribir,
    agregar,
    renombrar,
    eliminar,
    restaurarBase,
  }
}
