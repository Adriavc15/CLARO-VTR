# 03 · Frontend (`vtr-web`)

Aplicación **React 18 + Vite 5 + Tailwind CSS 3**. Tema claro/oscuro (`darkMode: 'class'`).
Iconos con `lucide-react` y visor 3D con `@google/model-viewer`.

## Punto de entrada y rutas

`vtr-web/src/main.tsx` monta una de tres páginas según la URL (enrutado manual, sin
React Router). Las páginas se cargan con `React.lazy` + `Suspense`.

| Ruta | Página | Archivo |
|---|---|---|
| `/` | Portal principal | `src/App.tsx` |
| `/admin` | Panel de administración | `src/AdminPage.tsx` |
| `/formularios` | Formulario de migraciones | `src/FormulariosPage.tsx` |

Se aceptan tanto `pathname` como `hash` (`#admin`, `#formularios`).

## `App.tsx` — shell del portal

Es el archivo más grande (miles de líneas). Contiene:

- **Inicialización de Firebase** (`initializeApp`, `getFirestore`, `getAnalytics`).
- **Componentes y vistas en línea**: dashboard, comunicados/noticias, planes, streaming,
  grilla de canales, modem, pasos, contrataciones, imágenes, enlaces, etc.
- **Utilidades de datos**: publicación/edición/borrado de noticias, perfil de admin, lectores,
  lecturas, avatares y **subida de imágenes a imgbb**.
- **Navegación**: `navigationItems` y `renderContent` que mapea `activeSection` a cada vista.
- **Exports** reutilizados por otros módulos (por ejemplo `db`).

Secciones principales (`activeSection`): `dashboard`, `noticias`, `simuladores`
(`androidtv`, `genesys`, `andes`), `apex`, `credentials`, `systems` (IDs Clave),
`links` (aplicaciones), `images`, `streaming`, `planes`, `modem`, `n1q` (plantillas),
`mensajes`, `pasos` y `contrataciones`.

## Componentes (`src/components/`)

| Componente | Función |
|---|---|
| `ChatbotAndes.jsx` | Interfaz del asistente **Apex** (chat Gemini + RAG) |
| `MessengerApex.jsx` | Messenger interno (chats en Firestore + subcolección `mensajes`) |
| `AndroidTvInterface.jsx` | Simulador de la interfaz de Android TV / TV Box |
| `GenesysSimulador.jsx` | Simulador del escritorio del agente (Genesys) |
| `AndesSimulador.jsx` | Simulador del CRM ANDES/Siebel |
| `AsistentePasos.jsx` | Asistente paso a paso de diagnóstico técnico |
| `MedidorVelocidad.jsx` | Test de velocidad (objetivos Fast.com) |
| `AplicacionesExcel.jsx` | Lanzador de aplicaciones (usa `aplicacionesCatalogo.js`) |
| `TipificacionesPanel.jsx` | Panel de tipificaciones |
| `SelectorTipificacion.jsx` | Selector en cascada RAZÓN → SERVICIO → MOTIVO |
| `PanelMediaWhatsApp.jsx` | Panel de stickers, emojis y GIFs |
| `ModalSomosClave.jsx` | Modal de artículo de "Somos Clave" |
| `AvatarPerfilPicker.jsx` | Selector/subida de foto de perfil |
| `BotonGoogle.jsx` | Botón "Continuar con Google" |
| `IconoAndroid.jsx` | Icono de Android (SVG) |
| `Admin*` | Paneles de administración (ver más abajo) |

### Componentes de administración (`Admin*`)

`AdminAsesores`, `AdminSupervisores`, `AdminListaNombres`, `AdminAdminsAutorizados`,
`AdminConocimientoIA`, `AdminAprendizajeContinuo`, `AdminTipificaciones`, `AdminPlanes`,
`AdminStreamingShowcase`, `AdminIdsClave`, `AdminMigraciones` (+ `AdminMigraciones.css`).

## Stores y módulos de estado (raíz de `src/`)

| Archivo | Colección / función |
|---|---|
| `messengerStore.js` | `messenger_chats` (+ `mensajes`), `lectores` |
| `messengerAuth.js` | Identidad (Firebase Auth) del messenger |
| `adminsAutorizados.js` | `admins_autorizados` (admin principal configurado) |
| `asesoresStore.js` | `asesores` |
| `supervisoresStore.js` | `supervisores` |
| `listaNombresStore.js` | Store genérico de listas de nombres |
| `tipificacionesStore.js` | `tipificaciones_bloc` |
| `tipificacionesCatalogo.js` | Catálogo estático de tipificaciones |
| `migracionesStore.js` | `migraciones` |
| `aplicacionesCatalogo.js` | Catálogo de aplicaciones internas/externas |

## Asistente (`src/asistente/`)

Contiene el motor del asistente y toda la base de conocimiento. Incluye:

- **Razonamiento/retrieval:** `conocimientoAndes.js`, `casuisticas.js`, `chatMemoria.js`,
  `sugerenciasPredictivas.js`, `entrenamientoApex.js`.
- **Módulos "live" (Firestore):** `conocimientoLive.js`, `chatAprendizajeLive.js`,
  `aprendizajeContinuo.js`, `conocimientoKbAndes.js`, `contenidosSomosClave.js`,
  `conocimientoSomosClave.js`, `idsClaveLive.js`, `planesLive.js`, `streamCatalogLive.js`,
  `streamingShowcaseLive.js`.
- **Datos del portal:** `indicePortal.js`, `guiasPortal.js`, `assetsGuias.js`, procedimientos
  (`procedimientoPago.js`, `procedimientoTraslado.js`, `procedimientoCambioTitular.js`,
  `procedimientoInternetFtthHfc.js`), `boletaAgosto.js`, `fiestasPatrias.js`,
  `faqAmpliadas.js`, `sucursalesHorarios.js`.
- **Corpus de diálogo:** 16 bloques `corpusBloque01.js` … `corpusBloque16.js` +
  `corpusBloqueGenerado1000.js` y otros corpus temáticos.
- **Catálogos:** `planesSeed.js`, `planesClaro.js`, `grillaCanales.js`, `packsCable.js`,
  `catalogoPlanesStreaming.js`.

Detalle completo en [06-asistente-apex.md](06-asistente-apex.md).

## Hooks

- `src/hooks/useBodyScrollLock.js` — bloquea el scroll del `body` cuando hay modales abiertos.

## Estilos

- `src/index.css` — estilos globales.
- `src/asistente/asistente.css`, `chatApex.css`, `somosClaveModal.css` — estilos por módulo.
- Tailwind configurado en `tailwind.config.js`, PostCSS en `postcss.config.js`.

## Configuración de Vite (`vite.config.js`)

- Plugin `@vitejs/plugin-react`.
- **Middleware propio** `somos-clave-assets`: sirve `/sc-assets/{id}/{archivo}` desde
  `public/sc-assets/{id}` (o desde las carpetas `*_files` junto a los HTML guardados).
- **Proxy de desarrollo** `/emojigg-api` → `https://emoji.gg/api` (evita CORS en dev).
- **Watcher** que ignora `*.sfc`, `*.smc`, `*.zip` (en Windows bloquean el watcher con EBUSY).
- `assetsInclude: ['**/*.png']`.
