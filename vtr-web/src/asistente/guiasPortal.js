/** Guías paso a paso del portal Apex (fuente única para UI + IA) */

export const CONTROL_REMOTO_IMG_BASE = '/PASOS PARA CONTRATACION CONTROL REMOTO'
export const CAMBIO_PLAN_IMG_BASE = '/Pasos para cambio de plan'
export const DBOX_PASOS_IMG_BASE = '/Pasos d-box'
export const ASISTENCIA_VTR_IMG_BASE = '/sc-assets/1354'

export const controlRemotoPasos = [
  {
    paso: 'Paso 1',
    titulo: 'Buscar la cuenta del cliente',
    items: [
      'En el menú principal, dirígete a la pestaña Clientes.',
      'En el campo de búsqueda Rut, ingresa el RUT del cliente (ejemplo: 13366295-2) y presiona Enter o haz clic en el ícono de consulta.',
    ],
    imgs: ['PASO 1.jpeg'],
  },
  {
    paso: 'Paso 2',
    titulo: 'Seleccionar la cuenta de nivel "Cliente"',
    items: [
      'En los resultados de búsqueda, ubica la columna Clase.',
      'Haz clic sobre el RUT correspondiente a la clase Cliente (la primera fila, no la de Facturación ni Servicio).',
    ],
    imgs: ['PASO 2.jpeg'],
  },
  {
    paso: 'Paso 3',
    titulo: 'Iniciar la modificación del producto',
    items: [
      'En la vista resumen del cliente, desplázate hacia abajo hasta la sección Productos Instalados.',
      'Selecciona la fila de la promoción o producto principal (ej. Doble Pack Finix o Banda Ancha / Televisión).',
      'Haz clic en el botón Modificar (ubicado en la barra superior de Productos Instalados).',
    ],
    imgs: ['PASO 3.jpeg'],
  },
  {
    paso: 'Paso 4',
    titulo: 'Confirmar selección en Productos Instalados',
    items: [
      'Asegúrate de tener seleccionado el producto contratado activo sobre el cual se agregará el cargo.',
      'Haz clic nuevamente en Modificar para abrir la pantalla de gestión del pedido de venta.',
    ],
    imgs: ['PASO 4.jpeg'],
  },
  {
    paso: 'Paso 5',
    titulo: 'Ir al Catálogo del Pedido',
    items: [
      'Una vez dentro de la pantalla del Pedido de ventas (con estado Pendiente), dirígete a la pestaña Catálogo (en la sección intermedia).',
    ],
    imgs: ['PASO 5.jpeg'],
  },
  {
    paso: 'Paso 6',
    titulo: 'Desplegar categorías de cobro',
    items: [
      'En el menú lateral izquierdo (Examinar), despliega la opción Cargos y Descuentos No Recurrentes Fijo.',
    ],
    imgs: ['PASO 6.jpeg'],
  },
  {
    paso: 'Paso 7',
    titulo: 'Seleccionar y agregar el Control Remoto',
    items: [
      'Haz clic en la subcategoría Cargos.',
      'En la lista de Productos de categoría, busca la opción Control Remoto (con descripción Delivery Control Remoto y precio referencia de $6.000).',
      'Haz clic en el botón Agregar ítem.',
    ],
    imgs: ['PASO 7.jpeg'],
  },
  {
    paso: 'Paso 8',
    titulo: 'Verificar el ítem agregado en Detalles',
    items: [
      'Ve a la pestaña Detalles del pedido.',
      'En la tabla de la línea de detalles, verifica que aparezca el producto Control Remoto con la acción Nuevo y su precio neto ($6.000).',
    ],
    imgs: ['PASO 8.jpeg'],
  },
  {
    paso: 'Paso 9',
    titulo: 'Verificar, Método de Envío y Generar documento',
    intro: 'Vuelve a la sección superior de datos del Pedido de ventas.',
    orderedItems: [
      'Haz clic en el botón Verificar (para validación del sistema).',
      {
        text: 'Verifica o selecciona en el campo Método de Envío la modalidad según corresponda:',
        subItems: [
          'Autoinstalación (si el cliente lo retira/recibe por despacho).',
          'Visita Técnica (si requiere un técnico en domicilio).',
        ],
      },
      'Haz clic en Generar documento.',
    ],
    imgs: ['PASO 9.jpeg', 'PASO 10.jpeg'],
  },
  {
    paso: 'Paso 10',
    titulo: 'Finalizar y Enviar el pedido',
    items: [
      'Revisa que todos los datos obligatorios y la dirección de servicio estén correctos.',
      'Haz clic en Enviar para procesar y cerrar la orden de venta del control remoto.',
    ],
    imgs: ['PASO 11.jpeg', 'PASO 12.jpeg'],
  },
]

export const cambioPlanPasos = [
  {
    paso: 'Paso 1',
    titulo: 'Buscar la cuenta del cliente (Andes)',
    items: [
      'En el menú principal, dirígete a la pestaña Clientes.',
      'En el campo de búsqueda Rut, ingresa el RUT del cliente y presiona Enter o haz clic en el ícono de consulta.',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 1.jpeg'],
  },
  {
    paso: 'Paso 2',
    titulo: 'Seleccionar la cuenta de nivel "Cliente"',
    items: [
      'En los resultados de búsqueda, ubica la columna Clase.',
      'Haz clic sobre el RUT correspondiente a la clase Cliente (no Facturación ni Servicio).',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 2.jpeg', 'PASO 3.jpeg'],
  },
  {
    paso: 'Paso 3',
    titulo: 'Consulta del nuevo plan (Portal APEX)',
    items: [
      'En el catálogo de APEX (sección Planes), busca la oferta requerida (ej. Fibra 600 Megas).',
      'Abre el detalle de la tarjeta del plan.',
      'Copia la denominación exacta del plan (ej. Fibra Hogar Residencial 0226F). Ese nombre oficial se usa después en Andes.',
    ],
    imgs: ['PASO 6.jpeg', 'PASO 7.jpeg', 'PASO 8.jpeg'],
  },
  {
    paso: 'Paso 4',
    titulo: 'Inicio del cambio de plan (Andes)',
    items: [
      'En Resumen del cliente, ve a la sección Productos Instalados.',
      'Selecciona la línea activa del producto/promoción a cambiar.',
      'Haz clic en Actualizar promoción.',
      'Se abrirá la ventana Actualizaciones de promociones con el buscador.',
    ],
    imgs: ['PASO 4.jpeg', 'PASO 5.jpeg'],
  },
  {
    paso: 'Paso 5',
    titulo: 'Selección y aplicación de la promoción',
    orderedItems: [
      'En Nombre de la promoción, pega o escribe el nombre exacto copiado desde APEX (ej. Fibra Hogar Residencial 0226F).',
      'Selecciona la promoción en la lista de resultados.',
      'Presiona Aceptar para confirmar.',
    ],
    imgs: ['PASO 9.jpeg', 'PASO 10.jpeg'],
  },
  {
    paso: 'Paso 6',
    titulo: 'Finalización y emisión de la orden',
    orderedItems: [
      'Configura el Método de Envío (ej. Visita Técnica).',
      'Valida que el e-mail del cliente sea correcto.',
      'Presiona en orden: Verificar y luego TSQ.',
      'Haz clic en Generar documento.',
      'Presiona Enviar para completar la gestión.',
    ],
    imgs: ['PASO 11.1.jpeg', 'PASO 11.2.jpeg'],
  },
  {
    paso: 'Paso 7',
    titulo: 'Anular trámite (si hay pedido fallido o en curso)',
    intro: 'Solo si existe una orden previa abierta que deba anularse. Este paso va al final.',
    items: [
      'Despliega la lista de motivo de cancelación.',
      'Selecciona el motivo (ej. Incidencia de trámite).',
      'Presiona CONFIRMAR para liberar la línea.',
    ],
    imgs: ['CANCELAR CAMBIO DE PLAN 1.jpeg', 'CANCELAR CAMBIO DE PLAN 2.jpeg'],
  },
]

export const dboxPasos = [
  {
    paso: 'Paso 1',
    titulo: 'Buscar la cuenta del cliente',
    items: [
      'En el menú principal, dirígete a la pestaña Clientes.',
      'En el campo de búsqueda Rut, ingresa el RUT del cliente y presiona Enter o haz clic en el ícono de consulta.',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 1.jpeg'],
  },
  {
    paso: 'Paso 2',
    titulo: 'Seleccionar la cuenta de nivel "Cliente"',
    items: [
      'En los resultados de búsqueda, ubica la columna Clase.',
      'Haz clic sobre el RUT correspondiente a la clase Cliente (no Facturación ni Servicio).',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 2.jpeg'],
  },
  {
    paso: 'Paso 3',
    titulo: 'Iniciar la modificación del producto',
    items: [
      'En la vista resumen del cliente, desplázate hacia abajo hasta la sección Productos Instalados.',
      'Selecciona la fila de la promoción o producto principal (ej. Doble Pack Finix o Banda Ancha / Televisión).',
      'Haz clic en el botón Modificar.',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 3.jpeg'],
  },
  {
    paso: 'Paso 4',
    titulo: 'Confirmar selección en Productos Instalados',
    items: [
      'Asegúrate de tener seleccionado el producto contratado activo sobre el cual se agregará el D-Box.',
      'Haz clic nuevamente en Modificar para abrir la pantalla de gestión del Pedido de ventas.',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 4.jpeg'],
  },
  {
    paso: 'Paso 5',
    titulo: 'Vista general del Pedido de ventas',
    items: [
      'Se abre la pantalla Pedido de ventas con el pedido en estado Pendiente.',
      'Revisa los datos superiores (Método de Envío, Motivo de cambio, etc.) y ve a la pestaña Detalles → Detalles de la línea.',
      'Ahí verás las líneas del pedido (Television, Equipo, Banda Ancha, promoción, etc.).',
    ],
    imgs: ['vista general para pedidos.jpeg'],
  },
  {
    paso: 'Paso 6',
    titulo: 'Personalizar la línea Television',
    orderedItems: [
      'En la pestaña Detalles del Pedido de ventas, selecciona la línea Television.',
      'Haz clic en el botón Personalizar.',
    ],
    imgs: ['primero.jpeg'],
  },
  {
    paso: 'Paso 7',
    titulo: 'Ir al paso Equipos',
    items: [
      'En el asistente de personalización, avanza hasta el paso Equipos (Television → Canales Adicionales → Equipos).',
      'Ubica la sección Decodificadores.',
    ],
    imgs: ['1.jpeg'],
  },
  {
    paso: 'Paso 8',
    titulo: 'Seleccionar d-BOX Smart II',
    items: [
      'En el desplegable Item de Decodificadores, elige d-BOX Smart II.',
      'Deja la cantidad (Cant.) en 1.',
    ],
    imgs: ['2.jpeg'],
  },
  {
    paso: 'Paso 9',
    titulo: 'Agregar el ítem',
    items: [
      'Haz clic en Agregar ítem para incorporar el decodificador a la orden.',
    ],
    imgs: ['3.jpeg'],
  },
  {
    paso: 'Paso 10',
    titulo: 'Verificar en Equipos',
    items: [
      'Confirma que d-BOX Smart II aparezca en la lista de Decodificadores.',
      'Verifica el precio mensual ($2.990 / Por mes).',
      'Cuando esté listo, usa Terminado o Verificar según corresponda.',
    ],
    imgs: ['4.jpeg'],
  },
  {
    paso: 'Paso 11',
    titulo: 'Verificar en Detalles del pedido',
    items: [
      'Vuelve a la pestaña Detalles del pedido.',
      'Bajo Television, confirma que figure d-BOX Smart II con acción Nuevo y precio $2.990.',
    ],
    imgs: ['6.jpeg'],
  },
  {
    paso: 'Paso 12',
    titulo: 'Verificar, Método de Envío y Generar documento',
    intro: 'Vuelve a la sección superior de datos del Pedido de ventas.',
    orderedItems: [
      'Haz clic en el botón Verificar (para validación del sistema).',
      {
        text: 'Verifica o selecciona en el campo Método de Envío la modalidad según corresponda:',
        subItems: [
          'Autoinstalación (si el cliente lo retira/recibe por despacho).',
          'Visita Técnica (si requiere un técnico en domicilio).',
        ],
      },
      'Haz clic en Generar documento.',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 9.jpeg', 'PASO 10.jpeg'],
  },
  {
    paso: 'Paso 13',
    titulo: 'Finalizar y Enviar el pedido',
    items: [
      'Revisa que todos los datos obligatorios y la dirección de servicio estén correctos.',
      'Haz clic en Enviar para procesar y cerrar la orden de venta del D-Box.',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 11.jpeg', 'PASO 12.jpeg'],
  },
]

export const asistenciaVtrPasos = [
  {
    paso: 'Paso 1',
    titulo: 'Buscar la cuenta del cliente',
    items: [
      'En el menú principal, dirígete a la pestaña Clientes.',
      'En el campo de búsqueda Rut, ingresa el RUT del cliente (ejemplo: 13366295-2) y presiona Enter o haz clic en el ícono de consulta.',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 1.jpeg'],
  },
  {
    paso: 'Paso 2',
    titulo: 'Seleccionar la cuenta de nivel "Cliente"',
    items: [
      'En los resultados de búsqueda, ubica la columna Clase.',
      'Haz clic sobre el RUT correspondiente a la clase Cliente (la primera fila, no la de Facturación ni Servicio).',
    ],
    imgBase: CONTROL_REMOTO_IMG_BASE,
    imgs: ['PASO 2.jpeg'],
  },
  {
    paso: 'Paso 3',
    titulo: 'Modificar en Productos Instalados',
    items: [
      'En la Vista 360° de la cuenta del cliente, ve a Productos Instalados.',
      'Posiciónate sobre la promoción contratada y pincha Modificar.',
    ],
    imgs: ['image-20200513195442-3.png'],
  },
  {
    paso: 'Paso 4',
    titulo: 'Editar promoción',
    items: [
      'Selecciona la promoción.',
      'Pincha Editar promoción.',
    ],
    imgs: ['image-20210712093514-6.png'],
  },
  {
    paso: 'Paso 5',
    titulo: 'Agregar Asistencia VTR',
    items: [
      'En Asistencia VTR, pincha Agregar.',
      'Luego pincha Terminado.',
    ],
    imgs: ['image-20210712093514-7.png'],
  },
  {
    paso: 'Paso 6',
    titulo: 'Comentarios, generar documento y Enviar',
    items: [
      'En Comentarios deja la modificación, lo informado al cliente y los costos.',
      'Generar documento, marca el envío al correo y verifica que se haya creado.',
      'Enviar el pedido.',
    ],
    imgs: ['image-20210712093514-8.png'],
  },
  {
    paso: 'Paso 7',
    titulo: 'Informar costos (primera boleta)',
    items: [
      'Costo mensual: $1.990.',
      'La primera boleta incluye el proporcional según fecha de contratación y fecha de facturación.',
      'Además se cobra el mes completo del mes siguiente.',
    ],
    ejemplo: {
      titulo: 'Ejemplo si contrata el día 15',
      lineas: [
        'Proporcional del 15 al 30 (16 días): $1.060',
        'Mes completo siguiente: $1.990',
        'Total primera boleta: $3.050',
      ],
    },
  },
]
