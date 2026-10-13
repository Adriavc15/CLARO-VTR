/**
 * Extrae Cambio de Titular Fijo (1346) desde HTML Somos Clave
 * y genera procedimientoCambioTitular.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.resolve(__dirname, '../../../Somos Clave _ Portal Privado cambio titular.html')
const outJs = path.resolve(__dirname, 'procedimientoCambioTitular.js')

const html = fs.readFileSync(htmlPath, 'utf8')

const strip = (s) =>
  String(s || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, ' ')
    .replace(/add_circle_outline|record_voice_over|folder_special|expand_more|expand_less|receipt|dvr/gi, '')
    .replace(/Contraseña:\s*\S+/gi, 'Contraseña: [consultar con supervisor]')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\|(\s*\|)+/g, '|')
    .trim()

const lines = (texto, max = 80) =>
  String(texto || '')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 1 && !/^[\|\s]+$/.test(l))
    .slice(0, max)

const title = strip((html.match(/id="faq-title">([\s\S]*?)<\/b>/i) || [])[1] || 'Cambio de Titular Fijo')
const modified = strip((html.match(/id="faq-modified-date">([\s\S]*?)<\/b>/i) || [])[1] || '')
const qMatch =
  html.match(/saved from url=\([^)]*\)https?:\/\/[^/]+\/respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)/i) ||
  html.match(/respuesta\.php\?q=(hogar|actualizado)\/(\d+)/i)
const cat = (qMatch && qMatch[1]) || 'hogar'
const sid = (qMatch && qMatch[2]) || '1346'

const contentStart = html.search(/id="faq-content"/i)
const contentEnd = html.search(/Respuestas que otros encontraron útiles/i)
const faqHtml =
  contentStart >= 0
    ? html.slice(contentStart, contentEnd > contentStart ? contentEnd : undefined)
    : html

/** Parte el contenido por títulos estilo Somos Clave (p bold 20px) o h1 */
const sectionChunks = []
const headingRe =
  /<(?:p[^>]*font-size:\s*20px[^>]*|h1)[^>]*>([\s\S]*?)<\/(?:p|h1)>/gi
const heads = []
let m
while ((m = headingRe.exec(faqHtml)) !== null) {
  const name = strip(m[1])
  if (!name || name.length > 80) continue
  if (/^(objetivo|alcance|consideraciones|importantes)/i.test(name) || name.length < 40) {
    heads.push({ name, index: m.index, end: m.index + m[0].length })
  }
}
for (let i = 0; i < heads.length; i++) {
  const cur = heads[i]
  const next = heads[i + 1]
  const body = faqHtml.slice(cur.end, next ? next.index : faqHtml.length)
  sectionChunks.push({ name: cur.name, body: lines(strip(body), 50) })
}

const docs = []

docs.push({
  id: `sc-${sid}`,
  titulo: title,
  categoria: 'SOMOS CLAVE',
  tipo: 'somosclave',
  seccionPortal: `Somos Clave · ${cat}`,
  sinonimos: [
    sid,
    'cambio de titular',
    'cambio titular',
    'cambio de titularidad',
    'titular fijo',
    'cambiar titular',
    'nuevo titular',
    'traspaso titular',
    'cesion titular',
  ],
  contenido: [
    `Procedimiento Somos Clave ID ${sid}: ${title}.`,
    modified ? `Última actualización: ${modified}.` : '',
    'Aplica Call Center Voz/No Voz y Sucursales. Solo servicios fijos.',
    'Quién: titular actual + nuevo titular (ambos). Solo se gestiona en Sucursales.',
    'Documentos: cédula vigente de ambos. Aplica validación de identidad.',
    'Requisitos: servicio activo/vigente, sin deuda vencida, al menos 1 boleta emitida y pagada; nuevo titular ≥18 años y sin deuda con VTR.',
    'Hoy NO hay funcionalidad de cambio de titular en sistema: se hace desconexión del origen + alta (venta nueva) al destino el mismo día.',
    'Call Center / digital: derivar a sucursal presencial (ambas personas o poder notarial).',
    'Desconexión: jefe/supervisor de sucursal. Alta: ejecutivo de sucursal.',
    `Enlace: https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  ].filter(Boolean),
  fuente: 'somosclave-html-cambio-titular',
  enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  scId: sid,
})

for (const sec of sectionChunks) {
  if (sec.body.length < 2) continue
  const slug = sec.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  docs.push({
    id: `titular-${slug}`,
    titulo: `Cambio de titular — ${sec.name}`,
    categoria: 'PROCEDIMIENTO',
    tipo: 'micro',
    seccionPortal: 'Somos Clave → Cambio de Titular Fijo',
    sinonimos: [
      sec.name.toLowerCase(),
      'cambio de titular',
      'cambio titularidad',
      'titular fijo',
      slug.replace(/-/g, ' '),
    ],
    contenido: sec.body,
    fuente: 'somosclave-html-cambio-titular',
    enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  })
}

// Matriz: extraer celdas Sucursales vs Call Center
const matrizMatch = faqHtml.match(/MATRIZ DE ATENCIÓN CAMBIO DE TITULAR[\s\S]*$/i)
if (matrizMatch) {
  const matrizTxt = lines(strip(matrizMatch[0]), 70)
  docs.push({
    id: 'titular-matriz-sucursales',
    titulo: 'Cambio de titular — matriz Sucursales (gestión)',
    categoria: 'PROCEDIMIENTO',
    tipo: 'micro',
    seccionPortal: 'Somos Clave → Cambio de Titular Fijo',
    sinonimos: [
      'matriz cambio titular',
      'cambio titular sucursal',
      'gestion cambio titular',
      'desconexion alta titular',
      'formulario cambio titular',
    ],
    contenido: [
      'Canal: SUCURSALES (gestión presencial).',
      '1. Validar misma estructura de cuenta origen/destino (misma dirección en servicio y facturación).',
      '2. Si destino es empresa → asociar representante legal como contacto primario (CREACIÓN DE CLIENTES).',
      '3. Pedir documentación a titular origen y destino; sin docs no se avanza.',
      '4. Informar que no hay opción de cambio de titular: se ofrece desconexión del origen + alta en el mismo domicilio con datos del destino. Implica pérdida del número. Solo si acepta, continuar.',
      '5. Llenar formulario de Sucursal (tipo servicio fijo, RUT origen/destino, direcciones, servicios, fecha).',
      '6. Avisar a jefatura/coordinador para ingresar la desconexión (fecha de término = día de solicitud; si ya facturó, ajustar).',
      '7. Informar que la desconexión se realiza en hasta 2 días.',
      '8. Ingresar el alta del servicio según plan elegido (PLAN COMERCIAL / venta fijo).',
      'Registro desconexión: Atención comercial → baja de servicio → DX servicio principal.',
      'Registro venta: Atención comercial → Cambio servicio contratado → Cambio de plan/actualización promo.',
    ],
    fuente: 'somosclave-html-cambio-titular',
    enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  })

  docs.push({
    id: 'titular-matriz-call-center',
    titulo: 'Cambio de titular — Call Center / canales digitales',
    categoria: 'PROCEDIMIENTO',
    tipo: 'micro',
    seccionPortal: 'Somos Clave → Cambio de Titular Fijo',
    sinonimos: [
      'cambio titular call center',
      'speech cambio titular',
      'speech cambio de titular',
      'script cambio titular',
      'script cambio de titular call center',
      'derivar cambio titular',
      'poder notarial titular',
      'canales digitales cambio titular',
      'call center cambio de titular',
    ],
    contenido: [
      'Canal: CALL CENTER / CANALES DIGITALES — no se gestiona remoto.',
      'Informar que debe hacerse presencial en sucursal con ambas cédulas.',
      'Si una parte no puede asistir: poder notarial que especifique cambio de titular + copia de cédula de ambos.',
      'Speech VOZ: «Sr(a) XXXX, el cambio de titular es un procedimiento que se debe hacer de manera presencial en su sucursal más cercana. Es necesario que se presenten ambas personas con sus cédulas de identidad y en caso que una de las partes no pueda asistir, se debe presentar un poder notarial que especifique la solicitud de cambio de titular y la copia de cédula de ambos.»',
      'Speech NO VOZ / digital: «XXXX, el cambio de titular es un procedimiento que debes hacer de manera presencial en tu sucursal más cercana. Es necesario que se presenten ambas personas con sus cédulas de identidad y en caso que una de las partes no pueda asistir, se debe presentar un poder notarial que especifique la solicitud de cambio de titular y la copia de cédula de ambos.»',
      'Horarios/sucursales: publicación HORARIOS DE CANALES ATENCIÓN.',
    ],
    fuente: 'somosclave-html-cambio-titular',
    enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  })

  // Guardar también el texto crudo de matriz por si aporta detalle
  if (matrizTxt.length > 10) {
    docs.push({
      id: 'titular-matriz-completa',
      titulo: 'Cambio de titular — matriz completa (texto)',
      categoria: 'PROCEDIMIENTO',
      tipo: 'guia',
      seccionPortal: 'Somos Clave → Cambio de Titular Fijo',
      sinonimos: ['matriz atencion cambio titular', 'pasos cambio titular fijo'],
      contenido: matrizTxt,
      fuente: 'somosclave-html-cambio-titular',
      enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
    })
  }
}

const file = `/**
 * Procedimiento: Cambio de Titular Fijo (Somos Clave ${sid})
 * Generado desde "Somos Clave _ Portal Privado cambio titular.html"
 * Regenerar: node src/asistente/_extractCambioTitular.mjs
 * Actualización referencia: ${modified || 'n/d'}
 */

export const DOCS_CAMBIO_TITULAR = ${JSON.stringify(docs, null, 2)}
`

fs.writeFileSync(outJs, file, 'utf8')
console.log('OK', docs.length, 'docs →', path.basename(outJs))
for (const d of docs) console.log('-', d.id, '|', d.titulo, '|', (d.contenido || []).length, 'líneas')
