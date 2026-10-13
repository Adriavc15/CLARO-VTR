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
function exp(xmlRel, outRel) {
  const raw = fs.readFileSync(path.join(SRC, xmlRel.replace(/\//g, path.sep)), 'utf8')
  const tex = raw.match(/<Texture>([^<]+)/)[1].replace(/\\/g, '/')
  const ox = Number(raw.match(/<SheetOffsetX>(\d+)/)[1])
  const oy = Number(raw.match(/<SheetOffsetY>(\d+)/)[1])
  const w = Number(raw.match(/<SourceWidth>(\d+)/)[1])
  const h = Number(raw.match(/<SourceHeight>(\d+)/)[1])
  const sheet = dds(path.join(SRC, tex.replace(/\//g, path.sep)))
  writePng(path.join(OUT, outRel), w, h, crop(sheet.rgba, sheet.w, ox, oy, w, h))
  console.log(outRel, `${w}x${h}`)
}

exp('UI/ComfyCakes/Machines/FillingMachineTubesSprite.xml', 'cakes/machines/filling-tubes.png')

const ui = ['SlideLeftButtonSprite.png', 'SlideRightButtonSprite.png', 'ToolPanel_Glow.png', 'TV_Glow.png']
for (const f of ui) {
  const src = path.join(SRC, 'UI/ComfyCakes', f)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUT, 'cakes/ui', f))
    console.log('copy', f)
  }
}

// idle frames
for (const [from, to] of [
  ['batter_f0.png', 'batter.png'],
  ['icing_f0.png', 'icing.png'],
  ['decor_f0.png', 'decor.png'],
  ['final_f0.png', 'final.png'],
]) {
  fs.copyFileSync(path.join(OUT, 'cakes/machines', from), path.join(OUT, 'cakes/machines', to))
}
console.log('ok')
