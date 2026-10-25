import React, { useEffect, useMemo, useState } from 'react'
import {
  Coins,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Send,
  Loader2,
  RotateCcw,
  Home,
  Info,
  User,
  UserX,
  Smartphone,
} from 'lucide-react'
import { db } from './App.tsx'
import { guardarMigracion, ESTADOS_MIGRACION, ESTADO_OTROS } from './migracionesStore'
import { guardarNoAceptaFibra, MOTIVOS_NO_ACEPTA, MOTIVO_NO_ACEPTA_OTROS } from './noAceptaFibraStore'
import {
  guardarNoVentaIslasMovil,
  ESTADOS_NO_VENTA,
  ESTADOS_NO_VENTA_PRINCIPALES,
  ESTADOS_NO_VENTA_SECUNDARIOS,
  ESTADO_NO_VENTA_OTROS,
} from './noVentaIslasMovilStore'
import { ASESORES_SEED, suscribirAsesores } from './asesoresStore'
import { SUPERVISORES_SEED, suscribirSupervisores } from './supervisoresStore'
import MigracionesTabs from './components/MigracionesTabs'

/** Opción de los selectores de asesores: nombre simple u objeto { nombre, legajo }. */
function nombreAsesor(o: any) {
  const raw = typeof o === 'string' ? o : String(o?.nombre || '')
  return raw.trim().replace(/\s+/g, ' ').toUpperCase()
}

/** Texto visible de la opción: el nombre (legajo no se muestra en selector). */
function etiquetaAsesor(o: any) {
  return nombreAsesor(o)
}

/** Normaliza las opciones para que siempre conserven nombre y legajo. */
function normalizarAsesores(lista: any) {
  return (lista || [])
    .map((a: any) => ({ nombre: nombreAsesor(a), legajo: typeof a === 'object' ? String(a?.legajo || '').trim() : '' }))
    .filter((a: any) => a.nombre)
}

const FORM_NAV = [
  { id: 'comisiones', label: 'Migraciones', icon: Coins },
  { id: 'noacepta', label: 'No acepta fibra', icon: UserX },
  { id: 'noventa', label: 'Ventas Isla', icon: Smartphone },
  { id: 'historial', label: 'Mis registros', icon: ClipboardList },
]

/** Campos del formulario «Clientes que no aceptan cambio a fibra». */
const CAMPOS_NO_ACEPTA_FORM = [
  { key: 'fecha', label: 'Fecha', tipo: 'date', colSpan: 1 },
  { key: 'asesor', label: 'Asesor', tipo: 'select', opciones: ASESORES_SEED, placeholder: 'Selecciona un asesor' },
  { key: 'supervisor', label: 'Supervisor', tipo: 'select', opciones: SUPERVISORES_SEED, placeholder: 'Selecciona un supervisor' },
  { key: 'rutCliente', label: 'RUT cliente', tipo: 'text', placeholder: 'Ej. 12.345.678-9' },
  {
    key: 'motivoNoAcepta',
    label: 'Motivo no acepta',
    tipo: 'select',
    opciones: MOTIVOS_NO_ACEPTA,
    placeholder: 'Selecciona el motivo',
    colSpan: 2,
  },
]

const vacioNoAcepta = () => ({
  ...Object.fromEntries(CAMPOS_NO_ACEPTA_FORM.map((c) => [c.key, ''])),
  detalleError: '',
  legajoAsesor: '',
})

/** Campos del formulario «Ventas Isla / Transferencias al S2 14111». */
const CAMPOS_NO_VENTA_FORM = [
  { key: 'fecha', label: 'Fecha de ingreso', tipo: 'date', colSpan: 1 },
  { key: 'rutCliente', label: 'RUT cliente', tipo: 'text', placeholder: 'Ej. 12.345.678-9' },
  { key: 'asesor', label: 'Asesor', tipo: 'select', opciones: ASESORES_SEED, placeholder: 'Selecciona un asesor' },
  { key: 'supervisor', label: 'Supervisor', tipo: 'select', opciones: SUPERVISORES_SEED, placeholder: 'Selecciona un supervisor' },
  {
    key: 'estado',
    label: 'Estado',
    tipo: 'select',
    opciones: ESTADOS_NO_VENTA_PRINCIPALES,
    placeholder: 'Selecciona el estado',
    colSpan: 2,
  },
]

const vacioNoVenta = () => ({
  ...Object.fromEntries(CAMPOS_NO_VENTA_FORM.map((c) => [c.key, ''])),
  subestado: '',
  detalleError: '',
  legajoAsesor: '',
})

const CAMPOS_FORM = [
  { key: 'fechaIngreso', label: 'Fecha ingreso de migración', tipo: 'date', colSpan: 1 },
  { key: 'asesor', label: 'Nombre y apellido del asesor', tipo: 'select', opciones: ASESORES_SEED, placeholder: 'Selecciona un asesor' },
  { key: 'supervisor', label: 'Supervisor', tipo: 'select', opciones: SUPERVISORES_SEED, placeholder: 'Selecciona un supervisor' },
  { key: 'rutCliente', label: 'RUT del cliente', tipo: 'text', placeholder: 'Ej. 12.345.678-9' },
  { key: 'nPedido', label: 'N° de pedido', tipo: 'text', placeholder: 'Número de pedido' },
  {
    key: 'estado',
    label: 'Estado',
    tipo: 'select',
    placeholder: 'Selecciona el estado',
    opciones: ESTADOS_MIGRACION,
  },
]

const vacio = () => ({
  ...Object.fromEntries(CAMPOS_FORM.map((c) => [c.key, ''])),
  detalleError: '',
  estado: '',
  legajoAsesor: '',
})

function FormComisiones({ onToast, onGuardado }: any) {
  const [form, setForm] = useState(vacio())
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(null)
  const [asesores, setAsesores] = useState(() => normalizarAsesores(ASESORES_SEED))
  const [supervisores, setSupervisores] = useState(() => (SUPERVISORES_SEED || []).map((s: any) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase()).filter(Boolean))

  useEffect(() => {
    const unsub = suscribirAsesores(db, (lista) => {
      const items = normalizarAsesores(lista)
      setAsesores(items.length ? items : normalizarAsesores(ASESORES_SEED))
    })
    return () => unsub && unsub()
  }, [])

  useEffect(() => {
    const unsub = suscribirSupervisores(db, (lista) => {
      const nombres = (lista || [])
        .map((a) => (typeof a === 'string' ? a : a?.nombre))
        .filter(Boolean)
        .map((s) => String(s).trim().replace(/\s+/g, ' ').toUpperCase())
      setSupervisores(nombres.length ? nombres : (SUPERVISORES_SEED || []).map((s: any) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase()).filter(Boolean))
    })
    return () => unsub && unsub()
  }, [])

  const campos = useMemo(
    () =>
      CAMPOS_FORM.map((c) => {
        if (c.key === 'asesor') return { ...c, opciones: asesores }
        if (c.key === 'supervisor') return { ...c, opciones: supervisores }
        return c
      }),
    [asesores, supervisores]
  )

  const emailLector =
    (typeof window !== 'undefined' && window.localStorage.getItem('vtr-lector-email')) || ''

  const set = (k) => (e) => {
    const val = e.target.value
    setForm((f) => ({
      ...f,
      [k]: val,
      ...(k === 'estado' && val !== ESTADO_OTROS ? { detalleError: '' } : {}),
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      // Separa el legajo del nombre del asesor si está disponible
      const asesorSel = asesores.find((x) => nombreAsesor(x) === form.asesor)
      const legajo = asesorSel?.legajo || ''
      const camposEnviar = {
        ...form,
        asesor: nombreAsesor(form.asesor), // siempre en MAYÚSCULAS
        supervisor: String(form.supervisor || '').trim().replace(/\s+/g, ' ').toUpperCase(),
        ...(legajo ? { legajoAsesor: legajo } : {}),
      }
      console.log('Enviando migración:', camposEnviar)
      const res = await guardarMigracion({
        db,
        campos: camposEnviar,
        email: emailLector,
      })
      console.log('Respuesta guardarMigracion:', res)
      setEnviando(false)
      if (res.cloud) {
        onToast?.('Migración registrada correctamente ✅')
      } else {
        onToast?.('Se guardó en este equipo (sin conexión a la nube): ' + (res.cloudError || ''))
      }
      setExito({ ...camposEnviar, comision: 5.5 })
      setForm(vacio())
      onGuardado?.()
    } catch (err) {
      console.error('Error al guardar migración:', err)
      setEnviando(false)
      onToast?.('Error al guardar: ' + (err?.message || 'Error desconocido'))
    }
  }

  const inputBase =
    'w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition'

  const tips = [
    'Registra correctamente el RUT y los datos del cliente.',
    'Verifica la fecha de ingreso y el RUT del cliente.',
    'Confirma que el N° de pedido corresponda a la gestión realizada.',
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-0 rounded-2xl shadow-lg overflow-hidden items-stretch w-full flex-1 min-h-full">
      {/* Panel izquierdo: mensaje */}
      <aside className="relative overflow-hidden bg-[rgb(252,246,237)] p-6 sm:p-8 lg:p-10 flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 text-[#047857]">
            <Coins size={28} />
            MIGRACIONES
          </h2>
          <p className="text-sm sm:text-base text-[#3f3f46] leading-relaxed mt-4">
            ¡Equipo! 💪 Tengan en cuenta la importancia de registrar correctamente cada espacio durante el proceso.
            Un registro preciso evita observaciones y asegura que cada gestión sea válida.
          </p>
          <ul className="mt-6 space-y-3">
            {tips.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-[#3f3f46]">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#059669]" />
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 -mb-6 sm:-mb-8 lg:-mb-10 flex justify-center">
          <img
            src="/fibra%20feliz.png"
            alt="Fibra feliz"
            className="fibra-anim max-h-[28rem] w-auto max-w-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </aside>

      {/* Panel derecho: formulario / confirmación */}
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 flex flex-col justify-center flex-1 h-full">
        {exito ? (
          <div className="text-center m-auto">
            <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">¡Migración registrada!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              RUT <strong>{exito.rutCliente}</strong> · Pedido <strong>{exito.nPedido}</strong> · Asesor{' '}
              <strong>{exito.asesor}</strong>
            </p>
            {exito.estado && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Estado: <strong>{exito.estado}</strong>
                {exito.detalleError && (
                  <span className="block text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                    Tipificación: {exito.detalleError}
                  </span>
                )}
              </p>
            )}
            <button
              type="button"
              onClick={() => setExito(null)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <RotateCcw size={16} />
              Registrar otra migración
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="pb-4 mb-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                  Formulario de registro
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1.5 font-medium">
                  <User size={13} />
                  {emailLector || 'usuario.apex@apexamerica.com'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              {campos.map((c) => (
                <label key={c.key} className={c.colSpan === 2 ? 'md:col-span-2 block' : 'block'}>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {c.label} <span className="text-red-500">*</span>
                  </span>
                  {c.tipo === 'select' ? (
                    <select
                      value={form[c.key]}
                      onChange={set(c.key)}
                      required
                      className={`${inputBase} mt-1.5 ${form[c.key] ? '' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                      <option value="" disabled>
                        {c.placeholder || 'Selecciona una opción'}
                      </option>
                      {c.opciones.map((o) => {
                        const valor = nombreAsesor(o)
                        const nombre = nombreAsesor(o)
                        return (
                          <option key={valor} value={valor} className="text-gray-800 dark:text-gray-100">
                            {nombre}
                          </option>
                        )
                      })}
                    </select>
                  ) : (
                    <input
                      type={c.tipo === 'date' ? 'date' : c.tipo === 'tel' ? 'tel' : 'text'}
                      value={form[c.key]}
                      onChange={set(c.key)}
                      required
                      placeholder={c.placeholder}
                      className={`${inputBase} mt-1.5`}
                    />
                  )}
                </label>
              ))}

              {form.estado === ESTADO_OTROS && (
                <label className="col-span-1 md:col-span-2 block animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                    <span>
                      Detalle del error / Tipificación <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-purple-600 dark:text-purple-400">
                      Especifica el error presentado
                    </span>
                  </span>
                  <textarea
                    rows={2}
                    value={form.detalleError || ''}
                    onChange={set('detalleError')}
                    required
                    placeholder="Describe detalladamente el error para su tipificación..."
                    className={`${inputBase} mt-1.5 resize-none`}
                  />
                </label>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Info size={13} className="shrink-0" />
                Todos los campos son obligatorios.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm(vacio())}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw size={16} />
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {enviando ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function FormNoAceptaFibra({ onToast, onGuardado }) {
  const [form, setForm] = useState(vacioNoAcepta())
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(null)
  const [asesores, setAsesores] = useState(() => normalizarAsesores(ASESORES_SEED))
  const [supervisores, setSupervisores] = useState(() => (SUPERVISORES_SEED || []).map((s: any) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase()).filter(Boolean))

  useEffect(() => {
    const unsub = suscribirAsesores(db, (lista) => {
      const items = normalizarAsesores(lista)
      setAsesores(items.length ? items : normalizarAsesores(ASESORES_SEED))
    })
    return () => unsub && unsub()
  }, [])

  useEffect(() => {
    const unsub = suscribirSupervisores(db, (lista) => {
      const nombres = (lista || [])
        .map((a) => (typeof a === 'string' ? a : a?.nombre))
        .filter(Boolean)
        .map((s) => String(s).trim().replace(/\s+/g, ' ').toUpperCase())
      setSupervisores(nombres.length ? nombres : (SUPERVISORES_SEED || []).map((s: any) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase()).filter(Boolean))
    })
    return () => unsub && unsub()
  }, [])

  const campos = useMemo(
    () =>
      CAMPOS_NO_ACEPTA_FORM.map((c) => {
        if (c.key === 'asesor') return { ...c, opciones: asesores }
        if (c.key === 'supervisor') return { ...c, opciones: supervisores }
        return c
      }),
    [asesores, supervisores]
  )

  const emailLector =
    (typeof window !== 'undefined' && window.localStorage.getItem('vtr-lector-email')) || ''

  const set = (k) => (e) => {
    const val = e.target.value
    setForm((f) => ({
      ...f,
      [k]: val,
      ...(k === 'motivoNoAcepta' && val !== MOTIVO_NO_ACEPTA_OTROS ? { detalleError: '' } : {}),
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      // Separa el legajo del nombre del asesor si está disponible
      const asesorSel = asesores.find((x) => nombreAsesor(x) === form.asesor)
      const legajo = asesorSel?.legajo || ''
      const camposEnviar = {
        ...form,
        asesor: nombreAsesor(form.asesor), // siempre en MAYÚSCULAS
        supervisor: String(form.supervisor || '').trim().replace(/\s+/g, ' ').toUpperCase(),
        ...(legajo ? { legajoAsesor: legajo } : {}),
      }
      const res = await guardarNoAceptaFibra({ db, campos: camposEnviar, email: emailLector })
      if (res.cloud) {
        onToast?.('Registro guardado correctamente ✅')
      } else {
        onToast?.('Se guardó en este equipo (sin conexión a la nube): ' + (res.cloudError || ''))
      }
      setExito({ ...camposEnviar })
      setForm(vacioNoAcepta())
      onGuardado?.()
    } catch (err: any) {
      onToast?.('Error al guardar el registro: ' + (err?.message || String(err)))
    } finally {
      setEnviando(false)
    }
  }

  const inputBase =
    'w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#f69100]/50 focus:border-[#f69100] transition'

  const tips = [
    'Registra correctamente el RUT y el motivo por el cual el cliente no acepta el cambio a fibra.',
    'Selecciona al asesor que realizó la gestión.',
    'Verifica la fecha de la gestión antes de enviar.',
    'Tipifica como <strong>#RECHAZAMIGRA</strong> si el cliente rechaza la actualización a fibra.',
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-0 rounded-2xl shadow-lg overflow-hidden items-stretch w-full flex-1 min-h-full">
      {/* Panel izquierdo: mensaje */}
      <aside className="relative overflow-hidden bg-[rgb(252,246,237)] p-6 sm:p-8 lg:p-10 flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 text-[#b26a00]">
            <UserX size={28} />
            NO ACEPTA FIBRA
          </h2>
          <p className="text-sm sm:text-base text-[#3f3f46] leading-relaxed mt-4">
            ¡Equipo! Registremos a los clientes que <strong>no aceptan el cambio a fibra</strong>. Guarda el
            motivo real de la negativa: nos ayuda a entender objeciones y mejorar la oferta.
          </p>
          <ul className="mt-6 space-y-3">
            {tips.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-[#3f3f46]">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#f69100]" />
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 -mb-6 sm:-mb-8 lg:-mb-10 flex justify-center">
          <img
            src="/triste%20fibra.png"
            alt="Fibra triste"
            className="fibra-anim max-h-[28rem] w-auto max-w-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </aside>

      {/* Panel derecho: formulario / confirmación */}
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 flex flex-col justify-center flex-1 h-full">
        {exito ? (
          <div className="text-center m-auto">
            <CheckCircle2 size={64} className="mx-auto text-[#f69100] mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">¡Registro guardado!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              RUT <strong>{exito.rutCliente}</strong> · Asesor <strong>{exito.asesor}</strong>
            </p>
            {exito.motivoNoAcepta && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Motivo: <strong>{exito.motivoNoAcepta}</strong>
                {exito.detalleError && (
                  <span className="block text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
                    Detalle / Tipificación: {exito.detalleError}
                  </span>
                )}
              </p>
            )}
            <button
              type="button"
              onClick={() => setExito(null)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f69100] text-white text-sm font-semibold hover:bg-amber-600 transition-colors cursor-pointer"
            >
              <RotateCcw size={16} />
              Registrar otro cliente
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="pb-4 mb-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                  Clientes que no aceptan cambio a fibra
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1.5 font-medium">
                  <User size={13} />
                  {emailLector || 'usuario.apex@apexamerica.com'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              {campos.map((c) => (
                <label key={c.key} className={c.colSpan === 2 ? 'md:col-span-2 block' : 'block'}>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {c.label} <span className="text-red-500">*</span>
                  </span>
                  {c.tipo === 'select' ? (
                    <select
                      value={form[c.key]}
                      onChange={set(c.key)}
                      required
                      className={`${inputBase} mt-1.5 ${form[c.key] ? '' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                      <option value="" disabled>
                        {c.placeholder || 'Selecciona una opción'}
                      </option>
                      {c.opciones.map((o) => {
                        const valor = nombreAsesor(o)
                        const nombre = nombreAsesor(o)
                        return (
                          <option key={valor} value={valor} className="text-gray-800 dark:text-gray-100">
                            {nombre}
                          </option>
                        )
                      })}
                    </select>
                  ) : (
                    <input
                      type={c.tipo === 'date' ? 'date' : 'text'}
                      value={form[c.key]}
                      onChange={set(c.key)}
                      required
                      placeholder={c.placeholder}
                      className={`${inputBase} mt-1.5`}
                    />
                  )}
                </label>
              ))}

              {form.motivoNoAcepta === MOTIVO_NO_ACEPTA_OTROS && (
                <label className="col-span-1 md:col-span-2 block animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                    <span>
                      Detalle del error / Tipificación <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-[#b26a00] dark:text-amber-400">
                      Especifica el detalle
                    </span>
                  </span>
                  <textarea
                    rows={2}
                    value={form.detalleError || ''}
                    onChange={set('detalleError')}
                    required
                    placeholder="Describe detalladamente el motivo por el cual el cliente no acepta..."
                    className={`${inputBase} mt-1.5 resize-none`}
                  />
                </label>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Info size={13} className="shrink-0" />
                Todos los campos son obligatorios.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm(vacioNoAcepta())}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw size={16} />
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#f69100] hover:bg-amber-600 text-white text-sm font-bold shadow-lg shadow-amber-500/20 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {enviando ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function FormNoVentaIslasMovil({ onToast, onGuardado }) {
  const [form, setForm] = useState(vacioNoVenta())
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(null)
  const [asesores, setAsesores] = useState(() => normalizarAsesores(ASESORES_SEED))
  const [supervisores, setSupervisores] = useState(() => (SUPERVISORES_SEED || []).map((s: any) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase()).filter(Boolean))

  useEffect(() => {
    const unsub = suscribirAsesores(db, (lista) => {
      const items = normalizarAsesores(lista)
      setAsesores(items.length ? items : normalizarAsesores(ASESORES_SEED))
    })
    return () => unsub && unsub()
  }, [])

  useEffect(() => {
    const unsub = suscribirSupervisores(db, (lista) => {
      const nombres = (lista || [])
        .map((a) => (typeof a === 'string' ? a : a?.nombre))
        .filter(Boolean)
        .map((s) => String(s).trim().replace(/\s+/g, ' ').toUpperCase())
      setSupervisores(nombres.length ? nombres : (SUPERVISORES_SEED || []).map((s: any) => String(s || '').trim().replace(/\s+/g, ' ').toUpperCase()).filter(Boolean))
    })
    return () => unsub && unsub()
  }, [])
 
  const campos = useMemo(
    () =>
      CAMPOS_NO_VENTA_FORM.map((c) => {
        if (c.key === 'asesor') return { ...c, opciones: asesores }
        if (c.key === 'supervisor') return { ...c, opciones: supervisores }
        return c
      }),
    [asesores, supervisores]
  )

  const emailLector =
    (typeof window !== 'undefined' && window.localStorage.getItem('vtr-lector-email')) || ''

  const set = (k) => (e) => {
    const val = e.target.value
    setForm((f) => ({
      ...f,
      [k]: val,
      ...(k === 'estado' && val !== 'SE OFRECE Y NO DESEA' ? { subestado: '', detalleError: '' } : {}),
      ...(k === 'subestado' && val !== ESTADO_NO_VENTA_OTROS ? { detalleError: '' } : {}),
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      // Separa el legajo del nombre del asesor si está disponible
      const asesorSel = asesores.find((x) => nombreAsesor(x) === form.asesor)
      const legajo = asesorSel?.legajo || ''
      // Combina estado + subestado en un solo campo para guardar
      const estadoFinal = form.subestado || form.estado
      const camposEnviar = {
        ...form,
        estado: estadoFinal,
        asesor: nombreAsesor(form.asesor), // siempre en MAYÚSCULAS
        supervisor: String(form.supervisor || '').trim().replace(/\s+/g, ' ').toUpperCase(),
        ...(legajo ? { legajoAsesor: legajo } : {}),
      }
      const res = await guardarNoVentaIslasMovil({ db, campos: camposEnviar, email: emailLector })
      if (res.cloud) {
        onToast?.('Registro guardado correctamente ✅')
      } else {
        onToast?.('Se guardó en este equipo (sin conexión a la nube): ' + (res.cloudError || ''))
      }
      setExito({ ...camposEnviar })
      setForm(vacioNoVenta())
      onGuardado?.()
    } catch (err: any) {
      onToast?.('Error al guardar el registro: ' + (err?.message || String(err)))
    } finally {
      setEnviando(false)
    }
  }

  const inputBase =
    'w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/50 focus:border-[#0ea5e9] transition'

  const tips = [
    'Registra correctamente el RUT del cliente y la fecha de ingreso.',
    'Selecciona al asesor y supervisor que realizaron la gestión.',
    'Selecciona <strong>SE OFRECE Y NO DESEA</strong> para ver opciones adicionales (CONFORME CON SU OPERADOR, TIENE CONTRATO DE PERMANENCIA, TIENE MEJOR PROPUESTA DE SU OPERADOR, OTRO).',
    'Si eliges <strong>OTRO (MOTIVO)</strong>, detalla el motivo para su tipificación.',
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-0 rounded-2xl shadow-lg overflow-hidden items-stretch w-full flex-1 min-h-full">
      {/* Panel izquierdo: mensaje */}
      <aside className="relative overflow-hidden bg-[rgb(252,246,237)] p-6 sm:p-8 lg:p-10 flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold flex items-center gap-2 text-[#0369a1] leading-tight">
            <Smartphone size={24} className="shrink-0" />
            <span>VENTAS ISLA / TRANSFERENCIAS AL S2 14111</span>
          </h2>
          <p className="text-sm sm:text-base text-[#3f3f46] leading-relaxed mt-4">
            ¡Equipo! Registremos las gestiones de <strong>Ventas Isla y Transferencias al S2 14111</strong>.
            Guarda el estado real de la gestión: nos ayuda a entender objeciones y mejorar la oferta.
          </p>
          <ul className="mt-6 space-y-3">
            {tips.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-[#3f3f46]">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#0ea5e9]" />
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 -mb-6 sm:-mb-8 lg:-mb-10 flex justify-center">
          <img
            src="/no%20desea%20portabilidad.png"
            alt="No desea portabilidad"
            className="fibra-anim max-h-[28rem] w-auto max-w-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </aside>

      {/* Panel derecho: formulario / confirmación */}
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 flex flex-col justify-center flex-1 h-full">
        {exito ? (
          <div className="text-center m-auto">
            <CheckCircle2 size={64} className="mx-auto text-[#0ea5e9] mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">¡Registro guardado!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              RUT <strong>{exito.rutCliente}</strong> · Asesor <strong>{exito.asesor}</strong>
            </p>
            {exito.estado && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Estado: <strong>{exito.estado}</strong>
                {exito.detalleError && (
                  <span className="block text-xs text-sky-700 dark:text-sky-400 mt-1 font-medium">
                    Detalle / Tipificación: {exito.detalleError}
                  </span>
                )}
              </p>
            )}
            <button
              type="button"
              onClick={() => setExito(null)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-sky-600 transition-colors cursor-pointer"
            >
              <RotateCcw size={16} />
              Registrar otro cliente
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="pb-4 mb-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                  Formulario Ventas Isla / Transferencias al S2 14111
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1.5 font-medium">
                  <User size={13} />
                  {emailLector || 'usuario.apex@apexamerica.com'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              {campos.map((c) => (
                <label key={c.key} className={c.colSpan === 2 ? 'md:col-span-2 block' : 'block'}>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {c.label} <span className="text-red-500">*</span>
                  </span>
                  {c.tipo === 'select' ? (
                    <select
                      value={form[c.key]}
                      onChange={set(c.key)}
                      required
                      className={`${inputBase} mt-1.5 ${form[c.key] ? '' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                      <option value="" disabled>
                        {c.placeholder || 'Selecciona una opción'}
                      </option>
                      {c.opciones.map((o) => {
                        const valor = nombreAsesor(o)
                        const nombre = nombreAsesor(o)
                        return (
                          <option key={valor} value={valor} className="text-gray-800 dark:text-gray-100">
                            {nombre}
                          </option>
                        )
                      })}
                    </select>
                  ) : (
                    <input
                      type={c.tipo === 'date' ? 'date' : 'text'}
                      value={form[c.key]}
                      onChange={set(c.key)}
                      required
                      placeholder={c.placeholder}
                      className={`${inputBase} mt-1.5`}
                    />
                  )}
                </label>
              ))}

              {form.estado === 'SE OFRECE Y NO DESEA' && (
                <label className="col-span-1 md:col-span-2 block animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Subestado <span className="text-red-500">*</span>
                  </span>
                  <select
                    value={form.subestado || ''}
                    onChange={set('subestado')}
                    required
                    className={`${inputBase} mt-1.5 ${form.subestado ? '' : 'text-gray-400 dark:text-gray-500'}`}
                  >
                    <option value="" disabled>
                      Selecciona el subestado
                    </option>
                    {ESTADOS_NO_VENTA_SECUNDARIOS.map((o) => (
                      <option key={o} value={o} className="text-gray-800 dark:text-gray-100">
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {(form.subestado === ESTADO_NO_VENTA_OTROS || form.estado === ESTADO_NO_VENTA_OTROS) && (
                <label className="col-span-1 md:col-span-2 block animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                    <span>
                      Detalle / Tipificación <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-[#0369a1] dark:text-sky-400">
                      Especifica el motivo
                    </span>
                  </span>
                  <textarea
                    rows={2}
                    value={form.detalleError || ''}
                    onChange={set('detalleError')}
                    required
                    placeholder="Describe detalladamente el motivo de la gestión..."
                    className={`${inputBase} mt-1.5 resize-none`}
                  />
                </label>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Info size={13} className="shrink-0" />
                Todos los campos son obligatorios.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm(vacioNoVenta())}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw size={16} />
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#0ea5e9] hover:bg-sky-600 text-white text-sm font-bold shadow-lg shadow-sky-500/20 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {enviando ? 'Enviando…' : 'Enviar'}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

function MisRegistros({ onToast }) {
  return <MigracionesTabs db={db} onToast={onToast} esUsuario />
}

const FormulariosPage = () => {
  const [seccion, setSeccion] = useState('comisiones')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHover, setSidebarHover] = useState(false)
  const [toast, setToast] = useState(null)
  const [darkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('vtr-dark-mode') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('vtr-dark-mode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    document.title = 'FORMULARIOS'
  }, [])

  let toastTimer = null
  const showToast = (msg) => {
    setToast(msg)
    if (typeof window !== 'undefined') window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => setToast(null), 3200)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-[0_12px_48px_rgba(0,0,0,0.25)] fixed top-4 bottom-4 z-40 left-4 overflow-visible transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-3xl`}
      >
        <div className="h-full flex flex-col">
          <div className="border-b border-gray-100 flex items-center justify-center p-4 h-[64px] relative shrink-0">
            <a
              href="https://apex.wayfromhome.cx/login?returnUrl=%2Fmenu"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:opacity-80"
            >
              <img
                src="https://i.ibb.co/7Nn2L1Py/apex-large.png"
                alt="Logo Apex"
                className={`object-contain cursor-pointer transition-all duration-300 nav-logo ${sidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                style={{ height: '28px' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </a>
            <a
              href="https://apex.wayfromhome.cx/login?returnUrl=%2Fmenu"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:opacity-80"
            >
              <img
                src="https://i.ibb.co/XrtN8M3V/apex-2.png"
                alt="Apex"
                className={`w-6 h-6 object-contain cursor-pointer transition-all duration-300 nav-logo ${sidebarOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </a>
          </div>

          <nav className="p-4 pb-4 flex-1 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-2">
              {FORM_NAV.map((item) => {
                const Icon = item.icon
                const activa = seccion === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSeccion(item.id)}
                      className={`btn-cyan-hover nav-side-btn w-full flex items-center py-3 rounded-full transition-[transform,box-shadow,gap,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                        sidebarOpen ? 'gap-3 px-4' : 'gap-0 px-0 justify-center'
                      } ${
                        activa ? 'bg-[#f69100] text-white shadow-lg' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <Icon size={20} className="shrink-0" />
                      <span
                        className={`font-medium overflow-hidden whitespace-nowrap bg-transparent transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          sidebarOpen ? 'max-w-40 opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-2'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 p-4">
            <a
              href="/"
              className={`btn-cyan-hover nav-side-btn w-full flex items-center py-3 rounded-full text-gray-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-[transform,box-shadow,gap,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                sidebarOpen ? 'gap-3 px-4' : 'gap-0 px-0 justify-center'
              }`}
            >
              <Home size={20} className="shrink-0" />
              <span
                className={`font-medium text-sm overflow-hidden whitespace-nowrap bg-transparent transition-[max-width,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  sidebarOpen ? 'max-w-40 opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-2'
                }`}
              >
                Volver al portal
              </span>
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          tabIndex={sidebarHover ? 0 : -1}
          style={{
            opacity: sidebarHover ? 1 : 0,
            transform: `translateY(-50%) scale(${sidebarHover ? 1 : 0.75})`,
            pointerEvents: sidebarHover ? 'auto' : 'none',
          }}
          className="absolute top-1/2 right-1 z-50 flex items-center justify-center p-0 bg-transparent border-0 shadow-none text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          {sidebarOpen ? <ChevronLeft size={20} strokeWidth={2.25} /> : <ChevronRight size={20} strokeWidth={2.25} />}
        </button>
      </aside>

      <main className={`flex-1 transition-[margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarOpen ? 'ml-64' : 'ml-20'} h-screen overflow-hidden flex flex-col pl-4`}>
        <div className="flex-1 min-h-0 overflow-auto p-4 lg:p-8">
          <div className="min-h-full flex flex-col">
            {seccion === 'comisiones' ? (
              <FormComisiones onToast={showToast} />
            ) : seccion === 'noacepta' ? (
              <FormNoAceptaFibra onToast={showToast} />
            ) : seccion === 'noventa' ? (
              <FormNoVentaIslasMovil onToast={showToast} />
            ) : (
              <MisRegistros onToast={showToast} />
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium max-w-sm">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

export default FormulariosPage