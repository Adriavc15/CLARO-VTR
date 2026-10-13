/**
 * Extrae TV, máquinas, guess y cortina para alinear el layout.
 */
const fs = require('fs')
const path = require('path')
const parseDDS = require('parse-dds')
const decodeDXT = require('decode-dxt')
const { PNG } = require('pngjs')

const SRC = path.resolve(__dirname, '../../Purble Place Original/_extracted')
const OUT = path.resolve(__dirname, '../public/juegos/purble')

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true })
}

function ddsToRgba(filePath) {
  const buf = fs.readFileSync(filePath)
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const dds = parseDDS(ab)
  const img = dds.images[0]
  const width = img.shape[0]
  const height = img.shape[1]
  const dataView = new DataView(ab, img.offset, img.length)
  const rgba = decodeDXT(dataView, width, height, dds.format)
  return { width, height, rgba: Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength) }
}

function writePng(filePath, width, height, rgba) {
  ensureDir(path.dirname(filePath))
  const png = new PNG({ width, height })
  png.data = Buffer.from(rgba)
  fs.writeFileSync(filePath, PNG.sync.write(png))
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

function parseSpriteXml(xmlPath) {
  const raw = fs.readFileSync(xmlPath, 'utf8')
  const tex = raw.match(/<Texture>([^<]+)<\/Texture>/)?.[1]
  const ox = Number(raw.match(/<SheetOffsetX>(\d+)<\/SheetOffsetX>/)?.[1] || 0)
  const oy = Number(raw.match(/<SheetOffsetY>(\d+)<\/SheetOffsetY>/)?.[1] || 0)
  const w = Number(raw.match(/<SourceWidth>(\d+)<\/SourceWidth>/)?.[1] || 0)
  const h = Number(raw.match(/<SourceHeight>(\d+)<\/SourceHeight>/)?.[1] || 0)
  if (!tex || !w || !h) return null
  return { tex: tex.replace(/\\/g, '/'), ox, oy, w, h }
}

const sheetCache = new Map()
function getSheet(texRel) {
  const key = texRel.toLowerCase()
  if (sheetCache.has(key)) return sheetCache.get(key)
  const src = path.join(SRC, texRel.replace(/\//g, path.sep))
  if (!fs.existsSync(src)) {
    console.warn('missing sheet', texRel)
    return null
  }
  const sheet = ddsToRgba(src)
  sheetCache.set(key, sheet)
  return sheet
}

function exportSprite(xmlRel, outRel) {
  const xmlPath = path.join(SRC, xmlRel.replace(/\//g, path.sep))
  if (!fs.existsSync(xmlPath)) {
    console.warn('no xml', xmlRel)
    return false
  }
  const sp = parseSpriteXml(xmlPath)
  if (!sp) {
    console.warn('bad sprite', xmlRel)
    return false
  }
  const sheet = getSheet(sp.tex)
  if (!sheet) return false
  const rgba = crop(sheet.rgba, sheet.width, sp.ox, sp.oy, sp.w, sp.h)
  writePng(path.join(OUT, outRel), sp.w, sp.h, rgba)
  console.log('ok', outRel, `${sp.w}x${sp.h}`)
  return true
}

const jobs = [
  ['UI/ComfyCakes/TVSprite.xml', 'cakes/ui/tv.png'],
  ['UI/ComfyCakes/Machines/CakePanMachineSprite.xml', 'cakes/machines/pan.png'],
  ['UI/ComfyCakes/Machines/BatterMachineSprite.xml', 'cakes/machines/batter.png'],
  ['UI/ComfyCakes/Machines/IcingMachineActionSprite.xml', 'cakes/machines/icing.png'],
  ['UI/ComfyCakes/Machines/DecorationMachineSprite.xml', 'cakes/machines/decor.png'],
  ['UI/ComfyCakes/Machines/FinalTouchMachineBaseSprite.xml', 'cakes/machines/final.png'],
  ['UI/ComfyCakes/Machines/FillingMachineSprite.xml', 'cakes/machines/filling.png'],
  ['UI/BuildAPurble/GuessSprite.xml', 'shop/guess-btn.png'],
  ['UI/BuildAPurble/Curtain/Curtain.xml', 'shop/curtain.png'],
  ['UI/BuildAPurble/Curtain/CurtainRod.xml', 'shop/curtain-rod.png'],
  ['UI/BuildAPurble/Stage/StagePlate.xml', 'shop/stage-plate.png'],
]

for (const [a, b] of jobs) exportSprite(a, b)
console.log('extra done')
