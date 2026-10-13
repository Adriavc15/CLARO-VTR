# Contribuir

Guía breve para trabajar en el repositorio **CLARO-VTR**.

## Estructura rápida

```
vtr-web/         Aplicación React (frontend)
functions/       Cloud Functions (TypeScript)
netplay-server/  Servidor de netplay (Node + Socket.IO)
docs/            Documentación
IA PARA VTR/     Datasets y KB del asistente
```

## Puesta en marcha

```bash
cd vtr-web && npm install && npm run dev      # frontend
cd functions && npm install && npm run build  # backend
```

## Convenciones de código

- **Idioma de la UI:** español (nombres de variables y textos en español, coherente con el
  resto del código).
- **Componentes React:** archivos `.jsx` en `src/components/`; el estado compartido y los
  accesos a Firestore viven en stores (`src/*Store.js`) o módulos `*Live.js`.
- **Tailwind** para estilos; respetar el modo claro/oscuro (`dark:`).
- **Firestore:** seguir el patrón *semilla + en vivo* (valor por defecto en el código, override
  desde Firestore).
- **Marca:** usar `filtroMarca.js` para separar contenido VTR y Claro.

## Al añadir una sección al portal

1. Añade la vista y su `activeSection` en `App.jsx` (y en `navigationItems` / `renderContent`).
2. Si tiene datos, crea (o extiende) un store/`*Live.js`.
3. Si aporta conocimiento al asistente, súmalo a `indicePortal.js` y/o a
   `conocimiento_portal`.
4. Documenta el cambio en `docs/` si aplica.

## Commits

Mensajes en imperativo y descriptivos. Ejemplos:

```
Añade filtro por región en la grilla de canales
Corrige carga de planes Claro en modo oscuro
Documenta el flujo de aprendizaje continuo del asistente
```

## Reglas de oro

- **No** subas credenciales ni `.env.local`. Ver [docs/11-seguridad.md](docs/11-seguridad.md).
- **No** confíes en assets pesados: los regenerables están en `.gitignore`.
- Antes de desplegar, compila `vtr-web` y `functions`.
