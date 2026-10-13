import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Smile, Image as ImageIcon, X, RefreshCw, User } from 'lucide-react'
import {
  MESSENGER_COLORES,
  messengerAvatarValue,
  avatarImgProps,
  isMessengerAvatar,
  parseAvatarHue,
} from '../asistente/messengerAvatar'

const MII_CREATOR_URL = 'https://mii.nxw.pw/app'

const TAMANOS = {
  sm: { wrap: 'w-10 h-10', camera: 16, fallback: 20, hoverLabel: false },
  md: { wrap: 'w-20 h-20', camera: 20, fallback: 28, hoverLabel: true },
  lg: { wrap: 'w-24 h-24', camera: 28, fallback: 40, hoverLabel: true },
  xl: { wrap: 'w-40 h-40', camera: 32, fallback: 56, hoverLabel: true },
}

export default function AvatarPerfilPicker({
  avatarUrl = '',
  avataresUsados = [],
  onCambiarFoto,
  onElegirAvatar,
  onToast,
  size = 'md',
  fallback = null,
  menuAlign = 'left',
  menuPlacement = 'bottom',
}) {
  const [menuFoto, setMenuFoto] = useState(false)
  const [modalFotos, setModalFotos] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [eligiendoAvatar, setEligiendoAvatar] = useState('')
  const fotoRef = useRef(null)
  const menuFotoRef = useRef(null)
  const tam = TAMANOS[size] || TAMANOS.md

  const avatarActual = useMemo(() => avatarImgProps(avatarUrl, { fallbackMessenger: true }), [avatarUrl])
  const hueActual = isMessengerAvatar(avatarUrl) ? parseAvatarHue(avatarUrl) : avatarActual.hue

  const fotosGuardadas = useMemo(() => {
    const list = [...(avataresUsados || []), avatarUrl]
      .map((u) => String(u || '').trim())
      .filter((u) => /^https?:\/\//i.test(u) || isMessengerAvatar(u))
    return [...new Set(list)]
  }, [avataresUsados, avatarUrl])

  useEffect(() => {
    if (!menuFoto) return
    const cerrar = (e) => {
      if (!menuFotoRef.current?.contains(e.target)) setMenuFoto(false)
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [menuFoto])

  useEffect(() => {
    if (!modalFotos) return
    const onKey = (e) => {
      if (e.key === 'Escape') setModalFotos(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalFotos])

  const elegirFoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !onCambiarFoto) return
    setSubiendoFoto(true)
    try {
      await onCambiarFoto(file)
    } catch (err) {
      onToast?.(err?.message || 'Error al subir la foto.')
    } finally {
      setSubiendoFoto(false)
    }
  }

  const abrirMiiCreator = () => {
    setMenuFoto(false)
    window.open(MII_CREATOR_URL, '_blank', 'noopener,noreferrer')
    onToast?.(
      'En Mii Creator: tu Mii → Render → formas predeterminadas → Solo cabeza. Luego vuelve y pulsa Subir foto.'
    )
  }

  const seleccionarAvatar = async (url) => {
    if (!url || !onElegirAvatar) {
      setModalFotos(false)
      return
    }
    if (url === avatarUrl || (isMessengerAvatar(url) && isMessengerAvatar(avatarUrl) && parseAvatarHue(url) === parseAvatarHue(avatarUrl))) {
      setModalFotos(false)
      return
    }
    setEligiendoAvatar(url)
    try {
      await onElegirAvatar(url)
      setModalFotos(false)
    } catch (err) {
      onToast?.(err?.message || 'No se pudo cambiar la foto.')
    } finally {
      setEligiendoAvatar('')
    }
  }

  return (
    <>
      <div className="relative shrink-0" ref={menuFotoRef}>
        <button
          type="button"
          onClick={() => setMenuFoto((v) => !v)}
          disabled={subiendoFoto}
          title="Cambiar foto de perfil"
          aria-label="Cambiar foto de perfil"
          aria-haspopup="menu"
          aria-expanded={menuFoto}
          className={`relative ${tam.wrap} flex items-center justify-center cursor-pointer group border-0 p-0 ${
            avatarActual.isMessenger
              ? 'bg-transparent overflow-visible'
              : 'rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200'
          }`}
        >
          {avatarActual.src ? (
            <img
              src={avatarActual.src}
              alt=""
              className={
                avatarActual.isMessenger ? 'messenger-avatar-img' : 'w-full h-full object-cover'
              }
              style={avatarActual.style}
            />
          ) : (
            fallback || <User size={tam.fallback} className="text-gray-400" />
          )}
          <span className="absolute inset-0 bg-black/45 text-white flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {subiendoFoto ? (
              <RefreshCw size={tam.camera} className="animate-spin" />
            ) : (
              <>
                <Camera size={tam.camera} />
                {tam.hoverLabel && <span className="text-[10px] font-semibold">Cambiar</span>}
              </>
            )}
          </span>
        </button>
        {menuFoto && (
          <div
            role="menu"
            className={`absolute ${
              menuAlign === 'right'
                ? 'right-0'
                : menuAlign === 'center'
                  ? 'left-1/2 -translate-x-1/2'
                  : 'left-0'
            } ${menuPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} z-[80] w-64 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-lg py-1 overflow-hidden`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuFoto(false)
                fotoRef.current?.click()
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Camera size={16} className="shrink-0 text-gray-500" />
              Subir foto
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={abrirMiiCreator}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Smile size={16} className="shrink-0 text-gray-500" />
              Crear avatar Mii
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuFoto(false)
                setModalFotos(true)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ImageIcon size={16} className="shrink-0 text-gray-500" />
              Elegir imagen de perfil
            </button>
          </div>
        )}
      </div>
      <input
        ref={fotoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={elegirFoto}
      />
      {modalFotos && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setModalFotos(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-fotos-titulo"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h4 id="modal-fotos-titulo" className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Elegir imagen de perfil
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Messenger por defecto (elige color) o una foto que ya usaste.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalFotos(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">Avatar Messenger</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {MESSENGER_COLORES.map((c) => {
                  const valor = messengerAvatarValue(c.hue)
                  const activa = isMessengerAvatar(avatarUrl) && hueActual === c.hue
                  const cargando = eligiendoAvatar === valor
                  const props = avatarImgProps(valor)
                  return (
                    <button
                      key={c.hue}
                      type="button"
                      onClick={() => seleccionarAvatar(valor)}
                      disabled={!!eligiendoAvatar}
                      title={c.label}
                      className={`relative aspect-square rounded-lg overflow-visible border-2 p-0 flex items-center justify-center bg-transparent ${
                        activa
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={props.src}
                        alt={c.label}
                        className="messenger-avatar-img"
                        style={props.style}
                      />
                      {cargando && (
                        <span className="absolute inset-0 bg-black/45 flex items-center justify-center rounded-lg">
                          <RefreshCw size={14} className="text-white animate-spin" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">Fotos guardadas</p>
            {!fotosGuardadas.filter((u) => !isMessengerAvatar(u)).length ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                Aún no hay fotos subidas. Sube una o crea un avatar Mii.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                {fotosGuardadas
                  .filter((u) => !isMessengerAvatar(u))
                  .map((url) => {
                    const activa = url === avatarUrl
                    const cargando = eligiendoAvatar === url
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => seleccionarAvatar(url)}
                        disabled={!!eligiendoAvatar}
                        title={activa ? 'Foto actual' : 'Usar esta foto'}
                        className={`relative aspect-square rounded-full overflow-hidden border-2 ${
                          activa
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {cargando && (
                          <span className="absolute inset-0 bg-black/45 flex items-center justify-center rounded-full">
                            <RefreshCw size={18} className="text-white animate-spin" />
                          </span>
                        )}
                        {activa && !cargando && (
                          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-black/55 rounded-full px-2 py-0.5">
                            Actual
                          </span>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
