/**
 * Extrae UI/anim frames faltantes de Comfy Cakes.
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
function writePng(file, w, h, data) {
  ensureDir(path.dirname(file))
  const png = new PNG({ width: w, height: h })
  png.data = Buffer.from(data)
  fs.writeFileSync(file, PNG.sync.write(png))
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
function dds(fp) {
  const buf = fs.readFileSync(fp)
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const parsed = parseDDS(ab)
  const img = parsed.images[0]
  const rgba = decodeDXT(new DataView(ab, img.offset, img.length), img.shape[0], img.shape[1], parsed.format)
  return { w: img.shape[0], h: img.shape[1], rgba: Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength) }
}
function parseSprite(xmlRel) {
  const raw = fs.readFileSync(path.join(SRC, xmlRel.replace(/\//g, path.sep)), 'utf8')
  const tex = raw.match(/<Texture>([^<]+)/)?.[1]?.replace(/\\/g, '/')
  const ox = Number(raw.match(/<SheetOffsetX>(\d+)/)?.[1] || 0)
  const oy = Number(raw.match(/<SheetOffsetY>(\d+)/)?.[1] || 0)
  const w = Number(raw.match(/<SourceWidth>(\d+)/)?.[1] || 0)
  const h = Number(raw.match(/<SourceHeight>(\d+)/)?.[1] || 0)
  const fc = Number(raw.match(/<FrameCount>(\d+)/)?.[1] || 1)
  const fpr = Number(raw.match(/<FramesPerRow>(\d+)/)?.[1] || 1)
  if (!tex || !w || !h) return null
  return { tex, ox, oy, w, h, fc, fpr }
}
function exportSprite(xmlRel, outRel, frame = 0) {
  const sp = parseSprite(xmlRel)
  if (!sp) {
    console.warn('bad', xmlRel)
    return false
  }
  const sheetPath = path.join(SRC, sp.tex.replace(/\//g, path.sep))
  if (!fs.existsSync(sheetPath)) {
    // maybe direct png texture
    const raw = fs.readFileSync(path.join(SRC, xmlRel.replace(/\//g, path.sep)), 'utf8')
    const pngRef = raw.match(/<Texture>([^<]+\.png)<\/Texture>/i)?.[1]
    if (pngRef) {
      const src = path.join(SRC, pngRef.replace(/\\/g, path.sep))
      if (fs.existsSync(src)) {
        ensureDir(path.dirname(path.join(OUT, outRel)))
        fs.copyFileSync(src, path.join(OUT, outRel))
        console.log('copy', outRel)
        return true
      }
    }
    console.warn('missing sheet', sp.tex)
    return false
  }
  const sheet = dds(sheetPath)
  const col = frame % sp.fpr
  const row = Math.floor(frame / sp.fpr)
  const sx = sp.ox + col * sp.w
  const sy = sp.oy + row * sp.h
  writePng(path.join(OUT, outRel), sp.w, sp.h, crop(sheet.rgba, sheet.w, sx, sy, sp.w, sp.h))
  console.log('ok', outRel, `${sp.w}x${sp.h} f${frame}`)
  return true
}
function exportFrames(xmlRel, outPrefix, max = 8) {
  const sp = parseSprite(xmlRel)
  if (!sp) return
  const n = Math.min(sp.fc, max)
  for (let i = 0; i < n; i++) exportSprite(xmlRel, `${outPrefix}_f${i}.png`, i)
}

const jobs = [
  ['UI/ComfyCakes/CakeBoxSprite.xml', 'cakes/ui/cake-box.png'],
  ['UI/ComfyCakes/TrashCakeSprite.xml', 'cakes/ui/trash.png'],
  ['UI/ComfyCakes/RedLightSprite.xml', 'cakes/ui/red-light.png'],
  ['UI/ComfyCakes/WaxPaperSprite.xml', 'cakes/ui/wax-paper.png'],
  ['UI/ComfyCakes/ShippingSignSprite.xml', 'cakes/ui/shipping-sign.png'],
  ['UI/ComfyCakes/TimerBarSprite.xml', 'cakes/ui/timer-bar.png'],
  ['UI/ComfyCakes/TimerBackSprite.xml', 'cakes/ui/timer-back.png'],
  ['UI/ComfyCakes/ConveyorPlatformSprite.xml', 'cakes/ui/conveyor-platform.png'],
  // NO sobrescribir cakes/machines/pan.png (idle = CakePanMachineSprite / pan_f0)
]

for (const [a, b] of jobs) exportSprite(a, b, 0)

// machine action frames already exist for batter/decor/icing; ensure pan falling frames
exportFrames('UI/ComfyCakes/Machines/CakePanMachineFallingAnim.xml', 'cakes/machines/panfall', 6)
exportFrames('UI/ComfyCakes/Machines/CakePanSquishSprite.xml', 'cakes/machines/pansquish', 6)

console.log('done')
