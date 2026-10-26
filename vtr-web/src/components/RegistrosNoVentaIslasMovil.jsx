import React, { useEffect, useMemo, useState } from 'react'
import './AdminMigraciones.css'
import {
  BarChart3,
  CalendarRange,
  Download,
  ListFilter,
  RefreshCw,
  Search,
  Smartphone,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import {
  suscribirNoVentaIslasMovil,
  listarNoVentaIslasMovil,
  eliminarNoVentaIslasMovil,
  exportarNoVentaExcel,
  partesFechaHora,
  normalizarEmail,
  ESTADOS_NO_VENTA,
} from '../noVentaIslasMovilStore'

const COLORS = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#f69100', '#ec4899', '#84cc16']

/** Colores fijos por estado para consistencia entre gráfico y torta. */
const COLOR_ESTADO_NO_VENTA = {}
ESTADOS_NO_VENTA.forEach((e, i) => {
  COLOR_ESTADO_NO_VENTA[e] = COLORS[i % COLORS.length]
})

function fmtNum(n) {
  return Number(n || 0).toLocaleString('es-CL')
}

/** Normaliza una fecha a 'YYYY-MM-DD' (día local). */
function iniciaDia(iso) {
  if (!iso) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Día del registro: usa la fecha de gestión y, si falta, la de creación. */
function diaDe(m) {
  return m.fecha || iniciaDia(m.creado)
}

const normNombre = (s) =>
  String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Rango 'YYYY-MM-DD' de la semana actual (lunes a domingo). */
function rangoSemanaActual() {
  const hoy = new Date()
  const dow = (hoy.getDay() + 6) % 7
  const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dow)
  const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6)
  return { desde: ymd(lunes), hasta: ymd(domingo) }
}

/** Prefijo 'YYYY-MM-' del mes actual. */
function prefijoMesActual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-`
}

const cumple = (m, { desde, hasta, asesor, supervisor, estado, q }) => {
  const dia = diaDe(m)
  if (desde && dia < desde) return false
  if (hasta && dia > hasta) return false
  if (asesor !== 'todos' && normNombre(m.asesor) !== normNombre(asesor)) return false
  if (supervisor !== 'todos' && normNombre(m.supervisor) !== normNombre(supervisor)) return false
  if (estado !== 'todos' && (m.estado || '') !== estado) return false
  if (q) {
    const needle = q.trim().toLowerCase()
    if (needle) {
      const blob = `${m.asesor} ${m.supervisor} ${m.rutCliente} ${m.estado || ''} ${m.detalleError || ''}`.toLowerCase()
      if (!blob.includes(needle)) return false
    }
  }
  return true
}

/** Agrupa por asesor y ordena de mayor a menor. */
function rankingAsesoresDe(items) {
  const map = new Map()
  for (const m of items || []) {
    const nombre = String(m.asesor || '').trim().replace(/\s+/g, ' ')
    const nombreLimpio = nombre.replace(/\s*-\s*LEGAJO\s+.+$/i, '').trim()
    const k = normNombre(nombreLimpio) || 'sin asesor'
    const prev = map.get(k)
    if (prev) prev.valor += 1
    else map.set(k, { key: nombreLimpio || 'Sin asesor', valor: 1 })
  }
  return [...map.values()].sort((a, b) => b.valor - a.valor)
}

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return { x: cx + r * Math.cos(angleInRadians), y: cy + r * Math.sin(angleInRadians) }
}

function describeArc(cx, cy, rInner, rOuter, startAngle, endAngle) {
  const diff = endAngle - startAngle
  const safeEnd = diff >= 360 ? startAngle + 359.99 : endAngle
  const startOuter = polarToCartesian(cx, cy, rOuter, startAngle)
  const endOuter = polarToCartesian(cx, cy, rOuter, safeEnd)
  const startInner = polarToCartesian(cx, cy, rInner, safeEnd)
  const endInner = polarToCartesian(cx, cy, rInner, startAngle)
  const largeArcFlag = diff <= 180 ? '0' : '1'
  return [
    'M', startOuter.x, startOuter.y,
    'A', rOuter, rOuter, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    'L', startInner.x, startInner.y,
    'A', rInner, rInner, 0, largeArcFlag, 0, endInner.x, endInner.y,
    'Z',
  ].join(' ')
}

/** Donut interactivo con SVG y leyenda. */
function Donut({ data, centerSub }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const total = data.reduce((a, d) => a + d.valor, 0)

  if (!total) {
    return (
      <div className="flex items-center justify-center h-44 text-gray-400 dark:text-gray-500 text-sm">
        Sin datos
      </div>
    )
  }

  let currentAngle = 0
  const slices = data.map((d, i) => {
    const angle = (d.valor / total) * 360
    const start = currentAngle
    const end = currentAngle + angle
    currentAngle = end
    return {
      ...d,
      index: i,
      startAngle: start,
      endAngle: end,
      percent: Math.round((d.valor / total) * 100),
    }
  })

  const hoveredSlice = hoveredIdx !== null && slices[hoveredIdx] ? slices[hoveredIdx] : null
  const size = 240
  const cx = size / 2
  const cy = size / 2
  const rOuter = 110
  const rInner = 70

  return (
    <div className="relative flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-56 h-56 shrink-0 flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {slices.map((s, i) => {
            const isHover = hoveredIdx === i
            const arcPath = describeArc(cx, cy, rInner, isHover ? rOuter + 4 : rOuter, s.startAngle, s.endAngle)
            return (
              <path
                key={s.key}
                d={arcPath}
                fill={s.color}
                opacity={hoveredIdx === null || isHover ? 1 : 0.45}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            )
          })}
        </svg>

        <div className="absolute inset-[30%] rounded-full bg-white dark:bg-gray-800 shadow-sm flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
          {hoveredSlice ? (
            <>
              <span className="text-xl font-black text-gray-900 dark:text-gray-50">
                {fmtNum(hoveredSlice.valor)}
              </span>
              <span className="text-[11px] font-bold" style={{ color: hoveredSlice.color }}>
                {hoveredSlice.percent}%
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-black text-gray-900 dark:text-gray-50">{fmtNum(total)}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{centerSub}</span>
            </>
          )}
        </div>
      </div>

      <ul className="space-y-1 min-w-0 flex-1 w-full">
        {slices.map((d, i) => {
          const isHover = hoveredIdx === i
          return (
            <li
              key={d.key}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center gap-2 text-xs py-1 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
                isHover ? 'bg-gray-100 dark:bg-gray-700/70' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className={`truncate ${isHover ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-200'}`}>
                {d.key}
              </span>
              <span className="ml-auto font-bold text-gray-900 dark:text-gray-50 shrink-0">{fmtNum(d.valor)}</span>
              <span className="w-9 text-right text-gray-400 dark:text-gray-500 shrink-0">{d.percent}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Barras horizontales agrupadas por clave. */
function BarrasHoriz({ data, color, destacado = '' }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-44 text-gray-400 dark:text-gray-500 text-sm">
        Sin datos
      </div>
    )
  }
  const max = Math.max(1, ...data.map((d) => d.valor))
  return (
    <ul className="space-y-2">
      {data.map((d, i) => {
        const esMio = destacado && normNombre(d.key) === normNombre(destacado)
        return (
          <li key={d.key} className="mfa-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`truncate pr-2 ${esMio ? 'text-[#0ea5e9] font-bold' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                {d.key}
                {esMio && <span className="ml-1">(tú)</span>}
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-50 shrink-0">{fmtNum(d.valor)}</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full mfa-grow"
                style={{
                  width: `${(d.valor / max) * 100}%`,
                  background: esMio ? '#0ea5e9' : d.color || color,
                  animationDelay: `${i * 70 + 120}ms`,
                }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Tendencia de registros en los últimos 30 días (área con series por estado). */
function TendenciaDias({ items }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const dias = useMemo(() => {
    const out = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const key = ymd(d)
      const obj = { key, iso: d.toISOString() }
      ESTADOS_NO_VENTA.forEach((e) => {
        obj[e] = 0
      })
      out.push(obj)
    }
    const map = new Map(out.map((x) => [x.key, x]))
    for (const m of items) {
      const k = diaDe(m)
      if (k && map.has(k)) {
        const estado = m.estado || 'OTRO (MOTIVO)'
        if (map.get(k)[estado] !== undefined) {
          map.get(k)[estado] += 1
        }
      }
    }
    return out
  }, [items])

  const total = dias.reduce((a, d) => a + ESTADOS_NO_VENTA.reduce((sum, e) => sum + (d[e] || 0), 0), 0)

  if (!total) {
    return (
      <div className="h-52 flex flex-col items-center justify-center text-center gap-2">
        <span className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-[#0ea5e9]">
          <CalendarRange size={22} />
        </span>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Sin registros todavía</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
          La tendencia aparecerá aquí a medida que se registren clientes en los últimos 30 días.
        </p>
      </div>
    )
  }

  const W = 1000
  const H = 280
  const padL = 50
  const padR = 50
  const padT = 50
  const padB = 26
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const max = Math.max(3, ...dias.map((d) => ESTADOS_NO_VENTA.reduce((sum, e) => sum + (d[e] || 0), 0)))
  const n = dias.length
  const x = (i) => padL + (n === 1 ? 0 : (i / (n - 1)) * innerW)
  const y = (v) => padT + innerH - (v / max) * innerH
  const baseY = padT + innerH

  // Series por estado
  const series = ESTADOS_NO_VENTA.map((e) => ({
    key: e,
    label: e,
    color: COLOR_ESTADO_NO_VENTA[e],
  }))

  const seriesData = series.map((s) => {
    const pts = dias.map((d, i) => ({
      x: x(i),
      y: y(d[s.key]),
      count: d[s.key],
      iso: d.iso,
      key: d.key,
    }))
    const linePath = pts
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`
        const prev = pts[i - 1]
        const dx = (p.x - prev.x) * 0.35
        return `C ${prev.x + dx} ${prev.y}, ${p.x - dx} ${p.y}, ${p.x} ${p.y}`
      })
      .join(' ')
    return { ...s, pts, linePath }
  })

  const hoy = ymd(new Date())
  const hovered = hoveredIdx !== null ? seriesData[0].pts[hoveredIdx] : null

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (!rect.width) return
    const relX = ((e.clientX - rect.left) / rect.width) * W
    let closest = 0
    let minD = Infinity
    seriesData[0].pts.forEach((p, i) => {
      const d = Math.abs(p.x - relX)
      if (d < minD) {
        minD = d
        closest = i
      }
    })
    setHoveredIdx(closest)
  }

  const ticks = [0, Math.ceil(max / 2), max]
  const etiquetaDia = (iso) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
  }
  const fechaCapsula = (iso) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const str = d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <div
      className="relative w-full select-none cursor-crosshair pt-4 pb-6"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-56 sm:h-64 block" role="img">
        <defs>
          {seriesData.map((s, i) => (
            <linearGradient key={s.key} id={`gradNoVenta${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.05" />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((val) => {
          const yVal = y(val)
          return (
            <line
              key={val}
              x1={padL}
              x2={W - padR}
              y1={yVal}
              y2={yVal}
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700/60"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}

        {/* Áreas por estado */}
        {seriesData.map((s, i) => {
          const pts = s.pts
          const areaPath = `${s.linePath} L ${pts[n - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`
          return (
            <path
              key={s.key}
              d={areaPath}
              fill={`url(#gradNoVenta${i})`}
              className="mfa-fade"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          )
        })}

        {hovered && (
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={padT}
            y2={baseY}
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="opacity-80"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Puntos */}
      <div className="absolute inset-x-0 top-1 bottom-6 pointer-events-none">
        {seriesData.map((s) =>
          s.pts.map((p, i) => {
            const esHoy = p.key === hoy
            const esHover = hoveredIdx === i
            if (p.count === 0 && !esHoy && !esHover) return null
            return (
              <div
                key={`${s.key}-${p.key}`}
                style={{
                  left: `${(p.x / W) * 100}%`,
                  top: `${(p.y / H) * 100}%`,
                  backgroundColor: s.color,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white dark:border-gray-800 transition-all duration-150 ${
                  esHover ? 'w-4 h-4 ring-4 shadow-md z-10' : esHoy ? 'w-3 h-3 ring-2 shadow-sm' : 'w-2.5 h-2.5'
                }`}
              />
            )
          })
        )}
      </div>

      {/* Números del eje Y en HTML (sin distorsión) */}
      <div className="absolute left-0 top-4 bottom-6 w-12 pointer-events-none select-none overflow-visible">
        {ticks.map((val) => {
          const yVal = y(val)
          return (
            <span
              key={val}
              style={{ top: `${(yVal / H) * 100}%` }}
              className="absolute text-[10px] font-medium text-gray-400 dark:text-gray-500"
            >
              {val}
            </span>
          )
        })}
      </div>

      {/* Fechas eje inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none select-none overflow-visible px-8">
        {seriesData[0].pts.map((p, i) => {
          return (
            <span
              key={`lbl-${p.key}`}
              style={{ left: `${(p.x / W) * 100}%` }}
              className={`absolute text-[10px] font-medium whitespace-nowrap ${
                hoveredIdx === i ? 'text-[#0ea5e9] font-bold' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {etiquetaDia(p.iso)}
            </span>
          )
        })}
      </div>

      {/* Cápsula flotante (Tag / Tooltip interactivo) */}
      {hovered && (
        <div
          className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
          style={{
            left: `${(hovered.x / W) * 100}%`,
            top: `${(hovered.y / H) * 100}%`,
            transform: `translate(${hovered.x < 120 ? '0%' : hovered.x > W - 120 ? '-100%' : '-50%'}, ${hovered.y < 100 ? '30%' : '-135%'})`,
          }}
        >
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-950/95 dark:bg-black/95 text-white shadow-2xl border border-gray-700/80 dark:border-sky-500/50 backdrop-blur-md text-xs font-semibold animate-in fade-in zoom-in-95 duration-150 min-w-[180px] max-w-[200px]">
            <div className="flex items-center gap-2 pb-1.5 border-b border-gray-700/50">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse" />
              <span className="text-gray-100 font-medium">{fechaCapsula(hovered.iso)}</span>
            </div>
            {seriesData.map((s) => {
              const count = s.pts[hoveredIdx].count
              return (
                <div key={s.key} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-gray-300 font-medium">{s.label}</span>
                  </div>
                  <span className="font-extrabold" style={{ color: s.color }}>
                    {count}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-700/50">
              <span className="text-gray-400 font-medium">Total</span>
              <span className="font-extrabold text-white">
                {seriesData.reduce((sum, s) => sum + s.pts[hoveredIdx].count, 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Panel «Ventas Isla / Transferencias al S2 14111»: dashboard (admin) o «Mis registros» (usuario).
 */
export default function RegistrosNoVentaIslasMovil({ db = null, onToast, esUsuario = false }) {
  const [items, setItems] = useState([])
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [asesor, setAsesor] = useState('todos')
  const [supervisor, setSupervisor] = useState('todos')
  const [estado, setEstado] = useState('todos')
  const [q, setQ] = useState('')

  const emailUsuario =
    esUsuario && typeof window !== 'undefined'
      ? normalizarEmail(window.localStorage.getItem('vtr-lector-email'))
      : ''

  const soloMios = (data) => {
    if (!esUsuario) return data || []
    if (!emailUsuario) return []
    return (data || []).filter((m) => normalizarEmail(m.email) === emailUsuario)
  }

  const cargar = async () => {
    setLoading(true)
    try {
      const data = await listarNoVentaIslasMovil(db)
      setTodos(data)
      setItems(soloMios(data))
    } catch (err) {
      console.error(err)
      onToast?.(err?.message || 'No se pudieron cargar los registros.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsub = suscribirNoVentaIslasMovil(db, (data) => {
      setTodos(data)
      setItems(soloMios(data))
    })
    cargar()
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, esUsuario, emailUsuario])

  const nombresUnicos = (lista) => {
    const map = new Map()
    for (const raw of lista) {
      const name = String(raw || '').trim().replace(/\s+/g, ' ')
      if (!name) continue
      const k = name.toLowerCase()
      if (!map.has(k)) map.set(k, name)
    }
    return [...map.values()].sort((a, b) => a.localeCompare(b, 'es'))
  }

  const asesores = useMemo(() => nombresUnicos(items.map((m) => m.asesor)), [items])
  const supervisores = useMemo(() => nombresUnicos(items.map((m) => m.supervisor)), [items])

  const filtrados = useMemo(
    () => items.filter((m) => cumple(m, { desde, hasta, asesor, supervisor, estado, q })),
    [items, desde, hasta, asesor, supervisor, estado, q]
  )

  const kpis = useMemo(() => {
    const ahora = new Date()
    const mes = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-`
    const { desde: lunes, hasta: domingo } = rangoSemanaActual()
    const delMes = filtrados.filter((m) => String(diaDe(m)).startsWith(mes)).length
    const deSemana = filtrados.filter((m) => {
      const d = diaDe(m)
      return d >= lunes && d <= domingo
    }).length
    const asesoresSet = new Set(filtrados.map((m) => normNombre(m.asesor)).filter(Boolean)).size
    return { total: filtrados.length, delMes, deSemana, asesores: asesoresSet }
  }, [filtrados])

  const rankBase = useMemo(() => (esUsuario ? todos : filtrados), [esUsuario, todos, filtrados])

  const miAsesor = useMemo(() => {
    if (!esUsuario) return ''
    const counts = new Map()
    for (const m of items) {
      const k = String(m.asesor || '').trim().replace(/\s+/g, ' ')
      if (!k) continue
      counts.set(k, (counts.get(k) || 0) + 1)
    }
    let mejor = ''
    let max = -1
    for (const [k, v] of counts) {
      if (v > max) {
        max = v
        mejor = k
      }
    }
    return mejor
  }, [items, esUsuario])

  const rankSemana = useMemo(() => {
    const { desde: lunes, hasta: domingo } = rangoSemanaActual()
    return rankingAsesoresDe(
      rankBase.filter((m) => {
        const d = diaDe(m)
        return d >= lunes && d <= domingo
      })
    )
  }, [rankBase])

  const rankMes = useMemo(() => {
    const pre = prefijoMesActual()
    return rankingAsesoresDe(rankBase.filter((m) => String(diaDe(m)).startsWith(pre)))
  }, [rankBase])

  const puestoEn = (ranking) => {
    if (!miAsesor) return 0
    const idx = ranking.findIndex((d) => normNombre(d.key) === normNombre(miAsesor))
    return idx >= 0 ? idx + 1 : 0
  }

  const topDe = (ranking) => {
    const top = ranking.slice(0, 8)
    if (!esUsuario || !miAsesor) return top
    const idx = ranking.findIndex((d) => normNombre(d.key) === normNombre(miAsesor))
    return idx >= 8 ? [...top, ranking[idx]] : top
  }

  const porEstado = useMemo(() => {
    const map = new Map()
    for (const m of filtrados) {
      const k = m.estado || 'Sin estado'
      map.set(k, (map.get(k) || 0) + 1)
    }
    return [...map.entries()]
      .map(([key, valor]) => ({ key, valor }))
      .sort((a, b) => b.valor - a.valor)
      .map((d) => ({
        ...d,
        color: COLOR_ESTADO_NO_VENTA[d.key] || COLORS[Math.floor(Math.random() * COLORS.length)],
      }))
  }, [filtrados])

  const stamp = new Date().toISOString().slice(0, 10)
  const archivoBase = `no-venta-islas-movil_${stamp}`

  const borrar = async (m) => {
    if (typeof window !== 'undefined' && !window.confirm(`¿Eliminar el registro de RUT ${m.rutCliente || m.id}?`)) return
    try {
      await eliminarNoVentaIslasMovil(db, m.id)
      setItems((prev) => prev.filter((x) => x.id !== m.id))
      onToast?.('Registro eliminado')
    } catch (err) {
      onToast?.(err?.message || 'No se pudo eliminar')
    }
  }

  const inputBase =
    'w-full text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-gray-100'
  const labelBase =
    'text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1'

  const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-5 ${className}`}>{children}</div>
  )

  const tituloPanel = (Icon, texto, sub) => (
    <div className="text-center mb-4">
      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{texto}</h4>
      {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  )

  return (
    <div className="w-full space-y-4">
      {/* Encabezado + filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Smartphone className="text-[#0ea5e9] shrink-0" size={22} />
              {esUsuario
                ? 'Mis registros · Ventas Isla / Transferencias al S2 14111'
                : 'Reporte · Ventas Isla / Transferencias al S2 14111'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {esUsuario
                ? 'Solo se muestran los registros que hiciste tú (tu correo).'
                : 'Registros de Ventas Isla y Transferencias al S2 14111.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <button
              type="button"
              onClick={cargar}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={() => exportarNoVentaExcel(filtrados, `${archivoBase}.xls`)}
              disabled={!filtrados.length}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full bg-[#0ea5e9] text-white font-medium disabled:opacity-50 cursor-pointer"
            >
              <Download size={14} />
              Excel
            </button>
          </div>
        </div>

        {/* Slicers */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <label className="block">
            <span className={labelBase}>Desde</span>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={inputBase} />
          </label>
          <label className="block">
            <span className={labelBase}>Hasta</span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={inputBase} />
          </label>
          <label className="block">
            <span className={labelBase}>Asesor</span>
            <select value={asesor} onChange={(e) => setAsesor(e.target.value)} className={inputBase}>
              <option value="todos">Todos</option>
              {asesores.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelBase}>Supervisor</span>
            <select value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className={inputBase}>
              <option value="todos">Todos</option>
              {supervisores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelBase}>Estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputBase}>
              <option value="todos">Todos</option>
              {ESTADOS_NO_VENTA.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="block col-span-2 md:col-span-3 lg:col-span-1">
            <span className={labelBase}>Buscar</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="RUT, asesor, supervisor…"
                className={`${inputBase} pl-8`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-100 dark:bg-sky-900/40 text-[#0369a1] dark:text-sky-300">
              <TrendingUp size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Total</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-50">{fmtNum(kpis.total)}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300">
              <CalendarRange size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Este mes</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-50">{fmtNum(kpis.delMes)}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300">
              <Users size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Asesores</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-50">{fmtNum(kpis.asesores)}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300">
              <Wallet size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Esta semana</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-50">{fmtNum(kpis.deSemana)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tendencia 30 días */}
      <Card>
        {tituloPanel(CalendarRange, 'Registros por día', 'Últimos 30 días')}

        {/* Leyenda de estados (arriba del gráfico) */}
        <div className="flex flex-wrap gap-3 justify-center pb-2">
          {ESTADOS_NO_VENTA.map((e) => (
            <div key={e} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLOR_ESTADO_NO_VENTA[e] }} />
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{e}</span>
            </div>
          ))}
        </div>
        <TendenciaDias items={filtrados} />
      </Card>

      {/* Ranking por asesor */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          {tituloPanel(
            ListFilter,
            'Por asesor · Semanal',
            esUsuario && puestoEn(rankSemana) ? `Tu puesto: #${puestoEn(rankSemana)} de ${rankSemana.length}` : 'Esta semana'
          )}
          <BarrasHoriz data={topDe(rankSemana)} color="#0ea5e9" destacado={esUsuario ? miAsesor : ''} />
        </Card>
        <Card>
          {tituloPanel(
            ListFilter,
            'Por asesor · Mensual',
            esUsuario && puestoEn(rankMes) ? `Tu puesto: #${puestoEn(rankMes)} de ${rankMes.length}` : 'Este mes'
          )}
          <BarrasHoriz data={topDe(rankMes)} color="#8b5cf6" destacado={esUsuario ? miAsesor : ''} />
        </Card>
      </div>

      {/* Distribución por estado */}
      <Card>
        {tituloPanel(BarChart3, 'Por estado', 'Distribución de la gestión')}
        <Donut data={porEstado} centerSub="registros" />
      </Card>

      {/* Tabla */}
      <Card>
        {tituloPanel(Wallet, 'Últimos registros', `${filtrados.length} en el filtro actual`)}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                {['RUT asesor', 'Fecha', 'Asesor', 'Supervisor', 'RUT cliente', 'Estado', 'Detalle / Tipificación', 'Registrado'].map((h) => (
                  <th key={h} className="text-left font-bold text-gray-500 dark:text-gray-400 py-2 px-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
                {!esUsuario && <th className="w-8" />}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={esUsuario ? 8 : 9} className="text-center text-gray-400 dark:text-gray-500 py-8">
                    Sin registros en el filtro actual
                  </td>
                </tr>
              )}
              {filtrados.map((m) => {
                const asesorLimpio = m.asesor ? String(m.asesor).replace(/\s*-\s*LEGAJO\s+.+$/i, '').trim() : m.asesor
                return (
                  <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-2 px-2 whitespace-nowrap text-gray-600 dark:text-gray-300 tabular-nums">{m.legajoAsesor || '—'}</td>
                  <td className="py-2 px-2 whitespace-nowrap text-gray-800 dark:text-gray-100">{m.fecha || '—'}</td>
                  <td className="py-2 px-2 whitespace-nowrap text-gray-800 dark:text-gray-100 font-medium">{asesorLimpio || '—'}</td>
                  <td className="py-2 px-2 whitespace-nowrap text-gray-600 dark:text-gray-300">{m.supervisor || '—'}</td>
                  <td className="py-2 px-2 whitespace-nowrap text-gray-600 dark:text-gray-300">{m.rutCliente || '—'}</td>
                  <td className="py-2 px-2">
                    <span className="inline-block rounded-full bg-[#0ea5e9]/15 text-[#0369a1] dark:text-sky-300 px-2.5 py-1 text-[11px] font-semibold">
                      {m.estado || '—'}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    {m.detalleError ? (
                      <div className="group relative inline-block max-w-[260px]">
                        <span className="block truncate text-[11px] font-medium text-gray-600 dark:text-gray-300 cursor-help border-b border-dotted border-gray-400 dark:border-gray-500 pb-0.5">
                          {m.detalleError}
                        </span>
                        <div className="absolute left-0 bottom-full mb-2 w-72 bg-gray-900 dark:bg-gray-950 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="font-medium mb-1 text-gray-300">Detalle / Tipificación:</div>
                          <div className="text-gray-100">{m.detalleError}</div>
                          <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-950"></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 whitespace-nowrap text-gray-400 dark:text-gray-500">
                    {partesFechaHora(m.creado).fecha}
                  </td>
                  {!esUsuario && (
                    <td className="py-2 px-1 text-right">
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() => borrar(m)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
