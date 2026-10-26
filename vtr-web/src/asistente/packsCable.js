/**
 * Packs de canales cable ("extras") + logos por canal.
 *
 * Estos canales NO son parte de la grilla base: vienen como packs adicionales
 * (Deportes/ESPN, HBO y Otros). Se muestran en la ficha del plan y dentro de
 * la grilla del paquete de TV que corresponde.
 */

// Canales que sí tienen logo en /public
const CANAL_LOGOS = {
  ESPN: '/espn.png',
  'ESPN 2': '/espn.png',
  'ESPN 3': '/espn.png',
  'ESPN Extra (ESPN 4)': '/espn.png',
  'ESPN 4 (ESPN 5)': '/espn.png',
  'Fox Sports 3 (ESPN 6)': '/espn.png',
  'Fox Sports': '/espn.png',
  'ESPN Premium': '/espn.png',
  'TNT Sports': '/tntsports.png',
  'TNT Sports Premium': '/tntsports.png',
  HBO: '/stream/hbo-max.png',
  'HBO 2': '/stream/hbo-max.png',
  'HBO Family': '/stream/hbo-max.png',
  'HBO Mundi': '/stream/hbo-max.png',
  'HBO Signature': '/stream/hbo-max.png',
  'HBO Plus': '/stream/hbo-max.png',
  'HBO Pop': '/stream/hbo-max.png',
  Cinemax: '/cinemax.png',
  SCIENCE: '/DiscoveryScience.png',
  'Discovery Science': '/DiscoveryScience.png',
  'Discovery World': '/DiscoveryWorld.png',
  'Discovery Theater': '/DiscoveryTheater.png',
  'Discovery Channel': '/DiscoveryWorld.png',
  Discovery: '/DiscoveryWorld.png',
  'Discovery Kids': '/DiscoveryWorld.png',
  'Discovery Home & Health': '/DiscoveryWorld.png',
  Universal: '/stream/universal.png',
  'Universal+': '/stream/universal.png',
  'Universal TV': '/stream/universal.png',
  'Studio Universal': '/studiouniversal.png',
  USA: '/usa.png',
  'USA Network': '/usa.png',
  'Entertainment Television': '/E!.png',
  'E!': '/E!.png',
  Paramount: '/Paramount.png',
  'Comedy Central': '/comedycentral.png',
  Dreamworks: '/Dreamworks.png',
  Warner: '/Warner.png',
  Telemundo: '/telemundo.png',
  MTV: '/MTV.png',
}

/**
 * Resuelve el logo de un canal por nombre. Primero busca coincidencia exacta y
 * después por prefijo, para que las variations de la grilla ("HBO Xtreme",
 * "USA Network", "Discovery Channel") caigan en el logo de la marca.
 */
export const logoCanal = (nombre) => {
  if (!nombre) return null
  const n = String(nombre).trim()
  if (CANAL_LOGOS[n]) return CANAL_LOGOS[n]
  const exacto = Object.keys(CANAL_LOGOS).find((k) => k.toLowerCase() === n.toLowerCase())
  if (exacto) return CANAL_LOGOS[exacto]
  const prefijo = Object.keys(CANAL_LOGOS)
    .sort((a, b) => b.length - a.length)
    .find((k) => n.toLowerCase().startsWith(`${k.toLowerCase()} `) || n.toLowerCase().startsWith(k.toLowerCase()))
  return prefijo ? CANAL_LOGOS[prefijo] : null
}

export const CABLE_PACKS = [
  {
    id: 'espn',
    name: 'ESPN',
    img: '/espn.png',
    items: ['ESPN', 'ESPN 2', 'ESPN 3', 'ESPN Extra (ESPN 4)', 'ESPN 4 (ESPN 5)', 'Fox Sports 3 (ESPN 6)'],
  },
  {
    id: 'hbo',
    name: 'HBO',
    img: '/stream/hbo-max.png',
    items: ['HBO', 'HBO Family', 'HBO Mundi', 'HBO Signature', 'HBO Plus', 'HBO Pop'],
  },
  {
    id: 'otros',
    name: 'Otros canales',
    img: '/Warner.png',
    items: ['Comedy Central', 'Universal', 'Studio Universal', 'Warner', 'Telemundo', 'Cinemax'],
  },
]

/**
 * Señales que ya no van en la grilla de VTR ni de Claro (packs ni extras).
 * SCIENCE queda solo en Claro (528 TV Inicia / 626 TV Full), no como extra.
 */
export const CANALES_FUERA_GRILLA = [
  'HBO Xtreme',
  'Discovery Science',
  'Discovery World',
  'Discovery Theater',
  'Theater',
  'World',
  'Paramount',
  'USA',
  'USA Network',
  'Entertainment Television',
  'Dreamworks',
  'MTV',
]

/**
 * Qué packs trae cada paquete de TV (fuera de la grilla base).
 * Coincide con `incluyeExtras` de TV_PLAN_META: Inicia no, Plus/Premium/Full sí.
 */
export const PACKS_POR_GRILLA = {
  'vtr:full': true,
  'claro:inicia': false,
}

/** Packs incluidos y excluidos para una grilla */
export function packsDeGrilla(clave) {
  const incluye = PACKS_POR_GRILLA[clave]
  return incluye === true
    ? { incluidos: CABLE_PACKS, excluidos: [] }
    : incluye === false
      ? { incluidos: [], excluidos: CABLE_PACKS }
      : { incluidos: [], excluidos: [] }
}
