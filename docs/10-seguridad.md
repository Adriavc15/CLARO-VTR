# 10 · Seguridad y secretos

> Este documento es una guía de riesgos y recomendaciones. **No contiene credenciales.**

## Resumen

El proyecto es **interno** y maneja información operativa. Hay tres focos de riesgo:

1. **Reglas de Firestore abiertas.**
2. **Claves/credenciales** en el código o en archivos locales.
3. **Datos sensibles** (capturas de sistemas internos, documentos con credenciales).

## 1. Reglas de Firestore (crítico)

`firestore.rules` está en modo desarrollo:

```javascript
allow read, write: if true;
```

Cualquier persona con la configuración del proyecto puede **leer y escribir** toda la base de
datos sin autenticarse. Recomendaciones:

- Restringir la escritura a usuarios autenticados (`request.auth != null`).
- Limitar colecciones sensibles (por ejemplo `admins_autorizados`, `tipificaciones_bloc`,
  `chat_conversations`) a correos/campos concretos.
- Validar tipos y tamaños en las reglas.
- Separar reglas por entorno (dev/prod).

> Existe la skill `firebase-security-rules-auditor` en `.agents/skills/` para auditar y
> puntuar las reglas.

## 2. Claves y credenciales

| Elemento | Dónde | Riesgo | Recomendación |
|---|---|---|---|
| Config web de Firebase | `App.tsx` y scripts | **Bajo**: la config web es pública por diseño | Restringir la API key por dominio (HTTP referrers) y habilitar **App Check** |
| `IMGBB_API_KEY` | Cloud Function (servidor) | **Bajo**: ahora está en el servidor | ✅ Ya migrado a Cloud Function `subirImagen` (2026-10-24) |
| URL de Apps Script (`/exec`) | `App.tsx` | Medio: endpoint público con escritura | Validar/añadir token; aplicar `clean_()` (ya presente) |
| Credenciales de portales internos | `CLARO VTR CHILE ENLACES ID *.md` | **Alto** | Mantener **fuera** de Git (ya en `.gitignore`) |
| Claves Inbenta | `vtr-web/scripts/_inbenta_knowledge.js` | Alto | Mantener fuera de Git (ya en `.gitignore`); rotar si se filtraron |

## 3. Archivos excluidos del repositorio

Por seguridad, están en `.gitignore` y **no se suben**:

```
CLARO VTR CHILE ENLACES ID *.md          # credenciales de portales
vtr-web/scripts/_inbenta_knowledge.js    # claves de la API KM de Inbenta
vtr-web/.env.local                       # variables de entorno locales
dist/, node_modules/, .firebase/         # salidas/build/cache
```

Si necesitas versionarlos (por ejemplo, un documento de referencia sin credenciales), crea una
copia redactada y quita la línea correspondiente del `.gitignore`.

> ⚠️ Los secretos que ya hayan entrado a un repositorio quedan en el **historial de Git**
> aunque se borren después. Si algo sensible se subió por error, hay que **rotar** la clave y
> limpiar el historial (`git filter-repo` / BFG).

## 4. Datos sensibles en assets

Algunas carpetas de `vtr-web/public/` contienen páginas y capturas de sistemas internos
(ANDES/Siebel, evidencias de Genesys). Aunque estén dentro de un repositorio privado, conviene
evitar añadir datos personales de clientes reales y revisarlo antes de dar acceso a terceros.

## 5. Autenticación y autorización

- Proveedores en Firebase Auth: **Google** y **Email/Password**.
- La lista de administradores se controla en la colección `admins_autorizados`
  (`adminsAutorizados.js`), con un admin principal configurado.
- Dominios corporativos admitidos para registrarse como administrador:
  `@apexamerica.com` y `@clarovtr.cl` (lista en `DOMINIOS_ADMIN`). El acceso con
  Google exige además correo verificado y presencia en el registro.
- La autorización real depende hoy de listas en Firestore y del cliente, no de reglas
  estrictas del servidor. Al cerrar las reglas, conviene basar la autorización en
  `request.auth` (custom claims o `admins_autorizados`).

## 6. Checklist recomendado

- [ ] Cerrar `firestore.rules` (autenticación + validación por colección).
- [ ] Habilitar **App Check** (web) para Firestore y Functions.
- [ ] Restringir la API key de Firebase y de imgbb por dominio.
- [ ] Rotar cualquier clave que haya estado expuesta.
- [ ] Revisar `public/` y el historial de Git en busca de datos personales o credenciales.
- [ ] Mantener `.env.local` y los archivos con credenciales fuera de Git.
- [ ] Limitar colaboradores del repositorio privado.
