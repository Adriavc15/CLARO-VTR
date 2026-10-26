import React from 'react'

/**
 * Botón de acceso con Microsoft para el panel de administración.
 *
 * Sigue el mismo patrón que BotonGoogle.jsx, pero con el logo de Microsoft.
 */
export default function BotonMicrosoft({
  onClick,
  entrando = false,
  etiqueta = 'Continuar con Microsoft',
  etiquetaCargando = 'Conectando…',
  etiquetaAlternativa = '',
  disabled = false,
  className = '',
}) {
  const texto = entrando ? etiquetaCargando : etiquetaAlternativa || etiqueta

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || entrando}
      className={`boton-microsoft w-full inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <svg width="17" height="17" viewBox="0 0 23 23" aria-hidden="true">
        <rect x="1" y="1" width="10" height="10" fill="#f25022" />
        <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
        <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
        <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
      </svg>
      {texto}
    </button>
  )
}
