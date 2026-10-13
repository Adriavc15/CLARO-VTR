import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'

const DOMINIO = 'apexamerica.com'
const LS_RECIENTES_STICKERS = 'vtr-messenger-stickers-recientes'
const LS_RECIENTES_EMOJIS = 'vtr-messenger-emojis-recientes'
const LS_FAV_STICKERS = 'vtr-messenger-stickers-fav'
const LS_MIS_STICKERS = 'vtr-messenger-stickers-mios'
const MAX_MIS_STICKERS = 120

/**
 * Formatos de sticker soportados. Los GIF y WebP animados se suben sin
 * recomprimir para no perder la animación.
 */
export const FORMATOS_STICKER = ['png', 'webp', 'gif']
const EXT_POR_FORMATO = {
  jpg: /\.(jpe?g)$/i,
  png: /\.(png|apng)$/i,
  webp: /\.webp$/i,
  gif: /\.gif$/i,
}

/** Formato de una URL de sticker a partir de su extensión. */
export function detectarFormatoUrl(url) {
  const u = String(url || '').trim()
  if (!u) return ''
  if (/^data:image\//i.test(u)) {
    const mime = u.slice(5, u.indexOf(';') > 0 ? u.indexOf(';') : 20).toLowerCase()
    if (mime.includes('gif')) return 'gif'
    if (mime.includes('webp')) return 'webp'
    if (mime.includes('png')) return 'png'
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
    return ''
  }
  const limpio = u.split(/[?#]/)[0]
  for (const fmt of FORMATOS_STICKER) {
    if (EXT_POR_FORMATO[fmt].test(limpio)) return fmt
  }
  if (EXT_POR_FORMATO.jpg.test(limpio)) return 'jpg'
  return ''
}

/** ¿La URL apunta a un GIF (o APNG), es decir un sticker animado? */
export function esStickerAnimado(url) {
  const fmt = detectarFormatoUrl(url)
  if (fmt === 'gif') return true
  if (fmt === 'png' && /\.apng$/i.test(String(url).split(/[?#]/)[0])) return true
  return false
}


function normalizarEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function esApex(email) {
  const e = normalizarEmail(email)
  return Boolean(e) && e.endsWith(`@${DOMINIO}`) && e.length > DOMINIO.length + 1
}

function leerLista(key) {
  try {
    const raw = localStorage.getItem(key)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && x) : []
  } catch {
    return []
  }
}

function guardarLista(key, items, max = 24) {
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, max)))
  } catch {
    /* ignore */
  }
}

export function leerStickersRecientes() {
  return leerLista(LS_RECIENTES_STICKERS)
}

export function marcarStickerReciente(url) {
  const u = String(url || '').trim()
  if (!u) return
  const next = [u, ...leerStickersRecientes().filter((x) => x !== u)]
  guardarLista(LS_RECIENTES_STICKERS, next)
}

export function leerEmojisRecientes() {
  return leerLista(LS_RECIENTES_EMOJIS)
}

export function marcarEmojiReciente(emoji) {
  const e = String(emoji || '').trim()
  if (!e) return
  const next = [e, ...leerEmojisRecientes().filter((x) => x !== e)]
  guardarLista(LS_RECIENTES_EMOJIS, next, 48)
}

export function leerStickersFavoritos() {
  return leerLista(LS_FAV_STICKERS)
}

export function toggleStickerFavorito(url) {
  const u = String(url || '').trim()
  if (!u) return leerStickersFavoritos()
  const cur = leerStickersFavoritos()
  const next = cur.includes(u) ? cur.filter((x) => x !== u) : [u, ...cur]
  guardarLista(LS_FAV_STICKERS, next, 40)
  return next
}

/** Normaliza entradas antiguas (string) y nuevas ({url,label,formato}). */
function normalizarStickerMio(raw) {
  if (typeof raw === 'string') {
    const url = raw.trim()
    return url ? { url, label: '', formato: detectarFormatoUrl(url) } : null
  }
  if (!raw || typeof raw !== 'object') return null
  const url = String(raw.url || '').trim()
  if (!url) return null
  return {
    url,
    label: String(raw.label || '').trim().slice(0, 40),
    formato: String(raw.formato || detectarFormatoUrl(url) || '').trim().slice(0, 5),
  }
}

function leerMisStickersCache() {
  try {
    const raw = localStorage.getItem(LS_MIS_STICKERS)
    const arr = raw ? JSON.parse(raw) : []
    if (!Array.isArray(arr)) return []
    return arr.map(normalizarStickerMio).filter(Boolean)
  } catch {
    return []
  }
}

function guardarMisStickersCache(items) {
  try {
    localStorage.setItem(LS_MIS_STICKERS, JSON.stringify(items.slice(0, MAX_MIS_STICKERS)))
  } catch {
    /* quota / modo privado: la nube sigue siendo la fuente de verdad */
  }
}

/** "Mis stickers" locales (caché offline). Sincroniza con Firestore. */
export function leerMisStickers() {
  return leerMisStickersCache()
}

export function guardarStickerMio(url, label = '') {
  const u = String(url || '').trim()
  if (!u) return leerMisStickersCache()
  const cur = leerMisStickersCache()
  const next = cur.some((x) => x.url === u)
    ? cur.map((x) => (x.url === u ? { ...x, label: String(label || x.label).slice(0, 40) } : x))
    : [{ url: u, label: String(label || '').slice(0, 40), formato: detectarFormatoUrl(u) }, ...cur]
  guardarMisStickersCache(next)
  return next
}

export function eliminarStickerMio(url) {
  const u = String(url || '').trim()
  if (!u) return leerMisStickersCache()
  const next = leerMisStickersCache().filter((x) => x.url !== u)
  guardarMisStickersCache(next)
  return next
}

function mapDocStickerMio(d) {
  const data = d.data() || {}
  const item = normalizarStickerMio({ url: data.url, label: data.label, formato: data.formato })
  return item ? { id: d.id, ...item } : null
}

/**
 * Suscribe "Mis stickers" desde Firestore para que la colección exista en
 * todos los equipos del usuario y no se pierda al limpiar el navegador.
 */
export function suscribirMisStickers(db, by, onData, onError) {
  const cache = leerMisStickersCache()
  if (!db || !esApex(by)) {
    onData(cache)
    return () => {}
  }
  const q = query(
    collection(db, 'mis_stickers'),
    where('by', '==', normalizarEmail(by)),
    orderBy('createdAt', 'desc'),
    limit(MAX_MIS_STICKERS)
  )
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map(mapDocStickerMio).filter(Boolean)
      if (snap.empty && cache.length) {
        // Firestore vacío: no pises la caché local sin avisar.
        onData(cache)
        return
      }
      guardarMisStickersCache(rows.map(({ id, ...rest }) => rest))
      onData(rows)
    },
    (err) => {
      console.warn('No se pudo leer "Mis stickers" de la nube:', err?.message || err)
      onError?.(err)
      onData(cache)
    }
  )
}

/** Guarda un sticker en la colección personal del usuario (Firestore). */
export async function guardarStickerMioEnNube(db, { url, by, label = '', formato = '' }) {
  const me = normalizarEmail(by)
  const u = String(url || '').trim().slice(0, 800)
  if (!esApex(me)) throw new Error('Solo usuarios Apex pueden guardar stickers')
  if (!/^https:\/\//i.test(u)) throw new Error('El sticker debe ser una imagen subida (URL https)')
  if (!db) throw new Error('Sin conexión con la base de datos')
  const ref = await addDoc(collection(db, 'mis_stickers'), {
    url: u,
    label: String(label || 'Sticker').trim().slice(0, 40) || 'Sticker',
    formato: String(formato || detectarFormatoUrl(u) || '').trim().slice(0, 5),
    by: me,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/** Borra un sticker de la colección personal del usuario (Firestore). */
export async function eliminarStickerMioEnNube(db, id, by) {
  const me = normalizarEmail(by)
  if (!esApex(me)) throw new Error('Solo usuarios Apex pueden borrar stickers')
  if (!db || !id) throw new Error('Sticker no encontrado')
  await deleteDoc(doc(db, 'mis_stickers', id))
}


/** Stickers por defecto del portal (imágenes en /public). */
export const STICKERS_SEED = [
  { id: 'perrito', url: '/PERRITO.gif', label: 'Perrito' },
  { id: 'messenger', url: '/messenger.png', label: 'Messenger' },
  { id: 'genesys', url: '/genesys.png', label: 'Genesys' },
  { id: 'apex', url: '/apex%202.png', label: 'Apex' },
  { id: 'telemundo', url: '/telemundo.png', label: 'Telemundo' },
]

export const EMOJI_PACKS = [
  {
    id: 'recientes',
    label: 'Recientes',
    icon: '🕒',
  },
  {
    id: 'caras',
    label: 'Caras',
    icon: '😀',
    items: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑',
      '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
      '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
      '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕',
      '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰',
      '😥', '😢', '😭', '😱', '😖', 'perse', '😞', '😓', '😩', '😫', '🥱', '😤',
      '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻',
      '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
    ],
  },
  {
    id: 'gestos',
    label: 'Gestos',
    icon: '👍',
    items: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
      '✍️', '💅', '🤳', '💪', '🦾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌',
      '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
      '🫵', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️',
      '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨', '🌟', '💫',
      '⭐', '🌈', '☀️', '🌙', '⚡', '💯', '✅', '❌', '🎉', '🎊', '🎈', '🎁',
    ],
  },
  {
    id: 'animales',
    label: 'Animales',
    icon: '🐶',
    items: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
      '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅',
      '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🦋', '🐌', '🐞', '🐜', '🪲',
      '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠',
      '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘',
    ],
  },
  {
    id: 'comida',
    label: 'Comida',
    icon: '🍕',
    items: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
      '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️',
      '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖',
      '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴',
      '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗',
      '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤',
      '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧',
      '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜',
      '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸',
    ],
  },
]

// Fix typo perse -> 😣
EMOJI_PACKS.forEach((p) => {
  if (p.items) {
    p.items = p.items.map((x) => (x === 'perse' ? '😣' : x))
  }
})

export function esStickerUrlValida(url) {
  const u = String(url || '').trim()
  if (!u || u.length > 800) return false
  if (u.startsWith('/') && u.length > 1) return true
  return /^https:\/\//i.test(u)
}

/** Hosts de los que sabemos que sirven imágenes aunque la URL no traiga extensión. */
const HOSTS_IMAGEN = /^(i\.ibb\.co|i\.imgbb\.com|media\d*\.giphy\.com|media\d*\.tenor\.com|(cdn\d+\.)?emoji\.gg|tenor\.googleapis\.com|media\.tenor\.com)$/i

/**
 * El catálogo exige una URL que el <img> pueda pintar: extensión de imagen
 * reconocida o un host de imágenes conocido (i.ibb.co, Giphy, emoji.gg…).
 */
export function esStickerUrlRenderizable(url) {
  if (!esStickerUrlValida(url)) return false
  const u = String(url).trim()
  if (u.startsWith('/')) return true
  if (detectarFormatoUrl(u)) return true
  try {
    return HOSTS_IMAGEN.test(new URL(u).hostname)
  } catch {
    return false
  }
}


export function suscribirStickersCatalogo(db, onData, onError) {
  if (!db) {
    onData(STICKERS_SEED.map((s) => ({ ...s, by: '' })))
    return () => {}
  }
  const q = query(
    collection(db, 'messenger_stickers'),
    orderBy('createdAt', 'desc'),
    limit(120)
  )
  return onSnapshot(
    q,
    (snap) => {
      const remotos = snap.docs
        .map((d) => {
          const data = d.data() || {}
          const url = String(data.url || '').trim()
          return {
            id: d.id,
            url,
            label: String(data.label || 'Sticker').trim().slice(0, 40),
            by: normalizarEmail(data.by),
            formato: String(data.formato || detectarFormatoUrl(url) || '').slice(0, 5),
            animado: esStickerAnimado(url),
          }
        })
        .filter((s) => esStickerUrlRenderizable(s.url))

      const usados = new Set(remotos.map((s) => s.url))
      const locales = STICKERS_SEED.filter((s) => !usados.has(s.url)).map((s) => ({
        ...s,
        by: '',
      }))
      onData([...locales, ...remotos])
    },
    (err) => {
      console.error('Error stickers:', err)
      onError?.(err)
      onData(STICKERS_SEED.map((s) => ({ ...s, by: '' })))
    }
  )
}

export async function publicarSticker(db, { url, by, label = 'Sticker' }) {
  const me = normalizarEmail(by)
  const u = String(url || '').trim().slice(0, 800)
  if (!esApex(me)) throw new Error('Solo usuarios Apex pueden subir stickers')
  if (!esStickerUrlRenderizable(u) || !/^https:\/\//i.test(u)) {
    throw new Error('El sticker debe ser una imagen subida (URL https)')
  }
  await addDoc(collection(db, 'messenger_stickers'), {
    url: u,
    label: String(label || 'Sticker').trim().slice(0, 40) || 'Sticker',
    by: me,
    createdAt: serverTimestamp(),
  })
}

/** Catálogo local de GIFs (siempre funciona sin API). */
export const GIF_PACK = [
  { id: 'hola1', url: 'https://i.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', preview: 'https://i.giphy.com/media/3oEjI6SIIHBdRxXI40/200.gif', label: 'hola saludo', tags: ['hola', 'saludo', 'hi', 'hello'] },
  { id: 'hola2', url: 'https://i.giphy.com/media/xT9IgG50H7W4pZf8pG/giphy.gif', preview: 'https://i.giphy.com/media/xT9IgG50H7W4pZf8pG/200.gif', label: 'hola wave', tags: ['hola', 'wave'] },
  { id: 'risa1', url: 'https://i.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif', preview: 'https://i.giphy.com/media/3o6Zt6ML6BklcajjsA/200.gif', label: 'risa lol', tags: ['risa', 'lol', 'jaja'] },
  { id: 'risa2', url: 'https://i.giphy.com/media/10JhviFuU2dRk4/giphy.gif', preview: 'https://i.giphy.com/media/10JhviFuU2dRk4/200.gif', label: 'jajaja', tags: ['risa', 'jaja'] },
  { id: 'ok1', url: 'https://i.giphy.com/media/111ebonMs90YLu/giphy.gif', preview: 'https://i.giphy.com/media/111ebonMs90YLu/200.gif', label: 'ok like', tags: ['ok', 'bien', 'like', 'si'] },
  { id: 'clap1', url: 'https://i.giphy.com/media/7rj2ZgEhK3z6Ka7sE6/giphy.gif', preview: 'https://i.giphy.com/media/7rj2ZgEhK3z6Ka7sE6/200.gif', label: 'aplausos', tags: ['aplausos', 'bravo', 'clap'] },
  { id: 'gracias1', url: 'https://i.giphy.com/media/osjgQPWRx3hb0/giphy.gif', preview: 'https://i.giphy.com/media/osjgQPWRx3hb0/200.gif', label: 'gracias', tags: ['gracias', 'thanks'] },
  { id: 'no1', url: 'https://i.giphy.com/media/14SAx6S02io0CI/giphy.gif', preview: 'https://i.giphy.com/media/14SAx6S02io0CI/200.gif', label: 'no', tags: ['no', 'nope'] },
  { id: 'love1', url: 'https://i.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://i.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif', label: 'amor', tags: ['amor', 'love', 'corazon'] },
  { id: 'fire1', url: 'https://i.giphy.com/media/l0MYC0LajbUQzFbzy/giphy.gif', preview: 'https://i.giphy.com/media/l0MYC0LajbUQzFbzy/200.gif', label: 'fuego', tags: ['fuego', 'fire'] },
  { id: 'wow1', url: 'https://i.giphy.com/media/5VKbvrjxpVJCM/giphy.gif', preview: 'https://i.giphy.com/media/5VKbvrjxpVJCM/200.gif', label: 'wow', tags: ['wow', 'omg'] },
  { id: 'sad1', url: 'https://i.giphy.com/media/OPU6wzx8JrHna/giphy.gif', preview: 'https://i.giphy.com/media/OPU6wzx8JrHna/200.gif', label: 'triste', tags: ['triste', 'sad'] },
  { id: 'coffee1', url: 'https://i.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif', preview: 'https://i.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/200.gif', label: 'cafe', tags: ['cafe', 'coffee'] },
  { id: 'wait1', url: 'https://i.giphy.com/media/xTkcEQACH24SMLiMzE/giphy.gif', preview: 'https://i.giphy.com/media/xTkcEQACH24SMLiMzE/200.gif', label: 'espera', tags: ['espera', 'wait', 'loading'] },
  { id: 'ayuda1', url: 'https://i.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif', preview: 'https://i.giphy.com/media/3o7btPCcdNniyf0ArS/200.gif', label: 'ayuda', tags: ['ayuda', 'help'] },
  { id: 'bye1', url: 'https://i.giphy.com/media/3orieYLRREnD0e3Khy/giphy.gif', preview: 'https://i.giphy.com/media/3orieYLRREnD0e3Khy/200.gif', label: 'adios', tags: ['adios', 'bye', 'chao'] },
  { id: 'mind1', url: 'https://i.giphy.com/media/26tnkzcH8x0S8kI3i/giphy.gif', preview: 'https://i.giphy.com/media/26tnkzcH8x0S8kI3i/200.gif', label: 'mind blown', tags: ['wow', 'mind'] },
  { id: 'facepalm', url: 'https://i.giphy.com/media/XsUtdIeJ0MWMo/giphy.gif', preview: 'https://i.giphy.com/media/XsUtdIeJ0MWMo/200.gif', label: 'facepalm', tags: ['error', 'facepalm'] },
  { id: 'dance1', url: 'https://i.giphy.com/media/l0MYu5k5xN0zqWj8A/giphy.gif', preview: 'https://i.giphy.com/media/l0MYu5k5xN0zqWj8A/200.gif', label: 'bailar', tags: ['bailar', 'dance', 'fiesta'] },
  { id: 'work1', url: 'https://i.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif', preview: 'https://i.giphy.com/media/LmNwrBhejkK9EFP504/200.gif', label: 'trabajo', tags: ['trabajo', 'work'] },
  { id: 'yes1', url: 'https://i.giphy.com/media/YRuFixyJF9ewgR0n2i/giphy.gif', preview: 'https://i.giphy.com/media/YRuFixyJF9ewgR0n2i/200.gif', label: 'si yes', tags: ['si', 'yes'] },
  { id: 'party1', url: 'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', preview: 'https://i.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif', label: 'fiesta', tags: ['fiesta', 'party'] },
  { id: 'sleepy', url: 'https://i.giphy.com/media/NEvPzZ8bd1V4Y/giphy.gif', preview: 'https://i.giphy.com/media/NEvPzZ8bd1V4Y/200.gif', label: 'sueño sleep', tags: ['sueno', 'sleep', 'cansado'] },
  { id: 'deal', url: 'https://i.giphy.com/media/3oEduN3p3Kz5fJ8kqk/giphy.gif', preview: 'https://i.giphy.com/media/3oEduN3p3Kz5fJ8kqk/200.gif', label: 'trato deal', tags: ['trato', 'deal', 'ok'] },
]

function filtrarGifPack(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return GIF_PACK.slice(0, 24)
  return GIF_PACK.filter((g) => {
    const hay = `${g.label} ${(g.tags || []).join(' ')}`.toLowerCase()
    return hay.includes(q) || q.split(/\s+/).some((p) => hay.includes(p))
  }).slice(0, 24)
}

function mapGiphyItems(data) {
  const rows = Array.isArray(data?.data) ? data.data : []
  return rows
    .map((item) => {
      const images = item.images || {}
      const url = String(
        images.fixed_height?.url ||
          images.downsized?.url ||
          images.original?.url ||
          ''
      ).trim()
      const preview = String(
        images.fixed_height_small?.url ||
          images.preview_gif?.url ||
          images.fixed_width_small?.url ||
          url
      ).trim()
      return {
        id: String(item.id || url),
        url,
        preview,
        label: String(item.title || item.slug || 'GIF').slice(0, 40),
      }
    })
    .filter((g) => /^https:\/\//i.test(g.url) && g.url.length <= 800)
}

async function buscarGiphy(query, limitCount) {
  const key = String(import.meta.env.VITE_GIPHY_API_KEY || '').trim()
  if (!key) return null
  const endpoint = query
    ? `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&limit=${limitCount}&rating=pg-13&lang=es`
    : `https://api.giphy.com/v1/gifs/trending?api_key=${encodeURIComponent(key)}&limit=${limitCount}&rating=pg-13`
  const r = await fetch(endpoint)
  if (!r.ok) throw new Error(`Giphy HTTP ${r.status}`)
  return mapGiphyItems(await r.json())
}

async function buscarTenor(query, limitCount) {
  const key = String(import.meta.env.VITE_TENOR_API_KEY || '').trim()
  if (!key) return null
  const params = new URLSearchParams({
    key,
    client_key: 'vtr_mensajes_apex',
    limit: String(limitCount),
    media_filter: 'gif,tinygif',
    locale: 'es_ES',
  })
  if (query) params.set('q', query)
  const path = query ? 'search' : 'featured'
  const r = await fetch(`https://tenor.googleapis.com/v2/${path}?${params}`)
  if (!r.ok) throw new Error(`Tenor HTTP ${r.status}`)
  const data = await r.json()
  const results = Array.isArray(data.results) ? data.results : []
  return results
    .map((item) => {
      const media = item.media_formats || {}
      const gif = media.tinygif?.url || media.gif?.url || media.nanogif?.url || ''
      const preview = media.nanogif?.url || media.tinygif?.url || gif
      return {
        id: String(item.id || gif),
        url: String(gif || '').trim(),
        preview: String(preview || gif || '').trim(),
        label: String(item.content_description || 'GIF').slice(0, 40),
      }
    })
    .filter((g) => /^https:\/\//i.test(g.url) && g.url.length <= 800)
}

/** Busca GIFs: Giphy/Tenor si hay clave en .env, si no catálogo local. */
export async function buscarGifs(query, { limitCount = 24 } = {}) {
  const q = String(query || '').trim()
  try {
    const fromGiphy = await buscarGiphy(q, limitCount)
    if (fromGiphy?.length) return fromGiphy
  } catch (err) {
    console.warn('Giphy search falló:', err?.message || err)
  }
  try {
    const fromTenor = await buscarTenor(q || 'hola', limitCount)
    if (fromTenor?.length) return fromTenor
  } catch (err) {
    console.warn('Tenor search falló:', err?.message || err)
  }
  return filtrarGifPack(q)
}

export async function gifsDestacados({ limitCount = 24 } = {}) {
  return buscarGifs('', { limitCount })
}

export function tieneApiGifs() {
  return Boolean(
    String(import.meta.env.VITE_GIPHY_API_KEY || '').trim() ||
      String(import.meta.env.VITE_TENOR_API_KEY || '').trim()
  )
}

/** Categorías públicas de https://emoji.gg (sin NSFW). */
export const EMOJIGG_CATEGORIES = [
  { id: 1, label: 'Original', icon: '🟣' },
  { id: 18, label: 'Recolors', icon: '🎨' },
  { id: 3, label: 'Meme', icon: '😂' },
  { id: 4, label: 'Anime', icon: '🎌' },
  { id: 13, label: 'Pepe', icon: '🐸' },
  { id: 10, label: 'Gaming', icon: '🎮' },
  { id: 6, label: 'Blobs', icon: '🔵' },
  { id: 7, label: 'Thinking', icon: '🤔' },
  { id: 17, label: 'Animals', icon: '🐱' },
  { id: 15, label: 'Cute', icon: '🌸' },
  { id: 22, label: 'Reactions', icon: '😮' },
  { id: 20, label: 'Hearts', icon: '❤️' },
  { id: 8, label: 'Animated', icon: '✨' },
  { id: 21, label: 'Pixel', icon: '🧱' },
  { id: 23, label: 'Aesthetic', icon: '🌙' },
  { id: 2, label: 'TV / Movie', icon: '📺' },
  { id: 11, label: 'Letters', icon: '🔤' },
  { id: 14, label: 'Logos', icon: '🏷️' },
  { id: 16, label: 'Utility', icon: '🛠️' },
  { id: 19, label: 'Flags', icon: '🏳️' },
  { id: 12, label: 'Other', icon: '📦' },
]

const NSFW_CATEGORY = 9

let cacheEmojiGgMem = null
let promiseEmojiGg = null

function mapEmojiGgItem(raw) {
  // Formato API live o catálogo estático /emojigg-catalog.json
  const idNum = Number(String(raw?.id ?? '').replace(/^eg-/, '')) || 0
  const category = Number(raw?.category) || 0
  const title = String(raw?.title || '').trim()
  const image = String(raw?.image || raw?.url || '').trim()
  if (!image || !/^https:\/\//i.test(image) || image.length > 800) return null
  if (category === NSFW_CATEGORY) return null
  return {
    id: idNum ? `eg-${idNum}` : `eg-${image}`,
    title,
    slug: String(raw?.slug || '').trim(),
    url: image,
    category,
    faves: Number(raw?.faves) || 0,
  }
}

async function fetchEmojiGgJson(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!r.ok) throw new Error(`emoji.gg HTTP ${r.status}`)
  const data = await r.json()
  const rows = Array.isArray(data) ? data : []
  const items = rows.map(mapEmojiGgItem).filter(Boolean)
  items.sort((a, b) => (b.faves || 0) - (a.faves || 0))
  return items
}

/**
 * Catálogo custom de emoji.gg.
 * CORS bloquea emoji.gg/api desde el portal → usamos:
 * 1) proxy Vite `/emojigg-api` (dev)
 * 2) catálogo estático `/emojigg-catalog.json` (prod + fallback)
 */
export async function cargarEmojisEmojiGg() {
  if (cacheEmojiGgMem?.length) return cacheEmojiGgMem
  if (promiseEmojiGg) return promiseEmojiGg
  promiseEmojiGg = (async () => {
    // CORS + Cloudflare bloquean emoji.gg/api desde el navegador/Node;
    // el catálogo estático en /public es la fuente fiable.
    const endpoints = import.meta.env.DEV
      ? ['/emojigg-catalog.json', '/emojigg-api']
      : ['/emojigg-catalog.json']
    let lastErr = null
    for (const url of endpoints) {
      try {
        const items = await fetchEmojiGgJson(url)
        if (items.length) {
          cacheEmojiGgMem = items
          return items
        }
      } catch (err) {
        lastErr = err
      }
    }
    throw lastErr || new Error('No se pudo cargar emoji.gg')
  })()
  try {
    return await promiseEmojiGg
  } finally {
    promiseEmojiGg = null
  }
}

export function filtrarEmojisEmojiGg(items, { category = null, query = '', limitCount = 120 } = {}) {
  const q = String(query || '').trim().toLowerCase()
  let list = Array.isArray(items) ? items : []
  if (category != null && category !== '' && Number.isFinite(Number(category))) {
    const cat = Number(category)
    list = list.filter((e) => e.category === cat)
  }
  if (q) {
    list = list.filter(
      (e) =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.slug || '').toLowerCase().includes(q)
    )
  }
  return list.slice(0, limitCount)
}

export function esEmojiGgUrl(value) {
  const u = String(value || '').trim()
  return /^https:\/\/(cdn\d+\.)?emoji\.gg\//i.test(u)
}
