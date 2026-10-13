/**
 * Corpus comercial: Netflix, Disney+, Crunchyroll, TNT Sports (con Max), Pack Adulto.
 * Planes, precios, comparativas, FAQ asesor + frases naturales (sin ¿?, typos, coloquial).
 * Precios según tabla comparativa de referencia (cobro en boleta del hogar VTR).
 */

function normFraseKey(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const NOTA_BOLETA = 'El cobro se realiza a través de la boleta del servicio del hogar (según condiciones comerciales vigentes).'
const NOTA_TABLA = 'Valores según tabla comparativa de referencia; confirma siempre la campaña/promoción vigente antes de tipificar.'

/** Docs RAG canónicos por plataforma / intención */
export const DOCS_STREAMING_COMERCIAL = [
  {
    id: 'ott-netflix-planes',
    titulo: 'Netflix — planes, precios y características (VTR)',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → Netflix',
    intencion: 'NETFLIX_PLANES',
    sinonimos: [
      'netflix',
      'planes netflix',
      'precio netflix',
      'cuanto cuesta netflix',
      'cuanto sale netflix',
      'netflix basico',
      'netflix estandar',
      'netflix premium',
      'netflix 4k',
      'miembros extra netflix',
      'compartir netflix',
    ],
    contenido: [
      'Netflix (planes a la carta vía VTR):',
      '· Básico: $7.190/mes | 1 dispositivo | 720p (HD) | Descargas en 1 dispositivo.',
      '· Estándar: $9.990/mes | 2 dispositivos | 1080p (HD) | Descargas en 2 | Permite 1 miembro extra (fuera del hogar).',
      '· Premium: $12.990/mes | 4 dispositivos | 4K UHD + HDR | Descargas en 6 | Hasta 2 miembros extra | Audio espacial.',
      'Todos incluyen juegos, series y películas sin publicidad (según modalidad de la tabla).',
      NOTA_BOLETA,
      NOTA_TABLA,
    ],
    imagenes: ['/img-netflix.png'],
    fuente: 'entrenamiento-streaming-comercial',
  },
  {
    id: 'ott-disney-planes',
    titulo: 'Disney+ — planes, precios y ESPN (VTR)',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → Disney+',
    intencion: 'DISNEY_PLANES',
    sinonimos: [
      'disney',
      'disney+',
      'disney plus',
      'planes disney',
      'precio disney',
      'cuanto sale disney',
      'disney estandar',
      'disney premium',
      'disney 4k',
      'disney espn',
      'disney futbol',
      'disney deportes',
    ],
    contenido: [
      'Disney+:',
      '· Plan Estándar: $10.990/mes | 2 dispositivos | Catálogo Disney/Pixar/Marvel/Star/Hulu sin publicidad | Descargas. No incluye eventos/canales ESPN ni 4K/Dolby Atmos.',
      '· Plan Premium: $15.990/mes | 4 dispositivos | Todo el catálogo + canales/eventos ESPN (+500 al mes) | 4K UHD/HDR y Dolby Atmos | Descargas.',
      'Para fútbol/deportes ESPN → Disney+ Premium.',
      NOTA_BOLETA,
      NOTA_TABLA,
    ],
    imagenes: ['/img-disney.png'],
    fuente: 'entrenamiento-streaming-comercial',
  },
  {
    id: 'ott-crunchyroll-planes',
    titulo: 'Crunchyroll — Fan / Mega Fan, precios y promo',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → Crunchyroll',
    intencion: 'CRUNCHYROLL_PLANES',
    sinonimos: [
      'crunchyroll',
      'crunchy',
      'anime',
      'plan fan',
      'mega fan',
      'precio crunchyroll',
      'cuanto sale crunchyroll',
      'cuanto vale crunchy',
      'anime barato',
      'anime sin anuncios',
      'descargar anime',
      'game vault',
    ],
    contenido: [
      'Crunchyroll:',
      '· Plan Fan: $5.490/mes | 1 dispositivo | Catálogo completo sin anuncios | Estrenos desde Japón.',
      '· Plan Mega Fan: $6.990/mes | 4 dispositivos | Catálogo, estrenos, descargas offline y Crunchyroll Game Vault.',
      'Promoción de adquisición (Claro/VTR): Plan Fan con 2 meses gratis para nuevas contrataciones (sujeto a condiciones vigentes).',
      'Es la opción más económica de la tabla entre las plataformas listadas.',
      NOTA_BOLETA,
      NOTA_TABLA,
    ],
    imagenes: ['/img-crunchyroll.png'],
    fuente: 'entrenamiento-streaming-comercial',
  },
  {
    id: 'ott-tnt-max-planes',
    titulo: 'TNT Sports Pack (con Max) — precio e incluye',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → TNT Sports / Max',
    intencion: 'TNT_MAX_PLANES',
    sinonimos: [
      'tnt sports',
      'tnt',
      'tnt max',
      'max tnt',
      'pack tnt',
      'futbol chileno',
      'campeonato nacional',
      'precio tnt',
      'cuanto sale tnt',
      'solo deportes',
      'deportes en vivo',
    ],
    contenido: [
      'TNT Sports Pack (con Max): $13.990/mes.',
      '· 1 dispositivo simultáneo.',
      '· Fútbol chileno: Campeonato Nacional, Liga de Ascenso, Copa Chile, Supercopa + contenidos deportivos.',
      '· Acceso al catálogo de series/películas/programas de la app Max con credenciales VTR.',
      'Opción orientada a deportes; Disney+ Premium ($15.990) también trae ESPN con más pantallas/4K.',
      NOTA_BOLETA,
      NOTA_TABLA,
    ],
    imagenes: ['/Gemini_Generated_Image_40poir40poir40po.jpg'],
    fuente: 'entrenamiento-streaming-comercial',
  },
  {
    id: 'ott-pack-adulto-planes',
    titulo: 'Pack Adulto VTR (prodPRADUL) — precio y canales',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → Pack Adulto',
    intencion: 'PACK_ADULTO',
    sinonimos: [
      'pack adulto',
      'pack adultos',
      'canales adultos',
      'canales para adultos',
      'prodpradul',
      'prodPRADUL',
      'playboy',
      'playboy hd',
      'venus',
      'sextreme',
      'sex treme',
      'hotgo',
      'hot go',
      'precio pack adulto',
      'cuanto sale pack adulto',
      'cuanto cuesta pack adulto',
      'contratar pack adulto',
    ],
    contenido: [
      'Pack Adulto VTR (código producto prodPRADUL) — pack de canales cable + app HotGo.',
      'Tarifa lista: $7.490/mes (IVA incluido, según ficha comercial vigente).',
      'Promoción de adquisición (según campaña vigente en vtr.com): $3.745 los 3 primeros meses; luego pasa a tarifa lista. Confirma vigencia antes de tipificar.',
      'Canales incluidos (D-Box / D-Box PRO):',
      '· Playboy — señal 501',
      '· Venus — señal 502',
      '· Sextreme — señal 503',
      '· Playboy HD — señal 869',
      'App HotGo: acceso a 700+ títulos en www.hotgo.tv (marcas líderes de entretenimiento para adultos).',
      'Requisito: servicio de TV cable VTR con D-Box o D-Box PRO. Control parental disponible en todos los D-Box.',
      'Cobro: mensualidad se cobra completa aunque se desconecte anticipadamente en el mes.',
      'Ficha oficial: https://vtr.com/product/prodPRADUL',
      NOTA_BOLETA,
      NOTA_TABLA,
    ],
    imagenes: [
      'https://vtr.com/content/prodPRADUL/logo-canales-pack-adulto.jpg',
      'https://vtr.com/content/staticImages/logo-playboy119.png',
      'https://vtr.com/content/staticImages/venus119.png',
    ],
    fuente: 'entrenamiento-streaming-comercial',
  },
  {
    id: 'ott-pack-adulto-venta',
    titulo: 'Pack Adulto — cartilla de venta, pitch y objeciones',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → Pack Adulto → Venta',
    intencion: 'PACK_ADULTO',
    sinonimos: [
      'vender pack adulto',
      'argumentos pack adulto',
      'objeciones pack adulto',
      'pitch pack adulto',
      'speech pack adulto',
      'cartilla pack adulto',
      'como ofrecer pack adulto',
      'beneficios pack adulto',
    ],
    contenido: [
      'Cartilla de venta Pack Adulto (asesor comercial):',
      'Beneficio clave: 4 canales cable + HotGo (700+ títulos) en una sola renta de boleta hogar.',
      'Pitch corto: “Con Pack Adulto tienes Playboy, Venus, Sextreme y Playboy HD en el D-Box, más HotGo en la app/web, cobrado en tu boleta VTR. Hoy puedes partir con promo de adquisición si está vigente.”',
      'Speech telefónico sugerido: “Señor/a [nombre], además de su plan actual puedo ofrecerle Pack Adulto: canales 501, 502, 503 y 869 en HD donde aplique, más acceso HotGo. La tarifa lista es $7.490; si la campaña está activa, los primeros 3 meses van a $3.745. ¿Le interesa activarlo hoy?”',
      'Objeción “es caro”: ancla valor (4 señales + HotGo vs. contratar apps sueltas) y menciona promo 3 meses si aplica. Recuerda control parental.',
      'Objeción “hay menores en la casa”: explica bloqueo parental en D-Box; el pack se puede restringir por PIN.',
      'Objeción “no lo usaré todo el mes”: informa que la mensualidad se cobra completa aunque se desconecte antes de fin de mes.',
      'Objeción “solo quiero una app”: HotGo viene incluido; los canales cable siguen disponibles en TV sin depender solo de internet.',
      'Condiciones de venta: sujeto a factibilidad técnica/comercial; requiere TV/D-Box; tipificar prodPRADUL / Canales Premium según flujo Andes vigente; no prometer canales fuera de la grilla publicada.',
      'Cierre: “¿Lo dejamos activo desde hoy para que lo vea esta noche en el D-Box?”',
    ],
    imagenes: ['https://vtr.com/content/prodPRADUL/logo-canales-pack-adulto.jpg'],
    fuente: 'entrenamiento-streaming-comercial',
  },
  {
    id: 'ott-pack-adulto-activacion',
    titulo: 'Pack Adulto — activación y tipificación',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → Pack Adulto → Activación',
    intencion: 'PACK_ADULTO',
    sinonimos: [
      'activar pack adulto',
      'como activo pack adulto',
      'tipificar pack adulto',
      'contratar canales adultos',
      'agregar playboy',
      'agregar venus',
      'venta canales premium adulto',
    ],
    contenido: [
      'Activación Pack Adulto (prodPRADUL):',
      '1) Valida factibilidad y que el cliente tenga TV cable con D-Box / D-Box PRO.',
      '2) Informa precio lista $7.490 y promo vigente (si aplica: $3.745 × 3 meses).',
      '3) Tipifica venta de Canales Premium / Pack Adulto según procedimiento comercial Andes (código prodPRADUL).',
      '4) Explica señales: 501 Playboy, 502 Venus, 503 Sextreme, 869 Playboy HD + HotGo en www.hotgo.tv.',
      '5) Ofrece configurar control parental en el D-Box si hay menores en el hogar.',
      '6) Avisa: la mensualidad se cobra completa aunque se desconecte anticipadamente.',
      'Cliente puede revisar/contratar también en https://vtr.com/product/prodPRADUL (¡Lo activo!).',
      'Si es consulta de cobro/no reconoce cargo → Billing Compare / No reconoce cobros SVA-Canales Premium según flujo.',
    ],
    imagenes: [],
    fuente: 'entrenamiento-streaming-comercial',
  },
  {
    id: 'ott-comparativa-asesor',
    titulo: 'Comparativa rápida streaming (asesor comercial)',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → Comparativa',
    intencion: 'STREAMING_COMPARATIVA',
    sinonimos: [
      'comparar streaming',
      'plataforma mas barata',
      'cual es mas barato',
      '4 dispositivos',
      'cuatro pantallas',
      'somos cuatro',
      'necesito cuatro pantallas',
      'deportes y 4k',
      'peliculas y deportes',
      'planes streaming precios',
    ],
    contenido: [
      'Guía rápida asesor:',
      '· Más barata: Crunchyroll Fan $5.490 (anime).',
      '· 4 pantallas: Netflix Premium $12.990 | Disney+ Premium $15.990 | Crunchyroll Mega Fan $6.990.',
      '· Deportes económicos: TNT Sports Pack con Max $13.990 (1 pantalla). Disney+ Premium $15.990 (ESPN + 4K + 4 pantallas).',
      '· Deportes + películas: Disney+ Premium o TNT+Max.',
      '· Compartir fuera del hogar: solo Netflix Estándar (1 miembro extra) / Premium (2).',
      '· Canales adultos (cable): Pack Adulto $7.490 (promo adquisición $3.745 × 3 meses si vigente) — Playboy/Venus/Sextreme/Playboy HD + HotGo.',
      NOTA_TABLA,
    ],
    imagenes: ['/img-netflix.png', '/img-disney.png', '/img-crunchyroll.png'],
    fuente: 'entrenamiento-streaming-comercial',
  },
  {
    id: 'ott-soporte-acceso',
    titulo: 'Soporte acceso streaming / CONTACTESE CON VTR / OTT',
    categoria: 'STREAMING',
    tipo: 'streaming',
    seccionPortal: 'Streaming → Soporte OTT',
    intencion: 'STREAMING_SOPORTE',
    sinonimos: [
      'contactese con vtr',
      'contactese con vtr max',
      'contrate y no puedo ingresar',
      'no me llegaron las credenciales',
      'no puedo ver tnt',
      'contrate max y no me deja entrar',
      'transferir a ott',
      'sucursal virtual streaming',
    ],
    contenido: [
      'Si contrató la plataforma pero no puede ingresar: valida contratación activa y credenciales correctas.',
      'Mensaje "CONTACTESE CON VTR" (TNT Sports / Max): 1) Sucursal Virtual → verificar credenciales. 2) Activar TNT Sports Premium: https://www.hbomax.com/cl/es/activatntsports o https://auth.hbomax.com/providers (elegir vtr; URL legítima, no es bloqueo Subtel de apuestas). 3) Si persiste → transferir a OTT (VTR Técnico) con credenciales a la mano.',
      'Credenciales no recibidas: validar estado de contratación y mecanismo de entrega/activación según procedimiento comercial.',
      'Activación habitual: Sucursal Virtual con RUT + contraseña VTR del cliente.',
    ],
    imagenes: [],
    fuente: 'entrenamiento-streaming-comercial',
  },
]

/** FAQ base (asesor + problemas + precios) */
const EJEMPLOS_STREAMING_BASE = [
  {
    pregunta: '¿Cuál es el plan más económico para ver deportes en vivo y qué incluye?',
    respuesta:
      'El más económico orientado a deportes es TNT Sports Pack (con Max) por $13.990/mes: fútbol chileno (Campeonato Nacional, Liga de Ascenso, Copa Chile, Supercopa) en 1 dispositivo, más catálogo Max con credenciales VTR. Disney+ Premium ($15.990) también trae ESPN (+500 eventos) con más pantallas.',
    intencion: 'TNT_MAX_PLANES',
  },
  {
    pregunta: '¿Qué opciones tengo si quiero una plataforma con catálogo sin anuncios por menos de $6.000 al mes?',
    respuesta:
      'Crunchyroll Plan Fan a $5.490/mes: anime sin anuncios, estrenos desde Japón, 1 dispositivo. Promoción de adquisición: 2 meses gratis para nuevas contrataciones (condiciones vigentes).',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: 'Somos 4 personas en la casa y queremos ver contenido en pantallas distintas al mismo tiempo, ¿qué planes nos sirven?',
    respuesta:
      'Para 4 dispositivos simultáneos: Netflix Premium $12.990 (4K+HDR), Disney+ Premium $15.990 (4K+HDR+ESPN) o Crunchyroll Mega Fan $6.990 (descargas + Game Vault).',
    intencion: 'STREAMING_COMPARATIVA',
  },
  {
    pregunta: '¿Puedo compartir mi cuenta con familiares o amigos que no vivan en mi casa?',
    respuesta:
      'Depende. Netflix permite miembros extra fuera del hogar en Estándar (1) y Premium (2). El Básico no. Otras plataformas de la tabla no destacan esa opción igual que Netflix.',
    intencion: 'NETFLIX_PLANES',
  },
  {
    pregunta: '¿Qué hago si contraté TNT Sports en Max pero me sale el mensaje CONTACTESE CON VTR?',
    respuesta:
      '1) Sucursal Virtual: verifica credenciales. 2) Activar TNT Sports Premium en https://www.hbomax.com/cl/es/activatntsports o https://auth.hbomax.com/providers (proveedor vtr). 3) Si sigue → transferir a VTR Técnico (OTT) con credenciales a mano.',
    intencion: 'STREAMING_SOPORTE',
  },
  {
    pregunta: '¿Cuál es el plan más barato de Netflix?',
    respuesta: 'Netflix Básico: $7.190/mes (1 dispositivo, 720p HD, descargas en 1). Confirma tabla vigente.',
    intencion: 'NETFLIX_PLANES',
  },
  {
    pregunta: 'Quiero Netflix para varias personas, ¿qué plan necesito?',
    respuesta:
      'Mira dispositivos: Estándar 2 pantallas ($9.990) o Premium 4 pantallas ($12.990, 4K). Premium también permite hasta 2 miembros extra.',
    intencion: 'NETFLIX_PLANES',
  },
  {
    pregunta: '¿Qué plan de Netflix tiene 4K?',
    respuesta: 'Netflix Premium ($12.990/mes): 4K UHD + HDR, 4 dispositivos, audio espacial.',
    intencion: 'NETFLIX_PLANES',
  },
  {
    pregunta: '¿Netflix tiene anuncios?',
    respuesta:
      'En la tabla comparativa de referencia, los planes Básico/Estándar/Premium se indican sin publicidad (juegos, series y películas). Confirma siempre la modalidad vigente.',
    intencion: 'NETFLIX_PLANES',
  },
  {
    pregunta: '¿Cuál es el plan más barato de Disney+?',
    respuesta: 'Disney+ Estándar: $10.990/mes (2 dispositivos, sin ESPN ni 4K). Premium es $15.990.',
    intencion: 'DISNEY_PLANES',
  },
  {
    pregunta: '¿Qué plan de Disney+ tiene 4K?',
    respuesta: 'Disney+ Premium: 4K UHD/HDR, Dolby Atmos, 4 dispositivos y ESPN.',
    intencion: 'DISNEY_PLANES',
  },
  {
    pregunta: '¿Disney+ incluye ESPN?',
    respuesta: 'Sí, en Disney+ Premium ($15.990/mes): canales y eventos ESPN (+500 al mes). El Estándar no incluye ESPN.',
    intencion: 'DISNEY_PLANES',
  },
  {
    pregunta: 'Quiero Disney para ver fútbol y deportes',
    respuesta: 'Disney+ Premium a $15.990/mes incluye ESPN y catálogo Disney+, con 4 pantallas y 4K.',
    intencion: 'DISNEY_PLANES',
  },
  {
    pregunta: '¿Cuántas personas pueden usar Disney+ al mismo tiempo?',
    respuesta: 'Estándar: 2 dispositivos. Premium: 4 dispositivos simultáneos.',
    intencion: 'DISNEY_PLANES',
  },
  {
    pregunta: '¿Cuál es el plan más económico de Crunchyroll?',
    respuesta: 'Plan Fan $5.490/mes (1 dispositivo, sin anuncios). Mega Fan $6.990 (4 dispositivos + descargas + Game Vault).',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: 'Quiero Crunchyroll sin anuncios',
    respuesta: 'Plan Fan $5.490/mes: catálogo anime sin anuncios. También Mega Fan $6.990 si necesitas descargas o 4 pantallas.',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: '¿Qué diferencia hay entre Crunchyroll Fan y Mega Fan?',
    respuesta:
      'Ambos sin anuncios. Fan: 1 dispositivo, $5.490. Mega Fan: 4 dispositivos, descargas offline, Game Vault, $6.990.',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: '¿Cuánto cuesta Crunchyroll Mega Fan?',
    respuesta: 'Mega Fan: $6.990/mes.',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: '¿Puedo descargar anime en Crunchyroll?',
    respuesta: 'Sí, en Plan Mega Fan (descargas sin conexión). El Fan no destaca descargas en la tabla.',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: '¿Cuánto cuesta TNT Sports en Max?',
    respuesta: 'TNT Sports Pack con Max: $13.990/mes.',
    intencion: 'TNT_MAX_PLANES',
  },
  {
    pregunta: '¿Qué incluye TNT Sports en Max?',
    respuesta:
      'Fútbol chileno (Campeonato Nacional, Liga de Ascenso, Copa Chile, Supercopa), contenidos deportivos, 1 dispositivo, y catálogo Max con credenciales VTR.',
    intencion: 'TNT_MAX_PLANES',
  },
  {
    pregunta: 'Quiero contratar solo deportes',
    respuesta:
      'TNT Sports Pack con Max $13.990/mes (deportes + Max, 1 pantalla). Alternativa: Disney+ Premium $15.990 con ESPN y 4 pantallas/4K.',
    intencion: 'TNT_MAX_PLANES',
  },
  {
    pregunta: '¿TNT Sports en Max incluye todo el fútbol chileno?',
    respuesta: 'Incluye Campeonato Nacional, Liga de Ascenso, Copa Chile y Supercopa (según tabla).',
    intencion: 'TNT_MAX_PLANES',
  },
  {
    pregunta: '¿Cuántas pantallas puedo usar con TNT Sports?',
    respuesta: '1 dispositivo simultáneo en TNT Sports Pack con Max.',
    intencion: 'TNT_MAX_PLANES',
  },
  {
    pregunta: '¿Cuál es la plataforma más barata?',
    respuesta: 'Crunchyroll Fan a $5.490/mes es la más económica de la comparativa Netflix/Disney+/Crunchyroll/TNT.',
    intencion: 'STREAMING_COMPARATIVA',
  },
  {
    pregunta: 'quiero algo barato para ver anime',
    respuesta: 'Crunchyroll Fan $5.490/mes (sin anuncios, 1 pantalla). Pregunta por la promo de 2 meses gratis si es nueva contratación.',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: 'quiero algo barato para ver deportes',
    respuesta: 'TNT Sports Pack con Max $13.990/mes. Disney+ Premium $15.990 si quieres ESPN + más pantallas/4K.',
    intencion: 'STREAMING_COMPARATIVA',
  },
  {
    pregunta: 'quiero una plataforma para deportes pero también películas',
    respuesta:
      'Disney+ Premium ($15.990): catálogo + ESPN. O TNT Sports Pack con Max ($13.990): deportes + catálogo Max.',
    intencion: 'STREAMING_COMPARATIVA',
  },
  {
    pregunta: '¿Cuál tiene más dispositivos simultáneos?',
    respuesta: 'Netflix Premium, Disney+ Premium y Crunchyroll Mega Fan permiten hasta 4 dispositivos.',
    intencion: 'STREAMING_COMPARATIVA',
  },
  {
    pregunta: 'somos cuatro en la casa',
    respuesta: 'Si necesitan 4 reproducciones a la vez: Netflix Premium, Disney+ Premium o Crunchyroll Mega Fan.',
    intencion: 'STREAMING_COMPARATIVA',
  },
  {
    pregunta: '¿Qué plataforma tiene deportes y 4K?',
    respuesta: 'Disney+ Premium: ESPN + 4K UHD/HDR + Dolby Atmos.',
    intencion: 'DISNEY_PLANES',
  },
  {
    pregunta: 'quiero anime y poder descargarlo',
    respuesta: 'Crunchyroll Mega Fan $6.990: sin anuncios, 4 pantallas, descargas y Game Vault.',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: 'contraté la plataforma pero no puedo ingresar',
    respuesta:
      'Verifica credenciales y que la contratación esté activa. Si persiste, sigue el procedimiento de soporte / transferir a OTT según corresponda.',
    intencion: 'STREAMING_SOPORTE',
  },
  {
    pregunta: 'contraté TNT Sports y me aparece CONTACTESE CON VTR',
    respuesta:
      'Sucursal Virtual → verifica credenciales. Activar TNT Sports Premium: https://www.hbomax.com/cl/es/activatntsports o https://auth.hbomax.com/providers (vtr). Si continúa → deriva a VTR Técnico (OTT).',
    intencion: 'STREAMING_SOPORTE',
  },
  {
    pregunta: 'no me llegaron las credenciales',
    respuesta:
      'Valida el estado de la contratación y el canal de entrega/activación de credenciales según procedimiento comercial. Si no figuran, escala según flujo OTT/comercial.',
    intencion: 'STREAMING_SOPORTE',
  },
  {
    pregunta: 'cuanto sale Crunchyroll',
    respuesta: 'Fan $5.490/mes | Mega Fan $6.990/mes. Fan puede tener 2 meses gratis en adquisición (condiciones vigentes).',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: 'cuanto sale Disney',
    respuesta: 'Disney+ Estándar $10.990/mes | Premium $15.990/mes.',
    intencion: 'DISNEY_PLANES',
  },
  {
    pregunta: 'cuanto sale TNT Sports',
    respuesta: 'TNT Sports Pack con Max: $13.990/mes.',
    intencion: 'TNT_MAX_PLANES',
  },
  {
    pregunta: 'hay meses gratis',
    respuesta:
      'En la tabla, Crunchyroll Plan Fan indica 2 meses gratis para nuevas contrataciones (promoción de adquisición). Confirma vigencia antes de ofrecer.',
    intencion: 'CRUNCHYROLL_PLANES',
  },
  {
    pregunta: 'cuanto cuesta Netflix',
    respuesta: 'Básico $7.190 | Estándar $9.990 | Premium $12.990 (mensual, según tabla).',
    intencion: 'NETFLIX_PLANES',
  },
  {
    pregunta: '¿Cuánto cuesta el Pack Adulto?',
    respuesta:
      'Pack Adulto (prodPRADUL): $7.490/mes lista. Promo de adquisición (si vigente): $3.745 los 3 primeros meses. Incluye Playboy 501, Venus 502, Sextreme 503, Playboy HD 869 y HotGo. Confirma campaña antes de tipificar.',
    intencion: 'PACK_ADULTO',
  },
  {
    pregunta: 'cuanto sale pack adulto',
    respuesta:
      'Lista $7.490/mes. Promo adquisición vigente en ficha: $3.745 × 3 meses, luego $7.490. Cobro en boleta hogar.',
    intencion: 'PACK_ADULTO',
  },
  {
    pregunta: '¿Qué canales trae el Pack Adulto?',
    respuesta:
      'Playboy (501), Venus (502), Sextreme (503), Playboy HD (869) en D-Box/D-Box PRO, más app HotGo (700+ títulos en hotgo.tv).',
    intencion: 'PACK_ADULTO',
  },
  {
    pregunta: 'quiero contratar playboy',
    respuesta:
      'Va en Pack Adulto VTR: Playboy + Venus + Sextreme + Playboy HD + HotGo. Tarifa $7.490 (promo $3.745 × 3 meses si aplica). Requiere TV/D-Box. Ficha: https://vtr.com/product/prodPRADUL',
    intencion: 'PACK_ADULTO',
  },
  {
    pregunta: 'hay menores en la casa y preguntan por canales adultos',
    respuesta:
      'Puedes ofrecer Pack Adulto y explicar que todos los D-Box tienen control parental (PIN) para bloquear esas señales. Informa precio y cobro completo del mes aunque se desconecte anticipado.',
    intencion: 'PACK_ADULTO',
  },
  {
    pregunta: 'speech o pitch para vender pack adulto',
    respuesta:
      'Speech: “Además de su plan, Pack Adulto le deja Playboy, Venus, Sextreme y Playboy HD en el D-Box más HotGo en la app, cobrado en boleta. Lista $7.490; con promo vigente parte en $3.745 por 3 meses. ¿Lo activamos hoy?” Objeciones: valor 4 canales+app, parental, cobro mes completo.',
    intencion: 'PACK_ADULTO',
  },
  {
    pregunta: 'cómo activo el Pack Adulto',
    respuesta:
      'Valida TV/D-Box → informa precio/promo → tipifica prodPRADUL / Canales Premium según Andes → explica señales 501/502/503/869 + HotGo → ofrece parental. También https://vtr.com/product/prodPRADUL',
    intencion: 'PACK_ADULTO',
  },
]

const RESPUESTA_POR_INTENCION = {
  NETFLIX_PLANES:
    'Netflix vía VTR: Básico $7.190 (1 disp./720p), Estándar $9.990 (2 disp./1080p + 1 miembro extra), Premium $12.990 (4 disp./4K + hasta 2 miembros extra). Cobro en boleta del hogar.',
  DISNEY_PLANES:
    'Disney+: Estándar $10.990 (2 disp., sin ESPN/4K) | Premium $15.990 (4 disp., ESPN, 4K/HDR, Dolby Atmos).',
  CRUNCHYROLL_PLANES:
    'Crunchyroll: Fan $5.490 (1 disp., sin anuncios; promo 2 meses gratis en adquisición) | Mega Fan $6.990 (4 disp., descargas, Game Vault).',
  TNT_MAX_PLANES:
    'TNT Sports Pack con Max: $13.990/mes, 1 dispositivo, fútbol chileno (Nacional, Ascenso, Copa Chile, Supercopa) + catálogo Max con credenciales VTR.',
  PACK_ADULTO:
    'Pack Adulto (prodPRADUL): $7.490/mes (promo adquisición $3.745 × 3 meses si vigente). Canales 501 Playboy, 502 Venus, 503 Sextreme, 869 Playboy HD + HotGo. Requiere D-Box; parental disponible; mensualidad se cobra completa si se baja antes de fin de mes. https://vtr.com/product/prodPRADUL',
  STREAMING_COMPARATIVA:
    'Más barata: Crunchyroll Fan $5.490. Cuatro pantallas: Netflix Premium, Disney+ Premium o Crunchyroll Mega Fan. Deportes: TNT+Max $13.990 o Disney+ Premium $15.990 (ESPN/4K). Canales adultos cable: Pack Adulto $7.490.',
  STREAMING_SOPORTE:
    'Valida contratación y credenciales en Sucursal Virtual. Si aparece CONTACTESE CON VTR o no puede activar → transferir a OTT (VTR Técnico).',
}

const FRASES_REALISTAS = [
  {
    intencion: 'NETFLIX_PLANES',
    frases: [
      'cuanto cuesta netflix',
      'cuanto sale netflix',
      'precio netflix',
      'planes de netflix',
      'netflix basico',
      'netflix premium',
      'netflix 4k',
      'quiero netflix',
      'quiero contratar netflix',
      'compartir netflix',
      'miembros extra netflix',
      'netflix para 4 personas',
      'netflix sin anuncios',
      'plan mas barato netflix',
    ],
  },
  {
    intencion: 'DISNEY_PLANES',
    frases: [
      'cuanto sale disney',
      'cuanto cuesta disney+',
      'precio disney',
      'disney premium',
      'disney 4k',
      'disney incluye espn',
      'quiero disney para futbol',
      'disney deportes',
      'cuantas pantallas disney',
      'quiero contratar disney',
      'plan mas barato disney',
    ],
  },
  {
    intencion: 'CRUNCHYROLL_PLANES',
    frases: [
      'cuanto sale crunchyroll',
      'cuánto cuesta crunchyroll',
      'precio crunchyroll',
      'precio de crunchy',
      'cuanto vale crunchyroll',
      'quiero crunchyroll',
      'quiero contratar crunchyroll',
      'crunchyroll precio',
      'crunchy fan',
      'cuanto sale el fan',
      'cuanto sale el mega fan',
      'diferencia entre fan y mega fan',
      'quiero anime barato',
      'quiero anime sin anuncios',
      'quiero descargar anime',
      'crunchyroll tiene descargas',
      'puedo ver anime sin anuncios',
      'precio crunchyroll por mes',
      'cuánto pago por crunchyroll',
      'que planes tiene crunchyroll',
      'planes de crunchyroll',
      'quiero crunchyroll para 4 personas',
      'hay meses gratis crunchyroll',
      'promo crunchyroll',
    ],
  },
  {
    intencion: 'TNT_MAX_PLANES',
    frases: [
      'cuanto sale tnt sports',
      'precio tnt',
      'tnt sports max',
      'quiero solo deportes',
      'futbol chileno streaming',
      'tnt incluye max',
      'contratar tnt sports',
      'pantallas tnt sports',
      'pack tnt con max',
    ],
  },
  {
    intencion: 'PACK_ADULTO',
    frases: [
      'cuanto sale pack adulto',
      'cuanto cuesta pack adulto',
      'precio pack adulto',
      'quiero pack adulto',
      'contratar pack adulto',
      'pack adultos',
      'canales adultos',
      'canales para adultos',
      'quiero playboy',
      'quiero contratar playboy',
      'venus canal',
      'sextreme',
      'playboy hd',
      'hotgo',
      'prodpradul',
      'activar pack adulto',
      'como activo pack adulto',
      'vender pack adulto',
      'speech pack adulto',
      'objeciones pack adulto',
      'que canales trae pack adulto',
    ],
  },
  {
    intencion: 'STREAMING_COMPARATIVA',
    frases: [
      'plataforma mas barata',
      'cual streaming es mas barato',
      'necesito cuatro pantallas',
      'somos 4 en la casa',
      'comparar netflix disney crunchyroll',
      'quiero deportes y peliculas',
      'cual tiene mas dispositivos',
    ],
  },
  {
    intencion: 'STREAMING_SOPORTE',
    frases: [
      'contactese con vtr',
      'me sale contactese con vtr',
      'contrate tnt y no puedo verlo',
      'contrate max pero no me deja entrar',
      'no me llegaron las credenciales',
      'contrate y todavía no puedo usarla',
      'no puedo ingresar a la plataforma',
    ],
  },
]

function ejemplosDesdeFrases(ya) {
  const vistos = new Set(ya.map((e) => normFraseKey(e.pregunta)))
  const out = []
  for (const bloque of FRASES_REALISTAS) {
    const respuesta = RESPUESTA_POR_INTENCION[bloque.intencion]
    if (!respuesta) continue
    for (const frase of bloque.frases) {
      const key = normFraseKey(frase)
      if (!key || vistos.has(key)) continue
      vistos.add(key)
      out.push({ pregunta: frase, respuesta, intencion: bloque.intencion })
    }
  }
  return out
}

function frasesIntencion(id) {
  return (FRASES_REALISTAS.find((b) => b.intencion === id)?.frases || []).map(normFraseKey)
}

// Enriquecer sinonimos de docs canónicos con frases
for (const doc of DOCS_STREAMING_COMERCIAL) {
  if (doc.intencion) {
    doc.sinonimos = [...new Set([...(doc.sinonimos || []), ...frasesIntencion(doc.intencion)])]
  }
}

export const EJEMPLOS_STREAMING_COMERCIAL = [
  ...EJEMPLOS_STREAMING_BASE,
  ...ejemplosDesdeFrases(EJEMPLOS_STREAMING_BASE),
]

export function docsEjemplosStreamingADocs() {
  return EJEMPLOS_STREAMING_COMERCIAL.map((ej, i) => {
    const pregNorm = normFraseKey(ej.pregunta)
    const STOP = new Set([
      'que',
      'como',
      'por',
      'para',
      'una',
      'este',
      'esta',
      'tengo',
      'tiene',
      'pero',
      'quiero',
      'cuanto',
      'cual',
      'plan',
      'planes',
    ])
    const claves = pregNorm
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w))
      .filter((w) => !['internet', 'plataforma', 'servicio'].includes(w))
      .slice(0, 8)
    return {
      id: `ott-ej-${String(i + 1).padStart(3, '0')}`,
      titulo: ej.pregunta.replace(/\?+$/, '').slice(0, 90),
      categoria: 'STREAMING',
      tipo: 'streaming',
      seccionPortal: 'Entrenamiento streaming comercial',
      intencion: ej.intencion,
      sinonimos: [ej.pregunta, pregNorm, ej.intencion, ...claves],
      contenido: [ej.respuesta],
      fuente: 'entrenamiento-streaming-ejemplos',
      ejemploPregunta: ej.pregunta,
    }
  })
}

export function docsStreamingComercialCompletos() {
  return [...DOCS_STREAMING_COMERCIAL, ...docsEjemplosStreamingADocs()]
}
