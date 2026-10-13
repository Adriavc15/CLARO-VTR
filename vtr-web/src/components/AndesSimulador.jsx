import React, { useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Datos fieles extraídos directamente de las capturas originales de Siebel / ANDES
// ─────────────────────────────────────────────────────────────────────────────

const CLIENTES = {
  '3801185-5': {
    rut: '3801185-5',
    nombre: 'VICTOR DOMINGO',
    apPaterno: 'ORMAZABAL',
    apMaterno: 'MUNOZ',
    direccion: 'MANUTARA 128',
    comuna: 'SAN BERNARDO',
    telefono: '992243029',
    correo: 'VC ORMAZABAL@GMAIL.COM',
    edad: '89',
    segmentoValor: 'CONVENIO',
    marca: 'VTR',
    enCobranza: false,
    fallasMasivas: false,
    reiterados: false,
    cuentaMigrada: true,
    maxIptvPermitido: '',
    fechaActIptv: '',
    resultadoUltEncuestaNps: '',
    fechaUltEncuestaNps: '',
    cambioTitularidad: false,
    fechaLiberacionBloqueo: '',
  },
  '18895864-8': {
    rut: '18895864-8',
    nombre: 'BORIS ALEXIS',
    apPaterno: 'BRICENO',
    apMaterno: 'ANTILEF',
    direccion: 'GUILLERMO MANN 2600',
    comuna: 'NUNOA',
    telefono: '958966624',
    correo: 'boris.briceno9@gmail.com',
    edad: '33',
    segmentoValor: '',
    marca: 'VTR',
    enCobranza: false,
    fallasMasivas: false,
    reiterados: false,
    cuentaMigrada: true,
    maxIptvPermitido: '',
    fechaActIptv: '',
    resultadoUltEncuestaNps: '',
    fechaUltEncuestaNps: '',
    cambioTitularidad: false,
    fechaLiberacionBloqueo: '',
  },
}

// Siguiente mejor Acción (Resumen)
const SIGUIENTE_MEJOR_ACCION = [
  {
    cola: 'VE... VTR',
    marca: 'VEN... VENTA_CRUZADA_MOVIL_CLIENTES_HOGAR',
    accion: '',
  },
]

// Perfil de facturación (Resumen)
const PERFIL_PAGO = [
  {
    nombre: '264532576436',
    metodo: 'Medio Pago no Contratado',
    marca: 'VTR',
    distribucion: 'Electrónico',
    dom: '6',
  },
]

// Productos Instalados (Resumen)
const PRODUCTOS = [
  {
    estado: 'Activo',
    fechaInstalacion: '07/07/2020',
    vigenteDesde: '07/07/2020',
    producto: '3P Fibra Avanzado mas TV base DISOF',
    cuentaFact: '264532576436',
    rol: '',
    marca: 'VTR',
    cat: 'Promociones FTTH',
    subcat: 'Doble Play',
  },
  {
    estado: 'Activo',
    fechaInstalacion: '06/08/2025',
    vigenteDesde: '06/08/2025',
    producto: 'Equipo',
    cuentaFact: '264532576436',
    rol: '',
    marca: 'VTR',
    cat: 'Otros Fijos',
    subcat: 'Caja MTA',
  },
  {
    estado: 'Activo',
    fechaInstalacion: '06/08/2025',
    vigenteDesde: '06/08/2025',
    producto: 'Television',
    cuentaFact: '264532576436',
    rol: '',
    marca: 'VTR',
    cat: 'Producto Customizable',
    subcat: '',
  },
  {
    estado: 'Activo',
    fechaInstalacion: '06/08/2025',
    vigenteDesde: '06/08/2025',
    producto: 'Descuento Multi Servicio',
    cuentaFact: '264532576436',
    rol: '',
    marca: 'VTR',
    cat: 'Descuentos Multiservicio',
    subcat: 'Descuent',
  },
  {
    estado: 'Activo',
    fechaInstalacion: '06/08/2025',
    vigenteDesde: '06/08/2025',
    producto: 'Banda Ancha',
    cuentaFact: '264532576436',
    rol: '',
    marca: 'VTR',
    cat: 'Producto Customizable',
    subcat: '',
  },
]

// Actividades Resumen (5 filas para pantalla Resumen)
const ACTIVIDADES_RESUMEN = [
  {
    id: '1-3000522Y',
    desc: 'Integration Id:1-30HB1BY8, Operacion:RESET_INTERNET, Correlacion:0011541956',
    razon: '',
    marca: 'VTR',
    tipo: 'Reset / Refresh',
    estado: 'Finalizada',
    propietario: 'JGARCIAR',
    nroSs: '',
  },
  {
    id: '1-30BRKXOR',
    desc: 'Reparacion 2 Play Servicio Degradado',
    razon: '',
    marca: 'VTR',
    tipo: 'Terreno',
    estado: 'Agendada',
    propietario: 'AVILLANTOY',
    nroSs: '1-288046721172',
  },
  {
    id: '1-30BRKXJD',
    desc: 'Genera Requerimiento',
    razon: '',
    marca: 'VTR',
    tipo: 'Resolución',
    estado: 'Finalizada',
    propietario: 'AVILLANTOY',
    nroSs: '1-288046721172',
  },
  {
    id: '1-3ML0ZYE',
    desc: 'VENTA EFECTIVA',
    razon: '',
    marca: 'VTR',
    tipo: 'Email – Saliente',
    estado: 'Finalizada',
    propietario: 'HARRAZOLA',
    nroSs: '',
  },
  {
    id: '1-3X05YQJ',
    desc: '#SCAN#FTT#EFECTIVA#CUENTAFACT:264532576436 no ha llegado bo se valida en línea',
    razon: '',
    marca: 'VTR',
    tipo: 'Llamada – Saliente',
    estado: 'Finalizada',
    propietario: 'ARESTREPOR',
    nroSs: '',
  },
]

// Pedidos (Resumen)
const PEDIDOS = [
  {
    estado: 'Completada',
    motivo: '',
    fechaCreacion: '02/09/2026 10:07:20',
    tipo: 'Reanudacion',
    modalidad: 'Fija',
    marca: 'VTR',
    envio: 'Visita Técnica',
    nroPedido: '1-286517531359',
    cuentaFact: '264532576436',
  },
  {
    estado: 'Completada',
    motivo: '',
    fechaCreacion: '02/09/2026 10:07:26',
    tipo: 'Reanudacion',
    modalidad: 'Fija',
    marca: 'VTR',
    envio: 'Visita Técnica',
    nroPedido: '1-286517531312',
    cuentaFact: '264532576436',
  },
  {
    estado: 'Completada',
    motivo: '',
    fechaCreacion: '02/09/2026 01:46:22',
    tipo: 'Suspension Unidireccional',
    modalidad: 'Fija',
    marca: 'VTR',
    envio: 'Visita Técnica',
    nroPedido: '1-286511203120',
    cuentaFact: '264532576436',
  },
  {
    estado: 'Completada',
    motivo: '',
    fechaCreacion: '02/09/2026 01:46:21',
    tipo: 'Suspension Unidireccional',
    modalidad: 'Fija',
    marca: 'VTR',
    envio: 'Visita Técnica',
    nroPedido: '1-286511203076',
    cuentaFact: '264532576436',
  },
  {
    estado: 'Completada',
    motivo: '',
    fechaCreacion: '07/07/2026 13:27:29',
    tipo: 'Cambio de Promocion',
    modalidad: 'Fija',
    marca: 'VTR',
    envio: 'Visita Técnica',
    nroPedido: '1-285101923498',
    cuentaFact: '264532576436',
  },
]

// Solicitudes de servicio (Resumen)
const SOLICITUDES = [
  {
    estado: 'Abierta',
    ss: '1-288046721172',
    nReclamo: '',
    usuario: 'AVILLANTOY',
    tipo: 'Televisión',
    area: 'Reparación Técnica',
    subarea: 'Dbox No enciende',
    marca: 'VTR',
    tipoReq: 'Requerimiento',
    rutC: '18895864-8',
  },
  {
    estado: 'Cerrada',
    ss: '1-284853072388',
    nReclamo: '',
    usuario: 'JGARCIAR',
    tipo: 'Internet FTTH',
    area: 'Reparación Técnica',
    subarea: 'ONT OffLine',
    marca: 'VTR',
    tipoReq: 'Requerimiento',
    rutC: '18895864-8',
  },
]

// Lista inicial de Actividades Completas
const ACTIVIDADES_INICIALES = [
  {
    id: '1-2XJ26MM0',
    tipo: 'Reset / Refresh',
    desc: 'Integration Id:migra.80350444, Operacion:REFRESH_TODAS, Correlacion:0008416362',
    estado: 'Finalizada',
    propietario: 'GDAHUA',
    creador: 'GDAHUA',
    fechaInicio: '',
    vencimiento: '',
    fechaComprometida: '',
    fechaCierre: '',
    canal: 'Call Center',
    areaDerivar: '',
    codigoCierre: '',
    motivo: '',
    fechaCreacion: '08/02/2024 17:00',
    razon: '',
    detalleRazon: '',
    resolucion: '',
    comentarios: '- 02/08/2024 14:52 Codigo: 5 - Error de Ejecución: Terminal Refresh Operation failed - M91623EQH121,',
  },
  {
    id: '1-3JDAGRXD',
    tipo: 'SMS – Saliente',
    desc: '[982926165] SMS [VTR Informa que su solicitud está en proceso]',
    estado: 'Finalizada',
    propietario: 'EAIUSER',
    creador: 'EAIUSER',
    fechaInicio: '06/04/2026 15:10',
    vencimiento: '',
    fechaComprometida: '',
    fechaCierre: '06/04/2026 15:12',
    canal: 'UAC',
    areaDerivar: '',
    codigoCierre: '',
    motivo: '',
    fechaCreacion: '06/04/2026 15:10',
    razon: 'Outbound',
    detalleRazon: 'SMS - Saliente',
    resolucion: 'Envio SMS Auto...UAC',
    comentarios: 'Notificación enviada al cliente satisfactoriamente.',
  },
  {
    id: '1-3JDA8YKK',
    tipo: 'Llamada – Saliente',
    desc: '#SCOTIBRCOL Contacto preventivo por facturación',
    estado: 'Finalizada',
    propietario: 'ERANGELM',
    creador: 'ERANGELM',
    fechaInicio: '06/04/2026 15:05',
    vencimiento: '',
    fechaComprometida: '',
    fechaCierre: '06/04/2026 15:20',
    canal: 'VENTA REMOTA',
    areaDerivar: '',
    codigoCierre: '',
    motivo: '',
    fechaCreacion: '06/04/2026 15:05',
    razon: 'Atención técnica',
    detalleRazon: '1 Config/Activa...',
    resolucion: '1 Cambio/Confi...VENTA REMOTA',
    comentarios: 'Cliente contactado, se aclaran dudas sobre servicio.',
  },
  {
    id: '1-3JD9C100',
    tipo: 'Terreno',
    desc: 'Modificación de Servicio - Visita técnica agendada',
    estado: 'Finalizada',
    propietario: 'ERANGELM',
    creador: 'ERANGELM',
    fechaInicio: '06/04/2026 15:00',
    vencimiento: '06/04/2026 04:00',
    fechaComprometida: '06/04/2026 18:00',
    fechaCierre: '06/04/2026 16:30',
    canal: 'VENTA REMOTA',
    areaDerivar: 'FNOK',
    codigoCierre: 'FNOK',
    motivo: '',
    fechaCreacion: '06/04/2026 15:00',
    razon: 'Atención técnica',
    detalleRazon: '1 Config/Activa...',
    resolucion: '1 Cambio/Configuración',
    comentarios: 'Se realiza visita técnica y cambio de conector.',
  },
  {
    id: '1-3JCEGLTL',
    tipo: 'SMS – Saliente',
    desc: '[982926165] SMS [VTR Informa estado de orden]',
    estado: 'Finalizada',
    propietario: 'EAIUSER',
    creador: 'EAIUSER',
    fechaInicio: '06/04/2026 11:20',
    vencimiento: '',
    fechaComprometida: '',
    fechaCierre: '06/04/2026 11:21',
    canal: 'UAC',
    areaDerivar: '',
    codigoCierre: '',
    motivo: '',
    fechaCreacion: '06/04/2026 11:20',
    razon: 'Outbound',
    detalleRazon: 'SMS - Saliente',
    resolucion: 'Envio SMS Auto...UAC',
    comentarios: '',
  },
  {
    id: '1-3JBL8ZAI',
    tipo: 'SMS – Saliente',
    desc: '[982926165] SMS [VTR Informa recordatorio de visita técnica]',
    estado: 'Finalizada',
    propietario: 'SADMIN',
    creador: 'SADMIN',
    fechaInicio: '05/04/2026 19:40',
    vencimiento: '',
    fechaComprometida: '',
    fechaCierre: '05/04/2026 19:41',
    canal: 'UAC',
    areaDerivar: '',
    codigoCierre: '',
    motivo: '',
    fechaCreacion: '05/04/2026 19:40',
    razon: 'Outbound',
    detalleRazon: 'SMS - Saliente',
    resolucion: 'Envio SMS Auto...UAC',
    comentarios: '',
  },
  {
    id: '1-3J8PMRSV',
    tipo: 'Llamada – Saliente',
    desc: 'comercial ofrecimiento de mejoras de plan',
    estado: 'Finalizada',
    propietario: 'ADMARULANDA',
    creador: 'ADMARULANDA',
    fechaInicio: '01/04/2026 23:10',
    vencimiento: '',
    fechaComprometida: '',
    fechaCierre: '02/04/2026 00:05',
    canal: 'Call Center',
    areaDerivar: '',
    codigoCierre: '',
    motivo: '',
    fechaCreacion: '01/04/2026 23:10',
    razon: 'Atención comer...',
    detalleRazon: '7 Explicación c...',
    resolucion: '1 Explic. Otros...Call Center',
    comentarios: 'Se detalla información de consumo al titular.',
  },
  {
    id: '1-3J8JTUAI',
    tipo: 'Llamada – Saliente',
    desc: '@aceptafibra2026 Validación de migración a fibra',
    estado: 'Finalizada',
    propietario: 'LTOSCANOP',
    creador: 'LTOSCANOP',
    fechaInicio: '01/04/2026 19:15',
    vencimiento: '',
    fechaComprometida: '',
    fechaCierre: '01/04/2026 19:30',
    canal: 'Call Center',
    areaDerivar: '',
    codigoCierre: '',
    motivo: '',
    fechaCreacion: '01/04/2026 19:15',
    razon: 'Atención comer...',
    detalleRazon: '5 Cambio de se...',
    resolucion: '1 Cambio de Pl...Call Center',
    comentarios: 'Cliente acepta migración de tecnología.',
  },
  {
    id: '1-3J8JTTXJ',
    tipo: 'Terreno',
    desc: 'Migración técnica en domicilio',
    estado: 'Finalizada',
    propietario: 'LTOSCANOP',
    creador: 'LTOSCANOP',
    fechaInicio: '01/04/2026 19:00',
    vencimiento: '06/04/2026 10:00',
    fechaComprometida: '06/04/2026 12:00',
    fechaCierre: '06/04/2026 15:00',
    canal: 'Call Center',
    areaDerivar: 'FNOK',
    codigoCierre: 'FNOK',
    motivo: '',
    fechaCreacion: '01/04/2026 19:00',
    razon: '',
    detalleRazon: '',
    resolucion: '',
    comentarios: 'Migración completada y certificada.',
  },
  {
    id: '1-3IPA7Y17',
    tipo: 'Oferta SMA',
    desc: 'OFRECE CAMBIO DE TECNOLOGIA Y DBOX SMART',
    estado: 'Finalizada',
    propietario: 'AARODRIGUEZV',
    creador: 'AARODRIGUEZV',
    fechaInicio: '03/03/2026 23:00',
    vencimiento: '',
    fechaComprometida: '',
    fechaCierre: '03/03/2026 23:25',
    canal: 'Call Center',
    areaDerivar: '',
    codigoCierre: '',
    motivo: '',
    fechaCreacion: '03/03/2026 23:00',
    razon: '',
    detalleRazon: '',
    resolucion: '',
    comentarios: 'Campaña aplicada.',
  },
]

// Opciones para combos editables
const OPCIONES_ESTADO = ['Pendiente', 'En Proceso', 'Finalizada', 'Cancelada', 'Agendada']
const OPCIONES_TIPO = ['Llamada – Saliente', 'Llamada – Entrante', 'SMS – Saliente', 'Reset / Refresh', 'Terreno', 'Oferta SMA', 'Requerimiento']
const OPCIONES_RAZON = [
  'Atención técnica',
  'Atención comercial',
  'Outbound',
  'Reclamo',
  'Facturación',
  'Retención',
  'Venta',
]
const OPCIONES_DETALLE_RAZON = {
  'Atención técnica': ['1 Config/Activa...', 'Falla Internet', 'Falla TV', 'Falla Telefonía', 'Reinicio Equipos'],
  'Atención comercial': ['7 Explicación c...', '5 Cambio de se...', 'Consulta saldo', 'Cambio titularidad'],
  'Outbound': ['SMS - Saliente', 'Llamada Saliente', 'Encuesta'],
  'Reclamo': ['Cobro indebido', 'Corte no programado', 'Demora técnica'],
  'Facturación': ['Emisión boleta', 'Punto de pago', 'Convenio de pago'],
  'Retención': ['Propuesta descuento', 'Fidelización', 'Baja servicio'],
  'Venta': ['Venta cruzada', 'Upgrade plan', 'Equipo adicional'],
}
const OPCIONES_RESOLUCION = [
  '1 Cambio/Configuración',
  '1 Explic. Otros Cobros',
  '1 Cambio de Plan',
  'Envio SMS Auto...UAC',
  'Resuelto en Primer Contacto',
  'Genera OT Terreno',
  'Derivado a Nivel 2',
  'Cliente Conforme',
]
const OPCIONES_CANAL = ['Call Center', 'UAC', 'VENTA REMOTA', 'Sucursal', 'Web Portal']

// ─────────────────────────────────────────────────────────────────────────────
// Primitivas de interfaz gráfica Siebel Aurora
// ─────────────────────────────────────────────────────────────────────────────

function AppletHeader({ title, count, showActions = true, onNew }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '3px 8px 4px 6px',
        background: '#ffffff',
        borderBottom: '1px solid #c9d2dc',
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: '#222' }}>{title}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
        {onNew && (
          <button
            type="button"
            onClick={onNew}
            title="Añadir nueva actividad (+)"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 15,
              color: '#0066cc',
              fontWeight: 800,
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            +
          </button>
        )}
        {showActions && (
          <>
            <span title="Bandeja" style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>📥</span>
            <span title="Consulta" style={{ cursor: 'pointer', fontSize: 11, color: '#0066cc' }}>🔍</span>
            <span title="Propiedades" style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>⚙️</span>
          </>
        )}
        {count && (
          <span style={{ fontSize: 10.5, color: '#666', marginLeft: 4 }}>{count}</span>
        )}
        <span title="Expandir / Contraer" style={{ cursor: 'pointer', fontSize: 11, color: '#0066cc', marginLeft: 2 }}>⤢</span>
      </div>
    </div>
  )
}

function Gripper() {
  return (
    <div style={{ textAlign: 'center', padding: '1px 0 2px', color: '#b0b8c2', fontSize: 8, letterSpacing: 2, userSelect: 'none' }}>
      ▪ ▪ ▪ ▪
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente Principal AndesSimulador
// ─────────────────────────────────────────────────────────────────────────────

export default function AndesSimulador({ onExit }) {
  const [activeAccountKey, setActiveAccountKey] = useState('3801185-5')
  const [activeSubTab, setActiveSubTab] = useState('Actividades')
  const [viewMode, setViewMode] = useState('cuenta') // 'cuenta' | 'detalleActividad'
  const [actividades, setActividades] = useState(ACTIVIDADES_INICIALES)
  const [selectedRowId, setSelectedRowId] = useState('1-2XJ26MM0')
  const [busquedaInput, setBusquedaInput] = useState('')

  // Estado del formulario de actividad (para ver o crear nueva)
  const [currentActividad, setCurrentActividad] = useState(ACTIVIDADES_INICIALES[0])
  const [isNewActivity, setIsNewActivity] = useState(false)
  const [detalleSubTab, setDetalleSubTab] = useState('Más información')

  const cliente = CLIENTES[activeAccountKey] || CLIENTES['3801185-5']

  const subTabs = [
    'Más información',
    'Resumen del cliente',
    'Saldos totales',
    'Jerarquía de cuentas',
    'Fallas masivas',
    'Contactos',
    'Perfiles',
    'Actividades',
    'Solicitudes de servicio',
    'Pedidos',
    'Activos instalados',
    'Alertas de crédito',
    'Notas',
    'Afiliaciones de contactos',
    'Historial cliente',
    'Archivos adjuntos',
    'Facturar/Enviar',
    'Perfil del pago',
  ]

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const trimmed = busquedaInput.trim()
      if (CLIENTES[trimmed]) {
        setActiveAccountKey(trimmed)
      } else if (trimmed.includes('18895864')) {
        setActiveAccountKey('18895864-8')
      } else if (trimmed.includes('3801185')) {
        setActiveAccountKey('3801185-5')
      }
    }
  }

  // Abrir detalle de una actividad existente
  const abrirDetalleActividad = (act) => {
    setCurrentActividad({ ...act })
    setIsNewActivity(false)
    setViewMode('detalleActividad')
  }

  // Pulsar el botón + para añadir una nueva actividad
  const handleNuevaActividad = () => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase()
    const nueva = {
      id: `1-3K${randomHex}`,
      tipo: 'Llamada – Saliente',
      desc: '',
      estado: 'Pendiente',
      propietario: 'EJECUTIVO',
      creador: 'EJECUTIVO',
      fechaInicio: new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      fechaComprometida: '',
      fechaCierre: '',
      canal: 'Call Center',
      areaDerivar: '',
      codigoCierre: '',
      motivo: '',
      fechaCreacion: new Date().toLocaleDateString('es-CL') + ' ' + new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      razon: 'Atención técnica',
      detalleRazon: '1 Config/Activa...',
      resolucion: '1 Cambio/Configuración',
      comentarios: '',
    }
    setCurrentActividad(nueva)
    setIsNewActivity(true)
    setViewMode('detalleActividad')
  }

  // Guardar la actividad (nueva o editada)
  const handleGuardarActividad = () => {
    if (isNewActivity) {
      setActividades([currentActividad, ...actividades])
    } else {
      setActividades(actividades.map((a) => (a.id === currentActividad.id ? currentActividad : a)))
    }
    setSelectedRowId(currentActividad.id)
    setViewMode('cuenta')
    setActiveSubTab('Actividades')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#ffffff',
        color: '#1a1a1a',
        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
        fontSize: 11,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ── 1. Barra superior: Fondo oscuro Siebel con Menús en línea ── */}
      <div
        style={{
          background: '#2b3036',
          height: 30,
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          color: '#ffffff',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 13, marginRight: 12, letterSpacing: 0.5 }}>Andes</span>
        
        {/* Menús desplegables Siebel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {['Andes', 'Archivo', 'Edición', 'Ver', 'Desplazarse', 'Consulta', 'Herramientas', 'Ayuda'].map((m) => (
            <span
              key={m}
              style={{
                fontSize: 11,
                color: '#e2e7ec',
                padding: '3px 6px',
                cursor: 'pointer',
                borderRadius: 2,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              {m} <span style={{ fontSize: 8, opacity: 0.8 }}>▾</span>
            </span>
          ))}
        </div>

        {/* Lado derecho: Buscador Siebel Find e íconos de usuario */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Buscar RUT/Cuenta..."
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              onKeyDown={handleSearch}
              style={{
                height: 18,
                width: 135,
                background: '#ffffff',
                border: '1px solid #717d8a',
                borderRadius: 2,
                fontSize: 10.5,
                padding: '0 18px 0 4px',
                color: '#111',
              }}
            />
            <span style={{ position: 'absolute', right: 4, fontSize: 10, color: '#666', pointerEvents: 'none' }}>🔍</span>
          </div>

          <span title="Compartir" style={{ cursor: 'pointer', padding: '2px 4px', fontSize: 12, opacity: 0.9 }}>🔗</span>
          <span title="Mensajes" style={{ cursor: 'pointer', padding: '2px 4px', fontSize: 12, opacity: 0.9 }}>💬 <span style={{ fontSize: 9, background: '#45505b', padding: '0 3px', borderRadius: 2 }}>0</span></span>
          <span title="Usuario" style={{ cursor: 'pointer', padding: '2px 4px', fontSize: 12, opacity: 0.9 }}>👤</span>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              title="Salir del simulador"
              style={{
                marginLeft: 4,
                fontSize: 10,
                color: '#ddd',
                background: '#3a424b',
                border: '1px solid #55606d',
                borderRadius: 2,
                padding: '1px 6px',
                cursor: 'pointer',
              }}
            >
              Salir
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Barra de herramientas e iconos ── */}
      <div
        style={{
          background: '#f2f4f7',
          borderBottom: '1px solid #d5dce3',
          display: 'flex',
          flexDirection: 'column',
          padding: '2px 6px 1px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {['🔍', '🔭', '▶', '⏹', '💾', '↩', '|', '✂', '📄', '📋'].map((ic, i) =>
            ic === '|' ? (
              <span key={i} style={{ width: 1, height: 12, background: '#cbd2d9', margin: '0 3px' }} />
            ) : (
              <button
                key={i}
                type="button"
                onClick={ic === '💾' ? handleGuardarActividad : undefined}
                title={ic === '💾' ? 'Guardar' : undefined}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '1px 3px',
                  fontSize: 10,
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
              >
                {ic}
              </button>
            )
          )}
        </div>

        {/* Links de breadcrumb según la vista */}
        <div style={{ fontSize: 9.5, color: '#0060b6', padding: '1px 2px 0' }}>
          {viewMode === 'cuenta' ? (
            <>
              <span style={{ cursor: 'pointer' }}>Actividad de campo Terreno</span> | <span style={{ cursor: 'pointer' }}>Portal del cliente</span>
            </>
          ) : (
            <>
              <span onClick={() => setViewMode('cuenta')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Cuenta:{cliente.rut}
              </span>
              {' | '}
              <span onClick={() => setViewMode('cuenta')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Cuenta:{cliente.rut}
              </span>
              {' | '}
              <span style={{ color: '#333' }}>Actividad:</span>
            </>
          )}
        </div>
      </div>

      {/* ── 3. Tabs de Módulos Superiores (Página inicial, Clientes, Actividades...) ── */}
      <div
        style={{
          background: '#e8edf2',
          borderBottom: '1px solid #ccd4dc',
          display: 'flex',
          alignItems: 'center',
          padding: '0 4px',
          height: 24,
          flexShrink: 0,
          gap: 1,
        }}
      >
        {[
          { key: 'home', label: 'Página inicial', icon: '⌂' },
          { key: 'clientes', label: 'Clientes', icon: '👤', active: viewMode === 'cuenta' },
          { key: 'ss', label: 'Solicitudes de servicio', icon: '●' },
          { key: 'act', label: 'Actividades', icon: '▲', active: viewMode === 'detalleActividad' },
          { key: 'val', label: 'Validaciones venta', icon: '■' },
          { key: 'ped', label: 'Pedidos', icon: '☑' },
          { key: 'ped-v', label: 'Pedido de ventas', icon: '☐' },
          { key: 'con', label: 'Contactos', icon: '👤' },
          { key: 'fallas', label: 'Fallas masivas', icon: '■' },
          { key: 'pref', label: 'Preferencias del usuario', icon: '■' },
          { key: 'perfil', label: 'Perfil de facturación', icon: '■' },
        ].map((t) => (
          <div
            key={t.key}
            onClick={() => {
              if (t.key === 'clientes') setViewMode('cuenta')
              if (t.key === 'act') {
                if (viewMode === 'cuenta') setActiveSubTab('Actividades')
              }
            }}
            style={{
              fontSize: 11,
              color: t.active ? '#ffffff' : '#333333',
              background: t.active ? '#2b333e' : 'transparent',
              padding: '3px 8px',
              borderRadius: t.active ? '2px 2px 0 0' : 0,
              fontWeight: t.active ? 600 : 400,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 8 }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>

      {/* ── 4. Barra delgada de Breadcrumb de lista ── */}
      <div
        style={{
          background: '#2b333e',
          color: '#ffffff',
          fontSize: 10.5,
          padding: '2px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span>{viewMode === 'cuenta' ? 'Lista de clientes' : 'Lista de actividades'}</span>
        {viewMode === 'cuenta' && (
          <>
            <span style={{ opacity: 0.6 }}>›</span>
            <span>Lista de clientes</span>
          </>
        )}
      </div>

      {/* ── 5. VISTA A: DETALLE O AÑADIR NUEVA ACTIVIDAD (Fiel a la captura real enviada) ── */}
      {viewMode === 'detalleActividad' ? (
        <div style={{ flex: 1, overflowY: 'auto', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
          
          {/* Barra de acción: Consulta Estado, Paginador */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px 4px', borderBottom: '1px solid #eef2f6' }}>
            <input type="checkbox" defaultChecked style={{ margin: '0 8px 0 0' }} />
            <button
              type="button"
              style={{
                background: '#eceff2',
                border: '1px solid #b0b8bf',
                borderRadius: 2,
                fontSize: 10.5,
                fontWeight: 600,
                color: '#333',
                padding: '2px 10px',
                cursor: 'pointer',
              }}
            >
              Consulta Estado
            </button>

            {/* Botón Guardar / Volver */}
            <button
              type="button"
              onClick={handleGuardarActividad}
              style={{
                marginLeft: 10,
                background: '#1d451e',
                border: '1px solid #143015',
                borderRadius: 2,
                fontSize: 10.5,
                fontWeight: 700,
                color: '#ffffff',
                padding: '2px 12px',
                cursor: 'pointer',
              }}
            >
              Guardar Actividad
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cuenta')}
              style={{
                marginLeft: 6,
                background: '#ffffff',
                border: '1px solid #b0b8bf',
                borderRadius: 2,
                fontSize: 10.5,
                color: '#555',
                padding: '2px 8px',
                cursor: 'pointer',
              }}
            >
              Cancelar / Volver
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span title="Deshacer" style={{ cursor: 'pointer', fontSize: 11, color: '#0066cc' }}>↩</span>
              <span title="Consulta" style={{ cursor: 'pointer', fontSize: 11, color: '#0066cc' }}>🔍</span>
              <span title="Propiedades" style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>⚙️</span>
              <span style={{ fontSize: 10.5, color: '#666', marginLeft: 6 }}>1 de más de 1+</span>
              <span style={{ cursor: 'pointer', fontSize: 10, color: '#555', padding: '0 2px' }}>◄</span>
              <span style={{ cursor: 'pointer', fontSize: 10, color: '#555', padding: '0 2px' }}>►</span>
            </div>
          </div>

          {/* Formulario de Actividad (4 columnas exactas Siebel Aurora) */}
          <div style={{ padding: '8px 14px', background: '#ffffff', borderBottom: '1px solid #cbd3dc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '270px 270px 240px 1fr', gap: '8px 16px' }}>
              
              {/* ── COLUMNA 1: Identificación y Cliente ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 110, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Id Actividad:*</span>
                  <input
                    readOnly
                    value={currentActividad.id}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 110, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Tipo:*</span>
                  <select
                    value={currentActividad.tipo}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, tipo: e.target.value })}
                    style={{ flex: 1, height: 20, border: '1px solid #b2b8bf', background: '#ffffff', fontSize: 10.5 }}
                  >
                    {OPCIONES_TIPO.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 110, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>RUT Cliente:</span>
                  <input
                    readOnly
                    value={cliente.rut}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                  <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>🔍</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 110, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Nombre Completo Cliente:</span>
                  <input
                    readOnly
                    value={`${cliente.nombre} ${cliente.apPaterno}`}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 110, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>RUT Contacto:</span>
                  <input
                    readOnly
                    value={cliente.rut}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                  <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>🔍</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 110, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Nombre Completo Contacto:</span>
                  <input
                    readOnly
                    value={`${cliente.nombre} ${cliente.apPaterno}`}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                </div>
              </div>

              {/* ── COLUMNA 2: Estado, Razón, Detalle de Razón y Resolución (EDITABLES Y SELECCIONABLES) ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                
                {/* ESTADO EDITABLE Y SELECCIONABLE */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 90, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5, fontWeight: 600 }}>Estado:</span>
                  <select
                    value={currentActividad.estado}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, estado: e.target.value })}
                    style={{
                      flex: 1,
                      height: 20,
                      border: '1px solid #0060b6',
                      background: '#fcfdff',
                      fontSize: 10.5,
                      fontWeight: 500,
                    }}
                  >
                    {OPCIONES_ESTADO.map((est) => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 90, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Creador:</span>
                  <input
                    readOnly
                    value={currentActividad.creador || 'GDAHUA'}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 90, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Propietario:</span>
                  <input
                    readOnly
                    value={currentActividad.propietario || 'GDAHUA'}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                  <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>🔍</button>
                </div>

                {/* RAZÓN EDITABLE Y SELECCIONABLE */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 90, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5, fontWeight: 600 }}>Razón:</span>
                  <select
                    value={currentActividad.razon}
                    onChange={(e) => {
                      const newRazon = e.target.value
                      const possibleDetalles = OPCIONES_DETALLE_RAZON[newRazon] || []
                      setCurrentActividad({
                        ...currentActividad,
                        razon: newRazon,
                        detalleRazon: possibleDetalles[0] || '',
                      })
                    }}
                    style={{
                      flex: 1,
                      height: 20,
                      border: '1px solid #0060b6',
                      background: '#ffffff',
                      fontSize: 10.5,
                      fontWeight: 500,
                    }}
                  >
                    <option value="">(Seleccione Razón)</option>
                    {OPCIONES_RAZON.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* DETALLE DE RAZÓN EDITABLE Y SELECCIONABLE */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 90, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5, fontWeight: 600 }}>Detalle Razón:</span>
                  <select
                    value={currentActividad.detalleRazon}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, detalleRazon: e.target.value })}
                    style={{
                      flex: 1,
                      height: 20,
                      border: '1px solid #0060b6',
                      background: '#ffffff',
                      fontSize: 10.5,
                      fontWeight: 500,
                    }}
                  >
                    <option value="">(Seleccione Detalle)</option>
                    {(OPCIONES_DETALLE_RAZON[currentActividad.razon] || [
                      '1 Config/Activa...',
                      'SMS - Saliente',
                      '7 Explicación c...',
                      '5 Cambio de se...',
                      'Consulta saldo',
                    ]).map((dr) => (
                      <option key={dr} value={dr}>{dr}</option>
                    ))}
                  </select>
                </div>

                {/* RESOLUCIÓN EDITABLE Y SELECCIONABLE */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 90, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5, fontWeight: 600 }}>Resolución:</span>
                  <select
                    value={currentActividad.resolucion}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, resolucion: e.target.value })}
                    style={{
                      flex: 1,
                      height: 20,
                      border: '1px solid #0060b6',
                      background: '#ffffff',
                      fontSize: 10.5,
                      fontWeight: 500,
                    }}
                  >
                    <option value="">(Seleccione Resolución)</option>
                    {OPCIONES_RESOLUCION.map((res) => (
                      <option key={res} value={res}>{res}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── COLUMNA 3: Fechas y Canal ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 95, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Fecha Inicio:</span>
                  <input
                    value={currentActividad.fechaInicio}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, fechaInicio: e.target.value })}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 95, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Fecha Comprometida:</span>
                  <input
                    value={currentActividad.fechaComprometida}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, fechaComprometida: e.target.value })}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 95, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Fecha Cierre:</span>
                  <input
                    value={currentActividad.fechaCierre}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, fechaCierre: e.target.value })}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 95, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Canal:</span>
                  <select
                    value={currentActividad.canal}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, canal: e.target.value })}
                    style={{ flex: 1, height: 20, border: '1px solid #b2b8bf', background: '#ffffff', fontSize: 10.5 }}
                  >
                    {OPCIONES_CANAL.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 95, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Código Cierre:</span>
                  <select
                    value={currentActividad.codigoCierre}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, codigoCierre: e.target.value })}
                    style={{ flex: 1, height: 20, border: '1px solid #b2b8bf', background: '#e9edf2', fontSize: 10.5 }}
                  >
                    <option value=""> </option>
                    <option value="FNOK">FNOK</option>
                    <option value="OK">OK</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 95, textAlign: 'right', marginRight: 4, color: '#333', fontSize: 10.5 }}>Motivo:</span>
                  <input
                    value={currentActividad.motivo}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, motivo: e.target.value })}
                    style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }}
                  />
                </div>
              </div>

              {/* ── COLUMNA 4: Descripción y Comentarios (EDITABLE) ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#333', fontSize: 10.5, marginBottom: 2 }}>Descripción:*</span>
                  <textarea
                    rows={3}
                    value={currentActividad.desc}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, desc: e.target.value })}
                    placeholder="Ingrese descripción de la actividad..."
                    style={{
                      border: '1px solid #b2b8bf',
                      background: '#ffffff',
                      fontSize: 10.5,
                      padding: '4px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#333', fontSize: 10.5, marginBottom: 2, fontWeight: 600 }}>Comentarios:*</span>
                  <textarea
                    rows={3}
                    value={currentActividad.comentarios}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, comentarios: e.target.value })}
                    placeholder="Comentarios de la gestión..."
                    style={{
                      border: '1px solid #0060b6',
                      background: '#ffffff',
                      fontSize: 10.5,
                      padding: '4px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                  <span style={{ width: 80, color: '#333', fontSize: 10.5 }}>Área a Derivar:</span>
                  <select
                    value={currentActividad.areaDerivar}
                    onChange={(e) => setCurrentActividad({ ...currentActividad, areaDerivar: e.target.value })}
                    style={{ flex: 1, height: 20, border: '1px solid #b2b8bf', background: '#e9edf2', fontSize: 10.5 }}
                  >
                    <option value=""> </option>
                    <option value="FNOK">FNOK</option>
                    <option value="TechOps">TechOps</option>
                    <option value="VR_RET_FIJO">VR_RET_FIJO</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Subtabs inferiores de Detalle de Actividad */}
          <div
            style={{
              background: '#e9ecf0',
              borderBottom: '1px solid #b8c1cc',
              display: 'flex',
              padding: '2px 6px 0',
              gap: 2,
              flexShrink: 0,
            }}
          >
            {[
              'Más información',
              'Seguimiento',
              'Materiales Requeridos',
              'Trazabilidad Interacción',
              'Agendamiento',
              'Pasos',
              'Finalización',
            ].map((st) => {
              const isAct = detalleSubTab === st
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setDetalleSubTab(st)}
                  style={{
                    border: 'none',
                    background: isAct ? '#242c37' : 'transparent',
                    color: isAct ? '#ffffff' : '#333333',
                    fontWeight: isAct ? 700 : 400,
                    fontSize: 10.5,
                    padding: '4px 8px',
                    borderRadius: isAct ? '2px 2px 0 0' : 0,
                    cursor: 'pointer',
                  }}
                >
                  {st}
                </button>
              )
            })}
          </div>

          {/* Formulario complementario inferior (IVR, Encuestas, etc.) */}
          <div style={{ padding: '8px 12px', background: '#ffffff', borderBottom: '1px solid #cbd3dc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 6 }}>
              <span title="Consulta" style={{ cursor: 'pointer', fontSize: 11, color: '#0066cc' }}>🔍</span>
              <span title="Propiedades" style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>⚙️</span>
              <span style={{ fontSize: 10.5, color: '#666', marginLeft: 6 }}>1 de más de 1+</span>
              <span style={{ cursor: 'pointer', fontSize: 10, color: '#555', padding: '0 2px' }}>◄</span>
              <span style={{ cursor: 'pointer', fontSize: 10, color: '#555', padding: '0 2px' }}>►</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Id Llamada IVR:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Resultado Encuesta NPS:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Resultado Encuesta EPA:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Estado Encuesta:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Fecha Encuesta NPS:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Fecha Encuesta EPA:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Nro Solicitud de Servicio:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                  <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>🔍</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Nro Orden:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                  <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>🔍</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Nro Ajuste:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                  <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>🔍</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: 130, textAlign: 'right', marginRight: 4, color: '#555' }}>Fecha de envío:</span>
                  <input readOnly style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2' }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (

        /* ── 5. VISTA B: VISTA DE CLIENTE / CUENTA ── */
        <div style={{ flex: 1, overflowY: 'auto', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>

          {/* ── Encabezado de la cuenta (RUT grande + Controles de registro + Ir a BEC) ── */}
          <div style={{ padding: '6px 12px 2px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#111111', letterSpacing: 0.3 }}>
                {cliente.rut}
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span title="Exportar" style={{ cursor: 'pointer', fontSize: 11, color: '#0066cc' }}>📥</span>
                <span title="Deshacer" style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>↩</span>
                <span title="Consulta" style={{ cursor: 'pointer', fontSize: 11, color: '#0066cc' }}>🔍</span>
                <span title="Propiedades" style={{ cursor: 'pointer', fontSize: 11, color: '#555' }}>⚙️</span>
                <span style={{ fontSize: 10.5, color: '#666', marginLeft: 6 }}>1 de más de 1+</span>
                <span style={{ cursor: 'pointer', fontSize: 10, color: '#555', padding: '0 2px' }}>◄</span>
                <span style={{ cursor: 'pointer', fontSize: 10, color: '#555', padding: '0 2px' }}>►</span>
                <span style={{ cursor: 'pointer', fontSize: 10, color: '#555', padding: '0 2px' }}>►|</span>
                <span title="Expandir" style={{ cursor: 'pointer', fontSize: 11, color: '#0066cc', marginLeft: 4 }}>⤢</span>
              </div>
            </div>

            <div style={{ marginTop: 2 }}>
              <button
                type="button"
                style={{
                  background: '#1d451e',
                  color: '#ffffff',
                  border: '1px solid #143015',
                  borderRadius: 2,
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: '2px 8px',
                  cursor: 'pointer',
                }}
              >
                Ir a BEC
              </button>
            </div>
          </div>

          {/* ── Formulario de datos del cliente (grid exacto Siebel) ── */}
          <div style={{ padding: '6px 12px 10px', background: '#ffffff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))', rowGap: 4, columnGap: 16 }}>
              
              {/* Fila 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Rut:*</span>
                <input readOnly value={cliente.rut} style={{ width: 110, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Dirección:</span>
                <input readOnly value={cliente.direccion} style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#ffffff', padding: '0 4px', fontSize: 10.5 }} />
                <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>🔍</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Teléfono:</span>
                <span style={{ fontSize: 10.5, color: '#666' }}>+56</span>
                <input readOnly value={cliente.telefono} style={{ width: 85, height: 18, border: '1px solid #b2b8bf', background: '#ffffff', padding: '0 4px', fontSize: 10.5 }} />
                <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>📞</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 130, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Max. IPTV permitido:</span>
                <input readOnly value={cliente.maxIptvPermitido} style={{ width: 90, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }} />
              </div>

              {/* Fila 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Nombre:</span>
                <input readOnly value={cliente.nombre} style={{ width: 110, height: 18, border: '1px solid #b2b8bf', background: '#ffffff', padding: '0 4px', fontSize: 10.5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Comuna:</span>
                <input readOnly value={cliente.comuna} style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#ffffff', padding: '0 4px', fontSize: 10.5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>En cobranza:</span>
                <input type="checkbox" checked={cliente.enCobranza} readOnly style={{ margin: 0 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 130, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Fecha actualización IPTV:</span>
                <input readOnly value={cliente.fechaActIptv} style={{ width: 90, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }} />
              </div>

              {/* Fila 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Apellido paterno:</span>
                <input readOnly value={cliente.apPaterno} style={{ width: 110, height: 18, border: '1px solid #b2b8bf', background: '#ffffff', padding: '0 4px', fontSize: 10.5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Correo electrónico:</span>
                <input readOnly value={cliente.correo} style={{ flex: 1, height: 18, border: '1px solid #b2b8bf', background: '#ffffff', padding: '0 4px', fontSize: 10.5 }} />
                <button type="button" style={{ height: 18, width: 18, border: '1px solid #b2b8bf', background: '#eef2f5', cursor: 'pointer', fontSize: 9 }}>✉</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Fallas masivas:</span>
                <input type="checkbox" checked={cliente.fallasMasivas} readOnly style={{ margin: 0 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 130, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Resultado última encuesta NPS:</span>
                <input readOnly value={cliente.resultadoUltEncuestaNps} style={{ width: 90, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }} />
              </div>

              {/* Fila 4 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Apellido materno:</span>
                <input readOnly value={cliente.apMaterno} style={{ width: 110, height: 18, border: '1px solid #b2b8bf', background: '#ffffff', padding: '0 4px', fontSize: 10.5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Edad:</span>
                <input readOnly value={cliente.edad} style={{ width: 45, height: 18, border: '1px solid #b2b8bf', background: '#ffffff', padding: '0 4px', fontSize: 10.5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Reiterados:</span>
                <input type="checkbox" checked={cliente.reiterados} readOnly style={{ margin: 0 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 130, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Fecha última encuesta NPS:</span>
                <input readOnly value={cliente.fechaUltEncuestaNps} style={{ width: 90, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }} />
              </div>

              {/* Fila 5 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Segmento valor:</span>
                <select disabled style={{ width: 110, height: 20, border: '1px solid #b2b8bf', background: '#ffffff', fontSize: 10.5 }}>
                  <option>{cliente.segmentoValor || ' '}</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Cuenta Migrada:</span>
                <input type="checkbox" checked={cliente.cuentaMigrada} readOnly style={{ margin: 0 }} />
              </div>
              <div />
              <div />

              {/* Fila 6 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 100, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Marca:</span>
                <input readOnly value={cliente.marca} style={{ width: 60, height: 18, border: '1px solid #b2b8bf', background: '#e9edf2', padding: '0 4px', fontSize: 10.5 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 120, textAlign: 'right', color: '#444', fontSize: 10.5 }}>Cambio de Titularidad:</span>
                <input type="checkbox" checked={cliente.cambioTitularidad} readOnly style={{ margin: 0 }} />
              </div>
              <div />
              <div />
            </div>
          </div>

          {/* ── 6. Pestañas Horizontales de Subnavegación (Resumen del cliente, Actividades, etc.) ── */}
          <div
            style={{
              background: '#e9ecf0',
              borderTop: '1px solid #cbd3dc',
              borderBottom: '1px solid #b8c1cc',
              display: 'flex',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              padding: '2px 4px 0',
              flexShrink: 0,
              gap: 2,
            }}
          >
            {subTabs.map((st) => {
              const isActive = activeSubTab === st
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setActiveSubTab(st)}
                  style={{
                    border: 'none',
                    background: isActive ? '#242c37' : 'transparent',
                    color: isActive ? '#ffffff' : '#333333',
                    fontWeight: isActive ? 700 : 400,
                    fontSize: 10.5,
                    padding: '4px 8px',
                    borderRadius: isActive ? '2px 2px 0 0' : 0,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#dbe1e8' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {st}
                </button>
              )
            })}
          </div>

          {/* ── 7. Vista según la pestaña activa ── */}
          <div style={{ flex: 1, padding: '6px 8px', background: '#f5f7f9' }}>

            {/* ══════════ CASO 1: Pestaña "Actividades" (PANTALLA COMPLETA 16 COLUMNAS) ══════════ */}
            {activeSubTab === 'Actividades' && (
              <div style={{ background: '#ffffff', border: '1px solid #c9d2dc', borderRadius: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                <AppletHeader
                  title="Actividades"
                  count={`1 - ${actividades.length} de más de ${actividades.length}+`}
                  onNew={handleNuevaActividad}
                />

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                    <thead>
                      <tr style={{ background: '#f3f6f9', borderBottom: '1px solid #cbd4de', color: '#333' }}>
                        {[
                          { label: 'Id Actividad', width: 95 },
                          { label: 'Tipo', width: 110 },
                          { label: 'Descripción', width: 190 },
                          { label: 'Estado', width: 75 },
                          { label: 'Propietario', width: 90 },
                          { label: 'Fecha Inicio', width: 110 },
                          { label: 'Vencimiento', width: 110 },
                          { label: 'Área a Derivar', width: 85 },
                          { label: 'Código Cierre', width: 85 },
                          { label: 'Motivo', width: 80 },
                          { label: 'Fecha Creación', width: 115 },
                          { label: 'Fecha Cierre', width: 115 },
                          { label: 'Razón', width: 95 },
                          { label: 'Detalle Razón', width: 115 },
                          { label: 'Resolución', width: 135 },
                          { label: 'Canal', width: 95 },
                        ].map((col) => (
                          <th
                            key={col.label}
                            style={{
                              textAlign: 'left',
                              padding: '3px 6px',
                              fontWeight: 600,
                              borderRight: '1px solid #dce2e8',
                              whiteSpace: 'nowrap',
                              minWidth: col.width,
                            }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {actividades.map((act) => {
                        const isSelected = selectedRowId === act.id
                        return (
                          <tr
                            key={act.id}
                            onClick={() => setSelectedRowId(act.id)}
                            onDoubleClick={() => abrirDetalleActividad(act)}
                            style={{
                              background: isSelected ? '#dcedf9' : '#ffffff',
                              borderBottom: '1px solid #eef2f6',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = '#f2f7fc'
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = '#ffffff'
                            }}
                          >
                            <td
                              onClick={(e) => {
                                e.stopPropagation()
                                abrirDetalleActividad(act)
                              }}
                              style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'underline' }}
                            >
                              {act.id}
                            </td>
                            <td
                              onClick={(e) => {
                                e.stopPropagation()
                                abrirDetalleActividad(act)
                              }}
                              style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6', whiteSpace: 'nowrap', textDecoration: 'underline' }}
                            >
                              {act.tipo}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                              {act.desc}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.estado}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.propietario}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap', color: '#555' }}>
                              {act.fechaInicio || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap', color: '#555' }}>
                              {act.vencimiento || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.areaDerivar || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.codigoCierre || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.motivo || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap', color: '#555' }}>
                              {act.fechaCreacion || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap', color: '#555' }}>
                              {act.fechaCierre || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.razon || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.detalleRazon || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.resolucion || '\u00a0'}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              {act.canal || '\u00a0'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <Gripper />
              </div>
            )}

            {/* ══════════ CASO 2: Pestaña "Resumen del cliente" (LAYOUT 2 COLUMNAS) ══════════ */}
            {(activeSubTab === 'Resumen del cliente' || activeSubTab === 'Más información') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'start' }}>
                
                {/* ── COLUMNA IZQUIERDA ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  
                  {/* 1. Siguiente mejor Acción */}
                  <div style={{ background: '#ffffff', border: '1px solid #c9d2dc', borderRadius: 1 }}>
                    <AppletHeader title="Siguiente mejor Acción" count="1 - 1 de 1" />
                    <div style={{ padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 4, background: '#fafbfc', borderBottom: '1px solid #e5eaef' }}>
                      <select style={{ height: 18, fontSize: 10, border: '1px solid #b2b8bf', background: '#fff' }}>
                        <option>v</option>
                      </select>
                      <input style={{ height: 16, width: 80, border: '1px solid #b2b8bf', fontSize: 10 }} />
                      <button type="button" style={{ height: 18, border: '1px solid #b2b8bf', background: '#eef2f5', fontSize: 10, cursor: 'pointer' }}>➔</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                      <thead>
                        <tr style={{ background: '#f3f6f9', borderBottom: '1px solid #cbd4de', color: '#333' }}>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Cola</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Marca/Refer</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SIGUIENTE_MEJOR_ACCION.map((r, i) => (
                          <tr key={i} style={{ background: '#dcedf9', borderBottom: '1px solid #edf1f5' }}>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.cola}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6' }}>{r.marca}</td>
                            <td style={{ padding: '3px 6px' }}>{r.accion || '\u00a0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Gripper />
                  </div>

                  {/* 2. Perfil de facturación */}
                  <div style={{ background: '#ffffff', border: '1px solid #c9d2dc', borderRadius: 1 }}>
                    <AppletHeader title="Perfil de facturación" count="1 - 1 de 1" />
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                      <thead>
                        <tr style={{ background: '#f3f6f9', borderBottom: '1px solid #cbd4de', color: '#333' }}>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Nombre</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Método de pago</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Marca</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Medio de Distribución</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px' }}>Día de Tarificación del Mes (DOM)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PERFIL_PAGO.map((r, i) => (
                          <tr key={i} style={{ background: '#dcedf9', borderBottom: '1px solid #edf1f5' }}>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6' }}>{r.nombre}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6' }}>{r.metodo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.marca}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.distribucion}</td>
                            <td style={{ padding: '3px 6px' }}>{r.dom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Gripper />
                </div>

                {/* 3. Productos Instalados */}
                <div style={{ background: '#ffffff', border: '1px solid #c9d2dc', borderRadius: 1 }}>
                  <AppletHeader title="Productos Instalados" count="1 - 5 de 5" />
                  {/* Botones de acción específicos */}
                  <div style={{ padding: '3px 6px', display: 'flex', flexWrap: 'wrap', gap: 4, background: '#fafbfc', borderBottom: '1px solid #e5eaef' }}>
                    <button type="button" style={{ background: '#2c531e', color: '#fff', border: '1px solid #1c3813', borderRadius: 2, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>Modificar</button>
                    <button type="button" style={{ background: '#3f3d2a', color: '#fff', border: '1px solid #28271a', borderRadius: 2, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>Desconectar</button>
                    <button type="button" disabled style={{ background: '#eaedf0', color: '#888', border: '1px solid #ccd2d8', borderRadius: 2, padding: '2px 7px', fontSize: 10 }}>Reconexión</button>
                    <button type="button" style={{ background: '#2c531e', color: '#fff', border: '1px solid #1c3813', borderRadius: 2, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>Actualizar promoción</button>
                    <button type="button" style={{ background: '#1c4a24', color: '#fff', border: '1px solid #133318', borderRadius: 2, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>Reset / Refresh</button>
                    <button type="button" disabled style={{ background: '#eaedf0', color: '#888', border: '1px solid #ccd2d8', borderRadius: 2, padding: '2px 7px', fontSize: 10 }}>Cambio de tecnología</button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                      <thead>
                        <tr style={{ background: '#f3f6f9', borderBottom: '1px solid #cbd4de', color: '#333' }}>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Estado</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Fecha de inst.</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Vigente desde</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Producto</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Perfil de facturación</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Marca</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px' }}>Categoría detallada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PRODUCTOS.map((r, i) => (
                          <tr key={i} style={{ background: i === 0 ? '#dcedf9' : '#ffffff', borderBottom: '1px solid #edf1f5' }}>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>
                              <span style={{ color: '#27ae60', marginRight: 3 }}>●</span>{r.estado}
                            </td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.fechaInstalacion}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.vigenteDesde}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6', whiteSpace: 'nowrap' }}>{r.producto}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6', whiteSpace: 'nowrap' }}>{r.cuentaFact}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.marca}</td>
                            <td style={{ padding: '3px 6px', whiteSpace: 'nowrap' }}>{r.cat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Gripper />
                </div>
              </div>

              {/* ── COLUMNA DERECHA ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                
                {/* 1. Actividades (Resumen) */}
                <div style={{ background: '#ffffff', border: '1px solid #c9d2dc', borderRadius: 1 }}>
                  <AppletHeader title="Actividades" count="1 - 5 de más de 5+" onNew={handleNuevaActividad} />
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                      <thead>
                        <tr style={{ background: '#f3f6f9', borderBottom: '1px solid #cbd4de', color: '#333' }}>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Id Actividad</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Descripción</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Razón</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Marca</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Tipo</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Estado</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Propietario</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px' }}>Nro Solicitud de S</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ACTIVIDADES_RESUMEN.map((r, i) => (
                          <tr
                            key={i}
                            onClick={() => {
                              const found = actividades.find((a) => a.id === r.id)
                              if (found) abrirDetalleActividad(found)
                              else abrirDetalleActividad({ ...r, comentarios: '' })
                            }}
                            style={{ background: i === 0 ? '#dcedf9' : '#ffffff', borderBottom: '1px solid #edf1f5', cursor: 'pointer' }}
                          >
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6', whiteSpace: 'nowrap', textDecoration: 'underline' }}>{r.id}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.desc}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.razon}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.marca}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6', whiteSpace: 'nowrap' }}>{r.tipo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.estado}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.propietario}</td>
                            <td style={{ padding: '3px 6px', color: '#0060b6', whiteSpace: 'nowrap' }}>{r.nroSs}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Gripper />
                </div>

                {/* 2. Pedidos */}
                <div style={{ background: '#ffffff', border: '1px solid #c9d2dc', borderRadius: 1 }}>
                  <AppletHeader title="Pedidos" count="1 - 5 de más de 5+" />
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                      <thead>
                        <tr style={{ background: '#f3f6f9', borderBottom: '1px solid #cbd4de', color: '#333' }}>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Estado</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Motivo cancelación</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Fecha de creación</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Tipo de pedido</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Modalidad</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Marca</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Método de envío</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Nº de Pedido</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px' }}>Cuenta de factura</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PEDIDOS.map((r, i) => (
                          <tr key={i} style={{ background: i === 0 ? '#dcedf9' : '#ffffff', borderBottom: '1px solid #edf1f5' }}>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.estado}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.motivo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.fechaCreacion}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.tipo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.modalidad}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.marca}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.envio}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6', whiteSpace: 'nowrap' }}>{r.nroPedido}</td>
                            <td style={{ padding: '3px 6px', color: '#0060b6', whiteSpace: 'nowrap' }}>{r.cuentaFact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Gripper />
                </div>

                {/* 3. Solicitudes de servicio */}
                <div style={{ background: '#ffffff', border: '1px solid #c9d2dc', borderRadius: 1 }}>
                  <AppletHeader title="Solicitudes de servicio" count="1 - 2 de 2" />
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                      <thead>
                        <tr style={{ background: '#f3f6f9', borderBottom: '1px solid #cbd4de', color: '#333' }}>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Estado</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Nº de SS</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Nº de reclamo</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Usuario creador</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Tipo</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Área</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Subárea</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px', borderRight: '1px solid #dce2e8' }}>Marca</th>
                          <th style={{ textAlign: 'left', padding: '3px 6px' }}>Tipo requerimiento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SOLICITUDES.map((r, i) => (
                          <tr key={i} style={{ background: i === 0 ? '#dcedf9' : '#ffffff', borderBottom: '1px solid #edf1f5' }}>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.estado}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', color: '#0060b6', whiteSpace: 'nowrap' }}>{r.ss}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.nReclamo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.usuario}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.tipo}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.area}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5', whiteSpace: 'nowrap' }}>{r.subarea}</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #edf1f5' }}>{r.marca}</td>
                            <td style={{ padding: '3px 6px', whiteSpace: 'nowrap' }}>{r.tipoReq}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Gripper />
                </div>

              </div>
            </div>
          )}

          {/* ══════════ CASO 3: Otras pestañas ══════════ */}
          {activeSubTab !== 'Actividades' && activeSubTab !== 'Resumen del cliente' && activeSubTab !== 'Más información' && (
            <div style={{ background: '#ffffff', border: '1px solid #c9d2dc', padding: 24, textAlign: 'center', color: '#666', borderRadius: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#333', marginBottom: 6 }}>{activeSubTab}</div>
              <div style={{ fontSize: 11 }}>Sin registros asociados en esta vista.</div>
            </div>
          )}

        </div>
      </div>
    )}
  </div>
)
}