# 09 · Instalación y despliegue

## Requisitos

| Herramienta | Versión | Para |
|---|---|---|
| Node.js | 18+ (Functions usa 24) | web, functions, netplay |
| npm | 9+ | dependencias |
| Firebase CLI | última | `npm i -g firebase-tools` |
| gcloud CLI | opcional | despliegue del netplay en Cloud Run |
| Git | — | control de versiones |

## 1. Aplicación web (`vtr-web`)

```bash
cd vtr-web
npm install
cp .env.example .env.local     # rellena las claves necesarias
npm run dev                    # http://localhost:5173
```

Scripts de `package.json`:

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Compila a `vtr-web/dist` |
| `npm run preview` | Previsualiza el build |
| `npm run extraer:sucursales` | Regenera datos de sucursales |

## 2. Cloud Functions (`functions`)

```bash
cd functions
npm install
npm run build          # tsc -> lib/
```

Scripts útiles: `npm run lint`, `npm run build`, `npm run serve` (emulador),
`npm run deploy` (`firebase deploy --only functions`), `npm run logs`.

## 3. Netplay (`netplay-server`) — opcional

```bash
cd netplay-server
npm install
npm start              # puerto 3000 (o $PORT)
```

Para exponerlo se usa `VITE_NETPLAY_SERVER` apuntando a una URL pública (HTTPS/WSS).

## 4. Despliegue completo con Firebase

Configuración en `firebase.json`:

- **Hosting** → publica `vtr-web/dist`, con rewrite `** → /index.html` (SPA).
- **Functions** → código base `default`, con predeploy (lint + build).
- **Firestore** → `firestore.rules` + `firestore.indexes.json`.
- **Auth** → proveedores Google y Email/Password.

Pasos:

```bash
# desde la raíz del repositorio
firebase login
firebase use vtrclaroo-3c572        # o `firebase use --add`

cd vtr-web && npm install && npm run build && cd ..
cd functions && npm install && npm run build && cd ..

firebase deploy                    # hosting + functions + firestore + auth
```

Despliegues parciales:

```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
```

> `vtr-web/dist` debe existir antes de desplegar Hosting. Como `dist/` está en `.gitignore`,
> hay que ejecutar `npm run build` en la máquina que despliega.

## 5. Netplay en Cloud Run

```bash
cd netplay-server
gcloud run deploy vtr-netplay \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

El `Dockerfile` expone el puerto **8080** y arranca `node server.js`.

## 6. Emuladores locales (opcional)

```bash
firebase emulators:start                 # Firestore, Functions, Hosting, Auth
cd functions && npm run serve            # solo functions
```

## Orden recomendado para un despliegue desde cero

1. `firebase login` y `firebase use <proyecto>`.
2. Configurar `.env.local` en `vtr-web`.
3. `npm run build` en `vtr-web` y en `functions`.
4. `firebase deploy`.
5. (Opcional) desplegar `netplay-server` y actualizar `VITE_NETPLAY_SERVER` + rebuild.
6. (Recomendado) cerrar las reglas de Firestore. Ver [11-seguridad.md](11-seguridad.md).

## Qué NO se versiona (y hay que regenerar)

| Ruta ignorada | Cómo se obtiene |
|---|---|
| `vtr-web/node_modules/`, `functions/node_modules/`, `netplay-server/node_modules/` | `npm install` |
| `vtr-web/dist/`, `functions/lib/` | `npm run build` |
| `.firebase/` | cache local de Firebase |
| `vtr-web/public/sc-assets/` | scripts de scraping de "Somos Clave" |
| `vtr-web/public/juegos/geometry-dash/` | proyecto de terceros |
| Carpetas originales de juegos y ROMs `*.sfc` | copiar/extraer localmente |
| Archivos con credenciales (`CLARO VTR CHILE ENLACES ID*.md`, `_inbenta_knowledge.js`) | mantener en local |
