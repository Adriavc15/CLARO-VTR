# 02 · Arquitectura

## Vista general

```
                          ┌──────────────────────────────────────────┐
                          │            Navegador del usuario          │
                          │  React + Vite + Tailwind (vtr-web/dist)   │
                          └───────────────┬──────────────────────────┘
                                          │ HTTPS
              ┌───────────────────────────┼────────────────────────────┐
              │                           │                            │
              ▼                           ▼                            ▼
   ┌────────────────────┐     ┌────────────────────┐      ┌──────────────────────┐
   │  Firebase Hosting   │     │  Cloud Firestore    │      │  Firebase AI (Gemini) │
   │  SPA (rewrite → /)  │     │  datos en tiempo    │      │  asistente "Apex"     │
   └────────────────────┘     │  real (onSnapshot)  │      └──────────────────────┘
              │               └────────────────────┘
              │                           ▲
              ▼                           │ firebase-admin
   ┌─────────────────────────────────────────────────────────────┐
   │       Cloud Functions for Firebase (v2, TypeScript)          │
   │  importarNoticias · comunicados · fastTargets               │
   └───────────────┬───────────────────────────────┬─────────────┘
                   │                               │
                   ▼                               ▼
      ┌───────────────────────┐        ┌───────────────────────────┐
      │  Google Apps Script    │        │  Google Drive             │
      │  + Google Sheets       │        │  (comunicados, imágenes)  │
      └───────────────────────┘        └───────────────────────────┘
```

## Componentes

### 1. Frontend — `vtr-web/`
Aplicación **React 18 + Vite 5** con estilos **Tailwind CSS**. Es una **SPA** sin enrutador
externo: `main.jsx` decide qué página renderizar según `pathname`/`hash`
(`/`, `/admin`, `/formularios`). Se compila a `vtr-web/dist`, que es lo que sirve
Firebase Hosting.

### 2. Cloud Functions — `functions/`
Funciones **HTTP v2** escritas en **TypeScript** (Node 24), que actúan como *backend*
puntual:

- `importarNoticias` — importa noticias desde Google Sheets a Firestore.
- `comunicados` — lista la carpeta de Drive de comunicados y hace de proxy de imágenes.
- `fastTargets` — obtiene objetivos de velocidad de Fast.com (evita el bloqueo CORS).

Detalle en [04-cloud-functions.md](04-cloud-functions.md).

### 3. Base de datos — Cloud Firestore
Fuente de datos en tiempo real. El frontend se suscribe con `onSnapshot`, de modo que los
cambios (nuevos comunicados, planes, conocimiento) aparecen sin recargar. Ver
[05-firestore.md](05-firestore.md).

### 4. Autenticación — Firebase Auth
Proveedores **Google** y **Email/Password** (`firebase.json` → `auth`). Se usa para el panel
de administración y el messenger interno. Dominios autorizados: `localhost`,
`vtrclaroo-3c572.web.app`, `vtrclaroo-3c572.firebaseapp.com`.

### 5. Asistente "Apex" — Firebase AI Logic
El chatbot usa el backend **Google AI** de Firebase AI Logic (`firebase/ai`) con un modelo
Gemini, combinado con **RAG** (búsqueda sobre la base de conocimiento del portal). Ver
[06-asistente-apex.md](06-asistente-apex.md).

## Patrón "semilla + en vivo" (seed + live)

Una decisión de diseño transversal: muchos catálogos vienen **definidos en el código** como
valor por defecto (*seed*) y a la vez se pueden **sobrescribir desde Firestore** (*live*).

Ejemplos:

| Semilla (código) | En vivo (Firestore) |
|---|---|
| `asistente/planesSeed.js` | `asistente/planesLive.js` → `catalogo_planes` |
| `asistente/streamingShowcaseLive.js` (`SHOWCASE_SEED`) | `streaming_showcase` |
| `asistente/streamCatalogLive.js` | `catalogo_streaming` |
| `asistente/idsClaveSeed.js` | `asistente/idsClaveLive.js` → `ids_clave_vtr` |

Si Firestore está vacío o falla, el portal usa el valor semilla; si hay datos, estos mandan.
Así el portal funciona incluso sin haber "sembrado" la base de datos.

## Flujo típico de datos

1. El **administrador** edita un catálogo en `/admin` → se escribe en Firestore.
2. El frontend suscrito (`onSnapshot`) recibe el cambio → la UI se actualiza sin recargar.
3. Un **formulario** público/interno envía datos a una Cloud Function o a un **Apps Script**
   (Google Sheets) para registros.
4. Los **comunicados** se listan desde Google Drive a través de la función `comunicados`.
5. El **asistente** consulta la colección `conocimiento_portal` (más el corpus local) para
   generar respuestas y registrar su aprendizaje.

## Repositorio vs. despliegue

- **Repositorio Git:** código fuente, configuración de Firebase, documentación y assets
  seleccionados.
- **No versionado** (ver `.gitignore`): `node_modules/`, `dist/`, `.firebase/`, assets
  regenerables de scraping y archivos con secretos.
- **Desplegado:** Firebase Hosting (web) y Cloud Functions (backend).
