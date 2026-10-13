import React, { useState, useEffect, useRef } from 'react'
import {
  Tv,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Radio,
  Sliders,
  Shield,
  Wifi,
  Smartphone,
  Info,
  Clock,
  Settings as SettingsIcon,
  Check,
  Film,
  Sparkles,
  Layers,
  HelpCircle,
  RotateCcw,
  ArrowLeft,
  Menu as MenuIcon,
  Search,
  Key,
  Globe,
  HardDrive,
  Cpu,
  Bluetooth,
  User,
  Power,
  RefreshCw,
  ExternalLink,
  Lock,
  Trash2,
  Bell,
  Database,
  Package,
  MapPin,
  Home,
  Cast,
  Monitor,
  Mic,
  Keyboard,
  Grid,
  Gamepad2,
  Volume2,
  BatteryMedium,
  Accessibility
} from 'lucide-react'

// Mascot SVG (TiVo / VTR TV Box mascot with antennae and smile)
const VtrTvMascot = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M14 11L10 5M26 11L30 5"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="9" cy="4" r="2.5" fill="white" />
    <circle cx="31" cy="4" r="2.5" fill="white" />
    <rect
      x="7"
      y="11"
      width="26"
      height="21"
      rx="6"
      fill="white"
    />
    <circle cx="15" cy="18" r="2.2" fill="#1e2229" />
    <circle cx="25" cy="18" r="2.2" fill="#1e2229" />
    <path
      d="M16 23C17.5 25.5 22.5 25.5 24 23"
      stroke="#1e2229"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect x="12" y="32" width="4" height="3" rx="1.5" fill="white" />
    <rect x="24" y="32" width="4" height="3" rx="1.5" fill="white" />
  </svg>
)

// Official VTR logo using /logo-vtr.png and uniform text format for vtr.com
const VtrLogo = () => (
  <div className="flex items-center gap-2.5 select-none">
    <img
      src="/logo-vtr.png"
      alt="Logo VTR"
      className="w-8 h-8 lg:w-9 lg:h-9 object-contain drop-shadow"
      draggable={false}
    />
    <span className="text-white text-xl lg:text-2xl font-bold tracking-tight uppercase">
      VTR.COM
    </span>
  </div>
)

// Official Application Catalog with Real Logos / Icons
export const APPS_LIST = [
  { id: 'netflix', name: 'Netflix', category: 'Streaming', image: '/streamingandroid/netflix-2x.webp', icon: '/stream/netflix.png', version: '1.2.5', pkg: 'com.netflix.slupaf' },
  { id: 'disney', name: 'Disney+', category: 'Streaming', image: '/streamingandroid/disney-2x.webp', icon: '/stream/disney.png', version: '1.2.5', pkg: 'com.disneyplus.slupaf' },
  { id: 'max', name: 'Max', category: 'Streaming', image: '/streamingandroid/max1.webp', icon: '/stream/hbo-max.png', version: '1.2.5', pkg: 'com.max.slupaf' },
  { id: 'prime', name: 'Prime Video', category: 'Streaming', image: '/streamingandroid/prime-video-2x.webp', icon: '/stream/prime-video.png', version: '1.2.5', pkg: 'com.primevideo.slupaf' },
  { id: 'paramount', name: 'Paramount+', category: 'Streaming', image: '/streamingandroid/paramount-2x.webp', icon: '/Paramount.png', version: '1.2.5', pkg: 'com.paramountplus.slupaf' },
  { id: 'appletv', name: 'Apple TV+', category: 'Streaming', image: '/streamingandroid/apple-tv-2x.webp', icon: '/Appletvvvv.png', version: '1.2.5', pkg: 'com.apple.tv.slupaf' },
  { id: 'peacock', name: 'Peacock', category: 'Streaming', image: '/streamingandroid/peacock-2x.webp', icon: '/peacook.png', version: '1.2.5', pkg: 'com.peacock.slupaf' },
  { id: 'youtube', name: 'YouTube', category: 'Streaming', image: '/streamingandroid/youtube-2x.webp', icon: '/youtube.png', iconType: 'image', iconSrc: '/youtube.png', version: '1.2.5', pkg: 'com.youtube.slupaf' },
  { id: 'spotify', name: 'Spotify', category: 'Streaming', image: '/streamingandroid/spotify-2x.webp', icon: '/spotify.png', version: '1.2.5', pkg: 'com.spotify.slupaf' },
  { id: 'playstore', name: 'Google Play Store', category: 'Tienda', image: '/playstorefront.png', icon: '/playstore.png', iconType: 'image', iconSrc: '/playstore.png', version: '1.2.5', pkg: 'com.android.vending' }
]

const VER_TV_CHANNELS = [
  {
    id: 'cartoon-network',
    num: '718',
    name: 'Cartoon Network HD',
    prog: 'Cartoon Network',
    time: 'En vivo',
    category: 'Infantil HD',
    image: '/CNETWORK.png'
  },
  {
    id: 'tnt-sports-premium',
    num: '855',
    name: 'TNT Sports Premium HD',
    prog: 'TNT Sports Premium',
    time: 'En vivo',
    category: 'Deportes HD',
    image: '/TNTSPORTSPREMIUM.png'
  }
]

const MIS_PROGRAMAS_LIST = [
  {
    id: 'activa-plataformas',
    name: 'Activa Plataformas',
    image: '/activplataforms.png'
  },
  {
    id: 'primera-division',
    name: 'Primera División',
    image: '/chuile%20primera%20divi.png'
  },
  {
    id: 'conmebol',
    name: 'CONMEBOL',
    image: '/comebol.png'
  },
  {
    id: 'qurencia',
    name: 'Qurencia',
    image: '/qurencia.png'
  },
  {
    id: 'chilevision',
    name: 'Chilevisión',
    image: '/chilevision.png'
  }
]

// Banners publicitarios VTR (carpeta /vtr publicidad) mostrados en el inicio
export const AD_BANNERS = [
  '/vtr%20publicidad/banner-toy-story-dk.png',
  '/vtr%20publicidad/BannerHBOVTRHomeDK.png',
  '/vtr%20publicidad/bannersucursalesoctubre-DK.png',
  '/vtr%20publicidad/BannerVTRHomeDK-2P600NetflixyDisney_DK.png',
  '/vtr%20publicidad/Banner_VTR_Home_DK_-_cyber_VTR_fibra_600_tv_premium_II_DK.png',
  '/vtr%20publicidad/Banner_VTR_Home_DK_-_VTR_fibra_606_y_netflix.png',
  '/vtr%20publicidad/Banner_VTR_Home_Fibra600_DK.png',
  '/vtr%20publicidad/cyber-dk.png',
  '/vtr%20publicidad/home-slide-otts-activacion-dk.jpg'
]

// Permisos mostrados en la ficha de la aplicación
const PERMISOS_APP = [
  { nombre: 'Almacenamiento', estado: 'Permitido' },
  { nombre: 'Notificaciones', estado: 'Permitido' },
  { nombre: 'Cámara', estado: 'Permitido' },
  { nombre: 'Micrófono', estado: 'No permitido' },
  { nombre: 'Ubicación', estado: 'No permitido' },
  { nombre: 'Información de la app', estado: 'Permitido' }
]

// App Icon Renderer for authentic brand logos
const AppIconRenderer = ({ app, className = 'w-12 h-12' }) => {
  if (app.iconType === 'image' && app.iconSrc) {
    return (
      <img
        src={app.iconSrc}
        alt={app.name}
        className={`${className} object-contain drop-shadow-md `}
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
    )
  }

  if (app.iconType === 'svg-max') {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-tr from-[#002be7] via-[#011cbd] to-[#010e4a] flex items-center justify-center p-2 shadow-lg border border-blue-400/30`}>
        <span className="text-white font-black text-xl lg:text-2xl tracking-tighter italic drop-shadow">max</span>
      </div>
    )
  }

  if (app.iconType === 'svg-prime') {
    return (
      <div className={`${className} rounded-2xl bg-gradient-to-b from-[#002447] to-[#000d1c] border border-cyan-400/40 flex flex-col items-center justify-center p-1.5 shadow-lg`}>
        <span className="text-white font-black text-xs lg:text-sm tracking-tight leading-none">prime</span>
        <span className="text-cyan-400 font-bold text-[9px] lg:text-[10px] -mt-0.5 leading-none">video</span>
        <svg className="w-7 h-2 mt-0.5" viewBox="0 0 40 10">
          <path d="M2 3 Q20 10 38 3" fill="none" stroke="#00a8e1" strokeWidth="2.8" strokeLinecap="round" />
          <polygon points="35,1 40,4 36,7" fill="#00a8e1" />
        </svg>
      </div>
    )
  }

  if (app.iconType === 'svg-spotify') {
    return (
      <div className={`${className} rounded-full bg-[#1db954] flex items-center justify-center shadow-lg p-2 border border-emerald-400/30`}>
        <svg className="w-8 h-8 drop-shadow" viewBox="0 0 24 24" fill="black">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10 5.524 0 10-4.476 10-10 0-5.523-4.476-10-10-10zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.308-1.758-8.793-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.809-.87 7.076-.496 9.722 1.115.294.18.386.562.207.855zm1.226-2.727c-.226.367-.71.482-1.077.256-2.69-1.653-6.79-2.132-9.971-1.166-.413.125-.85-.11-.975-.523-.125-.413.11-.85.523-.975 3.633-1.103 8.147-.568 11.244 1.332.367.226.482.71.256 1.076zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.494.15-1.02-.132-1.17-.626-.15-.493.132-1.02.626-1.17 3.532-1.072 9.404-.87 13.115 1.333.444.263.59.84.327 1.284-.264.444-.84.59-1.284.327z"/>
        </svg>
      </div>
    )
  }

  if (app.iconType === 'svg-playstore') {
    return (
      <div className={`${className} rounded-2xl bg-gray-900 border border-white/15 flex items-center justify-center p-2 shadow-lg`}>
        <svg className="w-8 h-8 drop-shadow" viewBox="0 0 48 48">
          <path fill="#4caf50" d="M7.7 4.2L26 22.5 19.3 29.2 5.9 5.8c-.5.8-.8 1.8-.8 2.9v30.6c0 1.1.3 2.1.8 2.9l1.8-38z"/>
          <path fill="#ff9800" d="M32.8 15.7L7.7 4.2 26 22.5l6.8-6.8z"/>
          <path fill="#f44336" d="M7.7 43.8l25.1-11.5-6.8-6.8-6.7 6.7z"/>
          <path fill="#2196f3" d="M42.2 21.6l-9.4-5.9-6.8 6.8 6.8 6.8 9.4-5.9c1.4-.9 1.4-2.9 0-3.8z"/>
        </svg>
      </div>
    )
  }

  if (app.iconType === 'svg-plutotv') {
    return (
      <div className={`${className} rounded-2xl bg-yellow-400 flex items-center justify-center p-1.5 shadow-lg border border-yellow-300`}>
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
          <span className="text-yellow-400 font-black text-[9px] tracking-tight">pluto</span>
        </div>
      </div>
    )
  }

  if (app.iconType === 'svg-twitch') {
    return (
      <div className={`${className} rounded-2xl bg-[#9146ff] flex items-center justify-center shadow-lg p-2 border border-purple-300/40`}>
        <svg className="w-7 h-7 drop-shadow" viewBox="0 0 24 24" fill="white">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-2xl bg-gray-800 border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow`}>
      {app.name.charAt(0)}
    </div>
  )
}

export default function AndroidTvInterface({ onExit }) {
  // Navigation views
  const [currentView, setCurrentView] = useState('inicio') // 'inicio' | 'menu' | 'vertv' | 'guia' | 'apps' | 'playstore'
  const [activeTab, setActiveTab] = useState('VER TV')
  const [activeMenuTab, setActiveMenuTab] = useState('AJUSTES')
  const [selectedCardIndex, setSelectedCardIndex] = useState(0)
  const [selectedSettingIndex, setSelectedSettingIndex] = useState(0)
  const [selectedSettingDetail, setSelectedSettingDetail] = useState(null)
  const [selectedRemoteOptionIndex, setSelectedRemoteOptionIndex] = useState(0)
  const [selectedUserPrefIndex, setSelectedUserPrefIndex] = useState(0)
  const [selectedParentalIndex, setSelectedParentalIndex] = useState(0)
  const [selectedSystemOptionIndex, setSelectedSystemOptionIndex] = useState(0)
  const [selectedManageIndex, setSelectedManageIndex] = useState(0)
  const [personalizedRecsOn, setPersonalizedRecsOn] = useState(true)
  const [remoteProgrammingOpen, setRemoteProgrammingOpen] = useState(false)
  const [audioSearchOpen, setAudioSearchOpen] = useState(false)
  const [audioConfirmOpen, setAudioConfirmOpen] = useState(false)
  const [audioBrandOpen, setAudioBrandOpen] = useState(false)
  const [talkbackEnabled, setTalkbackEnabled] = useState(true)
  const [talkbackModalOpen, setTalkbackModalOpen] = useState(false)
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showRemote, setShowRemote] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [adBannerIndex, setAdBannerIndex] = useState(0)
  const [channelToast, setChannelToast] = useState(null)
  const [volumeLevel, setVolumeLevel] = useState(50)

  // Focus state for navigation
  const [focusArea, setFocusArea] = useState('carousel') // 'carousel' | 'tabs'



  // Android TV Settings Drawer (Shown in YouTube video W6kYAqFtdMQ for Evo Fuse 4K / TiVo)
  const [androidSettingsDrawerOpen, setAndroidSettingsDrawerOpen] = useState(false)
  const [androidSettingsSection, setAndroidSettingsSection] = useState('main') // 'main' | 'wifi' | 'bluetooth' | 'apps' | 'cuentas' | 'sistema'
  const [systemSubSection, setSystemSubSection] = useState(null) // null | 'informacion' | 'fecha-hora' | 'idioma' | etc.
  const [appsSubSection, setAppsSubSection] = useState(null) // null | 'ver-todas-apps' | 'apps-no-usadas' | 'permisos-apps'
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [connectedWifi, setConnectedWifi] = useState('VTR_FIBRA_5G_B92')
  const [selectedWifiToConnect, setSelectedWifiToConnect] = useState(null)
  const [wifiPassword, setWifiPassword] = useState('')
  const [isConnectingWifi, setIsConnectingWifi] = useState(false)

  // Bluetooth (Controles remotos y accesorios)
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true)
  const [btDevices, setBtDevices] = useState([
    { id: 'rc419', name: 'VTR Remote RC-419', detail: 'Control remoto · Bluetooth', connected: true, battery: 92 },
    { id: 'audifonos', name: 'Audífonos VTR', detail: 'Audio Bluetooth', connected: false, battery: 64 }
  ])

  // PIN modal for parental controls
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [pinTarget, setPinTarget] = useState(null) // 'dispositivo' | 'control-parental'

// Available WiFi Networks
  const [wifiNetworks, setWifiNetworks] = useState([
    { ssid: 'VTR_FIBRA_5G_B92', signal: 'Excelente', secure: true, freq: '5 GHz', connected: true },
    { ssid: 'VTR_FIBRA_2.4G_B92', signal: 'Muy Buena', secure: true, freq: '2.4 GHz', connected: false },
    { ssid: 'CLARO_HOGAR_PLUS', signal: 'Buena', secure: true, freq: '5 GHz', connected: false },
    { ssid: 'RED_DOMESTICA_P2', signal: 'Regular', secure: true, freq: '5 GHz', connected: false },
    { ssid: 'INVITADOS_VTR', signal: 'Buena', secure: false, freq: '2.4 GHz', connected: false }
  ])

  // Ficha de aplicación (Apps y juegos > Aplicaciones > info de la app)
  const [appInfoId, setAppInfoId] = useState(null)
  const [appPermsOpen, setAppPermsOpen] = useState(false)
  const [appUninstalled, setAppUninstalled] = useState([])
  const [appStorage, setAppStorage] = useState({})
  const [appNotifs, setAppNotifs] = useState({})
  const [appDefaultsCleared, setAppDefaultsCleared] = useState({})

  const installedApps = APPS_LIST.filter(a => !appUninstalled.includes(a.id))
  const appInfo = APPS_LIST.find(a => a.id === appInfoId) || null
  const almacenamientoApp = (appInfo && appStorage[appInfo.id]) || { total: 131, datos: 114, cache: 106 }

  // Current channel playing in background and PIP
  const [currentChannel, setCurrentChannel] = useState({
    num: '711',
    name: 'Chilevisión HD',
    prog: 'CHV Noticias Central',
    category: 'Nacional HD',
    time: '20:30 - 22:30',
    synopsis: 'Edición central de noticias con el resumen informativo más completo de Chile y el mundo.'
  })

  const CHANNELS_LIST = [
    { num: '705', name: 'TV+ HD', prog: 'Toc Show (En Vivo)', time: '21:00 - 22:30' },
    { num: '707', name: 'TVN HD', prog: '24 Horas Central', time: '21:00 - 22:45' },
    { num: '709', name: 'Mega HD', prog: 'El Señor de la Querencia', time: '22:45 - 23:45' },
    { num: '711', name: 'Chilevisión HD', prog: 'CHV Noticias Central', time: '20:30 - 22:30' },
    { num: '713', name: 'Canal 13 HD', prog: 'Tierra Brava: En Bruto', time: '22:30 - 00:30' },
    { num: '714', name: '24 Horas HD', prog: 'Noticias 24', time: '22:00 - 23:00' },
    { num: '715', name: 'CNN Chile HD', prog: 'CNN Prime con Mónica Rincón', time: '21:00 - 22:30' },
    { num: '718', name: 'Cartoon Network HD', prog: 'Cartoon Network', time: 'En vivo' },
    { num: '720', name: 'ESPN HD', prog: 'SportsCenter Chile', time: '22:00 - 23:30' },
    { num: '721', name: 'TNT Sports HD', prog: 'Todos Somos Técnicos', time: '21:30 - 23:00' },
    { num: '855', name: 'TNT Sports Premium HD', prog: 'TNT Sports Premium', time: 'En vivo' }
  ]

  const [channelBuffer, setChannelBuffer] = useState('')
  const channelBufferTimerRef = useRef(null)

  const handleChannelStep = (direction) => {
    const currentIndex = CHANNELS_LIST.findIndex(c => c.num === currentChannel.num)
    const nextIndex = direction === 'up'
      ? (currentIndex + 1) % CHANNELS_LIST.length
      : (currentIndex - 1 + CHANNELS_LIST.length) % CHANNELS_LIST.length
    const nextCh = CHANNELS_LIST[nextIndex >= 0 ? nextIndex : 0]
    setCurrentChannel({
      num: nextCh.num,
      name: nextCh.name,
      prog: nextCh.prog,
      category: 'Nacional HD',
      time: nextCh.time,
      synopsis: `Transmisión en vivo de ${nextCh.name} por VTR D-Box.`
    })
    showChannelBanner(nextCh.num, nextCh.name, nextCh.prog)
  }

  const PINES_VALIDOS = ['0000', '9999']

  const handlePinDigit = (digit) => {
    setPinError(false)
    setPinInput(prev => {
      const next = (prev + digit).slice(0, 4)
      if (next.length === 4) {
        setTimeout(() => {
          if (PINES_VALIDOS.includes(next)) {
            setPinModalOpen(false)
            setPinInput('')
            if (pinTarget === 'dispositivo') {
              setAndroidSettingsDrawerOpen(true)
              setAndroidSettingsSection('main')
              showChannelBanner('SEGURIDAD', 'Configuración del dispositivo', 'Acceso concedido')
            } else {
              setSelectedSettingDetail(settingsOptions.find(o => o.id === 'control-parental'))
              showChannelBanner('SEGURIDAD', 'Control Parental', 'Acceso Concedido')
            }
          } else {
            setPinError(true)
            setPinInput('')
          }
        }, 150)
      }
      return next
    })
  }

  const handlePinDelete = () => {
    setPinError(false)
    setPinInput(prev => prev.slice(0, -1))
  }

  const handleRemoteNumber = (digit) => {
    if (pinModalOpen) {
      handlePinDigit(String(digit))
      return
    }

    const nextBuf = (channelBuffer + digit).slice(-3)
    setChannelBuffer(nextBuf)
    showChannelBanner('CANAL', `Marcando ${nextBuf}...`, 'Ingresa 3 dígitos')

    if (channelBufferTimerRef.current) clearTimeout(channelBufferTimerRef.current)
    channelBufferTimerRef.current = setTimeout(() => {
      const matched = CHANNELS_LIST.find(c => c.num === nextBuf)
      if (matched) {
        setCurrentChannel({
          num: matched.num,
          name: matched.name,
          prog: matched.prog,
          category: 'Nacional HD',
          time: matched.time,
          synopsis: `Transmisión en vivo de ${matched.name} por VTR D-Box.`
        })
        showChannelBanner(matched.num, matched.name, matched.prog)
      } else {
        showChannelBanner(nextBuf, 'Canal Sintonizado', 'Señal D-Box')
      }
      setChannelBuffer('')
    }, 1200)
  }

  const containerRef = useRef(null)
  const carouselRef = useRef(null)

  // Real-time clock formatted like VTR Android TV (e.g. 12:31pm)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      let hours = now.getHours()
      const minutes = now.getMinutes()
      const ampm = hours >= 12 ? 'pm' : 'am'
      hours = hours % 12
      hours = hours ? hours : 12
      const minsStr = minutes < 10 ? '0' + minutes : minutes
      setCurrentTime(`${hours}:${minsStr}${ampm}`)
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  // Rotación automática de banners publicitarios VTR
  useEffect(() => {
    const interval = setInterval(() => {
      setAdBannerIndex(prev => (prev + 1) % AD_BANNERS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Content cards for INICIO (Exact matching of Image 1)
  const contentCards = [
    {
      id: 'streaming-promo',
      type: 'promo',
      title: 'Activa tus plataformas',
      badge: 'INCLUIDAS EN TU PLAN',
      render: () => (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#00b4db] via-[#7b2ff7] to-[#f107a3] p-4 lg:p-5 flex flex-col justify-between select-none">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start z-10">
            <span className="text-[10px] lg:text-[11px] font-extrabold tracking-wider bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white border border-white/20">
              VTR STREAM
            </span>
            <div className="flex -space-x-1.5">
              <span className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-blue-500/90 border border-white text-[9px] lg:text-[10px] flex items-center justify-center font-black text-white shadow">M</span>
              <span className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-purple-600/90 border border-white text-[9px] lg:text-[10px] flex items-center justify-center font-black text-white shadow">D+</span>
              <span className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-red-600/90 border border-white text-[9px] lg:text-[10px] flex items-center justify-center font-black text-white shadow">P</span>
            </div>
          </div>
          <div className="z-10 bg-white/10 backdrop-blur-md p-2.5 lg:p-3  border border-white/30 shadow-lg">
            <h4 className="text-xs lg:text-sm font-black text-white leading-tight uppercase tracking-tight text-center drop-shadow">
              ACTIVA AQUÍ
            </h4>
            <p className="text-[10px] lg:text-[11px] font-bold text-cyan-200 uppercase text-center mt-0.5 leading-snug">
              TUS PLATAFORMAS DE STREAMING INCLUIDAS
            </p>
          </div>
          <div className="z-10 flex justify-center">
            <span className="text-[9px] font-semibold text-white/90 bg-black/40 px-2.5 py-0.5 rounded-full">
              Max ⬢ Prime ⬢ Disney+ ⬢ Universal+
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'libertadores',
      type: 'sports',
      title: 'CONMEBOL LIBERTADORES',
      channel: '720 ESPN Premium',
      render: () => (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#181818] via-[#0d0d0d] to-[#000000] p-4 flex flex-col justify-between items-center text-center select-none border-t-2 border-amber-500/50">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px]"></div>
          <div className="relative mt-1">
            <div className="w-14 h-20 lg:w-16 lg:h-22 mx-auto flex items-center justify-center">
              <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_0_12px_rgba(212,175,55,0.7)]">
                <path d="M50 15 L58 35 L75 35 L62 48 L67 70 L50 56 L33 70 L38 48 L25 35 L42 35 Z" fill="#fcd34d" />
                <path d="M44 70 L56 70 L54 110 L46 110 Z" fill="#d97706" />
                <ellipse cx="50" cy="115" rx="20" ry="6" fill="#b45309" />
                <ellipse cx="50" cy="125" rx="26" ry="8" fill="#78350f" />
                <path d="M30 40 Q15 50 35 70" stroke="#fcd34d" strokeWidth="4" fill="none" />
                <path d="M70 40 Q85 50 65 70" stroke="#fcd34d" strokeWidth="4" fill="none" />
              </svg>
            </div>
          </div>
          <div className="z-10 pb-1">
            <span className="text-[10px] tracking-widest uppercase text-amber-400 font-semibold">CONMEBOL</span>
            <h4 className="text-xs font-black text-white tracking-wider uppercase mt-0.5">
              LIBERTADORES
            </h4>
          </div>
        </div>
      )
    },
    {
      id: 'primera-division',
      type: 'sports',
      title: 'PRIMERA DIVISIÓN',
      channel: '721 TNT Sports HD',
      render: () => (
        <div className="w-full h-full relative overflow-hidden bg-white p-3.5 flex flex-col justify-between items-center text-center select-none">
          <div className="w-full flex justify-end">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">CAMPEONATO</span>
          </div>
          <div className="my-auto">
            <div className="w-16 h-16 lg:w-18 lg:h-18 mx-auto relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <circle cx="50" cy="50" r="46" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                <path
                  d="M20 50C20 30 35 18 50 18C68 18 78 30 78 45C78 65 55 78 40 76C28 74 20 62 20 50Z"
                  fill="#0039a6"
                />
                <path
                  d="M32 50C32 65 42 78 55 78C70 78 80 65 80 50C80 32 68 22 55 22C42 22 32 35 32 50Z"
                  fill="#d52b1e"
                />
                <circle cx="50" cy="14" r="14" fill="white" />
                <polygon
                  points="50,42 52.5,47.5 58,48 54,52 55.5,57.5 50,54.5 44.5,57.5 46,52 42,48 47.5,47.5"
                  fill="#0039a6"
                />
              </svg>
            </div>
          </div>
          <div className="z-10 pb-1">
            <h4 className="text-xs font-black text-[#d52b1e] tracking-tight uppercase">
              PRIMERA DIVISIÓN
            </h4>
            <span className="text-[9px] font-bold text-gray-400">CHILE 2026</span>
          </div>
        </div>
      )
    },
    {
      id: 'tierra-brava',
      type: 'show',
      title: 'Tierra Brava',
      channel: '713 Canal 13 HD',
      render: () => (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-t from-[#1b3318] via-[#2d5024] to-[#456e36] p-3 flex flex-col justify-end select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-black/60 pointer-events-none"></div>
          <div className="absolute top-2 left-0 right-0 flex justify-center items-center gap-1.5 opacity-95">
            <div className="w-7 h-7 rounded-full bg-emerald-800/90 border border-white/40 flex items-center justify-center text-white text-[10px] font-bold">
              13
            </div>
            <span className="text-[9px] font-bold text-amber-200 tracking-wider uppercase">REALITY SHOW</span>
          </div>
          <div className="z-10 bg-amber-900/95 border-2 border-amber-600/80 p-2  shadow-xl text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-sm">🤠</span>
              <h4 className="text-xs font-black text-amber-100 tracking-wider uppercase drop-shadow">
                TIERRA BRAVA
              </h4>
            </div>
            <p className="text-[8px] font-bold text-amber-300 uppercase tracking-widest mt-0.5">
              COSECHAS LO QUE SIEMBRAS
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'chv-noticias',
      type: 'news',
      title: 'CHV Noticias Central',
      channel: '711 Chilevisión HD',
      render: () => (
        <div className="w-full h-full relative overflow-hidden bg-[#004289] p-3.5 flex flex-col justify-between items-center text-center select-none">
          <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="w-full flex justify-between items-center text-[9px] text-blue-200 font-bold">
            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded font-black text-[8px] animate-pulse">EN VIVO</span>
            <span>711 HD</span>
          </div>
          <div className="my-auto flex flex-col items-center">
            <span className="text-3xl font-black text-white tracking-tighter drop-shadow-md">
              CHV
            </span>
            <div className="bg-[#e50914] text-white px-2.5 py-0.5 rounded font-black text-[9px] tracking-widest uppercase mt-0.5 shadow-md">
              NOTICIAS CENTRAL
            </div>
          </div>
          <span className="text-[9px] text-blue-200 font-medium">Edición Central</span>
        </div>
      )
    },
    {
      id: 'mega-ficcion',
      type: 'novel',
      title: 'El Señor de la Querencia',
      channel: '709 Mega HD',
      render: () => (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-t from-black via-[#3a1515] to-[#7f1d1d] p-3 flex flex-col justify-between select-none">
          <div className="flex justify-between items-center text-[9px] text-amber-200">
            <span className="font-extrabold text-white bg-red-700 px-1.5 py-0.5 rounded">MEGA</span>
            <span>22:45 HRS</span>
          </div>
          <div className="my-auto text-center">
            <span className="text-lg">🔥</span>
            <h4 className="text-xs font-black text-white uppercase tracking-tight mt-0.5">
              EL SEÑOR DE LA QUERENCIA
            </h4>
            <p className="text-[9px] text-red-300 font-semibold">Telenovela Nocturna</p>
          </div>
          <div className="text-[8px] text-gray-300 text-center font-medium">
            Exclusivo Mega HD
          </div>
        </div>
      )
    },
    {
      id: 'tnt-sports',
      type: 'sports',
      title: 'TNT Sports Chile',
      channel: '721 TNT Sports HD',
      render: () => (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-black via-[#111] to-[#002f3a] p-3 flex flex-col justify-between select-none border-b-2 border-cyan-400">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-cyan-400 tracking-widest uppercase">ESTADIO</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          </div>
          <div className="my-auto text-center">
            <div className="inline-block bg-white text-black font-black px-2.5 py-0.5 rounded text-sm tracking-tighter shadow">
              TNT <span className="text-cyan-600">SPORTS</span>
            </div>
            <p className="text-[10px] text-white font-bold mt-1.5 uppercase tracking-wide">
              SUPERCLÁSICO EN VIVO
            </p>
          </div>
          <span className="text-[8px] text-gray-400 text-center">Colo-Colo vs U. de Chile</span>
        </div>
      )
    }
  ]

  const inicioCarouselLen =
    activeTab === 'APPS Y JUEGOS'
      ? APPS_LIST.length
      : activeTab === 'VER TV'
        ? VER_TV_CHANNELS.length
        : activeTab === 'MIS PROGRAMAS' || activeTab === 'QUÉ VER' || activeTab === 'GUÍA'
          ? MIS_PROGRAMAS_LIST.length
          : contentCards.length

  // Settings list for Image 2 (MENÚ / AJUSTES)
  const settingsOptions = [
    {
      id: 'accesibilidad',
      label: 'Accesibilidad',
      desc: 'Subtítulos (CC), audiodescripción para personas con discapacidad visual y alto contraste.',
      detail: {
        title: 'Opciones de Accesibilidad',
        items: [
          { name: 'Subtítulos ocultos (CC)', val: 'Desactivado' },
          { name: 'Idioma de subtítulos preferido', val: 'Español (Latinoamérica)' },
          { name: 'Audiodescripción (SAP)', val: 'Desactivado' },
          { name: 'Texto de alto contraste', val: 'Activado' }
        ]
      }
    },
    {
      id: 'onepass',
      label: 'OnePass',
      desc: 'Configura tus grabaciones inteligentes TiVo OnePass. Graba temporadas completas sin repeticiones.',
      detail: {
        title: 'Gestor TiVo OnePass®',
        items: [
          { name: 'Series programadas', val: '5 programas' },
          { name: 'Opciones de grabación', val: 'Solo episodios nuevos' },
          { name: 'Espacio en Cloud DVR', val: '72 hrs disponibles de 100 hrs' },
          { name: 'Guardar hasta', val: 'Hasta que se necesite espacio' }
        ]
      }
    },
    {
      id: 'tareas',
      label: 'Lista de tareas',
      desc: 'Visualiza las grabaciones programadas, conflictos de horario y el historial de descargas.',
      detail: {
        title: 'Lista de Tareas y Grabaciones',
        items: [
          { name: 'Hoy 22:30', val: 'CHV Noticias Central (Grabación programada)' },
          { name: 'Mañana 15:00', val: 'Copa Libertadores (Grabación programada)' },
          { name: 'Conflictos de sintonizador', val: 'Ninguno' }
        ]
      }
    },
    {
      id: 'preferencias',
      label: 'Preferencias de usuario',
      desc: 'Personaliza los canales favoritos, la pantalla de inicio, temas y el orden de la grilla de canales.',
      detail: {
        title: 'Preferencias de Usuario',
        items: [
          { name: 'Canales favoritos', val: '12 señales seleccionadas' },
          { name: 'Paso directo a pantalla completa', val: 'Activado' },
          { name: 'Miniatura de video en menús', val: 'Activado (PIP Superior Derecho)' }
        ]
      }
    },
    {
      id: 'control-parental',
      label: 'Control parental y compras',
      desc: 'Protege contenidos para adultos, bloquea compras de paquetes Pay-Per-View y canales por edad.',
      detail: {
        title: 'Control Parental y PIN de Compras',
        items: [
          { name: 'Estado del bloqueo', val: 'Activado (PIN requerido)' },
          { name: 'Clasificación de edad máxima', val: 'Mayores de 14 años' },
          { name: 'Bloqueo canales para adultos', val: 'Bloqueado (Dial 800+)' },
          { name: 'PIN de compra para VOD', val: 'Requerido siempre' }
        ]
      }
    },
    {
      id: 'audio-video',
      label: 'Ajustes de audio y video',
      desc: 'Configura la salida HDMI 4K UHD, HDR10+, Dolby Audio 5.1 y sincronización labial A/V.',
      detail: {
        title: 'Ajustes de Pantalla y Sonido',
        items: [
          { name: 'Resolución de video', val: '4K Ultra HD (3840x2160 @ 60Hz)' },
          { name: 'Formato de pantalla', val: '16:9 Panorámico Pantalla Completa' },
          { name: 'Formato de audio HDMI', val: 'Dolby Digital Plus (Pass-through)' },
          { name: 'Control HDMI-CEC (One-Touch)', val: 'Activado (Enciende y apaga la TV)' }
        ]
      }
    },
    {
      id: 'control-remoto',
      label: 'Configuración del control remoto',
      desc: 'Empareja tu control remoto VTR por Bluetooth, programa el volumen de tu TV y activa el micrófono por voz.',
      detail: {
        title: 'Control Remoto VTR Bluetooth',
        items: [
          { name: 'Control emparejado', val: 'VTR Remote RC-419 (Batería 92%)' },
          { name: 'Marca de TV vinculada', val: 'Samsung Smart TV (Control de volumen y encendido)' },
          { name: 'Comando por voz (Google Assistant)', val: 'Conectado' },
          { name: 'Actualización de firmware del control', val: 'Actualizado a la última versión' }
        ]
      }
    },
    {
      id: 'dispositivo',
      label: 'Configuración del dispositivo',
      desc: 'Ajustes de Android TV 11 / Evo Fuse 4K: Conexión WiFi, Bluetooth, Cuentas, Almacenamiento y Sistema.',
      isAndroidSettingsOpener: true,
      detail: {
        title: 'D-Box Smart VTR (Evo Fuse 4K / TiVo)',
        items: [
          { name: 'Modelo de Decodificador', val: 'Evolution Digital Evo Fuse 4K / SDMC' },
          { name: 'Red Wi-Fi Conectada', val: 'VTR_FIBRA_5G_B92 (-46 dBm Excelente)' },
          { name: 'Dirección IP / MAC', val: '192.168.1.108 / 44:D8:78:E1:92:2C' },
          { name: 'Versión del Sistema VTR TV', val: 'Android TV 11 (TiVo NextGen v2026.4)' }
        ]
      }
    }
  ]

  // Submenú de "Configuración del control remoto" (Ajustes TiVo)
  const REMOTE_CONTROL_OPTIONS = [
    {
      id: 'enlazar-dbox',
      label: 'Enlace su control remoto a su d-BOX Smart',
      desc: 'Empareja el control VTR por Bluetooth con el decodificador.',
      icon: <Bluetooth size={16} />
    },
    {
      id: 'programacion',
      label: 'Programación del control remoto',
      desc: 'Configure los controles de energía, de entrada y de volumen de su control remoto TiVo para controlar su recibidor de TV/AV.',
      icon: <SettingsIcon size={16} />
    },
    {
      id: 'diagnosticos',
      label: 'Diagnósticos de control remoto',
      desc: 'Verifica el estado, la batería y la señal del control remoto.',
      icon: <Cpu size={16} />
    }
  ]

  // Opciones de "Programación del control remoto" (TiVo Remote)
  const TIVO_REMOTE_OPTIONS = [
    {
      id: 'reset',
      label: 'Restablecer el control remoto',
      icon: <RefreshCw size={16} />,
      action: () => showChannelBanner('CONTROL REMOTO', 'Restablecer', 'Restableciendo el control remoto...')
    },
    {
      id: 'tv',
      label: 'Cambie la configuración del Televisor',
      sub: 'VIZIO',
      icon: <Tv size={16} />,
      action: () => showChannelBanner('CONTROL REMOTO', 'Televisor', 'Configurando el control para VIZIO...')
    },
    {
      id: 'audio',
      label: 'Cambie la configuración del audio',
      sub: 'Not Set up',
      icon: <Volume2 size={16} />,
      action: () => {
        setAudioConfirmOpen(false)
        setAudioBrandOpen(false)
        setAudioSearchOpen(true)
      }
    },
    {
      id: 'volumen',
      label: 'Cambie el control de volumen',
      sub: 'El Control Remoto controla el volumen del Televisor',
      icon: <Volume2 size={16} />,
      action: () => showChannelBanner('CONTROL REMOTO', 'Volumen', 'Ajustando el control de volumen...')
    },
    {
      id: 'desvincular',
      label: 'Desvincular',
      icon: <Lock size={16} />,
      action: () => showChannelBanner('CONTROL REMOTO', 'Desvincular', 'Control remoto desvinculado')
    },
    {
      id: 'bateria',
      label: 'Batería',
      value: '20%',
      icon: <BatteryMedium size={16} />
    },
    {
      id: 'version',
      label: 'Versión',
      value: '7025.11.00',
      icon: <Info size={16} />
    }
  ]

  // Opciones de "Preferencias de usuario" (Ajustes TiVo)
  const USER_PREFERENCES_OPTIONS = [
    { id: 'video-providers', label: 'Mis proveedores de video', desc: 'Seleccione los servicios de video que desea mostrar.' },
    { id: 'recommendations', label: 'Recomendaciones personalizadas', desc: 'Sugerencias personalizadas basadas en su historial de visualización.', toggle: true },
    { id: 'favorite-channels', label: 'Canales favoritos', desc: 'Administre su lista de canales favoritos.' },
    { id: 'onepass-recording', label: 'Opciones de OnePass y grabación', desc: 'Configure las opciones de grabación OnePass.' },
    { id: 'myshows-options', label: 'Opciones de My Shows', desc: 'Configure las opciones de la lista My Shows.' },
    { id: 'autoplay-next', label: 'Reproducir siguiente episodio automáticamente', desc: 'Reproducir automáticamente el siguiente episodio.' },
    { id: 'video-window', label: 'Ventana de video y fondo', desc: 'Configure la ventana de video y el fondo.' },
    { id: 'thuuz', label: 'Calificación deportiva Thuuz', desc: 'Calificación deportiva Thuuz en vivo.' },
    { id: 'multiview', label: 'Opciones de MultiView', desc: 'Configure las opciones de MultiView.' }
  ]

  // Opciones de "Control parental y compras" (Ajustes TiVo)
  const PARENTAL_CONTROL_OPTIONS = [
    { id: 'controles', label: 'Controles parentales', value: 'Activado. Desbloqueado', desc: 'Estado general de los controles parentales.' },
    { id: 'ocultar-adultos', label: 'Ocultar contenido para adultos', value: '[Todo permitido]', desc: 'Oculte o muestre el contenido para adultos.' },
    { id: 'limites', label: 'Establecer límites de clasificación', value: '[Todo desbloqueado]', desc: 'Defina la clasificación máxima permitida.' },
    { id: 'bloquear-canales', label: 'Bloquear canales', desc: 'Bloquee canales específicos con su PIN.' },
    { id: 'cambiar-pin', label: 'Cambiar PIN', desc: 'Cambie el PIN de 4 dígitos de control parental.' },
    { id: 'desactivar', label: 'Desactivar controles parentales', desc: 'Desactive temporalmente todos los controles parentales.' }
  ]

  // Opciones de "Sistema y cuenta" (Ajustes TiVo)
  const SYSTEM_ACCOUNT_OPTIONS = [
    {
      id: 'solucion-problemas',
      label: 'Solución de problemas',
      desc: 'Diagnostique y resuelva problemas de conexión, imagen o sonido de su D-Box.',
      detail: {
        items: [
          { name: 'Conectividad IP', val: 'Online (12ms)' },
          { name: 'Reiniciar decodificador', val: 'Disponible' },
          { name: 'Verificación de red', val: 'Sin errores' },
          { name: 'Última prueba', val: 'Hoy 20:15' }
        ]
      }
    },
    {
      id: 'sugerencias',
      label: 'Sugerencias y trucos',
      desc: 'Consejos para aprovechar al máximo su experiencia VTR TiVo.',
      detail: {
        items: [
          { name: 'Búsqueda por voz', val: 'Botón micrófono del control' },
          { name: 'OnePass', val: 'Graba series completas sin repeticiones' },
          { name: 'MultiView', val: 'Mira 4 canales a la vez' },
          { name: 'Atajos', val: 'Mantén Back para reiniciar' }
        ]
      }
    },
    {
      id: 'info-cuenta-sistema',
      label: 'Información de la cuenta y del sistema',
      desc: 'Datos del titular, plan contratado y versión del sistema.',
      detail: {
        items: [
          { name: 'RUT Titular', val: '18.452.912-K' },
          { name: 'Plan Contratado', val: 'VTR Fibra 500 Megas + TV Plus' },
          { name: 'Estado de la Cuenta', val: 'Al Día (Sin Deuda)' },
          { name: 'Modelo', val: 'Evo Fuse 4K / TiVo NextGen' },
          { name: 'Versión del Sistema', val: 'Android TV 11 (v2026.4)' }
        ]
      }
    }
  ]

  // Pestañas del menú principal (Ajustes de TV)
  const MENU_TABS = ['GESTIONAR', 'AJUSTES', 'SISTEMA Y CUENTA']

  // Opciones de "Gestionar" (Ajustes TiVo)
  const MANAGE_OPTIONS = [
    {
      id: 'tareas-pendientes',
      label: 'Lista de tareas pendientes',
      desc: 'Revise las grabaciones y descargas programadas.',
      detail: {
        items: [
          { name: 'Hoy 22:30', val: 'CHV Noticias Central' },
          { name: 'Mañana 15:00', val: 'Copa Libertadores' },
          { name: 'Conflictos', val: 'Ninguno' }
        ]
      }
    },
    {
      id: 'admin-onepass',
      label: 'Administrador OnePass',
      desc: 'Gestione sus grabaciones inteligentes OnePass.',
      detail: {
        items: [
          { name: 'Series programadas', val: '5 programas' },
          { name: 'Opciones de grabación', val: 'Solo episodios nuevos' },
          { name: 'Espacio en Cloud DVR', val: '72 hrs de 100 hrs' }
        ]
      }
    },
    {
      id: 'actividad-grabacion',
      label: 'Actividad de grabación',
      desc: 'Historial reciente de grabaciones del equipo.',
      detail: {
        items: [
          { name: 'Grabaciones completadas', val: '128' },
          { name: 'Última grabación', val: 'Hoy 20:00' },
          { name: 'En curso', val: '1 programa' }
        ]
      }
    },
    {
      id: 'grabacion-manual',
      label: 'Grabación manual',
      desc: 'Programe una grabación manual indicando canal y horario.',
      detail: {
        items: [
          { name: 'Canal', val: 'Por seleccionar' },
          { name: 'Inicio', val: '--:--' },
          { name: 'Duración', val: '60 min' }
        ]
      }
    }
  ]

  // Marcas de receptor de audio (TiVo Remote)
  const AUDIO_RECEIVER_BRANDS = [
    'Bose',
    'Denon',
    'JBL',
    'LG',
    'Onkyo',
    'Panasonic',
    'Philips',
    'Pioneer',
    'Samsung',
    'Sharp',
    'Sony',
    'TCL',
    'Toshiba',
    'Vizio',
    'Yamaha'
  ]

  // Secciones de Ajustes de Android TV (menú lateral)
  const ANDROID_SETTINGS_SECTIONS = [
    {
      id: 'wifi',
      label: 'Redes e Internet',
      sub: connectedWifi || 'Sin conexión',
      titulo: 'Redes e Internet',
      descripcion: 'Conecta el decodificador a una red Wi-Fi y administra las redes guardadas.',
      icon: <Wifi size={16} />
    },
    {
      id: 'cuentas',
      label: 'Cuentas e inicio de sesión',
      sub: 'Google / VTR Smart ID',
      titulo: 'Cuentas e inicio de sesión',
      descripcion: 'Cuentas activas del decodificador y acceso a servicios VTR.',
      icon: <User size={16} />
    },
    {
      id: 'apps',
      label: 'Aplicaciones',
      sub: `${installedApps.length} instaladas`,
      titulo: 'Aplicaciones',
      descripcion: 'Aplicaciones instaladas en el decodificador.',
      icon: <Layers size={16} />
    },
    {
      id: 'sistema',
      label: 'Preferencias del Dispositivo',
      sub: 'Info, sonido y reinicio',
      titulo: 'Preferencias del Dispositivo',
      descripcion: 'Información del dispositivo, actualizaciones y reinicio del decodificador.',
      icon: <Info size={16} />
    },
    {
      id: 'bluetooth',
      label: 'Mandos y accesorios',
      sub: bluetoothEnabled ? 'Control VTR conectado' : 'Desactivado',
      titulo: 'Mandos y accesorios',
      descripcion: 'Vincula el control remoto y los accesorios inalámbricos del D-Box.',
      icon: <Bluetooth size={16} />
    }
  ]

  const seccionAndroidActual =
    ANDROID_SETTINGS_SECTIONS.find(s => s.id === androidSettingsSection) || ANDROID_SETTINGS_SECTIONS[0]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      if (pinModalOpen && /^[0-9]$/.test(e.key)) {
        e.preventDefault()
        handlePinDigit(e.key)
        return
      }

      if (pinModalOpen && e.key === 'Backspace') {
        e.preventDefault()
        handlePinDelete()
        return
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (currentView === 'inicio') {
          if (focusArea === 'carousel') {
            const listLen = inicioCarouselLen
            setSelectedCardIndex((prev) => (prev + 1) % listLen)
          } else if (focusArea === 'tabs') {
            const tabs = ['VER TV', 'MIS PROGRAMAS', 'QUÉ VER', 'GUÍA', 'APPS Y JUEGOS', 'NIÑOS']
            const currentIndex = tabs.indexOf(activeTab)
            const nextIndex = (currentIndex + 1) % tabs.length
            setActiveTab(tabs[nextIndex])
            setSelectedCardIndex(0)
            if (tabs[nextIndex] === 'GUÍA') {
              setCurrentView('guia')
            } else {
              setCurrentView('inicio')
            }
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentView === 'inicio') {
          if (focusArea === 'carousel') {
            const listLen = inicioCarouselLen
            setSelectedCardIndex((prev) => (prev - 1 + listLen) % listLen)
          } else if (focusArea === 'tabs') {
            const tabs = ['VER TV', 'MIS PROGRAMAS', 'QUÉ VER', 'GUÍA', 'APPS Y JUEGOS', 'NIÑOS']
            const currentIndex = tabs.indexOf(activeTab)
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
            setActiveTab(tabs[prevIndex])
            setSelectedCardIndex(0)
            if (tabs[prevIndex] === 'GUÍA') {
              setCurrentView('guia')
            } else {
              setCurrentView('inicio')
            }
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (currentView === 'inicio' && focusArea === 'carousel') {
          setFocusArea('tabs')
        } else if (currentView === 'menu') {
          setSelectedSettingIndex((prev) => (prev + 1) % settingsOptions.length)
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (currentView === 'inicio' && focusArea === 'tabs') {
          setFocusArea('carousel')
        } else if (currentView === 'menu') {
          setSelectedSettingIndex((prev) => (prev - 1 + settingsOptions.length) % settingsOptions.length)
        }
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (currentView === 'inicio') {
          if (focusArea === 'tabs' && activeTab === 'APPS Y JUEGOS') {
            setCurrentView('apps')
          } else if (activeTab === 'APPS Y JUEGOS') {
            const app = APPS_LIST[selectedCardIndex % APPS_LIST.length]
            showChannelBanner('APP', app.name, 'Iniciando aplicación en D-Box...')
          } else if (activeTab === 'VER TV') {
            tuneToVerTvChannel(selectedCardIndex)
          } else {
            tuneToCard(selectedCardIndex)
          }
        } else if (currentView === 'menu') {
          handleSelectSetting(selectedSettingIndex)
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault()
        if (currentView === 'playstore') {
          setCurrentView('inicio')
          setFocusArea('carousel')
        } else if (remoteProgrammingOpen) {
          setRemoteProgrammingOpen(false)
        } else if (talkbackModalOpen) {
          setTalkbackModalOpen(false)
        } else if (audioSearchOpen) {
          setAudioConfirmOpen(false)
          setAudioBrandOpen(false)
          setAudioSearchOpen(false)
        } else if (appsSubSection) {
          setAppsSubSection(null)
        } else if (systemSubSection) {
          setSystemSubSection(null)
        } else if (appPermsOpen) {
          setAppPermsOpen(false)
        } else if (appInfoId) {
          setAppInfoId(null)
        } else if (androidSettingsDrawerOpen) {
          if (androidSettingsSection !== 'main') setAndroidSettingsSection('main')
          else setAndroidSettingsDrawerOpen(false)
        } else if (pinModalOpen) {
          setPinModalOpen(false)
        } else if (selectedSettingDetail) {
          setSelectedSettingDetail(null)
        } else if (currentView !== 'inicio') {
          setCurrentView('inicio')
          setFocusArea('carousel')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, activeTab, selectedCardIndex, selectedSettingIndex, selectedSettingDetail, inicioCarouselLen, settingsOptions, androidSettingsDrawerOpen, androidSettingsSection, pinModalOpen, appInfoId, appPermsOpen, systemSubSection, appsSubSection, remoteProgrammingOpen, talkbackModalOpen, audioSearchOpen, audioConfirmOpen, audioBrandOpen])

  // Scroll active card into view
  useEffect(() => {
    if (carouselRef.current && carouselRef.current.children[selectedCardIndex]) {
      carouselRef.current.children[selectedCardIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      })
    }
  }, [selectedCardIndex])

  const handleSelectSetting = (idx) => {
    const opt = settingsOptions[idx]
    if (opt.id === 'dispositivo' || opt.id === 'control-parental') {
      setPinTarget(opt.id)
      setPinModalOpen(true)
      setPinInput('')
      setPinError(false)
    } else {
      setSelectedSettingDetail(opt)
    }
  }

  const tuneToVerTvChannel = (index) => {
    const ch = VER_TV_CHANNELS[index]
    if (!ch) return
    setCurrentChannel({
      num: ch.num,
      name: ch.name,
      prog: ch.prog,
      category: ch.category,
      time: ch.time,
      synopsis: `Transmisión en vivo de ${ch.name} por VTR D-Box.`
    })
  }

  const tuneToCard = (index) => {
    const card = contentCards[index]
    if (card.channel) {
      const [num, ...nameArr] = card.channel.split(' ')
      const chName = nameArr.join(' ')
      setCurrentChannel({
        num,
        name: chName,
        prog: card.title,
        category: card.type === 'sports' ? 'Deportes HD' : 'Nacional HD',
        time: 'En Transmisión',
        synopsis: `Sintonizando señal en vivo de ${chName} a través del D-Box Android TV de VTR.`
      })
      showChannelBanner(num, chName, card.title)
    } else {
      showChannelBanner('VOD', 'VTR Streaming', card.title)
    }
  }

  const showChannelBanner = (num, name, prog) => {
    setChannelToast({ num, name, prog })
    setTimeout(() => {
      setChannelToast(null)
    }, 4500)
  }

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsBrowserFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsBrowserFullscreen(false)
    }
  }

  // Connect to WiFi handler (Featured in YouTube video W6kYAqFtdMQ)
  const handleConnectWifi = (e) => {
    e?.preventDefault()
    setIsConnectingWifi(true)
    setTimeout(() => {
      setIsConnectingWifi(false)
      setConnectedWifi(selectedWifiToConnect.ssid)
      setWifiNetworks(prev => prev.map(w => ({
        ...w,
        connected: w.ssid === selectedWifiToConnect.ssid
      })))
      setSelectedWifiToConnect(null)
      setWifiPassword('')
      showChannelBanner('WIFI', 'Red Conectada', `Conectado a ${selectedWifiToConnect.ssid}`)
    }, 1800)
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex-1 bg-[#07090e] text-white flex flex-col justify-between overflow-hidden select-none font-sans relative"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 35%, #181e29 0%, #0c1017 65%, #05070a 100%)`
      }}
    >
      {/* ========================================================= */}
      {/* AMBIENT BACKGROUND & ACOUSTIC SOUNDBAR ART (Matching Photo 1) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 z-10"></div>

          {/* Large Speaker cones matching photo 1 */}
          <div className="w-full h-full flex items-center justify-around px-16">
            <div className="w-72 h-72 rounded-full border-[12px] border-gray-600/30 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gray-800/80 border-6 border-gray-500/20 shadow-2xl"></div>
            </div>
            <div className="w-88 h-88 rounded-full border-[14px] border-gray-600/30 flex items-center justify-center">
              <div className="w-52 h-52 rounded-full bg-gray-800/80 border-8 border-gray-500/20 shadow-2xl"></div>
            </div>
            <div className="w-72 h-72 rounded-full border-[12px] border-gray-600/30 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-gray-800/80 border-6 border-gray-500/20 shadow-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TOP BAR (Header - Exactly matching Photos 1 & 2)          */}
      {/* ========================================================= */}
      <div className="relative z-30 flex items-center justify-between px-6 lg:px-12 py-4 lg:py-5 border-b border-white/5 bg-black/40 backdrop-blur-md">
        {/* Left: VTR Logo + Vertical Divider + Section Title */}
        <div className="flex items-center gap-4">
          <VtrLogo />
          <div className="h-5 w-[2px] bg-gray-500/80"></div>
          <h1 className="text-white text-base lg:text-xl font-light tracking-wide uppercase">
            {currentView === 'inicio'
              ? activeTab
              : currentView === 'menu'
              ? (selectedSettingDetail?.id === 'control-remoto'
                  ? 'CONFIGURACIÓN DEL CONTROL REMOTO'
                  : selectedSettingDetail?.id === 'preferencias'
                  ? 'PREFERENCIAS DE USUARIO'
                  : selectedSettingDetail?.id === 'control-parental'
                  ? 'CONTROL PARENTAL Y COMPRAS'
                  : 'MENÚ')
              : currentView === 'apps'
              ? 'APPS Y JUEGOS'
              : 'EN VIVO'}
          </h1>
        </div>

        {/* Right: Digital Clock in Glowing Cyan + Controls */}
        <div className="flex items-center gap-4 lg:gap-6">
          <span className="text-cyan-400 font-normal text-lg lg:text-2xl tracking-normal drop-shadow-[0_0_10px_rgba(6,182,212,0.45)]">
            {currentTime || '12:31pm'}
          </span>

          <div className="h-4 w-[1px] bg-white/20"></div>

          {/* Quick Remote Toggle */}
          <button
            onClick={() => setShowRemote(!showRemote)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showRemote
                ? 'bg-amber-500 text-white border-amber-400'
                : 'bg-white/10 text-gray-200 border-white/20 hover:bg-white/20'
            }`}
            title="Control Remoto Virtual"
          >
            <Smartphone size={14} />
            <span className="hidden sm:inline">Control</span>
          </button>

          {/* Back button (in apps, guia, menu views) or Audio toggle */}
          {currentView === 'apps' || currentView === 'guia' || currentView === 'menu' ? (
            <button
              onClick={() => setCurrentView('inicio')}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer border border-white/15"
              title="Volver"
            >
              <ArrowLeft size={16} />
            </button>
          ) : null}
        </div>
      </div>


      {/* ========================================================= */}
      {/* VIEW: INICIO (PHOTO 1)                                    */}
      {/* ========================================================= */}
      {currentView === 'inicio' && (
        <div className="relative z-20 flex-1 flex flex-col justify-end pb-6 lg:pb-8">
          {/* Faint Center Watermark/Typography matching Screenshot 1 */}
          <div className="absolute top-[28%] left-0 right-0 text-center pointer-events-none select-none px-6">
            <p className="text-white/10 text-2xl lg:text-5xl font-light tracking-[0.25em] uppercase font-mono">
              {activeTab === 'APPS Y JUEGOS'
                ? 'APLICACIONES Y JUEGOS'
                : activeTab === 'VER TV'
                ? (VER_TV_CHANNELS[selectedCardIndex]?.name || 'VER TV')
                : activeTab === 'MIS PROGRAMAS' || activeTab === 'QUÉ VER' || activeTab === 'GUÍA'
                ? (MIS_PROGRAMAS_LIST[selectedCardIndex]?.name || activeTab)
                : selectedCardIndex === 0
                ? 'STREAMING INCLUIDO'
                : contentCards[selectedCardIndex]?.title || 'AMPLIFICADORES COMUNES'}
            </p>
            <p className="text-white/5 text-base lg:text-2xl font-light tracking-widest uppercase mt-1">
              {activeTab === 'APPS Y JUEGOS'
                ? 'GOOGLE PLAY STORE'
                : activeTab === 'VER TV'
                ? `CANAL ${VER_TV_CHANNELS[selectedCardIndex]?.num || ''}`
                : activeTab === 'MIS PROGRAMAS'
                ? 'TUS PROGRAMAS FAVORITOS'
                : activeTab === 'QUÉ VER'
                ? 'CONTENIDO RECOMENDADO'
                : activeTab === 'GUÍA'
                ? 'GUÍA DE PROGRAMACIÓN'
                : 'CARÍSIMO'}
            </p>
          </div>

          {/* Carrusel publicitario VTR (auto, sin controles) en el espacio entre el header y las franjas */}
          <div className="relative z-10 flex-1 w-full flex items-center justify-center px-2 lg:px-4 py-1 min-h-0">
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <div
                className="flex h-full w-full transition-transform duration-[900ms] ease-in-out"
                style={{ transform: `translateX(-${adBannerIndex * 100}%)` }}
              >
                {AD_BANNERS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Publicidad VTR ${i + 1}`}
                    className="w-full h-full shrink-0 object-cover select-none pointer-events-none"
                    draggable={false}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Category Ribbon / Horizontal Navigation Bar */}
          <div className="w-full mb-2 lg:mb-3">
            <div className="flex items-center gap-3 lg:gap-5 overflow-x-auto scrollbar-none py-2.5 px-6 lg:px-12 bg-black/60 backdrop-blur-md border-y border-white/10">
              {/* MENÚ button */}
              <button
                onClick={() => {
                  setCurrentView('menu')
                  setActiveMenuTab('AJUSTES')
                }}
                className="flex items-center gap-1.5 text-xs lg:text-sm uppercase tracking-wider font-semibold px-4 py-1.5 rounded transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                title="Menú Principal (Ajustes y Sistema)"
              >
                <MenuIcon size={16} />
                <span>MENÚ</span>
              </button>

              {/* Horizontal Tabs */}
              {['VER TV', 'MIS PROGRAMAS', 'QUÉ VER', 'GUÍA', 'APPS Y JUEGOS', 'NIÑOS'].map((tab) => {
                const isActive = activeTab === tab
                const isFocused = focusArea === 'tabs' && isActive
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab)
                      setSelectedCardIndex(0)
                      setFocusArea('tabs')
                      if (tab === 'GUÍA') {
                        setCurrentView('guia')
                      }
                    }}
                    className={`text-xs lg:text-sm uppercase tracking-wider font-semibold px-4 py-1.5 rounded transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-white border-1 border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="w-full px-6 lg:px-12 relative min-h-[140px] lg:min-h-[170px] flex flex-col justify-center">
            <div
              ref={carouselRef}
              className="flex items-center gap-3 lg:gap-5 overflow-x-auto scrollbar-none py-3 px-1"
            >
              {activeTab === 'APPS Y JUEGOS'
                ? /* APPS CAROUSEL - AJUSTADO AL CONTORNO DE LA IMAGEN */
                  APPS_LIST.map((app, index) => {
                    const isSelected = selectedCardIndex === index
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => {
                          setSelectedCardIndex(index)
                          setFocusArea('carousel')
                          if (app.id === 'playstore') {
                            setCurrentView('playstore')
                          } else {
                            showChannelBanner('APP', app.name, 'Abriendo aplicación en D-Box...')
                          }
                        }}
                        className={`h-32 lg:h-40 w-auto shrink-0 rounded-2xl overflow-hidden p-0 flex items-center justify-center cursor-pointer transition-all duration-150 bg-transparent border-0 focus:outline-none ${
                          isSelected
                            ? 'ring-1 ring-white shadow-[0_0_20px_rgba(255,255,255,0.4)] brightness-110'
                            : 'opacity-85 hover:opacity-100 hover:ring-1 hover:ring-white/60'
                        }`}
                        title={app.name}
                      >
                        <img
                          src={app.image}
                          alt={app.name}
                          className="h-full w-auto object-contain rounded-2xl drop-shadow select-none pointer-events-none"
                          draggable={false}
                        />
                      </button>
                    )
                  })
                : activeTab === 'VER TV'
                ? VER_TV_CHANNELS.map((ch, index) => {
                    const isSelected = selectedCardIndex === index
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setSelectedCardIndex(index)
                          setFocusArea('carousel')
                          tuneToVerTvChannel(index)
                        }}
                        className={`h-32 lg:h-40 w-auto shrink-0 rounded-2xl overflow-hidden p-0 flex items-center justify-center cursor-pointer transition-all duration-150 bg-transparent border-0 focus:outline-none ${
                          isSelected
                            ? 'ring-1 ring-white shadow-[0_0_20px_rgba(255,255,255,0.4)] brightness-110'
                            : 'opacity-85 hover:opacity-100 hover:ring-1 hover:ring-white/60'
                        }`}
                        title={`${ch.num} ${ch.name}`}
                      >
                        <img
                          src={ch.image}
                          alt={ch.name}
                          className="h-full w-auto object-contain rounded-2xl drop-shadow select-none pointer-events-none"
                          draggable={false}
                        />
                      </button>
                    )
                  })
                : activeTab === 'MIS PROGRAMAS' || activeTab === 'QUÉ VER' || activeTab === 'GUÍA'
                ? MIS_PROGRAMAS_LIST.map((prog, index) => {
                    const isSelected = selectedCardIndex === index
                    return (
                      <button
                        key={prog.id}
                        type="button"
                        onClick={() => {
                          setSelectedCardIndex(index)
                          setFocusArea('carousel')
                          showChannelBanner('PROGRAMA', prog.name, `Abriendo en ${activeTab}...`)
                        }}
                        className={`h-32 lg:h-40 w-auto shrink-0 rounded-2xl overflow-hidden p-0 flex items-center justify-center cursor-pointer transition-all duration-150 bg-transparent border-0 focus:outline-none ${
                          isSelected
                            ? 'ring-1 ring-white shadow-[0_0_20px_rgba(255,255,255,0.4)] brightness-110'
                            : 'opacity-85 hover:opacity-100 hover:ring-1 hover:ring-white/60'
                        }`}
                        title={prog.name}
                      >
                        <img
                          src={prog.image}
                          alt={prog.name}
                          className="h-full w-auto object-contain rounded-2xl drop-shadow select-none pointer-events-none"
                          draggable={false}
                        />
                      </button>
                    )
                  })
                : /* TV CONTENT CARDS CAROUSEL */
                  contentCards.map((card, index) => {
                    const isSelected = selectedCardIndex === index
                    return (
                      <div
                        key={card.id}
                        onClick={() => {
                          setSelectedCardIndex(index)
                          tuneToCard(index)
                        }}
                        className={`w-44 lg:w-56 h-30 lg:h-38 shrink-0  overflow-hidden cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'ring-1 ring-white shadow-[0_0_15px_rgba(255,255,255,0.3)] z-20 brightness-110'
                            : 'opacity-85 hover:opacity-100 ring-1 ring-white/15 hover:ring-white/40'
                        }`}
                      >
                        {card.render()}
                      </div>
                    )
                  })}
            </div>

            {/* Left / Right Carousel Controls */}
            <button
              onClick={() => {
                const listLen = inicioCarouselLen
                setSelectedCardIndex((prev) => (prev - 1 + listLen) % listLen)
              }}
              className="absolute left-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-black transition-all backdrop-blur-md cursor-pointer z-30 shadow-xl border border-white/10"
              title="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => {
                const listLen = inicioCarouselLen
                setSelectedCardIndex((prev) => (prev + 1) % listLen)
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 text-white/80 hover:text-white hover:bg-black transition-all backdrop-blur-md cursor-pointer z-30 shadow-xl border border-white/10"
              title="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW: MENÚ / AJUSTES (EXACT RECREATION OF PHOTO 2)        */}
      {/* ========================================================= */}
      {currentView === 'menu' && (
        <div className="relative z-20 flex-1 flex flex-col justify-end pb-6 lg:pb-8">
          {/* Franja de navegación (misma posición que MENÚ / VER TV en el Inicio) */}
          <div className="w-full mb-4 lg:mb-6">
            <div className="flex items-center gap-3 lg:gap-5 overflow-x-auto scrollbar-none py-2.5 px-6 lg:px-12 bg-black/60 backdrop-blur-md border-y border-white/10">
              {MENU_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMenuTab(tab)}
                  className={`text-xs lg:text-sm uppercase tracking-wider font-semibold px-4 py-1.5 rounded transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    activeMenuTab === tab
                      ? 'text-white border border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full px-6 lg:px-12 flex items-start gap-6">
              <div className="flex-1 min-w-0 flex flex-col">
              {/* Submenu content: AJUSTES vs SISTEMA Y CUENTA */}
              {activeMenuTab === 'GESTIONAR' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3 items-start flex-1 min-h-0">
                  <div className="space-y-1 overflow-y-auto pr-2 scrollbar-none max-h-[46vh]">
                    {MANAGE_OPTIONS.map((opt, idx) => {
                      const isSelected = selectedManageIndex === idx
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedManageIndex(idx)}
                          onMouseEnter={() => setSelectedManageIndex(idx)}
                          className={`px-4 py-2 cursor-pointer transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-white/20 text-white font-bold translate-x-2 border-l-4 border-cyan-400 shadow-lg'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-xs lg:text-sm tracking-wide">{opt.label}</span>
                          <ChevronRight
                            size={16}
                            className={`transition-transform ${
                              isSelected ? 'text-cyan-400 translate-x-1' : 'opacity-0 group-hover:opacity-100 text-gray-400'
                            }`}
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-black/60 border border-white/15 p-4 lg:p-5 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="p-1.5 bg-cyan-600/30 text-cyan-400">
                        <SettingsIcon size={18} />
                      </div>
                      <h3 className="text-sm lg:text-base font-bold text-white">
                        {MANAGE_OPTIONS[selectedManageIndex]?.label}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                      {MANAGE_OPTIONS[selectedManageIndex]?.desc}
                    </p>
                    <div className="space-y-2 border-t border-white/10 pt-3">
                      {MANAGE_OPTIONS[selectedManageIndex]?.detail.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                          <span className="text-gray-400">{item.name}</span>
                          <span className="text-white font-semibold text-right ml-3">{item.val}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => showChannelBanner('GESTIONAR', MANAGE_OPTIONS[selectedManageIndex]?.label, MANAGE_OPTIONS[selectedManageIndex]?.desc)}
                      className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              ) : activeMenuTab === 'AJUSTES' ? (
            selectedSettingDetail?.id === 'control-remoto' ? (
              <div className="mt-3 flex-1 min-h-0 flex flex-col">
                <button
                  onClick={() => setSelectedSettingDetail(null)}
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Volver a Ajustes</span>
                </button>
                <p className="text-xs lg:text-sm text-gray-300 mb-3 leading-relaxed">
                  Configure su control remoto TiVo para controlar su recibidor de TV/AV.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start flex-1 min-h-0">
                  <div className="space-y-1 overflow-y-auto pr-2 scrollbar-none max-h-[46vh]">
                    {REMOTE_CONTROL_OPTIONS.map((opt, idx) => {
                      const isSelected = selectedRemoteOptionIndex === idx
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedRemoteOptionIndex(idx)
                            if (opt.id === 'programacion') {
                              setRemoteProgrammingOpen(true)
                            } else {
                              showChannelBanner('CONTROL REMOTO', opt.label, opt.desc)
                            }
                          }}
                          onMouseEnter={() => setSelectedRemoteOptionIndex(idx)}
                          className={`px-4 py-2 cursor-pointer transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-white/20 text-white font-bold translate-x-2 border-l-4 border-cyan-400 shadow-lg'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-xs lg:text-sm tracking-wide">{opt.label}</span>
                          <ChevronRight
                            size={16}
                            className={`transition-transform ${
                              isSelected ? 'text-cyan-400 translate-x-1' : 'opacity-0 group-hover:opacity-100 text-gray-400'
                            }`}
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-black/60 border border-white/15 p-4 lg:p-5 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="p-1.5 bg-cyan-600/30 text-cyan-400">
                        <SettingsIcon size={18} />
                      </div>
                      <h3 className="text-sm lg:text-base font-bold text-white">
                        {REMOTE_CONTROL_OPTIONS[selectedRemoteOptionIndex]?.label}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                      {REMOTE_CONTROL_OPTIONS[selectedRemoteOptionIndex]?.desc}
                    </p>
                    <button
                      onClick={() => {
                        const opt = REMOTE_CONTROL_OPTIONS[selectedRemoteOptionIndex]
                        if (opt?.id === 'programacion') {
                          setRemoteProgrammingOpen(true)
                        } else if (opt) {
                          showChannelBanner('CONTROL REMOTO', opt.label, opt.desc)
                        }
                      }}
                      className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
                    >
                      <SettingsIcon size={14} />
                      <span>Configurar</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedSettingDetail?.id === 'preferencias' ? (
              <div className="mt-3 flex-1 min-h-0 flex flex-col">
                <button
                  onClick={() => setSelectedSettingDetail(null)}
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Volver a Ajustes</span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start flex-1 min-h-0">
                  <div className="space-y-1 overflow-y-auto pr-2 scrollbar-none max-h-[46vh]">
                    {USER_PREFERENCES_OPTIONS.map((opt, idx) => {
                      const isSelected = selectedUserPrefIndex === idx
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedUserPrefIndex(idx)
                            if (opt.toggle) {
                              setPersonalizedRecsOn(v => !v)
                            } else {
                              showChannelBanner('PREFERENCIAS', opt.label, opt.desc)
                            }
                          }}
                          onMouseEnter={() => setSelectedUserPrefIndex(idx)}
                          className={`px-4 py-2 cursor-pointer transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-white/20 text-white font-bold translate-x-2 border-l-4 border-cyan-400 shadow-lg'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-xs lg:text-sm tracking-wide">{opt.label}</span>
                          {opt.toggle ? (
                            <span className={`text-xs font-bold tracking-wide ${personalizedRecsOn ? 'text-cyan-400' : 'text-gray-500'}`}>
                              [{personalizedRecsOn ? 'Activado' : 'Desactivado'}]
                            </span>
                          ) : (
                            <ChevronRight
                              size={16}
                              className={`transition-transform ${
                                isSelected ? 'text-cyan-400 translate-x-1' : 'opacity-0 group-hover:opacity-100 text-gray-400'
                              }`}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-black/60 border border-white/15 p-4 lg:p-5 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="p-1.5 bg-cyan-600/30 text-cyan-400">
                        <SettingsIcon size={18} />
                      </div>
                      <h3 className="text-sm lg:text-base font-bold text-white">
                        {USER_PREFERENCES_OPTIONS[selectedUserPrefIndex]?.label}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {USER_PREFERENCES_OPTIONS[selectedUserPrefIndex]?.desc}
                    </p>
                    {USER_PREFERENCES_OPTIONS[selectedUserPrefIndex]?.toggle && (
                      <div className="flex justify-between items-center text-xs py-1 mt-3 border-t border-white/10 pt-3">
                        <span className="text-gray-400">Estado</span>
                        <span className="text-white font-semibold">[{personalizedRecsOn ? 'Activado' : 'Desactivado'}]</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedSettingDetail?.id === 'control-parental' ? (
              <div className="mt-3 flex-1 min-h-0 flex flex-col">
                <button
                  onClick={() => setSelectedSettingDetail(null)}
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 mb-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Volver a Ajustes</span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start flex-1 min-h-0">
                  <div className="space-y-1 overflow-y-auto pr-2 scrollbar-none max-h-[46vh]">
                    {PARENTAL_CONTROL_OPTIONS.map((opt, idx) => {
                      const isSelected = selectedParentalIndex === idx
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setSelectedParentalIndex(idx)
                            showChannelBanner('CONTROL PARENTAL', opt.label, opt.desc)
                          }}
                          onMouseEnter={() => setSelectedParentalIndex(idx)}
                          className={`px-4 py-2 cursor-pointer transition-all flex items-center justify-between group ${
                            isSelected
                              ? 'bg-white/20 text-white font-bold translate-x-2 border-l-4 border-cyan-400 shadow-lg'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-xs lg:text-sm tracking-wide">{opt.label}</span>
                          {opt.value ? (
                            <span className="text-[11px] text-gray-300 text-right ml-2 shrink-0">{opt.value}</span>
                          ) : (
                            <ChevronRight
                              size={16}
                              className={`transition-transform ${
                                isSelected ? 'text-cyan-400 translate-x-1' : 'opacity-0 group-hover:opacity-100 text-gray-400'
                              }`}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-black/60 border border-white/15 p-4 lg:p-5 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="p-1.5 bg-cyan-600/30 text-cyan-400">
                        <Lock size={18} />
                      </div>
                      <h3 className="text-sm lg:text-base font-bold text-white">
                        {PARENTAL_CONTROL_OPTIONS[selectedParentalIndex]?.label}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {PARENTAL_CONTROL_OPTIONS[selectedParentalIndex]?.desc}
                    </p>
                    {PARENTAL_CONTROL_OPTIONS[selectedParentalIndex]?.value && (
                      <div className="flex justify-between items-center text-xs py-1 mt-3 border-t border-white/10 pt-3">
                        <span className="text-gray-400">Estado</span>
                        <span className="text-white font-semibold">{PARENTAL_CONTROL_OPTIONS[selectedParentalIndex]?.value}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3 items-start flex-1 min-h-0">
              <div className="space-y-1 overflow-y-auto pr-2 scrollbar-none max-h-[46vh]">
                {settingsOptions.map((opt, idx) => {
                  const isSelected = selectedSettingIndex === idx
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSelectedSettingIndex(idx)
                        handleSelectSetting(idx)
                      }}
                      onMouseEnter={() => setSelectedSettingIndex(idx)}
                      className={`px-4 py-2  cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-white/20 text-white font-bold translate-x-2 border-l-4 border-cyan-400 shadow-lg'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xs lg:text-sm tracking-wide">{opt.label}</span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${
                          isSelected ? 'text-cyan-400 translate-x-1' : 'opacity-0 group-hover:opacity-100 text-gray-400'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Selected Setting Detail Preview Box */}
              <div className="bg-black/60 border border-white/15  p-4 lg:p-5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-1.5  bg-cyan-600/30 text-cyan-400">
                    <SettingsIcon size={18} />
                  </div>
                  <h3 className="text-sm lg:text-base font-bold text-white">
                    {settingsOptions[selectedSettingIndex]?.label}
                  </h3>
                </div>
                <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                  {settingsOptions[selectedSettingIndex]?.desc}
                </p>

                <div className="space-y-2 border-t border-white/10 pt-3">
                  {settingsOptions[selectedSettingIndex]?.detail.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                      <span className="text-gray-400">{item.name}</span>
                      <span className="text-white font-semibold">{item.val}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectSetting(selectedSettingIndex)}
                  className="mt-4 w-full py-2  bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  {settingsOptions[selectedSettingIndex]?.isAndroidSettingsOpener ? (
                    <>
                      <Wifi size={14} />
                      <span>Abrir Ajustes de Android TV (Wi-Fi)</span>
                    </>
                  ) : (
                    <span>Modificar Parámetro</span>
                  )}
                </button>
              </div>
            </div>
            )
          ) : (
            /* SISTEMA Y CUENTA TAB */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3 items-start flex-1 min-h-0">
              <div className="space-y-1 overflow-y-auto pr-2 scrollbar-none max-h-[46vh]">
                {SYSTEM_ACCOUNT_OPTIONS.map((opt, idx) => {
                  const isSelected = selectedSystemOptionIndex === idx
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedSystemOptionIndex(idx)}
                      onMouseEnter={() => setSelectedSystemOptionIndex(idx)}
                      className={`px-4 py-2 cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-white/20 text-white font-bold translate-x-2 border-l-4 border-cyan-400 shadow-lg'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xs lg:text-sm tracking-wide">{opt.label}</span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${
                          isSelected ? 'text-cyan-400 translate-x-1' : 'opacity-0 group-hover:opacity-100 text-gray-400'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="bg-black/60 border border-white/15 p-4 lg:p-5 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="p-1.5 bg-cyan-600/30 text-cyan-400">
                    <SettingsIcon size={18} />
                  </div>
                  <h3 className="text-sm lg:text-base font-bold text-white">
                    {SYSTEM_ACCOUNT_OPTIONS[selectedSystemOptionIndex]?.label}
                  </h3>
                </div>
                <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                  {SYSTEM_ACCOUNT_OPTIONS[selectedSystemOptionIndex]?.desc}
                </p>
                <div className="space-y-2 border-t border-white/10 pt-3">
                  {SYSTEM_ACCOUNT_OPTIONS[selectedSystemOptionIndex]?.detail.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                      <span className="text-gray-400">{item.name}</span>
                      <span className="text-white font-semibold text-right ml-3">{item.val}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => showChannelBanner('SISTEMA', SYSTEM_ACCOUNT_OPTIONS[selectedSystemOptionIndex]?.label, SYSTEM_ACCOUNT_OPTIONS[selectedSystemOptionIndex]?.desc)}
                  className="mt-4 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                >
                  Abrir
                </button>
              </div>
            </div>
          )}
              </div>
            </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW: GUÍA DE CANALES (EPG Full Screen)                   */}
      {/* ========================================================= */}
      {currentView === 'guia' && (
        <div className="relative z-20 flex-1 flex flex-col px-6 lg:px-12 py-4 overflow-hidden">


          {/* Current program details with preview */}
          <div className="bg-black/60 border border-white/10 p-4 mb-4 flex gap-4 shrink-0">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-white">{currentChannel.name}</span>
                <span className="text-cyan-400 text-sm font-semibold">#{currentChannel.num}</span>
                {currentChannel.num === '711' && (
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded">+18</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{currentChannel.prog}</h3>
              <p className="text-sm text-gray-300 mb-2">{currentChannel.synopsis}</p>
              <div className="text-xs text-gray-400 mb-2">
                <span className="font-semibold text-gray-300">Categoría:</span> {currentChannel.category || 'Entretenimiento'}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                <span className="font-semibold text-gray-300">Tipo:</span> Alta Definición • Audio Estéreo • Subtítulos CC
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{currentChannel.time}</span>
                {currentChannel.num === '711' && (
                  <span className="text-red-400 font-bold">No permite grabación</span>
                )}
              </div>
            </div>
            <div className="w-96 h-56 bg-black/80 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
              {currentChannel.num === '711' && (
                <img src="/chilevision.png" alt="Chilevisión" className="w-full h-full object-contain p-2" />
              )}
              {currentChannel.num === '854' && (
                <img src="/TNTSPORTSPREMIUM.png" alt="TNT Sports" className="w-full h-full object-contain p-2" />
              )}
              {currentChannel.num === '012' && (
                <img src="/CNETWORK.png" alt="Cartoon Network" className="w-full h-full object-contain p-2" />
              )}
              {(!currentChannel.num || !['711', '854', '012'].includes(currentChannel.num)) && (
                <div className="text-center p-2">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{currentChannel.num}</div>
                  <div className="text-xs text-gray-400">{currentChannel.name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Channel grid */}
          <div className="flex-1 overflow-y-auto overflow-x-auto pr-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="min-w-[800px]">
              {/* Table header */}
              <div className="grid grid-cols-6 gap-2 pb-2 border-b border-white/10 text-xs text-gray-400 font-semibold">
                <div className="text-center">Canal</div>
                <div className="text-center">Logo</div>
                <div>Nombre del Canal</div>
                <div>8:30pm</div>
                <div>9:00pm</div>
                <div>9:30pm</div>
              </div>
              {/* Table rows - VTR TV Plus Full 101 canales */}
              {[
                // Infantil y Familiar
                { num: '001', name: 'Portal VTR / Servicios', logo: 'VTR', prog830: 'Servicios', prog900: 'Servicios', prog930: 'Servicios', quality: 'SD' },
                { num: '007', name: 'Disney Junior', logo: 'DIS JR', prog830: 'Mickey Mouse', prog900: 'Mickey Mouse', prog930: 'Mickey Mouse', quality: 'SD' },
                { num: '008', name: 'Disney Channel', logo: 'DIS', prog830: 'Disney Jr', prog900: 'Disney Jr', prog930: 'Disney Jr', quality: 'SD' },
                { num: '009', name: 'Nickelodeon', logo: 'NICK', prog830: 'SpongeBob', prog900: 'SpongeBob', prog930: 'SpongeBob', quality: 'SD' },
                { num: '010', name: 'Discovery Kids', logo: 'DK', prog830: 'Paw Patrol', prog900: 'Paw Patrol', prog930: 'Paw Patrol', quality: 'SD' },
                { num: '011', name: 'Cartoonito', logo: 'TOON', prog830: 'Tom & Jerry', prog900: 'Tom & Jerry', prog930: 'Tom & Jerry', quality: 'SD' },
                { num: '012', name: 'Cartoon Network', logo: 'CN', prog830: 'CN Originals', prog900: 'CN Originals', prog930: 'CN Originals', quality: 'SD' },
                { num: '013', name: 'ETC TV', logo: 'ETC', prog830: 'Música', prog900: 'Música', prog930: 'Música', quality: 'SD' },
                // Nacional, Noticias y Música
                { num: '014', name: 'Canal 24 Horas', logo: '24H', prog830: 'Noticias', prog900: 'Noticias', prog930: 'Noticias', quality: 'SD' },
                { num: '015', name: 'CNN Chile', logo: 'CNN', prog830: 'CNN Chile', prog900: 'CNN Chile', prog930: 'CNN Chile', quality: 'SD' },
                { num: '016', name: 'Telecanal', logo: 'TC', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '017', name: 'La Red', logo: 'RED', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '018', name: 'TV+', logo: 'TV+', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '019', name: 'TVN', logo: 'TVN', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '020', name: 'Mega', logo: 'MEGA', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '021', name: 'Chilevisión', logo: 'CHV', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '022', name: 'Canal 13', logo: '13', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '023', name: 'Zona Latina', logo: 'ZL', prog830: 'Música', prog900: 'Música', prog930: 'Música', quality: 'SD' },
                { num: '024', name: 'Vía X', logo: 'VX', prog830: 'Música', prog900: 'Música', prog930: 'Música', quality: 'SD' },
                { num: '025', name: 'MTV Chile', logo: 'MTV', prog830: 'Música', prog900: 'Música', prog930: 'Música', quality: 'SD' },
                { num: '026', name: 'Mega 2', logo: 'MG2', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '027', name: '13C', logo: '13C', prog830: 'Noticias', prog900: 'Noticias', prog930: 'Noticias', quality: 'SD' },
                { num: '028', name: 'E! Entertainment', logo: 'E!', prog830: 'Entertainment', prog900: 'Entertainment', prog930: 'Entertainment', quality: 'SD' },
                { num: '029', name: 'Mega Ficción', logo: 'MF', prog830: 'Series', prog900: 'Series', prog930: 'Series', quality: 'SD' },
                { num: '044', name: 'Rec TV', logo: 'REC', prog830: 'Programas', prog900: 'Programas', prog930: 'Programas', quality: 'SD' },
                { num: '047', name: 'Agricultura TV', logo: 'AGRO', prog830: 'Agricultura', prog900: 'Agricultura', prog930: 'Agricultura', quality: 'SD' },
                { num: '049', name: 'ESPN (Básico)', logo: 'ESPN', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                // Deportes Base
                { num: '050', name: 'T13 En Vivo', logo: 'T13', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                { num: '150', name: 'ESPN', logo: 'ESPN', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                { num: '151', name: 'ESPN 2', logo: 'ESPN2', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                { num: '152', name: 'Teletrak TV', logo: 'TELE', prog830: 'Hípica', prog900: 'Hípica', prog930: 'Hípica', quality: 'SD' },
                { num: '153', name: 'ESPN 3', logo: 'ESPN3', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                { num: '154', name: 'ESPN 5', logo: 'ESPN5', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                { num: '155', name: 'ESPN 6', logo: 'ESPN6', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                { num: '156', name: 'GolTV', logo: 'GOL', prog830: 'Fútbol', prog900: 'Fútbol', prog930: 'Fútbol', quality: 'SD' },
                { num: '157', name: 'TyC Sports', logo: 'TYC', prog830: 'Fútbol', prog900: 'Fútbol', prog930: 'Fútbol', quality: 'SD' },
                { num: '159', name: 'CDO Básico', logo: 'CDO', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                { num: '164', name: 'L1 Max Básico', logo: 'L1', prog830: 'Deportes', prog900: 'Deportes', prog930: 'Deportes', quality: 'SD' },
                // Cine, Series y Variedades
                { num: '208', name: 'FX', logo: 'FX', prog830: 'Series', prog900: 'Series', prog930: 'Series', quality: 'SD' },
                { num: '210', name: 'TNT', logo: 'TNT', prog830: 'Películas', prog900: 'Películas', prog930: 'Películas', quality: 'SD' },
                { num: '212', name: 'Space', logo: 'SPACE', prog830: 'Series', prog900: 'Series', prog930: 'Series', quality: 'SD' },
                { num: '215', name: 'Cinecanal', logo: 'CC', prog830: 'Películas', prog900: 'Películas', prog930: 'Películas', quality: 'SD' },
                { num: '220', name: 'Universal Cinema', logo: 'UC', prog830: 'Películas', prog900: 'Películas', prog930: 'Películas', quality: 'SD' },
                { num: '221', name: 'Universal Comedy', logo: 'UCOM', prog830: 'Comedia', prog900: 'Comedia', prog930: 'Comedia', quality: 'SD' },
                { num: '222', name: 'Universal Reality', logo: 'UREAL', prog830: 'Reality', prog900: 'Reality', prog930: 'Reality', quality: 'SD' },
                { num: '230', name: 'Kanal D Drama', logo: 'KD', prog830: 'Series', prog900: 'Series', prog930: 'Series', quality: 'SD' },
                { num: '350', name: 'Discovery Channel', logo: 'DISC', prog830: 'Documentales', prog900: 'Documentales', prog930: 'Documentales', quality: 'SD' },
                { num: '352', name: 'Animal Planet', logo: 'AP', prog830: 'Animales', prog900: 'Animales', prog930: 'Animales', quality: 'SD' },
                { num: '355', name: 'Discovery Home & Health', logo: 'DHH', prog830: 'Hogar', prog900: 'Hogar', prog930: 'Hogar', quality: 'SD' },
                // Espejos HD (selección principal)
                { num: '705', name: 'TV+ HD', logo: 'TV+', prog830: 'Programas HD', prog900: 'Programas HD', prog930: 'Programas HD', quality: 'HD' },
                { num: '706', name: 'La Red HD', logo: 'RED', prog830: 'Programas HD', prog900: 'Programas HD', prog930: 'Programas HD', quality: 'HD' },
                { num: '707', name: 'TVN HD', logo: 'TVN', prog830: 'Programas HD', prog900: 'Programas HD', prog930: 'Programas HD', quality: 'HD' },
                { num: '709', name: 'Mega HD', logo: 'MEGA', prog830: 'Programas HD', prog900: 'Programas HD', prog930: 'Programas HD', quality: 'HD' },
                { num: '711', name: 'Chilevisión HD', logo: 'CHV', prog830: 'CHV Noticias central', prog900: 'CHV Noticias central', prog930: 'CHV Noticias central', quality: 'HD', selected: true },
                { num: '713', name: 'Canal 13 HD', logo: '13', prog830: 'Programas HD', prog900: 'Programas HD', prog930: 'Programas HD', quality: 'HD' },
                { num: '714', name: 'Canal 24 Horas HD', logo: '24H', prog830: 'Noticias HD', prog900: 'Noticias HD', prog930: 'Noticias HD', quality: 'HD' },
                { num: '715', name: 'CNN Chile HD', logo: 'CNN', prog830: 'CNN Chile HD', prog900: 'CNN Chile HD', prog930: 'CNN Chile HD', quality: 'HD' },
                { num: '716', name: 'Zona Latina HD', logo: 'ZL', prog830: 'Música HD', prog900: 'Música HD', prog930: 'Música HD', quality: 'HD' },
                { num: '717', name: 'Vía X HD', logo: 'VX', prog830: 'Música HD', prog900: 'Música HD', prog930: 'Música HD', quality: 'HD' },
                { num: '718', name: 'Cartoon Network HD', logo: 'CN', prog830: 'CN HD', prog900: 'CN HD', prog930: 'CN HD', quality: 'HD' },
                { num: '719', name: 'Nickelodeon HD', logo: 'NICK', prog830: 'Nick HD', prog900: 'Nick HD', prog930: 'Nick HD', quality: 'HD' },
                { num: '720', name: 'DreamWorks Channel HD', logo: 'DW', prog830: 'DreamWorks HD', prog900: 'DreamWorks HD', prog930: 'DreamWorks HD', quality: 'HD' },
                { num: '722', name: 'Disney Channel HD', logo: 'DIS', prog830: 'Disney HD', prog900: 'Disney HD', prog930: 'Disney HD', quality: 'HD' },
                { num: '723', name: 'Discovery Kids HD', logo: 'DK', prog830: 'DK HD', prog900: 'DK HD', prog930: 'DK HD', quality: 'HD' },
                { num: '725', name: 'Cartoonito HD', logo: 'TOON', prog830: 'Toon HD', prog900: 'Toon HD', prog930: 'Toon HD', quality: 'HD' },
                { num: '756', name: 'Docu HD', logo: 'DOC', prog830: 'Documentales HD', prog900: 'Documentales HD', prog930: 'Documentales HD', quality: 'HD' },
                { num: '771', name: 'TNT Novelas HD', logo: 'TNT', prog830: 'Novelas HD', prog900: 'Novelas HD', prog930: 'Novelas HD', quality: 'HD' },
                { num: '772', name: 'Golden Plus HD', logo: 'GOLD', prog830: 'Cine HD', prog900: 'Cine HD', prog930: 'Cine HD', quality: 'HD' },
                { num: '773', name: 'Atreseries HD', logo: 'ATRES', prog830: 'Series HD', prog900: 'Series HD', prog930: 'Series HD', quality: 'HD' },
                { num: '774', name: 'Atrescine HD', logo: 'ATRES', prog830: 'Cine HD', prog900: 'Cine HD', prog930: 'Cine HD', quality: 'HD' },
                { num: '780', name: 'Cinecanal HD', logo: 'CC', prog830: 'Cine HD', prog900: 'Cine HD', prog930: 'Cine HD', quality: 'HD' },
                { num: '781', name: 'TNT HD', logo: 'TNT', prog830: 'TNT HD', prog900: 'TNT HD', prog930: 'TNT HD', quality: 'HD' },
                { num: '782', name: 'Cinemax HD', logo: 'CMAX', prog830: 'Cine HD', prog900: 'Cine HD', prog930: 'Cine HD', quality: 'HD' },
                { num: '783', name: 'USA Network HD', logo: 'USA', prog830: 'Series HD', prog900: 'Series HD', prog930: 'Series HD', quality: 'HD' },
                { num: '784', name: 'AMC HD', logo: 'AMC', prog830: 'Series HD', prog900: 'Series HD', prog930: 'Series HD', quality: 'HD' },
                { num: '785', name: 'Space HD', logo: 'SPACE', prog830: 'Series HD', prog900: 'Series HD', prog930: 'Series HD', quality: 'HD' },
                { num: '787', name: 'Paramount Network HD', logo: 'PARA', prog830: 'Series HD', prog900: 'Series HD', prog930: 'Series HD', quality: 'HD' },
                { num: '788', name: 'Universal TV HD', logo: 'UTV', prog830: 'Series HD', prog900: 'Series HD', prog930: 'Series HD', quality: 'HD' },
                { num: '789', name: 'Studio Universal HD', logo: 'SU', prog830: 'Cine HD', prog900: 'Cine HD', prog930: 'Cine HD', quality: 'HD' },
                { num: '790', name: 'HBO HD', logo: 'HBO', prog830: 'HBO HD', prog900: 'HBO HD', prog930: 'HBO HD', quality: 'HD' },
                { num: '791', name: 'HBO Family HD', logo: 'HBO', prog830: 'HBO Fam HD', prog900: 'HBO Fam HD', prog930: 'HBO Fam HD', quality: 'HD' },
                { num: '792', name: 'HBO Mundi HD', logo: 'HBO', prog830: 'HBO Mundi HD', prog900: 'HBO Mundi HD', prog930: 'HBO Mundi HD', quality: 'HD' },
                { num: '793', name: 'HBO 2 HD', logo: 'HBO', prog830: 'HBO 2 HD', prog900: 'HBO 2 HD', prog930: 'HBO 2 HD', quality: 'HD' },
                { num: '794', name: 'HBO Signature HD', logo: 'HBO', prog830: 'HBO Sig HD', prog900: 'HBO Sig HD', prog930: 'HBO Sig HD', quality: 'HD' },
                { num: '795', name: 'HBO Plus HD', logo: 'HBO', prog830: 'HBO Plus HD', prog900: 'HBO Plus HD', prog930: 'HBO Plus HD', quality: 'HD' },
                { num: '796', name: 'HBO Xtreme HD', logo: 'HBO', prog830: 'HBO Xt HD', prog900: 'HBO Xt HD', prog930: 'HBO Xt HD', quality: 'HD' },
                { num: '797', name: 'HBO Pop HD', logo: 'HBO', prog830: 'HBO Pop HD', prog900: 'HBO Pop HD', prog930: 'HBO Pop HD', quality: 'HD' },
                { num: '840', name: 'ESPN 4 HD', logo: 'ESPN', prog830: 'ESPN 4 HD', prog900: 'ESPN 4 HD', prog930: 'ESPN 4 HD', quality: 'HD' },
                { num: '841', name: 'ESPN HD', logo: 'ESPN', prog830: 'ESPN HD', prog900: 'ESPN HD', prog930: 'ESPN HD', quality: 'HD' },
                { num: '842', name: 'ESPN 3 HD', logo: 'ESPN', prog830: 'ESPN 3 HD', prog900: 'ESPN 3 HD', prog930: 'ESPN 3 HD', quality: 'HD' },
                { num: '843', name: 'ESPN 2 HD', logo: 'ESPN', prog830: 'ESPN 2 HD', prog900: 'ESPN 2 HD', prog930: 'ESPN 2 HD', quality: 'HD' },
                { num: '844', name: 'Golf Channel HD', logo: 'GOLF', prog830: 'Golf HD', prog900: 'Golf HD', prog930: 'Golf HD', quality: 'HD' },
                { num: '845', name: 'GolTV HD', logo: 'GOL', prog830: 'GolTV HD', prog900: 'GolTV HD', prog930: 'GolTV HD', quality: 'HD' },
                { num: '846', name: 'TyC Sports HD', logo: 'TYC', prog830: 'TyC HD', prog900: 'TyC HD', prog930: 'TyC HD', quality: 'HD' },
                { num: '847', name: 'Teletrak TV HD', logo: 'TELE', prog830: 'Teletrak HD', prog900: 'Teletrak HD', prog930: 'Teletrak HD', quality: 'HD' },
                { num: '854', name: 'TNT Sports HD', logo: 'TNT', prog830: 'TNT Sports HD', prog900: 'TNT Sports HD', prog930: 'TNT Sports HD', quality: 'HD' },
                { num: '855', name: 'TNT Sports Premium HD', logo: 'TNT', prog830: 'TNT Prem HD', prog900: 'TNT Prem HD', prog930: 'TNT Prem HD', quality: 'HD' },
                { num: '859', name: 'ESPN 5 HD', logo: 'ESPN', prog830: 'ESPN 5 HD', prog900: 'ESPN 5 HD', prog930: 'ESPN 5 HD', quality: 'HD' }
              ].map((ch) => (
                <div
                  key={ch.num}
                  onClick={() => {
                    setCurrentChannel({
                      num: ch.num,
                      name: ch.name,
                      prog: ch.prog830,
                      category: 'Canal Nacional',
                      time: '8:30pm - 10:30pm',
                      synopsis: 'Programación en vivo de VTR'
                    })
                  }}
                  className={`grid grid-cols-6 gap-2 py-2 px-2 border border-white/5 transition-all cursor-pointer ${
                    ch.selected
                      ? 'bg-cyan-600/30 border-cyan-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-center text-xs font-bold text-cyan-400">
                    {ch.num} <span className="text-[9px] text-gray-400 ml-1">{ch.quality}</span>
                  </div>
                  <div className="text-center text-xs font-bold text-white">
                    {ch.logo}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {ch.name}
                  </div>
                  <div className="text-[10px] text-gray-300 truncate">
                    {ch.prog830}
                  </div>
                  <div className="text-[10px] text-gray-300 truncate">
                    {ch.prog900}
                  </div>
                  <div className="text-[10px] text-gray-300 truncate">
                    {ch.prog930}
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW: APPS Y JUEGOS (With Real Application Icons)         */}
      {/* ========================================================= */}
      {currentView === 'apps' && (
        <div className="relative z-20 flex-1 flex flex-col justify-between px-6 lg:px-12 py-5 lg:py-6">
          {/* Apps Grid with Real Official Icons */}
          <div className="flex-1 overflow-y-auto scrollbar-none max-h-[58vh]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8 py-2 px-4 justify-items-center">
              {APPS_LIST.map((app) => (
                <div
                  key={app.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (app.id === 'playstore') {
                      setCurrentView('playstore')
                    } else {
                      showChannelBanner('APP', app.name, 'Iniciando aplicación en D-Box...')
                    }
                  }}
                  className="cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <img
                    src={app.image}
                    alt={app.name}
                    className="w-[200px] lg:w-[240px] h-auto object-contain rounded-2xl drop-shadow select-none"
                    draggable={false}
                    title={app.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING ACTION TOAST NOTIFICATION                        */}
      {/* ========================================================= */}
      {channelToast && (
        <>
          {channelToast.num === 'VOLUMEN' ? (
            <div className="absolute left-12 top-1/4 z-50 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-left-3 duration-300">
              <Volume2 size={32} className="text-cyan-400" />
              <div className="h-32 w-4 bg-gray-800 rounded-full overflow-hidden relative">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full transition-all duration-300"
                  style={{ height: `${channelToast.prog}%` }}
                />
              </div>
              <p className="text-white text-sm font-bold">
                {channelToast.prog}
              </p>
            </div>
          ) : (
            <div className="absolute top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-2xl border-b-2 border-cyan-400/80 py-3 px-6 shadow-2xl flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
              <p className="text-white text-sm font-black uppercase tracking-widest">
                {channelToast.name}
              </p>
              <p className="text-cyan-300 text-xs font-semibold">
                {channelToast.prog}
              </p>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* FOOTER BAR (Exactly matching Photo 1 & 2)                 */}
      {/* ========================================================= */}
      <div className="relative z-30 flex items-center justify-between px-6 lg:px-12 py-3 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/5">
        {/* Bottom Left: Official TiVo Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="/tivo.png"
            alt="TiVo"
            className="h-5 lg:h-6 object-contain drop-shadow brightness-110"
            draggable={false}
          />
        </div>
      </div>

      {/* ========================================================= */}
{/* ========================================================= */}
      {/* ANDROID TV 11 / EVO FUSE 4K SETTINGS (Panel lateral derecho) */}
      {/* (Featured in YouTube video W6kYAqFtdMQ: Wi-Fi connection) */}
      {/* ========================================================= */}
      {androidSettingsDrawerOpen && (
        <div
          onClick={() => setAndroidSettingsDrawerOpen(false)}
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[420px] h-full bg-[#2d2d2d] border-l border-white/10 p-6 flex flex-col justify-between text-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto scrollbar-none"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  {(androidSettingsSection !== 'main' || systemSubSection) && (
                    <button
                      onClick={() => {
                        if (systemSubSection) {
                          setSystemSubSection(null)
                        } else {
                          setAndroidSettingsSection('main')
                        }
                      }}
                      className="p-1 rounded-full hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer mr-1"
                      title="Volver"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <h3 className="text-base font-bold text-white">
                    {systemSubSection
                      ? (() => {
                          const labels = {
                            'informacion': 'Acerca de',
                            'fecha-hora': 'Fecha y hora',
                            'idioma': 'Idioma',
                            'teclado': 'Teclado',
                            'almacenamiento': 'Almacenamiento',
                            'pantalla-inicio': 'Pantalla de inicio',
                            'asistente': 'Asistente de Google',
                            'chromecast': 'Chromecast integrado',
                            'salvapantallas': 'Salvapantallas',
                            'ahorro-energia': 'Energía y reinicio',
                            'ubicacion': 'Ubicación',
                            'uso-diagnosticos': 'Uso y diagnóstico',
                            'accesibilidad': 'Accesibilidad'
                          }
                          return labels[systemSubSection] || 'Preferencias del dispositivo'
                        })()
                      : androidSettingsSection === 'main'
                      ? 'Ajustes de Android TV'
                      : seccionAndroidActual.titulo}
                  </h3>
                </div>
              </div>

              {androidSettingsSection === 'main' ? (
                /* MENÚ PRINCIPAL DE AJUSTES */
                <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                  {ANDROID_SETTINGS_SECTIONS.map((sec) => (
                    <div
                      key={sec.id}
                      onClick={() => setAndroidSettingsSection(sec.id)}
                      className="px-3 py-3 hover:bg-white/10 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-gray-400 shrink-0">
                          {sec.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{sec.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sec.sub}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-500 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
              {/* RED E INTERNET */}
              {androidSettingsSection === 'wifi' && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl px-3 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Wi-Fi</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {wifiEnabled ? `Conectado a ${connectedWifi || 'red desconocida'}` : 'Desactivado'}
                      </p>
                    </div>
                    <button
                      onClick={() => setWifiEnabled(!wifiEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${wifiEnabled ? 'bg-cyan-500' : 'bg-gray-700'}`}
                      title={wifiEnabled ? 'Desactivar Wi-Fi' : 'Activar Wi-Fi'}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${wifiEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>

                  {wifiEnabled ? (
                    <>
                      <p className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Redes disponibles</p>
                      <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                        {wifiNetworks.map((net) => (
                          <div
                            key={net.ssid}
                            onClick={() => {
                              if (net.connected) {
                                showChannelBanner('WIFI', net.ssid, 'Ya estás conectado a esta red')
                              } else {
                                setSelectedWifiToConnect(net)
                                setWifiPassword('')
                              }
                            }}
                            className={`px-3 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                              net.connected ? 'bg-cyan-600/20' : 'hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Wifi size={18} className={`${net.connected ? 'text-cyan-400' : 'text-gray-400'} shrink-0`} />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white flex items-center gap-2 truncate">
                                  {net.ssid}
                                  {net.connected && (
                                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.2 rounded">Conectado</span>
                                  )}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5 truncate">Señal {net.signal} · {net.freq}</p>
                              </div>
                            </div>
                            {net.secure && <Lock size={14} className="text-gray-400 shrink-0" />}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => showChannelBanner('WIFI', 'Búsqueda', 'Escaneando redes cercanas...')}
                        className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer rounded-xl"
                      >
                        <RefreshCw size={14} />
                        <span>Buscar de nuevo</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-xs bg-white/5 rounded-xl">
                      El Wi-Fi está desactivado. Actívalo para ver las redes disponibles.
                    </div>
                  )}
                </div>
              )}

              {/* BLUETOOTH */}
              {androidSettingsSection === 'bluetooth' && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl px-3 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Bluetooth</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {bluetoothEnabled ? 'Visible para dispositivos cercanos' : 'Desactivado'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setBluetoothEnabled(!bluetoothEnabled)
                        if (bluetoothEnabled) setBtDevices(prev => prev.map(d => ({ ...d, connected: false })))
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${bluetoothEnabled ? 'bg-cyan-500' : 'bg-gray-700'}`}
                      title={bluetoothEnabled ? 'Desactivar Bluetooth' : 'Activar Bluetooth'}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${bluetoothEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>

                  {bluetoothEnabled ? (
                    <>
                      <p className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Dispositivos vinculados</p>
                      <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                        {btDevices.map((dev) => (
                          <div
                            key={dev.id}
                            className="px-3 py-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-amber-600/25 text-amber-400 shrink-0 rounded-lg">
                                <Bluetooth size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{dev.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{dev.detail} · Batería {dev.battery}%</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setBtDevices(prev => prev.map(d => (d.id === dev.id ? { ...d, connected: !d.connected } : d)))}
                              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 rounded-full ${
                                dev.connected ? 'bg-cyan-600/25 text-cyan-300 border border-cyan-400/40' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                              }`}
                            >
                              {dev.connected ? 'Conectado' : 'Conectar'}
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => showChannelBanner('BLUETOOTH', 'Accesorios', 'Buscando dispositivos cercanos...')}
                        className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer rounded-xl"
                      >
                        <RefreshCw size={14} />
                        <span>Buscar dispositivos</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-xs bg-white/5 rounded-xl">
                      El Bluetooth está desactivado. Actívalo para vincular el control remoto.
                    </div>
                  )}
                </div>
              )}

              {/* APLICACIONES */}
              {androidSettingsSection === 'apps' && (
                <div className="space-y-4">
                  {appInfo ? (
                    <>
                      <button
                        onClick={() => {
                          setAppInfoId(null)
                          setAppPermsOpen(false)
                        }}
                        className="-mx-1 px-1 py-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        <span>Volver a Aplicaciones</span>
                      </button>

                      <div className="flex items-center gap-3.5 p-4 bg-white/5 rounded-xl">
                        <img
                          src={appInfo.iconSrc || appInfo.icon || appInfo.image}
                          alt={appInfo.name}
                          className="w-14 h-14 object-contain bg-black/40 shrink-0 rounded-xl"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{appInfo.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Versión {appInfo.version}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate mt-0.5">{appInfo.pkg}</p>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                        <button
                          onClick={() => showChannelBanner('APP', appInfo.name, 'Iniciando aplicación en D-Box...')}
                          className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <Play size={16} className="text-green-400 shrink-0" />
                          <span className="text-xs font-bold text-white">Abrir</span>
                        </button>
                        <button
                          onClick={() => showChannelBanner('APP', appInfo.name, 'Forzando detención de la aplicación...')}
                          className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <Power size={16} className="text-amber-400 shrink-0" />
                          <span className="text-xs font-bold text-white">Forzar detención</span>
                        </button>
                        <button
                          onClick={() => {
                            showChannelBanner('APPS', appInfo.name, 'Aplicación desinstalada')
                            setAppUninstalled(prev => [...prev, appInfo.id])
                            setAppInfoId(null)
                            setAppPermsOpen(false)
                          }}
                          className="w-full px-4 py-3 hover:bg-red-500/15 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <Trash2 size={16} className="text-red-400 shrink-0" />
                          <span className="text-xs font-bold text-white">Desinstalar</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="px-1">
                          <p className="text-xs font-bold text-white">Almacenamiento utilizado</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {almacenamientoApp.total} MB utilizados en Almacenamiento interno compartido
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                          <button
                            onClick={() => {
                              setAppStorage(prev => ({
                                ...prev,
                                [appInfo.id]: { ...almacenamientoApp, datos: 0, total: 0 }
                              }))
                              showChannelBanner('APP', appInfo.name, 'Datos borrados correctamente')
                            }}
                            className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <span className="text-xs font-bold text-white">Borrar datos</span>
                            <span className="text-[10px] text-gray-400 shrink-0">{almacenamientoApp.datos} MB</span>
                          </button>
                          <button
                            onClick={() => {
                              setAppStorage(prev => ({
                                ...prev,
                                [appInfo.id]: { ...almacenamientoApp, cache: 0, total: 0 }
                              }))
                              showChannelBanner('APP', appInfo.name, 'Caché borrada correctamente')
                            }}
                            className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <span className="text-xs font-bold text-white">Borrar caché</span>
                            <span className="text-[10px] text-gray-400 shrink-0">{almacenamientoApp.cache} MB</span>
                          </button>
                          <button
                            onClick={() => {
                              setAppDefaultsCleared(prev => ({ ...prev, [appInfo.id]: true }))
                              showChannelBanner('APP', appInfo.name, 'Acciones predeterminadas borradas')
                            }}
                            className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer text-left"
                          >
                            <span className="text-xs font-bold text-white shrink-0">Borrar acciones predeterminadas</span>
                            <span className="text-[10px] text-gray-400 text-right">
                              {appDefaultsCleared[appInfo.id]
                                ? 'Acciones borradas'
                                : 'No se han establecido valores predeterminados'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                        <button
                          onClick={() => {
                            const next = !(appNotifs[appInfo.id] ?? true)
                            setAppNotifs(prev => ({ ...prev, [appInfo.id]: next }))
                            showChannelBanner('APP', appInfo.name, `Notificaciones ${next ? 'activadas' : 'desactivadas'}`)
                          }}
                          className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <span className="flex items-center gap-3">
                            <Bell size={16} className="text-cyan-300 shrink-0" />
                            <span className="text-xs font-bold text-white">Notificaciones</span>
                          </span>
                          <div
                            className={`w-8 h-4 rounded-full p-0.5 shrink-0 transition-colors ${
                              (appNotifs[appInfo.id] ?? true)
                                ? 'bg-[#00a8e1]'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div
                              className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${
                                (appNotifs[appInfo.id] ?? true)
                                  ? 'translate-x-4'
                                  : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </button>

                        <button
                          onClick={() => setAppPermsOpen(prev => !prev)}
                          className="w-full px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <span className="flex items-center gap-3">
                            <Shield size={16} className="text-cyan-300 shrink-0" />
                            <span className="text-xs font-bold text-white">Permisos</span>
                          </span>
                          <ChevronRight
                            size={16}
                            className={`text-gray-500 shrink-0 transition-transform ${appPermsOpen ? 'rotate-90' : ''}`}
                          />
                        </button>

                        {appPermsOpen && (
                          <div className="px-4 py-3 space-y-2 bg-black/20">
                            {PERMISOS_APP.map(p => (
                              <div
                                key={p.nombre}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="text-[11px] font-bold text-gray-200">{p.nombre}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 shrink-0">
                                  {p.estado}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aplicaciones instaladas</p>
                      <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                        {installedApps.map(app => (
                          <div
                            key={app.id}
                            onClick={() => setAppInfoId(app.id)}
                            className="px-3 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                          >
                            <img
                              src={app.iconSrc || app.icon || app.image}
                              alt={app.name}
                              className="w-11 h-11 object-contain bg-black/40 shrink-0 rounded-xl"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{app.name}</p>
                              <p className="text-[10px] text-gray-400">{app.category}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-500 shrink-0" />
                          </div>
                        ))}
                      </div>

                      <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                        <div>
                          <button
                            onClick={() => setAppsSubSection(prev => (prev === 'ver-todas-apps' ? null : 'ver-todas-apps'))}
                            className="w-full px-3 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <p className="text-xs font-bold text-white">Ver todas las aplicaciones</p>
                            <ChevronRight size={16} className={`text-gray-500 shrink-0 transition-transform ${appsSubSection === 'ver-todas-apps' ? 'rotate-90' : ''}`} />
                          </button>
                          {appsSubSection === 'ver-todas-apps' && (
                            <div className="bg-black/20 divide-y divide-white/5">
                              {APPS_LIST.map(app => (
                                <div
                                  key={app.id}
                                  onClick={() => setAppInfoId(app.id)}
                                  className="px-3 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                                >
                                  <img
                                    src={app.iconSrc || app.icon || app.image}
                                    alt={app.name}
                                    className="w-11 h-11 object-contain bg-black/40 shrink-0 rounded-xl"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-white truncate">{app.name}</p>
                                    <p className="text-[10px] text-gray-400">{app.category}</p>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-500 shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <button
                            onClick={() => setAppsSubSection(prev => (prev === 'apps-no-usadas' ? null : 'apps-no-usadas'))}
                            className="w-full px-3 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <p className="text-xs font-bold text-white">Aplicaciones no usadas</p>
                            <ChevronRight size={16} className={`text-gray-500 shrink-0 transition-transform ${appsSubSection === 'apps-no-usadas' ? 'rotate-90' : ''}`} />
                          </button>
                          {appsSubSection === 'apps-no-usadas' && (
                            <div className="bg-black/20 divide-y divide-white/5">
                              {APPS_LIST.slice(0, 3).map(app => (
                                <div
                                  key={app.id}
                                  onClick={() => setAppInfoId(app.id)}
                                  className="px-3 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                                >
                                  <img
                                    src={app.iconSrc || app.icon || app.image}
                                    alt={app.name}
                                    className="w-11 h-11 object-contain bg-black/40 shrink-0 rounded-xl"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-white truncate">{app.name}</p>
                                    <p className="text-[10px] text-gray-400">No usada en los últimos 30 días</p>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-500 shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <button
                            onClick={() => setAppsSubSection(prev => (prev === 'permisos-apps' ? null : 'permisos-apps'))}
                            className="w-full px-3 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <p className="text-xs font-bold text-white">Permisos de aplicaciones</p>
                            <ChevronRight size={16} className={`text-gray-500 shrink-0 transition-transform ${appsSubSection === 'permisos-apps' ? 'rotate-90' : ''}`} />
                          </button>
                          {appsSubSection === 'permisos-apps' && (
                            <div className="bg-black/20 divide-y divide-white/5">
                              {APPS_LIST.map(app => (
                                <div
                                  key={app.id}
                                  onClick={() => setAppInfoId(app.id)}
                                  className="px-3 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                                >
                                  <img
                                    src={app.iconSrc || app.icon || app.image}
                                    alt={app.name}
                                    className="w-11 h-11 object-contain bg-black/40 shrink-0 rounded-xl"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-white truncate">{app.name}</p>
                                    <p className="text-[10px] text-gray-400">6 permisos otorgados</p>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-500 shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* CUENTAS */}
              {androidSettingsSection === 'cuentas' && (
                <div className="space-y-4 ">
                  <div className="bg-white/5 rounded-xl px-3 py-3 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0">
                      <User size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">Titular VTR</p>
                      <p className="text-[11px] text-gray-400 truncate">andres.gamer@claro.cl · Google</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">Verificado</span>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">VTR Smart ID</span>
                      <span className="font-semibold text-white">18.452.912-K</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Plan contratado</span>
                      <span className="font-semibold text-cyan-300">VTR Fibra 500 Megas + TV Plus</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Sincronización Google Play</span>
                      <span className="font-semibold text-white">Lista de Reproducciones activa</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Correo de recuperación</span>
                      <span className="font-semibold text-white">a.gamer@outlook.com</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => showChannelBanner('CUENTA', 'Agregar cuenta', 'Buscando cuentas disponibles...')}
                      className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-xl"
                    >
                      Agregar cuenta
                    </button>
                    <button
                      onClick={() => showChannelBanner('CUENTA', 'Cuenta eliminada', 'Google Play Movies ya no está disponible')}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-xl"
                    >
                      Quitar Google Play
                    </button>
                  </div>
                </div>
              )}

              {/* SISTEMA - Preferencias del Dispositivo */}
              {androidSettingsSection === 'sistema' && !systemSubSection && (
                <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                  {[
                    { label: 'Acerca de', icon: <Info size={16} />, id: 'informacion' },
                    { label: 'Fecha y hora', icon: <Clock size={16} />, id: 'fecha-hora' },
                    { label: 'Idioma', icon: <Globe size={16} />, id: 'idioma' },
                    { label: 'Teclado', icon: <Keyboard size={16} />, id: 'teclado' },
                    { label: 'Almacenamiento', icon: <HardDrive size={16} />, id: 'almacenamiento' },
                    { label: 'Pantalla de inicio', icon: <Home size={16} />, id: 'pantalla-inicio' },
                    { label: 'Asistente de Google', icon: <Mic size={16} />, id: 'asistente' },
                    { label: 'Chromecast integrado', icon: <Cast size={16} />, id: 'chromecast' },
                    { label: 'Salvapantallas', icon: <Monitor size={16} />, id: 'salvapantallas' },
                    { label: 'Energía y reinicio', icon: <Power size={16} />, id: 'ahorro-energia' },
                    { label: 'Ubicación', icon: <MapPin size={16} />, id: 'ubicacion' },
                    { label: 'Uso y diagnóstico', icon: <Database size={16} />, id: 'uso-diagnosticos' },
                    { label: 'Accesibilidad', icon: <Accessibility size={16} />, id: 'accesibilidad' },
                    { label: 'Reiniciar', icon: <RefreshCw size={16} />, isRestart: true }
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      onClick={() => {
                        if (item.isRestart) {
                          setAndroidSettingsDrawerOpen(false)
                          showChannelBanner('SISTEMA', 'D-Box Smart', 'Reiniciando decodificador...')
                        } else {
                          setSystemSubSection(item.id)
                        }
                      }}
                      className={`px-3 py-3 hover:bg-white/10 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                        item.isRestart ? 'hover:bg-red-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`${item.isRestart ? 'text-red-400' : 'text-gray-400'} shrink-0`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold ${item.isRestart ? 'text-red-400' : 'text-white'} truncate`}>{item.label}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* SUB-SECCIONES DE SISTEMA */}
              {androidSettingsSection === 'sistema' && systemSubSection === 'informacion' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Modelo</span>
                      <span className="font-semibold text-white">Evo Fuse 4K (Evolution Digital)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Versión de Android TV</span>
                      <span className="font-semibold text-cyan-300">Android TV 11</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Nivel de parche de seguridad</span>
                      <span className="font-semibold text-white">2026-08-01</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Kernel</span>
                      <span className="font-semibold text-white">4.9.269</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">Compilación TiVo</span>
                      <span className="font-semibold text-white">VTR_CL_2026.4.2_RC</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Nombre del dispositivo</span>
                      <span className="font-semibold text-white">D-Box Sala de Espera</span>
                    </div>
                  </div>
                  <button
                    onClick={() => showChannelBanner('ACTUALIZACIÓN', 'Sistema al día', 'Tu decodificador cuenta con la última versión')}
                    className="w-full py-2.5  bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Buscar actualización del sistema
                  </button>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'fecha-hora' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Fecha automática</span>
                      <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Zona horaria</span>
                      <span className="text-white text-sm font-semibold">Chile (Santiago)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Formato de hora</span>
                      <span className="text-white text-sm font-semibold">12 horas</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'idioma' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-white text-sm font-semibold">Español (España)</span>
                      <span className="text-cyan-300 text-xs">Seleccionado</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Español (Latinoamérica)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">English (United States)</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400 text-sm">Português (Brasil)</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'teclado' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Teclado actual</span>
                      <span className="text-white text-sm font-semibold">Gboard</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Opciones de teclado</span>
                      <ChevronRight size={16} className="text-gray-500" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Autocompletar</span>
                      <span className="text-white text-sm font-semibold">Ninguno</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'almacenamiento' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Almacenamiento interno</span>
                      <span className="text-white text-sm font-semibold">8 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Disponible</span>
                      <span className="text-cyan-300 text-sm font-semibold">4.2 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Usado por apps</span>
                      <span className="text-white text-sm font-semibold">2.8 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Caché</span>
                      <span className="text-white text-sm font-semibold">1.0 GB</span>
                    </div>
                  </div>
                  <button
                    onClick={() => showChannelBanner('ALMACENAMIENTO', 'Caché borrada', '1.0 GB liberados')}
                    className="w-full py-2.5  bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Borrar caché
                  </button>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'pantalla-inicio' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Personalizar canales</span>
                      <ChevronRight size={16} className="text-gray-500" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Habilitar vistas previas de video</span>
                      <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Habilitar vistas previas de audio</span>
                      <div className="w-10 h-5 rounded-full bg-gray-600 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'asistente' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Google Assistant</span>
                      <span className="text-cyan-300 text-sm font-semibold">Conectado</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">"Ok Google"</span>
                      <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Cuenta</span>
                      <span className="text-white text-sm font-semibold">andres.gamer@claro.cl</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'chromecast' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Estado</span>
                      <span className="text-cyan-300 text-sm font-semibold">Activo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Nombre del dispositivo</span>
                      <span className="text-white text-sm font-semibold">D-Box Sala de Espera</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">PIN de transmisión</span>
                      <span className="text-white text-sm font-semibold">No requerido</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'salvapantallas' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Salvapantallas</span>
                      <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Iniciar después de</span>
                      <span className="text-white text-sm font-semibold">5 minutos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Tipo</span>
                      <span className="text-white text-sm font-semibold">Fotos</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'ahorro-energia' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Temporizador de apagado</span>
                      <span className="text-white text-sm font-semibold">Desactivado</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Hora de encendido</span>
                      <span className="text-white text-sm font-semibold">No configurado</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Hora de apagado</span>
                      <span className="text-white text-sm font-semibold">No configurado</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'desarrolladores' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Opciones de desarrollador</span>
                      <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Depuración USB</span>
                      <div className="w-10 h-5 rounded-full bg-gray-600 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Mantener el dispositivo encendido</span>
                      <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'ubicacion' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Ubicación</span>
                      <div className="w-10 h-5 rounded-full bg-gray-600 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Modo de ubicación</span>
                      <span className="text-white text-sm font-semibold">Solo dispositivo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Apps con acceso</span>
                      <span className="text-white text-sm font-semibold">0 apps</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'uso-diagnosticos' && (
                <div className="space-y-4 ">
                  <div className="p-4  bg-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Uso y diagnóstico</span>
                      <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Estadísticas de uso</span>
                      <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-4" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Historial de diagnóstico</span>
                      <span className="text-white text-sm font-semibold">Último: hace 2 días</span>
                    </div>
                  </div>
                </div>
              )}

              {androidSettingsSection === 'sistema' && systemSubSection === 'accesibilidad' && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                    {[
                      'Subtítulos',
                      'Texto de alto contraste (Experimental)',
                      'Función Texto a voz',
                      'Acceso directo a accesibilidad'
                    ].map(item => (
                      <div
                        key={item}
                        onClick={() => showChannelBanner('ACCESIBILIDAD', item, 'Abriendo ajuste de accesibilidad...')}
                        className="px-3 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span className="text-xs font-bold text-white">{item}</span>
                        <ChevronRight size={16} className="text-gray-500 shrink-0" />
                      </div>
                    ))}
                  </div>

                  <p className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Servicios</p>
                  <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                    <div
                      onClick={() => setTalkbackModalOpen(true)}
                      className="px-3 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="text-xs font-bold text-white">TalkBack</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{talkbackEnabled ? 'Activado' : 'Desactivado'}</span>
                    </div>
                    {[
                      { label: 'Accesibilidad con interruptores', value: 'Desactivado' },
                      { label: 'AnyDesk Control Service AD1', value: 'Desactivado' }
                    ].map(item => (
                      <div
                        key={item.label}
                        className="px-3 py-3 flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-bold text-white">{item.label}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
</>
              )}
            </div>


          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONNECT TO WIFI MODAL (Enter Wi-Fi Password)              */}
      {/* ========================================================= */}
      {selectedWifiToConnect && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1c232f] border-2 border-cyan-500/50 rounded-2xl p-6 text-white shadow-2xl animate-in fade-in duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <Wifi size={20} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white">Conectar a Wi-Fi</h3>
              </div>
              <button
                onClick={() => setSelectedWifiToConnect(null)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-gray-300 mb-3">
              Ingresa la contraseña para la red <strong className="text-cyan-300">{selectedWifiToConnect.ssid}</strong>:
            </p>

            <form onSubmit={handleConnectWifi} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Contraseña de red Wi-Fi"
                  className="w-full px-4 py-2.5  bg-black/60 border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  autoFocus
                />
              </div>

              {/* Sample Quick Keys for convenience */}
              <div className="flex gap-2">
                {['vtr2026', 'claro1234', 'wifi5ghz'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setWifiPassword(sample)}
                    className="text-[10px] bg-white/10 hover:bg-white/20 text-gray-300 px-2 py-1 rounded cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWifiToConnect(null)}
                  className="flex-1 py-2  bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isConnectingWifi}
                  className="flex-1 py-2  bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  {isConnectingWifi ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <span>Conectar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PROGRAMACIÓN DEL CONTROL REMOTO (TiVo Remote - Panel lateral) */}
      {/* ========================================================= */}
      {remoteProgrammingOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full sm:w-[420px] h-full bg-[#2d2d2d] border-l border-white/10 p-6 flex flex-col text-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto scrollbar-none">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setRemoteProgrammingOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer mr-1"
                  title="Volver"
                >
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-base font-bold text-white">Programación del control remoto</h3>
              </div>
              <button
                onClick={() => setRemoteProgrammingOpen(false)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
              {TIVO_REMOTE_OPTIONS.map(item => (
                <div
                  key={item.id}
                  onClick={() => item.action && item.action()}
                  className={`px-3 py-3 transition-colors flex items-center gap-3 ${
                    item.action ? 'hover:bg-white/10 cursor-pointer' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{item.label}</p>
                    {item.sub && <p className="text-[10px] text-gray-400 truncate">{item.sub}</p>}
                  </div>
                  {item.action ? (
                    <ChevronRight size={16} className="text-gray-500 shrink-0" />
                  ) : (
                    <span className="text-xs font-bold text-cyan-300 shrink-0">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CAMBIE LA CONFIGURACIÓN DEL AUDIO (Búsqueda de dispositivos) */}
      {/* ========================================================= */}
      {audioSearchOpen && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          {audioBrandOpen ? (
            <div className="w-full max-w-2xl px-8">
              <p className="text-lg lg:text-xl font-bold text-white text-center mb-6">Selecciona tu marca de receptor</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AUDIO_RECEIVER_BRANDS.map(brand => (
                  <button
                    key={brand}
                    onClick={() => {
                      showChannelBanner('CONTROL REMOTO', brand, 'Configurando receptor de audio...')
                      setAudioBrandOpen(false)
                      setAudioSearchOpen(false)
                    }}
                    className="py-3.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          ) : audioConfirmOpen ? (
            <div className="flex items-center justify-center gap-12 lg:gap-16 px-8 max-w-3xl">
              <div className="flex-1 max-w-md space-y-4">
                <p className="text-lg lg:text-xl font-bold text-white leading-snug">
                  ¿Deseas configurar tu control remoto con el receptor de audio?
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Conectar su receptor de audio le permite cambiar el volumen y encender y apagar su receptor de audio.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <button
                  onClick={() => {
                    setAudioConfirmOpen(false)
                    setAudioBrandOpen(true)
                  }}
                  className="w-44 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => {
                    setAudioConfirmOpen(false)
                    setAudioSearchOpen(false)
                  }}
                  className="w-44 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Omitir
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAudioConfirmOpen(true)}
              className="w-60 h-60 rounded-full bg-cyan-600/20 hover:bg-cyan-600/30 border-2 border-cyan-400/50 text-white flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer shadow-2xl"
            >
              <RefreshCw size={34} className="animate-spin text-cyan-300" />
              <span className="text-sm font-bold uppercase tracking-wider text-center px-6">Buscando dispositivos</span>
            </button>
          )}
          <button
            onClick={() => {
              setAudioConfirmOpen(false)
              setAudioBrandOpen(false)
              setAudioSearchOpen(false)
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 cursor-pointer"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TALKBACK CONFIRM MODAL                                    */}
      {/* ========================================================= */}
      {talkbackModalOpen && (
        <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="flex items-center justify-center gap-12 lg:gap-16 px-8 max-w-3xl">
            <div className="flex-1 max-w-md space-y-4">
              <p className="text-lg lg:text-xl font-bold text-white leading-snug">
                {talkbackEnabled ? '¿Detener TalkBack?' : '¿Activar TalkBack?'}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {talkbackEnabled
                  ? 'Si seleccionas Aceptar, se detendrá TalkBack.'
                  : 'Si seleccionas Aceptar, se activará TalkBack.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <button
                onClick={() => {
                  showChannelBanner('ACCESIBILIDAD', 'TalkBack', talkbackEnabled ? 'TalkBack desactivado' : 'TalkBack activado')
                  setTalkbackEnabled(v => !v)
                  setTalkbackModalOpen(false)
                }}
                className="w-44 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
              >
                Aceptar
              </button>
              <button
                onClick={() => setTalkbackModalOpen(false)}
                className="w-44 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PIN MODAL (Configuración del dispositivo / Control parental) */}
      {/* ========================================================= */}
      {pinModalOpen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 w-[520px] max-w-[94vw]">
          <div className="w-full rounded-2xl bg-black/85 shadow-2xl px-6 py-5 flex flex-col items-center gap-4">
            <div className="text-center">
              <p className={`text-sm font-bold leading-tight ${pinError ? 'text-red-400' : 'text-gray-200'}`}>
                {pinError
                  ? 'PIN incorrecto'
                  : pinTarget === 'dispositivo'
                  ? 'Ingresa PIN · Configuración del dispositivo'
                  : 'Ingresa PIN · Control parental'}
              </p>
              {pinTarget === 'control-parental' && (
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Para continuar, introduzca su PIN de Control parental. Esto desactivará el Control parental hasta que su d-BOX Smart no se haya usado por 4 horas o esté En espera.
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Con el control remoto o el teclado · <span className="text-gray-400 font-bold">0000</span> o{' '}
                <span className="text-gray-400 font-bold">9999</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPinError(false)
                    setPinInput(prev => prev.slice(0, i))
                  }}
                  className={`w-12 h-14 flex items-center justify-center  border tabular-nums cursor-pointer hover:bg-white/10 transition-colors ${
                    pinError
                      ? 'border-red-500/70 bg-red-500/10 text-red-400'
                      : pinInput.length > i
                      ? 'border-cyan-400/60 bg-black/50 text-white'
                      : 'border-white/25 bg-black/50'
                  }`}
                  title={`Hacer clic para editar dígito ${i + 1}`}
                >
                  <span className="font-mono text-3xl font-bold">{pinInput[i] || ''}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIRTUAL VTR REMOTE CONTROL - /control.png image */}
      {/* ========================================================= */}
      {showRemote && (
        <div className="absolute right-4 top-16 z-50 flex flex-col items-center select-none animate-in slide-in-from-right-4 duration-200">
          <button onClick={() => setShowRemote(false)} className="self-end text-gray-400 hover:text-white p-1 cursor-pointer rounded-full hover:bg-white/10 mb-2" title="Cerrar Control">
            <X size={14} />
          </button>

          {/* Remote Image Container with 31 Interactive Mapped Zones */}
          <div className="relative w-full shadow-2xl rounded-2xl overflow-hidden bg-black/40">
            <img
              src="/control.png"
              alt="Control Remoto VTR TiVo Evo Fuse 4K"
              className="w-full object-contain drop-shadow-2xl select-none pointer-events-none"
              draggable={false}
            />

            {/* 1. POWER */}
            <button
              onClick={() => showChannelBanner('POWER', 'D-Box Evo Fuse 4K', 'Modo Reposo / Encendido')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '5.2%', left: '23%', width: '20%', height: '6.5%' }}
              title="Power (Encendido/Apagado)"
            />

            {/* 2. INPUT */}
            <button
              onClick={() => showChannelBanner('ENTRADA', 'HDMI 1', 'VTR UHD 4K (2160p 60Hz HDR10)')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '5.2%', left: '57%', width: '20%', height: '6.5%' }}
              title="Input (Fuente HDMI)"
            />

            {/* 3. GUIDE */}
            <button
              onClick={() => setCurrentView(v => v === 'guia' ? 'inicio' : 'guia')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '13.0%', left: '38%', width: '24%', height: '4.8%' }}
              title="Guide (Guía EPG Interactiva)"
            />

            {/* 4. VOL + */}
            <button
              onClick={() => {
                const newVolume = Math.min(100, volumeLevel + 5)
                setVolumeLevel(newVolume)
                showChannelBanner('VOLUMEN', 'Nivel de Audio', String(newVolume))
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-t-2xl transition-all z-10"
              style={{ top: '11.5%', left: '11%', width: '19%', height: '6.2%' }}
              title="Volumen +"
            />

            {/* 5. VOL - */}
            <button
              onClick={() => {
                const newVolume = Math.max(0, volumeLevel - 5)
                setVolumeLevel(newVolume)
                showChannelBanner('VOLUMEN', 'Nivel de Audio', String(newVolume))
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-b-2xl transition-all z-10"
              style={{ top: '19.5%', left: '11%', width: '19%', height: '6.2%' }}
              title="Volumen -"
            />

            {/* 6. CH + */}
            <button
              onClick={() => handleChannelStep('up')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-t-2xl transition-all z-10"
              style={{ top: '11.5%', left: '70%', width: '19%', height: '6.2%' }}
              title="Canal Siguiente (CH+)"
            />

            {/* 7. CH - */}
            <button
              onClick={() => handleChannelStep('down')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-b-2xl transition-all z-10"
              style={{ top: '19.5%', left: '70%', width: '19%', height: '6.2%' }}
              title="Canal Anterior (CH-)"
            />

            {/* 8. TIVO LOGO (HOME) */}
            <button
              onClick={() => {
                setCurrentView('inicio')
                setActiveTab('VER TV')
                setSelectedSettingDetail(null)
                setAndroidSettingsDrawerOpen(false)
                setPinModalOpen(false)
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '21.2%', left: '38%', width: '24%', height: '7.2%' }}
              title="TiVo Inicio (Pantalla Principal)"
            />

            {/* 9. MUTE */}
            <button
              onClick={() => {
                setIsMuted(m => !m)
                showChannelBanner('VOLUMEN', 'Silencio', isMuted ? String(volumeLevel) : '0')
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '26.5%', left: '11%', width: '20%', height: '5.8%' }}
              title="Silencio (Mute)"
            />

            {/* 10. INFO (i) */}
            <button
              onClick={() => showChannelBanner(currentChannel.num, currentChannel.name, `${currentChannel.prog} • ${currentChannel.time}`)}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '26.5%', left: '69%', width: '20%', height: '5.8%' }}
              title="Información del Programa (Info)"
            />

            {/* 11. D-PAD UP */}
            <button
              onClick={() => {
                if (currentView === 'menu') {
                  setSelectedSettingIndex(p => (p - 1 + settingsOptions.length) % settingsOptions.length)
                } else if (currentView === 'guia') {
                  handleChannelStep('down')
                }
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-t-full transition-all z-10"
              style={{ top: '31.0%', left: '34%', width: '32%', height: '6.0%' }}
              title="Navegación Arriba (▲)"
            />

            {/* 12. D-PAD LEFT */}
            <button
              onClick={() => {
                if (currentView === 'inicio') {
                  const len = inicioCarouselLen
                  setSelectedCardIndex(p => (p - 1 + len) % len)
                } else if (currentView === 'menu') {
                  const tabs = MENU_TABS
                  const idx = tabs.indexOf(activeMenuTab)
                  setActiveMenuTab(tabs[(idx - 1 + tabs.length) % tabs.length])
                }
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-l-full transition-all z-10"
              style={{ top: '37.0%', left: '18%', width: '18%', height: '8.0%' }}
              title="Navegación Izquierda (◄)"
            />

            {/* 13. D-PAD OK (CENTER) */}
            <button
              onClick={() => {
                if (currentView === 'inicio') {
                  if (activeTab === 'APPS Y JUEGOS') {
                    const a = APPS_LIST[selectedCardIndex % APPS_LIST.length]
                    if (a.id === 'playstore') {
                      setCurrentView('playstore')
                    } else {
                      showChannelBanner('APP', a.name, 'Abriendo aplicación en D-Box...')
                    }
                  } else if (activeTab === 'VER TV') {
                    tuneToVerTvChannel(selectedCardIndex)
                  } else {
                    tuneToCard(selectedCardIndex)
                  }
                } else if (currentView === 'menu') {
                  handleSelectSetting(selectedSettingIndex)
                } else if (currentView === 'guia') {
                  setCurrentView('inicio')
                }
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '37.0%', left: '36%', width: '28%', height: '8.0%' }}
              title="Seleccionar / OK"
            />

            {/* 14. D-PAD RIGHT */}
            <button
              onClick={() => {
                if (currentView === 'inicio') {
                  const len = inicioCarouselLen
                  setSelectedCardIndex(p => (p + 1) % len)
                } else if (currentView === 'menu') {
                  const tabs = MENU_TABS
                  const idx = tabs.indexOf(activeMenuTab)
                  setActiveMenuTab(tabs[(idx + 1) % tabs.length])
                }
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-r-full transition-all z-10"
              style={{ top: '37.0%', left: '64%', width: '18%', height: '8.0%' }}
              title="Navegación Derecha (►)"
            />

            {/* 15. D-PAD DOWN */}
            <button
              onClick={() => {
                if (currentView === 'menu') {
                  setSelectedSettingIndex(p => (p + 1) % settingsOptions.length)
                } else if (currentView === 'guia') {
                  handleChannelStep('up')
                }
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-b-full transition-all z-10"
              style={{ top: '45.0%', left: '34%', width: '32%', height: '6.0%' }}
              title="Navegación Abajo (▼)"
            />

            {/* 16. BACK */}
            <button
              onClick={() => {
                if (androidSettingsDrawerOpen) {
                  if (systemSubSection) setSystemSubSection(null)
                  else if (appsSubSection) setAppsSubSection(null)
                  else if (appPermsOpen) setAppPermsOpen(false)
                  else if (appInfoId) setAppInfoId(null)
                  else if (androidSettingsSection !== 'main') setAndroidSettingsSection('main')
                  else setAndroidSettingsDrawerOpen(false)
                } else if (pinModalOpen) {
                  setPinModalOpen(false)
                } else if (selectedSettingDetail) {
                  setSelectedSettingDetail(null)
                } else if (currentView !== 'inicio') {
                  setCurrentView('inicio')
                }
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '50.8%', left: '14%', width: '20%', height: '5.5%' }}
              title="Volver Atrás (Back)"
            />

            {/* 17. GOOGLE ASSISTANT */}
            <button
              onClick={() => {
                showChannelBanner('GOOGLE', 'ABRE CONFIGURACION', 'Abriendo ajustes de Android TV...')
                setTimeout(() => {
                  setAndroidSettingsDrawerOpen(true)
                  setAndroidSettingsSection('main')
                  setCurrentView('inicio')
                }, 1500)
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '53.0%', left: '38%', width: '24%', height: '7.0%' }}
              title="Asistente de Google (Voz)"
            />

            {/* 18. EXIT */}
            <button
              onClick={() => {
                setAndroidSettingsDrawerOpen(false)
                setPinModalOpen(false)
                setSelectedSettingDetail(null)
                setCurrentView('inicio')
                setActiveTab('VER TV')
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '50.8%', left: '66%', width: '20%', height: '5.5%' }}
              title="Salir a TV en Vivo (Exit)"
            />

            {/* 19. VOD */}
            <button
              onClick={() => {
                setCurrentView('inicio')
                setActiveTab('PELÍCULAS Y SERIES')
                setSelectedCardIndex(0)
                showChannelBanner('VOD', 'Catálogo VOD', 'Explorando películas y series')
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '57.8%', left: '14%', width: '20%', height: '5.0%' }}
              title="VOD (Películas y Series)"
            />

            {/* 20. APPS GRID (:::) */}
            <button
              onClick={() => {
                setCurrentView('apps')
                showChannelBanner('APPS', 'Aplicaciones Android TV', '42 aplicaciones instaladas')
              }}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '57.8%', left: '66%', width: '20%', height: '5.0%' }}
              title="Cajón de Aplicaciones (Apps)"
            />

            {/* 21. NETFLIX */}
            <button
              onClick={() => showChannelBanner('NETFLIX', 'Netflix', 'Abriendo Netflix 4K HDR...')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '62.8%', left: '24%', width: '52%', height: '4.8%' }}
              title="Netflix (Acceso Directo)"
            />

            {/* NUMPAD ROW 1: 1, 2, 3 */}
            <button
              onClick={() => handleRemoteNumber('1')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '68.4%', left: '13%', width: '22%', height: '5.2%' }}
              title="1"
            />
            <button
              onClick={() => handleRemoteNumber('2')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '68.4%', left: '39%', width: '22%', height: '5.2%' }}
              title="2"
            />
            <button
              onClick={() => handleRemoteNumber('3')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '68.4%', left: '65%', width: '22%', height: '5.2%' }}
              title="3"
            />

            {/* NUMPAD ROW 2: 4, 5, 6 */}
            <button
              onClick={() => handleRemoteNumber('4')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '74.6%', left: '13%', width: '22%', height: '5.2%' }}
              title="4"
            />
            <button
              onClick={() => handleRemoteNumber('5')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '74.6%', left: '39%', width: '22%', height: '5.2%' }}
              title="5"
            />
            <button
              onClick={() => handleRemoteNumber('6')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '74.6%', left: '65%', width: '22%', height: '5.2%' }}
              title="6"
            />

            {/* NUMPAD ROW 3: 7, 8, 9 */}
            <button
              onClick={() => handleRemoteNumber('7')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '80.8%', left: '13%', width: '22%', height: '5.2%' }}
              title="7"
            />
            <button
              onClick={() => handleRemoteNumber('8')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '80.8%', left: '39%', width: '22%', height: '5.2%' }}
              title="8"
            />
            <button
              onClick={() => handleRemoteNumber('9')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '80.8%', left: '65%', width: '22%', height: '5.2%' }}
              title="9"
            />

            {/* NUMPAD ROW 4: 0 */}
            <button
              onClick={() => handleRemoteNumber('0')}
              className="absolute cursor-pointer opacity-0 hover:opacity-30 hover:bg-white/10 active:bg-white/20 rounded-full transition-all z-10"
              style={{ top: '87.0%', left: '39%', width: '22%', height: '5.4%' }}
              title="0"
            />
          </div>
        </div>
      )}

      {/* Google Play Store View - Full Screen */}
      {currentView === 'playstore' && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-transparent">
            <div className="flex items-center gap-6">
              {/* Google Play Logo */}
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8" viewBox="0 0 48 48">
                  <path fill="#4caf50" d="M7.7 4.2L26 22.5 19.3 29.2 5.9 5.8c-.5.8-.8 1.8-.8 2.9v30.6c0 1.1.3 2.1.8 2.9l1.8-38z"/>
                  <path fill="#ff9800" d="M32.8 15.7L7.7 4.2 26 22.5l6.8-6.8z"/>
                  <path fill="#f44336" d="M7.7 43.8l25.1-11.5-6.8-6.8-6.7 6.7z"/>
                  <path fill="#2196f3" d="M42.2 21.6l-9.4-5.9-6.8 6.8 6.8 6.8 9.4-5.9c1.4-.9 1.4-2.9 0-3.8z"/>
                </svg>
                <span className="text-xl font-bold text-white">Google Play</span>
              </div>
            </div>
            <div className="flex items-center gap-4 lg:gap-8">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <Search size={20} />
                <span className="text-sm font-medium hidden sm:inline">Buscar</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white dark:bg-black dark:text-white cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-800">
                <Grid size={20} />
                <span className="text-sm font-medium hidden sm:inline">Apps</span>
              </button>
              <button
                onClick={() => setCurrentView('inicio')}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium hidden sm:inline">Retroceder</span>
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-white/20"></div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-none">
            {/* All Apps Row */}
            <h3 className="text-lg font-bold text-white mb-4">Aplicaciones instaladas</h3>
            <div className="flex gap-8 mb-8 overflow-x-auto scrollbar-none pb-4">
              {installedApps.map((app, i) => (
                <div key={app.id} className="group relative flex flex-col items-center cursor-pointer transition-all duration-150 shrink-0 pt-8 rounded-2xl">
                  <div className="h-36 w-auto flex items-center justify-center rounded-2xl hover:ring-1 hover:ring-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <img
                      src={app.image}
                      alt={app.name}
                      className="h-full w-auto object-contain rounded-2xl drop-shadow"
                    />
                  </div>
                  {/* Tooltip tag on hover */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {app.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Streaming Category Row */}
            <h3 className="text-lg font-bold text-white mb-4">Streaming</h3>
            <div className="flex gap-8 mb-8 overflow-x-auto scrollbar-none pb-4">
              {installedApps.filter(a => a.category === 'Streaming').map((app, i) => (
                <div key={app.id} className="group relative flex flex-col items-center cursor-pointer transition-all duration-150 shrink-0 pt-8 rounded-2xl">
                  <div className="h-36 w-auto flex items-center justify-center rounded-2xl hover:ring-1 hover:ring-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <img
                      src={app.image}
                      alt={app.name}
                      className="h-full w-auto object-contain rounded-2xl drop-shadow"
                    />
                  </div>
                  {/* Tooltip tag on hover */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {app.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Tienda Category Row */}
            <h3 className="text-lg font-bold text-white mb-4">Tienda</h3>
            <div className="flex gap-8 overflow-x-auto scrollbar-none pb-4">
              {installedApps.filter(a => a.category === 'Tienda').map((app, i) => (
                <div key={app.id} className="group relative flex flex-col items-center cursor-pointer transition-all duration-150 shrink-0 pt-8 rounded-2xl">
                  <div className="h-36 w-auto flex items-center justify-center rounded-2xl hover:ring-1 hover:ring-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <img
                      src={app.image}
                      alt={app.name}
                      className="h-full w-auto object-contain rounded-2xl drop-shadow"
                    />
                  </div>
                  {/* Tooltip tag on hover */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {app.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
