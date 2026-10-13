/**
 * URLs de capturas de guías Contrataciones (encoding correcto para espacios).
 * Fuente única para corpus de entrenamiento + fallback en el chat.
 */
import {
  CONTROL_REMOTO_IMG_BASE,
  CAMBIO_PLAN_IMG_BASE,
  DBOX_PASOS_IMG_BASE,
  ASISTENCIA_VTR_IMG_BASE,
  controlRemotoPasos,
  cambioPlanPasos,
  dboxPasos,
  asistenciaVtrPasos,
} from './guiasPortal.js'

export function urlAssetGuia(base, file) {
  const raw = `${String(base || '').replace(/\/$/, '')}/${String(file || '').replace(/^\//, '')}`
  return raw
    .split('/')
    .map((seg, i) => (i === 0 && seg === '' ? '' : encodeURIComponent(seg)))
    .join('/')
}

function imgsDesdePasos(pasos, imgBaseDefault) {
  const out = []
  const seen = new Set()
  for (const p of pasos || []) {
    const base = p.imgBase || imgBaseDefault
    for (const img of p.imgs || []) {
      if (!base || !img) continue
      const url = urlAssetGuia(base, img)
      if (seen.has(url)) continue
      seen.add(url)
      out.push(url)
    }
  }
  return out
}

export const IMGS_CONTROL_REMOTO = imgsDesdePasos(controlRemotoPasos, CONTROL_REMOTO_IMG_BASE)
export const IMGS_CAMBIO_PLAN = imgsDesdePasos(cambioPlanPasos, CAMBIO_PLAN_IMG_BASE)
export const IMGS_DBOX = imgsDesdePasos(dboxPasos, DBOX_PASOS_IMG_BASE)
export const IMGS_ASISTENCIA_VTR = imgsDesdePasos(asistenciaVtrPasos, ASISTENCIA_VTR_IMG_BASE)

/** Subconjuntos útiles por intención (miniaturas en chat) */
export const IMGS_CR = {
  precio: [
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 7.jpeg'),
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 8.jpeg'),
  ],
  delivery: [
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 9.jpeg'),
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 10.jpeg'),
  ],
  siebel: [
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 1.jpeg'),
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 7.jpeg'),
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 9.jpeg'),
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 11.jpeg'),
  ],
  general: IMGS_CONTROL_REMOTO.slice(0, 6),
}

export const IMGS_CP = {
  apex: [
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 6.jpeg'),
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 7.jpeg'),
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 8.jpeg'),
  ],
  andes: [
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 4.jpeg'),
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 5.jpeg'),
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 9.jpeg'),
  ],
  finalizacion: [
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 11.1.jpeg'),
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 11.2.jpeg'),
  ],
  anular: [
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'CANCELAR CAMBIO DE PLAN 1.jpeg'),
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'CANCELAR CAMBIO DE PLAN 2.jpeg'),
  ],
  cuenta: [
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 1.jpeg'),
    urlAssetGuia(CAMBIO_PLAN_IMG_BASE, 'PASO 2.jpeg'),
  ],
  general: IMGS_CAMBIO_PLAN.slice(0, 8),
}

export const IMGS_DB = {
  precio: [urlAssetGuia(DBOX_PASOS_IMG_BASE, '4.jpeg')],
  equipos: [
    urlAssetGuia(DBOX_PASOS_IMG_BASE, 'primero.jpeg'),
    urlAssetGuia(DBOX_PASOS_IMG_BASE, '1.jpeg'),
    urlAssetGuia(DBOX_PASOS_IMG_BASE, '2.jpeg'),
    urlAssetGuia(DBOX_PASOS_IMG_BASE, '3.jpeg'),
  ],
  flujo: [
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 1.jpeg'),
    urlAssetGuia(DBOX_PASOS_IMG_BASE, 'vista general para pedidos.jpeg'),
    urlAssetGuia(DBOX_PASOS_IMG_BASE, 'primero.jpeg'),
    urlAssetGuia(DBOX_PASOS_IMG_BASE, '2.jpeg'),
    urlAssetGuia(DBOX_PASOS_IMG_BASE, '4.jpeg'),
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 9.jpeg'),
  ],
  entrega: [
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 9.jpeg'),
    urlAssetGuia(CONTROL_REMOTO_IMG_BASE, 'PASO 11.jpeg'),
  ],
  general: IMGS_DBOX.slice(0, 8),
}

/** Fallback de imágenes según id/intención/fuente del doc top */
export function imagenesGuiaParaDoc(doc) {
  if (!doc) return []
  const id = String(doc.id || '')
  const intent = String(doc.intencion || '')
  const fuente = String(doc.fuente || '')

  if (
    id.startsWith('cr-') ||
    intent.startsWith('CR_') ||
    fuente.includes('control-remoto') ||
    id.includes('control-remoto')
  ) {
    if (/precio|PRECIO|TOTAL|COBRO/.test(id + intent)) return IMGS_CR.precio
    if (/delivery|DELIVERY/.test(id + intent)) return IMGS_CR.delivery
    if (/siebel|SIEBEL|flujo|paso/.test(id + intent)) return IMGS_CR.siebel
    return IMGS_CR.general
  }

  if (
    id.startsWith('cp-') ||
    intent.includes('CAMBIO_PLAN') ||
    intent.includes('ANULAR_CAMBIO') ||
    fuente.includes('cambio-plan') ||
    id.includes('cambio-plan')
  ) {
    if (/apex|APEX/.test(id + intent)) return IMGS_CP.apex
    if (/andes|ANDES|promocion/.test(id + intent) && !/anular|ANULAR/.test(id + intent)) return IMGS_CP.andes
    if (/final|FINAL|tsq|TSQ|envio/.test(id + intent)) return IMGS_CP.finalizacion
    if (/anular|ANULAR/.test(id + intent)) return IMGS_CP.anular
    if (/cuenta|CUENTA/.test(id + intent)) return IMGS_CP.cuenta
    return IMGS_CP.general
  }

  if (
    id.startsWith('db-') ||
    intent.startsWith('DBOX_') ||
    fuente.includes('dbox') ||
    id.includes('dbox')
  ) {
    if (/precio|PRECIO/.test(id + intent)) return IMGS_DB.precio
    if (/equipos|EQUIPOS/.test(id + intent)) return IMGS_DB.equipos
    if (/entrega|ENTREGA/.test(id + intent)) return IMGS_DB.entrega
    if (/flujo|FLUJO/.test(id + intent)) return IMGS_DB.flujo
    return IMGS_DB.general
  }

  if (id.includes('asistencia') || /asistencia.?vtr|sva asistencia/.test(id + intent + fuente)) {
    return IMGS_ASISTENCIA_VTR
  }

  return []
}
