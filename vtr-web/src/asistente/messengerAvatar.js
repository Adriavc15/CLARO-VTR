/** Avatar Messenger recolorable (hue-rotate sobre /messenger.png). */

export const MESSENGER_SRC = '/messenger.png'

export const LS_CHAT_MESSENGER_HUE = 'vtr-apex-messenger-hue'

/** Paleta aproximada tras hue-rotate desde el azul original. */
export const MESSENGER_COLORES = [
  { hue: 0, label: 'Azul', swatch: '#1e6fd9' },
  { hue: 40, label: 'Turquesa', swatch: '#0d9488' },
  { hue: 85, label: 'Verde', swatch: '#16a34a' },
  { hue: 140, label: 'Cian', swatch: '#0891b2' },
  { hue: 195, label: 'Violeta', swatch: '#7c3aed' },
  { hue: 250, label: 'Magenta', swatch: '#db2777' },
  { hue: 300, label: 'Naranja', swatch: '#ea580c' },
  { hue: 330, label: 'Rojo', swatch: '#dc2626' },
]

export function normalizarHue(hue) {
  const n = Number(hue)
  if (!Number.isFinite(n)) return 0
  return ((Math.round(n) % 360) + 360) % 360
}

export function isMessengerAvatar(url) {
  const u = String(url || '').trim()
  return /messenger\.png/i.test(u) || /^messenger:/i.test(u)
}

export function parseAvatarHue(url) {
  const u = String(url || '').trim()
  const m = u.match(/[?&#]hue=(\d+)/i) || u.match(/^messenger:(\d+)$/i)
  return m ? normalizarHue(m[1]) : 0
}

/** Valor a guardar en perfil / historial. */
export function messengerAvatarValue(hue = 0) {
  const h = normalizarHue(hue)
  return h ? `${MESSENGER_SRC}?hue=${h}` : MESSENGER_SRC
}

export function messengerFilterStyle(hue = 0) {
  const h = normalizarHue(hue)
  if (!h) return undefined
  return { filter: `hue-rotate(${h}deg)` }
}

/** Props src + style para un <img> de avatar (soporta Messenger con color). */
export function avatarImgProps(url, { fallbackMessenger = false } = {}) {
  const raw = String(url || '').trim()
  if (isMessengerAvatar(raw) || (!raw && fallbackMessenger)) {
    const hue = raw ? parseAvatarHue(raw) : 0
    return {
      src: MESSENGER_SRC,
      style: messengerFilterStyle(hue),
      isMessenger: true,
      hue,
    }
  }
  if (!raw) return { src: '', style: undefined, isMessenger: false, hue: 0 }
  return { src: raw, style: undefined, isMessenger: false, hue: 0 }
}

export function leerHueChatMessenger() {
  try {
    return normalizarHue(localStorage.getItem(LS_CHAT_MESSENGER_HUE) || 0)
  } catch {
    return 0
  }
}

export function guardarHueChatMessenger(hue) {
  try {
    localStorage.setItem(LS_CHAT_MESSENGER_HUE, String(normalizarHue(hue)))
  } catch {
    /* ignore */
  }
}
