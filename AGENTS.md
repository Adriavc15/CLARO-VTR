# Guía para Agentes de IA

Información específica para agentes de IA (Devin, Claude, etc.) que trabajen en este proyecto.

## Resumen del Proyecto

**CLARO VTR CHILE** — Portal interno de gestión, consulta y capacitación para atención de clientes de VTR/Claro Chile. Aplicación web React + Firebase con asistente de IA (Gemini + RAG).

## Stack Tecnológico

- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3 (en `vtr-web/`)
- **Backend:** Cloud Functions for Firebase v2 + TypeScript (en `functions/`)
- **Base de datos:** Cloud Firestore
- **IA:** Firebase AI Logic + Google AI (Gemini)
- **Hosting:** Firebase Hosting

## Comandos de Build y Verificación

### Frontend (vtr-web)
```bash
cd vtr-web
npm install
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build
```

### Backend (functions)
```bash
cd functions
npm install
npm run build            # Compila TypeScript a lib/
```

### Despliegue
```bash
firebase deploy          # Hosting + Functions + Firestore
firebase deploy --only hosting
firebase deploy --only functions
```

## Estructura de Archivos Clave

- `vtr-web/src/App.jsx` — Shell principal del portal
- `vtr-web/src/AdminPage.jsx` — Panel de administración
- `vtr-web/src/components/` — Componentes de UI
- `vtr-web/src/asistente/` — Motor del asistente de IA + corpus de conocimiento
- `functions/src/index.ts` — Cloud Functions
- `firebase.json` — Configuración de Firebase
- `firestore.rules` — Reglas de seguridad de Firestore

## Convenciones de Código

- **Idioma:** español para UI y comentarios
- **Componentes React:** archivos `.jsx` en `src/components/`
- **Estado compartido:** stores en `src/*Store.js` o módulos `*Live.js`
- **Estilos:** Tailwind CSS, respetar modo claro/oscuro (`dark:`)
- **Firestore:** patrón *semilla + en vivo* (valor por defecto en código, override desde Firestore)
- **Marca:** usar `filtroMarca.js` para separar contenido VTR y Claro

## Archivos Ignorados por Git

- `dist/`, `node_modules/`, `.firebase/`
- `vtr-web/public/sc-assets/` (assets regenerables)
- `.env.local`, `.env.*.local`
- Ver `.gitignore` para detalles completos

## Variables de Entorno

Definidas en `vtr-web/.env.example`:
- `VITE_TMDB_ACCESS_TOKEN` / `VITE_TMDB_API_KEY` — Metadatos de películas/series
- `VITE_GIPHY_API_KEY` — GIFs del chat (opcional)
- `VITE_TENOR_API_KEY` — GIFs del chat (opcional)

## Flujo de Trabajo para Cambios

1. **Exploración:** Revisa `docs/` para entender arquitectura y patrones
2. **Identificación:** Ubica archivos relevantes usando la estructura descrita
3. **Implementación:**
   - Si es componente nuevo, crea en `vtr-web/src/components/`
   - Si requiere datos, extiende store o crea `*Live.js`
   - Si añade conocimiento al asistente, actualiza `indicePortal.js` y/o `conocimiento_portal`
4. **Verificación:**
   - Compila: `cd vtr-web && npm run build`
   - Compila functions: `cd functions && npm run build`
5. **Documentación:** Actualiza `docs/` si el cambio es significativo

## Documentación Detallada

Ver `docs/` para documentación específica:
- `01-vision-general.md` — Visión general del proyecto
- `02-arquitectura.md` — Arquitectura y flujo de datos
- `03-frontend.md` — Frontend React
- `04-cloud-functions.md` — Cloud Functions
- `05-firestore.md` — Modelo de datos Firestore
- `06-asistente-apex.md` — Asistente de IA
- `07-integraciones.md` — Integraciones externas
- `08-despliegue.md` — Despliegue
- `09-scripts.md` — Scripts de scraping/datos
- `10-seguridad.md` — Seguridad y secretos

## Seguridad

- **Nunca** commitear credenciales o `.env.local`
- Las reglas de Firestore están actualmente abiertas (`allow read, write: if true`) — pendiente de seguridad
- Ver `docs/10-seguridad.md` para detalles

## CI/CD

- GitHub Actions en `.github/workflows/node.js.yml`
- Ejecuta en push/PR a `main`
- Prueba con Node 18.x, 20.x, 22.x
- Ejecuta `npm ci`, `npm run build --if-present`, `npm test`

## Notas Importantes

- El proyecto usa enrutado manual por `pathname`/`hash` en `vtr-web/src/main.tsx`
- La configuración de Firebase está embebida en el código del cliente
- Existen scripts de scraping y generación de datos en `vtr-web/scripts/`
- La base de conocimiento del asistente está en `IA PARA VTR/`
