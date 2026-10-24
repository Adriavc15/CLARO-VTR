# 01 · Visión general

## ¿Qué es?

**CLARO VTR CHILE — Sistema de Información** es un portal web interno para el personal de
atención (asesores, supervisores y administradores) que da soporte a clientes de **VTR** y
**Claro Chile**. Centraliza en una sola interfaz todo lo que un agente necesita para atender
una llamada o chat: precios, planes, activaciones de streaming, grillas de canales,
procedimientos técnicos y un asistente de IA que responde dudas operativas.

No es un sitio público de autoservicio para clientes: es una **herramienta de trabajo**
(interna), aunque técnicamente sea una aplicación web desplegada en Firebase Hosting.

## ¿Para quién?

| Rol | Uso principal |
|---|---|
| **Asesor / agente de contacto** | Consultar planes, streaming, grillas, procedimientos, tipificar y usar el asistente |
| **Supervisor** | Gestionar asesores, revisar tipificaciones y definir contenido |
| **Administrador** | Mantener catálogos (planes, streaming, IDs Clave), conocimiento de la IA y usuarios autorizados |

## Problemas que resuelve

- **Dispersión de la información:** en lugar de abrir varias intranets y documentos, todo está
  en un solo portal con buscador y navegación por secciones.
- **Respuestas lentas/errores:** el asistente **Apex** responde con base en una base de
  conocimiento curada del propio portal, reduciendo el tiempo de búsqueda.
- **Capacitación:** simuladores de los sistemas reales (Genesys y ANDES/Siebel) permiten
  practicar sin riesgo.
- **Actualización rápida de oferta:** los catálogos (planes, streaming, grilla) se editan desde
  el panel de administración y se propagan en tiempo real vía Firestore.
- **Marca dual VTR / Claro:** el contenido se filtra por marca para no mezclar oferta ni
  procedimientos.

## Módulos del portal

| Sección | Qué ofrece |
|---|---|
| **Inicio / Dashboard** | Accesos rápidos, comunicados y novedades |
| **Comunicados / Noticias** | Publicaciones en tiempo real con confirmación de lectura |
| **Planes** | Catálogo VTR y Claro: 1P/2P/3P, fibra, TV, telefonía, precios normal y promo |
| **Streaming** | Plataformas activables y enlaces oficiales por marca |
| **Grilla de canales** | Guías por paquete/región, conteo HD/SD, packs extra |
| **Modem / Red** | Guías de instalación, extensor/mesh, diagnóstico |
| **Pasos / Contrataciones** | Procedimientos guiados (control remoto, cambio de plan, D-Box, WiFi) |
| **IDs Clave VTR** | Índice de enlaces a artículos de "Somos Clave" por área |
| **Tipificaciones** | Bloc personal con catálogo RAZÓN → SERVICIO → MOTIVO y exportación |
| **Aplicaciones** | Lanzador de aplicaciones internas/externas |
| **Asistente Apex** | Chat de IA (Gemini + RAG) sobre el conocimiento del portal |
| **Simuladores** | Genesys, ANDES/Siebel y Android TV |
| **Medidor de velocidad** | Test de velocidad (objetivos Fast.com) |
| **Formularios** (`/formularios`) | Registro de migraciones por cambio de tecnología y de clientes que **no aceptan** el cambio a fibra |
| **Admin** (`/admin`) | Gestión de catálogos, usuarios, conocimiento de IA y tipificaciones |
| **Ventas Isla** (`/ventas-isla`) | Registro de Ventas Isla y transferencias al S2 14111 |
| **Juegos** | Juegos integrados (Geometry Dash, Purble Place, Zuma Deluxe, SNES Emulator) |

## Marca: VTR y Claro

El portal atiende las dos marcas. El código incluye un **filtro de marca**
(`vtr-web/src/asistente/filtroMarca.js`) que normaliza y separa el contenido de VTR y de
Claro, además de catálogos de planes distintos (`planesSeed.js` para VTR, `planesClaro.js`
para Claro) y dos bloques de activación de streaming (VTR y Claro).

## Capturas de pantalla

### Dashboard / Inicio
![Dashboard](/screenshots/dashboard.png)

### Comunicados / Noticias
![Noticias](/screenshots/noticias.png)

### Planes
![Planes](/screenshots/planes.png)

### Streaming
![Streaming](/screenshots/streaming.png)

### Grilla de canales
![Grilla](/screenshots/grilla.png)

### Modem / Red
![Modem](/screenshots/modem.png)

### Pasos / Contrataciones
![Pasos](/screenshots/pasos.png)

### IDs Clave VTR
![IDs Clave](/screenshots/systems.png)

### Tipificaciones
![Tipificaciones](/screenshots/tipificaciones.png)

### Aplicaciones
![Aplicaciones](/screenshots/links.png)

### Asistente Apex
![Asistente Apex](/screenshots/apex.png)

### Simuladores

#### Android TV
![Android TV](/screenshots/androidtv.png)

#### Genesys
![Genesys](/screenshots/genesys.png)

#### ANDES/Siebel
![ANDES](/screenshots/andes.png)

### Medidor de velocidad
![Medidor](/screenshots/medidor.png)

### Formularios
![Formularios](/screenshots/formularios.png)
