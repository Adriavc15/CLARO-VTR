# Aprendizaje continuo ChatbotAndes

Arquitectura: **RAG + Firestore + registro + candidatos + aprobación humana** (sin reentrenar el modelo ni auto-publicar precios).

## Colecciones

| Colección | Uso |
|-----------|-----|
| `chat_conversations` | Log de preguntas/respuestas + confianza |
| `knowledge_candidates` | Preguntas de baja confianza agrupadas (pendiente) |
| `conocimiento_portal` | Base oficial; al aprobar se escribe `fuente: admin-aprobado` |

## Flujo

1. Usuario pregunta → chatbot responde con RAG.
2. Se calcula `confidence` (score / guía / empate).
3. Si `confidence < 0.70` → acumula en `knowledge_candidates` (variantes + frecuencia).
4. Admin en `/admin` → pestaña **Aprendizaje** → Aprobar / Editar / Rechazar.
5. Aprobar exige respuesta validada → pasa a `conocimiento_portal`.

## Código

- `vtr-web/src/asistente/aprendizajeContinuo.js`
- `vtr-web/src/components/AdminAprendizajeContinuo.jsx`
- Hook en `ChatbotAndes.jsx` tras cada turno
