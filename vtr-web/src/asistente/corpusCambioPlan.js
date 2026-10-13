/**
 * Corpus Cambio de Plan: consultas de cliente + asesor (APEX / Andes),
 * finalización (Verificar/TSQ), anulación de trámite previo.
 */

import { IMGS_CP, IMGS_CAMBIO_PLAN } from './assetsGuias.js'

function normFraseKey(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const FLUJO_NORMAL =
  'Andes → Buscar RUT → Seleccionar Cliente → APEX → Buscar oferta → Copiar denominación exacta → Andes → Productos Instalados → Actualizar promoción → Buscar promoción (pegar nombre APEX) → Aceptar → Método de Envío → Validar e-mail → Verificar → TSQ → Generar documento → Enviar.'

const FLUJO_ANULAR =
  'Solo si hay orden previa abierta/fallida/en curso que bloquea: Anular trámite → Motivo Incidencia de trámite → Confirmar → Liberar línea → luego continuar el cambio de plan. El paso de anulación NO es del flujo normal.'

export const DOCS_CAMBIO_PLAN = [
  {
    id: 'cp-cliente',
    titulo: 'Cambio de plan — consulta del cliente',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan',
    intencion: 'CAMBIO_PLAN_CLIENTE',
    sinonimos: [
      'quiero cambiarme de plan',
      'cambio de plan',
      'quiero mas megas',
      'quiero pagar menos',
      'quiero pasarme a fibra',
      'quiero subir de plan',
      'quiero bajar mi plan',
    ],
    contenido: [
      'El cliente puede solicitar cambio de plan (subir/bajar velocidad, fibra, otro pack).',
      'El asesor consulta ofertas en APEX, copia la denominación exacta y gestiona Actualizar promoción en Andes.',
      'Servicios actuales (TV, telefonía, etc.): se evalúa según el nuevo plan; el cliente puede pedir mantener TV u otros servicios según oferta.',
      'El valor mensual depende del plan elegido (catálogo Planes / APEX).',
      FLUJO_NORMAL,
    ],
    imagenes: IMGS_CP.general,
    fuente: 'entrenamiento-cambio-plan',
  },
  {
    id: 'cp-velocidad',
    titulo: 'Cambio de plan — velocidad / megas / fibra',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan',
    intencion: 'CAMBIO_PLAN_VELOCIDAD',
    sinonimos: [
      'quiero aumentar la velocidad',
      'puedo cambiarme a 600 megas',
      'quiero fibra de 600',
      'quiero mas velocidad',
      'cambiar de 300 a 600',
      'quiero bajar la velocidad',
    ],
    contenido: [
      'Para subir o bajar velocidad: busca la oferta en APEX (ej. Fibra 600 Megas), copia el nombre oficial (ej. Fibra Hogar Residencial 0226F) y aplícalo con Actualizar promoción en Andes.',
      'Confirma cobertura/viabilidad y precio del plan en el catálogo vigente.',
      'Luego: Método de Envío → Validar e-mail → Verificar → TSQ → Generar documento → Enviar.',
    ],
    imagenes: IMGS_CP.apex,
    fuente: 'entrenamiento-cambio-plan',
  },
  {
    id: 'cp-apex',
    titulo: 'Cambio de plan — consultar oferta en APEX',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan → APEX',
    intencion: 'CAMBIO_PLAN_APEX',
    sinonimos: [
      'donde consulto el plan en apex',
      'como busco el plan en apex',
      'nombre oficial del plan',
      'copiar denominacion apex',
      'denominacion exacta',
    ],
    contenido: [
      'En APEX (sección Planes) busca la oferta (ej. Fibra 600 Megas).',
      'Abre el detalle de la tarjeta y copia la denominación exacta (ej. Fibra Hogar Residencial 0226F).',
      'Ese nombre exacto se pega en Andes en “Nombre de la promoción”. No uses solo “Fibra 600” si el sistema exige la denominación completa.',
      'De APEX sacas: nombre oficial, precio/condiciones visibles de la oferta.',
    ],
    imagenes: IMGS_CP.apex,
    fuente: 'entrenamiento-cambio-plan',
  },
  {
    id: 'cp-andes',
    titulo: 'Cambio de plan — Actualizar promoción en Andes',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan → Andes',
    intencion: 'CAMBIO_PLAN_ANDES',
    sinonimos: [
      'actualizar promocion',
      'como cambio la promocion en andes',
      'donde esta actualizar promocion',
      'productos instalados cambiar plan',
      'pegar nombre apex en andes',
    ],
    contenido: [
      'Andes: Clientes → RUT → seleccionar clase Cliente (no Facturación ni Servicio).',
      'Productos Instalados → selecciona la línea activa → Actualizar promoción.',
      'En Nombre de la promoción: pega el nombre exacto de APEX → selecciona resultado → Aceptar.',
      'Luego continúa con Método de Envío, e-mail, Verificar, TSQ, Generar documento y Enviar.',
    ],
    imagenes: IMGS_CP.andes,
    fuente: 'entrenamiento-cambio-plan',
  },
  {
    id: 'cp-cuenta',
    titulo: 'Cambio de plan — buscar RUT y cuenta Cliente',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan',
    intencion: 'CAMBIO_PLAN_CUENTA',
    sinonimos: [
      'como busco al cliente en andes',
      'selecciono facturacion o cliente',
      'cuenta clase cliente',
      'debo entrar por servicio o cliente',
    ],
    contenido: [
      'Pestaña Clientes → busca por RUT → Enter.',
      'En columna Clase abre el RUT de nivel Cliente (primera fila típica).',
      'No uses Facturación ni Servicio para iniciar el cambio de plan.',
    ],
    imagenes: IMGS_CP.cuenta,
    fuente: 'entrenamiento-cambio-plan',
  },
  {
    id: 'cp-finalizacion',
    titulo: 'Cambio de plan — Método de Envío, Verificar, TSQ, Enviar',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan',
    intencion: 'CAMBIO_PLAN_FINALIZACION',
    sinonimos: [
      'verificar tsq',
      'despues de actualizar que hago',
      'generar documento cambio plan',
      'metodo de envio cambio plan',
      'validar correo cliente',
      'cuando presiono enviar',
    ],
    contenido: [
      'Después de Aceptar la promoción:',
      '1) Método de Envío (Autoinstalación o Visita Técnica según corresponda).',
      '2) Validar e-mail del cliente (corregir si está mal).',
      '3) Verificar → luego TSQ (en ese orden).',
      '4) Generar documento.',
      '5) Enviar para cerrar la gestión.',
    ],
    imagenes: IMGS_CP.finalizacion,
    fuente: 'entrenamiento-cambio-plan',
  },
  {
    id: 'cp-anular',
    titulo: 'Anular cambio de plan / liberar línea (trámite previo)',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan',
    intencion: 'ANULAR_CAMBIO_PLAN',
    sinonimos: [
      'anular cambio de plan',
      'pedido fallido',
      'trámite abierto',
      'liberar la linea',
      'incidencia de tramite',
      'orden anterior en curso',
    ],
    contenido: [
      FLUJO_ANULAR,
      'Motivo típico: Incidencia de trámite → CONFIRMAR.',
      'Solo se usa si un pedido anterior bloquea el nuevo cambio.',
    ],
    imagenes: IMGS_CP.anular,
    fuente: 'entrenamiento-cambio-plan',
  },
  {
    id: 'cp-flujo',
    titulo: 'Cambio de plan — flujo completo (resumen)',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan',
    intencion: 'CAMBIO_PLAN_FLUJO',
    sinonimos: [
      'paso a paso cambio de plan',
      'procedimiento cambio de plan',
      'como se realiza un cambio de plan',
      'como se modifica una promocion',
    ],
    contenido: [
      'Flujo normal:',
      FLUJO_NORMAL,
      FLUJO_ANULAR,
      'Guía con capturas: “paso a paso cambio de plan”.',
    ],
    imagenes: IMGS_CP.general,
    fuente: 'entrenamiento-cambio-plan',
  },
  {
    id: 'cp-servicios',
    titulo: 'Cambio de plan — mantener TV / telefonía / servicios',
    categoria: 'CONTRATACIONES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Cambio de Plan',
    intencion: 'CAMBIO_PLAN_SERVICIOS',
    sinonimos: [
      'pierdo mis servicios',
      'mantener mi tv',
      'cambiar internet sin perder television',
      'mantengo mi telefono',
      'puedo cambiar solo el internet',
    ],
    contenido: [
      'Depende del plan nuevo: algunos packs mantienen o incluyen TV/telefonía; otros son solo internet.',
      'Revisa en APEX qué incluye la oferta antes de Actualizar promoción.',
      'Si el cliente quiere mantener TV, elige una oferta que la contemple (ej. packs 2P/3P / TV Full según catálogo).',
    ],
    imagenes: IMGS_CP.general,
    fuente: 'entrenamiento-cambio-plan',
  },
]

const RESPUESTA_POR_INTENCION = {
  CAMBIO_PLAN_CLIENTE:
    'Puedes solicitar un cambio de plan. El asesor busca la oferta en APEX, copia el nombre exacto y lo aplica en Andes con Actualizar promoción. Luego Verificar → TSQ → Generar documento → Enviar.',
  CAMBIO_PLAN_VELOCIDAD:
    'Para cambiar velocidad (ej. a 600 megas): oferta en APEX → copiar denominación exacta → Andes Actualizar promoción → Método de Envío → e-mail → Verificar → TSQ → Generar documento → Enviar.',
  CAMBIO_PLAN_APEX:
    'En APEX → Planes → busca la oferta → abre el detalle → copia la denominación exacta (ej. Fibra Hogar Residencial 0226F). Ese nombre se pega en Andes.',
  CAMBIO_PLAN_ANDES:
    'Andes: RUT → clase Cliente → Productos Instalados → Actualizar promoción → pegar nombre de APEX → Aceptar → continuar con Método de Envío / Verificar / TSQ / Generar documento / Enviar.',
  CAMBIO_PLAN_CUENTA:
    'Busca por RUT en Clientes y abre la cuenta clase Cliente. No uses Facturación ni Servicio para el cambio de plan.',
  CAMBIO_PLAN_FINALIZACION:
    'Tras Aceptar la promoción: Método de Envío → validar e-mail → Verificar → TSQ → Generar documento → Enviar.',
  ANULAR_CAMBIO_PLAN: FLUJO_ANULAR,
  CAMBIO_PLAN_FLUJO: FLUJO_NORMAL + ' ' + FLUJO_ANULAR,
  CAMBIO_PLAN_SERVICIOS:
    'Revisa en APEX si el nuevo plan mantiene TV/fono. Puedes cambiar solo internet eligiendo una oferta 1P, o un pack que incluya TV si quieres conservarla.',
  CAMBIO_PLAN_PRECIO:
    'El valor depende del plan nuevo en el catálogo APEX/Planes. Confirma precio promo/lista de la oferta antes de Actualizar promoción. El cambio en sí se gestiona en Andes; confirma si hay cargos adicionales según caso.',
}

const EJEMPLOS_CP_BASE = [
  {
    pregunta: '¿Cómo cambio mi plan?',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_CLIENTE,
    intencion: 'CAMBIO_PLAN_CLIENTE',
  },
  {
    pregunta: 'quiero cambiarme de plan',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_CLIENTE,
    intencion: 'CAMBIO_PLAN_CLIENTE',
  },
  {
    pregunta: 'quiero más megas',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_VELOCIDAD,
    intencion: 'CAMBIO_PLAN_VELOCIDAD',
  },
  {
    pregunta: 'puedo cambiarme a 600 megas',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_VELOCIDAD,
    intencion: 'CAMBIO_PLAN_VELOCIDAD',
  },
  {
    pregunta: '¿Dónde consulto el nuevo plan?',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_APEX,
    intencion: 'CAMBIO_PLAN_APEX',
  },
  {
    pregunta: '¿Qué nombre debo copiar desde APEX?',
    respuesta:
      'La denominación exacta del detalle de la tarjeta en APEX (ej. Fibra Hogar Residencial 0226F). No alcanza con “Fibra 600” si Andes pide el nombre completo.',
    intencion: 'CAMBIO_PLAN_APEX',
  },
  {
    pregunta: '¿Dónde está actualizar promoción?',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_ANDES,
    intencion: 'CAMBIO_PLAN_ANDES',
  },
  {
    pregunta: 'selecciono facturación o cliente',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_CUENTA,
    intencion: 'CAMBIO_PLAN_CUENTA',
  },
  {
    pregunta: 'primero va verificar o TSQ',
    respuesta: 'Primero Verificar y luego TSQ. Después Generar documento y Enviar.',
    intencion: 'CAMBIO_PLAN_FINALIZACION',
  },
  {
    pregunta: '¿Qué hago si el cambio de plan quedó fallido?',
    respuesta: RESPUESTA_POR_INTENCION.ANULAR_CAMBIO_PLAN,
    intencion: 'ANULAR_CAMBIO_PLAN',
  },
  {
    pregunta: 'puedo seleccionar incidencia de trámite',
    respuesta:
      'Sí, Motivo: Incidencia de trámite → CONFIRMAR para liberar la línea, solo si hay pedido previo que bloquea.',
    intencion: 'ANULAR_CAMBIO_PLAN',
  },
  {
    pregunta: 'Si cambio de plan, ¿pierdo mis servicios?',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_SERVICIOS,
    intencion: 'CAMBIO_PLAN_SERVICIOS',
  },
  {
    pregunta: 'cuanto me queda si me cambio',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_PRECIO,
    intencion: 'CAMBIO_PLAN_PRECIO',
  },
  {
    pregunta: 'me cobran por cambiar de plan',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_PRECIO,
    intencion: 'CAMBIO_PLAN_PRECIO',
  },
  {
    pregunta: 'paso a paso cambio de plan',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_FLUJO,
    intencion: 'CAMBIO_PLAN_FLUJO',
  },
  {
    pregunta: 'tengo que revisar el email del cliente',
    respuesta:
      'Sí: valida el e-mail en el pedido antes de Verificar/TSQ/Generar documento/Enviar. Si está incorrecto, corrígelo.',
    intencion: 'CAMBIO_PLAN_FINALIZACION',
  },
  {
    pregunta: 'quiero cambiarme pero mantener mi tv',
    respuesta: RESPUESTA_POR_INTENCION.CAMBIO_PLAN_SERVICIOS,
    intencion: 'CAMBIO_PLAN_SERVICIOS',
  },
  {
    pregunta: 'quiero pagar menos',
    respuesta:
      'Busca en APEX un plan más económico (bajar velocidad o pack). Copia la denominación exacta y aplícala con Actualizar promoción en Andes.',
    intencion: 'CAMBIO_PLAN_CLIENTE',
  },
]

const FRASES_REALISTAS = [
  {
    intencion: 'CAMBIO_PLAN_CLIENTE',
    frases: [
      'quiero otro plan',
      'necesito cambiar mi plan',
      'como puedo cambiar de plan',
      'quiero pasarme a otro plan',
      'puedo cambiar mi plan actual',
      'cambio plan vtr',
      'quiero modificar mi plan',
      'como cambio mi plan',
      'puedo cambiarme de plan',
      'necesito otro plan',
      'me quiero cambiar de plan',
      'quiero un plan diferente',
      'quiero ver otros planes',
      'qué opciones tengo para cambiarme',
      'mi plan ya no me sirve quiero otro',
      'puedo cambiar mi plan ahora',
      'quiero otro plan de internet',
      'quiero contratar el plan que tiene mas velocidad',
    ],
  },
  {
    intencion: 'CAMBIO_PLAN_VELOCIDAD',
    frases: [
      'quiero una velocidad mas alta',
      'quiero contratar una velocidad mayor',
      'tienen planes de 600 megas',
      'quiero cambiar de 300 a 600 megas',
      'quiero cambiar la velocidad',
      'quiero cambiarme al de 600',
      'quiero un plan mas rapido',
      'quiero pasarme a fibra',
      'quiero subir de plan',
      'quiero bajar mi plan',
      'puedo cambiarme a un plan mas economico',
    ],
  },
  {
    intencion: 'CAMBIO_PLAN_APEX',
    frases: [
      'como busco el plan en apex',
      'donde veo la oferta en apex',
      'como encuentro el plan de 600 megas en apex',
      'donde aparece el nombre oficial del plan',
      'tengo que buscar el plan en apex',
      'que informacion saco de apex',
      'tengo que copiar el nombre completo',
      'cual es la denominacion del plan',
      'que nombre pongo en andes',
      'debo usar el nombre exacto de apex',
      'puedo escribir solamente fibra 600',
      'donde saco la denominacion exacta',
    ],
  },
  {
    intencion: 'CAMBIO_PLAN_ANDES',
    frases: [
      'donde hago el cambio en andes',
      'como cambio la promocion en andes',
      'como busco la promocion del cliente',
      'donde modifico el producto instalado',
      'que producto tengo que seleccionar',
      'como actualizo la promocion',
      'selecciono el producto actual y pongo actualizar',
      'como reemplazo la promocion actual',
      'donde pongo el nombre del plan',
      'puedo pegar el nombre de apex',
      'como encuentro la promocion',
    ],
  },
  {
    intencion: 'CAMBIO_PLAN_CUENTA',
    frases: [
      'donde ingreso el rut',
      'como busco por rut',
      'que cuenta debo seleccionar',
      'cual rut tengo que abrir',
      'tengo que seleccionar cliente',
      'selecciono la cuenta de facturacion',
      'cual es la cuenta correcta en andes',
      'debo entrar por servicio o cliente',
    ],
  },
  {
    intencion: 'CAMBIO_PLAN_FINALIZACION',
    frases: [
      'que metodo de envio debo seleccionar',
      'cuando selecciono visita tecnica',
      'puedo poner autoinstalacion',
      'por que debo validar el correo',
      'donde valido el correo',
      'hay que confirmar el email antes de enviar',
      'despues de actualizar que hago',
      'tengo que hacer verificar',
      'cuando presiono tsq',
      'cuando genero el documento',
      'como genero el documento',
      'donde envio la orden',
      'como cierro la gestion',
      'cuando presiono enviar',
      'que hago despues de aplicar la promocion',
    ],
  },
  {
    intencion: 'ANULAR_CAMBIO_PLAN',
    frases: [
      'me quedo un tramite abierto',
      'hay un pedido anterior en curso',
      'no puedo hacer otro cambio porque hay una orden pendiente',
      'tengo un cambio anterior abierto',
      'como libero la linea',
      'como anulo un cambio de plan',
      'como cancelo una orden anterior',
      'tengo que anular un tramite',
      'donde cancelo el pedido fallido',
      'que motivo selecciono para anular',
      'puedo seleccionar incidencia de tramite',
      'tengo que presionar confirmar',
      'como confirmo la cancelacion',
    ],
  },
  {
    intencion: 'CAMBIO_PLAN_SERVICIOS',
    frases: [
      'voy a mantener mi tv si cambio de plan',
      'puedo cambiar internet sin perder television',
      'que pasa con mis servicios actuales',
      'mantengo mi telefono',
      'el cambio afecta mis servicios',
      'puedo cambiar solo el internet',
    ],
  },
  {
    intencion: 'CAMBIO_PLAN_PRECIO',
    frases: [
      'cuanto voy a pagar con el nuevo plan',
      'cuanto sale el nuevo plan',
      'cuanto me va a quedar pagando',
      'cambia el precio si cambio de plan',
      'cuanto cuesta cambiarme',
      'el cambio de plan tiene costo',
    ],
  },
  {
    intencion: 'CAMBIO_PLAN_FLUJO',
    frases: [
      'como se realiza un cambio de plan',
      'cuales son los pasos para cambiar el plan',
      'como hago el cambio',
      'que tengo que hacer para cambiarme',
      'como se gestiona el cambio',
      'como se modifica una promocion',
      'cual es el procedimiento',
      'que planes puedo contratar',
      'que planes tienen disponibles',
    ],
  },
]

function frasesIntencion(id) {
  return (FRASES_REALISTAS.find((b) => b.intencion === id)?.frases || []).map(normFraseKey)
}

for (const doc of DOCS_CAMBIO_PLAN) {
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

export const EJEMPLOS_CAMBIO_PLAN = [...EJEMPLOS_CP_BASE, ...ejemplosDesdeFrases(EJEMPLOS_CP_BASE)]

export function docsEjemplosCambioPlanADocs() {
  const imgsPorIntent = {
    CAMBIO_PLAN_CLIENTE: IMGS_CP.general,
    CAMBIO_PLAN_VELOCIDAD: IMGS_CP.apex,
    CAMBIO_PLAN_APEX: IMGS_CP.apex,
    CAMBIO_PLAN_ANDES: IMGS_CP.andes,
    CAMBIO_PLAN_CUENTA: IMGS_CP.cuenta,
    CAMBIO_PLAN_FINALIZACION: IMGS_CP.finalizacion,
    ANULAR_CAMBIO_PLAN: IMGS_CP.anular,
    CAMBIO_PLAN_FLUJO: IMGS_CP.general,
    CAMBIO_PLAN_SERVICIOS: IMGS_CP.general,
    CAMBIO_PLAN_PRECIO: IMGS_CP.apex,
  }
  return EJEMPLOS_CAMBIO_PLAN.map((ej, i) => {
    const pregNorm = normFraseKey(ej.pregunta)
    const STOP = new Set(['que', 'como', 'por', 'para', 'una', 'este', 'esta', 'tengo', 'quiero', 'cuanto'])
    const claves = pregNorm
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w))
      .slice(0, 8)
    return {
      id: `cp-ej-${String(i + 1).padStart(3, '0')}`,
      titulo: ej.pregunta.replace(/\?+$/, '').slice(0, 90),
      categoria: 'CONTRATACIONES',
      tipo: 'micro',
      seccionPortal: 'Entrenamiento Cambio de Plan',
      intencion: ej.intencion,
      sinonimos: [ej.pregunta, pregNorm, ej.intencion, ...claves],
      contenido: [ej.respuesta],
      imagenes: imgsPorIntent[ej.intencion] || IMGS_CAMBIO_PLAN.slice(0, 4),
      fuente: 'entrenamiento-cambio-plan-ejemplos',
      ejemploPregunta: ej.pregunta,
    }
  })
}

export function docsCambioPlanCompletos() {
  return [...DOCS_CAMBIO_PLAN, ...docsEjemplosCambioPlanADocs()]
}
