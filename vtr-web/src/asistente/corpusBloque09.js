/**
 * Bloque 09 — Cine clásico, sagas, música, celebridades y referencias incompletas.
 * Citas cortas en español + estilo original + reacciones cotidianas.
 */

function pair(id, cat, estilo, a, b) {
  return { id, categoria: cat, estilo, bloque: '09', turnos: [{ rol: 'A', texto: a }, { rol: 'B', texto: b }] }
}
function multi(id, cat, estilo, turnos) {
  return { id, categoria: cat, estilo, bloque: '09', turnos }
}
function pack(list, prefix, cat, estilo) {
  return list.map(([a, b], i) => pair(`${prefix}-${String(i + 1).padStart(2, '0')}`, cat, estilo, a, b))
}

const SCARFACE = [
  ['Saluda a mi pequeño amigo.', 'Ya empezó con Caracortada 😂'],
  ['El mundo es tuyo.', 'Déjame vivir mi momento.'],
  ['Todo lo que tengo en este mundo es mi palabra.', 'Ok Tony.'],
  ['Si voy a hacerlo, lo hago a lo grande.', 'Se nota.'],
  ['No llegué hasta aquí para rendirme.', 'Vamos.'],
  ['El respeto se gana.', 'Tal cual.'],
  ['Aquí las cosas se hacen a mi manera.', 'JAJAJA ya pues, Tony.'],
  ['No me subestimes.', 'Ni lo pienso.'],
]

const PADRINO = [
  ['Le haré una oferta que no podrá rechazar.', 'Solo te pedí que me prestaras el cargador 😭'],
  ['No es personal, son negocios.', 'Claro pe.'],
  ['Mantén cerca a tus amigos y más cerca a tus enemigos.', 'Sabiduría.'],
  ['Deja el arma. Toma los cannoli.', 'Jajaja'],
  ['La familia es lo primero.', 'Bien dicho.'],
  ['Una promesa es una promesa.', 'Exacto.'],
  ['Hay favores que nunca se olvidan.', 'Así es.'],
]

const FIEBRE = [
  ['Esta noche vamos a bailar.', 'Sale.'],
  ['Hoy la pista es nuestra.', 'Vamos.'],
  ['Pon música y vámonos.', 'Dale.'],
  ['El sábado recién empieza.', '🔥'],
  ['Esta noche quiero olvidarme de todo.', 'Te entiendo.'],
]

const DRIVE = [
  ['Dime dónde.', 'Te mando la ubicación.'],
  ['¿Cuándo?', 'Cinco minutos.'],
  ['Yo conduzco.', 'Sube.'],
  ['No hagas preguntas.', 'Ok.'],
  ['Espera aquí.', 'Va.'],
  ['Ya vuelvo.', 'Dale.'],
  ['Después desaparezco.', 'Modo Drive.'],
]

const BATMAN_ETC = [
  ['¿Por qué tan serio?', 'Porque tengo sueño, Batman. 💀'],
  ['Soy Batman.', 'Tranquilo, soy Batman. 🗿'],
  ['¿Me estás hablando a mí?', 'Sí, a ti.'],
  ['No hay cuchara.', 'Matrix mode.'],
  ['Sigue al conejo blanco.', 'Ok Neo.'],
  ['Hasta la vista, bebé.', 'Terminator.'],
  ['Ven conmigo si quieres vivir.', 'Voy.'],
  ['¡Yo, Adrián!', 'Rocky 🔥'],
  ['Véndeme este bolígrafo.', 'Lobo de Wall Street xd'],
  ['Es un Royale con queso.', 'Pulp Fiction.'],
]

const RAPIDOS = [
  ['La familia.', 'Siempre 🚗'],
  ['Ganar es ganar.', 'Tal cual.'],
  ['¿Vamos a correr o solo vas a hablar?', 'Corremos.'],
  ['Pisa el acelerador.', 'Dale.'],
  ['Esta noche se corre.', 'Vamos.'],
  ['La familia primero, la carrera después.', 'Bien ahí.'],
  ['Hoy no vengo a perder.', 'Esa.'],
]

const TRANSFORMERS = [
  ['Autobots, ¡transformarse y avanzar!', 'Optimus mode.'],
  ['Yo soy Optimus Prime.', 'Más de lo que parece.'],
  ['Es hora de transformarse.', 'Activa modo batalla.'],
  ['Tenemos compañía.', 'Todos a sus posiciones.'],
]

const MARVEL_DC = [
  ['Yo soy Iron Man.', '🔥'],
  ['Vengadores, reuníos.', 'En camino.'],
  ['Wakanda por siempre.', '🔥'],
  ['Con gran poder viene una gran responsabilidad.', 'Ya Spidey.'],
  ['Que comience el juego.', 'Joker vibes.'],
]

const HP = [
  ['¡Expelliarmus!', 'Ya, Harry Potter, cállate 😂'],
  ['Siempre.', 'Después de todo este tiempo.'],
  ['Tengo asuntos mágicos que atender. 🧙‍♂️', 'Jajaja ok'],
]

const PIRATAS = [
  ['¡Arrr!', 'Jack Sparrow.'],
  ['Yo tengo un plan.', 'Probablemente sea un mal plan.'],
  ['Prepárate para zarpar.', 'El ron está listo.'],
]

const MUSICA = [
  ['Temazo 🔥', 'Ufff, qué canción.'],
  ['Esta canción me trae recuerdos.', 'Qué nostalgia.'],
  ['La tengo pegada desde ayer.', 'A mí también.'],
  ['Sube el volumen.', 'Dale.'],
  ['Clásico.', 'Nunca falla.'],
  ['La tengo en repeat.', 'Obra maestra.'],
  ['Me desbloqueaste un recuerdo.', '😭'],
  ['No era mi estilo, pero está buena.', 'Tal cual.'],
]

const CELEBS = [
  ['Rey del Pop.', 'Michael Jackson, clásico.'],
  ['Ese baile es imposible.', 'Billie Jean era otra cosa.'],
  ['Qué voz.', 'Freddie Mercury 🔥'],
  ['Ese tipo rapea rapidísimo.', 'Eminem.'],
  ['Ese tema está pegado.', 'Bad Bunny vibes.'],
  ['¿Messi o Cristiano? 👀', 'Ahhh, ya empezó la discusión 💀'],
  ['Ese gol fue una locura.', 'Qué jugada.'],
]

const INCOMPLETAS = [
  ['¿Cómo se llamaba esa peli de los robots?', '¿Transformers?'],
  ['La de Vin Diesel con los carros xd', 'Rápidos y Furiosos.'],
  ['La canción esa de Michael Jackson que dice... ya se me olvidó 😭', 'Billie Jean? Thriller?'],
  ['El actor de Batman, el otro, no sé cómo se llama.', '¿Cuál Batman?'],
  ['Era una película donde el pata viajaba en el tiempo o algo así.', '¿Volver al futuro?'],
  ['Bro, ¿cómo se llamaba ese juego? el de los monitos que se matan 😭', '¿Fall Guys? ¿Among Us?'],
  ['No sé quién es pero sale en todas las películas JAJA.', 'Clásico.'],
]

const CONV = [
  multi('b09-drive-1', 'cine', 'drive', [
    { rol: 'A', texto: '¿Cuánto tiempo?' },
    { rol: 'B', texto: 'Cinco minutos.' },
    { rol: 'A', texto: '¿Y después?' },
    { rol: 'B', texto: 'Me voy.' },
  ]),
  multi('b09-scar-1', 'cine', 'scarface', [
    { rol: 'A', texto: 'El mundo es tuyo.' },
    { rol: 'B', texto: 'Ya empezó con sus frases de Caracortada 😂' },
    { rol: 'A', texto: 'Déjame vivir mi momento.' },
    { rol: 'B', texto: 'JAJAJA ya pues, Tony.' },
  ]),
  multi('b09-batman-1', 'cine', 'batman', [
    { rol: 'A', texto: '¿Dónde estás?' },
    { rol: 'B', texto: 'En camino.' },
    { rol: 'A', texto: '¿En serio?' },
    { rol: 'B', texto: 'Tranquilo, soy Batman. 🗿' },
  ]),
  multi('b09-hp-1', 'cine', 'harry', [
    { rol: 'A', texto: '¿Vienes?' },
    { rol: 'B', texto: 'No puedo.' },
    { rol: 'A', texto: '¿Por qué?' },
    { rol: 'B', texto: 'Tengo asuntos mágicos que atender. 🧙‍♂️' },
    { rol: 'A', texto: 'Ya, Harry Potter, cállate 😂' },
  ]),
  multi('b09-music-1', 'musica', 'chat', [
    { rol: 'A', texto: '¿Viste la nueva canción?' },
    { rol: 'B', texto: 'Sí.' },
    { rol: 'A', texto: '¿Qué tal?' },
    { rol: 'B', texto: 'Está pegajosa xd.' },
    { rol: 'A', texto: 'La tengo en la cabeza desde ayer 😭' },
  ]),
  multi('b09-music-2', 'musica', 'chat', [
    { rol: 'A', texto: '¿Qué estás escuchando?' },
    { rol: 'B', texto: 'Una canción vieja de Michael Jackson.' },
    { rol: 'A', texto: 'Ufff, clásico.' },
    { rol: 'B', texto: 'Sí, nunca falla.' },
  ]),
  multi('b09-futbol-1', 'deportes', 'chat', [
    { rol: 'A', texto: '¿Quién es mejor?' },
    { rol: 'B', texto: '¿En qué?' },
    { rol: 'A', texto: 'En fútbol.' },
    { rol: 'B', texto: 'Ahhh, ya empezó la discusión 💀' },
  ]),
  multi('b09-peli-1', 'cine', 'chat', [
    { rol: 'A', texto: '¿Quién actúa en esa película?' },
    { rol: 'B', texto: 'Creo que Leonardo DiCaprio.' },
    { rol: 'A', texto: 'Ahhh, entonces hay que verla.' },
  ]),
]

export const BLOQUE_09_CULTURA = [
  ...pack(SCARFACE, 'b09-scar', 'cine', 'scarface'),
  ...pack(PADRINO, 'b09-pad', 'cine', 'padrino'),
  ...pack(FIEBRE, 'b09-fie', 'cine', 'fiebre'),
  ...pack(DRIVE, 'b09-drv', 'cine', 'drive'),
  ...pack(BATMAN_ETC, 'b09-icon', 'cine', 'iconica'),
  ...pack(RAPIDOS, 'b09-ff', 'cine', 'rapidos'),
  ...pack(TRANSFORMERS, 'b09-tf', 'cine', 'transformers'),
  ...pack(MARVEL_DC, 'b09-mv', 'cine', 'marvel'),
  ...pack(HP, 'b09-hp', 'cine', 'harry'),
  ...pack(PIRATAS, 'b09-pir', 'cine', 'piratas'),
  ...pack(MUSICA, 'b09-mus', 'musica', 'chat'),
  ...pack(CELEBS, 'b09-cel', 'celebridades', 'chat'),
  ...pack(INCOMPLETAS, 'b09-inc', 'pop', 'incompleta'),
  ...CONV,
]

export function formatearCulturaExpandidaParaPrompt() {
  return `
CINE / MÚSICA / CELEBS (bloque 09):
- Citas cortas (Caracortada, Padrino, Drive, Batman, Matrix…): reacciona con humor cotidiano, no monólogo.
- Mezcla referencia + vida real (“solo te pedí el cargador 😭”).
- Referencias incompletas (“la de Vin Diesel con los carros”, “el actor de Batman, el otro”): adivina suave o pregunta 1 dato.
- Música: reacciones cortas (temazo, clásico, nostalgia). Celebridades/deportes: charla, no trivia forzada.
`.trim()
}
