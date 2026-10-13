import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

/** Mapa ID Clave → carpeta *_files junto a los HTML guardados */
const SC_FILES_BY_ID = {
  1058: 'Somos Clave _ Portal Privado traslado_files',
  1346: 'Somos Clave _ Portal Privado cambio titular_files',
  997: 'Inconvenientes Internet FTTH - HFC_files',
}

function somosClaveAssetsPlugin() {
  return {
    name: 'somos-clave-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = String(req.url || '').match(/^\/sc-assets\/(\d+)\/([^/?#]+)$/)
        if (!m) return next()
        const [, id, file] = m
        const safe = path.basename(decodeURIComponent(file))
        const candidates = [
          path.join(__dirname, 'public', 'sc-assets', id, safe),
          path.join(repoRoot, SC_FILES_BY_ID[id] || '', safe),
        ]
        for (const abs of candidates) {
          if (abs && fs.existsSync(abs) && fs.statSync(abs).isFile()) {
            res.setHeader('Content-Type', 'image/png')
            fs.createReadStream(abs).pipe(res)
            return
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), somosClaveAssetsPlugin()],
  assetsInclude: ['**/*.png'],
  server: {
    fs: { allow: [repoRoot, __dirname] },
    // ROMs .sfc suelen estar bloqueadas en Windows y tumban el watcher (EBUSY)
    watch: {
      ignored: ['**/*.sfc', '**/*.smc', '**/*.zip'],
    },
    // emoji.gg bloquea CORS desde el portal; proxy solo en dev
    proxy: {
      '/emojigg-api': {
        target: 'https://emoji.gg',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/emojigg-api/, '/api'),
      },
    },
  },
})
