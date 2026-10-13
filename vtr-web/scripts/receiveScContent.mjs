import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, '_sc-content-full.json')

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  if (req.method === 'POST' && req.url === '/sc-content') {
    const chunks = []
    for await (const c of req) chunks.push(c)
    const buf = Buffer.concat(chunks)
    fs.writeFileSync(out, buf)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, bytes: buf.length }))
    setTimeout(() => server.close(), 200)
    return
  }
  res.writeHead(404)
  res.end('not found')
})

server.listen(8787, '127.0.0.1', () => {
  console.log('listening 127.0.0.1:8787 →', out)
})
