import fs from 'node:fs'

// Uso: node scripts/fixMojibake.mjs <archivo> [--apply]
const file = process.argv[2]
const apply = process.argv.includes('--apply')
if (!file) {
  console.error('Falta el archivo')
  process.exit(1)
}

const text = fs.readFileSync(file, 'utf8')

// Mapa char -> byte usando windows-1252 (para invertir el mojibake)
const dec = new TextDecoder('windows-1252')
const charToByte = new Map()
for (let b = 0x00; b <= 0xff; b++) {
  const ch = dec.decode(Uint8Array.of(b))
  if (ch === '\uFFFD') continue
  if (!charToByte.has(ch)) charToByte.set(ch, b)
}

function tryDecode(s, i) {
  const b0 = charToByte.get(s[i])
  if (b0 === undefined || b0 < 0xc2 || b0 > 0xf4) return null
  const len = b0 < 0xe0 ? 2 : b0 < 0xf0 ? 3 : 4
  const bytes = []
  for (let k = 0; k < len; k++) {
    const b = charToByte.get(s[i + k])
    if (b === undefined) return null
    if (k > 0 && (b < 0x80 || b > 0xbf)) return null
    bytes.push(b)
  }
  try {
    const out = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes))
    return { len, out }
  } catch {
    return null
  }
}

let result = ''
const found = []
let line = 1
let i = 0
while (i < text.length) {
  const r = tryDecode(text, i)
  if (r) {
    const src = text.slice(i, i + r.len)
    const cp = r.out.codePointAt(0)
    found.push({
      line,
      from: [...src].map((c) => c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' '),
      to: r.out,
      toCp: cp.toString(16).toUpperCase(),
    })
    result += r.out
    for (let k = 0; k < r.len; k++) if (text[i + k] === '\n') line++
    i += r.len
  } else {
    if (text[i] === '\n') line++
    result += text[i]
    i++
  }
}

console.log('Reemplazos encontrados:')
for (const f of found) {
  console.log(`  L${f.line}  U+${f.from}  ->  ${JSON.stringify(f.to)} (U+${f.toCp})`)
}

if (apply) {
  fs.writeFileSync(file, result, 'utf8')
  console.log('\nArchivo actualizado.')
} else {
  console.log('\n(modo prueba: no se escribió nada; usa --apply)')
}
