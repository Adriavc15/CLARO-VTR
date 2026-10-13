import { useEffect } from 'react'

/**
 * Bloquea el scroll del body mientras `isLocked` sea `true`.
 * Mantiene un contador global para anidar varios modales sin conflicto.
 * Guarda el scrollbar-width para evitar el "layout shift" al ocultar la barra.
 */
let lockCount = 0

export default function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    lockCount++
    if (lockCount === 1) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      lockCount--
      if (lockCount === 0) {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }
    }
  }, [isLocked])
}
