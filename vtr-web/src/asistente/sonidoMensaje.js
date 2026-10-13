/**
 * Sonido de recepción de mensajes (mensajería Apex).
 *
 * Se sintetiza con la Web Audio API para no depender de un archivo externo:
 * dos notas cortas y suaves, tipo notificación de mensajería.
 *
 * Los navegadores exigen un gesto del usuario antes de dejar sonar el audio,
 * por eso `desbloquearAudio()` se llama desde el primer clic/tecla de la página.
 */

const CLAVE = 'apex-sonido-mensajes'

let ctx = null
let desbloqueado = false

function leerPreferencia() {
  try {
    return localStorage.getItem(CLAVE) !== 'off'
  } catch {
    return true
  }
}

let habilitado = leerPreferencia()

export function sonidoMensajesHabilitado() {
  return habilitado
}

export function setSonidoMensajes(on) {
  habilitado = !!on
  try {
    localStorage.setItem(CLAVE, on ? 'on' : 'off')
  } catch {
    /* sin persistencia: queda solo en memoria */
  }
  if (on) desbloquearAudio()
}

export function toggleSonidoMensajes() {
  setSonidoMensajes(!habilitado)
  return habilitado
}

function contexto() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    try {
      ctx = new AC()
    } catch {
      return null
    }
  }
  return ctx
}

/** Se llama desde el primer gesto del usuario para habilitar el audio. */
export function desbloquearAudio() {
  const ac = contexto()
  if (!ac) return
  if (ac.state === 'suspended') ac.resume().catch(() => {})
  desbloqueado = ac.state === 'running'
}

function nota(ac, freq, inicio, dur, vol) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, ac.currentTime + inicio)
  gain.gain.setValueAtTime(0.0001, ac.currentTime + inicio)
  gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + inicio + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + inicio + dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(ac.currentTime + inicio)
  osc.stop(ac.currentTime + inicio + dur + 0.02)
}

/** Reproduce el aviso de mensaje recibido. No hace nada si está apagado. */
export function reproducirSonidoMensaje() {
  if (!habilitado) return
  const ac = contexto()
  if (!ac) return
  if (ac.state === 'suspended') {
    // Sin gesto previo el navegador no deja sonar: se reintenta al primer clic
    desbloquearAudio()
    if (ac.state !== 'running') return
  }
  desbloqueado = true
  try {
    nota(ac, 784, 0, 0.12, 0.14) // Do5
    nota(ac, 1046.5, 0.09, 0.16, 0.12) // Do6
  } catch {
    /* audio no disponible */
  }
}
