# 07 · Juegos y netplay

El portal incluye un módulo de juegos con estética **PS5**, accesible en `/juego`, tanto como
herramienta de pausa/entretenimiento como escaparate técnico (emulación en el navegador).

## Componentes (`vtr-web/src/juegos/`)

| Archivo | Qué es |
|---|---|
| `JuegosPage.jsx` | Hub estilo PS5; catálogo `JUEGOS`, apps y accesos |
| `BibliotecaJuegos.jsx` | Biblioteca tipo PS5 (pestañas, búsqueda, favoritos en `localStorage`) |
| `SnesEmulator.jsx` | Envoltorio de **EmulatorJS** para SNES, con soporte de netplay |
| `ZamnEmulator.jsx` | Variante para "Zombies Ate My Neighbors" |
| `ZumaDeluxe.jsx` | Recreación jugable de *Zuma Deluxe* |
| `PurblePlace.jsx` | Recreación de *Purble Place* (Pairs, Comfy Cakes, Purble Shop) |
| `GeometryDash.jsx` | Recreación de *Geometry Dash* |
| `ZombiesAteMyNeighbors.jsx` | Implementación propia del clásico de SNES |
| `purbleCakeLayers.json` | Definición de capas del minijuego "Comfy Cakes" |

### Emulador SNES
`SnesEmulator.jsx` usa **EmulatorJS** (`https://cdn.emulatorjs.org/stable/data/`) y expone
`SNES_GAMES` (por ejemplo `smw`, `zamn`, `aladdin`) con el archivo de ROM de cada uno. Las ROMs
se sirven desde `vtr-web/public/juegos/{juego}/` (no se versionan por derechos de autor, ver
[11-seguridad.md](11-seguridad.md)).

### Netplay
El servidor se elige con la variable `VITE_NETPLAY_SERVER` y se recuerda en `localStorage`.
El netplay usa **WebRTC** (los servidores ICE/STUN/TURN se definen en `SnesEmulator.jsx`).

## Servidor de netplay (`netplay-server/`)

Servicio independiente de **señalización** (no transporta el videojuego): Node.js + **Express**
+ **Socket.IO**. La partida es **peer-to-peer** por WebRTC; el servidor solo intercambia
ofertas/respuestas/candidatos y lista salas.

### HTTP

| Ruta | Respuesta |
|---|---|
| `GET /` | Texto `"VTR EmulatorJS Netplay OK"` |
| `GET /health` | `{ ok: true, rooms: <n> }` |
| `GET /list?game_id=<id>` | JSON con las salas abiertas del juego (nombre, jugadores, dueño, si tiene clave) |

### Eventos de Socket.IO

`open-room` (crear), `join-room` (entrar; valida clave y capacidad), `leave-room`,
`webrtc-signal` (relay de offer/answer/candidate), `data-message`, `snapshot`, `input` y
`disconnect`. Si el dueño de la sala se va, se reasigna la propiedad y se renegocia la conexión.

### Detalles de implementación

- Salas en **memoria** (mapa `rooms`); un `setInterval` cada 60 s limpia salas vacías.
- **CORS abierto** (`origin: '*'`) para Express y Socket.IO.
- Escucha en `0.0.0.0`, puerto `PORT` (por defecto `3000`; en Docker, `8080`).
- Lee `x-forwarded-for`/`x-real-ip` para detectar la IP del cliente detrás de un proxy.
- Dependencias: `express ^4`, `socket.io ^4`, `cors ^2`. Requiere **Node ≥ 18**.

### Ejecutar localmente

```bash
cd netplay-server
npm install
npm start          # http://localhost:3000
```

### Desplegar en Cloud Run

El `Dockerfile` usa `node:22-alpine`, instala dependencias de producción, expone `8080` y
ejecuta `node server.js`. Un despliegue típico:

```bash
cd netplay-server
gcloud run deploy vtr-netplay --source . --region us-central1 --allow-unauthenticated
```

Luego apunta `VITE_NETPLAY_SERVER` en `vtr-web/.env.local` (y en el build de producción) a la
URL resultante, por ejemplo `https://vtr-netplay-417392161995.us-central1.run.app/`.

## Assets de los juegos

Los assets de los juegos propios (Purble Place, Zuma, etc.) se **extraen** de las versiones
originales de escritorio mediante los scripts `extract-*.cjs` / `fix-*.cjs`
(ver [10-scripts.md](10-scripts.md)). Las carpetas originales **no** se versionan.
