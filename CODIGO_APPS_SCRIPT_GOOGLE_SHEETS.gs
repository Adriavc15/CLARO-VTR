/**
 * ============================================================
 *  CONECTAR FORMULARIOS VTR APP -> GOOGLE SHEETS
 *  ============================================================
 *  INSTRUCCIONES:
 *  1. Abre tu hoja de Google Sheets:
 *     https://docs.google.com/spreadsheets/d/1DpHuZJS_r2tUuIJnMBEuvttTZtJ2i9NVc4W7q-5wNCQ/edit
 *  2. Menú: Extensiones -> Apps Script (Apps Script).
 *  3. Borra el contenido del editor y pega TODO este código.
 *  4. Guarda (icono de disquete / Ctrl+S) y luego: Implementar / Deploy
 *     -> Nueva implementación / New deployment.
 *  5. Tipo: Aplicación web / Web app.
 *     - Ejecutar como / Execute as: "Yo / Me"
 *     - Quién tiene acceso / Who has access: "Cualquier persona / Anyone"
 *  6. Presiona Implementar / Deploy, acepta permisos si los pide.
 *  7. Copia la URL que dice "URL de la aplicación web / Web app URL"
 *     (termina en /exec) y pégala dentro de App.jsx en el campo
 *     GOOGLE_SHEETS_URL (ver al final de este archivo).
 *
 *  NOTA: Si cambias algo en este script, debes hacer
 *  "Implementar -> Administrar implementaciones -> Editar -> Nueva versión"
 *  para publicar los cambios con una nueva versión.
 * ============================================================
 */

// La hoja debe tener 2 pestañas/tabs llamadas exactamente:
//   "N1"    -> recibe los datos de la plantilla N1 técnico
//   "Basico"-> recibe los datos de la plantilla general
//   "RequerimientoCritico" -> recibe los datos de la plantilla de requerimiento cliente crítico
const HOJA_N1 = 'N1';
const HOJA_BASICO = 'Basico';
const HOJA_REQUERIMIENTO = 'RequerimientoCritico';
const HOJA_GENESYS = 'Genesys';
const HOJA_NOTICIAS = 'Noticias';

// Carpeta pública de Drive con los comunicados que se muestran en el dashboard
const CARPETA_COMUNICADOS_ID = '1zFW47MKDJArZ4jiKa1tw-4dezVJ673QM';

// Carpeta de Drive donde se suben las evidencias (capturas) del formulario Genesys
const CARPETA_EVIDENCIA_ID = '1c-d9j08EuXfozKHqkDJZJTtX4qZlwXiZ';

// Devuelve la hoja poseedora del script (la del enlace compartido)
function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet_(name) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// Fecha y hora actual formateada como TEXTO en hora de Perú (PET),
// sin etiqueta de zona horaria. Ej: 01-09-2026 14:30:05
function fechaPET_() {
  return Utilities.formatDate(new Date(), 'America/Lima', 'dd-MM-yyyy HH:mm:ss');
}

// Escapa/limpia un valor evitando fórmulas maliciosas (inyección)
function clean_(value) {
  if (value === undefined || value === null) return '';
  let s = String(value);
  if (/^[=+\-@]/.test(s)) {
    s = "'" + s;
  }
  return s;
}

// Encabezados (columnas) que coinciden con la estructura de llenado
// del formulario. Cada pestaña tiene las columnas según su plantilla.
const HEADERS_N1 = [
  'Fecha', 'Asesor',
  'RUT del Cliente', 'Nombre del Cliente', 'Teléfono celular del Cliente',
  'Plataforma', 'Marca', 'Servicio',
  'Canal de Ingreso', 'Observación'
];

const HEADERS_BASICO = [
  'Fecha', 'Asesor', 'Nombre del Cliente', 'RUT', 'Correo', 'Motivo'
];

const HEADERS_REQUERIMIENTO = [
  'Fecha Registro', 'Tipo de Actividad', 'Usuario Creador', 'RUT', 'Cel',
  'Pedido', 'Actividad', 'Comuna', 'Tecnología',
  'Fecha', 'Bloque', 'Tipo de Marca', 'Fecha Deseada', 'Bloque Deseado'
];

const HEADERS_GENESYS = [
  'Fecha Registro', 'Supervisor', 'Asesor', 'RUT Asesor',
  'Fecha Llamada', 'Hora Llamada', 'RUT Cliente', 'Teléfono Cliente',
  'ID Tipificación Andes', 'Incidencia', 'Acción Tomada', 'Evidencia'
];

const HEADERS_NOTICIAS = [
  'Fecha', 'Categoría', 'Título', 'Descripción', 'Imagen URL', 'Enlace Web'
];

// Fuerza el formato de texto de las celdas de una fila para que
// RUT, teléfono y observación no se conviertan en número ni se alteren.
function forzarTexto_(sheet, inicioFila, rowLength, textColumns) {
  if (!textColumns || textColumns.length === 0) return;
  // Con ' @ ' la hoja interpreta la celda siempre como texto
  sheet.getRange(inicioFila, 1, 1, rowLength).setNumberFormat('@');
  // Re-escribimos las celdas indicadas con apóstrofo inicial para forzar texto
  textColumns.forEach(function (col) {
    const cell = sheet.getRange(inicioFila, col);
    const raw = cell.getValue();
    if (raw !== '' && raw !== null && raw !== undefined) {
      cell.setValue("'" + raw);
    }
  });
}

// Sube la captura de evidencia (blob multipart) a la carpeta de Drive
// indicada y devuelve su URL. Si no viene archivo, devuelve el texto original.
// Si falla la subida, lanza un error (doPost devuelve ok:false).
function subirEvidencia_(parameter, parameters) {
  return subirArchivo_(parameter, parameters, 'evidencia', CARPETA_EVIDENCIA_ID);
}

// Sube un archivo (blob multipart) del formulario a la carpeta de Drive indicada,
// lo deja accesible por enlace y devuelve su URL pública. Si no viene archivo,
// devuelve el valor de texto del campo (vacío).
function subirArchivo_(parameter, parameters, nombreCampo, folderId) {
  var blob = null;
  var raw = parameter && parameter[nombreCampo];
  if (raw && typeof raw.getBytes === 'function') {
    blob = raw;
  } else if (parameters && parameters[nombreCampo] && Array.isArray(parameters[nombreCampo])) {
    blob = parameters[nombreCampo][0];
  }
  if (!blob) return '';
  var carpeta = DriveApp.getFolderById(folderId);
  var creado = carpeta.createFile(blob);
  creado.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?export=view&id=' + creado.getId();
}

// Lee las noticias publicadas desde la pestaña "Noticias".
function listarNoticias_() {
  var sheet = getSpreadsheet_().getSheetByName(HOJA_NOTICIAS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getDataRange().getValues().slice(1);
  return values
    .filter(function (row) { return row[0] && row[2]; })
    .reverse()
    .map(function (row) {
      return {
        fecha: row[0],
        categoria: row[1],
        titulo: row[2],
        descripcion: row[3],
        src: row[4],
        driveUrl: row[5],
      };
    });
}

// Busca la fila (>=2) de una noticia por su URL de imagen (columna 5).
// Devuelve -1 si no la encuentra.
function buscarFilaNoticia_(src) {
  var sheet = getSpreadsheet_().getSheetByName(HOJA_NOTICIAS);
  if (!sheet || !src) return -1;
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][4]) === String(src)) return i + 1;
  }
  return -1;
}

// Añade una fila a la hoja indicada con un array de valores.
// headers: encabezados de la hoja (estructura de llenado).
// textColumns: array de números de columna que deben guardarse SIEMPRE como texto.
function appendRow_(sheetName, headers, values, textColumns) {
  const sheet = getOrCreateSheet_(sheetName);
  revisarEncabezados_(sheet, headers);
  const row = values.map(clean_);
  const nuevaFila = sheet.getLastRow() + 1;
  sheet.getRange(nuevaFila, 1, 1, row.length).setValues([row]);
  forzarTexto_(sheet, nuevaFila, row.length, textColumns);
}

// Asegura que la fila 1 tenga exactamente los encabezados esperados.
// También limpia columnas sobrantes para evitar descuadres.
function revisarEncabezados_(sheet, headers) {
  const actual = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, headers.length).getValues()[0]
    : [];
  const iguales = actual.length === headers.length &&
    actual.every(function (v, i) { return String(v) === headers[i]; });

  if (!iguales) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // Si había datos mal alineados (encabezados viejos), se limpian
    // las filas de datos para evitar registros descuadrados.
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  }
}

// Devuelve la respuesta JSON. Si se pasa un parámetro "callback", responde
// como JSONP (para poder leerla desde el navegador, que bloquea el CORS).
function responder_(data, callback) {
  const json = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Devuelve las imágenes de la carpeta de comunicados (dashboard).
 * Se llama con: <URL>/exec?action=listComunicados
 */
function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';
  const callback = e && e.parameter ? e.parameter.callback : '';
  if (action === 'listComunicados') {
    try {
      const folder = DriveApp.getFolderById(CARPETA_COMUNICADOS_ID);
      const files = folder.getFiles();
      const items = [];
      while (files.hasNext()) {
        const file = files.next();
        items.push({
          name: file.getName(),
          id: file.getId(),
          src: 'https://drive.google.com/uc?export=view&id=' + file.getId(),
        });
      }
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, items: items }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: String(err), items: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  if (action === 'listNoticias') {
    try {
      const items = listarNoticias_();
      return responder_({ ok: true, items: items }, callback);
    } catch (err) {
      return responder_({ ok: false, error: String(err), items: [] }, callback);
    }
  }
  if (action === 'testEvidencia') {
    try {
      const folder = DriveApp.getFolderById(CARPETA_EVIDENCIA_ID);
      const archivo = folder.createFile('test-evidencia.txt', 'prueba escritura Drive', MimeType.PLAIN_TEXT);
      archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: true,
          msg: 'Escritura correcta en Drive',
          id: archivo.getId(),
          url: 'https://drive.google.com/uc?export=view&id=' + archivo.getId(),
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: String(err), items: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: 'Acción no válida', items: [] }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Recibe los datos de los formularios.
 * Cada formulario envía su pestaña destino en el campo "hoja".
 */
function doPost(e) {
  try {
    const p = e.parameter || {};
    const hoja = clean_(p.hoja);
    const fecha = fechaPET_();

    if (hoja === HOJA_N1) {
      appendRow_(HOJA_N1, HEADERS_N1, [
        fecha, p.asesor,
        p.rut, p.nombre, p.telefono,
        p.plataformaTitulo, p.marca, p.servicio,
        p.canal, p.observacion
      ], [3, 5, 10]);
    } else if (hoja === HOJA_BASICO) {
      appendRow_(HOJA_BASICO, HEADERS_BASICO, [
        fecha, p.asesor, p.cliente, p.rut, p.correo, p.motivo
      ], [4, 6]);
    } else if (hoja === HOJA_REQUERIMIENTO) {
      appendRow_(HOJA_REQUERIMIENTO, HEADERS_REQUERIMIENTO, [
        fecha, p.tipoActividad, p.usuarioCreador, p.rut, p.cel,
        p.pedido, p.actividad, p.comuna, p.tecnologia,
        p.fecha, p.bloque, p.marca, p.fechaDeseada, p.bloqueDeseado
      ], [4, 5, 6, 7]);
    } else if (hoja === HOJA_GENESYS) {
      var evidencia = subirEvidencia_(e.parameter, e.parameters);
      appendRow_(HOJA_GENESYS, HEADERS_GENESYS, [
        fecha, p.supervisor, p.asesor, p.rutAsesor,
        p.fechaLlamada, p.horaLlamada, p.rutCliente, p.telefonoCliente,
        p.idAndes, p.incidencia, p.accion, evidencia
      ], [4, 7, 8, 9]);
    } else if (hoja === HOJA_NOTICIAS) {
      const accion = clean_(p.accion) || 'publicar';
      if (accion === 'eliminar') {
        const fila = buscarFilaNoticia_(clean_(p.src));
        if (fila > 0) {
          getSpreadsheet_().getSheetByName(HOJA_NOTICIAS).deleteRow(fila);
        }
        return ContentService
          .createTextOutput(JSON.stringify({ ok: true, accion: 'eliminar', fila: fila }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (accion === 'actualizar') {
        const filaOriginal = buscarFilaNoticia_(clean_(p.src));
        const src = clean_(p.driveUrl) || clean_(p.imagenUrl) || clean_(p.src);
        if (filaOriginal > 0) {
          const sheet = getSpreadsheet_().getSheetByName(HOJA_NOTICIAS);
          sheet.getRange(filaOriginal, 2, 1, 5).setValues([[
            clean_(p.categoria), clean_(p.titulo), clean_(p.descripcion), src, src
          ]]);
          forzarTexto_(sheet, filaOriginal, 6, [2, 3, 4, 5, 6]);
          return ContentService
            .createTextOutput(JSON.stringify({ ok: true, accion: 'actualizar', src: src }))
            .setMimeType(ContentService.MimeType.JSON);
        }
        return ContentService
          .createTextOutput(JSON.stringify({ ok: false, error: 'Noticia no encontrada' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      // publicar (comportamiento por defecto): la imagen llega como enlace directo
      var src = clean_(p.driveUrl) || clean_(p.imagenUrl) || '';
      appendRow_(HOJA_NOTICIAS, HEADERS_NOTICIAS, [
        fecha, p.categoria, p.titulo, p.descripcion, src, src
      ], [2, 3, 4, 5, 6]);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, src: src }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Hoja no válida' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función de prueba manual desde el editor (opcional)
function testComunicados() {
  const folder = DriveApp.getFolderById(CARPETA_COMUNICADOS_ID);
  const files = folder.getFiles();
  const items = [];
  while (files.hasNext()) {
    const file = files.next();
    items.push(file.getName() + ' -> ' + 'https://drive.google.com/uc?export=view&id=' + file.getId());
  }
  Logger.log(JSON.stringify(items, null, 2));
  return items;
}

function testN1() {
  appendRow_(HOJA_N1, HEADERS_N1, [
    fechaPET_(), 'Asesor Prueba',
    '12.345.678-9', 'Cliente Prueba', '091234567',
    'SOPORTE DIFERIDO TECNICO', 'VTR', 'Internet',
    'Call Center', 'cambio de clave wifi'
  ], [3, 5, 10]);
}

function testBasico() {
  appendRow_(HOJA_BASICO, HEADERS_BASICO, [
    fechaPET_(), 'Asesor Prueba', 'Cliente Prueba', '12.345.678-9', 'cliente@mail.com', 'motivo de prueba'
  ], [4, 6]);
}
