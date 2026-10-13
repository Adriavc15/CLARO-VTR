import fs from 'fs'

const t = fs.readFileSync(new URL('./_inbenta_knowledge.js', import.meta.url), 'utf8')
const apiKey = [...t.matchAll(/'api_key':\s*'([^']+)'/g)].map((m) => m[1]).pop()
const domainKey = [...t.matchAll(/'domain_key':\s*'([^']+)'/g)].map((m) => m[1]).pop()

const res = await fetch('https://api.inbenta.io/v1/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-inbenta-key': apiKey,
    Origin: 'https://somosclave.cl',
    Referer: 'https://somosclave.cl/respuesta.php?q=actualizado/1323',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  },
  body: JSON.stringify({ domain_key: domainKey }),
})
console.log(res.status, await res.text())
