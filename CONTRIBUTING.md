# Contribuir

Guía breve para trabajar en el repositorio **CLARO-VTR**.

## Estructura rápida

```
vtr-web/         Aplicación React (frontend)
functions/       Cloud Functions (TypeScript)
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
- **Componentes React:** archivos `.jsx` y `.tsx` en `src/components/` y `src/juegos/`; el estado compartido y los
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

## Flujo de trabajo con Git

### Ramas (Branches)

- **`main`** — rama principal, código de producción
- **`feature/*`** — nuevas funcionalidades (ej: `feature/filtro-region-canales`)
- **`fix/*`** — correcciones de bugs (ej: `fix/carga-planes-claro`)
- **`docs/*`** — cambios en documentación (ej: `docs/actualiza-readme`)
- **`refactor/*`** — refactorización sin cambio de funcionalidad

### Crear una rama

```bash
git checkout -b feature/nueva-funcionalidad
# o
git switch -c fix/corregir-error
```

### Commits

**Formato de mensajes:**
- Imperativo presente (ej: "Añade" no "Añadido" o "Añadiendo")
- Primera línea ≤ 50 caracteres
- Opcional: cuerpo detallado después de línea en blanco
- Opcional: footer con referencias a issues

**Ejemplos:**

```
Añade filtro por región en la grilla de canales

Permite filtrar la grilla por región (Santiago, Norte, Sur)
para mostrar solo los canales disponibles en cada zona.

Closes #23
```

```
Corrige carga de planes Claro en modo oscuro
```

```
Documenta el flujo de aprendizaje continuo del asistente
```

**Conventión de tipos (opcional):**
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` documentación
- `style:` formato/estilo (sin cambio lógico)
- `refactor:` refactorización
- `test:` tests
- `chore:` tareas de mantenimiento

### Pull Requests

1. Actualiza tu rama con `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/nueva-funcionalidad
   git rebase main
   ```

2. Sube tu rama:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

3. Crea el PR desde GitHub/GitLab

4. El PR debe:
   - Tener un título descriptivo
   - Referenciar issues relacionados
   - Incluir tests si aplica
   - Pasar el CI (GitHub Actions)

### Resolución de conflictos

```bash
# Durante rebase o merge, si hay conflictos:
git status
# Editar archivos con conflictos
git add <archivos-resueltos>
git rebase --continue  # o git merge --continue
```

## CI/CD

El proyecto usa **GitHub Actions** para validación automática en cada PR hacia `main`:

- **Archivo:** `.github/workflows/node.js.yml`
- **Ejecución:** en push y PR a `main`
- **Versiones de Node:** 18.x, 20.x, 22.x
- **Pasos:**
  1. Checkout del código
  2. Setup de Node.js con cache de npm
  3. Instala dependencias y compila `vtr-web/` (React + Vite)
  4. Instala dependencias y compila `functions/` (TypeScript)

Esto valida que ambos módulos (`vtr-web` y `functions`) compilen correctamente en las versiones de Node soportadas.

## Reglas de oro

- **No** subas credenciales ni `.env.local`. Ver [docs/10-seguridad.md](docs/10-seguridad.md).
- **No** confíes en assets pesados: los regenerables están en `.gitignore`.
- Antes de desplegar, compila `vtr-web` y `functions`.
- Usa el modo oscuro (`dark:`) en Tailwind para componentes de UI.
- Sigue el patrón *semilla + en vivo* para datos de Firestore.
- Documenta cambios significativos en `docs/`.

## Comandos útiles

```bash
# Ver estado del repositorio
git status

# Ver historial de commits
git log --oneline --graph --all

# Ver cambios en staging
git diff --staged

# Cancelar último commit (mantener cambios)
git reset --soft HEAD~1

# Cancelar último commit (descartar cambios)
git reset --hard HEAD~1

# Deshacer cambios no commiteados en un archivo
git checkout -- <archivo>

# Stash temporal de cambios
git stash
git stash pop
```
