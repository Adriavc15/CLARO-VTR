/**
 * Índice de conocimiento del portal Apex.
 * Se usa en local (bundle) y se puede sincronizar a Firestore → colección conocimiento_portal.
 */
import {
  controlRemotoPasos,
  cambioPlanPasos,
  dboxPasos,
  asistenciaVtrPasos,
  CONTROL_REMOTO_IMG_BASE,
  CAMBIO_PLAN_IMG_BASE,
  DBOX_PASOS_IMG_BASE,
  ASISTENCIA_VTR_IMG_BASE,
} from './guiasPortal.js'
import { MICRO_PASOS } from './casuisticas.js'
import { DOCS_INCONVENIENTE_PAGO } from './procedimientoPago.js'
import { DOCS_TRASLADO_SERVICIOS } from './procedimientoTraslado.js'
import { DOCS_CAMBIO_TITULAR } from './procedimientoCambioTitular.js'
import { DOCS_INTERNET_FTTH_HFC } from './procedimientoInternetFtthHfc.js'
import { DOCS_BOLETA_AGOSTO } from './boletaAgosto.js'
import { DOCS_FIESTAS_PATRIAS } from './fiestasPatrias.js'
import { SUCURSALES_HORARIOS } from './sucursalesHorarios.js'
import { docsDialogoGoogleParaConocimiento } from './dialogosGoogle.js'
import { docsCorpusCotidianosParaConocimiento } from './corpusDialogosCotidianos.js'
import { docsPlanesYStreaming } from './catalogoPlanesStreaming.js'
import { docsOntFtthCompletos } from './corpusOntFtth.js'
import { docsStreamingComercialCompletos } from './corpusStreamingComercial.js'
import { docsControlRemotoCompletos } from './corpusControlRemoto.js'
import { docsCambioPlanCompletos } from './corpusCambioPlan.js'
import { docsDboxCompletos } from './corpusDbox.js'
import { DOCS_FAQ_AMPLIADAS } from './faqAmpliadas.js'

const flattenPasoItems = (paso) => {
  const out = []
  if (paso.intro) out.push(paso.intro)
  for (const it of paso.items || []) {
    if (typeof it === 'string') out.push(it)
  }
  for (const it of paso.orderedItems || []) {
    if (typeof it === 'string') out.push(it)
    else if (it?.text) {
      out.push(it.text)
      for (const s of it.subItems || []) out.push(`  - ${s}`)
    }
  }
  if (paso.ejemplo?.titulo) out.push(paso.ejemplo.titulo)
  for (const linea of paso.ejemplo?.lineas || []) out.push(linea)
  return out
}

/** Ruta pública usable en <img> (espacios → %20) */
const urlAsset = (base, file) => {
  const raw = `${String(base || '').replace(/\/$/, '')}/${String(file || '').replace(/^\//, '')}`
  return raw
    .split('/')
    .map((seg, i) => (i === 0 && seg === '' ? '' : encodeURIComponent(seg)))
    .join('/')
}

const guiaDesdePasos = ({ id, titulo, seccionPortal, sinonimos, pasos, extras = [], imgBaseDefault }) => {
  const contenido = []
  const imagenes = []
  for (const p of pasos) {
    contenido.push(`${p.paso}: ${p.titulo}`)
    for (const line of flattenPasoItems(p)) contenido.push(line)
    const base = p.imgBase || imgBaseDefault
    for (const img of p.imgs || []) {
      if (!base || !img) continue
      imagenes.push(urlAsset(base, img))
    }
  }
  for (const e of extras) contenido.push(e)
  return {
    id,
    titulo,
    categoria: 'ANDES',
    tipo: 'guia',
    seccionPortal,
    sinonimos,
    contenido,
    imagenes: [...new Set(imagenes)],
    fuente: 'portal-contrataciones',
  }
}

/** Mapa de secciones del menú del portal (qué hay y para qué sirve) */
export const SECCIONES_PORTAL = [
  {
    id: 'sec-inicio',
    titulo: 'Inicio / Dashboard',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Inicio',
    sinonimos: ['inicio', 'dashboard', 'home', 'principal'],
    contenido: [
      'Pantalla de inicio del portal Apex con accesos rápidos a sistemas y herramientas del asesor.',
      'Desde aquí puedes ir a Noticias, Omnia, Credenciales, Aplicaciones, Planes, Modem, Visita Técnica, etc.',
    ],
  },
  {
    id: 'sec-noticias',
    titulo: 'Noticias del portal',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Noticias',
    sinonimos: ['noticias', 'comunicados', 'avisos', 'actualizaciones'],
    contenido: [
      'Sección de noticias y comunicados internos publicados desde el panel admin.',
      'Las noticias viven en Firestore (colección noticias) y se muestran en la intranet.',
      'El asistente IA también puede usar títulos y textos de noticias recientes como contexto.',
    ],
  },
  {
    id: 'sec-planes',
    titulo: 'Planes (fibra y TV)',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Planes',
    sinonimos: ['planes', 'fibra', 'megas', 'oferta comercial', 'pack', '1p', '2p', '3p'],
    contenido: [
      'Catálogo comercial del portal: planes de fibra y TV con nombres oficiales para Andes.',
      'Fibra 600 Megas → Andes: Fibra Hogar.',
      'Fibra 800 Megas → Andes: Fibra Avanzado.',
      'Fibra 940 Megas → Andes: Fibra Experto.',
      'Internet 500 Megas es la línea HFC (no fibra): Andes Internet Hogar.',
      'Los planes VTR se separan por red: HFC (Internet 500 Megas) y Fibra Óptica FTTH (600 / 800 / 940 Megas). El catálogo Claro también separa HFC de FTTH.',
      'TVN Play, OndaMedia y Storytel son plataformas exclusivas de Claro.',
      'VTR TV Inicia: 74 canales (57 HD). VTR TV Premium / Premium 2 / Full: 101 canales (84 HD).',
      'Claro TV Inicia: 77 canales (66 HD). Claro TV Premium / Premium 2 / Full: 74 canales (68 HD).',
      'Para cambio de plan: copia el nombre exacto del plan en APEX y pégalo en Actualizar promoción en Andes.',
      'Pregunta por un plan concreto o escribe “planes” para ver categorías.',
    ],
  },
  {
    id: 'sec-streaming',
    titulo: 'Streaming y plataformas',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Streaming',
    sinonimos: ['streaming', 'netflix', 'disney', 'hbo', 'ott', 'plataformas', 'crunchyroll', 'tnt sports'],
    contenido: [
      'Sección Streaming del portal: plataformas (Netflix, Disney+, Crunchyroll, HBO Max, TNT Sports, etc.) y ofertas asociadas a packs.',
      'Activación desde sucursal virtual; si falla y el plan lo incluye → transferir a OTT.',
      'Úsala para consultar qué streaming va con cada plan comercial visible en Apex.',
    ],
  },
  {
    id: 'sec-modem',
    titulo: 'Modem / problemas de modem',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Modem',
    sinonimos: ['modem', 'módem', 'router', 'luz roja', 'gateway', 'extensor'],
    contenido: [
      'Sección Modem del portal: apoyo visual y guías para problemas de modem (ej. luz en rojo) y extensor.',
      'Complementa con el asistente de pasos técnicos (sección Pasos) si el flujo lo requiere.',
    ],
  },
  {
    id: 'sec-visita',
    titulo: 'Visita Técnica',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Pasos → Visita Técnica',
    sinonimos: [
      'visita tecnica',
      'tecnico',
      'agendar visita',
      'generar visita',
      'no ve tv',
      'sin senal tv',
      'cliente no ve television',
    ],
    contenido: [
      'En Pasos, botón Visita Técnica: cómo generar la visita en Andes.',
      'Ingresa el RUT del cliente. Entra a Cliente y verifica la dirección del servicio y el código de la boleta.',
      'Vuelve a ingresar el RUT y busca la facturación con ese código de boleta y esa dirección.',
      'Ingresa a esa cuenta de servicio del cliente (no la de facturación).',
      'Ve a Solicitudes de Servicio, da clic y completa los campos de abajo.',
    ],
  },
  {
    id: 'sec-inhibicion',
    titulo: 'Inhibición de cobranza',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Pasos → Inhibición',
    sinonimos: ['inhibicion', 'cobranza', 'inhibir'],
    contenido: [
      'En Pasos, botón Inhibición: guía de 5 pasos para inhibir el flujo de cobranza (6 días contando desde el día siguiente).',
      'IMPORTANTE: la reactivación del servicio será de 15 minutos a 2 horas como máximo.',
      'Paso 1: ingresa el RUT del cliente en Andes y selecciona la cuenta de Facturación.',
      'Paso 2: en Perfil del Cliente, entra a Perfil.',
      'Paso 3: selecciona el campo Fecha de Inhibición.',
      'Paso 4: abre el calendario, selecciona 6 días de plazo contando desde el día siguiente y clic en Terminado.',
      'Paso 5: clic en Guardar. Cuando “Enviar Inhibición” se ponga azul, presiona ese botón. Así queda generado el plazo / extensión de fecha de pago.',
    ],
  },
  {
    id: 'sec-contrataciones',
    titulo: 'Contrataciones Andes',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Contrataciones',
    sinonimos: [
      'contrataciones',
      'contratacion',
      'andes',
      'pedidos',
      'control remoto',
      'dbox',
      'cambio de plan',
      'asistencia vtr',
      'ubicacion wifi',
    ],
    contenido: [
      'Sección Contrataciones del portal: Asistencia VTR, Control Remoto, Cambio de Plan, D-Box y Ubicación WiFi.',
      'Guías paso a paso con capturas de pantalla para Control Remoto, Cambio de Plan y D-Box.',
      'Costos de referencia: Control Remoto $6.000; Delivery equipos $3.000; D-Box Smart II ~$2.990/mes; Asistencia VTR $1.990/mes.',
      'Siempre selecciona la clase Cliente (no Facturación ni Servicio) al buscar por RUT.',
    ],
  },
  {
    id: 'guia-asistencia-vtr',
    titulo: 'Asistencia VTR (contratación y cobertura)',
    categoria: 'ANDES',
    tipo: 'guia',
    seccionPortal: 'Contrataciones → Asistencia VTR',
    sinonimos: [
      'asistencia vtr',
      'asistencia',
      'sva asistencia',
      'que cubre asistencia vtr',
      'cubre asistencia',
      'cobertura asistencia vtr',
      'quien puede contratar asistencia vtr',
      'quién puede contratar asistencia vtr',
      'requisitos asistencia vtr',
      'titular asistencia vtr',
      'visita tecnica 20000',
      'red interior',
    ],
    contenido: [
      'Asistencia VTR cubre inconvenientes técnicos o necesidades con la red interior de los servicios VTR.',
      'Solo el titular (o tercero con poder notarial) puede contratar; en sucursal presentar CI; en Call Center validar serie CI en registrocivil.cl.',
      'Clientes sin Asistencia VTR con falla que requiera visita: informar cobro $20.000 si el cliente consulta; también se puede ofrecer Asistencia VTR y queda cubierta la reparación.',
      'No inducir a pedir la baja tras usar el servicio ni decir que puede pedir técnico cuando quiera sin costo.',
      'Disponible solo para clientes residenciales. Cubre extensiones teléfono/TV VTR (máx. 4 puntos teléfono y 4 bocas TV).',
      'No incluye: equipos propios del cliente, cables de otras compañías, d-BOX por extensión ni renta, ni instalación de extensor WiFi.',
      'Facturación: primera boleta con proporcional de $1.990 según fecha de contratación + mes completo siguiente.',
      'Verificar precondiciones: el servicio debe estar activo y no estar en cobranza.',
      'Gestión (proceso de ingreso): busca al cliente en Clientes por RUT → entra a la cuenta de clase Cliente (no Facturación ni Servicio) → Productos Instalados Modificar → Editar promoción → en Asistencia VTR Agregar y Terminado → Comentarios (modificación, lo informado y costos) → Generar documento (marcar envío al correo y verificar) → Enviar → informar costos: $1.990/mes; primera boleta = proporcional + mes siguiente completo (ejemplo día 15: $1.060 + $1.990 = $3.050).',
      'Informa: detalle del cambio, valor SVA, descuentos y vigencia, proporcionales de próxima boleta.',
      'Registra: Atención Comercial → Info cuenta servic oferta plat → SVA caract. Nombre, motivo, información entregada y gestión realizada.',
    ],
    imagenes: [],
    fuente: 'portal-contrataciones',
  },
  {
    id: 'guia-wifi-dbox',
    titulo: 'Ubicación WiFi del D-Box',
    categoria: 'ANDES',
    tipo: 'guia',
    seccionPortal: 'Contrataciones → Ubicación WiFi',
    sinonimos: ['ubicacion wifi', 'wifi dbox', 'distancia dbox', 'router dbox', 'wifi d-box'],
    contenido: [
      'El D-Box debe ubicarse a máximo ~10 metros del router WiFi (varía según paredes; paredes gruesas/metálicas reducen alcance).',
      'No colocar el D-Box cerca o al costado del router: puede interferir la señal WiFi hacia otros dispositivos.',
      'Para probar velocidad puedes usar Fast.com (WiFi / Ethernet).',
    ],
    imagenes: ['/descarga-1-1-removebg-preview.png', '/Grupo_3051.png.webp'],
    fuente: 'portal-contrataciones',
  },
  {
    id: 'sec-credenciales',
    titulo: 'Accesos internos',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Aplicaciones',
    sinonimos: ['credenciales', 'usuarios', 'claves', 'windows', 'genesys', 'vsight'],
    contenido: [
      'Los accesos a sistemas internos no se publican en el portal.',
      'El asistente NO debe inventar ni revelar contraseñas.',
    ],
  },
  {
    id: 'sec-aplicaciones',
    titulo: 'Aplicaciones / enlaces rápidos',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Aplicaciones',
    sinonimos: ['aplicaciones', 'links', 'enlaces', 'accesos'],
    contenido: [
      'Sección Aplicaciones: accesos rápidos a herramientas externas usadas por el asesor.',
    ],
  },
  {
    id: 'sec-plantillas',
    titulo: 'Plantillas N1Q / tipificaciones',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Plantillas',
    sinonimos: ['plantillas', 'n1q', 'tipificacion', 'speech', 'copiar plantilla'],
    contenido: [
      'Sección Plantillas: textos listos para copiar (tipificaciones / N1Q) según el caso de atención.',
    ],
  },
  {
    id: 'sec-pasos',
    titulo: 'Asistente de pasos técnicos',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'Pasos',
    sinonimos: ['pasos', 'flujo tecnico', 'sin internet', 'tv', 'troubleshooting', 'inhibicion', 'visita tecnica'],
    contenido: [
      'Sección Pasos: asistente interactivo de diagnóstico (internet, TV, degradado, boleta), Inhibición de cobranza y Visita Técnica.',
      'Úsalo cuando el caso sea técnico y no solo contratación Andes.',
    ],
  },
  {
    id: 'sec-ids',
    titulo: 'IDs Clave VTR (índice del portal)',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'IDs Clave VTR',
    sinonimos: ['ids', 'id clave', 'procedimientos', 'buscar id'],
    contenido: [
      'Listado de IDs de procedimientos visibles en el portal (PEDIDOS, TRASLADO, SUSPENSION, etc.).',
      'El asistente puede indicar el ID y el nombre; el detalle completo se consulta en el enlace del portal.',
    ],
  },
  {
    id: 'sec-sucursales',
    titulo: 'Sucursales VTR (horarios y ubicaciones)',
    categoria: 'PORTAL',
    tipo: 'seccion',
    seccionPortal: 'vtr.com → Sucursales',
    sinonimos: ['sucursales', 'horario sucursal', 'punto de venta', 'atencion presencial'],
    contenido: [
      'Consulta sucursales y horarios en https://vtr.com/sucursales/ (región + comuna).',
      'El asistente tiene indexados los horarios publicados (Lun–Vie / Sábado / Domingo) y el tipo de atención (Venta / Postventa).',
      'Pregunta por comuna o nombre del punto (ej. “horario Plaza Oeste”, “sucursales Providencia”).',
    ],
  },
]

const HECHOS_OPERATIVOS = [
  {
    id: 'hecho-costos-equipos',
    titulo: 'Costos de referencia: control remoto y D-Box',
    categoria: 'ANDES',
    tipo: 'hecho',
    seccionPortal: 'Contrataciones',
    sinonimos: ['precio', 'costo', '6000', '2990', 'delivery', 'repuesto'],
    contenido: [
      'Control Remoto (repuesto / Delivery Control Remoto): referencia $6.000.',
      'Delivery de equipos: referencia $3.000.',
      'd-BOX Smart II: referencia ~$2.990 por mes.',
      'Método de Envío habitual: Autoinstalación o Visita Técnica.',
    ],
  },
  {
    id: 'hecho-clase-cliente',
    titulo: 'Regla crítica: clase Cliente en Andes',
    categoria: 'ANDES',
    tipo: 'hecho',
    seccionPortal: 'Contrataciones',
    sinonimos: ['clase', 'servicio'],
    contenido: [
      'Al buscar por RUT, siempre entra por la fila con clase Cliente.',
      'No uses Facturación ni Servicio para iniciar contrataciones o cambios.',
    ],
  },
  {
    id: 'hecho-anular-pedido',
    titulo: 'Anular pedido / incidencia de trámite',
    categoria: 'ANDES',
    tipo: 'hecho',
    seccionPortal: 'Contrataciones → Cambio de Plan',
    sinonimos: ['anular', 'cancelar pedido', 'incidencia', 'liberar linea'],
    contenido: [
      'Si hay pedido fallido o en curso que bloquea la línea: Cancelar pedido.',
      'Motivo típico: Incidencia de trámite → CONFIRMAR.',
    ],
  },
]

/** Construye el índice completo del portal (local / para sync Firestore) */
export function construirIndicePortal() {
  const guias = [
    guiaDesdePasos({
      id: 'guia-control-remoto-completa',
      titulo: 'Contratación / cobro de Control Remoto (paso a paso)',
      seccionPortal: 'Contrataciones → Control Remoto',
      sinonimos: ['control remoto', 'remoto', 'delivery control', 'cobro control', 'repuesto control'],
      pasos: controlRemotoPasos,
      extras: ['Precio referencia Control Remoto: $6.000.', 'Delivery de equipos: $3.000.'],
      imgBaseDefault: CONTROL_REMOTO_IMG_BASE,
    }),
    guiaDesdePasos({
      id: 'guia-cambio-plan-completa',
      titulo: 'Cambio de plan / Actualizar promoción (paso a paso)',
      seccionPortal: 'Contrataciones → Cambio de Plan',
      sinonimos: ['cambio de plan', 'actualizar promocion', 'cambiar plan', 'upgrade', 'downgrade', 'fibra hogar'],
      pasos: cambioPlanPasos,
      imgBaseDefault: CAMBIO_PLAN_IMG_BASE,
    }),
    guiaDesdePasos({
      id: 'guia-dbox-completa',
      titulo: 'Contratación D-Box Smart II (paso a paso)',
      seccionPortal: 'Contrataciones → D-Box',
      sinonimos: ['dbox', 'd-box', 'decodificador', 'smart ii', 'agregar dbox', 'equipos television'],
      pasos: dboxPasos,
      extras: ['Precio referencia d-BOX Smart II: $2.990 / mes.'],
      imgBaseDefault: DBOX_PASOS_IMG_BASE,
    }),
    guiaDesdePasos({
      id: 'guia-asistencia-vtr-completa',
      titulo: 'Contratación Asistencia VTR (paso a paso / gestión)',
      seccionPortal: 'Contrataciones → Asistencia VTR',
      sinonimos: [
        'asistencia vtr',
        'gestion asistencia',
        'ingreso asistencia',
        'agregar asistencia vtr',
        'sva asistencia',
      ],
      pasos: asistenciaVtrPasos,
      extras: [
        'El servicio debe estar activo y no estar en cobranza.',
        'Informa: detalle del cambio, valor SVA, descuentos y vigencia, proporcionales próxima boleta.',
        'Registra: Atención Comercial → Info cuenta servic oferta plat → SVA caract (precio, cond com).',
      ],
      imgBaseDefault: ASISTENCIA_VTR_IMG_BASE,
    }),
  ]

  return [
    ...guias,
    ...MICRO_PASOS,
    ...DOCS_FAQ_AMPLIADAS,
    ...DOCS_INCONVENIENTE_PAGO,
    ...DOCS_TRASLADO_SERVICIOS,
    ...DOCS_CAMBIO_TITULAR,
    ...DOCS_INTERNET_FTTH_HFC,
    ...DOCS_BOLETA_AGOSTO,
    ...DOCS_FIESTAS_PATRIAS,
    ...SUCURSALES_HORARIOS,
    ...SECCIONES_PORTAL,
    ...HECHOS_OPERATIVOS,
    ...docsDialogoGoogleParaConocimiento(),
    ...docsCorpusCotidianosParaConocimiento(),
    ...docsPlanesYStreaming(),
    ...docsStreamingComercialCompletos(),
    ...docsControlRemotoCompletos(),
    ...docsCambioPlanCompletos(),
    ...docsDboxCompletos(),
    ...docsOntFtthCompletos(),
  ]
}

/** Documentos listos para Firestore (sin undefined) */
export function docsParaFirestore(docs = construirIndicePortal()) {
  return docs.map((d) => ({
    id: d.id,
    titulo: d.titulo,
    categoria: d.categoria || 'PORTAL',
    tipo: d.tipo || 'doc',
    seccionPortal: d.seccionPortal || '',
    sinonimos: d.sinonimos || [],
    contenido: Array.isArray(d.contenido) ? d.contenido : [String(d.contenido || '')],
    fuente: d.fuente || 'portal',
    imagenes: Array.isArray(d.imagenes) ? d.imagenes : [],
    enlace: d.enlace || null,
    actualizadoEn: new Date().toISOString(),
  }))
}

export const INDICE_PORTAL_LOCAL = construirIndicePortal()
