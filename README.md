# CLARO VTR CHILE — Sistema de Información

Portal interno de **gestión, consulta y capacitación** para la atención de clientes de
**VTR / Claro Chile**. Reúne en una sola aplicación web el catálogo de planes, la oferta de
streaming, la grilla de canales, los procedimientos técnicos y comerciales, simuladores de
los sistemas de contacto (Genesys, ANDES/Siebel) y un **asistente de IA ("Apex")** que
responde con base en una base de conocimiento propia.

> ⚠️ **Proyecto privado e interno.** Contiene información operativa y, en algunos archivos,
> credenciales. Ver [docs/11-seguridad.md](docs/11-seguridad.md) antes de compartirlo.

---

## Índice

| Documento | Contenido |
|---|---|
| [docs/01-vision-general.md](docs/01-vision-general.md) | Qué es, para quién y qué problemas resuelve |
| [docs/02-arquitectura.md](docs/02-arquitectura.md) | Arquitectura general y flujo de datos |
| [docs/03-frontend.md](docs/03-frontend.md) | Aplicación React (`vtr-web`) |
| [docs/04-cloud-functions.md](docs/04-cloud-functions.md) | Cloud Functions for Firebase |
| [docs/05-firestore.md](docs/05-firestore.md) | Modelo de datos y colecciones |
| [docs/06-asistente-apex.md](docs/06-asistente-apex.md) | Asistente de IA, RAG y aprendizaje continuo |
| [docs/08-integraciones.md](docs/08-integraciones.md) | Servicios externos integrados |
| [docs/09-despliegue.md](docs/09-despliegue.md) | Instalación, build y despliegue |
| [docs/10-scripts.md](docs/10-scripts.md) | Scripts de scraping, datos y assets |
| [docs/11-seguridad.md](docs/11-seguridad.md) | Secretos, reglas y recomendaciones |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 + `lucide-react` |
| Backend | Firebase (Cloud Functions v2, TypeScript) |
| Base de datos | Cloud Firestore |
| Autenticación | Firebase Auth (Google + Email/Password) |
| IA | Firebase AI Logic — backend Google AI (Gemini) |
| Hosting | Firebase Hosting (sirve `vtr-web/dist`) |
| Analítica | Firebase Analytics |

---

## Estructura del repositorio

```
vtr/
├─ vtr-web/                 # Aplicación web (React + Vite)
│  ├─ src/                  # Código fuente
│  │  ├─ App.jsx            # Shell principal del portal
│  │  ├─ AdminPage.jsx      # Panel de administración (/admin)
│  │  ├─ FormulariosPage.jsx# Formulario de migraciones (/formularios)
│  │  ├─ components/        # Componentes de UI (chat, simuladores, etc.)
│  │  ├─ asistente/         # Motor del asistente de IA + corpus de conocimiento
│  │  ├─ hooks/             # Hooks de React
│  │  └─ *Store.js          # Stores de Firestore (asesores, tipificaciones, …)
│  ├─ public/               # Assets estáticos servidos por la web
│  ├─ scripts/              # Utilidades de scraping / generación de datos
│  └─ index.html            # Punto de entrada de Vite
├─ functions/               # Cloud Functions (TypeScript)
│  └─ src/index.ts          # Funciones HTTP (noticias, comunicados, fastTargets)
├─ IA PARA VTR/             # Base de conocimiento y datasets del asistente
├─ firebase.json            # Configuración de Hosting, Functions, Firestore y Auth
├─ firestore.rules          # Reglas de seguridad de Firestore
├─ firestore.indexes.json   # Índices compuestos
└─ .firebaserc              # Proyecto Firebase por defecto
```

> Las carpetas `dist/`, `node_modules/`, `.firebase/` y los assets regenerables
> (`vtr-web/public/sc-assets/`) **no** se versionan. Ver [`.gitignore`](.gitignore) y
> [docs/10-scripts.md](docs/10-scripts.md).

---

## Funcionalidades principales

- **Catálogo de planes** — planes VTR y Claro (1P/2P/3P, fibra, TV, telefonía) con precios
  normales y promocionales, editables desde el panel de administración.
- **Streaming** — showcase de plataformas (Netflix, Disney+, HBO Max, Prime Video, etc.) con
  enlaces de activación por marca (VTR / Claro).
- **Grilla de canales** — guías de canales por paquete y región, con conteo de HD/SD y packs.
- **Comunicados y noticias** — publicación en tiempo real vía Firestore y confirmación de
  lectura por correo.
- **Tipificaciones** — bloc personal de tipificaciones con catálogo RAZÓN → SERVICIO → MOTIVO
  y exportación a Excel/CSV.
- **Asistente "Apex"** — chatbot con Gemini + RAG sobre la base de conocimiento del portal.
- **Simuladores** — Genesys (escritorio de agente), ANDES/Siebel (CRM) y Android TV.
- **Medidor de velocidad** — test de velocidad usando los objetivos de Fast.com (Netflix).

---

## Puesta en marcha rápida

### Requisitos

- Node.js 18 o superior (Functions usa Node 24).
- Una cuenta de Firebase con acceso al proyecto `vtrclaroo-3c572` (o el tuyo propio).
- `firebase-tools` para desplegar: `npm i -g firebase-tools`.

### 1. Aplicación web

```bash
cd vtr-web
npm install
cp .env.example .env.local   # y rellena las claves que necesites
npm run dev                  # servidor de desarrollo en http://localhost:5173
```

Compilar para producción:

```bash
npm run build                # genera vtr-web/dist
```

### 2. Cloud Functions

```bash
cd functions
npm install
npm run build                # compila TypeScript a lib/
```

### 3. Despliegue

```bash
firebase login
firebase use vtrclaroo-3c572
firebase deploy              # hosting + functions + firestore
```

Detalles y alternativas en [docs/09-despliegue.md](docs/09-despliegue.md).

---

## Variables de entorno

Definidas en [`vtr-web/.env.example`](vtr-web/.env.example):

| Variable | Uso |
|---|---|
| `VITE_TMDB_ACCESS_TOKEN` / `VITE_TMDB_API_KEY` | Metadatos de películas/series (TMDB) |
| `VITE_NETPLAY_SERVER` | URL del servidor de netplay (HTTPS/WSS) |
| `VITE_GIPHY_API_KEY` | GIFs del chat (Giphy) — opcional |
| `VITE_TENOR_API_KEY` | GIFs del chat (Tenor) — opcional |

La configuración de Firebase está embebida en el código del cliente
(`vtr-web/src/App.jsx`); los scripts de mantenimiento usan la misma configuración.

---

## Rutas de la aplicación

| Ruta | Página |
|---|---|
| `/` | Portal principal (`App.jsx`) |
| `/admin` | Panel de administración (`AdminPage.jsx`) |
| `/formularios` | Formulario de migraciones (`FormulariosPage.jsx`) |

El enrutado es manual, por `pathname`/`hash`, en `vtr-web/src/main.jsx`.

---

## Estado del proyecto

- La aplicación funciona como **SPA**; Hosting reescribe todas las rutas a `index.html`.
- Las reglas de Firestore (`firestore.rules`) están **abiertas** (`allow read, write: if true`):
  es un pendiente de seguridad antes de manejar datos sensibles.
  Ver [docs/11-seguridad.md](docs/11-seguridad.md).
- Existen archivos con credenciales reales en el entorno local; están excluidos del
  repositorio.

---

## Autor

**Adrián** ([@Adriavc15](https://github.com/Adriavc15)) — `adriangamervc@gmail.com`
