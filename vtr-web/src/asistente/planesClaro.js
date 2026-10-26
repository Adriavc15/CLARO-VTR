/** Catálogo de planes Claro Chile — Octubre 2026 (V04).
 *  Separado por tecnología: HFC y FTTH.
 *  Fuente: "Plan Comercial ClaroVTR Hogar — Octubre 2026 (V04)".
 *
 *  Los precios se guardan como número plano (igual que el Excel) y se formatean
 *  acá, para que el descuento nunca se desvíe del precio de lista.
 *  `promo: null` = sin precio promo (el Excel lo deja como "-"). */

/** $21.990 con separador de miles (convención del catálogo Claro). */
const money = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

/**
 * Packs de streaming de Claro (Octubre 2026).
 * TVN Play, OndaMedia y Storytel son exclusivos de Claro: no vienen en los
 * packs VTR. TV Inicia (pack básico) solo trae las 3 plataformas base.
 */
export const CLARO_STREAM_PACKS = {
  basico: ['/stream/hbo-max.png', '/stream/prime-video.png', '/stream/universal.png'],
  premiumI: [
    '/stream/disney.png',
    '/stream/hbo-max.png',
    '/stream/prime-video.png',
    '/stream/universal.png',
    '/stream/atresplayer.png',
    '/stream/teatrix.png',
    '/stream/cindie.png',
    '/stream/riivi.png',
    '/stream/tvn-play.png',
    '/onmedia.png',
    '/STORYTEL.png',
  ],
  premiumII: [
    '/stream/netflix.png',
    '/stream/hbo-max.png',
    '/stream/prime-video.png',
    '/stream/universal.png',
    '/stream/atresplayer.png',
    '/stream/teatrix.png',
    '/stream/cindie.png',
    '/stream/riivi.png',
    '/stream/tvn-play.png',
    '/onmedia.png',
    '/STORYTEL.png',
  ],
  full: [
    '/stream/disney.png',
    '/stream/netflix.png',
    '/stream/hbo-max.png',
    '/stream/prime-video.png',
    '/stream/universal.png',
    '/stream/atresplayer.png',
    '/stream/teatrix.png',
    '/stream/cindie.png',
    '/stream/riivi.png',
    '/stream/tvn-play.png',
    '/onmedia.png',
    '/STORYTEL.png',
  ],
}

const STREAM_TAGS = {
  basico: ['HBO Max', 'Prime Video', 'Universal+'],
  premiumI: ['Disney+', 'HBO Max', 'Prime Video', 'Universal+', 'Atresplayer', 'Teatrix', 'Cindie', 'Riivi', 'TVN Play', 'OndaMedia', 'Storytel'],
  premiumII: ['Netflix', 'HBO Max', 'Prime Video', 'Universal+', 'Atresplayer', 'Teatrix', 'Cindie', 'Riivi', 'TVN Play', 'OndaMedia', 'Storytel'],
  full: ['Disney+', 'Netflix', 'HBO Max', 'Prime Video', 'Universal+', 'Atresplayer', 'Teatrix', 'Cindie', 'Riivi', 'TVN Play', 'OndaMedia', 'Storytel'],
}

/** Nombres de Andes que el plan comercial de Octubre 2026 no trae: son referenciales. */
const NOTA_ANDES =
  'Nombre Andes referencial (Octubre 2026): validar en Andes antes de copiar a APEX.'

const RAW_HFC = [
  // --- 1P -----------------------------------------------------------------
  {
    pack: '1P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 Megas',
    andes: 'Internet Hogar Claro 0425', precio: 21990, promo: 14990,
  },
  {
    pack: '1P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 Megas + Disney+',
    andes: 'Internet Hogar Stream Claro 1225', precio: 29990, promo: 19990,
    streams: 'disney', tags: ['Disney+'],
  },
  {
    pack: '1P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 Megas + Netflix',
    andes: 'Internet Hogar Stream 3 Claro N0726', precio: 29990, promo: 19990,
    streams: 'netflix', tags: ['Netflix'],
  },

  // --- 2P -----------------------------------------------------------------
  {
    pack: '2P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + TV Inicia',
    andes: '2P Internet Hogar mas TV Inicia 0425i', precio: 36990, promo: 26990,
    tipoTv: 'inicia', canales: '77 canales', hd: '66 HD', streams: 'basico', tags: STREAM_TAGS.basico,
  },
  {
    pack: '2P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + TV Premium',
    andes: '2P Internet Hogar mas TV Premium 0425i', precio: 46990, promo: 29990,
    tipoTv: 'premium', canales: '74 canales', hd: '68 HD', streams: 'premiumI', tags: STREAM_TAGS.premiumI,
  },
  {
    pack: '2P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + TV Premium II',
    andes: '2P Internet Hogar mas TV Premium 2 N0726i', precio: 46990, promo: 29990,
    tipoTv: 'premium2', canales: '74 canales', hd: '68 HD', streams: 'premiumII', tags: STREAM_TAGS.premiumII,
  },
  {
    pack: '2P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + TV Full',
    andes: '2P Internet Hogar mas TV Premium 3 N0726i', precio: 51990, promo: 37990,
    tipoTv: 'full', canales: '74 canales', hd: '68 HD', streams: 'full', tags: STREAM_TAGS.full,
  },
  {
    pack: '2P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + Telefonía',
    andes: '2P Internet Hogar mas Telefonia 0225', precio: 29990, promo: 23990,
  },

  // --- 3P -----------------------------------------------------------------
  {
    pack: '3P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + TV Inicia + Fono',
    andes: '3P Internet Hogar mas TV Inicia 0425i', precio: 38990, promo: 27990,
    tipoTv: 'inicia', canales: '77 canales', hd: '66 HD', streams: 'basico', tags: STREAM_TAGS.basico,
  },
  {
    pack: '3P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + TV Premium + Fono',
    andes: '3P Internet Hogar mas TV Premium 0425i', precio: 51990, promo: 36990,
    tipoTv: 'premium', canales: '74 canales', hd: '68 HD', streams: 'premiumI', tags: STREAM_TAGS.premiumI,
  },
  {
    pack: '3P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + TV Premium II + Fono',
    andes: '3P Internet Hogar mas TV Premium 2 N0726i', precio: 51990, promo: 36990,
    tipoTv: 'premium2', canales: '74 canales', hd: '68 HD', streams: 'premiumII', tags: STREAM_TAGS.premiumII,
  },
  {
    pack: '3P', megas: '500 Megas', tecnologia: 'HFC', comercial: 'Internet 500 + TV Full + Fono',
    andes: '3P Internet Hogar mas TV Premium 3 N0726i', precio: 56990, promo: 44990,
    tipoTv: 'full', canales: '74 canales', hd: '68 HD', streams: 'full', tags: STREAM_TAGS.full,
  },
]

const RAW_FTTH = [
  // --- 1P -----------------------------------------------------------------
  {
    pack: '1P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 Megas',
    andes: 'Fibra Hogar Residencial 0226F', precio: 21990, promo: 14990,
  },
  {
    pack: '1P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 Megas + Disney+',
    andes: 'Fibra Hogar Stream Residencial 1225F', precio: 29990, promo: 19990,
    streams: 'disney', tags: ['Disney+'],
  },
  {
    pack: '1P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 Megas + Netflix',
    andes: 'Fibra Hogar Stream 3 N0726F', precio: 29990, promo: 19990,
    streams: 'netflix', tags: ['Netflix'],
  },
  {
    pack: '1P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 Megas',
    andes: 'Fibra Avanzado Residencial 0226F', precio: 23990, promo: 15990,
  },
  {
    pack: '1P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 Megas + Disney+',
    andes: 'Fibra Avanzado Stream Residencial 1225F', precio: 31990, promo: 20990,
    streams: 'disney', tags: ['Disney+'],
  },
  {
    pack: '1P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 Megas + Netflix',
    andes: 'Fibra Avanzado Stream 3 N0726F', precio: 31990, promo: 20990,
    streams: 'netflix', tags: ['Netflix'],
  },
  {
    pack: '1P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 Megas',
    andes: 'Fibra Experto Residencial 0226F', precio: 29990, promo: 19990,
  },
  {
    pack: '1P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 Megas + Disney+',
    andes: 'Fibra Experto Stream Residencial 1225F', precio: 37990, promo: 24990,
    streams: 'disney', tags: ['Disney+'],
  },
  {
    pack: '1P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 Megas + Netflix',
    andes: 'Fibra Experto Stream 3 N0724F', precio: 37990, promo: 24990,
    streams: 'netflix', tags: ['Netflix'],
  },

  // --- 2P -----------------------------------------------------------------
  {
    pack: '2P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 + TV Inicia',
    andes: '2P Fibra Hogar mas TV Inicia 0224F', precio: 41990, promo: null,
    tipoTv: 'inicia', canales: '77 canales', hd: '66 HD', streams: 'basico', tags: STREAM_TAGS.basico,
  },
  {
    pack: '2P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 + TV Premium',
    andes: '2P Fibra Hogar mas TV Premium 0225F', precio: 46990, promo: 29990,
    tipoTv: 'premium', canales: '74 canales', hd: '68 HD', streams: 'premiumI', tags: STREAM_TAGS.premiumI,
    nota: NOTA_ANDES,
  },
  {
    pack: '2P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 + TV Premium II',
    andes: '2P Fibra Hogar mas TV Premium 2 Residencial N0726F', precio: 46990, promo: 29990,
    tipoTv: 'premium2', canales: '74 canales', hd: '68 HD', streams: 'premiumII', tags: STREAM_TAGS.premiumII,
  },
  {
    pack: '2P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 + TV Full',
    andes: '2P Fibra Hogar mas TV Premium 3 Residencial N0726F', precio: 51990, promo: 37990,
    tipoTv: 'full', canales: '74 canales', hd: '68 HD', streams: 'full', tags: STREAM_TAGS.full,
  },
  {
    pack: '2P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 + TV Inicia',
    andes: '2P Fibra Avanzado mas TV Inicia 0224F', precio: 42990, promo: null,
    tipoTv: 'inicia', canales: '77 canales', hd: '66 HD', streams: 'basico', tags: STREAM_TAGS.basico,
  },
  {
    pack: '2P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 + TV Premium',
    andes: '2P Fibra Avanzado mas TV Premium 0225F', precio: 47990, promo: 30990,
    tipoTv: 'premium', canales: '74 canales', hd: '68 HD', streams: 'premiumI', tags: STREAM_TAGS.premiumI,
    nota: NOTA_ANDES,
  },
  {
    pack: '2P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 + TV Premium II',
    andes: '2P Fibra Avanzado mas TV Premium 2 Residencial N0726F', precio: 47990, promo: 30990,
    tipoTv: 'premium2', canales: '74 canales', hd: '68 HD', streams: 'premiumII', tags: STREAM_TAGS.premiumII,
  },
  {
    pack: '2P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 + TV Full',
    andes: '2P Fibra Avanzado mas TV Premium 3 Residencial N0726F', precio: 52990, promo: 38990,
    tipoTv: 'full', canales: '74 canales', hd: '68 HD', streams: 'full', tags: STREAM_TAGS.full,
  },
  {
    pack: '2P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 + TV Inicia',
    andes: '2P Fibra Experto mas TV Inicia 0226F', precio: 47990, promo: null,
    tipoTv: 'inicia', canales: '77 canales', hd: '66 HD', streams: 'basico', tags: STREAM_TAGS.basico,
  },
  {
    pack: '2P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 + TV Premium',
    andes: '2P Fibra Experto mas TV Premium 0225F', precio: 52990, promo: 34990,
    tipoTv: 'premium', canales: '74 canales', hd: '68 HD', streams: 'premiumI', tags: STREAM_TAGS.premiumI,
    nota: NOTA_ANDES,
  },
  {
    pack: '2P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 + TV Premium II',
    andes: '2P Fibra Experto mas TV Premium 2 Residencial N0726F', precio: 52990, promo: 34990,
    tipoTv: 'premium2', canales: '74 canales', hd: '68 HD', streams: 'premiumII', tags: STREAM_TAGS.premiumII,
  },
  {
    pack: '2P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 + TV Full',
    andes: '2P Fibra Experto mas TV Premium 3 Residencial N0726F', precio: 57990, promo: 42990,
    tipoTv: 'full', canales: '74 canales', hd: '68 HD', streams: 'full', tags: STREAM_TAGS.full,
  },

  // --- 3P -----------------------------------------------------------------
  {
    pack: '3P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 + TV Inicia + Fono',
    andes: '3P Fibra Hogar mas TV Inicia 0224F', precio: 38990, promo: 27990,
    tipoTv: 'inicia', canales: '77 canales', hd: '66 HD', streams: 'basico', tags: STREAM_TAGS.basico,
  },
  {
    pack: '3P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 + TV Premium + Fono',
    andes: '3P Fibra Hogar mas TV Premium 0225F', precio: 51990, promo: 36990,
    tipoTv: 'premium', canales: '74 canales', hd: '68 HD', streams: 'premiumI', tags: STREAM_TAGS.premiumI,
    nota: NOTA_ANDES,
  },
  {
    pack: '3P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 + TV Premium II + Fono',
    andes: '3P Fibra Hogar mas TV Premium 2 Residencial N0726F', precio: 51990, promo: 36990,
    tipoTv: 'premium2', canales: '74 canales', hd: '68 HD', streams: 'premiumII', tags: STREAM_TAGS.premiumII,
  },
  {
    pack: '3P', megas: '600 Megas', tecnologia: 'FTTH', comercial: 'Fibra 600 + TV Full + Fono',
    andes: '3P Fibra Hogar mas TV Premium 3 Residencial N0726F', precio: 56990, promo: 42990,
    tipoTv: 'full', canales: '74 canales', hd: '68 HD', streams: 'full', tags: STREAM_TAGS.full,
  },
  {
    pack: '3P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 + TV Inicia + Fono',
    andes: '3P Fibra Avanzado mas TV Inicia 0224F', precio: 47990, promo: null,
    tipoTv: 'inicia', canales: '77 canales', hd: '66 HD', streams: 'basico', tags: STREAM_TAGS.basico,
  },
  {
    pack: '3P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 + TV Premium + Fono',
    andes: '3P Fibra Avanzado mas TV Premium 0225F', precio: 52990, promo: 37990,
    tipoTv: 'premium', canales: '74 canales', hd: '68 HD', streams: 'premiumI', tags: STREAM_TAGS.premiumI,
    nota: NOTA_ANDES,
  },
  {
    pack: '3P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 + TV Premium II + Fono',
    andes: '3P Fibra Avanzado mas TV Premium 2 Residencial N0726F', precio: 52990, promo: 37990,
    tipoTv: 'premium2', canales: '74 canales', hd: '68 HD', streams: 'premiumII', tags: STREAM_TAGS.premiumII,
  },
  {
    pack: '3P', megas: '800 Megas', tecnologia: 'FTTH', comercial: 'Fibra 800 + TV Full + Fono',
    andes: '3P Fibra Avanzado mas TV Premium 3 Residencial N0726F', precio: 58990, promo: 44990,
    tipoTv: 'full', canales: '74 canales', hd: '68 HD', streams: 'full', tags: STREAM_TAGS.full,
  },
  {
    pack: '3P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 + TV Inicia + Fono',
    andes: '3P Fibra Experto mas TV Inicia 0224F', precio: 52990, promo: null,
    tipoTv: 'inicia', canales: '77 canales', hd: '66 HD', streams: 'basico', tags: STREAM_TAGS.basico,
  },
  {
    pack: '3P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 + TV Premium + Fono',
    andes: '3P Fibra Experto mas TV Premium 0225F', precio: 58990, promo: 40990,
    tipoTv: 'premium', canales: '74 canales', hd: '68 HD', streams: 'premiumI', tags: STREAM_TAGS.premiumI,
    nota: NOTA_ANDES,
  },
  {
    pack: '3P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 + TV Premium II + Fono',
    andes: '3P Fibra Experto mas TV Premium 2 Residencial N0726F', precio: 58990, promo: 40990,
    tipoTv: 'premium2', canales: '74 canales', hd: '68 HD', streams: 'premiumII', tags: STREAM_TAGS.premiumII,
  },
  {
    pack: '3P', megas: '940 Megas', tecnologia: 'FTTH', comercial: 'Fibra 940 + TV Full + Fono',
    andes: '3P Fibra Experto mas TV Premium 3 Residencial N0726F', precio: 63990, promo: 48990,
    tipoTv: 'full', canales: '74 canales', hd: '68 HD', streams: 'full', tags: STREAM_TAGS.full,
  },
]

const STREAMS_DE = {
  disney: ['/stream/disney.png'],
  netflix: ['/stream/netflix.png'],
}

const streamsDe = (key) => {
  if (!key) return []
  if (STREAMS_DE[key]) return STREAMS_DE[key]
  return CLARO_STREAM_PACKS[key] || []
}

const normalizar = (r) => ({
  pack: r.pack,
  megas: r.megas,
  tecnologia: r.tecnologia,
  comercial: r.comercial,
  andes: r.andes,
  precio: money(r.precio),
  descuento: r.promo ? money(r.precio - r.promo) : '-',
  promo: r.promo ? money(r.promo) : '-',
  tipoTv: r.tipoTv || null,
  canales: r.canales || null,
  hd: r.hd || null,
  streams: streamsDe(r.streams),
  tags: r.tags || [],
  nota: r.nota || '',
})

export const CLARO_HFC = RAW_HFC.map(normalizar)
export const CLARO_FTTH = RAW_FTTH.map(normalizar)
export const PLANES_CLARO = [...CLARO_HFC, ...CLARO_FTTH]

/**
 * Packs premium adicionales de Claro (Octubre 2026): son opcionales y de pago
 * extra sobre el plan hired. No son planes: no tienen combo de servicios.
 */
export const CLARO_PACKS_PREMIUM = [
  { id: 'hotpack', nombre: 'Hotpack', precio: '$7.490', canales: 'Canales 305, 301, 302 (Venus etc.)', notas: 'Premium adulto. Los diales 301, 302 y 305 se muestran solo en la grilla Claro.' },
  { id: 'universal', nombre: 'Universal+', precio: '$7.490', canales: 'Canales 280-285, 780-785', notas: 'Solo grilla Claro. No aparece con ese nombre en VTR.' },
  { id: 'espn-premium', nombre: 'ESPN Premium', precio: '$9.990', canales: 'Canales 473, 477, 478, 479, 480', notas: 'Deportes ESPN. Esos diales se muestran solo en la grilla Claro.' },
  { id: 'tnt-sports-premium', nombre: 'TNT Sports Premium', precio: '$13.990', canales: 'SD 190 / HD 490 (el dial no se muestra en la grilla)', notas: 'También disponible como TNT Sports en HBO Max' },
  { id: 'venus', nombre: 'Venus (solo HFC)', precio: '$5.490', canales: 'Canal 301 Venus', notas: 'Solo red HFC' },
  { id: 'pack-adulto-hfc', nombre: 'Premium Pack Adulto (solo HFC)', precio: '$6.990', canales: 'Pack adulto', notas: 'Solo red HFC' },
]
