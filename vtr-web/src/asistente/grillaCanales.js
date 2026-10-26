/**
 * Canales de TV.
 *
 * La fuente es el Plan Comercial de Octubre 2026:
 *
 * · GUÍAS OFICIALES (`GUIA_CANALES`): lista categorizada con el número de canal
 *   real de cada señal.
 *   · VTR — página 40: grilla TV Premium (HFC/FTTH), 101 canales (84 HD y
 *     17 SD), organizados por categoría. La tabla lista 102 señales sobre 100
 *     diales: el 822 y el 785 transmiten dos señales cada uno.
 *   · Claro — página 39: TV Inicia (77 canales, 66 HD) y TV Full / Premium /
 *     Premium II (74 canales, 68 HD), más los packs premium de pago extra.
 * · GRILLAS DEL PORTAL (`GRILLAS_CANALES`): una entrada por grilla, con las
 *   señales y el conteo declarado por la fuente. Es lo que usa el modal.
 *
 * La fuente entrega el total de canales y de HD por plan, pero no marca la
 * calidad señal por señal. En VTR el dial sí la define (ver `DIALES_SD_VTR`), así
 * que ahí sí se puede filtrar por HD. En Claro la calidad se informa a nivel de
 * grilla y no señal por señal.
 *
 * `CONFLICTOS_VTR` deja constancia de los puntos donde la fuente se contradice o
 * quedó desactualizada. No se resuelve por defecto: hay que confirmarlo en
 * vtr.com/guia-canales con la comuna del cliente.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * LISTAS OFICIALES — Plan Comercial, Octubre 2026
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * GRILLA VTR TV PREMIUM (HFC/FTTH) — página 40 del Plan Comercial.
 *
 * 101 canales (84 HD y 17 SD) según el plan, organizados por categoría. La tabla
 * lista 102 señales sobre 100 diales: el 822 transmite dos señales (Telemundo
 * Internacional y Art Cinema) y el 785 también (Space y TCM). Se listan todas.
 */
const VTR_TV_PREMIUM = [
  ['Cine & Series', [
    [822, 'Telemundo Internacional'], [773, 'A3Series'], [774, 'A3Cine'], [823, 'TVN 3'],
    [782, 'Cinemax'], [788, 'Universal Channel'], [743, 'Adult Swim'], [497, 'Sony Channel'],
    [781, 'TNT'], [768, 'TNT Series'], [771, 'TNT Novelas'], [769, 'Universal Channel'],
    [787, 'Universal Channel'], [822, 'Art Cinema'], [785, 'Space'], [824, 'STAR Channel'],
    [784, 'AMC'], [772, 'Warner Channel'], [765, 'STAR Channel'],
    [767, 'ID (Investigation Discovery)'], [764, 'Warner Channel'], [789, 'Studio Universal'],
    [759, 'Warner Channel'], [763, 'Cinecanal'], [758, 'I-Sat'], [783, 'FX'], [748, 'TCM'],
    [785, 'TCM'], [790, 'HBO'], [795, 'HBO 2'], [794, 'HBO Signature'], [796, 'HBO Pop'],
    [797, 'HBO Family'], [791, 'HBO Mundi'], [792, 'HBO Plus'], [793, 'HBO'],
  ]],
  ['Cultural', [
    [737, '13C'], [730, 'History Channel'], [733, 'Discovery Channel'],
    [734, 'TVE'], [99, 'TNE'], [68, 'EWTN'], [742, 'History 2'], [731, 'Love Nature'],
    [739, 'National Geographic'], [756, 'Docu'], [73, 'Nat Geo Wild'], [72, 'Discovery'],
  ]],
  ['Deportes', [
    [854, 'TNT Sports'], [846, 'GolTV'], [847, 'ESPN'], [844, 'Golf Channel'],
    [845, 'Red Bull TV'], [841, 'ESPN'], [843, 'ESPN 2'], [210, 'Turbo'], [842, 'ESPN 3'],
    [840, 'ESPN 4'], [859, 'ESPN 5'], [862, 'ESPN 6'],
  ]],
  ['Entretenimiento', [
    [727, 'K-Nino'], [850, 'Comedy Central'], [749, 'Universal Channel'],
    [736, 'Warner Channel'], [750, 'Food Network'], [315, 'Las Estrellas'], [747, 'E!'],
    [744, 'TLC'], [717, 'VIA X'], [751, 'Más Chic'], [762, 'REC TV'], [209, 'HGTV'],
    [716, 'Zona Latina'], [752, 'Glitz'], [746, 'H&H (Home & Health)'],
    [766, 'Film & Arts'],
  ]],
  ['Infantil', [
    [722, 'Disney Channel'], [719, 'KidsCo'], [720, 'Disney Junior'], [723, 'Nick Jr / Ok'],
    [7, 'Disney Junior'], [725, 'Cartoonito'], [757, 'Boomerang / Tooncast'],
    [718, 'Cartoon Network'], [254, 'Nick'], [251, 'Discovery Kids'],
  ]],
  ['Internacional', [
    [825, 'Antena 3'], [820, '24 Horas'], [352, 'Deutsche Welle (DW)'], [353, 'TV5 Monde'],
    [354, 'Rai Italia'],
  ]],
  ['Noticias', [
    [740, 'CNN Chile'], [714, '24 Horas'], [715, 'CNN en Español'],
    [830, 'CNN International / World News'], [738, 'T13 en vivo'], [71, 'CNN Chile'],
    [351, 'CNN en Español'], [372, 'T13 en vivo'], [47, 'A+'],
  ]],
]

/**
 * Diales SD de la grilla VTR.
 *
 * La fuente declara 84 HD y 17 SD pero no marca la calidad por fila. En esta
 * grilla el dial la define: los diales menores a 500 son SD, salvo el 497 (Sony
 * Channel), que va en el bloque 4xx de packs premium y es HD. Con esa regla se
 * obtienen los 17 SD que declara la fuente.
 */
const DIALES_SD_VTR = new Set([
  7, 47, 68, 71, 72, 73, 99, 209, 210, 251, 254, 315, 351, 352, 353, 354, 372,
])

/**
 * GRILLA CLARO TV INICIA — página 39 del Plan Comercial.
 * 77 canales (66 HD).
 * Discovery Science se muestra solo como wordmark SCIENCE en el 528.
 */
const CLARO_TV_INICIA = [
  [586, 'Warner Channel'], [587, 'Sony Channel'], [588, '13C'], [589, 'Comedy Central'],
  [592, 'TNT HD'], [595, 'TCM'], [597, 'Film & Arts'], [598, 'Cinecanal'], [599, 'TCM'],
  [602, 'Universal Channel'], [603, 'Studio Universal'], [611, 'Space'], [612, 'A&E'],
  [613, 'AMC'], [615, 'I-Sat'], [632, 'ID (Investigation Discovery)'], [633, 'TNT Series'],
  [634, 'Adult Swim'], [635, 'TNT'], [643, 'Corazón'], [645, 'TruTV'], [762, 'HBO'],
  [520, 'Discovery Channel'], [526, 'Discovery Turbo'], [528, 'SCIENCE'],
  [529, 'Discovery Home & Health'], [540, 'Animal Planet'], [543, 'Discovery Kids'],
  [620, 'Warner Channel'], [621, 'Discovery'], [622, 'Discovery'], [625, '13C'],
  [627, 'ESPN 4'], [473, 'ESPN 4'], [474, 'ESPN'], [475, 'ESPN 2'], [476, 'ESPN 3'],
  [477, 'ESPN 5'], [479, 'ESPN 6'], [489, 'K-Nino'], [517, 'ESPN Extra'], [518, 'A+'],
  [519, 'Warner Channel'], [521, 'H&H (Home & Health)'], [522, 'Food Network'],
  [523, 'Discovery'], [524, '13C'], [527, '13C'], [616, 'TVN'], [618, 'REC TV'],
  [631, 'HGTV'], [637, 'TLC'], [638, 'E!'], [639, 'Glitz'], [642, 'AMC'],
  [646, 'Lifetime'], [647, '13C'], [648, 'VIA X'], [649, 'VIA X 2'], [650, 'Zona Latina'],
  [651, 'Disney Channel'], [652, 'Disney Junior'], [502, 'Cartoon Network'],
  [510, 'Tooncast'], [511, 'Cartoonito'], [512, 'Discovery Kids'], [513, 'Nick Jr'],
  [515, 'KidsCo'], [533, 'T13'], [534, 'Mega'], [535, 'CNN Chile'], [536, 'CNN en Español'],
  [537, 'CNN International'], [538, '24 Horas'], [539, 'DW'], [542, 'Canal 13'],
  [641, 'ID (Investigation Discovery)'],
]

/**
 * GRILLA CLARO TV FULL / PREMIUM / PREMIUM II — Grilla oficial completa.
 * 186 canales (53 HD según datos oficiales de Claro).
 * Actualizado con lista oficial de Claro Chile (Octubre 2026).
 * Incluye todos los canales de la guía oficial de Claro Chile.
 */
const CLARO_TV_FULL = [
  [2, 'Discovery Kids'],
  [4, 'Kiddo'],
  [6, 'Disney Junior'],
  [7, 'El canal del Payaso Plim Plim'],
  [9, 'Disney Channel'],
  [10, 'Cartoon Network'],
  [11, 'ETC TV'],
  [13, 'Cartoonito'],
  [15, 'Mi Música Hits'],
  [16, 'NTV'],
  [502, 'Discovery Kids HD'],
  [506, 'Disney Junior HD'],
  [509, 'Disney Channel HD'],
  [510, 'Cartoon Network HD'],
  [511, 'ETC TV HD'],
  [513, 'Cartoonito HD'],
  [516, 'NTV HD'],
  [519, 'Mega 2'],
  [21, 'Discovery Home & Health'],
  [22, 'Food Network'],
  [23, 'El Gourmet'],
  [128, 'Love Nature'],
  [129, 'TLC'],
  [131, 'HGTV'],
  [521, 'Discovery Home & Health'],
  [522, 'Food Network HD'],
  [523, 'El Gourmet HD'],
  [622, 'Love Nature HD'],
  [631, 'HGTV HD'],
  [28, 'Canal Claro'],
  [30, 'Esne'],
  [31, 'Enlace'],
  [32, 'Cámara de Diputados TV'],
  [35, 'CNN Internacional'],
  [36, 'CNN En Español'],
  [37, 'CNN Chile'],
  [38, '24 Horas'],
  [54, 'Mega Noticias'],
  [109, 'KidOO'],
  [118, 'REC TV'],
  [119, 'Claro Cinema'],
  [518, 'Vive'],
  [647, 'Mega Ficción'],
  [525, 'TV Senado'],
  [527, '13 Realities'],
  [528, 'ESNE'],
  [529, 'T13 en Vivo'],
  [533, 'CNN Internacional'],
  [535, 'CNN En Español'],
  [536, 'CNN Chile'],
  [537, 'Bío Bío TV HD'],
  [538, '24 Horas HD'],
  [539, 'France 24 HD'],
  [540, 'Cámara de Diputados TV'],
  [542, 'Mega Noticias'],
  [546, 'Marga Marga TV'],
  [588, '13 Cultura'],
  [588, '13 Teleseries'],
  [616, 'TVN3'],
  [618, 'REC TV'],
  [648, 'Carolina TV'],
  [657, 'MTV'],
  [659, 'MTV 00s HD'],
  [90, 'HBO'],
  [91, 'Cinemax'],
  [92, 'TNT'],
  [93, 'Cinecanal'],
  [94, 'A3 Series'],
  [98, 'Cine Premium'],
  [100, 'Star Channel'],
  [101, 'FX'],
  [102, 'Universal TV'],
  [103, 'Studio Universal'],
  [105, 'Warner'],
  [111, 'Space'],
  [112, 'TCM'],
  [113, 'AMC'],
  [115, 'USA Network'],
  [134, 'TNT Novelas'],
  [138, 'AMC Series'],
  [142, 'Az Corazon'],
  [143, 'Telemundo'],
  [145, 'Zona Latina'],
  [150, 'Via X'],
  [151, 'HTV'],
  [590, 'HBO HD'],
  [591, 'Cinemax HD'],
  [592, 'TNT HD'],
  [593, 'Cinecanal HD'],
  [595, 'Film and Art'],
  [598, 'Star Channel HD'],
  [600, 'FX HD'],
  [601, 'Universal TV'],
  [602, 'Studio Universal HD'],
  [603, 'Warner HD'],
  [605, 'Space HD'],
  [599, 'TCM'],
  [613, 'AMC HD'],
  [615, 'USA Network HD'],
  [612, 'A3 series HD'],
  [642, 'AMC Series'],
  [643, 'Telemundo HD'],
  [649, 'Zona Latina'],
  [650, 'Via X 2 HD'],
  [652, 'HTV'],
  [153, 'ClaroSports'],
  [169, 'Discovery Turbo'],
  [170, 'ESPN'],
  [174, 'ESPN 2'],
  [175, 'ESPN 3'],
  [176, 'ESPN 5'],
  [177, 'ESPN Premium'],
  [178, 'ESPN 6'],
  [179, 'TNT Sports'],
  [189, 'TNT Sports Premium SD'],
  [190, 'Teletrak'],
  [197, 'HBO Family'],
  [469, 'Claro Sports HD'],
  [470, 'Discovery Turbo HD'],
  [471, 'Teletrak HD'],
  [473, 'ESPN 4'],
  [474, 'ESPN HD'],
  [475, 'ESPN 2 HD'],
  [476, 'ESPN 3 HD'],
  [477, 'ESPN 5 HD'],
  [478, 'ESPN Premium HD'],
  [479, 'ESPN 6 HD'],
  [489, 'TNT Sports 3'],
  [490, 'TNT Sports Premium HD'],
  [491, 'TNT Sports Premium SD'],
  [120, 'Discovery Channel'],
  [121, 'Discovery Science'],
  [122, 'Nat Geo'],
  [123, 'Bío Bío TV'],
  [124, 'ARTV'],
  [126, '13C'],
  [132, 'Investigation Discovery (ID)'],
  [133, 'TNT Series'],
  [134, 'Adult Swim'],
  [135, 'E!'],
  [620, 'Discovery Channel HD'],
  [621, 'Discovery Science HD'],
  [625, 'Nat Geo HD'],
  [626, '13C HD'],
  [632, 'Investigation Discovery (ID)'],
  [633, 'TNT Series HD'],
  [634, 'Adult Swim HD'],
  [635, 'TNT Novelas HD'],
  [637, 'TLC'],
  [638, 'E!'],
  [260, 'HBO Signature'],
  [261, 'HBO 2'],
  [262, 'HBO Plus'],
  [263, 'HBO Pop'],
  [265, 'HBO Xtreme'],
  [266, 'Universal Premiere'],
  [280, 'Universal Cinema'],
  [282, 'Universal Reality'],
  [283, 'Universal Comedy'],
  [284, 'Universal Crime'],
  [760, 'HBO family HD'],
  [761, 'HBO Signature HD'],
  [762, 'HBO 2 HD'],
  [763, 'HBO POP HD'],
  [765, 'HBO Mundi'],
  [766, 'HBO xtreme HD'],
  [767, 'HBO Mundi HD'],
  [780, 'Universal Premiere'],
  [782, 'Universal Cinema'],
  [783, 'Universal Reality'],
  [784, 'Universal Comedy'],
  [785, 'Universal Crime'],
  [300, 'Playboy'],
  [301, 'Venus'],
  [302, 'sextreme'],
  [800, 'Playboy'],
  [801, 'Venus'],
  [802, 'sextreme'],
  [512, 'Tevex'],
  [527, '13 Realities'],
  [543, 'UChile TV'],
  [587, 'Kanal D'],
  [639, '13 Pop'],
  [641, 'Canal País'],
  [586, 'Mega Ficción HD'],
  [589, 'RCN Telenovelas'],
]

/**
 * PACKS A LA CARTA (pago extra). Aparecen en la grilla del modal, fuera del
 * conteo oficial de 77/74/101. Los números de canal solo se pintan donde la
 * fuente los asigna al proveedor.
 */
const tilePack = (canal, extra = {}) => ({
  n: extra.n ?? null,
  hasta: extra.hasta,
  canal,
  hd: !!extra.hd,
  retirado: false,
  premium: true,
  rango: extra.hasta != null,
  detalle: false,
  categoria: 'Packs a la carta',
  nota: extra.nota,
})

export const PACKS_A_LA_CARTA = {
  adulto: {
    claro: true,
    vtr: true,
    canales: [
      [301, 'Venus', false],
      [302, 'Sextreme', false],
      [305, 'Playboy', false],
    ],
  },
  espnPremium: {
    claro: true,
    vtr: true,
    canales: [
      [473, 'ESPN 4', true],
      [477, 'ESPN 5', true],
      [478, 'ESPN Extra', true],
      [479, 'ESPN 7', true],
      [480, 'ESPN 6', true],
    ],
  },
  tntSportsPremium: {
    enClaro: true,
    enVtr: true,
    sinNumero: true,
    dialesClaro: { sd: 190, hd: 490, precio: '$13.990', nota: 'También disponible como TNT Sports en HBO Max' },
    dialesVtr: { sd: 165, hd: 855, precio: '$13.990' },
  },
  universalPlus: {
    claro: true,
    vtr: false,
    rangos: [
      [280, 285, false],
      [780, 785, true],
    ],
  },
}

/**
 * Packs a la carta agrupados para el modal: no van en la parrilla incluida,
 * se ofrecen aparte (pago extra).
 */
export function packsALaCartaGrupos(clave) {
  const k = String(clave || '').toLowerCase()
  const esClaro = k.startsWith('claro')
  const esVtr = k === 'vtr' || k.startsWith('vtr:')
  if (!esClaro && !esVtr) return []

  const tnt = esClaro ? PACKS_A_LA_CARTA.tntSportsPremium.dialesClaro : PACKS_A_LA_CARTA.tntSportsPremium.dialesVtr

  const packs = [
    {
      id: 'adulto',
      nombre: 'Pack Adulto',
      precio: esClaro ? '$7.490' : null,
      nota: 'Hotpack / Venus / Playboy.',
      canales: PACKS_A_LA_CARTA.adulto.canales.map(([n, canal, hd]) =>
        tilePack(canal, { n, hd, nota: 'Para contratar' }),
      ),
    },
    {
      id: 'espn-premium',
      nombre: 'ESPN Premium',
      precio: esClaro ? '$9.990' : null,
      nota: 'ESPN 4, 5, Extra, 7, 6.',
      canales: PACKS_A_LA_CARTA.espnPremium.canales.map(([n, canal, hd]) =>
        tilePack(canal, { n, hd, nota: 'Para contratar' }),
      ),
    },
    {
      id: 'tnt-sports-premium',
      nombre: 'TNT Sports Premium',
      precio: esClaro ? tnt.precio : null,
      nota: 'Fútbol premium.',
      canales: [
        tilePack('TNT Sports Premium', { n: tnt.sd, hd: false, nota: 'Para contratar' }),
        tilePack('TNT Sports Premium', { n: tnt.hd, hd: true, nota: 'Para contratar' }),
      ],
    },
  ]

  if (esClaro) {
    packs.push({
      id: 'universal-plus',
      nombre: 'Universal+',
      precio: '$7.490',
      nota: 'Universal Channel SD + HD.',
      canales: PACKS_A_LA_CARTA.universalPlus.rangos.map(([desde, hasta, hd]) =>
        tilePack('Universal+', { n: desde, hasta, hd, nota: hd ? 'Para contratar (HD)' : 'Para contratar (SD)' }),
      ),
    })
  }

  return packs
}

export function packsALaCartaDe(clave) {
  return packsALaCartaGrupos(clave).flatMap((g) => g.canales)
}

/* ────────────────────────────────────────────────────────────────────────────
 * ARMADO DE SEÑALES
 * ──────────────────────────────────────────────────────────────────────────── */

const hdDe = (nombre) => /\bHD\b/i.test(nombre)

/**
 * "[n, nombre, retirado?, nota?]" o rango → objeto de señal.
 *
 * En un rango, `detallado: true` significa que la fuente enumera su contenido
 * (HBO 790-797) y se puede expandir canal por canal. `false` significa que solo
 * delimita el rango (Pack Adultos 501-565): expandirlo inventaría señales, así
 * que se muestra como una sola entrada.
 */
const aSenal = (categoria, item, premium = false) => {
  if (Array.isArray(item)) {
    const [n, canal, retirado, nota] = item
    return { n, canal, hd: hdDe(canal), retirado: !!retirado, nota, premium, rango: false, detalle: true, categoria }
  }
  return {
    n: item.desde,
    hasta: item.hasta,
    canal: item.canal,
    nota: item.nota,
    hd: hdDe(item.canal),
    retirado: false,
    premium,
    rango: true,
    detalle: !!item.detalle,
    categoria,
  }
}

/** Bloque `[categoría, senales]` → lista de señales de esa categoría */
const bloquea = ([categoria, senales]) => senales.map((s) => aSenal(categoria, s))

/** Señales de una tabla de plan; los rangos cuentan como 1 entrada */
const senalesDe = (tabla, plan) => tabla.map((item) => aSenal(plan, item, plan === 'Premium'))

const resumenSenales = (senales) => ({
  senales: senales.length,
  hd: senales.filter((s) => s.hd).length,
  sd: senales.filter((s) => !s.hd).length,
  retirados: senales.filter((s) => s.retirado).length,
  premium: senales.filter((s) => s.premium).length,
  rangos: senales.filter((s) => s.rango).length,
})

/**
 * Señal de la lista oficial: `{ n, canal, hd }`.
 *
 * `hd` es explícito porque la fuente no lo marca por fila. En VTR sale del dial
 * (`DIALES_SD_VTR`); en Claro solo se marca lo que el propio nombre declara.
 */
const aOficial = (categoria, [n, canal], hd = false) => ({
  n,
  canal,
  hd,
  retirado: false,
  premium: false,
  rango: false,
  detalle: true,
  categoria,
})

/** Señales de la grilla VTR oficial, agrupadas por categoría de la fuente. */
const senalesVtrOficiales = () =>
  VTR_TV_PREMIUM.map(([categoria, filas]) => ({
    categoria,
    canales: filas.map(([n, canal]) => aOficial(categoria, [n, canal], !DIALES_SD_VTR.has(n))),
  }))

/** Señales de la grilla Claro oficial, en una sola categoría por plan. */
const senalesClaroOficiales = (filas, categoria) => ({
  categoria,
  canales: filas.map(([n, canal]) => aOficial(categoria, [n, canal], hdDe(canal))),
})

/* ────────────────────────────────────────────────────────────────────────────
 * PLANES VTR
 * ──────────────────────────────────────────────────────────────────────────── */

/** Señales premium / a la carta, activables sobre cualquier grilla */
const VTR_PREMIUM = [
  [165, 'TNT Sports Premium (SD)', false, 'Pack $13.990. El dial no se muestra en la grilla.'],
  [855, 'TNT Sports Premium (HD)', false, 'Pack $13.990. El dial no se muestra en la grilla.'],
  [166, 'ESPN Premium (SD)'],
  [860, 'ESPN Premium (HD)', false, 'ESPN Premium'],
  { desde: 501, hasta: 565, canal: 'Pack Adultos', detalle: false, nota: 'Hotpack / Venus / Playboy. En la grilla VTR no se muestran los diales 301, 302 y 305 (solo Claro).' },
]

/** Señales de autogestión, presentes en todos los planes */
const VTR_INTERACTIVOS = [
  [160, 'Cartelera Interactiva y Guía VOD'],
  [891, 'Sucursal Virtual en Pantalla'],
]

/**
 * Puntos donde la fuente se contradice o quedó desactualizada. No se elige un
 * ganador en silencio: el asistente debe mencionar la duda antes de confirmar.
 *
 * `resuelto: true` = ya se/localizó la explicación, se informa sin alarmar.
 */
export const CONFLICTOS_VTR = [
  {
    senales: [822, 785],
    detalle:
      'La tabla oficial lista 102 señales sobre 100 diales: el 822 transmite dos señales (Telemundo Internacional y Art Cinema) y el 785 también (Space y TCM). Se listan todas; el plan declara 101 canales (84 HD y 17 SD).',
    resuelto: true,
  },
  {
    senales: [497],
    detalle:
      'El 497 es Sony Channel y va en HD: pertenece al bloque 4xx de packs premium de la grilla VTR. Los diales menores a 500 son SD.',
    resuelto: true,
  },
  {
    senales: [719],
    detalle:
      'El 719 es KidsCo en la grilla oficial de VTR TV Premium. El nombre anterior (Kidoo HD / Nickelodeon HD según la ciudad) venía de la fuente previa y ya no aplica.',
    resuelto: true,
  },
]

/** Grillas VTR por plan. `clave` = clave de `GUIA_CANALES` o clave de plan. */
export const PLANES_VTR = {
  'tv-premium': {
    plan: 'tv-premium',
    nombre: 'TV Premium',
    descripcion:
      'Grilla TV Premium de VTR (HFC/FTTH) del Plan Comercial de Octubre 2026: 101 canales únicos, 84 HD y 17 SD, con los packs de cable incluidos.',
    canales: senalesVtrOficiales().flatMap((c) => c.canales),
  },
  premium: {
    plan: 'premium',
    nombre: 'Premium / Canales a la Carta',
    descripcion:
      'Señales codificadas que se activan mensualmente sobre cualquier grilla, o vienen pre-activadas en Stream Premium.',
    canales: senalesDe(VTR_PREMIUM, 'Premium'),
  },
  interactivos: {
    plan: 'interactivos',
    nombre: 'Canales Interactivos',
    descripcion: 'Autogestión y guía VOD. Presentes en todos los planes.',
    canales: senalesDe(VTR_INTERACTIVOS, 'Interactivos'),
  },
}

export const PLANES_VTR_LISTA = Object.keys(PLANES_VTR)

export const planVtr = (clave) => PLANES_VTR[clave] || null

/** Totales por plan: `{ 'tv-premium': { senales: 100, hd: 83, sd: 17, ... } }` */
export const TOTALES_PLANES_VTR = Object.fromEntries(
  PLANES_VTR_LISTA.map((k) => [k, resumenSenales(PLANES_VTR[k].canales)]),
)

/**
 * Ciudades con grilla propia. El selector de comuna es la única forma de
 * desdoblar los diales que VTR numera distinto por región.
 */
export const REGIONES_VTR = [
  { clave: 'santiago', nombre: 'Santiago' },
  { clave: 'concepcion', nombre: 'Concepción' },
  { clave: 'chillan', nombre: 'Chillán' },
]

/** Ciudad por defecto: la grilla de Santiago, que es la más usada. */
export const REGION_VTR_POR_DEFECTO = 'santiago'

/**
 * Diales cuyo nombre cambia según la ciudad: `{ 719: { santiago: 'Kidoo HD', ... } }`.
 * Solo se registra lo que una fuente distinguió; no se completan huecos por
 * intuición. La grilla oficial de Octubre 2026 no trae variantes regionales.
 */
const VARIANTES_REGIONALES_VTR = {}

/** Nombre de una señal en la ciudad elegida, si la ciudad lo cambia. */
export const nombreEnRegion = (senal, region) =>
  (region && VARIANTES_REGIONALES_VTR[senal.n]?.[region]) || senal.canal

/** Señales de VTR con los nombres ajustados a la ciudad elegida. */
export const aplicarRegionVtr = (senales, region) =>
  region ? senales.map((s) => ({ ...s, canal: nombreEnRegion(s, region) })) : senales

export function senalVtr(numero, opciones = {}) {
  const n = Number(numero)
  for (const rango of [false, true]) {
    for (const k of PLANES_VTR_LISTA) {
      const hit = PLANES_VTR[k].canales.find((s) =>
        rango ? s.rango && n >= s.n && n <= s.hasta : !s.rango && s.n === n,
      )
      if (hit) {
        return { ...hit, canal: nombreEnRegion(hit, opciones.region), plan: PLANES_VTR[k].nombre }
      }
    }
  }
  return null
}

/** Señales retiradas de la circulación comercial. */
export const senalesRetiradasVtr = () =>
  PLANES_VTR['tv-premium'].canales.filter((s) => s.retirado).map((s) => ({ n: s.n, canal: s.canal }))

/** Resumen de la grilla VTR por plan para el asistente. */
export function resumenPlanesVtr(limite = 0) {
  const out = PLANES_VTR_LISTA.map((k) => {
    const p = PLANES_VTR[k]
    const t = TOTALES_PLANES_VTR[k]
    const lista = limite > 0 ? p.canales.slice(0, limite) : p.canales
    const senales = lista
      .map((s) => (s.rango ? `${s.n}-${s.hasta} ${s.canal}` : `${s.n} ${s.canal}`))
      .join(', ')
    return [
      `${p.nombre}: ${t.senales} señales listadas (${t.hd} HD, ${t.sd} SD${t.retirados ? `, ${t.retirados} retiradas` : ''}).`,
      senales + (limite > 0 && lista.length < p.canales.length ? ', …' : ''),
    ].join(' ')
  })
  return out.join('. ')
}

/* ────────────────────────────────────────────────────────────────────────────
 * GUÍAS OFICIALES POR PROVEEDOR
 * ──────────────────────────────────────────────────────────────────────────── */

/** La grilla TV Premium alimenta la guía de VTR: es la más completa. */
const GUIA_VTR = PLANES_VTR['tv-premium'].canales

/**
 * Conteo declarado por la fuente. La fuente entrega el total de la grilla, no
 * la calidad señal por señal (salvo en VTR, donde el dial la define).
 */
const DECLARADO_VTR = { canales: 101, hd: 84, sd: 17 }
const DECLARADO_CLARO_FULL = { canales: 186, hd: 53, sd: 133 }
const DECLARADO_CLARO_INICIA = { canales: 77, hd: 66, sd: 11 }

/** Guía ya aplanada → mismo shape que `guiaDe`, agrupada por categoría */
const guiaPlana = (proveedor, senales, extra = {}) => {
  const categorias = []
  for (const s of senales) {
    let c = categorias.find((x) => x.categoria === s.categoria)
    if (!c) categorias.push((c = { categoria: s.categoria, canales: [] }))
    c.canales.push({ ...s, premium: s.premium })
  }
  return { proveedor, clave: proveedor.toLowerCase(), categorias, canales: senales, ...extra }
}

/** Guía de una sola categoría (las grillas de Claro llegan por plan) */
const guiaCategoria = (proveedor, bloque, extra = {}) => ({
  proveedor,
  clave: extra.clave || proveedor.toLowerCase(),
  categorias: [bloque],
  canales: bloque.canales,
  ...extra,
})

/** Guía de canales por proveedor: clave = `vtr` | `claro` | `claro:inicia` */
export const GUIA_CANALES = {
  vtr: guiaPlana('VTR', GUIA_VTR, {
    declarado: DECLARADO_VTR,
    hdPorCanal: true,
  }),
  claro: guiaCategoria('Claro', senalesClaroOficiales(CLARO_TV_FULL, 'TV Full / Premium'), {
    clave: 'claro',
    declarado: DECLARADO_CLARO_FULL,
    hdPorCanal: false,
  }),
  'claro:inicia': guiaCategoria('Claro', senalesClaroOficiales(CLARO_TV_INICIA, 'TV Inicia'), {
    clave: 'claro:inicia',
    declarado: DECLARADO_CLARO_INICIA,
    hdPorCanal: false,
  }),
}

/** Proveedores que entran en las búsquedas de canal. */
export const PROVEEDORES_GUIA = ['vtr', 'claro']

export const guia = (clave) => GUIA_CANALES[String(clave || '').toLowerCase()] || null

/** Totales de la guía: `{ vtr: { canales: 101, hd: 84, ... } }` */
export const TOTALES_GUIA = Object.fromEntries(
  Object.keys(GUIA_CANALES).map((k) => [
    k,
    {
      canales: GUIA_CANALES[k].declarado?.canales ?? GUIA_CANALES[k].canales.length,
      hd: GUIA_CANALES[k].declarado?.hd ?? GUIA_CANALES[k].canales.filter((c) => c.hd).length,
      sd: GUIA_CANALES[k].declarado?.sd ?? GUIA_CANALES[k].canales.filter((c) => !c.hd).length,
      premium: GUIA_CANALES[k].canales.filter((c) => c.premium).length,
      categorias: GUIA_CANALES[k].categorias.length,
      listados: GUIA_CANALES[k].canales.length,
    },
  ]),
)

const normaliza = (t) =>
  String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

/** Quita el sufijo de calidad para comparar: "HBO HD" → "hbo" */
const sinHd = (t) => normaliza(t).replace(/\s*hd\b/g, '').trim()

/**
 * Busca un canal por nombre en una guía o en todas.
 * `coincidencia: 'exacto'` (por defecto, ignora el sufijo HD) o `'parcial'`
 * para nombres aproximados ("espn", "discovery", "hbo").
 * Devuelve resultados con su número de canal real.
 */
export function buscarCanal(texto, opciones = {}) {
  const { proveedor = null, coincidencia = 'exacto' } = opciones
  const q = normaliza(texto)
  if (!q) return []
  const proveedores = proveedor ? [String(proveedor).toLowerCase()] : PROVEEDORES_GUIA
  const out = []
  for (const k of proveedores) {
    const g = GUIA_CANALES[k]
    if (!g) continue
    for (const c of g.canales) {
      const n = sinHd(c.canal)
      const hit =
        coincidencia === 'parcial' ? n.includes(sinHd(q)) : n === sinHd(q) || normaliza(c.canal) === q
      if (hit) out.push({ ...c, proveedor: g.proveedor })
    }
  }
  return out
}

/** Señal de un número de canal en una guía. */
export function canalPorNumero(claveProveedor, numero) {
  const g = guia(claveProveedor)
  if (!g) return null
  return g.canales.find((c) => c.n === Number(numero)) || null
}

/** Categorías de la guía: `[{ categoria, canales: [...] }]` */
export const categoriasDe = (claveProveedor) => guia(claveProveedor)?.categorias || []

/** Resumen textual de la guía para el asistente. */
export function resumenGuia(claveProveedor, limite = 0) {
  const g = guia(claveProveedor)
  if (!g) return ''
  const t = TOTALES_GUIA[g.clave]
  const cats = g.categorias.map((c) => `${c.categoria}: ${c.canales.map((x) => `${x.n} ${x.canal}`).join(', ')}`)
  const lista = limite > 0 ? cats.slice(0, limite) : cats
  return [
    `${g.proveedor}: ${t.canales} canales (${t.hd} HD, ${t.premium} premium) en ${t.categorias} categorías.`,
    `Números de canal: ${lista.join('. ')}${limite > 0 && lista.length < cats.length ? ', …' : ''}`,
  ].join(' ')
}

/* ────────────────────────────────────────────────────────────────────────────
 * GRILLAS POR PAQUETE DE TV
 * ──────────────────────────────────────────────────────────────────────────── */

const aGrilla = (senales) =>
  senales.map((s) => ({ n: s.n, canal: s.canal, pendiente: !s.canal }))

/**
 * Grillas por fuente. `clave` = `${proveedor}:${paqueteTv}`
 * `guia` = clave de `GUIA_CANALES` con los números de canal reales.
 */
export const GRILLAS_CANALES = {
  'vtr:full': {
    proveedor: 'VTR',
    paquete: 'TV Premium',
    clave: 'vtr:full',
    guia: 'vtr',
    conteo: { ...DECLARADO_VTR },
    notaConteo:
      'La tabla oficial de TV Premium lista 102 señales sobre 100 diales: el 822 (Telemundo Internacional y Art Cinema) y el 785 (Space y TCM) transmiten dos señales cada uno.',
    canales: aGrilla(GUIA_VTR),
  },
  'claro:full': {
    proveedor: 'Claro',
    paquete: 'TV Full / Premium',
    clave: 'claro:full',
    guia: 'claro',
    conteo: { ...DECLARADO_CLARO_FULL },
    canales: aGrilla(GUIA_CANALES.claro.canales),
  },
  'claro:inicia': {
    proveedor: 'Claro',
    paquete: 'TV Inicia',
    clave: 'claro:inicia',
    guia: 'claro:inicia',
    conteo: { ...DECLARADO_CLARO_INICIA },
    canales: aGrilla(GUIA_CANALES['claro:inicia'].canales),
  },
}

export const GRILLAS_INTERACTIVE = Object.keys(GRILLAS_CANALES)

export const grilla = (clave) => GRILLAS_CANALES[clave] || null

/** Señales del conteo oficial de la imagen que aún no se pudieron leer */
export function senalesNoLeidas(clave) {
  const g = GRILLAS_CANALES[clave]
  if (!g) return 0
  return Math.max(0, g.conteo.canales - g.canales.length)
}

/** Señales leídas cuyo logo no se pudo identificar */
export function pendientesDe(clave) {
  const g = GRILLAS_CANALES[clave]
  return g ? g.canales.filter((c) => c.pendiente) : []
}

/** Resumen textual para el asistente. `limite` acota la lista de señales. */
export function resumenGrilla(clave, limite = 0) {
  const g = GRILLAS_CANALES[clave]
  if (!g) return ''
  const pendientes = g.canales.filter((c) => c.pendiente).length
  const noLeidas = senalesNoLeidas(clave)
  const lista = limite > 0 ? g.canales.slice(0, limite) : g.canales
  return [
    `${g.proveedor} ${g.paquete}: ${g.conteo.canales} canales (${g.conteo.hd} HD).`,
    g.notaConteo || '',
    `Grilla conocida: ${g.canales.length} señales${pendientes ? `, ${pendientes} sin nombre legible` : ''}${noLeidas ? `, ${noLeidas} por confirmar` : ''}.`,
    `Canales: ${lista.map((c) => `${c.n} ${c.canal || 'sin nombre legible'}`).join(', ')}${limite > 0 && lista.length < g.canales.length ? ', …' : ''}`,
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Planes que se ven en la grilla del modal de VTR.
 *
 * La grilla oficial de TV Premium ya incluye los packs de cable, así que el modal
 * muestra solo esa parrilla: los canales a la carta y los servicios interactivos
 * se informan aparte, con su propio plan.
 */
const PLANES_MODAL_VTR = ['tv-premium']

/**
 * Grilla del modal: guía oficial del proveedor con los números que el cliente
 * sintoniza. `claveProveedor` = `vtr` | `claro` | `claro:inicia`.
 *
 * No usa la lectura de la imagen del portal: esos números no son los del dial.
 * Los conteos que se muestran son los declarados por la fuente.
 */
export function grillaModal(claveProveedor, opciones = {}) {
  const { premium = true, region = null } = opciones
  const g = guia(claveProveedor)
  if (!g) return null

  const base =
    g.clave === 'vtr' ? PLANES_MODAL_VTR.flatMap((k) => PLANES_VTR[k].canales) : g.canales

  const senales = []
  const vistos = new Set()
  for (const c of base) {
    if (!premium && c.premium) continue
    if (c.rango && c.detalle) {
      for (let n = c.n; n <= c.hasta; n += 1) {
        if (vistos.has(n)) continue
        vistos.add(n)
        senales.push({ ...c, n, hasta: undefined, rango: false, nota: undefined, expandido: true })
      }
      continue
    }
    if (!c.rango && c.n != null) {
      // Un dial puede transmitir más de una señal (el 822 y el 785 en VTR), así
      // que la identidad es el par número + nombre y no solo el número.
      const id = `${c.n}::${c.canal}`
      if (vistos.has(id)) continue
      vistos.add(id)
    }
    senales.push(c)
  }
  // Orden estable: las señales de un mismo dial conservan el orden de la fuente.
  // Los packs sin dial (TNT Sports Premium, extras VTR) quedan al final.
  senales.sort((a, b) => {
    if (a.n == null && b.n == null) return 0
    if (a.n == null) return 1
    if (b.n == null) return -1
    return a.n - b.n
  })

  // Los diales que VTR numera distinto por ciudad se ajustan al final, cuando ya
  // se resolvió la deduplicación por número.
  const finales = g.clave === 'vtr' ? aplicarRegionVtr(senales, region) : senales

  const declarado = g.declarado
  return {
    proveedor: g.proveedor,
    clave: g.clave,
    region,
    regiones: g.clave === 'vtr' ? REGIONES_VTR : [],
    hdPorCanal: g.hdPorCanal !== false,
    senales: finales,
    packsALaCarta: packsALaCartaGrupos(g.clave),
    conteo: {
      canales: declarado?.canales ?? finales.length,
      hd: declarado?.hd ?? finales.filter((s) => s.hd).length,
      sd: declarado?.sd ?? finales.filter((s) => !s.hd).length,
      premium: finales.filter((s) => s.premium).length,
      retirados: finales.filter((s) => s.retirado).length,
    },
    conflictos: g.clave === 'vtr' ? CONFLICTOS_VTR : [],
  }
}

/** Normaliza un nombre de canal para comparar entre guías y packs. */
export const normalizaCanal = (nombre) => sinHd(nombre)
