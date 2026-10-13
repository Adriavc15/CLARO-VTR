import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'
import { limpiarFondoPlanoPerimetro } from './asistente/limpiarFondoSticker.jsx'

const DOMINIO = 'apexamerica.com'
const MAX_TEXTO = 4000
const MAX_IMG_MB = 8

/**
 * Formatos de imagen aceptados en el chat y como stickers.
 * Los GIF y los WebP animados se subeń tal cual a i.ibb.co: recomprimirlos
 * con canvas destruiría la animación.
 */
export const FORMATOS_STICKER = ['png', 'webp', 'gif']
export const FORMATOS_IMAGEN = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const MIME_POR_FORMATO = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

/** Formato de un File/Blob según su extensión o su MIME. */
export function detectarFormatoArchivo(file) {
  const nombre = String(file?.name || '').toLowerCase()
  const tipo = String(file?.type || '').toLowerCase()
  const ext = (nombre.match(/\.([a-z0-9]+)$/)?.[1] || '').toLowerCase()
  if (ext && MIME_POR_FORMATO[ext]) return ext === 'jpeg' ? 'jpg' : ext
  const mimeExt = Object.keys(MIME_POR_FORMATO).find((k) => MIME_POR_FORMATO[k] === tipo)
  if (mimeExt) return mimeExt === 'jpeg' ? 'jpg' : mimeExt
  if (tipo === 'image/apng' || tipo === 'image/x-apng') return 'png'
  if (ext === 'apng') return 'png'
  return ''
}

const RE_CHUNK_WEBP = /(?:^|[^A-Za-z])VP8X|[^A-Za-z]ANIM[^A-Za-z]/

/**
 * ¿El WebP tiene animación? Un WebP animado es un contenedor RIFF con el
 * chunk `VP8X` + `ANIM`; uno estático usa `VP8 ` (con pérdida) o `VP8L`
 * (sin pérdida). Sin esta comprobación el canvas aplana el archivo y el
 * sticker queda como una sola imagen.
 */
export async function esWebPAnimado(file) {
  if (detectarFormatoArchivo(file) !== 'webp') return false
  try {
    const buf = await file.slice(0, 64).arrayBuffer()
    const ver = String.fromCharCode(...new Uint8Array(buf))
    return RE_CHUNK_WEBP.test(ver)
  } catch {
    return false
  }
}

/** GIF siempre es animado: nunca debe pasar por canvas. */
export function esGifAnimado(file) {
  return detectarFormatoArchivo(file) === 'gif'
}

function validarTipos(file, permitidos, mensaje) {
  const tipo = String(file?.type || '').toLowerCase()
  const nombre = String(file?.name || '').toLowerCase()
  if (/heic|heif/i.test(tipo) || /\.(heic|heif)$/i.test(nombre)) {
    return 'Formato HEIC/HEIF no soportado. Convierte a JPG, PNG, WEBP o GIF.'
  }
  const ext = (nombre.match(/\.([a-z0-9]+)$/)?.[1] || '').toLowerCase()
  const formato = detectarFormatoArchivo(file)
  const ok = permitidos.includes(formato) || (formato === '' && tipo.startsWith('image/'))
  if (!ok) return mensaje
  if (formato === '' && /\.(bmp|tiff?|svg|avif|ico)$/i.test(nombre)) {
    return `Formato ${ext.toUpperCase()} no soportado. Usa PNG, WEBP, GIF o JPG.`
  }
  return ''
}

function validarTamanio(file) {
  if (file.size > MAX_IMG_MB * 1024 * 1024) {
    return `La imagen no puede superar ${MAX_IMG_MB} MB`
  }
  if (file.size < 20) return 'El archivo de imagen está vacío o dañado'
  return ''
}

export function validarArchivoImagen(file) {
  if (!file) return 'No hay archivo'
  const err =
    validarTipos(file, FORMATOS_IMAGEN, 'Solo se permiten imágenes (JPG, PNG, WEBP, GIF)') ||
    validarTamanio(file)
  return err
}

/** Validador específico de stickers: sin JPG, solo PNG/WEBP/GIF. */
export function validarArchivoSticker(file) {
  if (!file) return 'No hay archivo'
  return (
    validarTipos(file, FORMATOS_STICKER, 'Stickers: solo PNG, WEBP o GIF') || validarTamanio(file)
  )
}
const LS_LEIDOS = 'vtr-messenger-leidos'
/** Resumen que se muestra en la lista lateral cuando se borra el último mensaje. */
export const TEXTO_MENSAJE_ELIMINADO = 'Mensaje eliminado'

export function normalizarEmailMessenger(email) {
  return String(email || '').trim().toLowerCase()
}

/** Clave segura para mapas Firestore (el `.` del correo rompe rutas). */
export function claveEmailMap(email) {
  return normalizarEmailMessenger(email).replace(/\./g, ',')
}

export function esCorreoApexAmerica(email) {
  const e = normalizarEmailMessenger(email)
  return Boolean(e) && e.endsWith(`@${DOMINIO}`) && e.length > DOMINIO.length + 1
}

export function chatIdEntre(emailA, emailB) {
  const a = normalizarEmailMessenger(emailA)
  const b = normalizarEmailMessenger(emailB)
  if (!a || !b || a === b) return ''
  return [a, b].sort().join('__')
}

export function otroParticipante(participants, yo) {
  const me = normalizarEmailMessenger(yo)
  const list = Array.isArray(participants) ? participants : []
  return list.find((e) => normalizarEmailMessenger(e) !== me) || ''
}

export function nombreDesdeEmail(email) {
  const e = normalizarEmailMessenger(email)
  if (!e) return 'Usuario'
  const local = e.split('@')[0] || e
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function leerMapaLeidos() {
  try {
    const raw = localStorage.getItem(LS_LEIDOS)
    const obj = raw ? JSON.parse(raw) : {}
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}

export function marcarChatLeido(chatId, lastAtMs) {
  const id = String(chatId || '')
  if (!id) return
  try {
    const map = leerMapaLeidos()
    const prev = Number(map[id] || 0)
    const next = Math.max(prev, Number(lastAtMs) || Date.now())
    map[id] = next
    localStorage.setItem(LS_LEIDOS, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

const lecturaEnVuelo = new Map()

/**
 * Marca el chat como leído por mí (local + Firestore).
 * El peer usa este cursor para mostrar ✓✓ azules en sus mensajes.
 */
export async function registrarLecturaChat(db, chatId, miEmail, lastAtMs) {
  const id = String(chatId || '')
  const me = normalizarEmailMessenger(miEmail)
  const next = Math.max(0, Number(lastAtMs) || Date.now())
  if (!db || !id || !esCorreoApexAmerica(me) || !next) return
  marcarChatLeido(id, next)
  const cacheKey = `${id}::${me}`
  const prevLocal = Number(lecturaEnVuelo.get(cacheKey) || 0)
  if (next <= prevLocal) return
  lecturaEnVuelo.set(cacheKey, next)
  try {
    const ref = doc(db, 'messenger_chats', id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const data = snap.data() || {}
    const participantes = Array.isArray(data.participants)
      ? data.participants.map(normalizarEmailMessenger)
      : []
    if (!participantes.includes(me)) return
    const key = claveEmailMap(me)
    const prevMap = data.readBy && typeof data.readBy === 'object' ? data.readBy : {}
    const prev = Number(prevMap[key] || 0)
    if (next <= prev) return
    await updateDoc(ref, { [`readBy.${key}`]: next })
  } catch (err) {
    lecturaEnVuelo.set(cacheKey, prevLocal)
    console.warn('No se pudo registrar lectura:', err?.message || err)
  }
}

export function lecturaPeerMs(chat, peerEmail) {
  if (!chat?.readBy || typeof chat.readBy !== 'object') return 0
  const key = claveEmailMap(peerEmail)
  return Number(chat.readBy[key] || 0)
}

export function mensajeFueLeidoPorPeer(msg, peerReadMs) {
  if (!msg || msg.pending) return false
  const ms = msg.createdAt?.toMillis?.() || (msg.createdAt?.toDate ? msg.createdAt.toDate().getTime() : 0)
  if (!ms || !peerReadMs) return false
  return peerReadMs >= ms
}

export function chatTieneNoLeidos(chat, miEmail) {
  if (!chat?.id || !chat.lastAt) return false
  const me = normalizarEmailMessenger(miEmail)
  if (chat.lastFrom === me) return false
  if (!chat.lastMessage) return false
  const vistoLocal = Number(leerMapaLeidos()[chat.id] || 0)
  const vistoRemoto = Number(chat.readBy?.[claveEmailMap(me)] || 0)
  const visto = Math.max(vistoLocal, vistoRemoto)
  const ts = chat.lastAt?.toMillis?.() || 0
  return ts > visto
}

export async function verificarLectorApex(db, email) {
  const clave = normalizarEmailMessenger(email)
  if (!esCorreoApexAmerica(clave)) {
    return { ok: false, reason: 'Se requiere un correo corporativo verificado y registrado en el portal' }
  }
  try {
    const snap = await getDoc(doc(db, 'lectores', clave))
    if (!snap.exists()) return { ok: false, reason: 'Ese correo no está registrado en el portal' }
    const data = snap.data() || {}
    return {
      ok: true,
      email: clave,
      avatarUrl: String(data.avatarUrl || '').trim(),
    }
  } catch {
    return { ok: false, reason: 'No se pudo verificar el correo' }
  }
}

/** Crea el chat solo si no existe (idempotente). */
export async function asegurarChat(db, emailA, emailB) {
  const a = normalizarEmailMessenger(emailA)
  const b = normalizarEmailMessenger(emailB)
  if (!esCorreoApexAmerica(a) || !esCorreoApexAmerica(b) || a === b) {
    throw new Error('El chat solo es entre dos usuarios corporativos distintos')
  }
  const id = chatIdEntre(a, b)
  const ref = doc(db, 'messenger_chats', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const participants = [a, b].sort()
    try {
      await setDoc(ref, {
        participants,
        lastMessage: '',
        lastFrom: a,
        lastAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        readBy: {},
      })
    } catch (err) {
      // Carrera: otro cliente lo creó
      const again = await getDoc(ref)
      if (!again.exists()) throw err
    }
  }
   return id
}

/** Genera un id único de grupo a partir del nombre. */
/**
 * Normaliza texto para comparaciones y claves de grupo.
 */
export function nombreNormalizado(nombre) {
  return String(nombre || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

export function chatIdGrupo(nombre) {
  const clave = nombreNormalizado(nombre).replace(/[^a-z0-9]/g, '_').slice(0, 25) || 'grupo'
  return `grupo__${clave}__${Date.now()}`
}

/** Crea un grupo con el creador + los miembros seleccionados. */
export async function crearGrupo(db, name, participantEmails, yo) {
  const creador = normalizarEmailMessenger(yo)
  if (!esCorreoApexAmerica(creador)) throw new Error('Se requiere un correo corporativo verificado y registrado')
  const nombre = String(name || '').trim().slice(0, 80)
  if (!nombre) throw new Error('Escribe un nombre para el grupo')
  const partes = [creador, ...participantEmails.map(normalizarEmailMessenger)].filter(Boolean)
  const unicas = [...new Set(partes)]
  if (unicas.length < 2) throw new Error('Añade al menos un participante al grupo')
  if (unicas.some((e) => !esCorreoApexAmerica(e))) {
    throw new Error('Todos los participantes deben tener un correo corporativo verificado y registrado')
  }
  const participants = unicas.sort()
  const id = chatIdGrupo(nombre)
  const ref = doc(db, 'messenger_chats', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      isGroup: true,
      name: nombre,
      participants,
      createdBy: creador,
      lastMessage: 'Grupo creado',
      lastFrom: creador,
      lastAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      readBy: {},
    })
    try {
      const msgRef = doc(collection(db, 'messenger_chats', id, 'mensajes'))
      await setDoc(msgRef, {
        from: creador,
        text: `Grupo "${nombre}" creado`,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      console.warn('No se pudo crear mensaje inicial del grupo:', e)
    }
  }
  return id
}

/**
 * Actualiza la imagen (logo) de un grupo.
 * Solo el creador puede hacerlo.
 */
export async function actualizarImagenGrupo(db, chatId, imageUrl, yo) {
  const creador = normalizarEmailMessenger(yo)
  if (!esCorreoApexAmerica(creador)) throw new Error('Se requiere un correo corporativo verificado y registrado')
  const id = String(chatId || '').trim()
  if (!id) throw new Error('ID de grupo inválido')
  const url = String(imageUrl || '').trim().slice(0, 800)
  if (url && !/^https:\/\//i.test(url)) throw new Error('URL de imagen inválida')
  const ref = doc(db, 'messenger_chats', id)
  await updateDoc(ref, { imageUrl: url })
}

export function suscribirChats(db, miEmail, onData, onError) {
  const me = normalizarEmailMessenger(miEmail)
  if (!esCorreoApexAmerica(me)) {
    onData([])
    return () => {}
  }
  const q = query(
    collection(db, 'messenger_chats'),
    where('participants', 'array-contains', me),
    limit(120)
  )
  return onSnapshot(
    q,
    (snap) => {
       const rows = snap.docs.map((d) => {
         const data = d.data() || {}
         const isGroup = data.isGroup === true
         return {
           id: d.id,
           isGroup,
           name: String(data.name || ''),
           imageUrl: String(data.imageUrl || '').trim(),
           createdBy: normalizarEmailMessenger(data.createdBy),
           participants: Array.isArray(data.participants) ? data.participants : [],
           lastMessage: String(data.lastMessage || ''),
           lastFrom: normalizarEmailMessenger(data.lastFrom),
           lastAt: data.lastAt || null,
           peer: isGroup ? '' : otroParticipante(data.participants, me),
           readBy: data.readBy && typeof data.readBy === 'object' ? data.readBy : {},
         }
       })
      rows.sort((a, b) => {
        const ta = a.lastAt?.toMillis?.() || 0
        const tb = b.lastAt?.toMillis?.() || 0
        return tb - ta
      })
      onData(rows)
    },
    (err) => {
      console.error('Error al leer chats:', err)
      onError?.(err)
      onData([])
    }
  )
}

export function suscribirMensajes(db, chatId, onData, onError) {
  if (!chatId) {
    onData([])
    return () => {}
  }
  const q = query(
    collection(db, 'messenger_chats', chatId, 'mensajes'),
    orderBy('createdAt', 'asc'),
    limit(400)
  )
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => {
          const data = d.data() || {}
          return {
            id: d.id,
            from: normalizarEmailMessenger(data.from),
            text: String(data.text || ''),
            imageUrl: String(data.imageUrl || '').trim(),
            sticker: String(data.sticker || '').trim(),
            createdAt: data.createdAt || null,
            editado: Boolean(data.editado),
            eliminado: Boolean(data.eliminado),
            reenviadoDe: data.reenviadoDe ? String(data.reenviadoDe) : '',
            pending: false,
          }
        })
      )
    },
    (err) => {
      console.error('Error al leer mensajes:', err)
      onError?.(err)
      onData([])
    }
  )
}

/**
 * Envía mensaje y actualiza el resumen del chat en un batch.
 * Crea el chat si aún no existe.
 */
export async function enviarMensaje(db, { chatId, from, to, text = '', imageUrl = '', sticker = '', reenviadoDe = '' }) {
  const me = normalizarEmailMessenger(from)
  const peer = normalizarEmailMessenger(to)
  let chat = String(chatId || '')
  const cuerpo = String(text || '').trim().slice(0, MAX_TEXTO)
  const img = String(imageUrl || '').trim().slice(0, 800)
  const stick = String(sticker || '').trim().slice(0, 800)
  const reenv = String(reenviadoDe || '').trim().slice(0, 120)
  if (!esCorreoApexAmerica(me)) throw new Error('Datos de chat inválidos')
  if (!cuerpo && !img && !stick) throw new Error('Escribe un mensaje, sticker o adjunta una imagen')
  if (img && !/^https:\/\//i.test(img)) throw new Error('URL de imagen inválida')
  if (stick && !(stick.startsWith('/') || /^https:\/\//i.test(stick))) {
    throw new Error('Sticker inválido')
  }

  if (!chat) {
    if (!esCorreoApexAmerica(peer) || peer === me) {
      throw new Error('Destinatario inválido')
    }
    chat = await asegurarChat(db, me, peer)
  }

  const chatRef = doc(db, 'messenger_chats', chat)
  const chatSnap = await getDoc(chatRef)
  if (!chatSnap.exists()) {
    if (!peer) throw new Error('Chat no encontrado')
    await asegurarChat(db, me, peer)
  }

  const preview = stick ? '🎨 Sticker' : cuerpo || (img ? '📷 Imagen' : '')
  const msgRef = doc(collection(db, 'messenger_chats', chat, 'mensajes'))
  const batch = writeBatch(db)
  const msgData = {
    from: me,
    text: cuerpo,
    imageUrl: img || '',
    sticker: stick || '',
    createdAt: serverTimestamp(),
  }
  if (reenv) msgData.reenviadoDe = reenv
  batch.set(msgRef, msgData)
  batch.update(chatRef, {
    lastMessage: preview.slice(0, 500),
    lastFrom: me,
    lastAt: serverTimestamp(),
  })
  await batch.commit()

  marcarChatLeido(chat, Date.now())
  return { chatId: chat, messageId: msgRef.id }
}

export function suscribirContactosApex(db, miEmail, onData, onError) {
  const me = normalizarEmailMessenger(miEmail)
  return onSnapshot(
    collection(db, 'lectores'),
    (snap) => {
      const items = []
      snap.forEach((d) => {
        const data = d.data() || {}
        const email = normalizarEmailMessenger(data.email || d.id)
        if (!esCorreoApexAmerica(email) || email === me) return
        items.push({
          email,
          avatarUrl: String(data.avatarUrl || '').trim(),
          nombre: nombreDesdeEmail(email),
        })
      })
      items.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es') || a.email.localeCompare(b.email))
      onData(items)
    },
    (err) => {
      console.error('Error al leer contactos Apex:', err)
      onError?.(err)
      onData([])
    }
  )
}

/**
 * Reduce peso de imagen antes de subir (JPEG/WEBP, max lado). Preserva
 * transparencia en PNG/WebP y elimina fondos sólidos en stickers.
 *
 * `opciones.animado` (o `opciones.detectarAnimacion`) desactiva el re-encoding:
 * pasar un GIF o un WebP animado por canvas lo dejaría en una sola imagen.
 */
export async function comprimirImagenParaChat(file, maxSide = 1280, quality = 0.82, opciones = {}) {
  if (!file) return file
  if (opciones.animado) return file
  if (esGifAnimado(file)) return file
  if (opciones.detectarAnimacion && (await esWebPAnimado(file))) return file

  return new Promise((resolve) => {
    const tipo = String(file.type || '').toLowerCase()
    // GIF animado: no recomprimir
    if (tipo === 'image/gif' || /\.gif$/i.test(file.name || '')) {
      resolve(file)
      return
    }

    // Solo los formatos que pueden llevar canal alfa se limpian. Un JPEG
    // (aunque venga como "sticker") conserva su fondo: quitarle el blanco
    // destruiría la imagen.
    const esTransparente =
      tipo === 'image/png' ||
      tipo === 'image/webp' ||
      /\.png$/i.test(file.name || '') ||
      /\.webp$/i.test(file.name || '')

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        URL.revokeObjectURL(url)
        let { width, height } = img
        if (!width || !height) {
          resolve(file)
          return
        }
        // Más agresivo si el archivo es grande
        let side = maxSide
        if (file.size > 4 * 1024 * 1024) side = Math.min(side, 1024)
        if (file.size > 6 * 1024 * 1024) side = Math.min(side, 900)
        const scale = Math.min(1, side / Math.max(width, height))
        width = Math.max(1, Math.round(width * scale))
        height = Math.max(1, Math.round(height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        if (esTransparente) {
          // Mantener transparencia total: limpiar canvas sin rellenar fondo
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          // Si el archivo tenía un marco blanco o negro sólido perimetral accidental, limpiarlo
          limpiarFondoPlanoPerimetro(canvas, ctx, width, height)

          const q = file.size > 3 * 1024 * 1024 ? Math.min(quality, 0.78) : quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback a PNG si webp fallara
                canvas.toBlob(
                  (pngBlob) => {
                    if (!pngBlob) {
                      resolve(file)
                      return
                    }
                    const nombre = String(file.name || 'sticker').replace(/\.\w+$/, '').slice(0, 60)
                    resolve(new File([pngBlob], `${nombre || 'sticker'}.png`, { type: 'image/png' }))
                  },
                  'image/png'
                )
                return
              }
              const nombre = String(file.name || 'sticker').replace(/\.\w+$/, '').slice(0, 60)
              resolve(new File([blob], `${nombre || 'sticker'}.webp`, { type: 'image/webp' }))
            },
            'image/webp',
            q
          )
        } else {
          // Imagen normal JPEG (fotos)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          const q = file.size > 3 * 1024 * 1024 ? Math.min(quality, 0.72) : quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file)
                return
              }
              const nombre = String(file.name || 'foto').replace(/\.\w+$/, '').slice(0, 60)
              resolve(new File([blob], `${nombre || 'foto'}.jpg`, { type: 'image/jpeg' }))
            },
            'image/jpeg',
            q
          )
        }
      } catch {
        resolve(file)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })
}

export function timestampLocal() {
  return Timestamp.fromDate(new Date())
}

/**
 * Edita el texto de un mensaje ya enviado.
 * Agrega el campo `editado: true` y `editadoAt` para mostrarlo en la UI.
 * Validación en el cliente y en las reglas (from inmutable, solo text/editado*).
 * Si `esUltimo` se actualiza también el resumen del chat, en el mismo batch
 * para no sumar un round-trip.
 */
export async function editarMensaje(
  db,
  { chatId, msgId, nuevoTexto, miEmail, esUltimo = false }
) {
  const me = normalizarEmailMessenger(miEmail)
  const texto = String(nuevoTexto || '').trim().slice(0, MAX_TEXTO)
  if (!db || !chatId || !msgId || !me) throw new Error('Datos inválidos para editar')
  if (!texto) throw new Error('El mensaje no puede quedar vacío')

  const msgRef = doc(db, 'messenger_chats', chatId, 'mensajes', msgId)
  const cambios = { text: texto, editado: true, editadoAt: serverTimestamp() }
  if (!esUltimo) {
    await updateDoc(msgRef, cambios)
    return
  }
  // El resumen del chat viaja en el mismo batch (un solo round-trip). Si algo
  // lo bloquea, el mensaje se guarda igual: el texto es lo importante.
  try {
    const batch = writeBatch(db)
    batch.update(msgRef, cambios)
    batch.update(doc(db, 'messenger_chats', chatId), {
      lastMessage: texto.slice(0, 500),
      lastFrom: me,
    })
    await batch.commit()
  } catch {
    await updateDoc(msgRef, cambios)
  }
}

/**
 * Elimina un mensaje (soft delete): vacía texto/multimedia y marca
 * `eliminado: true`. Si es el último mensaje, el resumen del chat se actualiza
 * en el mismo batch para no dejar el texto borrado en la lista lateral.
 */
export async function eliminarMensaje(db, { chatId, msgId, miEmail, esUltimo = false }) {
  const me = normalizarEmailMessenger(miEmail)
  if (!db || !chatId || !msgId || !me) throw new Error('Datos inválidos para eliminar')

  const msgRef = doc(db, 'messenger_chats', chatId, 'mensajes', msgId)
  const cambios = {
    text: '',
    imageUrl: '',
    sticker: '',
    eliminado: true,
    eliminadoAt: serverTimestamp(),
  }
  if (!esUltimo) {
    await updateDoc(msgRef, cambios)
    return
  }
  try {
    const batch = writeBatch(db)
    batch.update(msgRef, cambios)
    batch.update(doc(db, 'messenger_chats', chatId), {
      lastMessage: TEXTO_MENSAJE_ELIMINADO,
      lastFrom: me,
    })
    await batch.commit()
  } catch {
    await updateDoc(msgRef, cambios)
  }
}
