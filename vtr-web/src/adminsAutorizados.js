/**
 * Registro de administradores con acceso al panel VTR.
 * Colección Firestore 'admins_autorizados' (doc id = correo normalizado).
 *
 * El botón "Iniciar sesión con Google" del login de administración exige:
 *  1) correo del dominio @apexamerica.com verificado por Google, y
 *  2) correo agregado a este registro por el administrador principal.
 * Si no está en el registro, el dominio no alcanza: no entra al admin.
 */

import { normalizarEmail } from './migracionesStore'

const LS_KEY = 'vtr-admins-autorizados:local'
const FS_COLLECTION = 'admins_autorizados'

export const DOMINIO_ADMIN = 'apexamerica.com'
/** Único correo habilitado para agregar/quitar administradores. */
export const ADMIN_PRINCIPAL = 'adriangamervc@gmail.com'

export function esCorreoApexAdmin(email) {
  const e = normalizarEmail(email)
  return Boolean(e) && e.endsWith(`@${DOMINIO_ADMIN}`) && e.length > DOMINIO_ADMIN.length + 1
}

export function esAdminPrincipal(email) {
  return normalizarEmail(email) === normalizarEmail(ADMIN_PRINCIPAL)
}

/** ¿El correo pertenece a la lista de administradores registrados? */
export function esAdminRegistradoOn(admins, email) {
  const e = normalizarEmail(email)
  return (admins || []).some((a) => normalizarEmail(a) === e)
}

function sanitizeAdmins(list) {
  return Array.from(new Set((list || []).map(normalizarEmail).filter(Boolean))).slice(0, 500)
}

/** ---------- Local (respaldo) ---------- */

export function cargarAdminsLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return sanitizeAdmins(Array.isArray(arr) ? arr : [])
  } catch {
    return []
  }
}

function guardarAdminsLocal(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(sanitizeAdmins(list)))
  } catch (err) {
    console.error('No se pudo guardar el registro local de administradores:', err)
  }
}

/** ---------- Firestore ---------- */

function emailsFromSnap(snap) {
  const out = []
  snap.forEach((s) => {
    const mail = normalizarEmail((s.data && s.data().email) || s.id)
    if (mail) out.push(mail)
  })
  return sanitizeAdmins(out)
}

/** Suscripción en tiempo real al registro de administradores. */
export function suscribirAdmins(db, onData) {
  if (!db) {
    onData(cargarAdminsLocal())
    return () => {}
  }
  let unsub = () => {}
  import('firebase/firestore').then(({ collection, onSnapshot }) => {
    try {
      unsub = onSnapshot(
        collection(db, FS_COLLECTION),
        (snap) => {
          const merged = sanitizeAdmins([...new Set([...emailsFromSnap(snap), ...cargarAdminsLocal()])])
          guardarAdminsLocal(merged)
          onData(merged)
        },
        (err) => console.warn('onSnapshot admins autorizados falló:', err?.message || err)
      )
    } catch (err) {
      console.warn('No se pudo suscribir al registro de administradores:', err?.message || err)
    }
  })
  return () => unsub()
}

/** ¿El correo está autorizado para entrar al admin? (nube primero, local como respaldo) */
export async function existeAdminAutorizado(db, email) {
  const clave = normalizarEmail(email)
  if (!clave) return false
  if (db) {
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const snap = await getDoc(doc(db, FS_COLLECTION, clave))
      if (snap.exists()) return true
    } catch (err) {
      console.warn('No se pudo consultar el registro en la nube:', err?.message || err)
    }
  }
  return cargarAdminsLocal().includes(clave)
}

/** Agrega un administrador al registro (solo @apexamerica.com). */
export async function agregarAdminAutorizado(db, email, agregadoPor = '') {
  const clave = normalizarEmail(email)
  if (!clave) throw new Error('Ingresa un correo válido.')
  if (!esCorreoApexAdmin(clave)) {
    throw new Error(`Solo se admiten correos del dominio @${DOMINIO_ADMIN}.`)
  }
  const local = sanitizeAdmins([...cargarAdminsLocal(), clave])
  guardarAdminsLocal(local)
  if (db) {
    try {
      const { collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore')
      await setDoc(
        doc(db, FS_COLLECTION, clave),
        { email: clave, agregadoPor: normalizarEmail(agregadoPor), creado: serverTimestamp() },
        { merge: true }
      )
    } catch (err) {
      console.warn('Administrador agregado solo localmente (nube no disponible):', err?.message || err)
    }
  }
  return local
}

/** Quita un administrador del registro. */
export async function eliminarAdminAutorizado(db, email) {
  const clave = normalizarEmail(email)
  const local = cargarAdminsLocal().filter((m) => m !== clave)
  guardarAdminsLocal(local)
  if (db && clave) {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      await deleteDoc(doc(db, FS_COLLECTION, clave))
    } catch (err) {
      console.warn('Administrador eliminado solo localmente (nube no disponible):', err?.message || err)
    }
  }
  return local
}

function mensajeErrorGoogle(code) {
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Se canceló el inicio de sesión con Google'
    case 'auth/popup-blocked':
    case 'auth/operation-not-supported-in-this-environment':
      return 'El navegador bloqueó la ventana de Google. Reintenta o usa el botón de nuevo.'
    case 'auth/account-exists-with-different-credential':
      return 'Ese correo ya está registrado con otro método de acceso'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.'
    case 'auth/network-request-failed':
      return 'Sin conexión con el servidor'
    case 'auth/unauthorized-domain':
      return 'Esa cuenta no está autorizada para iniciar sesión en este portal'
    case 'auth/operation-not-allowed':
      return 'El proveedor de Google no está habilitado en el proyecto'
    default:
      return 'No se pudo iniciar sesión con Google'
  }
}

/**
 * Valida la sesión de Google para el panel de administración:
 * dominio @apexamerica.com + verificado + presente en el registro.
 */
async function validarAdminGoogle(db, user) {
  if (!user) return { ok: false, motivo: 'No hay sesión activa' }
  const mail = normalizarEmail(user.email || '')
  if (!mail) return { ok: false, motivo: 'Google no devolvió el correo' }
  if (!esCorreoApexAdmin(mail)) {
    return {
      ok: false,
      motivo: `"${mail}" no cumple el requisito: solo se admiten correos corporativos @${DOMINIO_ADMIN} verificados por Google. Elige otra cuenta.`,
    }
  }
  if (user.emailVerified !== true) {
    return {
      ok: false,
      motivo: `Google no confirmó "${mail}" como verificado. Revisa tu cuenta e inténtalo de nuevo.`,
    }
  }
  const registrado = await existeAdminAutorizado(db, mail)
  if (!registrado) {
    return {
      ok: false,
      motivo: 'Usted no es administrador. Cuidado, no intentes ingresar si no estás registrado y sin autorización.',
    }
  }
  return { ok: true, email: mail }
}

/**
 * Inicia sesión con Google y devuelve el correo corporativo ya validado.
 * Lanza Error con el motivo si no puede entrar; devuelve null si pasó a
 * flujo de redirección (popup bloqueado).
 */
export async function entrarConGoogleAdmin(auth, db) {
  if (!auth) throw new Error('Autenticación no disponible')
  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } = await import('firebase/auth')

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  if (auth.currentUser) {
    await signOut(auth).catch(() => {})
  }

  let user
  try {
    const cred = await signInWithPopup(auth, provider)
    user = cred.user
  } catch (err) {
    const code = (err && err.code) || ''
    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw new Error(mensajeErrorGoogle(code))
  }

  const chequeo = await validarAdminGoogle(db, user)
  if (!chequeo.ok) {
    await signOut(auth)
    throw new Error(chequeo.motivo)
  }
  return chequeo.email
}
