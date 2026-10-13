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

await req('https://somosclave.cl/login/validar_usuario.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ usuario: USER, password: PASS, btn_login: '' }).toString(),
})

const files = [
  'https://somosclave.cl/js/inbenta/knowledge.js?version=28022025.2',
  'https://somosclave.cl/js/inbenta-fix-072026.js?v=1786025990',
]

for (const u of files) {
  const r = await req(u)
  const name = u.includes('knowledge') ? 'knowledge' : 'search'
  fs.writeFileSync(new URL(`./_inbenta_${name}.js`, import.meta.url), r.text)
  console.log(name, 'len', r.text.length)

  const apiUrls = [...r.text.matchAll(/https?:\/\/[a-zA-Z0-9._\-\/]+/g)].map((m) => m[0])
  console.log('urls', [...new Set(apiUrls)].slice(0, 30))

  const keys = [...r.text.matchAll(/\b(apiKey|accessToken|domainKey|SDKDomain|printFAQ|setupFAQs|getContent|contents)\b/g)].map(
    (m) => m[1]
  )
  console.log('keys', [...new Set(keys)])

  // find printFAQ function body start
  const idx = r.text.indexOf('printFAQ')
  if (idx >= 0) console.log('printFAQ context:\n', r.text.slice(idx, idx + 800))
  const idx2 = r.text.indexOf('setupFAQs')
  if (idx2 >= 0) console.log('setupFAQs context:\n', r.text.slice(idx2, idx2 + 800))
}
