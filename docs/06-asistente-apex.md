# 06 · Asistente de IA "Apex"

El portal incluye un asistente conversacional llamado **Apex** (también referido como
"Andes" por el sistema que ayuda a operar). Su objetivo es responder dudas operativas del
contact center usando la **base de conocimiento del propio portal** en lugar de inventar
respuestas: un patrón **RAG** (Retrieval-Augmented Generation) sobre Gemini.

## Resumen técnico

- **UI:** `vtr-web/src/components/ChatbotAndes.jsx`.
- **Motor/retrieval:** `vtr-web/src/asistente/conocimientoAndes.js` (+ módulos de apoyo).
- **Modelo:** Firebase AI Logic (`firebase/ai`) con backend **Google AI** y un modelo **Gemini**
  configurado en el código (`GoogleAIBackend`, `getGenerativeModel`). Parámetros de generación:
  `temperature 0.95`, `topP 0.92`, `maxOutputTokens 1024`.
- **Personalidad:** `SYSTEM_PROMPT_HUMANO` (en `conocimientoAndes.js`) define el tono humano del
  asistente.

## Cómo responde (flujo)

1. El usuario escribe en el chat.
2. Se resuelve la **casuística** del mensaje (`casuisticas.js`): temas como RUT, cliente,
   ANDES, contrataciones, control remoto, plan, cambio de plan, D-Box, streaming, costos,
   pedido, factura, pago, inhibición, módem, internet, ONT, deuda, sucursal, mudanza, titular.
   Si la intención es clara, se responde de forma dirigida.
3. Se registra el turno para **aprendizaje continuo** (`aprendizajeContinuo.js`).
4. Se hace **búsqueda de conocimiento** (`buscarConocimiento`, límite de resultados ~8) sobre el
   corpus local y las colecciones de Firestore.
5. Según la confianza y si hay contexto suficiente, la respuesta se construye **localmente**
   (respuestas curadas) o se envía a **Gemini** con el contexto recuperado (RAG).
6. Se aplican filtros de seguridad de lenguaje (`textoEsOfensivo`) y se adjuntan imágenes,
   fuentes y alternativas sugeridas.

## Capas de conocimiento

El asistente combina varias capas (documentadas en `entrenamientoApex.js`):

| Capa | Descripción |
|---|---|
| **Hechos** | Conocimiento objetivo del negocio (planes, procedimientos, guías) |
| **Tono** | Forma de hablar (corpus de diálogos naturales) |
| **Memoria** | Lo recordado por usuario (local + `apex_memoria`) |
| **Charla** | Conversación casual / de relleno |
| **Candidatos** | Respuestas de baja confianza propuestas para aprobación humana |

## Fuentes de conocimiento

### Locales (código, en `src/asistente/`)
- `indicePortal.js` — índice de todo el portal (secciones, guías, FAQs, procedimientos).
- `guiasPortal.js`, `assetsGuias.js` — imágenes y pasos de las guías.
- Procedimientos: pago, traslado, cambio de titular, Internet FTTH/HFC.
- `boletaAgosto.js`, `fiestasPatrias.js`, `faqAmpliadas.js`, `sucursalesHorarios.js`
  (187 sucursales).
- **Corpus de diálogo:** 16 bloques (`corpusBloque01.js` … `corpusBloque16.js`) +
  `corpusBloqueGenerado1000.js` y corpus temáticos (ONT/FTTH, streaming, cambio de plan,
  control remoto, D-Box, diálogos cotidianos).
- Catálogos: `planesSeed.js`, `planesClaro.js`, `catalogoPlanesStreaming.js`, `grillaCanales.js`,
  `packsCable.js`.
- "Somos Clave": `somosClaveScraped.js`, `contenidosSomosClave.js`.
- `filtroMarca.js` — separa contenido VTR vs Claro.

### En Firestore
- `conocimiento_portal` — índice RAG central (guías del portal, KB, respuestas aprobadas por
  admin, artículos de Somos Clave).
- `training_examples` — ejemplos de entrenamiento en lenguaje natural.
- `apex_memoria`, `apex_aprendizaje` — memoria y ejemplos aprendidos.
- `chat_conversations`, `knowledge_candidates` — log y candidatos.

## Aprendizaje continuo (human-in-the-loop)

Documentado en `IA PARA VTR/README_aprendizaje_continuo.md` y en
`src/asistente/aprendizajeContinuo.js`. **No** se reentrena el modelo ni se publica solo:

1. Cada turno se registra en `chat_conversations`.
2. Se calcula una **confianza**; si es menor a **0.70**, el conocimiento pasa a
   `knowledge_candidates` (agrupado por *cluster*).
3. En `/admin` → pestaña **Aprendizaje**, un humano revisa y **aprueba o rechaza**.
4. Al aprobar, la respuesta entra a `conocimiento_portal` (fuente `admin-aprobado`) y queda
   disponible para el RAG.

Componentes relacionados: `AdminConocimientoIA.jsx` (enseñar conocimiento),
`AdminAprendizajeContinuo.jsx` (revisar candidatos).

## Datasets e insumos (`IA PARA VTR/`)

| Archivo | Contenido |
|---|---|
| `andes_vtr_ia_knowledge_base.json` | Base de conocimiento (reglas, fuentes, conocimiento estructurado) |
| `andes_vtr_training_dataset.csv` | Dataset tabular (`id, input, intent, categoria, answer, source, tags`) |
| `training_examples_nl.json` | Ejemplos en lenguaje natural por intención |
| `README_*.md` | Documentación de la KB, del dataset y del aprendizaje continuo |

Estos archivos alimentan (vía `conocimientoKbAndes.js` y `trainingEjemplosNl.js`) las
colecciones de Firestore.

## Regenerar el corpus de diálogo

El corpus grande se genera con `vtr-web/scripts/generarCorpus1000.mjs`, que produce
`corpus_dialogos_naturales_1000.{json,jsonl,txt}` en `src/asistente/data/` y el módulo
`corpusBloqueGenerado1000.js`. Ver [10-scripts.md](10-scripts.md).
