import fs from 'fs'

const USER = process.env.SOMOS_CLAVE_USER
const PASS = process.env.SOMOS_CLAVE_PASS
const jar = new Map()

function store(res) {
  const raw = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []
  const single = res.headers.get('set-cookie')
  for (const c of raw.length ? raw : single ? [single] : []) {
    const part = c.split(';')[0]
    const i = part.indexOf('=')
    if (i > 0) jar.set(part.slice(0, i), part.slice(i + 1))
  }
}

function cookie() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

async function req(url, opts = {}) {
  const headers = { 'User-Agent': 'Mozilla/5.0', ...(opts.headers || {}) }
  if (jar.size) headers.Cookie = cookie()
  const res = await fetch(url, { ...opts, headers, redirect: 'manual' })
  store(res)
  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const loc = res.headers.get('location')
    if (loc) {
      const next = loc.startsWith('http') ? loc : new URL(loc, url).href
      return req(next, { method: 'GET' })
    }
  }
  return { status: res.status, text: await res.text() }
}

const body = new URLSearchParams({ usuario: USER, password: PASS, btn_login: '' })
await req('https://somosclave.cl/login/validar_usuario.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: body.toString(),
})

const r = await req('https://somosclave.cl/respuesta.php?q=actualizado/1323')
fs.writeFileSync(new URL('./_sample_respuesta.html', import.meta.url), r.text)
console.log('status', r.status, 'len', r.text.length)

const urls = [...r.text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1])
console.log(
  'php urls',
  urls.filter((u) => /\.php|ajax|contenido|articulo|json/i.test(u)).slice(0, 50)
)
console.log('iframes', [...r.text.matchAll(/<iframe[\s\S]*?>/gi)].map((m) => m[0]).slice(0, 10))

const scripts = [...r.text.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)].map((m) => m[1])
console.log('script srcs', scripts)

// inline script snippets mentioning load/ajax
const inline = [...r.text.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
for (const s of inline) {
  if (/ajax|load|respuesta|actualizado|fetch|q=/i.test(s)) {
    console.log('--- inline ---')
    console.log(s.slice(0, 1500))
  }
}
