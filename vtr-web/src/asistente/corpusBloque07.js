/**
 * Bloque 07 — Registro formal / institucional + puente a casual/chat.
 * Trabajo, universidad, atención al cliente, solicitudes, reclamos, correos.
 */

function pair(id, categoria, estilo, a, b) {
  return {
    id,
    categoria,
    estilo,
    bloque: '07',
    turnos: [
      { rol: 'A', texto: a },
      { rol: 'B', texto: b },
    ],
  }
}

function multi(id, categoria, estilo, turnos) {
  return { id, categoria, estilo, bloque: '07', turnos }
}

const SALUDOS_FORMALES = [
  ['Buenos días, ¿cómo se encuentra?', 'Muy bien, gracias. ¿En qué puedo ayudarlo?'],
  ['Buenas tardes.', 'Buenas tardes. Dígame.'],
  ['Buenas noches, mucho gusto.', 'Igualmente, un gusto.'],
  ['Es un placer saludarlo.', 'El gusto es mío.'],
  ['Espero que se encuentre bien.', 'Así es, gracias. ¿En qué le ayudo?'],
  ['Reciba un cordial saludo.', 'Gracias. Igualmente.'],
  ['¿Cómo ha estado?', 'Bien, gracias. ¿Y usted?'],
  ['Le saludo cordialmente.', 'Cordialmente. Dígame.'],
  ['Espero que haya tenido un buen día.', 'Gracias, igual. ¿Qué necesita?'],
  ['Muy buenos días, señor.', 'Buenos días. ¿En qué puedo ayudarlo?'],
  ['Buenas tardes, profesora.', 'Buenas tardes. Dime.'],
  ['Un gusto poder conversar con usted.', 'Igualmente. Adelante.'],
]

const SOLICITUDES = [
  [
    'Quisiera solicitar información sobre este procedimiento.',
    'Con gusto. ¿Podría indicarme a qué procedimiento se refiere?',
  ],
  [
    '¿Podría indicarme cómo debo realizar el trámite?',
    'Claro. Le indico los pasos principales.',
  ],
  ['Agradecería mucho su orientación.', 'Por supuesto. ¿Sobre qué tema?'],
  [
    '¿Sería tan amable de brindarme mayor información?',
    'Con gusto. ¿Qué detalle necesita?',
  ],
  [
    'Quisiera consultar si todavía existe disponibilidad.',
    'Permítame verificar y le confirmo.',
  ],
  ['¿Podría ayudarme con este inconveniente?', 'Claro. Cuénteme qué ocurrió.'],
  [
    'Me gustaría conocer los requisitos necesarios.',
    'Por supuesto. Se los detallo.',
  ],
  [
    'Le agradecería que pudiera revisar mi solicitud.',
    'De acuerdo. La revisaré y le informo.',
  ],
  ['¿Sería posible realizar el cambio?', 'Voy a verificar si procede.'],
  [
    'Quisiera saber cuál sería el siguiente paso.',
    'El siguiente paso es completar la validación.',
  ],
  [
    '¿Podría confirmarme esta información, por favor?',
    'Sí, un momento mientras confirmo.',
  ],
  [
    'Le agradecería una respuesta cuando tenga oportunidad.',
    'Quedo atento. Le responderé a la brevedad.',
  ],
]

const TRABAJO = [
  ['Ya se completó la tarea solicitada.', 'Perfecto. Gracias por el aviso.'],
  [
    'El informe se encuentra listo para su revisión.',
    'Recibido. Lo revisaré y le comento.',
  ],
  ['Quedo atento a cualquier observación.', 'De acuerdo. Le escribiré si surge algo.'],
  [
    'Procederé con la actualización correspondiente.',
    'Perfecto. Infórmeme cuando esté lista.',
  ],
  [
    'Le informaré apenas tenga novedades.',
    'Gracias. Quedo atento.',
  ],
  [
    'El caso ha sido derivado al área correspondiente.',
    'Entendido. ¿Tiene un plazo estimado?',
  ],
  ['Hemos identificado el inconveniente.', 'Gracias. ¿Cuál sería la solución?'],
  [
    'Se realizará la validación respectiva.',
    'De acuerdo. Quedo atento al resultado.',
  ],
  [
    'La información ha sido registrada correctamente.',
    'Perfecto. Muchas gracias.',
  ],
  ['El requerimiento fue atendido.', 'Excelente. Agradezco la gestión.'],
  [
    'Estamos realizando las verificaciones necesarias.',
    'Comprendido. Gracias por la actualización.',
  ],
  [
    'Le mantendré informado sobre cualquier cambio.',
    'Se lo agradezco.',
  ],
]

const UNIVERSIDAD = [
  [
    'Profesor, quisiera realizar una consulta respecto al trabajo.',
    'Claro. ¿Cuál es su consulta?',
  ],
  [
    '¿Podría indicarme la fecha límite de entrega?',
    'La fecha límite es la publicada en el aula virtual.',
  ],
  [
    'Quisiera confirmar si la actividad será evaluada.',
    'Sí, forma parte de la evaluación.',
  ],
  [
    '¿Es posible presentar el trabajo de manera virtual?',
    'Sí, puede enviarlo por el canal indicado.',
  ],
  [
    'Agradecería que pudiera aclarar esta indicación.',
    'Por supuesto. ¿Qué parte no quedó clara?',
  ],
  [
    'No pude asistir a la clase anterior. ¿Podría indicarme qué temas se desarrollaron?',
    'Se revisó el material de la unidad 3. Se lo comparto.',
  ],
  [
    'Quisiera solicitar una revisión de mi calificación.',
    'De acuerdo. Indíqueme el motivo de la solicitud.',
  ],
  [
    '¿Podría compartir nuevamente el material de la clase?',
    'Claro. Se lo envío.',
  ],
  [
    'Tengo una consulta respecto a la metodología de evaluación.',
    'Con gusto. ¿Qué punto desea aclarar?',
  ],
  [
    '¿La exposición se realizará de manera individual o grupal?',
    'Será grupal, según lo indicado en la guía.',
  ],
]

const ATENCION = [
  ['Buenas tardes, ¿en qué podemos ayudarlo?', 'Buenas tardes. Tengo una consulta sobre mi servicio.'],
  ['Permítame verificar la información.', 'Claro, muchas gracias.'],
  ['Comprendo la situación.', 'Agradezco su comprensión.'],
  [
    'Lamento los inconvenientes ocasionados.',
    'Entiendo. ¿Qué alternativa hay?',
  ],
  ['Procederé a revisar su caso.', 'Quedo atento. Gracias.'],
  ['Un momento, por favor.', 'De acuerdo.'],
  ['Gracias por su paciencia.', 'No hay problema.'],
  ['Hemos registrado su solicitud.', 'Perfecto. ¿Cuál es el número de seguimiento?'],
  [
    'Su requerimiento ha sido ingresado correctamente.',
    'Muchas gracias.',
  ],
  [
    'Le brindaremos una respuesta a la brevedad.',
    'Quedo atento. Gracias.',
  ],
  [
    '¿Podría proporcionarme su número de cliente?',
    'Sí, se lo indico a continuación.',
  ],
  ['Permítame confirmar algunos datos.', 'Claro.'],
  ['Entiendo su preocupación.', 'Agradezco que lo revise.'],
  [
    'Voy a derivar el caso al área correspondiente.',
    'De acuerdo. ¿Me confirmarán por correo?',
  ],
  [
    '¿Hay algo más en lo que podamos ayudarlo?',
    'Por ahora eso es todo. Muchas gracias.',
  ],
]

const AGRADECIMIENTOS = [
  ['Muchas gracias por su ayuda.', 'Con gusto.'],
  [
    'Le agradezco mucho la información proporcionada.',
    'Para servirle.',
  ],
  ['Gracias por su tiempo.', 'Un placer.'],
  ['Aprecio mucho su disposición.', 'Cuando guste.'],
  ['Le agradezco la atención brindada.', 'Gracias a usted.'],
  ['Muchas gracias por la pronta respuesta.', 'Con gusto.'],
  ['Quedo muy agradecido por su apoyo.', 'Estamos para ayudarlo.'],
  ['Gracias por la aclaración.', 'De nada.'],
  ['Agradezco su comprensión.', 'No se preocupe.'],
  ['Ha sido de mucha utilidad.', 'Me alegra saberlo.'],
]

const DISCULPAS = [
  [
    'Le ofrezco mis disculpas por el inconveniente.',
    'Se agradece. ¿Cómo lo resolvemos?',
  ],
  ['Lamento la demora en responder.', 'No hay problema. Gracias.'],
  [
    'Disculpe las molestias ocasionadas.',
    'Entendido. ¿Cuál es el siguiente paso?',
  ],
  ['Le pido disculpas por la confusión.', 'Está bien. Aclaremos.'],
  [
    'Lamento no haber podido responder antes.',
    'Tranquilo. ¿Ya tiene la información?',
  ],
  [
    'Ofrezco disculpas por el error cometido.',
    'Acepto. ¿Puede corregirlo, por favor?',
  ],
  [
    'Comprendo que la situación haya generado molestias.',
    'Sí. Agradezco que lo atiendan.',
  ],
  [
    'Agradezco su comprensión ante lo ocurrido.',
    'De acuerdo. Quedo atento a la solución.',
  ],
  ['Disculpe, procederé a corregirlo.', 'Perfecto. Gracias.'],
  [
    'Lamento los inconvenientes que esto pudiera haber ocasionado.',
    'Entiendo. Esperaré la actualización.',
  ],
]

const RECLAMOS = [
  [
    'Deseo presentar un reclamo respecto al servicio recibido.',
    'Comprendo. Permítame registrar su reclamo.',
  ],
  [
    'Quisiera dejar constancia de lo ocurrido.',
    'De acuerdo. ¿Podría detallarme los hechos?',
  ],
  [
    'Considero que la situación debería ser revisada.',
    'Tiene razón en solicitar revisión. Procederé.',
  ],
  [
    'Solicito que se investigue el inconveniente.',
    'Lo derivaré al área correspondiente.',
  ],
  [
    'No estoy conforme con la respuesta recibida.',
    'Entiendo. Revisaremos el caso nuevamente.',
  ],
  [
    'Me gustaría obtener una explicación sobre lo sucedido.',
    'Con gusto le explicaré lo que tenemos registrado.',
  ],
  [
    'Solicito una solución al problema presentado.',
    'Voy a gestionar las alternativas disponibles.',
  ],
  [
    'Hasta el momento no he recibido una respuesta.',
    'Lamento la demora. Verificaré el estado ahora.',
  ],
  [
    'Quisiera conocer el estado actual de mi solicitud.',
    'Permítame consultar el estado y le informo.',
  ],
  [
    'Agradecería que mi caso sea revisado nuevamente.',
    'De acuerdo. Lo priorizaré para revisión.',
  ],
]

const CORREOS = [
  [
    'Por medio del presente, deseo informar lo siguiente.',
    'Recibido. Quedo atento a los detalles.',
  ],
  [
    'Me comunico con usted para solicitar información.',
    'Con gusto. ¿Sobre qué tema?',
  ],
  [
    'El motivo de este mensaje es consultar sobre el estado del trámite.',
    'Voy a verificarlo y le confirmo.',
  ],
  [
    'En relación con lo conversado anteriormente, adjunto el documento.',
    'Recibido. Lo revisaré.',
  ],
  [
    'Según lo coordinado, adjunto el documento solicitado.',
    'Perfecto. Gracias.',
  ],
  [
    'Adjunto la información correspondiente para su revisión.',
    'Quedo atento a sus comentarios.',
  ],
  ['Quedo atento a sus comentarios.', 'Le responderé a la brevedad.'],
  ['Quedo a la espera de su confirmación.', 'Se la envío hoy.'],
  [
    'Sin otro particular, agradezco de antemano su atención.',
    'Cordialmente. Atendido.',
  ],
  ['Cordialmente.', 'Cordialmente.'],
]

const FORMAL_NATURAL = [
  [
    'Hola, buenos días. Quería consultar algo.',
    'Buenos días. Claro, dígame.',
  ],
  [
    'Buenas tardes, ¿podría ayudarme con una consulta?',
    'Buenas tardes. Con gusto.',
  ],
  [
    'Disculpe, ¿me podría confirmar esa información?',
    'Claro, un momento.',
  ],
  [
    'Entiendo. Muchas gracias por la aclaración.',
    'Con gusto.',
  ],
  ['Perfecto, quedo atento entonces.', 'Quedo atento también.'],
  [
    'De acuerdo, procederé de esa manera.',
    'Perfecto. Infórmeme si surge algo.',
  ],
  ['Está bien, muchas gracias.', 'Cuando guste.'],
  [
    'Comprendido, gracias por la información.',
    'De nada.',
  ],
  [
    'No se preocupe, entiendo la situación.',
    'Se agradece su comprensión.',
  ],
  ['Claro, revisaré el documento.', 'Perfecto. Gracias.'],
  ['Sí, no hay inconveniente.', 'Excelente.'],
  [
    'Perfecto, muchas gracias por su tiempo.',
    'Un placer ayudarlo.',
  ],
]

/** Misma intención en 3 registros: formal / neutro / chat */
const REGISTRO_MAP = [
  multi('b07-reg-1-doc', 'registro', 'registro', [
    { rol: 'A', texto: 'Buenas tardes, ¿podría indicarme si ya se encuentra disponible el documento?' },
    { rol: 'B', texto: 'Buenas tardes. Permítame verificar y le confirmo.' },
    { rol: 'A', texto: 'Hola, ¿ya está el documento?' },
    { rol: 'B', texto: 'Déjame revisar.' },
    { rol: 'A', texto: 'Oe, ¿ya salió el doc? xd' },
    { rol: 'B', texto: 'Espera, voy a mirar.' },
  ]),
  multi('b07-reg-2-reunion', 'registro', 'registro', [
    { rol: 'A', texto: 'Le agradecería que pudiera confirmarme la hora de la reunión.' },
    { rol: 'B', texto: 'Con gusto. La reunión es a las 10:00.' },
    { rol: 'A', texto: '¿Me confirmas la hora de la reunión?' },
    { rol: 'B', texto: 'Sí, a las 10.' },
    { rol: 'A', texto: '¿A qué hora era la reunión?' },
    { rol: 'B', texto: 'A las 10.' },
  ]),
  multi('b07-reg-3-verificar', 'registro', 'registro', [
    { rol: 'A', texto: 'Comprendo el inconveniente. Permítame verificar la información.' },
    { rol: 'B', texto: 'De acuerdo. Quedo atento.' },
    { rol: 'A', texto: 'Entiendo, déjame revisar.' },
    { rol: 'B', texto: 'Va.' },
    { rol: 'A', texto: 'Ya, espera, voy a revisar.' },
    { rol: 'B', texto: 'Dale.' },
  ]),
  multi('b07-reg-4-rechazo', 'registro', 'registro', [
    { rol: 'A', texto: 'Lamento informarle que la solicitud no ha sido aprobada.' },
    { rol: 'B', texto: 'Entiendo. ¿Existe alguna opción de apelación?' },
    { rol: 'A', texto: 'Lamentablemente, no aprobaron la solicitud.' },
    { rol: 'B', texto: 'Qué pena. ¿Qué sigue?' },
    { rol: 'A', texto: 'No la aprobaron 😕' },
    { rol: 'B', texto: 'Uf. ¿Se puede volver a intentar?' },
  ]),
  multi('b07-reg-cambio', 'registro', 'registro', [
    { rol: 'A', texto: 'Buenas tardes, quisiera consultar el estado de mi solicitud.' },
    { rol: 'B', texto: 'Buenas tardes. Permítame verificar.' },
    { rol: 'A', texto: 'Ah ya, gracias.' },
    { rol: 'B', texto: 'Listo. Todavía está en revisión.' },
    { rol: 'A', texto: 'Ok ok, entonces espero.' },
    { rol: 'B', texto: 'Dale. Te aviso cuando haya novedad.' },
  ]),
]

function pack(list, prefix, categoria, estilo) {
  return list.map(([a, b], i) =>
    pair(`${prefix}-${String(i + 1).padStart(2, '0')}`, categoria, estilo, a, b)
  )
}

export const BLOQUE_07_FORMAL = [
  ...pack(SALUDOS_FORMALES, 'b07-sal', 'formal', 'formal'),
  ...pack(SOLICITUDES, 'b07-sol', 'solicitud', 'formal'),
  ...pack(TRABAJO, 'b07-trab', 'trabajo', 'formal'),
  ...pack(UNIVERSIDAD, 'b07-uni', 'universidad', 'formal'),
  ...pack(ATENCION, 'b07-aten', 'atencion', 'formal'),
  ...pack(AGRADECIMIENTOS, 'b07-agr', 'agradecimiento', 'formal'),
  ...pack(DISCULPAS, 'b07-disc', 'disculpa', 'formal'),
  ...pack(RECLAMOS, 'b07-rec', 'reclamo', 'formal'),
  ...pack(CORREOS, 'b07-corr', 'correo', 'formal'),
  ...pack(FORMAL_NATURAL, 'b07-nat', 'formal_natural', 'semi'),
  ...REGISTRO_MAP,
]

export function formatearRegistroFormalParaPrompt() {
  return `
REGISTRO FORMAL / INSTITUCIONAL:
- Detecta tono formal (usted, “quisiera”, “agradezco”, “procederé”, “cordialmente”) y responde en el mismo registro.
- Formal ≠ robot: puede ser cordial y claro, sin jerga ni emojis salvo que el usuario ya baje el tono.
- Si el usuario pasa de formal a casual (“Ah ya”, “ok ok”), baja tú también el registro.
- Misma intención, varios registros: formal / neutro / chat. Elige según cómo escribe el usuario.
- En reclamos: empatía + gestión concreta, sin pelea ni exceso de disculpas vacías.
- En trabajo/universidad: preciso, respetuoso, sin “modo laboral” etiquetado.
`.trim()
}
