import admin from 'firebase-admin'
import 'firebase-admin/firestore'
import fs from 'node:fs'
import { resolve } from 'node:path'

// === Cargar credenciales de servicio desde el archivo ===
const serviceAccountPath = resolve(process.cwd(), 'scripts', 'serviceAccountKey.json')
const rawContent = fs.readFileSync(serviceAccountPath, 'utf8')
const serviceAccount = JSON.parse(rawContent)

// Inicializar Firebase Admin SDK con credenciales de servicio
admin.initializeApp({
  credential: admin.cert(serviceAccount)
})

const db = admin.firestore()
console.log('✅ Admin SDK conectado correctamente')
console.log('📁 Proyecto:', serviceAccount.projectId)

// Función de ayuda para limpiar nombres
function limpiarNombre(s = '') {
  return String(s || '').trim().replace(/\s+/g, ' ')
}

// Extraer legajo buscando en la colección de asesores
async function extraerLegajo(nombre, coleccionAsesores) {
  const sinLegajo = nombre.replace(/\s*-\s*LEGAJO\s+.+$/i, '').trim()
  const nombreMayus = sinLegajo.toUpperCase()

  // Buscar en la lista proporcionada (que ya viene en mayúsculas con legajo)
  for (const a of coleccionAsesores || []) {
    const aNombre = a.nombre ? String(a.nombre).trim() : ''
    if (aNombre.toUpperCase() === nombreMayus) {
      return { nombre: sinLegajo, legajo: a.legajo || '' }
    }
  }
  // Devolver vacío si no encuentra
  return { nombre: sinLegajo, legajo: '' }
}

// Función principal
async function normalizarNoAceptaFibra() {
  console.log('=== Iniciando normalización de No acepta fibra ===\n')

  // 1. Cargar todos los asesores desde Firestore para tener el mapa de legajos
  console.log('Cargando colección "asesores"...')
  const asesoresSnap = await db.collection('asesores').get()
  const mapaAsesores = new Map()
  asesoresSnap.forEach(d => {
    const data = d.data() || {}
    const nombre = data.nombre ? limpiarNombre(String(data.nombre)) : ''
    const legajo = data.legajo ? String(data.legajo).trim() : ''
    if (nombre) {
      const clave = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
      mapaAsesores.set(clave, { nombre, legajo })
    }
  })
  console.log(`  Cargados ${mapaAsesores.size} asesores con legajo\n`)

  // 2. Leer todos los documentos de noAceptaFibra
  console.log('Leyendo colección "noAceptaFibra"...')
  const naSnap = await db.collection('noAceptaFibra').get()

  let actualizados = 0
  let sinCambios = 0
  let sinLegajoEncontrado = 0
  let errores = 0

  const lote = db.batch()
  let ops = 0

  for (const d of naSnap.docs) {
    try {
      const data = d.data() || {}
      const asesorRaw = data.asesor ? limpiarNombre(String(data.asesor)) : ''

      if (!asesorRaw) {
        sinCambios++
        continue
      }

      // Buscar legajo en la lista de asesores
      const { nombre: nombreLimpio, legajo: legajoEncontrado } = await extraerLegajo(
        asesorRaw,
        Array.from(mapaAsesores.values())
      )

      // Determinar el nuevo nombre (siempre mayúsculas, sin sufijo)
      const nombreNuevo = nombreLimpio.toUpperCase()

      // Determinar el legajo a guardar: el encontrado, o el que ya haya, o vacío
      const legajoActual = data.legajoAsesor ? limpiarNombre(String(data.legajoAsesor)) : ''
      const legajoGuardar = legajoEncontrado || legajoActual || ''

      // Verificar si realmente hay cambio
      const cambioNombre = data.asesor !== nombreNuevo
      const cambioLegajo = (!legajoActual || limpiarNombre(legijoActual) !== limpiarNombre(legajoGuardar))

      if (!cambioNombre && !cambioLegajo) {
        sinCambios++
        continue
      }

      // Actualizar documento
      lote.update(d.ref, {
        asesor: nombreNuevo,
        legajoAsesor: legajoGuardar,
        actualizado: new Date().toISOString(),
      })
      console.log(`OK: [${d.id}] "${asesorRaw}" -> "${nombreNuevo}" (legajo: ${legajoGuardar || '—'})`)
      actualizados++
      ops++

      if (ops >= 500) {
        await lote.commit()
        ops = 0
        console.log(`... lote de ${ops} operaciones pendientes`)
      }
    } catch (e) {
      console.error(`ERR en ${d.id}:`, e?.message || e)
      errores++
    }
  }

  // Commit final
  if (ops > 0) {
    await lote.commit()
  }

  console.log(`\n=== Resumen ===`)
  console.log(`Actualizados: ${actualizados}`)
  console.log(`Sin cambios: ${sinCambios}`)
  console.log(`Sin legajo encontrado: ${sinLegajoEncontrado}`)
  console.log(`Errores: ${errores}`)
  console.log('\n¡Migración completada!')
}

// Ejecutar
normalizarNoAceptaFibra()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('Error fatal:', e)
    process.exit(1)
  })