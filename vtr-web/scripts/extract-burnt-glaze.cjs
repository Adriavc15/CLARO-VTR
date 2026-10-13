/**
 * Extrae capas FinalTouchBurntGlaze* hacia public/juegos/purble/cakes/layers
 */
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')
const parseDDS = require('parse-dds')
const decodeDXT = require('decode-dxt')

const SRC = path.resolve(__dirname, '../../Purble Place Original/_extracted')
const OUT = path.resolve(__dirname, '../public/juegos/purble/cakes/layers')

function dds(fp) {
  const buf = fs.readFileSync(fp)
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const parsed = parseDDS(ab)
  const img = parsed.images[0]
  const rgba = decodeDXT(new DataView(ab, img.offset, img.length), img.shape[0], img.shape[1], parsed.format)
  return {
    w: img.shape[0],
    h: img.shape[1],
    rgba: Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength),
  }
}

function crop(rgba, sw, sx, sy, w, h) {
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((sy + y) * sw + (sx + x)) * 4
      const di = (y * w + x) * 4
      out[di] = rgba[si]
      out[di + 1] = rgba[si + 1]
      out[di + 2] = rgba[si + 2]
      out[di + 3] = rgba[si + 3]
    }
  }
  return out
}

fs.mkdirSync(OUT, { recursive: true })
const dir = path.join(SRC, 'UI', 'ComfyCakes', 'Layers')
let n = 0
for (const f of fs.readdirSync(dir).filter((x) => x.startsWith('FinalTouchBurntGlaze') && x.endsWith('.xml'))) {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8')
  const tex = raw.match(/<Texture>([^<]+)/)?.[1]?.replace(/\\/g, '/')
  const ox = Number(raw.match(/<SheetOffsetX>(\d+)/)?.[1])
  const oy = Number(raw.match(/<SheetOffsetY>(\d+)/)?.[1])
  const w = Number(raw.match(/<SourceWidth>(\d+)/)?.[1])
  const h = Number(raw.match(/<SourceHeight>(\d+)/)?.[1])
  if (!tex || !w || !h) {
    console.warn('skip', f)
    continue
  }
  const sheetPath = path.join(SRC, ...tex.split('/'))
  if (!fs.existsSync(sheetPath)) {
    console.warn('missing sheet', tex)
    continue
  }
  const sheet = dds(sheetPath)
  const png = new PNG({ width: w, height: h })
  png.data = crop(sheet.rgba, sheet.w, ox, oy, w, h)
  const outName = f.replace(/\.xml$/i, '.png')
  fs.writeFileSync(path.join(OUT, outName), PNG.sync.write(png))
  console.log(outName, `${w}x${h}`)
  n++
}
console.log('exported', n)
