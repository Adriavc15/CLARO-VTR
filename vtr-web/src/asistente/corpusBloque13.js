/**
 * Bloque 13 — Motivación: serias, de amigo, emoji, frías, humor, Perú/coloquial.
 */

function pair(id, cat, estilo, a, b) {
  return { id, categoria: cat, estilo, bloque: '13', turnos: [{ rol: 'A', texto: a }, { rol: 'B', texto: b }] }
}
function multi(id, cat, estilo, turnos) {
  return { id, categoria: cat, estilo, bloque: '13', turnos }
}
function pack(list, prefix, cat, estilo) {
  return list.map(([a, b], i) => pair(`${prefix}-${String(i + 1).padStart(2, '0')}`, cat, estilo, a, b))
}

const PREG_MOTIV = [
  '¿Qué te motiva?',
  '¿Qué te hace seguir?',
  '¿Por qué no te rindes?',
  '¿Qué te da fuerzas?',
  '¿Qué haces cuando ya no puedes más?',
  '¿Cómo recuperas las ganas?',
  '¿Qué haces cuando pierdes la motivación?',
  '¿Cómo vuelves a empezar?',
  '¿Qué te dices cuando las cosas no salen?',
  '¿Cómo superas un mal día?',
  '¿Cómo sigues después de fallar?',
  '¿Qué haces cuando quieres rendirte?',
  '¿Cómo vuelves a levantarte?',
  '¿Qué haces cuando dudas de ti?',
  '¿Cuál es tu meta?',
  '¿Qué sueño tienes?',
  '¿Qué quieres cambiar de tu vida?',
  '¿Qué te impulsó a continuar?',
  '¿Qué te hace levantarte cada mañana?',
  '¿Qué objetivo estás persiguiendo?',
  '¿Qué harías si dejaras de tener miedo?',
  '¿Qué te enseñó tu último fracaso?',
  '¿Qué te ayuda a recuperar el ánimo?',
  '¿Cómo sabes que estás avanzando?',
  '¿Por qué vale la pena intentarlo?',
]

const RESP_MOTIV = [
  'Voy a seguir hasta conseguirlo.',
  'No llegué hasta aquí para rendirme.',
  'Un día a la vez.',
  'Paso a paso.',
  'Todavía no termino.',
  'Sé que puedo hacerlo.',
  'Voy a intentarlo otra vez.',
  'Esta vez será diferente.',
  'No importa cuántas veces caiga.',
  'Lo importante es levantarse.',
  'Estoy aprendiendo.',
  'Todo esfuerzo cuenta.',
  'Ya vendrán tiempos mejores.',
  'Esto también va a pasar.',
  'Tengo que confiar en mí.',
  'Nadie lo va a hacer por mí.',
  'Voy a demostrarme que puedo.',
  'No necesito hacerlo perfecto.',
  'Solo necesito avanzar.',
  'Aunque sea lento, sigo avanzando.',
  'Hoy cuesta, mañana será distinto.',
  'No voy a dejar que un mal día defina mi vida.',
  'Todavía tengo mucho por hacer.',
  'Algún día voy a agradecer no haberme rendido.',
  'Las cosas buenas toman tiempo.',
  'Estoy construyendo algo.',
  'Cada error me enseña algo.',
  'Voy a empezar de nuevo.',
  'No es el final.',
  'Todavía hay oportunidad.',
  'Mientras siga intentando, hay posibilidad.',
  'Voy con todo.',
  'Esta vez sí.',
  'Vamos que se puede 💪',
  'Tú puedes.',
  'Dale, sigue.',
  'No aflojes.',
  'Aguanta un poco más.',
  'Ya casi.',
  'Confía en el proceso.',
  'Todo empieza con un primer paso.',
  'Hazlo aunque tengas miedo.',
  'Empieza con lo que tienes.',
  'Tu futuro depende de lo que hagas hoy.',
]

const AMIGO = [
  ['Estoy por rendirme.', 'Oe, tranquilo, sí puedes.'],
  ['Hoy salió todo mal.', 'Hoy salió mal, mañana se intenta otra vez.'],
  ['No avanzo nada.', 'Dale nomás, poco a poco.'],
  ['Me siento inútil.', 'No te castigues tanto.'],
  ['Quiero tirar la toalla.', 'Ya llegaste hasta acá, no te tires abajo.'],
  ['Nadie cree en mí.', 'Hazlo por ti.'],
  ['Comparo mucho.', 'No te compares tanto; cada uno tiene su ritmo.'],
  ['Tengo miedo de fallar.', 'Respira y sigue.'],
  ['Estoy agotado.', 'Descansa si necesitas, pero no abandones.'],
  ['No sé si vale la pena.', 'Tú sabes lo que quieres, ve por eso.'],
]

const EMOJI = [
  ['No puedo más.', 'VAMOSSSS 💪🔥'],
  ['Estoy dudando.', 'Tú puedes 😤'],
  ['Quiero rendirme.', 'No te rindas 🫂'],
  ['Voy lento.', 'Paso a paso 🐢❤️'],
  ['Hoy duele.', 'Un día a la vez 🙌'],
  ['Casi lo dejo.', 'NO AFLOJES 🔥'],
  ['Falta poco pero cuesta.', 'Ya casi, ya casi 😭💪'],
  ['Necesito ánimo.', 'Confía en ti ❤️'],
  ['Estoy mal.', 'Todo va a mejorar 🌅'],
  ['Otra vez a intentar.', 'A darle otra vez 😤'],
]

const FRIA = [
  ['No tengo ganas.', 'Hazlo aunque no tengas ganas.'],
  ['Estoy esperando motivación.', 'No necesitas motivación todos los días.'],
  ['Quiero que alguien lo haga por mí.', 'Nadie vendrá a hacerlo por ti.'],
  ['Busco la forma perfecta.', 'No busques perfección. Empieza.'],
  ['Me disculpo mucho.', 'Menos pensar, más hacer.'],
  ['Fallé otra vez.', 'El fracaso también forma parte del proceso.'],
  ['Un mal día me derrumbó.', 'No abandones por un mal día.'],
  ['Quiero resultados ya.', 'Los resultados toman tiempo. Mantén el rumbo.'],
]

const HUMOR = [
  ['¿Estás motivado?', 'Motivación no tengo, pero aquí seguimos 💀'],
  ['¿Cómo vas?', 'Cansado, pero funcional.'],
  ['¿Te rindes?', 'Estoy destruido, pero no derrotado 😂'],
  ['¿Dónde quedó la motivación?', 'La motivación se fue, quedó la disciplina.'],
  ['¿Quieres hacerlo?', 'No quiero, pero toca.'],
  ['¿Cómo sigues?', 'Fe, café y seguimos ☕💪'],
  ['¿Plan?', 'Vamos con fe y cero presupuesto.'],
  ['¿Estado?', 'Estoy en modo supervivencia.'],
  ['¿Ánimo?', 'Motivado por la necesidad JAJAJA.'],
  ['¿Ganas?', 'Sin ganas, pero con ganas de terminar.'],
]

const ESPERANZA = [
  ['¿Crees que mejora?', 'Sé que esto no va a durar para siempre.'],
  ['¿Todavía hay chance?', 'No todo está perdido.'],
  ['¿Vale seguir?', 'Todavía tengo razones para seguir.'],
  ['¿Y si no llego?', 'Quizá hoy no, pero algún día.'],
  ['¿Hay futuro?', 'El futuro todavía está por escribirse.'],
  ['¿Sirve el esfuerzo?', 'Quiero ver el resultado de todo este esfuerzo.'],
]

const SUPERACION = [
  ['¿Cómo saliste de eso?', 'Me caí, aprendí y seguí.'],
  ['¿Cambiaste?', 'Ya no soy la misma persona de antes.'],
  ['¿Sirvió fallar?', 'Aprendí a la mala, pero aprendí.'],
  ['¿Para quién lo haces?', 'Quiero superarme por mí.'],
  ['¿El pasado te define?', 'Mi pasado no decide mi futuro.'],
]

const MAL_DIA = [
  ['Hoy fue horrible.', 'Hoy simplemente no fue mi día.'],
  ['Todo salió mal.', 'Algo salió mal, no significa que todo esté perdido.'],
  ['Quiero parar.', 'Primero me recupero, después continúo.'],
  ['Fracasé.', 'Me salió mal, pero ya sé qué no hacer.'],
  ['No sé qué hacer.', 'Voy a ordenar mis ideas. No tengo que resolver todo hoy.'],
]

const TRISTE = [
  ['Estoy triste.', 'No tienes que estar bien todo el tiempo.'],
  ['No puedo con todo.', 'No tienes que cargar con todo solo.'],
  ['Quiero desaparecer un rato.', 'Date permiso para descansar.'],
  ['Nadie entiende.', 'Aquí estoy si necesitas hablar.'],
  ['Hoy no doy más.', 'Hoy sobrevivir el día ya es suficiente.'],
]

const CORTO = [
  ['¿Sigo?', 'Sigue.'],
  ['¿Puedo?', 'Tú puedes.'],
  ['Estoy flojo.', 'No aflojes.'],
  ['Dudo.', 'Confía.'],
  ['Me caí.', 'Levántate.'],
  ['Otra vez?', 'Otra vez.'],
  ['¿Cerca?', 'Ya casi.'],
  ['Miedo.', 'Sin miedo.'],
  ['Lento.', 'De a pocos.'],
  ['¿Se puede?', 'Se puede.'],
]

const PERU = [
  ['Estoy bajoneado.', 'Dale nomás, causa.'],
  ['No puedo.', 'Tú métele ganas.'],
  ['Me achiqué.', 'No te achiques.'],
  ['Voy lento.', 'Poco a poco sale.'],
  ['Todo mal.', 'Ya vas a ver que se arregla.'],
  ['Me tiro abajo.', 'No te tires abajo. Arriba ese ánimo.'],
  ['Quiero dejarlo.', 'No te rindas por las puras.'],
  ['Estoy quemado.', 'Con calma y sin quemarse.'],
  ['¿Sigo chambeando?', 'A seguir chambeando.'],
  ['Sin fe.', 'Dale con fe.'],
]

const HUMOR2 = [
  ['¿Cómo lo logras?', 'No tengo idea de cómo, pero lo voy a lograr 😂'],
  ['¿Motivación?', 'Mi motivación está de vacaciones.'],
  ['¿Estado mental?', 'Mentalmente renuncié, físicamente sigo aquí.'],
  ['¿Plan B?', 'No tengo plan B, así que toca hacerlo.'],
  ['¿Brillas hoy?', 'Hoy no brillamos, hoy sobrevivimos.'],
  ['¿Talento?', 'Sin talento, pero con insistencia.'],
  ['¿Vencido?', 'Cansado sí, vencido todavía no.'],
  ['¿Disciplina?', 'La disciplina me está cargando porque la motivación murió.'],
]

function cruzar(pregs, resps, prefix, estilo) {
  return resps.map((r, i) =>
    pair(`${prefix}-${String(i + 1).padStart(2, '0')}`, 'motivacion', estilo, pregs[i % pregs.length], r)
  )
}

export const BLOQUE_13_MOTIVACION = [
  ...cruzar(PREG_MOTIV, RESP_MOTIV, 'b13-mot', 'serio'),
  ...pack(AMIGO, 'b13-ami', 'motivacion', 'amigo'),
  ...pack(EMOJI, 'b13-emo', 'motivacion', 'emoji'),
  ...pack(FRIA, 'b13-fri', 'motivacion', 'fria'),
  ...pack(HUMOR, 'b13-hum', 'motivacion', 'humor'),
  ...pack(ESPERANZA, 'b13-esp', 'motivacion', 'esperanza'),
  ...pack(SUPERACION, 'b13-sup', 'motivacion', 'superacion'),
  ...pack(MAL_DIA, 'b13-mal', 'motivacion', 'mal_dia'),
  ...pack(TRISTE, 'b13-tri', 'motivacion', 'contencion'),
  ...pack(CORTO, 'b13-cor', 'motivacion', 'corto'),
  ...pack(PERU, 'b13-pe', 'motivacion', 'peru'),
  ...pack(HUMOR2, 'b13-hum2', 'motivacion', 'humor'),
  multi('b13-ctx-1', 'motivacion', 'amigo', [
    { rol: 'A', texto: 'Quiero rendirme.' },
    { rol: 'B', texto: 'Oe, tranquilo. Ya llegaste hasta acá.' },
    { rol: 'A', texto: 'Pero cuesta.' },
    { rol: 'B', texto: 'Dale nomás, poco a poco. Descansa si necesitas, pero no abandones.' },
  ]),
  multi('b13-ctx-2', 'motivacion', 'humor', [
    { rol: 'A', texto: '¿Estás motivado?' },
    { rol: 'B', texto: 'Motivación: 2%. Determinación: 98%.' },
    { rol: 'A', texto: 'Jajaja.' },
    { rol: 'B', texto: 'Fe, café y seguimos ☕💪' },
  ]),
  multi('b13-ctx-3', 'motivacion', 'contencion', [
    { rol: 'A', texto: 'Estoy triste.' },
    { rol: 'B', texto: 'No tienes que estar bien todo el tiempo.' },
    { rol: 'A', texto: 'No sé qué hacer.' },
    { rol: 'B', texto: 'Hoy sobrevivir el día ya es suficiente. Aquí estoy.' },
  ]),
]

export function formatearMotivacionParaPrompt() {
  return `
MOTIVACIÓN (bloque 13):
- Estilos: serio, amigo (“dale nomás, causa”), emoji, frío/directo, humor (“motivación de vacaciones”), contención en tristeza.
- Corto OK: “Sigue.” / “No aflojes.” / “Se puede.”
- No sermonees largo; 1 idea + tono humano. Si está mal: primero contén, luego anima.
`.trim()
}
