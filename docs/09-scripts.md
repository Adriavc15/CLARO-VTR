# 09 · Scripts y herramientas de datos

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

## D. Catálogo de planes (Excel → seeds → KB)

| Script | Función |
|---|---|
| `importarPlanesXlsx.mjs` | Lee el Excel del plan comercial (`.xlsx` sin dependencias), vuelca las hojas, imprime las tablas de planes de Claro/VTR y las contrasta con el catálogo de la web (`planesSeed.js` + `planesClaro.js`): altas, precios distintos y planes que solo están en el catálogo |
| `syncKbPlanes.mjs` | Regenera los ítems de `categoria: "planes"` de la base de conocimiento Andes/VTR (`src/asistente/data/andes_vtr_ia_knowledge_base.json`) a partir de `planesSeed.js` |

```bash
cd vtr-web
npm run importar:planes            # analiza el .xlsx de la raíz del repo
npm run importar:planes -- "..\ClaroVTR_Planes_Hogar_Octubre_2026 (2).xlsx"
node scripts/importarPlanesXlsx.mjs --json planes.json   # vuelca todo a JSON
npm run sync:kb-planes             # sincroniza la KB (usar --check para solo revisar)
```

Notas:

- El importador **no escribe** en el código: sirve para verificar que los seeds
  `vtr-web/src/asistente/planesSeed.js` (VTR) y `vtr-web/src/asistente/planesClaro.js`
  (Claro) estén al día con el Excel. Los cambios se aplican a mano en esos seeds.
- El Excel es un **subconjunto** del catálogo: el diagnosticar lista los planes que
  están en la web y no aparecen en el Excel (cable, legacy, etc.).
- El plan VTR de 1P solo telefonía no trae nombre Andes en el plan comercial: el seed
  lo deja vacío y lo marca con `nota`.
- Los seeds VTR llevan el campo `red` (`'HFC'`, `'FTTH'` o vacío): es lo que separa los
  grupos de la sección Planes entre HFC y Fibra Óptica (FTTH), y el importador lo usa
  en el diagnóstico.
- Los packs de streaming de Claro (`planesClaro.js`) incluyen TVN Play, OndaMedia y
  Storytel como plataformas exclusivas de Claro (el Excel solo lista las dos primeras).
- `syncKbPlanes.mjs` deja la KB alineada con el seed VTR. Después hay que publicar la
  base en el admin para actualizar la colección `conocimiento_portal`.

## E. Seeding y mantenimiento de Firestore

| Script | Función |
|---|---|
| `backfillEstadoCursada.mjs` | Rellena `migraciones` sin estado válido a "Migración Cursada" |
| `nutrir-apex.mjs` | Siembra `apex_aprendizaje` con ejemplos de tono |
| `nutrir-somos-clave.mjs` | Siembra `apex_aprendizaje` con extractos de Somos Clave |

> Estos scripts usan la configuración de Firebase embebida (proyecto `vtrclaroo-3c572`).

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
| `importar:planes` | `node scripts/importarPlanesXlsx.mjs` (análisis del Excel de planes) |
| `sync:kb-planes` | `node scripts/syncKbPlanes.mjs` (KB de planes ← seed VTR) |

## Archivos de datos intermedios

En `scripts/` hay JSON/HTML intermedios usados por los flujos de scraping
(`_cdp_payload.json`, `_ids-to-fetch.json`, `_known-ids.json`, `_missing_ids.json`,
`_sc-live-titles.json`, `_sample_respuesta.html`, `_sc_parts/`, `_faq_dumps/`). No son
necesarios para ejecutar la app.
