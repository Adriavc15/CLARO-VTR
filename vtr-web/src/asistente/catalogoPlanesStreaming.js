/**
 * Catálogo Planes + Streaming del portal Apex → docs para el chatbot.
 * (Misma data comercial que la sección Planes / Streaming de la web.)
 */
import { SHOWCASE_SEED } from './streamingShowcaseLive.js'
import { resumenGrilla } from './grillaCanales.js'

export const TV_PREMIUM_I_STREAMS = [
  '/stream/disney.png',
  '/stream/hbo-max.png',
  '/stream/prime-video.png',
  '/stream/atresplayer.png',
  '/stream/universal.png',
  '/stream/cindie.png',
  '/stream/riivi.png',
  '/stream/teatrix.png',
]

export const TV_PREMIUM_II_STREAMS = [
  '/stream/netflix.png',
  '/stream/hbo-max.png',
  '/stream/prime-video.png',
  '/stream/atresplayer.png',
  '/stream/universal.png',
  '/stream/cindie.png',
  '/stream/riivi.png',
  '/stream/teatrix.png',
]

export const TV_FULL_STREAMS = [
  '/stream/disney.png',
  '/stream/netflix.png',
  '/stream/hbo-max.png',
  '/stream/prime-video.png',
  '/stream/atresplayer.png',
  '/stream/universal.png',
  '/stream/cindie.png',
  '/stream/riivi.png',
  '/stream/teatrix.png',
]

export const VTR_LEGACY_STREAMS = [
  '/stream/prime-video.png',
  '/stream/hbo-max.png',
  '/stream/riivi.png',
  '/stream/atresplayer.png',
  '/stream/cindie.png',
  '/stream/teatrix.png',
]

export const STREAM_NAMES = {
  '/stream/disney.png': 'Disney+',
  '/stream/netflix.png': 'Netflix',
  '/stream/hbo-max.png': 'HBO Max',
  '/stream/prime-video.png': 'Prime Video',
  '/stream/atresplayer.png': 'Atresplayer',
  '/stream/universal.png': 'Universal+',
  '/stream/cindie.png': 'Cindie',
  '/stream/riivi.png': 'Riivi',
  '/stream/teatrix.png': 'Teatrix',
  'Prime Video': 'Prime Video',
  'HBO Max': 'HBO Max',
  'Riivi': 'Riivi',
  'Atresplayer': 'Atresplayer',
  'Cindie': 'Cindie',
  'Teatrix': 'Teatrix',
}

export const PLATAFORMAS_STREAMING = SHOWCASE_SEED.map((p) => ({
  name: p.name,
  img: p.img,
  logo: p.logo,
  desc: p.desc,
  href: p.href || '',
}))

export const CABLE_PACKS = [
  {
    id: 'espn',
    name: 'ESPN',
    img: '/espn.png',
    items: ['ESPN', 'ESPN 2', 'ESPN 3', 'ESPN Extra (ESPN 4)', 'ESPN 4 (ESPN 5)', 'Fox Sports 3 (ESPN 6)'],
  },
  {
    id: 'hbo',
    name: 'HBO (cable)',
    img: '/stream/hbo-max.png',
    items: ['HBO', 'HBO Family', 'HBO Mundi', 'HBO Signature', 'HBO Plus', 'HBO Xtreme', 'HBO Pop'],
  },
  {
    id: 'discovery',
    name: 'Discovery',
    img: '/DiscoveryWorld.png',
    items: ['Discovery Science', 'Discovery World', 'Discovery Theater'],
  },
  {
    id: 'otros',
    name: 'Otros canales cable',
    img: '/Paramount.png',
    items: [
      'Paramount',
      'Comedy Central',
      'Universal',
      'Studio Universal',
      'USA',
      'Entertainment Television',
      'Dreamworks',
      'Warner',
      'Telemundo',
      'MTV',
      'Cinemax',
    ],
  },
]

const planes1pInternet = [
  { comercial: 'Fibra 600 Megas', andes: 'Fibra Hogar Residencial 0226F', normal: '$21.990', promo: '$14.990' },
  { comercial: 'Fibra 800 Megas', andes: 'Fibra Avanzado Residencial 0226F', normal: '$23.990', promo: '$15.990' },
  { comercial: 'Fibra 940 Megas', andes: 'Fibra Experto Residencial 0226F', normal: '$29.990', promo: '$19.990' },
]

const planes1pStream = [
  {
    comercial: 'Fibra 600 Megas + Disney+',
    andes: 'Fibra Hogar Stream Residencial 1225F',
    normal: '$29.990',
    promo: '$19.990',
    tags: ['Disney+'],
    streams: ['/stream/disney.png'],
  },
  {
    comercial: 'Fibra 600 Megas + Netflix',
    andes: 'Fibra Hogar Stream 3 N0726F',
    normal: '$29.990',
    promo: '$19.990',
    tags: ['Netflix'],
    streams: ['/stream/netflix.png'],
  },
  {
    comercial: 'Fibra 800 Megas + Disney+',
    andes: 'Fibra Avanzado Stream Residencial 1225F',
    normal: '$31.990',
    promo: '$20.990',
    tags: ['Disney+'],
    streams: ['/stream/disney.png'],
  },
  {
    comercial: 'Fibra 800 Megas + Netflix',
    andes: 'Fibra Avanzado Stream 3 N0726F',
    normal: '$31.990',
    promo: '$20.990',
    tags: ['Netflix'],
    streams: ['/stream/netflix.png'],
  },
  {
    comercial: 'Fibra 940 Megas + Disney+',
    andes: 'Fibra Experto Stream Residencial 1225F',
    normal: '$37.990',
    promo: '$24.990',
    tags: ['Disney+'],
    streams: ['/stream/disney.png'],
  },
  {
    comercial: 'Fibra 940 Megas + Netflix',
    andes: 'Fibra Experto Stream 3 N0724F',
    normal: '$37.990',
    promo: '$24.990',
    tags: ['Netflix'],
    streams: ['/stream/netflix.png'],
  },
]

const planes1pTv = [
  { comercial: 'Stream TV Inicia', andes: 'TV Inicia Residencial 0325hd', normal: null, promo: null },
  { comercial: 'Stream TV Plus', andes: 'Stream TV Plus 0324hd', normal: '$22.990', promo: '$22.990' },
  {
    comercial: 'Stream TV Premium I',
    andes: 'Stream TV Premium 0226F',
    normal: '$28.990',
    promo: '$28.990',
    tags: ['Disney+'],
    streams: TV_PREMIUM_I_STREAMS,
  },
  {
    comercial: 'Stream TV Premium Residencial 2',
    andes: 'TV Premium 2 Residencial N0726F',
    normal: '$28.990',
    promo: '$28.990',
    tags: ['Netflix'],
    streams: TV_PREMIUM_II_STREAMS,
  },
  {
    comercial: 'Stream TV Premium Residencial 3',
    andes: 'TV Premium 3 Residencial N0726F',
    normal: '$33.990',
    promo: '$33.990',
    tags: ['Disney+', 'Netflix'],
    streams: TV_FULL_STREAMS,
  },
]

const planes2pTv = [
  { comercial: 'Fibra 600 + TV Inicia', andes: '2P Fibra Hogar mas TV Inicia 0224F', normal: '$41.990', promo: '$41.990' },
  { comercial: 'Fibra 600 + TV Plus', andes: '2P Fibra Hogar mas Stream TV Plus 0225F', normal: '$41.990', promo: '$30.990' },
  {
    comercial: 'Fibra 600 + TV Premium I',
    andes: '2P Fibra Hogar mas Stream TV Premium 0225F',
    normal: '$46.990',
    promo: '$29.990',
    tags: ['Disney+'],
    streams: TV_PREMIUM_I_STREAMS,
  },
  {
    comercial: 'Fibra 600 + TV Premium II',
    andes: '2P Fibra Hogar mas TV Premium 2 Residencial N0726F',
    normal: '$46.990',
    promo: '$29.990',
    tags: ['Netflix'],
    streams: TV_PREMIUM_II_STREAMS,
  },
  {
    comercial: 'Fibra 600 + TV Full',
    andes: '2P Fibra Hogar mas TV Premium 3 Residencial N0726F',
    normal: '$51.990',
    promo: '$37.990',
    tags: ['Disney+', 'Netflix'],
    streams: TV_FULL_STREAMS,
  },
  { comercial: 'Fibra 800 + TV Inicia', andes: '2P Fibra Avanzado mas TV Inicia 0224F', normal: '$42.990', promo: '$42.990' },
  { comercial: 'Fibra 800 + TV Plus', andes: '2P Fibra Avanzado mas Stream TV Plus 0225F', normal: '$42.990', promo: '$31.990' },
  {
    comercial: 'Fibra 800 + TV Premium I',
    andes: '2P Fibra Avanzado mas Stream TV Premium 0225F',
    normal: '$47.990',
    promo: '$30.990',
    tags: ['Disney+'],
    streams: TV_PREMIUM_I_STREAMS,
  },
  {
    comercial: 'Fibra 800 + TV Premium II',
    andes: '2P Fibra Avanzado mas TV Premium 2 Residencial N0726F',
    normal: '$47.990',
    promo: '$30.990',
    tags: ['Netflix'],
    streams: TV_PREMIUM_II_STREAMS,
  },
  {
    comercial: 'Fibra 800 + TV Full',
    andes: '2P Fibra Avanzado mas TV Premium 3 Residencial N0726F',
    normal: '$52.990',
    promo: '$38.990',
    tags: ['Disney+', 'Netflix'],
    streams: TV_FULL_STREAMS,
  },
  { comercial: 'Fibra 940 + TV Inicia', andes: '2P Fibra Experto mas TV Inicia 0226F', normal: '$47.990', promo: '$47.990' },
  { comercial: 'Fibra 940 + TV Plus', andes: '2P Fibra Experto mas Stream TV Plus 0225F', normal: '$47.990', promo: '$35.990' },
  {
    comercial: 'Fibra 940 + TV Premium I',
    andes: '2P Fibra Experto mas Stream TV Premium 0225F',
    normal: '$52.990',
    promo: '$34.990',
    tags: ['Disney+'],
    streams: TV_PREMIUM_I_STREAMS,
  },
  {
    comercial: 'Fibra 940 + TV Premium II',
    andes: '2P Fibra Experto mas TV Premium 2 Residencial N0726F',
    normal: '$52.990',
    promo: '$34.990',
    tags: ['Netflix'],
    streams: TV_PREMIUM_II_STREAMS,
  },
  {
    comercial: 'Fibra 940 + TV Full',
    andes: '2P Fibra Experto mas TV Premium 3 Residencial N0726F',
    normal: '$57.990',
    promo: '$42.990',
    tags: ['Disney+', 'Netflix'],
    streams: TV_FULL_STREAMS,
  },
]

const planes2pFono = [
  { comercial: 'Fibra 600 + Telefonía', andes: '2P Fibra Hogar mas Fono 0226F', normal: '$23.990', promo: '$23.990' },
  { comercial: 'Fibra 800 + Telefonía', andes: '2P Fibra Avanzado mas Fono 0226F', normal: '$26.990', promo: '$26.990' },
  { comercial: 'Fibra 940 + Telefonía', andes: '2P Fibra Experto mas Fono 0226F', normal: '$35.990', promo: '$35.990' },
]

const planes3p = [
  {
    comercial: 'Fibra 600 + TV Inicia + Telefonía',
    andes: '3P Fibra Hogar mas TV Inicia 0224F',
    normal: '$46.990',
    promo: '$46.990',
  },
  {
    comercial: 'Fibra 600 + TV Plus + Telefonía',
    andes: '3P Fibra Hogar mas Stream TV Plus 0225F',
    normal: '$46.990',
    promo: '$35.990',
  },
  {
    comercial: 'Fibra 600 + TV Premium I + Telefonía',
    andes: '3P Fibra Hogar mas Stream TV Premium 0225F',
    normal: '$51.990',
    promo: '$36.990',
    tags: ['Disney+'],
    streams: TV_PREMIUM_I_STREAMS,
  },
  {
    comercial: 'Fibra 600 + TV Premium II + Telefonía',
    andes: '3P Fibra Hogar mas TV Premium 2 Residencial N0726F',
    normal: '$51.990',
    promo: '$36.990',
    tags: ['Netflix'],
    streams: TV_PREMIUM_II_STREAMS,
  },
  {
    comercial: 'Fibra 600 + TV Full + Telefonía',
    andes: '3P Fibra Hogar mas TV Premium 3 Residencial N0726F',
    normal: '$56.990',
    promo: '$44.990',
    tags: ['Disney+', 'Netflix'],
    streams: TV_FULL_STREAMS,
  },
  {
    comercial: 'Fibra 800 + TV Inicia + Telefonía',
    andes: '3P Fibra Avanzado mas TV Inicia 0224F',
    normal: '$47.990',
    promo: '$47.990',
  },
  {
    comercial: 'Fibra 800 + TV Plus + Telefonía',
    andes: '3P Fibra Avanzado mas Stream TV Plus 0225F',
    normal: '$47.990',
    promo: '$36.990',
  },
  {
    comercial: 'Fibra 800 + TV Premium I + Telefonía',
    andes: '3P Fibra Avanzado mas Stream TV Premium 0225F',
    normal: '$53.990',
    promo: '$37.990',
    tags: ['Disney+'],
    streams: TV_PREMIUM_I_STREAMS,
  },
  {
    comercial: 'Fibra 800 + TV Premium II + Telefonía',
    andes: '3P Fibra Avanzado mas TV Premium 2 Residencial N0726F',
    normal: '$53.990',
    promo: '$37.990',
    tags: ['Netflix'],
    streams: TV_PREMIUM_II_STREAMS,
  },
  {
    comercial: 'Fibra 800 + TV Full + Telefonía',
    andes: '3P Fibra Avanzado mas TV Premium 3 Residencial N0726F',
    normal: '$58.990',
    promo: '$45.990',
    tags: ['Disney+', 'Netflix'],
    streams: TV_FULL_STREAMS,
  },
  {
    comercial: 'Fibra 940 + TV Inicia + Telefonía',
    andes: '3P Fibra Experto mas TV Inicia 0224F',
    normal: '$52.990',
    promo: '$52.990',
  },
  {
    comercial: 'Fibra 940 + TV Plus + Telefonía',
    andes: '3P Fibra Experto mas Stream TV Plus 0225F',
    normal: '$52.990',
    promo: '$40.990',
  },
  {
    comercial: 'Fibra 940 + TV Premium I + Telefonía',
    andes: '3P Fibra Experto mas Stream TV Premium 0225F',
    normal: '$58.990',
    promo: '$40.990',
    tags: ['Disney+'],
    streams: TV_PREMIUM_I_STREAMS,
  },
  {
    comercial: 'Fibra 940 + TV Premium II + Telefonía',
    andes: '3P Fibra Experto mas TV Premium 2 Residencial N0726F',
    normal: '$58.990',
    promo: '$40.990',
    tags: ['Netflix'],
    streams: TV_PREMIUM_II_STREAMS,
  },
  {
    comercial: 'Fibra 940 + TV Full + Telefonía',
    andes: '3P Fibra Experto mas TV Premium 3 Residencial N0726F',
    normal: '$63.990',
    promo: '$48.990',
    tags: ['Disney+', 'Netflix'],
    streams: TV_FULL_STREAMS,
  },
]

const planesCableVtr = [
  {
    comercial: 'TV Inicia (Cable)',
    andes: 'TV Inicia Residencial',
    normal: '$20.990',
    promo: null,
    detalle: '74 canales · 57 HD',
    streams: [],
  },
  {
    comercial: 'TV Plus (Cable)',
    andes: 'Stream TV Plus',
    normal: '$22.990',
    promo: null,
    detalle: '101 canales · 82 HD · incluye extras cable',
    streams: [],
  },
  {
    comercial: 'TV Premium (Cable)',
    andes: 'Stream TV Premium',
    normal: '$28.990',
    promo: null,
    detalle: '101 canales · 82 HD · incluye extras cable',
    tags: ['Disney+'],
    streams: TV_PREMIUM_I_STREAMS,
  },
  {
    comercial: 'TV Premium 2 (Cable)',
    andes: 'TV Premium 2',
    normal: '$28.990',
    promo: null,
    detalle: '101 canales · 82 HD · incluye extras cable',
    tags: ['Netflix'],
    streams: TV_PREMIUM_II_STREAMS,
  },
  {
    comercial: 'TV Full / Premium 3 (Cable)',
    andes: 'TV Full / Premium 3',
    normal: '$33.990',
    promo: null,
    detalle: '74 canales · 68 HD · incluye extras cable',
    tags: ['Disney+', 'Netflix'],
    streams: TV_FULL_STREAMS,
  },
]

const planesVtrLegacy = [
  {
    comercial: '2P Internet Hogar mas Stream TV Plus 0225hd',
    andes: '2P Internet Hogar mas Stream TV Plus 0225hd',
    normal: null,
    promo: null,
    detalle: 'Internet MEGA 500MBPS + Stream TV Plus',
    tags: ['Prime Video', 'HBO Max', 'Riivi', 'Atresplayer', 'Cindie', 'Teatrix'],
    streams: VTR_LEGACY_STREAMS,
  },
  {
    comercial: '2P Internet Hogar mas Fono 0225',
    andes: '2P Internet Hogar mas Fono 0225',
    normal: '$22.228',
    promo: '$22.228',
    detalle: 'Internet MEGA 500MBPS + Telefonía',
    streams: [],
  },
  {
    comercial: 'Doble Pack Finix 0322hd',
    andes: 'Doble Pack Finix 0322hd',
    normal: null,
    promo: null,
    detalle: 'Internet + TV',
    tags: ['Prime Video', 'HBO Max', 'Riivi', 'Atresplayer', 'Cindie', 'Teatrix'],
    streams: VTR_LEGACY_STREAMS,
  },
  {
    comercial: 'Triple Pack Plus 0322hd',
    andes: 'Triple Pack Plus 0322hd',
    normal: null,
    promo: null,
    detalle: 'Internet + TV + Telefonía',
    tags: ['Prime Video', 'HBO Max', 'Riivi', 'Atresplayer', 'Cindie', 'Teatrix'],
    streams: VTR_LEGACY_STREAMS,
  },
  {
    comercial: 'VTR Wifi 0822F',
    andes: 'VTR Wifi 0822F',
    normal: '$13.990',
    promo: '$13.990',
    detalle: 'Internet 500 MBPS',
    streams: [],
  },
  {
    comercial: 'VTR Plus 3 0522hd',
    andes: 'VTR Plus 3 0522hd',
    normal: null,
    promo: null,
    detalle: 'MEGA 500 Mbps + TV Full Digital HD + Fono ilimitado',
    tags: ['Prime Video', 'HBO Max', 'Riivi', 'Atresplayer', 'Cindie', 'Teatrix'],
    streams: VTR_LEGACY_STREAMS,
  },
]

const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)

const nombresStreaming = (streams = []) =>
  streams.map((s) => STREAM_NAMES[s] || s).filter(Boolean)

const nombresStreamingFromTags = (tags = []) =>
  tags.map((t) => {
    // Check if it's an image path
    if (t.startsWith('/stream/')) {
      return STREAM_NAMES[t] || t
    }
    // If it's already a name, return it
    return t
  }).filter(Boolean)

function docDesdePlan(row, grupo) {
  const titulo = row.comercial
  const streams = row.streams || []
  const tags = row.tags || nombresStreaming(streams)
  const precioLista = row.normal || null
  const precioPromo = row.promo || null
  const bloqueCostos = []
  if (precioLista && precioPromo && precioLista !== precioPromo) {
    bloqueCostos.push(`Costos: lista ${precioLista} · promo ${precioPromo}`)
    bloqueCostos.push(`Precio lista: ${precioLista}`)
    bloqueCostos.push(`Precio promo: ${precioPromo}`)
  } else if (precioLista || precioPromo) {
    const p = precioPromo || precioLista
    bloqueCostos.push(`Costo / precio: ${p}`)
    if (precioLista) bloqueCostos.push(`Precio lista: ${precioLista}`)
    if (precioPromo && precioPromo !== precioLista) bloqueCostos.push(`Precio promo: ${precioPromo}`)
  } else {
    bloqueCostos.push('Costo / precio: consultar tarifa vigente en catálogo (sin precio fijado en tarjeta).')
  }

  // For legacy plans with tags as platform names instead of image paths
  const streamingTags = Array.isArray(tags) ? tags : []
  const streamingNames = streamingTags.length ? streamingTags : nombresStreaming(streams)

  const contenido = [
    ...bloqueCostos,
    `Plan comercial: ${titulo}`,
    `Nombre Andes (copiar exacto): ${row.andes}`,
    `Grupo: ${grupo}`,
    row.detalle ? `Detalle: ${row.detalle}` : null,
    streamingNames.length ? `Streaming incluido: ${streamingNames.join(', ')}` : 'Sin plataformas de streaming incluidas en la tarjeta.',
    'Para cambio de plan: copia el nombre Andes y pégalo en Actualizar promoción.',
  ].filter(Boolean)

  const toks = `${titulo} ${row.andes} ${streamingNames.join(' ')} ${grupo}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9+]+/i)
    .filter((w) => w.length >= 3)
    .slice(0, 14)

  return {
    id: `plan-${slug(titulo)}`,
    titulo,
    categoria: 'PLANES',
    tipo: 'plan',
    seccionPortal: `Planes → ${grupo}`,
    sinonimos: [
      'plan',
      'planes',
      'fibra',
      'oferta',
      'precio',
      'precios',
      'costo',
      'costos',
      'cuanto cuesta',
      'valor',
      grupo.toLowerCase(),
      row.andes,
      ...streamingNames,
      ...toks,
    ].filter(Boolean),
    contenido,
    imagenes: streams.slice(0, 8),
    fuente: 'portal-planes',
    andes: row.andes,
    precioLista,
    precioPromo,
  }
}

/** Docs RAG: planes individuales + menús + streaming */
export function docsPlanesYStreaming() {
  const docs = []

  docs.push({
    id: 'menu-planes',
    titulo: 'Menú Planes del portal',
    categoria: 'PLANES',
    tipo: 'plan',
    seccionPortal: 'Planes',
    sinonimos: [
      'planes',
      'catalogo planes',
      'ofertas',
      'packs',
      '1p',
      '2p',
      '3p',
      'fibra',
      'precios',
      'precio',
      'costos',
      'cuanto cuesta',
    ],
    contenido: [
      'Catálogo comercial Apex: Internet 1P, Internet+Streaming, TV sola, 2P (fibra+TV o fibra+fono), 3P y Cable VTR.',
      'Referencia de precios (promo / lista según tarjeta):',
      '· Fibra 600: promo $14.990 · lista $21.990',
      '· Fibra 800: promo $15.990 · lista $23.990',
      '· Fibra 940: promo $19.990 · lista $29.990',
      '· Fibra 600 + Netflix/Disney+: promo $19.990 · lista $29.990',
      '· Stream TV Premium I / Premium 2: $28.990',
      '· Stream TV Premium 3 / Full: $33.990',
      '· TV Inicia (cable): $20.990 · TV Plus: $22.990',
      'Fibra 600 → Andes Fibra Hogar · 800 → Avanzado · 940 → Experto.',
      'Pregunta por un plan concreto para ver costo exacto + nombre Andes.',
    ],
    imagenes: ['/stream/disney.png', '/stream/netflix.png', '/stream/hbo-max.png'],
    fuente: 'portal-planes',
  })

  docs.push({
    id: 'grilla-canales-tv',
    titulo: 'Grillas de canales: TV Full (VTR y Claro) y Claro TV Inicia',
    categoria: 'PLANES',
    tipo: 'plan',
    seccionPortal: 'Planes',
    sinonimos: [
      'grilla de canales',
      'que canales trae',
      'canales de tv',
      'canales vtr',
      'canales claro',
      'canales tv full',
      'canales tv inicia',
      'cuantos canales',
      'numeros de canal',
      'senal',
      'canales hd',
    ],
    contenido: [
      'TV FULL es la misma grilla para VTR TV Full y Claro TV Full. La grilla TV INICIA es propia de Claro TV Inicia; los mismos números cambian de señal entre una grilla y otra.',
      'VTR TV FULL y Claro TV FULL: 74 canales (68 HD). CLARO TV INICIA: 77 canales (66 HD).',
      'VTR TV Inicia usa la grilla base de 74 canales (57 HD); VTR TV Plus / Premium / Premium 2 suman los packs de cable (101 canales, 82 HD).',
      'TV PREMIUM no aparece en esas imágenes: no marcar ningún canal como Premium sin evidencia.',
      resumenGrilla('vtr:full', 40),
      resumenGrilla('claro:inicia', 40),
    ],
    fuente: 'portal-planes',
  })

  docs.push({
    id: 'menu-costos-contrataciones',
    titulo: 'Costos de Contrataciones (referencias)',
    categoria: 'ANDES',
    tipo: 'guia',
    seccionPortal: 'Contrataciones',
    sinonimos: [
      'costos',
      'precios',
      'cuanto cuesta',
      'valor',
      'control remoto precio',
      'dbox precio',
      'asistencia precio',
      'delivery precio',
    ],
    contenido: [
      'Costos de referencia en Contrataciones (portal):',
      '· Control Remoto (repuesto / Delivery Control Remoto): $6.000',
      '· Delivery de equipos: $3.000',
      '· D-Box Smart II: $2.990 / mes',
      '· Asistencia VTR: $1.990 / mes (primera boleta puede ir proporcional + mes siguiente completo)',
      '· Visita técnica sin Asistencia (si el cliente consulta): $20.000',
      'Para el paso a paso con imágenes, pregunta por Control Remoto, D-Box o Asistencia VTR.',
    ],
    imagenes: [],
    fuente: 'portal-contrataciones',
  })

  docs.push({
    id: 'menu-streaming',
    titulo: 'Menú Streaming del portal',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming',
    sinonimos: ['streaming', 'ott', 'plataformas', 'netflix', 'disney', 'hbo', 'activar streaming', 'pack adulto', 'playboy'],
    contenido: [
      'Sección Streaming: plataformas (Netflix, Disney+, Crunchyroll, TNT Sports, Pack Adulto, HBO Max, etc.) y packs del plan.',
      'Activación OTT: sucursal virtual con RUT y contraseña VTR del cliente.',
      'Pack Adulto (prodPRADUL): canales cable 501/502/503/869 + HotGo — ficha https://vtr.com/product/prodPRADUL',
      'Si no puede activar OTT en sucursal virtual y el plan sí incluye la plataforma → transferir a OTT.',
      'Para saber qué plan incluye cada plataforma, pregunta por el nombre (ej. qué plan tiene Netflix).',
    ],
    imagenes: PLATAFORMAS_STREAMING.map((p) => p.img),
    fuente: 'portal-streaming',
  })

  docs.push({
    id: 'stream-transferir-ott',
    titulo: 'Transferir a OTT (activación streaming)',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming',
    sinonimos: ['transferir a ott', 'ott', 'sucursal virtual', 'no puede activar', 'activar plataforma'],
    contenido: [
      'Transferir a OTT cuando el cliente intentó ingresar a la sucursal virtual y no le permite activar la cuenta de su plataforma de streaming.',
      'Antes: verifica que la plataforma esté incluida en su plan actual.',
      'Las plataformas se activan desde la sucursal virtual con RUT y contraseña VTR del cliente.',
    ],
    imagenes: PLATAFORMAS_STREAMING.map((p) => p.img).slice(0, 4),
    fuente: 'portal-streaming',
  })

  const grupos = [
    [planes1pInternet, '1P Internet'],
    [planes1pStream, '1P Stream'],
    [planes1pTv, '1P TV'],
    [planes2pTv, '2P Fibra+TV'],
    [planes2pFono, '2P Fibra+Fono'],
    [planes3p, '3P'],
    [planesCableVtr, 'Cable VTR'],
    [planesVtrLegacy, 'VTR Legacy'],
  ]
  for (const [lista, grupo] of grupos) {
    for (const row of lista) docs.push(docDesdePlan(row, grupo))
  }

  for (const p of PLATAFORMAS_STREAMING) {
    const esAdulto = /adulto/i.test(p.name) || p.href?.includes('prodPRADUL')
    docs.push({
      id: `stream-plat-${slug(p.name)}`,
      titulo: p.name,
      categoria: 'STREAMING',
      tipo: 'streaming',
      seccionPortal: 'Streaming',
      sinonimos: [
        p.name,
        'streaming',
        'ott',
        'plataforma',
        slug(p.name).replace(/-/g, ' '),
        ...(esAdulto ? ['pack adulto', 'playboy', 'prodpradul', 'canales adultos'] : []),
      ],
      contenido: esAdulto
        ? [
            `${p.name}: ${p.desc}.`,
            'Código producto prodPRADUL. Canales: Playboy 501, Venus 502, Sextreme 503, Playboy HD 869 + HotGo.',
            'Tarifa lista $7.490/mes; promo adquisición $3.745 × 3 meses si vigente.',
            'Requiere D-Box; control parental disponible. Ficha: https://vtr.com/product/prodPRADUL',
          ]
        : [
            `${p.name}: ${p.desc}.`,
            'Se activa desde la sucursal virtual (RUT + contraseña VTR).',
            'Si el cliente no puede activar y el plan lo incluye → transferir a OTT.',
            'Revisa también las publicaciones Somos Clave de activación / inconvenientes de la marca.',
          ],
      imagenes: [p.img, p.logo].filter(Boolean),
      fuente: 'portal-streaming',
    })
  }

  // Resumen por plataforma OTT incluida en packs TV
  for (const [key, label] of Object.entries(STREAM_NAMES)) {
    const planesCon = []
    for (const [lista, grupo] of grupos) {
      for (const row of lista) {
        if ((row.streams || []).includes(key) || (row.tags || []).includes(label)) {
          const precio =
            row.promo && row.normal && row.promo !== row.normal
              ? `promo ${row.promo} / lista ${row.normal}`
              : row.promo || row.normal || 'sin precio en tarjeta'
          planesCon.push({
            texto: `${row.comercial} (${grupo}) — ${precio}`,
            pregunta: row.comercial,
          })
        }
      }
    }
    if (!planesCon.length) continue
    docs.push({
      id: `stream-en-planes-${slug(label)}`,
      titulo: `Planes que incluyen ${label}`,
      categoria: 'STREAMING',
      tipo: 'streaming',
      seccionPortal: 'Planes / Streaming',
      sinonimos: [
        label,
        `planes ${label}`,
        `que plan tiene ${label}`,
        `incluye ${label}`,
        `precio ${label}`,
        `costo ${label}`,
        slug(label),
      ],
      contenido: [
        `${label} viene en estos planes (con costos del catálogo):`,
        ...planesCon.slice(0, 18).map((t) => `· ${t.texto}`),
        planesCon.length > 18 ? `· …y ${planesCon.length - 18} más en la sección Planes.` : null,
        'Pregunta por el nombre comercial exacto para ver el nombre Andes a copiar.',
      ].filter(Boolean),
      imagenes: [key],
      fuente: 'portal-streaming',
    })
  }

  for (const pack of CABLE_PACKS) {
    docs.push({
      id: `cable-${pack.id}`,
      titulo: `Pack cable ${pack.name}`,
      categoria: 'PLANES',
      tipo: 'plan',
      seccionPortal: 'Planes → Cable VTR',
      sinonimos: [pack.name, 'cable', 'canales', 'pack cable', ...pack.items.slice(0, 6)],
      contenido: [
        `Pack ${pack.name} (canales cable, fuera de grilla Inicia en algunos planes).`,
        `Canales: ${pack.items.join(', ')}.`,
        'No confundir pack HBO cable con la app HBO Max (streaming).',
      ],
      imagenes: [pack.img],
      fuente: 'portal-planes',
    })
  }

  return docs
}
