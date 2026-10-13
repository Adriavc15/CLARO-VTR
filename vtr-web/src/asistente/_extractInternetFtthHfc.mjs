/**
 * Extrae Inconvenientes Internet FTTH-HFC (997) → procedimientoInternetFtthHfc.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.resolve(__dirname, '../../../Inconvenientes Internet FTTH - HFC.html')
const outJs = path.resolve(__dirname, 'procedimientoInternetFtthHfc.js')

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

const lines = (texto, max = 70) =>
  String(texto || '')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 1 && !/^[\|\s]+$/.test(l))
    .slice(0, max)

const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 55)

const title = strip((html.match(/id="faq-title">([\s\S]*?)<\/b>/i) || [])[1] || 'Inconvenientes Internet FTTH - HFC')
const modified = strip((html.match(/id="faq-modified-date">([\s\S]*?)<\/b>/i) || [])[1] || '')
const qMatch =
  html.match(/saved from url=\([^)]*\)https?:\/\/[^/]+\/respuesta\.php\?q=([a-z0-9_-]+)\/(\d+)/i) ||
  html.match(/respuesta\.php\?q=(hogar|actualizado)\/(\d+)/i)
const cat = (qMatch && qMatch[1]) || 'hogar'
const sid = (qMatch && qMatch[2]) || '997'
const enlace = `https://somosclave.cl/respuesta.php?q=${cat}/${sid}`

const contentStart = html.search(/id="faq-content"/i)
const contentEnd = html.search(/Respuestas que otros encontraron útiles/i)
const faqHtml =
  contentStart >= 0
    ? html.slice(contentStart, contentEnd > contentStart ? contentEnd : undefined)
    : html

/** Extrae ítems accordion (header + body) de un chunk HTML */
function extractAccordions(chunk) {
  const items = []
  const re =
    /<div class="collapsible-header[^"]*"[^>]*>[\s\S]*?<\/i>\s*([\s\S]*?)<\/div>\s*<div class="collapsible-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/li>/gi
  let m
  while ((m = re.exec(chunk)) !== null) {
    const name = strip(m[1]).replace(/^_+/, '').trim()
    const body = lines(strip(m[2]), 55)
    if (!name || body.length < 2) continue
    items.push({ name, body })
  }
  return items
}

const tabLabels = {
  'tabs-b0a9f2fc-tab-1': 'SIN INTERNET',
  'tabs-b0a9f2fc-tab-2': 'INTERNET DEGRADADO',
  'tabs-b0a9f2fc-tab-3': 'OTROS INCONVENIENTES',
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
    'sin internet',
    'internet lento',
    'intermitencia',
    'ftth',
    'hfc',
    'inconvenientes internet',
    'problema internet',
    'modem offline',
    'ont offline',
    'led los',
    'fibra internet',
  ],
  contenido: [
    `Procedimiento Somos Clave ID ${sid}: ${title}.`,
    modified ? `Última actualización: ${modified}.` : '',
    'Objetivo: atender clientes sin internet, lento o con intermitencia (FTTH y HFC). Multimarca.',
    'Aplica Call Center Voz/No Voz (digitales) y Sucursales. Titular o usuario del servicio.',
    'Si LED LOS en rojo al inicio: revisar masivo del sector; si no hay masivo → visita técnica (ruta Sin Internet Fibra / todos dispositivos offline).',
    'En sucursal: confirmar que haya alguien en el domicilio para pruebas; si no, pedir contacto cuando esté en casa.',
    'Pestañas: SIN INTERNET · INTERNET DEGRADADO · OTROS INCONVENIENTES.',
    'Siempre revisar estado comercial (activo) antes de soporte técnico.',
    `Enlace: ${enlace}`,
  ].filter(Boolean),
  fuente: 'somosclave-html-internet-ftth-hfc',
  enlace,
  scId: sid,
})

// Overview before tabs
const beforeTabs = faqHtml.split(/<div class="bootstrap-tabs">/i)[0] || faqHtml.slice(0, 12000)
docs.push({
  id: 'inet-consideraciones',
  titulo: 'Internet FTTH/HFC — objetivo, alcance e importantes',
  categoria: 'TÉCNICO',
  tipo: 'micro',
  seccionPortal: 'Somos Clave → Inconvenientes Internet FTTH-HFC',
  sinonimos: [
    'alcance inconvenientes internet',
    'importantes atencion internet',
    'led los rojo',
    'masivo sector internet',
  ],
  contenido: lines(strip(beforeTabs), 40),
  fuente: 'somosclave-html-internet-ftth-hfc',
  enlace,
})

// Tab panes
const paneRe = /<div class="tab-pane[^"]*"[^>]*id="(tabs-b0a9f2fc-tab-\d+)"[^>]*>/gi
const paneStarts = []
let pm
while ((pm = paneRe.exec(faqHtml)) !== null) {
  paneStarts.push({ id: pm[1], index: pm.index, end: pm.index + pm[0].length })
}
for (let i = 0; i < paneStarts.length; i++) {
  const cur = paneStarts[i]
  const next = paneStarts[i + 1]
  const chunk = faqHtml.slice(cur.end, next ? next.index : faqHtml.length)
  const label = tabLabels[cur.id] || cur.id
  const intro = lines(strip(chunk.split(/<ul class="collapsible/i)[0] || ''), 15)
  const accs = extractAccordions(chunk)

  docs.push({
    id: `inet-${slug(label)}`,
    titulo: `Internet FTTH/HFC — ${label}`,
    categoria: 'TÉCNICO',
    tipo: 'guia',
    seccionPortal: 'Somos Clave → Inconvenientes Internet FTTH-HFC',
    sinonimos: [
      label.toLowerCase(),
      `internet ${label.toLowerCase()}`,
      slug(label).replace(/-/g, ' '),
      label === 'SIN INTERNET' ? 'sin servicio internet' : '',
      label === 'INTERNET DEGRADADO' ? 'internet lento intermitente' : '',
      label === 'OTROS INCONVENIENTES' ? 'problema pagina web wifi' : '',
    ].filter(Boolean),
    contenido: [
      `Pestaña: ${label}`,
      ...intro,
      ...accs.slice(0, 12).flatMap((a) => [`— ${a.name}`, ...a.body.slice(0, 8)]),
    ].slice(0, 80),
    fuente: 'somosclave-html-internet-ftth-hfc',
    enlace,
  })

  for (const a of accs) {
    const id = `inet-${slug(label)}-${slug(a.name)}`
    if (docs.some((d) => d.id === id)) continue
    docs.push({
      id,
      titulo: `${label}: ${a.name}`,
      categoria: 'TÉCNICO',
      tipo: 'micro',
      seccionPortal: 'Somos Clave → Inconvenientes Internet FTTH-HFC',
      sinonimos: [a.name.toLowerCase(), label.toLowerCase(), slug(a.name).replace(/-/g, ' ')],
      contenido: a.body,
      fuente: 'somosclave-html-internet-ftth-hfc',
      enlace,
    })
  }
}

const file = `/**
 * Procedimiento: Inconvenientes Internet FTTH - HFC (Somos Clave ${sid})
 * Generado desde "Inconvenientes Internet FTTH - HFC.html"
 * Regenerar: node src/asistente/_extractInternetFtthHfc.mjs
 * Actualización referencia: ${modified || 'n/d'}
 */

export const DOCS_INTERNET_FTTH_HFC = ${JSON.stringify(docs, null, 2)}
`

fs.writeFileSync(outJs, file, 'utf8')
console.log('OK', docs.length, 'docs →', path.basename(outJs))
for (const d of docs.slice(0, 25)) console.log('-', d.id, '|', d.titulo, '|', d.contenido.length)
if (docs.length > 25) console.log('…', docs.length - 25, 'más')
