// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo, memo } from 'react'
import { createPortal } from 'react-dom'
import { Phone, PhoneCall, Mail, Lock, User, Link, Image, Calendar, AlertCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, LayoutDashboard, Settings, Users, Database, Globe, Monitor, Shield, CreditCard, Search, Menu, X, Home, Zap, Moon, Sun, GraduationCap, Coins, ClipboardList, Copy, Save, CheckCircle2, AlertTriangle, Truck, Unplug, Plug, Server, Cable, Eye, ListChecks, Bell, Trash2, Upload, ExternalLink, Pencil, Receipt, FileText, Wifi, Download, RefreshCw, MessageSquare, ListOrdered, Router, EyeOff, Tv } from 'lucide-react'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, getDoc, query, orderBy, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import AsistentePasos from './components/AsistentePasos'
import GenesysSimulador from './components/GenesysSimulador'
import MedidorVelocidad from './components/MedidorVelocidad'
import ChatbotAndes from './components/ChatbotAndes'
import ModalSomosClave from './components/ModalSomosClave'
import TipificacionesPanel from './components/TipificacionesPanel'
import MessengerApex from './components/MessengerApex'
import AplicacionesExcel from './components/AplicacionesExcel'
import AndroidTvInterface from './components/AndroidTvInterface'
import AndesSimulador from './components/AndesSimulador'
import IconoAndroid from './components/IconoAndroid'
import BuscadorTipificacion from './components/BuscadorTipificacion'
import {
  guardarTipificacion,
  listarTipificacionesAdmin,
  exportarTipificacionesExcel,
  exportarTipificacionesCsv,
} from './tipificacionesStore'
import { rutaTipificacion } from './tipificacionesCatalogo'
import {
  CONTROL_REMOTO_IMG_BASE,
  CAMBIO_PLAN_IMG_BASE,
  DBOX_PASOS_IMG_BASE,
  ASISTENCIA_VTR_IMG_BASE,
  controlRemotoPasos,
  cambioPlanPasos,
  dboxPasos,
  asistenciaVtrPasos,
} from './asistente/guiasPortal'
import { IDS_CLAVE_SEED, cargarIdsClave } from './asistente/idsClaveLive'
import { gruposDesdeSeed, suscribirPlanes } from './asistente/planesLive'
import { PLANES_CLARO } from './asistente/planesClaro'
import { grilla, grillaModal, normalizaCanal, REGIONES_VTR, REGION_VTR_POR_DEFECTO } from './asistente/grillaCanales'
import { CABLE_PACKS, logoCanal, packsDeGrilla } from './asistente/packsCable'
import { avatarImgProps } from './asistente/messengerAvatar'
import { nombreDesdeEmail } from './messengerStore'
import { useMessengerAuth } from './messengerAuth'
import { SHOWCASE_SEED, suscribirShowcaseStreaming } from './asistente/streamingShowcaseLive'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTS2289cU0WwQQH9X6m2r0DdgqAgVAK0I",
  authDomain: "vtrclaroo-3c572.firebaseapp.com",
  projectId: "vtrclaroo-3c572",
  storageBucket: "vtrclaroo-3c572.firebasestorage.app",
  messagingSenderId: "417392161995",
  appId: "1:417392161995:web:3301a4bb068814a497974e",
  measurementId: "G-MJLB9JM182"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)

// URL de la aplicación web de Google Apps Script (termina en /exec).
// Pega aquí la URL que obtengas al publicar el script (ver CODIGO_APPS_SCRIPT_GOOGLE_SHEETS.gs)
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw9YoO7pCH6bVb0gjSuOvDMhbpqtxjtt1Xdg0c8ZcXJuaHgFRIpOamDL-uKRlqHukQ/exec'

// Envía los datos del formulario a Google Sheets (Apps Script web app)
const guardarEnSheets = async (data) => {
  try {
    const body = new URLSearchParams(data)
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    return true
  } catch (err) {
    console.error('Error al guardar en sheets:', err)
    return false
  }
}

/** Guarda tipificación personal (sin Google Sheets) y navega a la pestaña Tipificaciones */
const enviarTipificacionPersonal = async ({
  correoApex,
  tipo,
  campos,
  texto,
  capturaUrl,
  onEnviado,
  setModal,
}) => {
  if (!correoApex) {
    setModal?.({
      tipo: 'error',
      titulo: 'Falta tu sesión',
      mensaje:
        'Inicia sesión con tu cuenta de Google corporativa (correo verificado y registrado en el portal) para guardar tipificaciones en tu bloc personal. El correo del portal ya no alcanza: el bloc solo se abre con tu sesión verificada.',
    })
    return false
  }
  try {
    const result = await guardarTipificacion({
      email: correoApex,
      tipo,
      campos,
      texto,
      capturaUrl,
      db,
    })
    if (result?.cloud === false) {
      console.error('[Tipificaciones] Falló sync Firestore:', result.cloudError)
      // Aviso visible aunque luego navegue a Tipificaciones
      window.setTimeout(() => {
        window.alert(
          `Tipificación guardada en este equipo, pero NO en Firestore.\n\n${result.cloudError || 'Error desconocido'}\n\nRevisa la colección tipificaciones_bloc en Firebase.`
        )
      }, 400)
    }
    onEnviado?.()
    return true
  } catch (err) {
    setModal?.({
      tipo: 'error',
      titulo: 'No se pudo guardar',
      mensaje: err?.message || 'Error al guardar la tipificación.',
    })
    return false
  }
}

// Publica una noticia en Firestore (tiempo real).
const publicarNoticia = async ({ categoria, titulo, descripcion, driveUrl, popup }) => {
  try {
    const src = (driveUrl || '').trim()
    await addDoc(collection(db, 'noticias'), {
      categoria,
      titulo,
      descripcion: descripcion || '',
      src,
      driveUrl: src,
      popup: popup === true,
      fecha: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      creado: serverTimestamp(),
    })
    return true
  } catch (err) {
    console.error('Error al publicar noticia:', err)
    return false
  }
}

// Elimina una noticia de Firestore por su id.
const eliminarNoticia = async (id) => {
  try {
    await deleteDoc(doc(db, 'noticias', id))
    return true
  } catch (err) {
    console.error('Error al eliminar noticia:', err)
    return false
  }
}

// Actualiza una noticia existente en Firestore por su id.
const actualizarNoticia = async ({ id, categoria, titulo, descripcion, driveUrl, popup }) => {
  try {
    const src = (driveUrl || '').trim()
    await updateDoc(doc(db, 'noticias', id), {
      categoria,
      titulo,
      descripcion: descripcion || '',
      src,
      driveUrl: src,
      popup: popup === true,
    })
    return true
  } catch (err) {
    console.error('Error al actualizar noticia:', err)
    return false
  }
}

// Suscripción en tiempo real a la colección "noticias" (más nuevas primero).
// Devuelve la función para cancelar la suscripción.
export const suscribirNoticias = (onData) => {
  const q = query(collection(db, 'noticias'), orderBy('creado', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const items = []
      snap.forEach((d) => {
        const data = d.data()
        items.push({
          ...data,
          id: d.id,
          src: data.src || '',
          driveUrl: data.driveUrl || data.src || '',
          titulo: data.titulo || data.alt || '',
          alt: data.alt || data.titulo || '',
          categoria: data.categoria || '',
          descripcion: data.descripcion || '',
          fecha: data.fecha || '',
          popup: data.popup === true,
        })
      })
      onData(items)
    },
    (err) => {
      console.error('Error al leer noticias de Firestore:', err)
      onData([])
    }
  )
}

// Guarda la foto de usuario del administrador en Firestore (por UID).
export const guardarPerfilAdmin = async (uid, { avatarUrl, avatarHistorial }) => {
  try {
    const payload: any = {
      avatarUrl: String(avatarUrl || '').trim().slice(0, 800),
      actualizado: serverTimestamp(),
    }
    if (avatarHistorial !== undefined) {
      payload.avatarHistorial = normalizarHistorialAvatares(avatarHistorial, avatarUrl)
    }
    await setDoc(doc(db, 'adminProfile', uid), payload, { merge: true })
    return true
  } catch (err) {
    console.error('Error al guardar perfil de admin:', err)
    return false
  }
}

// Suscripción en tiempo real al perfil del administrador autenticado.
export const suscribirPerfilAdmin = (uid, onData) => {
  return onSnapshot(
    doc(db, 'adminProfile', uid),
    (snap) => onData(snap.exists() ? snap.data() : {}),
    (err) => {
      console.error('Error al leer perfil de admin:', err)
      onData({})
    }
  )
}

// Correos autorizados para confirmar la lectura de los comunicados.
// El id del documento es el propio correo en minúsculas.
export const normalizarEmail = (email) => (email || '').trim().toLowerCase()

export const suscribirLectores = (onData) => {
  return onSnapshot(
    collection(db, 'lectores'),
    (snap) => {
      const items = []
      snap.forEach((d) => {
        const data = d.data() || {}
        items.push({
          id: d.id,
          email: data.email || d.id,
          avatarUrl: data.avatarUrl || '',
        })
      })
      items.sort((a, b) => a.email.localeCompare(b.email))
      onData(items)
    },
    (err) => {
      console.error('Error al leer los correos de lectores:', err)
      onData([])
    }
  )
}

export const agregarLector = async (email) => {
  const clave = normalizarEmail(email)
  if (!clave) return false
  try {
    await setDoc(doc(db, 'lectores', clave), { email: clave, creado: serverTimestamp() }, { merge: true })
    return true
  } catch (err) {
    console.error('Error al agregar el correo:', err)
    return false
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Extrae correos desde texto (saltos, comas, ; o espacios). */
export const extraerEmailsDeTexto = (texto) => {
  const raw = String(texto || '')
    .split(/[\s,;]+/)
    .map(normalizarEmail)
    .filter(Boolean)
  const unicos = []
  const vistos = new Set()
  for (const email of raw) {
    if (vistos.has(email)) continue
    vistos.add(email)
    unicos.push(email)
  }
  return unicos
}

/** Agrega varios correos en lotes (máx. 400 por batch). */
export const agregarLectores = async (emails) => {
  const lista = [...new Set((emails || []).map(normalizarEmail).filter(Boolean))]
  const validos = lista.filter((e) => EMAIL_REGEX.test(String(e)))
  const invalidos = lista.filter((e) => !EMAIL_REGEX.test(String(e)))
  if (!validos.length) {
    return { ok: false, agregados: 0, invalidos, total: 0 }
  }
  try {
    const CHUNK = 400
    for (let i = 0; i < validos.length; i += CHUNK) {
      const batch = writeBatch(db)
      for (const email of validos.slice(i, i + CHUNK)) {
        batch.set(doc(db, 'lectores', String(email)), { email, creado: serverTimestamp() }, { merge: true })
      }
      await batch.commit()
    }
    return { ok: true, agregados: validos.length, invalidos, total: validos.length }
  } catch (err) {
    console.error('Error al agregar correos en lote:', err)
    return { ok: false, agregados: 0, invalidos, total: validos.length }
  }
}

export const eliminarLector = async (email) => {
  try {
    await deleteDoc(doc(db, 'lectores', normalizarEmail(email)))
    return true
  } catch (err) {
    console.error('Error al eliminar el correo:', err)
    return false
  }
}

// Comprueba si el correo está habilitado para confirmar lecturas.
export const existeLector = async (email) => {
  const clave = normalizarEmail(email)
  if (!clave) return false
  try {
    const snap = await getDoc(doc(db, 'lectores', clave))
    return snap.exists()
  } catch (err) {
    console.error('Error al verificar el correo:', err)
    return false
  }
}

const MAX_AVATARES_HISTORIAL = 16
const LS_AVATARES = (email) => `vtr-lector-avatares:${normalizarEmail(email)}`
const LS_AVATARES_ADMIN = (uid) => `vtr-admin-avatares:${String(uid || '').trim()}`

export function normalizarHistorialAvatares(urls, extra = '') {
  const list = [...(Array.isArray(urls) ? urls : []), extra]
    .map((u) => String(u || '').trim())
    .filter(
      (u) =>
        u.length <= 800 &&
        (/^https?:\/\//i.test(u) || /^\/messenger\.png(\?hue=\d+)?$/i.test(u))
    )
  return [...new Set(list)].slice(0, MAX_AVATARES_HISTORIAL)
}

export function cargarHistorialAvataresLocal(email) {
  if (!normalizarEmail(email)) return []
  try {
    const raw = localStorage.getItem(LS_AVATARES(email))
    const arr = raw ? JSON.parse(raw) : []
    return normalizarHistorialAvatares(arr)
  } catch {
    return []
  }
}

export function guardarHistorialAvataresLocal(email, urls) {
  const clean = normalizarHistorialAvatares(urls)
  try {
    localStorage.setItem(LS_AVATARES(email), JSON.stringify(clean))
  } catch {
    /* ignore */
  }
  return clean
}

export function cargarHistorialAvataresAdmin(uid) {
  if (!String(uid || '').trim()) return []
  try {
    const raw = localStorage.getItem(LS_AVATARES_ADMIN(uid))
    const arr = raw ? JSON.parse(raw) : []
    return normalizarHistorialAvatares(arr)
  } catch {
    return []
  }
}

export function guardarHistorialAvataresAdminLocal(uid, urls) {
  const clean = normalizarHistorialAvatares(urls)
  try {
    if (String(uid || '').trim()) {
      localStorage.setItem(LS_AVATARES_ADMIN(uid), JSON.stringify(clean))
    }
  } catch {
    /* ignore */
  }
  return clean
}

/** Lee el perfil del lector (avatar, etc.). */
export const cargarPerfilLector = async (email) => {
  const clave = normalizarEmail(email)
  if (!clave) return null
  try {
    const snap = await getDoc(doc(db, 'lectores', clave))
    if (!snap.exists()) return null
    const data = snap.data() || {}
    return {
      email: data.email || clave,
      avatarUrl: String(data.avatarUrl || '').trim(),
      avatarHistorial: normalizarHistorialAvatares(data.avatarHistorial, data.avatarUrl),
      popupsVistos: Array.isArray(data.popupsVistos)
        ? [...new Set(data.popupsVistos.filter((id) => typeof id === 'string' && id))].slice(0, 200)
        : [],
    }
  } catch (err) {
    console.error('Error al leer perfil de lector:', err)
    return null
  }
}

/** Guarda foto de perfil del lector (solo correo, sin Auth Firebase). */
export const guardarPerfilLector = async (email, { avatarUrl }) => {
  const clave = normalizarEmail(email)
  if (!clave) return false
  try {
    const ref = doc(db, 'lectores', clave)
    const snap = await getDoc(ref)
    if (!snap.exists()) return false
    await setDoc(
      ref,
      {
        avatarUrl: String(avatarUrl || '').trim().slice(0, 800),
        actualizado: serverTimestamp(),
      },
      { merge: true }
    )
    return true
  } catch (err) {
    console.error('Error al guardar perfil de lector:', err)
    return false
  }
}

/** Historial de fotos usadas. Si las reglas aún no lo permiten, no rompe el avatar actual. */
export const guardarHistorialAvatares = async (email, urls) => {
  const clave = normalizarEmail(email)
  if (!clave) return false
  const avatarHistorial = normalizarHistorialAvatares(urls)
  try {
    const ref = doc(db, 'lectores', clave)
    const snap = await getDoc(ref)
    if (!snap.exists()) return false
    await setDoc(ref, { avatarHistorial, actualizado: serverTimestamp() }, { merge: true })
    return true
  } catch {
    return false
  }
}

const LS_POPUPS_VISTOS = (email) => `vtr-popups-vistos:${normalizarEmail(email)}`

export function leerPopupsVistosLocal(email) {
  const clave = normalizarEmail(email)
  if (!clave) return []
  try {
    const raw = localStorage.getItem(LS_POPUPS_VISTOS(clave))
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? [...new Set(arr.filter((id) => typeof id === 'string' && id))] : []
  } catch {
    return []
  }
}

export function guardarPopupsVistosLocal(email, ids) {
  const clave = normalizarEmail(email)
  if (!clave) return
  try {
    localStorage.setItem(LS_POPUPS_VISTOS(clave), JSON.stringify([...new Set(ids)].slice(0, 200)))
  } catch {
    /* ignore */
  }
}

export const cargarPopupsVistos = async (email, noticiaIds = []) => {
  const clave = normalizarEmail(email)
  if (!clave) return []
  const vistos = new Set(leerPopupsVistosLocal(clave))
  try {
    const perfil = await cargarPerfilLector(clave)
    ;(perfil?.popupsVistos || []).forEach((id) => vistos.add(id))
  } catch {
    /* ignore */
  }
  await Promise.all(
    (noticiaIds || []).map(async (id) => {
      if (!id || vistos.has(id)) return
      try {
        const snap = await getDoc(doc(db, 'lecturas', `${id}__${clave}`))
        if (snap.exists()) vistos.add(id)
      } catch {
        /* sin permiso o red: se usa el historial local / perfil */
      }
    })
  )
  const lista = [...vistos]
  guardarPopupsVistosLocal(clave, lista)
  return lista
}

export const guardarPopupsVistosLector = async (email, ids) => {
  const clave = normalizarEmail(email)
  if (!clave) return false
  const popupsVistos = [...new Set((ids || []).filter((id) => typeof id === 'string' && id))].slice(0, 200)
  guardarPopupsVistosLocal(clave, popupsVistos)
  try {
    const ref = doc(db, 'lectores', clave)
    const snap = await getDoc(ref)
    if (!snap.exists()) return false
    await setDoc(ref, { popupsVistos, actualizado: serverTimestamp() }, { merge: true })
    return true
  } catch {
    return false
  }
}

// Registra que un correo vio un comunicado (una fila por correo y comunicado).
export const registrarLectura = async (noticiaId, email) => {
  const clave = normalizarEmail(email)
  if (!noticiaId || !clave) return false
  const prev = leerPopupsVistosLocal(clave)
  guardarPopupsVistosLocal(clave, [...prev, noticiaId])
  try {
    await setDoc(
      doc(db, 'lecturas', `${noticiaId}__${clave}`),
      {
        noticiaId,
        email: clave,
        fecha: new Date().toLocaleString('es-CL'),
        visto: serverTimestamp(),
      },
      { merge: true }
    )
    return true
  } catch (err) {
    console.error('Error al registrar la lectura:', err)
    return false
  }
}

export const suscribirLecturas = (onData) => {
  return onSnapshot(
    collection(db, 'lecturas'),
    (snap) => {
      const items = []
      snap.forEach((d) => {
        const data = d.data()
        items.push({ id: d.id, noticiaId: data.noticiaId || '', email: data.email || '', fecha: data.fecha || '' })
      })
      onData(items)
    },
    (err) => {
      console.error('Error al leer las lecturas:', err)
      onData([])
    }
  )
}

// imgbb es el servicio de subida del portal. Las imágenes quedan alojadas y se
// sirven desde su CDN i.ibb.co, que es la única URL que se guarda en Firestore.
const IMGBB_API_KEY = '27a975d7c50c5282d8f5403ce786fa4b'
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'
const IMGBB_CDN = 'i.ibb.co'
const MAX_URL_IMG = 800

function archivoABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const raw = String(reader.result || '')
      const base64 = raw.includes(',') ? raw.split(',')[1] : raw
      if (!base64) {
        reject(new Error('No se pudo leer la imagen.'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

/** imgbb devuelve `display_url` (conExt) y `url` (corta). Nos quedamos con la de i.ibb.co. */
function urlImgbbACdn(valor) {
  const u = String(valor || '').trim()
  if (!u) return ''
  const https = u.startsWith('http://') ? `https://${u.slice(7)}` : u
  if (!/^https:\/\//i.test(https)) return ''
  try {
    const parsed = new URL(https)
    if (parsed.hostname.toLowerCase() === IMGBB_CDN) return parsed.toString()
    // Cualquier otro host de imgbb se reescribe al CDN oficial.
    if (/(^|\.)(ibb\.co|imgbb\.com)$/i.test(parsed.hostname)) {
      const destino = `${parsed.protocol}//${IMGBB_CDN}${parsed.pathname}${parsed.search}`
      return destino
    }
    return ''
  } catch {
    return ''
  }
}

/** Sube imagen a imgbb (i.ibb.co) y devuelve la URL https corta, apta para Firestore. */
export const subirImagenImgbb = async (file) => {
  if (!IMGBB_API_KEY) {
    throw new Error('Falta configurar la API key de imgbb.com en el código (IMGBB_API_KEY).')
  }
  if (!file) throw new Error('No hay archivo para subir.')

  const base64 = await archivoABase64(file)
  const body = new FormData()
  body.append('key', IMGBB_API_KEY)
  body.append('image', base64)
  if (file.name) body.append('name', String(file.name).replace(/\.\w+$/, '').slice(0, 80))

  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 90000) : null
  let data
  try {
    const r = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body,
      signal: ctrl?.signal,
    })
    data = await r.json().catch(() => null)
    if (!r.ok) {
      const msg = data?.error?.message || `Error HTTP ${r.status} al subir la imagen`
      throw new Error(msg)
    }
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('La subida tardó demasiado. Prueba una imagen más liviana.')
    if (err?.message) throw err
    throw new Error('No se pudo subir la imagen a imgbb.')
  } finally {
    if (timer) clearTimeout(timer)
  }

  if (!(data && data.success && data.data)) {
    throw new Error(data?.error?.message || 'Respuesta inválida de imgbb.')
  }

  // Candidatas en orden de preferencia: la corta de i.ibb.co primero.
  const candidatas = [data.data.url, data.data.display_url, data.data.image?.url]
  let url = ''
  for (const c of candidatas) {
    const norm = urlImgbbACdn(c)
    if (norm && norm.length <= MAX_URL_IMG) {
      url = norm
      break
    }
  }
  if (!url) {
    // Sin candidato válido en i.ibb.co: se acepta display_url para no perder la subida.
    const crudo = String(data.data.display_url || data.data.url || '').trim()
    const https = crudo.startsWith('http://') ? `https://${crudo.slice(7)}` : crudo
    if (!/^https:\/\//i.test(https)) throw new Error('URL de imagen inválida.')
    if (https.length > MAX_URL_IMG) throw new Error('El enlace de la imagen es demasiado largo.')
    url = https
  }
  return url
}

// Hook para detectar si es dispositivo móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth < 768
      setIsMobile(isMobileDevice)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Componente memorizado del video de YouTube (evita recarga al re-renderizar el layout)
const VideoFrame = memo(({ src, title }: any) => (
  <iframe
    width="560"
    height="315"
    src={src}
    title={title}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
    className="absolute inset-0 w-full h-full"
  />
))

/** Logos monocromos (SVG): se muestran más grandes y se invierten en tema oscuro */
const logoMonocromo = (platform) => /\.svg(\?|$)/i.test(String((platform && platform.logo) || ''))

/** Ancho del logo dentro de la tarjeta del showcase (los logos horizontales necesitan más ancho) */
const anchoLogoShowcase = (platform) => {
  const name = String((platform && platform.name) || '')
  if (/tnt/i.test(name)) return '58%'
  if (logoMonocromo(platform)) return '45%'
  return undefined
}

// Tarjeta contenedora reutilizable
const ModernCard = ({ children, className = '', hover = true }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}>
    {children}
  </div>
)

// Enlaces de activación por plataforma y empresa: cada botón abre la web donde se activa.
const STREAM_ACTIVACION_VTR = [
  { id: 'netflix', name: 'Netflix', logo: '/stream/netflix.png', href: 'https://vtr.com/netflix' },
  { id: 'disney', name: 'Disney+', logo: '/stream/disney.png', href: 'https://vtr.com/disneyplus' },
  { id: 'hbo-max', name: 'HBO Max', logo: '/stream/hbo-max.png', href: 'https://vtr.com/hbomax' },
  { id: 'tnt-sports', name: 'TNT Sports', logo: '/tntsports.png', href: 'https://www.hbomax.com/cl/es/activatntsports' },
  { id: 'prime-video', name: 'Prime Video', logo: '/stream/prime-video.png', href: 'https://vtr.com/primevideo' },
  { id: 'universal', name: 'Universal+', logo: '/stream/universal.png', href: 'https://vtr.com/universal' },
  { id: 'atresplayer', name: 'Atresplayer', logo: '/stream/atresplayer.png', href: 'https://vtr.com/atresplayer' },
  { id: 'cindie', name: 'Cindie', logo: '/stream/cindie.png', href: 'https://vtr.com/cindie' },
  { id: 'riivi', name: 'Riivi', logo: '/stream/riivi.png', href: 'https://vtr.com/riivi' },
  { id: 'teatrix', name: 'Teatrix', logo: '/stream/teatrix.png', href: 'https://vtr.com/teatrix' },
]

const STREAM_ACTIVACION_CLARO = [
  { id: 'netflix', name: 'Netflix', logo: '/stream/netflix.png', href: 'https://www.clarochile.cl/personas/netflix/' },
  { id: 'disney', name: 'Disney+', logo: '/stream/disney.png', href: 'https://www.clarochile.cl/personas/disney/' },
  { id: 'hbo-max', name: 'HBO Max', logo: '/stream/hbo-max.png', href: 'https://www.clarochile.cl/personas/hbomax/' },
  { id: 'prime-video', name: 'Prime Video', logo: '/stream/prime-video.png', href: 'https://www.clarochile.cl/personas/prime/' },
  { id: 'universal', name: 'Universal+', logo: '/stream/universal.png', href: 'https://www.clarochile.cl/personas/universal/' },
  { id: 'crunchyroll', name: 'Crunchyroll', logo: '/crunchyroll.png', href: 'https://www.clarochile.cl/personas/crunchyroll/' },
  { id: 'tnt-sports', name: 'TNT Sports', logo: '/tntsports.png', href: 'https://www.clarochile.cl/personas/tntsports/' },
  { id: 'atresplayer', name: 'Atresplayer', logo: '/stream/atresplayer.png', href: 'https://www.clarochile.cl/personas/atresplayer' },
  { id: 'riivi', name: 'Riivi', logo: '/stream/riivi.png', href: 'https://www.clarochile.cl/personas/riivi/' },
  { id: 'cindie', name: 'Cindie', logo: '/stream/cindie.png', href: 'https://www.clarochile.cl/personas/cindie' },
  { id: 'teatrix', name: 'Teatrix', logo: '/stream/teatrix.png', href: 'https://www.clarochile.cl/personas/teatrix/' },
  { id: 'tvn-play', name: 'TVN Play', logo: '/stream/tvn-play.png', href: 'https://www.clarochile.cl/personas/tvnplay/' },
  { id: 'storytel', name: 'Storytel', logo: '/STORYTEL.png', href: 'https://www.clarochile.cl/personas/storytel/' },
  { id: 'ondamedia', name: 'OndaMedia', logo: '/onmedia.png', href: 'https://www.clarochile.cl/personas/ondamedia/' },
]

const BotonActivarStreaming = ({ platform, marca }) => (
  <a
    href={platform.href}
    target="_blank"
    rel="noopener noreferrer"
    title={`Activar ${platform.name} en ${marca}`}
    className="group relative flex items-center justify-center rounded-xl cursor-pointer hover:scale-105 focus-visible:scale-105 transition-transform"
    style={{ width: 'clamp(4.5rem, 11vw, 7rem)', height: 'clamp(2.75rem, 6.5vw, 4rem)' }}
  >
    {platform.logo ? (
      <img
        src={platform.logo}
        alt={platform.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain scale-105"
        onError={(e) => { e.target.style.display = 'none' }}
      />
    ) : (
      <span className="px-1 text-center text-[10px] lg:text-xs font-bold leading-tight text-gray-700 dark:text-gray-200">{platform.name}</span>
    )}
    <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-900 ring-1 ring-gray-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 z-20 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600">
      {platform.name}
    </span>
  </a>
)

/** Fila de plataformas con su enlace de activación, una para VTR y otra para Claro */
const BloqueActivarStreaming = ({ marca, plataformas }) => (
  <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 pb-4 pt-7 lg:px-5 lg:pb-6 lg:pt-9">
    <p className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-0.5 text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100">
      Activar en {marca}
    </p>
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-6 lg:gap-x-5 lg:gap-y-8">
      {plataformas.map((platform) => (
        <BotonActivarStreaming key={`${marca}-${platform.id}`} platform={platform} marca={marca} />
      ))}
    </div>
  </div>
)

// Sección de Streaming: tarjetas Netflix / Disney+ / Crunchyroll / TNT / Pack Adulto (fotos editables en admin)
const StreamingSection = ({ setModalImage, setModalSize, setModalDisableZoom }) => {
  const [platforms, setPlatforms] = useState(SHOWCASE_SEED)
  useEffect(() => {
    const unsub = suscribirShowcaseStreaming(db, setPlatforms)
    return () => unsub && unsub()
  }, [])

  return (
  <div className="space-y-6 lg:space-y-8">
    {/* Banner Principal */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <img
        src="/Gemini_Generated_Image_bcgx93bcgx93bcgx.jpg"
        alt="Gemini Generated Image"
        className="w-full h-auto object-cover"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300"><rect fill="%23f3f4f6" width="1200" height="300"/><text fill="%236b7280" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
        }}
      />
    </div>

    <ModernCard>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-6">
      {platforms.map((platform) => (
        <div
          key={platform.id || platform.name}
          className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer aspect-[16/9] relative group"
          onClick={() => {
            setModalDisableZoom(true)
            setModalImage(platform.img)
            setModalSize('large')
          }}
          title={platform.name}
        >
          <img
            src={platform.img}
            alt={platform.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-15 transition-opacity duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect fill="%23f3f4f6" width="800" height="450"/><text fill="%236b7280" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={platform.logo || platform.img}
              alt={platform.name}
              style={{ width: anchoLogoShowcase(platform) }}
              className={`w-1/3 h-auto object-contain drop-shadow-xl ${/tnt/i.test(platform.name) ? 'tnt-logo' : ''} ${logoMonocromo(platform) ? 'dark:invert dark:brightness-0' : ''}`}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <BloqueActivarStreaming
        marca="VTR"
        plataformas={STREAM_ACTIVACION_VTR}
      />
      <BloqueActivarStreaming
        marca="Claro"
        plataformas={STREAM_ACTIVACION_CLARO}
      />
    </div>

    <div className="mt-8 space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          <VideoFrame
            src="https://www.youtube.com/embed/MFO2sm01GHk?si=Qs6dw4ml42Fh8aNo"
            title="Video de ayuda"
          />
        </div>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          <VideoFrame
            src="https://www.youtube.com/embed/jEKyJogpzSg?si=vofW_YNZCUC0H1lv"
            title="Video de ayuda OTP"
          />
        </div>
      </div>

      <div className="flex items-center border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-xl px-3 py-2 lg:px-5 lg:py-3">
        <div className="flex items-start gap-2 lg:gap-3">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5 lg:hidden" />
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5 hidden lg:block" />
          <p className="text-xs lg:text-base text-black dark:text-gray-100">
            <span className="font-semibold">Transferir a OTT</span> en caso el cliente haya intentado ingresar a la sucursal virtual y no le permite activar la cuenta de su plataforma de streaming, previamente verificado que lo tenga en su plan actual.
          </p>
        </div>
      </div>
    </div>
  </ModernCard>
</div>
  )
}

// Normaliza texto para búsqueda: minúsculas y sin tildes
const normalize = (str) => String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const formatBoldText = (text) => {
  const parts = String(text).split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

const formatNewsText = (text) => {
  if (!text) return null
  const formatted = formatBoldText(text)
  return <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{formatted}</div>
}

// Grilla de planes (tarjetas apiladas en móvil y grilla en desktop, sin tablas)
const PlanTable = ({ data, showPromo, q = '', tag = '', onSelect }) => {
  const term = normalize(q)
  const match = (row) => !term || normalize(`${row.comercial} ${row.andes} ${(row.tags || []).join(' ')} ${tag}`).includes(term)
  const rows = term ? data.filter(match) : data
  const highlighted = (row) => term && match(row)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
      {rows.length === 0 && (
        <div className="md:col-span-2 xl:col-span-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-500 dark:text-gray-400">Sin coincidencias en este grupo.</div>
      )}
      {rows.map((row, index) => (
        <button
          type="button"
          key={index}
          onClick={() => onSelect?.(row, tag)}
          className={`plan-hover text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition-all cursor-pointer hover:shadow-md focus:outline-none ${highlighted(row) ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-900' : ''}`}
        >
          <div className="flex items-start justify-between gap-1.5">
            <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
              {tag && <span className={`inline-flex items-center justify-center mr-1.5 w-6 h-6 lg:w-7 lg:h-7 rounded-full text-white text-[10px] lg:text-xs font-bold align-middle whitespace-nowrap shrink-0 ${tag === '2P' ? 'bg-gradient-to-r from-yellow-400 to-blue-600' : tag === '3P' ? 'bg-gradient-to-r from-red-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-blue-600'}`}>{tag === 'Legacy' ? 'L' : tag}</span>}
              {row.comercial}
            </p>
            <span className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {(row.streams || []).length > 0 && (
                <span className="flex items-center justify-end gap-1.5" title="Streaming incluido">
                {(row.streams || []).map((src, i) => (
                  <span key={i} className="relative group">
                      <img src={src} alt={STREAM_NAMES[src] || 'Streaming'} loading="lazy" className="h-4 w-4 lg:h-5 lg:w-5 rounded object-contain bg-white dark:bg-gray-900/40" onError={(e) => { e.target.style.display = 'none' }} />
                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-20 dark:bg-gray-100 dark:text-gray-900">
                      {STREAM_NAMES[src] || src}
                    </span>
                  </span>
                ))}
              </span>
            )}
            </span>
          </div>
          <p className="mt-1 text-xs lg:text-sm leading-relaxed text-gray-500 dark:text-gray-400">{row.andes}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="plan-normal-pill inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100">
              Normal: {row.normal || '—'}
            </span>
            {showPromo && row.promo && row.promo !== row.normal && (
              <span className="plan-promo-pill inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold">
                Promo: {row.promo}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

const TV_PREMIUM_I_STREAMS = ['/stream/disney.png', '/stream/hbo-max.png', '/stream/prime-video.png', '/stream/atresplayer.png', '/stream/universal.png', '/stream/cindie.png', '/stream/riivi.png', '/stream/teatrix.png']

const TV_PREMIUM_II_STREAMS = ['/stream/netflix.png', '/stream/hbo-max.png', '/stream/prime-video.png', '/stream/atresplayer.png', '/stream/universal.png', '/stream/cindie.png', '/stream/riivi.png', '/stream/teatrix.png']

const TV_FULL_STREAMS = ['/stream/disney.png', '/stream/netflix.png', '/stream/hbo-max.png', '/stream/prime-video.png', '/stream/atresplayer.png', '/stream/universal.png', '/stream/cindie.png', '/stream/riivi.png', '/stream/teatrix.png']

const STREAM_NAMES = {
  '/stream/disney.png': 'Disney+',
  '/stream/netflix.png': 'Netflix',
  '/stream/hbo-max.png': 'HBO Max',
  '/stream/prime-video.png': 'Prime Video',
  '/stream/atresplayer.png': 'Atresplayer',
  '/stream/universal.png': 'Universal+',
  '/stream/cindie.png': 'Cindie',
  '/stream/riivi.png': 'Riivi',
  '/stream/teatrix.png': 'Teatrix',
}

// Paquetes de canales cable (packs extra) + logos: viven en asistente/packsCable.js

const TV_PLAN_META = {
  inicia: { label: 'TV Inicia', canales: '74 canales', hd: '57 HD', incluyeExtras: false },
  plus: { label: 'TV Plus', canales: '101 canales', hd: '82 HD', incluyeExtras: true },
  premium: { label: 'TV Premium', canales: '101 canales', hd: '82 HD', incluyeExtras: true },
  premium2: { label: 'TV Premium 2', canales: '101 canales', hd: '82 HD', incluyeExtras: true },
  full: { label: 'TV Full / Premium 3', canales: '74 canales', hd: '68 HD', incluyeExtras: true },
}

const FIBRA_META = {
  '600': { label: 'Fibra 600 Megas', andes: 'Fibra Hogar' },
  '800': { label: 'Fibra 800 Megas', andes: 'Fibra Avanzado' },
  '940': { label: 'Fibra 940 Megas', andes: 'Fibra Experto' },
}

const detectarTvKey = (texto) => {
  const n = normalize(texto)
  if (n.includes('inicia')) return 'inicia'
  if (n.includes('full') || n.includes('premium 3') || n.includes('residencial 3')) return 'full'
  if (n.includes('premium ii') || n.includes('premium 2') || n.includes('residencial 2')) return 'premium2'
  if (n.includes('premium')) return 'premium'
  if (n.includes('tv plus') || n.includes('stream tv plus')) return 'plus'
  return null
}

const detectarFibraKey = (texto) => {
  const n = normalize(texto)
  if (n.includes('940')) return '940'
  if (n.includes('800')) return '800'
  if (n.includes('600')) return '600'
  return null
}

/** TV de Claro: TV Full comparte la grilla de VTR TV Full; TV Inicia tiene la suya */
const CLARO_TV_META = {
  inicia: { label: 'TV Inicia', canales: '77 canales', hd: '66 HD', fuenteGrilla: 'claro:inicia' },
  plus: { label: 'TV Plus', canales: null, hd: null, fuenteGrilla: null },
  premium: { label: 'TV Premium', canales: null, hd: null, fuenteGrilla: null },
  premium2: { label: 'TV Premium 2', canales: null, hd: null, fuenteGrilla: null },
  full: { label: 'TV Full', canales: '74 canales', hd: '68 HD', fuenteGrilla: 'claro:full' },
}

const detectarTvClaro = (texto) => {
  const n = normalize(texto)
  if (n.includes('tv inicia')) return 'inicia'
  if (n.includes('tv full') || n.includes('premium 3')) return 'full'
  if (n.includes('premium ii') || n.includes('premium 2')) return 'premium2'
  if (n.includes('tv plus')) return 'plus'
  if (n.includes('tv premium')) return 'premium'
  return null
}

const detalleDesdeComercial = (row, tag = '') => {
  const titulo = row.comercial || row.plan || row.planCable || ''
  const n = normalize(titulo)
  const fibraKey = detectarFibraKey(titulo)
  const tvKey = detectarTvKey(titulo)
  const tieneFono = n.includes('telefonia') || n.includes('fono') || !!row.fono
  const streams = row.streams || []
  const tv = tvKey ? { ...TV_PLAN_META[tvKey], key: tvKey } : null
  const fibra = fibraKey ? { ...FIBRA_META[fibraKey], key: fibraKey } : null
  const incluyeExtras = tv ? tv.incluyeExtras : false

  return {
    tipo: 'comercial',
    titulo,
    subtitulo: row.andes || row.modalidad || '',
    tag,
    normal: row.normal || row.precio || null,
    promo: row.promo || null,
    detalle: row.detalle || null,
    fibra,
    tv,
    fono: tieneFono,
    streams,
    incluyeExtras,
    canales: tv?.canales || null,
    hd: tv?.hd || null,
    fuenteGrilla: tvKey === 'full' ? 'vtr:full' : null,
  }
}

const detalleDesdeCable = (row) => {
  const tvKey = detectarTvKey(row.plan)
  return {
    tipo: 'cable',
    titulo: row.plan,
    subtitulo: row.modalidad,
    tag: 'Cable',
    normal: row.precio,
    promo: null,
    detalle: row.detalle,
    fibra: null,
    tv: {
      label: row.plan,
      canales: row.canales,
      hd: row.hd,
      incluyeExtras: row.incluyeExtras,
      key: tvKey || (row.incluyeExtras ? 'plus' : 'inicia'),
    },
    fono: false,
    streams: row.streams || [],
    incluyeExtras: row.incluyeExtras,
    canales: row.canales,
    hd: row.hd,
    fuenteGrilla: tvKey === 'full' ? 'vtr:full' : null,
  }
}

const detalleDesdeClaro = (row) => {
  const tvKey = detectarTvClaro(row.comercial)
  const tv = tvKey ? { ...CLARO_TV_META[tvKey], key: tvKey } : null
  const tieneFibra = !!row.megas && row.megas !== '-'
  return {
    tipo: 'claro',
    titulo: row.comercial,
    subtitulo: row.andes,
    tag: row.pack,
    normal: row.precio,
    promo: row.promo && row.promo !== '-' ? row.promo : null,
    detalle: [row.tecnologia, tieneFibra ? row.megas : null].filter(Boolean).join(' · '),
    fibra: tieneFibra ? { label: row.megas, key: null } : null,
    tv,
    fono: /telefon/i.test(row.comercial),
    streams: [],
    incluyeExtras: tvKey && tvKey !== 'inicia',
    canales: tv?.canales || null,
    hd: tv?.hd || null,
    descuento: row.descuento && row.descuento !== '-' ? row.descuento : null,
    fuenteGrilla: tv?.fuenteGrilla || null,
  }
}

const StreamIcon = ({ src, muted = false }) => {
  const name = STREAM_NAMES[src] || src
  return (
    <span className="relative group inline-flex">
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        className={`h-8 w-8 rounded object-contain ${muted ? 'opacity-40' : ''}`}
        onError={(e) => { e.target.style.display = 'none' }}
      />
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/15 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-20">
        {name}
      </span>
    </span>
  )
}

const inicialesCanal = (nombre) =>
  String(nombre || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** Grilla de logos: cada canal es una casilla con su logo y el número debajo */
const GrillaLogos = ({ canales, muted = false, conNumero = false }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5">
    {canales.map(({ n, canal, muted: itemMuted, premium, retirado, nota }) => {
      const logo = logoCanal(canal)
      const atenuado = muted || itemMuted
      const etiquetas = [
        n != null ? `Canal ${n}` : null,
        canal,
        nota,
        premium ? 'Premium' : null,
        retirado ? 'Fuera de circulación' : null,
      ]
        .filter(Boolean)
        .join(' · ')
      return (
        <div
          key={`${n || ''}-${canal}`}
          title={etiquetas}
          className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 ${
            atenuado ? 'bg-white/5 opacity-45' : 'bg-white/10 hover:bg-white/15'
          } transition-colors`}
        >
          {premium && (
            <span className="absolute right-1 top-1 rounded-full bg-amber-400/25 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-amber-200">
              Prem
            </span>
          )}
          {retirado && (
            <span className="absolute left-1 top-1 rounded-full bg-rose-500/25 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-rose-200">
              Fuera
            </span>
          )}
          {logo ? (
            <img
              src={logo}
              alt={canal || `Canal ${n}`}
              loading="lazy"
              className="h-7 w-7 object-contain"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[10px] font-bold text-white/60">
              {inicialesCanal(canal)}
            </span>
          )}
          <span className="w-full truncate text-center text-[10px] leading-tight text-white/75">{canal || 'Sin nombre'}</span>
          {conNumero && n != null && <span className="font-mono text-[9px] text-white/40">{n}</span>}
        </div>
      )
    })}
  </div>
)

const GrillaCanalesTV = ({ clave, titulo, resumen, incluidos, declarado }) => {
  const [abierto, setAbierto] = useState(false)
  const [soloHd, setSoloHd] = useState(false)
  const [region, setRegion] = useState(REGION_VTR_POR_DEFECTO)
  const meta = useMemo(() => (clave ? grilla(clave) : null), [clave])
  // El modal muestra la guía oficial del proveedor: los números del dial del
  // cliente, no los de la imagen de la grilla del portal. La ciudad desdobla los
  // diales que VTR numera distinto por región.
  const datos = useMemo(() => grillaModal(meta?.guia, { region }), [meta, region])
  const packs = useMemo(() => (clave ? packsDeGrilla(clave) : { incluidos: [], excluidos: [] }), [clave])

  const senales = datos ? datos.senales : []
  const conflictosAbiertos = datos?.conflictos?.filter((c) => !c.resuelto) || []
  const incluyePacks = incluidos !== undefined ? incluidos : packs.incluidos.length > 0

  const base = (soloHd ? senales.filter((s) => s.hd) : senales).map((s) => ({
    n: s.n,
    canal: s.canal,
    muted: false,
    premium: s.premium,
    retirado: s.retirado,
    nota: s.nota,
  }))
  const yaEnGrilla = new Set(senales.map((s) => normalizaCanal(s.canal)))
  const extras = CABLE_PACKS.flatMap((p) => p.items)
    .filter((item) => !yaEnGrilla.has(normalizaCanal(item)))
    .map((item) => ({ canal: item, muted: !incluyePacks }))

  const tituloGrilla = titulo || (meta ? `Grilla ${meta.proveedor} · ${meta.paquete}` : 'Grilla de canales')
  const conteo = datos?.conteo
  const resumenTexto =
    resumen || (conteo ? `${conteo.canales} canales · ${conteo.hd} HD` : `${extras.length} canales`)

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <ListOrdered size={18} className="shrink-0 text-white/55" />
          <span className="font-bold text-sm lg:text-base text-white truncate">{tituloGrilla}</span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-white/55">{resumenTexto}</span>
          {abierto ? <ChevronDown size={18} className="text-white/55" /> : <ChevronRight size={18} className="text-white/55" />}
        </span>
      </button>

      {abierto && (
        <div className="mt-3 space-y-4">
          {conteo && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                <Tv size={12} /> {conteo.canales} canales
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                {conteo.hd} HD · {conteo.sd} SD
              </span>
              {conteo.premium > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-200/90">
                  {conteo.premium} premium
                </span>
              )}
              {conteo.retirados > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-200/90">
                  {conteo.retirados} fuera de circulación
                </span>
              )}
              <button
                type="button"
                onClick={() => setSoloHd((v) => !v)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10 transition-colors"
              >
                {soloHd ? <EyeOff size={12} /> : <Eye size={12} />}
                {soloHd ? 'Ver todos' : 'Solo HD'}
              </button>
            </div>
          )}

          {!!datos?.regiones?.length && (
            <label className="flex items-center gap-2 text-[11px] text-white/55">
              <span className="font-semibold uppercase tracking-wide">Ciudad</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/90 outline-none focus:border-white/40"
              >
                {datos.regiones.map((r) => (
                  <option key={r.clave} value={r.clave} className="bg-neutral-900 text-white">
                    {r.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="max-h-72 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">
            <GrillaLogos canales={[...base, ...extras]} conNumero={!!datos} />
          </div>

          {!!conflictosAbiertos?.length && (
            <div className="space-y-1 rounded-xl bg-amber-400/10 p-3 ring-1 ring-amber-400/20">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-200/90">
                Números por confirmar
              </p>
              {conflictosAbiertos.map((c) => (
                <p key={c.senales.join('-')} className="text-[11px] leading-snug text-amber-100/80">
                  <span className="font-mono">{c.senales.join(', ')}</span> — {c.detalle}
                </p>
              ))}
              <p className="text-[11px] text-amber-100/60">
                Confirmar en vtr.com/guia-canales con la comuna del cliente antes de informar un número.
              </p>
            </div>
          )}

          <p className="text-[11px] text-white/45">
            {datos
              ? `Números de canal de la guía oficial de ${datos.proveedor}. Cada proveedor tiene su propia numeración: un mismo número puede ser una señal distinta en VTR y en Claro.`
              : 'Canales de los packs de cable. Este plan no tiene guía de canales por número.'}
          </p>

          {datos &&
            declarado?.canales &&
            parseInt(String(declarado.canales), 10) !== datos.conteo.canales && (
              <p className="text-[11px] leading-snug text-amber-100/70">
                El plan declara {declarado.canales}
                {declarado.hd ? ` (${declarado.hd})` : ''} y la guía detalla {datos.conteo.canales}. La guía de{' '}
                {datos.proveedor} no está separada por plan, así que no se puede afirmar qué señales entran en este
                paquete puntualmente.
              </p>
            )}
        </div>
      )}
    </div>
  )
}

const StatModal = ({ label, value, highlight = false }) => (
  <div
    className={`flex min-w-[86px] flex-col items-center gap-0.5 rounded-2xl px-3.5 py-2 text-center ${
      highlight ? 'bg-emerald-500/15 ring-1 ring-emerald-400/30' : 'bg-white/5'
    }`}
  >
    <span className="text-[10px] font-semibold uppercase tracking-wide text-white/50">{label}</span>
    <span className={`text-sm lg:text-base font-bold ${highlight ? 'text-emerald-300' : 'text-white'}`}>{value}</span>
  </div>
)

const PillModal = ({ Icon, label, value, muted = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs lg:text-sm ${
      muted ? 'bg-white/5 text-white/55' : 'bg-white/10 text-white/85'
    }`}
  >
    {Icon && <Icon size={13} className="shrink-0 opacity-70" />}
    <span className="font-semibold">{label}</span>
    {value && <span className="opacity-90">{value}</span>}
  </span>
)

const SeccionModal = ({ Icon, titulo, children }) => (
  <section className="space-y-3">
    <div className="flex items-center justify-center gap-2">
      <Icon size={16} className="text-white/45" />
      <h4 className="text-xs font-bold uppercase tracking-widest text-white/70">{titulo}</h4>
    </div>
    {children}
  </section>
)

const PlanDetalleModal = ({ detalle, onClose }) => {
  useEffect(() => {
    if (!detalle) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [detalle, onClose])

  if (!detalle) return null

  const streams = detalle.streams || []
  const streamsExcluidos = TV_FULL_STREAMS.filter((src) => !streams.includes(src))
  const tieneTv = !!detalle.tv
  const tieneFibra = !!detalle.fibra
  const incluyePacks = !!detalle.incluyeExtras
  const tagClass = detalle.tag === '2P'
    ? 'bg-gradient-to-r from-yellow-400 to-blue-600'
    : detalle.tag === '3P'
      ? 'bg-gradient-to-r from-red-500 to-blue-600'
      : detalle.tag === '1P'
        ? 'bg-gradient-to-r from-green-500 to-blue-600'
        : 'bg-gray-500'

  const incluidos = []
  if (tieneFibra) {
    incluidos.push({
      Icon: Wifi,
      label: 'Internet',
      value: `${detalle.fibra.label}${detalle.fibra.andes ? ` · ${detalle.fibra.andes}` : ''}`,
    })
  }
  if (tieneTv) {
    incluidos.push({
      Icon: Tv,
      label: 'Televisión',
      value: detalle.tv.canales ? `${detalle.tv.label} · ${detalle.tv.canales} / ${detalle.tv.hd}` : detalle.tv.label,
    })
  }
  if (detalle.fono) incluidos.push({ Icon: Phone, label: 'Telefonía', value: 'Línea fija incluida' })
  if (streams.length > 0) {
    incluidos.push({ Icon: Monitor, label: 'Streaming', value: `${streams.length} plataforma${streams.length > 1 ? 's' : ''}` })
  }

  const excluidos = []
  if (!tieneFibra) excluidos.push({ label: 'Internet fibra', value: 'No incluido' })
  if (!tieneTv) excluidos.push({ label: 'Televisión / grilla cable', value: 'No incluida' })
  if (!detalle.fono && (detalle.tag === '1P' || detalle.tag === '2P' || detalle.tipo === 'cable')) {
    excluidos.push({ label: 'Telefonía fija', value: 'No incluida' })
  }

  // El detalle de los planes cable repite "74 canales · 68 HD", que ya va en las
  // tarjetas de arriba: acá queda solo la parte informativa.
  const resumenDetalle = (() => {
    let out = detalle.detalle || ''
    if (!out) return ''
    if (detalle.canales) out = out.replace(`${detalle.canales} · `, '')
    if (detalle.hd) out = out.replace(`${detalle.hd} · `, '')
    return out.replace(/\s*·\s*$/, '').trim()
  })()

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      style={{ top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', minHeight: '100vh' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[28px] bg-[#1a1a1a]/75 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex items-center justify-center w-9 h-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="shrink-0 px-6 pt-6 pb-4 text-center border-b border-white/10">
          {detalle.tag && (
            <div className="flex justify-center mb-2.5">
              {detalle.tag === 'Cable' ? (
                <span className="inline-flex items-center justify-center w-7 h-7 shrink-0" title="Cable">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4379/4379155.png"
                    alt="Cable"
                    className="w-5 h-5 object-contain brightness-0 invert"
                  />
                </span>
              ) : (
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold ${tagClass}`}>
                  {detalle.tag}
                </span>
              )}
            </div>
          )}
          <h3 className="text-lg lg:text-xl font-bold text-white leading-snug px-8">{detalle.titulo}</h3>
          {detalle.subtitulo && (
            <p className="mt-1 text-xs lg:text-sm text-white/55">{detalle.subtitulo}</p>
          )}
          {resumenDetalle && <p className="mt-1 text-[11px] text-white/40">{resumenDetalle}</p>}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-5 space-y-7 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-white/90 [&_strong]:text-white [&_.text-gray-900]:text-white [&_.text-gray-100]:text-white [&_.text-gray-700]:text-white/85 [&_.text-gray-200]:text-white/85 [&_.text-gray-600]:text-white/60 [&_.text-gray-300]:text-white/60 [&_.text-gray-500]:text-white/50 [&_.text-gray-400]:text-white/50 [&_.text-gray-800]:text-white">
          {(detalle.normal || detalle.canales || detalle.hd || detalle.descuento) && (
            <div className="flex flex-wrap items-stretch justify-center gap-2">
              {detalle.normal && <StatModal label="Precio normal" value={detalle.normal} />}
              {detalle.promo && detalle.promo !== detalle.normal && (
                <StatModal label="Promo" value={detalle.promo} highlight />
              )}
              {detalle.canales && <StatModal label="Canales" value={detalle.canales} />}
              {detalle.hd && <StatModal label="HD" value={detalle.hd} />}
              {detalle.descuento && <StatModal label="Descuento" value={detalle.descuento} />}
            </div>
          )}

          <SeccionModal Icon={CheckCircle2} titulo="Incluye">
            <div className="flex flex-wrap justify-center gap-2">
              {incluidos.map((it) => (
                <PillModal key={it.label} Icon={it.Icon} label={it.label} value={it.value} />
              ))}
              {incluidos.length === 0 && (
                <span className="text-xs text-white/50">Sin componentes detectados.</span>
              )}
            </div>
            {streams.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {streams.map((src) => (
                  <StreamIcon key={src} src={src} />
                ))}
              </div>
            )}
          </SeccionModal>

          {detalle.fuenteGrilla && (
            <GrillaCanalesTV
              clave={detalle.fuenteGrilla}
              titulo={`Guía de canales ${detalle.tipo === 'claro' ? 'Claro' : 'VTR'}`}
              resumen={detalle.canales && detalle.hd ? `${detalle.canales} · ${detalle.hd}` : undefined}
              declarado={{ canales: detalle.canales, hd: detalle.hd }}
            />
          )}
          {tieneTv && !detalle.fuenteGrilla && (
            <GrillaCanalesTV
              clave={detalle.tipo === 'claro' ? 'claro:full' : 'vtr:full'}
              titulo={`Grilla ${detalle.tv.label}`}
              resumen={detalle.canales && detalle.hd ? `${detalle.canales} · ${detalle.hd}` : undefined}
              incluidos={incluyePacks}
              declarado={{ canales: detalle.canales, hd: detalle.hd }}
            />
          )}

          <SeccionModal Icon={AlertCircle} titulo="No incluye">
            <div className="flex flex-wrap justify-center gap-2">
              {excluidos.map((it) => (
                <PillModal key={it.label} label={it.label} value={it.value} muted />
              ))}
              {tieneTv && incluyePacks && streamsExcluidos.length > 0 && (
                <p className="w-full text-center text-xs text-white/50">
                  No excluye paquetes de canales cable (HBO, Discovery, ESPN y otros). Solo quedan fuera las plataformas
                  de streaming listadas abajo.
                </p>
              )}
              {tieneTv && incluyePacks && streamsExcluidos.length === 0 && (
                <p className="w-full text-center text-xs text-white/50">
                  Sin exclusiones de grilla ni streaming del pack Full.
                </p>
              )}
              {streamsExcluidos.length > 0 && (
                <div className="w-full flex flex-col items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/35">
                    Streaming no incluido
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {streamsExcluidos.map((src) => (
                      <StreamIcon key={src} src={src} muted />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SeccionModal>
        </div>
      </div>
    </div>,
    document.body
  )
}
const faviconFor = (url) => {
  try {
    return 'https://www.google.com/s2/favicons?domain=' + new URL(url).hostname + '&sz=64'
  } catch {
    return ''
  }
}

// Tile de recurso/herramienta con pinta de aplicación (cuadrado sin marco)
const LinkTile = ({ name, url, Icon, favicon }) => {
  const [imgError, setImgError] = useState(false)
  const iconSrc = favicon || faviconFor(url)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 w-fit group"
    >
      <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 overflow-hidden">
        {!imgError && iconSrc ? (
          <img src={iconSrc} alt={name} loading="lazy" className="w-full h-full object-contain" onError={() => setImgError(true)} />
        ) : (
          <Icon size={20} className="text-gray-600 dark:text-gray-300" />
        )}
      </span>
      <span className="text-[11px] font-bold tracking-widest text-gray-900 dark:text-gray-100 leading-tight text-center max-w-24">{name}</span>
    </a>
  )
}

// Sección de Planes Comerciales (1P, 2P y 3P) — catálogo editable desde el admin
const PlanesComerciales = () => {
  const [grupos, setGrupos] = useState(() => gruposDesdeSeed())
  useEffect(() => {
    const unsub = suscribirPlanes(db, (g) => setGrupos(g))
    return () => unsub && unsub()
  }, [])

  const [proveedor, setProveedor] = useState('vtr')
  const planesVtr = grupos['1p-internet'] || []
  const planes1pInternet = proveedor === 'vtr' ? (grupos['1p-internet'] || []) : []
  const planes1pStream = proveedor === 'vtr' ? (grupos['1p-stream'] || []) : []
  const planes1pTv = proveedor === 'vtr' ? (grupos['1p-tv'] || []) : []
  const planes2pTv = proveedor === 'vtr' ? (grupos['2p-tv'] || []) : []
  const planes2pFono = proveedor === 'vtr' ? (grupos['2p-fono'] || []) : []
  const planes3p = proveedor === 'vtr' ? (grupos['3p'] || []) : []
  const planesCableVtr = proveedor === 'vtr' ? (grupos['cable'] || []) : []
  const planesLegacy = proveedor === 'vtr' ? (grupos['legacy'] || []) : []
  const planesClaro = proveedor === 'claro' ? PLANES_CLARO : []
  const planesClaroHFC = planesClaro.filter((r) => r.tecnologia === 'HFC')
  const planesClaroFTTH = planesClaro.filter((r) => r.tecnologia === 'FTTH')

  const [query, setQuery] = useState('')
  const [planDetalle, setPlanDetalle] = useState(null)

  const abrirComercial = (row, tag) => setPlanDetalle(detalleDesdeComercial(row, tag))
  const abrirCable = (row) => setPlanDetalle(detalleDesdeCable(row))

  const term = normalize(query)
  const matches = (row, tag = '') => {
    if (!term) return true
    return normalize(`${row.comercial || row.plan} ${row.andes} ${(row.tags || []).join(' ')} ${tag}`).includes(term)
  }
  const matchCable = (row) => !term || normalize(`${row.plan} ${row.canales} ${row.hd} ${row.precio} ${row.modalidad} cable vtr`).includes(term)
  const has = (data, tag = '') => data.some(r => matches(r, tag))
  const hasCable = planesCableVtr.some(matchCable)
  const matchLegacy = (row) => !term || normalize(`${row.plan} ${row.precio} ${row.modalidad} legacy vtr`).includes(term)
  const hasLegacy = planesLegacy.some(matchLegacy)
  const matchClaro = (row) => !term || normalize(`${row.comercial} ${row.andes} ${row.precio} ${row.promo} ${row.pack} ${row.megas} ${row.tecnologia}`).includes(term)
  const hasClaro = (data) => data.some(matchClaro)
  const conTag = (data, tag) => data.map(row => ({ row, tag }))
  const resultados = [
    ...conTag(planes1pInternet, '1P'),
    ...conTag(planes1pStream, '1P'),
    ...conTag(planes1pTv, '1P'),
    ...conTag(planes2pTv, '2P'),
    ...conTag(planes2pFono, '2P'),
    ...conTag(planes3p, '3P'),
  ].filter(({ row, tag }) => matches(row, tag)).length
    + planesCableVtr.filter(matchCable).length
    + planesLegacy.filter(matchLegacy).length
    + planesClaro.filter(matchClaro).length

  const GrupoTitulo = ({ title, className = '' }) => (
    <div className={`flex items-center gap-2 mb-3 lg:mb-4 ${className}`}>
      <h4 className="font-bold text-base lg:text-lg text-gray-800 dark:text-gray-100">{title}</h4>
    </div>
  )

  const TarjetaClaro = ({ row }) => (
    <button
      type="button"
      onClick={() => setPlanDetalle(detalleDesdeClaro(row))}
      className={`plan-hover text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition-all cursor-pointer hover:shadow-md focus:outline-none ${term ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-900' : ''}`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
          <span className={`inline-flex items-center justify-center mr-1.5 w-6 h-6 lg:w-7 lg:h-7 rounded-full text-white text-[10px] lg:text-xs font-bold align-middle whitespace-nowrap shrink-0 ${row.pack === '2P' ? 'bg-gradient-to-r from-yellow-400 to-blue-600' : row.pack === '3P' ? 'bg-gradient-to-r from-red-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-blue-600'}`}>{row.pack}</span>
          {row.comercial}
        </p>
      </div>
      <p className="mt-1 text-xs lg:text-sm leading-relaxed text-gray-500 dark:text-gray-400">{row.andes}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="plan-normal-pill inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100">
          {row.precio}
        </span>
        {row.promo !== '-' && (
          <span className="plan-promo-pill inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-bold">
            {row.promo}
          </span>
        )}
        {row.descuento !== '-' && (
          <span className="plan-hd-pill inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold">
            Dcto {row.descuento}
          </span>
        )}
      </div>
    </button>
  )

  const GrupoClaro = ({ titulo, data, className = '' }) => (
    <ModernCard>
      <GrupoTitulo title={titulo} className={className} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {data.filter(matchClaro).map((row) => (
          <TarjetaClaro key={row.andes} row={row} />
        ))}
      </div>
    </ModernCard>
  )

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="space-y-3 mb-6">
        {term && (
          <div className="flex justify-end">
            <span className="w-fit px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs lg:text-sm font-semibold">
              {resultados} resultado{resultados === 1 ? '' : 's'}
            </span>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg px-2 py-2 lg:px-3 lg:py-2.5 transition-shadow hover:shadow-xl">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search size={20} className="absolute left-2.5 lg:left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={proveedor === 'claro' ? 'Buscar plan Claro (ej: Internet Hogar Claro, TV Premium...)' : 'Buscar plan por nombre en la web VTR (ej: Fibra 600, Stream TV, TV Premium...)'}
                className="w-full pl-9 lg:pl-10 pr-9 py-1.5 lg:py-2 rounded-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm lg:text-base"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  title="Limpiar búsqueda"
                  className="absolute right-1 lg:right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 dark:bg-gray-700 dark:hover:bg-red-900/40 text-gray-500 dark:text-gray-300 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {/* Switch VTR / Claro embebido en el buscador */}
            <div className="inline-flex shrink-0 items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5 border border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setProveedor('vtr')}
                title="Planes VTR"
                className={`flex items-center gap-1.5 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-bold transition-all ${
                  proveedor === 'vtr'
                    ? 'bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <img src="/logo-vtr.png" alt="VTR" className="h-4 w-4 lg:h-5 lg:w-5 object-contain" />
                <span className="hidden sm:inline">VTR</span>
              </button>
              <button
                type="button"
                onClick={() => setProveedor('claro')}
                title="Planes Claro"
                className={`flex items-center gap-1.5 px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-bold transition-all ${
                  proveedor === 'claro'
                    ? 'bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <img src="/logo-claro.png" alt="Claro" className="h-4 w-4 lg:h-5 lg:w-5 object-contain" />
                <span className="hidden sm:inline">Claro</span>
              </button>
            </div>
          </div>
        </div>
        {term && resultados === 0 && (
          <div className="flex items-center gap-2 rounded-xl border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs lg:text-sm text-amber-900 dark:text-amber-100 font-medium">
              No se encontraron planes para "{query}". Revisa que el nombre de la web esté bien escrito.
            </p>
          </div>
        )}
      </div>

      {(proveedor === 'vtr' && (has(planes1pInternet, '1P') || has(planes1pStream, '1P') || has(planes1pTv, '1P') || has(planes2pTv, '2P') || has(planes2pFono, '2P') || has(planes3p, '3P') || hasCable || hasLegacy)) && (
        <>
          {has(planes1pInternet, '1P') && (
            <ModernCard>
              <GrupoTitulo title="Internet Solo Fibra (FTTH)" />
              <PlanTable data={planes1pInternet} showPromo q={query} tag="1P" onSelect={abrirComercial} />
            </ModernCard>
          )}
          {has(planes1pStream, '1P') && (
            <ModernCard>
              <GrupoTitulo title="Internet + Stream (Disney+/Netflix)" className="mt-6 lg:mt-8" />
              <PlanTable data={planes1pStream} showPromo q={query} tag="1P" onSelect={abrirComercial} />
            </ModernCard>
          )}
          {has(planes1pTv, '1P') && (
            <ModernCard>
              <GrupoTitulo title="Televisión Sola (Stream TV)" className="mt-6 lg:mt-8" />
              <PlanTable data={planes1pTv} showPromo q={query} tag="1P" onSelect={abrirComercial} />
            </ModernCard>
          )}
          {has(planes2pTv, '2P') && (
            <ModernCard>
              <GrupoTitulo title="Doble Pack Internet + TV (FTTH)" />
              <PlanTable data={planes2pTv} showPromo q={query} tag="2P" onSelect={abrirComercial} />
            </ModernCard>
          )}
          {has(planes2pFono, '2P') && (
            <ModernCard>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {planes2pFono.filter(r => matches(r, '2P')).map((item) => (
                  <button
                    type="button"
                    key={item.id || item.plan}
                    onClick={() => abrirComercial({ ...item, comercial: item.plan, fono: true }, '2P')}
                    className={`plan-hover text-left flex flex-col gap-2 rounded-xl border border-transparent px-4 py-3 transition-all cursor-pointer focus:outline-none ${term ? 'bg-emerald-50 dark:bg-emerald-900/40' : 'bg-gray-50 dark:bg-gray-700/50'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">
                          <span className="inline-flex items-center justify-center mr-1.5 w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-gradient-to-r from-yellow-400 to-blue-600 text-white text-[10px] lg:text-xs font-bold align-middle whitespace-nowrap shrink-0">2P</span>
                          {item.plan}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{item.andes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 lg:gap-4 whitespace-nowrap">
                      <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Normal: <strong className="text-gray-900 dark:text-gray-100">{item.normal || '—'}</strong></span>
                      {item.promo && item.promo !== item.normal && (
                        <span className="text-xs lg:text-sm font-bold text-emerald-600 dark:text-emerald-400">Promo: {item.promo}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ModernCard>
          )}
          {has(planes3p, '3P') && (
            <ModernCard>
              <PlanTable data={planes3p} showPromo q={query} tag="3P" onSelect={abrirComercial} />
            </ModernCard>
          )}
          {hasCable && (
            <ModernCard>
              <GrupoTitulo title="Planes Cable VTR" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {planesCableVtr.filter(matchCable).map((row) => (
                  <button
                    type="button"
                    key={row.id || row.plan}
                    onClick={() => abrirCable(row)}
                    className={`plan-hover text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition-all cursor-pointer hover:shadow-md focus:outline-none ${term ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-900' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100">{row.plan}</p>
                      {(row.streams || []).length > 0 && (
                        <span className="flex items-center justify-end gap-1.5 shrink-0 pt-0.5" title="Streaming incluido">
                          {row.streams.slice(0, 4).map((src) => (
                            <img key={src} src={src} alt={STREAM_NAMES[src] || ''} title={STREAM_NAMES[src]} className="h-4 w-4 lg:h-5 lg:w-5 rounded object-contain bg-white dark:bg-gray-900/40" onError={(e) => { e.target.style.display = 'none' }} />
                          ))}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs lg:text-sm leading-relaxed text-gray-500 dark:text-gray-400">{row.modalidad}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="plan-meta-pill inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {row.canales}
                      </span>
                      <span className="plan-hd-pill inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-semibold">
                        {row.hd}
                      </span>
                      <span className="plan-normal-pill inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {row.precio}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ModernCard>
          )}
          {hasLegacy && (
            <ModernCard>
              <GrupoTitulo title="Planes VTR Legacy" />
              <PlanTable data={planesLegacy} showPromo q={query} tag="Legacy" onSelect={abrirComercial} />
            </ModernCard>
          )}
        </>
      )}

      {/* Sección de planes Claro */}
      {proveedor === 'claro' && (
        <>
          {planesClaro.length === 0 && (
            <ModernCard>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No hay planes Claro para tu búsqueda.
              </p>
            </ModernCard>
          )}
          {hasClaro(planesClaroHFC) && (
            <GrupoClaro titulo="Planes Claro Hogar · HFC" data={planesClaroHFC} />
          )}
          {hasClaro(planesClaroFTTH) && (
            <GrupoClaro titulo="Planes Claro Hogar · Fibra Óptica (FTTH)" data={planesClaroFTTH} className="mt-6 lg:mt-8" />
          )}
        </>
      )}

      <PlanDetalleModal detalle={planDetalle} onClose={() => setPlanDetalle(null)} />
    </div>
  )
}

// Imágenes de equipos que no requieren zoom (íconos/PNG simples)
const DEVICE_IMAGE_ZOOMLESS = [
  'https://i.ibb.co/n8ZYCy8c/extensor-modem.png',
  'https://i.ibb.co/twJBfw5D/ONT.png',
  '/descarga-1-1-removebg-preview.png',
  '/Grupo_3051.png.webp',
]

// Modal de vista previa de imágenes (compartido entre layouts)
const Modal = ({ modalImage, modalSize, onClose, disableZoom = false }) => {
  const [zoom, setZoom] = useState(1)
  const scrollRef = useRef(null)
  const noZoom = disableZoom || DEVICE_IMAGE_ZOOMLESS.includes(modalImage)

  useEffect(() => {
      setZoom(1)
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
      scrollRef.current.scrollLeft = 0
    }
  }, [modalImage])

  useEffect(() => {
    if (!modalImage) return
    const manejarTecla = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [modalImage, onClose])

  if (!modalImage) return null

  const aplicarZoom = (factor) => {
    setZoom((z) => Math.min(4, Math.max(1, Number((z * factor).toFixed(3)))))
  }

  return (
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200 overflow-hidden select-none"
      onClick={onClose}
    >
      {noZoom ? (
        <div
          className="relative w-fit max-w-[min(96vw,72rem)] max-h-[90vh] animate-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 sm:top-0 sm:right-0 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-transform hover:scale-110 border border-white/20 cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <img
            src={modalImage}
            alt="Vista previa"
            draggable={false}
            className="block w-auto h-auto max-w-[min(96vw,72rem)] max-h-[90vh] object-contain select-none drop-shadow-2xl"
            onError={(e) => {
              e.target.src =
                'data:image/svg+xml,' +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect fill="%23f3f4f6" width="800" height="600"/><text fill="%236b7280" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>'
                )
            }}
          />
        </div>
      ) : (
      <div
        className={`relative w-fit ${modalSize === 'small' ? 'max-w-md' : 'max-w-[min(96vw,72rem)]'} max-h-[90vh] flex flex-col items-center gap-3 animate-in zoom-in duration-200 overflow-hidden rounded-2xl bg-[#1a1a1a]/75 backdrop-blur-xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.55)] p-2 sm:p-3`}
          onClick={(e) => e.stopPropagation()}
      >
            <button
              onClick={onClose}
          className="absolute top-2 right-2 z-30 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-lg border border-white/15 cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
        <div
          ref={scrollRef}
          className="relative w-full min-h-0 rounded-xl overflow-auto overscroll-contain max-h-[calc(90vh-72px)] [scrollbar-width:thin]"
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault()
              aplicarZoom(e.deltaY < 0 ? 1.12 : 0.88)
            }
          }}
        >
          <div
            className="w-full"
              style={
              zoom > 1
                ? { width: `${zoom * 100}%`, minHeight: '100%' }
                  : undefined
              }
          >
            <img
              src={modalImage}
              alt="Vista previa"
              draggable={false}
              className={`rounded-lg block select-none ${
                  zoom > 1
                    ? 'w-full h-auto max-w-none cursor-grab'
                    : 'w-auto h-auto max-w-full max-h-[calc(90vh-72px)] object-contain mx-auto cursor-zoom-in'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                if (zoom <= 1) aplicarZoom(1.5)
              }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect fill="%23f3f4f6" width="800" height="600"/><text fill="%236b7280" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
              }}
            />
          </div>
        </div>
          <div
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 shadow-lg shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => aplicarZoom(1 / 1.25)}
              disabled={zoom <= 1}
              className="w-8 h-8 rounded-full bg-white/10 text-white font-bold disabled:opacity-40 hover:bg-white/20 cursor-pointer"
              aria-label="Alejar"
            >
              −
            </button>
            <span className="min-w-[44px] text-center text-xs font-bold text-white/80">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => aplicarZoom(1.25)}
              disabled={zoom >= 4}
              className="w-8 h-8 rounded-full bg-white/10 text-white font-bold disabled:opacity-40 hover:bg-white/20 cursor-pointer"
              aria-label="Acercar"
            >
              +
            </button>
            {zoom > 1 && (
              <button
                onClick={() => setZoom(1)}
                className="px-2 h-8 rounded-full bg-white/10 text-white text-[10px] font-semibold hover:bg-white/20 cursor-pointer"
              >
                Ajustar
              </button>
            )}
          </div>
      </div>
      )}
    </div>
  )
}

// Identificación por correo (una sola vez) para registrar quién ve los comunicados.
const LectorLogin = ({ onConfirmar, onCerrar }) => {
  const [email, setEmail] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const valor = normalizarEmail(email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      setError('Ingresa un correo válido.')
      return
    }
    setVerificando(true)
    const habilitado = await existeLector(valor)
    setVerificando(false)
    if (!habilitado) {
      setError('Ese correo no está habilitado. Se requiere un correo corporativo registrado en el portal: solicítalo a tu supervisor.')
      return
    }
    onConfirmar(valor)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[95] overflow-y-auto animate-in fade-in duration-200">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-[28px] bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_25px_80px_rgba(0,0,0,0.18)] p-6 animate-in zoom-in duration-200 dark:bg-[#1a1a1a]/75 dark:border-white/10 dark:shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
          <button
            onClick={onCerrar}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full text-gray-500 hover:text-gray-900 hover:bg-black/5 flex items-center justify-center cursor-pointer dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-5 border-b border-gray-200 dark:border-white/10 pb-4">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl dark:bg-emerald-500/20 dark:text-emerald-300">
              <Mail size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Identifícate</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ingresa tu correo corporativo una sola vez para confirmar que viste los comunicados
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border-l-4 border-red-500 bg-red-500/10 px-4 py-3">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-1.5">
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="tu correo corporativo"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={verificando}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {verificando ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/** Chip de perfil: clic abre Tipificaciones. */
const PerfilLectorChip = ({
  email,
  nombre,
  avatarUrl,
  onOpenTipificaciones,
  compact = false,
}) => {
  if (!email) return null

  const inicial = String(email).charAt(0).toUpperCase()
  const avatar = avatarImgProps(avatarUrl, { fallbackMessenger: true })
  const nombreLector = String(nombre || '').trim() || nombreDesdeEmail(email)

  return (
    <div className="flex items-center gap-3 min-w-0">
      <button
        type="button"
        onClick={() => onOpenTipificaciones?.()}
        title="Mis tipificaciones"
        className={`relative w-9 h-9 shrink-0 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border-0 p-0 ${
          avatar.isMessenger
            ? 'bg-transparent overflow-visible'
            : 'rounded-full overflow-hidden bg-transparent text-current'
        }`}
      >
        {avatar.src ? (
          <img
            src={avatar.src}
            alt=""
            className={avatar.isMessenger ? 'messenger-avatar-img' : 'w-full h-full object-cover'}
            style={avatar.style}
          />
        ) : (
          <span className="text-sm font-bold">{inicial}</span>
        )}
      </button>
      {!compact && (
        <button
          type="button"
          onClick={() => onOpenTipificaciones?.()}
          className="min-w-0 text-left hover:opacity-80 transition-opacity"
          title="Ver mis tipificaciones"
        >
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Tipificaciones</p>
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
            {nombreLector}
          </p>
        </button>
      )}
    </div>
  )
}

// Pop up de comunicados marcados como "Pop up" en el panel de administración.
// Se muestra sobre la web al abrirla, con la imagen de la noticia.
const NoticiaPopup = ({ noticias, index, onIndex, onClose, onVerImagen, lectorEmail = '', onIdentificar }) => {
  const item = noticias[index]
  const [email, setEmail] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!item) return
    const manejarTecla = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [item, onClose])

  const confirmarCorreo = async (e) => {
    e.preventDefault()
    const valor = normalizarEmail(email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      setError('Ingresa un correo válido.')
      return
    }
    setVerificando(true)
    const habilitado = await existeLector(valor)
    setVerificando(false)
    if (!habilitado) {
      setError('Ese correo no está habilitado. Se requiere un correo corporativo registrado en el portal: solicítalo a tu supervisor.')
      return
    }
    onIdentificar(valor)
  }

  if (!item) return null
  const total = noticias.length

  const metaBadges = (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 text-[10px] font-bold uppercase tracking-wider">
        <Bell size={11} /> Comunicado importante
      </span>
      {item.categoria && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          {item.categoria}
        </span>
      )}
    </div>
  )

  const acciones = !lectorEmail ? (
    <form onSubmit={confirmarCorreo} className="space-y-3">
      <div>
        <p className="text-xs font-bold text-gray-900 dark:text-white">Confirma que viste este comunicado</p>
        <p className="text-[11px] text-gray-500 dark:text-white/50 mt-0.5">
          Ingresa tu correo corporativo una sola vez. En las próximas visitas no te lo volveremos a pedir.
        </p>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-xl border-l-4 border-red-500 bg-red-500/10 px-3 py-2">
          <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="tu correo corporativo"
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/35"
          />
        </div>
        <button
          type="submit"
          disabled={verificando}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-bold shadow cursor-pointer transition-all disabled:opacity-60 shrink-0"
        >
          {verificando ? 'Verificando...' : 'Confirmar'}
        </button>
      </div>
    </form>
  ) : (
    <div className="flex items-center justify-between gap-3">
      {total > 1 ? (
        <span className="text-[11px] font-semibold text-gray-500 dark:text-white/50 shrink-0 tabular-nums">
          {index + 1} / {total}
        </span>
      ) : (
        <span className="shrink-0" />
      )}
      <div className="flex items-center gap-2 shrink-0">
        {total > 1 && (
          <button
            type="button"
            onClick={() => onIndex(index - 1)}
            disabled={index <= 0}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-35 disabled:pointer-events-none disabled:cursor-default dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
            Anterior
          </button>
        )}
        {total > 1 && index < total - 1 ? (
          <button
            type="button"
            onClick={() => onIndex(index + 1)}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-bold shadow cursor-pointer transition-all"
          >
            Siguiente
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-bold shadow cursor-pointer transition-all"
          >
            Entendido
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[90] overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="min-h-full flex items-start lg:items-center justify-center p-3 sm:p-5 lg:p-8">
        <div
          className="relative w-full max-w-2xl lg:max-w-5xl rounded-[28px] bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_25px_80px_rgba(0,0,0,0.18)] my-2 lg:my-0 overflow-hidden animate-in zoom-in duration-200 dark:bg-[#1a1a1a]/80 dark:border-white/10 dark:shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full text-gray-500 hover:text-gray-900 hover:bg-black/5 flex items-center justify-center cursor-pointer dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>

          {/* Mobile: columna · Desktop: imagen izq + contenido der */}
          <div className="flex flex-col lg:flex-row lg:min-h-[min(72vh,560px)]">
            {item.src && (
              <div
                className="relative lg:w-[54%] lg:shrink-0 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center cursor-zoom-in border-b lg:border-b-0 lg:border-r border-gray-200 lg:min-h-[min(72vh,560px)] dark:from-black/50 dark:to-black/20 dark:border-white/10"
                onClick={() => onVerImagen(item.src)}
                title="Ver imagen completa"
              >
                <img
                  src={item.src}
                  alt={item.alt || item.titulo || 'Comunicado'}
                  className="w-full max-h-[42vh] lg:max-h-[min(68vh,520px)] object-contain p-2 lg:p-4"
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml,' +
                      encodeURIComponent(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect fill="%231a1a1a" width="400" height="250"/><text fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>'
                      )
                  }}
                />
                <span className="absolute bottom-3 left-3 hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/55 text-[10px] text-white/70 pointer-events-none">
                  Clic para ampliar
                </span>
              </div>
            )}

            <div className={`flex flex-col flex-1 min-w-0 ${item.src ? '' : 'lg:w-full'}`}>
              <div className="px-5 pt-5 pb-3 lg:px-7 lg:pt-7 lg:pr-14">
                {metaBadges}
                <h3 className="mt-2.5 text-base lg:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                  {item.titulo || item.alt || 'Comunicado'}
                </h3>
                {item.fecha && <p className="text-[11px] text-gray-500 dark:text-white/45 mt-1">{item.fecha}</p>}
              </div>

              {item.descripcion && (
                <div className="px-5 lg:px-7 pb-4 flex-1 overflow-y-auto max-h-[28vh] lg:max-h-none text-xs lg:text-sm text-gray-600 dark:text-white/75 leading-relaxed">
                  {formatNewsText(item.descripcion)}
                </div>
              )}

              {!item.src && (
                <div className="px-5 lg:px-7 pb-2 text-[11px] text-gray-400 dark:text-white/40">Sin imagen adjunta</div>
              )}

              <div className="mt-auto px-5 py-4 lg:px-7 lg:py-5 border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]">
                {acciones}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de navegación móvil (bottom navigation) - cápsula flotante solo iconos
const MobileNavigation = ({ navigationItems, activeSection, setActiveSection }) => (
  <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
    <div className="bg-white/90 backdrop-blur-md shadow-2xl border border-gray-200 rounded-full px-3 py-1.5 flex justify-around items-center dark:bg-gray-900/90 dark:border-gray-700">
      {navigationItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveSection(item.id)}
          aria-label={item.label}
          className={`btn-cyan-hover nav-side-btn flex items-center justify-center w-9 h-9 rounded-full transition-[transform,box-shadow] duration-300 ${
            activeSection === item.id
              ? 'text-white bg-[#f69100] shadow-lg'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {item.id === 'apex' ? (
            <img
              src="/logo-green.png"
              alt="Apex"
              className="w-4 h-4 object-contain nav-icon"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : item.id === 'systems' ? (
            <img
              src="/logo-login-portal.png"
              alt="Somos Clave"
              className="w-4 h-4 object-contain brightness-0 contrast-100 dark-nav-icon"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : item.id === 'dbox' ? (
            <img
              src="/appletv.png"
              alt="D-BOX"
              className="w-4 h-4 object-contain nav-icon-dbox"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : item.id === 'images' ? (
            <img
              src="/vtr-logo-freelogovectors.net_.png"
              alt="App Vtr"
              className="w-4 h-4 object-contain nav-icon-soft"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : item.id === 'links' ? (
            <img
              src="/enlaces.png"
              alt="Enlaces"
              className="w-4 h-4 object-contain nav-icon-soft"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <item.icon size={18} />
          )}
        </button>
      ))}
    </div>
  </nav>
)

// Componente principal para móvil
const MobileLayout = ({ children, darkMode, setDarkMode, navigationItems, activeSection, setActiveSection, modalImage, modalSize, modalDisableZoom, onClose, lectorEmail = '', lectorAvatar = '', onLectorAvatarChange, onToast, onOpenTipificaciones }) => (
  <div
    className={`bg-gray-50 ${
      activeSection === 'mensajes'
        ? 'h-[100dvh] overflow-hidden flex flex-col pb-0'
        : 'min-h-screen pb-20'
    }`}
  >
    {/* Header móvil */}
    <header className="bg-white shadow sticky top-0 z-30 shrink-0">
      <div className="px-4 py-3">
        <div className="flex items-center">
          <div className="flex-1 flex justify-start">
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div className="flex justify-center">
            <a
              href="https://apex.wayfromhome.cx/login?returnUrl=%2Fmenu"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-300 hover:scale-110"
            >
<img
                src="https://i.ibb.co/7Nn2L1Py/apex-large.png"
                alt="Logo Apex"
                className="h-8 w-auto nav-logo"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </a>
          </div>
          <div className="flex-1 flex justify-end">
            {lectorEmail ? (
              <PerfilLectorChip
                email={lectorEmail}
                avatarUrl={lectorAvatar}
                onOpenTipificaciones={onOpenTipificaciones}
                compact
              />
            ) : null}
          </div>
        </div>
      </div>
    </header>

    {/* Contenido móvil */}
    <div
      className={
        activeSection === 'mensajes'
          ? 'flex-1 min-h-0 overflow-hidden p-0 pb-[4.25rem]'
          : 'p-4'
      }
    >
      {children}
    </div>

    {/* Navegación inferior móvil */}
    <MobileNavigation navigationItems={navigationItems} activeSection={activeSection} setActiveSection={setActiveSection} />

    {/* Modal para imágenes */}
    <Modal modalImage={modalImage} modalSize={modalSize} disableZoom={modalDisableZoom} onClose={onClose} />
  </div>
)

// Componente principal para desktop
const DesktopLayout = ({ children, darkMode, setDarkMode, activeSection, setActiveSection, sidebarOpen, setSidebarOpen, navigationItems, modalImage, modalSize, modalDisableZoom, onClose, lectorEmail = '', lectorAvatar = '', onLectorAvatarChange, onToast, onOpenTipificaciones }) => {
  const [sidebarHover, setSidebarHover] = useState(false)
  const [simuladoresOpen, setSimuladoresOpen] = useState(activeSection === 'androidtv' || activeSection === 'genesys' || activeSection === 'andes')

  return (
  <div className={`bg-gray-50 flex ${activeSection === 'mensajes' || activeSection === 'androidtv' || activeSection === 'genesys' || activeSection === 'andes' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
    {/* Sidebar */}
    <aside
      onMouseEnter={() => setSidebarHover(true)}
      onMouseLeave={() => setSidebarHover(false)}
      className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl fixed h-full z-40 left-0 overflow-visible transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`}
    >
      <div className="h-full overflow-y-auto overflow-x-hidden flex flex-col">
      <div className="border-b border-gray-100 flex items-center justify-center p-4 h-32 relative shrink-0">
        <a
          href="https://apex.wayfromhome.cx/login?returnUrl=%2Fmenu"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:opacity-80"
        >
          <img
            src="https://i.ibb.co/7Nn2L1Py/apex-large.png"
            alt="Logo Apex"
            className={`object-contain cursor-pointer transition-all duration-300 nav-logo ${sidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
            style={{ height: '40px' }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </a>
        <a
          href="https://apex.wayfromhome.cx/login?returnUrl=%2Fmenu"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:opacity-80"
        >
          <img
            src="https://i.ibb.co/XrtN8M3V/apex-2.png"
            alt="Apex"
            className={`w-8 h-8 object-contain cursor-pointer transition-all duration-300 nav-logo ${sidebarOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </a>
      </div>

      <nav className="p-4 pb-8 flex-1">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            if (item.id === 'simuladores') {
              const simuladoresItems = [
                { id: 'androidtv', label: 'TV', Icon: Tv },
                { id: 'genesys', label: 'Genesys', Icon: PhoneCall },
                { id: 'andes', label: 'Andes', Icon: Database },
              ]
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSimuladoresOpen((v) => !v)}
                    title="Simuladores"
                    className={`btn-cyan-hover nav-side-btn w-full flex items-center py-2 rounded-full transition-[transform,box-shadow,gap,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                      sidebarOpen ? 'gap-3 px-4' : 'gap-0 px-0 justify-center'
                    } ${
                      simuladoresOpen
                        ? 'bg-[#f69100] text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <Server size={20} />
                    <span className={`font-medium overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarOpen ? 'max-w-40 opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-2'}`}>{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform duration-300 ${sidebarOpen ? 'ml-auto' : 'hidden'} ${simuladoresOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${simuladoresOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ul className="mt-1 space-y-1">
                      {simuladoresItems.map(({ id, label, Icon }) => (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => setActiveSection(id)}
                            title={label}
                            className={`btn-cyan-hover nav-side-btn w-full flex items-center py-2 rounded-full transition-[transform,box-shadow,gap,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                              sidebarOpen ? 'gap-3 px-4' : 'gap-0 px-0 justify-center'
                            } ${
                              activeSection === id
                                ? 'bg-[#f69100] text-white shadow-lg'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            <Icon size={20} />
                            <span className={`font-medium overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarOpen ? 'max-w-40 opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-2'}`}>{label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            }
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`btn-cyan-hover nav-side-btn w-full flex items-center py-2 rounded-full transition-[transform,box-shadow,gap,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                    sidebarOpen ? 'gap-3 px-4' : 'gap-0 px-0 justify-center'
                  } ${
                    activeSection === item.id
                      ? 'bg-[#f69100] text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {item.id === 'apex' ? (
                    <img
                      src="/logo-green.png"
                      alt="Apex"
                      className="w-6 h-6 object-contain nav-icon"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : item.id === 'androidtv' ? (
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <IconoAndroid size={22} className="nav-icon text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
                    </div>
                  ) : item.id === 'systems' ? (
                    <img
                      src="/logo-login-portal.png"
                      alt="Somos Clave"
                      className="w-6 h-6 object-contain brightness-0 contrast-100 dark-nav-icon"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : item.id === 'dbox' ? (
                    <img
                      src="/appletv.png"
                      alt="D-BOX"
                      className="w-6 h-6 object-contain nav-icon-dbox"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : item.id === 'images' ? (
                    <img
                      src="/vtr-logo-freelogovectors.net_.png"
                      alt="App Vtr"
                      className="w-6 h-6 object-contain nav-icon-soft"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : item.id === 'links' ? (
                    <img
                      src="/enlaces.png"
                      alt="Enlaces"
                      className="w-6 h-6 object-contain nav-icon-soft"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <item.icon size={20} />
                  )}
                  <span className={`font-medium overflow-hidden whitespace-nowrap bg-transparent transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarOpen ? 'max-w-40 opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-2'}`}>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mismo diseño que los items del nav: pastilla con perfil + tema (solo escritorio) */}
      <div className="shrink-0 border-t border-gray-100 p-4 pt-3">
        <div
          className={`btn-cyan-hover nav-side-btn flex items-center rounded-full text-gray-700 dark:text-gray-200 transition-[gap,padding,justify-content] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            sidebarOpen ? 'gap-3 px-4 py-2' : 'gap-0 px-0 py-2 justify-center'
          }`}
        >
          {lectorEmail ? (
            <button
              type="button"
              onClick={() => onOpenTipificaciones?.()}
              title="Mis tipificaciones"
              aria-label="Mis tipificaciones"
              className={`min-w-0 flex items-center cursor-pointer transition-[gap] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                sidebarOpen ? 'gap-3' : 'gap-0 justify-center'
              }`}
            >
              {(() => {
                const av = avatarImgProps(lectorAvatar, { fallbackMessenger: true })
                return (
                  <span
                    className={`relative w-6 h-6 shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 ${
                      av.isMessenger ? 'bg-transparent overflow-visible' : 'rounded-full overflow-hidden bg-transparent text-current'
                    }`}
                  >
                    {av.src ? (
                      <img
                        src={av.src}
                        alt=""
                        className={av.isMessenger ? 'messenger-avatar-img' : 'w-full h-full object-cover'}
                        style={av.style}
                      />
                    ) : (
                      String(lectorEmail).charAt(0).toUpperCase()
                    )}
                  </span>
                )
              })()}
              <span
                className={`text-sm font-medium overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  sidebarOpen
                    ? 'max-w-40 opacity-100 translate-x-0'
                    : 'max-w-0 opacity-0 -translate-x-2'
                }`}
              >
                {nombreDesdeEmail(lectorEmail)}
              </span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
            className={`shrink-0 flex items-center justify-center cursor-pointer transition-[margin] duration-300 ${
              lectorEmail ? (sidebarOpen ? 'ml-auto' : 'ml-0') : 'mx-auto'
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      </div>

      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
        tabIndex={sidebarHover ? 0 : -1}
        style={{
          opacity: sidebarHover ? 1 : 0,
          transform: `translateY(-50%) scale(${sidebarHover ? 1 : 0.75})`,
          pointerEvents: sidebarHover ? 'auto' : 'none',
        }}
        className="absolute top-1/2 right-1 z-50 flex items-center justify-center p-0 bg-transparent border-0 shadow-none text-gray-500 hover:text-gray-900 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        {sidebarOpen ? <ChevronLeft size={20} strokeWidth={2.25} /> : <ChevronRight size={20} strokeWidth={2.25} />}
      </button>
    </aside>

    {/* Main Content */}
    <main
      className={`flex-1 flex flex-col transition-[margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      } ${activeSection === 'mensajes' || activeSection === 'androidtv' || activeSection === 'genesys' || activeSection === 'andes' ? 'h-screen min-h-0 overflow-hidden' : 'min-h-screen'}`}
    >
      {/* El perfil del lector y el cambio de tema viven al final del sidebar */}

      {/* Content — mensajes, androidtv, genesys y andes a pantalla completa (sin card flotante ni padding) */}
      <div
        key={activeSection}
        className={`flex-1 min-h-0 ${
activeSection === 'mensajes' || activeSection === 'androidtv' || activeSection === 'genesys' || activeSection === 'andes'
            ? 'p-0 overflow-hidden flex flex-col h-full w-full'
            : 'p-8 section-zoom'
        }`}
      >
        {children}
      </div>
    </main>

    {/* Modal para imágenes */}
    <Modal modalImage={modalImage} modalSize={modalSize} disableZoom={modalDisableZoom} onClose={onClose} />
  </div>
  )
}

// Buscador predictivo de IDs Clave VTR (aislado para no perder el foco al escribir)
const IdSearchBox = ({ data, onApply }) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const matches = query.trim()
    ? data
        .filter(item => String(item.id).toLowerCase().includes(query.trim().toLowerCase()) || String(item.nombre).toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 8)
    : []

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onApply(query)
        setOpen(false)
      }}
      className="relative w-full sm:w-[28rem]"
    >
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (e.target.value === '') onApply('')
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar por ID o nombre"
        className="w-full pl-10 pr-3 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          {matches.map(item => (
            <li key={item.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setQuery(item.nombre)
                  onApply(item.nombre)
                  setOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 rounded px-1.5 py-0.5 whitespace-nowrap">
                    {item.id}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.nombre}
                  </span>
                </div>
                {item.categoria && (
                  <div className="text-[11px] text-gray-400 mt-0.5">{item.categoria}</div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}

const FormField = ({ label, children, full }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block dark:text-gray-400">{label}</label>
    {children}
  </div>
)

// Modal de confirmación de subida (reemplaza el alert del navegador)
const ModalExito = ({ abierto, titulo, mensaje, tipo = 'exito', onCerrar }) => {
  if (!abierto) return null
  const esError = tipo === 'error'
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
      onClick={onCerrar}
    >
      <div
        className="rounded-[28px] bg-[#1a1a1a]/75 backdrop-blur-xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.55)] p-8 max-w-sm w-full text-center animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${esError ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {esError ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
        </div>
        <h3 className={`mt-4 text-xl font-bold ${esError ? 'text-red-400' : 'text-white'}`}>
          {titulo || (esError ? 'Error' : 'Subida Exitosamente')}
        </h3>
        {mensaje && <p className="mt-2 text-sm text-white/55">{mensaje}</p>}
        <button
          onClick={onCerrar}
          className={`mt-6 w-full py-3 rounded-full text-white font-medium transition-all duration-300 hover:scale-[1.02] ${esError ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'}`}
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 px-4 pointer-events-none">
      <div className="toast-capsule flex items-center gap-2.5 rounded-full px-5 py-2.5 shadow-2xl transition-all">
        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
        <p className="text-sm font-semibold tracking-wide whitespace-nowrap">{toast}</p>
      </div>
    </div>
  )
}

const ROUTER_APPS = [
  {
    nombre: 'SmartWiFi Portal',
    url: 'https://lla.cloudcheck.net/vtr/login-page',
    logo: '/SmartWiFi Portal.png',
  },
  {
    nombre: 'IMASTER NCE',
    url: 'https://176.52.129.49:31943/',
    logo: '/huawei.png',
  },
  {
    nombre: 'SCP',
    url: 'https://zmesh.telmexchile.cl:28001/api/oauth2/v1/authorize?scope=user.login&response_type=code&redirect_uri=/scpportal/framework/default.html',
    logo: '/ZTE.png',
  },
]

const RouterAppsModal = ({ open, onClose }) => {
  if (!open) return null

  const abrirApp = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-[#1a1a1a] dark:border dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Solucionar Modem</h3>
            <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Selecciona una aplicación para abrirla</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-6 grid grid-cols-3 gap-4 place-items-center">
          {ROUTER_APPS.map((app) => (
            <button
              key={app.nombre}
              type="button"
              onClick={() => abrirApp(app.url)}
              className="flex flex-col items-center gap-2 w-full max-w-[7.5rem] bg-transparent border-0 shadow-none p-0 hover:scale-105 transition-transform"
            >
              <img
                src={app.logo}
                alt=""
                className="w-14 h-14 object-contain"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="text-xs font-medium text-center text-gray-800 dark:text-white/90 leading-tight">
                {app.nombre}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}

const CredencialModal = ({ credencial, onClose, onCopiar }) => {
  if (!credencial) return null
  const { section, user } = credencial

  const copiar = (valor, mensaje) => {
    if (!valor) return
    navigator.clipboard.writeText(valor)
      .then(() => onCopiar(mensaje))
      .catch(() => onCopiar('No se pudo copiar'))
  }

  const Fila = ({ label, valor }) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 lg:px-4 lg:py-2.5">
      <div className="min-w-0">
        <p className="text-[10px] lg:text-xs font-semibold text-white/45 uppercase tracking-wide">{label}</p>
        <p className="text-xs lg:text-sm font-mono text-white break-all">{valor || '-'}</p>
      </div>
      <button
        onClick={() => copiar(valor, label + ' copiado')}
        title={valor ? `Copiar ${label.toLowerCase()}` : undefined}
        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 hover:scale-110 transition-transform"
      >
        <Copy size={14} />
      </button>
    </div>
  )

  const fields = []
  if (section.id === 'apex') {
    fields.push({ label: 'Usuario', valor: user.user })
    if (user.password) fields.push({ label: 'Contraseña', valor: user.password })
  } else if (section.id === 'windows') {
    fields.push({ label: 'RUT', valor: user.rut })
    fields.push({ label: 'Usuario', valor: user.user })
    fields.push({ label: 'Password', valor: user.password })
  } else if (section.id === 'somos') {
    fields.push({ label: 'ID', valor: user.id })
    fields.push({ label: 'Contraseña', valor: user.password })
  } else if (section.id === 'vsight') {
    fields.push({ label: 'Username', valor: user.username })
    fields.push({ label: 'Email', valor: user.email })
    fields.push({ label: 'Password', valor: user.password })
  } else if (section.id === 'video') {
    fields.push({ label: 'Usuario', valor: user.user })
    fields.push({ label: 'RUT', valor: user.rut })
    fields.push({ label: 'Password', valor: user.password })
    fields.push({ label: 'Perfil', valor: user.perfil })
    fields.push({ label: 'Plataforma', valor: user.plataforma })
    fields.push({ label: 'Habilidad', valor: user.habilidad })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[75] p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="rounded-[28px] bg-[#1a1a1a]/75 backdrop-blur-xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.55)] w-full max-w-md animate-in zoom-in duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-5 lg:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Lock size={18} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] lg:text-xs font-semibold text-white/80 uppercase tracking-wide">{section.label}</p>
            <p className="text-sm lg:text-base font-bold text-white truncate">{user.name}</p>
          </div>
          <button onClick={onClose} className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 lg:p-6 space-y-2.5 lg:space-y-3">
          {fields.map((f) => <Fila key={f.label} label={f.label} valor={f.valor} />)}
          {section.id === 'somos' && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 lg:px-4 lg:py-2.5">
              <div>
                <p className="text-[10px] lg:text-xs font-semibold text-white/45 uppercase tracking-wide">Estado</p>
                <p className="text-xs lg:text-sm font-semibold text-emerald-400">{user.status}</p>
              </div>
            </div>
          )}
        </div>
        <div className="px-5 lg:px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-full bg-white/10 text-white/85 text-sm font-semibold hover:bg-white/15 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// Plantilla de derivación Web N1 / Trazabilidad técnica
const PlantillaN1 = ({ correoApex = '', onEnviado }) => {
  const [form, setForm] = useState({
    asesor: '',
    nombre: '',
    plataformaTitulo: 'SOPORTE DIFERIDO TECNICO',
    plataforma: 'Sop diferido técnico',
    marca: 'VTR',
    servicio: 'Internet',
    servicioOpcion: 'Telefonía / Internet / Cable',
    rut: '',
    telefono: '',
    canal: 'Call Center',
    observacion: '',
  })

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const [guardando, setGuardando] = useState(false)
  const [modal, setModal] = useState(null)

  const copyTemplate = () => {
    const text = `N1 TECNICO / TRAZABILIDAD TÉCNICA

👤 Asesor: ${form.asesor}
➡️ Nombre del Cliente: ${form.nombre}
🔹 1. PLATAFORMA: ${form.plataformaTitulo}
➡️ ${form.plataforma}
🔹 2. MARCA: ${form.marca}
🔹 3. SERVICIO: ${form.servicio}
➡️ ${form.servicioOpcion}
🔹 4. RUT CLIENTE: ${form.rut}
🔹 5. TELÉFONO CELULAR: ${form.telefono}
🔹 6. CANAL DE INGRESO: ${form.canal}
🔹 7. OBSERVACIÓN INICIAL: ${form.observacion}`
    navigator.clipboard.writeText(text)
      .then(() => window.alert('Plantilla copiada al portapapeles'))
      .catch(() => window.alert('No se pudo copiar la plantilla'))
    return text
  }

  const guardar = async () => {
    if (!form.asesor || !form.nombre) {
      setModal({ tipo: 'error', titulo: 'Campos incompletos', mensaje: 'Completa al menos el Asesor y el Nombre del Cliente antes de guardar.' })
      return
    }
    setGuardando(true)
    const texto = `N1 TECNICO / TRAZABILIDAD TÉCNICA

👤 Asesor: ${form.asesor}
➡️ Nombre del Cliente: ${form.nombre}
🔹 1. PLATAFORMA: ${form.plataformaTitulo}
➡️ ${form.plataforma}
🔹 2. MARCA: ${form.marca}
🔹 3. SERVICIO: ${form.servicio}
➡️ ${form.servicioOpcion}
🔹 4. RUT CLIENTE: ${form.rut}
🔹 5. TELÉFONO CELULAR: ${form.telefono}
🔹 6. CANAL DE INGRESO: ${form.canal}
🔹 7. OBSERVACIÓN INICIAL: ${form.observacion}`
    const ok = await enviarTipificacionPersonal({
      correoApex,
      tipo: 'N1',
      campos: { ...form },
      texto,
      onEnviado,
      setModal,
    })
    setGuardando(false)
    if (ok) {
      setForm(prev => ({
        ...prev,
        asesor: '',
        nombre: '',
        rut: '',
        telefono: '',
        observacion: '',
      }))
      setModal({ tipo: 'exito', titulo: 'Guardado', mensaje: 'Tipificación guardada en tu historial personal.' })
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"

  return (
    <>
    <div className="w-full flex-1 flex flex-col">
      <div className="mb-6 flex items-start gap-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-xl px-4 py-3">
        <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <p className="text-xs lg:text-base text-red-900 dark:text-red-100 font-medium">
          🚨🚨 !!!..Después de las 06:50 pm NO PODEMOS TRANSFERIR A N1 TÉCNICO..!!!🚨🚨
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 dark:text-gray-100">
          <ClipboardList size={24} className="text-emerald-600 shrink-0" />
          <span>N1 TECNICO</span>
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 flex-1 content-start">
        <FormField label="Asesor">
          <input type="text" value={form.asesor} onChange={update('asesor')} className={inputClass} />
        </FormField>
        <FormField label="Nombre del Cliente">
          <input type="text" value={form.nombre} onChange={update('nombre')} className={inputClass} />
        </FormField>
        <FormField label="Teléfono celular">
          <input type="text" value={form.telefono} onChange={update('telefono')} className={inputClass} />
        </FormField>
        <FormField label="Rut cliente">
          <input type="text" value={form.rut} onChange={update('rut')} className={inputClass} />
        </FormField>

        <FormField label="1. Plataforma (título)">
          <input type="text" value={form.plataformaTitulo} onChange={update('plataformaTitulo')} className={inputClass} />
        </FormField>
        <FormField label="Plataforma (opción a derivar)">
          <select value={form.plataforma} onChange={update('plataforma')} className={inputClass}>
            <option value="Sop diferido técnico">Sop diferido técnico</option>
            <option value="Soporte 1° nivel Internet">Soporte 1° nivel Internet</option>
            <option value="Soporte 2° nivel Internet">Soporte 2° nivel Internet</option>
          </select>
        </FormField>

        <FormField label="2. Marca">
          <select value={form.marca} onChange={update('marca')} className={inputClass}>
            <option value="VTR">VTR</option>
            <option value="Claro">Claro</option>
            <option value="VTR / Claro">VTR / Claro</option>
          </select>
        </FormField>
        <FormField label="3. Servicio">
          <select value={form.servicio} onChange={update('servicio')} className={inputClass}>
            <option value="Internet">Internet</option>
            <option value="Telefonía">Telefonía</option>
            <option value="Cable">Cable</option>
          </select>
        </FormField>
        <FormField label="Servicio (opciones)">
          <input type="text" value={form.servicioOpcion} onChange={update('servicioOpcion')} className={inputClass} />
        </FormField>
        <FormField label="6. Canal de ingreso">
          <select value={form.canal} onChange={update('canal')} className={inputClass}>
            <option value="Call Center">Call Center</option>
            <option value="Portal Web">Portal Web</option>
            <option value="App VTR">App VTR</option>
            <option value="Sucursal Virtual">Sucursal Virtual</option>
          </select>
        </FormField>

        <FormField label="Observación" full>
          <textarea rows={3} value={form.observacion} onChange={update('observacion')} className={inputClass} />
        </FormField>
      </div>

      <div className="mt-auto pt-6 flex flex-wrap justify-start gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-60 cursor-pointer"
        >
          <Save size={16} />
          {guardando ? 'Enviando...' : 'Enviar'}
        </button>
        <button
          onClick={copyTemplate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 ml-auto rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
        >
          <Copy size={16} />
          Copiar plantilla
        </button>
      </div>
    </div>
    <ModalExito
      abierto={modal !== null}
      tipo={modal?.tipo}
      titulo={modal?.titulo}
      mensaje={modal?.mensaje}
      onCerrar={() => setModal(null)}
    />
    </>
  )
}

// Plantilla de requerimiento cliente crítico
const PlantillaRequerimientoCritico = ({ correoApex = '', onEnviado }) => {
  const [form, setForm] = useState({
    tipoActividad: 'VISITA TECNICA',
    usuarioCreador: '',
    rut: '',
    cel: '',
    pedido: '',
    actividad: '',
    comuna: '',
    tecnologia: 'FTTH',
    fecha: '',
    bloque: '',
    marca: 'VTR',
    fechaDeseada: '',
    bloqueDeseado: '',
  })

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const [guardando, setGuardando] = useState(false)
  const [modal, setModal] = useState(null)

  const copyTemplate = () => {
    const text = `Buenas tardes estimada, de ser posible tu ayuda con este requerimiento, cliente crítico

TIPO DE ACTIVIDAD: ${form.tipoActividad}
USUARIO CREADOR: ${form.usuarioCreador}
RUT: ${form.rut}
Cel: ${form.cel}
PEDIDO: ${form.pedido}
ACTIVIDAD: ${form.actividad}
COMUNA: ${form.comuna}
TECNOLOGÍA: ${form.tecnologia}
FECHA: ${form.fecha}
BLOQUE: ${form.bloque}
TIPO DE MARCA: ${form.marca}

FECHA DESEADA: ${form.fechaDeseada}
BLOQUE: ${form.bloqueDeseado}`
    navigator.clipboard.writeText(text)
      .then(() => window.alert('Plantilla copiada al portapapeles'))
      .catch(() => window.alert('No se pudo copiar la plantilla'))
  }

  const guardar = async () => {
    if (!form.usuarioCreador || !form.rut) {
      setModal({ tipo: 'error', titulo: 'Campos incompletos', mensaje: 'Completa al menos el Usuario Creador y el RUT antes de guardar.' })
      return
    }
    setGuardando(true)
    const texto = `Buenas tardes estimada, de ser posible tu ayuda con este requerimiento, cliente crítico

TIPO DE ACTIVIDAD: ${form.tipoActividad}
USUARIO CREADOR: ${form.usuarioCreador}
RUT: ${form.rut}
Cel: ${form.cel}
PEDIDO: ${form.pedido}
ACTIVIDAD: ${form.actividad}
COMUNA: ${form.comuna}
TECNOLOGÍA: ${form.tecnologia}
FECHA: ${form.fecha}
BLOQUE: ${form.bloque}
TIPO DE MARCA: ${form.marca}

FECHA DESEADA: ${form.fechaDeseada}
BLOQUE: ${form.bloqueDeseado}`
    const ok = await enviarTipificacionPersonal({
      correoApex,
      tipo: 'RequerimientoCritico',
      campos: { ...form },
      texto,
      onEnviado,
      setModal,
    })
    setGuardando(false)
    if (ok) {
      setForm(prev => ({
        ...prev,
        usuarioCreador: '',
        rut: '',
        cel: '',
        pedido: '',
        actividad: '',
        comuna: '',
        fecha: '',
        bloque: '',
        fechaDeseada: '',
        bloqueDeseado: '',
      }))
      setModal({ tipo: 'exito', titulo: 'Guardado', mensaje: 'Tipificación guardada en tu historial personal.' })
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"

  return (
    <>
    <div className="w-full flex-1 flex flex-col">
      <div className="mb-6 flex items-start gap-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-r-xl px-4 py-3">
        <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs lg:text-base text-amber-900 dark:text-amber-100 font-medium">
          Adelanto de visita no es procedimiento regular, solo para clientes muy críticos. El manejo en la llamada es: no le aseguramos esa fecha, le indicamos que "haremos lo posible" en coordinación con el área técnica.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 dark:text-gray-100">
          <ClipboardList size={24} className="text-emerald-600 shrink-0" />
          <span>ADELANTO DE VISITA</span>
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 flex-1 content-start">
        <FormField label="Tipo de actividad">
          <input type="text" value={form.tipoActividad} onChange={update('tipoActividad')} className={inputClass} />
        </FormField>
        <FormField label="Usuario Andes">
          <input type="text" value={form.usuarioCreador} onChange={update('usuarioCreador')} className={inputClass} />
        </FormField>
        <FormField label="RUT">
          <input type="text" value={form.rut} onChange={update('rut')} className={inputClass} />
        </FormField>
        <FormField label="Teléfono celular">
          <input type="text" value={form.cel} onChange={update('cel')} className={inputClass} />
        </FormField>
        <FormField label="Pedido (solicitud de servicio de la VT)">
          <input type="text" value={form.pedido} onChange={update('pedido')} className={inputClass} />
        </FormField>
        <FormField label="Actividad (actividad dentro de la VT - terreno)">
          <input type="text" value={form.actividad} onChange={update('actividad')} className={inputClass} />
        </FormField>
        <FormField label="Comuna">
          <input type="text" value={form.comuna} onChange={update('comuna')} className={inputClass} />
        </FormField>
        <FormField label="Tecnología">
          <select value={form.tecnologia} onChange={update('tecnologia')} className={inputClass}>
            <option value="FTTH">FTTH</option>
            <option value="HFC">HFC</option>
          </select>
        </FormField>
        <FormField label="Fecha">
          <input type="date" value={form.fecha} onChange={update('fecha')} className={inputClass} />
        </FormField>
        <FormField label="Bloque">
          <select value={form.bloque} onChange={update('bloque')} className={inputClass}>
            <option value="">Selecciona un bloque</option>
            <option value="10AM - 13PM">10AM - 13PM</option>
            <option value="13PM - 16PM">13PM - 16PM</option>
            <option value="16PM - 19PM">16PM - 19PM</option>
          </select>
        </FormField>
        <FormField label="Tipo de marca">
          <select value={form.marca} onChange={update('marca')} className={inputClass}>
            <option value="VTR">VTR</option>
            <option value="Claro">Claro</option>
            <option value="VTR / Claro">VTR / Claro</option>
          </select>
        </FormField>
        <FormField label="Fecha deseada">
          <input type="date" value={form.fechaDeseada} onChange={update('fechaDeseada')} className={inputClass} />
        </FormField>
        <FormField label="Bloque deseado">
          <select value={form.bloqueDeseado} onChange={update('bloqueDeseado')} className={inputClass}>
            <option value="">Selecciona un bloque</option>
            <option value="10AM - 13PM">10AM - 13PM</option>
            <option value="13PM - 16PM">13PM - 16PM</option>
            <option value="16PM - 19PM">16PM - 19PM</option>
          </select>
        </FormField>
      </div>

      <div className="mt-auto pt-6 flex flex-wrap justify-start gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-60 cursor-pointer"
        >
          <Save size={16} />
          {guardando ? 'Enviando...' : 'Enviar'}
        </button>
        <button
          onClick={copyTemplate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 ml-auto rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
        >
          <Copy size={16} />
          Copiar plantilla
        </button>
      </div>
    </div>
    <ModalExito
      abierto={modal !== null}
      tipo={modal?.tipo}
      titulo={modal?.titulo}
      mensaje={modal?.mensaje}
      onCerrar={() => setModal(null)}
    />
    </>
  )
}

// Plantilla Genesys
const PlantillaGenesys = ({ correoApex = '', onEnviado }) => {
  const [form, setForm] = useState({
    supervisor: '',
    asesor: '',
    rutAsesor: '',
    horaLlamada: '',
    fechaLlamada: '',
    rutCliente: '',
    telefonoCliente: '',
    incidencia: '',
    idAndes: '',
    accion: '',
  })
  const [capturaFile, setCapturaFile] = useState(null)
  const [capturaPreview, setCapturaPreview] = useState('')

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const [guardando, setGuardando] = useState(false)
  const [modal, setModal] = useState(null)

  const SUPERVISORES = ['Enmanuel Mota', 'Zarela Rojas', 'Gean Mendoza', 'Fernando Perez', 'Harold Tejada']
  const INCIDENCIAS = [
    'LLAMADA VACIA O MUDA',
    'LLAMADAS MULTIPLES',
    'CORTE DE LLAMADA AUTOMÁTICO',
    'LLAMADAS ABANDONADA POR EL CLIENTE',
    'LLAMADAS QUE EL CLIENTE NO ESCUCHA AL ASESOR',
  ]
  const ACCIONES = [
    'Devolución de llamada (Atendida)',
    'Devolución de llamada (No atendida)',
    'Agendado',
    'No registra N° de Teléfono en Genesys.',
    'No se llamó al cliente',
  ]

  const onCapturaChange = (e) => {
    const file = e.target.files?.[0] || null
    if (capturaPreview) URL.revokeObjectURL(capturaPreview)
    if (!file) {
      setCapturaFile(null)
      setCapturaPreview('')
      return
    }
    if (!/^image\//i.test(file.type)) {
      setModal({ tipo: 'error', titulo: 'Archivo inválido', mensaje: 'La captura debe ser una imagen (PNG, JPG, etc.).' })
      e.target.value = ''
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setModal({ tipo: 'error', titulo: 'Archivo muy pesado', mensaje: 'La captura no puede superar 8 MB.' })
      e.target.value = ''
      return
    }
    setCapturaFile(file)
    setCapturaPreview(URL.createObjectURL(file))
  }

  const limpiarCaptura = () => {
    if (capturaPreview) URL.revokeObjectURL(capturaPreview)
    setCapturaFile(null)
    setCapturaPreview('')
  }

  const copyTemplate = () => {
    const text = `REGISTRO LLAMADA GENESYS

👤 Supervisor: ${form.supervisor}
👤 Asesor: ${form.asesor}
🪪 RUT Asesor: ${form.rutAsesor}
🕐 Hora de la llamada: ${form.horaLlamada}
📅 Fecha: ${form.fechaLlamada}
🪪 RUT Cliente: ${form.rutCliente}
📱 Teléfono Cliente: ${form.telefonoCliente}
🏷️ ID Tipificación de Andes: ${form.idAndes}
⚠️ Incidencia Ocurrida: ${form.incidencia}
✅ Acción tomada: ${form.accion}`
    navigator.clipboard.writeText(text)
      .then(() => window.alert('Plantilla copiada al portapapeles'))
      .catch(() => window.alert('No se pudo copiar la plantilla'))
  }

  const guardar = async () => {
    if (!form.asesor || !form.rutCliente) {
      setModal({ tipo: 'error', titulo: 'Campos incompletos', mensaje: 'Completa al menos el Asesor y el RUT del Cliente antes de guardar.' })
      return
    }
    if (!capturaFile) {
      setModal({
        tipo: 'error',
        titulo: 'Falta la captura',
        mensaje: 'Adjunta una captura de pantalla del registro en Genesys antes de enviar.',
      })
      return
    }
    setGuardando(true)
    let capturaUrl = ''
    try {
      capturaUrl = await subirImagenImgbb(capturaFile)
    } catch (err) {
      setGuardando(false)
      setModal({
        tipo: 'error',
        titulo: 'No se pudo subir la captura',
        mensaje: err?.message || 'Error al subir la imagen.',
      })
      return
    }
    const texto = `REGISTRO LLAMADA GENESYS

👤 Supervisor: ${form.supervisor}
👤 Asesor: ${form.asesor}
🪪 RUT Asesor: ${form.rutAsesor}
🕐 Hora de la llamada: ${form.horaLlamada}
📅 Fecha: ${form.fechaLlamada}
🪪 RUT Cliente: ${form.rutCliente}
📱 Teléfono Cliente: ${form.telefonoCliente}
🏷️ ID Tipificación de Andes: ${form.idAndes}
⚠️ Incidencia Ocurrida: ${form.incidencia}
✅ Acción tomada: ${form.accion}
🖼️ Captura: ${capturaUrl}`
    const ok = await enviarTipificacionPersonal({
      correoApex,
      tipo: 'Genesys',
      campos: { ...form },
      texto,
      capturaUrl,
      onEnviado,
      setModal,
    })
    setGuardando(false)
    if (ok) {
      setForm({
        supervisor: '',
        asesor: '',
        rutAsesor: '',
        horaLlamada: '',
        fechaLlamada: '',
        rutCliente: '',
        telefonoCliente: '',
        incidencia: '',
        idAndes: '',
        accion: '',
      })
      limpiarCaptura()
      setModal({ tipo: 'exito', titulo: 'Guardado', mensaje: 'Tipificación y captura guardadas en tu historial (también visibles para admin).' })
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"

  return (
    <>
    <div className="w-full flex-1 flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 dark:text-gray-100">
          <ClipboardList size={24} className="text-emerald-600 shrink-0" />
          <span>REGISTRO LLAMADA GENESYS</span>
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 flex-1 content-start w-full">
        <FormField label="Supervisor *">
          <select value={form.supervisor} onChange={update('supervisor')} className={inputClass}>
            <option value="">Selecciona...</option>
            {SUPERVISORES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Asesor *">
          <input type="text" value={form.asesor} onChange={update('asesor')} className={inputClass} />
        </FormField>
        <FormField label="RUT Asesor *">
          <input type="text" value={form.rutAsesor} onChange={update('rutAsesor')} className={inputClass} />
        </FormField>
        <FormField label="Hora de la llamada *">
          <input type="time" value={form.horaLlamada} onChange={update('horaLlamada')} className={inputClass} />
        </FormField>
        <FormField label="Fecha *">
          <input type="date" value={form.fechaLlamada} onChange={update('fechaLlamada')} className={inputClass} />
        </FormField>
        <FormField label="Rut Cliente *">
          <input type="text" value={form.rutCliente} onChange={update('rutCliente')} className={inputClass} />
        </FormField>
        <FormField label="Número de teléfono Cliente *">
          <input type="text" value={form.telefonoCliente} onChange={update('telefonoCliente')} className={inputClass} />
        </FormField>

        <FormField label="Id tipificación de Andes *">
          <input type="text" value={form.idAndes} onChange={update('idAndes')} className={inputClass} />
        </FormField>

        <FormField label="Incidencia Ocurrida *">
          <select value={form.incidencia} onChange={update('incidencia')} className={inputClass}>
            <option value="">Selecciona...</option>
            {INCIDENCIAS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </FormField>

        <FormField label="Acción tomada *">
          <select value={form.accion} onChange={update('accion')} className={inputClass}>
            <option value="">Selecciona...</option>
            {ACCIONES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </FormField>

        <FormField label="Captura de pantalla *" full>
          <div className="space-y-2">
            {!capturaPreview ? (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const f = e.dataTransfer?.files?.[0]
                  if (f) onCapturaChange({ target: { files: [f], value: '' } })
                }}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-7 text-center transition hover:border-emerald-400 hover:bg-emerald-50/60 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                  <Upload size={18} className="text-emerald-600 dark:text-emerald-400" />
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Arrastra la captura o haz clic para subirla
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  PNG o JPG · máximo 8 MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onCapturaChange}
                  className="sr-only"
                />
              </label>
            ) : (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                <img
                  src={capturaPreview}
                  alt="Vista previa captura"
                  className="h-24 w-32 rounded-lg border border-gray-200 bg-white object-contain dark:border-gray-700 dark:bg-gray-950"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="max-w-[14rem] truncate text-xs font-semibold text-gray-800 dark:text-gray-100">
                    {capturaFile?.name}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {capturaFile ? `${(capturaFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    <span className="mx-1.5 opacity-40">·</span>Lista para enviar
                  </span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-emerald-600 dark:hover:text-emerald-400">
                      <RefreshCw size={12} />
                      Cambiar
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={onCapturaChange}
                        className="sr-only"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={limpiarCaptura}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1 text-[11px] font-semibold text-gray-500 transition hover:border-red-300 hover:text-red-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-red-800 dark:hover:text-red-400"
                    >
                      <Trash2 size={12} />
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            )}
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Sube la captura del registro en Genesys. Queda guardada en tu bloc y el admin puede verla.
            </p>
          </div>
        </FormField>
      </div>

      <div className="mt-auto pt-6 flex flex-wrap justify-start gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-60 cursor-pointer"
        >
          <Save size={16} />
          {guardando ? 'Enviando...' : 'Enviar'}
        </button>
        <button
          onClick={copyTemplate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 ml-auto rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
        >
          <Copy size={16} />
          Copiar plantilla
        </button>
      </div>
    </div>
    <ModalExito
      abierto={modal !== null}
      tipo={modal?.tipo}
      titulo={modal?.titulo}
      mensaje={modal?.mensaje}
      onCerrar={() => setModal(null)}
    />
    </>
  )
}

// Plantilla general
const PlantillaGeneral = ({ correoApex = '', onEnviado }) => {
  const [form, setForm] = useState({
    asesor: '',
    rut: '',
    cliente: '',
    correo: '',
    inconveniente: '',
    solucion: '',
    razon: '',
    servicioTipif: '',
    motivo: '',
    detalleRazon: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [modal, setModal] = useState(null)
  // Textos autocompletados desde el catálogo. Se actualizan al cambiar de
  // tipificación, pero no se pisan si el asesor ya escribió a mano.
  const ultimoAutoInconveniente = useRef('')
  const ultimoAutoSolucion = useRef('')

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const rutaTipif = rutaTipificacion({ razon: form.razon, servicio: form.servicioTipif, motivo: form.motivo })
  const lineaTipif = rutaTipif ? `\n\n🔹 TIPIFICACIÓN: ${rutaTipif}` : ''

  const copyTemplate = () => {
    const text = `PLANTILLA GENERAL

👤 Asesor: ${form.asesor}
🪪 RUT: ${form.rut}
➡️ Nombre del Cliente: ${form.cliente}
📧 Correo: ${form.correo}
⚠️ Inconveniente: ${form.inconveniente}
✅ Solución: ${form.solucion}${lineaTipif}`
    navigator.clipboard.writeText(text)
      .then(() => window.alert('Plantilla copiada al portapapeles'))
      .catch(() => window.alert('No se pudo copiar la plantilla'))
  }

  const guardar = async () => {
    if (!form.asesor || !form.cliente) {
      setModal({ tipo: 'error', titulo: 'Campos incompletos', mensaje: 'Completa al menos el Asesor y el Nombre del Cliente antes de guardar.' })
      return
    }
    setGuardando(true)
    const texto = `PLANTILLA GENERAL

👤 Asesor: ${form.asesor}
🪪 RUT: ${form.rut}
➡️ Nombre del Cliente: ${form.cliente}
📧 Correo: ${form.correo}
⚠️ Inconveniente: ${form.inconveniente}
✅ Solución: ${form.solucion}${lineaTipif}`
    const ok = await enviarTipificacionPersonal({
      correoApex,
      tipo: 'Basico',
      campos: { ...form },
      texto,
      onEnviado,
      setModal,
    })
    setGuardando(false)
    if (ok) {
      ultimoAutoInconveniente.current = ''
      ultimoAutoSolucion.current = ''
      setForm(prev => ({
        ...prev,
        asesor: '',
        cliente: '',
        rut: '',
        inconveniente: '',
        solucion: '',
        razon: '',
        servicioTipif: '',
        motivo: '',
        detalleRazon: '',
      }))
      setModal({ tipo: 'exito', titulo: 'Guardado', mensaje: 'Tipificación guardada en tu historial personal.' })
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"

  return (
    <>
    <div className="w-full flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 dark:text-gray-100">
          <ClipboardList size={24} className="text-emerald-600 shrink-0" />
          <span>PLANTILLA GENERAL</span>
        </h3>
      </div>

      <BuscadorTipificacion
        onElegir={(fila) => setForm(prev => {
          const texto = (fila.descripcion || '').trim() || String(fila.motivo || '').trim()
          const destino = fila.destino === 'solucion' ? 'solucion' : 'inconveniente'
          const otro = destino === 'solucion' ? 'inconveniente' : 'solucion'
          const autoDest = destino === 'solucion' ? ultimoAutoSolucion : ultimoAutoInconveniente
          const autoOtro = destino === 'solucion' ? ultimoAutoInconveniente : ultimoAutoSolucion
          const puedeDestino = !prev[destino] || prev[destino] === autoDest.current
          const limpiarOtro = prev[otro] === autoOtro.current
          if (puedeDestino) autoDest.current = texto
          if (limpiarOtro) autoOtro.current = ''
          return {
            ...prev,
            razon: fila.razon,
            servicioTipif: fila.servicio,
            motivo: fila.motivo,
            [destino]: puedeDestino ? texto : prev[destino],
            [otro]: limpiarOtro ? '' : prev[otro],
          }
        })}
        className="mb-4"
      />

      {rutaTipif && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
          <span className="break-words font-mono text-[11px] text-gray-700 dark:text-gray-300">{rutaTipif}</span>
          <button
            type="button"
            onClick={() => setForm(prev => {
              const limpiarInconveniente = prev.inconveniente === ultimoAutoInconveniente.current
              const limpiarSolucion = prev.solucion === ultimoAutoSolucion.current
              if (limpiarInconveniente) ultimoAutoInconveniente.current = ''
              if (limpiarSolucion) ultimoAutoSolucion.current = ''
              return {
                ...prev,
                razon: '',
                servicioTipif: '',
                motivo: '',
                detalleRazon: '',
                inconveniente: limpiarInconveniente ? '' : prev.inconveniente,
                solucion: limpiarSolucion ? '' : prev.solucion,
              }
            })}
            className="ml-auto shrink-0 cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Quitar tipificación"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 flex-1 content-start">
        <FormField label="Asesor">
          <input type="text" value={form.asesor} onChange={update('asesor')} className={inputClass} />
        </FormField>
        <FormField label="RUT">
          <input type="text" value={form.rut} onChange={update('rut')} className={inputClass} />
        </FormField>

        <FormField label="Nombre del cliente">
          <input type="text" value={form.cliente} onChange={update('cliente')} className={inputClass} />
        </FormField>
        <FormField label="Correo">
          <input type="email" value={form.correo} onChange={update('correo')} className={inputClass} />
        </FormField>

        <FormField label="Inconveniente" full>
          <textarea rows={3} value={form.inconveniente} onChange={update('inconveniente')} className={inputClass} />
        </FormField>
        <FormField label="Solución" full>
          <textarea rows={3} value={form.solucion} onChange={update('solucion')} className={inputClass} />
        </FormField>
      </div>

      <div className="mt-auto pt-6 flex flex-wrap justify-start gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-60 cursor-pointer"
        >
          <Save size={16} />
          {guardando ? 'Enviando...' : 'Enviar'}
        </button>
        <button
          onClick={copyTemplate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 ml-auto rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
        >
          <Copy size={16} />
          Copiar plantilla
        </button>
      </div>
    </div>
    <ModalExito
      abierto={modal !== null}
      tipo={modal?.tipo}
      titulo={modal?.titulo}
      mensaje={modal?.mensaje}
      onCerrar={() => setModal(null)}
    />
    </>
  )
}

// Componente de Panel de Administración de Noticias
const AdminPanel = ({ noticias, setNoticias, onToast, openImageModal, nombreUsuario = '', avatarUrl = '', onNavigateToSection }) => {
  const [categoria, setCategoria] = useState('Noticias de Procesos')
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [driveUrl, setDriveUrl] = useState('')
  const [esPopup, setEsPopup] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [subiendoImgbb, setSubiendoImgbb] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [menuExpanded, setMenuExpanded] = useState(false)

  const categorias = [
    'Noticias de Procesos',
    'Noticias Internas',
    'Actualización de Noticias Somos Clave',
  ]

  const handleSubirImgbb = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onToast('Selecciona un archivo de imagen válido.')
      return
    }
    setSubiendoImgbb(true)
    try {
      const url = await subirImagenImgbb(file)
      setDriveUrl(url)
      onToast('¡Imagen subida a imgbb! Revisa la vista previa y publica la noticia.')
    } catch (err) {
      onToast(err.message || 'Error al subir la imagen a imgbb.')
    } finally {
      setSubiendoImgbb(false)
    }
  }

  const iniciarEdicion = (item) => {
    setEditando(item)
    setCategoria(item.categoria || 'Noticias de Procesos')
    setTitulo(item.titulo || '')
    setDescripcion(item.descripcion || '')
    setDriveUrl(item.src || item.driveUrl || '')
    setEsPopup(item.popup === true)
    setFormularioAbierto(true)
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setFormularioAbierto(false)
    setTitulo('')
    setDescripcion('')
    setDriveUrl('')
    setEsPopup(false)
    setCategoria('Noticias de Procesos')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) {
      onToast('Por favor ingresa un título para la noticia.')
      return
    }
    if (!driveUrl) {
      onToast('Ingresa el enlace directo de la imagen (JPG, PNG, WEBP, etc.).')
      return
    }

    setGuardando(true)

    if (editando) {
      const ok = await actualizarNoticia({ id: editando.id, categoria, titulo, descripcion, driveUrl, popup: esPopup })
      if (!ok) {
        setGuardando(false)
        onToast('Error al guardar. Revisa la conexión y vuelve a intentarlo.')
        return
      }
      onToast('¡Noticia actualizada con éxito!')
      setEditando(null)
    } else {
      const ok = await publicarNoticia({ categoria, titulo, descripcion, driveUrl, popup: esPopup })
      if (!ok) {
        setGuardando(false)
        onToast('Error al publicar. Revisa la conexión y vuelve a intentarlo.')
        return
      }
      onToast('¡Noticia publicada con éxito!')
    }

    setTitulo('')
    setDescripcion('')
    setDriveUrl('')
    setEsPopup(false)
    setGuardando(false)
    setFormularioAbierto(false)
  }

  const handleEliminar = async (item) => {
    await eliminarNoticia(item.id)
    onToast('Noticia eliminada correctamente.')
  }

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(driveUrl)
      onToast('Enlace copiado al portapapeles.')
    } catch {
      onToast('No se pudo copiar el enlace.')
    }
  }

  const noticiasFiltradas = noticias.filter((item) => {
    const catOk = filtroCategoria === 'Todas' || item.categoria === filtroCategoria
    const texto = normalize(`${item.titulo || item.alt || ''} ${item.descripcion || ''}`)
    const buscaOk = !busqueda || texto.includes(normalize(busqueda))
    return catOk && buscaOk
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Buscador y filtros por categoría */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar comunicado por título..."
            className="w-full pl-9 pr-8 py-2.5 rounded-full border border-white/10 bg-white/5 text-white text-xs placeholder-gray-400 focus:outline-none"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Todas', ...categorias].map((cat) => {
            const count = cat === 'Todas' ? noticias.length : noticias.filter((n) => n.categoria === cat).length
            const active = filtroCategoria === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                  active ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat === 'Noticias de Procesos' ? 'Procesos' : cat === 'Noticias Internas' ? 'Internas' : cat === 'Actualización de Noticias Somos Clave' ? 'Somos Clave' : 'Todas'}
                <span className="ml-1 opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal: formulario para publicar/editar comunicados */}
      {formularioAbierto && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 overflow-y-auto"
          onClick={() => {
            if (!guardando) {
              cancelarEdicion()
            }
          }}
        >
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
            <div
              className="relative w-full max-w-3xl rounded-[28px] bg-[#1a1a1a]/75 backdrop-blur-xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.55)] my-4 animate-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  if (!guardando) {
                    cancelarEdicion()
                  }
                }}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
              <div className="p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl">
                <ClipboardList size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">
                  {editando ? 'Editar comunicado' : 'Publicar nuevo comunicado'}
                </h3>
                <p className="text-xs text-gray-400">
                  {editando ? 'Modifica los campos y pulsa Guardar cambios' : 'Completa las secciones y pulsa Publicar'}
                </p>
                {nombreUsuario && (
                  <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                    Supervisor: {nombreUsuario}
                  </p>
                )}
              </div>
              {editando && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="px-3 py-2 rounded-xl bg-white/10 text-gray-200 text-xs font-bold flex items-center gap-1.5 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                >
                  <X size={14} /> Cancelar
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sección 1: Categoría */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Tipo / Categoría de Noticia <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategoria(cat)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                        categoria === cat
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-sm ring-2 ring-emerald-500/20'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sección 2: Contenido */}
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Título del Comunicado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Nuevo procedimiento de retención FTTH / Actualización de credenciales..."
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Descripción / Detalle del Comunicado
                    </label>
                    <textarea
                      rows={3}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Ingresa la descripción o detalle explicativo..."
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Imagen */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Imagen del comunicado <span className="text-red-500">*</span>
                </label>

                <div
                  className={`rounded-2xl overflow-hidden bg-white/5 transition-colors ${
                    driveUrl
                      ? 'border border-white/10'
                      : 'border-2 border-dashed border-white/20 hover:border-emerald-500'
                  }`}
                >
                  {driveUrl ? (
                    <div className="relative bg-black/40 flex items-center justify-center">
                      <img
                        src={driveUrl}
                        alt="Previsualización"
                        className="w-full max-h-56 object-contain"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect fill="%23f3f4f6" width="400" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                        }}
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={copiarEnlace}
                          className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Copiar enlace"
                        >
                          <Copy size={14} />
                        </button>
                        <a
                          href={driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                          title="Abrir imagen en nueva pestaña"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setDriveUrl('')}
                          className="w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Quitar imagen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <label className="absolute bottom-2 left-2 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow flex items-center gap-1.5 cursor-pointer transition-colors">
                        <input type="file" accept="image/*" onChange={handleSubirImgbb} className="sr-only" />
                        {subiendoImgbb ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload size={13} /> Cambiar imagen
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center text-center px-4 py-6 cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleSubirImgbb} className="sr-only" />
                      {subiendoImgbb ? (
                        <>
                          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-xs font-bold text-emerald-300">Subiendo a imgbb...</p>
                          <p className="text-[10px] text-gray-400 mt-1">Generando enlace directo</p>
                        </>
                      ) : (
                        <>
                          <Upload className="text-emerald-500 mb-2" size={28} />
                          <p className="text-xs font-bold text-gray-200">Subir imagen a imgbb</p>
                          <p className="text-[10px] text-gray-400 mt-1">JPG, PNG, WEBP, GIF, AVIF...</p>
                          <span className="mt-2 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow">
                            Elegir imagen
                          </span>
                        </>
                      )}
                    </label>
                  )}

                  <div className="border-t border-white/10 px-3 py-3">
                    <div className="flex items-center gap-2">
                      {driveUrl ? (
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Globe size={15} className="text-gray-400 shrink-0" />
                      )}
                      <input
                        type="url"
                        required
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        placeholder="O pega el enlace directo: https://i.ibb.co/imagen.jpg"
                        className="flex-1 min-w-0 px-3 py-2 rounded-full border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <p className="mt-1.5 pl-7 text-[10px] text-gray-400">
                      {driveUrl
                        ? 'Este enlace se usará al publicar la noticia.'
                        : 'Sube la imagen o pega un enlace JPG, PNG, WEBP, GIF, AVIF o de Google Drive (uc?export=view&id=...).'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 4: Pop up al abrir la web */}
              <div>
                <button
                  type="button"
                  onClick={() => setEsPopup((v) => !v)}
                  aria-pressed={esPopup}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    esPopup
                      ? 'border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className={`p-2.5 rounded-xl shrink-0 ${esPopup ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                    <Bell size={18} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-100">Pop up</span>
                    <span className="block text-[11px] text-gray-400 leading-snug">
                      La imagen de este comunicado se mostrará como modal al abrir la web.
                    </span>
                  </span>
                  <span className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${esPopup ? 'bg-emerald-600' : 'bg-white/20'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${esPopup ? 'translate-x-5' : ''}`} />
                  </span>
                </button>
                {esPopup && (
                  <p className="mt-2 text-[10px] font-semibold text-emerald-400">
                    Activado: aparecerá como pop up cada vez que se abra la web.
                  </p>
                )}
              </div>

              {/* Sección 5: Publicar */}
              <div>
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={18} />
                  {guardando ? (editando ? 'Guardando...' : 'Publicando...') : editando ? 'Guardar Cambios' : 'Publicar Noticia'}
                </button>
              </div>
            </form>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* Noticias publicadas */}
        <ModernCard hover={false}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Noticias publicadas</h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-300">Haz clic en una tarjeta para ver la imagen</p>
              </div>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold px-2.5 py-1 rounded-full shrink-0">
                {noticiasFiltradas.length} noticias
              </span>
            </div>

            {/* Listado en tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {noticiasFiltradas.length === 0 ? (
                <div className="sm:col-span-2 xl:col-span-3">
                  <p className="text-xs text-gray-400 text-center py-8">No hay noticias en este filtro.</p>
                </div>
              ) : (
                noticiasFiltradas.map((item) => (
                  <div
                    key={item.id || item.src}
                    className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                  >
                    <div
                      className="relative h-44 sm:h-56 bg-gray-100 dark:bg-gray-900 cursor-pointer flex items-center justify-center overflow-hidden"
                      onClick={() => openImageModal(item.src, 'large', true)}
                    >
                      <img
                        src={item.src}
                        alt={item.alt || item.titulo}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect fill="%23f3f4f6" width="400" height="250"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                          {item.categoria || 'Noticias Internas'}
                        </span>
                        {item.popup && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                            <Bell size={10} /> Pop up
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
                        {item.titulo || item.alt || 'Comunicado'}
                      </p>
                      {item.descripcion && (
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {formatNewsText(item.descripcion)}
                        </div>
                      )}
                      {item.fecha && <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-300">{item.fecha}</p>}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <button
                          onClick={() => openImageModal(item.src, 'large', true)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                          title="Ver imagen"
                        >
                          <Eye size={13} /> Ver
                        </button>
                        <button
                          onClick={() => iniciarEdicion(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                          title="Editar noticia"
                        >
                          <Pencil size={13} /> Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[11px] font-bold hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                          title="Eliminar noticia"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ModernCard>

      {/* Botón flotante con menú expandible vertical */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2">
        {/* Botones expandidos */}
        <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${menuExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="relative group">
            <button
              onClick={() => {
                cancelarEdicion()
                setFormularioAbierto(true)
                setMenuExpanded(false)
              }}
              className="w-12 h-12 rounded-full bg-white text-gray-900 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Subir comunicado"
              aria-label="Subir comunicado"
            >
              <Upload size={20} />
            </button>
            <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
              Subir comunicado
            </span>
          </div>
          <div className="relative group">
            <button
              onClick={() => {
                setMenuExpanded(false)
                if (onNavigateToSection) {
                  onNavigateToSection('configuracion')
                }
              }}
              className="w-12 h-12 rounded-full bg-white text-gray-900 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Datos de la cuenta"
              aria-label="Datos de la cuenta"
            >
              <Lock size={20} />
            </button>
            <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
              Datos de la cuenta
            </span>
          </div>
          <div className="relative group">
            <button
              onClick={() => {
                setMenuExpanded(false)
                if (onNavigateToSection) {
                  onNavigateToSection('usuarios')
                }
              }}
              className="w-12 h-12 rounded-full bg-white text-gray-900 shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Usuarios y lecturas"
              aria-label="Usuarios y lecturas"
            >
              <Users size={20} />
            </button>
            <span className="absolute right-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
              Usuarios y lecturas
            </span>
          </div>
        </div>

        {/* Botón principal (X) */}
        <button
          onClick={() => setMenuExpanded(!menuExpanded)}
          className={`w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer ${menuExpanded ? 'rotate-45' : ''}`}
          title="Menú de acciones"
          aria-label="Menú de acciones"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

const apexOmniaUsers = [
  { name: 'Maldonado Ñañez Shiomara Lisbet', user: '785273', password: '' },
  { name: 'Amaya Rojas Iris Alejandra', user: '785280', password: '' },
  { name: 'Villantoy Cuaresma Adrian Nilo', user: '785131', password: '' },
  { name: 'Choy Huarachi Diego Orlando', user: '785128', password: '' },
  { name: 'Castillo Pinedo Elsa María Alexandra', user: '785292', password: '' },
  { name: 'Alamo Anccori Yina Angela', user: '785133', password: '' },
]

// Panel de administración: correos habilitados y quién vio cada comunicado.
const UsuariosSection = ({ noticias = [], onToast }) => {
  const [lectores, setLectores] = useState([])
  const [lecturas, setLecturas] = useState([])
  const [emailNuevo, setEmailNuevo] = useState('')
  const [filtroUsuarios, setFiltroUsuarios] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [noticiaExpandida, setNoticiaExpandida] = useState(null)
  const [exportandoTipif, setExportandoTipif] = useState(false)

  useEffect(() => {
    const unsub = suscribirLectores((items) => setLectores(items))
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsub = suscribirLecturas((items) => setLecturas(items))
    return () => unsub()
  }, [])

  const handleAgregar = async (e) => {
    e.preventDefault()
    const candidatos = extraerEmailsDeTexto(emailNuevo)
    if (!candidatos.length) {
      onToast('Pega uno o varios correos (separados por coma, salto de línea o espacio).')
      return
    }

    const yaEnLista = new Set(lectores.map((l) => l.email))
    const nuevos = candidatos.filter((email) => !yaEnLista.has(email))
    const duplicados = candidatos.length - nuevos.length

    if (!nuevos.length) {
      onToast(
        candidatos.length === 1
          ? 'Ese correo ya está en la lista.'
          : `Los ${candidatos.length} correos ya estaban en la lista.`
      )
      return
    }

    setGuardando(true)
    const res = await agregarLectores(nuevos)
    setGuardando(false)

    if (!res.ok) {
      onToast('No se pudieron agregar los correos. Revisa la conexión.')
      return
    }

    setEmailNuevo('')
    const partes = [`${res.agregados} correo${res.agregados === 1 ? '' : 's'} agregado${res.agregados === 1 ? '' : 's'}`]
    if (duplicados > 0) partes.push(`${duplicados} ya existía${duplicados === 1 ? '' : 'n'}`)
    if (res.invalidos?.length) partes.push(`${res.invalidos.length} inválido${res.invalidos.length === 1 ? '' : 's'}`)
    onToast(partes.join(' · '))
  }

  const handleArchivoCorreos = async (file) => {
    if (!file) return
    try {
      const texto = await file.text()
      setEmailNuevo((prev) => {
        const base = prev.trim()
        const extra = texto.trim()
        return base ? `${base}\n${extra}` : extra
      })
      onToast(`Archivo cargado: ${file.name}. Revisa y pulsa Agregar.`)
    } catch {
      onToast('No se pudo leer el archivo.')
    }
  }

  const handleEliminar = async (email) => {
    const ok = await eliminarLector(email)
    onToast(ok ? 'Correo eliminado de la lista.' : 'No se pudo eliminar el correo.')
  }

  const filtroNorm = filtroUsuarios.trim().toLowerCase()
  const lectoresFiltrados = filtroNorm
    ? lectores.filter((l) =>
        (l.email || '').toLowerCase().includes(filtroNorm) ||
        nombreDesdeEmail(l.email).toLowerCase().includes(filtroNorm)
      )
    : lectores

  const avisosLista = [...noticias].sort((a, b) => Number(b.popup) - Number(a.popup))
  const lecturasDeNoticia = (id) => lecturas.filter((l) => l.noticiaId === id)
  const lecturasDelCorreo = (email) => lecturas.filter((l) => avisosLista.some((n) => n.id === l.noticiaId) && l.email === email)
  const vistasDelCorreo = (email) => lecturasDelCorreo(email).length
  const titulosVistosDelCorreo = (email) => avisosLista
    .filter((n) => lecturas.some((l) => l.noticiaId === n.id && l.email === email))
    .map((n) => n.titulo || n.alt || 'Comunicado')
    .join(' | ')

  const exportarExcel = () => {
    const xmlEscape = (valor) => String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    const fila = (celdas) => `<Row>${celdas.map((c) => `<Cell><Data ss:Type="String">${xmlEscape(c)}</Data></Cell>`).join('')}</Row>`
    const hoja = (nombre, encabezados, filas) => `
      <Worksheet ss:Name="${xmlEscape(nombre)}">
        <Table>
          ${fila(encabezados)}
          ${filas.map((r) => fila(r)).join('')}
        </Table>
      </Worksheet>`

    const filasUsuarios = lectores.map((lector) => [
      lector.email,
      String(vistasDelCorreo(lector.email)),
      titulosVistosDelCorreo(lector.email) || 'Ninguno',
      String(avisosLista.length),
      vistasDelCorreo(lector.email) === avisosLista.length && avisosLista.length > 0 ? 'Completo' : 'Pendiente',
    ])

    const filasComunicados = avisosLista.map((item) => {
      const vistas = lecturasDeNoticia(item.id)
      const pendientes = lectores.filter((l) => !vistas.some((v) => v.email === l.email))
      return [
        item.titulo || item.alt || 'Comunicado',
        item.fecha || '',
        item.popup ? 'Sí' : 'No',
        String(vistas.length),
        String(lectores.length),
        vistas.map((v) => v.email).join(', '),
        pendientes.map((p) => p.email).join(', '),
      ]
    })

    const filasDetalle = []
    avisosLista.forEach((item) => {
      const titulo = item.titulo || item.alt || 'Comunicado'
      lectores.forEach((lector) => {
        const vista = lecturas.find((l) => l.noticiaId === item.id && l.email === lector.email)
        filasDetalle.push([
          titulo,
          item.fecha || '',
          lector.email,
          vista ? 'Visto' : 'Pendiente',
          vista?.fecha || '',
        ])
      })
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  ${hoja('Usuarios', ['Correo', 'Vistos', 'Títulos vistos', 'Total comunicados', 'Estado'], filasUsuarios)}
  ${hoja('Por comunicado', ['Comunicado', 'Fecha', 'Pop up', 'Vieron', 'Total usuarios', 'Correos que vieron', 'Pendientes'], filasComunicados)}
  ${hoja('Detalle', ['Comunicado', 'Fecha comunicado', 'Correo', 'Estado', 'Fecha de lectura'], filasDetalle)}
</Workbook>`

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const fecha = new Date().toLocaleDateString('es-CL').replace(/\//g, '-')
    a.href = url
    a.download = `lecturas-comunicados-${fecha}.xls`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    onToast('Archivo de Excel descargado.')
  }

  /** Excel con todas las tipificaciones (incl. Genesys + capturas) de los correos corporativos */
  const exportarExcelTipificaciones = async () => {
    if (!db) {
      onToast('Firestore no disponible.')
      return
    }
    setExportandoTipif(true)
    try {
      const items = await listarTipificacionesAdmin(db, { dominio: 'apexamerica.com' })
      if (!items.length) {
        onToast('No hay tipificaciones de usuarios @apexamerica.com para exportar.')
        return
      }
      const stamp = new Date().toISOString().slice(0, 10)
      exportarTipificacionesExcel(items, `tipificaciones_apexamerica_${stamp}.xls`)
      onToast(`Excel tipificaciones: ${items.length} registro${items.length === 1 ? '' : 's'} de @apexamerica.com.`)
    } catch (err) {
      console.error(err)
      onToast(err?.message || 'No se pudo exportar las tipificaciones.')
    } finally {
      setExportandoTipif(false)
    }
  }

  const exportarCsvTipificaciones = async () => {
    if (!db) {
      onToast('Firestore no disponible.')
      return
    }
    setExportandoTipif(true)
    try {
      const items = await listarTipificacionesAdmin(db, { dominio: 'apexamerica.com' })
      if (!items.length) {
        onToast('No hay tipificaciones de usuarios @apexamerica.com para exportar.')
        return
      }
      const stamp = new Date().toISOString().slice(0, 10)
      exportarTipificacionesCsv(items, `tipificaciones_apexamerica_${stamp}.csv`)
      onToast(`CSV tipificaciones: ${items.length} registro${items.length === 1 ? '' : 's'}.`)
    } catch (err) {
      console.error(err)
      onToast(err?.message || 'No se pudo exportar las tipificaciones.')
    } finally {
      setExportandoTipif(false)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300 w-full">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={exportarExcel}
          className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-xs sm:text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Download size={15} />
          Excel lecturas
        </button>
        <button
          type="button"
          onClick={exportarExcelTipificaciones}
          disabled={exportandoTipif}
          className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          title="Descarga todo lo que subieron los usuarios @apexamerica.com (Genesys, capturas, plantillas)"
        >
          <Download size={15} />
          {exportandoTipif ? 'Preparando…' : 'Excel tipificaciones'}
        </button>
        <button
          type="button"
          onClick={exportarCsvTipificaciones}
          disabled={exportandoTipif}
          className="px-3 py-2 rounded-xl bg-gray-800 dark:bg-gray-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <Download size={15} />
          CSV tipificaciones
        </button>
      </div>
    <div className="grid lg:grid-cols-2 gap-4 lg:gap-5 items-start">
      {/* Correos habilitados */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Users size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Usuarios</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pega varios correos a la vez o sube un .txt/.csv para habilitar lecturas
            </p>
          </div>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold px-2.5 py-1 rounded-full shrink-0">
            {filtroNorm ? `${lectoresFiltrados.length}/${lectores.length}` : lectores.length}
          </span>
        </div>

        <form onSubmit={handleAgregar} className="flex flex-col gap-2 mb-5">
          <div className="relative min-w-0">
            <Mail size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <textarea
              value={emailNuevo}
              onChange={(e) => setEmailNuevo(e.target.value)}
              placeholder={'Uno o varios correos corporativos:\ncorreo1@tuempresa.com\ncorreo2@tuempresa.com\n(también coma, ; o espacio)'}
              rows={4}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none resize-y min-h-[96px]"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 shrink-0">
              <Upload size={16} />
              Subir .txt / .csv
              <input
                type="file"
                accept=".txt,.csv,.tsv,text/plain,text/csv"
                className="hidden"
                onChange={(e) => {
                  handleArchivoCorreos(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Save size={16} />
              {guardando ? 'Agregando...' : 'Agregar todos'}
            </button>
          </div>
        </form>

        {lectores.length > 0 && (
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={filtroUsuarios}
              onChange={(e) => setFiltroUsuarios(e.target.value)}
              placeholder="Buscar usuario por nombre o correo…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
            />
          </div>
        )}

        {lectores.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            Aún no hay correos. Agrega el primero para poder registrar las lecturas.
          </p>
        ) : lectoresFiltrados.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            Ningún correo coincide con “{filtroUsuarios.trim()}”.
          </p>
        ) : (
          <ul className="space-y-2 max-h-[420px] overflow-y-auto">
            {lectoresFiltrados.map((lector) => (
              <li
                key={lector.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5"
              >
                {(() => {
                  const av = avatarImgProps(lector.avatarUrl, { fallbackMessenger: false })
                  const inicial = (nombreDesdeEmail(lector.email) || String(lector.email || '?')).charAt(0).toUpperCase()
                  return av.src ? (
                    <img
                      src={av.src}
                      alt=""
                      className={`w-9 h-9 shrink-0 ${av.isMessenger ? 'messenger-avatar-img' : 'rounded-full object-cover'}`}
                      style={av.style}
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                      {inicial}
                    </span>
                  )
                })()}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {nombreDesdeEmail(lector.email)}
                    </p>
                    {String(lector.email || '').toLowerCase().endsWith('@apexamerica.com') && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
                        Apex
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {lector.email}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 shrink-0">
                  {vistasDelCorreo(lector.email)} / {avisosLista.length} vistos
                </span>
                <button
                  onClick={() => handleEliminar(lector.email)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer shrink-0"
                  title="Quitar correo"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contador de lecturas por comunicado */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Eye size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quién vio cada comunicado</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Presiona un comunicado para ver los correos que lo abrieron
            </p>
          </div>
        </div>

        {avisosLista.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">Todavía no hay comunicados publicados.</p>
        ) : (
          <ul className="space-y-2">
            {avisosLista.map((item) => {
              const vistas = lecturasDeNoticia(item.id)
              const abierta = noticiaExpandida === item.id
              const pendientes = lectores.filter((l) => !vistas.some((v) => v.email === l.email))
              return (
                <li key={item.id} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setNoticiaExpandida(abierta ? null : item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                        {item.titulo || item.alt || 'Comunicado'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.popup && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                            <Bell size={9} /> Pop up
                          </span>
                        )}
                        {item.fecha && <p className="text-[11px] text-gray-400">{item.fecha}</p>}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${
                        vistas.length > 0
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {vistas.length} / {lectores.length} vieron
                    </span>
                    {abierta ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                  </button>
                  {abierta && (
                    <div className="px-3 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
                          Lo vieron ({vistas.length})
                        </p>
                        {vistas.length === 0 ? (
                          <p className="text-xs text-gray-400">Nadie lo ha abierto todavía.</p>
                        ) : (
                          <ul className="space-y-1">
                            {vistas.map((v) => (
                              <li key={v.id} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{nombreDesdeEmail(v.email)}</span>
                                <span className="text-[11px] text-gray-400 truncate">({v.email})</span>
                                {v.fecha && <span className="text-[10px] text-gray-400 shrink-0 ml-auto">{v.fecha}</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {pendientes.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                            Pendientes ({pendientes.length})
                          </p>
                          <ul className="space-y-1">
                            {pendientes.map((p) => (
                              <li key={p.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <AlertCircle size={13} className="text-amber-500 shrink-0" />
                                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{nombreDesdeEmail(p.email)}</span>
                                <span className="text-[11px] text-gray-400 truncate">({p.email})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
    </div>
  )
}

/** Pasos del video tutorial ZTETUTO.mp4 — gestión del equipo (ONT/router ZTE) en SCP */
const ZTE_SCP_VIDEO_PASOS = [
  {
    titulo: 'Inicio en el dashboard principal',
    items: [
      'Se muestra la pantalla de inicio de SCP | CPE (Device Management) con estadísticas generales: controladores online/offline, agentes, modos de red y cobertura Wi-Fi.',
      'Haz clic en la pestaña Device Management.',
    ],
  },
  {
    titulo: 'Búsqueda del dispositivo (primer intento fallido)',
    items: [
      'Entra a la sección de consulta de dispositivos.',
      'Escribe el SN 5A54454TD82AA3C6 y pulsa Query.',
      'Aparece el mensaje de error: "The device does not exist. Check the query conditions."',
    ],
  },
  {
    titulo: 'Búsqueda correcta del dispositivo',
    items: [
      'Borra el SN anterior y escribe 5A54454TD823F1FF. Al consultar, el dispositivo aparece correctamente.',
    ],
    detalle: [
      'Estado: Online / Connected',
      'Modelo: F6600P (ZTE)',
      'MAC: 58D312B57824',
      'Versión: V9.0.10P9N31B',
      'IP: 10.255.248.1',
      'Alias: ZTE-F6600P',
      'Tiempo de encendido: más de 1 día',
    ],
  },
  {
    titulo: 'Cambio breve a otro sistema (Andes / Claro)',
    items: [
      'Se cambia momentáneamente a la plataforma Andes (portal de cliente Claro).',
      'Se ve el perfil del cliente, productos instalados (banda ancha, TV, etc.), actividades, pedidos y solicitudes de servicio.',
      'Se observa una dirección MAC distinta (DCA633F3D6FB) y datos de facturación.',
      'Luego se regresa al sistema SCP.',
    ],
  },
  {
    titulo: 'Revisión de parámetros Wi-Fi',
    items: [
      'De vuelta en el dispositivo 5A54454TD823F1FF, entra a la pestaña Wi-Fi Parameters.',
      'Wi-Fi Standard: Bandsteering desactivado.',
      '2.4G: SSID VTR-6470989, cifrado WPA3-PSK-AES, canal 11, ancho de banda 20 MHz.',
      '5G: SSID VTR-6470989 5G, mismo cifrado, canal 48, ancho de banda 80 MHz.',
      'Revisa también las opciones de One-click Optimization (inicialmente sin datos).',
    ],
  },
  {
    titulo: 'Exploración de configuración avanzada de Wi-Fi',
    items: [
      'Expande las secciones de canal, potencia de transmisión (100 %), estándares Wi-Fi mixtos y optimización de un clic.',
      'Más adelante se muestran resultados de optimización (canales 11 en 2.4G y 48→161 en 5G).',
    ],
  },
  {
    titulo: 'Cambio de contraseña de acceso web del router',
    items: [
      'Ve a la pestaña Password Modification.',
      'Aparece el formulario para modificar la contraseña de login web del dispositivo (campos "New Password" y "New Password Confirmation").',
      'El cursor se posiciona sobre el botón Submit.',
    ],
  },
]

/** Causas de la alerta LOS en rojo (fibra óptica) — se muestran como selector */
const FIBRA_CAUSAS = [
  {
    Icon: Unplug,
    titulo: 'El cable se rompió',
    subtitulo: 'Corte del cable exterior',
    texto: 'Es la causa más común en la calle. Un camión alto que enganchó el cable, la caída de una rama o un roedor que lo mordió pueden romper el hilo de vidrio. Al romperse, la luz se escapa y el flujo se detiene por completo.',
  },
  {
    Icon: Cable,
    titulo: 'El cable se dobló o se pisó',
    subtitulo: 'Estrangulamiento del cable',
    texto: 'Aunque el cable es flexible, si se dobla en un ángulo muy cerrado (por ejemplo, aplastado por un mueble o doblado a la fuerza en una esquina de la pared), la luz ya no puede rebotar para seguir avanzando. Es el equivalente exacto a pisar una manguera de agua en el jardín.',
  },
  {
    Icon: Plug,
    titulo: 'El conector está sucio o flojo',
    subtitulo: 'Conector afectado',
    texto: 'El cable que se conecta detrás de tu router tiene una punta plástica. Si se desenganchó un poco o si le entró una mota diminuta de polvo, ese obstáculo bloqueará el rayo de luz por completo, impidiendo que entre al router.',
  },
  {
    Icon: Server,
    titulo: 'Se cerró la llave de paso principal',
    subtitulo: 'Problema en la central',
    texto: 'A veces tu cable doméstico está impecable, pero los equipos de la empresa de internet sufrieron un apagón o están en mantenimiento. Al no haber un LÁSER emitiendo luz desde la central, tu router detecta que la línea quedó "oscura" y enciende la alarma roja.',
  },
]

const App = () => {
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [tipificacionesRefresh, setTipificacionesRefresh] = useState(0)
  const [expandedSections, setExpandedSections] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalImage, setModalImage] = useState(null)
  const [modalSize, setModalSize] = useState('large')
  const [modalDisableZoom, setModalDisableZoom] = useState(false)
  const [fibraCausaSel, setFibraCausaSel] = useState(0)
  const [contratacionSeleccion, setContratacionSeleccion] = useState(null)
  const [dboxContratacionSeleccion, setDboxContratacionSeleccion] = useState(null)
  const [plantillaSeleccion, setPlantillaSeleccion] = useState('general')
  const [appliedIdsSearch, setAppliedIdsSearch] = useState('')
  const [idClaveVTR, setIdClaveVTR] = useState(() => IDS_CLAVE_SEED.map((x) => ({ ...x })))
  const [noticiaOpen, setNoticiaOpen] = useState(false)
  const [noticiaIndex, setNoticiaIndex] = useState(0)
  const [colaPopup, setColaPopup] = useState([])
  const [popupsVistos, setPopupsVistos] = useState(() => {
    if (typeof window === 'undefined') return []
    return leerPopupsVistosLocal(localStorage.getItem('vtr-lector-email') || '')
  })
  const [popupsCargados, setPopupsCargados] = useState(() => {
    if (typeof window === 'undefined') return true
    return !localStorage.getItem('vtr-lector-email')
  })
  const omitidosSesionRef = useRef(new Set())
  const [noticias, setNoticias] = useState([])
  const [noticiasFiltroCat, setNoticiasFiltroCat] = useState('Todas')
  const [expandedNews, setExpandedNews] = useState({})
  const [toast, setToast] = useState(null)
  const [credencialModal, setCredencialModal] = useState(null)
  const [routerModalOpen, setRouterModalOpen] = useState(false)
  const [modalSomosClave, setModalSomosClave] = useState(null)
  const [lectorEmail, setLectorEmail] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('vtr-lector-email') || ''
  })
  // Identidad real (Firebase Auth) para las tipificaciones. `lectorEmail` sale
  // de localStorage y cualquiera puede editarlo, así que no sirve como prueba
  // de quién escribe: las reglas de Firestore exigen que el documento se llame
  // como el correo de esta sesión de Google.
  const { email: correoSesion, verificado: sesionVerificada } = useMessengerAuth(app)
  const correoTipificaciones = sesionVerificada ? correoSesion : ''
  const [lectorAvatar, setLectorAvatar] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('vtr-lector-avatar') || ''
  })
  const [lectorAvatares, setLectorAvatares] = useState(() => {
    if (typeof window === 'undefined') return []
    const email = localStorage.getItem('vtr-lector-email') || ''
    const actual = localStorage.getItem('vtr-lector-avatar') || ''
    return normalizarHistorialAvatares(cargarHistorialAvataresLocal(email), actual)
  })
  const [comunicadoPendiente, setComunicadoPendiente] = useState(null)
  const [loginMessenger, setLoginMessenger] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.hash === '#admin')) {
      window.location.replace('/admin')
    }
  }, [])

  const openImageModal = (src, size = 'large', disableZoom = false) => {
    setModalImage(src)
    setModalSize(size)
    setModalDisableZoom(disableZoom)
  }

  const closeImageModal = () => {
    setModalImage(null)
    setModalDisableZoom(false)
  }

  const showToast = (mensaje) => setToast(mensaje)

  const aplicarHistorialAvatares = (email, urls, actual = '') => {
    const merged = normalizarHistorialAvatares(
      [...(urls || []), ...cargarHistorialAvataresLocal(email)],
      actual
    )
    setLectorAvatares(merged)
    guardarHistorialAvataresLocal(email, merged)
    guardarHistorialAvatares(email, merged)
    return merged
  }

  const aplicarAvatarLector = async (url) => {
    const next = String(url || '').trim()
    if (!next || !lectorEmail) return false
    const ok = await guardarPerfilLector(lectorEmail, { avatarUrl: next })
    if (!ok) throw new Error('No se pudo guardar')
    setLectorAvatar(next)
    try {
      localStorage.setItem('vtr-lector-avatar', next)
    } catch {
      /* ignore */
    }
    aplicarHistorialAvatares(lectorEmail, lectorAvatares, next)
    return true
  }

  const cambiarFotoPerfil = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Selecciona una imagen válida.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('La imagen debe pesar menos de 4 MB.')
      return
    }
    const url = await subirImagenImgbb(file)
    await aplicarAvatarLector(url)
    showToast('¡Foto de perfil actualizada!')
    return url
  }

  const elegirAvatarGuardado = async (url) => {
    await aplicarAvatarLector(url)
    showToast('Foto de perfil actualizada.')
  }

  // Abre un comunicado y deja registrada la lectura del correo identificado.
  const abrirComunicado = (item) => {
    if (!lectorEmail) {
      setComunicadoPendiente(item)
      return
    }
    registrarLectura(item.id, lectorEmail)
    openImageModal(item.src, 'large', true)
  }

  const confirmarLector = (email) => {
    setLectorEmail(email)
    localStorage.setItem('vtr-lector-email', email)
    cargarPerfilLector(email).then((perfil) => {
      const url = perfil?.avatarUrl || ''
      setLectorAvatar(url)
      aplicarHistorialAvatares(email, perfil?.avatarHistorial || [], url)
      try {
        if (url) localStorage.setItem('vtr-lector-avatar', url)
        else localStorage.removeItem('vtr-lector-avatar')
      } catch {
        /* ignore */
      }
    })
    if (comunicadoPendiente) {
      registrarLectura(comunicadoPendiente.id, email)
      openImageModal(comunicadoPendiente.src, 'large', true)
      setComunicadoPendiente(null)
    }
    setLoginMessenger(false)
  }

  const handleNav = (id) => {
    if (id === 'admin') {
      window.location.href = '/admin'
      return
    }
    setActiveSection(id)
  }

  useEffect(() => {
    const unsub = suscribirNoticias((items) => setNoticias(items))
    return () => unsub()
  }, [])

  useEffect(() => {
    let cancel = false
    cargarIdsClave(db).then((docs) => {
      if (!cancel && docs?.length) setIdClaveVTR(docs)
    })
    return () => {
      cancel = true
    }
  }, [])

  useEffect(() => {
    if (!lectorEmail) {
      setLectorAvatar('')
      return
    }
    cargarPerfilLector(lectorEmail).then((perfil) => {
      if (!perfil) {
        localStorage.removeItem('vtr-lector-email')
        localStorage.removeItem('vtr-lector-avatar')
        setLectorEmail('')
        setLectorAvatar('')
        setLectorAvatares([])
        return
      }
      const url = perfil.avatarUrl || ''
      setLectorAvatar(url)
      aplicarHistorialAvatares(lectorEmail, perfil.avatarHistorial || [], url)
      try {
        if (url) localStorage.setItem('vtr-lector-avatar', url)
        else localStorage.removeItem('vtr-lector-avatar')
      } catch {
        /* ignore */
      }
    })
  }, [lectorEmail])

  const popupIdsKey = noticias.filter((item) => item.popup && item.src).map((item) => item.id).join('|')

  const marcarPopupVisto = (noticiaId) => {
    if (!noticiaId || !lectorEmail) return
    setPopupsVistos((prev) => {
      if (prev.includes(noticiaId)) return prev
      const next = [...prev, noticiaId]
      guardarPopupsVistosLocal(lectorEmail, next)
      guardarPopupsVistosLector(lectorEmail, next)
      return next
    })
    registrarLectura(noticiaId, lectorEmail)
  }

  useEffect(() => {
    if (!lectorEmail) {
      setPopupsCargados(true)
      return
    }
    let cancel = false
    const ids = popupIdsKey ? popupIdsKey.split('|') : []
    if (!ids.length && !noticias.length) return
    cargarPopupsVistos(lectorEmail, ids).then((vistos) => {
      if (cancel) return
      setPopupsVistos(vistos)
      setColaPopup((prev) => {
        if (!prev.length) return prev
        const filtrada = prev.filter((item) => !vistos.includes(item.id))
        if (filtrada.length !== prev.length) setNoticiaIndex(0)
        return filtrada
      })
      setPopupsCargados(true)
    })
    return () => {
      cancel = true
    }
  }, [lectorEmail, popupIdsKey, noticias.length])

  useEffect(() => {
    if (lectorEmail && !popupsCargados) return
    if (noticiaOpen && colaPopup.length) return
    // El popup de comunicados cubre toda la pantalla: nunca debe saltar
    // sobre Mensajería, porque tapa el chat y oscurece todo el sitio.
    if (activeSection === 'mensajes') return

    const todas = noticias.filter((item) => item.popup && item.src)
    const vistos = new Set(popupsVistos)
    const omitidos = omitidosSesionRef.current
    const pendientes = (lectorEmail ? todas.filter((item) => !vistos.has(item.id)) : todas)
      .filter((item) => !omitidos.has(item.id))

    if (!pendientes.length) {
      setColaPopup((prev) => (prev.length ? [] : prev))
      setNoticiaOpen(false)
      return
    }

    setColaPopup(pendientes)
    setNoticiaIndex(0)
    setNoticiaOpen(true)
  }, [noticias, lectorEmail, popupsCargados, popupsVistos, noticiaOpen, colaPopup.length, activeSection])

  // Si el popup quedó abierto y el usuario entra a Mensajería, se cierra:
  // si no, el overlay sigue encima del chat.
  useEffect(() => {
    if (activeSection !== 'mensajes') return
    if (!noticiaOpen && !colaPopup.length) return
    setNoticiaOpen(false)
    setColaPopup([])
  }, [activeSection, noticiaOpen, colaPopup.length])

  const cerrarPopupNoticias = () => {
    colaPopup.slice(0, noticiaIndex + 1).forEach((item) => marcarPopupVisto(item.id))
    colaPopup.forEach((item) => omitidosSesionRef.current.add(item.id))
    setNoticiaOpen(false)
    setColaPopup([])
  }

  const cambiarIndicePopup = (nextIndex) => {
    const actual = colaPopup[noticiaIndex]
    if (actual && nextIndex > noticiaIndex) marcarPopupVisto(actual.id)
    setNoticiaIndex(nextIndex)
  }
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('vtr-dark-mode') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('vtr-dark-mode', String(darkMode))
  }, [darkMode])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    
    if (term.length > 2) {
      // Buscar en todas las secciones y navegar a la primera coincidencia
      const searchInData = (data, searchTerm) => {
        return data.some(item => 
          Object.values(item).some(value => 
            String(value).toLowerCase().includes(searchTerm)
          )
        )
      }

      if (searchInData(idClaveVTR, term)) {
        setActiveSection('systems')
      } else if (term.includes('plan') || term.includes('fibra') || term.includes('stream tv') || term.includes('megas')) {
        setActiveSection('planes')
      } else if (term.includes('tnt') || term.includes('netflix') || term.includes('disney') || term.includes('crunchyroll') || term.includes('adulto') || term.includes('playboy')) {
        setActiveSection('streaming')
      } else if (term.includes('contacto') || term.includes('telefono') || term.includes('vtr') || term.includes('claro')) {
        setActiveSection('contact')
      }
    }
  }

  const billingCycles = [
    { ciclo: '2', cuentas: '178.109', habilitacion: '02-jul', dia: '02-ago', carga: '05-08-2026', periodo: '02-07-2026 al 01-08-2026', emision: '02-08-2026', vencimiento: '23-08-2026', corte: '30-08-2026', dias: 6 },
    { ciclo: '4', cuentas: '181.665', habilitacion: '04-jul', dia: '04-ago', carga: '07-08-2026', periodo: '04-07-2026 al 03-08-2026', emision: '04-08-2026', vencimiento: '25-08-2026', corte: '01-09-2026', dias: 6 },
    { ciclo: '6', cuentas: '153.426', habilitacion: '06-jul', dia: '06-ago', carga: '09-08-2026', periodo: '06-07-2026 al 05-08-2026', emision: '06-08-2026', vencimiento: '27-08-2026', corte: '03-09-2026', dias: 6 },
    { ciclo: '8', cuentas: '64.698', habilitacion: '08-jul', dia: '08-ago', carga: '14-08-2026', periodo: '08-07-2026 al 07-08-2026', emision: '08-08-2026', vencimiento: '29-08-2026', corte: '05-09-2026', dias: 6 },
    { ciclo: '81', cuentas: '79.574', habilitacion: '08-jul', dia: '08-ago', carga: '11-08-2026', periodo: '08-07-2026 al 07-08-2026', emision: '08-08-2026', vencimiento: '29-08-2026', corte: '05-09-2026', dias: 6 },
    { ciclo: '10', cuentas: '193.511', habilitacion: '10-jul', dia: '10-ago', carga: '13-08-2026', periodo: '10-07-2026 al 09-08-2026', emision: '10-08-2026', vencimiento: '30-08-2026', corte: '06-09-2026', dias: 6 },
    { ciclo: '12', cuentas: '188.266', habilitacion: '12-jul', dia: '12-ago', carga: '15-08-2026', periodo: '12-07-2026 al 11-08-2026', emision: '12-08-2026', vencimiento: '02-09-2026', corte: '09-09-2026', dias: 6 },
    { ciclo: '14', cuentas: '226.382', habilitacion: '14-jul', dia: '14-ago', carga: '17-08-2026', periodo: '14-07-2026 al 13-08-2026', emision: '14-08-2026', vencimiento: '05-09-2026', corte: '12-09-2026', dias: 6 },
    { ciclo: '16', cuentas: '154.619', habilitacion: '16-jul', dia: '16-ago', carga: '19-08-2026', periodo: '16-07-2026 al 15-08-2026', emision: '16-08-2026', vencimiento: '07-09-2026', corte: '14-09-2026', dias: 6 },
    { ciclo: '18', cuentas: '154.298', habilitacion: '18-jul', dia: '18-ago', carga: '21-08-2026', periodo: '18-07-2026 al 17-08-2026', emision: '18-08-2026', vencimiento: '09-09-2026', corte: '16-09-2026', dias: 6 },
    { ciclo: '21', cuentas: '199.089', habilitacion: '21-jul', dia: '21-ago', carga: '24-08-2026', periodo: '21-07-2026 al 20-08-2026', emision: '21-08-2026', vencimiento: '11-09-2026', corte: '18-09-2026', dias: 6 },
    { ciclo: '24', cuentas: '183.338', habilitacion: '24-jul', dia: '24-ago', carga: '27-08-2026', periodo: '24-07-2026 al 23-08-2026', emision: '24-08-2026', vencimiento: '14-09-2026', corte: '21-09-2026', dias: 6 },
    { ciclo: '26', cuentas: '134.707', habilitacion: '26-jul', dia: '26-ago', carga: '29-08-2026', periodo: '26-07-2026 al 25-08-2026', emision: '26-08-2026', vencimiento: '17-09-2026', corte: '24-09-2026', dias: 6 },
    { ciclo: '28', cuentas: '137.267', habilitacion: '28-jul', dia: '28-ago', carga: '31-08-2026', periodo: '28-07-2026 al 27-08-2026', emision: '28-08-2026', vencimiento: '19-09-2026', corte: '26-09-2026', dias: 6 },
    { ciclo: '30', cuentas: '69.241', habilitacion: '30-jul', dia: '30-ago', carga: '02-09-2026', periodo: '30-07-2026 al 29-08-2026', emision: '30-08-2026', vencimiento: '21-09-2026', corte: '28-09-2026', dias: 6 },
  ]

  const images = [
    'img-login-vtr.png',
    'img-admin-servicios.png',
    'img-app-vtr.png',
    'img-consumos.png',
  ]

  const CollapsibleSection = ({ title, icon: Icon, children, defaultExpanded = false, sectionId }) => {
    const isExpanded = expandedSections[sectionId] ?? defaultExpanded
    return (
      <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white flex items-center justify-between hover:from-green-600 hover:to-blue-700 transition-colors rounded-full"
        >
          <div className="flex items-center gap-3">
            <Icon size={24} />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
        {isExpanded && <div className="p-6">{children}</div>}
      </div>
    )
  }

  const Table = ({ headers, data, rowRenderer }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, index) => rowRenderer(row, index))}
        </tbody>
      </table>
    </div>
  )

  const navigationItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'noticias', label: 'Noticias', icon: Bell },
    { id: 'simuladores', label: 'Simuladores', icon: Server },
    { id: 'apex', label: 'Omnia', icon: Monitor },
    { id: 'credentials', label: 'Credenciales', icon: Lock },
    { id: 'systems', label: 'Somos Clave', icon: Database },
    { id: 'links', label: 'Aplicaciones', icon: Link },
    { id: 'images', label: 'App Vtr', icon: Image },
    { id: 'streaming', label: 'Streaming', icon: Monitor },
    { id: 'planes', label: 'Planes', icon: Coins },
    { id: 'modem', label: 'Modem', icon: Router },
    { id: 'n1q', label: 'Plantillas', icon: ClipboardList },
    { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
    { id: 'pasos', label: 'Pasos', icon: ListChecks },
    { id: 'contrataciones', label: 'Contrataciones', icon: FileText },
  ]

  const systemSections = [
    { id: 'ids', label: 'IDs Clave VTR', icon: Database, data: idClaveVTR },
  ]

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <ModernCard hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </ModernCard>
  )

  const QuickLink = ({ title, icon: Icon, onClick, color, iconType = 'lucide', iconSrc = null, iconClassName = '' }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 lg:gap-3 px-4 py-2 lg:px-6 lg:py-3 rounded-full bg-gray-900 text-white hover:bg-gray-700 hover:scale-105 hover:shadow-lg transition-all duration-300 dark:!bg-[#f5f5f0] dark:!text-gray-900 dark:hover:!bg-[#ebe8df] text-xs lg:text-sm"
    >
      {iconType === 'image' && iconSrc ? (
        <img 
          src={iconSrc} 
          alt={title} 
          className={`w-4 h-4 lg:w-5 lg:h-5 object-contain quick-icon shrink-0 ${iconClassName}`}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      ) : (
        <Icon size={16} className="lg:hidden" />
      )}
      {iconType === 'lucide' && <Icon size={20} className="hidden lg:block" />}
      <span className="font-medium">{title}</span>
    </button>
  )

  // Renderizar contenido compartido
  const renderContent = () => {
    const noticiasFiltradasVista = noticiasFiltroCat === 'Todas'
      ? noticias
      : noticias.filter((item) => item.categoria === noticiasFiltroCat)

    return (
      <>
        {activeSection === 'androidtv' && (
          <AndroidTvInterface onExit={() => setActiveSection('dashboard')} />
        )}
        {activeSection === 'andes' && (
          <AndesSimulador onExit={() => setActiveSection('dashboard')} />
        )}
        {activeSection === 'noticias' && (
          <ModernCard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
                  <Bell size={26} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Noticias y Comunicados</h3>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Avisos importantes, procesos y novedades de VTR</p>
                </div>
              </div>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['Todas', 'Noticias de Procesos', 'Noticias Internas', 'Actualización de Noticias Somos Clave'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNoticiasFiltroCat(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    noticiasFiltroCat === cat
                      ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {noticiasFiltradasVista.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <Bell className="mx-auto mb-3 opacity-30" size={48} />
                <p className="text-sm font-medium">No hay noticias o comunicados publicados en esta categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {noticiasFiltradasVista.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                  >
                    <div
                      className="relative cursor-pointer overflow-hidden aspect-video bg-gray-100 dark:bg-gray-900"
                      onClick={() => abrirComunicado(item)}
                    >
                      <img
                        src={item.src}
                        alt={item.alt || item.titulo || `Comunicado ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"><rect fill="%23f3f4f6" width="400" height="225"/><text fill="%236b7280" font-family="sans-serif" font-size="16" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                        <Eye size={16} /> Ver en tamaño completo
                      </div>
                      {item.categoria && (
                        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {item.categoria}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.titulo || item.alt || `Comunicado #${idx + 1}`}</h4>
                        {item.descripcion && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {expandedNews[item.id] ? (
                              <div>{formatNewsText(item.descripcion)}</div>
                            ) : (
                              <div className="line-clamp-3">{formatNewsText(item.descripcion)}</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
                        <span className="text-[11px] font-medium text-gray-400">{item.fecha || 'Reciente'}</span>
                        {item.descripcion && (
                          <button
                            onClick={() => setExpandedNews(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                          >
                            {expandedNews[item.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {expandedNews[item.id] ? 'Ver menos' : 'Ver más'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModernCard>
        )}
        {activeSection === 'dashboard' && (
          <div className="space-y-8">
            {/* Banner Principal */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/CLARO VTR CHILE ENLACES_ID.png"
                alt="CLARO VTR CHILE Banner"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300"><rect fill="%23f3f4f6" width="1200" height="300"/><text fill="%236b7280" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle">Banner no disponible</text></svg>')
                }}
              />
            </div>

            {/* No cortes de llamada + CNN se muestran como notificación modal al iniciar */}

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                  <QuickLink title="Marcar Asistencia" icon={Globe} onClick={() => window.open('https://dashboards-apexpe.omnia.la/login', '_blank')} iconType="image" iconSrc="/logo-green.png" />
                  <QuickLink title="Somos Clave" icon={Database} onClick={() => window.open('https://somosclave.cl/index.php', '_blank')} iconType="image" iconSrc="/logo-login-portal.png" />
                  <QuickLink
                    title="Solucionar Modem"
                    icon={Wifi}
                    iconType="image"
                    iconSrc="/ba57a81434707.png"
                    onClick={() => setRouterModalOpen(true)}
                  />
                  <QuickLink title="Streaming" icon={Monitor} onClick={() => setActiveSection('streaming')} />
                  <QuickLink title="Andes" icon={Monitor} onClick={() => window.open('http://siebelprd.vtr.cl:2080/ecommunications_ldap_esn/start.swe?SWENeedContext=false&SWECmd=Logoff&SWEC=306&SWEBID=-1&SRN=&SWETS=', '_blank')} />
                  <QuickLink title="Pasos" icon={ListChecks} onClick={() => setActiveSection('pasos')} />
                  <QuickLink
                    title="Mensajes Apex"
                    icon={MessageSquare}
                    onClick={() => setActiveSection('mensajes')}
                  />
                  <QuickLink
                    title="Migraciones"
                    icon={FileText}
                    onClick={() => window.location.href = '/formularios'}
                  />
                  <QuickLink
                    title="Descargar Genesys"
                    icon={Download}
                    iconType="image"
                    iconSrc="/genesys.png"
                    iconClassName="!w-5 !h-5 lg:!w-6 lg:!h-6 scale-110 rounded-md"
                    onClick={() => window.open('http://172.17.242.192/WDE/VTR/PROD/WDE_VTR_APEX_PERU/publish.htm', '_blank')}
                  />
              </div>
            </div>

            {/* Recent Activity */}
            <ModernCard>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Importante</h3>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 bg-gray-50 rounded-xl">
                  <img
                    src="/claro-logo-01-freelogovectors.net_.png"
                    alt="Claro"
                    className="w-5 h-5 lg:w-7 lg:h-7 object-contain mt-0.5 lg:mt-1 shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="min-w-0 space-y-2">
                    <p className="font-bold text-gray-900 text-sm lg:text-base">CÓMO COMUNICARSE CON CLARO</p>
                    <p className="text-gray-700 text-xs lg:text-sm leading-relaxed">
                      Llama a nuestro Canal de atención IVR <strong>*611</strong> o si eres cliente hogar al <strong>#400</strong>.
                    </p>
                    <p className="text-gray-700 text-xs lg:text-sm leading-relaxed">
                      Claro Móvil Chile, marca <strong>105</strong> desde tu celular Claro para atención al cliente y reclamos.
                    </p>
                    <p className="text-gray-700 text-xs lg:text-sm leading-relaxed">
                      Para contratación de planes, el número es <strong>800 171 800</strong>.
                    </p>
                    <ul className="text-gray-600 text-xs lg:text-sm leading-relaxed space-y-1 list-disc list-inside">
                      <li>
                        <strong>Atención al Cliente / Reclamos:</strong> Llama al <strong>105</strong> (desde tu celular Claro).
                      </li>
                      <li>
                        <strong>Desde teléfono fijo o red externa:</strong> Llama al <strong>800 171 171</strong> o al{' '}
                        <strong>800 911 105</strong> / <strong>600 3100 105</strong>.
                      </li>
                      <li>
                        <strong>Activación Prepago:</strong> Llama al <strong>*103#</strong>.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 bg-gray-50 rounded-xl">
                  <img
                    src="/vtr-logo-freelogovectors.net_.png"
                    alt="VTR"
                    className="w-5 h-5 lg:w-7 lg:h-7 object-contain mt-0.5 lg:mt-1 shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="min-w-0 space-y-2">
                    <p className="font-bold text-gray-900 text-sm lg:text-base">CÓMO COMUNICARSE CON VTR (HOGAR)</p>
                    <ul className="text-gray-600 text-xs lg:text-sm leading-relaxed space-y-1 list-disc list-inside">
                      <li>
                        <strong>Canales de Contacto:</strong> Llama al <strong>600 800 9000</strong> o{' '}
                        <strong>2 2310 0200</strong>.
                      </li>
                      <li>
                        <strong>Buzón de Voz:</strong> Configurable llamando al <strong>600 310 2000</strong>.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </ModernCard>
          </div>
        )}

        {activeSection === 'apex' && (
          <ModernCard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users size={24} className="text-emerald-600" />
                Apex Omnia - Usuarios
              </h3>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold w-fit">
                {apexOmniaUsers.length} usuarios
              </span>
            </div>
            <div className="mb-6">
              <a href="https://dashboards-apexpe.omnia.la/login" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full hover:from-green-600 hover:to-blue-700 hover:scale-105 transition-all duration-300">
                <img src="/logo-green.png" alt="Omnia" className="w-5 h-5 object-contain always-white-icon" />
                Web para marcar asistencia
              </a>
            </div>
            <div className="overflow-x-auto lg:overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-bold uppercase tracking-wider">Nombre del Usuario</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-bold uppercase tracking-wider">Credenciales</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {apexOmniaUsers.map((user) => (
                    <tr key={user.user} className="hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors hover:scale-[1.01]">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                        <button
                          onClick={() => setCredencialModal({ section: { id: 'apex', label: 'Apex Omnia', icon: Zap }, user })}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full text-xs font-semibold hover:from-green-600 hover:to-blue-700 hover:scale-105 transition-all duration-300"
                        >
                          <Lock size={14} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModernCard>
        )}

        {activeSection === 'systems' && (
          <ModernCard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Database size={24} className="text-emerald-600" />
                IDs Clave VTR
              </h3>
              <IdSearchBox data={idClaveVTR} onApply={setAppliedIdsSearch} />
            </div>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mb-4">
              Usa el <strong>chat flotante</strong> (ícono abajo a la derecha): habla natural de lo que sea y también te orienta con lo del portal cuando lo necesites.
            </p>
            <div className="space-y-4 lg:space-y-6">
              {['General', 'MOVIL', 'FACTURACIÓN', 'ANDES', 'CLARO VTR WEB', 'TECNICO', 'OFRECIMIENTO', 'INFORMATIVO PARA EL CLIENTE', 'INFORMATIVO PARA EL ASESOR', 'TRANSFERENCIAS'].map((categoria) => {
                const term = appliedIdsSearch.trim().toLowerCase()
                const categoriaItems = idClaveVTR.filter(item => {
                  const matchCategoria = item.categoria === categoria || (!item.categoria && categoria === 'General')
                  if (!matchCategoria) return false
                  if (!term) return true
                  return String(item.id).toLowerCase().includes(term) || String(item.nombre).toLowerCase().includes(term)
                })
                if (categoriaItems.length === 0) return null
                return (
                  <div key={categoria} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 lg:p-6 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-base lg:text-lg mb-3 lg:mb-4 text-emerald-800 dark:text-emerald-400">{categoria}</h4>
                    <div className="overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 w-20 lg:w-24">ID</th>
                            <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre</th>
                            <th className="px-3 lg:px-4 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 w-28 lg:w-32">Acceso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoriaItems.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <td className="px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 w-20 lg:w-24">{item.id}</td>
                              <td className="px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-700 dark:text-gray-300">{item.nombre}</td>
                              <td className="px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm w-28 lg:w-32">
                                <button
                                  type="button"
                                  onClick={() => setModalSomosClave({ ...item, marca: '' })}
                                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95"
                                >
                                  Acceder
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          </ModernCard>
        )}

        {activeSection === 'links' && <AplicacionesExcel />}

          {activeSection === 'images' && (
  <div className="space-y-4 lg:space-y-8">
            <ModernCard>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Image size={24} className="text-emerald-600" />
                App VTR en Google Play
              </h3>
              <div className="flex justify-center">
                <a
                  href="https://play.google.com/store/apps/details?id=com.vtr.clientes&hl=es_PE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full max-w-4xl rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer hover:opacity-95 hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src="/image.png"
                    alt="Vista previa de la App VTR en Google Play"
                    className="w-full h-auto object-contain"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.closest('a').style.display = 'none'
                    }}
                  />
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Haz clic en la imagen para abrir la app en{' '}
                <a
                  href="https://play.google.com/store/apps/details?id=com.vtr.clientes&hl=es_PE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Google Play
                </a>
                .
              </p>
            </ModernCard>
            <ModernCard>
              <div className="grid grid-cols-4 gap-4 lg:gap-6 max-w-6xl mx-auto">
                {images.map((img) => (
                  <div
                    key={img}
                    className="cursor-pointer flex flex-col items-center"
                    onClick={() => {
                      setModalImage(`/${img}`)
                      setModalSize('small')
                    }}
                  >
                    <img
                      src={`/${img}`}
                      alt={img}
                      className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300 rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="12" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                      }}
                    />
                  </div>
                ))}
              </div>
            </ModernCard>
            </div>
          )}

          {activeSection === 'planes' && (
            <PlanesComerciales />
          )}

          {activeSection === 'streaming' && (
            <StreamingSection setModalImage={setModalImage} setModalSize={setModalSize} setModalDisableZoom={setModalDisableZoom} />
          )}

          {activeSection === 'modem' && (
            <ModernCard>
              <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                <div className="rounded-2xl p-4 lg:p-6">
                  <h4 className="text-sm lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 lg:mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                    MÓDEM PRINCIPAL | EXTENSOR MESH
                  </h4>
                  <div className="mb-3 lg:mb-4">
                    <p className="font-bold text-red-600 dark:text-red-400">ALERTA: SEÑAL DÉBIL</p>
                    <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 mt-1">
                      El extensor está muy lejos del módem. Acércalo para mejorar la cobertura y velocidad.
                    </p>
                    <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Verifica la distancia y reubica tu extensor.
                    </p>
                  </div>
                  <div className="flex justify-center mb-3 lg:mb-6">
                    <img
                      src="https://i.ibb.co/n8ZYCy8c/extensor-modem.png"
                      alt="Modem y Extensor"
                      className="w-56 lg:w-80 h-auto object-contain cursor-pointer rounded-lg transition-transform duration-300 hover:scale-110"
                      onClick={() => {
                        setModalImage('https://i.ibb.co/n8ZYCy8c/extensor-modem.png')
                        setModalSize('large')
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23f3f4f6" width="300" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                      }}
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-bold text-xs lg:text-sm text-gray-800 dark:text-gray-100 mb-2">
                      <span className="text-emerald-600">TU CONEXIÓN VTR</span>
                    </p>
                    <ul className="space-y-1.5 text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                      <li><strong>POWER:</strong> Equipo encendido</li>
                      <li><strong>WIFI MESH:</strong> Conexión optimizada</li>
                      <li><strong>FUERA DE RANGO:</strong> Distancia excesiva</li>
                      <li><strong>LAN/WLAN:</strong> Puertos de red listos</li>
                      <li><strong>USB:</strong> Puerto USB disponible</li>
                      <li><strong>USB:</strong> Puerto USB</li>
                      <li><strong>WLAN:</strong> Red WiFi activa</li>
                      <li><strong>WPS:</strong> Conexión WPS activa</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl p-4 lg:p-6">
                  <h4 className="text-sm lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 lg:mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 dark:bg-gray-400 rounded-full"></div>
                    ONT
                  </h4>
                  <div className="mb-3 lg:mb-4">
                    <p className="font-bold text-red-600 dark:text-red-400">ALERTA: LOS EN ROJO</p>
                    <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Indica que la ONT no está recibiendo señal óptica.
                    </p>
                    <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Verifica el cable de fibra óptica y sus conexiones.
                    </p>
                  </div>
                  <div className="flex justify-center mb-3 lg:mb-4">
                    <img
                      src="https://i.ibb.co/twJBfw5D/ONT.png"
                      alt="ONT"
                      className="w-56 lg:w-80 h-auto object-contain cursor-pointer rounded-lg transition-transform duration-300 hover:scale-110"
                      onClick={() => {
                        setModalImage('https://i.ibb.co/twJBfw5D/ONT.png')
                        setModalSize('large')
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect fill="%23f3f4f6" width="300" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 lg:space-y-3">
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Condición:</span>
                      <span>Indicador LOS en ROJO</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Significado:</span>
                      <span>Pérdida de señal en fibra óptica</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Acción:</span>
                      <span>Generar Visita Técnica</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-xs lg:text-sm text-gray-800 dark:text-gray-100 mb-2">LUCES NORMALES EXCEPTO LOS EN ROJO</p>
                    <p className="font-mono text-[10px] lg:text-xs text-gray-700 dark:text-gray-300 mb-3 flex flex-wrap gap-x-2">
                      <span>POWER</span><span>|</span><span>PON</span><span>|</span><span>LOS</span><span>|</span><span>LAN1</span><span>|</span><span>LAN2</span><span>|</span><span>LAN3</span><span>|</span><span>LAN4</span><span>|</span><span>TEL</span><span>|</span><span>USB</span><span>|</span><span>WLAN</span><span>|</span><span>WPS</span>
                    </p>
                    <ul className="space-y-1.5 text-xs lg:text-sm text-gray-700 dark:text-gray-300">
                      <li><strong>POWER:</strong> Encendido del equipo</li>
                      <li><strong>PON:</strong> Conexión con la red óptica</li>
                      <li><strong>LOS:</strong> Pérdida de señal óptica</li>
                      <li><strong>LAN1-4:</strong> Puertos de red activos</li>
                      <li><strong>TEL:</strong> Línea telefónica</li>
                      <li><strong>USB:</strong> Puerto USB</li>
                      <li><strong>WLAN:</strong> Red WiFi activa</li>
                      <li><strong>WPS:</strong> Conexión WPS activa</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-xl">
                <div className="bg-gray-900 dark:bg-gray-950 flex items-center gap-2 px-4 py-3">
                  <Zap size={18} className="text-white shrink-0" />
                  <p className="text-xs lg:text-base font-bold text-white">INFORMACIÓN ADICIONAL: FIBRA ÓPTICA Y LOS EN ROJO</p>
                </div>
                <div className="bg-white dark:bg-[#141414] p-3 lg:p-6">
                  <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    La fibra óptica funciona enviando pulsos de luz a través de cables de plástico o vidrio muy delgados, actuando como una
                    <strong> "manguera de agua" pero para la luz</strong>. En lugar de transportar electricidad como los cables de cobre, transporta
                    datos en forma de destellos luminosos a una velocidad increíble.
                  </p>
                  <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Siguiendo exactamente esa misma analogía de la manguera, la famosa luz de <strong>LOS (Loss of Signal / Pérdida de Señal) en rojo</strong> en
                    tu router significa, literalmente, que al equipo le dejó de llegar luz (es decir, se <strong>"cortó el flujo de agua"</strong>).
                  </p>
                  <p className="text-xs lg:text-base text-gray-800 dark:text-gray-100 font-semibold mb-3">
                    Para que esta alerta roja aparezca en el router, debe ocurrir alguna de las siguientes situaciones:
                  </p>

                  {/* Acordeón de situaciones */}
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {FIBRA_CAUSAS.map((causa, i) => {
                      const Icon = causa.Icon
                      const abierto = fibraCausaSel === i
                      return (
                        <div key={causa.titulo}>
                          <button
                            type="button"
                            onClick={() => setFibraCausaSel(abierto ? -1 : i)}
                            aria-expanded={abierto}
                            className="w-full flex items-center gap-2 lg:gap-3 py-3 text-left cursor-pointer focus:outline-none"
                          >
                            <Icon size={16} className="shrink-0 text-neutral-400 dark:text-neutral-500" />
                            <span className="flex-1 text-xs lg:text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                              {causa.titulo}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`shrink-0 text-neutral-400 dark:text-neutral-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
                            />
                          </button>
                          {abierto && (
                            <div className="pb-3 pl-6 lg:pl-7 pr-2 lg:pr-4">
                              <p className="text-[10px] lg:text-xs text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wide mb-1">
                                {causa.subtitulo}
                              </p>
                              <p className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                {causa.texto}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Video tutorial: gestión del equipo (ZTE) en SCP */}
              <div className="mt-6 overflow-hidden rounded-2xl">
                <div className="bg-gray-900 dark:bg-gray-950 flex items-center gap-2 px-4 lg:px-5 py-3.5">
                  <Monitor size={18} className="text-white shrink-0" />
                  <div>
                    <p className="text-xs lg:text-base font-bold text-white leading-tight">Video tutorial: gestión del equipo en SCP (ZTE)</p>
                    <p className="text-[10px] lg:text-xs text-neutral-400">Consulta y gestión en SCP | CPE (Device Management)</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#141414] p-4 lg:p-6">
                  {/* Reproductor — ancho completo para que se vea grande */}
                  <div className="mx-auto w-full max-w-4xl">
                    <div className="rounded-2xl overflow-hidden bg-black">
                      <video controls preload="metadata" playsInline className="w-full h-auto aspect-video bg-black">
                        <source src="/ZTETUTO.mp4" type="video/mp4" />
                        Tu navegador no soporta la reproducción de video.
                      </video>
                    </div>
                  </div>

                  {/* Pasos */}
                  <div className="mt-6">
                    <ol className="grid md:grid-cols-2 gap-x-5 gap-y-3">
                      {ZTE_SCP_VIDEO_PASOS.map((paso, i) => (
                        <li key={i} className="flex gap-3 py-1.5">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[11px] font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] lg:text-xs font-bold text-gray-800 dark:text-gray-100 leading-snug">{paso.titulo}</p>
                            <ul className="mt-1 space-y-1 text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                              {paso.items.map((t, j) => (
                                <li key={j} className="flex gap-1.5">
                                  <span className="text-neutral-400 dark:text-neutral-500 shrink-0">•</span>
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                            {paso.detalle && (
                              <div className="mt-2 grid grid-cols-2 gap-1.5">
                                {paso.detalle.map((t, j) => (
                                  <span key={j} className="font-mono text-[10px] text-neutral-600 dark:text-neutral-300 truncate" title={t}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

          {activeSection === 'n1q' && (
            <div className="w-full h-full flex flex-col rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800 sm:p-6">
              <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-5 border-b border-gray-100 pb-5 dark:border-gray-700/60">
                <button
                  onClick={() => setPlantillaSeleccion('general')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <FileText size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    Plantilla General
                  </span>
                </button>

                <button
                  onClick={() => setPlantillaSeleccion('n1')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <ClipboardList size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    N1 Técnico
                  </span>
                </button>

                <button
                  onClick={() => setPlantillaSeleccion('visita')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <Calendar size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    Adelanto de Visita
                  </span>
                </button>

                <button
                  onClick={() => setPlantillaSeleccion('genesys')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <PhoneCall size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    Registro Llamada Genesys
                  </span>
                </button>
              </div>

              {plantillaSeleccion === 'n1' && (
                <PlantillaN1
                  correoApex={correoTipificaciones}
                  onEnviado={() => {
                    setTipificacionesRefresh((n) => n + 1)
                    setActiveSection('tipificaciones')
                  }}
                />
              )}
              {plantillaSeleccion === 'general' && (
                <PlantillaGeneral
                  correoApex={correoTipificaciones}
                  onEnviado={() => {
                    setTipificacionesRefresh((n) => n + 1)
                    setActiveSection('tipificaciones')
                  }}
                />
              )}
              {plantillaSeleccion === 'visita' && (
                <PlantillaRequerimientoCritico
                  correoApex={correoTipificaciones}
                  onEnviado={() => {
                    setTipificacionesRefresh((n) => n + 1)
                    setActiveSection('tipificaciones')
                  }}
                />
              )}
              {plantillaSeleccion === 'genesys' && (
                <PlantillaGenesys
                  correoApex={correoTipificaciones}
                  onEnviado={() => {
                    setTipificacionesRefresh((n) => n + 1)
                    setActiveSection('tipificaciones')
                  }}
                />
              )}
            </div>
          )}

          {activeSection === 'tipificaciones' && (
            <TipificacionesPanel
              firebaseApp={app}
              refreshKey={tipificacionesRefresh}
              db={db}
              avatarUrl={lectorAvatar}
              avataresUsados={lectorAvatares}
              onCambiarFoto={cambiarFotoPerfil}
              onElegirAvatar={elegirAvatarGuardado}
              onToast={showToast}
            />
          )}

          {activeSection === 'mensajes' && (
            <MessengerApex
              db={db}
              firebaseApp={app}
              avatarUrl={lectorAvatar}
              subirImagen={subirImagenImgbb}
              onToast={showToast}
              darkMode={darkMode}
            />
          )}

          {activeSection === 'pasos' && (
            <AsistentePasos onToast={showToast} />
          )}

          {activeSection === 'genesys' && (
            <GenesysSimulador onToast={showToast} />
          )}

          {activeSection === 'contrataciones' && (
            <div className="space-y-4 lg:space-y-6">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-5">
                <button
                  onClick={() => setContratacionSeleccion('asistencia')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <FileText size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    Asistencia VTR
                  </span>
                </button>

                <button
                  onClick={() => setContratacionSeleccion('control')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <ClipboardList size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    Control Remoto
                  </span>
                </button>

                <button
                  onClick={() => setContratacionSeleccion('cambio')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <RefreshCw size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    Cambio de Plan
                  </span>
                </button>

                <button
                  onClick={() => setContratacionSeleccion('dbox')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <Monitor size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    D-Box
                  </span>
                </button>

                <button
                  onClick={() => setContratacionSeleccion('wifi')}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none group"
                >
                  <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
                    <Wifi size={24} className="shrink-0" />
                  </span>
                  <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    Ubicación WiFi
                  </span>
                </button>
              </div>

              {contratacionSeleccion === 'asistencia' && (
                <ModernCard hover={false}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 pr-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                        Asistencia VTR
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        Cubre inconvenientes técnicos o necesidades con la red interior de los servicios VTR.
                      </p>
                    </div>
                    <button
                      onClick={() => setContratacionSeleccion(null)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                      title="Cerrar"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Políticas de Atención */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-amber-200 dark:border-gray-700 mb-4">
                    <h4 className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Shield size={18} className="text-amber-600 dark:text-amber-400" />
                      Políticas de Atención
                    </h4>
                    <div className="space-y-3 text-sm lg:text-base text-gray-700 dark:text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                        <p>Solo el titular de la cuenta puede contratar el servicio o un tercero con poder notarial. En sucursal debe presentar cédula de identidad. En el caso de Call Center corroborar N° de serie CI en <a href="https://www.registrocivil.cl/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">https://www.registrocivil.cl/</a></p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                        <p>A todos los clientes sin Asistencia VTR y que presenten fallas en sus servicios (que sólo pueden ser corregidas con una visita técnica), se les debe informar el cobro solo si cliente consulta que corresponde a <strong>$20.000</strong> por dicha visita. También se les puede ofrecer la contratación de Asistencia VTR e inmediatamente queda cubierta la reparación.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">✗</span>
                        <p>No inducir al cliente que solicite la baja del servicio una vez que lo utilice.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">✗</span>
                        <p>No indicar al cliente que si lo contrata, puede pedir un técnico cuando quiera sin costo.</p>
                      </div>
                    </div>
                  </div>

                  {/* Debes Saber */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-purple-200 dark:border-gray-700 mb-4">
                    <h4 className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <AlertCircle size={18} className="text-purple-600 dark:text-purple-400" />
                      Debes Saber
                    </h4>
                    <div className="space-y-3 text-sm lg:text-base text-gray-700 dark:text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                        <p>El servicio <strong>ASISTENCIA VTR</strong> está disponible para la venta únicamente para los clientes <strong>RESIDENCIALES</strong>.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                        <p>Cubre extensiones de teléfono o de televisión VTR. (<strong>Máximo de 4 puntos de teléfono y 4 bocas de televisión</strong>)</p>
                      </div>
                    </div>
                  </div>

                  {/* No Incluye */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-red-200 dark:border-gray-700 mb-4">
                    <h4 className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                      No Incluye
                    </h4>
                    <div className="space-y-3 text-sm lg:text-base text-gray-700 dark:text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">✗</span>
                        <p>Instalación y reparación de equipos propios del cliente: TV, DVD, PC, notebook, teléfonos, control remoto, router particular, etc.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">✗</span>
                        <p>Cortes de cables y conectores de servicios pertenecientes a otras compañías eléctricas y de telecomunicaciones.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">✗</span>
                        <p>Instalación de un decodificador d-BOX en cada extensión de televisión VTR y su renta mensual.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">✗</span>
                        <p>Instalación de extensor WIFI</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-indigo-200 dark:border-gray-700">
                    <h4 className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <ListChecks size={18} className="text-indigo-600 dark:text-indigo-400" />
                      Gestión — Proceso de ingreso
                    </h4>
                    <p className="text-xs lg:text-sm text-amber-800 dark:text-amber-200 mb-4 leading-relaxed rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                      Antes de ingresar: el servicio debe estar <strong>activo</strong> y <strong>no estar en cobranza</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {asistenciaVtrPasos.map((item) => (
                        <div key={item.paso} className="flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-indigo-600 text-white text-[10px] lg:text-xs font-bold shrink-0">
                              {item.paso.replace('Paso ', '')}
                            </span>
                            <h4 className="text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-100">{item.titulo}</h4>
                          </div>
                          {item.imgs?.length > 0 && (
                            <div className="space-y-2 mb-2">
                              {item.imgs.map((img) => {
                                const src = `${item.imgBase || ASISTENCIA_VTR_IMG_BASE}/${img}`
                                return (
                                  <img
                                    key={img}
                                    src={src}
                                    alt={`${item.paso} — ${item.titulo}`}
                                    className="w-full h-auto object-contain cursor-pointer hover:scale-[1.02] transition-transform duration-300 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                                    onClick={() => {
                                      setModalImage(src)
                                      setModalSize('large')
                                      setModalDisableZoom(false)
                                    }}
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="12" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                                    }}
                                  />
                                )
                              })}
                            </div>
                          )}
                          <ul className="list-disc list-inside text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-1">
                            {item.items.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                          {item.ejemplo && (
                            <div className="mt-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-white/80 dark:bg-gray-800/80 px-2.5 py-2">
                              <p className="text-[10px] lg:text-xs font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                {item.ejemplo.titulo}
                              </p>
                              <ul className="space-y-0.5 text-[10px] lg:text-xs text-gray-600 dark:text-gray-300">
                                {item.ejemplo.lineas.map((linea, i) => (
                                  <li key={i} className={i === item.ejemplo.lineas.length - 1 ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>
                                    {linea}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                      <div className="rounded-xl border border-indigo-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 p-4">
                        <h5 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Informa</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">De acuerdo al cambio realizado, explica:</p>
                        <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          <li>Detalle del cambio realizado</li>
                          <li>Costos del Paso 7 (valor SVA, descuentos si aplica y proporcionales de la próxima boleta)</li>
                        </ul>
                      </div>
                      <div className="rounded-xl border border-indigo-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 p-4">
                        <h5 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Registra</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                          Atención Comercial → Info cuenta servic oferta plat → SVA caract (precio, cond com)
                        </p>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Registrar en la atención:</p>
                        <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          <li>Nombre de la persona que atendemos</li>
                          <li>Motivo de la atención/llamada</li>
                          <li>Información entregada</li>
                          <li>Gestión realizada</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              )}

              {contratacionSeleccion === 'control' && (
                <ModernCard hover={false}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
                      Control Remoto
                    </h3>
                    <button
                      onClick={() => setContratacionSeleccion(null)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                      title="Cerrar"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Costos */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-red-200 dark:border-gray-700 mb-4">
                    <h4 className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <CreditCard size={18} className="text-red-600 dark:text-red-400" />
                      Costos Asociados
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mt-2 shrink-0"></div>
                        <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          En caso de que <strong>el control remoto se pierda</strong>, el repuesto tiene un costo de <strong className="text-red-600 dark:text-red-400 font-bold">$6.000</strong>.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mt-2 shrink-0"></div>
                        <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          El <strong>delivery</strong> de equipos tiene un costo de <strong className="text-red-600 dark:text-red-400 font-bold">$3.000</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guía de Venta */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-blue-200 dark:border-gray-700">
                    <h4 className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <ListChecks size={18} className="text-blue-600 dark:text-blue-400" />
                      Guía de Venta en Siebel/CRM (Andes)
                    </h4>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      Guía paso a paso para realizar el cobro o venta de <strong>Control Remoto</strong>, ya sea por <strong>Autoinstalación</strong> o <strong>Visita Técnica</strong>.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                      {controlRemotoPasos.map((item) => (
                        <div key={item.paso} className="flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-blue-600 text-white text-[10px] lg:text-xs font-bold shrink-0">
                              {item.paso.replace('Paso ', '')}
                            </span>
                            <h4 className="text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-100">{item.titulo}</h4>
                          </div>
                          <div className="space-y-2 mb-2">
                            {item.imgs.map((img) => {
                              const src = `${CONTROL_REMOTO_IMG_BASE}/${img}`
                              return (
                                <img
                                  key={img}
                                  src={src}
                                  alt={`${item.paso} — ${item.titulo}`}
                                  className="w-full h-auto object-contain cursor-pointer hover:scale-[1.02] transition-transform duration-300 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                                  onClick={() => {
                                    setModalImage(src)
                                    setModalSize('large')
                                    setModalDisableZoom(false)
                                  }}
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="12" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                                  }}
                                />
                              )
                            })}
                          </div>
                          {item.intro && (
                            <p className="text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{item.intro}</p>
                          )}
                          {item.orderedItems ? (
                            <ol className="list-decimal list-inside text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-1">
                              {item.orderedItems.map((t, i) => (
                                <li key={i}>
                                  {typeof t === 'string' ? t : (
                                    <>
                                      {t.text}
                                      {t.subItems && (
                                        <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5">
                                          {t.subItems.map((s, j) => (
                                            <li key={j}>{s}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </>
                                  )}
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <ul className="list-disc list-inside text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-1">
                              {item.items.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </ModernCard>
              )}

              {contratacionSeleccion === 'cambio' && (
                <ModernCard hover={false}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal-500 dark:bg-teal-400 rounded-full"></div>
                      Cambio de Plan
                    </h3>
                    <button
                      onClick={() => setContratacionSeleccion(null)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                      title="Cerrar"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-teal-200 dark:border-gray-700">
                    <h4 className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <ListChecks size={18} className="text-teal-600 dark:text-teal-400" />
                      Guía de Cambio de Plan (APEX + Andes)
                    </h4>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      Busca y selecciona al cliente en Andes, consulta el plan en APEX, actualiza la promoción y emite la orden. El <strong>paso 7</strong> es solo si debes anular un trámite previo.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                      {cambioPlanPasos.map((item) => {
                        const base = item.imgBase || CAMBIO_PLAN_IMG_BASE
                        return (
                          <div key={item.paso} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-teal-600 text-white text-[10px] lg:text-xs font-bold shrink-0">
                                {item.paso.replace('Paso ', '')}
                              </span>
                              <h4 className="text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-100">{item.titulo}</h4>
                            </div>
                            {item.nota && (
                              <p className="text-[10px] lg:text-xs text-teal-700 dark:text-teal-300 font-medium mb-2">{item.nota}</p>
                            )}
                            <div className="space-y-2 mb-2">
                              {item.imgs.map((img) => {
                                const src = `${base}/${img}`
                                return (
                                  <img
                                    key={img}
                                    src={src}
                                    alt={`${item.paso} — ${item.titulo}`}
                                    className="w-full h-auto object-contain cursor-pointer hover:scale-[1.02] transition-transform duration-300 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                                    onClick={() => {
                                      setModalImage(src)
                                      setModalSize('large')
                                      setModalDisableZoom(false)
                                    }}
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="12" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                                    }}
                                  />
                                )
                              })}
                            </div>
                            {item.intro && (
                              <p className="text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{item.intro}</p>
                            )}
                            {item.orderedItems ? (
                              <ol className="list-decimal list-inside text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-1">
                                {item.orderedItems.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ol>
                            ) : (
                              <ul className="list-disc list-inside text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-1">
                                {item.items.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </ModernCard>
              )}

              {contratacionSeleccion === 'dbox' && (
                <ModernCard hover={false}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 dark:bg-amber-400 rounded-full"></div>
                      D-Box
                    </h3>
                    <button
                      onClick={() => setContratacionSeleccion(null)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                      title="Cerrar"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-4">
                    <button
                      onClick={() => setDboxContratacionSeleccion('stick')}
                      className="flex flex-col items-center gap-2 cursor-pointer select-none group w-full"
                    >
                      <span className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                        <img
                          src="/descarga-1-1-removebg-preview.png"
                          alt="D-Box Stick"
                          className="w-full h-full object-contain drop-shadow-md"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                          }}
                        />
                      </span>
                      <span className="max-w-20 text-[10px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                        D-Box Pendrive/Stick
                      </span>
                    </button>

                    <button
                      onClick={() => setDboxContratacionSeleccion('caja')}
                      className="flex flex-col items-center gap-2 cursor-pointer select-none group w-full"
                    >
                      <span className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                        <img
                          src="/Grupo_3051.png.webp"
                          alt="D-Box Caja"
                          className="w-full h-full object-contain drop-shadow-md"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                          }}
                        />
                      </span>
                      <span className="max-w-20 text-[10px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                        D-Box Caja
                      </span>
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-amber-200 dark:border-gray-700 mb-4">
                    <h4 className="text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <ListChecks size={18} className="text-amber-600 dark:text-amber-400" />
                      Guía de contratación en Andes (d-BOX Smart II)
                    </h4>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      Busca al cliente, modifica el producto y usa la vista general del Pedido de ventas. Desde el <strong>paso 6</strong>: Personalizar Television → Equipos → agregar d-BOX Smart II. Luego verifica, genera documento y envía. Costo de referencia: <strong>$2.990</strong> mensuales.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                      {dboxPasos.map((item) => {
                        const base = item.imgBase || DBOX_PASOS_IMG_BASE
                        return (
                          <div key={item.paso} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-amber-600 text-white text-[10px] lg:text-xs font-bold shrink-0">
                                {item.paso.replace('Paso ', '')}
                              </span>
                              <h4 className="text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-100">{item.titulo}</h4>
                            </div>
                            {item.nota && (
                              <p className="text-[10px] lg:text-xs text-amber-700 dark:text-amber-300 font-medium mb-2">{item.nota}</p>
                            )}
                            <div className="space-y-2 mb-2">
                              {item.imgs.map((img) => {
                                const src = `${base}/${img}`
                                return (
                                  <img
                                    key={img}
                                    src={src}
                                    alt={`${item.paso} — ${item.titulo}`}
                                    className="w-full h-auto object-contain cursor-pointer hover:scale-[1.02] transition-transform duration-300 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                                    onClick={() => {
                                      setModalImage(src)
                                      setModalSize('large')
                                      setModalDisableZoom(false)
                                    }}
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="12" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                                    }}
                                  />
                                )
                              })}
                            </div>
                            {item.intro && (
                              <p className="text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{item.intro}</p>
                            )}
                            {item.orderedItems ? (
                              <ol className="list-decimal list-inside text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-1">
                                {item.orderedItems.map((t, i) => (
                                  <li key={i}>
                                    {typeof t === 'string' ? t : (
                                      <>
                                        {t.text}
                                        {t.subItems && (
                                          <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5">
                                            {t.subItems.map((s, j) => (
                                              <li key={j}>{s}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </>
                                    )}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <ul className="list-disc list-inside text-[10px] lg:text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-1">
                                {item.items.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {dboxContratacionSeleccion === 'stick' && (
                    <ModernCard hover={false}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                          D-Box Pendrive/Stick
                        </h4>
                        <button
                          onClick={() => setDboxContratacionSeleccion(null)}
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                          title="Cerrar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 lg:gap-6 items-start">
                        <button
                          onClick={() => {
                            setModalImage('/descarga-1-1-removebg-preview.png')
                            setModalSize('large')
                          }}
                          className="w-full max-w-80 h-64 sm:h-80 lg:h-80 flex items-center justify-center bg-transparent shrink-0 hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                          <img
                            src="/descarga-1-1-removebg-preview.png"
                            alt="D-Box Stick"
                            className="w-full h-full object-contain drop-shadow-md"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                            }}
                          />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 gap-2 lg:gap-3">
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">RAM:</span>
                            <span>1GB</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Procesador:</span>
                            <span>Gama ultra baja</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Calidad:</span>
                            <span>1080p máximo</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Calentamiento:</span>
                            <span>Se calienta más</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Riesgos:</span>
                            <span>Puede fundirse</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Fluidez:</span>
                            <span>Más lento</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-3 lg:p-4 border border-amber-200 dark:border-gray-700">
                        <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          El <strong>D-Box Pendrive/Stick</strong> (conocido en Andes como <strong>D-Box Smart</strong>) tiene un costo de <strong className="text-amber-600 dark:text-amber-400 font-bold">$2.990</strong>.
                        </p>
                      </div>
                    </ModernCard>
                  )}

                  {dboxContratacionSeleccion === 'caja' && (
                    <ModernCard hover={false}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                          D-Box Caja
                        </h4>
                        <button
                          onClick={() => setDboxContratacionSeleccion(null)}
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                          title="Cerrar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 lg:gap-6 items-start">
                        <button
                          onClick={() => {
                            setModalImage('/Grupo_3051.png.webp')
                            setModalSize('large')
                          }}
                          className="w-full max-w-80 h-64 sm:h-80 lg:h-80 flex items-center justify-center bg-transparent shrink-0 hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                          <img
                            src="/Grupo_3051.png.webp"
                            alt="D-Box Caja"
                            className="w-full h-full object-contain drop-shadow-md"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">Imagen no disponible</text></svg>')
                            }}
                          />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 gap-2 lg:gap-3">
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">RAM:</span>
                            <span>2GB</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Procesador:</span>
                            <span>Gama media</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Calidad:</span>
                            <span>4K real</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Calentamiento:</span>
                            <span>No se calienta mucho</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Riesgos:</span>
                            <span>Mínimos</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 lg:p-3 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold shrink-0">Fluidez:</span>
                            <span>Rápida</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-3 lg:p-4 border border-amber-200 dark:border-gray-700">
                        <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          El <strong>D-Box Caja</strong> (conocido en Andes como <strong>D-Box Smart II</strong>) tiene un costo de <strong className="text-amber-600 dark:text-amber-400 font-bold">$3.990</strong>.
                        </p>
                      </div>
                    </ModernCard>
                  )}
                </ModernCard>
              )}

              {contratacionSeleccion === 'wifi' && (
                <ModernCard hover={false}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
                      Ubicación WiFi del D-Box
                    </h3>
                    <button
                      onClick={() => setContratacionSeleccion(null)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer shrink-0"
                      title="Cerrar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 lg:p-6 border border-blue-200 dark:border-gray-700">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2 shrink-0"></div>
                        <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          El <strong>D-Box</strong> debe ubicarse a una distancia máxima de <strong>10 metros del router (WiFi)</strong>. Esta distancia puede variar según el tipo de paredes que atraviese la señal, por lo que una pared gruesa o metálica reduce el alcance real.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2 shrink-0"></div>
                        <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          También se recomienda <strong>no colocar el D-Box cerca o al costado del router</strong>, ya que puede interferir con la emisión de la señal WiFi y hacer que llegue más limitada de lo normal a los demás dispositivos.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs lg:text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Prueba de velocidad (WiFi / Ethernet)
                      </p>
                      <a
                        href="https://fast.com/es/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Comparar en Fast.com
                      </a>
                    </div>
                    <MedidorVelocidad />
                  </div>
                </ModernCard>
              )}
            </div>
          )}
        </>
      )
    }

  // Return principal - elige entre móvil y desktop
  const content = renderContent()

  // Solo pop-ups que este correo Apex aún no ha visto
  const noticiasPopup = colaPopup
  const popupIndex = Math.min(noticiaIndex, Math.max(0, noticiasPopup.length - 1))
  const popupVisible = noticiaOpen && noticiasPopup.length > 0 && (!lectorEmail || popupsCargados)
  const popupComunicados = popupVisible ? (
    <NoticiaPopup
      noticias={noticiasPopup}
      index={popupIndex}
      onIndex={cambiarIndicePopup}
      onClose={cerrarPopupNoticias}
      onVerImagen={(src) => openImageModal(src, 'large', true)}
      lectorEmail={lectorEmail}
      onIdentificar={confirmarLector}
    />
  ) : !lectorEmail && comunicadoPendiente ? (
    <LectorLogin
      onConfirmar={confirmarLector}
      onCerrar={() => setComunicadoPendiente(null)}
    />
  ) : loginMessenger && !lectorEmail ? (
    <LectorLogin
      onConfirmar={confirmarLector}
      onCerrar={() => setLoginMessenger(false)}
    />
  ) : null

  if (isMobile) {
    return (
      <>
        <MobileLayout
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          navigationItems={navigationItems.filter(item => item.id !== 'apex' && item.id !== 'credentials' && item.id !== 'images')}
          activeSection={activeSection}
          setActiveSection={handleNav}
          modalImage={modalImage}
          modalSize={modalSize}
          modalDisableZoom={modalDisableZoom}
          onClose={closeImageModal}
          lectorEmail={lectorEmail}
          lectorAvatar={lectorAvatar}
          onLectorAvatarChange={setLectorAvatar}
          onToast={showToast}
          onOpenTipificaciones={() => setActiveSection('tipificaciones')}
        >
          {content}
        </MobileLayout>
        {popupComunicados}
        <CredencialModal
          credencial={credencialModal}
          onClose={() => setCredencialModal(null)}
          onCopiar={showToast}
        />
        <RouterAppsModal open={routerModalOpen} onClose={() => setRouterModalOpen(false)} />
        <ModalSomosClave item={modalSomosClave} firebaseApp={app} onCerrar={() => setModalSomosClave(null)} />
        <Toast toast={toast} onClose={() => setToast(null)} />
        <ChatbotAndes firebaseApp={app} userAvatarUrl={lectorAvatar} oculto={activeSection === 'mensajes' || activeSection === 'androidtv' || activeSection === 'andes'} />
      </>
    )
  }
  return (
    <>
      <DesktopLayout
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeSection={activeSection}
        setActiveSection={handleNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigationItems={navigationItems.filter(item => item.id !== 'apex' && item.id !== 'credentials' && item.id !== 'images')}
        modalImage={modalImage}
        modalSize={modalSize}
        modalDisableZoom={modalDisableZoom}
        onClose={closeImageModal}
        lectorEmail={lectorEmail}
        lectorAvatar={lectorAvatar}
        onLectorAvatarChange={setLectorAvatar}
        onToast={showToast}
        onOpenTipificaciones={() => setActiveSection('tipificaciones')}
      >
        {content}
      </DesktopLayout>
      {popupComunicados}
      <CredencialModal
        credencial={credencialModal}
        onClose={() => setCredencialModal(null)}
        onCopiar={showToast}
      />
      <RouterAppsModal open={routerModalOpen} onClose={() => setRouterModalOpen(false)} />
      <ModalSomosClave item={modalSomosClave} firebaseApp={app} onCerrar={() => setModalSomosClave(null)} />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ChatbotAndes firebaseApp={app} userAvatarUrl={lectorAvatar} oculto={activeSection === 'mensajes' || activeSection === 'androidtv' || activeSection === 'andes'} />
    </>
  )
}

export { AdminPanel, Modal, Toast, UsuariosSection, db, app as firebaseApp }
export default App
