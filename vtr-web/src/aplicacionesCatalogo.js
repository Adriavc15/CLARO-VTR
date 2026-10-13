/**
 * Catálogo de Aplicaciones (vista tipo app + modal).
 * Textos exactos de ¿PARA QUÉ SIRVE?
 */

export const APLICACIONES_EXCEL = [
  {
    seccion: 'RECURSOS APEX',
    filas: [
      {
        nombre: 'Entrenamiento',
        url: 'https://cdevirtual.cl/login/index.php',
        logo: '/entrenamiento.png',
        paraQue: `Plataforma de capacitación / pruebas CDE Virtual.

Ingresar a cursos, evaluaciones y material de formación del asesor.`,
      },
      {
        nombre: 'Mailito',
        url: 'https://mail.apexamerica.com/WorldClient.dll?View=Main',
        logo: '/MAILITO.png',
        paraQue: `Correo corporativo Apex America (WorldClient).

Revisar y enviar correos institucionales del asesor.`,
      },
      {
        nombre: 'HUMAND',
        url: 'https://app.humand.co/',
        logo: '/humand.png',
        paraQue: `Aplicación de RR.HH. / comunidad Humand.

Consultar comunicaciones internas, beneficios y gestiones de personas.`,
      },
      {
        nombre: 'Omnia',
        url: 'https://dashboards-apexpe.omnia.la/login',
        logo: '/omnia.png',
        paraQue: `Dashboards Omnia / marcado de asistencia Apex.

Ingresar a paneles de control y marcar asistencia.`,
      },
      {
        nombre: 'Mis Gestiones',
        url: 'https://misgestiones.apexamerica.com/',
        logo: '/MISGESTIONES.png',
        paraQue: `Portal de solicitudes e incidentes de Apex America, donde el asesor crea y da seguimiento a sus gestiones.

🔝 Destacadas:
• Solicitud: crear una nueva solicitud.
• Aplicaciones/Páginas de Apex: incidentes para ingresar a alguna aplicación/página de Apex.
• VPN: incidentes relacionados con conectarse a la VPN.
• Aplicaciones/Páginas del Cliente: problemas de ingreso/logueo en páginas o aplicaciones de la cuenta.
• Atestados Médicos: gestionar atestados médicos.
• Windows: inconvenientes para acceder a Windows.

📁 Otras categorías:
• Atención al Personal y Administración de Personal: crear solicitudes de personal.
• Ciberseguridad: peticiones de accesos a sistemas, ataques, virus y vulnerabilidades.`,
      },
    ],
  },
  {
    seccion: 'HERRAMIENTAS GENERALES',
    filas: [
      {
        nombre: 'Streaming OOT',
        url: 'https://vtr.production-webops.clbo-hubtv.com/',
        logo: '/streaming.png',
        paraQue: `Portal de streaming OOT (Out of the box / Hub TV).

Gestionar o consultar servicios de streaming asociados a la atención.`,
      },
      {
        nombre: 'Videos de Ayuda',
        url: 'https://drive.google.com/drive/u/1/folders/16Cy_rkV4jTGr5KavKTQTtTSQJDdHIP2n',
        logo: '/apexplay.png',
        paraQue: `Carpeta de Google Drive con videos de ayuda.

Consultar material audiovisual de apoyo para procedimientos y atención.`,
      },
      {
        nombre: 'REGISTRO CIVIL',
        url: 'https://www.registrocivil.cl/principal/servicios-en-linea/consulta-vigencia-documento-1',
        logo: '/GBCHILE.png',
        paraQue: `Sirve para verificar si un documento chileno está vigente o vencido, ingresando:

RUT de la persona.
Tipo de documento (por ejemplo, cédula de identidad o pasaporte).
Número del documento.

En un contexto de atención de call center, esta consulta puede servir para validar la vigencia de la cédula/documentación del cliente cuando el procedimiento requiera comprobar que su documento está válido.`,
      },
      {
        nombre: 'BLUE EXPRESS',
        url: 'https://ecommerce.blue.cl/auth/login',
        logo: '/bluexpress.png',
        paraQue: `📦 ¿Para qué sirve?

La plataforma permite gestionar los envíos de productos/pedidos de un negocio con Blue Express.

Entre sus funciones están:

🏷️ Generar etiquetas de envío
📦 Gestionar envíos unitarios o múltiples
🚚 Coordinar la entrega de pedidos mediante Blue Express
🔎 Realizar seguimiento de los envíos
🏪 Utilizar los puntos de entrega de Blue Express
🔄 Gestionar opciones relacionadas con devoluciones, según la integración utilizada.

🧠 PEDIDOS DE DELIVERYS:

BLUE EXPRESS ECOMMERCE = GESTIÓN DE ENVÍOS
📦 Permite gestionar los despachos de productos/pedidos mediante Blue Express.`,
      },
    ],
  },
  {
    seccion: 'APLICATIVOS',
    filas: [
      {
        nombre: 'ANDES',
        url: 'http://siebelprd.vtr.cl:2080/ecommunications_ldap_esn/start.swe?SWECmd=Start&SWEHo=siebelprd.vtr.cl',
        logo: '/andes.png',
        paraQue: `Andes te sirve para gestionar la atención del cliente y consultar el historial/estado de sus requerimientos.

Cliente llama → identificas su cuenta → revisas sus solicitudes → ves qué se hizo anteriormente → registras/actualizas la gestión → generas o consultas el requerimiento correspondiente.`,
      },
      {
        nombre: 'SOMOS CLAVE',
        url: 'https://somosclave.cl/',
        logo: '/somosclave.png',
        paraQue: `En tu trabajo de atención, te sirve principalmente para:

📚 Consultar procedimientos de atención: qué hacer ante determinados requerimientos.
💰 Revisar el Plan Comercial: planes, precios, ofertas y condiciones.
🏠 Hogar: información de Internet, TV, telefonía y servicios asociados.
📱 Móvil: procedimientos y productos móviles.
🏢 Empresa: información relacionada con clientes empresa.
🔄 Retención: alternativas y procedimientos para clientes que quieren cancelar.
⚙️ Operaciones: información operacional para resolver gestiones.
📰 Noticias/actualizaciones: cambios recientes que pueden afectar la atención.

SOMOS CLAVE = tu manual de consulta para saber cómo gestionar correctamente al cliente.`,
      },
      {
        nombre: 'BLIP',
        url: 'https://www.blip.ai/application',
        logo: '/blip.png',
        paraQue: `👩‍💻 ¿Qué podría hacer un asesor ahí?

Dependiendo de cómo esté configurado para VTR/Claro, podría utilizarse para:

💬 Atender conversaciones de clientes por canales digitales.
🤖 Recibir conversaciones que inicialmente fueron atendidas por un bot.
👤 Tomar el caso cuando necesita intervención humana.
📋 Revisar el historial/contexto de la conversación.
✍️ Responder al cliente desde la plataforma.
📊 Dar seguimiento a métricas de atención, como tiempos de respuesta y satisfacción.

BLIP:Es donde atiendes la conversación digital con el cliente. (CONTCTO NO VOZ)`,
      },
      {
        nombre: 'FRONT DE VENTA (ONE)',
        url: 'https://fvc-prod.clarovtrcloud.com/#/login',
        logo: '/claro.png',
        paraQue: `📱 FVC – Front de Ventas Claro Móvil

FVC es la plataforma utilizada para realizar las ventas de Claro Móvil Chile. Permite gestionar las distintas modalidades de contratación de servicios móviles, incluyendo:

Líneas nuevas.
Portabilidades: clientes que vienen desde otra compañía manteniendo su número.
Migraciones: cambios de modalidad o plan dentro de Claro.
Contratación de planes móviles.
Venta/contratación de equipos móviles asociados a la oferta.
Otras gestiones comerciales relacionadas con Claro Móvil Chile.

FVC: Front de Ventas utilizado para realizar y gestionar ventas de Claro Móvil Chile, incluyendo líneas nuevas, portabilidades, migraciones, planes móviles y equipos celulares.`,
      },
      {
        nombre: 'VSIGHT',
        url: 'https://app.vsight.io/login',
        logo: '/Vsiht.png',
        paraQue: `👁️ ¿Para qué sirve VSight?

En un contexto de atención al cliente/telecomunicaciones, sirve para que el asesor pueda ver lo que el cliente está viendo desde la cámara de su celular y orientarlo en tiempo real.

Por ejemplo, si un cliente tiene problemas con:

📡 Router o módem.
🔌 Conexiones y cableado.
📶 Configuración de Internet/Wi-Fi.
📺 Equipos o conexiones de televisión.
⚙️ Algún dispositivo que necesite revisión visual.

VSight: Plataforma de asistencia visual/remota utilizada para brindar soporte al cliente mediante una sesión en la que el asesor puede visualizar lo que muestra la cámara del cliente y guiarlo en tiempo real para solucionar inconvenientes técnicos o realizar verificaciones.`,
      },
      {
        nombre: 'VIDEO LLAMADAS',
        url: 'http://172.17.102.159/videollamadas/ingreso.php',
        logo: '/videollamada.png',
        paraQue: `📹 ¿Para qué sirve?

Permite al asesor enviar al cliente un enlace de VSight por WhatsApp para iniciar una sesión de asistencia visual/remota.

El flujo que se ve en la pantalla es:

Ingresar el número de teléfono del cliente.
Ingresar su RUT.
Seleccionar la marca.
Seleccionar el servicio que se va a revisar.
Ingresar/generar el link de VSight.
Presionar Enviar.
El sistema envía automáticamente un WhatsApp al cliente con el enlace de VSight.`,
      },
      {
        nombre: 'WEB DE RECLAMOS',
        url: 'http://172.17.102.159/reclamos_105/index.php',
        logo: '/clarovtr.png',
        paraQue: `📌 ¿Para qué sirve?

Se utiliza para registrar y gestionar un reclamo formal del cliente, dejando la información necesaria para su tratamiento y seguimiento.

🧑‍💻 RUTA RECLAMOS:

Cliente presenta un reclamo → el asesor registra el reclamo en Reclamos 105 → queda un número de registro para su seguimiento.`,
      },
      {
        nombre: 'Web Traslado con Cambio de Tecnología',
        url: 'http://172.17.102.170/traslados_cambios_tecnologia/',
        logo: '/clarovtr.png',
        paraQue: `“Traslados con cambios de tecnología” es una herramienta interna para registrar solicitudes de traslado de servicios cuando el cambio de domicilio implica también cambiar la tecnología de conexión.
📌 ¿Qué permite hacer?

Solicita datos como:

RUT y nombre del cliente.
Teléfono de contacto.
Tecnología/red de origen y destino.
Dirección y comuna de origen.
Dirección y comuna de destino.
Marca y proveedor.
Canal de ingreso.
Observaciones.
Guardar registro y posteriormente consultar el estado del ticket.`,
      },
      {
        nombre: 'Web Botón rojo reanudación',
        url: 'http://172.17.102.159/boton_rojo/index.php',
        logo: '/app-icons/boton-rojo.svg',
        paraQue: `🔴 ¿Para qué sirve?

Botón Rojo Reanudación se utiliza para gestionar la reanudación de servicios de un cliente, es decir, casos en los que corresponde volver a habilitar/restablecer el servicio según el proceso comercial establecido.`,
      },
      {
        nombre: 'Web Nivel 1',
        url: 'http://172.17.102.159/nivel1_tecnico/index.php',
        logo: '/clarovtr.png',
        paraQue: `“Nivel 1 Técnico” es una herramienta interna para registrar y dar trazabilidad a casos técnicos de clientes que requieren atención o gestión técnica.

🔧 ¿Para qué sirve?

Permite al asesor crear un caso técnico ingresando:

RUT del cliente y teléfono.
Marca y servicio.
Plataforma involucrada.
Canal de ingreso.
Descripción/observación inicial del problema.
Posteriormente, permite gestionar el caso desde una tabla de casos.`,
      },
      {
        nombre: 'Web Errores en proceso de Migración',
        url: 'http://172.17.102.170/error_migraciones/',
        logo: '/clarovtr.png',
        paraQue: `“Web Errores en proceso de Migración”, esta herramienta está orientada a registrar y gestionar errores o incidencias que se presentan durante procesos de migración de servicios/clientes.

🔧 ¿Para qué sirve?

Se utilizaría cuando una migración no se ejecuta correctamente y es necesario dejar registrado el error para su revisión y seguimiento.
👉 Sirve para reportar y hacer seguimiento a errores que ocurren durante una migración.`,
      },
      {
        nombre: 'Consulta de Excepciones',
        url: 'http://172.17.102.159/consulta_excepciones/',
        logo: '/AG.png',
        paraQue: `“Consulta de Excepciones” sirve para verificar si un cliente está registrado en una base de excepciones y, según el resultado, determinar si corresponde aplicar el descuento IPC.

🔎 ¿Cómo funciona?
Ingresas el RUT o la cuenta de facturación del cliente.
Puedes escribir el RUT con o sin puntos y guion.
Ejemplo: 12.590.790-3
Presionas “Consultar aplicación”.
El sistema revisa si el cliente aparece en la base de excepciones.
En la sección “Consulta si el cliente aplica”, aparecerá el resultado de la validación.

🧠 RUTA EXCEPCIONES IPC:

RUT / Cuenta → Consultar → Revisar resultado → Confirmar si aplica el descuento IPC.`,
      },
      {
        nombre: 'Billing Compare Portal',
        url: 'https://billingcompare.clarochile.cl/compare/login',
        logo: '/MICROSOFT.png',
        paraQue: `Billing Compare Portal es una herramienta interna de ClaroVTR para comparar boletas/facturas de un cliente entre distintos meses.

La propia plataforma se identifica como “Comparación de boletas - ClaroVTR” y permite filtrar por:

📅 Mes de comparación
👤 RUT del cliente
📺 Servicio
🧾 Cuenta de facturación
🔢 Folio
¿Para qué le sirve al asesor?

Principalmente para revisar y explicar diferencias en la facturación.`,
      },
      {
        nombre: 'Billing Compare Libre',
        url: 'https://billingcompare-des.oci.clarochile.cl/compare',
        logo: '/billing.png',
        paraQue: `Billing Compare es una herramienta interna de ClaroVTR para comparar boletas/facturas de un cliente entre distintos meses.

La propia plataforma se identifica como “Comparación de boletas - ClaroVTR” y permite filtrar por:

📅 Mes de comparación
👤 RUT del cliente
📺 Servicio
🧾 Cuenta de facturación
🔢 Folio
¿Para qué le sirve al asesor?

Principalmente para revisar y explicar diferencias en la facturación.

ℹ️ Esta versión es de acceso libre y no requiere contraseña para ingresar.`,
      },
      {
        nombre: 'Billshock',
        url: 'http://172.17.102.159/billshock/',
        logo: '/Billshock.png',
        paraQue: `Sirve para consultar si el cliente tiene un DESCUENTO DISPONIBLE para aplicar en el sistema.

🔎 ¿Cómo lo utiliza el asesor?

1. Ingresar: RUT o ID del cliente
2. Presionar: CONSULTAR
3. Revisar: si el cliente tiene un descuento disponible
4. Si corresponde: aplicar el descuento según el procedimiento establecido.

🧠 RUTA PARA VER DESCUENTO: 

🚨 BILLSHOCK = BUSCAR DESCUENTO DISPONIBLE
Ingreso el RUT → Consulto → Reviso si tiene descuento → Aplico si corresponde.`,
      },
      {
        nombre: 'SERVICE DESK (HELPDESK)',
        url: 'https://sdesk.clarochile.cl/HelpDesk/auth/login.jsp',
        logo: '/claroooo.png',
        paraQue: `🎫 ¿Para qué sirve?

Service Desk (HelpDesk) es la plataforma de gestión de incidentes y solicitudes internas.

Permite:

🆕 Registrar y dar seguimiento a tickets de atención.
🔎 Consultar el estado y la historial de un requerimiento.
👥 Asignar y dar seguimiento a las atendidas por el equipo.
🏷️ Clasificar y priorizar según el impacto del caso.

🧠 RUTA:

Cliente presenta un caso → el asesor crea el ticket en Service Desk → queda asociado a un número de seguimiento → se puede consultar su estado y gestionarlo hasta el cierre.`,
      },
    ],
  },
  {
    seccion: 'SOPORTE TÉCNICO',
    filas: [
      {
        nombre: 'SmartWiFi Portal',
        url: 'https://lla.cloudcheck.net/vtr/login-page',
        logo: '/SmartWiFi Portal.png',
        paraQue: `SmartWiFi Portal de CloudCheck y específicamente indica que es una herramienta para troubleshooting del Wi-Fi dentro del hogar.

📶 ¿Para qué sirve CloudCheck?

Sirve para diagnosticar problemas de Internet/Wi-Fi del cliente, ayudando a identificar si el inconveniente está relacionado con:

📡 Señal y cobertura Wi-Fi
🚀 Velocidad de conexión
📱 Dispositivos conectados
📶 Calidad de la conexión
⚠️ Posibles problemas de rendimiento o conectividad

CloudCheck también permite realizar pruebas de velocidad y detectar dónde puede estar el "cuello de botella" entre la conexión de banda ancha y el Wi-Fi del hogar.

🧠 RUTA:

📶 SMARTWIFI = DIAGNÓSTICO DE WIFI
Se utiliza para revisar el estado de la conexión Wi-Fi del cliente y detectar problemas de velocidad, cobertura o conectividad.`,
      },
      {
        nombre: 'IMASTER NCE',
        url: 'https://176.52.129.49:31943/',
        logo: '/huawei.png',
        paraQue: 'Herramienta de soporte técnico IMASTER NCE (acceso por URL interna).',
      },
      {
        nombre: 'SCP',
        url: 'https://zmesh.telmexchile.cl:28001/api/oauth2/v1/authorize?scope=user.login&response_type=code&redirect_uri=/scpportal/framework/default.html',
        logo: '/ZTE.png',
        paraQue: 'Copia el link y pégalo en una ventana nueva de Google.',
      },
    ],
  },
]

export const flatAplicaciones = () =>
  APLICACIONES_EXCEL.flatMap((s) =>
    s.filas.map((f) => ({
      seccion: s.seccion,
      ...f,
    }))
  )
