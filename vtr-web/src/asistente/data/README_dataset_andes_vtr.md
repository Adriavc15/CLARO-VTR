# Base de conocimiento IA Andes / VTR

Generado a partir de los materiales disponibles el 19/09/2026.

## Archivos

- `andes_vtr_ia_knowledge_base.json`: base principal. Incluye reglas, fuentes, conocimiento estructurado, planes y chunks del PDF de retención.
- `andes_vtr_training_dataset.jsonl`: ejemplos de entrada -> intención -> respuesta para entrenamiento/evaluación.
- `andes_vtr_training_dataset.csv`: la misma colección en formato tabular.

## Cobertura

- Planes 1P, 2P y 3P
- Internet FTTH
- TV y streaming
- Telefonía
- Canales fuera de grilla Inicia
- ONT, LOS, fibra óptica, módem y Mesh
- Visita técnica
- Inhibición
- Asistencia VTR
- Control remoto
- D-Box
- Cambio de plan
- Plantilla N1
- Requerimiento de cliente crítico
- Registro de incidencias Genesys
- Plantilla general
- Contactos
- Ciclos de facturación
- Plan de Retención N1 VTR del 15/09/2026, preservado por páginas/bloques

## Importante

El archivo fuente contenía credenciales, contraseñas, API keys y otros secretos. Fueron excluidos deliberadamente del dataset.

También hay conocimiento que el archivo fuente importa desde otros módulos (`guiasPortal`, `idsClaveLive` y `ChatbotAndes`) y que no está embebido en el texto. Esos módulos quedan marcados como dependencias pendientes; no se inventó su contenido.

## Arquitectura recomendada

1. Normalización del mensaje del usuario.
2. Detección de intención y entidades.
3. Búsqueda semántica/RAG sobre `knowledge`.
4. Priorización de registros estructurados frente a chunks generales.
5. Generación de respuesta usando únicamente evidencia recuperada.
6. Si no hay evidencia suficiente: aclarar o indicar que no está documentado.
7. Registrar preguntas no resueltas para ampliar `training_examples` y `knowledge`.

## Actualización

Cada cambio de precios, promociones, procedimientos o políticas debería crear una nueva versión de conocimiento con fecha y fuente, en lugar de sobrescribir silenciosamente información anterior.
