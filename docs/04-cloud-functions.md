# 04 · Cloud Functions (`functions/`)

Backend puntual en **TypeScript** con **Cloud Functions for Firebase v2** (triggers HTTP
`onRequest`), runtime **Node 24**.

## Cómo está organizado

```
functions/
├─ src/index.ts        # único archivo fuente
├─ lib/                # salida compilada (tsc) — NO versionada
├─ package.json        # scripts y dependencias
├─ tsconfig.json       # compila src → lib (NodeNext, target es2017, strict)
├─ tsconfig.dev.json
└─ .eslintrc.js
```

- **Build:** `npm run build` → `tsc` a `lib/`. `main` = `lib/index.js`.
- **Lint:** `npm run lint` (ESLint con config de Google + TypeScript).
- **Predeploy** (`firebase.json`): `npm run lint` y luego `npm run build`.
- `setGlobalOptions({ maxInstances: 10 })` limita la concurrencia.
- Dependencias: `firebase-admin`, `firebase-functions`, `@google-cloud/firestore` (requerido por firebase-admin v14+).
- Usa el `fetch` global (sin axios) y `Buffer` de Node.
- Región de despliegue: `us-central1`.

## Funciones exportadas

Todas son `onRequest({ cors: true })` (HTTP, CORS habilitado).

### `importarNoticias`
**Ruta:** `https://us-central1-vtrclaroo-3c572.cloudfunctions.net/importarNoticias`

- Llama al Apps Script (`.../exec?action=listNoticias`) y espera `{ ok: true, items: [...] }`.
- Por cada item con `src` no vacío, comprueba si ya existe en Firestore (`noticias` con el
  mismo `src`) para **no duplicar**.
- Inserta en la colección `noticias` con `categoria`, `titulo`, `descripcion`, `src`,
  `driveUrl`, `fecha` y `creado`.
- Si `fecha` viene en `dd/mm/yyyy` se usa como fecha; si no, `serverTimestamp()`.
- Devuelve `{ ok, importados, omitidos, total }`.

### `comunicados`
**Ruta:** `https://us-central1-vtrclaroo-3c572.cloudfunctions.net/comunicados`

Función con dos modos:

1. **Proxy de imagen** — si la ruta termina en `/imagen` y llega `?fileId=`, descarga el
   archivo de Google Drive (`uc?export=view&id=<fileId>`) y devuelve los bytes con su
   `Content-Type` y caché de 1 día. Sirve para mostrar imágenes de Drive sin problemas CORS.
2. **Listado de carpeta** — si no, lee la carpeta pública de Drive
   (`CARPETA_COMUNICADOS_ID`) y parsea el HTML para devolver
   `{ ok: true, items: [{ name, id, src }] }`, donde `src` apunta al modo proxy de imagen.

### `fastTargets`
**Ruta:** `.../fastTargets?urlCount=8`

- Obtiene los objetivos (targets) de Netflix OCA desde Fast.com, que no expone CORS.
- Pasos: descarga `https://fast.com/`, extrae el bundle JS, saca el `token`, y llama a
  `https://api.fast.com/netflix/speedtest/v2`.
- `urlCount` se limita entre 1 y 8 (por defecto 5). Responde `{ ok: true, targets: [urls] }`
  con `Cache-Control: no-store`. Se usa desde el **medidor de velocidad** del portal.

## Constantes relevantes (`src/index.ts`)

| Constante | Valor / uso |
|---|---|
| `CARPETA_COMUNICADOS_ID` | ID de la carpeta de Drive con los comunicados |
| `FUNCION_URL` | URL base de la función `comunicados` |
| `LISTA_NOTICIAS_URL` | Endpoint del Apps Script que lista noticias |

## Desplegar solo las funciones

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## Emuladores locales

```bash
cd functions
npm run serve    # build + firebase emulators:start --only functions
```
