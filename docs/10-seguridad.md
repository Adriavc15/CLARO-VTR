# 10 · Seguridad y secretos

> Este documento es una guía de riesgos y recomendaciones. **No contiene credenciales.**

## Resumen

El proyecto es **interno** y maneja información operativa. Hay tres focos de riesgo:

1. **Reglas de Firestore abiertas.**
2. **Claves/credenciales** en el código o en archivos locales.
3. **Datos sensibles** (capturas de sistemas internos, documentos con credenciales).

## 1. Reglas de Firestore

**Estado:** ✅ **ACTUALIZADO** (25 de octubre de 2026)

Las reglas de Firestore han sido configuradas con un balance entre accesibilidad pública para formularios y seguridad para datos administrativos.

### Colecciones Públicas (solo lectura)

```javascript
match /noticias/{id} {
  allow read: if true;
  allow write: if false;  // Solo desde admin/Cloud Functions
}
```

Aplica también para: `catalogo_planes`, `sucursalesHorarios`, `guiasPortal`, `filtroMarca`, `grillaCanales`.

### Formularios Públicos (escritura con validación)

```javascript
match /migraciones/{id} {
  allow read: if request.auth != null;  // Solo admin
  allow create: if request.resource.data.keys().hasAll(['asesor', 'rutCliente', 'fechaIngreso', 'creado'])
                && request.resource.data.asesor is string
                && request.resource.data.rutCliente is string
                && request.resource.data.fechaIngreso is string;
  allow update, delete: if request.auth != null;  // Solo admin
}
```

Aplica también para: `no_acepta_fibra`, `no_venta_islas_movil`.

**Ventajas de seguridad:**
- ✅ Usuarios públicos solo pueden **crear** registros (no modificar/eliminar)
- ✅ Validación de campos obligatorios y tipos de datos
- ✅ Lectura solo para usuarios autenticados (reportes admin)
- ✅ Modificación/eliminación solo para usuarios autenticados

### Colecciones Privadas (autenticación requerida)

```javascript
match /tipificaciones_bloc/{id} {
  allow read, write: if request.auth != null;
}
```

Aplica también para: `messenger_chats`, `apex_memoria`, `apex_aprendizaje`, `lectores`, `lecturas`.

### Colecciones Administrativas (permisos específicos)

```javascript
match /admins_autorizados/{email} {
  allow read: if request.auth != null;
  allow write: if (
    request.auth.token.email == 'adriangamervc@gmail.com' ||
    exists(/databases/$(database)/documents/admins_autorizados/$(request.auth.token.email)) ||
    (request.resource.data.email.endsWith('@apexamerica.com') || 
     request.resource.data.email.endsWith('@clarovtr.cl'))
  );
}
```

### Recomendaciones adicionales

- [ ] Habilitar **App Check** (web) para Firestore y Functions
- [ ] Monitorear uso de colecciones públicas para detectar abuso
- [ ] Revisar logs de Firestore periódicamente
- [ ] Considerar límites de rate (quota) por IP para escritura pública

> Ver `docs/11-diagnostico-fixes-2026-10.md` para detalles del fix de Firestore Rules de octubre 2026.

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

- [x] **Cerrar `firestore.rules`** (autenticación + validación por colección) — ✅ **COMPLETADO** (2026-10-25)
- [ ] Habilitar **App Check** (web) para Firestore y Functions
- [ ] Restringir la API key de Firebase y de imgbb por dominio
- [ ] Rotar cualquier clave que haya estado expuesta
- [ ] Revisar `public/` y el historial de Git en busca de datos personales o credenciales
- [x] Mantener `.env.local` y los archivos con credenciales fuera de Git — ✅ **COMPLETADO**
- [ ] Limitar colaboradores del repositorio privado
- [ ] Monitorear logs de Firestore para detectar escrituras anómalas en formularios públicos

---

**Última actualización:** 25 de octubre de 2026  
**Cambios recientes:** Firestore Rules actualizadas con escritura pública validada para formularios
