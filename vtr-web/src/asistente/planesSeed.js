/** Catálogo comercial de Planes (seed). El admin puede editarlo en Firestore.
 *  Fuente: Plan Comercial ClaroVTR Hogar — Octubre 2026 (V04). */

export const STREAM_PACKS = {
  // Pack básico de TV Inicia: HBO Max, Prime Video y Universal+.
  basico: ['/stream/hbo-max.png', '/stream/prime-video.png', '/stream/universal.png'],
  disney: ['/stream/disney.png'],
  netflix: ['/stream/netflix.png'],
  premiumI: [
    '/stream/disney.png',
    '/stream/hbo-max.png',
    '/stream/prime-video.png',
    '/stream/atresplayer.png',
    '/stream/universal.png',
    '/stream/cindie.png',
    '/stream/riivi.png',
    '/stream/teatrix.png',
  ],
  premiumII: [
    '/stream/netflix.png',
    '/stream/hbo-max.png',
    '/stream/prime-video.png',
    '/stream/atresplayer.png',
    '/stream/universal.png',
    '/stream/cindie.png',
    '/stream/riivi.png',
    '/stream/teatrix.png',
  ],
  full: [
    '/stream/disney.png',
    '/stream/netflix.png',
    '/stream/hbo-max.png',
    '/stream/prime-video.png',
    '/stream/atresplayer.png',
    '/stream/universal.png',
    '/stream/cindie.png',
    '/stream/riivi.png',
    '/stream/teatrix.png',
  ],
  vtrLegacy: [
    '/stream/prime-video.png',
    '/stream/hbo-max.png',
    '/stream/riivi.png',
    '/stream/atresplayer.png',
    '/stream/cindie.png',
    '/stream/teatrix.png',
  ],
}

export const STREAM_OPTIONS = [
  { src: '/stream/disney.png', name: 'Disney+' },
  { src: '/stream/netflix.png', name: 'Netflix' },
  { src: '/stream/hbo-max.png', name: 'HBO Max' },
  { src: '/stream/prime-video.png', name: 'Prime Video' },
  { src: '/stream/atresplayer.png', name: 'Atresplayer' },
  { src: '/stream/universal.png', name: 'Universal+' },
  { src: '/stream/cindie.png', name: 'Cindie' },
  { src: '/stream/riivi.png', name: 'Riivi' },
  { src: '/stream/teatrix.png', name: 'Teatrix' },
  // Plataformas exclusivas de Claro (no vienen en los packs VTR).
  { src: '/stream/tvn-play.png', name: 'TVN Play' },
  { src: '/onmedia.png', name: 'OndaMedia' },
  { src: '/STORYTEL.png', name: 'Storytel' },
]

/** Ruta del logo → nombre de la plataforma (fuente única para web, RAG y scripts). */
export const STREAM_NAMES = Object.fromEntries(
  STREAM_OPTIONS.map((o) => [o.src, o.name])
)

export const PLANES_GRUPOS = [
  { id: '1p-internet', label: 'Internet Solo (HFC / Fibra FTTH)', tag: '1P' },
  { id: '1p-stream', label: 'Internet + Stream (Disney+/Netflix)', tag: '1P' },
  { id: '2p-tv', label: 'Doble Pack Internet + TV', tag: '2P' },
  { id: '2p-fono', label: 'Internet o TV + Telefonía', tag: '2P' },
  { id: '3p', label: 'Triple Pack (Internet + TV + Telefonía)', tag: '3P' },
  { id: 'legacy', label: 'Planes VTR Legacy', tag: 'Legacy' },
]

const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72)

/**
 * Los planes agregados en Octubre 2026 (HFC 500 Mbps y TV Premium) no traen el
 * nombre de Andes en el plan comercial: el de abajo es referencial y hay que
 * validarlo en Andes antes de copiarlo a APEX.
 */
const NOTA_ANDES =
  'Nombre Andes referencial (Octubre 2026): validar en Andes antes de copiar a APEX.'

/** El plan comercial de Octubre 2026 no informa el nombre Andes de este plan. */
const NOTA_ANDES_PENDIENTE =
  'El plan comercial de Octubre 2026 no informa el nombre Andes: validar en Andes antes de copiar a APEX.'

const plan = (grupo, tag, comercial, andes, normal, promo, extra = {}, orden) => ({
  id: extra.id || `${grupo}__${slug(comercial)}`,
  grupo,
  tag,
  comercial,
  andes: andes || '',
  normal: normal || '',
  promo: promo || '',
  streams: extra.streams || [],
  tags: extra.tags || [],
  canales: extra.canales || '',
  hd: extra.hd || '',
  incluyeExtras: !!extra.incluyeExtras,
  red: extra.red || '',
  nota: extra.nota || '',
  orden: orden ?? 0,
})

export const PLANES_SEED = [
  plan('1p-internet', '1P', 'Internet 500 Megas', 'Internet Hogar 0425', '$21.990', '$14.990', { red: 'HFC', nota: NOTA_ANDES }, 1),
  plan('1p-internet', '1P', 'Fibra 600 Megas', 'Fibra Hogar Residencial 0226F', '$21.990', '$14.990', { red: 'FTTH' }, 2),
  plan('1p-internet', '1P', 'Fibra 800 Megas', 'Fibra Avanzado Residencial 0226F', '$23.990', '$15.990', { red: 'FTTH' }, 3),
  plan('1p-internet', '1P', 'Fibra 940 Megas', 'Fibra Experto Residencial 0226F', '$29.990', '$19.990', { red: 'FTTH' }, 4),

  plan('1p-stream', '1P', 'Internet 500 Megas + Disney+', 'Internet Hogar Stream 1225', '$29.990', '$19.990', { red: 'HFC', tags: ['Disney+'], streams: STREAM_PACKS.disney, nota: NOTA_ANDES }, 1),
  plan('1p-stream', '1P', 'Internet 500 Megas + Netflix', 'Internet Hogar Stream 3 N0726', '$29.990', '$19.990', { red: 'HFC', tags: ['Netflix'], streams: STREAM_PACKS.netflix, nota: NOTA_ANDES }, 2),
  plan('1p-stream', '1P', 'Fibra 600 Megas + Disney+', 'Fibra Hogar Stream Residencial 1225F', '$29.990', '$19.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.disney }, 3),
  plan('1p-stream', '1P', 'Fibra 600 Megas + Netflix', 'Fibra Hogar Stream 3 N0726F', '$29.990', '$19.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.netflix }, 4),
  plan('1p-stream', '1P', 'Fibra 800 Megas + Disney+', 'Fibra Avanzado Stream Residencial 1225F', '$31.990', '$20.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.disney }, 5),
  plan('1p-stream', '1P', 'Fibra 800 Megas + Netflix', 'Fibra Avanzado Stream 3 N0726F', '$31.990', '$20.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.netflix }, 6),
  plan('1p-stream', '1P', 'Fibra 940 Megas + Disney+', 'Fibra Experto Stream Residencial 1225F', '$37.990', '$24.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.disney }, 7),
  plan('1p-stream', '1P', 'Fibra 940 Megas + Netflix', 'Fibra Experto Stream 3 N0724F', '$37.990', '$24.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.netflix }, 8),

  plan('2p-tv', '2P', 'Internet 500 + TV Inicia', '2P Internet Hogar mas TV Inicia 0225hd', '$41.990', '', { red: 'HFC', nota: NOTA_ANDES, streams: STREAM_PACKS.basico, tags: ['HBO Max', 'Prime Video', 'Universal+'] }, 1),
  plan('2p-tv', '2P', 'Internet 500 + TV Premium', '2P Internet Hogar mas TV Premium 0225hd', '$46.990', '$29.990', { red: 'HFC', tags: ['Disney+'], streams: STREAM_PACKS.premiumI, nota: NOTA_ANDES }, 2),
  plan('2p-tv', '2P', 'Fibra 600 + TV Inicia', '2P Fibra Hogar mas TV Inicia 0224F', '$41.990', '$41.990', { red: 'FTTH', streams: STREAM_PACKS.basico, tags: ['HBO Max', 'Prime Video', 'Universal+'] }, 3),
  plan('2p-tv', '2P', 'Fibra 600 + TV Premium I', '2P Fibra Hogar mas Stream TV Premium 0225F', '$46.990', '$29.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 4),
  plan('2p-tv', '2P', 'Fibra 600 + TV Premium II', '2P Fibra Hogar mas TV Premium 2 Residencial N0726F', '$46.990', '$29.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 5),
  plan('2p-tv', '2P', 'Fibra 600 + TV Full', '2P Fibra Hogar mas TV Premium 3 Residencial N0726F', '$51.990', '$37.990', { red: 'FTTH', tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 6),
  plan('2p-tv', '2P', 'Fibra 800 + TV Inicia', '2P Fibra Avanzado mas TV Inicia 0224F', '$42.990', '$42.990', { red: 'FTTH', streams: STREAM_PACKS.basico, tags: ['HBO Max', 'Prime Video', 'Universal+'] }, 7),
  plan('2p-tv', '2P', 'Fibra 800 + TV Premium I', '2P Fibra Avanzado mas Stream TV Premium 0225F', '$47.990', '$30.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 8),
  plan('2p-tv', '2P', 'Fibra 800 + TV Premium II', '2P Fibra Avanzado mas TV Premium 2 Residencial N0726F', '$47.990', '$30.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 9),
  plan('2p-tv', '2P', 'Fibra 800 + TV Full', '2P Fibra Avanzado mas TV Premium 3 Residencial N0726F', '$52.990', '$38.990', { red: 'FTTH', tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 10),
  plan('2p-tv', '2P', 'Fibra 940 + TV Inicia', '2P Fibra Experto mas TV Inicia 0226F', '$47.990', '$47.990', { red: 'FTTH', streams: STREAM_PACKS.basico, tags: ['HBO Max', 'Prime Video', 'Universal+'] }, 11),
  plan('2p-tv', '2P', 'Fibra 940 + TV Premium I', '2P Fibra Experto mas Stream TV Premium 0225F', '$52.990', '$34.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 12),
  plan('2p-tv', '2P', 'Fibra 940 + TV Premium II', '2P Fibra Experto mas TV Premium 2 Residencial N0726F', '$52.990', '$34.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 13),
  plan('2p-tv', '2P', 'Fibra 940 + TV Full', '2P Fibra Experto mas TV Premium 3 Residencial N0726F', '$57.990', '$42.990', { red: 'FTTH', tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 14),

  plan('2p-fono', '2P', 'Internet 500 + Telefonía', '2P Internet Hogar mas Fono 0225', '$23.990', '', { red: 'HFC', nota: NOTA_ANDES }, 1),
  plan('2p-fono', '2P', 'TV Premium + Telefonía', '2P TV Premium mas Telefonia 0225', '$38.990', '', { nota: NOTA_ANDES, streams: STREAM_PACKS.premiumI, tags: ['Disney+'] }, 2),
  plan('2p-fono', '2P', 'Fibra 600 + Telefonía', '2P Fibra Hogar mas Fono 0226F', '$23.990', '$23.990', { red: 'FTTH' }, 3),
  plan('2p-fono', '2P', 'Fibra 800 + Telefonía', '2P Fibra Avanzado mas Fono 0226F', '$26.990', '$26.990', { red: 'FTTH' }, 4),
  plan('2p-fono', '2P', 'Fibra 940 + Telefonía', '2P Fibra Experto mas Fono 0226F', '$35.990', '$35.990', { red: 'FTTH' }, 5),

  plan('3p', '3P', 'Internet 500 + TV Inicia + Fono', '3P Internet Hogar mas TV Inicia 0225hd', '$46.990', '', { red: 'HFC', nota: NOTA_ANDES, streams: STREAM_PACKS.basico, tags: ['HBO Max', 'Prime Video', 'Universal+'] }, 1),
  plan('3p', '3P', 'Internet 500 + TV Premium + Fono', '3P Internet Hogar mas TV Premium 0225hd', '$51.990', '$36.990', { red: 'HFC', tags: ['Disney+'], streams: STREAM_PACKS.premiumI, nota: NOTA_ANDES }, 2),
  plan('3p', '3P', 'Internet 500 + TV Premium II + Fono', '3P Internet Hogar mas TV Premium 2 N0726', '$51.990', '$36.990', { red: 'HFC', tags: ['Netflix'], streams: STREAM_PACKS.premiumII, nota: NOTA_ANDES }, 3),
  plan('3p', '3P', 'Internet 500 + TV Full + Fono', '3P Internet Hogar mas TV Premium 3 N0726', '$56.990', '$44.990', { red: 'HFC', tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full, nota: NOTA_ANDES }, 4),
  plan('3p', '3P', 'Fibra 600 + TV Inicia + Telefonía', '3P Fibra Hogar mas TV Inicia 0224F', '$46.990', '$46.990', { red: 'FTTH', streams: STREAM_PACKS.basico, tags: ['HBO Max', 'Prime Video', 'Universal+'] }, 5),
  plan('3p', '3P', 'Fibra 600 + TV Premium I + Telefonía', '3P Fibra Hogar mas Stream TV Premium 0225F', '$51.990', '$36.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 6),
  plan('3p', '3P', 'Fibra 600 + TV Premium II + Telefonía', '3P Fibra Hogar mas TV Premium 2 Residencial N0726F', '$51.990', '$36.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 7),
  plan('3p', '3P', 'Fibra 600 + TV Full + Telefonía', '3P Fibra Hogar mas TV Premium 3 Residencial N0726F', '$56.990', '$42.990', { red: 'FTTH', tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 8),
  plan('3p', '3P', 'Fibra 800 + TV Inicia + Telefonía', '3P Fibra Avanzado mas TV Inicia 0224F', '$47.990', '$47.990', { red: 'FTTH', streams: STREAM_PACKS.basico, tags: ['HBO Max', 'Prime Video', 'Universal+'] }, 9),
  plan('3p', '3P', 'Fibra 800 + TV Premium I + Telefonía', '3P Fibra Avanzado mas Stream TV Premium 0225F', '$53.990', '$38.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 10),
  plan('3p', '3P', 'Fibra 800 + TV Premium II + Telefonía', '3P Fibra Avanzado mas TV Premium 2 Residencial N0726F', '$53.990', '$38.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 11),
  plan('3p', '3P', 'Fibra 800 + TV Full + Telefonía', '3P Fibra Avanzado mas TV Premium 3 Residencial N0726F', '$58.990', '$44.990', { red: 'FTTH', tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 12),
  plan('3p', '3P', 'Fibra 940 + TV Inicia + Telefonía', '3P Fibra Experto mas TV Inicia 0224F', '$52.990', '$52.990', { red: 'FTTH', streams: STREAM_PACKS.basico, tags: ['HBO Max', 'Prime Video', 'Universal+'] }, 13),
  plan('3p', '3P', 'Fibra 940 + TV Premium I + Telefonía', '3P Fibra Experto mas Stream TV Premium 0225F', '$58.990', '$41.990', { red: 'FTTH', tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 14),
  plan('3p', '3P', 'Fibra 940 + TV Premium II + Telefonía', '3P Fibra Experto mas TV Premium 2 Residencial N0726F', '$58.990', '$41.990', { red: 'FTTH', tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 15),
  plan('3p', '3P', 'Fibra 940 + TV Full + Telefonía', '3P Fibra Experto mas TV Premium 3 Residencial N0726F', '$63.990', '$48.990', { red: 'FTTH', tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 16),
]

export function vacioPlan(grupo = '1p-internet') {
  const g = PLANES_GRUPOS.find((x) => x.id === grupo) || PLANES_GRUPOS[0]
  return {
    id: '',
    grupo: g.id,
    tag: g.tag,
    comercial: '',
    andes: '',
    normal: '',
    promo: '',
    streams: [],
    tags: [],
    canales: '',
    hd: '',
    incluyeExtras: false,
    red: '',
    nota: '',
    orden: 99,
  }
}

export { slug as slugPlan }
