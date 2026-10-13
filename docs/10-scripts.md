# 10 · Scripts y herramientas de datos

`vtr-web/scripts/` contiene utilidades puntuales (`.mjs`/`.cjs`) que **no** forman parte del
build; se ejecutan manualmente para generar o mantener datos y assets. Agrupadas por propósito:

## A. Scraping de "Somos Clave" (API KM de Inbenta)

| Script | Función |
|---|---|
| `scrape-somos-clave.mjs` | Extrae respuestas FAQ de `somosclave.cl` (API KM) → `somosClaveDump.json` |
| `downloadSomosClavePages.mjs` | Descarga HTML + imágenes de artículos → `public/sc-assets/{id}/` |
| `bulkDownloadSomosClave.mjs` | Descarga masiva de FAQs (usa sesión/token del navegador) |
| `ingestBrowserFaq.mjs` | Ingesta HTML extraído del navegador y baja imágenes del CDN de Inbenta |
| `syncIdsSomosClave.mjs` | Extrae IDs/títulos/enlaces y sube a Firestore; escribe `idsClaveSeed.js` |
| `inspect-somos.mjs`, `inspect-inbenta.mjs` | Inspección de sesión/cookies (login) |
| `inspect-sdk-*.mjs`, `probe-inbenta-auth*.mjs` | Inspección y sondeo de autenticación del SDK |

Configuración de credenciales Inbenta en `scripts/_inbenta_knowledge.js` (**no versionado**).

## B. Ingesta vía CDP (Chrome DevTools Protocol) y subida a Firestore

| Script | Función |
|---|---|
| `_batchExtractorTemplate.mjs` | Plantilla inyectable para descargar FAQs en lotes desde el navegador |
| `_makeBatchExpr.mjs` | Genera la expresión CDP lista para pegar (`Runtime.evaluate`) |
| `_ingestCdpFile.mjs` | Procesa una respuesta CDP guardada en archivo |
| `_ingestServer.mjs` / `receiveScContent.mjs` | Servidores locales que reciben el contenido |
| `absorbCdpLots.mjs` | Divide una respuesta CDP grande en lotes |
| `mergeUploadParts.mjs` | Une lotes con `IDS_CLAVE_SEED` |
| `uploadFromCdpFile.mjs`, `uploadLiveTitles.mjs`, `uploadLiveArticlesContent.mjs`, `uploadScContentParts.mjs` | Suben títulos/contenido a Firestore |
| `_exportMissing.mjs` | Calcula IDs faltantes respecto al JSON local |

## C. Generación de corpus y control de calidad

| Script | Función |
|---|---|
| `generarCorpus1000.mjs` | Genera 1000 diálogos naturales → `src/asistente/data/` y `corpusBloqueGenerado1000.js` |
| `buildContenidosSomosClave.mjs` | Reconstruye `public/somosclave-contenidos.json` desde páginas guardadas |
| `fixMojibake.mjs` | Repara texto con codificación UTF-8/Windows-1252 mal decodificada |
| `verificar-respuestas-match.mjs` | Verifica que FAQ/SC/KB casen con las respuestas locales |

## D. Seeding y mantenimiento de Firestore

| Script | Función |
|---|---|
| `backfillEstadoCursada.mjs` | Rellena `migraciones` sin estado válido a "Migración Cursada" |
| `nutrir-apex.mjs` | Siembra `apex_aprendizaje` con ejemplos de tono |
| `nutrir-somos-clave.mjs` | Siembra `apex_aprendizaje` con extractos de Somos Clave |

> Estos scripts usan la configuración de Firebase embebida (proyecto `vtrclaroo-3c572`).

## E. Extracción de assets de juegos (carpetas originales → `public/juegos`)

| Script | Función |
|---|---|
| `extract-purble-assets.cjs`, `extract-purble-extra.cjs` | Extraen DDS/CAB de Purble Place y generan PNG |
| `extract-cakes-anims.cjs`, `extract-burnt-glaze.cjs` | Animaciones y detalles de "Comfy Cakes" |
| `fix-cakes-sprites.cjs`, `fix-cakes-ui.cjs`, `fix-cakes-visuals.cjs`, `fix-main-belt.cjs` | Correcciones visuales |
| `extract-zuma-levels.cjs` | Convierte niveles `*.CURV` de Zuma a JSON |

## F. Utilidades

| Script | Función |
|---|---|
| `update-app-icons.mjs` | Reescribe rutas de iconos en `aplicacionesCatalogo.js` |

## Scripts de npm (`vtr-web/package.json`)

| Script | Acción |
|---|---|
| `dev` | `vite` |
| `build` | `vite build` |
| `preview` | `vite preview` |
| `extraer:sucursales` | `node src/asistente/extraerSucursales.mjs` |

## Archivos de datos intermedios

En `scripts/` hay JSON/HTML intermedios usados por los flujos de scraping
(`_cdp_payload.json`, `_ids-to-fetch.json`, `_known-ids.json`, `_missing_ids.json`,
`_sc-live-titles.json`, `_sample_respuesta.html`, `_sc_parts/`, `_faq_dumps/`). No son
necesarios para ejecutar la app.
