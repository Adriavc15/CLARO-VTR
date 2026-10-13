/**
 * Recorta botones al frame idle (SourceWidth) y exporta frames de máquinas.
 */
const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')
const parseDDS = require('parse-dds')
const decodeDXT = require('decode-dxt')

const SRC = path.resolve(__dirname, '../../Purble Place Original/_extracted')
const OUT = path.resolve(__dirname, '../public/juegos/purble')

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true })
}

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file))
}

function writePng(file, width, height, data) {
  ensureDir(path.dirname(file))
  const png = new PNG({ width, height })
  png.data = Buffer.from(data)
  fs.writeFileSync(file, PNG.sync.write(png))
}

function cropBuf(rgba, sw, sx, sy, w, h) {
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

// Crop tool ButtonSprite PNGs to first frame
const toolsDir = path.join(OUT, 'cakes/tools')
const xmlDir = path.join(SRC, 'UI/ComfyCakes/Tools')
for (const name of fs.readdirSync(toolsDir)) {
  if (!name.endsWith('ButtonSprite.png')) continue
  const xmlName = name.replace('ButtonSprite.png', 'Button.xml')
  const xmlPath = path.join(xmlDir, xmlName)
  if (!fs.existsSync(xmlPath)) {
    console.warn('no xml', xmlName)
    continue
  }
  const raw = fs.readFileSync(xmlPath, 'utf8')
  const fw = Number(raw.match(/<SourceWidth>(\d+)/)?.[1] || 0)
  const fh = Number(raw.match(/<SourceHeight>(\d+)/)?.[1] || 0)
  if (!fw || !fh) continue
  const png = readPng(path.join(toolsDir, name))
  if (png.width === fw && png.height === fh) {
    console.log('already cropped', name)
    continue
  }
  // backup full strip once
  const bak = path.join(toolsDir, name.replace('.png', '.strip.png'))
  if (!fs.existsSync(bak)) fs.copyFileSync(path.join(toolsDir, name), bak)
  const data = cropBuf(png.data, png.width, 0, 0, fw, fh)
  writePng(path.join(toolsDir, name), fw, fh, data)
  console.log('cropped', name, `${png.width}x${png.height} → ${fw}x${fh}`)
}

// Export machine frames from DDS for inspection / pick idle
function ddsToRgba(filePath) {
  const buf = fs.readFileSync(filePath)
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const dds = parseDDS(ab)
  const img = dds.images[0]
  const width = img.shape[0]
  const height = img.shape[1]
  const rgba = decodeDXT(new DataView(ab, img.offset, img.length), width, height, dds.format)
  return { width, height, rgba: Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength) }
}

function parseSpriteXml(xmlPath) {
  const raw = fs.readFileSync(xmlPath, 'utf8')
  const tex = raw.match(/<Texture>([^<]+)<\/Texture>/)?.[1]
  const ox = Number(raw.match(/<SheetOffsetX>(\d+)/)?.[1] || 0)
  const oy = Number(raw.match(/<SheetOffsetY>(\d+)/)?.[1] || 0)
  const w = Number(raw.match(/<SourceWidth>(\d+)/)?.[1] || 0)
  const h = Number(raw.match(/<SourceHeight>(\d+)/)?.[1] || 0)
  const fc = Number(raw.match(/<FrameCount>(\d+)/)?.[1] || 1)
  const fpr = Number(raw.match(/<FramesPerRow>(\d+)/)?.[1] || 1)
  if (!tex || !w || !h) return null
  return { tex: tex.replace(/\\/g, '/'), ox, oy, w, h, fc, fpr }
}

function exportFrames(xmlRel, outPrefix) {
  const xmlPath = path.join(SRC, xmlRel.replace(/\//g, path.sep))
  const sp = parseSpriteXml(xmlPath)
  if (!sp) return
  const sheet = ddsToRgba(path.join(SRC, sp.tex.replace(/\//g, path.sep)))
  const n = Math.min(sp.fc, 8)
  for (let i = 0; i < n; i++) {
    const col = i % sp.fpr
    const row = Math.floor(i / sp.fpr)
    const sx = sp.ox + col * sp.w
    const sy = sp.oy + row * sp.h
    const data = cropBuf(sheet.rgba, sheet.width, sx, sy, sp.w, sp.h)
    const out = `${outPrefix}_f${i}.png`
    writePng(path.join(OUT, out), sp.w, sp.h, data)
    console.log('frame', out)
  }
}

exportFrames('UI/ComfyCakes/Machines/CakePanMachineSprite.xml', 'cakes/machines/pan')
exportFrames('UI/ComfyCakes/Machines/FillingMachineSprite.xml', 'cakes/machines/filling')
exportFrames('UI/ComfyCakes/Machines/IcingMachineActionSprite.xml', 'cakes/machines/icing')
exportFrames('UI/ComfyCakes/Machines/DecorationMachineSprite.xml', 'cakes/machines/decor')
exportFrames('UI/ComfyCakes/Machines/BatterMachineSprite.xml', 'cakes/machines/batter')
exportFrames('UI/ComfyCakes/Machines/FinalTouchMachineBaseSprite.xml', 'cakes/machines/final')

console.log('done')
