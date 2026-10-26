import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, Loader2, X } from 'lucide-react'
import { getContenidoSomosClave } from '../asistente/contenidosSomosClave'
import { filtrarContenidoPorMarca, normalizarMarca } from '../asistente/filtroMarca'
import '../asistente/somosClaveModal.css'

const ICONO_OK = `<svg class="sc-mark sc-mark-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></svg>`
const ICONO_OK_AZUL = `<svg class="sc-mark sc-mark-ok-azul" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></svg>`
const ICONO_NO = `<svg class="sc-mark sc-mark-no" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`

function claveImg(src) {
  try {
    return decodeURIComponent(String(src || '')).toLowerCase()
  } catch {
    return String(src || '').toLowerCase()
  }
}

function esIconoCheck(src) {
  return /visto[_\s-]*verde|check[_\s-]*verde|tick[_\s-]*verde|vistok/.test(claveImg(src))
}

function esIconoCheckAzul(src) {
  return /azul[_\s-]*visto|visto[_\s-]*azul/.test(claveImg(src))
}

function esIconoCruz(src) {
  return /cruz[_\s-]*error|cruz[_\s-]*roja|error[_\s-]*cruz|x[_\s-]*roja/.test(claveImg(src))
}

function htmlConIconos(html) {
  return String(html || '').replace(/<img\b[^>]*>/gi, (tag) => {
    const src = (tag.match(/src\s*=\s*["']([^"']+)["']/i) || [])[1] || ''
    if (esIconoCheckAzul(src)) return ICONO_OK_AZUL
    if (esIconoCheck(src)) return ICONO_OK
    if (esIconoCruz(src)) return ICONO_NO
    return tag
  })
}

/** HTML de Somos Clave con desplegables y pestañas interactivos */
function VistaHtml({ html }) {
  const rootRef = useRef(null)
  const htmlIconos = useMemo(() => htmlConIconos(html), [html])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Materialize / Inbenta: cuerpos cerrados por defecto
    root.querySelectorAll('li.content-collapsible-item, li.fep-acc-item').forEach((li) => {
      li.classList.remove('active')
    })
    root.querySelectorAll('.collapsible > li').forEach((li) => {
      if (!li.classList.contains('content-collapsible-item') && !li.classList.contains('fep-acc-item')) {
        if (li.querySelector(':scope > .collapsible-header') && li.querySelector(':scope > .collapsible-body')) {
          li.classList.add('fep-acc-item')
          li.classList.remove('active')
        }
      }
    })

    // Tabs: solo el panel activo visible
    root.querySelectorAll('.tab-content').forEach((wrap) => {
      const panes = [...wrap.querySelectorAll(':scope > .tab-pane')]
      if (!panes.length) return
      const hasActive = panes.some((p) => p.classList.contains('active'))
      panes.forEach((p, idx) => {
        const on = hasActive ? p.classList.contains('active') : idx === 0
        p.classList.toggle('active', on)
        p.classList.toggle('sc-tab-hidden', !on)
      })
    })

    const onClick = (e) => {
      const header = e.target.closest('.collapsible-header, .fep-acc-header')
      if (header && root.contains(header)) {
        e.preventDefault()
        const li = header.closest('li')
        if (!li) return
        const parent = li.parentElement
        const accordion = parent?.classList.contains('collapsible') && !parent.classList.contains('expandable')
        if (accordion) {
          ;[...parent.children].forEach((sib) => {
            if (sib !== li) sib.classList.remove('active')
          })
        }
        li.classList.toggle('active')
        return
      }

      const tabLink = e.target.closest('a.tab-link, a.nav-link[data-toggle="tab"], .nav-tabs a, .tabs .tab a')
      if (tabLink && root.contains(tabLink)) {
        e.preventDefault()
        const href = tabLink.getAttribute('href') || ''
        const hash = href.includes('#') ? href.split('#').pop() : ''
        const tabsUl = tabLink.closest('.nav-tabs, ul.tabs')
        const container =
          tabLink.closest('.bootstrap-tabs, .tabs_clase_1, .card, .holder-faq, .sc-view') || root
        if (tabsUl) {
          tabsUl.querySelectorAll('a').forEach((a) => a.classList.remove('active'))
          tabsUl.querySelectorAll('li').forEach((li) => li.classList.remove('active'))
        }
        tabLink.classList.add('active')
        tabLink.closest('li')?.classList.add('active')

        let pane = hash ? container.querySelector(`#${CSS.escape(hash)}`) : null
        if (!pane) {
          const idx = [...(tabsUl?.querySelectorAll('a') || [])].indexOf(tabLink)
          const panes = container.querySelectorAll('.tab-content > .tab-pane, .tab-pane')
          pane = panes[idx] || null
        }
        if (pane) {
          const siblings = pane.parentElement?.querySelectorAll(':scope > .tab-pane') || []
          siblings.forEach((p) => {
            const on = p === pane
            p.classList.toggle('active', on)
            p.classList.toggle('sc-tab-hidden', !on)
          })
        }
      }
    }

    root.querySelectorAll('[style]').forEach((el) => {
      const s = el.getAttribute('style') || ''
      if (!/background/i.test(s)) return
      const esGuion =
        /#deebf7|#eeeeee|#eee\b|#fef5e7/i.test(s) && /background/i.test(s)
      const esBlanco =
        /background(?:-color)?\s*:\s*(#(?:fff(?:fff)?|f0f0f0|f2f2f2|f2f3f4)|white|rgb\(\s*255\s*,\s*255\s*,\s*255)/i.test(
          s
        )
      if (esGuion) {
        el.style.setProperty('background', 'var(--sc-speech)', 'important')
        el.style.setProperty('background-color', 'var(--sc-speech)', 'important')
        el.style.setProperty('color', 'var(--sc-ink)', 'important')
        el.style.setProperty('border-color', 'var(--sc-line)', 'important')
      } else if (esBlanco && document.documentElement.classList.contains('dark')) {
        el.style.setProperty('background', 'transparent', 'important')
        el.style.setProperty('background-color', 'transparent', 'important')
      }
    })

    root.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || ''
      if (esIconoCheckAzul(src) || esIconoCheck(src) || esIconoCruz(src)) {
        const wrap = document.createElement('span')
        wrap.innerHTML = esIconoCheckAzul(src) ? ICONO_OK_AZUL : esIconoCheck(src) ? ICONO_OK : ICONO_NO
        img.replaceWith(wrap.firstChild)
        return
      }
      const hide = () => {
        img.style.display = 'none'
      }
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) hide()
      img.addEventListener('error', hide)
    })

    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [htmlIconos])

  return <div ref={rootRef} className="sc-view" dangerouslySetInnerHTML={{ __html: htmlIconos }} />
}

/** Fallback: texto con ## / ### / listas → layout tipo Clave */
function VistaTexto({ texto }) {
  const bloques = useMemo(() => {
    const raw = String(texto || '').trim()
    if (!raw) return []
    const out = []
    const parts = raw.split(/\n+/)
    for (const line of parts) {
      const t = line.trim()
      if (!t) continue
      if (/^##\s+/.test(t)) {
        out.push({ tipo: 'h2', texto: t.replace(/^##\s+/, '') })
      } else if (/^###\s+/.test(t)) {
        out.push({ tipo: 'q', texto: t.replace(/^###\s+/, '') })
      } else if (/^[•·\-]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
        out.push({ tipo: 'li', texto: t.replace(/^[•·\-]\s+/, '').replace(/^\d+\.\s+/, '') })
      } else if (
        /^(OBJETIVO|ALCANCE|CONSIDERACIONES|IMPORTANTES|MATRIZ|GESTIÓN|REGISTRA|INFORMA|INDAGA|DEBES SABER|INTRODUCCIÓN|VERIFICACIONES|PASO|SIN INTERNET|INTERNET DEGRADADO)\b/i.test(
          t
        ) ||
        (t === t.toUpperCase() && t.length < 90 && !/^https?:/i.test(t))
      ) {
        out.push({ tipo: 'h2', texto: t })
      } else if (/^¿.+?\?$/.test(t)) {
        out.push({ tipo: 'q', texto: t })
      } else if (out.length && out[out.length - 1].tipo === 'q') {
        out.push({ tipo: 'a', texto: t })
      } else {
        out.push({ tipo: 'p', texto: t })
      }
    }
    return out
  }, [texto])

  return (
    <div className="sc-view">
      {bloques.map((b, i) => {
        if (b.tipo === 'h2') return <div key={i} className="sc-text-block">{b.texto}</div>
        if (b.tipo === 'q') return <div key={i} className="sc-text-q">{b.texto}</div>
        if (b.tipo === 'a') return <div key={i} className="sc-text-a">{b.texto}</div>
        if (b.tipo === 'li')
          return (
            <div key={i} className="sc-text-li">
              <span>{b.texto}</span>
            </div>
          )
        return (
          <p key={i} className="m-0">
            {b.texto}
          </p>
        )
      })}
    </div>
  )
}

/**
 * Modal IDs Clave:
 * 1) Elegir: Ver en Somos Clave | Ver aquí
 * 2) Si "Ver aquí": muestra el procedimiento con look Somos Clave
 * `item.marca` ('claro' | 'vtr') etiqueta la marca elegida en la tabla y filtra
 * el contenido de "Ver aquí", dejando solo lo de esa marca y lo compartido.
 */
export default function ModalSomosClave({ item, onCerrar }) {
  const [modo, setModo] = useState('elegir')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [doc, setDoc] = useState(null)

  const marca = item?.marca === 'claro' ? 'Claro' : item?.marca === 'vtr' ? 'VTR' : ''

  // Contenido local filtrado por la marca elegida (sin cambios si no hay marca)
  const contenido = useMemo(() => {
    if (!doc) return null
    return filtrarContenidoPorMarca(doc, normalizarMarca(item?.marca)) || null
  }, [doc, item?.marca])

  useEffect(() => {
    setModo('elegir')
    setDoc(null)
    setError('')
    setCargando(false)
  }, [item?.id, item?.marca])

  useEffect(() => {
    if (!item) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCerrar?.()
    }
    window.addEventListener('keydown', onKey)
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${window.scrollY}px`
    document.body.style.width = '100%'
    
    return () => {
      window.removeEventListener('keydown', onKey)
      // Restaurar scroll del body
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }
  }, [item, onCerrar])

  if (!item) return null

  const abrirAqui = async () => {
    setModo('aqui')
    setCargando(true)
    setError('')
    try {
      const found = await getContenidoSomosClave(item.id)
      if (!found?.texto && !found?.html) {
        setError('No hay copia local de este ID todavía. Puedes abrirlo en Somos Clave.')
        setDoc(null)
      } else {
        setDoc(found)
      }
    } catch (e) {
      setError(e?.message || 'No se pudo cargar el contenido local')
      setDoc(null)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="sc-modal-overlay fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55 backdrop-blur-[2px]"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label={item.nombre}
    >
      <div
        className="sc-modal-panel w-full sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[96vh] sm:max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 relative px-12 sm:px-14 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#f69100]/20 via-[#c2410c]/10 to-[#14b8a6]/20 dark:from-[#f69100]/25 dark:via-[#c2410c]/15 dark:to-[#14b8a6]/20 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#c2410c] dark:text-[#14b8a6]">
            ID {item.id}
            {item.categoria ? ` · ${item.categoria}` : ''}
          </p>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug mt-0.5">
            {item.nombre}
            {marca && (
              <span
                className={`ml-2 align-middle px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                  marca === 'Claro' ? 'bg-[#e2001a] text-white' : 'bg-[#1d4ed8] text-white'
                }`}
              >
                {marca}
              </span>
            )}
          </h2>
          {modo === 'aqui' && (
            <button
              type="button"
              onClick={() => setModo('elegir')}
              className="absolute top-1/2 -translate-y-1/2 left-3 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              aria-label="Volver"
              title="Volver"
            >
              <ChevronLeft size={22} strokeWidth={2.25} />
            </button>
          )}
          <button
            type="button"
            onClick={onCerrar}
            className="absolute top-1/2 -translate-y-1/2 right-3 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} strokeWidth={2.25} />
          </button>
        </div>

        {modo === 'elegir' && (
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              ¿Cómo quieres ver este procedimiento?
            </p>
            <div className="grid grid-cols-2 gap-6 sm:gap-10 py-2">
              <a
                href={item.enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="sc-modal-choice group flex flex-col items-center text-center gap-2 bg-transparent border-0 p-2 cursor-pointer"
              >
                <span
                  role="img"
                  aria-label="Somos Clave"
                  className="sc-logo-clave h-20 w-20 sm:h-24 sm:w-24"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  Ver en Somos Clave{marca ? ` · ${marca}` : ''}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[16rem]">
                  Abre la publicación oficial (requiere sesión).
                </span>
              </a>
              <button
                type="button"
                onClick={abrirAqui}
                className="sc-modal-choice group flex flex-col items-center text-center gap-2 bg-transparent border-0 p-2 cursor-pointer"
              >
                <img
                  src="https://i.ibb.co/XrtN8M3V/apex-2.png"
                  alt="Ver aquí"
                  className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
                />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Ver aquí</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[16rem]">
                  {marca
                    ? `Ver solo el contenido de ${marca} (y el compartido) sin salir de Apex.`
                    : 'Ver el contenido sin salir de Apex.'}
                </span>
              </button>
            </div>
          </div>
        )}

        {modo === 'aqui' && (
          <div className="sc-modal-body-in flex-1 min-h-0 flex flex-col">
            {marca && !cargando && !error && contenido && !contenido.vacio && (
              <div className="shrink-0 flex items-center gap-2 px-4 sm:px-8 lg:px-10 py-2 border-b border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-[#121212] text-[11px] text-gray-500 dark:text-gray-400">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                    marca === 'Claro' ? 'bg-[#e2001a] text-white' : 'bg-[#1d4ed8] text-white'
                  }`}
                >
                  {marca}
                </span>
                Mostrando el contenido de {marca} y el compartido con ambas marcas.
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-5 bg-[#f7f9fb] dark:bg-[#0c0c0c]">
              {cargando && (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
                  <Loader2 size={18} className="animate-spin" />
                  Cargando procedimiento…
                </div>
              )}
              {!cargando && error && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                  {error}
                </div>
              )}
              {!cargando && !error && contenido?.vacio && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#171717] px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  Este procedimiento no tiene contenido de {marca}. Ábrelo en Somos Clave para ver la
                  publicación completa.
                </div>
              )}
              {!cargando && !error && !contenido?.vacio && contenido?.html && (
                <VistaHtml html={contenido.html} />
              )}
              {!cargando && !error && !contenido?.vacio && !contenido?.html && contenido?.texto && (
                <VistaTexto texto={contenido.texto} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
