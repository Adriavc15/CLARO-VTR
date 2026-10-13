/**
 * Catálogo oficial de tipificaciones: RAZÓN > SERVICIO > MOTIVO.
 *
 * Los nombres de SERVICIO y MOTIVO se copiaron textualmente de la tabla
 * operativa (Andes) para no romper los reportes: no corregir tildes ni
 * abreviaturas ("Cons. estado pedido clienete", "Transf. a Retención Premiun",
 * "DX de servicio Principal", etc.).
 *
 * Las descripciones marcadas con `tentativo: true` fueron redactadas porque la
 * tabla original venía sin texto; conviene revisarlas antes de publicarlas.
 */

export const CATALOGO_TIPIFICACIONES = [
  {
    razon: 'General',
    servicios: [
      {
        servicio: 'Transferencias',
        motivos: [
          {
            motivo: 'Transferencia a Comercial',
            descripcion: 'Esta tipificación es para la transferencia a N1 comercial',
          },
          {
            motivo: 'Transferencia a Técnica',
            descripcion: 'Esta tipificación es para la transferencia a N1 tecnico',
          },
          {
            motivo: 'Transferencia Retención SSPP',
            descripcion: 'Esta tipificación es para la transferencia a retenciones servicios principales',
          },
          {
            motivo: 'Transf. a Retención Premiun',
            descripcion:
              'Esta tipificación es para la transferencia a retenciones canales premium (como tnt, fox, pack adultos)',
          },
          {
            motivo: 'Transfiere a Botón Rojo',
            descripcion:
              'Se transfiere la atención al nivel Botón Rojo para que tome el caso el área responsable.',
            tentativo: true,
          },
          {
            motivo: 'Transfiere a B2B',
            descripcion: 'Se transfiere la atención a un asesor del área B2B (clientes empresas).',
            tentativo: true,
          },
          {
            motivo: 'Transfiere a otra plataforma',
            descripcion: 'Se transfiere la atención a otra plataforma u operador.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Fallas sistémicas',
        motivos: [
          {
            motivo: 'Masiva Técnica  (NNOC Ticket)',
            descripcion: 'Falla masiva de servicio con ticket abierto en NNOC.',
            tentativo: true,
          },
          {
            motivo: 'Falla Masiva Comercial',
            descripcion: 'Falla masiva reportada por el área comercial.',
            tentativo: true,
          },
          {
            motivo: 'Falla sist./procesos ISAC-CRM',
            descripcion: 'Falla de sistema o de procesos en ISAC / CRM.',
            tentativo: true,
          },
        ],
      },
    ],
  },
  {
    razon: 'Atención técnica',
    servicios: [
      {
        servicio: 'Config/Activaciones/Desact',
        motivos: [
          {
            motivo: 'Cambio/Config./capacitación',
            descripcion:
              'Cambios de configuración del equipo, activación/desactivación de servicio o capacitación al cliente.',
            tentativo: true,
          },
          {
            motivo: 'SVA funcionamiento acti/desac',
            descripcion: 'Ayudar al cliente a la activación del d-box',
          },
          {
            motivo: 'Autoinstalacion Inst/act/conf',
            descripcion: 'Ayudar al cliente a la activación del d-box',
          },
        ],
      },
      {
        servicio: 'Correo electrónico',
        motivos: [
          {
            motivo: 'Correo Electrónico VTR',
            descripcion: 'Consulta o gestión del servicio de correo electrónico VTR.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Internet',
        motivos: [
          {
            motivo: 'Sin Internet',
            descripcion: 'Incoveniente tecnico, cl sin internet',
          },
          {
            motivo: 'Intermitencia Internet',
            descripcion: 'Incoveniente tecnico, cl con intermitencia o lentitud',
          },
          {
            motivo: 'Velocidad Internet',
            descripcion:
              'Incoveniente tecnico, cl menciona que su velocidad es baja y no coincide con lo contratado',
          },
          { motivo: 'Clave Wifi', descripcion: 'Cambio de clave wifi' },
          {
            motivo: 'Problema Extensor',
            descripcion: 'inconveniente tecnico, con el extensor',
          },
          {
            motivo: 'Gamer',
            descripcion:
              'Consulta o falla del servicio Gamer (latencia reducida y dedicada para juegos).',
            tentativo: true,
          },
          {
            motivo: 'Inconveniente URL',
            descripcion: 'El cliente no puede navegar o cargar determinado sitio web.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'TV - dBox HD, Pro y SD',
        motivos: [
          {
            motivo: 'Sin señal TV',
            descripcion:
              'inconveniente tecnico, cliente menciona que no tiene señal en su tv (HFC)',
          },
          {
            motivo: 'Probl imag pant negro/pixeleo',
            descripcion:
              'inconveniente tecnico, cliente menciona que su pantalla esta en negro/pixelado/tiene problemas con la imagen',
          },
          {
            motivo: 'Dbox no enciende ',
            descripcion:
              'inconveniente tecnico, cliente menciona que su d-box no emite ninguna luz/no enciende (HFC)',
          },
          {
            motivo: 'Control remoto (precio, func)',
            descripcion:
              'cl menciona que su control remoto falla, solo emite luces roja o amarilla, solo funciona algunos botones (HFC)',
          },
          {
            motivo: 'Problemas VOD - Replay',
            descripcion:
              'cl menciona que tiene problemas con el VOD o no puede retroceder sus capitulos de una serie o un programa (replay) - (HFC)',
          },
        ],
      },
      {
        servicio: 'TV - dBox Smart',
        motivos: [
          {
            motivo: 'Sin señal TV',
            descripcion:
              'inconveniente tecnico, cliente menciona que no tiene señal en su tv (FTTH)',
          },
          {
            motivo: 'Probl imag pant negro/pixeleo',
            descripcion:
              'inconveniente tecnico, cliente menciona que su pantalla esta en negro/pixelado/tiene problemas con la imagen',
          },
          {
            motivo: 'Dbox no enciende ',
            descripcion:
              'inconveniente tecnico, cliente menciona que su d-box no emite ninguna luz/no enciende (FTTH)',
          },
          {
            motivo: 'Control remoto (precio, func)',
            descripcion:
              'cl menciona que su control remoto falla, solo emite luces roja o amarilla, solo funciona algunos botones (FTTH)',
          },
          {
            motivo: 'Problemas VOD - Replay',
            descripcion:
              'cl menciona que tiene problemas con el VOD o no puede retroceder sus capitulos de una serie o un programa (replay) - (FTTH)',
          },
        ],
      },
      {
        servicio: 'Móvil',
        motivos: [
          {
            motivo: 'Problema Datos sin señal degr',
            descripcion: 'El cliente no tiene datos móviles o la señal es degradada.',
            tentativo: true,
          },
          {
            motivo: 'Prob. Voz No genera/No recibe',
            descripcion: 'El cliente no puede emitir ni recibir llamadas de voz.',
            tentativo: true,
          },
          {
            motivo: 'Problemas de cobertura',
            descripcion: 'El cliente reporta falta de cobertura o señal en su zona.',
            tentativo: true,
          },
          {
            motivo: 'Problemas USSD (eje: *103#)',
            descripcion: 'Los códigos USSD no responden o devuelven error.',
            tentativo: true,
          },
          {
            motivo: 'Prob SMS (No envía/No recibe)',
            descripcion: 'El cliente no puede enviar ni recibir SMS.',
            tentativo: true,
          },
          {
            motivo: 'IMEI bloq. por mora – robo',
            descripcion: 'Equipo bloqueado por mora o por denuncia de robo.',
            tentativo: true,
          },
          {
            motivo: 'Carga no realizada',
            descripcion: 'La recarga al equipo no se refleja o no se aplica.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Fono',
        motivos: [
          {
            motivo: 'Sin fono o sin tono',
            descripcion:
              'Cl menciona que el tecnico se llevo su fono y no han ido a regresarlo / cliente menciona que su fono no tiene tono',
          },
          {
            motivo: 'No recibe llamadas',
            descripcion: 'Cl menciona que su telefono no recibe llamadas',
          },
          {
            motivo: 'No genera llamada fijo o cel',
            descripcion: 'Cl menciona que su telefono no esa generando llamadas en general',
          },
        ],
      },
    ],
  },
  {
    razon: 'Atención Comercial',
    servicios: [
      {
        servicio: 'Baja servicio',
        motivos: [
          {
            motivo: 'DX de servicio Principal ',
            descripcion:
              'Cl pide la baja de los servicio principales (servicios en general / internet/tv)',
          },
          {
            motivo: 'Baja de Canales Premiun',
            descripcion:
              'Cl pide la baja de canales premium (TNT/FOX/PACK ADULTO)',
          },
          {
            motivo: 'Baja de SVA',
            descripcion:
              'Cl pide el quitar servicios adicionales (D-BOX / EXTENSOR WIFI)',
          },
          {
            motivo: 'Baja no cursada',
            descripcion:
              'Cl menciona que realizó la baja de su servicio el mes pasado, pero se verifica en Andes que aún esta activo)',
          },
          {
            motivo: 'Baja de servicio Móvil',
            descripcion: 'Cl solicita la baja del servicio móvil.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Cambio de serv contrat/Suspen',
        motivos: [
          {
            motivo: 'Susp de Serv (transi/otra)',
            descripcion:
              'Cl solicita la suspensión transitoria de su servicio u otra modalidad de suspensión.',
            tentativo: true,
          },
          {
            motivo: 'Cambio de Plan/Actuali. promo',
            descripcion: 'Cl desea el cambio del plan o actualizar promociones',
          },
          {
            motivo: 'SVA canal premium',
            descripcion: 'Cl desea agregar SVA o canales premium',
          },
        ],
      },
      {
        servicio: 'Descuentos y prórroga',
        motivos: [
          {
            motivo: 'Desc.Prom no aplicado/término',
            descripcion:
              'Cl indica que le ofrecieron un descuento, pero no esta ingresado en su boleta',
          },
          {
            motivo: 'Prórroga /Inhibición',
            descripcion:
              'Cl indica que ya pago por su servicio y aún no le reconectan el servicio',
          },
          {
            motivo: 'Descuento días sin serv fijo ',
            descripcion:
              'Cl se comunica indicando que estuvo unos días sin el servicio por inconvenientes tecnicos',
          },
          {
            motivo: 'Ajuste de boleta/factura',
            descripcion:
              'Cl cuenta con algún inconveniente de pago, donde la boleta se verifica un pequeño monto que se pueda ajustar',
          },
        ],
      },
      {
        servicio: 'Info cuenta servic oferta plat',
        motivos: [
          {
            motivo: 'Consulta Deuda',
            descripcion: 'Cl consulta por deuda',
          },
          {
            motivo: 'Consulta Saldo Móvil',
            descripcion: 'Cl consulta por el saldo de su servicio móvil.',
            tentativo: true,
          },
          {
            motivo: 'Consulta Saldo Fijo',
            descripcion: 'Cl consulta por el saldo de sus servicios fijos.',
            tentativo: true,
          },
          {
            motivo: 'SVA caract (precio, cond com)',
            descripcion:
              'Cl desea información de la caracteristicas de los SVA, los precios',
          },
          {
            motivo: 'Oferta/Cotización',
            descripcion: 'Cl consulta por el costo de los planes y paquetes',
          },
          {
            motivo: 'Portabilidad/Cambio de equipo',
            descripcion:
              'Cl consulta por portabilidad de su línea o por el cambio de equipo móvil.',
            tentativo: true,
          },
          {
            motivo: 'Informa Canales de Atención',
            descripcion: 'Cl consulta por otros canales de atención',
          },
          {
            motivo: 'Sucursal Virtual / APP',
            descripcion: 'Cl consulta por los aplicativos de la marca',
          },
        ],
      },
      {
        servicio: 'Cambio datos(titular dom etc)',
        motivos: [
          {
            motivo: 'Actualización Datos Cliente',
            descripcion:
              'Si cl desea modificar tipo de Cliente, Subtipo, Dirección, Tipo de Documento, Teléfono Principal y Giro',
          },
          {
            motivo: 'Cambio de Titular',
            descripcion: 'Cl consulta por cambio de titularidad',
          },
          {
            motivo: 'Cambio de número',
            descripcion: 'Cl desea hacer el cambio de número fijo',
          },
          {
            motivo: 'Cambio de ciclo/DOM',
            descripcion: 'Cl consulta por el cambio de DOM',
          },
        ],
      },
      {
        servicio: 'Cons. estado pedido clienete',
        motivos: [
          {
            motivo: 'Visita Técnica reag/desi/incum',
            descripcion:
              'Cl consulta por visita tecnica reagendada/visita cancelada/incumplimiento de visita',
          },
          {
            motivo: 'Traslado (fact/estado/incump)',
            descripcion:
              'Cl consulta por traslado/consulta por factibilidad/incumplen con su traslado)',
          },
          {
            motivo: 'Delivery (fecha entrg/incump)',
            descripcion:
              'Cl desea información de su delivery/fecha de entrega/ incomuplimiento de este',
          },
          {
            motivo: 'Portabilidad (estado/incumpl)',
            descripcion:
              'Cl consulta por el estado de su portabilidad o su incumplimiento.',
            tentativo: true,
          },
          {
            motivo: 'Consulta ingreso SSTT (móvil)',
            descripcion: 'Cl consulta por el ingreso a SSTT en su línea móvil.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Explicación cobros y boleta',
        motivos: [
          {
            motivo: 'Explic. Otros Cobros/boleta',
            descripcion: 'Explicación de otros Cobros/boleta',
          },
          {
            motivo: 'Explic Cobros Corte y Repo.',
            descripcion: 'Expliccación de Cobros/ Corte y Reposición',
          },
          {
            motivo: 'Envio -Recep Boleta-distriibuc',
            descripcion: 'Envio -Recepción de boleta-distriibución',
          },
          {
            motivo: 'Explicación Cobro IPC',
            descripcion: 'Explicación Cobro IPC',
          },
        ],
      },
      {
        servicio: 'Pagos',
        motivos: [
          {
            motivo: 'Pago no aplicado',
            descripcion: 'Pago no aplicado',
          },
          {
            motivo: 'Consulta lugar/opcion de pago',
            descripcion: 'Consulta lugar/opcion de pago',
          },
          {
            motivo: 'PAT-PAC (activ/desac/rechazo)',
            descripcion: 'PAT-PAC (activ/desac/rechazo)',
          },
        ],
      },
    ],
  },
  {
    razon: 'Gestión Interna',
    servicios: [
      {
        servicio: 'Seguimiento',
        motivos: [
          {
            motivo: 'Seguimiento de Caso',
            descripcion: 'Seguimiento al estado de un caso previamente generado.',
            tentativo: true,
          },
          {
            motivo: 'Corte de llamado',
            descripcion: 'Llamada cortada por el cliente o por falla del sistema.',
            tentativo: true,
          },
          {
            motivo: 'Devolución de llamada',
            descripcion: 'Se deja registro de la devolución de llamada realizada al cliente.',
            tentativo: true,
          },
          {
            motivo: 'Derivado a Mesa de ayuda',
            descripcion: 'El caso se deriva a la Mesa de ayuda para continuar la gestión.',
            tentativo: true,
          },
          {
            motivo: 'Escalado a GIS',
            descripcion: 'El caso se escala al área GIS.',
            tentativo: true,
          },
          {
            motivo: 'Escala  otra área/Super/Coord',
            descripcion:
              'El caso se escala a otra área, a un supervisor o a un coordinador.',
            tentativo: true,
          },
          {
            motivo: 'Rut sin Gestión',
            descripcion: 'Se registra el RUT sin que exista una gestión asociada.',
            tentativo: true,
          },
        ],
      },
    ],
  },
  {
    razon: 'Atención Outbound',
    servicios: [
      {
        servicio: 'Campañas ',
        motivos: [
          {
            motivo: 'Confirma',
            descripcion: 'El cliente confirma su participación en la campaña.',
            tentativo: true,
          },
          {
            motivo: 'Reagenda',
            descripcion: 'El cliente reagenda la atención de la campaña.',
            tentativo: true,
          },
          {
            motivo: 'Cancela',
            descripcion: 'El cliente cancela su participación en la campaña.',
            tentativo: true,
          },
          {
            motivo: 'Bienvenida',
            descripcion: 'Llamada de bienvenida a cliente nuevo.',
            tentativo: true,
          },
          {
            motivo: 'Venta/Cotización/Portabilidad',
            descripcion: 'Llamada de venta, cotización o portabilidad.',
            tentativo: true,
          },
          {
            motivo: 'Agenda Visita (Certificada)',
            descripcion: 'El cliente agenda una visita certificada.',
            tentativo: true,
          },
          {
            motivo: 'No agenda Visita Certificada',
            descripcion: 'El cliente no agenda la visita certificada.',
            tentativo: true,
          },
        ],
      },
    ],
  },
  {
    razon: 'Atención Retención',
    servicios: [
      {
        servicio: 'Servicio técnico',
        motivos: [
          {
            motivo: 'No funciona como esperado',
            descripcion: 'El servicio no opera como el cliente espera.',
            tentativo: true,
          },
          {
            motivo: 'Fallas masivas',
            descripcion: 'El cliente reporta una falla masiva del servicio.',
            tentativo: true,
          },
          {
            motivo: 'Incumplimiento o no soluciona',
            descripcion: 'El cliente no logra una solución o se incumple lo acordado.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Producto y propuesta valor',
        motivos: [
          {
            motivo: 'Productos no utilizados',
            descripcion: 'El cliente no utiliza los productos contratados.',
            tentativo: true,
          },
          {
            motivo: 'Oferta VTR menos atractiva',
            descripcion: 'El cliente considera que la oferta de VTR es menos atractiva.',
            tentativo: true,
          },
          {
            motivo: 'No puede pagar',
            descripcion: 'El cliente no puede pagar su servicio.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Servicio comercial',
        motivos: [
          {
            motivo: 'Espera excesiva o no soluciona',
            descripcion: 'El cliente reporta espera excesiva o que su caso no se soluciona.',
            tentativo: true,
          },
          {
            motivo: 'Boleta excesiva o incorrecta',
            descripcion: 'El cliente considera que su boleta es excesiva o incorrecta.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Cambios en el cliente',
        motivos: [
          {
            motivo: 'Traslados',
            descripcion: 'El cliente solicita un traslado de servicio.',
            tentativo: true,
          },
          {
            motivo: 'Fallecimiento/Cambio de Titular',
            descripcion: 'Cambio de titular por fallecimiento del titular actual.',
            tentativo: true,
          },
          {
            motivo: 'Domicilio Infactible',
            descripcion: 'El domicilio declarado por el cliente no es factible para instalar.',
            tentativo: true,
          },
        ],
      },
    ],
  },
]

/** Quita tildes y pasa a minúsculas para búsquedas tolerantes. */
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const _cache = { indice: null, plano: null }

function construirIndice() {
  if (_cache.indice) return _cache.indice
  const indice = new Map()
  const plano = []
  for (const razon of CATALOGO_TIPIFICACIONES) {
    for (const serv of razon.servicios) {
      const keyServ = `${razon.razon}|${serv.servicio}`
      if (!indice.has(keyServ)) indice.set(keyServ, serv.motivos)
      for (const mot of serv.motivos) {
        plano.push({
          razon: razon.razon,
          servicio: serv.servicio,
          motivo: mot.motivo,
          descripcion: mot.descripcion || '',
          tentativo: mot.tentativo === true,
          ruta: `${razon.razon} > ${serv.servicio} > ${mot.motivo}`,
        })
      }
    }
  }
  _cache.indice = indice
  _cache.plano = plano
  return indice
}

/** Lista de razones del catálogo. */
export const RAZONES_CATALOGO = CATALOGO_TIPIFICACIONES.map((r) => r.razon)

/** Lista de servicios de una razón (vacía si la razón no existe). */
export function serviciosDeRazon(razon) {
  if (!razon) return []
  const nodo = CATALOGO_TIPIFICACIONES.find(
    (r) => normalizarTexto(r.razon) === normalizarTexto(razon)
  )
  return nodo ? nodo.servicios.map((s) => s.servicio) : []
}

/** Lista de motivos de una razón (todos sus servicios). */
export function motivosDeRazon(razon) {
  return serviciosDeRazon(razon).flatMap((serv) => motivosDeServicio(razon, serv))
}

/** Lista de motivos de un par razón + servicio (vacía si no existe). */
export function motivosDeServicio(razon, servicio) {
  if (!razon || !servicio) return []
  const indice = construirIndice()
  return indice.get(`${razon}|${servicio}`) || indice.get(buscarClave(indice, razon, servicio)) || []
}

function buscarClave(indice, razon, servicio) {
  for (const key of indice.keys()) {
    const [r, s] = key.split('|')
    if (
      normalizarTexto(r) === normalizarTexto(razon) &&
      normalizarTexto(s) === normalizarTexto(servicio)
    ) {
      return key
    }
  }
  return ''
}

/** ¿La combinación razón/servicio/motivo existe en el catálogo? */
export function existeMotivo(razon, servicio, motivo) {
  if (!razon || !servicio || !motivo) return false
  const n = normalizarTexto(motivo)
  return motivosDeServicio(razon, servicio).some((m) => normalizarTexto(m.motivo) === n)
}

/** Descripción (ayuda) del motivo seleccionado, '' si no existe. */
export function descripcionMotivo(razon, servicio, motivo) {
  if (!razon || !servicio || !motivo) return ''
  const n = normalizarTexto(motivo)
  const hit = motivosDeServicio(razon, servicio).find((m) => normalizarTexto(m.motivo) === n)
  return hit?.descripcion || ''
}

/** "Razón > Servicio > Motivo" (o la parte conocida si falta algo). */
export function rutaTipificacion({ razon, servicio, motivo } = {}) {
  return [razon, servicio, motivo].filter((v) => String(v || '').trim()).join(' > ')
}

/** Busca en razón, servicio, motivo y descripción. Devuelve {razon,servicio,motivo,...}. */
export function buscarTipificaciones(texto, limite = 40) {
  const q = normalizarTexto(texto)
  construirIndice()
  if (!q) return []
  const out = []
  for (const fila of _cache.plano) {
    const heno =
      normalizarTexto(fila.razon).includes(q) ||
      normalizarTexto(fila.servicio).includes(q) ||
      normalizarTexto(fila.motivo).includes(q) ||
      normalizarTexto(fila.descripcion).includes(q)
    if (heno) out.push(fila)
    if (out.length >= limite) break
  }
  return out
}

/** Quantos motivos tiene el catálogo (para mostrar "N motivos"). */
export function totalMotivos() {
  construirIndice()
  return _cache.plano.length
}
