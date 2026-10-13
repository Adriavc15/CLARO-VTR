/**
 * Extrae texturas del Purble Place Original (CAB) a public/juegos/purble
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

function convertSheet(relDds, outName) {
  const src = path.join(SRC, relDds.replace(/\//g, path.sep))
  if (!fs.existsSync(src)) {
    console.warn('missing sheet', relDds)
    return null
  }
  const out = path.join(OUT, 'sheets', outName || path.basename(relDds, '.dds') + '.png')
  if (fs.existsSync(out)) {
    // still load for cropping
    const png = PNG.sync.read(fs.readFileSync(out))
    return { width: png.width, height: png.height, rgba: png.data, file: out }
  }
  const { width, height, rgba } = ddsToRgba(src)
  writePng(out, width, height, rgba)
  console.log('sheet', outName || relDds)
  return { width, height, rgba, file: out }
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
  const base = path.basename(texRel, '.dds')
  // prefer non-x2
  const sheet = convertSheet(texRel, `${base}.png`)
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
    // maybe points to a png
    const pngRef = fs.readFileSync(xmlPath, 'utf8').match(/<Texture>([^<]+\.png)<\/Texture>/i)?.[1]
    if (pngRef) {
      const src = path.join(SRC, pngRef.replace(/\\/g, path.sep))
      if (fs.existsSync(src)) {
        const dest = path.join(OUT, outRel)
        ensureDir(path.dirname(dest))
        fs.copyFileSync(src, dest)
        return true
      }
    }
    console.warn('bad sprite', xmlRel)
    return false
  }
  const sheet = getSheet(sp.tex)
  if (!sheet) return false
  const rgba = crop(sheet.rgba, sheet.width, sp.ox, sp.oy, sp.w, sp.h)
  const dest = path.join(OUT, outRel)
  writePng(dest, sp.w, sp.h, rgba)
  return true
}

function copyFile(rel, outRel) {
  const src = path.join(SRC, rel.replace(/\//g, path.sep))
  if (!fs.existsSync(src)) {
    console.warn('missing', rel)
    return
  }
  const dest = path.join(OUT, outRel)
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
}

function walkXml(dir, filterFn, cb) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walkXml(p, filterFn, cb)
    else if (ent.name.endsWith('.xml') && filterFn(ent.name, p)) cb(p)
  }
}

ensureDir(OUT)

// Hub + backgrounds
copyFile('UI/PurblePlace/PurblePlaceBackground.jpg', 'hub/background.jpg')
copyFile('UI/PurblePlace/Loading.jpg', 'hub/loading.jpg')
copyFile('UI/BuildAPurble/Background.png', 'shop/background.png')
copyFile('UI/ComfyCakes/ComfyCakesBackground2.png', 'cakes/background.png')
copyFile('UI/ComfyCakes/BackWall.png', 'cakes/backwall.png')
copyFile('UI/BuildAPurble/Cabinet/GreenCheck.png', 'shop/green-check.png')
copyFile('UI/BuildAPurble/Cabinet/RedX.png', 'shop/red-x.png')
copyFile('UI/BuildAPurble/Cabinet/Checkbox.png', 'shop/checkbox.png')
copyFile('ComfyCakesVars.xml', 'cakes/vars.xml')

// Hub buttons
exportSprite('UI/PurblePlace/ComfyCakesButton.xml', 'hub/comfy-cakes-btn.png')
exportSprite('UI/PurblePlace/BuildAPurbleButton.xml', 'hub/purble-shop-btn.png')
exportSprite('UI/PurblePlace/ExitButton.xml', 'hub/exit-btn.png')

// Shop feature sprites (static parts only)
const featDir = path.join(SRC, 'UI/BuildAPurble/Features')
for (const name of fs.readdirSync(featDir)) {
  if (!name.endsWith('.xml')) continue
  if (/Anim|Fall|Ref|Show|Win|Sprite/i.test(name)) continue
  if (/^BeginnerHead|^Head\d/i.test(name)) {
    exportSprite(`UI/BuildAPurble/Features/${name}`, `shop/heads/${name.replace('.xml', '.png')}`)
    continue
  }
  exportSprite(`UI/BuildAPurble/Features/${name}`, `shop/parts/${name.replace('.xml', '.png')}`)
}

// Shelf icons if xml exist
const shelfDir = path.join(SRC, 'UI/BuildAPurble/ShelfFeatures')
if (fs.existsSync(shelfDir)) {
  for (const name of fs.readdirSync(shelfDir)) {
    if (!name.endsWith('.xml')) continue
    exportSprite(`UI/BuildAPurble/ShelfFeatures/${name}`, `shop/shelf/${name.replace('.xml', '.png')}`)
  }
}

// Cake layer sprites
const layerDir = path.join(SRC, 'UI/ComfyCakes/Layers')
for (const name of fs.readdirSync(layerDir)) {
  if (!name.endsWith('Sprite.xml')) continue
  exportSprite(`UI/ComfyCakes/Layers/${name}`, `cakes/layers/${name.replace('Sprite.xml', '.png')}`)
}

// Cake tool buttons
const toolsDir = path.join(SRC, 'UI/ComfyCakes/Tools')
for (const name of fs.readdirSync(toolsDir)) {
  if (!name.endsWith('ButtonSprite.png') || /x2/i.test(name)) continue
  copyFile(`UI/ComfyCakes/Tools/${name}`, `cakes/tools/${name}`)
}

// Conveyor / UI bits
;[
  'LeftConveyorBelt1Sprite.png',
  'LeftConveyorBelt2Sprite.png',
  'RotateButtonSprite.png',
  'SlideLeftButtonSprite.png',
  'SlideRightButtonSprite.png',
].forEach((n) => copyFile(`UI/ComfyCakes/${n}`, `cakes/ui/${n}`))

// Audio
function copyWavs(relDir, outDir) {
  const d = path.join(SRC, relDir)
  if (!fs.existsSync(d)) return
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, ent.name)
    if (ent.isDirectory()) copyWavs(path.join(relDir, ent.name), path.join(outDir, ent.name))
    else if (ent.name.endsWith('.wav')) {
      copyFile(path.join(relDir, ent.name).replace(/\\/g, '/'), path.join(outDir, ent.name).replace(/\\/g, '/'))
    }
  }
}
copyWavs('Audio/SFX', 'audio')

// Manifest of shop parts for the game
const parts = fs
  .readdirSync(path.join(OUT, 'shop/parts'))
  .filter((n) => n.endsWith('.png'))
  .map((n) => n.replace('.png', ''))
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ parts, extractedAt: new Date().toISOString() }, null, 2))

console.log('Done →', OUT)
