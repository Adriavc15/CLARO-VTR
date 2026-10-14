import { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Wifi, Tv, Receipt, WifiOff, Gauge, Activity, AlertTriangle, MonitorPlay, Puzzle, Keyboard, Sparkles, TrendingUp, Search, Copy, Shield, Wrench, Tags } from 'lucide-react'
import { handleClick, handleChange, handleInput, setRenderNotifier, setToastNotifier, getHtml } from '../asistente/asistente.js'
import {
  CATALOGO_TIPIFICACIONES,
  PLANTILLAS_TIPIFICACION as PLANTILLAS_CASOS,
  destinoCampoMotivo,
} from '../tipificacionesCatalogo'
import '../asistente/asistente.css'

const INHIBICION_PASOS = [
  {
    img: '1.jpeg',
    paso: 'Paso 1',
    items: ['Ingresa el RUT del cliente en Andes.', 'Selecciona la cuenta de Facturación.'],
  },
  {
    img: '3.jpeg',
    paso: 'Paso 2',
    items: ['En Perfil del Cliente, entra a Perfil.'],
  },
  {
    img: '4.jpeg',
    paso: 'Paso 3',
    items: ['Selecciona el campo Fecha de Inhibición.'],
  },
  {
    img: '5.jpeg',
    paso: 'Paso 4',
    items: [
      'Abre el calendario en Fecha de Inhibición.',
      'Selecciona 6 días de plazo, contando desde el día siguiente.',
      'Clic en Terminado.',
    ],
  },
  {
    img: 'Guardar y enviar Inhibicion.jpeg',
    paso: 'Paso 5',
    items: [
      'Clic en Guardar.',
      'Cuando “Enviar Inhibición” se ponga azul, presiona ese botón.',
      'Listo: queda generado el plazo / extensión de fecha de pago.',
    ],
  },
]

const VISITA_PASOS = [
  'Ingresa el RUT del cliente.',
  'Entra a Cliente y verifica la dirección del servicio y el código de la boleta.',
  'Vuelve a ingresar el RUT y busca la facturación con ese código de boleta y esa dirección.',
  'Ingresa a esa cuenta de servicio del cliente.',
  'Ve a Solicitudes de Servicio y da clic allí.',
  'Completa los campos que solicitan abajo.',
]

const Pill = ({ icon: Icon, label, code, onClick }) => (
  <button
    data-click={onClick ? undefined : code}
    onClick={onClick}
    className="flex flex-col items-center gap-2 cursor-pointer select-none group w-full"
  >
    <span className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg ring-1 ring-black/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mx-auto">
      <Icon size={24} className="shrink-0" />
    </span>
    <span className="max-w-24 text-[11px] lg:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
      {label}
    </span>
  </button>
)

const serviceButtons = [
  { icon: Wifi, label: 'Soporte Internet', code: 'internetHome()' },
  { icon: Tv, label: 'Soporte TV', code: 'tvHome()' },
  { icon: Receipt, label: 'Boleta y cobros', code: 'billingHome()' },
  { icon: Shield, label: 'Inhibición', vista: 'inhibicion' },
  { icon: Wrench, label: 'Visita Técnica', vista: 'visita' },
  { icon: Tags, label: 'Tipificaciones', vista: 'tipificacion' },
]

const internetButtons = [
  { icon: WifiOff, label: 'Sin Internet', code: "start('sin_internet')" },
  { icon: Gauge, label: 'Internet degradado', code: "start('degradado')" },
  { icon: Activity, label: 'Lentitud', code: "start('lentitud')" },
  { icon: AlertTriangle, label: 'Escalamiento', code: "start('escalamiento')" },
]

const tvButtons = [
  { icon: MonitorPlay, label: 'Diagnóstico general', code: 'tvGeneralStart()' },
  { icon: Puzzle, label: 'Errores FTTH', code: 'tvFtthMenu()' },
  { icon: Keyboard, label: 'Control remoto', code: 'tvControlStart()' },
]

const billingButtons = [
  { icon: Sparkles, label: 'Explicador automático', code: 'billingExplainer()' },
  { icon: TrendingUp, label: '¿Por qué subió?', code: 'billingVariation()' },
  { icon: Search, label: 'Cobro específico', code: 'billingChargeHome()' },
  { icon: Copy, label: 'Copia de boleta', code: 'billingCopy()' },
]

const groups = [
  { label: 'Servicios', buttons: serviceButtons },
  { label: 'Internet · rápido', buttons: internetButtons },
  { label: 'TV · rápido', buttons: tvButtons },
  { label: 'Boleta · rápido', buttons: billingButtons },
]

const CHIP_BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition '
const CHIP_ON =
  'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
const CHIP_OFF =
  'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100'

export default function AsistentePasos({ onToast }) {
  const containerRef = useRef(null)
  const [html, setHtml] = useState('')
  const [vista, setVista] = useState(null)
  const [modalImg, setModalImg] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [natSize, setNatSize] = useState(null)
  const [filtroPlantilla, setFiltroPlantilla] = useState('')
  const [rutaCopiada, setRutaCopiada] = useState('')

  const plantillas = useMemo(
    () =>
      PLANTILLAS_CASOS.map((p) => {
        const razones = new Set(p.razones)
        let total = 0
        for (const r of CATALOGO_TIPIFICACIONES) {
          if (razones.has(r.razon)) {
            total += r.servicios.reduce((n, s) => n + s.motivos.length, 0)
          }
        }
        return { ...p, total }
      }),
    []
  )

  const grupos = useMemo(() => {
    const limpio = (t) => String(t || '').replace(/\s+/g, ' ').trim()
    const activa = PLANTILLAS_CASOS.find((p) => p.id === filtroPlantilla)
    const permitidas = activa ? new Set(activa.razones) : null
    const out = []
    for (const r of CATALOGO_TIPIFICACIONES) {
      if (permitidas && !permitidas.has(r.razon)) continue
      const servicios = []
      for (const s of r.servicios) {
        const casos = s.motivos.map((m) => {
          const motivo = limpio(m.motivo)
          return {
            motivo,
            nombreAmigable: limpio(m.nombreAmigable) || motivo,
            descripcion: limpio(m.descripcion),
            uso: limpio(m.uso),
            destino: destinoCampoMotivo(r.razon, s.servicio, motivo),
            tentativo: m.tentativo === true,
            ruta: `${r.razon} > ${s.servicio} > ${motivo}`,
          }
        })
        if (casos.length)
          servicios.push({
            servicio: s.servicio,
            servicioAmigable: limpio(s.nombreAmigable) || s.servicio,
            casos,
          })
      }
      const total = servicios.reduce((n, s) => n + s.casos.length, 0)
      if (total) out.push({ razon: r.razon, servicios, total })
    }
    return out
  }, [filtroPlantilla])

  const totalCasos = grupos.reduce((n, g) => n + g.total, 0)
  const totalServicios = grupos.reduce((n, g) => n + g.servicios.length, 0)
  const totalCatalogo = CATALOGO_TIPIFICACIONES.reduce(
    (n, r) => n + r.servicios.reduce((m, s) => m + s.motivos.length, 0),
    0
  )
  const plantillaActiva = plantillas.find((p) => p.id === filtroPlantilla)

  const copiarRuta = (ruta) => {
    navigator.clipboard
      .writeText(ruta)
      .then(() => {
        setRutaCopiada(ruta)
        onToast?.('Ruta de tipificación copiada')
        window.setTimeout(() => setRutaCopiada(''), 1600)
      })
      .catch(() => onToast?.('No se pudo copiar la ruta'))
  }

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const onClick = (e) => {
      const t = e.target
      if (t && typeof t.closest === 'function') {
        const shot = t.closest('.paso-shot img, .visual-card img')
        if (shot && shot.getAttribute('src')) {
          setModalImg(shot.getAttribute('src'))
          setZoom(1)
          setNatSize(null)
          return
        }
      }
      if (t && typeof t.closest === 'function' && t.closest('[data-click]')) {
        setVista(null)
      }
      handleClick(e)
    }
    const onChange = (e) => handleChange(e)
    const onInput = (e) => handleInput(e)

    node.addEventListener('click', onClick)
    node.addEventListener('change', onChange)
    node.addEventListener('input', onInput)

    setRenderNotifier(setHtml)
    if (onToast) setToastNotifier(onToast)
    setHtml(getHtml())

    return () => {
      node.removeEventListener('click', onClick)
      node.removeEventListener('change', onChange)
      node.removeEventListener('input', onInput)
      setRenderNotifier(null)
      setToastNotifier(null)
    }
  }, [onToast])

  useEffect(() => {
    if (!modalImg) return
    const onKey = (e) => {
      if (e.key === 'Escape') setModalImg(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalImg])

  return (
    <div ref={containerRef} className="asistente-pasos">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 xl:gap-8">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col items-center gap-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500 text-center">
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {group.buttons.map((b) => (
                <Pill
                  key={b.label}
                  icon={b.icon}
                  label={b.label}
                  code={b.code}
                  onClick={b.vista ? () => setVista(b.vista) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {vista === 'inhibicion' ? (
        <div className="mt-8">
          <div className="action-box warning">
            <b>IMPORTANTE</b>
            La reactivación del servicio será de 15 minutos a 2 horas como máximo.
          </div>
          <div className="visual-grid">
            {INHIBICION_PASOS.map((item) => (
              <div key={item.img} className="paso-card">
                <div className="paso-shot">
                  <img src={`/${encodeURIComponent(item.img)}`} alt={item.paso} />
                </div>
                <div className="paso-body">
                  <p className="paso-title text-center">
                    <b>{item.paso}</b>
                  </p>
                  <ul className="paso-list">
                    {item.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : vista === 'visita' ? (
        <div className="mt-8">
          <div className="paso-card">
            <div className="paso-body">
              <p className="paso-title text-center">
                <b>Generación de Visita Técnica</b>
              </p>
              <ul className="paso-list">
                {VISITA_PASOS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : vista === 'tipificacion' ? (
        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setVista(null)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100"
            >
              ← Volver a Pasos
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {plantillaActiva && (
                <>
                  <b className="text-gray-900 dark:text-gray-100">{plantillaActiva.label}</b>
                  <span className="mx-1.5 opacity-40">·</span>
                </>
              )}
              <b className="text-gray-900 dark:text-gray-100">{totalCasos}</b> casos
              <span className="mx-1.5 opacity-40">·</span>
              {totalServicios} servicios
              <span className="mx-1.5 opacity-40">·</span>
              {grupos.length} {grupos.length === 1 ? 'razón' : 'razones'}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFiltroPlantilla('')}
              className={CHIP_BASE + (!filtroPlantilla ? CHIP_ON : CHIP_OFF)}
            >
              Todas
              <span className="text-[10px] font-bold opacity-60">{totalCatalogo}</span>
            </button>
            {plantillas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFiltroPlantilla(filtroPlantilla === p.id ? '' : p.id)}
                className={CHIP_BASE + (filtroPlantilla === p.id ? CHIP_ON : CHIP_OFF)}
              >
                {p.label}
                <span className="text-[10px] font-bold opacity-60">{p.total}</span>
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {grupos.map((g) => (
              <section key={g.razon}>
                <header className="mb-4 flex items-center gap-3">
                  <h4 className="text-[13px] font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                    {g.razon}
                  </h4>
                  <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-gray-100 dark:text-gray-900">
                    {g.total}
                  </span>
                  <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                </header>

                <div className="space-y-5">
                  {g.servicios.map((s) => (
                    <div key={s.servicio}>
                      <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
                        <span>{s.servicioAmigable}</span>
                        <span className="font-normal text-gray-400 dark:text-gray-500">
                          ({s.casos.length})
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {s.casos.map((c) => (
                          <article
                            key={c.ruta}
                            title={c.ruta}
                            className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/70 dark:hover:border-emerald-700"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                                {c.nombreAmigable}
                              </div>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                  c.destino === 'solucion'
                                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                                }`}
                              >
                                {c.destino === 'solucion' ? 'Solución' : 'Inconveniente'}
                              </span>
                            </div>
                            {c.descripcion && (
                              <div className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                {c.descripcion}
                              </div>
                            )}
                            {c.uso && (
                              <div className="mt-1 text-[11px] italic leading-relaxed text-gray-400 dark:text-gray-500">
                                {c.uso}
                              </div>
                            )}
                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-gray-100 pt-2.5 dark:border-gray-700/70">
                              {c.tentativo ? (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                  Tentativo
                                </span>
                              ) : (
                                <span />
                              )}
                              <button
                                type="button"
                                onClick={() => copiarRuta(c.ruta)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition group-hover:border-emerald-300 group-hover:text-emerald-600 dark:border-gray-700 dark:text-gray-400 dark:group-hover:border-emerald-700 dark:group-hover:text-emerald-400"
                              >
                                <Copy size={12} />
                                {rutaCopiada === c.ruta ? 'Copiada ✓' : 'Copiar ruta'}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        html && <div className="mt-8" dangerouslySetInnerHTML={{ __html: html }} />
      )}

      {modalImg &&
        createPortal(
          <div className="paso-modal" onClick={() => setModalImg(null)}>
            <div
              className="paso-modal-content"
              onClick={(e) => {
                e.stopPropagation()
                if (e.target === e.currentTarget) setModalImg(null)
              }}
            >
              <div
                className={'paso-modal-scroll' + (zoom > 1 ? ' zoomed' : '')}
                onWheel={(e) => {
                  e.preventDefault()
                  setZoom((z) => Math.min(4, Math.max(1, z * (e.deltaY < 0 ? 1.12 : 0.88))))
                }}
              >
                <img
                  src={modalImg}
                  alt="Imagen del paso"
                  onLoad={(e) => {
                    if (!natSize && e.target.naturalWidth) {
                      setNatSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
                    }
                  }}
                  style={
                    zoom > 1 && natSize
                      ? { width: natSize.w * zoom, height: natSize.h * zoom }
                      : undefined
                  }
                />
              </div>
              <div className="paso-modal-toolbar">
                <button onClick={() => setZoom((z) => Math.max(1, z / 1.25))} disabled={zoom <= 1}>
                  −
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(4, z * 1.25))}>+</button>
              </div>
              <button className="paso-modal-close" onClick={() => setModalImg(null)} aria-label="Cerrar">
                ✕
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}