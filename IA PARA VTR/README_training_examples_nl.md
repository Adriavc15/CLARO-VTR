# Training examples NL — Andes/VTR

Capa de **lenguaje natural** para que ChatbotAndes no dependa solo de títulos literales.

## Contenido generado

- **8 intents** (HBO/Max, Netflix, Disney+, Prime, Fibra 600/800/940, planes general)
- **~1282 frases** (formal, coloquial, corta, sin signos, errores leves, continuación “y con…?”)

Archivo: `training_examples_nl.json`

## Firestore

Colección: `training_examples`

Cada documento:

```json
{
  "intent": "consultar_planes_hbo",
  "category": "planes",
  "user_examples": ["tienen hbo?", "y max?", "..."],
  "entities": ["HBO", "Max"],
  "action": "buscar_planes_con_streaming",
  "response_source": "plans",
  "matchDocs": ["KB-0055", "KB-0063"]
}
```

También se indexan hubs `NL-*` en `conocimiento_portal` (sinonimos = user_examples) para el RAG local del chat.

## Código

- Generador: `vtr-web/src/asistente/trainingEjemplosNl.js`
- Sync: botón admin **Subir base Andes/VTR a Firestore** o `sincronizarTrainingExamples()`
