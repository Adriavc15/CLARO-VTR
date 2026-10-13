/**
 * Inyectable / CDP: descarga FAQs por lote vía iframes same-origin.
 * Guarda cada uno en window.__SC_BATCH para extraer después.
 */
export const BATCH_EXTRACTOR = `
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  // ids come from argument embedded below
  const START = __START__;
  const LIMIT = __LIMIT__;
  const missing = await fetch('http://localhost:5173/missing_ids.json').then((r) => r.json());
  const slice = missing.slice(START, START + LIMIT);
  const out = [];
  for (const it of slice) {
    const row = await new Promise((resolve) => {
      const ifr = document.createElement('iframe');
      ifr.style.cssText = 'position:fixed;left:-9999px;width:900px;height:700px;opacity:0;pointer-events:none';
      ifr.src = 'https://somosclave.cl/respuesta.php?q=' + encodeURIComponent(it.q).replace(/%2F/g, '/');
      // fix: don't encode slash
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
          } else if (Date.now() - t0 > 14000) {
            clearInterval(timer);
            resolve({ id: it.id, q: it.q, ok: false, err: 'timeout', html: '', title: '' });
            ifr.remove();
          }
        } catch (e) {
          if (Date.now() - t0 > 14000) {
            clearInterval(timer);
            resolve({ id: it.id, ok: false, err: String(e && e.message || e), html: '', title: '' });
            ifr.remove();
          }
        }
      }, 350);
    });
    out.push(row);
    await wait(150);
  }
  window.__SC_BATCH = out;
  return {
    start: START,
    limit: LIMIT,
    done: out.length,
    ok: out.filter((x) => x.ok && x.html && x.html.length > 200).length,
    ids: out.map((x) => x.id + (x.ok ? ':ok' : ':fail')),
  };
})()
`
