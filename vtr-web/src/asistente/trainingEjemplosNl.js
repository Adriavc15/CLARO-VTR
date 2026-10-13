/**
 * Capa de lenguaje natural / variaciones de consulta para el catálogo Andes-VTR.
 * Genera cientos de ejemplos formales → coloquiales → cortos → sin signos → errores → continuación.
 */

import { expandirConAperturasAyuda } from './sugerenciasPredictivas.js'

const PLANTILLAS_STREAMING = [
  'Cuáles son los planes con {E}',
  'Qué plan tiene {E}',
  'Tienen {E}',
  'tienen {E}?',
  'quiero un plan con {E}',
  'hay planes que vengan con {E}',
  'Qué planes incluyen {E}',
  'cuál tiene {E}',
  'necesito internet + {E}',
  'quiero {E} con el internet',
  'tienen {E} incluido',
  '{E} viene incluido en algún plan',
  'Qué plan me sirve si quiero {E}',
  'y si quiero {E} cuál me conviene',
  'cuánto sale un plan con {E}',
  'muéstrame los planes con {E}',
  'planes de {E}',
  '{E} con internet',
  'internet y {E}',
  'hay alguna promo con {E}',
  'qué planes tienen {E}',
  'y con {E}',
  'y {E}?',
  'quiero {E} con el plan',
  'cuales son los planes con {e}',
  'que plan tiene {e}',
  'tienen {e}',
  'plan con {e} porfa',
  '{e} con internet cuanto',
  'hay {e} incluido',
  '{e} viene incluido o se paga aparte',
  '{e} nomas',
  'quiero {e}',
  'necesito {e}',
  'Cuáles incluyen {E}',
  'Hay internet con {E}',
  '{E} viene incluido',
  'Qué plan trae {E}',
  'Cuánto sale con {E}',
  'y con {E} cuánto queda',
  '{e} con fibra',
  'internet + {e}',
  'plan {e}',
  'el plan trae {e}',
  'cuanto sale con {e}',
  'y con {e} cuanto',
  'traen {e}',
  'incluye {e}',
  'viene con {e}',
  'planes con {e}',
  'pack {e}',
  'activar {e}',
  'contratar {e}',
  'agregar {e}',
  'sumar {e} al plan',
  'me dan {e}',
  'puedo tener {e}',
  'se puede {e}',
  '{e} o se paga aparte',
  'precio con {e}',
  'promo con {e}',
  'oferta {e}',
  'bundle {e}',
  'combo con {e}',
  'fibra con {e}',
  'internet mas {e}',
  'internet más {e}',
  'quiero fibra y {e}',
  'dame planes {e}',
  'lista de planes con {e}',
  'opciones con {e}',
  'hay {e}?',
  '{e}?',
  'y {e}',
  'solo {e}',
]

const PLANTILLAS_VELOCIDAD = [
  'Cuánto sale la de {V}',
  'Qué planes tienen {V} megas',
  'Quiero la de {V}',
  'Hay {V}',
  'Cuánto cuesta la fibra {V}',
  'la de {V} cuanto sale',
  'y la de {V}',
  'tienen {V} megas',
  'tienen {V}',
  'fibra {V}',
  'plan {V}',
  'velocidad {V}',
  '{V} megas precio',
  'cuanto sale {V} megas',
  'precio fibra {V}',
  'promo fibra {V}',
  'quiero {V} megas',
  'necesito {V}',
  'la de {V} porfa',
  'y {V}?',
  'hay {V} megas',
  'cuanto la {V}',
  'valor de la {V}',
  'costo fibra {V}',
  'fibra hogar {V}',
  '{V} mega',
  '{V}megas',
  'internet {V}',
  'plan internet {V}',
  'la fibra de {V}',
  'pasame la de {V}',
  'info de la {V}',
  'datos fibra {V}',
  'precio normal y promo {V}',
  'cuanto queda la de {V}',
  'y la {V} cuanto',
  '{V} con netflix',
  '{V} con disney',
  '{V} con hbo',
  'la de {V} con streaming',
]

const PLANTILLAS_GENERICO_PLAN = [
  'qué planes tienen',
  'que planes hay',
  'muéstrame los planes',
  'lista de planes',
  'planes disponibles',
  'catálogo de planes',
  'opciones de internet',
  'qué velocidades tienen',
  'cuál es la más rápida',
  'quiero la más rápida',
  'planes fibra',
  'internet fibra precios',
  'cuánto sale el internet',
  'precios de planes',
  'promos de internet',
]

const ERRORES = [
  [(s) => s.replace(/qué/gi, 'que').replace(/cuál/gi, 'cual').replace(/cuánto/gi, 'cuanto')],
  [(s) => s.replace(/\?/g, '').replace(/¿/g, '')],
  [(s) => s.toLowerCase()],
  [(s) => s.replace(/incluido/gi, 'includio').replace(/planes/gi, 'planez')],
]

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const t = String(x || '').trim()
    if (!t) continue
    const k = t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!k || seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out
}

function expandPlantillas(plantillas, mapa) {
  const base = []
  for (const p of plantillas) {
    let s = p
    for (const [k, v] of Object.entries(mapa)) {
      s = s.replaceAll(`{${k}}`, v)
    }
    base.push(s)
  }
  const out = [...base]
  for (const s of base) {
    out.push(s.toLowerCase())
    out.push(s.replace(/[¿?¡!]/g, '').trim())
    out.push(s.toLowerCase().replace(/[¿?¡!]/g, '').trim())
    // variantes sin acentos ya las normaliza el buscador; errores leves
    out.push(s.toLowerCase().replace(/cuánto|cuanto/gi, 'kuanto').replace(/[¿?]/g, ''))
  }
  return uniq(out)
}

/** Intents de lenguaje natural para catálogo (streaming + velocidades + genérico). */
export function generarTrainingExamplesCatalogo() {
  const packs = []

  const streamings = [
    {
      intent: 'consultar_planes_hbo',
      entities: ['HBO', 'Max', 'HBO Max'],
      aliases: ['HBO', 'Max', 'HBO Max', 'hbomax'],
      matchDocs: ['KB-0055', 'KB-0063'],
      matchTokens: ['hbo', 'max', 'hbomax'],
      action: 'buscar_planes_con_streaming',
      response_source: 'plans',
      answer:
        'HBO / Max no viene empaquetado como los combos Fibra+Netflix/Disney+ del catálogo actual. Está como HBO Max (streaming) y Pack HBO (canales HBO Family, Mundi, Signature, Plus, Xtreme, Pop). Pregunta si lo quieres a la carta/pack o dentro de un plan TV Premium/Full.',
    },
    {
      intent: 'consultar_planes_netflix',
      entities: ['Netflix'],
      aliases: ['Netflix', 'netflis', 'netflx'],
      matchDocs: ['KB-0005', 'KB-0007', 'KB-0009', 'KB-0054'],
      matchTokens: ['netflix'],
      action: 'buscar_planes_con_streaming',
      response_source: 'plans',
      answer:
        'Sí hay combos Fibra + Netflix: 600 ($19.990 promo / $29.990 lista), 800 y 940 también con Netflix. También puedes ver Netflix como OTT a la carta.',
    },
    {
      intent: 'consultar_planes_disney',
      entities: ['Disney+', 'Disney'],
      aliases: ['Disney+', 'Disney', 'disney plus', 'disneyplus'],
      matchDocs: ['KB-0004', 'KB-0006', 'KB-0008', 'KB-0053'],
      matchTokens: ['disney'],
      action: 'buscar_planes_con_streaming',
      response_source: 'plans',
      answer:
        'Sí hay combos Fibra + Disney+: 600, 800 y 940. También puedes consultar Disney+ como plataforma OTT.',
    },
    {
      intent: 'consultar_planes_prime',
      entities: ['Prime Video', 'Prime', 'Amazon Prime'],
      aliases: ['Prime Video', 'Prime', 'Amazon Prime', 'prime video'],
      matchDocs: ['KB-0056'],
      matchTokens: ['prime', 'amazon'],
      action: 'buscar_planes_con_streaming',
      response_source: 'plans',
      answer: 'Prime Video está en el catálogo de streaming OTT. Indica si lo quieres a la carta o dentro de un plan TV.',
    },
  ]

  for (const s of streamings) {
    const ejemplos = []
    for (const alias of s.aliases) {
      ejemplos.push(
        ...expandPlantillas(PLANTILLAS_STREAMING, {
          E: alias,
          e: alias.toLowerCase(),
        })
      )
    }
    // Continuaciones de contexto
    ejemplos.push(
      `y con ${s.entities[0]}?`,
      `y ${s.entities[0].toLowerCase()}?`,
      `ahora con ${s.entities[0].toLowerCase()}`,
      `y si le sumo ${s.entities[0].toLowerCase()}`,
      `ok y ${s.entities[0].toLowerCase()}`,
      `dale con ${s.entities[0].toLowerCase()}`
    )
    packs.push({
      id: `NL-${s.intent}`,
      intent: s.intent,
      category: 'planes',
      user_examples: uniq(ejemplos),
      entities: s.entities,
      action: s.action,
      response_source: s.response_source,
      matchDocs: s.matchDocs,
      matchTokens: s.matchTokens,
      answer: s.answer,
    })
  }

  for (const v of ['600', '800', '940']) {
    const ejemplos = expandPlantillas(PLANTILLAS_VELOCIDAD, { V: v })
    ejemplos.push(
      `y la de ${v}?`,
      `ok la de ${v}`,
      `esa de ${v}`,
      `pasame ${v}`,
      `info ${v} megas`,
      `cuanto la fibra ${v}`
    )
    const precios = {
      '600': { normal: '$21.990', promo: '$14.990', andes: 'Fibra Hogar Residencial 0226F', kb: 'KB-0001' },
      '800': { normal: '$23.990', promo: '$15.990', andes: 'Fibra Avanzado Residencial 0226F', kb: 'KB-0002' },
      '940': { normal: '$29.990', promo: '$19.990', andes: 'Fibra Experto Residencial 0226F', kb: 'KB-0003' },
    }[v]
    packs.push({
      id: `NL-consultar_fibra_${v}`,
      intent: `consultar_fibra_${v}`,
      category: 'planes',
      user_examples: uniq(ejemplos),
      entities: [`Fibra ${v}`, `${v} Megas`, `${v}`],
      action: 'buscar_plan_por_velocidad',
      response_source: 'plans',
      matchDocs: [precios.kb],
      matchTokens: [v, 'fibra', 'megas'],
      answer: `Fibra ${v} Megas: precio promo ${precios.promo}; precio normal ${precios.normal}. Nombre en Andes: ${precios.andes}.`,
    })
  }

  packs.push({
    id: 'NL-consultar_planes_general',
    intent: 'consultar_planes_general',
    category: 'planes',
    user_examples: uniq([
      ...PLANTILLAS_GENERICO_PLAN,
      ...PLANTILLAS_GENERICO_PLAN.map((x) => x.replace(/[¿?]/g, '')),
      ...PLANTILLAS_GENERICO_PLAN.map((x) => x.toLowerCase()),
      'planes',
      'internet',
      'fibra',
      'megas',
      'velocidades',
      'qué hay de internet',
      'opciones de fibra',
    ]),
    entities: ['planes', 'fibra', 'internet'],
    action: 'listar_planes',
    response_source: 'plans',
    matchDocs: ['KB-0001', 'KB-0002', 'KB-0003'],
    matchTokens: ['plan', 'planes', 'fibra', 'internet', 'velocidad'],
    answer:
      'Tenemos Fibra 600 (promo $14.990 / lista $21.990), Fibra 800 (promo $15.990 / lista $23.990) y Fibra 940 (promo $19.990 / lista $29.990). También hay combos con Netflix, Disney+, TV y telefonía. ¿Cuál velocidad te interesa?',
  })

  // Soporte coloquial LOS / luz roja en equipos (+ aperturas necesito/requiero/ayuda)
  packs.push({
    id: 'NL-soporte_los_rojo',
    intent: 'soporte_los_rojo',
    category: 'soporte_tecnico',
    user_examples: uniq(
      expandirConAperturasAyuda([
        'tengo problemas con LOS',
        'problemas con el los',
        'problemas con los',
        'me sale una luz roja en el router',
        'luz roja en el modem',
        'luz roja en el módem',
        'luz roja en el repetidor',
        'luz roja en el extensor',
        'router con luz roja no navego',
        'el modem tiene una luz roja',
        'me prende luz roja el repetidor',
        'cajita esta roja',
        'la cajita esta con luz roja',
        'se me prendio el los',
        'los en rojo',
        'ont con luz roja',
      ])
    ),
    entities: ['LOS', 'luz roja', 'ONT'],
    action: 'responder_soporte_los',
    response_source: 'knowledge',
    matchDocs: ['KB-0067', 'ont-los-rojo'],
    matchTokens: ['los', 'luz', 'roja', 'ont', 'router', 'modem', 'repetidor', 'extensor'],
    answer:
      'Si ves LOS / luz roja en la ONT (o te dicen router/módem/repetidor/extensor), casi siempre es pérdida de señal óptica. Revisa el cable de fibra (que no esté flojo, doblado o dañado). Si sigue en rojo, valida masivo del sector y genera visita técnica.',
  })

  // Otros casos frecuentes con mismas aperturas (necesito / requiero / ayuda con…)
  const otrosCasos = [
    {
      id: 'NL-soporte_control_remoto',
      intent: 'soporte_control_remoto',
      entities: ['control remoto'],
      matchDocs: ['cr-precio', 'guia-control-remoto'],
      matchTokens: ['control', 'remoto'],
      answer:
        'Control remoto: precio ref. $6.000 (+ delivery $3.000 si aplica). Se agrega desde Catálogo en Andes. ¿Precio, paso a paso o delivery?',
      nucleos: ['control remoto', 'el control remoto', 'cuanto sale el control remoto'],
    },
    {
      id: 'NL-soporte_sin_internet',
      intent: 'soporte_sin_internet',
      entities: ['sin internet'],
      matchDocs: ['ont-sin-internet-general'],
      matchTokens: ['internet', 'sin'],
      answer:
        'Sin internet: revisa luces de la ONT (LOS/PON), cable de fibra y reinicio. Si LOS está rojo → visita; si hay WiFi pero no navega → otro triaje. ¿Qué luces ves?',
      nucleos: ['sin internet', 'no tengo internet', 'internet lento'],
    },
    {
      id: 'NL-soporte_cambio_plan',
      intent: 'soporte_cambio_plan',
      entities: ['cambio de plan'],
      matchDocs: ['cp-cliente', 'guia-cambio-plan'],
      matchTokens: ['cambio', 'plan'],
      answer: 'Cambio de plan: se gestiona en Andes (Actualizar promoción) con el nombre exacto desde Apex/TSQ. ¿Quieres el paso a paso?',
      nucleos: ['cambio de plan', 'cambiar de plan'],
    },
    {
      id: 'NL-soporte_traslado',
      intent: 'soporte_traslado',
      entities: ['traslado'],
      matchDocs: [],
      matchTokens: ['traslado'],
      answer: 'Traslado de servicios: valida factibilidad (HFC/FTTH), dirección en GIS y matriz según canal. ¿Call Center, N1 o Sucursal?',
      nucleos: ['traslado', 'traslado de servicios'],
    },
    {
      id: 'NL-soporte_pago',
      intent: 'soporte_pago',
      entities: ['pago'],
      matchDocs: [],
      matchTokens: ['pago'],
      answer:
        'Tema pago: puede ser no aplicado, no asignado, traslado o reversa. ¿Cuál es el caso del cliente?',
      nucleos: ['pago', 'pago no aplicado', 'boleta'],
    },
    {
      id: 'NL-soporte_titular',
      intent: 'soporte_cambio_titular',
      entities: ['cambio de titular'],
      matchDocs: [],
      matchTokens: ['titular'],
      answer: 'Cambio de titular: hay requisitos y flujo en Andes. ¿Quieres consideraciones o el paso a paso?',
      nucleos: ['cambio de titular', 'titular'],
    },
  ]

  for (const c of otrosCasos) {
    packs.push({
      id: c.id,
      intent: c.intent,
      category: 'soporte_tecnico',
      user_examples: uniq(expandirConAperturasAyuda(c.nucleos)),
      entities: c.entities,
      action: 'responder_soporte',
      response_source: 'knowledge',
      matchDocs: c.matchDocs,
      matchTokens: c.matchTokens,
      answer: c.answer,
    })
  }

  return packs
}

/** Docs de conocimiento_portal derivados de los intents NL (hubs + sinonimos). */
export function docsDesdeTrainingNl(packs = generarTrainingExamplesCatalogo()) {
  return packs.map((p) => ({
    id: p.id,
    titulo: p.entities?.[0]
      ? `Consultas naturales: ${p.entities.join(' / ')}`
      : p.intent,
    categoria: String(p.category || 'PLANES').toUpperCase(),
    tipo: p.intent.includes('fibra_') || p.intent.includes('planes') ? 'plan' : 'ejemplo',
    seccionPortal: `Entrenamiento NL · ${p.intent}`,
    sinonimos: uniq([p.intent, ...(p.entities || []), ...(p.user_examples || [])]),
    contenido: [p.answer].filter(Boolean),
    fuente: 'kb-andes-nl',
    enlace: null,
    imagenes: [],
    intent: p.intent,
    matchDocs: p.matchDocs || [],
    matchTokens: p.matchTokens || [],
    action: p.action || '',
  }))
}

/** Expande sinonimos NL de cada plan KB según su título. */
export function expandirSinonimosPlan(titulo = '') {
  const t = String(titulo)
  const out = []
  const vel = t.match(/\b(600|800|940)\b/)
  if (vel) {
    const v = vel[1]
    out.push(
      ...expandPlantillas(PLANTILLAS_VELOCIDAD.slice(0, 18), { V: v }).slice(0, 40)
    )
  }
  for (const [label, token] of [
    ['Netflix', 'netflix'],
    ['Disney+', 'disney'],
    ['Disney', 'disney'],
    ['HBO', 'hbo'],
    ['Max', 'max'],
    ['Prime', 'prime'],
  ]) {
    if (new RegExp(token, 'i').test(t) || new RegExp(label.replace('+', '\\+'), 'i').test(t)) {
      out.push(...expandPlantillas(PLANTILLAS_STREAMING.slice(0, 20), { E: label, e: label.toLowerCase() }).slice(0, 35))
    }
  }
  return uniq(out)
}

export function metaTrainingNl(packs = generarTrainingExamplesCatalogo()) {
  const ejemplos = packs.reduce((n, p) => n + (p.user_examples?.length || 0), 0)
  return { intents: packs.length, ejemplos }
}
