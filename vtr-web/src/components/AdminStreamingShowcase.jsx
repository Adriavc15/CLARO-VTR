import React, { useEffect, useState } from 'react'
import { Image, Loader2, Upload } from 'lucide-react'
import { subirImagenImgbb } from '../App.jsx'
import {
  SHOWCASE_SEED,
  suscribirShowcaseStreaming,
  guardarShowcaseStreaming,
} from '../asistente/streamingShowcaseLive'

export default function AdminStreamingShowcase({ db, onToast }) {
  const [lista, setLista] = useState(SHOWCASE_SEED)
  const [busy, setBusy] = useState('')

  const toast = (m) => onToast?.(m)

  useEffect(() => {
    const unsub = suscribirShowcaseStreaming(db, setLista)
    return () => unsub && unsub()
  }, [db])

  const subirCampo = async (plat, campo, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Selecciona una imagen (JPG, PNG, WEBP…)')
      return
    }
    const key = `${plat.id}-${campo}`
    setBusy(key)
    try {
      const url = await subirImagenImgbb(file)
      await guardarShowcaseStreaming(db, { ...plat, [campo]: url })
      toast(`${plat.name}: ${campo === 'img' ? 'foto del modal' : 'logo'} actualizado`)
    } catch (e) {
      toast(e?.message || 'No se pudo subir la imagen')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 lg:p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Image size={20} className="text-teal-600" />
        Imágenes de Streaming
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4 max-w-2xl">
        Netflix, Disney+, Crunchyroll, TNT Sports y Pack Adulto de la sección Streaming. La foto grande es la que se abre en el
        modal al tocar la tarjeta; el logo es el que se ve al centro.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lista.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/40"
          >
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">{p.name}</p>
            <div className="flex gap-3 items-stretch">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Foto del modal</p>
                <div className="relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 aspect-video">
                  <img src={p.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <label className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 cursor-pointer">
                  {busy === `${p.id}-img` ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Cambiar foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!!busy}
                    onChange={(e) => {
                      subirCampo(p, 'img', e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
              <div className="w-28 shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Logo</p>
                <div className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 aspect-square flex items-center justify-center p-2">
                  <img src={p.logo} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <label className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 cursor-pointer">
                  {busy === `${p.id}-logo` ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Cambiar logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!!busy}
                    onChange={(e) => {
                      subirCampo(p, 'logo', e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
