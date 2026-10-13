import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { STREAM_OPTIONS } from './planesSeed.js'

export const COL_STREAMING = 'catalogo_streaming'

export function idStream(srcOrId) {
  const s = String(srcOrId || '')
  if (!s.includes('/')) return s.replace(/\.[a-z0-9]+$/i, '')
  return s
    .replace(/^\/stream\//, '')
    .replace(/\.[a-z0-9]+$/i, '')
}

export function mezclarCatalogo(docs = []) {
  const byId = new Map(docs.map((d) => [String(d.id), d]))
  return STREAM_OPTIONS.map((s) => {
    const id = idStream(s.src)
    const live = byId.get(id)
    const src = String(live?.src || s.src).trim() || s.src
    return {
      id,
      name: String(live?.name || s.name).trim() || s.name,
      src,
      srcKey: s.src,
      srcDefault: s.src,
    }
  })
}

export function mapaDesdeCatalogo(plataformas = []) {
  const srcDe = {}
  const nombreDe = {}
  for (const p of plataformas) {
    srcDe[p.srcKey] = p.src
    nombreDe[p.srcKey] = p.name
    if (p.src && p.src !== p.srcKey) {
      srcDe[p.src] = p.src
      nombreDe[p.src] = p.name
    }
  }
  return { srcDe, nombreDe }
}

export function suscribirCatalogoStreaming(db, onData) {
  if (!db) {
    onData(mezclarCatalogo())
    return () => {}
  }
  return onSnapshot(
    collection(db, COL_STREAMING),
    (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      onData(mezclarCatalogo(docs))
    },
    () => onData(mezclarCatalogo())
  )
}

export async function guardarPlataformaStreaming(db, { id, name, src, srcKey, srcDefault }) {
  if (!db) throw new Error('Firestore no disponible')
  const pid = String(id || idStream(srcKey || src)).trim()
  if (!pid) throw new Error('Falta la plataforma')
  const payload = {
    id: pid,
    name: String(name || pid).trim(),
    src: String(src || srcDefault || '').trim(),
    srcKey: srcKey || `/stream/${pid}.png`,
    srcDefault: srcDefault || `/stream/${pid}.png`,
    actualizadoEn: new Date().toISOString(),
  }
  await setDoc(doc(db, COL_STREAMING, pid), payload, { merge: true })
  return payload
}

const VACIO = { plataformas: mezclarCatalogo(), srcDe: {}, nombreDe: {}, imgDe: (s) => s, nomDe: (s) => s }

export const StreamCatalogContext = createContext(VACIO)

export function useStreamCatalog() {
  return useContext(StreamCatalogContext)
}

export function useCatalogoStreaming(db) {
  const [plataformas, setPlataformas] = useState(() => mezclarCatalogo())
  useEffect(() => suscribirCatalogoStreaming(db, setPlataformas), [db])
  return useMemo(() => {
    const { srcDe, nombreDe } = mapaDesdeCatalogo(plataformas)
    return {
      plataformas,
      srcDe,
      nombreDe,
      imgDe: (src) => srcDe[src] || src,
      nomDe: (src) => nombreDe[src] || src,
    }
  }, [plataformas])
}

export function StreamCatalogProvider({ db, children }) {
  const value = useCatalogoStreaming(db)
  return React.createElement(StreamCatalogContext.Provider, { value }, children)
}
