import fs from 'fs'

const t = fs.readFileSync(new URL('./_inbenta_knowledge.js', import.meta.url), 'utf8')
const apiKeys = [...t.matchAll(/'api_key':\s*'([^']+)'/g)].map((m) => m[1])
const domainKeys = [...t.matchAll(/'domain_key':\s*'([^']+)'/g)].map((m) => m[1])
// also commented ones
const apiCommented = [...t.matchAll(/\/\/'api_key':\s*'([^']+)'/g)].map((m) => m[1])
const domainCommented = [...t.matchAll(/\/\/'domain_key':\s*'([^']+)'/g)].map((m) => m[1])

const pairs = [
  ['active', apiKeys.at(-1), domainKeys.at(-1)],
  ['commented', apiCommented[0] || apiKeys[0], domainCommented[0] || domainKeys[0]],
  ['mix1', apiKeys.at(-1), domainCommented[0]],
  ['mix2', apiCommented[0], domainKeys.at(-1)],
]

for (const [label, apiKey, domainKey] of pairs) {
  if (!apiKey || !domainKey) continue
  for (const headers of [
    { 'x-inbenta-key': apiKey },
    { 'x-inbenta-key': apiKey, Authorization: `Bearer ${apiKey}` },
    { 'x-inbenta-key': apiKey, Authorization: apiKey },
  ]) {
    const res = await fetch('https://api.inbenta.io/v1/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ domain_key: domainKey }),
    })
    const text = await res.text()
    console.log(label, res.status, Object.keys(headers).join('+'), text.slice(0, 120))
  }
}
