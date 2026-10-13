const fs = require('fs');
const path = require('path');

const ROOT = String.raw`d:\WEBS Sites personal\vtr\Zuma Deluxe\levels`;
const OUT = String.raw`d:\WEBS Sites personal\vtr\vtr-web\public\juegos\zuma\levels`;

function parseCurv(buf) {
  if (buf.toString('ascii', 0, 4) !== 'CURV') return null;
  const count = buf.readInt32LE(16);
  const pts = [];
  let o = 20;
  for (let i = 0; i < count && o + 20 <= buf.length; i++) {
    const x = buf.readInt32LE(o);
    const y = buf.readInt32LE(o + 4);
    const tx = buf.readInt32LE(o + 8) >> 16;
    const ty = buf.readInt32LE(o + 12) >> 16;
    o += 20;
    if (x < -150 || x > 800 || y < -150 || y > 650) break;
    pts.push({ x, y, cx: tx, cy: ty });
  }
  if (pts.length < 3) return null;
  // last control may be garbage — clamp to point
  const last = pts[pts.length - 1];
  if (last.cx < -150 || last.cx > 800 || last.cy < -150 || last.cy > 650) {
    last.cx = last.x;
    last.cy = last.y;
  }
  return pts;
}

function findJpg(dir) {
  const files = fs.readdirSync(dir);
  return files.find((f) => /\.jpe?g$/i.test(f));
}

function findDats(dir) {
  return fs.readdirSync(dir).filter((f) => /\.dat$/i.test(f)).sort();
}

const META = [
  { id: 'spiral', name: 'Espiral del destino', gx: 327, gy: 233 },
  { id: 'claw', name: 'Garra de Osprey', gx: 333, gy: 235 },
  { id: 'riverbed', name: 'Mosaico de la ribera', gx: 274, gy: 264 },
  { id: 'targetglyph', name: 'Aliento de Ehecatl', gx: 369, gy: 222 },
  { id: 'blackswirley', name: 'Vórtice oscuro', gx: 320, gy: 240, dual: true },
  { id: 'turnaround', name: 'Serpenteo', gx: 300, gy: 230 },
  { id: 'longrange', name: 'Largo alcance', gx: 450, gy: 240 },
  { id: 'tiltspiral', name: 'El ataque de las espirales', gx: 242, gy: 248 },
  { id: 'underover', name: 'Guerra en el barro', gx: 334, gy: 247 },
  { id: 'warshak', name: 'Rorschach', gx: 305, gy: 338 },
  { id: 'loopy', name: 'Boca de Centeotl', gx: 325, gy: 114 },
  { id: 'snakepit', name: 'Nido de serpientes', gx: 318, gy: 240, dual: true },
  { id: 'groovefest', name: 'Jardín de arena', gx: 227, gy: 236 },
  { id: 'spaceinvaders', name: 'Guarida de la serpiente de barro', gx: 271, gy: 358 },
  { id: 'triangle', name: 'Plataforma de aterrizaje', gx: 369, gy: 277 },
  { id: 'coaster', name: 'Altar de Tlaloc', gx: 325, gy: 240 },
  { id: 'squaresville', name: 'Código de Mixtec', gx: 324, gy: 284 },
  { id: 'tunnellevel', name: 'Santuario de Quetzalcoatl', gx: 215, gy: 240 },
  { id: 'serpents', name: 'Serpiente espejo', gx: 339, gy: 271, dual: true },
  { id: 'overunder', name: 'Piedra solar', gx: 307, gy: 278 },
  { id: 'inversespiral', name: 'Éxodo zumaico', gx: 424, gy: 263 },
];

// Map folder names (case variants)
function resolveDir(id) {
  const entries = fs.readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory());
  const hit = entries.find((d) => d.name.toLowerCase() === id.toLowerCase());
  return hit ? path.join(ROOT, hit.name) : null;
}

fs.mkdirSync(OUT, { recursive: true });
const manifest = [];

for (const m of META) {
  const dir = resolveDir(m.id);
  if (!dir) {
    console.log('SKIP no dir', m.id);
    continue;
  }
  const dats = findDats(dir);
  const jpg = findJpg(dir);
  if (!dats.length || !jpg) {
    console.log('SKIP missing assets', m.id, dats, jpg);
    continue;
  }

  const paths = [];
  for (const datName of dats) {
    const buf = fs.readFileSync(path.join(dir, datName));
    const pts = parseCurv(buf);
    if (pts) {
      paths.push(pts);
      console.log(m.id, datName, 'pts=', pts.length);
    } else {
      console.log(m.id, datName, 'FAIL parse');
    }
  }
  if (!paths.length) {
    console.log('SKIP no paths', m.id);
    continue;
  }

  const bgName = `${m.id}.jpg`;
  fs.copyFileSync(path.join(dir, jpg), path.join(OUT, bgName));

  const level = {
    id: m.id,
    name: m.name,
    width: 640,
    height: 480,
    frog: { x: m.gx, y: m.gy },
    path: paths[0],
    path2: paths[1] || null,
    bg: bgName,
  };
  fs.writeFileSync(path.join(OUT, `${m.id}.json`), JSON.stringify(level));
  manifest.push({
    id: m.id,
    name: m.name,
    bg: bgName,
    dual: !!paths[1],
  });
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ levels: manifest }, null, 2));
console.log('DONE', manifest.length, 'levels');
