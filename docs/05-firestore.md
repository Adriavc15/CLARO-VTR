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
| `admins_autorizados` | `adminsAutorizados.js` | Correos con permiso de administrador (doc id = correo normalizado) |
| `asesores` | `asesoresStore.js` | Lista de asesores |
| `supervisores` | `supervisoresStore.js` | Lista de supervisores |
| `tipificaciones_bloc` | `tipificacionesStore.js` | Tipificaciones personales por correo |
| `migraciones` | `migracionesStore.js` | Registros del formulario de migraciones |
| `no_acepta_fibra` | `noAceptaFibraStore.js` | Registros de clientes que no aceptan el cambio a fibra |
| `no_venta_islas_movil` | `noVentaIslasMovilStore.js` | Registros de Ventas Isla / Transferencias al S2 14111 |
| `messenger_chats` (+ `mensajes`) | `messengerStore.js`, `MessengerApex.jsx` | Chats internos y sus mensajes |
| `mis_stickers` | `messengerStickers.js` | Stickers del chat |
| `messenger_stickers` | `messengerStickers.js` | Stickers compartidos |
| `catalogo_planes` | `planesLive.js` | Catálogo de planes **VTR** (sobrescribe la semilla). El catálogo **Claro** (`planesClaro.js`) es solo código: no tiene ruta de administración |
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
Ver [10-seguridad.md](10-seguridad.md).

## Patrón semilla + en vivo

Varios catálogos vienen definidos en el código (semilla) y se pueden sobrescribir desde
Firestore:

| Semilla (código) | En vivo (Firestore) |
|---|---|
| `planesSeed.js` (VTR) | `catalogo_planes` |
| `planesClaro.js` (Claro) | — (solo código) |
| `streamingShowcaseLive.js` (`SHOWCASE_SEED`) | `streaming_showcase` |
| `streamCatalogLive.js` | `catalogo_streaming` |
| `idsClaveSeed.js` | `ids_clave_vtr` |

Si la colección está vacía o falla la lectura, el portal usa la semilla. Así funciona incluso
sin haber cargado datos en Firestore.

> `catalogo_planes` guarda un documento por plan VTR con id `${grupo}__${slug(comercial)}`
> (p. ej. `2p-tv__internet-500-tv-premium`). El botón **Publicar catálogo inicial** del admin
> hace *merge* de la semilla: **no borra** documentos que ya no están en el seed, así que los
> planes dados de baja hay que eliminarlos a mano desde el admin.
>
> El catálogo Claro no se publica: se edita en `src/asistente/planesClaro.js` y llega al
> asistente por los docs RAG que se derivan de los dos seeds.
>
> Cada plan guarda además `red` (`'HFC'`, `'FTTH'` o vacío) y `nota` (aviso visible en la
> ficha del plan). `red` es lo que separa los grupos VTR en **HFC** y **Fibra Óptica (FTTH)**
> dentro de la sección Planes; si un documento antiguo no la tiene, el portal la deduce del
> nombre (`Internet 500` → HFC, `Fibra …` → FTTH).

## Cómo se escriben los datos

- **Panel `/admin`** → escribe catálogos y configuración (planes, streaming, IDs Clave,
  conocimiento de IA, usuarios).
- **Formularios** → `migraciones`, `no_acepta_fibra` y `no_venta_islas_movil` (además de
  `tipificaciones_bloc`).
- **Cloud Function `importarNoticias`** → `noticias` (desde Google Sheets, sin duplicar).
- **Scripts** (`vtr-web/scripts/*.mjs`) → siembran colecciones como `apex_aprendizaje`,
  `conocimiento_portal`, `training_examples`.
