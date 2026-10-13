/**
 * Corpus D-Box Smart II: contratación en Andes, precio $2.990/mes,
 * frases naturales + flujo paso a paso.
 */

import { IMGS_DB, IMGS_DBOX } from './assetsGuias.js'

function normFraseKey(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const PRECIO = '$2.990 / mes'
const FLUJO =
  'Clientes → RUT → clase Cliente → Productos Instalados → Modificar → Pedido Detalles → línea Television → Personalizar → Equipos → Decodificadores → d-BOX Smart II (Cant. 1) → Agregar ítem → Verificar en Detalles → Verificar → Método de Envío → Generar documento → Enviar.'

export const DOCS_DBOX = [
  {
    id: 'db-precio',
    titulo: 'd-BOX Smart II — precio mensual',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → D-Box',
    intencion: 'DBOX_PRECIO',
    sinonimos: [
      'precio dbox',
      'cuanto cuesta el dbox',
      'dbox 2990',
      'decodificador precio',
      'cuanto sale el d-box',
    ],
    contenido: [
      `Costo de referencia d-BOX Smart II: ${PRECIO}.`,
      'Es un cargo mensual (no confundir con Control Remoto $6.000 de una vez).',
      'Se agrega personalizando la línea Television → Equipos → Decodificadores.',
    ],
    imagenes: IMGS_DB.precio,
    fuente: 'entrenamiento-dbox',
  },
  {
    id: 'db-flujo',
    titulo: 'Contratación d-BOX Smart II en Andes (flujo completo)',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → D-Box',
    intencion: 'DBOX_FLUJO',
    sinonimos: [
      'como agrego un dbox',
      'paso a paso dbox',
      'contratar d-box smart ii',
      'agregar decodificador',
      'personalizar television equipos',
    ],
    contenido: [
      `Guía resumida: busca al cliente, modifica el producto y usa el Pedido de ventas. Desde el paso de Detalles: Personalizar Television → Equipos → agregar d-BOX Smart II. Luego verifica, genera documento y envía. Costo ref.: ${PRECIO}.`,
      'Pasos:',
      '1) Clientes → buscar RUT.',
      '2) Seleccionar clase Cliente (no Facturación/Servicio).',
      '3–4) Productos Instalados → seleccionar producto → Modificar (abrir Pedido Pendiente).',
      '5) Pedido → Detalles → líneas (Television, etc.).',
      '6) Línea Television → Personalizar.',
      '7) Avanzar a Equipos (Television → Canales Adicionales → Equipos) → Decodificadores.',
      '8) Item: d-BOX Smart II | Cant. 1.',
      '9) Agregar ítem.',
      `10) Verificar que figure en Decodificadores con ${PRECIO}.`,
      '11) Detalles del pedido: d-BOX Smart II Nuevo $2.990.',
      '12) Verificar → Método de Envío (Autoinstalación o Visita Técnica) → Generar documento.',
      '13) Revisar datos/dirección → Enviar.',
      FLUJO,
    ],
    imagenes: IMGS_DB.flujo,
    fuente: 'entrenamiento-dbox',
  },
  {
    id: 'db-equipos',
    titulo: 'D-Box — Personalizar Television → Equipos',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → D-Box',
    intencion: 'DBOX_EQUIPOS',
    sinonimos: [
      'personalizar television',
      'donde agrego el dbox',
      'decodificadores dbox',
      'equipos television dbox',
    ],
    contenido: [
      'En Detalles del Pedido: selecciona la línea Television → Personalizar.',
      'Avanza hasta Equipos → sección Decodificadores.',
      'Elige d-BOX Smart II, Cant. 1 → Agregar ítem.',
      `Confirma precio ${PRECIO} y acción Nuevo en Detalles.`,
    ],
    imagenes: IMGS_DB.equipos,
    fuente: 'entrenamiento-dbox',
  },
  {
    id: 'db-entrega',
    titulo: 'D-Box — Método de Envío y cierre del pedido',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → D-Box',
    intencion: 'DBOX_ENTREGA',
    sinonimos: [
      'metodo de envio dbox',
      'visita tecnica dbox',
      'autoinstalacion dbox',
      'enviar pedido dbox',
    ],
    contenido: [
      'Tras agregar el d-BOX: Verificar → Método de Envío (Autoinstalación o Visita Técnica) → Generar documento → Enviar.',
      'Revisa dirección de servicio y datos obligatorios antes de Enviar.',
    ],
    imagenes: IMGS_DB.entrega,
    fuente: 'entrenamiento-dbox',
  },
  {
    id: 'db-general',
    titulo: 'd-BOX Smart II — qué es / contratar',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → D-Box',
    intencion: 'DBOX_GENERAL',
    sinonimos: [
      'que es dbox',
      'necesito un dbox',
      'quiero un decodificador',
      'd-box smart ii',
      'contratar otro deco',
    ],
    contenido: [
      'd-BOX Smart II es el decodificador que se agrega a la línea de Television en Andes.',
      `Costo de referencia: ${PRECIO}.`,
      'Se contrata personalizando Television → Equipos → Decodificadores.',
      'Guía completa: “paso a paso dbox” o “cómo agregar un D-Box”.',
    ],
    imagenes: IMGS_DB.general,
    fuente: 'entrenamiento-dbox',
  },
]

const RESPUESTA_POR_INTENCION = {
  DBOX_PRECIO: `El d-BOX Smart II tiene un costo de referencia de ${PRECIO}.`,
  DBOX_FLUJO: `Para contratar d-BOX Smart II (${PRECIO}): ${FLUJO}`,
  DBOX_EQUIPOS:
    'Pedido → Detalles → Television → Personalizar → Equipos → Decodificadores → d-BOX Smart II (Cant. 1) → Agregar ítem.',
  DBOX_ENTREGA:
    'Verificar → Método de Envío (Autoinstalación o Visita Técnica) → Generar documento → Enviar.',
  DBOX_GENERAL: `d-BOX Smart II es el decodificador contratado en Andes (${PRECIO}). Se agrega desde Television → Personalizar → Equipos.`,
}

const EJEMPLOS_DB_BASE = [
  {
    pregunta: '¿Cuánto cuesta el D-Box?',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_PRECIO,
    intencion: 'DBOX_PRECIO',
  },
  {
    pregunta: 'cuanto sale el dbox',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_PRECIO,
    intencion: 'DBOX_PRECIO',
  },
  {
    pregunta: 'Cómo agregar un D-Box',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_FLUJO,
    intencion: 'DBOX_FLUJO',
  },
  {
    pregunta: 'paso a paso dbox',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_FLUJO,
    intencion: 'DBOX_FLUJO',
  },
  {
    pregunta: 'donde agrego el dbox en el pedido',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_EQUIPOS,
    intencion: 'DBOX_EQUIPOS',
  },
  {
    pregunta: 'personalizar television para dbox',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_EQUIPOS,
    intencion: 'DBOX_EQUIPOS',
  },
  {
    pregunta: 'necesito un decodificador',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_GENERAL,
    intencion: 'DBOX_GENERAL',
  },
  {
    pregunta: 'dbox 2990',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_PRECIO,
    intencion: 'DBOX_PRECIO',
  },
  {
    pregunta: 'visita tecnica para el dbox',
    respuesta: RESPUESTA_POR_INTENCION.DBOX_ENTREGA,
    intencion: 'DBOX_ENTREGA',
  },
]

const FRASES_REALISTAS = [
  {
    intencion: 'DBOX_PRECIO',
    frases: [
      'precio d-box',
      'cuanto vale el dbox',
      'cuanto cuesta el decodificador',
      'dbox cuanto sale al mes',
      'son 2990 el dbox',
      'd box smart ii precio',
    ],
  },
  {
    intencion: 'DBOX_FLUJO',
    frases: [
      'como contrato un dbox',
      'quiero agregar un d-box',
      'como se agrega el smart ii',
      'flujo contratacion dbox',
      'pasos para contratar dbox',
      'como pongo un dbox en andes',
    ],
  },
  {
    intencion: 'DBOX_EQUIPOS',
    frases: [
      'en que paso agrego el dbox',
      'television personalizar equipos',
      'decodificadores smart ii',
      'agregar item dbox',
      'cant 1 dbox',
    ],
  },
  {
    intencion: 'DBOX_ENTREGA',
    frases: [
      'autoinstalacion dbox',
      'como finalizo el pedido del dbox',
      'generar documento dbox',
      'enviar orden dbox',
    ],
  },
  {
    intencion: 'DBOX_GENERAL',
    frases: [
      'quiero un dbox',
      'necesito otro deco',
      'contratar d box',
      'd-box smart ii',
      'que es el dbox smart ii',
    ],
  },
]

function frasesIntencion(id) {
  return (FRASES_REALISTAS.find((b) => b.intencion === id)?.frases || []).map(normFraseKey)
}

for (const doc of DOCS_DBOX) {
  if (doc.intencion) {
    doc.sinonimos = [...new Set([...(doc.sinonimos || []), ...frasesIntencion(doc.intencion)])]
  }
}

function ejemplosDesdeFrases(ya) {
  const vistos = new Set(ya.map((e) => normFraseKey(e.pregunta)))
  const out = []
  for (const bloque of FRASES_REALISTAS) {
    const respuesta = RESPUESTA_POR_INTENCION[bloque.intencion]
    if (!respuesta) continue
    for (const frase of bloque.frases) {
      const key = normFraseKey(frase)
      if (!key || vistos.has(key)) continue
      vistos.add(key)
      out.push({ pregunta: frase, respuesta, intencion: bloque.intencion })
    }
  }
  return out
}

export const EJEMPLOS_DBOX = [...EJEMPLOS_DB_BASE, ...ejemplosDesdeFrases(EJEMPLOS_DB_BASE)]

export function docsEjemplosDboxADocs() {
  const imgsPorIntent = {
    DBOX_PRECIO: IMGS_DB.precio,
    DBOX_FLUJO: IMGS_DB.flujo,
    DBOX_EQUIPOS: IMGS_DB.equipos,
    DBOX_ENTREGA: IMGS_DB.entrega,
    DBOX_GENERAL: IMGS_DB.general,
  }
  return EJEMPLOS_DBOX.map((ej, i) => {
    const pregNorm = normFraseKey(ej.pregunta)
    const STOP = new Set(['que', 'como', 'por', 'para', 'una', 'este', 'quiero', 'cuanto'])
    const claves = pregNorm
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w))
      .slice(0, 8)
    return {
      id: `db-ej-${String(i + 1).padStart(3, '0')}`,
      titulo: ej.pregunta.replace(/\?+$/, '').slice(0, 90),
      categoria: 'CONTRATACIONES',
      tipo: 'micro',
      seccionPortal: 'Entrenamiento D-Box',
      intencion: ej.intencion,
      sinonimos: [ej.pregunta, pregNorm, ej.intencion, ...claves],
      contenido: [ej.respuesta],
      imagenes: imgsPorIntent[ej.intencion] || IMGS_DBOX.slice(0, 4),
      fuente: 'entrenamiento-dbox-ejemplos',
      ejemploPregunta: ej.pregunta,
    }
  })
}

export function docsDboxCompletos() {
  return [...DOCS_DBOX, ...docsEjemplosDboxADocs()]
}
