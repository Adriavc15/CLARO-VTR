import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const App = lazy(() => import('./App.jsx'))
const AdminPage = lazy(() => import('./AdminPage.jsx'))
const JuegosPage = lazy(() => import('./juegos/JuegosPage.jsx'))
const FormulariosPage = lazy(() => import('./FormulariosPage.jsx'))

const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/'
const hash = typeof window !== 'undefined' ? window.location.hash : ''
const pathLower = path.toLowerCase()
const hashLower = hash.toLowerCase()

const isAdminRoute = pathLower === '/admin' || hashLower === '#admin'
const isJuegoRoute = pathLower === '/juego' || pathLower.startsWith('/juego/') || hashLower === '#juego'
const isFormulariosRoute = pathLower === '/formularios' || hashLower === '#formularios'

function Cargando() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
      <img
        src="/apex 2.png"
        alt="Cargando"
        className="apex-loader-logo w-16 h-16 sm:w-20 sm:h-20 object-contain"
      />
    </div>
  )
}

function Pagina() {
  if (isAdminRoute) return <AdminPage />
  if (isJuegoRoute) return <JuegosPage />
  if (isFormulariosRoute) return <FormulariosPage />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<Cargando />}>
      <Pagina />
    </Suspense>
  </React.StrictMode>,
)
