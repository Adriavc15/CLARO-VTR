/**
 * Catálogo Planes + Streaming del portal Apex → docs para el chatbot.
 *
 * Los planes NO se duplican acá: se leen de los seeds que usa la web
 * (`planesSeed.js` para VTR y `planesClaro.js` para Claro). Así el asistente
 * nunca queda desfasado respecto de las tarjetas de la sección Planes.
 *
 * Fuente comercial: Plan Comercial ClaroVTR Hogar — Octubre 2026 (V04).
 */
import { SHOWCASE_SEED } from './streamingShowcaseLive.js'
import { resumenGrilla } from './grillaCanales.js'
import { CABLE_PACKS } from './packsCable.js'
import { PLANES_SEED, STREAM_PACKS, STREAM_NAMES as STREAM_NAMES_BASE } from './planesSeed.js'
import { PLANES_CLARO, CLARO_PACKS_PREMIUM } from './planesClaro.js'

export const TV_PREMIUM_I_STREAMS = STREAM_PACKS.premiumI
export const TV_PREMIUM_II_STREAMS = STREAM_PACKS.premiumII
export const TV_FULL_STREAMS = STREAM_PACKS.full
export const VTR_LEGACY_STREAMS = STREAM_PACKS.vtrLegacy

export const STREAM_NAMES = {
  ...STREAM_NAMES_BASE,
  'Prime Video': 'Prime Video',
  'HBO Max': 'HBO Max',
  'Riivi': 'Riivi',
  'Atresplayer': 'Atresplayer',
  'Cindie': 'Cindie',
  'Teatrix': 'Teatrix',
  'TVN Play': 'TVN Play',
  'OndaMedia': 'OndaMedia',
  'Storytel': 'Storytel',
}

export const PLATAFORMAS_STREAMING = SHOWCASE_SEED.map((p) => ({
  name: p.name,
  img: p.img,
  logo: p.logo,
  desc: p.desc,
  href: p.href || '',
}))

// Los packs cable viven en `packsCable.js` (los usa también la ficha del plan).
export { CABLE_PACKS }

/** Grupos del seed de VTR → etiqueta que usa el asistente para agrupar. */
const GRUPOS_VTR = {
  '1p-internet': '1P Internet',
  '1p-stream': '1P Stream',
  '1p-tv': '1P TV',
  '1p-fono': '1P Telefonía',
  '2p-tv': '2P Fibra+TV',
  '2p-fono': '2P Fibra+Fono',
  '3p': '3P',
  cable: 'Cable VTR',
  legacy: 'VTR Legacy',
}

/** Etiqueta de red de los planes VTR (Octubre 2026). */
const RED_LABEL = {
  HFC: 'HFC',
  FTTH: 'Fibra Óptica (FTTH)',
}

/** Detalle legible de una fila del seed (red + canales + extras). */
const detalleDeSeed = (row) => {
  const partes = [RED_LABEL[row.red], row.canales, row.hd].filter(Boolean)
  if (row.incluyeExtras) partes.push('incluye extras cable')
  return partes.join(' · ')
}

/** Detalle de los planes VTR Legacy (no viene en el seed, queda solo para el RAG). */
const DETALLE_LEGACY = {
  '2P Internet Hogar mas Fono 0225': 'Internet MEGA 500MBPS + Telefonía',
  'Doble Pack Finix 0322hd': 'Internet + TV',
  'Triple Pack Plus 0322hd': 'Internet + TV + Telefonía',
  'VTR Wifi 0822F': 'Internet 500 MBPS',
  'VTR Plus 3 0522hd': 'MEGA 500 Mbps + TV Full Digital HD + Fono ilimitado',
}

/** Filas VTR listas para el generador de docs RAG. */
const filasVtr = () =>
  PLANES_SEED.map((row) => ({
    comercial: row.comercial,
    andes: row.andes,
    normal: row.normal,
    promo: row.promo,
    streams: row.streams || [],
    tags: row.tags || [],
    detalle: detalleDeSeed(row) || DETALLE_LEGACY[row.comercial] || '',
    nota: row.nota || '',
    grupo: GRUPOS_VTR[row.grupo] || row.grupo,
  }))

/** Filas Claro listas para el generador de docs RAG. */
const filasClaro = () =>
  PLANES_CLARO.map((row) => ({
    comercial: row.comercial,
    andes: row.andes,
    normal: row.precio,
    promo: row.promo === '-' ? null : row.promo,
    descuento: row.descuento === '-' ? null : row.descuento,
    streams: row.streams || [],
    tags: row.tags || [],
    detalle: [row.tecnologia, row.megas !== '-' ? row.megas : null].filter(Boolean).join(' · '),
    nota: row.nota || '',
    grupo: `Claro ${row.tecnologia} ${row.pack}`,
  }))

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

function docDesdePlan(row, grupo, prefijo = '') {
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
  if (row.descuento) bloqueCostos.push(`Descuento respecto de lista: ${row.descuento}`)

  // For legacy plans with tags as platform names instead of image paths
  const streamingTags = Array.isArray(tags) ? tags : []
  const streamingNames = streamingTags.length ? streamingTags : nombresStreaming(streams)

  const canales = [row.canales, row.hd].filter(Boolean).join(' · ')

  const contenido = [
    ...bloqueCostos,
    `Plan comercial: ${titulo}`,
    `Nombre Andes (copiar exacto): ${row.andes}`,
    `Grupo: ${grupo}`,
    row.detalle ? `Detalle: ${row.detalle}` : null,
    canales ? `Canales: ${canales}` : null,
    streamingNames.length ? `Streaming incluido: ${streamingNames.join(', ')}` : 'Sin plataformas de streaming incluidas en la tarjeta.',
    row.nota ? `Aviso: ${row.nota}` : null,
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
    id: `plan-${prefijo}${slug(titulo)}`,
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
      'Catálogo comercial Apex (Octubre 2026): Internet 1P (HFC 500 o fibra FTTH), Internet+Streaming, 2P (internet+TV o internet+fono), 3P y Cable VTR.',
      'Referencia de precios VTR (promo / lista según tarjeta):',
      '· Internet 500 (HFC): promo $14.990 · lista $21.990',
      '· Fibra 600: promo $14.990 · lista $21.990',
      '· Fibra 800: promo $15.990 · lista $23.990',
      '· Fibra 940: promo $19.990 · lista $29.990',
      '· Fibra 600 + Netflix/Disney+: promo $19.990 · lista $29.990',
      '· Internet 500 + Netflix/Disney+: promo $19.990 · lista $29.990',
      '· Internet 500 + TV Premium: promo $29.990 · lista $46.990',
      'Fibra 600 → Andes Fibra Hogar · 800 → Avanzado · 940 → Experto.',
      'Los planes de HFC 500 Mbps y TV Premium agregados en Octubre 2026 tienen nombre Andes referencial: hay que validarlo en Andes antes de copiarlo a APEX.',
      'Pregunta por un plan concreto para ver costo exacto + nombre Andes.',
    ],
    imagenes: ['/stream/disney.png', '/stream/netflix.png', '/stream/hbo-max.png'],
    fuente: 'portal-planes',
  })

  docs.push({
    id: 'menu-planes-claro',
    titulo: 'Menú Planes Claro (HFC y Fibra)',
    categoria: 'PLANES',
    tipo: 'plan',
    seccionPortal: 'Planes → Claro',
    sinonimos: [
      'planes claro',
      'claro hogar',
      'claro hfc',
      'claro fibra',
      'ofertas claro',
      'internet 500 claro',
      'tv premium claro',
      'precios claro',
    ],
    contenido: [
      'Catálogo Claro Hogar (Octubre 2026), separado por red: HFC (Internet 500 Megas) y Fibra Óptica FTTH (600 / 800 / 940 Megas).',
      'Referencia de precios Claro (promo / lista):',
      '· Internet 500 Megas (HFC): promo $14.990 · lista $21.990',
      '· Fibra 600: promo $14.990 · lista $21.990',
      '· Fibra 800: promo $15.990 · lista $23.990',
      '· Fibra 940: promo $19.990 · lista $29.990',
      '· Internet 500 + TV Inicia (HFC): promo $26.990 · lista $36.990',
      '· Internet 500 + TV Premium (HFC): promo $29.990 · lista $46.990',
      '· Fibra 600/800/940 + TV Premium: promo $29.990 / $30.990 / $34.990',
      '· Fibra 600/800/940 + TV Full: promo $37.990 / $38.990 / $42.990',
      'Claro TV Premium incluye Disney+; TV Premium II incluye Netflix; TV Full incluye ambos. Netflix es plan Estándar (2 pantallas, Full HD): upgrade a Premium 4K +$3.000.',
      'TVN Play, OndaMedia y Storytel son exclusivos de Claro (no vienen en los packs VTR).',
      'Streaming por tipo de TV en Claro: TV Inicia trae HBO Max, Prime Video y Universal+; TV Premium suma Disney+, Atresplayer, Teatrix, Cindie, Riivi, TVN Play, OndaMedia y Storytel; TV Premium II cambia Disney+ por Netflix y TV Full trae Disney+ y Netflix.',
      'Box TV incluido sin costo en todos los planes con televisión.',
      'Instalación gratuita, salvo 1P solo cable/telefonía y 2P cable+telefonía ($50.000). Precios con IVA; promoción usualmente de 12 meses.',
    ],
    imagenes: ['/stream/tvn-play.png', '/stream/disney.png', '/stream/netflix.png'],
    fuente: 'portal-planes',
  })

  docs.push({
    id: 'packs-premium-claro',
    titulo: 'Packs premium adicionales de Claro (pago extra)',
    categoria: 'PLANES',
    tipo: 'plan',
    seccionPortal: 'Planes → Claro',
    sinonimos: [
      'packs premium claro',
      'hotpack',
      'pack adulto claro',
      'espn premium',
      'tnt sports premium',
      'venus',
      'pack premium',
      'canales extra claro',
    ],
    contenido: [
      'Packs opcionales de Claro, se contratan por separado sobre el plan hired (no son planes).',
      ...CLARO_PACKS_PREMIUM.map(
        (p) => `· ${p.nombre}: ${p.precio} al mes · ${p.canales} · ${p.notas}.`
      ),
      'Venus y el Pack Adulto Premium solo están disponibles en la red HFC.',
      'En la grilla: Pack Adulto / Hotpack / Venus / Playboy aparece en Claro y VTR, pero los diales 301, 302 y 305 solo se muestran en Claro. ESPN Premium aparece en ambos; los diales 473, 477, 478, 479 y 480 solo en Claro. TNT Sports Premium aparece en ambos sin número de canal (Claro SD 190 / HD 490; VTR SD 165 / HD 855; pack $13.990). Universal+ solo en Claro, rangos 280-285 y 780-785.',
      'Los packs premium adicionales (Hotpack, ESPN Premium, TNT Sports Premium, etc.) son opcionales y de pago extra.',
    ],
    imagenes: [],
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
      'Conteo oficial del Plan Comercial Octubre 2026: VTR TV Inicia 74 canales (57 HD); VTR TV Premium / Premium II / Full 101 canales (84 HD). Claro TV Inicia 77 canales (66 HD); Claro TV Premium / Premium II / Full 74 canales (68 HD).',
      'TV Premium incluye Disney+, TV Premium II incluye Netflix y TV Full incluye ambos. Conteo del plan comercial de Octubre 2026: TV Premium 9 plataformas en VTR y 10 en Claro; TV Full 9 en VTR y 11 en Claro. En el portal los packs premium de Claro suman además Storytel (TVN Play y OndaMedia ya venían en el plan comercial).',
      'VTR tiene más canales lineales en Premium/Full (101 únicos / 84 HD) que Claro (74 / 68); Claro tiene más canales en TV Inicia (77 vs 74) y más HD (66 vs 57).',
      'Los números de canal por plan salen de la lista oficial del Plan Comercial (pág. 39 Claro y pág. 40 VTR), no de la lectura de imágenes del portal: cada proveedor numera distinto y un mismo número puede ser una señal diferente en VTR y en Claro.',
      'De la tabla oficial de VTR TV Premium: 102 señales sobre 100 diales (el 822 y el 785 transmiten dos señales cada uno); el plan declara 101 canales (84 HD y 17 SD). Los diales menores a 500 son SD y los de 500 o más son HD, salvo el 497 (Sony Channel), que va en HD.',
      resumenGrilla('vtr:full', 40),
      resumenGrilla('claro:inicia', 40),
      resumenGrilla('claro:full', 40),
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

  // Planes VTR y Claro: los docs se generan desde los seeds que usa la web.
  const filas = [...filasVtr(), ...filasClaro()]
  for (const row of filas) {
    docs.push(docDesdePlan(row, row.grupo, row.grupo.startsWith('Claro') ? 'claro-' : ''))
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

  // Resumen por plataforma OTT incluida en packs TV.
  // `STREAM_NAMES` tiene los mismos nombres por ruta y por etiqueta: se agrupa
  // por etiqueta para no generar dos docs con el mismo id.
  const clavesPorEtiqueta = new Map()
  for (const [key, label] of Object.entries(STREAM_NAMES)) {
    if (!clavesPorEtiqueta.has(label)) clavesPorEtiqueta.set(label, key)
  }

  const MAX_PLANES_POR_PLATAFORMA = 24

  for (const [label, key] of clavesPorEtiqueta.entries()) {
    const planesCon = []
    for (const row of filas) {
      const coincide = (row.streams || []).includes(key) || (row.tags || []).includes(label)
      if (!coincide) continue
      const precio =
        row.promo && row.normal && row.promo !== row.normal
          ? `promo ${row.promo} / lista ${row.normal}`
          : row.promo || row.normal || 'sin precio en tarjeta'
      planesCon.push({
        texto: `${row.comercial} (${row.grupo}) — ${precio}`,
        pregunta: row.comercial,
      })
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
        ...planesCon.slice(0, MAX_PLANES_POR_PLATAFORMA).map((t) => `· ${t.texto}`),
        planesCon.length > MAX_PLANES_POR_PLATAFORMA
          ? `· …y ${planesCon.length - MAX_PLANES_POR_PLATAFORMA} más en la sección Planes.`
          : null,
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
