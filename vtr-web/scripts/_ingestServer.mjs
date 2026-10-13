/**
 * Servidor local para recibir FAQs desde el browser (misma máquina)
 * y persistir html+imágenes en public/
 *
 * node scripts/_ingestServer.mjs
 */
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { ingestOne } = await import(pathToFileURL(path.join(__dirname, 'bulkDownloadSomosClave.mjs')).href)

const PORT = 8799
const LOG = path.join(__dirname, '_ingest_log.jsonl')
const progress = { ok: 0, fail: 0, last: null }

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(progress))
    return
  }

  if (req.method === 'POST' && req.url === '/ingest') {
    try {
      const raw = await readBody(req)
      const data = JSON.parse(raw)
      if (!data?.id || !data?.html) throw new Error('id/html requeridos')
      const r = await ingestOne({
        id: String(data.id),
        title: data.title || '',
        html: data.html,
        enlace: data.enlace || '',
        categoriaPath: data.categoriaPath || (data.q || '').split('/')[0] || 'actualizado',
      })
      progress.ok++
      progress.last = { id: data.id, ...r }
      fs.appendFileSync(LOG, JSON.stringify({ t: Date.now(), ok: true, ...r }) + '\n')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, ...r }))
    } catch (e) {
      progress.fail++
      progress.last = { error: e.message }
      fs.appendFileSync(LOG, JSON.stringify({ t: Date.now(), ok: false, error: e.message }) + '\n')
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: e.message }))
    }
    return
  }

  if (req.method === 'POST' && req.url === '/ingest-batch') {
    try {
      const raw = await readBody(req)
      const arr = JSON.parse(raw)
      if (!Array.isArray(arr)) throw new Error('se esperaba array')
      const results = []
      for (const data of arr) {
        try {
          if (!data?.ok || !data?.html || data.html.length < 200) {
            progress.fail++
            results.push({ id: data?.id, ok: false, error: 'sin html' })
            continue
          }
          const r = await ingestOne({
            id: String(data.id),
            title: data.title || '',
            html: data.html,
            enlace: data.enlace || `https://somosclave.cl/respuesta.php?q=${data.q}`,
            categoriaPath: data.categoriaPath || (data.q || '').split('/')[0] || 'actualizado',
          })
          progress.ok++
          progress.last = { id: data.id, ...r }
          results.push({ ok: true, ...r })
          fs.appendFileSync(LOG, JSON.stringify({ t: Date.now(), ok: true, ...r }) + '\n')
        } catch (e) {
          progress.fail++
          results.push({ id: data?.id, ok: false, error: e.message })
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, results, progress }))
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: false, error: e.message }))
    }
    return
  }

  res.writeHead(404)
  res.end('not found')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Ingest server http://127.0.0.1:${PORT}`)
})
