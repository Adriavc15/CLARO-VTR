import React, { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  Loader2,
  Save,
  Trash2,
  RefreshCw,
  Upload,
  Search,
  FileText,
  BookOpen,
  Layers,
} from 'lucide-react'
import { buscarConocimiento } from '../asistente/conocimientoAndes'
import { INDICE_PORTAL_LOCAL } from '../asistente/indicePortal'
import {
  sincronizarConocimientoPortal,
  listarCorpusFirestore,
  guardarConocimientoDesdeAdmin,
  eliminarConocimientoAdmin,
  cargarConocimientoLive,
  grupoFuente,
  contarFuentesLocales,
  sincronizarTodoConocimiento,
} from '../asistente/conocimientoLive'
import {
  articuloSomosClaveADoc,
  docDesdeHtmlSomosClave,
  guardarDocsSomosClave,
  sincronizarSomosClaveLocalAFirestore,
  nutrirSomosClaveAprendizaje,
} from '../asistente/conocimientoSomosClave'
import { docsSomosClaveLocales } from '../asistente/contenidosSomosClave'
import { nutrirDialogosGoogleEnFirestore } from '../asistente/dialogosGoogle'
import { nutrirCorpusCotidianosEnFirestore } from '../asistente/corpusDialogosCotidianos'
import {
  sincronizarKbAndesVtr,
  docsDesdeKbJson,
  metaKbAndes,
} from '../asistente/conocimientoKbAndes'
import AdminAprendizajeContinuo from './AdminAprendizajeContinuo'
import { metricasAprendizaje, UMBRAL_CONFIANZA } from '../asistente/aprendizajeContinuo'
import { GUIA_ENTRENAMIENTO_APEX } from '../asistente/entrenamientoApex'

const PANELES = [
  { id: 'revisar', label: 'Revisar chat' },
  { id: 'ensenar', label: 'Enseñar al chat' },
  { id: 'corpus', label: 'Lo que usa el chat' },
  { id: 'fuentes', label: 'Mantener fuentes' },
]

const FILTROS_CORPUS = [
  { id: 'todos', label: 'Todos' },
  { id: 'admin', label: 'Subidos aquí' },
  { id: 'somosclave', label: 'Somos Clave' },
  { id: 'andes', label: 'Andes/VTR' },
  { id: 'portal', label: 'Guías portal' },
  { id: 'sucursales', label: 'Sucursales' },
  { id: 'dialogos', label: 'Diálogos' },
  { id: 'otro', label: 'Otros' },
]

const LABEL_FUENTE = {
  admin: 'Admin',
  'admin-aprobado': 'Aprobado',
  'kb-andes-vtr': 'Andes/VTR',
  'kb-andes-training': 'Ejemplo KB',
  'kb-andes-rules': 'Reglas',
  'kb-andes-nl': 'Intent NL',
  'somosclave-km': 'Somos Clave',
  'somosclave-html-internet-ftth-hfc': 'Somos Clave HTML',
  'somosclave-html-cambio-titular': 'Somos Clave HTML',
  'somosclave-html-traslado': 'Somos Clave HTML',
  'vtr-sucursales': 'Sucursales',
  'google-conversation-design': 'Tono Google',
  'corpus-dialogos-cotidianos': 'Diálogos',
  'firestore-noticias': 'Noticias',
  portal: 'Portal',
}

/** Grupos que se muestran en el resumen de salud (local vs Firestore). */
const GRUPOS_SALUD = [
  { id: 'portal', label: 'Guías del portal' },
  { id: 'andes', label: 'Base Andes/VTR' },
  { id: 'somosclave', label: 'Somos Clave' },
  { id: 'sucursales', label: 'Sucursales' },
  { id: 'dialogos', label: 'Diálogos / tono' },
  { id: 'admin', label: 'Subidos aquí' },
  { id: 'otro', label: 'Otros' },
]

const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100'

function etiquetaFuente(fuente) {
  return LABEL_FUENTE[fuente] || String(fuente || 'firestore').replace(/-/g, ' ')
}

function puedeBorrar(d) {
  const g = grupoFuente(d.fuente, d.id)
  return g === 'admin' || g === 'somosclave'
}

/**
 * Panel alineado a cómo responde el chat:
 * busca título + sinónimos + texto en un corpus (bundle local + Firestore).
 */
export default function AdminConocimientoIA({ db, onToast, panelInicial = 'ensenar' }) {
  const [panel, setPanel] = useState(panelInicial)
  const [pendientes, setPendientes] = useState(0)
  const [syncIA, setSyncIA] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [lista, setLista] = useState([])
  const [cargandoLista, setCargandoLista] = useState(false)
  const [filtroFuente, setFiltroFuente] = useState('todos')
  const [filtroTexto, setFiltroTexto] = useState('')

  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('FACTURACIÓN')
  const [seccionPortal, setSeccionPortal] = useState('')
  const [sinonimos, setSinonimos] = useState('')
  const [texto, setTexto] = useState('')
  const [dividir, setDividir] = useState(true)
  const [arrastrando, setArrastrando] = useState(false)

  const [nutriendoGoogle, setNutriendoGoogle] = useState(false)
  const [syncKb, setSyncKb] = useState(false)
  const [syncSc, setSyncSc] = useState(false)
  const [syncTodo, setSyncTodo] = useState(false)
  const [progresoTodo, setProgresoTodo] = useState('')
  const [saludLocal, setSaludLocal] = useState(null)
  const kbMeta = metaKbAndes()

  const [corpusChat, setCorpusChat] = useState([])
  const [pruebaQ, setPruebaQ] = useState('')
  const [pruebaHits, setPruebaHits] = useState(null)

  const toast = (m) => onToast?.(m)
  const ocupado = syncIA || syncKb || syncSc || syncTodo || nutriendoGoogle || guardando

  /** Conteo local por grupo (lo que trae la app) para comparar con Firestore. */
  const refrescarSalud = async () => {
    try {
      setSaludLocal(await contarFuentesLocales())
    } catch {
      /* opcional */
    }
  }

  const refrescarLista = async () => {
    if (!db) return
    setCargandoLista(true)
    try {
      const [docs, live] = await Promise.all([listarCorpusFirestore(db), cargarConocimientoLive(db)])
      setLista(docs)
      setCorpusChat(live)
    } catch (e) {
      toast(e?.message || 'No se pudo listar el conocimiento')
    } finally {
      setCargandoLista(false)
    }
  }

  const refrescarPendientes = async () => {
    if (!db) return
    try {
      const met = await metricasAprendizaje(db)
      setPendientes(met?.pendientesRevision || 0)
    } catch {
      /* opcional */
    }
  }

  useEffect(() => {
    refrescarLista()
    refrescarPendientes()
    refrescarSalud()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  useEffect(() => {
    if (panelInicial) setPanel(panelInicial)
  }, [panelInicial])

  const conteos = useMemo(() => {
    const c = {
      todos: lista.length,
      admin: 0,
      somosclave: 0,
      andes: 0,
      portal: 0,
      sucursales: 0,
      dialogos: 0,
      otro: 0,
      noticias: 0,
    }
    for (const d of lista) {
      const g = grupoFuente(d.fuente, d.id)
      c[g] = (c[g] || 0) + 1
    }
    return c
  }, [lista])

  const visibles = useMemo(() => {
    const t = filtroTexto.trim().toLowerCase()
    return lista.filter((d) => {
      if (filtroFuente !== 'todos' && grupoFuente(d.fuente, d.id) !== filtroFuente) return false
      if (!t) return true
      return `${d.titulo} ${d.categoria} ${d.fuente} ${(d.sinonimos || []).join(' ')}`.toLowerCase().includes(t)
    })
  }, [lista, filtroFuente, filtroTexto])

  const handleSync = async () => {
    if (ocupado) return
    setSyncIA(true)
    try {
      const res = await sincronizarConocimientoPortal(db)
      toast(`Guías del portal → Firestore: ${res.total} documentos`)
      await refrescarLista()
    } catch (e) {
      toast(e?.message || 'Error al sincronizar')
    } finally {
      setSyncIA(false)
    }
  }

  const handleSyncKb = async () => {
    if (ocupado || !db) return
    setSyncKb(true)
    try {
      const res = await sincronizarKbAndesVtr(db)
      toast(
        `Base Andes/VTR → Firestore: ${res.total} docs + ${res.trainingExamples || 0} intents NL (${res.meta.trainingNlEjemplos || 0} frases)`
      )
      await refrescarLista()
    } catch (e) {
      toast(e?.message || 'No se pudo subir la base Andes/VTR')
    } finally {
      setSyncKb(false)
    }
  }

  const handleNutrirGoogle = async () => {
    if (ocupado || !db) return
    setNutriendoGoogle(true)
    try {
      const g = await nutrirDialogosGoogleEnFirestore(db)
      const c = await nutrirCorpusCotidianosEnFirestore(db)
      const scDocs = await docsSomosClaveLocales().catch(() => [])
      const sc = await nutrirSomosClaveAprendizaje(db, scDocs, { limite: 200 })
      toast(
        `Tono: Google ${g.ejemplos} + corpus ${c.dialogos} diálogos · Somos Clave few-shots ${sc.ejemplos} (+${sc.omitidos} ya)`
      )
      await refrescarLista()
    } catch (e) {
      toast(e?.message || 'No se pudo nutrir con diálogos')
    } finally {
      setNutriendoGoogle(false)
    }
  }

  const handleSyncSomosClave = async () => {
    if (ocupado || !db) return
    setSyncSc(true)
    try {
      const scDocs = await docsSomosClaveLocales()
      const pub = await sincronizarSomosClaveLocalAFirestore(db, scDocs)
      const aprend = await nutrirSomosClaveAprendizaje(db, scDocs, { limite: 250 })
      toast(
        `Somos Clave → corpus ${pub.total} docs · few-shots ${aprend.ejemplos} nuevos (${aprend.omitidos} ya)`
      )
      await refrescarLista()
      setPanel('corpus')
      setFiltroFuente('somosclave')
    } catch (e) {
      toast(e?.message || 'No se pudo publicar Somos Clave (¿estás logueado como admin?)')
    } finally {
      setSyncSc(false)
    }
  }

  const handleSyncTodo = async () => {
    if (ocupado || !db) return
    if (
      !window.confirm(
        '¿Publicar TODO el conocimiento local en Firestore? (guías del portal, base Andes/VTR, Somos Clave, tono y diálogos). Puede tardar un poco.'
      )
    )
      return
    setSyncTodo(true)
    setProgresoTodo('Preparando…')
    try {
      const res = await sincronizarTodoConocimiento(db, { onProgress: setProgresoTodo })
      toast(
        `Publicado → portal ${res.portal} · Andes/VTR ${res.andes} (+${res.intents} intents) · Somos Clave ${res.somosclave} · diálogos ${res.google + res.corpus}`
      )
      await refrescarLista()
      await refrescarSalud()
    } catch (e) {
      toast(e?.message || 'No se pudo publicar todo el conocimiento')
    } finally {
      setSyncTodo(false)
      setProgresoTodo('')
    }
  }

  const handleGuardar = async (e) => {
    e?.preventDefault?.()
    if (guardando) return
    setGuardando(true)
    try {
      const res = await guardarConocimientoDesdeAdmin(db, {
        titulo,
        categoria,
        seccionPortal,
        sinonimos,
        texto,
        dividir,
      })
      toast(
        res.total === 1
          ? `El chat ya puede buscar «${res.docs[0].titulo}»`
          : `Guardado: ${res.total} secciones (el chat busca cada una por separado)`
      )
      setTexto('')
      setTitulo('')
      setSinonimos('')
      await refrescarLista()
      setPanel('corpus')
      setFiltroFuente('admin')
    } catch (err) {
      toast(err?.message || 'No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Quitar este documento del corpus del chat?')) return
    try {
      await eliminarConocimientoAdmin(db, id)
      toast('Documento eliminado')
      await refrescarLista()
    } catch (e) {
      toast(e?.message || 'No se pudo eliminar')
    }
  }

  const indexarSomosClave = async (docSc, extra = []) => {
    const docs = [docSc, ...extra].filter(Boolean)
    setSyncIA(true)
    try {
      const res = await guardarDocsSomosClave(db, docs)
      toast(`Somos Clave → chat: ${docs[0]?.titulo || res.total} (${res.total})`)
      await refrescarLista()
      setPanel('corpus')
      setFiltroFuente('somosclave')
    } catch (e) {
      toast(e?.message || 'No se pudo indexar Somos Clave')
    } finally {
      setSyncIA(false)
    }
  }

  const onFile = async (file) => {
    if (!file) return
    const raw = await file.text()
    if (/\.html?$/i.test(file.name) || /id=["']faq-title["']/i.test(raw)) {
      const docSc = docDesdeHtmlSomosClave(raw)
      if (docSc) {
        await indexarSomosClave(docSc)
        return
      }
      toast('Ese HTML no parece una página de Somos Clave (falta faq-title / faq-content)')
      return
    }
    if (/\.json$/i.test(file.name) || raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed?.knowledge) && parsed.knowledge.length) {
          setSyncIA(true)
          try {
            const docs = docsDesdeKbJson(parsed)
            const res = await sincronizarKbAndesVtr(db, { docs })
            toast(`Base Andes/VTR importada: ${res.total} documentos`)
            await refrescarLista()
            setPanel('corpus')
            setFiltroFuente('andes')
          } catch (e) {
            toast(e?.message || 'No se pudo importar la base Andes/VTR')
          } finally {
            setSyncIA(false)
          }
          return
        }
        const arr = Array.isArray(parsed) ? parsed : parsed.items || parsed.docs || []
        if (Array.isArray(arr) && arr.length && (arr[0].id || arr[0].texto || arr[0].html || arr[0].contenido)) {
          const docs = arr
            .map((a) =>
              articuloSomosClaveADoc({
                id: a.id || a.scId,
                nombre: a.nombre || a.title || a.titulo,
                enlace: a.enlace,
                categoriaPath: a.categoriaPath || a.categoria || a.cat,
                texto: a.texto || a.text || a.contenido || a.body,
                html: a.html || a.ANSWER_TEXT,
              })
            )
            .filter(Boolean)
          if (!docs.length) {
            toast('El JSON no tiene artículos de Somos Clave reconocibles')
            return
          }
          await indexarSomosClave(docs[0], docs.slice(1))
          return
        }
      } catch {
        // no es JSON de artículos
      }
    }
    setTexto(raw)
    if (!titulo.trim()) {
      setTitulo(file.name.replace(/\.(txt|md|html?|json)$/i, '').replace(/[_-]+/g, ' '))
    }
    toast(`Texto cargado: ${file.name}. Completa título y sinónimos y súbelo.`)
    setPanel('ensenar')
  }

  const probarBusqueda = (e) => {
    e?.preventDefault?.()
    const q = pruebaQ.trim()
    if (!q) {
      setPruebaHits(null)
      return
    }
    setPruebaHits(buscarConocimiento(q, 8, corpusChat.length ? corpusChat : INDICE_PORTAL_LOCAL))
  }

  const btnCapsule = (activo) =>
    `px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap ${
      activo
        ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
    }`

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot size={20} className="text-teal-600" />
            Conocimiento de la IA
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-3xl">
            Entrenamiento correcto: hechos en corpus, tono con few-shots, charla con Gemini. Si un tip sale
            con confianza &lt; {UMBRAL_CONFIANZA}, queda candidato aquí (tú apruebas; no auto-publica).
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
          {GUIA_ENTRENAMIENTO_APEX.map(([t, d]) => (
            <li
              key={t}
              className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2.5"
            >
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{t}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{d}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2">
          {PANELES.map((p) => (
            <button key={p.id} type="button" onClick={() => setPanel(p.id)} className={btnCapsule(panel === p.id)}>
              {p.label}
              {p.id === 'revisar' && pendientes > 0 ? ` (${pendientes})` : ''}
            </button>
          ))}
        </div>
      </div>

      {panel === 'revisar' && (
        <AdminAprendizajeContinuo
          db={db}
          onToast={onToast}
          embedded
          onCambio={() => {
            refrescarLista()
            refrescarPendientes()
          }}
        />
      )}

      {panel === 'ensenar' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <FileText size={18} className="text-teal-600" />
              Procedimiento operativo
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              El título y los sinónimos son lo que el chat usa para encontrar el documento. El texto es la evidencia
              que cita (objetivo, matriz, speech).
            </p>
            <form onSubmit={handleGuardar} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Título (así lo busca el chat)
                </label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Inconveniente con Pago"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Cómo te lo van a preguntar (sinónimos)
                </label>
                <input
                  value={sinonimos}
                  onChange={(e) => setSinonimos(e.target.value)}
                  placeholder="pago no aplicado, pna, comprobante, recaudador"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClass}>
                    <option value="FACTURACIÓN">FACTURACIÓN</option>
                    <option value="ANDES">ANDES</option>
                    <option value="TÉCNICO">TÉCNICO</option>
                    <option value="OFRECIMIENTO">OFRECIMIENTO</option>
                    <option value="PROCEDIMIENTO">PROCEDIMIENTO</option>
                    <option value="PORTAL">PORTAL</option>
                    <option value="SOMOS CLAVE">SOMOS CLAVE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                    Ruta en el portal (opcional)
                  </label>
                  <input
                    value={seccionPortal}
                    onChange={(e) => setSeccionPortal(e.target.value)}
                    placeholder="Facturación → Inconveniente con Pago"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Texto del procedimiento
                </label>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={12}
                  placeholder="OBJETIVO, ALCANCE, matrices, speeches…"
                  className={`${inputClass} font-mono leading-relaxed`}
                  required
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dividir}
                  onChange={(e) => setDividir(e.target.checked)}
                  className="w-4 h-4 accent-teal-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Dividir por secciones (el chat recupera casuísticas sueltas, no un muro de texto)
                </span>
              </label>
              <button
                type="submit"
                disabled={guardando}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg"
              >
                {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {guardando ? 'Indexando…' : 'Indexar en el chat'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <BookOpen size={18} className="text-teal-600" />
              HTML de Somos Clave
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Arrastra la página guardada de respuesta.php. El chat toma el título (faq-title), el cuerpo y las
              imágenes. No hace falta rellenar el formulario de al lado.
            </p>
            <label
              onDragOver={(e) => {
                e.preventDefault()
                setArrastrando(true)
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault()
                setArrastrando(false)
                onFile(e.dataTransfer.files?.[0])
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-12 cursor-pointer text-center ${
                arrastrando
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40'
              }`}
            >
              {syncIA ? <Loader2 size={28} className="animate-spin text-teal-600" /> : <Upload size={28} className="text-teal-600" />}
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Soltar HTML aquí o elegir archivo</span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">.html Somos Clave · también .txt / .md para el procedimiento</span>
              <input
                type="file"
                accept=".txt,.md,.html,.htm,.json,text/plain,application/json"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      )}

      {panel === 'corpus' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-teal-600" />
                Corpus en Firestore ({lista.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                El chat también carga {INDICE_PORTAL_LOCAL.length} guías del portal y la base Andes/VTR v{kbMeta.version || '—'} desde
                la app, aunque Firestore esté vacío.
              </p>
            </div>
            <button
              type="button"
              onClick={refrescarLista}
              disabled={cargandoLista}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              {cargandoLista ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Refrescar
            </button>
          </div>

          <form onSubmit={probarBusqueda} className="mb-4 rounded-xl border border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/40">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Probar como el chat
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                value={pruebaQ}
                onChange={(e) => setPruebaQ(e.target.value)}
                placeholder="Ej: pna, luz roja ont, disney 600…"
                className={`${inputClass} flex-1 min-w-[200px]`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 cursor-pointer"
              >
                <Search size={16} />
                Buscar
              </button>
            </div>
            {pruebaHits && (
              <ul className="mt-3 space-y-1.5">
                {pruebaHits.length === 0 ? (
                  <li className="text-xs text-gray-500">Nada ranqueó. Faltan sinónimos o el documento no está en el corpus.</li>
                ) : (
                  pruebaHits.map((h, i) => (
                    <li key={h.id || i} className="text-xs text-gray-700 dark:text-gray-200">
                      <span className="font-bold text-teal-700 dark:text-teal-300">{i + 1}.</span> {h.titulo}{' '}
                      <span className="text-gray-400">
                        · {etiquetaFuente(h.fuente)} · score {h.score}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </form>

          <div className="flex flex-wrap gap-2 mb-3">
            {FILTROS_CORPUS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroFuente(f.id)}
                className={btnCapsule(filtroFuente === f.id)}
              >
                {f.label}
                {typeof conteos[f.id] === 'number' ? ` (${conteos[f.id]})` : ''}
              </button>
            ))}
          </div>
          <input
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Filtrar por título o sinónimo…"
            className={`${inputClass} mb-3`}
          />

          {visibles.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
              {lista.length === 0
                ? 'Firestore está vacío. El chat igual usa la base local. Sube un procedimiento o publica las fuentes.'
                : 'Ningún documento coincide con el filtro.'}
            </p>
          ) : (
            <ul className="space-y-2 max-h-[520px] overflow-y-auto">
              {visibles.map((d) => (
                <li
                  key={d.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{d.titulo}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {etiquetaFuente(d.fuente)} · {d.categoria || '—'} · {(d.contenido || []).length} líneas
                      {d.actualizadoEn ? ` · ${new Date(d.actualizadoEn).toLocaleString()}` : ''}
                    </p>
                  </div>
                  {puedeBorrar(d) && (
                    <button
                      type="button"
                      onClick={() => handleEliminar(d.id)}
                      className="shrink-0 p-2 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                      title="Quitar del corpus"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {panel === 'fuentes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers size={18} className="text-teal-600" />
                  Salud del conocimiento
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                  Compara lo que la app trae por defecto (local) con lo publicado en Firestore. Si «Nube» es menor que
                  «Local», pulsa <strong>Publicar todo</strong>.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleSyncTodo}
                  disabled={ocupado}
                  className="px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                >
                  {syncTodo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {syncTodo ? progresoTodo || 'Publicando…' : 'Publicar TODO en Firestore'}
                </button>
                {saludLocal === null && (
                  <span className="text-[11px] text-gray-400">Calculando local…</span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="py-2 pr-3 font-bold">Fuente</th>
                    <th className="py-2 pr-3 font-bold text-right">Local</th>
                    <th className="py-2 pr-3 font-bold text-right">Nube</th>
                    <th className="py-2 font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {GRUPOS_SALUD.map((g) => {
                    const local = saludLocal?.[g.id] ?? 0
                    const nube = conteos[g.id] ?? 0
                    const falta = Math.max(0, local - nube)
                    return (
                      <tr key={g.id} className="border-t border-gray-100 dark:border-gray-700">
                        <td className="py-2 pr-3 text-gray-800 dark:text-gray-100">{g.label}</td>
                        <td className="py-2 pr-3 text-right text-gray-600 dark:text-gray-300">{local}</td>
                        <td className="py-2 pr-3 text-right text-gray-600 dark:text-gray-300">{nube}</td>
                        <td className="py-2">
                          {falta > 0 ? (
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-full px-2 py-0.5">
                              Faltan {falta}
                            </span>
                          ) : nube > 0 ? (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-full px-2 py-0.5">
                              OK
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Base Andes/VTR</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-1">
              Ya está dentro de la app ({kbMeta.knowledge} conocimiento + {kbMeta.training} ejemplos, v{kbMeta.version || '—'}).
              Publicar a Firestore sirve para que el chat remoto use la misma copia sin redesplegar.
            </p>
            <button
              type="button"
              onClick={handleSyncKb}
              disabled={ocupado}
              className="px-4 py-2 rounded-full text-sm font-bold bg-indigo-700 hover:bg-indigo-600 text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {syncKb ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {syncKb ? 'Publicando…' : 'Publicar en Firestore'}
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Guías del portal Apex</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-1">
              Contrataciones, pago, ONT, planes y pasos ya van en el chat desde el código ({INDICE_PORTAL_LOCAL.length} docs).
              Sincronizar las copia a Firestore.
            </p>
            <button
              type="button"
              onClick={handleSync}
              disabled={ocupado}
              className="px-4 py-2 rounded-full text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {syncIA ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {syncIA ? 'Sincronizando…' : 'Sincronizar a Firestore'}
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Somos Clave</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-1">
              Catálogo local (~348 procedimientos) → corpus RAG + few-shots. Requiere admin para publicar el
              corpus completo; los few-shots se pueden crear sin overwrite.
            </p>
            <button
              type="button"
              onClick={handleSyncSomosClave}
              disabled={ocupado}
              className="px-4 py-2 rounded-full text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {syncSc ? <Loader2 size={16} className="animate-spin" /> : <BookOpen size={16} />}
              {syncSc ? 'Publicando SC…' : 'Publicar Somos Clave'}
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700 flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Tono y diálogos</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-1">
              Few-shots de tono + extractos Somos Clave. Charla la lleva Gemini; tips dudosos en Revisar chat.
            </p>
            <button
              type="button"
              onClick={handleNutrirGoogle}
              disabled={ocupado}
              className="px-4 py-2 rounded-full text-sm font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {nutriendoGoogle ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
              {nutriendoGoogle ? 'Nutriendo…' : 'Nutrir diálogos'}
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}
