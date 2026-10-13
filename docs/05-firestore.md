# 05 · Base de datos (Cloud Firestore)

Base de datos **Cloud Firestore** del proyecto `vtrclaroo-3c572`, base `(default)`, ubicación
`nam5`. Todo el frontend lee y escribe con `onSnapshot` cuando necesita tiempo real, por lo
que la mayoría de cambios se reflejan sin recargar la página.

## Colecciones

| Colección | Usada por | Contenido |
|---|---|---|
| `noticias` | `App.jsx`, Cloud Function `importarNoticias`, `conocimientoLive.js` | Comunicados y noticias (categoría, título, descripción, imagen, popup, fecha) |
| `lectores` | `App.jsx` | Correos autorizados a confirmar lectura + avatar |
| `lecturas` | `App.jsx` | Registro de lectura por correo (doc id `noticiaId__email`) |
| `admins_autorizados` | `adminsAutorizados.js` | Correos con permiso de administrador |
| `asesores` | `asesoresStore.js` | Lista de asesores |
| `supervisores` | `supervisoresStore.js` | Lista de supervisores |
| `tipificaciones_bloc` | `tipificacionesStore.js` | Tipificaciones personales por correo |
| `migraciones` | `migracionesStore.js` | Registros del formulario de migraciones |
| `messenger_chats` (+ `mensajes`) | `messengerStore.js`, `MessengerApex.jsx` | Chats internos y sus mensajes |
| `mis_stickers` | `messengerStickers.js` | Stickers del chat |
| `messenger_stickers` | `messengerStickers.js` | Stickers compartidos |
| `catalogo_planes` | `planesLive.js` | Catálogo de planes (sobrescribe la semilla) |
| `catalogo_streaming` | `streamCatalogLive.js` | Catálogo de plataformas de streaming |
| `streaming_showcase` | `streamingShowcaseLive.js` | Tarjetas del showcase de streaming |
| `ids_clave_vtr` | `idsClaveLive.js` | Índice de artículos "IDs Clave VTR" |
| `conocimiento_portal` | `conocimientoLive.js`, `conocimientoKbAndes.js`, `aprendizajeContinuo.js` | **Índice RAG** del asistente (guías, KB, artículos aprobados) |
| `chat_conversations` | `aprendizajeContinuo.js` | Turnos de conversación (log) |
| `knowledge_candidates` | `aprendizajeContinuo.js` | Candidatos de conocimiento pendientes de aprobación |
| `apex_memoria` | `chatAprendizajeLive.js` | Memoria del asistente por usuario |
| `apex_aprendizaje` | `chatAprendizajeLive.js` | Ejemplos aprendidos |
| `training_examples` | `conocimientoKbAndes.js`, `trainingEjemplosNl.js` | Ejemplos de entrenamiento (NL) |

## Índices compuestos

Definidos en `firestore.indexes.json`:

1. `messenger_chats`: `participants` (array `CONTAINS`) ASC + `lastAt` DESC.
2. `mis_stickers`: `by` ASC + `createdAt` DESC.

## Reglas de seguridad (`firestore.rules`)

Actualmente las reglas están **abiertas** (modo desarrollo):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ Esto significa que **cualquier persona** con la configuración del proyecto podría leer y
escribir en la base de datos sin autenticarse. Es un **pendiente crítico** para producción.
Ver [11-seguridad.md](11-seguridad.md).

## Patrón semilla + en vivo

Varios catálogos vienen definidos en el código (semilla) y se pueden sobrescribir desde
Firestore:

| Semilla (código) | En vivo (Firestore) |
|---|---|
| `planesSeed.js` / `planesClaro.js` | `catalogo_planes` |
| `streamingShowcaseLive.js` (`SHOWCASE_SEED`) | `streaming_showcase` |
| `streamCatalogLive.js` | `catalogo_streaming` |
| `idsClaveSeed.js` | `ids_clave_vtr` |

Si la colección está vacía o falla la lectura, el portal usa la semilla. Así funciona incluso
sin haber cargado datos en Firestore.

## Cómo se escriben los datos

- **Panel `/admin`** → escribe catálogos y configuración (planes, streaming, IDs Clave,
  conocimiento de IA, usuarios).
- **Formularios** → `migraciones` (y `tipificaciones_bloc`).
- **Cloud Function `importarNoticias`** → `noticias` (desde Google Sheets, sin duplicar).
- **Scripts** (`vtr-web/scripts/*.mjs`) → siembran colecciones como `apex_aprendizaje`,
  `conocimiento_portal`, `training_examples`.
