import React, { useState, useEffect } from 'react'

// Cache en memoria para DataURLs procesadas con fondo transparente
const cacheStickerLimpio = new Map()

/**
 * Detecta si un píxel coincide con el color de fondo objetivo (blanco o negro)
 * dentro de una tolerancia segura.
 */
function coincideColor(r, g, b, a, objetivo, tol = 36) {
  // Si ya es transparente, no es fondo sólido
  if (a < 35) return false

  if (objetivo === 'blanco') {
    // Es blanco o casi blanco: r, g, b altos y similares entre sí (escala de grises brillante)
    const minVal = 255 - tol
    return (
      r >= minVal &&
      g >= minVal &&
      b >= minVal &&
      Math.abs(r - g) <= 24 &&
      Math.abs(g - b) <= 24 &&
      Math.abs(r - b) <= 24
    )
  }

  if (objetivo === 'negro') {
    // Es negro o casi negro: r, g, b bajos y similares entre sí (escala de grises oscura)
    return (
      r <= tol &&
      g <= tol &&
      b <= tol &&
      Math.abs(r - g) <= 18 &&
      Math.abs(g - b) <= 18 &&
      Math.abs(r - b) <= 18
    )
  }

  return false
}

/**
 * Remueve el fondo plano perimetral de un canvas usando BFS Flood-Fill
 * empezando únicamente desde los bordes exteriores de la imagen.
 * De esta forma NUNCA borra detalles blancos o negros internos (como ojos, dientes o ropa blanca).
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @returns {boolean} true si se limpió fondo, false si no fue necesario
 */
export function limpiarFondoPlanoPerimetro(canvas, ctx, width, height) {
  if (!canvas || !ctx || width <= 2 || height <= 2) return false

  let imgData
  try {
    imgData = ctx.getImageData(0, 0, width, height)
  } catch {
    // Posible bloqueo CORS si es imagen remota no permitida
    return false
  }

  const { data } = imgData
  const totalPixeles = width * height

  // 1. Muestrear los 4 bordes y esquinas para determinar si ya es transparente
  // o si tiene fondo blanco / negro sólido.
  const esquinas = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ]

  let esquinasTransparentes = 0
  let esquinasBlancas = 0
  let esquinasNegras = 0

  for (const [x, y] of esquinas) {
    const idx = (y * width + x) * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    const a = data[idx + 3]

    if (a < 35) esquinasTransparentes++
    else if (coincideColor(r, g, b, a, 'blanco', 42)) esquinasBlancas++
    else if (coincideColor(r, g, b, a, 'negro', 35)) esquinasNegras++
  }

  // Si la mayoría de las 4 esquinas ya son transparentes, el PNG ya es transparente
  if (esquinasTransparentes >= 3) {
    return false
  }

  // Muestreo perimetral
  let bordeBlanco = 0
  let bordeNegro = 0
  let bordeTransparente = 0
  let totalMuestras = 0

  const paso = Math.max(1, Math.floor(Math.min(width, height) / 25))
  for (let x = 0; x < width; x += paso) {
    for (const y of [0, height - 1]) {
      const idx = (y * width + x) * 4
      const a = data[idx + 3]
      if (a < 35) bordeTransparente++
      else if (coincideColor(data[idx], data[idx + 1], data[idx + 2], a, 'blanco', 42)) bordeBlanco++
      else if (coincideColor(data[idx], data[idx + 1], data[idx + 2], a, 'negro', 35)) bordeNegro++
      totalMuestras++
    }
  }
  for (let y = 0; y < height; y += paso) {
    for (const x of [0, width - 1]) {
      const idx = (y * width + x) * 4
      const a = data[idx + 3]
      if (a < 35) bordeTransparente++
      else if (coincideColor(data[idx], data[idx + 1], data[idx + 2], a, 'blanco', 42)) bordeBlanco++
      else if (coincideColor(data[idx], data[idx + 1], data[idx + 2], a, 'negro', 35)) bordeNegro++
      totalMuestras++
    }
  }

  if (totalMuestras === 0) return false

  // Si ya tiene más del 40% del perímetro transparente, no interferir
  if (bordeTransparente / totalMuestras > 0.4) {
    return false
  }

  let objetivo = null
  if (esquinasBlancas >= 2 || bordeBlanco / totalMuestras > 0.35) {
    objetivo = 'blanco'
  } else if (esquinasNegras >= 2 || bordeNegro / totalMuestras > 0.35) {
    objetivo = 'negro'
  }

  if (!objetivo) return false

  const tolerancia = objetivo === 'blanco' ? 44 : 32

  // 2. BFS desde el perímetro exterior
  const visitado = new Uint8Array(totalPixeles)
  const cola = []

  // Insertar todos los píxeles del perímetro exterior que coincidan con el objetivo
  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const pos = y * width + x
      const idx = pos * 4
      if (
        !visitado[pos] &&
        coincideColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], objetivo, tolerancia)
      ) {
        visitado[pos] = 1
        cola.push(pos)
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (const x of [0, width - 1]) {
      const pos = y * width + x
      const idx = pos * 4
      if (
        !visitado[pos] &&
        coincideColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], objetivo, tolerancia)
      ) {
        visitado[pos] = 1
        cola.push(pos)
      }
    }
  }

  if (cola.length === 0) return false

  let head = 0
  while (head < cola.length) {
    const pos = cola[head++]
    const x = pos % width
    const y = Math.floor(pos / width)

    // Convertir el píxel en transparente
    const idx = pos * 4
    data[idx + 3] = 0

    // Explorar los 4 vecinos
    // Arriba
    if (y > 0) {
      const nPos = pos - width
      if (!visitado[nPos]) {
        visitado[nPos] = 1
        const nIdx = nPos * 4
        if (
          coincideColor(
            data[nIdx],
            data[nIdx + 1],
            data[nIdx + 2],
            data[nIdx + 3],
            objetivo,
            tolerancia
          )
        ) {
          cola.push(nPos)
        }
      }
    }
    // Abajo
    if (y < height - 1) {
      const nPos = pos + width
      if (!visitado[nPos]) {
        visitado[nPos] = 1
        const nIdx = nPos * 4
        if (
          coincideColor(
            data[nIdx],
            data[nIdx + 1],
            data[nIdx + 2],
            data[nIdx + 3],
            objetivo,
            tolerancia
          )
        ) {
          cola.push(nPos)
        }
      }
    }
    // Izquierda
    if (x > 0) {
      const nPos = pos - 1
      if (!visitado[nPos]) {
        visitado[nPos] = 1
        const nIdx = nPos * 4
        if (
          coincideColor(
            data[nIdx],
            data[nIdx + 1],
            data[nIdx + 2],
            data[nIdx + 3],
            objetivo,
            tolerancia
          )
        ) {
          cola.push(nPos)
        }
      }
    }
    // Derecha
    if (x < width - 1) {
      const nPos = pos + 1
      if (!visitado[nPos]) {
        visitado[nPos] = 1
        const nIdx = nPos * 4
        if (
          coincideColor(
            data[nIdx],
            data[nIdx + 1],
            data[nIdx + 2],
            data[nIdx + 3],
            objetivo,
            tolerancia
          )
        ) {
          cola.push(nPos)
        }
      }
    }
  }

  // 3. Suavizado en el borde (antialiasing para eliminar halos residuales blancos o negros)
  for (let i = 0; i < cola.length; i++) {
    const pos = cola[i]
    const x = pos % width
    const y = Math.floor(pos / width)

    const vecinos = [
      y > 0 ? pos - width : -1,
      y < height - 1 ? pos + width : -1,
      x > 0 ? pos - 1 : -1,
      x < width - 1 ? pos + 1 : -1,
    ]

    for (const vPos of vecinos) {
      if (vPos !== -1 && data[vPos * 4 + 3] > 0) {
        const vIdx = vPos * 4
        const vr = data[vIdx]
        const vg = data[vIdx + 1]
        const vb = data[vIdx + 2]
        if (coincideColor(vr, vg, vb, 255, objetivo, tolerancia + 20)) {
          data[vIdx + 3] = Math.round(data[vIdx + 3] * 0.35)
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return true
}

/**
 * Solo los PNG admiten limpieza de fondo real. Cualquier otro formato (JPEG,
 * GIF, WebP, AVIF) se muestra tal cual: quitarle el fondo destruiría la foto y
 * en el caso de GIF/WebP animado se perdería la animación al re-codificar.
 *
 * Ojo: las URLs sí traen extensión porque los stickers se suben a imgbb y se
 * sirven desde i.ibb.co (`.../nombre.webp`). Por eso `esPngTransparente`
 * devuelve `false` para `.webp`: el fondo ya se limpió en el canvas antes de
 * subir, y volver a pasarlo por aquí aplastaría la transparencia.
 */
export function esPngTransparente(url) {
  if (!url || typeof url !== 'string') return false
  if (/^data:image\/png[;,]/i.test(url)) return true
  if (/\.(gif|webp|jpe?g|avif)(?:[?#]|$)/i.test(url)) return false
  return /\.png(?:[?#]|$)/i.test(url)
}

/** ¿La URL es un GIF (o APNG), es decir un sticker animado? */
export { esStickerAnimado } from './messengerStickers'

/**
 * Carga una imagen, remueve cualquier fondo sólido perimetral (blanco o negro)
 * y devuelve una URL con fondo transparente (DataURL o la original si no cambió).
 */
export function procesarStickerTransparente(url) {
  if (!url || typeof url !== 'string') return Promise.resolve(url)
  if (!esPngTransparente(url)) return Promise.resolve(url)
  if (cacheStickerLimpio.has(url)) {
    return Promise.resolve(cacheStickerLimpio.get(url))
  }

  const esDataUrl = url.startsWith('data:')

  return new Promise((resolve) => {
    const img = new Image()
    if (!esDataUrl) {
      img.crossOrigin = 'anonymous'
    }

    img.onload = () => {
      try {
        const { naturalWidth: w, naturalHeight: h } = img
        if (!w || !h) {
          cacheStickerLimpio.set(url, url)
          resolve(url)
          return
        }

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          cacheStickerLimpio.set(url, url)
          resolve(url)
          return
        }

        ctx.drawImage(img, 0, 0, w, h)
        const limpiado = limpiarFondoPlanoPerimetro(canvas, ctx, w, h)
        if (limpiado) {
          let limpia = ''
          try {
            limpia = canvas.toDataURL('image/webp', 0.95)
          } catch {
            limpia = canvas.toDataURL('image/png')
          }
          if (limpia && limpia.length > 50) {
            cacheStickerLimpio.set(url, limpia)
            resolve(limpia)
            return
          }
        }
        cacheStickerLimpio.set(url, url)
        resolve(url)
      } catch {
        cacheStickerLimpio.set(url, url)
        resolve(url)
      }
    }

    img.onerror = () => {
      cacheStickerLimpio.set(url, url)
      resolve(url)
    }

    img.src = url
  })
}

/**
 * Hook para obtener la URL transparente de un sticker o imagen PNG.
 * Para el resto de formatos devuelve la URL original sin modificarla.
 */
export function useStickerTransparente(url) {
  const [srcLimpia, setSrcLimpia] = useState(() => {
    if (!url) return ''
    return cacheStickerLimpio.get(url) || url
  })

  useEffect(() => {
    if (!url) {
      setSrcLimpia('')
      return
    }
    if (!esPngTransparente(url)) {
      setSrcLimpia(url)
      return
    }

    if (cacheStickerLimpio.has(url)) {
      setSrcLimpia(cacheStickerLimpio.get(url))
      return
    }

    let cancelado = false
    procesarStickerTransparente(url).then((res) => {
      if (!cancelado && res) {
        setSrcLimpia(res)
      }
    })

    return () => {
      cancelado = true
    }
  }, [url])

  return srcLimpia || url
}

/**
 * Componente que renderiza un sticker. Solo los PNG pasan por el limpiador de
 * fondo; los demás formatos se muestran tal cual, sin perder su fondo original.
 */
export function StickerChat({
  src,
  alt = 'Sticker',
  className = '',
  draggable = false,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) {
  const urlLimpia = useStickerTransparente(src)

  return (
    <img
      src={urlLimpia}
      alt={alt}
      loading={loading}
      draggable={draggable}
      onLoad={onLoad}
      onError={onError}
      className={`object-contain bg-transparent select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)] ${className}`}
      {...props}
    />
  )
}
