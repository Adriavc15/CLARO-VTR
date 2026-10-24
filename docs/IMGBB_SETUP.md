# Configuración de IMGBB_API_KEY en Cloud Functions

La API key de imgbb.com ahora está en el servidor (Cloud Function) por seguridad.

## Pasos para configurar

### Opción 1: Desde Firebase Console (recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto `vtrclaroo-3c572`
3. Navega a **Functions** → **Configuración** → **Variables de entorno**
4. Haz clic en **Agregar variable**
5. Configura:
   - **Nombre:** `IMGBB_API_KEY`
   - **Valor:** `27a975d7c50c5282d8f5403ce786fa4b`
   - **Entorno:** Producción
6. Haz clic en **Guardar**
7. Redespliega las Functions: `firebase deploy --only functions`

### Opción 2: Desde línea de comandos

```bash
cd /ruta/a/vtr
firebase functions:config:set IMGBB_API_KEY=27a975d7c50c5282d8f5403ce786fa4b
firebase deploy --only functions
```

## Verificación

Para verificar que la variable está configurada:

```bash
firebase functions:config:get
```

Deberías ver algo como:
```json
{
  "IMGBB_API_KEY": "27a975d7c50c5282d8f5403ce786fa4b"
}
```

## Cambios realizados

- ✅ Creada Cloud Function `subirImagen` en `functions/src/index.ts`
- ✅ Modificada función `subirImagenImgbb` en `vtr-web/src/App.tsx` para usar la Cloud Function
- ✅ Eliminada API key del código del cliente
- ✅ Agregada autenticación: solo usuarios logueados pueden subir imágenes
- ✅ Actualizada documentación de seguridad

## Ventajas de seguridad

- La API key nunca se expone en el código del cliente
- Solo usuarios autenticados pueden subir imágenes
- La key está protegida en el servidor de Firebase
- Fácil de rotar sin redesplegar el frontend

## Prueba

Para probar que funciona:

1. Inicia sesión en la aplicación
2. Intenta subir una imagen (en noticias, comunicados, etc.)
3. Si ves un error "No autorizado", verifica que estés logueado
4. Si ves un error "API key no configurada en servidor", verifica la configuración de la variable de entorno
