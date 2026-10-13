import { useEffect, useState, useRef } from 'react'
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  RotateCcw,
  Minus,
  Square,
  ArrowRightLeft,
  PhoneForwarded,
  Clock,
  User,
  Users,
  ChevronDown,
  Check,
  CheckCircle2,
  Headphones,
  Settings,
  X,
  Search,
  Grid,
  Volume2,
  VolumeX,
  Star,
  UserCheck,
  MessageSquare,
  HelpCircle,
  Menu,
  Sparkles,
  Radio,
  Copy,
} from 'lucide-react'

// Iconos compuestos: teléfono + reloj (fuera de hold) y teléfono + play (en hold)
const PHONE_PATH =
  'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'

const PhoneClockIcon = ({ size = 11 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="6" r="3.5" />
    <polyline points="18 3.8 18 6 19.6 7" />
    <path d={PHONE_PATH} />
  </svg>
)

const PhonePlayIcon = ({ size = 11 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="15.2 2.8 21 6.5 15.2 10.2" />
    <path d={PHONE_PATH} />
  </svg>
)

// Etapas del simulador
const ETAPAS = ['login-credentials', 'login-phone', 'enllamada', 'finalizada']

const PASOS = {
  'login-credentials': {
    titulo: 'Conectar a Genesys - Paso 1',
    instrucciones: [
      'Ingresa tu usuario en el campo.',
      'Presiona "Log In" para continuar al siguiente paso.',
    ],
  },
  'login-phone': {
    titulo: 'Conectar a Genesys - Paso 2',
    instrucciones: [
      'Ingresa el PG (grupo de atención), por ejemplo PG_APEX_INBOUND.',
      'Presiona "Log In" para abrir tu estación de trabajo Genesys Workspace.',
      'Al conectar, entrarás a tu sesión y recibirás automáticamente una llamada entrante en curso.',
    ],
  },
  enllamada: {
    titulo: 'Simulador de Llamada Activa',
    instrucciones: [
      'Observa la barra de interacciones superior: tienes activa una llamada entrante y puedes cambiar la casuística desde el panel "Audio en Vivo del Cliente".',
      'Recuerda: en la atención real no está permitido poner al cliente en espera (Hold); mantenlo siempre en línea.',
      'Prueba "Consulta / Conferencia" para abrir la llamada secundaria con Supervisor Nivel 2.',
      'Prueba "Transferir" para desplegar el directorio de colas reales de VTR / Claro.',
      'Prueba el "Teclado DTMF" para marcar dígitos con sonido en vivo.',
      'Interactúa con el diálogo simulado del cliente para resolver su problema de internet.',
      'Presiona "Colgar" cuando desees finalizar la llamada y pasar al Wrap-up.',
    ],
  },
  finalizada: {
    titulo: 'Post-Llamada (Wrap-up / Disposición)',
    instrucciones: [
      'La llamada ha finalizado y se encuentra en estado Wrap-up.',
      'Selecciona la disposición de cierre adecuada en el panel inferior.',
      'Presiona "Not Ready / Cerrar" para reiniciar el simulador o tomar otra llamada.',
    ],
  },
}

const DISPOSICIONES = [
  'Atendida - Solución en primer contacto (FCR)',
  'Atendida - Derivada a Soporte Técnico N1',
  'Atendida - Visita técnica agendada',
  'Atendida - Información entregada',
  'Cliente cortó llamada',
  'Llamada caída / Falla de audio',
]

// Lista de colas exactas extraídas de las imágenes de Genesys Workspace
const COLAS_TRANSFERENCIA = [
  { nombre: 'Ventas Fijas', categoria: 'ventas', interacciones: 0, favorito: true },
  { nombre: 'Ventas Movil', categoria: 'ventas', interacciones: 0, favorito: true },
  { nombre: 'VTR Comercial N1 Hogar', categoria: 'comercial', interacciones: 0, favorito: true },
  { nombre: 'VTR HOGAR ALZA IPC', categoria: 'comercial', interacciones: 0, favorito: true },
  { nombre: 'VTR Rete N2 Venta Cruzada', categoria: 'retenciones', interacciones: 0, favorito: true },
  { nombre: 'VTR Tecnico Hogar N1', categoria: 'tecnico', interacciones: 0, favorito: true },
  { nombre: 'B2B Comercial', categoria: 'comercial', interacciones: 0, favorito: true },
  { nombre: 'B2B Tecnico', categoria: 'tecnico', interacciones: 0, favorito: true },
  { nombre: 'Cero Soporte Cable', categoria: 'soporte', interacciones: 0, favorito: true },
  { nombre: 'Cero Soporte Fono', categoria: 'soporte', interacciones: 0, favorito: true },
  { nombre: 'Cero Soporte Internet', categoria: 'soporte', interacciones: 0, favorito: true },
  { nombre: 'Claro Comercial N1 Hogar', categoria: 'comercial', interacciones: 0, favorito: true },
  { nombre: 'Claro HFC Tec VTR N1', categoria: 'tecnico', interacciones: 0, favorito: true },
  { nombre: 'CLARO HOGAR ALZA IPC', categoria: 'comercial', interacciones: 0, favorito: true },
  { nombre: 'CLARO Rete N2 Venta Cruzada', categoria: 'retenciones', interacciones: 0, favorito: true },
  { nombre: 'Larga Distancia', categoria: 'otros', interacciones: 0, favorito: true },
  { nombre: 'Reclamos Fijo', categoria: 'reclamos', interacciones: 0, favorito: true },
  { nombre: 'Reclamos Movil', categoria: 'reclamos', interacciones: 0, favorito: true },
  { nombre: 'Retenciones SSPP', categoria: 'retenciones', interacciones: 0, favorito: true },
  { nombre: 'Soporte Comercial', categoria: 'comercial', interacciones: 0, favorito: true },
  { nombre: 'Soporte Comercial Movil', categoria: 'comercial', interacciones: 0, favorito: true },
  { nombre: 'Soporte Internet', categoria: 'soporte', interacciones: 0, favorito: true },
  { nombre: 'Soporte Tecnico Movil', categoria: 'tecnico', interacciones: 0, favorito: true },
  { nombre: 'Soporte Telefonia', categoria: 'soporte', interacciones: 0, favorito: true },
  { nombre: 'Soporte Television', categoria: 'soporte', interacciones: 0, favorito: true },
]

// Estados del asesor
const ESTADOS_ASESOR = [
  { label: 'Listo', tipo: 'listo' },
  { label: 'No está listo - BackOffice', tipo: 'noListo' },
  { label: 'No está listo - Baño', tipo: 'noListo' },
  { label: 'No está listo - Capacitación', tipo: 'noListo' },
  { label: 'No está listo - Coaching', tipo: 'noListo' },
  { label: 'No está listo - Colación', tipo: 'noListo' },
  { label: 'No está listo - Descanso', tipo: 'noListo' },
  { label: 'Iniciar sesión', tipo: 'sesion' },
  { label: 'Finalizar sesión', tipo: 'sesion' },
]

// Frecuencias DTMF para sonido Web Audio API
const DTMF_FREQS = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
}

// Guión dinámico de la llamada simulada
const GUION_LLAMADA = [
  {
    paso: 0,
    cliente: '¡Hola! Buenas tardes. Mire, lo llamo porque desde hoy en la mañana no tengo conexión a internet ni televisión en mi casa. El módem tiene la luz "LOS" parpadeando en rojo.',
    respuestas: [
      {
        texto: 'Buenas tardes don Juan Pablo, permítame validar su RUT para ingresar a su ficha técnica.',
        accion: 'normal',
        feedback: 'Validación de identidad correcta.',
      },
      {
        texto: 'Comprendo su molestia. Permítame revisar los niveles de señal de su módem en el sistema mientras seguimos en línea, por favor no cuelgue.',
        accion: 'normal',
        feedback: 'Revisaste los niveles sin poner al cliente en espera. Recuerda: el Hold no está permitido.',
      },
    ],
  },
  {
    paso: 1,
    cliente: 'Mi RUT es 14.052.283-K y vivo en Santiago. ¿Puede verificar si es una falla masiva o si es solo mi domicilio?',
    respuestas: [
      {
        texto: 'Voy a reiniciar su módem de forma remota y reprovisionar la ONT para restablecer el servicio ahora mismo.',
        accion: 'normal',
        feedback: 'Primero intentaste resolver con solución remota.',
      },
      {
        texto: 'Si el reinicio remoto no soluciona, voy a consultar con Soporte N2 para revisar el nodo ACLAROHFCTV.',
        accion: 'consulta',
        feedback: 'Escalaste a Nivel 2 como segunda opción, tras intentar resolver.',
      },
    ],
  },
  {
    paso: 2,
    cliente: 'Perfecto, le agradezco mucho la gestión. ¿Quedará registrado el número de solicitud por si necesito hacer seguimiento?',
    respuestas: [
      {
        texto: 'Sí, su caso quedó registrado bajo la interacción f2da2464. Le llegará confirmación por SMS.',
        accion: 'normal',
        feedback: 'Excelente, información completa entregada.',
      },
      {
        texto: 'Todo listo don Juan Pablo. Damos por finalizada la atención, que tenga una excelente tarde.',
        accion: 'colgar',
        feedback: 'Llamada finalizada, pasando a Wrap-up.',
      },
    ],
  },
]

// Catálogo de casuísticas del simulador: datos del cliente, metadatos del caso y guion de diálogo
const CASOS = [
  {
    id: 'ont-los-rojo',
    tema: 'Internet / Red',
    titulo: 'ONT "LOS" en rojo',
    color: '#ef4444',
    descripcion: 'Sin internet ni TV, luz LOS parpadeando en rojo',
    cliente: {
      nombre: 'Juan Pablo Farías Peña',
      iniciales: 'JP',
      corto: 'JUAN+PABLO+FARIAS+PE...',
      genesys: 'JUAN+PABLO+FARIAS+PENA',
    },
    ficha: {
      rut: '14.052.283-K',
      plan: 'Mega 500 + TV Full',
      direccion: 'Av. Providencia 1240',
      nodo: 'ACLAROHFCTV',
      mac: '00:82:03:B3:6C:5D',
    },
    meta: {
      origen: 'Llamada entrante a 14120',
      cola: '79004',
      rut: '0014052283-K',
      ramaIVR: 'ACLAROHFCTV',
      ani: '939006976',
      callID: '212539fe-d29c-458f-9c9a-e40407b08a83',
      canalIngreso: 'IVR Claro',
      connID: '008203b36c5d5015',
      idLlamada: 'f2da2464-c299-11f1-b0ae-0579ef087468',
    },
    guion: GUION_LLAMADA,
  },
  {
    id: 'internet-lento',
    tema: 'Internet / Red',
    titulo: 'Internet lento y cortes',
    color: '#f59e0b',
    descripcion: 'WiFi lento por las noches y cortes intermitentes',
    cliente: {
      nombre: 'María José Contreras Rojas',
      iniciales: 'MC',
      corto: 'MARIA+JOSE+CONTRERAS...',
      genesys: 'MARIA+JOSE+CONTRERAS+ROJAS',
    },
    ficha: {
      rut: '15.893.342-7',
      plan: 'Mega 400',
      direccion: 'Los Aromos 452, Ñuñoa',
      nodo: 'ACLAROFTTH',
      mac: '00:82:03:AA:11:22',
    },
    meta: {
      origen: 'Llamada entrante a 14120',
      cola: '79004',
      rut: '0015893342-7',
      ramaIVR: 'WLANSANTIAGO',
      ani: '987123456',
      callID: '8d1a4f2b-77c1-4e90-a1b2-3c4d5e6f7081',
      canalIngreso: 'IVR Claro',
      connID: '0091a4c7d2e8f310',
      idLlamada: '3b7c1e90-5a2d-12f3-9c4b-6d8e0f1a2b3c',
    },
    guion: [
      {
        paso: 0,
        cliente: 'Hola, buenas tardes. Desde hace unos días mi internet anda muy lento, sobre todo en la noche, y a veces se corta solo. La luz del módem está verde, pero igual no carga bien.',
        respuestas: [
          {
            texto: 'Buenas tardes doña María José, lamento el inconveniente. Permítame validar su RUT y revisar el estado del servicio en su sector.',
            accion: 'normal',
            feedback: 'Identificación validada sin dejar al cliente en espera.',
          },
          {
            texto: 'Gracias por avisar. Voy a revisar de inmediato los niveles de señal de su módem y la saturación del nodo mientras seguimos conversando.',
            accion: 'normal',
            feedback: 'Revisaste niveles sin Hold. Recuerda que poner en espera no está permitido.',
          },
        ],
      },
      {
        paso: 1,
        cliente: 'Mi RUT es 15.893.342-7. Vivo en Ñuñoa. ¿Será problema de mi módem o del sector? Porque mi vecino me dijo que a él también le pasa.',
        respuestas: [
          {
            texto: 'Voy a reiniciar su módem de forma remota y revisar la saturación del nodo ÑUÑOA-FTTH para normalizar la velocidad ahora.',
            accion: 'normal',
            feedback: 'Primero intentaste resolver con reinicio remoto y revisión del nodo.',
          },
          {
            texto: 'Si la lentitud persiste, voy a consultar con Soporte N2 para un diagnóstico avanzado de su señal.',
            accion: 'consulta',
            feedback: 'Escalaste a Nivel 2 como segunda opción, tras intentar resolver.',
          },
        ],
      },
      {
        paso: 2,
        cliente: 'Ya, muchas gracias. ¿Y eso lo arreglan luego o tengo que esperar mucho?',
        respuestas: [
          {
            texto: 'Le dejaré una visita técnica agendada para mañana en la mañana y el número de solicitud se lo envío por SMS.',
            accion: 'normal',
            feedback: 'Excelente gestión, información completa entregada.',
          },
          {
            texto: 'Cuando el técnico valide en terreno se normalizará la velocidad. Damos por finalizada la atención, que tenga buena tarde.',
            accion: 'colgar',
            feedback: 'Llamada finalizada, pasando a Wrap-up.',
          },
        ],
      },
    ],
  },
  {
    id: 'sin-tv',
    tema: 'Televisión',
    titulo: 'No tengo televisión',
    color: '#f59e0b',
    descripcion: 'Pantalla negra / sin señal en todos los canales',
    cliente: {
      nombre: 'Carlos Muñoz Sepúlveda',
      iniciales: 'CM',
      corto: 'CARLOS+MUNOZ+SEPUL...',
      genesys: 'CARLOS+MUNOZ+SEPULVEDA',
    },
    ficha: {
      rut: '17.654.321-4',
      plan: 'TV Full HD + Mega 200',
      direccion: 'Av. Matta 889, Santiago',
      nodo: 'ACLAROHFCTV',
      mac: '00:82:03:BB:33:44',
    },
    meta: {
      origen: 'Llamada entrante a 14120',
      cola: '79004',
      rut: '0017654321-4',
      ramaIVR: 'TVSANTIAGO',
      ani: '912345678',
      callID: '5e2b8c1d-3f4a-4b6c-8d2e-9f0a1b2c3d4e',
      canalIngreso: 'IVR Claro',
      connID: '0072f1a9c3b4d5e6',
      idLlamada: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
    },
    guion: [
      {
        paso: 0,
        cliente: 'Buenas tardes. Mire, tengo contratado el cable pero desde ayer la tele me aparece en negro, sin señal, en todos los canales. El internet sí me funciona bien.',
        respuestas: [
          {
            texto: 'Buenas tardes don Carlos, permítame validar su RUT para revisar su servicio de televisión.',
            accion: 'normal',
            feedback: 'Identificación validada correctamente.',
          },
          {
            texto: 'Comprendo. Voy a revisar si hay alguna mantención o falla en su nodo de TV mientras seguimos en línea.',
            accion: 'normal',
            feedback: 'Revisaste el nodo sin poner al cliente en espera.',
          },
        ],
      },
      {
        paso: 1,
        cliente: 'Mi RUT es 17.654.321-4. El decodificador está encendido, pero en la pantalla aparece "sin señal".',
        respuestas: [
          {
            texto: 'Voy a enviar un reinicio remoto a su decodificador y resincronizar los canales del nodo ACLAROHFCTV.',
            accion: 'normal',
            feedback: 'Primero intentaste resolver con reinicio remoto del decodificador.',
          },
          {
            texto: 'Si el reinicio no repone los canales, voy a consultar con Soporte N2 de Televisión para revisar el nodo.',
            accion: 'consulta',
            feedback: 'Escalaste a Nivel 2 como segunda opción, tras intentar resolver.',
          },
        ],
      },
      {
        paso: 2,
        cliente: 'Ya, y eso tiene algún costo, o lo cubre la visita?',
        respuestas: [
          {
            texto: 'La visita no tiene costo, queda agendada para mañana y recibirá el número de caso por SMS.',
            accion: 'normal',
            feedback: 'Excelente, información completa entregada.',
          },
          {
            texto: 'Todo listo don Carlos. Damos por finalizada la atención, que tenga una excelente tarde.',
            accion: 'colgar',
            feedback: 'Llamada finalizada, pasando a Wrap-up.',
          },
        ],
      },
    ],
  },
  {
    id: 'streaming-login',
    tema: 'Streaming',
    titulo: 'No puedo entrar a HBO / streaming',
    color: '#10b981',
    descripcion: 'No puede ingresar a su cuenta de HBO Max u otra plataforma',
    cliente: {
      nombre: 'Valentina Rojas Fuentes',
      iniciales: 'VR',
      corto: 'VALENTINA+ROJAS+FUE...',
      genesys: 'VALENTINA+ROJAS+FUENTES',
    },
    ficha: {
      rut: '19.123.456-8',
      plan: 'Mega 600 + Streaming',
      direccion: 'Camino El Alba 7780, Las Condes',
      nodo: 'ACLAROFTTH',
      mac: '00:82:03:CC:55:66',
    },
    meta: {
      origen: 'Llamada entrante a 14120',
      cola: '79004',
      rut: '0019123456-8',
      ramaIVR: 'STREAMINGCLARO',
      ani: '998877665',
      callID: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
      canalIngreso: 'IVR Claro',
      connID: '0063e8b1d7a2c4f9',
      idLlamada: '7f6e5d4c-3b2a-1c0d-9e8f-7a6b5c4d3e2f',
    },
    guion: [
      {
        paso: 0,
        cliente: 'Hola, buenas tardes. No puedo ingresar a mi cuenta de HBO Max; me dice que la contraseña es incorrecta y no me llega el correo para restablecerla. A veces también me pasa con Netflix.',
        respuestas: [
          {
            texto: 'Buenas tardes doña Valentina, permítame validar sus datos para revisar el acceso a sus plataformas de streaming.',
            accion: 'normal',
            feedback: 'Identificación validada correctamente.',
          },
          {
            texto: 'Entiendo su molestia. Revisaré el estado de su suscripción de streaming mientras seguimos en línea.',
            accion: 'normal',
            feedback: 'Revisaste la suscripción sin poner al cliente en espera.',
          },
        ],
      },
      {
        paso: 1,
        cliente: 'Mi RUT es 19.123.456-8. La cuenta de HBO la tengo con Claro VTR, ¿o es aparte?',
        respuestas: [
          {
            texto: 'Su cuenta de HBO Max viene incluida en su plan; voy a restablecer su contraseña y reactivar el acceso desde el portal.',
            accion: 'normal',
            feedback: 'Primero intentaste resolver reactivando el acceso desde el portal.',
          },
          {
            texto: 'Si no recupera el acceso, voy a consultar con Soporte N2 de Streaming para revisar el estado de su cuenta.',
            accion: 'consulta',
            feedback: 'Escalaste a Nivel 2 como segunda opción, tras intentar resolver.',
          },
        ],
      },
      {
        paso: 2,
        cliente: 'Entiendo, ¿y cómo quedaría mi cuenta después?',
        respuestas: [
          {
            texto: 'Restableceré su acceso desde el portal y le enviaré un enlace de recuperación por SMS al 998877665.',
            accion: 'normal',
            feedback: 'Excelente gestión, información completa entregada.',
          },
          {
            texto: 'Con esto queda todo claro, damos por finalizada la atención. ¡Que tenga buena tarde!',
            accion: 'colgar',
            feedback: 'Llamada finalizada, pasando a Wrap-up.',
          },
        ],
      },
    ],
  },
  {
    id: 'consulta-boleta',
    tema: 'Facturación',
    titulo: 'Consulta sobre mi boleta',
    color: '#10b981',
    descripcion: 'Duda por un cobro más alto de lo habitual',
    cliente: {
      nombre: 'Patricia Herrera Lillo',
      iniciales: 'PH',
      corto: 'PATRICIA+HERRERA+LI...',
      genesys: 'PATRICIA+HERRERA+LILLO',
    },
    ficha: {
      rut: '13.456.789-2',
      plan: 'Mega 300',
      direccion: 'Pasaje Los Olmos 55, Maipú',
      nodo: 'ACLAROHFC',
      mac: '00:82:03:DD:77:88',
    },
    meta: {
      origen: 'Llamada entrante a 14120',
      cola: '79004',
      rut: '0013456789-2',
      ramaIVR: 'FACTURACION',
      ani: '934567890',
      callID: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      canalIngreso: 'IVR Claro',
      connID: '0049d2a6f1b8e3c7',
      idLlamada: '2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
    },
    guion: [
      {
        paso: 0,
        cliente: 'Hola, buenas tardes. Quería consultar por mi boleta, porque me llegó un monto más alto de lo habitual este mes y no entiendo por qué.',
        respuestas: [
          {
            texto: 'Buenas tardes doña Patricia, con gusto la ayudo. Permítame validar su RUT para revisar su cuenta.',
            accion: 'normal',
            feedback: 'Identificación validada correctamente.',
          },
          {
            texto: 'Claro que sí. Revisaré el detalle de su boleta mientras conversamos, sin dejarle en espera.',
            accion: 'normal',
            feedback: 'Revisaste la boleta sin poner al cliente en espera.',
          },
        ],
      },
      {
        paso: 1,
        cliente: 'Mi RUT es 13.456.789-2. En la boleta aparece un cargo adicional que no reconozco.',
        respuestas: [
          {
            texto: 'Voy a revisar el detalle del cargo y, si corresponde, aplicar el ajuste en su próxima boleta desde el sistema.',
            accion: 'normal',
            feedback: 'Primero intentaste resolver revisando y ajustando el cobro.',
          },
          {
            texto: 'Si el cargo no se puede ajustar aquí, transferiré su caso a Facturación para una revisión en detalle.',
            accion: 'transferir',
            feedback: 'Transferiste a Facturación como segunda opción, tras intentar resolver.',
          },
        ],
      },
      {
        paso: 2,
        cliente: '¿Y me van a devolver ese monto si fue un error?',
        respuestas: [
          {
            texto: 'Si el cargo es un error, se ajustará en su próxima boleta. Le enviaré el detalle por SMS.',
            accion: 'normal',
            feedback: 'Excelente, información completa entregada.',
          },
          {
            texto: 'Queda todo registrado doña Patricia. Damos por finalizada la atención, ¡que tenga buena tarde!',
            accion: 'colgar',
            feedback: 'Llamada finalizada, pasando a Wrap-up.',
          },
        ],
      },
    ],
  },
  {
    id: 'cambio-plan',
    tema: 'Contratación',
    titulo: 'Cambio de plan',
    color: '#a3a3a3',
    descripcion: 'Quiere subir su plan y cotizar TV',
    cliente: {
      nombre: 'Jorge Fuentealba Ossa',
      iniciales: 'JF',
      corto: 'JORGE+FUENTEALBA+OS...',
      genesys: 'JORGE+FUENTEALBA+OSSA',
    },
    ficha: {
      rut: '20.321.654-9',
      plan: 'Mega 200',
      direccion: 'Calle San Martín 1330, Temuco',
      nodo: 'ACLAROHFC',
      mac: '00:82:03:EE:99:00',
    },
    meta: {
      origen: 'Llamada entrante a 14120',
      cola: '79004',
      rut: '0020321654-9',
      ramaIVR: 'RETENCION',
      ani: '967890123',
      callID: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
      canalIngreso: 'IVR Claro',
      connID: '0038c1b5e9d4a6f2',
      idLlamada: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
    },
    guion: [
      {
        paso: 0,
        cliente: 'Buenas tardes. Los llamo porque quiero cambiar mi plan de internet a uno con más velocidad, y también ver si puedo agregar TV.',
        respuestas: [
          {
            texto: 'Buenas tardes don Jorge, con gusto le ayudo a cotizar. Permítame validar su RUT para revisar su plan actual.',
            accion: 'normal',
            feedback: 'Identificación validada correctamente.',
          },
          {
            texto: 'Excelente, revisaré su plan actual en el sistema mientras le muestro las alternativas disponibles.',
            accion: 'normal',
            feedback: 'Revisaste el plan sin poner al cliente en espera.',
          },
        ],
      },
      {
        paso: 1,
        cliente: 'Mi RUT es 20.321.654-9. Hoy tengo Mega 200, ¿qué me ofrecen?',
        respuestas: [
          {
            texto: 'Le cotizo ahora mismo Mega 600 + TV Full con un descuento por 12 meses para su domicilio en Temuco.',
            accion: 'normal',
            feedback: 'Primero intentaste resolver entregando una oferta concreta.',
          },
          {
            texto: 'Si necesita una oferta especial, transferiré su caso a Ventas / Retención para evaluar alternativas.',
            accion: 'transferir',
            feedback: 'Transferiste a Ventas como segunda opción, tras intentar resolver.',
          },
        ],
      },
      {
        paso: 2,
        cliente: 'Perfecto, ¿y en cuánto me quedaría?',
        respuestas: [
          {
            texto: 'Le ofrezco Mega 600 + TV Full con un descuento por 12 meses. Le enviaré la cotización por SMS.',
            accion: 'normal',
            feedback: 'Excelente gestión, información completa entregada.',
          },
          {
            texto: 'Si le parece bien, cerramos la gestión. Damos por finalizada la atención, ¡buena tarde!',
            accion: 'colgar',
            feedback: 'Llamada finalizada, pasando a Wrap-up.',
          },
        ],
      },
    ],
  },
]

export default function GenesysSimulador({ onToast }) {
  const [etapa, setEtapa] = useState('login-credentials')
  const [status, setStatus] = useState('Not Ready')
  const [username, setUsername] = useState('ksippo')
  const [password, setPassword] = useState('')
  const [grupo, setGrupo] = useState('PG_APEX_INBOUND')
  const [phoneNumber, setPhoneNumber] = useState('5322')
  const [useBrowserComm, setUseBrowserComm] = useState(false)
  const [mutear, setMutear] = useState(false)
  const [retener, setRetener] = useState(false)
  const [segundos, setSegundos] = useState(91) // Inicia en 00:01:31 como en la captura real
  const [showTransfer, setShowTransfer] = useState(false)
  const [tipoTransfer, setTipoTransfer] = useState('directas') // 'directas' | 'asistida'
  const [transferPos, setTransferPos] = useState({ top: 65, left: 520 })
  const [tabTransfer, setTabTransfer] = useState('favoritos')
  const [busquedaDirectorio, setBusquedaDirectorio] = useState('')
  const [colaSeleccionada, setColaSeleccionada] = useState(null)
  const [disposicion, setDisposicion] = useState(DISPOSICIONES[0])
  const [nota, setNota] = useState('')
  const [tabActiva, setTabActiva] = useState('CONTACTO')
  const [estadoAsesor, setEstadoAsesor] = useState('Listo')
  const [menuEstado, setMenuEstado] = useState(false)

  // Detección reactiva de modo oscuro
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  useEffect(() => {
    const updateDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    updateDark()
    const observer = new MutationObserver(updateDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Nuevas funciones de llamada
  const [showKeypad, setShowKeypad] = useState(false)
  const [keypadPos, setKeypadPos] = useState({ top: 40, left: 600 })
  const [dtmfDigits, setDtmfDigits] = useState('')
  const [showVolume, setShowVolume] = useState(false)
  const [volumen, setVolumen] = useState(80)
  const [showConsulta, setShowConsulta] = useState(false)
  const [segundosConsulta, setSegundosConsulta] = useState(1)
  const [guionPaso, setGuionPaso] = useState(0)
  const [vozHablando, setVozHablando] = useState(true)
  const [audioActivo, setAudioActivo] = useState(false)
  const [casoId, setCasoId] = useState(CASOS[0].id)

  // Casuística activa y guion vigente
  const casoActual = CASOS.find((c) => c.id === casoId) || CASOS[0]
  const guionActivo = casoActual.guion

  // Menú contextual para copiar valores del caso
  const [menuCopia, setMenuCopia] = useState(null) // { x, y, value }
  const [copiadoTag, setCopiadoTag] = useState(null)
  const menuCopiaRef = useRef(null)

  const estadoButtonRef = useRef(null)
  const estadoMenuRef = useRef(null)
  const transferRef = useRef(null)
  const keypadRef = useRef(null)
  const volumeRef = useRef(null)
  const audioCtxRef = useRef(null)

  const pasoActual = ETAPAS.indexOf(etapa)

  // Paleta de colores calculada para Tema Claro y Tema Oscuro
  const theme = isDark
    ? {
        headerBg: '#2e2e2e',
        headerText: '#ffffff',
        barBg: '#171717',
        barBorder: '#2e2e2e',
        inactiveTabBg: '#262626',
        inactiveTabBorder: '#404040',
        inactiveTabText: '#d4d4d4',
        activeTabBg: '#404040',
        activeTabBorder: '#525252',
        mainBg: '#0a0a0a',
        contentBg: '#171717',
        contentBorder: '#262626',
        caseHeaderBg: '#404040',
        caseTableBg: '#171717',
        caseRowBorder: '#262626',
        caseLabel: '#f5f5f5',
        caseValue: '#d4d4d4',
        subbarBg: '#262626',
        subbarBorder: '#404040',
        subbarText: '#f5f5f5',
        dialogueBoxBg: '#1a1a1a',
        dialogueBorder: '#404040',
        bubbleBg: '#171717',
        bubbleBorder: '#404040',
        bubbleText: '#f5f5f5',
        bubbleLabel: '#e5e5e5',
        optionBtnBg: '#262626',
        optionBtnBorder: '#525252',
        optionBtnText: '#f5f5f5',
        optionFeedback: '#e5e5e5',
        noteBg: '#1a1a1a',
        noteBorder: '#404040',
        noteTextareaBg: '#171717',
        noteTextareaText: '#f5f5f5',
        sideBarBg: '#171717',
        sidePanelBg: '#1a1a1a',
        sideBorder: '#404040',
        sideText: '#e5e5e5',
        statusBarBg: '#171717',
        statusBarBorder: '#262626',
        statusBarText: '#a3a3a3',
        cardBg: '#141414',
        cardBorder: '#262626',
        cardText: '#f5f5f5',
        inputBg: '#1f1f1f',
        inputText: '#ffffff',
        inputBorder: '#383838',
      }
    : {
        headerBg: '#65737e',
        headerText: '#ffffff',
        barBg: '#e9ecef',
        barBorder: '#ced4da',
        inactiveTabBg: '#f8f9fa',
        inactiveTabBorder: '#ced4da',
        inactiveTabText: '#374151',
        activeTabBg: '#1f6d7e',
        activeTabBorder: '#134e5a',
        mainBg: '#ffffff',
        contentBg: '#ffffff',
        contentBorder: '#e5e7eb',
        caseHeaderBg: '#2d8ca0',
        caseTableBg: '#ffffff',
        caseRowBorder: '#f3f4f6',
        caseLabel: '#111827',
        caseValue: '#374151',
        subbarBg: '#f3f4f6',
        subbarBorder: '#e5e7eb',
        subbarText: '#1f2937',
        dialogueBoxBg: '#ffffff',
        dialogueBorder: '#e2e8f0',
        bubbleBg: '#f8fafc',
        bubbleBorder: '#e2e8f0',
        bubbleText: '#374151',
        bubbleLabel: '#0f766e',
        optionBtnBg: '#f0fdfa',
        optionBtnBorder: '#99f6e4',
        optionBtnText: '#134e4a',
        optionFeedback: '#0d9488',
        noteBg: '#ffffff',
        noteBorder: '#e5e7eb',
        noteTextareaBg: '#ffffff',
        noteTextareaText: '#1f2937',
        sideBarBg: '#f3f4f6',
        sidePanelBg: '#ffffff',
        sideBorder: '#e5e7eb',
        sideText: '#374151',
        statusBarBg: '#f8f9fa',
        statusBarBorder: '#e5e7eb',
        statusBarText: '#6b7280',
        cardBg: '#ffffff',
        cardBorder: '#e5e7eb',
        cardText: '#111827',
        inputBg: '#ffffff',
        inputText: '#111827',
        inputBorder: '#d1d5db',
      }

  // Inicializar Web Audio API seguro para DTMF y tonos
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }

  // Reproducir tono DTMF
  const sonarDTMF = (digit) => {
    const ctx = getAudioContext()
    if (!ctx) return
    const freqs = DTMF_FREQS[digit]
    if (!freqs) return

    try {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.frequency.value = freqs[0]
      osc2.frequency.value = freqs[1]

      gain.gain.setValueAtTime((volumen / 100) * 0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start()
      osc2.start()
      osc1.stop(ctx.currentTime + 0.18)
      osc2.stop(ctx.currentTime + 0.18)
    } catch {
      // Ignorar restricciones de audio
    }
  }

  // Reproducir bip / chime suave
  const sonarBeep = (freq = 600, dur = 0.12) => {
    const ctx = getAudioContext()
    if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime((volumen / 100) * 0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + dur)
    } catch {
      // Ignorar restricciones
    }
  }

  // Reproducción por síntesis de voz (opcional del navegador)
  const hablarTexto = (texto) => {
    if (!audioActivo || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'es-CL'
    utterance.rate = 1.05
    utterance.volume = volumen / 100
    utterance.onstart = () => setVozHablando(true)
    utterance.onend = () => setVozHablando(false)
    window.speechSynthesis.speak(utterance)
  }

  // Cerrar popovers al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        estadoMenuRef.current &&
        !estadoMenuRef.current.contains(e.target) &&
        estadoButtonRef.current &&
        !estadoButtonRef.current.contains(e.target)
      ) {
        setMenuEstado(false)
      }
      if (transferRef.current && !transferRef.current.contains(e.target)) {
        const esTrigger = e.target && e.target.closest && e.target.closest('[data-transfer-trigger]')
        if (!esTrigger) {
          setShowTransfer(false)
        }
      }
      if (keypadRef.current && !keypadRef.current.contains(e.target)) {
        const btn = document.getElementById('btn-keypad-header')
        if (!btn || !btn.contains(e.target)) {
          setShowKeypad(false)
        }
      }
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        const btn = document.getElementById('btn-volume-header')
        if (!btn || !btn.contains(e.target)) {
          setShowVolume(false)
        }
      }
      if (menuCopiaRef.current && !menuCopiaRef.current.contains(e.target)) {
        setMenuCopia(null)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuCopia(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Timer de llamada activa
  useEffect(() => {
    if (etapa !== 'enllamada') return
    const t = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [etapa])

  // Timer de consulta activa
  useEffect(() => {
    if (!showConsulta) return
    const t = setInterval(() => setSegundosConsulta((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [showConsulta])

  // Animación de cliente hablando
  useEffect(() => {
    if (etapa !== 'enllamada') return
    setVozHablando(true)
    const t = setTimeout(() => setVozHablando(false), 4500)
    return () => clearTimeout(t)
  }, [guionPaso, etapa])

  const fmtTiempo = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Abre el menú contextual de copiado para un valor del caso
  const abrirMenuCopia = (e, value) => {
    e.preventDefault()
    const MENU_W = 240
    const MENU_H = 92
    const x = Math.max(8, Math.min(e.clientX, window.innerWidth - MENU_W - 8))
    const y = Math.max(8, Math.min(e.clientY, window.innerHeight - MENU_H - 8))
    setCopiadoTag(null)
    setMenuCopia({ x, y, value })
  }

  const copiarValor = async (value) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
      } else {
        const ta = document.createElement('textarea')
        ta.value = value
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopiadoTag(value)
      setTimeout(() => {
        setMenuCopia(null)
        setCopiadoTag(null)
      }, 900)
    } catch (err) {
      if (onToast) onToast('No se pudo copiar el valor')
    }
  }

  const reiniciar = () => {
    setEtapa('login-credentials')
    setUsername('ksippo')
    setPassword('')
    setGrupo('PG_APEX_INBOUND')
    setPhoneNumber('5322')
    setUseBrowserComm(false)
    setMutear(false)
    setRetener(false)
    setSegundos(91)
    setShowTransfer(false)
    setShowKeypad(false)
    setShowVolume(false)
    setShowConsulta(false)
    setSegundosConsulta(1)
    setDtmfDigits('')
    setBusquedaDirectorio('')
    setColaSeleccionada(null)
    setStatus('Not Ready')
    setNota('')
    setEstadoAsesor('Listo')
    setMenuEstado(false)
    setGuionPaso(0)
    setCasoId(CASOS[0].id)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  const elegirEstado = (label) => {
    if (label === 'Finalizar sesión') {
      setMenuEstado(false)
      setEstadoAsesor('Listo')
      setStatus('Not Ready')
      setEtapa('login-credentials')
      onToast?.('Sesión finalizada en Genesys')
      return
    }
    if (label === 'Iniciar sesión') {
      setMenuEstado(false)
      setEstadoAsesor('Listo')
      setStatus('Ready')
      onToast?.('Sesión iniciada')
      return
    }
    setEstadoAsesor(label)
    setMenuEstado(false)
    setStatus(label === 'Listo' ? 'Ready' : 'Not Ready')
    onToast?.(`Estado cambiado a: ${label}`)
  }

  const conectarYEntrarLlamada = () => {
    if (etapa === 'login-credentials') {
      if (!username.trim()) {
        onToast?.('Ingresa tu usuario antes de continuar')
        return
      }
      setEtapa('login-phone')
      sonarBeep(660, 0.12)
      onToast?.('Usuario aceptado. Ingresa el PG (grupo de atención).')
      return
    }

    if (etapa === 'login-phone') {
      if (!grupo.trim()) {
        onToast?.('Ingresa el PG (grupo de atención) para conectarte')
        return
      }
      setEtapa('enllamada')
      setStatus('Ready')
      setSegundos(91)
      sonarBeep(880, 0.15)
      onToast?.(`Conectado como ${username.trim()} a ${grupo.trim()} — Llamada de ${casoActual.cliente.nombre} en curso`)
      if (audioActivo) {
        hablarTexto(guionActivo[0].cliente)
      }
    }
  }

  const toggleRetener = () => {
    const nuevoRetener = !retener
    setRetener(nuevoRetener)
    if (nuevoRetener) {
      sonarBeep(440, 0.25)
      onToast?.('Llamada en espera (Hold activado)')
    } else {
      sonarBeep(880, 0.2)
      onToast?.('Llamada reanudada (Hold desactivado)')
    }
  }

  const toggleMutear = () => {
    const nuevoMute = !mutear
    setMutear(nuevoMute)
    onToast?.(nuevoMute ? 'Micrófono silenciado (Mute)' : 'Micrófono reactivado')
    sonarBeep(nuevoMute ? 350 : 700, 0.1)
  }

  const toggleConsulta = () => {
    const nuevaConsulta = !showConsulta
    setShowConsulta(nuevaConsulta)
    if (nuevaConsulta) {
      setRetener(true)
      setSegundosConsulta(1)
      sonarBeep(520, 0.2)
      onToast?.('Iniciando Consulta: 4084 con Supervisor Nivel 2...')
    } else {
      onToast?.('Consulta finalizada, regresando con el cliente')
    }
  }

  const marcarDigitoDTMF = (digit) => {
    sonarDTMF(digit)
    setDtmfDigits((prev) => (prev + digit).slice(-12))
    onToast?.(`DTMF: ${digit}`)
  }

  const posicionarTransfer = (btnId) => {
    const btn = document.getElementById(btnId)
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const width = 480
    const height = 560
    let left = r.left
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
    if (left < 8) left = 8
    let top = r.bottom + 6
    if (top + height > window.innerHeight - 8) {
      top = Math.max(8, r.top - height - 6)
    }
    setTransferPos({ top: Math.round(top), left: Math.round(left) })
  }

  const toggleTransfer = (tipo = 'directas', btnId = 'btn-transfer-directas') => {
    if (showTransfer && tipoTransfer === tipo) {
      setShowTransfer(false)
      return
    }
    setTipoTransfer(tipo)
    posicionarTransfer(btnId)
    setShowTransfer(true)
  }

  const toggleKeypad = () => {
    if (showKeypad) {
      setShowKeypad(false)
      return
    }
    const btn = document.getElementById('btn-keypad-header')
    if (btn) {
      const r = btn.getBoundingClientRect()
      const width = 210
      const height = 300
      let left = r.left
      if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
      if (left < 8) left = 8
      let top = r.bottom + 6
      if (top + height > window.innerHeight - 8) {
        top = Math.max(8, r.top - height - 6)
      }
      setKeypadPos({ top: Math.round(top), left: Math.round(left) })
    }
    setShowKeypad(true)
  }

  const transferirACola = (cola) => {
    setColaSeleccionada(cola)
    setShowTransfer(false)
    setShowConsulta(false)
    sonarBeep(750, 0.2)
    onToast?.(
      `Transferencia ${tipoTransfer === 'directas' ? 'directa' : 'asistida'} a: ${cola.nombre}. Pasando a Wrap-up.`
    )
    setEtapa('finalizada')
    setStatus('Not Ready')
  }

  const responderGuion = (respuesta) => {
    if (respuesta.accion === 'retener') {
      toggleRetener()
    } else if (respuesta.accion === 'consulta') {
      toggleConsulta()
    } else if (respuesta.accion === 'transferir') {
      toggleTransfer('directas', 'btn-transfer-directas')
      onToast?.('Selecciona una cola en el directorio para completar la transferencia')
    } else if (respuesta.accion === 'colgar') {
      setEtapa('finalizada')
      setStatus('Not Ready')
      sonarBeep(300, 0.3)
      onToast?.('Llamada finalizada por el asesor, pasando a Wrap-up')
      return
    }

    if (guionPaso < guionActivo.length - 1) {
      setGuionPaso((p) => p + 1)
      const sig = guionActivo[guionPaso + 1]
      if (sig && audioActivo) {
        hablarTexto(sig.cliente)
      }
    }
  }

  // Cambia la casuística activa y reinicia el guion
  const seleccionarCaso = (id) => {
    if (id === casoId) return
    setCasoId(id)
    setGuionPaso(0)
    const c = CASOS.find((x) => x.id === id)
    if (c) {
      onToast?.(`Casuística: ${c.titulo}`)
      if (audioActivo) hablarTexto(c.guion[0].cliente)
    }
  }

  // Filtrado de colas en el directorio
  const colasFiltradas = COLAS_TRANSFERENCIA.filter((c) => {
    const matchBusqueda =
      busquedaDirectorio.trim() === '' ||
      c.nombre.toLowerCase().includes(busquedaDirectorio.toLowerCase())
    if (tabTransfer === 'favoritos') {
      return matchBusqueda && c.favorito
    }
    return matchBusqueda
  })

  // =========================================================================
  // VISTA WORKSPACE (GENESYS COMPLETO)
  // =========================================================================
  if (etapa === 'enllamada' || etapa === 'finalizada') {
    const enLlamada = etapa === 'enllamada'
    const tiempoLlamada = enLlamada ? fmtTiempo(segundos) : '00:00:00'
    const tiempoConsulta = fmtTiempo(segundosConsulta)
    const guionActual = guionActivo[guionPaso] || guionActivo[0]

    return (
      <div
        style={{
          height: '100vh',
          minHeight: 0,
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontSize: '14px',
          backgroundColor: theme.mainBg,
          color: theme.cardText,
        }}
        className="flex flex-col select-none"
      >
        {/* ===================================================================
            1. TOP HEADER BAR - Responde a tema claro (#65737e) y oscuro (#2d3748)
        =================================================================== */}
        <header
          style={{ background: theme.headerBg, height: '40px', flexShrink: 0 }}
          className="flex items-center justify-between px-3 text-white shadow-xs"
        >
          {/* Logo Genesys + Workspace */}
          <div className="flex items-center gap-2">
            <img
              src="/genesys.png"
              alt="Genesys"
              className="w-6 h-6 object-contain"
            />
            <span style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '0.02em' }}>
              Workspace
            </span>
          </div>

          {/* Menú derecho: Asesor, estado, headset, ayuda, ventana */}
          <div className="flex items-center gap-2">
            {/* Estado del asesor con punto verde */}
            <div className="relative">
              <button
                ref={estadoButtonRef}
                onClick={() => setMenuEstado((v) => !v)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-black/15 transition text-white"
                style={{ fontSize: '14px' }}
              >
                <CheckCircle2
                  size={16}
                  style={{
                    color:
                      estadoAsesor === 'Listo'
                        ? '#4ade80'
                        : estadoAsesor.startsWith('No está')
                        ? '#fbbf24'
                        : '#d4d4d4',
                  }}
                />
                <span className="font-normal">Adrian Nilo Villantoy Cuaresma</span>
                <ChevronDown size={15} className="opacity-80" />
              </button>

              {/* Dropdown de estados */}
              {menuEstado && (
                <div
                  ref={estadoMenuRef}
                  style={{
                    position: 'fixed',
                    right: '120px',
                    top: '32px',
                    width: '280px',
                    background: isDark ? '#262626' : 'white',
                    border: `1px solid ${isDark ? '#404040' : '#cbd5e1'}`,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                    zIndex: 99999,
                    borderRadius: '2px',
                    color: isDark ? '#f5f5f5' : '#1f2937',
                  }}
                >
                  <div
                    style={{
                      borderBottom: `1px solid ${isDark ? '#404040' : '#e5e7eb'}`,
                      color: isDark ? '#a3a3a3' : '#6b7280',
                    }}
                    className="px-3 py-1.5 text-[13px] font-bold uppercase tracking-wider"
                  >
                    Estado del Asesor
                  </div>
                  {ESTADOS_ASESOR.map((op, i) => {
                    const activo = estadoAsesor === op.label
                    const separador = op.tipo === 'sesion' && ESTADOS_ASESOR[i - 1]?.tipo !== 'sesion'
                    return (
                      <button
                        key={op.label}
                        onClick={() => elegirEstado(op.label)}
                        style={{
                          background: activo
                            ? (isDark ? '#1f1f1f' : '#f0fdfa')
                            : 'transparent',
                          color: activo
                            ? (isDark ? '#e5e5e5' : '#0f766e')
                            : (isDark ? '#e5e5e5' : '#374151'),
                          borderTop: separador ? `1px solid ${isDark ? '#404040' : '#e5e7eb'}` : 'none',
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition hover:opacity-90"
                      >
                        {op.tipo === 'listo' ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : (
                          <Clock size={16} className="text-amber-500" />
                        )}
                        <span className="flex-1 truncate">{op.label}</span>
                        {activo && <Check size={16} />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Iconos de servicio */}
            <button
              title="Dispositivo de audio"
              className="flex items-center gap-0.5 text-white/90 hover:text-white px-1 py-0.5"
            >
              <Headphones size={17} />
              <ChevronDown size={12} />
            </button>
            <button
              title="Ayuda"
              className="flex items-center gap-0.5 text-white/90 hover:text-white px-1 py-0.5"
            >
              <HelpCircle size={17} />
              <ChevronDown size={12} />
            </button>

            {/* Controles de ventana Genesys */}
            <div className="flex items-center gap-1 pl-2 ml-1 border-l border-white/20">
              <button
                type="button"
                title="Minimizar"
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/15 text-white/80 hover:text-white transition"
              >
                <Minus size={15} />
              </button>
              <button
                type="button"
                title="Maximizar / Restaurar"
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/15 text-white/80 hover:text-white transition"
              >
                <Square size={12} />
              </button>
              <button
                type="button"
                onClick={reiniciar}
                title="Cerrar sesión"
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/80 text-white/80 hover:text-white transition"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================================
            2. INTERACTION BAR - Pestañas e interacciones de llamada
        =================================================================== */}
        <div
          style={{
            background: theme.barBg,
            height: '46px',
            borderBottom: `1px solid ${theme.barBorder}`,
            flexShrink: 0,
          }}
          className="flex items-stretch overflow-x-auto overflow-y-hidden"
        >
          {/* Icono de iris / engranaje izquierdo */}
          <div
            style={{
              borderColor: theme.barBorder,
              background: isDark ? '#171717' : '#e2e8f0',
              color: isDark ? '#a3a3a3' : '#64748b',
            }}
            className="flex items-center px-2 border-r"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="4" r="1.5" />
              <circle cx="20" cy="12" r="1.5" />
              <circle cx="12" cy="20" r="1.5" />
              <circle cx="4" cy="12" r="1.5" />
            </svg>
          </div>

          {/* ===============================================================
              PESTAÑA DE LA LLAMADA ACTIVA (JUAN+PABLO+FARIAS+PENA)
              Teal con todos los botones de llamada
          =============================================================== */}
          <div
            style={{
              background: theme.activeTabBg,
              borderLeft: `4px solid ${theme.activeTabBorder}`,
              borderRight: `1px solid ${theme.activeTabBorder}`,
            }}
            className="flex items-center gap-2 px-3 text-white shadow-sm shrink-0 relative"
          >
            {/* Nombre del cliente */}
            <span className="font-bold text-[14px] tracking-wide">
              {casoActual.cliente.genesys}
            </span>

            {/* Teléfono + Timer */}
            <div className="flex items-center gap-1 text-[14px] font-mono text-white/90">
              <Phone size={15} className={retener ? 'text-amber-300' : 'text-emerald-300'} />
              <span>{tiempoLlamada}</span>
            </div>

            {/* Mensaje tipo cápsula: En espera */}
            {retener && (
              <span
                style={{
                  backgroundColor: isDark ? '#b45309' : '#f59e0b',
                  color: '#ffffff',
                  borderColor: isDark ? '#f59e0b' : '#d97706',
                }}
                className="text-[12px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border shadow-xs animate-pulse"
              >
                En espera
              </span>
            )}

            {/* SEPARADOR VERTICAL */}
            <div className="h-4 w-px bg-white/20 mx-0.5" />

            {/* BOTONES DE CONTROL DE LLAMADA */}
            <div className="flex items-center gap-1">
              {/* 1. COLGAR */}
              <button
                onClick={() => {
                  setEtapa('finalizada')
                  setStatus('Not Ready')
                  sonarBeep(350, 0.25)
                  onToast?.('Llamada finalizada por el asesor, pasando a Wrap-up')
                }}
                title="Finalizar llamada"
                className="w-8 h-8 rounded flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
              >
                <PhoneOff size={16} />
              </button>

              {/* 2. RETENER (HOLD) */}
              <button
                onClick={toggleRetener}
                title={retener ? 'Reanudar llamada' : 'Retener llamada (Hold)'}
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  retener
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                {retener ? <PhonePlayIcon size={15} /> : <PhoneClockIcon size={15} />}
              </button>

              {/* 3. TRANSFERENCIAS DIRECTAS (teléfono con flecha) */}
              <button
                id="btn-transfer-directas"
                data-transfer-trigger
                onClick={() => toggleTransfer('directas', 'btn-transfer-directas')}
                title="Transferencias Directas"
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  showTransfer && tipoTransfer === 'directas'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <PhoneForwarded size={15} />
              </button>

              {/* 5. TECLADO DTMF */}
              <button
                id="btn-keypad-header"
                onClick={toggleKeypad}
                title="Teclado numérico / Tonos DTMF"
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  showKeypad
                    ? 'bg-gray-600 text-white'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <Grid size={15} />
              </button>

              {/* 6. MUTE */}
              <button
                onClick={toggleMutear}
                title={mutear ? 'Reactivar micrófono' : 'Silenciar micrófono'}
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  mutear
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                {mutear ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              {/* 7. VOLUMEN */}
              <button
                id="btn-volume-header"
                onClick={() => setShowVolume((v) => !v)}
                title="Control de volumen de audio"
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  showVolume
                    ? 'bg-neutral-700 text-white'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <Volume2 size={15} />
              </button>

              {/* 8. TRANSFERENCIA ASISTIDA (1 persona) */}
              <button
                id="btn-transfer-asistida"
                data-transfer-trigger
                onClick={() => toggleTransfer('asistida', 'btn-transfer-asistida')}
                title="Transferencia Asistida"
                className={`w-8 h-8 rounded flex items-center justify-center transition ${
                  showTransfer && tipoTransfer === 'asistida'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <User size={15} />
              </button>
            </div>

            {/* POPOVER DEL TECLADO DTMF */}
            {showKeypad && (
              <div
                ref={keypadRef}
                style={{
                  position: 'fixed',
                  top: `${keypadPos.top}px`,
                  left: `${keypadPos.left}px`,
                  background: '#2b2b2b',
                  border: '1px solid #4a4a4a',
                  borderRadius: '3px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  zIndex: 99999,
                  width: '210px',
                  padding: '8px',
                  color: 'white',
                }}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-600 mb-2">
                  <span className="text-[13px] font-bold text-gray-300 uppercase tracking-wider">
                    Teclado DTMF
                  </span>
                  <button
                    onClick={() => setShowKeypad(false)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="bg-black/30 border border-gray-600 px-2 py-1 text-center font-mono text-emerald-400 text-sm rounded mb-2 min-h-[22px]">
                  {dtmfDigits || 'Marcar número'}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                    <button
                      key={d}
                      onClick={() => marcarDigitoDTMF(d)}
                      className="py-1.5 rounded bg-gray-700 hover:bg-neutral-600 text-white font-mono font-bold text-sm transition active:scale-95 text-center"
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex justify-between">
                  <button
                    onClick={() => setDtmfDigits('')}
                    className="text-[12px] text-gray-400 hover:text-red-400"
                  >
                    Borrar
                  </button>
                  <button
                    onClick={() => setShowKeypad(false)}
                    className="text-[12px] bg-neutral-600 px-2 py-0.5 rounded text-white"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {/* POPOVER DE VOLUMEN */}
            {showVolume && (
              <div
                ref={volumeRef}
                style={{
                  position: 'absolute',
                  top: '38px',
                  right: '10px',
                  background: '#2b2b2b',
                  border: '1px solid #4a4a4a',
                  borderRadius: '3px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  zIndex: 99999,
                  width: '190px',
                  padding: '8px',
                  color: 'white',
                }}
              >
                <div className="flex items-center justify-between pb-1 border-b border-gray-600 mb-2">
                  <span className="text-[13px] font-bold text-gray-300">Volumen: {volumen}%</span>
                  <button
                    onClick={() => setShowVolume(false)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumen}
                  onChange={(e) => setVolumen(Number(e.target.value))}
                  className="w-full accent-neutral-400 cursor-pointer"
                />
                <div className="mt-2 flex items-center justify-between text-[12px] text-gray-300">
                  <button
                    onClick={() => setVolumen(0)}
                    className="hover:text-red-300 flex items-center gap-1"
                  >
                    <VolumeX size={13} /> Mudo
                  </button>
                  <button
                    onClick={() => setVolumen(100)}
                    className="hover:text-neutral-300 flex items-center gap-1"
                  >
                    <Volume2 size={13} /> 100%
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menú de opciones derecho */}
          <div
            style={{ color: isDark ? '#a3a3a3' : '#64748b' }}
            className="ml-auto flex items-center gap-2 px-2"
          >
            <button className="hover:opacity-100">
              <ChevronDown size={16} />
            </button>
            <button className="hover:opacity-100">
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* ===================================================================
            DROPDOWN DE TRANSFERENCIA (IDÉNTICO A LAS CAPTURAS DE GENESYS)
        =================================================================== */}
        {showTransfer && (
          <div
            ref={transferRef}
            style={{
              position: 'fixed',
              top: `${transferPos.top}px`,
              left: `${transferPos.left}px`,
              width: '480px',
              maxHeight: '560px',
              background: '#3c3c3c',
              border: '1px solid #5a5a5a',
              borderRadius: '2px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
            }}
          >
            <div className="p-2 border-b border-gray-600 bg-[#343434]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1">
                  {tipoTransfer === 'directas' ? <PhoneForwarded size={15} /> : <User size={15} />}
                  {tipoTransfer === 'directas' ? 'Transferencia Directa' : 'Transferencia Asistida'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={busquedaDirectorio}
                  onChange={(e) => setBusquedaDirectorio(e.target.value)}
                  placeholder="Escribir nombre o número"
                  className="w-full bg-[#4a4a4a] text-white text-sm px-2.5 py-1.5 pr-7 rounded-sm border border-gray-500 focus:outline-none focus:border-gray-400 placeholder-gray-300"
                />
                <Search size={17} className="absolute right-2 top-2 text-gray-300" />
              </div>
            </div>

            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-600 bg-[#3c3c3c] text-sm">
              <button
                onClick={() => setTabTransfer('directorio')}
                title="Directorio personal"
                className={`p-1 rounded-sm ${
                  tabTransfer === 'directorio' ? 'bg-gray-600 text-white' : 'hover:bg-gray-600 text-gray-300'
                }`}
              >
                <User size={18} />
              </button>
              <button
                onClick={() => setTabTransfer('favoritos')}
                title="Favoritos"
                className={`p-1 rounded-sm ${
                  tabTransfer === 'favoritos' ? 'bg-gray-600 text-white' : 'hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Star size={18} className="fill-current" />
              </button>
              <button
                onClick={() => setTabTransfer('historial')}
                title="Historial"
                className={`p-1 rounded-sm ${
                  tabTransfer === 'historial' ? 'bg-gray-600 text-white' : 'hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Clock size={18} />
              </button>

              <select className="bg-[#4a4a4a] text-white text-[14px] px-2 py-1 rounded-sm border border-gray-500 ml-1">
                <option>Todos los tipos</option>
                <option>Colas de atención</option>
                <option>Extensiones internas</option>
              </select>

              <button className="p-1 rounded-sm hover:bg-gray-600 text-gray-300 ml-auto">
                <Users size={18} />
              </button>

              <button
                onClick={() => setShowTransfer(false)}
                className="p-1 rounded-sm hover:bg-red-600 text-gray-300 ml-1"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[420px] divide-y divide-gray-600/50">
              {colasFiltradas.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No se encontraron colas con ese nombre.
                </div>
              ) : (
                colasFiltradas.map((cola) => (
                  <div
                    key={cola.nombre}
                    className="flex items-center justify-between px-3 py-2 hover:bg-[#4a4a4a] transition group cursor-pointer"
                    onClick={() => setColaSeleccionada(cola)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-0.5 text-gray-300 group-hover:text-white">
                        {tipoTransfer === 'directas' ? (
                          <PhoneForwarded size={16} />
                        ) : (
                          <Phone size={16} />
                        )}
                        <ChevronDown size={12} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{cola.nombre}</p>
                        <p className="text-[13px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          {cola.interacciones} interaction(s) waiting.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Star
                        size={17}
                        className={cola.favorito ? 'text-amber-400 fill-amber-400' : 'text-gray-400'}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          transferirACola(cola)
                        }}
                        title={`Transferir ahora a ${cola.nombre}`}
                        className="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center transition shadow"
                      >
                        <ArrowRightLeft size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-gray-600 bg-[#343434] flex items-center justify-between text-[14px]">
              <span className="text-gray-400">
                {colaSeleccionada ? `Seleccionada: ${colaSeleccionada.nombre}` : 'Elige una cola'}
              </span>
              {colaSeleccionada && (
                <button
                  onClick={() => transferirACola(colaSeleccionada)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-sm text-sm font-semibold"
                >
                  {tipoTransfer === 'directas'
                    ? 'Completar Transferencia'
                    : 'Completar Transfer. Asistida'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            3. MAIN CONTENT AREA (INFORMACIÓN DEL CASO + SIMULADOR DE DIÁLOGO)
        =================================================================== */}
        <div
          style={{ backgroundColor: theme.contentBg }}
          className="flex-1 flex overflow-hidden min-h-0"
        >
          {/* PANEL CENTRAL PRINCIPAL */}
          <div
            style={{ borderColor: theme.contentBorder }}
            className="flex-1 flex flex-col overflow-y-auto border-r"
          >
            {/* Header del caso */}
            <div
              style={{ background: theme.caseHeaderBg, height: '34px' }}
              className="flex items-center justify-between px-3 text-white text-[14px] font-bold shrink-0 shadow-xs"
            >
              <span>Información del caso</span>
              <div className="flex items-center gap-2 opacity-90">
                <button className="hover:opacity-100 font-bold">+</button>
                <button className="hover:opacity-100">▲</button>
              </div>
            </div>

            {/* TABLA DE METADATOS DEL CASO */}
            <div
              style={{
                backgroundColor: theme.caseTableBg,
                borderColor: theme.contentBorder,
              }}
              className="p-3 border-b shrink-0"
            >
              <table className="w-full text-[14px] border-collapse">
                <tbody>
                  {[
                    ['Origen:', casoActual.meta.origen],
                    ['Cola:', casoActual.meta.cola],
                    ['RUT:', casoActual.meta.rut],
                    ['NOMBRE:', casoActual.cliente.genesys],
                    ['RAMA IVR:', casoActual.meta.ramaIVR],
                    ['ANI:', casoActual.meta.ani],
                    ['CallID:', casoActual.meta.callID],
                    ['Canal_Ingreso:', casoActual.meta.canalIngreso],
                    ['ConnID:', casoActual.meta.connID],
                    ['ID de la llamada:', casoActual.meta.idLlamada],
                  ].map(([label, val]) => (
                    <tr
                      key={label}
                      style={{ borderColor: theme.caseRowBorder }}
                    >
                      <td
                        style={{ color: theme.caseLabel }}
                        className="py-0.5 pr-4 font-bold w-[150px] whitespace-nowrap"
                      >
                        {label}
                      </td>
                      <td
                        style={{ color: theme.caseValue }}
                        className="py-0.5 select-text cursor-context-menu hover:underline decoration-dotted underline-offset-2"
                        onContextMenu={(e) => abrirMenuCopia(e, val)}
                        title="Clic derecho para copiar"
                      >
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Barra secundaria del cliente activo */}
            <div
              style={{
                backgroundColor: theme.subbarBg,
                borderColor: theme.subbarBorder,
                color: theme.subbarText,
              }}
              className="px-3 py-1 border-b flex items-center justify-between text-sm shrink-0"
            >
              <div className="flex items-center gap-2">
                <span className="opacity-60">▼</span>
                <span className="font-semibold">
                  {casoActual.cliente.corto}
                </span>
                <Phone
                  size={15}
                  className={retener ? 'text-amber-500' : 'text-emerald-500'}
                />
                <span
                  style={{
                    color: retener
                      ? (isDark ? '#fbbf24' : '#d97706')
                      : (isDark ? '#34d399' : '#059669'),
                  }}
                  className="font-semibold"
                >
                  {retener ? 'En espera (Hold)' : 'Conectado'}
                </span>
              </div>
              <span className="text-[13px] opacity-70 font-mono">📑 (1)</span>
            </div>

            {/* PANEL DEL DIÁLOGO Y SIMULACIÓN EN VIVO DE LA LLAMADA */}
            <div
              style={{
                backgroundColor: isDark ? '#0a0a0a' : '#f8fafc',
              }}
              className="p-4 flex-1 flex flex-col gap-4"
            >
              <div
                style={{
                  backgroundColor: theme.dialogueBoxBg,
                  borderColor: theme.dialogueBorder,
                  color: theme.cardText,
                }}
                className="rounded border p-3.5 shadow-xs order-2"
              >
                <div
                  style={{ borderColor: theme.contentBorder }}
                  className="flex items-center gap-2 mb-2 pb-1.5 border-b"
                >
                  <Radio size={17} className="text-emerald-500 animate-pulse" />
                  <span
                    style={{ color: theme.caseLabel }}
                    className="font-bold text-sm"
                  >
                    Casuística de la llamada
                  </span>
                </div>

                {/* Selector de casuísticas (lista desplegable) */}
                <div className="mt-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: casoActual.color }}
                    />
                    <select
                      id="select-casuistica"
                      value={casoId}
                      onChange={(e) => seleccionarCaso(e.target.value)}
                      style={{
                        backgroundColor: theme.inputBg,
                        color: theme.inputText,
                        borderColor: theme.inputBorder,
                      }}
                      className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 shadow-xs"
                    >
                      {[...new Set(CASOS.map((c) => c.tema))].map((tema) => (
                        <optgroup key={tema} label={tema}>
                          {CASOS.filter((c) => c.tema === tema).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.titulo}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <p
                    style={{ color: isDark ? '#737373' : '#94a3b8' }}
                    className="text-[12px] mt-1"
                  >
                    {casoActual.tema} · {casoActual.descripcion}
                  </p>
                </div>

                {/* Globo de diálogo del cliente */}
                <div
                  style={{
                    backgroundColor: theme.bubbleBg,
                    borderColor: theme.bubbleBorder,
                  }}
                  className="flex items-start gap-3 p-3 rounded border"
                >
                  <div
                    style={{
                      backgroundColor: isDark ? '#525252' : '#115e59',
                    }}
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                  >
                    {casoActual.cliente.iniciales}
                  </div>
                  <div className="flex-1">
                    <p
                      style={{ color: theme.bubbleLabel }}
                      className="font-semibold text-sm mb-0.5"
                    >
                      {casoActual.cliente.nombre} (Cliente)
                    </p>
                    <p
                      style={{ color: theme.bubbleText }}
                      className="text-sm leading-relaxed italic"
                    >
                      "{guionActual.cliente}"
                    </p>
                  </div>
                </div>

                {/* Opciones de respuesta para el asesor */}
                <div className="mt-3">
                  <p
                    style={{ color: isDark ? '#a3a3a3' : '#64748b' }}
                    className="text-[13px] font-bold uppercase tracking-wider mb-2"
                  >
                    Opciones de Respuesta del Asesor (Selecciona para interactuar):
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {guionActual.respuestas.map((resp, i) => (
                      <button
                        key={i}
                        onClick={() => responderGuion(resp)}
                        style={{
                          backgroundColor: theme.optionBtnBg,
                          borderColor: theme.optionBtnBorder,
                          color: theme.optionBtnText,
                        }}
                        className="text-left p-2.5 rounded border transition flex flex-col justify-between group shadow-xs hover:scale-[1.01]"
                      >
                        <span className="text-sm font-medium">
                          "{resp.texto}"
                        </span>
                        <span
                          style={{ color: theme.optionFeedback }}
                          className="text-[13px] mt-1.5 font-semibold flex items-center gap-1"
                        >
                          <Sparkles size={13} />
                          {resp.feedback}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE NOTA DE INTERACCIÓN */}
              <div
                style={{
                  backgroundColor: theme.noteBg,
                  borderColor: theme.noteBorder,
                }}
                className="flex-1 flex flex-col min-h-[180px] border rounded overflow-hidden shadow-xs order-1"
              >
                <div
                  style={{
                    backgroundColor: isDark ? '#171717' : '#f8fafc',
                    borderColor: theme.noteBorder,
                  }}
                  className="border-b px-3 py-1 flex items-center justify-between"
                >
                  <span
                    style={{ color: isDark ? '#e5e5e5' : '#0f766e' }}
                    className="text-sm font-bold"
                  >
                    Nota de la llamada
                  </span>
                  <span
                    style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}
                    className="text-[13px]"
                  >
                    Se adjunta al ticket
                  </span>
                </div>
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Escribe el resumen de la atención, diagnóstico técnico o notas de seguimiento..."
                  style={{
                    backgroundColor: theme.noteTextareaBg,
                    color: theme.noteTextareaText,
                  }}
                  className="w-full flex-1 p-2.5 text-sm outline-none resize-none font-sans"
                />
                <div
                  style={{
                    backgroundColor: isDark ? '#171717' : '#f8fafc',
                    borderColor: theme.noteBorder,
                  }}
                  className="p-2 border-t flex items-center justify-between"
                >
                  <span
                    style={{ color: isDark ? '#737373' : '#94a3b8' }}
                    className="text-[13px]"
                  >
                    {nota.length} caracteres
                  </span>
                  <button
                    onClick={() => {
                      onToast?.('Nota guardada correctamente')
                      setNota('')
                    }}
                    style={{
                      backgroundColor: isDark ? '#404040' : '#334155',
                      color: '#ffffff',
                    }}
                    className="px-3 py-1 rounded text-sm transition hover:opacity-90 font-medium"
                  >
                    Guardar Nota
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===============================================================
              PANEL DERECHO DE TABS VERTICALES (CONTACTO / RESPUESTAS)
          =============================================================== */}
          <div className="flex shrink-0">
            <div
              style={{
                width: '34px',
                backgroundColor: theme.sideBarBg,
                borderColor: theme.sideBorder,
              }}
              className="border-l flex flex-col items-center pt-2 gap-3"
            >
              {['CONTACTO', 'RESPUESTAS'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTabActiva(tab)}
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    padding: '8px 4px',
                    fontSize: '13px',
                    letterSpacing: '0.06em',
                    fontWeight: tabActiva === tab ? '700' : '500',
                    color: tabActiva === tab
                      ? (isDark ? '#e5e5e5' : '#2d8ca0')
                      : (isDark ? '#737373' : '#6b7280'),
                    borderLeft: tabActiva === tab
                      ? `2px solid ${isDark ? '#e5e5e5' : '#2d8ca0'}`
                      : 'none',
                    background: tabActiva === tab
                      ? (isDark ? '#1a1a1a' : '#ffffff')
                      : 'transparent',
                  }}
                  className="cursor-pointer transition"
                >
                  {tab}
                </button>
              ))}
            </div>

            <div
              style={{
                width: '280px',
                backgroundColor: theme.sidePanelBg,
                borderColor: theme.sideBorder,
                color: theme.sideText,
              }}
              className="border-l p-3 overflow-y-auto"
            >
              {tabActiva === 'CONTACTO' && (
                <div className="space-y-3">
                  <div
                    style={{ borderColor: theme.sideBorder }}
                    className="flex items-center gap-2 pb-2 border-b"
                  >
                    <UserCheck size={20} className={isDark ? 'text-neutral-300' : 'text-teal-700'} />
                    <div>
                      <p
                        style={{ color: theme.caseLabel }}
                        className="font-bold text-sm"
                      >
                        Ficha del Cliente
                      </p>
                      <p
                        style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}
                        className="text-[13px]"
                      >
                        Datos VTR Hogar
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p>
                      <strong style={{ color: theme.caseLabel }}>RUT:</strong> {casoActual.ficha.rut}
                    </p>
                    <p>
                      <strong style={{ color: theme.caseLabel }}>Nombre:</strong> {casoActual.cliente.nombre}
                    </p>
                    <p>
                      <strong style={{ color: theme.caseLabel }}>Teléfono:</strong> {casoActual.meta.ani}
                    </p>
                    <p>
                      <strong style={{ color: theme.caseLabel }}>Plan:</strong> {casoActual.ficha.plan}
                    </p>
                    <p>
                      <strong style={{ color: theme.caseLabel }}>Dirección:</strong> {casoActual.ficha.direccion}
                    </p>
                    <p>
                      <strong style={{ color: theme.caseLabel }}>Nodo:</strong> {casoActual.ficha.nodo}
                    </p>
                    <p>
                      <strong style={{ color: theme.caseLabel }}>Módem MAC:</strong> {casoActual.ficha.mac}
                    </p>
                  </div>
                </div>
              )}

              {tabActiva === 'RESPUESTAS' && (
                <div className="space-y-2">
                  <div
                    style={{ borderColor: theme.sideBorder }}
                    className="flex items-center gap-2 pb-2 border-b"
                  >
                    <MessageSquare size={20} className={isDark ? 'text-neutral-300' : 'text-teal-700'} />
                    <div>
                      <p
                        style={{ color: theme.caseLabel }}
                        className="font-bold text-sm"
                      >
                        Respuestas Rápidas
                      </p>
                      <p
                        style={{ color: isDark ? '#a3a3a3' : '#6b7280' }}
                        className="text-[13px]"
                      >
                        Plantillas de atención
                      </p>
                    </div>
                  </div>
                  {[
                    'Gracias por comunicarse con Claro VTR.',
                    'Permítame un momento mientras verifico su señal.',
                    'Se ha generado la visita técnica con éxito.',
                    'Reinicie su módem desconectando 30 segundos.',
                    'Que tenga una muy buena tarde, hasta luego.',
                  ].map((resp, i) => (
                    <button
                      key={i}
                      onClick={() => setNota((n) => (n ? `${n} ` : '') + resp)}
                      style={{
                        backgroundColor: isDark ? '#171717' : '#f8fafc',
                        borderColor: theme.sideBorder,
                        color: theme.sideText,
                      }}
                      className="w-full text-left p-2 rounded border text-[14px] transition hover:opacity-90"
                    >
                      {resp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================
            4. PANEL INFERIOR DE CONSULTA
        =================================================================== */}
        {showConsulta && (
          <div
            style={{ background: '#2c2c2c', borderTop: '2px solid #4a4a4a' }}
            className="text-white text-sm shrink-0 shadow-lg"
          >
            <div className="flex items-center justify-between px-3 py-1 bg-[#232323] border-b border-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px] text-white">
                  Consulta: 4084
                </span>
                <Phone size={15} className="text-emerald-400" />
                <span className="font-mono text-gray-300">({tiempoConsulta})</span>
              </div>
              <button
                onClick={toggleConsulta}
                className="text-gray-400 hover:text-white text-sm"
              >
                ▲
              </button>
            </div>

            <div className="p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">▼</span>
                <span className="font-mono font-bold text-white">4084</span>
                <Phone size={16} className="text-emerald-400" />
                <span className="text-emerald-300 text-sm">
                  Estableciendo comunicación con Supervisor Nivel 2 (Soporte Técnico)...
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleConsulta}
                  title="Finalizar consulta"
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-1.5 transition"
                >
                  <PhoneOff size={15} />
                  Terminar Consulta
                </button>
                <button
                  onClick={() => {
                    onToast?.('Conferencia tripartita iniciada: Cliente + Supervisor + Asesor')
                  }}
                  className="px-2.5 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold flex items-center gap-1.5 transition"
                >
                  <Users size={15} />
                  Conferencia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            5. POST-LLAMADA (WRAP-UP) SI ETAPA === 'finalizada'
        =================================================================== */}
        {etapa === 'finalizada' && (
          <div
            style={{
              backgroundColor: isDark ? '#262626' : '#f1f5f9',
              borderColor: theme.contentBorder,
            }}
            className="p-3 border-t flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                ● Estado: Post-Llamada (Wrap-up)
              </span>
              <div className="flex items-center gap-2">
                <span style={{ color: theme.caseValue }} className="text-sm">
                  Disposición:
                </span>
                <select
                  value={disposicion}
                  onChange={(e) => setDisposicion(e.target.value)}
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.inputText,
                    borderColor: theme.inputBorder,
                  }}
                  className="border rounded px-2 py-1 text-sm outline-none"
                >
                  {DISPOSICIONES.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={reiniciar}
              style={{
                backgroundColor: isDark ? '#404040' : '#1e293b',
                color: '#ffffff',
              }}
              className="px-4 py-1.5 rounded text-sm font-bold flex items-center gap-1.5 transition hover:opacity-90"
            >
              <RotateCcw size={16} />
              Cerrar Wrap-up y Reiniciar
            </button>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // VISTA PANTALLA LOGIN / CONNECT (SOPORTA MODO CLARO Y OSCURO PERFECTO)
  // =========================================================================
  const pasoActualLogin = ETAPAS.indexOf(etapa)

  return (
    <div
      style={{
        backgroundColor: isDark ? '#0a0a0a' : 'transparent',
        color: theme.cardText,
      }}
      className="w-full h-full flex flex-col justify-center px-4 py-8 overflow-y-auto"
    >
      <div className="mx-auto max-w-5xl w-full">
        {/* Header con icono y cápsula */}
        <header className="mb-6 flex items-start gap-4">
          <span
            style={{
              backgroundColor: isDark ? 'rgba(64, 64, 64, 0.4)' : '#ccfbf1',
              color: isDark ? '#e5e5e5' : '#0f766e',
              borderColor: isDark ? '#404040' : '#99f6e4',
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs"
          >
            <Headphones size={24} />
          </span>
          <div>
            <h2
              style={{ color: theme.caseLabel }}
              className="text-xl font-bold flex items-center gap-2"
            >
              Simulador Genesys Workspace
              {/* Mensaje tipo cápsula del encabezado */}
              <span
                style={{
                  backgroundColor: isDark ? 'rgba(82, 82, 82, 0.8)' : '#f0fdfa',
                  color: isDark ? '#e5e5e5' : '#0f766e',
                  borderColor: isDark ? '#404040' : '#99f6e4',
                }}
                className="text-[13px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs"
              >
                Aplicación de telefonía
              </span>
            </h2>
            <p
              style={{ color: isDark ? '#a3a3a3' : '#64748b' }}
              className="text-sm mt-1"
            >
              Simulador de la consola Genesys real de Claro VTR con llamadas entrantes,
              controles telefónicos (Retener, Consulta, Transferir, DTMF, Mute) y wrap-up.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Tarjeta de conexión al Softphone */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.cardText,
            }}
            className="rounded-2xl border p-6 shadow-sm"
          >
            <div className="mx-auto max-w-sm space-y-4 py-6">
              <div className="text-center space-y-1">
                <div
                  style={{
                    backgroundColor: isDark ? '#525252' : '#0d9488',
                  }}
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto shadow-md"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="8" cy="14" r="5" stroke="white" strokeWidth="2.2" />
                    <circle cx="16" cy="10" r="5" stroke="white" strokeWidth="2.2" />
                  </svg>
                </div>
                <h3
                  style={{ color: theme.caseLabel }}
                  className="text-base font-bold pt-2"
                >
                  {etapa === 'login-credentials' ? 'Genesys Workspace Login' : 'Genesys Workspace - PG'}
                </h3>
                <p
                  style={{ color: isDark ? '#a3a3a3' : '#64748b' }}
                  className="text-sm"
                >
                  {etapa === 'login-credentials'
                    ? 'Web Edition 8.5.200.96'
                    : 'Ingresa el PG (grupo de atención) para conectarte.'}
                </p>
              </div>

              {etapa === 'login-credentials' ? (
                <>
                  <label className="block">
                    <span
                      style={{ color: isDark ? '#d4d4d4' : '#475569' }}
                      className="mb-1 block text-[14px] font-bold uppercase tracking-wide"
                    >
                      Usuario
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{
                        backgroundColor: theme.inputBg,
                        color: theme.inputText,
                        borderColor: theme.inputBorder,
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 font-mono shadow-xs"
                      placeholder="Tu usuario"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="block">
                    <span
                      style={{ color: isDark ? '#d4d4d4' : '#475569' }}
                      className="mb-1 block text-[14px] font-bold uppercase tracking-wide"
                    >
                      PG / Grupo
                    </span>
                    <input
                      type="text"
                      value={grupo}
                      onChange={(e) => setGrupo(e.target.value)}
                      style={{
                        backgroundColor: theme.inputBg,
                        color: theme.inputText,
                        borderColor: theme.inputBorder,
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 font-mono shadow-xs"
                      placeholder="PG_APEX_INBOUND"
                    />
                  </label>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setEtapa('login-credentials')}
                      style={{ color: isDark ? '#a3a3a3' : '#64748b' }}
                      className="text-sm hover:underline"
                    >
                      Change login account
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={conectarYEntrarLlamada}
                style={{
                  backgroundColor: isDark ? '#525252' : '#0d9488',
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold transition hover:opacity-90 hover:shadow-lg w-full"
              >
                <PhoneCall size={20} />
                Log In
              </button>
            </div>
          </div>

          {/* Panel de pasos de instrucción */}
          <aside
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.cardText,
            }}
            className="flex flex-col rounded-2xl border p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <p
                style={{ color: isDark ? '#a3a3a3' : '#94a3b8' }}
                className="text-[14px] font-bold uppercase tracking-wider"
              >
                Paso {pasoActualLogin + 1} de {ETAPAS.length}
              </p>
              <button
                type="button"
                onClick={reiniciar}
                style={{ color: isDark ? '#a3a3a3' : '#64748b' }}
                className="inline-flex items-center gap-1 text-[14px] font-medium hover:underline"
              >
                <RotateCcw size={16} />
                Reiniciar
              </button>
            </div>

            {/* Cápsulas de progreso de etapas */}
            <div className="mb-4 flex items-center gap-1.5">
              {ETAPAS.map((e, i) => (
                <span
                  key={e}
                  style={{
                    backgroundColor: i <= pasoActualLogin
                      ? (isDark ? '#d4d4d4' : '#0d9488')
                      : (isDark ? '#404040' : '#e2e8f0'),
                  }}
                  className="h-1.5 flex-1 rounded-full transition-all"
                />
              ))}
            </div>

            <h3
              style={{ color: theme.caseLabel }}
              className="mb-3 flex items-center gap-2 text-base font-bold"
            >
              <Phone size={20} className={isDark ? 'text-neutral-300' : 'text-teal-600'} />
              {PASOS[etapa]?.titulo || 'Genesys Workspace'}
            </h3>

            <ul className="space-y-2.5">
              {PASOS[etapa]?.instrucciones?.map((t, i) => (
                <li
                  key={i}
                  style={{ color: isDark ? '#d4d4d4' : '#4b5563' }}
                  className="flex gap-2.5 text-sm"
                >
                  {/* Cápsula numérica */}
                  <span
                    style={{
                      backgroundColor: isDark ? '#1f1f1f' : '#ccfbf1',
                      color: isDark ? '#e5e5e5' : '#0f766e',
                      borderColor: isDark ? '#525252' : '#99f6e4',
                    }}
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[13px] font-bold border"
                  >
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-5">
              <button
                onClick={conectarYEntrarLlamada}
                style={{
                  backgroundColor: isDark ? '#525252' : '#0d9488',
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold transition hover:opacity-90 hover:shadow-lg w-full"
              >
                {etapa === 'login-credentials' ? 'Continuar' : 'Conectar a Genesys'}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Menú contextual para copiar valores del caso */}
      {menuCopia && (
        <div
          ref={menuCopiaRef}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: 'fixed',
            top: menuCopia.y,
            left: menuCopia.x,
            zIndex: 80,
            backgroundColor: isDark ? '#262626' : '#ffffff',
            borderColor: isDark ? '#525252' : '#d1d5db',
            color: theme.cardText,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          }}
          className="rounded-lg border overflow-hidden text-[13px]"
        >
          <div
            style={{ borderColor: theme.contentBorder }}
            className="px-3 py-1.5 font-mono text-[11px] opacity-70 truncate max-w-[224px] border-b"
            title={menuCopia.value}
          >
            {menuCopia.value}
          </div>
          <button
            type="button"
            onClick={() => copiarValor(menuCopia.value)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left transition hover:bg-black/10"
            style={{ color: theme.cardText }}
          >
            {copiadoTag === menuCopia.value ? (
              <>
                <Check size={14} className="text-emerald-500" />
                <span className="font-medium text-emerald-500">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="font-medium">Copiar</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}