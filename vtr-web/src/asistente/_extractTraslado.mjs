/**
 * Extrae el artículo Traslado (1058) desde el HTML guardado de Somos Clave
 * y genera procedimientoTraslado.js para el chatbot.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.resolve(__dirname, '../../../Somos Clave _ Portal Privado traslado.html')
const outJs = path.resolve(__dirname, 'procedimientoTraslado.js')

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
    .replace(/Contraseña:\s*VTR123/gi, 'Contraseña: [consultar con supervisor]')
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

const title = strip((html.match(/id="faq-title">([\s\S]*?)<\/b>/i) || [])[1] || 'Traslado de Servicios')
const modified = strip((html.match(/id="faq-modified-date">([\s\S]*?)<\/b>/i) || [])[1] || '')
const qMatch =
  html.match(/saved from url=\([^)]*\)https?:\/\/[^/]+\/respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)/i) ||
  html.match(/respuesta\.php\?q=(hogar|actualizado)\/(\d+)/i)
const cat = (qMatch && qMatch[1]) || 'hogar'
const sid = (qMatch && qMatch[2]) || '1058'

const contentStart = html.search(/id="faq-content"/i)
const contentEnd = html.search(/Respuestas que otros encontraron útiles/i)
const faqHtml =
  contentStart >= 0
    ? html.slice(contentStart, contentEnd > contentStart ? contentEnd : undefined)
    : html

const tabPanes = [...faqHtml.matchAll(/<div class="tab-pane[^"]*"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="tab-pane|<\/div>\s*<\/div>\s*<p|&nbsp;\s*<div class="collapsible)/gi)]

const tabLabels = {
  'tabs-d6696-tab-1': 'CALL CENTER VOZ Y NO VOZ',
  'tabs-d6696-tab-2': 'N1 COMERCIAL',
  'tabs-d6696-tab-3': 'SUCURSALES',
}

const collapseBlocks = [...faqHtml.matchAll(/<div class="collapsible-header[^"]*"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<\/div>\s*<div class="collapsible-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/li>/gi)]

const overviewHtml = faqHtml.split(/<div class="bootstrap-tabs">/i)[0] || faqHtml.slice(0, 8000)

const docs = []

docs.push({
  id: `sc-${sid}`,
  titulo: title,
  categoria: 'SOMOS CLAVE',
  tipo: 'somosclave',
  seccionPortal: `Somos Clave · ${cat}`,
  sinonimos: [
    sid,
    'traslado',
    'traslado de servicios',
    'cambio de domicilio',
    'mudanza',
    'trasladar servicio',
    'cambiar domicilio',
    'nueva dirección',
    'factibilidad traslado',
  ],
  contenido: [
    `Procedimiento Somos Clave ID ${sid}: ${title}.`,
    modified ? `Última actualización: ${modified}.` : '',
    'Aplica Call Center Voz/No Voz, N1 Comercial y Sucursales. Clientes con servicios fijos.',
    'Quién: titular o tercero con poder notarial (poder solo en Sucursales).',
    'Requisitos: solo a direcciones factibles; con deuda solo mismos servicios; plan no vigente → actualizar antes.',
    'Importante: asociar la nueva dirección a la nueva cuenta de servicio o el técnico no llega.',
    'Cancelación del traslado: solo el titular (Gestión de Pedidos → Cancelar pedido).',
    'Canales con matriz propia: Call Center, N1 Comercial, Sucursales.',
    'Apartados clave: Paso a paso traslado en Andes · Validar dirección GIS / SII / Google Maps.',
    `Enlace: https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  ].filter(Boolean),
  fuente: 'somosclave-html-traslado',
  enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  scId: sid,
})

docs.push({
  id: 'traslado-consideraciones',
  titulo: 'Traslado de servicios — consideraciones y alcance',
  categoria: 'TÉCNICO',
  tipo: 'micro',
  seccionPortal: 'Somos Clave → Traslado de Servicios',
  sinonimos: ['consideraciones traslado', 'requisitos traslado', 'alcance traslado', 'objetivo traslado'],
  contenido: lines(strip(overviewHtml), 45),
  fuente: 'somosclave-html-traslado',
  enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
})

docs.push({
  id: 'traslado-factibilidad-red',
  titulo: 'Traslado — factibilidad HFC / FTTH / DUAL',
  categoria: 'TÉCNICO',
  tipo: 'micro',
  seccionPortal: 'Somos Clave → Traslado de Servicios',
  sinonimos: [
    'factibilidad traslado',
    'hfc a ftth',
    'ftth a hfc',
    'tabla red traslado',
    'cambio tecnologia traslado',
    'dual traslado',
  ],
  contenido: [
    'Tabla de factibilidad según tipo de red (dirección actual → destino):',
    'HFC → HFC: SÍ',
    'HFC → FTTH: NO (escalar a web de cambios de tecnología / soporte diferido)',
    'HFC → DUAL: SÍ',
    'FTTH → HFC: NO',
    'FTTH → FTTH: SÍ',
    'FTTH → DUAL: NO',
    'Si no es factible por tecnología: completar ficha en web interna de traslados/cambios de tecnología e informar que un especialista contactará en 1 día hábil.',
    'Factibilidad de dirección: Andes → Validaciones Venta → Búsqueda Dirección → Disponibilidad de Servicio VTR en Domicilio.',
    'Sin factibilidad en Call Center: transferir asistido a N1 Comercial.',
  ],
  fuente: 'somosclave-html-traslado',
  enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
})

for (const m of tabPanes) {
  const id = m[1]
  const label = tabLabels[id] || id
  const body = lines(strip(m[2]), 70)
  if (body.length < 5) continue
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  docs.push({
    id: `traslado-matriz-${slug}`,
    titulo: `Traslado — matriz ${label}`,
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Somos Clave → Traslado de Servicios',
    sinonimos: ['matriz traslado', label.toLowerCase(), `traslado ${label.toLowerCase()}`, 'atencion traslado'],
    contenido: [`Canal: ${label}`, ...body],
    fuente: 'somosclave-html-traslado',
    enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  })
}

for (const m of collapseBlocks) {
  const name = strip(m[1])
  const body = lines(strip(m[2]), 55)
  if (!name || body.length < 3) continue
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  docs.push({
    id: `traslado-${slug}`,
    titulo: `Traslado — ${name}`,
    categoria: 'ANDES',
    tipo: name.toUpperCase().includes('PASO A PASO') ? 'guia' : 'micro',
    seccionPortal: 'Somos Clave → Traslado de Servicios',
    sinonimos: [name.toLowerCase(), 'traslado andes', 'ingresar traslado', 'mudanza andes', slug.replace(/-/g, ' ')],
    contenido: body,
    fuente: 'somosclave-html-traslado',
    enlace: `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`,
  })
}

const file = `/**
 * Procedimiento: Traslado de Servicios / Cambio de Domicilio (Somos Clave ${sid})
 * Generado desde "Somos Clave _ Portal Privado traslado.html"
 * Regenerar: node src/asistente/_extractTraslado.mjs
 * Actualización referencia: ${modified || 'n/d'}
 */

export const DOCS_TRASLADO_SERVICIOS = ${JSON.stringify(docs, null, 2)}
`

fs.writeFileSync(outJs, file, 'utf8')
console.log('OK', docs.length, 'docs →', path.basename(outJs))
for (const d of docs) console.log('-', d.id, '|', d.titulo, '|', (d.contenido || []).length, 'líneas')
