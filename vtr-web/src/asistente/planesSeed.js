/** Catálogo comercial de Planes (seed). El admin puede editarlo en Firestore. */

export const STREAM_PACKS = {
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
]

export const PLANES_GRUPOS = [
  { id: '1p-internet', label: 'Internet Solo Fibra (FTTH)', tag: '1P' },
  { id: '1p-stream', label: 'Internet + Stream', tag: '1P' },
  { id: '1p-tv', label: 'Televisión Sola (Stream TV)', tag: '1P' },
  { id: '2p-tv', label: 'Doble Pack Internet + TV', tag: '2P' },
  { id: '2p-fono', label: 'Internet + Telefonía', tag: '2P' },
  { id: '3p', label: 'Triple Pack (Internet + TV + Telefonía)', tag: '3P' },
  { id: 'cable', label: 'Planes Cable VTR', tag: 'Cable' },
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
  orden: orden ?? 0,
})

export const PLANES_SEED = [
  plan('1p-internet', '1P', 'Fibra 600 Megas', 'Fibra Hogar Residencial 0226F', '$21.990', '$14.990', {}, 1),
  plan('1p-internet', '1P', 'Fibra 800 Megas', 'Fibra Avanzado Residencial 0226F', '$23.990', '$15.990', {}, 2),
  plan('1p-internet', '1P', 'Fibra 940 Megas', 'Fibra Experto Residencial 0226F', '$29.990', '$19.990', {}, 3),

  plan('1p-stream', '1P', 'Fibra 600 Megas + Disney+', 'Fibra Hogar Stream Residencial 1225F', '$29.990', '$19.990', { tags: ['Disney+'], streams: STREAM_PACKS.disney }, 1),
  plan('1p-stream', '1P', 'Fibra 600 Megas + Netflix', 'Fibra Hogar Stream 3 N0726F', '$29.990', '$19.990', { tags: ['Netflix'], streams: STREAM_PACKS.netflix }, 2),
  plan('1p-stream', '1P', 'Fibra 800 Megas + Disney+', 'Fibra Avanzado Stream Residencial 1225F', '$31.990', '$20.990', { tags: ['Disney+'], streams: STREAM_PACKS.disney }, 3),
  plan('1p-stream', '1P', 'Fibra 800 Megas + Netflix', 'Fibra Avanzado Stream 3 N0726F', '$31.990', '$20.990', { tags: ['Netflix'], streams: STREAM_PACKS.netflix }, 4),
  plan('1p-stream', '1P', 'Fibra 940 Megas + Disney+', 'Fibra Experto Stream Residencial 1225F', '$37.990', '$24.990', { tags: ['Disney+'], streams: STREAM_PACKS.disney }, 5),
  plan('1p-stream', '1P', 'Fibra 940 Megas + Netflix', 'Fibra Experto Stream 3 N0724F', '$37.990', '$24.990', { tags: ['Netflix'], streams: STREAM_PACKS.netflix }, 6),

  plan('1p-tv', '1P', 'Stream TV Inicia', 'TV Inicia Residencial 0325hd', '', '', {}, 1),
  plan('1p-tv', '1P', 'Stream TV Plus', 'Stream TV Plus 0324hd', '$22.990', '$22.990', {}, 2),
  plan('1p-tv', '1P', 'Stream TV Premium I', 'Stream TV Premium 0226F', '$28.990', '$28.990', { tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 3),
  plan('1p-tv', '1P', 'Stream TV Premium Residencial 2', 'TV Premium 2 Residencial N0726F', '$28.990', '$28.990', { tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 4),
  plan('1p-tv', '1P', 'Stream TV Premium Residencial 3', 'TV Premium 3 Residencial N0726F', '$33.990', '$33.990', { tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 5),

  plan('2p-tv', '2P', 'Fibra 600 + TV Inicia', '2P Fibra Hogar mas TV Inicia 0224F', '$41.990', '$41.990', {}, 1),
  plan('2p-tv', '2P', 'Fibra 600 + TV Plus', '2P Fibra Hogar mas Stream TV Plus 0225F', '$41.990', '$30.990', {}, 2),
  plan('2p-tv', '2P', 'Fibra 600 + TV Premium I', '2P Fibra Hogar mas Stream TV Premium 0225F', '$46.990', '$29.990', { tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 3),
  plan('2p-tv', '2P', 'Fibra 600 + TV Premium II', '2P Fibra Hogar mas TV Premium 2 Residencial N0726F', '$46.990', '$29.990', { tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 4),
  plan('2p-tv', '2P', 'Fibra 600 + TV Full', '2P Fibra Hogar mas TV Premium 3 Residencial N0726F', '$51.990', '$37.990', { tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 5),
  plan('2p-tv', '2P', 'Fibra 800 + TV Inicia', '2P Fibra Avanzado mas TV Inicia 0224F', '$42.990', '$42.990', {}, 6),
  plan('2p-tv', '2P', 'Fibra 800 + TV Plus', '2P Fibra Avanzado mas Stream TV Plus 0225F', '$42.990', '$31.990', {}, 7),
  plan('2p-tv', '2P', 'Fibra 800 + TV Premium I', '2P Fibra Avanzado mas Stream TV Premium 0225F', '$47.990', '$30.990', { tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 8),
  plan('2p-tv', '2P', 'Fibra 800 + TV Premium II', '2P Fibra Avanzado mas TV Premium 2 Residencial N0726F', '$47.990', '$30.990', { tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 9),
  plan('2p-tv', '2P', 'Fibra 800 + TV Full', '2P Fibra Avanzado mas TV Premium 3 Residencial N0726F', '$52.990', '$38.990', { tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 10),
  plan('2p-tv', '2P', 'Fibra 940 + TV Inicia', '2P Fibra Experto mas TV Inicia 0226F', '$47.990', '$47.990', {}, 11),
  plan('2p-tv', '2P', 'Fibra 940 + TV Plus', '2P Fibra Experto mas Stream TV Plus 0225F', '$47.990', '$35.990', {}, 12),
  plan('2p-tv', '2P', 'Fibra 940 + TV Premium I', '2P Fibra Experto mas Stream TV Premium 0225F', '$52.990', '$34.990', { tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 13),
  plan('2p-tv', '2P', 'Fibra 940 + TV Premium II', '2P Fibra Experto mas TV Premium 2 Residencial N0726F', '$52.990', '$34.990', { tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 14),
  plan('2p-tv', '2P', 'Fibra 940 + TV Full', '2P Fibra Experto mas TV Premium 3 Residencial N0726F', '$57.990', '$42.990', { tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 15),

  plan('2p-fono', '2P', 'Fibra 600 + Telefonía', '2P Fibra Hogar mas Fono 0226F', '$23.990', '$23.990', {}, 1),
  plan('2p-fono', '2P', 'Fibra 800 + Telefonía', '2P Fibra Avanzado mas Fono 0226F', '$26.990', '$26.990', {}, 2),
  plan('2p-fono', '2P', 'Fibra 940 + Telefonía', '2P Fibra Experto mas Fono 0226F', '$35.990', '$35.990', {}, 3),

  plan('3p', '3P', 'Fibra 600 + TV Inicia + Telefonía', '3P Fibra Hogar mas TV Inicia 0224F', '$46.990', '$46.990', {}, 1),
  plan('3p', '3P', 'Fibra 600 + TV Plus + Telefonía', '3P Fibra Hogar mas Stream TV Plus 0225F', '$46.990', '$35.990', {}, 2),
  plan('3p', '3P', 'Fibra 600 + TV Premium I + Telefonía', '3P Fibra Hogar mas Stream TV Premium 0225F', '$51.990', '$36.990', { tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 3),
  plan('3p', '3P', 'Fibra 600 + TV Premium II + Telefonía', '3P Fibra Hogar mas TV Premium 2 Residencial N0726F', '$51.990', '$36.990', { tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 4),
  plan('3p', '3P', 'Fibra 600 + TV Full + Telefonía', '3P Fibra Hogar mas TV Premium 3 Residencial N0726F', '$56.990', '$44.990', { tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 5),
  plan('3p', '3P', 'Fibra 800 + TV Inicia + Telefonía', '3P Fibra Avanzado mas TV Inicia 0224F', '$47.990', '$47.990', {}, 6),
  plan('3p', '3P', 'Fibra 800 + TV Plus + Telefonía', '3P Fibra Avanzado mas Stream TV Plus 0225F', '$47.990', '$36.990', {}, 7),
  plan('3p', '3P', 'Fibra 800 + TV Premium I + Telefonía', '3P Fibra Avanzado mas Stream TV Premium 0225F', '$53.990', '$37.990', { tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 8),
  plan('3p', '3P', 'Fibra 800 + TV Premium II + Telefonía', '3P Fibra Avanzado mas TV Premium 2 Residencial N0726F', '$53.990', '$37.990', { tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 9),
  plan('3p', '3P', 'Fibra 800 + TV Full + Telefonía', '3P Fibra Avanzado mas TV Premium 3 Residencial N0726F', '$58.990', '$45.990', { tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 10),
  plan('3p', '3P', 'Fibra 940 + TV Inicia + Telefonía', '3P Fibra Experto mas TV Inicia 0224F', '$52.990', '$52.990', {}, 11),
  plan('3p', '3P', 'Fibra 940 + TV Plus + Telefonía', '3P Fibra Experto mas Stream TV Plus 0225F', '$52.990', '$40.990', {}, 12),
  plan('3p', '3P', 'Fibra 940 + TV Premium I + Telefonía', '3P Fibra Experto mas Stream TV Premium 0225F', '$58.990', '$40.990', { tags: ['Disney+'], streams: STREAM_PACKS.premiumI }, 13),
  plan('3p', '3P', 'Fibra 940 + TV Premium II + Telefonía', '3P Fibra Experto mas TV Premium 2 Residencial N0726F', '$58.990', '$40.990', { tags: ['Netflix'], streams: STREAM_PACKS.premiumII }, 14),
  plan('3p', '3P', 'Fibra 940 + TV Full + Telefonía', '3P Fibra Experto mas TV Premium 3 Residencial N0726F', '$63.990', '$48.990', { tags: ['Disney+', 'Netflix'], streams: STREAM_PACKS.full }, 15),

  plan('cable', 'Cable', 'TV Inicia', 'TV Inicia Residencial', '$20.990', '', { canales: '74 canales', hd: '57 HD', incluyeExtras: false }, 1),
  plan('cable', 'Cable', 'TV Plus', 'Stream TV Plus', '$22.990', '', { canales: '101 canales', hd: '82 HD', incluyeExtras: true }, 2),
  plan('cable', 'Cable', 'TV Premium', 'Stream TV Premium', '$28.990', '', { canales: '101 canales', hd: '82 HD', incluyeExtras: true, streams: STREAM_PACKS.premiumI }, 3),
  plan('cable', 'Cable', 'TV Premium 2', 'TV Premium 2', '$28.990', '', { canales: '101 canales', hd: '82 HD', incluyeExtras: true, streams: STREAM_PACKS.premiumII }, 4),
  plan('cable', 'Cable', 'TV Full / Premium 3', 'TV Full / Premium 3', '$33.990', '', { canales: '74 canales', hd: '68 HD', incluyeExtras: true, streams: STREAM_PACKS.full }, 5),

  // Planes VTR Legacy
  plan('legacy', 'Legacy', '2P Internet Hogar mas Stream TV Plus 0225hd', '2P Internet Hogar mas Stream TV Plus 0225hd', '', '', { tags: ['Prime Video', 'HBO Max', 'Riivi', 'Atresplayer', 'Cindie', 'Teatrix'], streams: STREAM_PACKS.vtrLegacy }, 1),
  plan('legacy', 'Legacy', '2P Internet Hogar mas Fono 0225', '2P Internet Hogar mas Fono 0225', '$22.228', '$22.228', {}, 2),
  plan('legacy', 'Legacy', 'Doble Pack Finix 0322hd', 'Doble Pack Finix 0322hd', '', '', { tags: ['Prime Video', 'HBO Max', 'Riivi', 'Atresplayer', 'Cindie', 'Teatrix'], streams: STREAM_PACKS.vtrLegacy }, 3),
  plan('legacy', 'Legacy', 'Triple Pack Plus 0322hd', 'Triple Pack Plus 0322hd', '', '', { tags: ['Prime Video', 'HBO Max', 'Riivi', 'Atresplayer', 'Cindie', 'Teatrix'], streams: STREAM_PACKS.vtrLegacy }, 4),
  plan('legacy', 'Legacy', 'VTR Wifi 0822F', 'VTR Wifi 0822F', '$13.990', '$13.990', {}, 5),
  plan('legacy', 'Legacy', 'VTR Plus 3 0522hd', 'VTR Plus 3 0522hd', '', '', { tags: ['Prime Video', 'HBO Max', 'Riivi', 'Atresplayer', 'Cindie', 'Teatrix'], streams: STREAM_PACKS.vtrLegacy }, 6),
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
    orden: 99,
  }
}

export { slug as slugPlan }
