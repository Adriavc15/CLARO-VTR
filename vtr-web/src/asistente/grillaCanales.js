/**
 * Canales de TV.
 *
 * Tres fuentes distintas, conviven sin mezclarse:
 *
 * · GUÍA DE CANALES OFICIAL (`GUIA_CANALES`): lista categorizada con el número
 *   de canal real de cada señal. VTR se construye desde la grilla TV Plus / Full
 *   (que es la más completa) y además tiene el detalle por plan en `PLANES_VTR`.
 *   Claro mantiene su propia lista categorizada.
 * · GRILLAS DEL PORTAL (`GRILLAS_CANALES`): lectura de imágenes del decodificador,
 *   con otro orden de numeración. Los mismos números cambian de señal entre la
 *   grilla TV FULL y la de TV Inicia.
 *
 * La numeración de la guía y la de las grillas NO coinciden: para responder
 * "¿en qué número sale X?" usar la guía; para mostrar la grilla visual del plan
 * usar `grilla()`.
 *
 * `CONFLICTOS_VTR` deja constancia de los números en que las fuentes se
 * contradicen. No se resuelven por defecto: hay que confirmarlos en
 * vtr.com/guia-canales con la comuna del cliente.
 */

/**
 * GUÍA DE CANALES VTR — por plan. Grilla definitiva 2026.
 *
 * Fuente: grilla oficial VTR TV Plus / Full (vtr.com/cambiodegrilla, vtr.com/hd,
 * vtr.com/guia-canales). Reemplaza la lista 700-series anterior, que asignaba
 * otros nombres a los mismos números (705/706/707).
 *
 * `TV_PLUS` es la grilla más completa y es la base de `GUIA_CANALES.vtr`.
 * Los conteos se calculan sobre lo listado: no se inventan señales que la fuente
 * no detalla.
 *
 * Cambios de 2026 ya aplicados:
 * · Mega 2 y Mega Ficción (026, 029) vuelven a la parrilla: se revirtió la orden
 *   de salida. No están retiradas. Sus espejos HD no están confirmados.
 * · T13 En Vivo (050) ocupa el dial en reemplazo de FOX News.
 * · Bloque HD nacional corregido contra fuentes: 705 TV+ HD, 706 La Red HD,
 *   707 TVN HD, 709 Mega HD, 711 Chilevisión HD, 713 Canal 13 HD, 714 Canal 24
 *   Horas HD, 715 CNN Chile HD. El esquema 701/703/705/706/707 no aparece en
 *   ninguna fuente consultada.
 * · 009 es Nickelodeon Chile y 025 es MTV Chile; Universal Reality queda en 222.
 *
 * `retirado: true` queda libre: hoy ninguna señal de la lista lo lleva. Si alguna
 * vuelve a salir de circulación, se marca aquí en vez de borrarla, para no perder
 * el dial ni su historial.
 */

/** Bloque de la grilla TV Plus / TV Full. `senales`: [número, nombre] */
const VTR_BLOQUES = [
  ['Infantil y Familiar (001-013)', [
    [1, 'Portal VTR / Servicios'],
    [7, 'Disney Junior'],
    [8, 'Disney Channel'],
    [9, 'Nickelodeon', false, 'Dial verificado contra grilla de Santiago. El 719 HD figura como Kidoo o Nickelodeon según la ciudad'],
    [10, 'Discovery Kids'],
    [11, 'Cartoonito'],
    [12, 'Cartoon Network'],
    [13, 'ETC TV'],
  ]],
  ['Nacional, Noticias y Música (014-049)', [
    [14, 'Canal 24 Horas'],
    [15, 'CNN Chile'],
    [16, 'Telecanal'],
    [17, 'La Red'],
    [18, 'TV+'],
    [19, 'TVN'],
    [20, 'Mega'],
    [21, 'Chilevisión'],
    [22, 'Canal 13'],
    [23, 'Zona Latina'],
    [24, 'Vía X'],
    [25, 'MTV Chile'],
    [26, 'Mega 2'],
    [27, '13C'],
    [28, 'E! Entertainment'],
    [29, 'Mega Ficción'],
    [44, 'Rec TV'],
    [47, 'Agricultura TV'],
    [49, 'ESPN (Básico)'],
  ]],
  ['Deportes Base (050-164)', [
    [50, 'T13 En Vivo', false, 'Ocupa el dial en reemplazo de FOX News'],
    [150, 'ESPN'],
    [151, 'ESPN 2'],
    [152, 'Teletrak TV'],
    [153, 'ESPN 3'],
    [154, 'ESPN 5'],
    [155, 'ESPN 6'],
    [156, 'GolTV'],
    [157, 'TyC Sports'],
    [159, 'CDO Básico (Canal del Deporte Olímpico)'],
    [164, 'L1 Max Básico'],
  ]],
  ['Cine, Series y Variedades (200-399)', [
    [208, 'FX'],
    [210, 'TNT'],
    [212, 'Space'],
    [215, 'Cinecanal'],
    [220, 'Universal Cinema'],
    [221, 'Universal Comedy'],
    [222, 'Universal Reality'],
    [230, 'Kanal D Drama'],
    [350, 'Discovery Channel'],
    [352, 'Animal Planet'],
    [355, 'Discovery Home & Health'],
  ]],
  ['Espejos en Alta Definición (700-860)', [
    [705, 'TV+ HD'],
    [706, 'La Red HD'],
    [707, 'TVN HD'],
    [709, 'Mega HD'],
    [711, 'Chilevisión HD'],
    [713, 'Canal 13 HD'],
    [714, 'Canal 24 Horas HD'],
    [715, 'CNN Chile HD'],
    [716, 'Zona Latina HD'],
    [717, 'Vía X HD'],
    [718, 'Cartoon Network HD'],
    [719, 'Nickelodeon HD', false, 'La guía de Santiago lo llama Kidoo HD en este mismo dial. Depende de la ciudad'],
    [720, 'DreamWorks Channel HD'],
    [722, 'Disney Channel HD'],
    [723, 'Discovery Kids HD'],
    [725, 'Cartoonito HD'],
    [756, 'Docu HD'],
    [771, 'TNT Novelas HD'],
    [772, 'Golden Plus HD'],
    [773, 'Atreseries HD'],
    [774, 'Atrescine HD'],
    [780, 'Cinecanal HD'],
    [781, 'TNT HD'],
    [782, 'Cinemax HD'],
    [783, 'USA Network HD'],
    [784, 'AMC HD'],
    [785, 'Space HD'],
    [787, 'Paramount Network HD'],
    [788, 'Universal TV HD'],
    [789, 'Studio Universal HD'],
    [790, 'HBO HD'],
    [791, 'HBO Family HD'],
    [792, 'HBO Mundi HD'],
    [793, 'HBO 2 HD'],
    [794, 'HBO Signature HD'],
    [795, 'HBO Plus HD'],
    [796, 'HBO Xtreme HD'],
    [797, 'HBO Pop HD'],
    [798, 'Universal Premiere HD', false, 'Solo en VTR Play / d-BOX Smart'],
    [799, 'Universal Comedy HD', false, 'Solo en VTR Play / d-BOX Smart'],
    [800, 'Universal Cinema HD', false, 'Solo en VTR Play / d-BOX Smart'],
    [801, 'Universal Crime HD', false, 'Solo en VTR Play / d-BOX Smart'],
    [802, 'Universal Reality HD', false, 'Solo en VTR Play / d-BOX Smart'],
    [840, 'ESPN 4 HD'],
    [841, 'ESPN HD'],
    [842, 'ESPN 3 HD'],
    [843, 'ESPN 2 HD'],
    [844, 'Golf Channel HD'],
    [845, 'GolTV HD'],
    [846, 'TyC Sports HD'],
    [847, 'Teletrak TV HD'],
    [854, 'TNT Sports HD'],
    [855, 'TNT Sports Premium HD'],
    [859, 'ESPN 5 HD'],
  ]],
]

/** Plan TV Inicia:parrilla básica. Los rangos no se desglosan señal por señal. */
const VTR_INICIA = [
  [8, 'Disney Channel'],
  [10, 'Discovery Kids'],
  [12, 'Cartoon Network'],
  { desde: 17, hasta: 22, canal: 'Televisión Abierta Chilena', nota: '017 La Red, 019 TVN, 020 Mega, 021 Chilevisión, 022 Canal 13' },
  [14, 'Canal 24 Horas'],
  [15, 'CNN Chile'],
  [44, 'Rec TV'],
  [47, 'Agricultura TV'],
  [49, 'ESPN (Básico)'],
  [50, 'T13 En Vivo'],
  [52, 'Paramount Network'],
  [113, 'NTV Chile'],
  [152, 'Teletrak TV'],
  [159, 'CDO Básico (Canal del Deporte Olímpico)'],
  [208, 'FX'],
  [210, 'TNT'],
  [215, 'Cinecanal'],
  [220, 'Universal Cinema'],
  [350, 'Discovery Channel'],
  [352, 'Animal Planet'],
  [355, 'Discovery Home & Health'],
  { desde: 705, hasta: 707, canal: 'Alta Definición Nacional', nota: '705 TV+ HD, 706 La Red HD, 707 TVN HD' },
  [718, 'Cartoon Network HD'],
  [722, 'Disney Channel HD'],
  [780, 'Cinecanal HD'],
  [781, 'TNT HD'],
  [841, 'ESPN HD'],
]

/** Señales premium / a la carta, activables sobre cualquier grilla */
const VTR_PREMIUM = [
  [165, 'TNT Sports Premium (SD)', false, 'Fútbol chileno'],
  [855, 'TNT Sports Premium (HD)', false, 'Fútbol chileno'],
  [166, 'ESPN Premium (SD)'],
  [860, 'ESPN Premium (HD)', false, 'ESPN Premium'],
  { desde: 790, hasta: 797, canal: 'Paquete HBO Premium HD', detalle: true, nota: 'HBO HD, HBO 2, Family, Mundi, Pop, Xtreme, Plus, Signature' },
  { desde: 501, hasta: 565, canal: 'Pack Adultos', detalle: false, nota: 'Playboy TV en el 501 y Venus en el 502. El resto del rango no está detallado por la fuente' },
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
    senales: [11, 12, 14, 15],
    detalle:
      'Resuelto contra la grilla de Santiago publicada el 4 de octubre de 2026: 011 Cartoonito, 012 Cartoon Network, 014 Canal 24 Horas y 015 CNN Chile. TV Inicia usaba otra numeración y quedó alineado a la misma.',
    resuelto: true,
  },
  {
    senales: [705, 706, 707, 709, 711, 713, 714, 715],
    detalle:
      'El bloque HD nacional se corrigió contra fuentes coincidentes, entre ellas la propia página de VTR: 705 TV+ HD, 706 La Red HD, 707 TVN HD, 709 Mega HD, 711 Chilevisión HD, 713 Canal 13 HD, 714 Canal 24 Horas HD y 715 CNN Chile HD. El esquema 701 / 703 / 705 / 706 / 707 que circulaba no aparece en ninguna fuente consultada.',
    resuelto: true,
  },
  {
    senales: [9],
    detalle:
      'El 009 es Nickelodeon Chile. El nombre Kidoo corresponde al dial HD, no al SD.',
    resuelto: true,
  },
  {
    senales: [222, 25],
    detalle:
      'Resuelto: el 025 es MTV Chile y Universal Reality queda en el 222.',
    resuelto: true,
  },
  {
    senales: [26, 29],
    detalle:
      'Mega 2 y Mega Ficción vuelven a la parrilla en SD: se revirtió la orden de salida de marzo 2026. Sus espejos HD no están confirmados, porque el 711 es Chilevisión HD.',
    resuelto: true,
  },
  {
    senales: [719],
    detalle:
      'El 719 HD cambia de nombre según la ciudad: Kidoo HD en Santiago, Nickelodeon HD en Concepción y Chillán. El dial es el mismo. Se resuelve con el selector de ciudad.',
    resuelto: true,
  },
  {
    senales: [540, 541, 542],
    detalle:
      'Sala Adultos: 540 Playboy TV, 541 Sextreme, 542 Venus (orden extraído de la guía oficial de Chillán).',
    resuelto: true,
  },
  {
    senales: [558, 565],
    detalle: '558 Caracol Internacional y 565 TV Globo Internacional figuran en la guía oficial.',
    resuelto: true,
  },
  {
    senales: [771, 772, 773, 774, 780, 781, 782, 783, 784, 785, 787, 788, 789, 840, 841, 842, 843, 844, 845, 846, 847, 854, 855, 859],
    detalle:
      'Bloque HD de series, cine y deportes corregido con la guía oficial de Chillán (incluye HBO HD 790-797 y Universal+ 798-802).',
    resuelto: true,
  },
  {
    senales: [843],
    detalle:
      'Dial conmutable: ESPN Extra HD en la parrilla básica y ESPN Premium HD en el pack premium ocupan la misma frecuencia. No es un error de la fuente.',
    resuelto: true,
  },
  {
    senales: [50],
    detalle: 'T13 En Vivo ocupa el dial en reemplazo de FOX News. No hay que ofrecer FOX News.',
    resuelto: true,
  },
  {
    senales: [501, 502, 503, 540, 541, 542, 558, 565, 869],
    detalle:
      'Pack Adultos precisado según guía oficial de Chillán: 501 Playboy TV, 502 Venus, 503 Sextreme, 540 Sala Adultos: Playboy TV, 541 Sala Adultos: Sextreme, 542 Sala Adultos: Venus, 558 Caracol Internacional, 565 TV Globo Internacional y 869 Playboy TV HD. El resto del rango 501-565 no queda enumerado.',
    resuelto: true,
  },
]

const hdDe = (nombre) => /\bHD\b/i.test(nombre)

/**
 * "[n, nombre, retirado?, nota?]" o rango → objeto de señal.
 *
 * En un rango, `detallado: true` significa que la fuente enumera su contenido
 * (HBO 790-797) y se puede expandir canal por canal. `false` significa que solo
 * delimita el rango (Pack Adultos 501-565, abiertos 012-023): expandirlo inventaría
 * señales, así que se muestra como una sola entrada.
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

/** Grillas VTR por plan. `clave` = clave de `GUIA_CANALES` o clave de plan. */
export const PLANES_VTR = {
  'tv-inicia': {
    plan: 'tv-inicia',
    nombre: 'TV Inicia',
    descripcion: 'Parrilla básica y económica: nacionales, infantiles esenciales, noticias y entretenimiento básico.',
    canales: senalesDe(VTR_INICIA, 'TV Inicia'),
  },
  'tv-plus': {
    plan: 'tv-plus',
    nombre: 'TV Plus / TV Full',
    descripcion:
      'Comercialmente TV Full, Plus o Stream TV Plus. Incluye la parrilla de TV Inicia y suma señales de cable: Discovery, ESPN, Space, Universal, Kanal D y los espejos HD.',
    canales: VTR_BLOQUES.flatMap(bloquea),
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

/** Totales por plan: `{ 'tv-plus': { senales: 74, hd: 26, sd: 48, ... } }` */
export const TOTALES_PLANES_VTR = Object.fromEntries(
  PLANES_VTR_LISTA.map((k) => [k, resumenSenales(PLANES_VTR[k].canales)]),
)

/**
 * Señal de un número de canal VTR (`{ plan, ...senal }`).
 * Prioriza el número exacto sobre los rangos: el 018 es TV+ en TV Plus, aunque
 * el 12-23 de TV Inicia también lo cubra. `opciones.region` ajusta el nombre a
 * la ciudad cuando el dial cambia de nombre entre regiones.
 */
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
 * Solo se registra lo que una fuenteBrefmente distinguió; no se completan huecos
 * por intuición.
 */
const VARIANTES_REGIONALES_VTR = {
  719: { santiago: 'Kidoo HD', concepcion: 'Nickelodeon HD', chillan: 'Nickelodeon HD' },
}

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
  PLANES_VTR['tv-plus'].canales.filter((s) => s.retirado).map((s) => ({ n: s.n, canal: s.canal }))

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

/** La grilla TV Plus alimenta la guía de VTR: es la más completa. */
const GUIA_VTR = PLANES_VTR['tv-plus'].canales

const GUIA_CLARO = [
  ['Adultos/Premium', [
    [300, 'Playboy', true],
    [301, 'Venus', true],
    [302, 'Sextreme', true],
    [800, 'Playboy', true],
    [801, 'Venus', true],
    [802, 'Sextreme', true],
  ]],
  ['Cultura', [
    [29, 'SBN'],
    [30, 'Esne'],
    [31, 'Enlace'],
    [120, 'Animal Planet'],
    [121, 'Discovery Channel'],
    [122, 'Discovery Science'],
    [123, 'Nat Geo'],
    [124, 'History Channel'],
    [25, 'H2'],
  ]],
  ['Deporte', [
    [169, 'ClaroSports'],
    [170, 'Discovery Turbo'],
    [174, 'ESPN'],
    [175, 'ESPN 2'],
    [176, 'ESPN 3'],
    [177, 'ESPN 4'],
  ]],
  ['Entretenimiento', [
    [22, 'Food Network'],
    [28, 'Canal Claro'],
    [129, 'TLC'],
    [131, 'HGTV'],
  ]],
  ['Hogar y Familia', [
    [21, 'Home and Health'],
    [23, 'El Gourmet'],
  ]],
  ['Infantiles', [
    [2, 'Discovery Kids'],
    [3, 'Baby TV'],
    [5, 'Funbox'],
    [6, 'Disney Jr'],
  ]],
  ['Música y Audio', [
    [150, 'Zona Latina'],
    [151, 'Via X'],
    [153, 'HTV'],
    [154, 'Much Music'],
  ]],
  ['Noticias', [
    [35, 'CNN Internacional'],
    [36, 'CNN En Español'],
    [37, 'CNN Chile'],
  ]],
  ['Películas y Series', [
    [90, 'HBO'],
    [91, 'Cinemax'],
    [92, 'TNT'],
    [93, 'Cinecanal'],
  ]],
  ['Películas y Series/Premium', [
    [280, 'Universal Premier', true],
    [282, 'Universal Cinema', true],
  ]],
]

/** Categorías que declaran contenido premium/adulto en la guía de Claro */
const CATEGORIAS_PREMIUM = new Set(['Adultos/Premium', 'Películas y Series/Premium'])

/** "[n, nombre, premium?]" → "{ n, canal, hd, premium, categoria }" */
const aGuia = (categoria, [n, canal, premium]) => ({
  n,
  canal,
  hd: /\bHD\b/i.test(canal),
  premium: !!premium || CATEGORIAS_PREMIUM.has(categoria),
  categoria,
})

const guiaDe = (proveedor, tabla) => {
  const categorias = tabla.map(([categoria, filas]) => ({
    categoria,
    canales: filas.map((f) => aGuia(categoria, f)),
  }))
  return {
    proveedor,
    clave: proveedor.toLowerCase(),
    categorias,
    canales: categorias.flatMap((c) => c.canales),
  }
}

/** Guía ya aplanada → mismo shape que `guiaDe`, agrupada por bloque/categoría */
const guiaPlana = (proveedor, senales) => {
  const categorias = []
  for (const s of senales) {
    let c = categorias.find((x) => x.categoria === s.categoria)
    if (!c) categorias.push((c = { categoria: s.categoria, canales: [] }))
    c.canales.push({ ...s, premium: s.premium })
  }
  return { proveedor, clave: proveedor.toLowerCase(), categorias, canales: senales }
}

/** Guía de canales por proveedor: clave = `vtr` | `claro` */
export const GUIA_CANALES = {
  vtr: guiaPlana('VTR', GUIA_VTR),
  claro: guiaDe('Claro', GUIA_CLARO),
}

export const PROVEEDORES_GUIA = Object.keys(GUIA_CANALES)

export const guia = (clave) => GUIA_CANALES[String(clave || '').toLowerCase()] || null

/** Totales de la guía: `{ vtr: { canales: 74, hd: 26, ... } }` */
export const TOTALES_GUIA = Object.fromEntries(
  PROVEEDORES_GUIA.map((k) => [
    k,
    {
      canales: GUIA_CANALES[k].canales.length,
      hd: GUIA_CANALES[k].canales.filter((c) => c.hd).length,
      premium: GUIA_CANALES[k].canales.filter((c) => c.premium).length,
      categorias: GUIA_CANALES[k].categorias.length,
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

/**
 * Grillas de canales TV — fuente: imágenes de grilla del portal.
 *
 * · TV FULL: la imagen es la misma para VTR y Claro, salvo Claro Sports, que es
 *   exclusivo de Claro. Por eso la grilla se parte en una base común y la fila
 *   propia de cada proveedor.
 * · Claro TV INICIA (77 canales, 66 HD): grilla propia de Claro.
 *
 * Los mismos números cambian de señal entre la grilla TV FULL y la de TV Inicia.
 * TV PREMIUM no aparece en las imágenes: no se marca ningún canal como Premium
 * sin evidencia.
 *
 * Estas grillas son la lectura de la imagen del portal. Los números de canal que
 * ve el cliente están en `GUIA_CANALES`; el modal usa esa, no esta.
 *
 * `canal: null` = señal cuyo nombre no se pudo leer (se cuenta en `pendiente`).
 * Las señales que faltan para el conteo oficial se reportan como "por confirmar".
 */

/** Señales que solo van en Claro. Nunca sumarlas a la grilla de VTR. */
const EXCLUSIVAS_CLARO = [[469, 'Claro Sports']]

const TV_FULL_COMUN = [
  [470, 'TUBO'],
  [471, 'TLC'],
  [473, 'TNT'],
  [474, 'Discovery'],
  [475, 'Animal Planet'],
  [476, 'History'],
  [477, 'ESPN'],
  [479, 'ESPN 2'],
  [489, 'TNT Sports'],
  [502, 'Discovery Kids'],
  [506, 'Disney Junior'],
  [509, 'Disney Channel'],
  [510, 'Cartoon Network'],
  [511, 'ETC'],
  [513, 'Cartoonito'],
  [515, 'Nickelodeon'],
  [517, 'Kine'],
  [518, 'Vive'],
  [519, 'Mega 2'],
  [521, 'Discovery Home & Health'],
  [522, 'Food Network'],
  [523, 'El Gourmet'],
  [526, 'ARTV'],
  [527, '13 Realities'],
  [534, 'Bío Bío TV'],
  [535, 'CNN International'],
  [536, 'CNN en Español'],
  [537, 'CNN Chile'],
  [538, '24 Horas'],
  [540, 'Cámara de Diputados TV'],
  [542, 'Mega Noticias'],
  [586, 'AMC'],
  [587, 'Golden'],
  [590, 'Cinecanal'],
  [591, 'Cinemax'],
  [592, 'TNT HD'],
  [593, 'TNT Novelas'],
  [599, 'TCM'],
  [600, 'Star Channel'],
  [601, 'FX'],
  [602, 'Universal'],
  [603, 'Studio Universal'],
  [605, 'Warner'],
  [611, 'Space'],
  [612, 'A3Series'],
  [613, 'Studio Universal'],
  [615, 'USA'],
  [620, 'Animal Planet'],
  [621, 'Discovery Channel'],
  [625, 'Love Nature'],
  [627, '13C'],
  [631, 'HGTV'],
  [632, 'Investigation Discovery (ID)'],
  [633, 'TNT'],
  [635, 'TNT Series'],
  [637, 'TLC'],
  [638, 'E!'],
  [640, 'TNT'],
  [645, 'Cinemax'],
  [649, 'Vía X'],
  [650, 'Zona Latina'],
  [651, 'Vía X+'],
  [652, 'Zona Latina'],
  [760, 'HBO Family'],
  [761, 'HBO Signature'],
  [762, 'HBO'],
  [763, 'HBO Plus'],
  [765, 'HBO Pop'],
  [766, 'HBO Xtreme'],
  [767, 'HBO Mundi'],
]

const CLARO_TV_INICIA = [
  [470, 'TUBO'],
  [473, 'ESPN 4'],
  [474, 'ESPN'],
  [475, 'ESPN 2'],
  [476, 'ESPN 3'],
  [477, 'ESPN 5'],
  [480, 'ESPN 6'],
  [489, 'TNT Sports 3'],
  [502, 'Discovery Kids'],
  [510, 'ESPN'],
  [511, 'ESPN 2'],
  [512, 'ESPN 3'],
  [513, 'ESPN'],
  [515, 'ESPN Extra'],
  [518, 'Vive'],
  [519, 'Mega 2'],
  [520, 'ESPN 4'],
  [521, 'Discovery Home & Health'],
  [522, 'Food Network'],
  [523, 'El Gourmet'],
  [524, 'Cocina Viva'],
  [526, 'Adrenalina Sports Network'],
  [527, '13 Realities'],
  [528, 'Azteca'],
  [529, 'Pasiones'],
  [533, 'T13 en Vivo'],
  [534, 'Bío Bío TV'],
  [535, 'CNN International'],
  [536, 'CNN en Español'],
  [537, 'CNN Chile'],
  [538, '24 Horas'],
  [539, 'France 24'],
  [540, 'Discovery'],
  [542, 'Mega Noticias'],
  [543, 'Animal Planet'],
  [586, 'ESPN'],
  [587, 'ESPN 2'],
  [588, 'ESPN 3'],
  [589, 'ESPN 4'],
  [592, 'TNT'],
  [595, 'FX'],
  [597, 'DHE'],
  [598, 'De Película'],
  [599, 'Cinecanal'],
  [602, 'HBO'],
  [603, 'HBO Plus'],
  [611, 'Warner Channel'],
  [613, 'Sony Channel'],
  [615, 'CNN'],
  [616, 'TVN3'],
  [618, 'REC TV'],
  [620, 'Animal Planet'],
  [621, 'Discovery Channel'],
  [622, 'Discovery Science'],
  [625, 'Love Nature'],
  [627, '13C'],
  [631, 'HGTV'],
  [632, 'Investigation Discovery (ID)'],
  [633, 'Nickelodeon'],
  [634, 'Disney Channel'],
  [635, 'Disney Junior'],
  [637, 'TLC'],
  [638, 'E!'],
  [639, 'Tevex'],
  [640, 'CHV'],
  [642, 'Univisión'],
  [643, 'Cartoon Network'],
  [645, 'Cartoonito'],
  [646, null],
  [647, 'Vía X'],
  [648, 'Vía X+'],
  [649, 'Vía X'],
  [650, 'Golden Premier'],
  [651, 'Golden Premier'],
  [652, 'Telefe'],
  [762, 'HBO'],
]

const aGrilla = (filas) => filas.map(([n, canal]) => ({ n, canal, pendiente: !canal }))

/** Grilla de VTR TV Full: la base común, sin las señales exclusivas de Claro */
const TV_FULL = TV_FULL_COMUN

/** Grilla de Claro TV Full: la base común más las señales propias de Claro */
const CLARO_TV_FULL = [...TV_FULL_COMUN, ...EXCLUSIVAS_CLARO]

/**
 * Grillas por fuente. `clave` = `${proveedor}:${paqueteTv}`
 * `guia` = clave de `GUIA_CANALES` con los números de canal reales.
 */
export const GRILLAS_CANALES = {
  'vtr:full': {
    proveedor: 'VTR',
    paquete: 'TV Full',
    clave: 'vtr:full',
    guia: 'vtr',
    // La imagen del portal declara 74 señales contando Claro Sports, que es de
    // Claro: VTR no la lleva, así que su grilla es de 73. El conteo de HD viene
    // de la imagen compartida y no se ajusta por esa fila.
    conteo: { canales: 73, hd: 68 },
    notaConteo: 'El conteo de la imagen incluye Claro Sports (exclusiva de Claro).',
    canales: aGrilla(TV_FULL),
  },
  'claro:full': {
    proveedor: 'Claro',
    paquete: 'TV Full',
    clave: 'claro:full',
    guia: 'claro',
    conteo: { canales: 74, hd: 68 },
    canales: aGrilla(CLARO_TV_FULL),
  },
  'claro:inicia': {
    proveedor: 'Claro',
    paquete: 'TV Inicia',
    clave: 'claro:inicia',
    guia: 'claro',
    conteo: { canales: 77, hd: 66 },
    canales: aGrilla(CLARO_TV_INICIA),
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
    `Grilla leída: ${g.canales.length} señales${pendientes ? `, ${pendientes} sin nombre legible` : ''}${noLeidas ? `, ${noLeidas} por confirmar` : ''}.`,
    `Canales: ${lista.map((c) => `${c.n} ${c.canal || 'sin nombre legible'}`).join(', ')}${limite > 0 && lista.length < g.canales.length ? ', …' : ''}`,
  ]
    .filter(Boolean)
    .join(' ')
}

/** Planes que se ven en la grilla del modal de VTR, en orden de dial */
const PLANES_MODAL_VTR = ['tv-plus', 'premium', 'interactivos']

/**
 * Grilla del modal: guía oficial del proveedor con los números que el cliente
 * sintoniza. `claveProveedor` = `vtr` | `claro`.
 *
 * No usa la lectura de la imagen del portal: esos números no son los del dial.
 * En VTR se suman los planes premium e interactivos; en Claro, la guía completa.
 * Los rangos cuyo contenido enumera la fuente (HBO 790-797) se expanden canal por
 * canal; los que solo delimitan un tramo (Pack Adultos 501-565) se muestran como
 * una entrada con su nota.
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
    if (!c.rango) {
      if (vistos.has(c.n)) continue
      vistos.add(c.n)
    }
    senales.push(c)
  }
  senales.sort((a, b) => a.n - b.n)

  // Los diales que VTR numera distinto por ciudad se ajustan al final, cuando ya
  // se resolvió la deduplicación por número.
  const finales = g.clave === 'vtr' ? aplicarRegionVtr(senales, region) : senales

  return {
    proveedor: g.proveedor,
    clave: g.clave,
    region,
    regiones: g.clave === 'vtr' ? REGIONES_VTR : [],
    senales: finales,
    conteo: {
      canales: finales.length,
      hd: finales.filter((s) => s.hd).length,
      sd: finales.filter((s) => !s.hd).length,
      premium: finales.filter((s) => s.premium).length,
      retirados: finales.filter((s) => s.retirado).length,
    },
    conflictos: g.clave === 'vtr' ? CONFLICTOS_VTR : [],
  }
}

/** Normaliza un nombre de canal para comparar entre guías y packs. */
export const normalizaCanal = (nombre) => sinHd(nombre)
