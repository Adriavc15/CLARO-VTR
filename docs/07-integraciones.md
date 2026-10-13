# 08 · Integraciones externas

El portal se apoya en varios servicios externos. Esta tabla resume qué es cada uno, para qué se
usa y dónde vive en el código.

| Servicio | Uso | Dónde |
|---|---|---|
| **Google Apps Script + Google Sheets** | Formularios (N1, Básico, Requerimiento Crítico, Genesys, Noticias) y listado de noticias | `CODIGO_APPS_SCRIPT_GOOGLE_SHEETS.gs`; URL en `App.jsx` (`GOOGLE_SHEETS_URL`); lo consume la función `importarNoticias` |
| **Google Drive** | Carpeta de comunicados e imágenes | Cloud Function `comunicados` |
| **imgbb** (`api.imgbb.com`) | Subida de imágenes; el portal guarda la URL corta de `i.ibb.co` en Firestore | `App.jsx` (`subirImagenImgbb`, `IMGBB_API_KEY`) |
| **Fast.com / api.fast.com** | Objetivos de velocidad para el medidor | Cloud Function `fastTargets`; `MedidorVelocidad.jsx` |
| **Firebase AI Logic (Google AI / Gemini)** | Motor del asistente Apex | `ChatbotAndes.jsx` |
| **YouTube** | Videos de ayuda (embeds) | `App.jsx` |
| **Emoji.gg** | Emojis del chat (proxy en dev por CORS) | `vite.config.js` (`/emojigg-api`), panel de emojis |
| **Giphy / Tenor** | GIFs del chat (opcional) | Variables `VITE_GIPHY_API_KEY`, `VITE_TENOR_API_KEY` |
| **ipapi.co** | Geolocalización aproximada | `App.jsx` |
| **Google favicons** (`google.com/s2/favicons`) | Iconos de aplicaciones | `aplicacionesCatalogo` / `AplicacionesExcel.jsx` |
| **TMDB** | Metadatos de películas/series (opcional) | Variables `VITE_TMDB_*` |
| **EmulatorJS** (`cdn.emulatorjs.org`) | Emulador SNES en el navegador | `juegos/SnesEmulator.jsx` |
| **Servidor de netplay** (Cloud Run) | Señalización WebRTC para juegos online | `netplay-server/`; variable `VITE_NETPLAY_SERVER` |
| **mii.nxw.pw** | Assets para el creador de Mii | `Mii Creator.html` |
| **Inbenta KM API** (vía `somosclave.cl`) | Fuente de los artículos "Somos Clave" (scraping) | `vtr-web/scripts/` |

## Apps Script (`CODIGO_APPS_SCRIPT_GOOGLE_SHEETS.gs`)

Script de Google Sheets que actúa como backend ligero de formularios:

- Crea/valida pestañas **N1**, **Basico**, **RequerimientoCritico**, **Genesys** y **Noticias**
  con sus encabezados.
- `doGet`:
  - `action=listComunicados` — lista archivos de la carpeta de Drive.
  - `action=listNoticias` — devuelve las noticias (soporta JSONP con `callback`).
  - `action=testEvidencia` — prueba de escritura de evidencia.
- `doPost` — recibe envíos según el campo `hoja`. Genesys sube una captura a Drive y guarda su
  URL. Noticias soporta `publicar`, `eliminar` y `actualizar`.
- Protecciones: `clean_()` evita inyección de fórmulas y `forzarTexto_()` fuerza texto en
  RUT/teléfono/observaciones; marca de tiempo en `America/Lima`.

**Despliegue del script:** en el editor de Apps Script, *Implementar → Aplicación web*
(*Ejecutar como: yo*, *Acceso: cualquiera*) y pegar la URL `/exec` en `GOOGLE_SHEETS_URL` de
`App.jsx`.

## Notas

- Varias integraciones usan claves embebidas en el cliente (imgbb, Firebase). Al ser una app
  de navegador, están expuestas; conviene restringirlas por dominio/API cuando aplique.
- Los datos operativos sensibles (credenciales de portales internos) se mantienen fuera del
  repositorio. Ver [11-seguridad.md](11-seguridad.md).
