import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  ImagePlus,
  ArrowLeft,
  X,
  User,
  Users,
  MessagesSquare,
  Loader2,
  RefreshCw,
  Smile,
  CheckCheck,
  ChevronDown,
  Sparkles,
  Edit2,
  Trash2,
  CornerUpRight,
  Copy,
  Check,
  Plus,
  Star,
  Download,
  LogOut,
} from 'lucide-react'
import {
  avatarImgProps,
  MESSENGER_SRC,
  leerHueChatMessenger,
  messengerFilterStyle,
} from '../asistente/messengerAvatar'
import { detectarFormatoUrl, esStickerUrlValida, esStickerUrlRenderizable, guardarStickerMio as guardarStickerMioLocal, guardarStickerMioEnNube, leerStickersFavoritos, marcarStickerReciente, publicarSticker, suscribirStickersCatalogo, toggleStickerFavorito } from '../asistente/messengerStickers'
import { StickerChat, useStickerTransparente } from '../asistente/limpiarFondoSticker.jsx'
import {
  desbloquearAudio,
  reproducirSonidoMensaje,
  sonidoMensajesHabilitado,
  toggleSonidoMensajes,
} from '../asistente/sonidoMensaje'
import PanelMediaWhatsApp from './PanelMediaWhatsApp'
import BotonGoogle from './BotonGoogle'
import ChatbotAndes from './ChatbotAndes'
import {
  chatIdEntre,
  chatTieneNoLeidos,
  comprimirImagenParaChat,
  crearGrupo,
  detectarFormatoArchivo,
  editarMensaje,
  eliminarMensaje,
  enviarMensaje,
  esCorreoApexAmerica,
  esGifAnimado,
  esWebPAnimado,
  lecturaPeerMs,
  mensajeFueLeidoPorPeer,
  nombreDesdeEmail,
  normalizarEmailMessenger,
  registrarLecturaChat,
  suscribirChats,
  suscribirContactosApex,
  suscribirMensajes,
  timestampLocal,
  validarArchivoImagen,
  validarArchivoSticker,
  actualizarImagenGrupo,
} from '../messengerStore'
import { useMessengerAuth, entrarConGoogle, salirMessenger } from '../messengerAuth'

const APEX_BOT_ID = '__apex_bot__'

function millisMsg(ts) {
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (typeof ts.toDate === 'function') return ts.toDate().getTime()
  if (ts instanceof Date) return ts.getTime()
  return 0
}

function horaMsg(ts) {
  const ms = millisMsg(ts)
  if (!ms) return ''
  try {
    return new Date(ms).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function fechaLista(ts) {
  const ms = millisMsg(ts)
  if (!ms) return ''
  try {
    const d = new Date(ms)
    const hoy = new Date()
    const misma =
      d.getDate() === hoy.getDate() &&
      d.getMonth() === hoy.getMonth() &&
      d.getFullYear() === hoy.getFullYear()
    if (misma) return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
}

function claveDia(ts) {
  const ms = millisMsg(ts)
  if (!ms) return 'sin-fecha'
  const d = new Date(ms)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function etiquetaDia(ts) {
  const ms = millisMsg(ts)
  if (!ms) return ''
  const d = new Date(ms)
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)
  const misma = (a, b) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
  if (misma(d, hoy)) return 'Hoy'
  if (misma(d, ayer)) return 'Ayer'
  return d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' })
}

function CheckVerificacion({ leido = false, size = 16, className = '' }) {
  const h = Math.round((size * 11) / 16)
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      title={leido ? 'Visto · El destinatario vio este mensaje' : 'Enviado'}
      aria-label={leido ? 'Visto' : 'Enviado'}
    >
      <svg
        viewBox="0 0 16 11"
        width={size}
        height={h}
        fill="none"
        className="shrink-0 block transition-transform duration-150"
        style={
          leido
                ? {
                    color: '#6b7280',
                    filter: 'drop-shadow(0 0 3px rgba(107,114,128,0.5))',
                  }
                : {
                    color: 'currentColor',
                  }
        }
        aria-hidden="true"
      >
        <path
          d="M11.04 0.65L4.85 7.08L2.09 4.32L0.68 5.73L4.85 9.9L12.45 2.06L11.04 0.65Z"
          fill="currentColor"
        />
        <path
          d="M14.54 2.06L8.35 8.49L7.65 7.79L6.24 9.2L8.35 11.31L15.95 3.47L14.54 2.06Z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

function ImgChat({ src, className = '', pending = false }) {
  const urlLimpia = useStickerTransparente(src)
  const [estado, setEstado] = useState('loading')
  useEffect(() => {
    setEstado('loading')
  }, [urlLimpia])
  if (!src) return null
  const esPng = /\.(png|webp)$/i.test(src) || urlLimpia?.startsWith('data:')
  return (
    <span className={`relative block overflow-hidden rounded-md ${className}`}>
      {estado !== 'ready' && (
        <span
          className={`absolute inset-0 min-h-[7rem] vtr-msg-img-skeleton ${
            pending ? 'opacity-90' : ''
          }`}
          aria-hidden
        />
      )}
      {pending && estado === 'ready' && (
        <span className="absolute inset-0 z-[1] bg-black/25 flex items-center justify-center">
          <Loader2 size={22} className="animate-spin text-white drop-shadow" />
        </span>
      )}
      <img
        src={urlLimpia || src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setEstado('ready')}
        onError={() => setEstado('error')}
        className={`max-h-64 w-full ${
          esPng ? 'object-contain bg-transparent' : 'object-cover'
        } transition-opacity duration-300 ${
          estado === 'ready' ? 'opacity-100' : 'opacity-0 min-h-[7rem]'
        }`}
      />
      {estado === 'error' && (
        <span className="absolute inset-0 flex items-center justify-center text-[11px] text-gray-500 bg-gray-100 dark:bg-gray-800">
          No se pudo cargar
        </span>
      )}
    </span>
  )
}

function AvatarMini({ email, avatarUrl, size = 40 }) {
  const props = avatarImgProps(avatarUrl || '', { fallbackMessenger: false })
  const inicial = (nombreDesdeEmail(email) || '?').charAt(0).toUpperCase()
  if (props.src) {
    return (
      <span
        className="shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <img
          src={props.src}
          alt=""
          style={props.style}
          className={
            props.isMessenger ? 'w-full h-full object-contain p-0.5' : 'w-full h-full object-cover'
          }
        />
      </span>
    )
  }
  return (
    <span
      className="shrink-0 rounded-full bg-gradient-to-br from-teal-500 to-[#0c0f0e] text-white font-bold flex items-center justify-center"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {inicial}
    </span>
  )
}

export default function MessengerApex({
  db,
  avatarUrl = '',
  subirImagen,
  onToast,
  firebaseApp,
  darkMode = false,
}) {
  // La identidad del messenger es la de Firebase Auth (Google), no un correo
  // que el cliente pueda escribir a mano: las reglas de Firestore comparan
  // `from` contra `request.auth.token.email`.
  const {
    auth,
    user: usuarioAuth,
    email: correoSesion,
    verificado: correoVerificado,
    cargando: cargandoAuth,
  } = useMessengerAuth(firebaseApp)
  const [loginError, setLoginError] = useState('')
  const [entrando, setEntrando] = useState(false)

  const yo = normalizarEmailMessenger(correoSesion)
  const [pestana, setPestana] = useState('contactos')
  const [chats, setChats] = useState([])
  const [contactos, setContactos] = useState([])
  const [chatActivo, setChatActivo] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [previewImg, setPreviewImg] = useState(null)
  const [cargandoContactos, setCargandoContactos] = useState(true)
  const [cargandoChats, setCargandoChats] = useState(true)
  const [cargandoMsgs, setCargandoMsgs] = useState(false)
  const [errorContactos, setErrorContactos] = useState('')
  const [errorChats, setErrorChats] = useState('')
  const [tickLeidos, setTickLeidos] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [panelStickers, setPanelStickers] = useState(false)
  const [catalogoStickers, setCatalogoStickers] = useState([])
  const [subiendoSticker, setSubiendoSticker] = useState(false)
  const [botHue] = useState(() =>
    typeof window !== 'undefined' ? leerHueChatMessenger() : 0
  )
  // ---- Menú contextual (editar / eliminar / reenviar) ----
  const [menuMsg, setMenuMsg] = useState(null) // { id, x, y, mio, msg }
  const [editandoMsg, setEditandoMsg] = useState(null) // { id, texto }
  // Vista previa de un sticker del chat (estilo WhatsApp: tocas el sticker y
  // se abre el modal con Favoritos / Mis Stickers / Reenviar).
  const [modalSticker, setModalSticker] = useState(null) // { url, msg, label }
  const [copiadoId, setCopiadoId] = useState('')
  const [reenviando, setReenviando] = useState(null) // mensaje a reenviar
  const menuRef = useRef(null)
  // -------------------------------------------------------
  const fileRef = useRef(null)
  const stickerFileRef = useRef(null)
  const bottomRef = useRef(null)
  const listaRef = useRef(null)
  const inputRef = useRef(null)
  const editInputRef = useRef(null)
  const stickBottom = useRef(true)
  const knownIdsRef = useRef(new Set())
  const chatsLastAtRef = useRef(new Map())
  const prevLenRef = useRef(0)
  const chatMsgKeyRef = useRef('')
   const groupImageInputRef = useRef(null)
  const [animIds, setAnimIds] = useState(() => new Set())
  const [nuevosAbajo, setNuevosAbajo] = useState(0)
  // ---- Modal crear grupo ----
  const [modalCrearGrupo, setModalCrearGrupo] = useState(false)
  const [nombreGrupo, setNombreGrupo] = useState('')
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState([])
  const [creandoGrupo, setCreandoGrupo] = useState(false)
  const [cambiandoImagenGrupo, setCambiandoImagenGrupo] = useState(false)
  // ---------------------------
  // ---- Stickers favoritos ----
  const [stickersFavoritos, setStickersFavoritos] = useState(() => leerStickersFavoritos())
  // ---------------------------
  const esBotActivo = Boolean(chatActivo?.bot)
  const vistaChat = Boolean(chatActivo)

  // ---- Sonido al recibir mensajes ----
  const [sonidoOn, setSonidoOn] = useState(() => sonidoMensajesHabilitado())
  const alternarSonido = useCallback(() => {
    setSonidoOn(toggleSonidoMensajes())
  }, [])

  // Los navegadores solo dejan sonar el audio tras un gesto del usuario
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const gesto = () => desbloquearAudio()
    window.addEventListener('pointerdown', gesto, { once: true })
    window.addEventListener('keydown', gesto, { once: true })
    return () => {
      window.removeEventListener('pointerdown', gesto)
      window.removeEventListener('keydown', gesto)
    }
  }, [])

  const coincideBusquedaBot = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return true
    return ['apex', 'bot', 'asistente', 'ia', 'chat', 'soporte', 'principal', 'inteligencia'].some(
      (t) => t.includes(q) || q.includes(t)
    )
  }, [busqueda])

  const abrirBotApex = () => {
    setChatActivo({ id: APEX_BOT_ID, peer: APEX_BOT_ID, bot: true, avatarUrl: MESSENGER_SRC })
    setTexto('')
    setPendientes([])
    setMensajes([])
    setPanelStickers(false)
    if (previewImg?.url) URL.revokeObjectURL(previewImg.url)
    setPreviewImg(null)
    stickBottom.current = true
  }

  // Cierra el menú contextual al hacer clic fuera o en Escape
  useEffect(() => {
    if (!menuMsg) return
    const cerrar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuMsg(null)
    }
    const esc = (e) => { if (e.key === 'Escape') setMenuMsg(null) }
    document.addEventListener('mousedown', cerrar)
    document.addEventListener('touchstart', cerrar)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', cerrar)
      document.removeEventListener('touchstart', cerrar)
      document.removeEventListener('keydown', esc)
    }
  }, [menuMsg])

  // Cierra la vista previa del sticker con Escape
  useEffect(() => {
    if (!modalSticker) return
    const esc = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setModalSticker(null)
      }
    }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [modalSticker])

  // Foco en input de edición al activarse
  useEffect(() => {
    if (editandoMsg) {
      setTimeout(() => editInputRef.current?.focus(), 60)
    }
  }, [editandoMsg?.id])

  const abrirMenuMsg = (e, m, mio) => {
    if (m.pending || m.eliminado) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    // Posición relativa al viewport, ajustando para que no se salga
    const x = Math.min(e.clientX || rect.right, window.innerWidth - 200)
    const y = Math.min(e.clientY || rect.bottom, window.innerHeight - 180)
    setMenuMsg({ id: m.id, x, y, mio, msg: m })
  }

  const accionCopiar = async (m) => {
    const txt = m.text || (m.sticker ? '🎨 Sticker' : m.imageUrl ? '📷 Imagen' : '')
    if (!txt) return
    try {
      await navigator.clipboard.writeText(txt)
      setCopiadoId(m.id)
      setTimeout(() => setCopiadoId(''), 1800)
    } catch { /* ignore */ }
    setMenuMsg(null)
  }

  const accionEditar = (m) => {
    if (!m.text) return
    setEditandoMsg({ id: m.id, texto: m.text })
    setMenuMsg(null)
  }

  const accionEliminar = async (m) => {
    setMenuMsg(null)
    if (!chatActivo?.id) return
    try {
      await eliminarMensaje(db, { chatId: chatActivo.id, msgId: m.id, miEmail: yo })
    } catch (err) {
      onToast?.(err.message || 'No se pudo eliminar el mensaje')
    }
  }

  const accionReenviar = (m) => {
    setReenviando(m)
    setMenuMsg(null)
    // Cambiar a pestaña de contactos para elegir destino
    setPestana('contactos')
    setChatActivo(null)
  }

  /** Etiqueta legible de un sticker (catálogo > nombre del archivo > genérico). */
  const etiquetaDeSticker = useCallback(
    (url, m) =>
      m?.stickerLabel ||
      catalogoStickers.find((s) => s.url === url)?.label ||
      'Sticker',
    [catalogoStickers]
  )

  /** Abre la vista previa del sticker al tocarlo dentro del chat. */
  const abrirModalSticker = (m) => {
    const u = String(m?.sticker || '').trim()
    if (!u) return
    setMenuMsg(null)
    setModalSticker({ url: u, msg: m, label: etiquetaDeSticker(u, m) })
  }

  const cerrarModalSticker = () => setModalSticker(null)

  /** Favorito / "mis stickers" sobre un sticker que ya está en el chat. */
  const esFavoritoSticker = useCallback(
    (url) => stickersFavoritos.includes(String(url || '').trim()),
    [stickersFavoritos]
  )

  const alternarFavoritoStickerMsg = (m, cerrarModal = true) => {
    const u = String(m?.sticker || '').trim()
    if (!u) return
    const nuevos = toggleStickerFavorito(u)
    setStickersFavoritos(nuevos)
    marcarStickerReciente(u)
    onToast?.(
      nuevos.includes(u)
        ? 'Sticker agregado a Favoritos'
        : 'Sticker quitado de Favoritos'
    )
    setMenuMsg(null)
    if (cerrarModal) setModalSticker(null)
  }

  const guardarStickerMsgEnLosMios = async (m, cerrarModal = true) => {
    const u = m?.sticker
    setMenuMsg(null)
    if (!u) return
    // Recuperamos el nombre real desde el catálogo para no guardar "Sticker".
    const etiqueta = etiquetaDeSticker(u, m)
    try {
      if (db && yo) {
        await guardarStickerMioEnNube(db, {
          url: u,
          by: yo,
          label: etiqueta,
          formato: detectarFormatoUrl(u),
        })
      }
      guardarStickerMioLocal(u, etiqueta)
      marcarStickerReciente(u)
      onToast?.(`"${etiqueta}" guardado en Mis Stickers`)
    } catch (err) {
      onToast?.(err?.message || 'No se pudo guardar el sticker')
    }
    if (cerrarModal) setModalSticker(null)
  }

  const confirmarEdicion = async () => {
    if (!editandoMsg || !chatActivo?.id) return
    const txt = editandoMsg.texto.trim()
    if (!txt) return
    try {
      await editarMensaje(db, {
        chatId: chatActivo.id,
        msgId: editandoMsg.id,
        nuevoTexto: txt,
        miEmail: yo,
      })
      setEditandoMsg(null)
    } catch (err) {
      onToast?.(err.message || 'No se pudo editar el mensaje')
    }
  }

  const cancelarEdicion = () => setEditandoMsg(null)

  const reenviarA = (peerDestino, isGroup = false, groupName = '') => {
    if (!reenviando) return
    const m = reenviando
    setReenviando(null)
    // Abrir chat con ese peer
    abrirChat(peerDestino, '', '', isGroup, groupName)
    // Preparar el mensaje a reenviar en el input después de que cargue el chat
    setTimeout(() => {
      if (m.text) setTexto(m.text)
      if (m.sticker) enviar({ textoOverride: '', sticker: m.sticker })
      if (m.imageUrl) enviar({ textoOverride: '', imagenForzada: { file: null, url: '', remoteUrl: m.imageUrl } })
    }, 200)
  }

  const ContactoBotFijo = (
    <button
      type="button"
      onClick={abrirBotApex}
      className={`w-full flex items-center gap-3 px-3.5 py-3 text-left border-b border-transparent transition-all ${
        darkMode
          ? esBotActivo
            ? 'bg-[#182922] border-l-4 border-l-teal-400 text-white shadow-xs'
            : 'bg-[#1a1a1a] hover:bg-[#222] text-gray-300'
          : esBotActivo
            ? 'bg-teal-50 border-l-4 border-l-teal-400 text-gray-900 shadow-xs'
            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
      }`}
    >
      <div className="relative shrink-0">
        <span
          className="overflow-hidden flex items-center justify-center shadow-xs"
          style={{ width: 48, height: 48 }}
        >
          <img
            src={MESSENGER_SRC}
            alt="Apex IA"
            className="w-full h-full object-contain p-0.5"
            style={messengerFilterStyle(botHue)}
            draggable={false}
          />
        </span>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-white shadow-xs"
          title="En línea"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <p className={`text-sm font-bold truncate flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Apex
            <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-xs ${darkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
              <Sparkles size={10} className="shrink-0" />
              Principal
            </span>
          </p>
          <span className={`text-[10px] shrink-0 font-bold px-1.5 py-0.5 rounded border ${darkMode ? 'bg-teal-500/20 text-teal-300 border-teal-400/30' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
            IA
          </span>
        </div>
        <p className={`text-xs truncate mt-0.5 font-medium ${darkMode ? 'text-teal-300/70' : 'text-gray-500'}`}>
          En línea · Asistente con IA del portal
        </p>
      </div>
    </button>
  )

  useEffect(() => {
    if (!db || !esCorreoApexAmerica(yo)) {
      setCatalogoStickers([])
      return undefined
    }
    return suscribirStickersCatalogo(db, setCatalogoStickers)
  }, [db, yo])

  useEffect(() => {
    if (!db || !esCorreoApexAmerica(yo)) {
      setChats([])
      setCargandoChats(false)
      return undefined
    }
    setCargandoChats(true)
    setErrorChats('')
    return suscribirChats(
      db,
      yo,
      (rows) => {
        // Aviso sonoro: mensaje nuevo en una conversación que NO está abierta
        if (sonidoOn) {
          const previo = chatsLastAtRef.current
          if (previo.size) {
            const hayNovo = rows.some((c) => {
              const actual = c.lastAt?.toMillis?.() || 0
              if (!actual) return false
              if (c.id === chatActivo?.id) return false
              if (c.lastFrom === yo) return false
              const antes = previo.get(c.id) || 0
              return actual > antes
            })
            if (hayNovo) reproducirSonidoMensaje()
          }
        }
        chatsLastAtRef.current = new Map(rows.map((c) => [c.id, c.lastAt?.toMillis?.() || 0]))
        setChats(rows)
        setCargandoChats(false)
      },
      () => {
        setErrorChats('No se pudieron cargar los chats')
        setCargandoChats(false)
      }
    )
  }, [db, yo, reloadKey, sonidoOn, chatActivo?.id])

  useEffect(() => {
    if (!db || !esCorreoApexAmerica(yo)) {
      setContactos([])
      setCargandoContactos(false)
      return undefined
    }
    setCargandoContactos(true)
    setErrorContactos('')
    return suscribirContactosApex(
      db,
      yo,
      (rows) => {
        setContactos(rows)
        setCargandoContactos(false)
      },
      () => {
        setErrorContactos('No se pudieron cargar los contactos')
        setCargandoContactos(false)
      }
    )
  }, [db, yo, reloadKey])

  useEffect(() => {
    if (!db || !chatActivo?.id || chatActivo?.bot) {
      if (!chatActivo?.peer || chatActivo?.bot) {
        setMensajes([])
        setCargandoMsgs(false)
        knownIdsRef.current = new Set()
        prevLenRef.current = 0
        setAnimIds(new Set())
        setNuevosAbajo(0)
      }
      return undefined
    }
    const key = chatActivo.id
    const prevKey = chatMsgKeyRef.current
    const mismaConversacionNueva = !prevKey && Boolean(key)
    if (prevKey !== key) {
      chatMsgKeyRef.current = key
      if (!mismaConversacionNueva) {
        setMensajes([])
        setPendientes([])
        knownIdsRef.current = new Set()
        prevLenRef.current = 0
        setAnimIds(new Set())
        setNuevosAbajo(0)
        stickBottom.current = true
      }
    }
    setCargandoMsgs(true)
    return suscribirMensajes(
      db,
      chatActivo.id,
      (rows) => {
        setMensajes(rows)
        setCargandoMsgs(false)
        // Quitar optimistas ya confirmados por el snapshot
        setPendientes((prev) =>
          prev.filter((p) => {
            return !rows.some(
              (r) =>
                r.from === p.from &&
                r.text === p.text &&
                r.sticker === p.sticker &&
                (r.imageUrl === p.imageUrl || (!!r.imageUrl && !!p.imageUrl))
            )
          })
        )
        const last = rows[rows.length - 1]
        const lastMs = last?.createdAt?.toMillis?.() || Date.now()
        if (last) {
          registrarLecturaChat(db, chatActivo.id, yo, lastMs).then(() => {
            setTickLeidos((n) => n + 1)
          })
        }
      },
      () => {
        setCargandoMsgs(false)
        onToast?.('Error al cargar mensajes')
      }
    )
  }, [db, chatActivo?.id, chatActivo?.peer, onToast, yo])

  const mensajesVista = useMemo(() => {
    const ids = new Set(mensajes.map((m) => m.id))
    const extras = pendientes.filter((p) => !ids.has(p.id))
    return [...mensajes, ...extras]
  }, [mensajes, pendientes])

  const filasMensajes = useMemo(() => {
    const filas = []
    let ultimoDia = ''
    mensajesVista.forEach((m, idx) => {
      const dia = claveDia(m.createdAt)
      if (dia !== ultimoDia) {
        ultimoDia = dia
        filas.push({ tipo: 'dia', id: `dia-${dia}-${idx}`, label: etiquetaDia(m.createdAt) })
      }
      const prev = mensajesVista[idx - 1]
      const mismoGrupo =
        prev &&
        prev.from === m.from &&
        claveDia(prev.createdAt) === dia &&
        Math.abs(millisMsg(m.createdAt) - millisMsg(prev.createdAt)) < 120000
      filas.push({ tipo: 'msg', id: m.id, msg: m, agrupado: Boolean(mismoGrupo) })
    })
    return filas
  }, [mensajesVista])

  useEffect(() => {
    const el = listaRef.current
    if (!el || !chatActivo) return

    const ids = mensajesVista.map((m) => m.id)
    const nuevos = ids.filter((id) => !knownIdsRef.current.has(id))
    const delta = mensajesVista.length - prevLenRef.current
    const primeraCarga = prevLenRef.current === 0 && mensajesVista.length > 0

    if (nuevos.length) {
      nuevos.forEach((id) => knownIdsRef.current.add(id))
      if (!primeraCarga) {
        setAnimIds((prev) => {
          const next = new Set(prev)
          nuevos.forEach((id) => next.add(id))
          return next
        })
        window.setTimeout(() => {
          setAnimIds((prev) => {
            const next = new Set(prev)
            nuevos.forEach((id) => next.delete(id))
            return next
          })
        }, 420)
      }
    }

    const irAlFondo = (smooth) => {
      requestAnimationFrame(() => {
        const node = listaRef.current
        if (!node) return
        if (smooth) {
          node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
        } else {
          node.scrollTop = node.scrollHeight
        }
      })
    }

    if (stickBottom.current || primeraCarga) {
      irAlFondo(!primeraCarga && delta > 0 && delta <= 4)
      setNuevosAbajo(0)
    } else if (nuevos.length) {
      const ajenos = nuevos.filter((id) => {
        const m = mensajesVista.find((x) => x.id === id)
        return m && m.from !== yo && !m.pending
      })
      if (ajenos.length) setNuevosAbajo((n) => n + ajenos.length)
    }

    // Aviso sonoro: mensaje ajeno que acaba de llegar (no cuenta la carga inicial)
    if (!primeraCarga && nuevos.length && sonidoOn) {
      const suenaAja = mensajesVista.some(
        (m) => nuevos.includes(m.id) && m.from !== yo && !m.pending && !m.eliminado
      )
      if (suenaAja) reproducirSonidoMensaje()
    }

    prevLenRef.current = mensajesVista.length
  }, [mensajesVista, chatActivo, yo, sonidoOn])

  useEffect(() => {
    if (chatActivo) {
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [chatActivo?.id, chatActivo?.peer])

  const chatPorPeer = useMemo(() => {
    const map = {}
    chats.forEach((c) => {
      if (c.peer) map[c.peer] = c
    })
    return map
  }, [chats])

  const chatsConActividad = useMemo(
    () => chats.filter((c) => c.lastMessage || chatActivo?.id === c.id),
    [chats, chatActivo?.id]
  )

  const chatsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return chatsConActividad
    return chatsConActividad.filter((c) => {
      const peer = c.peer || ''
      return peer.includes(q) || nombreDesdeEmail(peer).toLowerCase().includes(q)
    })
  }, [chatsConActividad, busqueda])

  const contactosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return contactos
    return contactos.filter(
      (c) => c.email.includes(q) || c.nombre.toLowerCase().includes(q)
    )
  }, [contactos, busqueda])

  const noLeidosTotal = useMemo(() => {
    void tickLeidos
    return chats.filter((c) => chatTieneNoLeidos(c, yo)).length
  }, [chats, yo, tickLeidos])

  const avatarPeer = useCallback(
    (email) => contactos.find((x) => x.email === email)?.avatarUrl || '',
    [contactos]
  )

  const chatActivoMeta = useMemo(() => {
    if (!chatActivo) return null
    if (chatActivo.id) return chats.find((c) => c.id === chatActivo.id) || null
    return chatPorPeer[chatActivo.peer] || null
  }, [chats, chatActivo, chatPorPeer])

  const peerLeidoHasta = useMemo(() => {
    if (!chatActivo?.peer || !chatActivoMeta) return 0
    return lecturaPeerMs(chatActivoMeta, chatActivo.peer)
  }, [chatActivo?.peer, chatActivoMeta])

  const abrirChat = (peer, avatar = '', idExistente = '', isGroup = false, groupName = '') => {
if (isGroup) {
       // Para grupos, usamos directamente el idExistente
       const grupoData = chats.find((c) => c.id === idExistente)
       setChatActivo({
         id: idExistente || '',
         peer: '',
         avatarUrl: avatar,
         imageUrl: grupoData?.imageUrl || '',
         isGroup: true,
         name: groupName || 'Grupo',
       })
     } else {
      const destino = normalizarEmailMessenger(peer)
      if (!esCorreoApexAmerica(destino) || destino === yo) return
      const existente = idExistente || chatPorPeer[destino]?.id || chatIdEntre(yo, destino)
      const tieneChat = Boolean(chatPorPeer[destino]?.id)
      setChatActivo({
        id: tieneChat ? existente : '',
        peer: destino,
        avatarUrl: avatar || avatarPeer(destino),
        isGroup: false,
        name: '',
      })
    }
    setTexto('')
    setPendientes([])
    setMensajes([])
    setAnimIds(new Set())
    setNuevosAbajo(0)
    knownIdsRef.current = new Set()
    prevLenRef.current = 0
    chatMsgKeyRef.current = chatActivo?.id || ''
    setPanelStickers(false)
    if (previewImg?.url) URL.revokeObjectURL(previewImg.url)
    setPreviewImg(null)
    if (chatActivo?.id) {
      registrarLecturaChat(db, chatActivo.id, yo, Date.now()).then(() => {
        setTickLeidos((n) => n + 1)
      })
      setPestana('chats')
    }
    stickBottom.current = true
  }

  const onScrollLista = () => {
    const el = listaRef.current
    if (!el) return
    const cercaFondo = el.scrollHeight - el.scrollTop - el.clientHeight < 96
    stickBottom.current = cercaFondo
    if (cercaFondo) setNuevosAbajo(0)
  }

  const irAUltimoMensaje = () => {
    stickBottom.current = true
    setNuevosAbajo(0)
    const el = listaRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  const adjuntarArchivo = async (file) => {
    if (!file) return
    const err = validarArchivoImagen(file)
    if (err) {
      onToast?.(err)
      return
    }
    try {
      const comprimido = await comprimirImagenParaChat(file)
      if (previewImg?.url) URL.revokeObjectURL(previewImg.url)
      setPreviewImg({ file: comprimido, url: URL.createObjectURL(comprimido) })
      setPanelStickers(false)
    } catch {
      onToast?.('No se pudo preparar la imagen')
    }
  }

  const enviar = async ({ textoOverride, sticker, imagenForzada } = {}) => {
    if (esBotActivo) return
    if ((!chatActivo?.peer && !chatActivo?.isGroup) || enviando) return
    const t = String(textoOverride ?? texto).trim()
    const stick = String(sticker || '').trim()
    const remoteUrl = String(imagenForzada?.remoteUrl || '').trim()
    const archivo = imagenForzada?.file || previewImg?.file || null
    const previewLocal = imagenForzada?.url || previewImg?.url || remoteUrl || ''
    const previewGuardado = imagenForzada?.file
      ? { file: imagenForzada.file, url: imagenForzada.url }
      : archivo
        ? { file: archivo, url: previewLocal }
        : null
    if (!t && !archivo && !stick && !remoteUrl) return
    if (stick && !esStickerUrlValida(stick)) {
      onToast?.('Sticker no válido')
      return
    }
    setEnviando(true)
    setPanelStickers(false)
    const tempId = `local-${Date.now()}`
    stickBottom.current = true
    setPendientes((prev) => [
      ...prev,
      {
        id: tempId,
        from: yo,
        text: t,
        imageUrl: previewLocal,
        sticker: stick,
        createdAt: timestampLocal(),
        pending: true,
      },
    ])
    if (textoOverride === undefined) setTexto('')
    if (!imagenForzada) setPreviewImg(null)

    try {
      let imageUrl = remoteUrl
      if (!imageUrl && archivo) {
        const err = validarArchivoImagen(archivo)
        if (err) throw new Error(err)
        if (typeof subirImagen !== 'function') {
          throw new Error('Subida de imagen no disponible')
        }
        onToast?.('Subiendo imagen…')
        const listo = await comprimirImagenParaChat(archivo)
        imageUrl = await subirImagen(listo)
        if (!imageUrl || !/^https:\/\//i.test(imageUrl)) {
          throw new Error('No se obtuvo un enlace válido de la imagen')
        }
      }
      if (imageUrl && imageUrl.startsWith('http://')) {
        imageUrl = `https://${imageUrl.slice(7)}`
      }
      const res = await enviarMensaje(db, {
        chatId: chatActivo.id || '',
        from: yo,
        to: chatActivo.isGroup ? '' : chatActivo.peer,
        text: t,
        imageUrl,
        sticker: stick,
      })
      if (!chatActivo.id && res.chatId) {
        setChatActivo((prev) => (prev ? { ...prev, id: res.chatId } : prev))
      }
      setPestana('chats')
      setPendientes((prev) => prev.filter((p) => p.id !== tempId))
      if (previewLocal && previewLocal.startsWith('blob:')) URL.revokeObjectURL(previewLocal)
    } catch (err) {
      setPendientes((prev) => prev.filter((p) => p.id !== tempId))
      if (!stick && !remoteUrl) setTexto(t)
      if (previewGuardado?.file && !stick) {
        setPreviewImg({
          file: previewGuardado.file,
          url: previewGuardado.url || URL.createObjectURL(previewGuardado.file),
        })
      } else if (previewLocal && previewLocal.startsWith('blob:')) {
        URL.revokeObjectURL(previewLocal)
      }
      onToast?.(err.message || 'No se pudo enviar')
    } finally {
      setEnviando(false)
      inputRef.current?.focus()
    }
  }

  const enviarSticker = (url) => {
    enviar({ textoOverride: '', sticker: url })
  }

  const enviarGif = (url) => {
    // GIF se envía como imagen https (mismo pipeline que adjuntos)
    enviar({
      textoOverride: '',
      imagenForzada: { file: null, url: '', remoteUrl: url },
    })
  }

  const insertarEmoji = (emoji) => {
    setTexto((prev) => `${prev}${emoji}`)
    inputRef.current?.focus()
  }

  const subirNuevoSticker = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const err = validarArchivoSticker(file)
    if (err) {
      onToast?.(err)
      return
    }
    if (typeof subirImagen !== 'function') {
      onToast?.('Subida no disponible')
      return
    }
    setSubiendoSticker(true)
    try {
      const formato = detectarFormatoArchivo(file)
      // GIF y WebP animado se suben tal cual: pasar por canvas los dejaría
      // congelados en un solo fotograma.
      const animado = esGifAnimado(file) || (await esWebPAnimado(file))
      const listo = animado
        ? file
        : await comprimirImagenParaChat(file, 384, 0.9)
      onToast?.(animado ? 'Subiendo sticker animado…' : 'Subiendo sticker…')
      const url = await subirImagen(listo)
      if (!esStickerUrlRenderizable(url)) {
        throw new Error('No se obtuvo un enlace de imagen válido de i.ibb.co')
      }
      const label =
        String(file.name || '')
          .replace(/\.\w+$/, '')
          .trim()
          .slice(0, 40) || 'Sticker'
      await publicarSticker(db, { url, by: yo, label })
      guardarStickerMioLocal(url, label, formato)
      onToast?.(
        animado
          ? `Sticker animado (${formato.toUpperCase()}) agregado al catálogo`
          : 'Sticker agregado al catálogo'
      )
      setPanelStickers(true)
    } catch (err) {
      onToast?.(err.message || 'No se pudo subir el sticker')
    } finally {
      setSubiendoSticker(false)
    }
  }

  const onPickImage = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    adjuntarArchivo(file)
  }

  const onPaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        adjuntarArchivo(file)
        break
      }
    }
  }

  const abrirModalCrearGrupo = () => {
    setNombreGrupo('')
    setParticipantesSeleccionados([])
    setModalCrearGrupo(true)
  }

  const cerrarModalCrearGrupo = () => {
    setModalCrearGrupo(false)
    setNombreGrupo('')
    setParticipantesSeleccionados([])
  }

  const toggleParticipante = (email) => {
    setParticipantesSeleccionados((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    )
  }

  const confirmarCrearGrupo = async () => {
    if (!nombreGrupo.trim()) {
      onToast?.('Escribe un nombre para el grupo')
      return
    }
    if (participantesSeleccionados.length < 1) {
      onToast?.('Selecciona al menos un participante')
      return
    }
    setCreandoGrupo(true)
    try {
      const chatId = await crearGrupo(db, nombreGrupo, participantesSeleccionados, yo)
      onToast?.('Grupo creado exitosamente')
      cerrarModalCrearGrupo()
      setReloadKey((n) => n + 1)
      // Abrir el chat del grupo creado
      setChatActivo({
        id: chatId,
        peer: '',
        bot: false,
        isGroup: true,
        name: nombreGrupo,
      })
      setPestana('chats')
    } catch (err) {
      onToast?.(err.message || 'No se pudo crear el grupo')
    } finally {
      setCreandoGrupo(false)
    }
  }

  const cambiarImagenGrupo = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const err = validarArchivoImagen(file)
    if (err) { onToast?.(err); return }
    setCambiandoImagenGrupo(true)
    try {
      const comprimido = await comprimirImagenParaChat(file)
      const url = await subirImagen(comprimido)
      if (!url || !/^https:\/\//i.test(url)) throw new Error('No se obtuvo enlace válido de imagen')
      await actualizarImagenGrupo(db, chatActivo.id, url, yo)
      setChatActivo((prev) => (prev ? { ...prev, imageUrl: url } : prev))
      setReloadKey((n) => n + 1)
      onToast?.('Imagen de grupo actualizada')
    } catch (err) {
      onToast?.(err.message || 'No se pudo cambiar la imagen del grupo')
    } finally {
      setCambiandoImagenGrupo(false)
    }
  }

  const manejarLoginGoogle = async () => {
    setLoginError('')
    setEntrando(true)
    try {
      console.log('[MessengerApex] Iniciando login con Google...')
      await entrarConGoogle(auth, db)
      console.log('[MessengerApex] Login exitoso')
    } catch (err) {
      console.error('[MessengerApex] Error en login:', err)
      setLoginError(err?.message || 'No se pudo iniciar sesión con Google')
    } finally {
      setEntrando(false)
    }
  }

  const cerrarSesion = async () => {
    try {
      await salirMessenger(auth)
    } catch {
      /* la sesión local ya se limpió */
    }
  }

  if (cargandoAuth) {
    return (
      <div className={`flex items-center justify-center lg:flex-1 ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
        <RefreshCw size={22} className="animate-spin opacity-60" />
      </div>
    )
  }

  if (!usuarioAuth || !esCorreoApexAmerica(yo) || !correoVerificado) {
    const bloqueado = Boolean(usuarioAuth)
    return (
      <div className={`rounded-2xl border border-white/10 overflow-y-auto ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'} lg:rounded-none lg:border-0 lg:flex-1 lg:h-full lg:min-h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:justify-center`}>
        <div className={`bg-gradient-to-r ${darkMode ? 'from-teal-950 via-[#0f241d] to-[#0c0f0e] border-b border-teal-500/20 text-white' : 'from-gray-50 to-gray-100 border-b border-gray-200 text-gray-900'} px-5 py-8 text-center lg:py-12`}>
          <div className={`w-14 h-14 mx-auto mb-3 rounded-full ${darkMode ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-teal-100 text-teal-600 border border-teal-200'} flex items-center justify-center shadow-lg`}>
            <MessagesSquare size={28} />
          </div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mensajes Apex</h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-teal-200/80' : 'text-gray-600'}`}>Chat interno corporativo</p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="max-w-sm mx-auto space-y-4">
            <p className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {bloqueado
                ? 'Esa cuenta de Google no sirve para Mensajes Apex.'
                : 'Elige con qué cuenta de Google quieres entrar para chatear con el equipo y con Apex IA.'}
            </p>

            {loginError && (
              <p className={`text-xs text-center leading-relaxed ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {loginError}
              </p>
            )}

            <BotonGoogle
              onClick={bloqueado ? cerrarSesion : manejarLoginGoogle}
              entrando={entrando}
              etiquetaAlternativa={bloqueado ? 'Cambiar de cuenta' : ''}
            />

            <p className={`text-[11px] text-center leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Se requiere un correo corporativo verificado por Google y registrado en el portal.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'} flex flex-col h-full max-h-[calc(100dvh-4.25rem)] rounded-none border-0 shadow-none sm:h-[min(44rem,calc(100dvh-9rem))] sm:max-h-none sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl lg:rounded-none lg:border-0 lg:shadow-none lg:flex-1 lg:h-full lg:max-h-none lg:min-h-0 lg:border-t lg:border-white/10`}>
      <div className={`grid lg:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)] xl:grid-cols-[minmax(20rem,28rem)_minmax(0,1fr)] flex-1 min-h-0 h-full max-h-full overflow-hidden items-stretch ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <aside
          className={`${darkMode ? 'bg-[#141414]' : 'bg-white'} flex flex-col border-r border-white/10 min-h-0 h-full max-h-full overflow-hidden ${
            vistaChat ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className={`bg-gradient-to-r ${darkMode ? 'from-teal-950/70 via-[#12221b] to-[#101512] border-b border-teal-500/20' : 'from-gray-50 to-gray-100 border-b border-gray-200'} px-4 pt-4 pb-3 shrink-0`}>
            <div className="flex items-center gap-3 mb-3">
              <AvatarMini email={yo} avatarUrl={avatarUrl} size={40} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mensajes Apex</p>
                <p className={`text-[11px] truncate ${darkMode ? 'text-teal-300/80' : 'text-gray-600'}`}>{yo}</p>
              </div>
              <button
                type="button"
                title="Recargar"
                onClick={() => setReloadKey((n) => n + 1)}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'text-teal-200 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                title="Crear grupo"
                onClick={abrirModalCrearGrupo}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'text-teal-200 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
              >
                <Plus size={16} />
              </button>

              <button
                type="button"
                title="Cerrar sesión"
                onClick={cerrarSesion}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'text-teal-200 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
              >
                <LogOut size={16} />
              </button>
            </div>
            <div className="relative">
              <Search
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-teal-200/50' : 'text-gray-400'}`}
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={pestana === 'contactos' ? 'Buscar contacto...' : 'Buscar chat...'}
                className={`w-full pl-8 pr-4 py-2 rounded-full border text-xs outline-none transition-all ${
                  darkMode
                    ? 'bg-black/40 border-white/10 focus:border-white/30 text-white placeholder:text-gray-400'
                    : 'bg-white border-gray-300 focus:border-gray-500 text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>
          </div>

          <div className={`grid grid-cols-2 ${darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'} border-b border-white/10 shrink-0`}>
            <button
              type="button"
              onClick={() => setPestana('chats')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                pestana === 'chats'
                  ? darkMode ? 'border-teal-400 text-teal-300 bg-gradient-to-br from-teal-500 to-[#0c0f0e]' : 'border-teal-500 text-teal-600 bg-teal-50'
                  : darkMode ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessagesSquare size={14} />
              Chats
              {noLeidosTotal > 0 && (
                <span className="ml-0.5 min-w-[1.15rem] px-1 py-0.5 rounded-full bg-teal-400 text-white text-[10px] font-bold leading-none shadow-xs">
                  {noLeidosTotal}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setPestana('contactos')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                pestana === 'contactos'
                  ? darkMode ? 'border-teal-400 text-teal-300 bg-gradient-to-br from-teal-500 to-[#0c0f0e]' : 'border-teal-500 text-teal-600 bg-teal-50'
                  : darkMode ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={14} />
              Contactos
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${darkMode ? 'bg-teal-500/20 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
                {contactos.length}
              </span>
            </button>
          </div>

          <div className="vtr-msg-scroll flex-1 overflow-y-auto overflow-x-hidden min-h-0 touch-pan-y [-webkit-overflow-scrolling:touch]">
            {coincideBusquedaBot && ContactoBotFijo}
            {pestana === 'chats' ? (
              cargandoChats ? (
                <div className="p-8 flex justify-center text-teal-400">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : errorChats ? (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs text-red-400">{errorChats}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((n) => n + 1)}
                    className={`text-xs font-semibold ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}
                  >
                    Reintentar
                  </button>
                </div>
              ) : chatsFiltrados.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <MessageSquare size={28} className={`mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aún no tienes conversaciones con otros usuarios.</p>
                  <button
                    type="button"
                    onClick={() => setPestana('contactos')}
                    className={`text-xs font-semibold hover:underline ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}
                  >
                    Ver contactos Apex
                  </button>
                </div>
              ) : (
                chatsFiltrados.map((c) => {
                  const activo = chatActivo?.id === c.id
                  const noLeido = chatTieneNoLeidos(c, yo)
                  const esGrupo = c.isGroup === true
                  const nombreChat = esGrupo ? c.name : nombreDesdeEmail(c.peer)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => abrirChat(esGrupo ? '' : c.peer, '', c.id, esGrupo, c.name)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 text-left border-b transition-all ${
                        activo
                          ? darkMode
                            ? 'bg-[#262626] border-l-4 border-l-teal-400 text-white border-b-white/5'
                            : 'bg-teal-50 border-l-4 border-l-teal-500 text-gray-900 border-b-gray-100'
                          : darkMode
                            ? 'hover:bg-white/5 text-gray-300 border-b-white/5'
                            : 'hover:bg-gray-50 text-gray-700 border-b-gray-100'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {esGrupo ? (
                          <span
                            className="overflow-hidden rounded-full bg-teal-500/15 flex items-center justify-center ring-2 ring-teal-400/35 shadow-xs"
                            style={{ width: 48, height: 48 }}
                          >
                            <Users size={20} className="text-teal-400" />
                          </span>
                        ) : (
                          <AvatarMini email={c.peer} avatarUrl={avatarPeer(c.peer)} size={48} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${
                              activo
                                ? ''
                                : noLeido
                                  ? darkMode
                                    ? 'font-bold text-white'
                                    : 'font-bold text-gray-900'
                                  : darkMode
                                    ? 'font-semibold text-gray-200'
                                    : 'font-semibold text-gray-700'
                            }`}
                          >
                            {nombreChat}
                            {esGrupo && (
                              <span className={`ml-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                activo && !darkMode
                                  ? 'bg-teal-200 text-teal-900'
                                  : activo
                                    ? 'bg-teal-500/20 text-teal-300'
                                    : darkMode
                                      ? 'bg-teal-500/20 text-teal-300'
                                      : 'bg-teal-100 text-teal-800'
                              }`}>
                                Grupo
                              </span>
                            )}
                          </p>
                          <span
                            className={`text-[10px] shrink-0 ${
                              noLeido
                                ? darkMode
                                  ? 'text-teal-300 font-semibold'
                                  : 'text-teal-700 font-semibold'
                                : darkMode
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                            }`}
                          >
                            {fechaLista(c.lastAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p
                            className={`text-xs truncate flex-1 flex items-center gap-1 ${
                              noLeido
                                ? darkMode
                                  ? 'text-teal-200 font-medium'
                                  : 'text-teal-700 font-medium'
                                : darkMode
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                            }`}
                          >
                            {!esGrupo && c.lastFrom === yo && (
                              <CheckVerificacion
                                leido={lecturaPeerMs(c, c.peer) >= (c.lastAt?.toMillis?.() || 0)}
                                size={14}
                                className="mr-0.5"
                              />
                            )}
                            <span className="truncate">{c.lastMessage || 'Sin mensajes'}</span>
                          </p>
                          {noLeido && (
                            <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )
            ) : cargandoContactos ? (
              <div className="p-8 flex justify-center text-teal-400">
                <Loader2 size={22} className="animate-spin" />
              </div>
            ) : errorContactos ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-red-400">{errorContactos}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((n) => n + 1)}
                  className={`text-xs font-semibold ${darkMode ? 'text-teal-300' : 'text-teal-700'}`}
                >
                  Reintentar
                </button>
              </div>
            ) : contactosFiltrados.length === 0 ? (
              <p className={`p-6 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {busqueda ? 'Sin resultados' : 'No hay contactos corporativos registrados'}
              </p>
            ) : (
              <>
                {reenviando && (
                  <div className={`px-4 py-2.5 bg-teal-500/10 border-b flex items-center justify-between gap-2 text-xs ${darkMode ? 'border-teal-400/30 text-teal-300' : 'border-teal-200 text-teal-800'}`}>
                    <span className="flex items-center gap-1.5">
                      <CornerUpRight size={13} />
                      Elige a quién reenviar el mensaje
                    </span>
                    <button
                      type="button"
                      onClick={() => setReenviando(null)}
                      className={`transition-colors ${darkMode ? 'hover:text-white' : 'hover:text-teal-900'}`}
                      title="Cancelar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-teal-300/80 bg-[#141414] border-b border-white/5">
                  {contactosFiltrados.length} contacto{contactosFiltrados.length === 1 ? '' : 's'} Apex
                </p>
                {contactosFiltrados.map((c) => {
                  const chat = chatPorPeer[c.email]
                  const noLeido = chat ? chatTieneNoLeidos(chat, yo) : false
                  const activo = chatActivo?.peer === c.email
                  return (
                    <button
                      key={c.email}
                      type="button"
                      onClick={() => {
                        if (reenviando) {
                          reenviarA(c.email)
                        } else {
                          abrirChat(c.email, c.avatarUrl, chat?.id || '')
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left border-b transition-all ${
                        activo
                          ? darkMode
                            ? 'bg-[#262626] border-l-4 border-l-teal-400 text-white border-b-white/5'
                            : 'bg-teal-50 border-l-4 border-l-teal-500 text-gray-900 border-b-gray-100'
                          : reenviando
                            ? darkMode
                              ? 'hover:bg-teal-500/10 text-gray-300 hover:text-white border-b-white/5'
                              : 'hover:bg-teal-50 text-gray-700 hover:text-gray-900 border-b-gray-100'
                            : darkMode
                              ? 'hover:bg-white/5 text-gray-300 border-b-white/5'
                              : 'hover:bg-gray-50 text-gray-700 border-b-gray-100'
                      }`}
                    >
                      <div className="relative">
                        <AvatarMini email={c.email} avatarUrl={c.avatarUrl} size={48} />
                        {noLeido && (
                          <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-400 border-2 ${darkMode ? 'border-[#111714]' : 'border-white'}`} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">
                          {c.nombre}
                        </p>
                        <p className={`text-[11px] truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {chat?.lastMessage ? (
                            <>
                              {chat.lastFrom === yo ? 'Tú: ' : ''}
                              {chat.lastMessage}
                            </>
                          ) : (
                            c.email
                          )}
                        </p>
                      </div>
                      {reenviando && (
                        <CornerUpRight size={16} className="text-teal-400 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </>
            )}
          </div>
        </aside>

        <section
          className={`flex flex-col min-h-0 h-full max-h-full overflow-hidden ${vistaChat ? 'flex' : 'hidden lg:flex'}`}
          style={{
            background: darkMode
              ? 'linear-gradient(165deg, #1a1a1a 0%, #141414 48%, #0a0a0a 100%)'
              : 'linear-gradient(165deg, #f9fafb 0%, #f3f4f6 48%, #f9fafb 100%)',
          }}
        >
          {esBotActivo ? (
            <div className={`flex-1 min-h-0 h-full w-full flex flex-col relative overflow-hidden ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
              <ChatbotAndes
                darkMode={darkMode}
                firebaseApp={firebaseApp || db?.app}
                userAvatarUrl={avatarUrl}
                variante="embebido"
                onCerrar={() => setChatActivo(null)}
              />
            </div>
          ) : !chatActivo ? (
            <div className={`flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#f9fafb]'}`}>
              <div className={`w-16 h-16 rounded-full ${darkMode ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_25px_rgba(45,212,191,0.2)]' : 'bg-teal-100 text-teal-600 border border-teal-200 shadow-md'} flex items-center justify-center`}>
                <MessagesSquare size={32} />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mensajes Apex</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Elige un contacto de la lista para empezar a chatear o inicia una consulta con Apex IA
                </p>
              </div>
              <button
                type="button"
                onClick={abrirBotApex}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                Hablar con Apex IA
              </button>
            </div>
          ) : (
            <>
              <div className={`flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r ${darkMode ? 'from-teal-950/70 via-[#10201a] to-[#0c120f] border-b border-teal-500/20' : 'from-gray-50 to-gray-100 border-b border-gray-200'} backdrop-blur-md shadow-sm shrink-0`}>
                <button
                  type="button"
                  className={`lg:hidden p-1.5 -ml-1 rounded-full transition-colors ${darkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                  onClick={() => setChatActivo(null)}
                  aria-label="Volver"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative shrink-0">
{chatActivo.isGroup ? (
                      <span
                        className="overflow-hidden rounded-full bg-teal-500/15 flex items-center justify-center ring-2 ring-teal-400/35 shadow-xs relative cursor-pointer hover:ring-teal-400/60 transition-all"
                        style={{ width: 40, height: 40 }}
                        onClick={() => groupImageInputRef.current?.click()}
                        title="Cambiar imagen del grupo"
                      >
                        {chatActivo.imageUrl ? (
                          <img src={chatActivo.imageUrl} alt={chatActivo.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={18} className="text-teal-400" />
                        )}
                      </span>
                    ) : (
                    <AvatarMini
                      email={chatActivo.peer}
                      avatarUrl={chatActivo.avatarUrl || avatarPeer(chatActivo.peer)}
                      size={40}
                    />
                  )}
                  {!chatActivo.isGroup && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#1a1a1a]" title="En línea" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {chatActivo.isGroup ? chatActivo.name : nombreDesdeEmail(chatActivo.peer)}
                  </p>
                  <p className={`text-[11px] truncate ${darkMode ? 'text-teal-300/80' : 'text-gray-600'}`}>
                    {chatActivo.isGroup ? 'Grupo' : chatActivo.peer}
                  </p>
                </div>
              </div>

              <div className="relative flex-1 min-h-0 flex flex-col" style={{ backgroundColor: darkMode ? '#0a0a0a' : '#f9fafb' }}>
                <div
                  ref={listaRef}
                  onScroll={onScrollLista}
                  className="vtr-msg-scroll flex-1 overflow-y-auto px-3 sm:px-6 py-4 min-h-0"
                >
                  {cargandoMsgs && mensajesVista.length === 0 && (
                    <div className="vtr-msg-lista-loading space-y-3 py-4 px-1" aria-busy="true">
                      <div className="flex justify-start">
                        <div className="vtr-msg-skel-line w-[58%]" />
                      </div>
                      <div className="flex justify-end">
                        <div className="vtr-msg-skel-line w-[46%]" style={{ animationDelay: '0.12s' }} />
                      </div>
                      <div className="flex justify-start">
                        <div className="vtr-msg-skel-line w-[70%]" style={{ animationDelay: '0.22s' }} />
                      </div>
                      <div className="flex justify-end">
                        <div className="vtr-msg-skel-line w-[40%]" style={{ animationDelay: '0.32s' }} />
                      </div>
                    </div>
                  )}
                  {!cargandoMsgs && mensajesVista.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center animate-in fade-in duration-300">
                      <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
                        <MessageSquare size={22} />
                      </div>
                      <p className="text-xs text-gray-300 max-w-[16rem]">
                        Escribe el primer mensaje para iniciar la conversación con tu compañero
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col">
                    {filasMensajes.map((fila) => {
                      if (fila.tipo === 'dia') {
                        return (
                          <div key={fila.id} className="flex justify-center sticky top-1 z-[1] py-1.5">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md shadow-sm ${
                                darkMode
                                  ? 'bg-white/[0.08] border border-white/10 text-teal-200'
                                  : 'bg-white border border-gray-200 text-gray-600'
                              }`}
                            >
                              {fila.label}
                            </span>
                          </div>
                        )
                      }
                      const m = fila.msg
                      const mio = m.from === yo
                      const esSoloSticker = Boolean(m.sticker) && !m.text && !m.imageUrl && !m.eliminado
                      const entra = animIds.has(m.id)
                      const estaEditando = editandoMsg?.id === m.id
                      const enMenu = menuMsg?.id === m.id
                      return (
                        <div
                          key={m.id}
                          className={`flex ${mio ? 'justify-end' : 'justify-start'} ${
                            fila.agrupado ? 'mt-0.5' : 'mt-2.5'
                          } ${entra ? (mio ? 'vtr-msg-enter-mine' : 'vtr-msg-enter-theirs') : ''} group/msgrow relative`}
                        >
                          {/* Botón de menú contextual que aparece al hover (estilo WhatsApp) */}
                          {!m.pending && !m.eliminado && (
                            <button
                              type="button"
                              aria-label="Opciones del mensaje"
                              onClick={(e) => abrirMenuMsg(e, m, mio)}
                              onContextMenu={(e) => { e.preventDefault(); abrirMenuMsg(e, m, mio) }}
                              className={`self-center shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover/msgrow:opacity-100 focus:opacity-100 ${
                                darkMode
                                  ? `text-gray-400 hover:text-white hover:bg-white/15 ${enMenu ? 'opacity-100 bg-white/15 text-white' : ''}`
                                  : `text-gray-500 hover:text-gray-900 hover:bg-gray-200 ${enMenu ? 'opacity-100 bg-gray-200 text-gray-900' : ''}`
                              } ${mio ? 'order-first mr-1' : 'order-last ml-1'}`}
                              title="Opciones"
                            >
                              <ChevronDown size={14} />
                            </button>
                          )}

                          <div
                            className={`vtr-msg-bubble max-w-[86%] sm:max-w-[63%] ${
                              esSoloSticker
                                ? 'bg-transparent shadow-none px-1 py-0.5'
                                : m.eliminado
                                ? `rounded-2xl px-3.5 py-2 border border-dashed ${
                                      mio
                                      ? darkMode ? 'border-gray-600 bg-gray-800/40' : 'border-gray-300 bg-gray-50'
                                        : darkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'
                                    } ${mio ? 'rounded-br-sm' : 'rounded-bl-sm'}`
                                : `rounded-2xl px-3.5 py-2 backdrop-blur-md transition-all ${
                                    mio
                                      ? darkMode ? 'bg-gradient-to-br from-[#0d9488] to-[#059669] text-white border border-teal-300/30 shadow-[0_4px_16px_rgba(13,148,136,0.3)]' : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white border border-teal-300/30 shadow-[0_4px_16px_rgba(20,184,166,0.3)]'
                                      : darkMode ? 'bg-white/[0.08] text-gray-100 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]' : 'bg-white text-gray-900 border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.1)]'
                                  } rounded-br-sm if ${!mio} rounded-bl-sm`
                            } ${m.pending ? 'vtr-msg-pending' : ''}`}
                            onContextMenu={(e) => { e.preventDefault(); abrirMenuMsg(e, m, mio) }}
                          >
                            {/* Indicador de mensaje reenviado */}
                            {m.reenviadoDe && !m.eliminado && (
                              <p className={`text-[10px] flex items-center gap-1 mb-1 ${mio ? 'text-gray-300' : 'text-gray-400'}`}>
                                <CornerUpRight size={10} />
                                Reenviado
                              </p>
                            )}

                            {/* Mensaje eliminado */}
                            {m.eliminado ? (
                              <p className={`text-[12.5px] italic ${mio ? 'text-gray-300' : darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1.5`}>
                                <Trash2 size={11} />
                                {mio ? 'Eliminaste este mensaje' : 'Mensaje eliminado'}
                              </p>
                            ) : (
                              <>
                                {m.sticker ? (
                                  <span className="relative block w-fit">
                                    <StickerChat
                                      src={m.sticker}
                                      alt="Sticker"
                                      loading="lazy"
                                      onClick={
                                        m.pending
                                          ? undefined
                                          : (e) => {
                                              e.stopPropagation()
                                              e.preventDefault()
                                              abrirModalSticker(m)
                                            }
                                      }
                                      role={m.pending ? undefined : 'button'}
                                      tabIndex={m.pending ? undefined : 0}
                                      onKeyDown={
                                        m.pending
                                          ? undefined
                                          : (e) => {
                                              if (e.key !== 'Enter' && e.key !== ' ') return
                                              e.preventDefault()
                                              abrirModalSticker(m)
                                            }
                                      }
                                      className={`transition-transform duration-300 cursor-zoom-in active:scale-95 ${
                                        esSoloSticker
                                          ? 'w-[7.25rem] h-[7.25rem] sm:w-[8.5rem] sm:h-[8.5rem] drop-shadow-md'
                                          : 'w-12 h-12 mb-1'
                                      } ${entra ? 'scale-95' : 'scale-100'}`}
                                      draggable={false}
                                    />
                                  </span>
                                ) : null}
                                {m.imageUrl ? (
                                  <a
                                    href={m.pending ? undefined : m.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mb-1 overflow-hidden rounded-xl border border-white/10"
                                    onClick={(e) => m.pending && e.preventDefault()}
                                  >
                                    <ImgChat src={m.imageUrl} pending={Boolean(m.pending)} />
                                  </a>
                                ) : null}
                                {/* Modo edición inline */}
                                {estaEditando ? (
                                  <div className="flex flex-col gap-1.5">
                                    <textarea
                                      ref={editInputRef}
                                      value={editandoMsg.texto}
                                      onChange={(e) => setEditandoMsg((prev) => ({ ...prev, texto: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirmarEdicion() }
                                        if (e.key === 'Escape') cancelarEdicion()
                                      }}
                                      rows={2}
                                      className={`w-full resize-none rounded-xl border text-[13px] px-3 py-2 outline-none max-h-32 ${darkMode ? 'border-teal-300/40 bg-black/30 text-white focus:border-teal-400/80 placeholder-gray-500' : 'border-teal-300 bg-white text-gray-900 focus:border-teal-500 placeholder-gray-400'}`}
                                      placeholder="Edita tu mensaje…"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={cancelarEdicion}
                                        className={`text-[11px] px-2 py-1 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={confirmarEdicion}
                                        disabled={!editandoMsg.texto.trim()}
                                        className="text-[11px] font-semibold text-teal-900 bg-teal-300 hover:bg-teal-200 px-3 py-1 rounded-lg transition-colors disabled:opacity-40"
                                      >
                                        Guardar
                                      </button>
                                    </div>
                                  </div>
                                ) : m.text ? (
                                  <p className="text-[13.5px] whitespace-pre-wrap break-words leading-relaxed">
                                    {m.text}
                                  </p>
                                ) : null}
                              </>
                            )}

                            {/* Footer: hora, check, copiado, editado */}
                            <p
                              className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1.5 select-none ${
                                mio ? 'text-gray-300' : darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {m.editado && !m.eliminado && (
                                <span className="opacity-70 italic">editado</span>
                              )}
                              {copiadoId === m.id && (
                                <span className="text-white/90 flex items-center gap-0.5">
                                  <Check size={10} /> copiado
                                </span>
                              )}
                              <span>{horaMsg(m.createdAt)}</span>
                              {mio &&
                                (m.pending ? (
                                  <Loader2 size={11} className="animate-spin opacity-90 text-white/90" title="Enviando…" />
                                ) : (
                                  <CheckVerificacion
                                    leido={mensajeFueLeidoPorPeer(m, peerLeidoHasta)}
                                    size={16}
                                  />
                                ))}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div ref={bottomRef} className="h-1" />

                </div>

                {nuevosAbajo > 0 && (
                  <button
                    type="button"
                    onClick={irAUltimoMensaje}
                    className="vtr-msg-nuevos absolute bottom-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#1f1f1f] text-teal-300 text-xs font-semibold px-3 py-1.5 shadow-xl border border-teal-400/40 hover:bg-[#262626]"
                  >
                    <ChevronDown size={14} />
                    {nuevosAbajo === 1 ? '1 mensaje nuevo' : `${nuevosAbajo} mensajes nuevos`}
                  </button>
                )}
              </div>

              {previewImg?.url && (
                <div className={`px-4 py-2 backdrop-blur-md border-t flex items-center gap-3 shrink-0 ${
                  darkMode ? 'bg-[#141414]/95 border-white/10' : 'bg-white/95 border-gray-200'
                }`}>
                  <div className="relative inline-block">
                    <img
                      src={previewImg.url}
                      alt=""
                      className="h-20 rounded-xl object-cover border border-teal-400/30 shadow-md"
                    />
                    <button
                      type="button"
                      disabled={enviando}
                      onClick={() => {
                        URL.revokeObjectURL(previewImg.url)
                        setPreviewImg(null)
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 disabled:opacity-50"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-teal-200' : 'text-teal-700'}`}>
                    {enviando ? 'Subiendo imagen…' : 'Listo para enviar · Presiona Enter o ➤'}
                  </p>
                </div>
              )}

              <div className="relative shrink-0">
                {panelStickers && (
                  <>
                    <input
                      ref={stickerFileRef}
                      type="file"
                      accept="image/png,image/webp,image/gif,.png,.webp,.gif"
                      className="hidden"
                      onChange={subirNuevoSticker}
                    />
                    <PanelMediaWhatsApp
                      stickers={catalogoStickers}
                      db={db}
                      usuarioEmail={yo}
                      darkMode={darkMode}
                      creandoSticker={subiendoSticker}
                      onInsertEmoji={insertarEmoji}
                      onSendSticker={enviarSticker}
                      onSendGif={enviarGif}
                      onCrearSticker={() => stickerFileRef.current?.click()}
                      onClose={() => setPanelStickers(false)}
                      onToast={onToast}
                    />
                  </>
                )}

                <div
                  className={`p-2.5 sm:p-3 backdrop-blur-md border-t flex items-end gap-2 ${
                    darkMode
                      ? 'bg-[#141414]/95 border-white/10'
                      : 'bg-white/95 border-gray-200'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={onPickImage}
                  />
                  <button
                    type="button"
                    onClick={() => setPanelStickers((v) => !v)}
                    disabled={enviando}
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
                      panelStickers
                        ? darkMode
                          ? 'text-teal-300 bg-teal-500/20'
                          : 'text-teal-700 bg-teal-100'
                        : darkMode
                          ? 'text-gray-300 hover:text-teal-300 hover:bg-white/10'
                          : 'text-gray-500 hover:text-teal-700 hover:bg-gray-100'
                    }`}
                    title="Emojis, GIFs y stickers"
                  >
                    <Smile size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={enviando}
                    className={`shrink-0 w-10 h-10 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 ${
                      darkMode
                        ? 'text-gray-300 hover:text-teal-300 hover:bg-white/10'
                        : 'text-gray-500 hover:text-teal-700 hover:bg-gray-100'
                    }`}
                    title="Enviar imagen"
                  >
                    <ImagePlus size={22} />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onPaste={onPaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        enviar()
                      }
                    }}
                    rows={1}
                    placeholder="Escribe un mensaje..."
                    className={`flex-1 min-w-0 resize-none rounded-full border px-5 py-2.5 text-sm shadow-inner max-h-28 outline-none transition-all ${
                      darkMode
                        ? 'border-white/10 bg-white/[0.06] focus:bg-white/[0.1] focus:border-white/30 text-white placeholder-gray-400'
                        : 'border-gray-300 bg-gray-50 focus:bg-white focus:border-gray-500 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => enviar()}
                    disabled={enviando || (!texto.trim() && !previewImg)}
                    className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white flex items-center justify-center disabled:opacity-35 shadow-[0_0_18px_rgba(45,212,191,0.4)] transition-all cursor-pointer"
                    title="Enviar"
                  >
                    {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ===================== MODAL CREAR GRUPO ===================== */}
      {modalCrearGrupo && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${
              darkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Crear nuevo grupo
              </h3>
              <button
                type="button"
                onClick={cerrarModalCrearGrupo}
                className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'} transition-colors`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre del grupo
                </label>
                <input
                  type="text"
                  value={nombreGrupo}
                  onChange={(e) => setNombreGrupo(e.target.value)}
                  placeholder="Ej: Equipo de ventas"
                  maxLength={80}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    darkMode
                      ? 'bg-white/[0.06] border-white/10 focus:border-teal-400/60 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 focus:border-teal-400 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Participantes ({participantesSeleccionados.length})
                </label>
                <div className={`max-h-48 overflow-y-auto rounded-xl border ${
                  darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-gray-50'
                }`}>
                  {contactos.length === 0 ? (
                    <p className={`p-4 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No hay contactos disponibles
                    </p>
                  ) : (
                    contactos.map((c) => (
                      <button
                        key={c.email}
                        type="button"
                        onClick={() => toggleParticipante(c.email)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-b last:border-b-0 transition-all ${
                          darkMode ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <AvatarMini email={c.email} avatarUrl={c.avatarUrl} size={32} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {c.nombre}
                          </p>
                          <p className={`text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {c.email}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          participantesSeleccionados.includes(c.email)
                            ? darkMode
                              ? 'bg-teal-500 border-teal-500 text-white'
                              : 'bg-teal-500 border-teal-500 text-white'
                            : darkMode
                              ? 'border-gray-600'
                              : 'border-gray-300'
                        }`}>
                          {participantesSeleccionados.includes(c.email) && <Check size={12} />}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 px-5 py-4 border-t ${
              darkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <button
                type="button"
                onClick={cerrarModalCrearGrupo}
                disabled={creandoGrupo}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarCrearGrupo}
                disabled={creandoGrupo || !nombreGrupo.trim() || participantesSeleccionados.length < 1}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(45,212,191,0.35)] disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {creandoGrupo ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Creando...
                  </span>
                ) : (
                  'Crear grupo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ==================================================================== */}

      {/* ===================== MENÚ CONTEXTUAL FLOTANTE ===================== */}
      {menuMsg && (
        <div
          ref={menuRef}
          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: menuMsg.y, left: menuMsg.x }}
        >
          <div className="min-w-[11rem] rounded-2xl overflow-hidden border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.65)] bg-[#1a2520]/95 backdrop-blur-xl text-sm">
            {/* Copiar */}
            {menuMsg.msg.text && (
              <button
                type="button"
                onClick={() => accionCopiar(menuMsg.msg)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                <Copy size={15} className="text-gray-400" />
                Copiar
              </button>
            )}

            {/* Editar — solo mensajes propios con texto */}
            {menuMsg.mio && menuMsg.msg.text && (
              <button
                type="button"
                onClick={() => accionEditar(menuMsg.msg)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                <Edit2 size={15} className="text-blue-400" />
                Editar
              </button>
            )}

            {/* Favorito / Mis stickers — solo si el mensaje lleva un sticker */}
            {menuMsg.msg.sticker && (
              <>
                <button
                  type="button"
                  onClick={() => alternarFavoritoStickerMsg(menuMsg.msg)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <Star
                    size={15}
                    className={esFavoritoSticker(menuMsg.msg.sticker) ? 'text-[#f7c948] fill-[#f7c948]' : 'text-gray-400'}
                  />
                  {esFavoritoSticker(menuMsg.msg.sticker)
                    ? 'Quitar de Favoritos'
                    : 'Agregar a Favoritos'}
                </button>
                <button
                  type="button"
                  onClick={() => guardarStickerMsgEnLosMios(menuMsg.msg)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <Download size={15} className="text-teal-400" />
                  Guardar en Mis Stickers
                </button>
              </>
            )}

            {/* Reenviar */}
            <button
              type="button"
              onClick={() => accionReenviar(menuMsg.msg)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-white/10 hover:text-white transition-colors text-left"
            >
              <CornerUpRight size={15} className="text-teal-400" />
              Reenviar
            </button>

            {/* Eliminar — solo mensajes propios */}
            {menuMsg.mio && (
              <>
                <div className="border-t border-white/10 mx-2" />
                <button
                  type="button"
                  onClick={() => accionEliminar(menuMsg.msg)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                >
                  <Trash2 size={15} />
                  Eliminar mensaje
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL DE STICKER — al tocar el sticker en el chat (como WhatsApp)     */}
      {/* ==================================================================== */}
      {modalSticker && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={cerrarModalSticker}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-[#1c1c1e] border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Sticker ${modalSticker.label}`}
          >
            {/* Cabecera */}
            <div className="flex items-start gap-3 px-4 py-3 border-b border-white/10">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">Sticker</p>
                <p className="text-sm font-medium text-white truncate">{modalSticker.label}</p>
              </div>
              <button
                type="button"
                onClick={cerrarModalSticker}
                aria-label="Cerrar"
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            {/* Vista previa */}
            <div className="flex items-center justify-center p-6 bg-[#121214] min-h-[10rem]">
              <StickerChat
                src={modalSticker.url}
                alt={modalSticker.label}
                className="max-w-[16rem] max-h-[16rem] w-auto h-auto object-contain drop-shadow-lg"
                draggable={false}
              />
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-3 gap-px bg-white/10">
              <button
                type="button"
                onClick={() => alternarFavoritoStickerMsg(modalSticker.msg, false)}
                className="flex flex-col items-center gap-1.5 px-2 py-3.5 bg-[#1c1c1e] hover:bg-white/10 transition-colors"
              >
                <Star
                  size={19}
                  className={
                    esFavoritoSticker(modalSticker.url)
                      ? 'text-[#f7c948] fill-[#f7c948]'
                      : 'text-gray-300'
                  }
                />
                <span className="text-[11px] text-gray-200 leading-tight text-center">
                  {esFavoritoSticker(modalSticker.url) ? 'Quitar' : 'Favoritos'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => guardarStickerMsgEnLosMios(modalSticker.msg, false)}
                className="flex flex-col items-center gap-1.5 px-2 py-3.5 bg-[#1c1c1e] hover:bg-white/10 transition-colors"
              >
                <Download size={19} className="text-teal-400" />
                <span className="text-[11px] text-gray-200 leading-tight text-center">
                  Mis Stickers
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const m = modalSticker.msg
                  setModalSticker(null)
                  accionReenviar(m)
                }}
                className="flex flex-col items-center gap-1.5 px-2 py-3.5 bg-[#1c1c1e] hover:bg-white/10 transition-colors"
              >
                <CornerUpRight size={19} className="text-teal-400" />
                <span className="text-[11px] text-gray-200 leading-tight text-center">
                  Reenviar
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      <input
        ref={groupImageInputRef}
        type="file"
        accept="image/png,image/webp,image/gif,.png,.webp,.gif"
        className="hidden"
        onChange={cambiarImagenGrupo}
      />
      {/* ==================================================================== */}
    </div>
  )
}
