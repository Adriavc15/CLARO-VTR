import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'

export const COL_STREAMING_SHOWCASE = 'streaming_showcase'

/** Tarjetas de la sección Streaming (sidebar): foto del modal + logo. */
export const SHOWCASE_SEED = [
  {
    id: 'netflix',
    name: 'Netflix',
    img: '/img-netflix.png',
    logo: 'https://images.icon-icons.com/2699/PNG/512/netflix_logo_icon_170919.png',
    desc: 'Películas y series',
  },
  {
    id: 'disney',
    name: 'Disney+',
    img: '/img-disney.png',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original',
    desc: 'Disney, Marvel, Star Wars',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    img: '/img-crunchyroll.png',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png',
    desc: 'Anime y manga',
  },
  {
    id: 'tnt-sports',
    name: 'TNT Sports',
    img: '/Gemini_Generated_Image_40poir40poir40po.jpg',
    logo: 'https://static-wbd-cdn.wbd.com/s3_assets/wp-content/uploads/2024/01/TNT-Sports-Logo.png',
    desc: 'Fútbol chileno y deportes',
  },
  {
    id: 'pack-adulto',
    name: 'Pack Adulto',
    img: '/pack adulto.png',
    logo: 'https://vtr.com/content/prodPRADUL/logo-canales-pack-adulto.jpg',
    desc: 'Playboy, Venus, Sextreme, Playboy HD y HotGo · $7.490/mes',
    href: 'https://vtr.com/product/prodPRADUL',
  },
]

export function mezclarShowcase(docs = []) {
  const byId = new Map(docs.map((d) => [String(d.id), d]))
  return SHOWCASE_SEED.map((s) => {
    const live = byId.get(s.id) || {}
    const img = String(live.img || s.img).trim() || s.img
    const logo = String(live.logo || s.logo).trim() || s.logo
    return {
      ...s,
      img,
      logo,
      desc: String(live.desc || s.desc).trim() || s.desc,
      name: String(live.name || s.name).trim() || s.name,
      href: String(live.href || s.href || '').trim() || s.href || '',
    }
  })
}

export function suscribirShowcaseStreaming(db, onData) {
  if (!db) {
    onData(mezclarShowcase())
    return () => {}
  }
  return onSnapshot(
    collection(db, COL_STREAMING_SHOWCASE),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      onData(mezclarShowcase(docs))
    },
    () => onData(mezclarShowcase())
  )
}

export async function guardarShowcaseStreaming(db, { id, img, logo, name, desc }) {
  if (!db) throw new Error('Firestore no disponible')
  const seed = SHOWCASE_SEED.find((s) => s.id === id)
  if (!seed) throw new Error('Plataforma desconocida')
  const payload = {
    id,
    name: String(name || seed.name).trim(),
    desc: String(desc || seed.desc).trim(),
    img: String(img || seed.img).trim(),
    logo: String(logo || seed.logo).trim(),
    actualizadoEn: new Date().toISOString(),
  }
  await setDoc(doc(db, COL_STREAMING_SHOWCASE, id), payload, { merge: true })
  return payload
}
