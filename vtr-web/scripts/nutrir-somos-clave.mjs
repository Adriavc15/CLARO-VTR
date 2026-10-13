/**
 * Nutre apex_aprendizaje con extractos de Somos Clave (create-only).
 * Uso: node scripts/nutrir-somos-clave.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const firebaseConfig = {
  apiKey: 'AIzaSyBTS2289cU0WwQQH9X6m2r0DdgqAgVAK0I',
  authDomain: 'vtrclaroo-3c572.firebaseapp.com',
  projectId: 'vtrclaroo-3c572',
  storageBucket: 'vtrclaroo-3c572.firebasestorage.app',
  messagingSenderId: '417392161995',
  appId: '1:417392161995:web:3301a4bb068814a497974e',
}

const COL = 'apex_aprendizaje'
const MAX = 250

function htmlATexto(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<\/td>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/Contraseña:\s*\S+/gi, 'Contraseña: [consultar con supervisor]')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

const raw = JSON.parse(fs.readFileSync(path.join(root, 'public/somosclave-contenidos.json'), 'utf8'))
const list = (Array.isArray(raw) ? raw : raw.items || raw.docs || [])
  .map((a) => {
    const id = String(a.id || a.scId || '').trim()
    const titulo = String(a.nombre || a.titulo || a.title || '').replace(/\s+/g, ' ').trim()
    let body = String(a.texto || a.contenido || a.body || '').trim()
    if (!body || body.length < 40) body = htmlATexto(a.html)
    return { id, titulo, body }
  })
  .filter((a) => /^\d+$/.test(a.id) && a.titulo.length >= 8 && a.body.length >= 40)
  .slice(0, MAX)

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

let creados = 0
let omitidos = 0
let errores = 0

console.log(`Nutriendo Somos Clave → ${COL} (${list.length} artículos)…`)
for (const a of list) {
  const id = `scseed_${a.id}`.slice(0, 100)
  const ref = doc(db, COL, id)
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      omitidos += 1
      continue
    }
    await setDoc(ref, {
      pregunta: a.titulo.slice(0, 400),
      respuesta: a.body.slice(0, 1200),
      tema: 'somosclave',
      tono: 'respetuoso',
      util: true,
      calidad: 'entrenable',
      clientId: 'seed_somos_clave',
      fuente: 'somosclave-km',
      scId: a.id,
      creadoEn: serverTimestamp(),
    })
    creados += 1
    if (creados % 25 === 0) process.stdout.write(`\r  creados ${creados}…`)
  } catch (e) {
    errores += 1
    console.error(`\nError ${id}:`, e?.code || e?.message || e)
  }
}

console.log(`\nListo. Creados: ${creados} · Ya existían: ${omitidos} · Errores: ${errores}`)
process.exit(errores ? 1 : 0)
