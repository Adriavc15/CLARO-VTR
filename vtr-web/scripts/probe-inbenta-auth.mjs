import fs from 'fs'

const t = fs.readFileSync(new URL('./_inbenta_knowledge.js', import.meta.url), 'utf8')
const apiKey = [...t.matchAll(/'api_key':\s*'([^']+)'/g)].map((m) => m[1]).pop()
const domainKey = [...t.matchAll(/'domain_key':\s*'([^']+)'/g)].map((m) => m[1]).pop()

const attempts = [
  { body: { domain_key: domainKey }, headers: { 'x-inbenta-key': apiKey } },
  { body: { domainKey: domainKey }, headers: { 'x-inbenta-key': apiKey } },
  { body: { domain_key: domainKey }, headers: { 'x-inbenta-key': apiKey, 'X-INBENTA-ENV': 'production' } },
  { body: { domain_key: domainKey }, headers: { Authorization: apiKey } },
]

for (const [i, a] of attempts.entries()) {
  const res = await fetch('https://api.inbenta.io/v1/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...a.headers },
    body: JSON.stringify(a.body),
  })
  const text = await res.text()
  console.log(i, res.status, text.slice(0, 180))
}
