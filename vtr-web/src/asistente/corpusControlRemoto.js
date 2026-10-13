/**
 * Corpus Control Remoto VTR: precios, delivery, pérdida/falla, entrega,
 * frases naturales (sin ¿?, typos, “mando”) + flujo venta Siebel/Andes.
 */

import { IMGS_CR, IMGS_CONTROL_REMOTO } from './assetsGuias.js'

const PRECIO_CONTROL = '$6.000'
const PRECIO_DELIVERY = '$3.000'
const TOTAL_REF = '$9.000'

function normFraseKey(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export const DOCS_CONTROL_REMOTO = [
  {
    id: 'cr-precio',
    titulo: 'Precio Control Remoto (repuesto)',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_PRECIO',
    sinonimos: [
      'precio control remoto',
      'cuanto cuesta el control remoto',
      'cuanto sale el control',
      'control 6000',
      '6 lucas control',
      'precio del control',
      'cuanto vale un control nuevo',
    ],
    contenido: [
      `Si el control remoto se pierde o se solicita un repuesto, el costo de referencia es ${PRECIO_CONTROL}.`,
      'Es un cargo de repuesto / Delivery Control Remoto (no confundir con el delivery de envío).',
      `Si además corresponde despacho a domicilio, el delivery de equipos suma ${PRECIO_DELIVERY}.`,
      'Para el paso a paso en Andes, pregunta: paso a paso control remoto.',
    ],
    imagenes: IMGS_CR.precio,
    fuente: 'entrenamiento-control-remoto',
  },
  {
    id: 'cr-delivery',
    titulo: 'Delivery / despacho del Control Remoto',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_DELIVERY',
    sinonimos: [
      'delivery control',
      'despacho control',
      'envio control',
      'delivery 3000',
      'cuanto sale el delivery',
      'cobran envio por el control',
    ],
    contenido: [
      `El delivery de equipos tiene un costo adicional de referencia de ${PRECIO_DELIVERY}.`,
      'Se paga aparte del valor del control remoto cuando corresponde envío a domicilio.',
      `Control ${PRECIO_CONTROL} + delivery ${PRECIO_DELIVERY} ≈ ${TOTAL_REF} si aplica despacho.`,
      'En el pedido, el Método de Envío se elige entre Autoinstalación o Visita Técnica.',
    ],
    imagenes: IMGS_CR.delivery,
    fuente: 'entrenamiento-control-remoto',
  },
  {
    id: 'cr-total',
    titulo: 'Costo total Control Remoto + Delivery',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_TOTAL',
    sinonimos: [
      'control mas despacho',
      '6000 mas 3000',
      'control con delivery',
      'cuanto pago en total por el control',
      'control puesto en mi casa',
    ],
    contenido: [
      `Sí: control remoto ${PRECIO_CONTROL} + delivery de equipos ${PRECIO_DELIVERY} cuando corresponde despacho.`,
      `Referencia total con envío: ${TOTAL_REF} (confirma siempre tarifa vigente).`,
      'El cobro del control es por el ítem de catálogo; el delivery es el cargo de envío de equipos.',
    ],
    imagenes: IMGS_CR.delivery,
    fuente: 'entrenamiento-control-remoto',
  },
  {
    id: 'cr-perdido',
    titulo: 'Control Remoto perdido / extraviado',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_PERDIDO',
    sinonimos: [
      'perdi el control',
      'se me perdio el control',
      'control perdido',
      'extravio control',
      'no encuentro el control',
      'se me perdio el mando',
    ],
    contenido: [
      `Si el control remoto se pierde, el repuesto tiene un costo de ${PRECIO_CONTROL}.`,
      `Si lo envían a domicilio, suma delivery ${PRECIO_DELIVERY}.`,
      'Se gestiona como venta del ítem Control Remoto en Andes (Catálogo → Cargos no recurrentes).',
      'Método de Envío: Autoinstalación o Visita Técnica según lo que pida el cliente.',
    ],
    imagenes: IMGS_CR.precio,
    fuente: 'entrenamiento-control-remoto',
  },
  {
    id: 'cr-danado',
    titulo: 'Control Remoto dañado / no funciona / no responde',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_DANADO',
    sinonimos: [
      'control no funciona',
      'control remoto no funciona',
      'control se rompio',
      'control no responde',
      'control malo',
      'mando no responde',
      'no puedo cambiar los canales',
    ],
    contenido: [
      'Si el control no funciona o presenta falla: primero revisa la situación (pilas, emparejamiento, si el deco responde).',
      'Si corresponde reemplazo, se gestiona la venta del repuesto Control Remoto.',
      `Costo de referencia del repuesto: ${PRECIO_CONTROL}. Delivery de equipos (si aplica): ${PRECIO_DELIVERY}.`,
      'En Andes: mismo flujo de Catálogo → Control Remoto → Método de Envío → Enviar.',
    ],
    imagenes: IMGS_CR.precio,
    fuente: 'entrenamiento-control-remoto',
  },
  {
    id: 'cr-entrega',
    titulo: 'Método de entrega: Autoinstalación o Visita Técnica',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_ENTREGA',
    sinonimos: [
      'autoinstalacion control',
      'visita tecnica control',
      'como me entregan el control',
      'me lo envian a domicilio',
      'necesito tecnico para el control',
    ],
    contenido: [
      'Para gestionar la venta del control remoto se debe seleccionar el Método de Envío:',
      '· Autoinstalación: el cliente retira/recibe el control sin técnico (despacho/autoinstalación).',
      '· Visita Técnica: técnico va a domicilio a entregar/instalar según el caso.',
      'El cliente puede pedir solo el control; no siempre requiere técnico.',
      `Precios ref.: control ${PRECIO_CONTROL}; delivery equipos ${PRECIO_DELIVERY} si aplica.`,
    ],
    imagenes: IMGS_CR.delivery,
    fuente: 'entrenamiento-control-remoto',
  },
  {
    id: 'cr-cobro',
    titulo: 'Cómo se cobra el Control Remoto',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_COBRO',
    sinonimos: [
      'como se cobra el control',
      'cobro en la boleta control',
      'es cobro mensual o unico',
      'me van a cobrar todos los meses el control',
    ],
    contenido: [
      `El Control Remoto se agrega como cargo no recurrente de referencia ${PRECIO_CONTROL} (repuesto).`,
      'No es un abono mensual como el D-Box: es un cargo asociado a la venta del ítem (confirma tipificación/boleta según procedimiento vigente).',
      `El delivery de equipos (${PRECIO_DELIVERY}) es adicional cuando corresponde envío.`,
      'El cobro queda en el pedido de venta tras Verificar → Generar documento → Enviar.',
    ],
    imagenes: IMGS_CR.precio,
    fuente: 'entrenamiento-control-remoto',
  },
  {
    id: 'cr-siebel',
    titulo: 'Venta Control Remoto en Siebel/Andes (flujo CRM)',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_SIEBEL',
    sinonimos: [
      'como agrego el control en andes',
      'venta control remoto siebel',
      'flujo control remoto crm',
      'paso a paso control remoto',
      'como contrato un control remoto',
      'como solicito el control en andes',
      'agregar control remoto catalogo',
    ],
    contenido: [
      'Flujo venta Control Remoto (Siebel/Andes):',
      '1) Buscar cuenta (Clientes → RUT).',
      '2) Seleccionar nivel Clase Cliente (no Facturación/Servicio).',
      '3) Productos Instalados → seleccionar producto → Modificar.',
      '4) Pedido → pestaña Catálogo.',
      '5) Examinar → Cargos y Descuentos No Recurrentes Fijo → Cargos.',
      `6) Control Remoto (Delivery Control Remoto, ~${PRECIO_CONTROL}) → Agregar ítem.`,
      '7) Detalles: verificar ítem Nuevo y precio neto.',
      '8) Verificar → Método de Envío (Autoinstalación o Visita Técnica) → Generar documento.',
      '9) Revisar dirección/datos → Enviar.',
      `Delivery equipos ref. ${PRECIO_DELIVERY} cuando corresponde despacho.`,
      'Guía completa con capturas: “paso a paso control remoto”.',
    ],
    imagenes: IMGS_CR.siebel,
    fuente: 'entrenamiento-control-remoto',
  },
  {
    id: 'cr-general',
    titulo: 'Control Remoto VTR — consulta general',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    intencion: 'CR_GENERAL',
    sinonimos: [
      'necesito un control remoto',
      'control remoto vtr',
      'control para el deco',
      'control para mi decodificador',
      'venden controles',
      'quiero un control nuevo',
    ],
    contenido: [
      'Sí se puede solicitar un control remoto (repuesto/adicional) desde Contrataciones en Andes.',
      `Precio ref. del control: ${PRECIO_CONTROL}. Delivery equipos: ${PRECIO_DELIVERY} si lo despachan.`,
      'Entrega: Autoinstalación o Visita Técnica según Método de Envío.',
      'Si necesitas el flujo completo en CRM, pregunta “cómo agrego el control en Andes” o “paso a paso control remoto”.',
    ],
    imagenes: IMGS_CR.general,
    fuente: 'entrenamiento-control-remoto',
  },
]

const RESPUESTA_POR_INTENCION = {
  CR_PRECIO: `El control remoto (repuesto) tiene un costo de referencia de ${PRECIO_CONTROL}. Si corresponde despacho, el delivery de equipos suma ${PRECIO_DELIVERY}.`,
  CR_DELIVERY: `El delivery de equipos cuesta ${PRECIO_DELIVERY} adicional. El control en sí es ${PRECIO_CONTROL}.`,
  CR_TOTAL: `Con despacho: control ${PRECIO_CONTROL} + delivery ${PRECIO_DELIVERY} (aprox. ${TOTAL_REF}). Sin despacho, solo el control ${PRECIO_CONTROL}.`,
  CR_PERDIDO: `Si se perdió el control, el repuesto cuesta ${PRECIO_CONTROL}. Con envío a domicilio suma delivery ${PRECIO_DELIVERY}. Se gestiona la venta en Andes (Catálogo → Control Remoto).`,
  CR_DANADO:
    'Si el control no funciona, revisa pilas/emparejamiento y si el deco responde. Si corresponde reemplazo, se vende el repuesto ($6.000; delivery $3.000 si aplica).',
  CR_ENTREGA:
    'Método de Envío: Autoinstalación (sin técnico / despacho) o Visita Técnica (técnico a domicilio). Elige según lo que necesite el cliente.',
  CR_COBRO: `El control es un cargo no recurrente de referencia ${PRECIO_CONTROL} en el pedido (no es abono mensual tipo D-Box). Delivery ${PRECIO_DELIVERY} si aplica.`,
  CR_SIEBEL:
    'En Andes: Clientes → RUT → clase Cliente → Productos Instalados → Modificar → Catálogo → Cargos y Descuentos No Recurrentes Fijo → Cargos → Control Remoto → Agregar ítem → Detalles → Verificar → Método de Envío → Generar documento → Enviar.',
  CR_GENERAL: `Puedes pedir un control remoto/adicional. Precio ref. ${PRECIO_CONTROL}; delivery ${PRECIO_DELIVERY} si lo envían. Entrega por Autoinstalación o Visita Técnica.`,
  CR_ADICIONAL: `Sí, puedes pedir un control adicional. Costo ref. ${PRECIO_CONTROL} (+ delivery ${PRECIO_DELIVERY} si aplica). Se agrega por el mismo flujo de Catálogo en Andes.`,
}

const EJEMPLOS_CR_BASE = [
  {
    pregunta: '¿Cuánto cuesta un control remoto?',
    respuesta: RESPUESTA_POR_INTENCION.CR_PRECIO,
    intencion: 'CR_PRECIO',
  },
  {
    pregunta: 'cuanto sale el control remoto',
    respuesta: RESPUESTA_POR_INTENCION.CR_PRECIO,
    intencion: 'CR_PRECIO',
  },
  {
    pregunta: '¿Cuánto me cobran si perdí el control?',
    respuesta: RESPUESTA_POR_INTENCION.CR_PERDIDO,
    intencion: 'CR_PERDIDO',
  },
  {
    pregunta: '¿Cuánto cuesta el delivery del control?',
    respuesta: RESPUESTA_POR_INTENCION.CR_DELIVERY,
    intencion: 'CR_DELIVERY',
  },
  {
    pregunta: '¿Cuánto tengo que pagar por el control con delivery?',
    respuesta: RESPUESTA_POR_INTENCION.CR_TOTAL,
    intencion: 'CR_TOTAL',
  },
  {
    pregunta: 'son 6000 más 3000 de delivery?',
    respuesta: `Sí: control ${PRECIO_CONTROL} + delivery ${PRECIO_DELIVERY} cuando corresponde despacho.`,
    intencion: 'CR_TOTAL',
  },
  {
    pregunta: '¿Qué pasa si elijo autoinstalación?',
    respuesta:
      'Con Autoinstalación el cliente recibe/retira el control sin visita técnica. Debes seleccionar Autoinstalación en Método de Envío del pedido.',
    intencion: 'CR_ENTREGA',
  },
  {
    pregunta: '¿Puedo solicitar visita técnica para el control?',
    respuesta:
      'Sí. En Método de Envío elige Visita Técnica si el cliente necesita que un técnico vaya a domicilio.',
    intencion: 'CR_ENTREGA',
  },
  {
    pregunta: '¿Cómo puedo comprar un control remoto?',
    respuesta: RESPUESTA_POR_INTENCION.CR_SIEBEL,
    intencion: 'CR_SIEBEL',
  },
  {
    pregunta: '¿Puedo pedir un control adicional?',
    respuesta: RESPUESTA_POR_INTENCION.CR_ADICIONAL,
    intencion: 'CR_ADICIONAL',
  },
  {
    pregunta: 'Perdí el control',
    respuesta: RESPUESTA_POR_INTENCION.CR_PERDIDO,
    intencion: 'CR_PERDIDO',
  },
  {
    pregunta: 'Mi control se rompió',
    respuesta: RESPUESTA_POR_INTENCION.CR_DANADO,
    intencion: 'CR_DANADO',
  },
  {
    pregunta: 'el control no responde',
    respuesta: RESPUESTA_POR_INTENCION.CR_DANADO,
    intencion: 'CR_DANADO',
  },
  {
    pregunta: '¿Cómo se cobra el control remoto?',
    respuesta: RESPUESTA_POR_INTENCION.CR_COBRO,
    intencion: 'CR_COBRO',
  },
  {
    pregunta: 'son 6000 pesos el control?',
    respuesta: `Sí, el precio de referencia del control remoto es ${PRECIO_CONTROL}. Delivery ${PRECIO_DELIVERY} si aplica envío.`,
    intencion: 'CR_PRECIO',
  },
  {
    pregunta: 'el control cuesta 6 lucas?',
    respuesta: `Sí: referencia ${PRECIO_CONTROL} por el control. Despacho aparte ${PRECIO_DELIVERY}.`,
    intencion: 'CR_PRECIO',
  },
  {
    pregunta: 'se me perdió el mando',
    respuesta: RESPUESTA_POR_INTENCION.CR_PERDIDO,
    intencion: 'CR_PERDIDO',
  },
  {
    pregunta: 'el cosito para cambiar los canales se me perdió',
    respuesta: RESPUESTA_POR_INTENCION.CR_PERDIDO,
    intencion: 'CR_PERDIDO',
  },
  {
    pregunta: 'cuanto me cobran por el mando',
    respuesta: RESPUESTA_POR_INTENCION.CR_PRECIO,
    intencion: 'CR_PRECIO',
  },
  {
    pregunta: 'necesito que vaya un técnico',
    respuesta:
      'Si es para llevar/instalar el control, en el pedido selecciona Método de Envío = Visita Técnica. Control $6.000; delivery $3.000 si aplica.',
    intencion: 'CR_ENTREGA',
  },
  {
    pregunta: 'cómo agrego un control a mi cuenta',
    respuesta: RESPUESTA_POR_INTENCION.CR_SIEBEL,
    intencion: 'CR_SIEBEL',
  },
  {
    pregunta: 'quiero que me lo despachen',
    respuesta: RESPUESTA_POR_INTENCION.CR_DELIVERY,
    intencion: 'CR_DELIVERY',
  },
  {
    pregunta: 'es un cobro mensual o único',
    respuesta: RESPUESTA_POR_INTENCION.CR_COBRO,
    intencion: 'CR_COBRO',
  },
  {
    pregunta: 'puedo pedir otro aunque ya tenga uno',
    respuesta: RESPUESTA_POR_INTENCION.CR_ADICIONAL,
    intencion: 'CR_ADICIONAL',
  },
]

const FRASES_REALISTAS = [
  {
    intencion: 'CR_PRECIO',
    frases: [
      'precio del control',
      'cuanto vale un control nuevo',
      'control remoto cuanto cuesta',
      'necesito comprar un control',
      'cuanto sale un control nuevo',
      'control vtr cuanto sale',
      'kuanto sale el control',
      'cuanto sale el contro remoto',
      'precio control',
      'control 6000',
      'son seis mil por el control',
      'cuanto sale el reemplazo',
      'precio control remoto',
      'cuánto cuesta el control remoto',
    ],
  },
  {
    intencion: 'CR_PERDIDO',
    frases: [
      'se me perdió el control',
      'perdí el control de la tele',
      'no encuentro el control remoto',
      'cobran por control perdido',
      'si se me pierde el control cuanto tengo que pagar',
      'cuanto sale reponerlo',
      'se me perdió el control cuanto cuesta',
      'control perdido',
      'no tengo el control',
      'se me extravió el control',
      'qué hago si perdí el control',
      'necesito otro porque lo perdí',
      'perdí el control de vtr',
      'perdi el contro',
      'se me perdio el contro q hago',
      'no encuentro el mando de la tele',
      'se me perdió el control que hago',
      'cuanto sale reponer el control',
    ],
  },
  {
    intencion: 'CR_DELIVERY',
    frases: [
      'cuanto sale el despacho',
      'cobran envío por el control',
      'el delivery del control tiene costo',
      'cuanto cuesta que me lo envíen',
      'quiero que me manden un control a mi casa',
      'cuanto sale el delivery',
      'el envío se paga aparte',
      'control delivery',
      'delivery 3000',
      'los 3000 son por envío',
      'cuanto sale el delivery del contro',
      'me cobran por traerlo a la casa',
      'hacen despacho',
      'tienen delivery',
      'cuanto cobran por despacho',
      'quiero que me manden un control',
    ],
  },
  {
    intencion: 'CR_TOTAL',
    frases: [
      'control más despacho cuanto sale',
      'si compro el control cuánto pago en total',
      'cuanto me sale el control puesto en mi casa',
      'el control cuesta 6000 y el despacho 3000',
      'cuanto son 6 mil más despacho',
    ],
  },
  {
    intencion: 'CR_ENTREGA',
    frases: [
      'puedo pedir el control por autoinstalación',
      'quiero retirar o recibir el control sin técnico',
      'como solicito el control por autoinstalación',
      'puedo pedir solo el control',
      'necesito técnico para instalar un control',
      'quiero el control con visita técnica',
      'como solicito un técnico para instalarlo',
      'puedo pedir visita para cambiar el control',
      'necesito que me lleven e instalen el control',
      'como recibo el control',
      'me lo envían a domicilio',
      'puedo recibirlo en mi casa',
      'donde retiro el control',
      'como me entregan el control',
    ],
  },
  {
    intencion: 'CR_SIEBEL',
    frases: [
      'como contrato un control remoto',
      'dónde solicito un control nuevo',
      'quiero contratar un control',
      'necesito pedir un control nuevo',
      'cómo agrego un control a mi cuenta',
      'puedo comprar otro control',
      'cuáles son los pasos para pedirlo',
      'cómo se compra el control',
      'qué tengo que hacer para pedir un control',
      'dónde puedo solicitarlo',
      'como solicito el control',
      'donde pido el contro',
      'como pido otro mando',
      'paso a paso venta control remoto',
    ],
  },
  {
    intencion: 'CR_ADICIONAL',
    frases: [
      'necesito otro control',
      'quiero un segundo control',
      'puedo tener dos controles',
      'necesito un control extra',
      'cuánto cuesta un control adicional',
      'control adicional',
      'necesito otro contro',
      'puedo pedir otro control',
      'quiero uno nuevo para mi deco',
    ],
  },
  {
    intencion: 'CR_DANADO',
    frases: [
      'el control no funciona',
      'el control dejó de funcionar',
      'se me cayó y ya no funciona',
      'necesito cambiar el control',
      'el control está malo',
      'puedo cambiar un control defectuoso',
      'aprieto los botones y no hace nada',
      'no funciona ningún botón',
      'el control no prende',
      'mi control no funciona',
      'no puedo cambiar los canales con el control',
      'mi control murió',
      'el mando no responde',
      'se me rompió el control',
      'necesito reemplazar el que tengo',
    ],
  },
  {
    intencion: 'CR_GENERAL',
    frases: [
      'necesito un control remoto',
      'quiero un control nuevo',
      'donde consigo un control',
      'tienen controles disponibles',
      'venden controles',
      'necesito reemplazar mi control',
      'control remoto vtr',
      'control para el deco',
      'control para mi decodificador',
      'control remoto',
      'control nuevo',
      'comprar control',
      'necesito control',
      'necesito otro para el deco',
    ],
  },
  {
    intencion: 'CR_COBRO',
    frases: [
      'dónde aparece el cobro',
      'me cobran los 6000 en la boleta',
      'el control se cobra una sola vez',
      'me van a cobrar todos los meses',
    ],
  },
]

function frasesIntencion(id) {
  return (FRASES_REALISTAS.find((b) => b.intencion === id)?.frases || []).map(normFraseKey)
}

for (const doc of DOCS_CONTROL_REMOTO) {
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

export const EJEMPLOS_CONTROL_REMOTO = [
  ...EJEMPLOS_CR_BASE,
  ...ejemplosDesdeFrases(EJEMPLOS_CR_BASE),
]

export function docsEjemplosControlRemotoADocs() {
  const imgsPorIntent = {
    CR_PRECIO: IMGS_CR.precio,
    CR_DELIVERY: IMGS_CR.delivery,
    CR_TOTAL: IMGS_CR.delivery,
    CR_PERDIDO: IMGS_CR.precio,
    CR_DANADO: IMGS_CR.precio,
    CR_ENTREGA: IMGS_CR.delivery,
    CR_COBRO: IMGS_CR.precio,
    CR_SIEBEL: IMGS_CR.siebel,
    CR_GENERAL: IMGS_CR.general,
    CR_ADICIONAL: IMGS_CR.precio,
  }
  return EJEMPLOS_CONTROL_REMOTO.map((ej, i) => {
    const pregNorm = normFraseKey(ej.pregunta)
    const STOP = new Set([
      'que',
      'como',
      'por',
      'para',
      'una',
      'este',
      'esta',
      'tengo',
      'tiene',
      'pero',
      'quiero',
      'cuanto',
      'cual',
      'necesito',
    ])
    const claves = pregNorm
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w))
      .slice(0, 8)
    return {
      id: `cr-ej-${String(i + 1).padStart(3, '0')}`,
      titulo: ej.pregunta.replace(/\?+$/, '').slice(0, 90),
      categoria: 'CONTRATACIONES',
      tipo: 'micro',
      seccionPortal: 'Entrenamiento Control Remoto',
      intencion: ej.intencion,
      sinonimos: [ej.pregunta, pregNorm, ej.intencion, ...claves],
      contenido: [ej.respuesta],
      imagenes: imgsPorIntent[ej.intencion] || IMGS_CONTROL_REMOTO.slice(0, 4),
      fuente: 'entrenamiento-control-remoto-ejemplos',
      ejemploPregunta: ej.pregunta,
    }
  })
}

export function docsControlRemotoCompletos() {
  return [...DOCS_CONTROL_REMOTO, ...docsEjemplosControlRemotoADocs()]
}
