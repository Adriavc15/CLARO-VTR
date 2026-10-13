import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Clock,
  Star,
  Smile,
  Sticker,
  Loader2,
  X,
  Download,
  Trash2,
} from 'lucide-react'
import {
  EMOJI_PACKS,
  EMOJIGG_CATEGORIES,
  buscarGifs,
  cargarEmojisEmojiGg,
  detectarFormatoUrl,
  eliminarStickerMio,
  eliminarStickerMioEnNube,
  esEmojiGgUrl,
  esStickerAnimado,
  filtrarEmojisEmojiGg,
  gifsDestacados,
  guardarStickerMio,
  guardarStickerMioEnNube,
  tieneApiGifs,
  leerEmojisRecientes,
  leerMisStickers,
  leerStickersFavoritos,
  leerStickersRecientes,
  marcarEmojiReciente,
  marcarStickerReciente,
  suscribirMisStickers,
  toggleStickerFavorito,
} from '../asistente/messengerStickers'
import { StickerChat } from '../asistente/limpiarFondoSticker.jsx'

/**
 * Panel estilo WhatsApp: Emojis | GIF | Stickers
 * Emojis = unicode + catálogo custom de emoji.gg
 */
export default function PanelMediaWhatsApp({
  stickers = [],
  db = null,
  usuarioEmail = '',
  onInsertEmoji,
  onSendSticker,
  onSendGif,
  onCrearSticker,
  creandoSticker = false,
  onClose,
  onToast,
  darkMode = false,
}) {
  const [modo, setModo] = useState('sticker') // emoji | gif | sticker
  const [catEmoji, setCatEmoji] = useState('caras')
  const [catSticker, setCatSticker] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [gifs, setGifs] = useState([])
  const [cargandoGif, setCargandoGif] = useState(false)
  const [errorGif, setErrorGif] = useState('')
  const [recientesStickers, setRecientesStickers] = useState(() => leerStickersRecientes())
  const [favStickers, setFavStickers] = useState(() => leerStickersFavoritos())
  const [misStickers, setMisStickers] = useState(() => leerMisStickers())
  const [recientesEmojis, setRecientesEmojis] = useState(() => leerEmojisRecientes())
  const [emojiGg, setEmojiGg] = useState([])
  const [cargandoEmojiGg, setCargandoEmojiGg] = useState(false)
  const [errorEmojiGg, setErrorEmojiGg] = useState('')
  const [modalGuardarSticker, setModalGuardarSticker] = useState(null) // { url, label, formato }
  const [guardandoStickerMio, setGuardandoStickerMio] = useState(false)
  const [eliminandoStickerMio, setEliminandoStickerMio] = useState(false)

  // "Mis stickers" se sincroniza con Firestore (cache local como respaldo).
  useEffect(() => {
    if (!usuarioEmail) return undefined
    return suscribirMisStickers(db, usuarioEmail, setMisStickers)
  }, [db, usuarioEmail])

  const pal = useMemo(
    () =>
      darkMode
        ? {
            panel: 'border-[#2a3942] bg-[#111b21] text-[#e9edef] shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
            iconOn: 'text-white',
            iconOff: 'text-[#8696a0] hover:text-[#e9edef]',
            underline: 'bg-[#00a884]',
            divider: 'bg-[#2a3942]',
            input: 'bg-[#2a3942] text-[#e9edef] placeholder:text-[#8696a0]',
            hoverSoft: 'hover:bg-white/10',
            hoverSofter: 'hover:bg-white/5',
            muted: 'text-[#8696a0]',
            tile: 'bg-[#2a3942]',
            createTile: 'border-[#3b4a54] bg-[#1c272d] hover:bg-[#243138]',
            ghostBtn: 'border-[#3b4a54] text-[#8696a0] hover:text-white hover:border-[#8696a0]',
            accent: 'text-[#00a884]',
            accentRing: 'hover:ring-[#00a884]',
            switchWrap: 'bg-[#1c272d] border-[#2a3942]',
            switchOn: 'bg-[#2a3942] text-white',
            close: 'text-[#8696a0] hover:bg-white/5 hover:text-white',
            error: 'text-red-400',
          }
        : {
            panel: 'border-gray-200 bg-white text-gray-900 shadow-[0_12px_40px_rgba(15,23,42,0.16)]',
            iconOn: 'text-emerald-700',
            iconOff: 'text-gray-500 hover:text-gray-900',
            underline: 'bg-emerald-500',
            divider: 'bg-gray-200',
            input: 'bg-gray-100 text-gray-900 placeholder:text-gray-500',
            hoverSoft: 'hover:bg-gray-200',
            hoverSofter: 'hover:bg-gray-100',
            muted: 'text-gray-500',
            tile: 'bg-gray-200',
            createTile: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
            ghostBtn: 'border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400',
            accent: 'text-emerald-600',
            accentRing: 'hover:ring-emerald-500',
            switchWrap: 'bg-gray-100 border-gray-200',
            switchOn: 'bg-white text-emerald-700 shadow-sm',
            close: 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
            error: 'text-red-600',
          },
    [darkMode]
  )

  useEffect(() => {
    if (modo !== 'gif') return undefined
    let cancelled = false
    const t = setTimeout(async () => {
      setCargandoGif(true)
      setErrorGif('')
      try {
        const q = busqueda.trim()
        const rows = q ? await buscarGifs(q) : await gifsDestacados()
        if (!cancelled) setGifs(rows)
      } catch (err) {
        if (!cancelled) {
          setGifs([])
          setErrorGif(err.message || 'No se pudieron cargar GIFs')
        }
      } finally {
        if (!cancelled) setCargandoGif(false)
      }
    }, busqueda.trim() ? 350 : 0)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [modo, busqueda])

  useEffect(() => {
    if (modo !== 'emoji') return undefined
    let cancelled = false
    ;(async () => {
      setCargandoEmojiGg(true)
      setErrorEmojiGg('')
      try {
        const rows = await cargarEmojisEmojiGg()
        if (!cancelled) setEmojiGg(rows)
      } catch (err) {
        if (!cancelled) {
          setEmojiGg([])
          setErrorEmojiGg(err?.message || 'No se pudo cargar emoji.gg')
        }
      } finally {
        if (!cancelled) setCargandoEmojiGg(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [modo])

  const catsEmojiGg = useMemo(() => {
    if (!emojiGg.length) return EMOJIGG_CATEGORIES
    const present = new Set(emojiGg.map((e) => e.category))
    const filtered = EMOJIGG_CATEGORIES.filter((c) => present.has(c.id))
    return filtered.length ? filtered : EMOJIGG_CATEGORIES
  }, [emojiGg])

  const esCatEmojiGg = String(catEmoji || '').startsWith('eg-')
  const catEmojiGgId = esCatEmojiGg ? Number(String(catEmoji).replace(/^eg-/, '')) : null

  const emojisUnicodeVista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (catEmoji === 'recientes') {
      const list = recientesEmojis.length
        ? recientesEmojis.filter((e) => !esEmojiGgUrl(e) && !/^https?:\/\//i.test(e))
        : EMOJI_PACKS.find((p) => p.id === 'caras')?.items || []
      return q ? list.filter((e) => e.includes(q)) : list
    }
    if (esCatEmojiGg) return []
    const pack = EMOJI_PACKS.find((p) => p.id === catEmoji)
    const items = pack?.items || []
    return q ? items.filter((e) => e.includes(q)) : items
  }, [catEmoji, busqueda, recientesEmojis, esCatEmojiGg])

  const emojisGgVista = useMemo(() => {
    const q = busqueda.trim()
    if (catEmoji === 'recientes') {
      const urls = recientesEmojis.filter((e) => esEmojiGgUrl(e) || /^https:\/\/cdn\d+\.emoji\.gg\//i.test(e))
      const map = new Map(emojiGg.map((e) => [e.url, e]))
      let list = urls.map((url) => map.get(url) || { id: url, url, title: 'emoji.gg' })
      if (q) {
        const ql = q.toLowerCase()
        list = list.filter((e) => (e.title || '').toLowerCase().includes(ql) || e.url.toLowerCase().includes(ql))
      }
      return list
    }
    if (!esCatEmojiGg && !q) return []
    // Con búsqueda en pack unicode: también sugerir coincidencias de emoji.gg
    if (!esCatEmojiGg && q) {
      return filtrarEmojisEmojiGg(emojiGg, { query: q, limitCount: 48 })
    }
    return filtrarEmojisEmojiGg(emojiGg, {
      category: catEmojiGgId,
      query: q,
      limitCount: 160,
    })
  }, [catEmoji, busqueda, emojiGg, recientesEmojis, esCatEmojiGg, catEmojiGgId])

  const stickersVista = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    let list = stickers
    const conCatalogo = (items) => {
      const map = new Map(stickers.map((s) => [s.url, s]))
      return items
        .map((it) => {
          const url = typeof it === 'string' ? it : it.url
          if (!url) return null
          const base = map.get(url)
          const label =
            (typeof it === 'string' ? '' : it.label) || base?.label || 'Sticker'
          return {
            ...(base || {}),
            id: (typeof it === 'string' ? it : it.id) || url,
            url,
            label,
            formato:
              (typeof it === 'string' ? '' : it.formato) ||
              base?.formato ||
              detectarFormatoUrl(url),
            animado: esStickerAnimado(url),
            propio: typeof it === 'object' && Boolean(it.id),
          }
        })
        .filter(Boolean)
    }
    if (catSticker === 'recientes') {
      list = conCatalogo(recientesStickers)
    } else if (catSticker === 'favoritos') {
      list = conCatalogo(favStickers)
    } else if (catSticker === 'mios') {
      list = conCatalogo(misStickers)
    }
    if (!q) return list
    return list.filter(
      (s) => (s.label || '').toLowerCase().includes(q) || s.url.toLowerCase().includes(q)
    )
  }, [stickers, catSticker, busqueda, recientesStickers, favStickers, misStickers])

  const placeholder =
    modo === 'emoji'
      ? 'Buscar emoji o emoji.gg…'
      : modo === 'gif'
        ? 'Buscar GIF (hola, risa, gracias…)'
        : 'Buscar stickers'

  const categoriasSticker = [
    { id: 'recientes', icon: <Clock size={16} />, title: 'Recientes' },
    { id: 'favoritos', icon: <Star size={16} />, title: 'Favoritos' },
    { id: 'mios', icon: <Download size={16} />, title: 'Mis stickers' },
    { id: 'todos', icon: <Sticker size={16} />, title: 'Todos' },
  ]

  function enviarEmojiGg(item) {
    const url = item?.url
    if (!url) return
    marcarEmojiReciente(url)
    marcarStickerReciente(url)
    setRecientesEmojis(leerEmojisRecientes())
    setRecientesStickers(leerStickersRecientes())
    onSendSticker?.(url)
  }

  const abrirModalGuardarSticker = (sticker) => {
    if (!sticker?.url) return
    setModalGuardarSticker({
      url: sticker.url,
      label: sticker.label || 'Sticker',
      formato: sticker.formato || detectarFormatoUrl(sticker.url),
      animado: esStickerAnimado(sticker.url),
    })
  }

  const cerrarModalGuardarSticker = () => {
    setModalGuardarSticker(null)
  }

  const confirmarGuardarStickerMio = async () => {
    const url = modalGuardarSticker?.url
    if (!url) return
    setGuardandoStickerMio(true)
    try {
      if (db && usuarioEmail) {
        await guardarStickerMioEnNube(db, {
          url,
          by: usuarioEmail,
          label: modalGuardarSticker.label,
          formato: modalGuardarSticker.formato,
        })
      }
      setMisStickers(guardarStickerMio(url, modalGuardarSticker.label))
      onToast?.('Sticker guardado en "Mis stickers"')
      cerrarModalGuardarSticker()
    } catch (err) {
      onToast?.(err?.message || 'No se pudo guardar el sticker')
    } finally {
      setGuardandoStickerMio(false)
    }
  }

  const eliminarStickerDeMios = async (sticker) => {
    const url = sticker?.url
    if (!url) return
    setEliminandoStickerMio(true)
    try {
      if (db && usuarioEmail && sticker.id) {
        await eliminarStickerMioEnNube(db, sticker.id, usuarioEmail)
      }
      setMisStickers(eliminarStickerMio(url))
      onToast?.('Sticker eliminado de "Mis stickers"')
    } catch (err) {
      onToast?.(err?.message || 'No se pudo eliminar el sticker')
    } finally {
      setEliminandoStickerMio(false)
    }
  }

  return (
    <div className={`absolute left-2 right-2 sm:left-3 sm:right-auto bottom-[calc(100%+6px)] z-30 w-auto sm:w-[22.5rem] max-w-[calc(100%-1rem)] rounded-2xl overflow-hidden border animate-in fade-in zoom-in-95 duration-150 ${pal.panel}`}>
      {/* Categorías superiores */}
      <div className="flex items-center gap-1 px-2 pt-2 pb-1 overflow-x-auto [scrollbar-width:none]">
        {modo === 'emoji' && (
          <>
            {EMOJI_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                title={pack.label}
                onClick={() => setCatEmoji(pack.id)}
                className={`relative shrink-0 w-9 h-9 flex items-center justify-center text-lg rounded-md ${
                  catEmoji === pack.id ? pal.iconOn : pal.iconOff
                }`}
              >
                {pack.id === 'recientes' ? <Clock size={16} /> : pack.icon}
                {catEmoji === pack.id && (
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${pal.underline}`} />
                )}
              </button>
            ))}
            <span className={`shrink-0 w-px h-5 mx-0.5 self-center ${pal.divider}`} aria-hidden />
            {catsEmojiGg.map((pack) => (
              <button
                key={`eg-${pack.id}`}
                type="button"
                title={`emoji.gg · ${pack.label}`}
                onClick={() => setCatEmoji(`eg-${pack.id}`)}
                className={`relative shrink-0 w-9 h-9 flex items-center justify-center text-base rounded-md ${
                  catEmoji === `eg-${pack.id}` ? pal.iconOn : pal.iconOff
                }`}
              >
                <span className="text-sm leading-none">{pack.icon}</span>
                {catEmoji === `eg-${pack.id}` && (
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${pal.underline}`} />
                )}
              </button>
            ))}
          </>
        )}

        {modo === 'sticker' &&
          categoriasSticker.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.title}
              onClick={() => setCatSticker(c.id)}
              className={`relative shrink-0 w-9 h-9 flex items-center justify-center rounded-md ${
                catSticker === c.id ? pal.iconOn : pal.iconOff
              }`}
            >
              {c.icon}
              {catSticker === c.id && (
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${pal.underline}`} />
              )}
            </button>
          ))}

        {modo === 'sticker' && (
          <button
            type="button"
            title="Crear sticker"
            disabled={creandoSticker}
            onClick={() => onCrearSticker?.()}
            className={`ml-auto shrink-0 w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-50 ${pal.ghostBtn}`}
          >
            {creandoSticker ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
          </button>
        )}

        {modo === 'gif' && (
          <p className={`px-2 text-[11px] ${pal.muted}`}>
            {tieneApiGifs() ? 'Giphy / Tenor' : 'Pack Apex · busca: hola, risa, ok…'}
          </p>
        )}

        {modo === 'emoji' && esCatEmojiGg && (
          <p className={`ml-auto shrink-0 px-1 text-[10px] ${pal.muted}`}>emoji.gg</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`shrink-0 ml-1 p-1.5 rounded-full transition-colors ${pal.close}`}
          title="Cerrar"
        >
          <X size={14} />
        </button>
      </div>

      {/* Buscador */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${pal.muted}`} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={placeholder}
            className={`w-full pl-9 pr-3 py-2 rounded-full text-xs border-0 outline-none ${pal.input}`}
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="vtr-msg-scroll h-[13.5rem] overflow-y-auto px-2 pb-2">
        {modo === 'emoji' && (
          <div>
            {cargandoEmojiGg && esCatEmojiGg && emojiGg.length === 0 && (
              <div className={`flex justify-center py-10 ${pal.accent}`}>
                <Loader2 size={22} className="animate-spin" />
              </div>
            )}
            {errorEmojiGg && esCatEmojiGg && emojiGg.length === 0 && (
              <p className={`text-center text-xs py-8 ${pal.error}`}>{errorEmojiGg}</p>
            )}

            {!esCatEmojiGg && emojisUnicodeVista.length > 0 && (
              <div className="grid grid-cols-8 gap-0.5 mb-1">
                {emojisUnicodeVista.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    type="button"
                    onClick={() => {
                      marcarEmojiReciente(emoji)
                      setRecientesEmojis(leerEmojisRecientes())
                      onInsertEmoji?.(emoji)
                    }}
                    className={`aspect-square text-xl sm:text-2xl rounded-md active:scale-95 ${pal.hoverSoft}`}
                    title="Insertar emoji"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {emojisGgVista.length > 0 && (
              <>
                {!esCatEmojiGg && busqueda.trim() && (
                  <p className={`text-[10px] px-1 py-1 ${pal.muted}`}>emoji.gg</p>
                )}
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
                  {emojisGgVista.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => enviarEmojiGg(item)}
                      className={`aspect-square rounded-md p-1 flex items-center justify-center active:scale-95 ${pal.hoverSoft}`}
                      title={item.title || 'emoji.gg'}
                    >
                      <StickerChat
                        src={item.url}
                        alt={item.title || ''}
                        className="w-8 h-8"
                        loading="lazy"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}

            {!cargandoEmojiGg &&
              emojisUnicodeVista.length === 0 &&
              emojisGgVista.length === 0 &&
              !errorEmojiGg && (
                <p className={`text-center text-xs py-8 ${pal.muted}`}>Sin resultados</p>
              )}
          </div>
        )}

        {modo === 'gif' && (
          <div>
            {cargandoGif && (
              <div className={`flex justify-center py-10 ${pal.accent}`}>
                <Loader2 size={22} className="animate-spin" />
              </div>
            )}
            {!cargandoGif && errorGif && (
              <p className={`text-center text-xs py-8 ${pal.error}`}>{errorGif}</p>
            )}
            {!cargandoGif && !errorGif && gifs.length === 0 && (
              <p className={`text-center text-xs py-8 ${pal.muted}`}>Sin resultados</p>
            )}
            {!cargandoGif && gifs.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {gifs.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onSendGif?.(g.url)}
                    className={`aspect-square rounded-lg overflow-hidden hover:ring-2 active:scale-[0.98] ${pal.tile} ${pal.accentRing}`}
                    title={g.label}
                  >
                    <img src={g.preview || g.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {modo === 'sticker' && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            <button
              type="button"
              disabled={creandoSticker}
              onClick={() => onCrearSticker?.()}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 disabled:opacity-50 ${pal.createTile} ${pal.iconOff}`}
            >
              {creandoSticker ? (
                <Loader2 size={22} className={`animate-spin ${pal.accent}`} />
              ) : (
                <Plus size={22} />
              )}
              <span className="text-[11px] font-medium">Crear</span>
            </button>
            {stickersVista.map((s) => (
              <div key={s.id || s.url} className="relative group aspect-square">
                <button
                  type="button"
                  onClick={() => {
                    marcarStickerReciente(s.url)
                    setRecientesStickers(leerStickersRecientes())
                    onSendSticker?.(s.url)
                  }}
                  className={`w-full h-full rounded-xl p-1.5 flex items-center justify-center active:scale-95 ${pal.hoverSofter}`}
                  title={s.label ? `${s.label}${s.formato ? ` · ${s.formato.toUpperCase()}` : ''}` : 'Enviar sticker'}
                >
                  <StickerChat
                    src={s.url}
                    alt={s.label || 'Sticker'}
                    className="w-14 h-14"
                    draggable={false}
                  />
                  {s.animado && (
                    <span
                      className="absolute left-1 bottom-1 text-[8px] font-bold px-1 rounded bg-black/60 text-white pointer-events-none"
                      aria-hidden
                    >
                      GIF
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  title={favStickers.includes(s.url) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    const nuevosFavs = toggleStickerFavorito(s.url)
                    setFavStickers(nuevosFavs)
                  }}
                  className={`absolute top-0.5 right-0.5 p-0.5 rounded transition-colors z-10 ${
                    favStickers.includes(s.url) ? 'opacity-100 text-[#f7c948]' : 'opacity-0 group-hover:opacity-100'
                  } ${pal.muted} hover:text-[#f7c948]`}
                >
                  <Star
                    size={12}
                    className={favStickers.includes(s.url) ? 'fill-[#f7c948] text-[#f7c948]' : ''}
                  />
                </button>
                <button
                  type="button"
                  title="Guardar en mis stickers"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    abrirModalGuardarSticker(s)
                  }}
                  className={`absolute top-0.5 left-0.5 p-0.5 rounded transition-colors z-10 opacity-0 group-hover:opacity-100 ${pal.muted} hover:text-[#00a884]`}
                >
                  <Download size={12} />
                </button>
                {catSticker === 'mios' && (
                  <button
                    type="button"
                    title="Eliminar de mis stickers"
                    disabled={eliminandoStickerMio}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      eliminarStickerDeMios(s)
                    }}
                    className={`absolute bottom-0.5 right-0.5 p-0.5 rounded transition-colors z-10 opacity-0 group-hover:opacity-100 disabled:opacity-50 ${pal.muted} hover:text-red-400`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Switcher inferior */}
      <div className="px-3 pb-3 pt-1 flex justify-center">
        <div className={`inline-flex items-center rounded-full p-1 border ${pal.switchWrap}`}>
          <button
            type="button"
            onClick={() => {
              setModo('emoji')
              setBusqueda('')
            }}
            className={`w-11 h-9 rounded-full flex items-center justify-center transition ${
              modo === 'emoji' ? pal.switchOn : pal.iconOff
            }`}
            title="Emojis"
          >
            <Smile size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              setModo('gif')
              setBusqueda('')
            }}
            className={`px-3 h-9 rounded-full text-xs font-bold tracking-wide transition ${
              modo === 'gif' ? pal.switchOn : pal.iconOff
            }`}
            title="GIF"
          >
            GIF
          </button>
          <button
            type="button"
            onClick={() => {
              setModo('sticker')
              setBusqueda('')
            }}
            className={`w-11 h-9 rounded-full flex items-center justify-center transition ${
              modo === 'sticker' ? pal.switchOn : pal.iconOff
            }`}
            title="Stickers"
          >
            <Sticker size={18} />
          </button>
        </div>
      </div>

      {/* Modal para guardar sticker en mis stickers */}
      {modalGuardarSticker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-gray-200'
          }`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              darkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Guardar sticker
              </h3>
              <button
                type="button"
                onClick={cerrarModalGuardarSticker}
                className={`p-1 rounded-full ${darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'} transition-colors`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-center">
                <StickerChat
                  src={modalGuardarSticker.url}
                  alt={modalGuardarSticker.label}
                  className="w-24 h-24"
                  draggable={false}
                />
              </div>
              <p className={`text-xs text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                ¿Quieres guardar este sticker en tu colección personal?
              </p>
              <p className={`text-[10px] text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {modalGuardarSticker.label}
                {modalGuardarSticker.formato
                  ? ` · ${modalGuardarSticker.formato.toUpperCase()}`
                  : ''}
                {modalGuardarSticker.animado ? ' · animado' : ''}
              </p>
            </div>

            <div className={`flex items-center justify-end gap-2 px-4 py-3 border-t ${
              darkMode ? 'border-white/10' : 'border-gray-200'
            }`}>
              <button
                type="button"
                onClick={cerrarModalGuardarSticker}
                disabled={guardandoStickerMio}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarGuardarStickerMio}
                disabled={guardandoStickerMio}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(45,212,191,0.35)] disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {guardandoStickerMio ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
