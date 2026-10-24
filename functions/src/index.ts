import {initializeApp} from "firebase-admin/app";
import {FieldValue, getFirestore} from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {getAuth} from "firebase-admin/auth";

initializeApp();

setGlobalOptions({maxInstances: 10});

const CARPETA_COMUNICADOS_ID = "1zFW47MKDJArZ4jiKa1tw-4dezVJ673QM";
const FUNCION_URL = "https://us-central1-vtrclaroo-3c572.cloudfunctions.net/comunicados";
const LISTA_NOTICIAS_URL = "https://script.google.com/macros/s/AKfycbw9YoO7pCH6bVb0gjSuOvDMhbpqtxjtt1Xdg0c8ZcXJuaHgFRIpOamDL-uKRlqHukQ/exec?action=listNoticias";

interface Comunicado {
  name: string;
  id: string;
  src: string;
}

const parseFolderHtml = (html: string): Comunicado[] => {
  const ids: string[] = [];
  const titles: string[] = [];
  const idRegex = /file\/d\/([^/"']+)\/view/g;
  const titleRegex = /flip-entry-title">([^<]+)<\/div>/g;
  let matchId: RegExpExecArray | null;
  let matchTitle: RegExpExecArray | null;
  while ((matchId = idRegex.exec(html)) !== null) {
    ids.push(matchId[1]);
  }
  while ((matchTitle = titleRegex.exec(html)) !== null) {
    titles.push(matchTitle[1]);
  }
  return ids.map((id, index) => ({
    name: titles[index] || "",
    id,
    src: FUNCION_URL + "/imagen?fileId=" + id,
  }));
};

interface NoticiaSheets {
  fecha?: string;
  categoria?: string;
  titulo?: string;
  descripcion?: string;
  src?: string;
  driveUrl?: string;
}

// Importa las noticias de la pestaña "Noticias" de Google Sheets (Apps Script)
// a la colección Firestore "noticias". Se invoca con GET/POST a:
//   https://us-central1-vtrclaroo-3c572.cloudfunctions.net/importarNoticias
// No duplica: omite los que ya tienen la misma URL de imagen.
export const importarNoticias = onRequest({cors: true}, async (req, res) => {
  try {
    const db = getFirestore();
    const respuesta = await fetch(LISTA_NOTICIAS_URL);
    const data = await respuesta.json() as {
      ok?: boolean;
      items?: NoticiaSheets[];
    };

    if (!data.ok || !Array.isArray(data.items)) {
      res.status(400).json({
        ok: false,
        error: "Respuesta inválida de Apps Script",
      });
      return;
    }

    let importados = 0;
    let omitidos = 0;
    for (const item of data.items) {
      const src = (item.src || "").trim();
      if (!src) {
        omitidos++;
        continue;
      }

      const yaExiste = await db.collection("noticias")
        .where("src", "==", src)
        .limit(1)
        .get();
      if (!yaExiste.empty) {
        omitidos++;
        continue;
      }

      let creado: FieldValue | Date = FieldValue.serverTimestamp();
      if (item.fecha) {
        const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(item.fecha);
        if (partes) {
          creado = new Date(
            Number(partes[3]), Number(partes[2]) - 1, Number(partes[1])
          );
        }
      }

      await db.collection("noticias").add({
        categoria: item.categoria || "",
        titulo: item.titulo || "",
        descripcion: item.descripcion || "",
        src,
        driveUrl: item.driveUrl || src,
        fecha: item.fecha || "",
        creado,
      });
      importados++;
    }

    res.json({ok: true, importados, omitidos, total: data.items.length});
  } catch (err) {
    logger.error("Error importando noticias", err);
    res.status(500).json({ok: false, error: String(err)});
  }
});

export const comunicados = onRequest({cors: true}, async (req, res) => {
  try {
    const base = new URL(req.url || "/", "http://localhost");
    const path = base.pathname;
    const fileId = base.searchParams.get("fileId");

    if (path.endsWith("/imagen") && fileId) {
      const driveUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
      const respuesta = await fetch(driveUrl, {
        redirect: "follow",
      });
      const buffer = Buffer.from(await respuesta.arrayBuffer());
      const contentType =
        respuesta.headers.get("Content-Type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(buffer);
      return;
    }

    const url = "https://drive.google.com/embeddedfolderview?id=" +
      CARPETA_COMUNICADOS_ID + "#list";
    const respuesta = await fetch(url);
    const html = await respuesta.text();
    const items = parseFolderHtml(html);
    res.json({ok: true, items});
  } catch (err) {
    logger.error("Error cargando comunicados", err);
    res.status(500).json({ok: false, items: [], error: String(err)});
  }
});

/**
 * Obtiene targets Netflix OCA (Fast.com). El token se usa solo en servidor
 * porque api.fast.com no expone CORS a orígenes ajenos a fast.com.
 */
export const fastTargets = onRequest({cors: true}, async (req, res) => {
  try {
    const urlCount = Math.min(
      8,
      Math.max(1, Number(req.query.urlCount) || 5),
    );

    const htmlRes = await fetch("https://fast.com/");
    const html = await htmlRes.text();
    const scriptMatch = html.match(/src="(\/app-[^"]+\.js)"/);
    if (!scriptMatch) {
      res.status(502).json({
        ok: false,
        error: "No se encontró el script de Fast.com",
      });
      return;
    }

    const jsRes = await fetch("https://fast.com" + scriptMatch[1]);
    const js = await jsRes.text();
    const tokenMatch =
      js.match(/token:"([^"]+)"/) ||
      js.match(/token:'([^']+)'/) ||
      js.match(/api\.fast\.com[^"']*token=([A-Za-z0-9_-]+)/);

    if (!tokenMatch) {
      res.status(502).json({
        ok: false,
        error: "No se pudo obtener token de Fast.com",
      });
      return;
    }

    const token = tokenMatch[1];
    const apiUrl =
      "https://api.fast.com/netflix/speedtest/v2?https=true&token=" +
      encodeURIComponent(token) +
      "&urlCount=" +
      urlCount;

    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) {
      res.status(apiRes.status).json({
        ok: false,
        error: "API Fast.com respondió " + apiRes.status,
      });
      return;
    }

    const data = await apiRes.json() as {
      targets?: Array<{url?: string}>;
    };

    const targets = (data.targets || [])
      .map((t) => t.url)
      .filter((u): u is string => typeof u === "string" && u.length > 0);

    if (!targets.length) {
      res.status(502).json({ok: false, error: "Sin targets de Netflix OCA"});
      return;
    }

    res.set("Cache-Control", "no-store");
    res.json({ok: true, targets});
  } catch (err) {
    logger.error("Error obteniendo targets Fast.com", err);
    res.status(500).json({ok: false, error: String(err)});
  }
});

/**
 * Sube una imagen a imgbb desde el servidor.
 * La API key está en variable de entorno del servidor (más seguro).
 * Requiere autenticación de Firebase.
 */
export const subirImagen = onRequest(
  {cors: true},
  async (req, res) => {
    try {
      // Verificar autenticación
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ok: false, error: 'No autorizado'});
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      const auth = getAuth();
      const decoded = await auth.verifyIdToken(token);

      // Opcional: verificar que el usuario sea admin
      // Descomentar si quieres restringir solo a administradores
      const email = decoded.email;
      if (!email || (!email.includes('@apexamerica.com') && !email.includes('@clarovtr.cl'))) {
        res.status(403).json({ok: false, error: 'Solo usuarios autorizados pueden subir imágenes'});
        return;
      }

      // Obtener la imagen del body (base64)
      const {image, name} = req.body;
      if (!image) {
        res.status(400).json({ok: false, error: 'Falta la imagen'});
        return;
      }

      // Subir a imgbb con la API key del servidor
      const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
      if (!IMGBB_API_KEY) {
        res.status(500).json({ok: false, error: 'API key no configurada en servidor'});
        return;
      }

      const body = new FormData();
      body.append('key', IMGBB_API_KEY);
      body.append('image', image);
      if (name) body.append('name', String(name).slice(0, 80));

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body,
      });

      const data = await response.json();

      if (!data.success) {
        res.status(500).json({ok: false, error: 'Error al subir a imgbb'});
        return;
      }

      // Devolver la URL del CDN (i.ibb.co)
      const url = data.data?.url || data.data?.display_url;
      res.json({ok: true, url});
    } catch (err) {
      logger.error('Error subiendo imagen', err);
      res.status(500).json({ok: false, error: String(err)});
    }
  }
);
