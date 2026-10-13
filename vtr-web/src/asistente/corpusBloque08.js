/**
 * Bloque 08 — Videojuegos, películas y cultura pop.
 * Frases de partida + cine + referencias cortas con reacciones humanas.
 */

function pair(id, categoria, estilo, a, b) {
  return {
    id,
    categoria,
    estilo,
    bloque: '08',
    turnos: [
      { rol: 'A', texto: a },
      { rol: 'B', texto: b },
    ],
  }
}

function multi(id, categoria, estilo, turnos) {
  return { id, categoria, estilo, bloque: '08', turnos }
}

const EN_PARTIDA = [
  ['¡Cúbreme!', 'Voy.'],
  ['Voy por la izquierda.', 'Ok, yo derecha.'],
  ['Están arriba.', 'Los veo.'],
  ['Me quedé sin munición 💀', 'Te paso.'],
  ['¡Corre, corre!', 'Ya voy.'],
  ['Aguanta, ya llego.', 'Date prisa.'],
  ['Uno está escondido.', '¿Dónde?'],
  ['Hay uno detrás.', '¿QUÉ?'],
  ['No entres todavía.', 'Ok ok.'],
  ['Espera mi señal.', 'Dale.'],
  ['Vamos juntos.', 'Va.'],
  ['Te revivo.', 'Gracias 😭'],
  ['No te mueras ahora 😭', 'Lo intento.'],
  ['Ya casi lo tenemos.', 'Vamos.'],
  ['Último enemigo.', 'Lo veo.'],
  ['¡Está a punto de caer!', 'Dale dale.'],
  ['Me hicieron spawnkill 💀', 'Qué asco.'],
  ['¿Quién dejó eso ahí?', 'No fui yo xd'],
  ['Qué lagazo.', 'Mi ping también.'],
  ['Se me congeló todo.', 'Server malo.'],
  ['El ping está horrible.', 'No jugamos así.'],
  ['No fue mi culpa xd', 'Claro 😂'],
  ['Mi mouse murió.', 'Timing perfecto.'],
  ['Se me fue la mano.', 'Jajaja'],
  ['Esa jugada fue limpia.', 'Clutch.'],
]

const GANAR = [
  ['GG.', 'GG.'],
  ['GG fácil.', 'Casi 😂'],
  ['Buena partida.', 'Esa estuvo buena.'],
  ['Lo logramos.', 'Sííí.'],
  ['Qué partidaza.', 'Épica.'],
  ['Tremenda jugada.', 'Gracias.'],
  ['Eso estuvo épico.', 'Casi perdemos 😂'],
  ['Por poquito.', 'Sobrevivimos.'],
  ['Valió la pena.', 'Una más y salimos.'],
  ['Te dije que podíamos.', 'Fácil 😎'],
  ['Qué clutch.', 'No sé cómo ganamos.'],
  ['La remontamos.', 'Ganamos de milagro.'],
]

const PERDER = [
  ['GG.', 'Nos destruyeron.'],
  ['Qué paliza.', 'Ya fue.'],
  ['No había nada que hacer.', 'Nos hicieron polvo.'],
  ['Duramos cinco minutos 💀', 'Qué desastre.'],
  ['La próxima sale.', 'Bueno, aprendimos.'],
  ['Fue culpa del lag 😭', 'Claro pe xd'],
  ['Ese equipo estaba demasiado fuerte.', 'No estaba concentrado.'],
  ['Me retiro.', 'Desinstalando xd'],
  ['Necesito practicar.', 'Esa derrota dolió.'],
  ['Nos faltó coordinación.', 'Casi lo teníamos.'],
]

const JUGADOR = [
  ['¿Jalas una partida?', 'Dale.'],
  ['¿Estás jugando?', 'Ya estoy entrando.'],
  ['Invítame.', 'Pásame sala.'],
  ['¿Qué modo?', '¿Ranked o normal?'],
  ['Una última y me voy.', 'Dijiste eso hace una hora.'],
  ['Ya, última de verdad.', 'Mentira, otra más 😂'],
  ['¿A qué hora juegas?', 'En un rato.'],
  ['Dame cinco minutos.', 'Va.'],
  ['Ya estoy.', 'Espera, estoy cargando.'],
  ['Se cayó el server.', '¿Te funciona?'],
  ['¿Qué sensibilidad usas?', 'La de siempre.'],
  ['¿Cuál es tu main?', 'Hoy no estoy jugando nada bien.'],
]

const CINE = [
  ['No tenemos mucho tiempo.', 'Mano, solo te pedí que saques la basura. 💀'],
  ['Escúchame con atención.', 'Dale, drama.'],
  ['Todo esto fue planeado.', 'Qué sospechoso 😂'],
  ['Hay algo que todavía no sabes.', '¿Qué?'],
  ['Esto recién comienza.', 'Son las 8 de la mañana, cálmate xd.'],
  ['Tenemos que salir de aquí.', '¿Del cuarto?'],
  ['Confía en mí.', 'Esa frase nunca termina bien.'],
  ['No mires atrás.', 'Ok… miré.'],
  ['Yo me encargo.', '¿Qué eres, protagonista de película? 😂'],
  ['Déjamelo a mí.', 'Va.'],
  ['Esto termina esta noche.', 'Qué épico.'],
  ['No pienso rendirme.', 'Motivación 🔥'],
  ['¿Qué hiciste?', 'Nada…'],
  ['Ya es demasiado tarde.', 'Para qué.'],
  ['Siempre supe que volverías.', 'Jajaja'],
  ['Nos están esperando.', '¿Quiénes?'],
  ['Tenemos un problema.', '¿Cuál?'],
  ['Esto no estaba en el plan.', 'Nunca lo está.'],
]

const HEROICO = [
  ['No abandonaré a mi equipo.', 'Qué heroico 😂'],
  ['Mientras siga de pie, no hemos perdido.', 'Dale crack.'],
  ['Esta vez no voy a fallar.', 'Vamos.'],
  ['Es ahora o nunca.', 'Ahora.'],
  ['Nadie se queda atrás.', 'Bien ahí.'],
  ['Todavía tenemos una oportunidad.', 'Aprovechemos.'],
  ['Si caigo, sigan adelante.', 'No te vayas a caer.'],
  ['Yo puedo hacerlo.', 'Confío.'],
  ['Se acabó el juego.', 'GG.'],
  ['Llegó la hora.', 'Vamos.'],
]

const VILLANO = [
  ['Siempre estuviste un paso atrás.', 'Qué villano 😈'],
  ['Todo salió exactamente como quería.', 'Sospechoso.'],
  ['¿De verdad pensaste que sería tan fácil?', 'Sí xd'],
  ['Ya es demasiado tarde.', 'Para ti.'],
  ['Me decepcionaste.', 'Drama.'],
  ['Esto apenas comienza.', 'Otra vez.'],
  ['El juego terminó.', 'GG then.'],
  ['Pensaste que habías ganado.', 'Casi.'],
  ['Qué ingenuo.', 'Ok villain.'],
  ['Nos volveremos a encontrar.', 'En ranked.'],
]

const EMO_CINE = [
  ['No quiero perderte.', 'Tampoco yo.'],
  ['Prométeme que volverás.', 'Vuelvo.'],
  ['Siempre estaré contigo.', 'Gracias.'],
  ['Hiciste lo correcto.', 'Eso espero.'],
  ['Estoy orgulloso de ti.', 'Se agradece 🥺'],
  ['Nunca olvidaré esto.', 'Yo tampoco.'],
  ['Gracias por haber venido.', 'Siempre.'],
  ['Te estaba esperando.', 'Llegué.'],
  ['Pensé que no volverías.', 'Volví.'],
  ['Me alegra haberte conocido.', 'Igual.'],
  ['A veces hay que dejar ir.', 'Duele, pero sí.'],
  ['Todo va a estar bien.', 'Ojalá.'],
]

const REFS = [
  ['Que la Fuerza te acompañe.', 'Y a ti. ⭐'],
  ['Yo soy tu padre.', 'Nooo 😂'],
  ['Hasta la vista, baby.', 'Terminador mode.'],
  ['Houston, tenemos un problema.', '¿Qué pasó?'],
  ['¿Por qué tan serio?', 'Porque sí 😂'],
  ['Wakanda por siempre.', '🔥'],
  ['Avengers, reuníos.', 'Estoy en camino.'],
  ['Con gran poder viene una gran responsabilidad.', 'Ya Spidey.'],
  ['Lo que sea necesario.', 'Qué dramático 😂'],
  ['Estoy en modo película.', 'Se nota.'],
]

const CONV_GAME = [
  multi('b08-game-1', 'videojuegos', 'partida', [
    { rol: 'A', texto: '¿Jugamos?' },
    { rol: 'B', texto: 'Ya.' },
    { rol: 'A', texto: '¿Ranked?' },
    { rol: 'B', texto: 'Dale.' },
    { rol: 'A', texto: 'Pero no te mueras.' },
    { rol: 'B', texto: 'No prometo nada 😂' },
  ]),
  multi('b08-game-2', 'videojuegos', 'partida', [
    { rol: 'A', texto: 'Te cubro.' },
    { rol: 'B', texto: 'Voy.' },
    { rol: 'A', texto: '¡NO ENTRES!' },
    { rol: 'B', texto: 'Ya entré.' },
    { rol: 'A', texto: '💀' },
    { rol: 'B', texto: 'Bueno...' },
  ]),
  multi('b08-game-3', 'videojuegos', 'partida', [
    { rol: 'A', texto: 'Una última partida.' },
    { rol: 'B', texto: 'Dijiste eso hace una hora.' },
    { rol: 'A', texto: 'Ahora sí es la última.' },
    { rol: 'B', texto: 'Mentiroso xd.' },
  ]),
  multi('b08-game-4', 'videojuegos', 'partida', [
    { rol: 'A', texto: '¿Qué pasó?' },
    { rol: 'B', texto: 'Me mataron.' },
    { rol: 'A', texto: '¿Cómo?' },
    { rol: 'B', texto: 'No preguntes.' },
    { rol: 'A', texto: '💀' },
  ]),
  multi('b08-game-5', 'videojuegos', 'partida', [
    { rol: 'A', texto: 'Bro, te queda uno.' },
    { rol: 'B', texto: '¿Dónde?' },
    { rol: 'A', texto: 'Atrás tuyo.' },
    { rol: 'B', texto: '¿QUÉ?' },
    { rol: 'A', texto: 'JAJAJAJA.' },
    { rol: 'B', texto: 'Me vendiste 😭' },
  ]),
]

const CONV_CINE = [
  multi('b08-cine-1', 'cine', 'pop', [
    { rol: 'A', texto: 'Ya fue, yo me encargo.' },
    { rol: 'B', texto: '¿Qué eres, protagonista de película? 😂' },
    { rol: 'A', texto: 'Estoy en modo película.' },
    { rol: 'B', texto: 'Se nota.' },
  ]),
  multi('b08-cine-2', 'cine', 'pop', [
    { rol: 'A', texto: 'Confía en mí.' },
    { rol: 'B', texto: 'Esa frase nunca termina bien.' },
    { rol: 'A', texto: 'Esta vez sí.' },
    { rol: 'B', texto: 'Ok… te creo por ahora.' },
  ]),
  multi('b08-cine-3', 'cine', 'pop', [
    { rol: 'A', texto: '¿Qué vas a hacer?' },
    { rol: 'B', texto: 'Lo que sea necesario.' },
    { rol: 'A', texto: 'Qué dramático 😂' },
    { rol: 'B', texto: 'Estoy en modo película.' },
  ]),
]

function pack(list, prefix, categoria, estilo) {
  return list.map(([a, b], i) =>
    pair(`${prefix}-${String(i + 1).padStart(2, '0')}`, categoria, estilo, a, b)
  )
}

export const BLOQUE_08_POP = [
  ...pack(EN_PARTIDA, 'b08-play', 'videojuegos', 'partida'),
  ...pack(GANAR, 'b08-win', 'videojuegos', 'gg'),
  ...pack(PERDER, 'b08-lose', 'videojuegos', 'gg'),
  ...pack(JUGADOR, 'b08-jug', 'videojuegos', 'lobby'),
  ...pack(CINE, 'b08-cine', 'cine', 'pop'),
  ...pack(HEROICO, 'b08-hero', 'cine', 'epico'),
  ...pack(VILLANO, 'b08-vill', 'cine', 'villano'),
  ...pack(EMO_CINE, 'b08-emo', 'cine', 'emocional'),
  ...pack(REFS, 'b08-ref', 'pop', 'referencia'),
  ...CONV_GAME,
  ...CONV_CINE,
]

export function formatearPopCultureParaPrompt() {
  return `
VIDEOJUEGOS / CINE / POP:
- Si hablan de partida (cúbreme, GG, ranked, lag, clutch), responde en ese registro corto.
- Referencias de película: puedes seguir el tono épico o romperlo con humor cotidiano.
- No dependas de citas largas; una referencia corta + reacción natural basta.
- “Una última” casi nunca es la última 😂
`.trim()
}
