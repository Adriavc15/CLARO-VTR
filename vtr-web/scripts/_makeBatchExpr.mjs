/**
 * Genera expresión CDP para un lote y la deja en _cdp_batch_expr.js
 * node scripts/_makeBatchExpr.mjs [start] [limit] [listFile]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const listFile = process.argv[4] || path.join(__dirname, '_missing_ids.json')
const missing = JSON.parse(fs.readFileSync(listFile, 'utf8'))
const start = Number(process.argv[2] || 0)
const limit = Number(process.argv[3] || 8)
const slice = missing.slice(start, start + limit)

const expr = `(async () => {
  const items = ${JSON.stringify(slice.map((x) => ({ id: x.id, q: x.q, enlace: x.enlace, nombre: x.nombre })))};
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = [];
  for (const it of items) {
    const row = await new Promise((resolve) => {
      const ifr = document.createElement('iframe');
      ifr.style.cssText = 'position:fixed;left:-9999px;width:900px;height:700px;opacity:0;pointer-events:none';
      ifr.src = 'https://somosclave.cl/respuesta.php?q=' + it.q;
      document.body.appendChild(ifr);
      const t0 = Date.now();
      const timer = setInterval(() => {
        try {
          const doc = ifr.contentDocument;
          const faq = doc && doc.querySelector('#faq-content');
          if (faq && faq.innerHTML.length > 200) {
            clearInterval(timer);
            resolve({
              id: it.id,
              q: it.q,
              enlace: it.enlace,
              categoriaPath: (it.q || '').split('/')[0] || 'actualizado',
              title: (doc.querySelector('#faq-title')?.innerText || it.nombre || '').trim(),
              html: faq.innerHTML,
              ok: true,
            });
            ifr.remove();
          } else if (Date.now() - t0 > 16000) {
            clearInterval(timer);
            resolve({ id: it.id, q: it.q, ok: false, err: 'timeout', html: '', title: '' });
            ifr.remove();
          }
        } catch (e) {
          if (Date.now() - t0 > 16000) {
            clearInterval(timer);
            resolve({ id: it.id, ok: false, err: String((e && e.message) || e), html: '', title: '' });
            ifr.remove();
          }
        }
      }, 350);
    });
    out.push(row);
    await wait(80);
  }
  return out;
})()`

fs.writeFileSync(path.join(__dirname, '_cdp_batch_expr.js'), expr, 'utf8')
console.log(JSON.stringify({ start, limit, count: slice.length, ids: slice.map((x) => x.id) }))
