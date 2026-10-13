import React, { useState, useEffect } from 'react'
import { ArrowLeft, Moon, Sun, User, Lock, Eye, EyeOff, LogOut, Loader2, AlertCircle, Upload, Save, Settings, Mail, KeyRound, X, Users, UserPlus, Bot, Database, CreditCard, Image, Megaphone, ChevronLeft, ChevronRight, ClipboardList, BarChart3, ShieldCheck, ClipboardCheck } from 'lucide-react'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { AdminPanel, Modal, Toast, UsuariosSection, suscribirNoticias, suscribirPerfilAdmin, guardarPerfilAdmin, subirImagenImgbb, db, normalizarHistorialAvatares, cargarHistorialAvataresAdmin, guardarHistorialAvataresAdminLocal } from './App.tsx'
import AdminConocimientoIA from './components/AdminConocimientoIA.jsx'
import AdminIdsClave from './components/AdminIdsClave.jsx'
import AdminPlanes from './components/AdminPlanes.jsx'
import AdminStreamingShowcase from './components/AdminStreamingShowcase.jsx'
import AdminTipificaciones from './components/AdminTipificaciones.jsx'
import AdminMigraciones from './components/AdminMigraciones.jsx'
import AdminAsesores from './components/AdminAsesores.jsx'
import AdminSupervisores from './components/AdminSupervisores.jsx'
import AdminAdminsAutorizados from './components/AdminAdminsAutorizados.jsx'
import BotonGoogle from './components/BotonGoogle.jsx'
import { entrarConGoogleAdmin, esAdminPrincipal } from './adminsAutorizados'
import AvatarPerfilPicker from './components/AvatarPerfilPicker.jsx'

const ADMIN_NAV = [
  { id: 'publicar', label: 'Comunicados', icon: Megaphone },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'tipificaciones', label: 'Tipificaciones', icon: ClipboardList },
  { id: 'migraciones', label: 'Migraciones', icon: BarChart3 },
  { id: 'asesores', label: 'Asesores', icon: UserPlus },
  { id: 'supervisores', label: 'Supervisores', icon: ClipboardCheck },
  { id: 'admins', label: 'Admins autorizados', icon: ShieldCheck },
  { id: 'ia', label: 'Conocimiento IA', icon: Bot },
  { id: 'ids', label: 'IDs Clave', icon: Database },
  { id: 'planes', label: 'Planes', icon: CreditCard },
  { id: 'streaming', label: 'Streaming', icon: Image },
]

const navActiva = (id, seccion) =>
  id === 'ia' ? seccion === 'ia' || seccion === 'aprendizaje' : seccion === id

const AdminPage = () => {
  const [noticias, setNoticias] = useState([])
  const [modalImage, setModalImage] = useState(null)
  const [modalSize, setModalSize] = useState('large')
  const [modalDisableZoom, setModalDisableZoom] = useState(false)
  const [toast, setToast] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('vtr-dark-mode') === 'true'
  })

  // Estado de autenticación: loading | loggedOut | loggedIn
  const [authEstado, setAuthEstado] = useState('loading')
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [errorLogin, setErrorLogin] = useState('')
  const [cargandoLogin, setCargandoLogin] = useState(false)
  const [entrandoGoogle, setEntrandoGoogle] = useState(false)
  const [emailSesion, setEmailSesion] = useState('')
  const [uid, setUid] = useState('')

  // Configuración del perfil del administrador
  const [seccion, setSeccion] = useState('publicar')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHover, setSidebarHover] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPrev, setAvatarPrev] = useState('')
  const [avatarHistorial, setAvatarHistorial] = useState([])
  const [subiendoAvatar, setSubiendoAvatar] = useState(false)
  const [guardandoAvatar, setGuardandoAvatar] = useState(false)

  // Datos de la cuenta del administrador
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [verContrasenas, setVerContrasenas] = useState(false)
  const [guardandoCuenta, setGuardandoCuenta] = useState(false)
  const [errorCuenta, setErrorCuenta] = useState('')

  // Recordar credenciales en el login
  const [recordar, setRecordar] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('vtr-recordar') === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('vtr-creds-pass')
    if (localStorage.getItem('vtr-recordar') === 'true') {
      const emailGuardado = localStorage.getItem('vtr-creds-email') || ''
      if (emailGuardado) setUsuario(emailGuardado)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('vtr-dark-mode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    document.title = 'ADMINISTRACION'
  }, [])

  // Escucha el estado de sesión de Firebase Auth en tiempo real
  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthEstado('loggedIn')
        setEmailSesion(user.email || '')
        setNuevoEmail(user.email || '')
        setNombreUsuario(user.displayName || '')
        setUid(user.uid)
      } else {
        setAuthEstado('loggedOut')
        setEmailSesion('')
        setNuevoEmail('')
        setNombreUsuario('')
        setUid('')
        setAvatarUrl('')
        setAvatarPrev('')
        setAvatarHistorial([])
      }
    })
    return () => unsub()
  }, [])

  // Suscribe las noticias solo cuando hay sesión activa
  useEffect(() => {
    if (authEstado !== 'loggedIn') return
    const unsub = suscribirNoticias((items) => setNoticias(items))
    return () => unsub()
  }, [authEstado])

  // Lee el perfil (foto de usuario) del administrador autenticado
  useEffect(() => {
    if (authEstado !== 'loggedIn' || !uid) return
    const unsub = suscribirPerfilAdmin(uid, (data) => {
      const url = String(data.avatarUrl || '').trim()
      setAvatarUrl(url)
      setAvatarPrev(url)
      const merged = normalizarHistorialAvatares(
        [...cargarHistorialAvataresAdmin(uid), ...(Array.isArray(data.avatarHistorial) ? data.avatarHistorial : [])],
        url
      )
      setAvatarHistorial(merged)
      guardarHistorialAvataresAdminLocal(uid, merged)
    })
    return () => unsub()
  }, [authEstado, uid])

  const aplicarAvatarAdmin = async (url) => {
    const next = String(url || '').trim()
    if (!next || !uid) return false
    const hist = guardarHistorialAvataresAdminLocal(uid, normalizarHistorialAvatares(avatarHistorial, next))
    setAvatarHistorial(hist)
    const ok = await guardarPerfilAdmin(uid, { avatarUrl: next, avatarHistorial: hist })
    if (!ok) throw new Error('No se pudo guardar')
    setAvatarUrl(next)
    setAvatarPrev(next)
    return true
  }

  const handleSubirAvatar = async (file) => {
    if (!file?.type?.startsWith('image/')) {
      showToast('Selecciona un archivo de imagen válido.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('La imagen debe pesar menos de 4 MB.')
      return
    }
    setSubiendoAvatar(true)
    try {
      const url = await subirImagenImgbb(file)
      await aplicarAvatarAdmin(url)
      showToast('¡Foto de usuario actualizada!')
    } catch (err) {
      showToast(err.message || 'Error al subir la imagen.')
    } finally {
      setSubiendoAvatar(false)
    }
  }

  const elegirAvatarAdmin = async (url) => {
    await aplicarAvatarAdmin(url)
    showToast('Foto de perfil actualizada.')
  }

  const handleGuardarPerfil = async () => {
    if (!avatarPrev.trim()) {
      showToast('Pega un enlace o sube una imagen primero.')
      return
    }
    setGuardandoAvatar(true)
    try {
      await aplicarAvatarAdmin(avatarPrev)
      showToast('¡Foto de usuario actualizada!')
    } catch {
      showToast('Error al guardar. Revisa la conexión e inténtalo de nuevo.')
    } finally {
      setGuardandoAvatar(false)
    }
  }

  const handleGuardarCuenta = async (e) => {
    e.preventDefault()
    setErrorCuenta('')
    setGuardandoCuenta(true)
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error('sin-sesion')

      const nombre = nombreUsuario.trim()
      const email = nuevoEmail.trim().toLowerCase()
      const cambioEmail = email && email !== (user.email || '')
      const cambioClave = !!nuevaContrasena

      if (cambioClave && nuevaContrasena !== confirmarContrasena) {
        throw new Error('contrasenas-no-coinciden')
      }
      if (cambioClave && nuevaContrasena.length < 6) {
        throw new Error('clave-corta')
      }
      if (cambioEmail && !email) {
        throw new Error('email-invalido')
      }

      if (cambioEmail || cambioClave) {
        if (!contrasenaActual) {
          throw new Error('falta-contrasena-actual')
        }
        const cred = EmailAuthProvider.credential(user.email, contrasenaActual)
        await reauthenticateWithCredential(user, cred)
      }

      if (cambioEmail) {
        await updateEmail(user, email)
      }
      if (cambioClave) {
        await updatePassword(user, nuevaContrasena)
      }
      if (nombre !== (user.displayName || '')) {
        await updateProfile(user, { displayName: nombre })
      }

      setContrasenaActual('')
      setNuevaContrasena('')
      setConfirmarContrasena('')
      if (cambioEmail) setEmailSesion(email)
      showToast('¡Datos de la cuenta actualizados!')
    } catch (err) {
      const code = err && err.code
      setErrorCuenta(
        err && err.message === 'contrasenas-no-coinciden'
          ? 'Las contraseñas nuevas no coinciden.'
          : err && err.message === 'clave-corta'
            ? 'La contraseña debe tener al menos 6 caracteres.'
            : err && err.message === 'falta-contrasena-actual'
              ? 'Ingresa tu contraseña actual para confirmar el cambio.'
              : err && err.message === 'email-invalido'
                ? 'Ingresa un correo válido.'
                : code === 'auth/wrong-password' || code === 'auth/invalid-credential'
                  ? 'La contraseña actual es incorrecta.'
                  : code === 'auth/requires-recent-login'
                    ? 'Debes volver a iniciar sesión para hacer este cambio.'
                    : code === 'auth/email-already-in-use'
                      ? 'Ese correo ya está en uso por otra cuenta.'
                      : code === 'auth/invalid-email'
                        ? 'El correo ingresado no es válido.'
                        : code === 'auth/weak-password'
                          ? 'La contraseña es demasiado débil.'
                          : 'No se pudieron guardar los cambios. Revisa tu conexión e inténtalo de nuevo.'
      )
    } finally {
      setGuardandoCuenta(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorLogin('')
    const email = usuario.trim().toLowerCase()
    if (!email || !contrasena) {
      setErrorLogin('Ingresa usuario y contraseña.')
      return
    }
    setCargandoLogin(true)
    try {
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, contrasena)
      setContrasenaActual(contrasena)
      if (recordar) {
        localStorage.setItem('vtr-recordar', 'true')
        localStorage.setItem('vtr-creds-email', email)
      } else {
        localStorage.removeItem('vtr-recordar')
        localStorage.removeItem('vtr-creds-email')
      }
      localStorage.removeItem('vtr-creds-pass')
    } catch (err) {
      const code = err && err.code
      setErrorLogin(
        code === 'auth/invalid-login-credentials' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
          ? 'Usuario o contraseña incorrectos.'
          : code === 'auth/too-many-requests'
            ? 'Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.'
            : 'No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.'
      )
    } finally {
      setCargandoLogin(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(getAuth())
    } catch {
      // se ignora: el listener actualiza el estado de todos modos
    }
  }

  // El administrador principal siempre gestiona el registro; los administradores
  // ya registrados también pueden agregar/quitar a otros (se valida en el panel).
  const esSuperAdmin = esAdminPrincipal(emailSesion)

  // Acceso con Google: exige dominio @apexamerica.com Y estar en el registro
  const handleLoginGoogle = async () => {
    setErrorLogin('')
    setEntrandoGoogle(true)
    try {
      const auth = getAuth()
      const email = await entrarConGoogleAdmin(auth, db)
      if (email) {
        // identidad para el resto del portal (p. ej. /formularios)
        localStorage.setItem('vtr-lector-email', email)
        setContrasenaActual('')
      }
    } catch (err) {
      setErrorLogin(err?.message || 'No se pudo iniciar sesión con Google.')
      // Si Firebase ya publicó la sesión antes de validar, la revertimos
      setAuthEstado((prev) => (prev === 'loggedIn' ? 'loggedOut' : prev))
    } finally {
      setEntrandoGoogle(false)
    }
  }

  const openImageModal = (src, size = 'large', disableZoom = false) => {
    setModalImage(src)
    setModalSize(size)
    setModalDisableZoom(disableZoom)
  }

  const closeImageModal = () => {
    setModalImage(null)
    setModalDisableZoom(false)
  }

  const showToast = (mensaje) => setToast(mensaje)

  // Pantalla de carga mientras Firebase verifica la sesión
  const renderCargando = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Verificando sesión...</p>
      </div>
    </div>
  )

  // Pantalla de login exclusiva para administradores
  const renderLogin = () => (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://i.ibb.co/SwGVh7LL/CLARO-VTR-CHILE.webp')" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6">
            <img
              src="https://i.ibb.co/7Nn2L1Py/apex-large.png"
              alt="Logo Apex"
              className="h-9 w-auto mx-auto always-white-icon"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {errorLogin && (
              <div className="flex items-center gap-2 rounded-xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-xs font-medium text-red-700 dark:text-red-300">{errorLogin}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="correo del administrador"
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={verContrasena ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setVerContrasena(!verContrasena)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  title={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verContrasena ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Recordar credenciales
              </span>
            </label>

            <button
              type="submit"
              disabled={cargandoLogin}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {cargandoLogin ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <div className="px-6 pb-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                o
              </span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>

            <BotonGoogle
              onClick={handleLoginGoogle}
              entrando={entrandoGoogle}
              disabled={cargandoLogin}
              etiqueta="Iniciar sesión con Google"
              etiquetaCargando="Validando acceso…"
            />

            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 text-center">
              Solo cuentas corporativas <strong>@apexamerica.com</strong> registradas en el registro de administradores
              pueden entrar con Google.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/60 mt-4">
          Interno VTR · Acceso exclusivo para administradores
        </p>
      </div>
    </div>
  )

  // Pantalla de configuración: foto de usuario del administrador
  const renderConfiguracion = () => (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Settings size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Configuración</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Define la foto de usuario que se muestra en el panel de administración
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <AvatarPerfilPicker
            avatarUrl={avatarPrev || avatarUrl}
            avataresUsados={avatarHistorial}
            onCambiarFoto={handleSubirAvatar}
            onElegirAvatar={elegirAvatarAdmin}
            onToast={showToast}
            size="xl"
            menuAlign="center"
          />
          <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Cambiar</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Presiona la foto para cambiarla</p>
        </div>

        <div className="w-full space-y-3 mt-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              O pega la URL de la imagen
            </label>
            <input
              type="url"
              value={avatarPrev}
              onChange={(e) => setAvatarPrev(e.target.value)}
              placeholder="https://i.imgbb.com/foto.jpg"
              className="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
            />
          </div>

          <button
            onClick={handleGuardarPerfil}
            disabled={guardandoAvatar}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Save size={18} />
            {guardandoAvatar ? 'Guardando...' : 'Guardar foto de usuario'}
          </button>
        </div>

        {emailSesion && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <User size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            Sesión activa: <strong className="text-gray-700 dark:text-gray-200">{nombreUsuario || emailSesion}</strong>
          </div>
        )}
      </div>

      {/* Datos de la cuenta */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <KeyRound size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Datos de la cuenta</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Se muestran tus datos actuales; edítalos y pulsa Guardar
            </p>
          </div>
        </div>

        {/* Datos actuales */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 mb-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 min-w-0">
            <User size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="shrink-0">Nombre actual:</span>
            <strong className="text-gray-800 dark:text-gray-100 truncate">{nombreUsuario || 'Sin nombre asignado'}</strong>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 min-w-0">
            <Mail size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="shrink-0">Correo actual:</span>
            <strong className="text-gray-800 dark:text-gray-100 truncate">{emailSesion || 'Sin correo'}</strong>
          </div>
        </div>

        <form onSubmit={handleGuardarCuenta} className="space-y-4">
          {errorCuenta && (
            <div className="flex items-start gap-2 rounded-xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-700 dark:text-red-300">{errorCuenta}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre de usuario
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Ej: Carlos Pérez"
                autoComplete="name"
                className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Correo de acceso
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="email"
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
                placeholder="correo@vtr.cl"
                autoComplete="email"
                className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Cambiar contraseña <span className="font-medium normal-case">(opcional)</span>
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={verContrasenas ? 'text' : 'password'}
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    placeholder="Mín. 6 caracteres"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={verContrasenas ? 'text' : 'password'}
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setVerContrasenas(!verContrasenas)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    title={verContrasenas ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                  >
                    {verContrasenas ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Contraseña actual <span className="font-medium normal-case text-gray-400">(se muestra tu contraseña actual)</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                autoComplete="current-password"
                className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={guardandoCuenta}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Save size={18} />
            {guardandoCuenta ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </form>
      </div>
      </div>
    </div>
  )

  if (authEstado === 'loading') {
    return renderCargando()
  }

  // Evita pintar el panel mientras Google valida dominio + registro de administradores
  if (entrandoGoogle) {
    return renderCargando()
  }

  if (authEstado === 'loggedOut') {
    return renderLogin()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl fixed h-full z-40 left-0 overflow-visible transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`}
      >
        <div className="h-full flex flex-col">
          <div className="border-b border-gray-100 flex items-center justify-center p-4 h-32 relative shrink-0">
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
                style={{ height: '40px' }}
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
                className={`w-8 h-8 object-contain cursor-pointer transition-all duration-300 nav-logo ${sidebarOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </a>
          </div>

          <nav className="p-4 pb-4 flex-1 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-2">
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon
                const activa = navActiva(item.id, seccion)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSeccion(item.id)}
                      className={`btn-cyan-hover nav-side-btn w-full flex items-center py-3 rounded-full transition-[transform,box-shadow,gap,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                        sidebarOpen ? 'gap-3 px-4' : 'gap-0 px-0 justify-center'
                      } ${
                        activa
                          ? 'bg-[#f69100] text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-200'
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

          <div
            className={`shrink-0 border-t border-gray-100 dark:border-gray-800 ${
              sidebarOpen ? 'px-3 py-3' : 'px-2 py-3 flex justify-center'
            }`}
          >
            <div className={`flex items-center min-w-0 ${sidebarOpen ? 'gap-3' : ''}`}>
              <AvatarPerfilPicker
                avatarUrl={avatarUrl}
                avataresUsados={avatarHistorial}
                onCambiarFoto={handleSubirAvatar}
                onElegirAvatar={elegirAvatarAdmin}
                onToast={showToast}
                size="sm"
                menuAlign={sidebarOpen ? 'left' : 'center'}
                menuPlacement="top"
              />
              <button
                type="button"
                onClick={() => setConfigModalOpen(true)}
                title="Ir a configuración"
                className={`text-left min-w-0 flex-1 cursor-pointer group overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-300 ${
                  sidebarOpen ? 'max-w-44 opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
                }`}
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  {nombreUsuario || 'Administrador'}
                </p>
                {emailSesion && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                    {emailSesion}
                  </p>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
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

      <main className={`flex-1 transition-[margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white shadow-sm sticky top-0 z-30 flex justify-end items-center gap-3 px-6 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8">
        {seccion === 'publicar' ? (
          <AdminPanel
            noticias={noticias}
            onNavigateToSection={(sectionId) => {
              if (sectionId === 'configuracion') {
                setConfigModalOpen(true)
                return
              }
              setSeccion(
                sectionId === 'usuarios' ||
                  sectionId === 'tipificaciones' ||
                  sectionId === 'migraciones' ||
                  sectionId === 'asesores' ||
                  sectionId === 'supervisores' ||
                  sectionId === 'admins' ||
                  sectionId === 'ia' ||
                  sectionId === 'ids' ||
                  sectionId === 'aprendizaje' ||
                  sectionId === 'planes' ||
                  sectionId === 'streaming'
                  ? sectionId
                  : 'publicar'
              )
            }}
            setNoticias={setNoticias}
            onToast={showToast}
            openImageModal={openImageModal}
            nombreUsuario={nombreUsuario}
            avatarUrl={avatarUrl}
          />
        ) : seccion === 'usuarios' ? (
          <UsuariosSection noticias={noticias} onToast={showToast} />
        ) : seccion === 'tipificaciones' ? (
          <AdminTipificaciones db={db} onToast={showToast} />
        ) : seccion === 'migraciones' ? (
          <AdminMigraciones db={db} onToast={showToast} />
        ) : seccion === 'asesores' ? (
          <AdminAsesores db={db} onToast={showToast} />
        ) : seccion === 'supervisores' ? (
          <AdminSupervisores db={db} onToast={showToast} />
        ) : seccion === 'admins' ? (
          <AdminAdminsAutorizados
            db={db}
            onToast={showToast}
            esSuperAdmin={esSuperAdmin}
            correoSesion={emailSesion}
          />
        ) : seccion === 'ia' || seccion === 'aprendizaje' ? (
          <AdminConocimientoIA
            db={db}
            onToast={showToast}
            panelInicial={seccion === 'aprendizaje' ? 'revisar' : 'ensenar'}
          />
        ) : seccion === 'ids' ? (
          <AdminIdsClave db={db} onToast={showToast} />
        ) : seccion === 'planes' ? (
          <AdminPlanes db={db} onToast={showToast} />
        ) : seccion === 'streaming' ? (
          <AdminStreamingShowcase db={db} onToast={showToast} />
        ) : (
          renderConfiguracion()
        )}
        </div>
      </main>

      <Modal modalImage={modalImage} modalSize={modalSize} disableZoom={modalDisableZoom} onClose={closeImageModal} />
      <Toast toast={toast} onClose={() => setToast(null)} />

      {configModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 overflow-y-auto"
          onClick={() => setConfigModalOpen(false)}
        >
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
            <div
              className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl my-4 animate-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setConfigModalOpen(false)}
                className="btn-cerrar absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
              <div className="p-6">
                {renderConfiguracion()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage