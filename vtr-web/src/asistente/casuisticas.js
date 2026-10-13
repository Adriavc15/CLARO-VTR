/**
 * Casuísticas: cuando el mensaje es corto/ambiguo ("rut", "cliente", "plan"),
 * ofrecemos alternativas en vez de volcar una guía completa.
 */

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Micro-pasos / hechos puntuales (respuesta corta cuando la intención es clara) */
export const MICRO_PASOS = [
  {
    id: 'micro-digitar-rut',
    titulo: 'Cómo digitar el RUT del cliente en Andes',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Andes → Clientes',
    sinonimos: [
      'digitar rut',
      'ingresar rut',
      'escribir rut',
      'buscar rut',
      'campo rut',
      'como poner el rut',
      'como buscar por rut',
      'como busco un cliente',
      'como busco un cliente en andes',
      'buscar cliente',
      'buscar un cliente en andes',
      'encontrar cliente',
    ],
    contenido: [
      'En Andes, ve a la pestaña **Clientes**.',
      'En el campo de búsqueda **Rut**, escribe el RUT del cliente (ej. 13366295-2).',
      'Presiona Enter o el ícono de consulta.',
      'En resultados, entra por la fila con clase **Cliente** (no Facturación ni Servicio).',
    ],
  },
  {
    id: 'micro-clase-cliente',
    titulo: 'Elegir la cuenta clase Cliente',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Andes → Resultados de búsqueda',
    sinonimos: ['clase cliente', 'seleccionar cliente', 'fila cliente', 'no facturacion'],
    contenido: [
      'En los resultados, mira la columna **Clase**.',
      'Haz clic en el RUT de la fila **Cliente** (primera / cuenta principal).',
      'No entres por Facturación ni Servicio para iniciar trámites.',
    ],
  },
  {
    id: 'micro-tv-sin-senal',
    titulo: 'Cliente no ve TV / sin señal',
    categoria: 'TV',
    tipo: 'micro',
    seccionPortal: 'Pasos → Visita Técnica',
    sinonimos: [
      'no ve tv',
      'sin senal',
      'sin senal tv',
      'el cliente no ve tv',
      'pantalla negra',
      'no tiene imagen',
      'no tiene senal',
      'no ve television',
    ],
    contenido: [
      'Confirma que el D-Box o decodificador esté encendido y con HDMI/coaxial bien conectados.',
      'Prueba otro HDMI y apaga/enciende el televisor y el decodificador.',
      'Si ya hizo esas pruebas y sigue sin imagen: en Andes genera **Visita Técnica** (Pasos → Visita Técnica).',
      'Subárea **Sin Señal**. En observación incluye **@TV@** y lo que ya se validó, para que el técnico no repita las mismas pruebas.',
    ],
  },
  {
    id: 'micro-productos-modificar',
    titulo: 'Ir a Productos Instalados y Modificar',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Andes → Resumen cliente',
    sinonimos: ['productos instalados', 'modificar producto', 'boton modificar'],
    contenido: [
      'En el resumen del cliente, baja a **Productos Instalados**.',
      'Selecciona la fila del producto/promoción activa.',
      'Haz clic en **Modificar** (barra superior de esa sección).',
    ],
  },
  {
    id: 'micro-actualizar-promocion',
    titulo: 'Actualizar promoción (cambio de plan)',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Andes → Productos Instalados',
    sinonimos: ['actualizar promocion', 'pegar nombre plan', 'nombre promocion'],
    contenido: [
      'Copia el nombre exacto del plan desde APEX → Planes.',
      'En Andes: Productos Instalados → **Actualizar promoción**.',
      'Pega el nombre exacto → selecciona → **Aceptar**.',
    ],
  },
  {
    id: 'micro-metodo-envio',
    titulo: 'Método de Envío y Generar documento',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Andes → Pedido de ventas',
    sinonimos: ['metodo de envio', 'generar documento', 'verificar pedido', 'enviar pedido'],
    contenido: [
      'En el pedido: **Verificar** (y TSQ si aplica).',
      'Método de Envío: Autoinstalación o Visita Técnica.',
      'Valida e-mail → **Generar documento** → **Enviar**.',
    ],
  },
  {
    id: 'micro-anular-pedido',
    titulo: 'Anular / cancelar pedido',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Andes → Cancelar pedido',
    sinonimos: ['anular pedido', 'cancelar pedido', 'incidencia de tramite'],
    contenido: [
      'Si hay pedido fallido o en curso que bloquea: **Cancelar pedido**.',
      'Motivo típico: **Incidencia de trámite**.',
      'Presiona **CONFIRMAR** para liberar la línea.',
    ],
  },
  {
    id: 'micro-control-remoto-catalogo',
    titulo: 'Agregar Control Remoto desde Catálogo',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → Control Remoto',
    sinonimos: ['agregar control remoto', 'cargo control remoto', 'delivery control'],
    contenido: [
      'En Pedido de ventas → pestaña **Catálogo**.',
      'Examinar → **Cargos y Descuentos No Recurrentes Fijo** → Cargos.',
      'Busca **Control Remoto** (~$6.000) → **Agregar ítem**.',
      'Revisa en Detalles que figure con acción Nuevo.',
    ],
  },
  {
    id: 'micro-dbox-equipos',
    titulo: 'Agregar d-BOX Smart II',
    categoria: 'ANDES',
    tipo: 'micro',
    seccionPortal: 'Contrataciones → D-Box',
    sinonimos: ['agregar dbox', 'decodificador smart', 'equipos television dbox'],
    contenido: [
      'En Detalles del pedido: línea **Television** → **Personalizar**.',
      'Avanza a **Equipos** → Decodificadores.',
      'Elige **d-BOX Smart II**, Cant. 1 → **Agregar ítem** (~$2.990/mes).',
    ],
  },
]

/**
 * Ambiguos: palabra corta → menú de casuísticas.
 * `pregunta` es el texto que se envía al hacer clic (intención clara).
 */
export const CASUISTICAS = {
  rut: {
    aperturas: [
      'Con **rut** puedo ayudarte de varias formas… ¿cuál necesitas?',
      'Ok, **rut**. ¿Qué quieres ver exactamente?',
    ],
    opciones: [
      { label: 'Cómo digitar / buscar el RUT del cliente en Andes', pregunta: 'Cómo digitar el RUT del cliente en Andes' },
      { label: 'Elegir la cuenta clase Cliente (no Facturación)', pregunta: 'Cómo seleccionar la clase Cliente después de buscar el RUT' },
      { label: 'Proceso de inhibición de cobranza', pregunta: 'Proceso de inhibición de cobranza' },
      { label: 'Inconveniente con un pago', pregunta: 'pago' },
      { label: 'Proceso / tip de facturación o boleta', pregunta: 'factura' },
      { label: 'Validar deuda al vender', pregunta: 'Cómo revisar la deuda en la venta' },
    ],
  },
  cliente: {
    aperturas: [
      'Cuando dices **cliente**, puede ser varias cosas. ¿Cuál te sirve?',
      'Ok, **cliente**… dime hacia dónde vamos:',
    ],
    opciones: [
      { label: 'Buscar cliente por RUT en Andes', pregunta: 'Cómo digitar el RUT del cliente en Andes' },
      { label: 'Seleccionar la clase Cliente en resultados', pregunta: 'Cómo seleccionar la clase Cliente después de buscar el RUT' },
      { label: 'Ir a Productos Instalados y Modificar', pregunta: 'Cómo ir a Productos Instalados y Modificar' },
      { label: 'Cambio de plan del cliente', pregunta: 'Paso a paso cambio de plan' },
      { label: 'Cobrar control remoto al cliente', pregunta: 'Cómo agregar control remoto en Andes' },
    ],
  },
  andes: {
    aperturas: [
      'Andes es amplio. ¿Qué parte necesitas?',
      'Dale, Andes… ¿qué estás haciendo ahora?',
    ],
    opciones: [
      { label: 'Buscar por RUT / digitar RUT', pregunta: 'Cómo digitar el RUT del cliente en Andes' },
      { label: 'Control Remoto (completo)', pregunta: 'Paso a paso control remoto' },
      { label: 'Cambio de plan', pregunta: 'Paso a paso cambio de plan' },
      { label: 'Agregar D-Box', pregunta: 'Cómo agregar un D-Box' },
      { label: 'Anular un pedido', pregunta: 'Cómo anular un pedido en Andes' },
    ],
  },
  contrataciones: {
    aperturas: [
      'En **Contrataciones** tengo estas guías. ¿Cuál necesitas?',
      'Ok, contrataciones… elige una opción:',
    ],
    opciones: [
      { label: 'Asistencia VTR ($1.990/mes)', pregunta: 'Asistencia VTR qué es y cómo contratar' },
      { label: 'Control Remoto — precio $6.000', pregunta: 'cuanto cuesta el control remoto' },
      { label: 'Control Remoto — paso a paso Andes', pregunta: 'Paso a paso control remoto' },
      { label: 'Delivery equipos $3.000', pregunta: 'cuanto sale el delivery del control' },
      { label: 'Cambio de plan (paso a paso + imágenes)', pregunta: 'Paso a paso cambio de plan' },
      { label: 'D-Box Smart II ($2.990/mes)', pregunta: 'Cómo agregar un D-Box' },
      { label: 'Ubicación WiFi del D-Box', pregunta: 'Ubicación WiFi del D-Box' },
      { label: 'Ver todos los costos / precios', pregunta: 'Costos de Contrataciones' },
    ],
  },
  'control remoto': {
    aperturas: [
      '¿**Control remoto**? Dime qué necesitas:',
      'Ok, control remoto… elige:',
    ],
    opciones: [
      { label: 'Precio del control ($6.000)', pregunta: 'cuanto cuesta el control remoto' },
      { label: 'Delivery / despacho ($3.000)', pregunta: 'cuanto sale el delivery del control' },
      { label: 'Total control + delivery', pregunta: 'son 6000 mas 3000 de delivery' },
      { label: 'Perdí el control / repuesto', pregunta: 'perdi el control cuanto cuesta' },
      { label: 'No funciona / dañado', pregunta: 'el control no funciona' },
      { label: 'Autoinstalación o Visita Técnica', pregunta: 'como me entregan el control' },
      { label: 'Paso a paso en Andes (Siebel)', pregunta: 'Paso a paso control remoto' },
      { label: 'Control adicional', pregunta: 'puedo pedir un control adicional' },
    ],
  },
  plan: {
    aperturas: [
      '¿**Plan** / cambio de plan? Elige:',
      'Ok, plan… ¿cuál casuística?',
    ],
    opciones: [
      { label: 'Quiero cambiarme de plan (cliente)', pregunta: 'quiero cambiarme de plan' },
      { label: 'Más megas / 600 / velocidad', pregunta: 'quiero mas megas' },
      { label: 'Consultar oferta en APEX', pregunta: 'como busco el plan en APEX' },
      { label: 'Actualizar promoción en Andes', pregunta: 'donde esta actualizar promocion' },
      { label: 'Verificar → TSQ → Enviar', pregunta: 'primero va verificar o TSQ' },
      { label: 'Anular trámite / liberar línea', pregunta: 'hay un pedido anterior en curso' },
      { label: 'Paso a paso completo (+ imágenes)', pregunta: 'Paso a paso cambio de plan' },
      { label: 'Catálogo de planes del portal', pregunta: 'planes' },
    ],
  },
  'cambio de plan': {
    aperturas: [
      '¿**Cambio de plan**? ¿Cliente o gestión Andes?',
      'Ok, cambio de plan… elige:',
    ],
    opciones: [
      { label: 'Cliente quiere cambiarse', pregunta: 'quiero cambiarme de plan' },
      { label: 'APEX — copiar denominación', pregunta: 'que nombre debo copiar desde APEX' },
      { label: 'Andes — Actualizar promoción', pregunta: 'donde esta actualizar promocion' },
      { label: 'Cuenta Cliente (no Facturación)', pregunta: 'selecciono facturacion o cliente' },
      { label: 'Finalizar: Verificar / TSQ / Enviar', pregunta: 'despues de actualizar que hago' },
      { label: 'Anular trámite previo', pregunta: 'como anulo un cambio de plan' },
      { label: 'Mantener TV al cambiar', pregunta: 'quiero cambiarme pero mantener mi tv' },
      { label: 'Guía completa con imágenes', pregunta: 'Paso a paso cambio de plan' },
    ],
  },
  dbox: {
    aperturas: [
      '¿**D-Box / decodificador**? Elige:',
      'Ok, d-BOX Smart II…',
    ],
    opciones: [
      { label: 'Precio $2.990/mes', pregunta: 'cuanto cuesta el D-Box' },
      { label: 'Paso a paso contratar en Andes', pregunta: 'Cómo agregar un D-Box' },
      { label: 'Personalizar Television → Equipos', pregunta: 'donde agrego el dbox en el pedido' },
      { label: 'Método de Envío / Enviar', pregunta: 'visita tecnica para el dbox' },
      { label: 'Netflix error / no reproduce en D-Box', pregunta: 'problemas con netflix dbox smart error 001' },
      { label: 'Ubicación WiFi del D-Box', pregunta: 'Ubicación WiFi del D-Box' },
    ],
  },
  planes: {
    aperturas: [
      'En **Planes** del portal tengo estas categorías (con precios). ¿Cuál miramos?',
      'Ok, planes… elige un grupo:',
    ],
    opciones: [
      { label: 'Fibra 600 — promo $14.990 / lista $21.990', pregunta: 'Fibra 600 Megas' },
      { label: 'Fibra 600 + Netflix — promo $19.990', pregunta: 'Fibra 600 Megas + Netflix' },
      { label: 'Stream TV Premium I — $28.990', pregunta: 'Stream TV Premium I' },
      { label: '2P Fibra 600 + TV Full — promo $37.990', pregunta: 'Fibra 600 + TV Full' },
      { label: '3P Fibra 600 + TV Full + Fono — promo $44.990', pregunta: 'Fibra 600 + TV Full + Telefonía' },
      { label: 'TV Premium (Cable) — $28.990', pregunta: 'TV Premium (Cable)' },
      { label: 'Ver más precios / costos contrataciones', pregunta: 'Costos de Contrataciones' },
    ],
  },
  streaming: {
    aperturas: [
      'En **Streaming** puedo ayudarte con esto. ¿Qué necesitas?',
      'Ok, streaming / OTT… elige:',
    ],
    opciones: [
      { label: 'Netflix — planes y precios', pregunta: 'cuanto cuesta Netflix' },
      { label: 'Disney+ — planes / ESPN / 4K', pregunta: 'cuanto sale Disney' },
      { label: 'Crunchyroll — Fan / Mega Fan', pregunta: 'cuanto sale crunchyroll' },
      { label: 'TNT Sports Pack (con Max)', pregunta: 'cuanto sale TNT Sports' },
      { label: 'Pack Adulto — precio y canales', pregunta: 'cuanto sale pack adulto' },
      { label: 'Pack Adulto — pitch / objeciones', pregunta: 'speech o pitch para vender pack adulto' },
      { label: 'Comparar / 4 pantallas / más barato', pregunta: 'plataforma mas barata' },
      { label: 'CONTACTESE CON VTR / no puedo entrar', pregunta: 'me sale CONTACTESE CON VTR' },
      { label: 'Netflix en D-Box Smart / error 001', pregunta: 'problemas con netflix dbox smart error 001' },
      { label: 'Planes fibra que incluyen Netflix', pregunta: 'Planes que incluyen Netflix' },
      { label: 'Transferir a OTT', pregunta: 'Transferir a OTT streaming' },
    ],
  },
  costos: {
    aperturas: [
      '¿**Costos / precios** de qué? Elige:',
      'Ok, precios… ¿cuál referencia?',
    ],
    opciones: [
      { label: 'Precios de planes (fibra / TV / packs)', pregunta: 'planes' },
      { label: 'Control Remoto $6.000 + Delivery $3.000', pregunta: 'cuanto cuesta el control remoto' },
      { label: 'D-Box Smart II $2.990/mes', pregunta: 'Cómo agregar un D-Box' },
      { label: 'Asistencia VTR $1.990/mes', pregunta: 'Asistencia VTR qué es y cómo contratar' },
      { label: 'Planes con Netflix (precios)', pregunta: 'Planes que incluyen Netflix' },
    ],
  },
  pedido: {
    aperturas: ['¿**Pedido** en qué sentido?', 'Ok, pedido… elige:'],
    opciones: [
      { label: 'Verificar, documento y Enviar', pregunta: 'Cómo verificar y enviar un pedido en Andes' },
      { label: 'Anular / cancelar pedido', pregunta: 'Cómo anular un pedido en Andes' },
      { label: 'Método de Envío (Autoinstalación / Visita)', pregunta: 'Cómo elegir Método de Envío en el pedido' },
      { label: 'Agregar ítem desde Catálogo (control remoto)', pregunta: 'Cómo agregar control remoto desde el catálogo' },
    ],
  },
  factura: {
    aperturas: ['¿**Facturación** / boleta? Elige:', 'Ok, facturación… ¿qué necesitas?'],
    opciones: [
      { label: 'Regularización boleta agosto (retraso emisión)', pregunta: 'Regularización emisión de boleta agosto' },
      { label: 'Speech boleta agosto', pregunta: 'Speech regularización boleta agosto' },
      { label: 'Verificaciones: ¿qué tipo de problema de pago es?', pregunta: 'Verificaciones previas inconveniente con pago' },
      { label: 'Plazos según recaudador', pregunta: 'Plazos para que se refleje un pago según recaudador' },
      { label: 'Inhibición de cobranza', pregunta: 'Proceso de inhibición de cobranza' },
      { label: 'Revisar deuda', pregunta: 'Cómo revisar la deuda del cliente' },
    ],
  },
  pago: {
    aperturas: [
      'Ok, **pago**… ¿cuál casuística te late?',
      'Con **pago** hay varias rutas. Elige una:',
    ],
    opciones: [
      { label: 'Verificaciones previas (diagnosticar el caso)', pregunta: 'Verificaciones previas inconveniente con pago' },
      { label: 'Plazos / cuándo se refleja el pago', pregunta: 'Plazos para que se refleje un pago según recaudador' },
      { label: 'Pago no aplicado', pregunta: 'Matriz pago no aplicado qué hacer' },
      { label: 'Pago no asignado (sin asignar / saldo a favor)', pregunta: 'Matriz pago no asignado qué hacer' },
      { label: 'Traslado de pago (otra cuenta / boleta / duplicado)', pregunta: 'Matriz traslado de pago qué hacer' },
      { label: 'Servicio suspendido y cuenta pagada', pregunta: 'Servicio suspendido y cuenta pagada qué hacer' },
      { label: 'Reversa de pago', pregunta: 'Matriz reversa de pago qué hacer' },
      { label: 'Reglas al ingresar la SS', pregunta: 'Reglas al ingresar SS por pago' },
      { label: 'Speech / qué decirle al cliente (pago no aplicado)', pregunta: 'Speech pago no aplicado' },
      { label: 'Escalamiento por correo (PNA no resuelto)', pregunta: 'Escalamiento pago no aplicado correo' },
    ],
  },
  inhibicion: {
    aperturas: ['Inhibición… ¿esto te sirve?', 'Ok, inhibición:'],
    opciones: [
      { label: 'Ver Inhibición en Pasos', pregunta: 'Dónde está Inhibición en el portal' },
      { label: 'Flujo de inhibición de cobranza', pregunta: 'Proceso de inhibición de cobranza' },
      { label: 'Usar inhibición con pago no aplicado (6 días)', pregunta: 'Matriz pago no aplicado qué hacer' },
      { label: 'Relacionado: revisar deuda', pregunta: 'Cómo revisar la deuda del cliente' },
    ],
  },
  modem: {
    aperturas: ['¿Modem / ONT / internet? Elige:', 'Ok, modem o sin internet…'],
    opciones: [
      { label: 'Luz LOS roja / cajita roja', pregunta: 'Luz LOS en rojo qué significa' },
      { label: 'Luz PON (apagada / verde / sin navegar)', pregunta: 'Qué significa la luz PON' },
      { label: 'ONT no enciende / luces apagadas', pregunta: 'Mi ONT no enciende' },
      { label: 'Luces OK pero sin Internet', pregunta: 'PON verde pero no tengo internet' },
      { label: 'Wi-Fi conectado sin Internet', pregunta: 'Tengo Wi-Fi pero no tengo internet' },
      { label: 'Después de corte de luz / moví la cajita', pregunta: 'Se fue la luz y después no volvió el internet' },
      { label: 'Significado de las luces ONT', pregunta: 'Qué significan las luces de la ONT' },
      { label: 'Reiniciar ONT', pregunta: 'Cómo reinicio la ONT' },
      { label: '¿Necesito técnico?', pregunta: 'Necesito un técnico' },
      { label: 'Procedimiento 997 FTTH/HFC', pregunta: 'Inconvenientes Internet FTTH HFC' },
    ],
  },
  internet: {
    aperturas: [
      '¿**Internet** (sin servicio / lento / intermitente)? Elige:',
      'Ok, inconvenientes de internet…',
    ],
    opciones: [
      { label: 'Triaje rápido sin Internet', pregunta: 'Por qué no tengo internet' },
      { label: 'LOS / luz roja en la ONT', pregunta: 'No tengo internet y el LOS está rojo' },
      { label: 'PON OK pero no navego', pregunta: 'PON verde pero no tengo internet' },
      { label: 'Wi-Fi conectado pero no navega', pregunta: 'Aparece conectado pero no navega' },
      { label: 'Wi-Fi lento o se cae', pregunta: 'El Wi-Fi está lento' },
      { label: 'Después de un evento (luz / mudanza)', pregunta: 'Después del corte de luz no tengo internet' },
      { label: 'Visita técnica', pregunta: 'Necesito un técnico' },
      { label: 'Visión general ID 997', pregunta: 'Inconvenientes Internet FTTH HFC' },
      { label: 'Descartar falla masiva', pregunta: 'Descarta una falla masiva internet' },
    ],
  },
  ont: {
    aperturas: [
      '¿**ONT / cajita de fibra**? Dime qué ves o elige:',
      'Ok, ONT… ¿qué indicador o síntoma?',
    ],
    opciones: [
      { label: 'LOS rojo / parpadea', pregunta: 'Luz LOS en rojo qué significa' },
      { label: 'PON apagada o parpadeando', pregunta: 'Mi PON está apagada' },
      { label: 'PON verde sin Internet', pregunta: 'PON verde pero no tengo internet' },
      { label: 'No enciende / sin luces', pregunta: 'Mi ONT no enciende' },
      { label: 'Qué es la ONT / vs módem', pregunta: 'La ONT es lo mismo que el módem' },
      { label: 'Cómo sé si es fibra o router', pregunta: 'Cómo sé si el problema es la fibra o el router' },
      { label: 'Reinicio de ONT', pregunta: 'Puedo reiniciar la ONT' },
      { label: 'Cable de fibra (doblar / dañado)', pregunta: 'Puedo doblar el cable de fibra' },
      { label: 'Visita técnica / LOS sigue rojo', pregunta: 'Qué pasa si el LOS sigue rojo' },
      { label: 'Glosario de luces', pregunta: 'Qué significan las luces de la ONT' },
    ],
  },
  deuda: {
    aperturas: ['¿Deuda / cobranza? Opciones:', 'Ok, deuda…'],
    opciones: [
      { label: 'Cómo revisar la deuda', pregunta: 'Cómo revisar la deuda del cliente' },
      { label: 'Regularización boleta agosto (30 días sin cobranza)', pregunta: 'Regularización emisión de boleta agosto' },
      { label: 'Diagnóstico inconveniente con pago', pregunta: 'Verificaciones previas inconveniente con pago' },
      { label: 'Inhibición de cobranza', pregunta: 'Proceso de inhibición de cobranza' },
      { label: 'Pago no aplicado', pregunta: 'Matriz pago no aplicado qué hacer' },
    ],
  },
  sucursal: {
    aperturas: [
      '¿**Sucursal** / horarios? Dime qué necesitas:',
      'Ok, sucursales… elige o escribe la comuna:',
    ],
    opciones: [
      { label: 'Horarios Fiestas Patrias (17–20 sep)', pregunta: 'Horarios Fiestas Patrias sucursales delivery visitas' },
      { label: 'Cómo buscar sucursales en vtr.com', pregunta: 'Cómo buscar sucursales y horarios en vtr.com' },
      { label: 'Horarios sucursales Región Metropolitana', pregunta: 'Sucursales y horarios Región Metropolitana' },
      { label: 'Sucursales Providencia', pregunta: 'Sucursales y horarios en Providencia' },
      { label: 'Sucursales Maipú', pregunta: 'Sucursales y horarios en Maipú' },
      { label: 'Sucursales Valparaíso', pregunta: 'Sucursales y horarios en Valparaíso' },
      { label: 'Sucursales Concepción', pregunta: 'Sucursales y horarios en Concepción' },
    ],
  },
  feriado: {
    aperturas: [
      '¿Horarios de **Fiestas Patrias**? Elige:',
      'Ok, feriado / Fiestas Patrias…',
    ],
    opciones: [
      { label: 'Visitas técnicas (17–20 sep)', pregunta: 'Fiestas Patrias agendamiento visitas técnicas' },
      { label: 'Delivery y Express Chips', pregunta: 'Fiestas Patrias delivery tradicional y express chips' },
      { label: 'Horario de sucursales', pregunta: 'Fiestas Patrias horario atención sucursales' },
      { label: 'Resumen para informar al cliente', pregunta: 'Qué informar al cliente Fiestas Patrias' },
    ],
  },
  mudanza: {
    aperturas: [
      '¿**Traslado** / cambio de domicilio? Elige:',
      'Ok, mudanza… ¿qué necesitas?',
    ],
    opciones: [
      { label: 'Visión general del procedimiento (ID 1058)', pregunta: 'Traslado de Servicios Cambio de Domicilio' },
      { label: 'Consideraciones y requisitos', pregunta: 'Consideraciones traslado de servicios' },
      { label: 'Factibilidad HFC / FTTH / DUAL', pregunta: 'Tabla factibilidad red traslado HFC FTTH' },
      { label: 'Matriz Call Center', pregunta: 'Matriz traslado CALL CENTER VOZ Y NO VOZ' },
      { label: 'Matriz N1 Comercial', pregunta: 'Matriz traslado N1 COMERCIAL' },
      { label: 'Matriz Sucursales', pregunta: 'Matriz traslado SUCURSALES' },
      { label: 'Paso a paso en Andes', pregunta: 'Paso a paso traslado en Andes' },
      { label: 'Validar dirección en GIS', pregunta: 'Validar dirección en GIS traslado' },
    ],
  },
  titular: {
    aperturas: [
      '¿**Cambio de titular**? Elige:',
      'Ok, titularidad… ¿qué necesitas?',
    ],
    opciones: [
      { label: 'Visión general (ID 1346)', pregunta: 'Cambio de Titular Fijo procedimiento' },
      { label: 'Requisitos y consideraciones', pregunta: 'Consideraciones importantes cambio de titular' },
      { label: 'Importantes en la atención', pregunta: 'Importantes en la atención cambio de titular' },
      { label: 'Gestión en Sucursales', pregunta: 'Matriz cambio titular sucursales gestión' },
      { label: 'Speech Call Center / digital', pregunta: 'Speech cambio de titular call center' },
      { label: 'Cómo registrar (desconexión / venta)', pregunta: 'Registrar atención cambio de titular' },
    ],
  },
}

/** Patrones que ya dejan clara la intención → no pedir alternativas */
const INTENCION_CLARA =
  /\b(como|cómo|paso a paso|digitar|ingresar|escribir|buscar por|seleccionar|agregar|anular|cancelar|actualizar|generar documento|enviar pedido|cobrar|contratar|matriz|verificaciones|plazos|speech|escalamiento|reglas al|cuanto|cuesta|cubre|busco|buscar|no funciona|no responde)\b/

/**
 * Detecta si la pregunta es ambigua y debe mostrar casuísticas.
 * @returns {{ clave: string, aperturas: string[], opciones: {label, pregunta}[] } | null}
 */
export function detectarCasuistica(pregunta) {
  const q = norm(pregunta)
  if (!q) return null

  // Ya es específica → responder directo
  if (INTENCION_CLARA.test(q) && q.split(' ').length >= 3) return null
  if (q.split(' ').length >= 6) return null

  // Match por clave (palabra sola o frase muy corta)
  const tokens = q.split(' ')
  const claves = Object.keys(CASUISTICAS)

  if (
    /^(contrataciones?|contratacion andes)$/.test(q) ||
    (tokens.length <= 3 && /\bcontratacion(es)?\b/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'contrataciones', ...CASUISTICAS.contrataciones }
  }
  if (
    /^(planes|catalogo de planes|ofertas fibra)$/.test(q) ||
    (tokens.length <= 2 && /\bplanes\b/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'planes', ...CASUISTICAS.planes }
  }
  if (
    /^(streaming|ott|plataformas streaming)$/.test(q) ||
    (tokens.length <= 2 && /\b(streaming|ott)\b/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'streaming', ...CASUISTICAS.streaming }
  }
  if (
    /^(control remoto|control|mando|contro)$/.test(q) ||
    (tokens.length <= 3 &&
      /\b(control remoto|control|mando)\b/.test(q) &&
      !INTENCION_CLARA.test(q) &&
      !/precio|cuanto|cuesta|sale|perdi|paso a paso|andes/.test(q))
  ) {
    return { clave: 'control remoto', ...CASUISTICAS['control remoto'] }
  }
  if (
    /^(cambio de plan|cambiar plan|actualizar promocion)$/.test(q) ||
    (tokens.length <= 4 &&
      /\b(cambio de plan|cambiar plan|actualizar promocion)\b/.test(q) &&
      !INTENCION_CLARA.test(q) &&
      !/paso a paso|apex|anular|tsq|600/.test(q))
  ) {
    return { clave: 'cambio de plan', ...CASUISTICAS['cambio de plan'] }
  }
  if (
    /^(dbox|d-box|d box|decodificador|smart ii)$/.test(q) ||
    (tokens.length <= 3 && /\b(dbox|d-box|decodificador|smart ii)\b/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'dbox', ...CASUISTICAS.dbox }
  }
  if (
    /^(precio|precios|costo|costos|cuanto cuesta|valores?|tarifas?)$/.test(q) ||
    (tokens.length <= 3 &&
      /\b(precio|precios|costo|costos|cuanto cuesta)\b/.test(q) &&
      !INTENCION_CLARA.test(q) &&
      !/\b(netflix|hbo|max|disney|prime|crunchy|d-?box|control|asistencia|600|800|940)\b/.test(q))
  ) {
    return { clave: 'costos', ...CASUISTICAS.costos }
  }

  for (const clave of claves) {
    const c = norm(clave)
    // "rut", "el rut", "rut cliente" corto, etc.
    if (q === c || q === `el ${c}` || q === `la ${c}` || q === `un ${c}`) {
      return { clave, ...CASUISTICAS[clave] }
    }
    if (tokens.length <= 3 && tokens.includes(c)) {
      if (/\b(600|800|940|netflix|hbo|max|disney|prime|crunchy|fibra)\b/.test(q)) continue
      if (clave === 'internet' && /\bsolo\b/.test(q) && !/\bsin internet\b/.test(q)) continue
      return { clave, ...CASUISTICAS[clave] }
    }
  }

  // Alias
  if (/^(boleta|facturacion|factura)$/.test(q) || (tokens.length <= 2 && /factura|boleta/.test(q))) {
    return { clave: 'factura', ...CASUISTICAS.factura }
  }
  if (
    /^(boleta agosto|regularizacion boleta|boleta atrasada)$/.test(q) ||
    (tokens.length <= 4 && /boleta.*agosto|agosto.*boleta|retraso.*boleta/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'factura', ...CASUISTICAS.factura }
  }
  if (/inhib/.test(q) && tokens.length <= 3) {
    return { clave: 'inhibicion', ...CASUISTICAS.inhibicion }
  }
  if (
    /^(sucursal|sucursales|horario|horarios)$/.test(q) ||
    (tokens.length <= 3 && /\b(sucursal|sucursales|horario sucursal)\b/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'sucursal', ...CASUISTICAS.sucursal }
  }
  if (
    /^(feriado|fiestas patrias|18 septiembre|19 septiembre)$/.test(q) ||
    (tokens.length <= 4 && /\b(fiestas patrias|feriado irrenunciable|horario feriado)\b/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'feriado', ...CASUISTICAS.feriado }
  }
  // Traslado de servicios / mudanza (no confundir con traslado de pago)
  if (
    !/traslado de pago/.test(q) &&
    (/^(traslado|mudanza|cambio de domicilio|trasladar)$/.test(q) ||
      (tokens.length <= 6 &&
        /\b(traslado|mudanza|cambio de domicilio|trasladar servicio)\b/.test(q) &&
        !INTENCION_CLARA.test(q) &&
        !/\bpago\b/.test(q)))
  ) {
    return { clave: 'mudanza', ...CASUISTICAS.mudanza }
  }
  // Cambio de titular
  if (
    /^(titular|titularidad|cambio de titular|cambio titular)$/.test(q) ||
    (tokens.length <= 4 &&
      /\b(cambio de titular|cambio titular|nuevo titular|titularidad)\b/.test(q) &&
      !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'titular', ...CASUISTICAS.titular }
  }
  // Internet / sin servicio / lento / ONT
  if (
    /^(sin internet|internet lento|intermitencia|ftth|hfc|ont|led los|los|pon|cajita)$/.test(q) ||
    (tokens.length <= 4 &&
      /\b(sin internet|internet lento|intermitencia|inconveniente(s)? internet|ont offline|led los|luz los|cajita roja|luz roja)\b/.test(
        q
      ) &&
      !INTENCION_CLARA.test(q))
  ) {
    if (/\b(ont|los|pon|cajita|luz roja|led)\b/.test(q)) {
      return { clave: 'ont', ...CASUISTICAS.ont }
    }
    return { clave: 'internet', ...CASUISTICAS.internet }
  }
  if (
    /^(ont|los|pon|cajita|modem fibra)$/.test(q) ||
    (tokens.length <= 3 && /\b(ont|luz los|led los|luz pon)\b/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'ont', ...CASUISTICAS.ont }
  }
  // Pago / PNA / casuísticas de pago
  if (
    /^(pago|pagos|pna|comprobante)$/.test(q) ||
    (tokens.length <= 3 && /^(pago|pagos)\b/.test(q) && !INTENCION_CLARA.test(q))
  ) {
    return { clave: 'pago', ...CASUISTICAS.pago }
  }
  if (/pago no aplicado|pago no asignado|traslado de pago|reversa de pago|inconveniente con (un )?pago/.test(q) && tokens.length <= 5) {
    // Frases cortas de casuística → menú pago (si aún es ambiguo tipo solo el nombre)
    if (/^(pago no aplicado|pago no asignado|traslado de pago|reversa de pago|inconveniente con pago|inconveniente con un pago)$/.test(q)) {
      return { clave: 'pago', ...CASUISTICAS.pago }
    }
  }

  return null
}

export function textoCasuistica(casu) {
  const apertura = casu.aperturas[Math.floor(Math.random() * casu.aperturas.length)]
  return `${apertura}\n\n_Toca una opción abajo o escribe el número / lo que necesitas._`
}

/** Si el usuario responde "1" / "2" tras una casuística, resuelve a la pregunta */
export function resolverOpcionCasuistica(texto, casuisticaActiva) {
  if (!casuisticaActiva?.opciones?.length) return null
  const t = String(texto || '').trim()
  const num = t.match(/^(\d+)[\.)]?$/)
  if (num) {
    const idx = parseInt(num[1], 10) - 1
    return casuisticaActiva.opciones[idx]?.pregunta || null
  }
  const q = norm(t)
  const hit = casuisticaActiva.opciones.find(
    (o) => norm(o.label).includes(q) || norm(o.pregunta).includes(q) || q.includes(norm(o.label).slice(0, 12))
  )
  return hit?.pregunta || null
}
