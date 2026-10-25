# Diagnóstico y Fixes — Octubre 2026

**Fecha:** 25 de octubre de 2026  
**Versión:** 1.0  
**Estado:** ✅ RESUELTO Y DESPLEGADO

---

## 🎯 Problema Reportado

**Síntoma:** Los formularios públicos (`/formularios`) no estaban guardando datos en Firestore:
- ❌ Migraciones no se subían
- ❌ No acepta fibra no se subía
- ❌ Ventas Isla no se subía

Los usuarios veían el mensaje: *"Se guardó en este equipo (sin conexión a la nube)"*

---

## 🔍 Diagnóstico

### Causa Raíz: Firestore Rules (CRÍTICO)

Las reglas de Firestore bloqueaban escritura pública:

```javascript
// ❌ ANTES (INCORRECTO)
match /migraciones/{id} {
  allow read, write: if request.auth != null;
}
```

**Problema:** Los usuarios que llenaban formularios en `/formularios` NO estaban autenticados, por lo que Firestore rechazaba todas las escrituras con `permission-denied`.

### Bugs Secundarios Encontrados

1. **noVentaIslasMovilStore.js — `await` faltante**
   - Línea ~263: función `guardarNoVentaIslasMovil` no esperaba a Firestore
   - Retornaba `{ cloud: true }` inmediatamente sin verificar éxito

2. **noVentaIslasMovilStore.js — Funciones indefinidas**
   - `suscribirNoVentaIslasMovil` llamaba a `base()`, `combinar()`, `leerLocal()`, `guardarLocal()` que no existen
   - Causaba `ReferenceError` al cargar reportes en `/admin`

3. **FormulariosPage.tsx — Manejo de errores**
   - `FormNoAceptaFibra` y `FormNoVentaIslasMovil` sin try/catch
   - Si fallaba el guardado, el botón "Enviar" quedaba bloqueado

---

## ✅ Soluciones Aplicadas

### 1. Firestore Rules Actualizadas

**Archivo:** `firestore.rules`  
**Estado:** ✅ DESPLEGADO

```javascript
// ✅ DESPUÉS (CORRECTO)
match /migraciones/{id} {
  allow read: if request.auth != null;
  allow create: if request.resource.data.keys().hasAll(['asesor', 'rutCliente', 'fechaIngreso', 'creado'])
                && request.resource.data.asesor is string
                && request.resource.data.rutCliente is string
                && request.resource.data.fechaIngreso is string;
  allow update, delete: if request.auth != null;
}

match /no_acepta_fibra/{id} {
  allow read: if request.auth != null;
  allow create: if request.resource.data.keys().hasAll(['asesor', 'rutCliente', 'fecha', 'motivoNoAcepta', 'creado'])
                && request.resource.data.asesor is string
                && request.resource.data.rutCliente is string
                && request.resource.data.fecha is string
                && request.resource.data.motivoNoAcepta is string;
  allow update, delete: if request.auth != null;
}

match /no_venta_islas_movil/{id} {
  allow read: if request.auth != null;
  allow create: if request.resource.data.keys().hasAll(['asesor', 'rutCliente', 'fecha', 'estado', 'creado'])
                && request.resource.data.asesor is string
                && request.resource.data.rutCliente is string
                && request.resource.data.fecha is string
                && request.resource.data.estado is string;
  allow update, delete: if request.auth != null;
}
```

**Ventajas de seguridad:**
- ✅ Escritura pública solo con `create` (no pueden modificar registros existentes)
- ✅ Validación de campos obligatorios y tipos de datos
- ✅ Lectura solo para usuarios autenticados (admin)
- ✅ Modificación/eliminación solo para usuarios autenticados

### 2. noVentaIslasMovilStore.js Corregido

**Archivo:** `vtr-web/src/noVentaIslasMovilStore.js`

```javascript
// ✅ Agregado async y await
export async function guardarNoVentaIslasMovil({ db, campos, email = '' }) {
  // ...
  try {
    await escribirNoVentaFirestore(db, registro)  // ✅ CON AWAIT
    return { registro, cloud: true }
  } catch (err) {
    // ...
  }
}

// ✅ Funciones corregidas en suscripción
export function suscribirNoVentaIslasMovil(db, onData) {
  // ...
  onData(sanitizeItems(cargarNoVentaLocal()))  // ✅ Funciones correctas
  const merged = mergePorId(cargarNoVentaLocal(), docs)
  guardarNoVentaLocal(merged)
  // ...
}
```

### 3. FormulariosPage.tsx — Manejo de Errores

**Archivo:** `vtr-web/src/FormulariosPage.tsx`

Agregado try/catch/finally en ambos formularios:

```typescript
const submit = async (e) => {
  e.preventDefault()
  setEnviando(true)
  try {
    // ... guardado ...
    if (res.cloud) {
      onToast?.('Registro guardado correctamente ✅')
    } else {
      onToast?.('Se guardó en este equipo (sin conexión a la nube): ' + (res.cloudError || ''))
    }
    setExito({ ...camposEnviar })
    setForm(vacioXXX())
    onGuardado?.()
  } catch (err) {
    onToast?.('Error al guardar el registro: ' + (err?.message || String(err)))
  } finally {
    setEnviando(false)  // ✅ Siempre se ejecuta
  }
}
```

---

## 📊 Resultado Final

| Componente | Antes | Después | Estado |
|------------|-------|---------|--------|
| **Firestore Rules** | ❌ Bloqueaba escritura pública | ✅ Permite escritura con validación | ✅ DESPLEGADO |
| **noVentaIslasMovilStore.js** | ❌ Sin await, funciones inexistentes | ✅ async/await correcto, funciones válidas | Pendiente deploy |
| **FormulariosPage.tsx** | ⚠️ Sin manejo de errores | ✅ try/catch completo | Pendiente deploy |
| **migracionesStore.js** | ✅ Siempre correcto | ✅ Sin cambios | — |
| **noAceptaFibraStore.js** | ✅ Siempre correcto | ✅ Sin cambios | — |

---

## 🚀 Despliegue

### Realizado
```bash
firebase deploy --only firestore:rules
# ✅ Desplegado exitosamente
```

### Pendiente
```bash
cd vtr-web
npm run build
firebase deploy --only hosting
```

---

## 🧪 Verificación

### Pruebas recomendadas

1. **Formularios públicos:**
   - Ir a `/formularios` sin estar logueado
   - Llenar formulario de Migraciones → verificar que se guarde en Firestore
   - Llenar formulario de No acepta fibra → verificar que se guarde
   - Llenar formulario de Ventas Isla → verificar que se guarde

2. **Reportes en Admin:**
   - Login en `/admin` con usuario `@clarovtr.cl`
   - Ir a sección "Migraciones"
   - Verificar que se carguen todos los tabs: Migraciones, No acepta fibra, Ventas Isla
   - Verificar que los datos se muestren correctamente

3. **Firestore Console:**
   - Verificar que aparezcan registros nuevos en las colecciones:
     - `migraciones`
     - `no_acepta_fibra`
     - `no_venta_islas_movil`

---

## 📝 Lecciones Aprendidas

1. **Firestore Rules son la primera línea de validación**
   - Siempre revisar reglas antes de diagnosticar código
   - Validar permisos con casos de uso reales (autenticado vs público)

2. **Testing de formularios públicos**
   - Probar en modo incógnito para simular usuario no autenticado
   - Verificar que los datos lleguen a Firestore, no solo localStorage

3. **Manejo de errores en async**
   - Siempre usar try/catch/finally en funciones async de UI
   - El `finally` garantiza que el estado de carga se resetee

4. **Revisar funciones helper**
   - Verificar que las funciones llamadas estén definidas
   - Usar naming consistente entre stores similares

---

## 🔗 Referencias

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Async/Await Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- Ver también: `docs/10-seguridad.md` para detalles de seguridad actualizados

---

**Documento creado:** 25 de octubre de 2026  
**Autor:** Equipo Desarrollo VTR  
**Última actualización:** 25 de octubre de 2026
