/**
 * Comunicado: Regularización emisión de boleta agosto
 * Actualización: 14-09-2026
 */
export const DOCS_BOLETA_AGOSTO = [
  {
    id: 'boleta-agosto-regularizacion',
    titulo: 'Regularización emisión de boleta agosto',
    categoria: 'FACTURACIÓN',
    tipo: 'micro',
    seccionPortal: 'Facturación → Regularización boleta agosto',
    sinonimos: [
      'boleta agosto',
      'regularizacion boleta',
      'boleta atrasada',
      'retraso boleta',
      'boleta agosto septiembre',
      'no me llego la boleta agosto',
      'incidencia boleta',
      'nomina boleta agosto',
      'mascara de consulta boleta',
    ],
    contenido: [
      'Debido a una incidencia en sistemas, un grupo de clientes tuvo **retraso en la emisión de la boleta de agosto**.',
      'La situación **ya está solucionada** y se inicia la emisión de boletas pendientes.',
      'Algunos clientes podrán ver boletas de **agosto y septiembre** emitidas en fechas cercanas.',
      '**Qué hacer si consulta el cliente:** valida RUT o N° de cuenta en la **máscara de consulta** para confirmar si está afectado.',
      'Si está en la **nómina**: queda **excluido de acciones de cobranza por 30 días** (evita suspensión por esta regularización).',
      '**Importante:** la medida aplica **solo** a clientes identificados en la máscara de consulta.',
    ],
  },
  {
    id: 'boleta-agosto-speech',
    titulo: 'Speech: regularización boleta agosto',
    categoria: 'FACTURACIÓN',
    tipo: 'micro',
    seccionPortal: 'Facturación → Regularización boleta agosto',
    sinonimos: [
      'speech boleta agosto',
      'que decir boleta agosto',
      'guion boleta atrasada',
      'script boleta agosto',
    ],
    contenido: [
      '“Sr(a). XXX, debido a una incidencia en nuestros sistemas, su boleta de agosto presentó un retraso en la emisión. La situación ya fue solucionada y por este motivo podrá visualizar su boleta de agosto junto o en una fecha cercana a la correspondiente a septiembre. Para facilitar esta regularización, durante los próximos 30 días no se realizarán acciones de cobranza que puedan generar la suspensión de sus servicios.”',
    ],
  },
  {
    id: 'boleta-agosto-gestion',
    titulo: 'Gestión: cliente consulta boleta agosto atrasada',
    categoria: 'FACTURACIÓN',
    tipo: 'micro',
    seccionPortal: 'Facturación → Regularización boleta agosto',
    sinonimos: [
      'cliente sin boleta agosto',
      'boleta no emitida agosto',
      'validar mascara consulta',
      'excluido cobranza 30 dias',
    ],
    contenido: [
      '1. Valida RUT o N° de cuenta en la **máscara de consulta**.',
      '2. Si **no** está en nómina → no apliques este comunicado; atiende con flujo normal de boleta/facturación.',
      '3. Si **sí** está en nómina → informa con el speech de regularización (retraso agosto ya solucionado; puede ver agosto y septiembre cerca).',
      '4. Recuerda: **30 días sin acciones de cobranza** que puedan suspender por esta regularización.',
      '5. No inventes exclusiones fuera de la máscara: solo clientes de la nómina.',
    ],
  },
]
