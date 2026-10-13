(async () => {
  const items = [{"id":"1470","q":"actualizado/1470","enlace":"https://somosclave.cl/respuesta.php?q=actualizado/1470","nombre":"Plataforma Reagendamiento De Visitas a Terreno"},{"id":"1472","q":"actualizado/1472","enlace":"https://somosclave.cl/respuesta.php?q=actualizado/1472","nombre":"Ventas Fraudulentas Por Redes Sociales"}];
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
})()