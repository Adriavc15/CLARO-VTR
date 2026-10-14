import { LucideIcon } from 'lucide-react'

// Admin Panel types
export interface AdminPanelProps {
  noticias: any[]
  onNavigateToSection: (sectionId: string) => void
  setNoticias: (noticias: any[]) => void
  onToast: (message: string) => void
  openImageModal: (src: string, size?: string, disableZoom?: boolean) => void
  nombreUsuario: string
  avatarUrl: string
}

// Usuarios Section types
export interface UsuariosSectionProps {
  noticias: any[]
  onToast: (message: string) => void
}

// Generic Admin component props
export interface AdminComponentProps {
  db: any
  onToast: (message: string) => void
}

// Admin Admins Autorizados
export interface AdminAdminsAutorizadosProps extends AdminComponentProps {
  esSuperAdmin: boolean
  correoSesion: string
}

// Admin Conocimiento IA
export interface AdminConocimientoIAProps extends AdminComponentProps {
  panelInicial?: string
}

// Pack types
export interface PackProps {
  children: React.ReactNode
  full?: boolean
  label: string
  color?: string
  [key: string]: any
}

// Tipificacion personal
export interface TipificacionPersonalProps {
  campos: any
  capturaUrl?: string
  correoApex: string
  onEnviado: () => void
  setModal: (modal: any) => void
  texto: string
  tipo: string
  [key: string]: any
}

// Quick Action Button
export interface QuickActionButtonProps {
  color?: string
  icon: LucideIcon
  iconClassName?: string
  iconSrc?: string
  iconType?: string
  onClick: () => void
  title: string
  [key: string]: any
}

// Modal Somos Clave
export interface ModalSomosClaveProps {
  firebaseApp: any
  oculto?: boolean
  onCerrar: () => void
  userAvatarUrl?: string
  variante?: string
}

// Link Item
export interface LinkItem {
  id: string
  nombre: string
  enlace: string
  categoria?: string
  [key: string]: any
}

// Plan type
export interface PlanType {
  clave: any
  titulo: string
  resumen: string
  declarado: {
    canales: any
    hd: any
  }
  incluidos?: any
  [key: string]: any
}

// Channel Grid Item
export interface ChannelGridItem {
  key: any
  label: any
  value: any
  muted?: boolean
  Icon?: any
  [key: string]: any
}

// Usuario Component
export interface UsuarioComponentProps {
  avatarUrl: string
  compact?: boolean
  email: string
  nombre?: string
  onOpenTipificaciones: () => void
}

// Messenger Component
export interface MessengerComponentProps {
  onGuardado: () => void
  onToast: (message: string) => void
}

// Error State
export interface ErrorState {
  detalleError: string
  estado?: string
}

declare module 'react' {
  interface HTMLAttributes<T> {
    class?: string
  }
}
