import { useEffect, useMemo, useState } from 'react'
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth'

import { verificarLectorApex, normalizarEmailMessenger, esCorreoApexAmerica } from './messengerStore'

/** Dominio corporativo admitido. */
export const DOMINIO_APEX = 'apexamerica.com'

/**
 * Instancia de Auth compartida para el messenger.
 * Se pasa la `firebaseApp` porque el resto del portal no usa Auth (solo /admin).
 */
export function useMessengerAuth(firebaseApp) {
  const auth = useMemo(() => (firebaseApp ? getAuth(firebaseApp) : null), [firebaseApp])
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!auth) {
      setUser(null)
      setCargando(false)
      return undefined
    }
    // Si el login volvió por redirect, consumimos el resultado para que no se
    // reprocese al recargar. `onAuthStateChanged` es quien publica el usuario.
    getRedirectResult(auth).catch(() => {})
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setCargando(false)
    })
  }, [auth])

  const email = normalizarEmailMessenger(user?.email || '')
  const verificado = user?.emailVerified === true
  return { auth, user, email, verificado, cargando }
}

function mensajeDeError(code) {
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

function proveedorGoogle() {
  const provider = new GoogleAuthProvider()
  // `select_account` obliga a Google a mostrar SIEMPRE el selector de cuentas,
  // para que la persona elija cuál usar. No pasamos `hd` a propósito: ese
  // parámetro le dice a Google "filtra por este dominio" y en la práctica
  // termina imponiendo el correo Apex por defecto (o incluso oculta cuentas
  // válidas si apexamerica.com no es un dominio de Google Workspace).
  // El dominio se valida después, en `validarSesionApex` y en las reglas.
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}

/**
 * Valida que la sesión de Google sirva para el messenger.
 * Exige tres cosas: correo del dominio, verificado por Google y registrado
 * en la colección `lectores` del portal.
 */
async function validarSesionApex(user) {
  if (!user) return { ok: false, motivo: 'No hay sesión activa' }
  const mail = normalizarEmailMessenger(user.email || '')
  if (!mail) return { ok: false, motivo: 'Google no devolvió el correo' }
  if (!esCorreoApexAmerica(mail)) {
    return {
      ok: false,
      motivo: `"${mail}" no cumple el requisito: se necesita un correo corporativo verificado por Google y registrado en el portal. Elige otra cuenta.`,
    }
  }
  if (user.emailVerified !== true) {
    return {
      ok: false,
      motivo: `Google no confirmó "${mail}" como verificado. Revisa tu cuenta e inténtalo de nuevo.`,
    }
  }
  return { ok: true, email: mail }
}

/** Inicia sesión con Google y devuelve el correo corporativo validado. */
export async function entrarConGoogle(auth, db) {
  if (!auth) throw new Error('Autenticación no disponible')
  const provider = proveedorGoogle()

  // Si había una sesión previa (p. ej. una cuenta que no es del dominio),
  // la cerramos para que Google muestre el selector y la persona pueda
  // elegir freely qué cuenta usar.
  if (auth.currentUser) {
    await signOut(auth).catch(() => {})
  }

  let user
  try {
    const cred = await signInWithPopup(auth, provider)
    user = cred.user
  } catch (err) {
    const code = err?.code || ''
    // Si el navegador bloquea la ventana, reintentamos con redirect.
    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw new Error(mensajeDeError(code))
  }

  const chequeo = await validarSesionApex(user)
  if (!chequeo.ok) {
    await signOut(auth)
    throw new Error(chequeo.motivo)
  }

  // El correo puede ser válido y aun así no estar en el portal.
  const lector = await verificarLectorApex(db, chequeo.email)
  if (!lector.ok) {
    await signOut(auth)
    throw new Error(lector.reason || 'Ese correo no está registrado en el portal')
  }

  return chequeo.email
}

export function salirMessenger(auth) {
  if (!auth) return Promise.resolve()
  return signOut(auth)
}
