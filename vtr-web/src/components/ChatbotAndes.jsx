import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle, Send, X, User, ExternalLink, ArrowLeft } from 'lucide-react'
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai'
import { getFirestore } from 'firebase/firestore'
import {
  buscarConocimiento,
  formatearContexto,
  respuestaLocal,
  respuestaCasualLocal,
  esCharlaCasual,
  preferirRemateLocal,
  ordenarParaChat,
  alternativasDesdeDocs,
  esConsultaEspecificaCorta,
  esDocNoticia,
  esDocContratacion,
  esDocPlan,
  esDocStreaming,
  imagenesDesdeDocs,
  SYSTEM_PROMPT_HUMANO,
} from '../asistente/conocimientoAndes'
import { cargarConocimientoLive } from '../asistente/conocimientoLive'
import { INDICE_PORTAL_LOCAL } from '../asistente/indicePortal'
import { docsSomosClaveLocales } from '../asistente/contenidosSomosClave'
import {
  detectarCasuistica,
  textoCasuistica,
  resolverOpcionCasuistica,
} from '../asistente/casuisticas'
import {
  saludoInicialAleatorio,
  cargarMensajesGuardados,
  guardarMensajes,
  cargarMemoriaAprendida,
  guardarMemoriaAprendida,
  aprenderDelTurno,
  formatearMemoriaParaPrompt,
  reiniciarChatLocal,
} from '../asistente/chatMemoria'
import {
  cargarMemoriaFirestore,
  guardarMemoriaFirestore,
  registrarAprendizajeTurno,
  cargarEjemplosAprendidos,
  formatearEjemplosParaPrompt,
  textoEsOfensivo,
} from '../asistente/chatAprendizajeLive'
import {
  calcularConfianza,
  registrarTurnoAprendizajeContinuo,
} from '../asistente/aprendizajeContinuo'
import {
  formatearPrincipiosGoogleParaPrompt,
  formatearEjemplosGoogleParaPrompt,
  nutrirEjemplosGoogleAprendizaje,
} from '../asistente/dialogosGoogle'
import {
  formatearCorpusCotidianosParaPrompt,
  nutrirCorpusCotidianosAprendizaje,
  cargarCorpusGen1000,
  cargarCorpusExtra,
} from '../asistente/corpusDialogosCotidianos'
import {
  debeAprenderComoEjemplo,
  formatearFewshotsTonoParaPrompt,
} from '../asistente/entrenamientoApex'
import { nutrirSomosClaveAprendizaje } from '../asistente/conocimientoSomosClave'
import {
  construirFrasesPredictivas,
  filtrarSugerenciasPredictivas,
  sufijoPredictivo,
} from '../asistente/sugerenciasPredictivas'
import '../asistente/chatApex.css'

import {
  MESSENGER_SRC,
  MESSENGER_COLORES,
  avatarImgProps,
  leerHueChatMessenger,
  guardarHueChatMessenger,
  messengerFilterStyle,
  normalizarHue,
} from '../asistente/messengerAvatar'

const APEX_AVATAR = MESSENGER_SRC

function ApexAvatar({ size = 40, className = '', hue = 0 }) {
  const px = typeof size === 'number' ? size : 40
  return (
    <span
      className={`apex-face apex-face--bot ${className}`}
      style={{ width: px, height: px }}
      aria-hidden={className ? undefined : true}
    >
      <img
        src={APEX_AVATAR}
        alt=""
        className="apex-face-messenger"
        style={messengerFilterStyle(hue)}
        draggable={false}
      />
    </span>
  )
}

function UserChatAvatar({ avatar, size = 48 }) {
  const px = typeof size === 'number' ? size : 48
  if (avatar?.isMessenger && avatar.src) {
    return (
      <span className="apex-face apex-face--user" style={{ width: px, height: px }}>
        <img
          src={avatar.src}
          alt=""
          className="apex-face-messenger"
          style={avatar.style}
          draggable={false}
        />
      </span>
    )
  }
  if (avatar?.src) {
    return (
      <img
        src={avatar.src}
        alt=""
        className="apex-face apex-face--photo"
        style={{ width: px, height: px }}
        draggable={false}
      />
    )
  }
  return (
    <span className="apex-face apex-face--fallback" style={{ width: px, height: px }}>
      <User size={Math.round(px * 0.5)} />
    </span>
  )
}

const sugerencias = [
  '¡Hola! ¿Cómo estás?',
  'sin internet',
  'luz roja en el ont',
  'baja de servicio',
  'cómo pido un control remoto',
  '¿Cómo busco un cliente en Andes?',
]

/** Indicador tipo WhatsApp: burbuja con 3 puntos animados */
function EscribiendoDots({ hue = 0 }) {
  return (
    <div className="apex-chat-typing">
      <ApexAvatar size={40} hue={hue} />
      <div className="apex-chat-typing-bubble">
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
        <span className="chat-typing-dot" />
      </div>
    </div>
  )
}

const delayMs = (ms) => new Promise((r) => setTimeout(r, ms))

/** Pausa según largo de la respuesta, como si alguien estuviera tecleando */
function tiempoEscritura(texto, modoHumano) {
  const len = String(texto || '').length
  const base = modoHumano ? 900 : 700
  const porChar = modoHumano ? 18 : 12
  return Math.min(base + len * porChar, modoHumano ? 3200 : 2600)
}

/** Renderiza el mensaje del bot con tipografía, pasos y viñetas agradables */
function MensajeFormateado({ texto, onOpenImage }) {
  const limpio = String(texto || '')
    .replace(/add_circle_outline|record_voice_over|folder_special|receipt/gi, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, '').trim())
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const linkClass =
    'text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200 underline underline-offset-2 break-words font-medium'

  const openImg = (src, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (onOpenImage && src) onOpenImage(src)
  }

  const linkifyPlain = (text, keyBase) => {
    if (!text) return []
    const parts = []
    const urlRe = /(https?:\/\/[^\s<>"'\)\]]+)/gi
    let last = 0
    let m
    let k = 0
    while ((m = urlRe.exec(text)) !== null) {
      if (m.index > last) {
        parts.push(<span key={`${keyBase}-pt${k++}`}>{text.slice(last, m.index)}</span>)
      }
      let url = m[1].replace(/[.,;:!?)]+$/, '')
      const trailing = m[1].slice(url.length)
      const label = url.replace(/^https?:\/\//, '').replace(/^www\./, '')
      parts.push(
        <a
          key={`${keyBase}-u${k++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {label.length > 52 ? `${label.slice(0, 49)}…` : label}
        </a>
      )
      if (trailing) parts.push(<span key={`${keyBase}-tr${k++}`}>{trailing}</span>)
      last = m.index + m[0].length
    }
    if (last < text.length) parts.push(<span key={`${keyBase}-pe`}>{text.slice(last)}</span>)
    return parts
  }

  const renderInline = (chunk, keyBase) => {
    const parts = []
    const re =
      /(\!\[[^\]]*\]\((https?:[^)\s]+|\/[^)\s]+)\)|\*\*(.+?)\*\*|__(.+?)__|_(.+?)_|\[([^\]]+)\]\((https?:[^)\s]+)\))/g
    let last = 0
    let m
    let k = 0
    while ((m = re.exec(chunk)) !== null) {
      if (m.index > last) parts.push(...linkifyPlain(chunk.slice(last, m.index), `${keyBase}-b${k++}`))
      if (m[0].startsWith('![')) {
        const src = m[2]
        parts.push(
          <button
            key={`${keyBase}-im${k++}`}
            type="button"
            className="apex-chat-img-btn"
            onClick={(e) => openImg(src, e)}
          >
            <img src={src} alt="" className="apex-chat-img" loading="lazy" />
          </button>
        )
      } else if (m[3] || m[4]) {
        const boldText = m[3] || m[4]
        parts.push(
          <strong key={`${keyBase}-bo${k++}`} className="font-semibold text-gray-900 dark:text-white">
            {linkifyPlain(boldText, `${keyBase}-boinner${k}`)}
          </strong>
        )
      } else if (m[5]) {
        parts.push(
          <em key={`${keyBase}-i${k++}`} className="text-gray-700 dark:text-white/85">
            {linkifyPlain(m[5], `${keyBase}-iinner${k}`)}
          </em>
        )
      } else if (m[6] && m[7]) {
        parts.push(
          <a
            key={`${keyBase}-md${k++}`}
            href={m[7]}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {m[6]}
          </a>
        )
      }
      last = m.index + m[0].length
    }
    if (last < chunk.length) parts.push(...linkifyPlain(chunk.slice(last), `${keyBase}-r`))
    return parts.length ? parts : chunk
  }

  const lineas = limpio.split('\n')
  const bloques = []
  let listaActual = null

  const flushLista = () => {
    if (listaActual) {
      bloques.push(listaActual)
      listaActual = null
    }
  }

  const esUrlImagen = (t) =>
    /^(https?:\/\/|\/)[^\s]+\.(png|jpe?g|gif|webp|svg)(\?[^\s]*)?$/i.test(t) ||
    /^\/sc-assets\/[^\s]+$/i.test(t)

  lineas.forEach((linea, i) => {
    const t = linea.trim()
    if (!t) {
      flushLista()
      bloques.push({ tipo: 'gap', key: `g${i}` })
      return
    }

    const mdImg = t.match(/^!\[([^\]]*)\]\((https?:[^)\s]+|\/[^)\s]+)\)$/)
    if (mdImg || esUrlImagen(t)) {
      flushLista()
      bloques.push({ tipo: 'img', src: mdImg ? mdImg[2] : t, key: `img${i}` })
      return
    }

    const num = t.match(/^(\d+)[\.)]\s+(.*)$/)
    const vin = t.match(/^([•\-\*▪▸►])\s+(.*)$/)
    const soloNegrita = /^\*\*(.+)\*\*$/.test(t) && t.length < 120
    const seccionMayus = /^[A-ZÁÉÍÓÚÑ0-9][A-ZÁÉÍÓÚÑ0-9\s\/\-]{2,60}$/.test(t) && !num

    if (num) {
      flushLista()
      bloques.push({ tipo: 'paso', n: num[1], texto: num[2], key: `p${i}` })
      return
    }
    if (vin) {
      if (!listaActual) listaActual = { tipo: 'lista', items: [], key: `l${i}` }
      listaActual.items.push({ texto: vin[2], key: `li${i}` })
      return
    }
    flushLista()
    if (soloNegrita || seccionMayus) {
      const titulo = soloNegrita ? t.replace(/^\*\*(.+)\*\*$/, '$1') : t
      bloques.push({ tipo: 'titulo', texto: titulo, key: `h${i}` })
      return
    }
    bloques.push({ tipo: 'p', texto: t, key: `t${i}` })
  })
  flushLista()

  return (
    <div className="space-y-2.5 text-[13px] leading-relaxed text-gray-800 dark:text-white/90">
      {bloques.map((b) => {
        if (b.tipo === 'gap') return <div key={b.key} className="h-1" />
        if (b.tipo === 'img') {
          return (
            <button
              key={b.key}
              type="button"
              className="apex-chat-img-btn"
              onClick={(e) => openImg(b.src, e)}
            >
              <img src={b.src} alt="" className="apex-chat-img" loading="lazy" />
            </button>
          )
        }
        if (b.tipo === 'titulo') {
          return (
            <p
              key={b.key}
              className="m-0 font-semibold text-[13px] text-gray-900 dark:text-white tracking-tight border-l-2 border-teal-600/70 dark:border-teal-400/70 pl-2.5"
            >
              {b.texto}
            </p>
          )
        }
        if (b.tipo === 'paso') {
          return (
            <div key={b.key} className="flex gap-2.5 items-start">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-teal-500/20 border border-teal-600/30 text-teal-800 dark:bg-teal-500/25 dark:border-teal-400/40 dark:text-teal-200 text-[10px] font-bold flex items-center justify-center">
                {b.n}
              </span>
              <span className="min-w-0 pt-0.5">{renderInline(b.texto, b.key)}</span>
            </div>
          )
        }
        if (b.tipo === 'lista') {
          return (
            <ul key={b.key} className="m-0 pl-0 list-none space-y-1.5">
              {b.items.map((item) => (
                <li key={item.key} className="flex gap-2.5 items-start">
                  <span className="shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full bg-teal-400/90 shadow-[0_0_0_3px_rgba(45,212,191,0.15)]" />
                  <span className="min-w-0">{renderInline(item.texto, item.key)}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={b.key} className="m-0 text-gray-700 dark:text-white/80">
            {renderInline(b.texto, b.key)}
          </p>
        )
      })}
    </div>
  )
}


export default function ChatbotAndes({
  firebaseApp,
  userAvatarUrl = '',
  variante = 'flotante',
  oculto = false,
  onCerrar,
}) {
  const embebido = variante === 'embebido'
  const [abierto, setAbierto] = useState(embebido)
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState('')
  const [predIdx, setPredIdx] = useState(0)
  const [messengerHue, setMessengerHue] = useState(() =>
    typeof window !== 'undefined' ? leerHueChatMessenger() : 0
  )
  const [pickerColor, setPickerColor] = useState(false)
  const [bancoFrases, setBancoFrases] = useState(() => construirFrasesPredictivas(INDICE_PORTAL_LOCAL))
  const [mensajes, setMensajes] = useState(() => {
    const guardados = typeof window !== 'undefined' ? cargarMensajesGuardados() : null
    if (guardados?.length) return guardados
    return [{ rol: 'bot', texto: saludoInicialAleatorio() }]
  })
  const [memoria, setMemoria] = useState(() =>
    typeof window !== 'undefined' ? cargarMemoriaAprendida() : []
  )
  const finRef = useRef(null)
  const modelRef = useRef(null)
  const chatRef = useRef(null)
  const corpusRef = useRef(INDICE_PORTAL_LOCAL)
  const casuisticaRef = useRef(null)
  const memoriaRef = useRef(memoria)
  const dbRef = useRef(null)
  const ejemplosRef = useRef([])
  const inputRef = useRef(null)
  const colorPickerRef = useRef(null)

  const userAvatar = useMemo(() => avatarImgProps(userAvatarUrl, { fallbackMessenger: false }), [userAvatarUrl])

  const elegirColorMessenger = (hue) => {
    const h = normalizarHue(hue)
    setMessengerHue(h)
    guardarHueChatMessenger(h)
    setPickerColor(false)
  }

  useEffect(() => {
    if (!pickerColor) return
    const cerrar = (e) => {
      if (!colorPickerRef.current?.contains(e.target)) setPickerColor(false)
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [pickerColor])

  const predicciones = useMemo(
    () => filtrarSugerenciasPredictivas(input, bancoFrases, 8),
    [input, bancoFrases]
  )
  const predActiva = predicciones[Math.min(predIdx, Math.max(0, predicciones.length - 1))] || ''
  const ghostSufijo = sufijoPredictivo(input, predActiva)

  useEffect(() => {
    if (!lightboxSrc) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxSrc('')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxSrc])

  useEffect(() => {
    memoriaRef.current = memoria
  }, [memoria])

  useEffect(() => {
    if (embebido) setAbierto(true)
  }, [embebido])

  useEffect(() => {
    if (oculto && !embebido) {
      setAbierto(false)
    }
  }, [oculto, embebido])

  useEffect(() => {
    if (abierto) finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, abierto, cargando])

  useEffect(() => {
    guardarMensajes(mensajes)
  }, [mensajes])

  useEffect(() => {
    if (!firebaseApp) return undefined
    let cancel = false
    const db = getFirestore(firebaseApp)
    dbRef.current = db
    Promise.all([cargarConocimientoLive(db), docsSomosClaveLocales().catch(() => [])]).then(
      ([docs, scDocs]) => {
        if (cancel) return
        const porId = new Map((docs?.length ? docs : INDICE_PORTAL_LOCAL).map((d) => [d.id, d]))
        for (const d of scDocs || []) {
          // Preferir copia local fresca de Somos Clave
          porId.set(d.id, d)
        }
        corpusRef.current = Array.from(porId.values())
        setBancoFrases(construirFrasesPredictivas(corpusRef.current))
      }
    )
    Promise.all([
      cargarMemoriaFirestore(db, cargarMemoriaAprendida()),
      cargarEjemplosAprendidos(db, 12),
    ]).then(([memFs, ejemplos]) => {
      if (cancel) return
      if (memFs?.length) {
        memoriaRef.current = memFs
        setMemoria(memFs)
        guardarMemoriaAprendida(memFs)
      }
      ejemplosRef.current = ejemplos || []
    })
    // Cargar corpus extendido (05–10 + gen1000) en memoria
    Promise.all([cargarCorpusExtra(), cargarCorpusGen1000()]).catch(() => {})
    // Re-nutrir tono (Google + evasión + Somos Clave) cuando cambia la versión
    try {
      if (!localStorage.getItem('vtr-apex-entrenamiento-v3-sc')) {
        Promise.all([
          nutrirEjemplosGoogleAprendizaje(db),
          nutrirCorpusCotidianosAprendizaje(db, { limite: 400, incluirGen1000: false }),
          docsSomosClaveLocales()
            .then((sc) => nutrirSomosClaveAprendizaje(db, sc, { limite: 200 }))
            .catch(() => ({ ejemplos: 0 })),
        ])
          .then(() => {
            localStorage.setItem('vtr-apex-entrenamiento-v3-sc', '1')
            localStorage.setItem('vtr-apex-entrenamiento-v2', '1')
            localStorage.setItem('vtr-apex-google-dialogos-v1', '1')
            localStorage.setItem('vtr-apex-corpus-cotidiano-v16', '1')
            return cargarEjemplosAprendidos(db, 12)
          })
          .then((ej) => {
            if (!cancel && ej?.length) ejemplosRef.current = ej
          })
          .catch(() => {})
      } else if (!localStorage.getItem('vtr-apex-entrenamiento-v2')) {
        Promise.all([
          nutrirEjemplosGoogleAprendizaje(db),
          nutrirCorpusCotidianosAprendizaje(db, { limite: 400, incluirGen1000: false }),
        ])
          .then(() => {
            localStorage.setItem('vtr-apex-entrenamiento-v2', '1')
            localStorage.setItem('vtr-apex-google-dialogos-v1', '1')
            localStorage.setItem('vtr-apex-corpus-cotidiano-v16', '1')
            return cargarEjemplosAprendidos(db, 12)
          })
          .then((ej) => {
            if (!cancel && ej?.length) ejemplosRef.current = ej
          })
          .catch(() => {})
      } else if (!localStorage.getItem('vtr-apex-corpus-cotidiano-v16')) {
        Promise.all([
          nutrirEjemplosGoogleAprendizaje(db),
          nutrirCorpusCotidianosAprendizaje(db, { limite: 1600, incluirGen1000: false }),
        ])
          .then(() => {
            localStorage.setItem('vtr-apex-google-dialogos-v1', '1')
            localStorage.setItem('vtr-apex-corpus-cotidiano-v16', '1')
            return cargarEjemplosAprendidos(db, 16)
          })
          .then((ej) => {
            if (!cancel && ej?.length) ejemplosRef.current = ej
          })
          .catch(() => {})
      } else if (!localStorage.getItem('vtr-apex-google-dialogos-v1')) {
        nutrirEjemplosGoogleAprendizaje(db)
          .then(() => {
            localStorage.setItem('vtr-apex-google-dialogos-v1', '1')
            return cargarEjemplosAprendidos(db, 12)
          })
          .then((ej) => {
            if (!cancel && ej?.length) ejemplosRef.current = ej
          })
          .catch(() => {})
      }
    } catch {
      // ignore
    }
    return () => {
      cancel = true
    }
  }, [firebaseApp])

  const contextoAprendido = () =>
    formatearPrincipiosGoogleParaPrompt() +
    formatearFewshotsTonoParaPrompt(4) +
    // Un solo diálogo corto: estilo, no scripts que Gemini copie
    formatearCorpusCotidianosParaPrompt(1, 6) +
    formatearMemoriaParaPrompt(memoriaRef.current) +
    formatearEjemplosGoogleParaPrompt(4) +
    formatearEjemplosParaPrompt(ejemplosRef.current)

  const obtenerModelo = () => {
    if (!firebaseApp) return null
    if (modelRef.current) return modelRef.current
    try {
      const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() })
      modelRef.current = getGenerativeModel(ai, {
        model: 'gemini-3.7-flash',
        generationConfig: {
          temperature: 0.95,
          topP: 0.92,
          maxOutputTokens: 1024,
        },
      })
    } catch {
      modelRef.current = null
    }
    return modelRef.current
  }

  /** Chat con historial + memoria Firestore + ejemplos aprendidos */
  const obtenerChat = (historialUI = []) => {
    if (!firebaseApp) return null
    try {
      const model = obtenerModelo()
      if (!model) return null
      const system = SYSTEM_PROMPT_HUMANO + contextoAprendido()
      const hist = historialParaGemini(historialUI)
      chatRef.current = model.startChat({
        history: [
          { role: 'user', parts: [{ text: system }] },
          {
            role: 'model',
            parts: [
              {
                text: 'Entendido. Recuerdo lo aprendido, respondo siempre con respeto y en base a lo que me digas.',
              },
            ],
          },
          ...hist,
        ],
      })
    } catch {
      chatRef.current = null
    }
    return chatRef.current
  }

  const historialParaGemini = (historial = []) => {
    const alternado = []
    for (const mensaje of historial.filter(
      (m) => m.texto && (m.rol === 'user' || m.rol === 'bot')
    )) {
      const role = mensaje.rol === 'user' ? 'user' : 'model'
      // El saludo inicial del bot no tiene una pregunta asociada y rompe la
      // alternancia user/model que exige Gemini.
      if (!alternado.length && role === 'model') continue

      const anterior = alternado[alternado.length - 1]
      if (anterior?.role === role) {
        anterior.parts[0].text = `${anterior.parts[0].text}\n${mensaje.texto}`
      } else {
        alternado.push({ role, parts: [{ text: mensaje.texto }] })
      }
    }
    return alternado.slice(-20)
  }

  const nuevaConversacion = () => {
    chatRef.current = null
    reiniciarChatLocal()
    setMensajes([{ rol: 'bot', texto: saludoInicialAleatorio() }])
    casuisticaRef.current = null
  }

  const enviar = async (textoLibre, { omitirResolucionCasuistica = false } = {}) => {
    const escrito = (textoLibre ?? input).trim()
    if (!escrito || cargando) return

    let pregunta = escrito
    const resuelta = omitirResolucionCasuistica
      ? null
      : resolverOpcionCasuistica(pregunta, casuisticaRef.current)
    if (resuelta) {
      pregunta = resuelta
      casuisticaRef.current = null
    }

    setInput('')
    setPredIdx(0)
    const historialPrevio = mensajes
    const memoriaNueva = aprenderDelTurno(escrito, historialPrevio, memoriaRef.current)
    memoriaRef.current = memoriaNueva
    setMemoria(memoriaNueva)
    guardarMemoriaAprendida(memoriaNueva)
    if (dbRef.current) {
      guardarMemoriaFirestore(dbRef.current, memoriaNueva)
    }

    // La burbuja del usuario siempre conserva exactamente lo que escribió.
    // `pregunta` puede ser una intención interna expandida por una sugerencia.
    setMensajes((m) => [...m, { rol: 'user', texto: escrito }])
    setCargando(true)
    const inicio = Date.now()

    // Ambiguo ("rut", "cliente") → menú de casuísticas, sin volcar guía
    const casu = !resuelta ? detectarCasuistica(pregunta) : null
    if (casu) {
      casuisticaRef.current = casu
      const textoFinal = textoCasuistica(casu)
      const faltante = tiempoEscritura(textoFinal, true) - (Date.now() - inicio)
      if (faltante > 0) await delayMs(faltante)
      setMensajes((m) => [
        ...m,
        {
          rol: 'bot',
          texto: textoFinal,
          alternativas: casu.opciones,
        },
      ])
      setCargando(false)
      return
    }

    casuisticaRef.current = null

    const charla = esCharlaCasual(pregunta)
    const docs = charla ? [] : buscarConocimiento(pregunta, 8, corpusRef.current)
    const scoreTop = docs[0]?.score || 0
    const topSc = docs[0]?.tipo === 'somosclave' || String(docs[0]?.id || '').startsWith('sc-')
    // Umbral más bajo si ya pegó un artículo Somos Clave (preguntas cortas tipo "hbo")
    const conGuia = !charla && (scoreTop >= 6 || (topSc && scoreTop >= 4))
    const alternativas = !charla && docs.length
      ? alternativasDesdeDocs(docs, pregunta, 4)
      : []
    const contexto = conGuia ? formatearContexto(docs) : ''
    const recientesBot = historialPrevio
      .filter((m) => m.rol === 'bot' && m.texto)
      .slice(-5)
      .map((m) => m.texto)

    // Varias coincidencias sin un claro ganador → menú de opciones
    const empate =
      !charla &&
      !conGuia &&
      docs.length >= 2 &&
      scoreTop >= 3 &&
      (docs[1]?.score || 0) >= scoreTop * 0.75

    const sinEvidencia = !charla && !conGuia && !empate
    let respuesta = empate
      ? 'Encontré varias publicaciones relacionadas con lo que preguntas. Elige una opción o escribe el título:'
      : conGuia
        ? respuestaLocal(pregunta, docs)
        : sinEvidencia
          ? respuestaLocal(pregunta, [])
          : respuestaCasualLocal(pregunta, { recientes: recientesBot })
    let fuentes = conGuia || empate ? docs.filter((d) => d.enlace || d.seccionPortal).slice(0, 4) : []
    const alternativasMsg = empate
      ? docs.slice(0, 5).map((d) => ({
          label: String(d.titulo || d.nombre || d.id).slice(0, 78),
          pregunta: String(d.titulo || d.nombre || ''),
        }))
      : alternativas
    const imagenesMsg =
      conGuia || empate
        ? imagenesDesdeDocs(docs, {
            limite: esDocContratacion(docs[0])
              ? 8
              : esDocPlan(docs[0]) || esDocStreaming(docs[0])
                ? 6
                : esDocNoticia(docs[0])
                  ? 4
                  : 6,
            corta: esConsultaEspecificaCorta(pregunta) || esDocNoticia(docs[0]),
          })
        : []

    try {
      const model = obtenerModelo()
      if (model) {
        const aprendidoTxt = contextoAprendido()
        const topNoticia = esDocNoticia(docs[0])
        const topContratacion = esDocContratacion(docs[0])
        const topPlanStream = esDocPlan(docs[0]) || esDocStreaming(docs[0])
        const respuestaCortaLocal =
          conGuia &&
          !empate &&
          (esConsultaEspecificaCorta(pregunta) ||
            docs[0]?.tipo === 'micro' ||
            scoreTop >= 20 ||
            topNoticia ||
            topContratacion ||
            topPlanStream)
        // Conservar prosa/guía local + miniaturas. No dejar que Gemini mezcle otros docs.
        if (conGuia && !empate && !respuestaCortaLocal) {
          const chat = obtenerChat(historialPrevio)
          if (chat) {
            const soloMicro = docs[0]?.tipo === 'micro'
            const result = await chat.sendMessage(
              `${pregunta}\n\n---\nNotas internas (úsalas con naturalidad; ${
                soloMicro
                  ? 'responde SOLO este paso, completo y claro'
                  : 'responde el procedimiento COMPLETO: todos los pasos relevantes en orden, sin cortar a mitad ni resumir de más. Sé claro, humano y respetuoso. Usa numeración 1. 2. 3. para pasos; no uses viñetas sueltas para el objetivo'
              }). Responde SOLO al tema de la pregunta del usuario (no mezcles LOS/ONT con streaming, ni precios con elegibilidad, ni otros procedimientos). No listes «otras opciones relacionadas» ni menús numerados al final: eso ya aparece como botones en la interfaz.\n${contexto}`
            )
            const texto = result?.response?.text?.() || ''
            if (texto.trim()) respuesta = ordenarParaChat(texto.trim())
          }
        } else if (!empate && !respuestaCortaLocal && !sinEvidencia) {
          const antiEco =
            recientesBot.length > 0
              ? `\n\nNo repitas estas aperturas/cierres que ya usaste:\n- ${recientesBot
                  .map((t) => t.split('\n')[0].slice(0, 80))
                  .join('\n- ')}`
              : ''
          const session = model.startChat({
            history: [
              {
                role: 'user',
                parts: [
                  {
                    text:
                      SYSTEM_PROMPT_HUMANO +
                      aprendidoTxt +
                      antiEco +
                      '\nResponde pensando en lo que el usuario acaba de decir y en el hilo previo. Nunca insultes.',
                  },
                ],
              },
              {
                role: 'model',
                parts: [
                  {
                    text: 'Perfecto. Uso lo aprendido, respondo con respeto y en base a lo que me digas.',
                  },
                ],
              },
              ...historialParaGemini(historialPrevio),
            ],
          })
          const result = await session.sendMessage(
            charla
              ? `${pregunta}\n\n(Responde como IA conversacional inteligente, no como bot de menús ni plantillas: lee el historial, formula una respuesta nueva y natural para ESTE mensaje. Breve, con criterio y personalidad; sin frases hechas repetidas ni “¿en qué te ayudo?”.)`
              : pregunta
          )
          const texto = result?.response?.text?.() || ''
          // Charla y casi todo lo demás: priorizar Gemini. Local solo si Gemini no contestó.
          if (texto.trim()) {
            if (charla || !preferirRemateLocal(pregunta)) respuesta = texto.trim()
          }
        }
      }
    } catch {
      // Fallback local (respuesta casual)
    }

    // Nunca publicar respuesta ofensiva (fallback de seguridad)
    if (textoEsOfensivo(respuesta)) {
      respuesta =
        'Prefiero mantener el buen trato. Dime con calma qué necesitas y te ayudo.'
    }

    const textoFinal =
      (conGuia &&
        (esConsultaEspecificaCorta(pregunta) ||
          esDocNoticia(docs[0]) ||
          esDocContratacion(docs[0]) ||
          esDocPlan(docs[0]) ||
          esDocStreaming(docs[0]))) ||
      empate
        ? respuesta
        : conGuia
          ? ordenarParaChat(respuesta)
          : respuesta
    const faltante = tiempoEscritura(textoFinal, !conGuia && !empate) - (Date.now() - inicio)
    if (faltante > 0) await delayMs(faltante)

    setMensajes((m) => [
      ...m,
      {
        rol: 'bot',
        texto: textoFinal,
        fuentes,
        ...(alternativasMsg.length ? { alternativas: alternativasMsg } : {}),
        ...(imagenesMsg.length ? { imagenes: imagenesMsg } : {}),
      },
    ])
    setCargando(false)

    // Alimentar Firestore solo con turnos entrenables (hechos/charla útil)
    if (dbRef.current && !textoEsOfensivo(escrito) && !textoEsOfensivo(textoFinal)) {
      const tema =
        conGuia || empate ? docs[0]?.categoria || docs[0]?.titulo || 'portal' : 'charla'
      if (
        debeAprenderComoEjemplo({
          pregunta: escrito,
          respuesta: textoFinal,
          tema,
          charla,
          conGuia,
        })
      ) {
        registrarAprendizajeTurno(dbRef.current, {
          pregunta: escrito,
          respuesta: textoFinal,
          tema,
          charla,
          conGuia,
        }).then((ok) => {
          if (!ok || !dbRef.current) return
          cargarEjemplosAprendidos(dbRef.current, 6).then((ej) => {
            ejemplosRef.current = ej || []
          })
        })
      }

      // Aprendizaje continuo: log + candidatos si tip con baja confianza (charla no crea candidatos)
      const confidence = calcularConfianza({
        charla,
        conGuia,
        empate,
        scoreTop,
        docs,
      })
      registrarTurnoAprendizajeContinuo(dbRef.current, {
        pregunta: escrito,
        respuesta: textoFinal,
        confidence,
        conGuia,
        empate,
        charla,
        docs,
        scoreTop,
      }).catch(() => {})
    }
  }

  useEffect(() => {
    setPredIdx(0)
  }, [input])

  const aceptarPrediccion = (frase, { consultar = false } = {}) => {
    const t = String(frase || predActiva || '').trim()
    if (!t) return
    if (consultar) {
      setInput('')
      setPredIdx(0)
      enviar(t)
      return
    }
    setInput(t)
    setPredIdx(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const onKeyDown = (e) => {
    if (predicciones.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setPredIdx((i) => {
        if (e.key === 'ArrowDown') return (i + 1) % predicciones.length
        return (i - 1 + predicciones.length) % predicciones.length
      })
      return
    }
    if (e.key === 'Tab' && predActiva) {
      e.preventDefault()
      aceptarPrediccion(predActiva)
      return
    }
    if (e.key === 'ArrowRight' && ghostSufijo && inputRef.current) {
      const el = inputRef.current
      const atEnd = el.selectionStart === el.value.length && el.selectionEnd === el.value.length
      if (atEnd) {
        e.preventDefault()
        aceptarPrediccion(predActiva)
        return
      }
    }
    if (e.key === 'Escape' && predicciones.length) {
      setPredIdx(0)
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const escrito = input.trim()
      const completar =
        predActiva &&
        escrito.length >= 3 &&
        escrito.length < predActiva.length
      enviar(completar ? predActiva : undefined)
    }
  }

  if (oculto && !embebido) return null

  const cerrarPanel = () => {
    if (embebido) {
      onCerrar?.()
      return
    }
    setAbierto(false)
  }

  return (
    <>
      {!embebido && !abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="apex-chat-fab"
          title="Chat Apex"
          aria-label="Abrir chat"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {(embebido || abierto) && (
        <div
          className={`apex-chat-panel${embebido ? ' apex-chat-panel--embebido' : ''}`}
          role="dialog"
          aria-label="Chat Apex"
        >
          <div className="apex-chat-header">
            <div className="apex-chat-brand">
              {embebido && (
                <button
                  type="button"
                  onClick={cerrarPanel}
                  className="apex-chat-btn-icon lg:hidden -ml-1 mr-0.5"
                  aria-label="Volver a chats"
                  title="Volver"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="apex-chat-avatar-wrap relative" ref={colorPickerRef}>
                <button
                  type="button"
                  className="apex-chat-avatar-btn"
                  title="Cambiar color del avatar"
                  aria-label="Cambiar color del avatar Messenger"
                  aria-expanded={pickerColor}
                  onClick={() => setPickerColor((v) => !v)}
                >
                  <ApexAvatar size={46} hue={messengerHue} />
                </button>
                {pickerColor && (
                  <div className="apex-chat-color-picker" role="listbox" aria-label="Color Messenger">
                    <p className="apex-chat-color-picker-title">Color del avatar</p>
                    <div className="apex-chat-color-grid">
                      {MESSENGER_COLORES.map((c) => (
                        <button
                          key={c.hue}
                          type="button"
                          role="option"
                          aria-selected={messengerHue === c.hue}
                          title={c.label}
                          className={`apex-chat-color-swatch ${messengerHue === c.hue ? 'is-active' : ''}`}
                          onClick={() => elegirColorMessenger(c.hue)}
                        >
                          <span className="apex-face apex-face--bot apex-face--swatch">
                            <img
                              src={MESSENGER_SRC}
                              alt=""
                              className="apex-face-messenger"
                              style={messengerFilterStyle(c.hue)}
                              draggable={false}
                            />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="apex-chat-title">Apex</p>
                <p className="apex-chat-sub">En línea · IA conversacional</p>
              </div>
            </div>
            <div className="apex-chat-actions">
              <button
                type="button"
                onClick={nuevaConversacion}
                className="apex-chat-btn-ghost"
                title="Nueva conversación (mantiene lo aprendido)"
              >
                Nuevo
              </button>
              <button
                type="button"
                onClick={cerrarPanel}
                className="apex-chat-btn-icon"
                aria-label={embebido ? 'Volver' : 'Cerrar'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="apex-chat-messages">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`apex-chat-row ${msg.rol === 'user' ? 'apex-chat-row--user' : 'apex-chat-row--bot'}`}
              >
                {msg.rol === 'bot' && <ApexAvatar size={40} hue={messengerHue} />}
                <div
                  className={`apex-chat-bubble ${
                    msg.rol === 'user' ? 'apex-chat-bubble--user' : 'apex-chat-bubble--bot'
                  }`}
                >
                  {msg.rol === 'bot' ? (
                    <MensajeFormateado texto={msg.texto} onOpenImage={setLightboxSrc} />
                  ) : (
                    msg.texto
                  )}
                  {msg.imagenes?.length > 0 && (
                    <div className="apex-chat-imgs">
                      {msg.imagenes.map((src) => (
                        <button
                          key={src}
                          type="button"
                          className="apex-chat-img-btn"
                          onClick={() => setLightboxSrc(src)}
                        >
                          <img
                            src={src}
                            alt=""
                            className="apex-chat-img"
                            loading="lazy"
                            onError={(e) => {
                              const wrap = e.currentTarget.closest('.apex-chat-img-btn')
                              if (wrap) wrap.style.display = 'none'
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.plataformas?.length > 0 && (
                    <div className="apex-chat-plats" aria-label="Plataformas">
                      {msg.plataformas.map((p) => (
                        <span key={`${p.name}-${p.src}`} className="apex-chat-plat" title={p.name}>
                          <img
                            src={p.src}
                            alt={p.name}
                            loading="lazy"
                            onError={(e) => {
                              const wrap = e.currentTarget.closest('.apex-chat-plat')
                              if (wrap) wrap.style.display = 'none'
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.alternativas?.length > 0 && (
                    <div className="apex-chat-options">
                      {msg.alternativas.map((op, idx) => (
                        <button
                          key={op.pregunta}
                          type="button"
                          disabled={cargando}
                          onClick={() =>
                            enviar(op.pregunta, { omitirResolucionCasuistica: true })
                          }
                          className="apex-chat-option"
                        >
                          <span className="apex-chat-option-num">{idx + 1}</span>
                          <span>{op.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.fuentes?.length > 0 && (
                    <div className="apex-chat-fuentes">
                      {msg.fuentes.map((f) =>
                        f.enlace ? (
                          <a
                            key={f.id}
                            href={f.enlace}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="apex-chat-fuente"
                          >
                            <ExternalLink size={11} />
                            {f.titulo || f.nombre || f.id}
                          </a>
                        ) : (
                          <p key={f.id} className="apex-chat-fuente-local">
                            Portal: {f.seccionPortal || f.titulo || f.id}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
                {msg.rol === 'user' && <UserChatAvatar avatar={userAvatar} size={48} />}
              </div>
            ))}
            {cargando && <EscribiendoDots hue={messengerHue} />}
            <div ref={finRef} />
          </div>

          {!mensajes.some((m) => m.rol === 'user') && (
            <div className="apex-chat-suggestions">
              {sugerencias.map((s) => (
                <button key={s} type="button" onClick={() => enviar(s)} className="apex-chat-chip">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="apex-chat-composer-wrap">
            {predicciones.length > 0 && input.trim().length >= 2 && (
              <ul className="apex-chat-predict" id="apex-chat-predict" role="listbox" aria-label="Sugerencias">
                {predicciones.map((p, i) => (
                  <li key={p}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === predIdx}
                      className={`apex-chat-predict-item${i === predIdx ? ' is-active' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        aceptarPrediccion(p, { consultar: true })
                      }}
                    >
                      {p}
                    </button>
                  </li>
                ))}
                <li className="apex-chat-predict-hint">Clic o Enter para consultar · Tab para completar</li>
              </ul>
            )}
            <div className="apex-chat-composer">
              <div className="apex-chat-input-wrap">
                {ghostSufijo ? (
                  <div className="apex-chat-ghost" aria-hidden="true">
                    <span className="apex-chat-ghost-typed">{input}</span>
                    <span className="apex-chat-ghost-rest">{ghostSufijo}</span>
                  </div>
                ) : null}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Escribe un mensaje…"
                  className="apex-chat-input"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls={predicciones.length ? 'apex-chat-predict' : undefined}
                />
              </div>
              <button
                type="button"
                onClick={() => enviar()}
                disabled={cargando || !input.trim()}
                className="apex-chat-send"
                aria-label="Enviar"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxSrc ? (
        <div
          className="apex-chat-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setLightboxSrc('')}
        >
          <button
            type="button"
            className="apex-chat-lightbox-close"
            aria-label="Cerrar"
            onClick={() => setLightboxSrc('')}
          >
            ×
          </button>
          <img
            src={lightboxSrc}
            alt=""
            className="apex-chat-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  )
}
