/**
 * Scraper Somos Clave vía Inbenta KM API (ANSWER_TEXT).
 * No necesita login portal: usa domain_key + api_key del JS público del sitio.
 *
 *   node scripts/scrape-somos-clave.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'src', 'asistente', 'somosClaveDump.json')

// Claves embebidas en knowledge.js del portal (públicas en el front)
const KM_JS = fs.readFileSync(path.join(__dirname, '_inbenta_knowledge.js'), 'utf8')
const API_KEY = [...KM_JS.matchAll(/'api_key':\s*'([^']+)'/g)].map((m) => m[1]).pop()
const DOMAIN_KEY = [...KM_JS.matchAll(/'domain_key':\s*'([^']+)'/g)].map((m) => m[1]).pop()
if (!API_KEY || !DOMAIN_KEY) throw new Error('No se pudieron leer api_key/domain_key de _inbenta_knowledge.js')

const CATALOG = [
  { id: '1265', q: 'actualizado/1265', nombre: 'PEDIDOS', categoria: 'General' },
  { id: '1058', q: 'actualizado/1058', nombre: 'TRASLADO DE SERVICIOS', categoria: 'General' },
  { id: '1326', q: 'actualizado/1326', nombre: 'INGRESO DE SOLICITUDES DE SERVICIO', categoria: 'General' },
  { id: '1220', q: 'actualizado/1220', nombre: 'ADMINISTRAR SOLICITUDES DE SERVICIOS', categoria: 'General' },
  { id: '1213', q: 'actualizado/1213', nombre: 'BAJA NO CURSADA', categoria: 'General' },
  { id: '1078', q: 'actualizado/1078', nombre: 'SUSPENSION VOLUNTARIA DE SERVICIOS', categoria: 'General' },
  { id: '1377', q: 'actualizado/1377', nombre: 'CANCELACION DE PORTABILIDAD', categoria: 'General' },
  { id: '1046', q: 'actualizado/1046', nombre: 'VENTA CON Y SIN PORTABILIDAD', categoria: 'General' },
  { id: '1215', q: 'transversal/1215', nombre: 'VALIDACIONES Y REVISION DE LA DEUDA EN LA VENTA', categoria: 'FACTURACIÓN' },
  { id: '1252', q: 'hogar/1252', nombre: 'DESCUENTOS DE DIAS SIN SERVICIO FIJO/HOGAR', categoria: 'FACTURACIÓN' },
  { id: '1079', q: 'retencion/1079', nombre: 'INGRESO DE RECLAMO', categoria: 'FACTURACIÓN' },
  { id: '1310', q: 'actualizado/1310', nombre: 'ENVÍO DE BOLETA', categoria: 'FACTURACIÓN' },
  { id: '1303', q: 'transversal/1303', nombre: 'INCONVENIENTE CON EL PAGO', categoria: 'FACTURACIÓN' },
  { id: '1240', q: 'hogar/1240', nombre: 'No Reconoce Cobros - Corte y Reposición', categoria: 'FACTURACIÓN' },
  { id: '1028', q: 'actualizado/1028', nombre: 'EXPLICACION DE BOLETA no reconoce cobro', categoria: 'FACTURACIÓN' },
  { id: '1233', q: 'hogar/1233', nombre: 'REAJUSTE IPC HOGAR', categoria: 'FACTURACIÓN' },
  { id: '1283', q: 'actualizado/1283', nombre: 'PAGO DUPLICADO', categoria: 'FACTURACIÓN' },
  { id: '1378', q: 'actualizado/1378', nombre: 'FLUJO DE INHIBICIÓN DE COBRANZA', categoria: 'FACTURACIÓN' },
  { id: '1167', q: 'actualizado/1167', nombre: 'DESCUENTO NO CARGADO', categoria: 'FACTURACIÓN' },
  { id: '1280', q: 'actualizado/1280', nombre: 'CICLOS DE FACTURACIÓN (DOM)', categoria: 'FACTURACIÓN' },
  { id: '1339', q: 'retencion/1339', nombre: 'PAC - PAT', categoria: 'FACTURACIÓN' },
  { id: '1156', q: 'actualizado/1156', nombre: 'CONSTANCIA', categoria: 'FACTURACIÓN' },
  { id: '1183', q: 'retencion/1183', nombre: 'COMO REVISAR LA DEUDA', categoria: 'FACTURACIÓN' },
  { id: '1024', q: 'actualizado/1024', nombre: 'POLITICAS DE ACREDITACION', categoria: 'FACTURACIÓN' },
  { id: '1035', q: 'movil/1035', nombre: 'Cambio de SIM Card Móvil', categoria: 'MOVIL' },
  { id: '1360', q: 'actualizado/1360', nombre: 'VISTA 360°', categoria: 'ANDES' },
  { id: '363', q: 'actualizado/363', nombre: 'INGRESO A BEC', categoria: 'ANDES' },
  { id: '1324', q: 'actualizado/1324', nombre: 'CREACIÓN DE CLIENTES', categoria: 'ANDES' },
  { id: '1323', q: 'actualizado/1323', nombre: 'BUSQUEDA DE CLIENTES EN ANDES', categoria: 'ANDES' },
  { id: '1312', q: 'actualizado/1312', nombre: 'TIPIFICACIONES', categoria: 'ANDES' },
  { id: '1054', q: 'actualizado/1054', nombre: 'GLOSARIO DE ANDES', categoria: 'ANDES' },
  { id: '1205', q: 'actualizado/1205', nombre: 'APP VTR PLAY', categoria: 'CLARO VTR WEB' },
  { id: '384', q: 'actualizado/384', nombre: 'VUELVE A INICIAR SESION EN HBO MAX', categoria: 'CLARO VTR WEB' },
  { id: '1044', q: 'actualizado/1044', nombre: 'APP VTR PLAY TV', categoria: 'CLARO VTR WEB' },
  { id: '1057', q: 'actualizado/1057', nombre: 'SUCURSAL VIRTUAL', categoria: 'CLARO VTR WEB' },
  { id: '1444', q: 'actualizado/1444', nombre: 'RECUPERAR CONTRASEÑA DE SUCURSAL VIRTUAL', categoria: 'CLARO VTR WEB' },
  { id: '1188', q: 'actualizado/1188', nombre: 'PROCEDIMIENTO TV HD CON RETORNO', categoria: 'TECNICO' },
  { id: '1235', q: 'actualizado/1235', nombre: 'MANUALES DE AUTOINSTALACION', categoria: 'TECNICO' },
  { id: '1459', q: 'actualizado/1459', nombre: 'DBOX LOCKED', categoria: 'TECNICO' },
  { id: '1229', q: 'actualizado/1229', nombre: 'MODELOS DE DBOX', categoria: 'TECNICO' },
  { id: '996', q: 'actualizado/996', nombre: 'INCONVENIENTES CON TELEVISION SMART (DBOX SMART)', categoria: 'TECNICO' },
  { id: '1052', q: 'actualizado/1052', nombre: 'INCONVENIENTES TELEFONIA FIJA HFC Y FTTH', categoria: 'TECNICO' },
  { id: '1200', q: 'actualizado/1200', nombre: 'FIBRA OPTICA FTTH', categoria: 'TECNICO' },
  { id: '1264', q: 'actualizado/1264', nombre: 'INCONVENIENTES EN SERVICIO VTR', categoria: 'TECNICO' },
  { id: '1216', q: 'actualizado/1216', nombre: 'DESCONFIGURACION DEL CONTROL REMOTO', categoria: 'TECNICO' },
  { id: '1036', q: 'actualizado/1036', nombre: 'VISITAS TECNICAS', categoria: 'TECNICO' },
  { id: '1041', q: 'actualizado/1041', nombre: 'PROTOCOLO V-SIGHT', categoria: 'TECNICO' },
  { id: '1232', q: 'actualizado/1232', nombre: 'CAMBIO DE TECNOLOGÍA A FTTH', categoria: 'TECNICO' },
  { id: '997', q: 'actualizado/997', nombre: 'INCONVENIENTES INTERNET FTTH / HFC', categoria: 'TECNICO' },
  { id: '1007', q: 'actualizado/1007', nombre: 'PLATAFORMAS DE STREAMING', categoria: 'OFRECIMIENTO' },
  { id: '1458', q: 'hogar/1458', nombre: 'OTT A LA CARTA/VENDER STREAMING INDIVIDUAL', categoria: 'OFRECIMIENTO' },
  { id: '1004', q: 'actualizado/1004', nombre: 'PLAN COMERCIAL', categoria: 'OFRECIMIENTO' },
  { id: '993', q: 'actualizado/993', nombre: 'DEVOLUCION DE EQUIPOS', categoria: 'INFORMATIVO PARA EL CLIENTE' },
  { id: '1193', q: 'empresa/1193', nombre: 'B2B Servicio de Internet Empresas', categoria: 'INFORMATIVO PARA EL ASESOR' },
  { id: '1387', q: 'actualizado/1387', nombre: 'ESTADOS DE LAS SOLICITUDES DE SERVICIOS', categoria: 'INFORMATIVO PARA EL ASESOR' },
  { id: '1166', q: 'actualizado/1166', nombre: 'PROTOCOLOS DE ATENCION (SPEECH)', categoria: 'INFORMATIVO PARA EL ASESOR' },
  { id: '1317', q: 'actualizado/1317', nombre: 'SIGUIENTE MEJOR ACCIÓN (SMA)', categoria: 'INFORMATIVO PARA EL ASESOR' },
  { id: '1148', q: 'actualizado/1148', nombre: 'NAVEGAR ENTRE CUENTAS', categoria: 'INFORMATIVO PARA EL ASESOR' },
  { id: '1020', q: 'transversal/1020', nombre: 'POLITICA DE VENTA DE SERVICIOS FIJOS', categoria: 'INFORMATIVO PARA EL ASESOR' },
  { id: '1321', q: 'actualizado/1321', nombre: 'ANULAR SOLICITUDES DE SERVICIO', categoria: 'TRANSFERENCIAS' },
]

function htmlToText(html) {
  if (!html) return ''
  let h = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|table)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
  return h.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim()
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function authInbenta() {
  const res = await fetch('https://api.inbenta.io/v1/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-inbenta-key': API_KEY,
      Origin: 'https://somosclave.cl',
      Referer: 'https://somosclave.cl/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({ domain_key: DOMAIN_KEY }),
  })
  if (!res.ok) throw new Error(`Auth Inbenta falló: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const accessToken = data.accessToken
  const knowledgeBase = (data.apis?.knowledge || '').replace(/\/$/, '')
  if (!knowledgeBase) throw new Error('No se obtuvo URL knowledge de Inbenta')
  console.log('Inbenta auth OK →', knowledgeBase)
  return { accessToken, knowledgeBase }
}

async function getContent(knowledgeBase, accessToken, id) {
  const res = await fetch(`${knowledgeBase}/v1/contents/${id}`, {
    headers: {
      Authorization: accessToken,
      'x-inbenta-key': API_KEY,
      'X-INBENTA-ENV': 'production',
      Origin: 'https://somosclave.cl',
      Referer: 'https://somosclave.cl/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  })
  if (!res.ok) {
    const t = await res.text()
    return { ok: false, error: `${res.status} ${t.slice(0, 200)}`, texto: '', titulo: '' }
  }
  const data = await res.json()
  const faq = data?.results?.[0] || data?.data?.results?.[0]
  if (!faq) return { ok: false, error: 'sin results', texto: '', titulo: '' }
  const answerHtml = faq.attributes?.ANSWER_TEXT || faq.attributes?.ANSWER || ''
  const title = faq.attributes?.TITLE || faq.title || ''
  const texto = htmlToText(answerHtml)
  return {
    ok: texto.length > 40,
    titulo: title,
    texto: texto.slice(0, 80000),
    error: texto.length > 40 ? undefined : 'ANSWER_TEXT vacío',
  }
}

async function main() {
  const { accessToken, knowledgeBase } = await authInbenta()
  const results = []
  for (let i = 0; i < CATALOG.length; i++) {
    const item = CATALOG[i]
    process.stdout.write(`[${i + 1}/${CATALOG.length}] ${item.id} ${item.nombre}… `)
    try {
      const row = await getContent(knowledgeBase, accessToken, item.id)
      console.log(row.ok ? `OK (${row.texto.length} chars)` : `FAIL ${row.error}`)
      results.push({
        ...item,
        enlace: `https://somosclave.cl/respuesta.php?q=${item.q}`,
        ok: row.ok,
        titulo: row.titulo,
        texto: row.texto,
        error: row.error,
      })
    } catch (e) {
      console.log('ERR', e.message)
      results.push({
        ...item,
        enlace: `https://somosclave.cl/respuesta.php?q=${item.q}`,
        ok: false,
        error: e.message,
        texto: '',
      })
    }
    await sleep(250)
  }

  const payload = {
    scrapedAt: new Date().toISOString(),
    source: 'inbenta-km',
    total: results.length,
    ok: results.filter((r) => r.ok).length,
    articles: results,
  }
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`\nGuardado: ${OUT}`)
  console.log(`OK ${payload.ok}/${payload.total}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
