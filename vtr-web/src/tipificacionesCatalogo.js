/**
 * Catálogo oficial de tipificaciones: RAZÓN > SERVICIO > MOTIVO.
 *
 * Los nombres de SERVICIO y MOTIVO se copiaron textualmente de la tabla
 * operativa (Andes) para no romper los reportes: no corregir tildes ni
 * abreviaturas ("Cons. estado pedido clienete", "Transf. a Retención Premiun",
 * "DX de servicio Principal", etc.).
 *
 * `nombreAmigable` (en servicios y motivos) es solo para mostrar en pantalla
 * (buscador y Pasos): es una versión legible del nombre y NO reemplaza al
 * valor oficial que se reporta.
 *
 * `descripcion` es el texto de ayuda y el que se pega en Plantilla General.
 * `destino` (`inconveniente` | `solucion`) indica en qué campo se pega:
 *   - inconveniente: el cliente reporta un problema o una consulta
 *   - solucion: el asesor registra una gestión (transferencia, escalamiento,
 *     seguimiento, configuración, campaña outbound)
 * Si no está en el motivo, se hereda del servicio o de la razón.
 * `uso` es una nota ("se usa cuando…") solo para el buscador y Pasos.
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
        nombreAmigable: 'Transferencias',
        destino: 'solucion',
        motivos: [
          {
            motivo: 'Transferencia a Comercial',
            nombreAmigable: 'Transferencia a N1 Comercial',
            descripcion:
              'Se transfiere la atención al área comercial (N1 Comercial) para continuar la gestión.',
          },
          {
            motivo: 'Transferencia a Técnica',
            nombreAmigable: 'Transferencia a N1 Técnico',
            descripcion:
              'Se transfiere la atención al área técnica (N1 Técnico) para continuar la gestión.',
          },
          {
            motivo: 'Transferencia Retención SSPP',
            nombreAmigable: 'Transferencia a Retención Servicios Principales',
            descripcion:
              'Se transfiere la atención al área de Retención de Servicios Principales para evitar la baja del cliente.',
          },
          {
            motivo: 'Transf. a Retención Premiun',
            nombreAmigable: 'Transferencia a Retención Premium',
            descripcion:
              'Se transfiere la atención a Retención de canales premium (TNT, FOX, pack adultos, etc.).',
          },
          {
            motivo: 'Transfiere a Botón Rojo',
            nombreAmigable: 'Transferencia a Botón Rojo',
            descripcion:
              'Se transfiere la atención al nivel Botón Rojo para que el área responsable tome el caso.',
            uso: 'Se usa en casos críticos que requieren gestión especializada.',
            tentativo: true,
          },
          {
            motivo: 'Transfiere a B2B',
            nombreAmigable: 'Transferencia a B2B (empresas)',
            descripcion:
              'Se transfiere la atención a un asesor del área B2B, encargada de clientes empresas.',
            tentativo: true,
          },
          {
            motivo: 'Transfiere a otra plataforma',
            nombreAmigable: 'Transferencia a otra plataforma u operador',
            descripcion:
              'Se transfiere la atención a otra plataforma u operador distinto de VTR para continuar la gestión.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Fallas sistémicas',
        nombreAmigable: 'Fallas sistémicas',
        motivos: [
          {
            motivo: 'Masiva Técnica  (NNOC Ticket)',
            nombreAmigable: 'Falla masiva técnica (ticket NNOC)',
            descripcion: 'Falla masiva del servicio con ticket abierto en NNOC.',
            uso: 'Se usa cuando varios clientes de la misma zona o servicio están afectados y ya existe un ticket de falla masiva.',
            tentativo: true,
          },
          {
            motivo: 'Falla Masiva Comercial',
            nombreAmigable: 'Falla masiva comercial',
            descripcion:
              'Falla masiva reportada por el área comercial que afecta a varios clientes y ya está siendo gestionada.',
            tentativo: true,
          },
          {
            motivo: 'Falla sist./procesos ISAC-CRM',
            nombreAmigable: 'Falla de sistema o procesos (ISAC / CRM)',
            descripcion:
              'Falla de los sistemas o procesos internos (ISAC / CRM) que impide completar la gestión del cliente.',
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
        nombreAmigable: 'Configuración, activaciones y desactivaciones',
        destino: 'solucion',
        motivos: [
          {
            motivo: 'Cambio/Config./capacitación',
            nombreAmigable: 'Cambio de configuración o capacitación',
            descripcion:
              'Cambio de configuración del equipo, activación o desactivación de un servicio, o capacitación al cliente en el uso de sus servicios.',
            tentativo: true,
          },
          {
            motivo: 'SVA funcionamiento acti/desac',
            nombreAmigable: 'SVA: funcionamiento, activación o desactivación',
            descripcion:
              'Se ayuda al cliente con el funcionamiento, la activación o la desactivación de un servicio adicional (SVA).',
          },
          {
            motivo: 'Autoinstalacion Inst/act/conf',
            nombreAmigable: 'Autoinstalación: instalación, activación o configuración',
            descripcion:
              'Se guía al cliente en la autoinstalación del equipo, incluyendo su activación y configuración.',
          },
        ],
      },
      {
        servicio: 'Correo electrónico',
        nombreAmigable: 'Correo electrónico',
        motivos: [
          {
            motivo: 'Correo Electrónico VTR',
            nombreAmigable: 'Correo electrónico VTR',
            descripcion:
              'Consulta, configuración o recuperación del correo electrónico VTR (acceso, clave, envío o recepción de correos).',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Internet',
        nombreAmigable: 'Internet',
        motivos: [
          {
            motivo: 'Sin Internet',
            nombreAmigable: 'Sin internet (sin conexión)',
            descripcion: 'El cliente no tiene conexión a internet.',
          },
          {
            motivo: 'Intermitencia Internet',
            nombreAmigable: 'Internet intermitente o lento',
            descripcion:
              'El cliente presenta intermitencia o lentitud en su conexión a internet.',
          },
          {
            motivo: 'Velocidad Internet',
            nombreAmigable: 'Velocidad de internet bajo lo contratado',
            descripcion:
              'El cliente indica que su velocidad de internet es baja y no coincide con lo contratado.',
          },
          {
            motivo: 'Clave Wifi',
            nombreAmigable: 'Cambio de clave WiFi',
            descripcion: 'El cliente solicita el cambio de la clave de su red WiFi.',
          },
          {
            motivo: 'Problema Extensor',
            nombreAmigable: 'Problema con el extensor WiFi',
            descripcion:
              'El cliente presenta un inconveniente técnico con el extensor WiFi.',
          },
          {
            motivo: 'Gamer',
            nombreAmigable: 'Servicio Gamer (latencia dedicada)',
            descripcion:
              'Consulta o falla del servicio Gamer, que entrega latencia reducida y dedicada para juegos en línea.',
            tentativo: true,
          },
          {
            motivo: 'Inconveniente URL',
            nombreAmigable: 'No puede abrir un sitio web (URL)',
            descripcion:
              'El cliente no puede navegar o cargar un sitio web determinado (URL específica), aunque el resto de internet funcione.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'TV - dBox HD, Pro y SD',
        nombreAmigable: 'TV - decodificador dBox HD, Pro y SD',
        motivos: [
          {
            motivo: 'Sin señal TV',
            nombreAmigable: 'Sin señal de TV (HFC)',
            descripcion:
              'El cliente indica que no tiene señal de TV en su decodificador (HFC).',
          },
          {
            motivo: 'Probl imag pant negro/pixeleo',
            nombreAmigable: 'Problema de imagen: pantalla negra o pixelada (HFC)',
            descripcion:
              'El cliente indica que la pantalla está en negro, pixelada o con problemas de imagen (HFC).',
          },
          {
            motivo: 'Dbox no enciende ',
            nombreAmigable: 'Decodificador (dBox) no enciende (HFC)',
            descripcion:
              'El cliente indica que su decodificador (dBox) no enciende o no emite ninguna luz (HFC).',
          },
          {
            motivo: 'Control remoto (precio, func)',
            nombreAmigable: 'Control remoto con fallas (HFC)',
            descripcion:
              'El cliente indica que su control remoto falla: solo emite luz roja o amarilla, o solo funcionan algunos botones (HFC).',
          },
          {
            motivo: 'Problemas VOD - Replay',
            nombreAmigable: 'Problemas con VOD o Replay (HFC)',
            descripcion:
              'El cliente tiene problemas con el VOD o no puede retroceder capítulos de una serie o programa (Replay) (HFC).',
          },
        ],
      },
      {
        servicio: 'TV - dBox Smart',
        nombreAmigable: 'TV - decodificador dBox Smart',
        motivos: [
          {
            motivo: 'Sin señal TV',
            nombreAmigable: 'Sin señal de TV (FTTH)',
            descripcion:
              'El cliente indica que no tiene señal de TV en su decodificador (FTTH).',
          },
          {
            motivo: 'Probl imag pant negro/pixeleo',
            nombreAmigable: 'Problema de imagen: pantalla negra o pixelada (FTTH)',
            descripcion:
              'El cliente indica que la pantalla está en negro, pixelada o con problemas de imagen (FTTH).',
          },
          {
            motivo: 'Dbox no enciende ',
            nombreAmigable: 'Decodificador (dBox) no enciende (FTTH)',
            descripcion:
              'El cliente indica que su decodificador (dBox) no enciende o no emite ninguna luz (FTTH).',
          },
          {
            motivo: 'Control remoto (precio, func)',
            nombreAmigable: 'Control remoto con fallas (FTTH)',
            descripcion:
              'El cliente indica que su control remoto falla: solo emite luz roja o amarilla, o solo funcionan algunos botones (FTTH).',
          },
          {
            motivo: 'Problemas VOD - Replay',
            nombreAmigable: 'Problemas con VOD o Replay (FTTH)',
            descripcion:
              'El cliente tiene problemas con el VOD o no puede retroceder capítulos de una serie o programa (Replay) (FTTH).',
          },
        ],
      },
      {
        servicio: 'Móvil',
        nombreAmigable: 'Móvil',
        motivos: [
          {
            motivo: 'Problema Datos sin señal degr',
            nombreAmigable: 'Datos móviles sin señal o señal degradada',
            descripcion:
              'El cliente no tiene datos móviles o la señal es degradada, lo que impide o dificulta la navegación.',
            tentativo: true,
          },
          {
            motivo: 'Prob. Voz No genera/No recibe',
            nombreAmigable: 'Voz móvil: no genera ni recibe llamadas',
            descripcion:
              'El cliente no puede emitir ni recibir llamadas de voz desde su línea móvil.',
            tentativo: true,
          },
          {
            motivo: 'Problemas de cobertura',
            nombreAmigable: 'Problemas de cobertura en la zona',
            descripcion:
              'El cliente reporta falta de cobertura o señal débil de la red móvil en su zona.',
            tentativo: true,
          },
          {
            motivo: 'Problemas USSD (eje: *103#)',
            nombreAmigable: 'Códigos USSD no responden',
            descripcion:
              'Los códigos USSD (por ejemplo *103#) no responden o devuelven error al ejecutarlos.',
            tentativo: true,
          },
          {
            motivo: 'Prob SMS (No envía/No recibe)',
            nombreAmigable: 'SMS: no envía ni recibe mensajes',
            descripcion: 'El cliente no puede enviar ni recibir SMS desde su línea móvil.',
            tentativo: true,
          },
          {
            motivo: 'IMEI bloq. por mora – robo',
            nombreAmigable: 'Equipo bloqueado por mora o robo (IMEI)',
            descripcion:
              'El equipo está bloqueado por IMEI debido a mora en el pago o a una denuncia por robo.',
            tentativo: true,
          },
          {
            motivo: 'Carga no realizada',
            nombreAmigable: 'Recarga no realizada o no aplicada',
            descripcion:
              'La recarga o carga de saldo no se realizó o no se reflejó en la línea del cliente.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Fono',
        nombreAmigable: 'Fono (telefonía fija)',
        motivos: [
          {
            motivo: 'Sin fono o sin tono',
            nombreAmigable: 'Sin teléfono o sin tono',
            descripcion:
              'El cliente indica que el técnico se llevó su teléfono y no han ido a devolverlo, o que su teléfono no tiene tono.',
          },
          {
            motivo: 'No recibe llamadas',
            nombreAmigable: 'No recibe llamadas (telefonía fija)',
            descripcion: 'El cliente indica que su teléfono no recibe llamadas.',
          },
          {
            motivo: 'No genera llamada fijo o cel',
            nombreAmigable: 'No genera llamadas (fijo o celular)',
            descripcion:
              'El cliente indica que su teléfono no genera llamadas, ni desde fijo ni desde celular.',
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
        nombreAmigable: 'Baja de servicio',
        motivos: [
          {
            motivo: 'DX de servicio Principal ',
            nombreAmigable: 'Baja de servicios principales (internet / TV)',
            descripcion:
              'El cliente pide la baja de sus servicios principales (internet, TV o servicios en general).',
          },
          {
            motivo: 'Baja de Canales Premiun',
            nombreAmigable: 'Baja de canales premium',
            descripcion: 'El cliente pide la baja de canales premium (TNT, FOX, pack adultos).',
          },
          {
            motivo: 'Baja de SVA',
            nombreAmigable: 'Baja de servicios adicionales (SVA)',
            descripcion:
              'El cliente pide quitar servicios adicionales (D-BOX o extensor WiFi).',
          },
          {
            motivo: 'Baja no cursada',
            nombreAmigable: 'Baja no cursada (servicio sigue activo)',
            descripcion:
              'El cliente indica que realizó la baja de su servicio el mes pasado, pero al revisar en Andes el servicio aún está activo.',
          },
          {
            motivo: 'Baja de servicio Móvil',
            nombreAmigable: 'Baja de servicio móvil',
            descripcion: 'El cliente solicita la baja o el término de su línea o servicio móvil.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Cambio de serv contrat/Suspen',
        nombreAmigable: 'Cambio de servicios contratados o suspensión',
        motivos: [
          {
            motivo: 'Susp de Serv (transi/otra)',
            nombreAmigable: 'Suspensión de servicio (transitoria u otra)',
            descripcion:
              'El cliente solicita la suspensión transitoria de su servicio u otra modalidad de suspensión.',
            tentativo: true,
          },
          {
            motivo: 'Cambio de Plan/Actuali. promo',
            nombreAmigable: 'Cambio de plan o actualización de promo',
            descripcion: 'El cliente desea cambiar su plan o actualizar sus promociones.',
          },
          {
            motivo: 'SVA canal premium',
            nombreAmigable: 'Contratar SVA o canales premium',
            descripcion: 'El cliente desea agregar un SVA o canales premium.',
          },
        ],
      },
      {
        servicio: 'Descuentos y prórroga',
        nombreAmigable: 'Descuentos y prórroga',
        motivos: [
          {
            motivo: 'Desc.Prom no aplicado/término',
            nombreAmigable: 'Descuento promocional no aplicado o vencido',
            descripcion:
              'El cliente indica que le ofrecieron un descuento, pero no está ingresado en su boleta.',
          },
          {
            motivo: 'Prórroga /Inhibición',
            nombreAmigable: 'Prórroga o inhibición del servicio',
            descripcion:
              'El cliente indica que ya pagó su servicio y aún no le reconectan el servicio.',
          },
          {
            motivo: 'Descuento días sin serv fijo ',
            nombreAmigable: 'Descuento por días sin servicio (fijo)',
            descripcion:
              'El cliente indica que estuvo unos días sin el servicio por inconvenientes técnicos.',
          },
          {
            motivo: 'Ajuste de boleta/factura',
            nombreAmigable: 'Ajuste de boleta o factura',
            descripcion:
              'El cliente presenta un inconveniente de pago y en la boleta se verifica un monto pequeño que se puede ajustar.',
          },
        ],
      },
      {
        servicio: 'Info cuenta servic oferta plat',
        nombreAmigable: 'Información de cuenta, servicios, ofertas y plataforma',
        motivos: [
          {
            motivo: 'Consulta Deuda',
            nombreAmigable: 'Consulta de deuda',
            descripcion: 'El cliente consulta por su deuda.',
          },
          {
            motivo: 'Consulta Saldo Móvil',
            nombreAmigable: 'Consulta de saldo móvil',
            descripcion:
              'El cliente consulta el saldo disponible de su servicio móvil (prepago o cargo).',
            tentativo: true,
          },
          {
            motivo: 'Consulta Saldo Fijo',
            nombreAmigable: 'Consulta de saldo de servicios fijos',
            descripcion:
              'El cliente consulta el saldo o estado de cuenta de sus servicios fijos (internet, TV o teléfono).',
            tentativo: true,
          },
          {
            motivo: 'SVA caract (precio, cond com)',
            nombreAmigable: 'Características y precios de SVA',
            descripcion:
              'El cliente desea información sobre las características y los precios de los SVA.',
          },
          {
            motivo: 'Oferta/Cotización',
            nombreAmigable: 'Oferta o cotización de planes',
            descripcion: 'El cliente consulta por el costo de los planes y paquetes.',
          },
          {
            motivo: 'Portabilidad/Cambio de equipo',
            nombreAmigable: 'Portabilidad o cambio de equipo',
            descripcion:
              'El cliente consulta por la portabilidad de su línea móvil o por el cambio de equipo.',
            tentativo: true,
          },
          {
            motivo: 'Informa Canales de Atención',
            nombreAmigable: 'Información de canales de atención',
            descripcion: 'El cliente consulta por otros canales de atención.',
          },
          {
            motivo: 'Sucursal Virtual / APP',
            nombreAmigable: 'Sucursal Virtual o App',
            descripcion:
              'El cliente consulta por los aplicativos de la marca (Sucursal Virtual o App).',
          },
        ],
      },
      {
        servicio: 'Cambio datos(titular dom etc)',
        nombreAmigable: 'Cambio de datos (titular, domicilio, etc.)',
        motivos: [
          {
            motivo: 'Actualización Datos Cliente',
            nombreAmigable: 'Actualización de datos del cliente',
            descripcion:
              'El cliente desea modificar el tipo de cliente, subtipo, dirección, tipo de documento, teléfono principal o giro.',
          },
          {
            motivo: 'Cambio de Titular',
            nombreAmigable: 'Cambio de titular',
            descripcion: 'El cliente consulta por el cambio de titularidad.',
          },
          {
            motivo: 'Cambio de número',
            nombreAmigable: 'Cambio de número (fijo)',
            descripcion: 'El cliente desea cambiar su número fijo.',
          },
          {
            motivo: 'Cambio de ciclo/DOM',
            nombreAmigable: 'Cambio de ciclo o fecha de facturación (DOM)',
            descripcion: 'El cliente consulta por el cambio de la fecha de facturación (DOM).',
          },
        ],
      },
      {
        servicio: 'Cons. estado pedido clienete',
        nombreAmigable: 'Consulta de estado de pedido del cliente',
        motivos: [
          {
            motivo: 'Visita Técnica reag/desi/incum',
            nombreAmigable: 'Visita técnica: reagendada, desistida o incumplida',
            descripcion:
              'El cliente consulta por una visita técnica reagendada, cancelada o incumplida.',
          },
          {
            motivo: 'Traslado (fact/estado/incump)',
            nombreAmigable: 'Traslado: factibilidad, estado o incumplimiento',
            descripcion:
              'El cliente consulta por el estado de su traslado, por la factibilidad o por el incumplimiento del traslado.',
          },
          {
            motivo: 'Delivery (fecha entrg/incump)',
            nombreAmigable: 'Delivery: fecha de entrega o incumplimiento',
            descripcion:
              'El cliente desea información sobre su delivery: fecha de entrega o incumplimiento.',
          },
          {
            motivo: 'Portabilidad (estado/incumpl)',
            nombreAmigable: 'Portabilidad: estado o incumplimiento',
            descripcion:
              'El cliente consulta por el estado de su proceso de portabilidad o por su incumplimiento.',
            tentativo: true,
          },
          {
            motivo: 'Consulta ingreso SSTT (móvil)',
            nombreAmigable: 'Consulta ingreso a SSTT (móvil)',
            descripcion:
              'El cliente consulta por el ingreso o el estado de su caso en SSTT para su línea móvil.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Explicación cobros y boleta',
        nombreAmigable: 'Explicación de cobros y boleta',
        motivos: [
          {
            motivo: 'Explic. Otros Cobros/boleta',
            nombreAmigable: 'Explicación de otros cobros en la boleta',
            descripcion:
              'El cliente solicita la explicación de otros cobros que aparecen en su boleta.',
          },
          {
            motivo: 'Explic Cobros Corte y Repo.',
            nombreAmigable: 'Explicación de cobros por corte y reposición',
            descripcion:
              'El cliente solicita la explicación de los cobros por corte y reposición del servicio.',
          },
          {
            motivo: 'Envio -Recep Boleta-distriibuc',
            nombreAmigable: 'Envío y recepción de boleta (distribución)',
            descripcion:
              'Consulta sobre el envío y la recepción de la boleta, o sobre su distribución.',
          },
          {
            motivo: 'Explicación Cobro IPC',
            nombreAmigable: 'Explicación del cobro de IPC',
            descripcion: 'El cliente solicita la explicación del cobro de IPC.',
          },
        ],
      },
      {
        servicio: 'Pagos',
        nombreAmigable: 'Pagos',
        motivos: [
          {
            motivo: 'Pago no aplicado',
            nombreAmigable: 'Pago no aplicado',
            descripcion:
              'El cliente indica que realizó un pago, pero este no se refleja en su cuenta.',
          },
          {
            motivo: 'Consulta lugar/opcion de pago',
            nombreAmigable: 'Consulta de lugares y opciones de pago',
            descripcion:
              'El cliente consulta por los lugares y las opciones disponibles para pagar su boleta.',
          },
          {
            motivo: 'PAT-PAC (activ/desac/rechazo)',
            nombreAmigable: 'PAT / PAC: activación, desactivación o rechazo',
            destino: 'solucion',
            descripcion:
              'Gestión del PAT/PAC: activación, desactivación o rechazo del pago automático con tarjeta.',
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
        nombreAmigable: 'Seguimiento',
        destino: 'solucion',
        motivos: [
          {
            motivo: 'Seguimiento de Caso',
            nombreAmigable: 'Seguimiento de caso',
            descripcion: 'Se registra el seguimiento al estado de un caso generado previamente.',
            tentativo: true,
          },
          {
            motivo: 'Corte de llamado',
            nombreAmigable: 'Llamada cortada',
            descripcion:
              'La llamada se cortó antes de finalizar la gestión, ya sea por el cliente o por una falla del sistema.',
            tentativo: true,
          },
          {
            motivo: 'Devolución de llamada',
            nombreAmigable: 'Devolución de llamada',
            descripcion: 'Se deja registro de la devolución de llamada realizada al cliente.',
            tentativo: true,
          },
          {
            motivo: 'Derivado a Mesa de ayuda',
            nombreAmigable: 'Derivado a Mesa de Ayuda',
            descripcion: 'El caso se deriva a la Mesa de Ayuda para continuar con la gestión.',
            tentativo: true,
          },
          {
            motivo: 'Escalado a GIS',
            nombreAmigable: 'Escalado a GIS',
            descripcion: 'El caso se escala al área de GIS para su revisión.',
            tentativo: true,
          },
          {
            motivo: 'Escala  otra área/Super/Coord',
            nombreAmigable: 'Escalado a otra área, supervisor o coordinador',
            descripcion: 'El caso se escala a otra área, a un supervisor o a un coordinador.',
            tentativo: true,
          },
          {
            motivo: 'Rut sin Gestión',
            nombreAmigable: 'RUT sin gestión',
            descripcion: 'Se registra el RUT del cliente sin que exista una gestión asociada.',
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
        nombreAmigable: 'Campañas',
        destino: 'solucion',
        motivos: [
          {
            motivo: 'Confirma',
            nombreAmigable: 'Confirma campaña',
            descripcion: 'El cliente confirma su participación en la campaña.',
            tentativo: true,
          },
          {
            motivo: 'Reagenda',
            nombreAmigable: 'Reagenda campaña',
            descripcion:
              'El cliente reagenda la atención de la campaña para otra fecha u horario.',
            tentativo: true,
          },
          {
            motivo: 'Cancela',
            nombreAmigable: 'Cancela campaña',
            descripcion: 'El cliente cancela su participación en la campaña.',
            tentativo: true,
          },
          {
            motivo: 'Bienvenida',
            nombreAmigable: 'Llamada de bienvenida',
            descripcion: 'Llamada de bienvenida a un cliente nuevo.',
            tentativo: true,
          },
          {
            motivo: 'Venta/Cotización/Portabilidad',
            nombreAmigable: 'Venta, cotización o portabilidad',
            descripcion: 'Llamada de venta, cotización o portabilidad realizada al cliente.',
            tentativo: true,
          },
          {
            motivo: 'Agenda Visita (Certificada)',
            nombreAmigable: 'Agenda visita certificada',
            descripcion: 'El cliente agenda una visita técnica certificada.',
            tentativo: true,
          },
          {
            motivo: 'No agenda Visita Certificada',
            nombreAmigable: 'No agenda visita certificada',
            descripcion: 'El cliente no agenda la visita técnica certificada.',
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
        nombreAmigable: 'Servicio técnico',
        motivos: [
          {
            motivo: 'No funciona como esperado',
            nombreAmigable: 'El servicio no funciona como esperado',
            descripcion:
              'El servicio no opera como el cliente espera, lo que lo lleva a evaluar la baja.',
            tentativo: true,
          },
          {
            motivo: 'Fallas masivas',
            nombreAmigable: 'Fallas masivas del servicio',
            descripcion: 'El cliente reporta fallas masivas que afectan su servicio.',
            tentativo: true,
          },
          {
            motivo: 'Incumplimiento o no soluciona',
            nombreAmigable: 'Incumplimiento o no se soluciona',
            descripcion:
              'El cliente no logra una solución a su problema o no se cumple lo acordado.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Producto y propuesta valor',
        nombreAmigable: 'Producto y propuesta de valor',
        motivos: [
          {
            motivo: 'Productos no utilizados',
            nombreAmigable: 'Productos contratados no utilizados',
            descripcion:
              'El cliente no utiliza los productos contratados y por eso evalúa la baja.',
            tentativo: true,
          },
          {
            motivo: 'Oferta VTR menos atractiva',
            nombreAmigable: 'Oferta de VTR menos atractiva',
            descripcion:
              'El cliente considera que la oferta de VTR es menos atractiva que la de la competencia.',
            tentativo: true,
          },
          {
            motivo: 'No puede pagar',
            nombreAmigable: 'No puede pagar el servicio',
            descripcion: 'El cliente no puede pagar el servicio por motivos económicos.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Servicio comercial',
        nombreAmigable: 'Servicio comercial',
        motivos: [
          {
            motivo: 'Espera excesiva o no soluciona',
            nombreAmigable: 'Espera excesiva o caso sin solución',
            descripcion:
              'El cliente reporta una espera excesiva o que su caso no se soluciona.',
            tentativo: true,
          },
          {
            motivo: 'Boleta excesiva o incorrecta',
            nombreAmigable: 'Boleta excesiva o incorrecta',
            descripcion:
              'El cliente considera que su boleta es excesiva o presenta montos incorrectos.',
            tentativo: true,
          },
        ],
      },
      {
        servicio: 'Cambios en el cliente',
        nombreAmigable: 'Cambios en el cliente',
        motivos: [
          {
            motivo: 'Traslados',
            nombreAmigable: 'Traslado de servicio',
            descripcion:
              'El cliente solicita el traslado de su servicio a una nueva dirección.',
            tentativo: true,
          },
          {
            motivo: 'Fallecimiento/Cambio de Titular',
            nombreAmigable: 'Fallecimiento del titular o cambio de titular',
            descripcion: 'Cambio de titular del servicio por fallecimiento del titular actual.',
            tentativo: true,
          },
          {
            motivo: 'Domicilio Infactible',
            nombreAmigable: 'Domicilio infactible',
            descripcion:
              'El domicilio declarado por el cliente no es factible técnicamente para instalar o trasladar el servicio.',
            tentativo: true,
          },
        ],
      },
    ],
  },
]

/**
 * Plantillas del portal y las razones del catálogo que aplican a cada una.
 * Se usa en la vista de "Pasos" (`AsistentePasos`).
 */
export const PLANTILLAS_TIPIFICACION = [
  { id: 'n1', label: 'N1 Técnico', razones: ['Atención técnica', 'General'] },
  {
    id: 'general',
    label: 'Plantilla General',
    razones: ['General', 'Atención Comercial', 'Gestión Interna'],
  },
  { id: 'visita', label: 'Adelanto de visita', razones: ['Atención técnica'] },
  { id: 'genesys', label: 'Genesys', razones: ['Atención Outbound', 'Atención Retención'] },
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

/** Campo de Plantilla General que debe rellenar este motivo. */
export function destinoCampoMotivo(razon, servicio, motivo) {
  const nR = normalizarTexto(razon)
  const nS = normalizarTexto(servicio)
  const nM = normalizarTexto(motivo)
  if (nR === 'gestion interna' || nR === 'atencion outbound') return 'solucion'
  if (nS === 'transferencias') return 'solucion'
  if (nS === 'config/activaciones/desact') return 'solucion'
  if (nS === 'seguimiento') return 'solucion'
  if (nS === 'campanas') return 'solucion'
  if (nM === 'pat-pac (activ/desac/rechazo)') return 'solucion'
  return 'inconveniente'
}

function resolverDestino(razonNodo, serv, mot) {
  if (mot.destino === 'solucion' || mot.destino === 'inconveniente') return mot.destino
  if (serv.destino === 'solucion' || serv.destino === 'inconveniente') return serv.destino
  return destinoCampoMotivo(razonNodo.razon, serv.servicio, mot.motivo)
}

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
          servicioAmigable: serv.nombreAmigable || serv.servicio,
          motivo: mot.motivo,
          nombreAmigable: mot.nombreAmigable || mot.motivo,
          descripcion: mot.descripcion || '',
          uso: mot.uso || '',
          destino: resolverDestino(razon, serv, mot),
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

/** Busca en razón, servicio, motivo, nombres amigables y descripción. */
export function buscarTipificaciones(texto, limite = 40) {
  const q = normalizarTexto(texto)
  construirIndice()
  if (!q) return []
  const tokens = q.split(' ').filter(Boolean)
  const scored = []
  for (const fila of _cache.plano) {
    const razonN = normalizarTexto(fila.razon)
    const servN = normalizarTexto(fila.servicio)
    const servA = normalizarTexto(fila.servicioAmigable)
    const motN = normalizarTexto(fila.motivo)
    const amig = normalizarTexto(fila.nombreAmigable)
    const desc = normalizarTexto(fila.descripcion)
    const uso = normalizarTexto(fila.uso)
    const haystack = `${razonN} ${servN} ${servA} ${motN} ${amig} ${desc} ${uso}`
    if (!tokens.every((t) => haystack.includes(t))) continue
    let score = 0
    for (const t of tokens) {
      if (amig.includes(t)) score += 8
      if (motN.includes(t)) score += 6
      if (servA.includes(t) || servN.includes(t)) score += 4
      if (desc.includes(t) || uso.includes(t)) score += 2
    }
    if (amig.startsWith(q) || motN.startsWith(q)) score += 10
    scored.push({ fila, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limite).map((x) => x.fila)
}

/** Quantos motivos tiene el catálogo (para mostrar "N motivos"). */
export function totalMotivos() {
  construirIndice()
  return _cache.plano.length
}
