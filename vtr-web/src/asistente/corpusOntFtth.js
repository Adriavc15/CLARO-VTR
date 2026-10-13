/**
 * Corpus de entrenamiento: ONT / FTTH / luces / sin internet.
 * Intenciones + muchas variaciones naturales (incluye jerga) para el chatbot Apex.
 * Complementa Somos Clave 997 (Inconvenientes Internet FTTH-HFC).
 */

const SC_997 =
  'Si no se resuelve en domicilio, continúa con el procedimiento Somos Clave ID 997 (Inconvenientes Internet FTTH-HFC): revisar masivo del sector y, si no hay masivo con LOS rojo, visita técnica según ruta Sin Internet Fibra.'

/** Pares pregunta→respuesta para few-shot / aprendizaje (bloque base) */
const EJEMPLOS_ONT_FTTH_BASE = [
  // LOS rojo
  {
    pregunta: '¿Qué significa cuando la luz LOS está roja?',
    respuesta:
      'La luz LOS roja normalmente indica que la ONT no está recibiendo correctamente la señal óptica de fibra. Puede deberse a un problema con la fibra, conectores, instalación o señal óptica.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'Tengo la luz roja en la ONT y no tengo internet.',
    respuesta:
      'Si la luz LOS está roja, primero verifica que el cable de fibra esté correctamente conectado y que no esté doblado, aplastado o dañado. Si continúa en rojo, puede requerir revisión técnica (y validar masivo del sector).',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: '¿Por qué mi ONT está en rojo?',
    respuesta:
      'Depende de qué indicador esté rojo. Si es LOS, generalmente corresponde a pérdida o ausencia de señal óptica. Si es otro indicador, dime qué luz está encendida y lo identificamos.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'Se me prendió una luz roja en la cajita de internet.',
    respuesta:
      'Esa cajita es la ONT. Revisa si la luz que está roja dice LOS. Si es así, significa que la ONT detecta un problema con la señal de fibra.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'Mi LOS está parpadeando rojo.',
    respuesta:
      'Una luz LOS roja o parpadeando puede indicar pérdida de señal óptica. Verifica las conexiones de fibra y, si no se normaliza, habrá que revisar la conexión / señal.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'Mano, se me fue el internet y la cajita está con una luz roja.',
    respuesta:
      'Entiendo. Revisa si la luz roja corresponde al indicador LOS. Si es así, normalmente indica que la ONT está perdiendo la señal óptica. Verifica también que el cable de fibra esté conectado y que no esté doblado.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'tengo problemas con LOS',
    respuesta:
      'Si el LOS está en rojo o con problema, la ONT no está recibiendo bien la señal de fibra. Revisa el cable óptico (que no esté flojo, doblado o dañado). Si sigue igual, toca validar masivo y generar visita técnica.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'necesito ayuda, tengo problemas con LOS',
    respuesta:
      'Claro. Si el LOS está en rojo, la ONT no recibe señal óptica. Revisa el cable de fibra (conexiones, que no esté doblado/aplastado). Si no se recupera, valida masivo del sector y genera visita técnica.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'me sale una luz roja en el router',
    respuesta:
      'Esa luz roja suele ser el indicador LOS (aunque digan router/módem/repetidor). Significa pérdida de señal óptica: revisa la fibra en la ONT y, si no se recupera, visita técnica.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'luz roja en el modem',
    respuesta:
      'Si ves luz roja en el módem/ONT, casi siempre es LOS: no hay señal óptica. Chequea conexiones de fibra; si persiste, genera visita.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'luz roja en el repetidor',
    respuesta:
      'Si el equipo (ONT/router/repetidor) muestra luz roja tipo LOS, es pérdida de señal óptica. Revisa fibra en la ONT principal; el repetidor solo refleja el problema de red.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'luz roja en el extensor',
    respuesta:
      'Luz roja en extensor/mesh a veces es señal débil, pero si es LOS en la ONT principal es pérdida óptica. Confirma en la cajita principal si LOS está rojo.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'router con luz roja no navego',
    respuesta:
      'Sin navegación + luz roja suele ser LOS: la ONT no recibe fibra. Revisa el cable óptico y reinicia; si sigue rojo, visita técnica.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'No tengo internet, está parpadeando rojo esa vaina.',
    respuesta:
      'Revisemos qué indicador está parpadeando. Si dice LOS, puede indicar pérdida de señal óptica. Dime qué luces aparecen encendidas en la ONT y te ayudo a identificar el estado.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'Reinicié la ONT y sigue la luz LOS roja.',
    respuesta:
      'Si después del reinicio el LOS continúa rojo, probablemente no se soluciona solo con reinicio: hay que revisar señal óptica y conexión de fibra (masivo / visita técnica según procedimiento).',
    intencion: 'ONT_LOS_ROJO',
  },
  // PON
  {
    pregunta: '¿Qué significa la luz PON?',
    respuesta:
      'La luz PON indica el estado de conexión de la ONT con la red de fibra óptica.',
    intencion: 'ONT_PON',
  },
  {
    pregunta: 'Mi PON está apagada.',
    respuesta:
      'Si la luz PON está apagada, la ONT podría no estar registrándose correctamente en la red o podría haber un problema con la señal óptica. Conviene revisar también el indicador LOS.',
    intencion: 'ONT_PON',
  },
  {
    pregunta: '¿La PON debería estar verde?',
    respuesta:
      'En muchos modelos, una PON verde fija indica que la ONT está correctamente registrada y conectada a la red. La interpretación exacta puede variar según el modelo.',
    intencion: 'ONT_PON',
  },
  {
    pregunta: 'Tengo PON verde pero no tengo internet.',
    respuesta:
      'Si PON está normal pero no hay navegación, el problema podría estar después de la óptica: router, Wi-Fi, Ethernet o el servicio de Internet. Revisa también que LOS esté apagada.',
    intencion: 'ONT_PON_SIN_INTERNET',
  },
  {
    pregunta: 'La PON está verde pero no me carga nada.',
    respuesta:
      'Si la PON está verde y la LOS está apagada, la conexión óptica aparentemente está estable. Revisemos si el problema está en el Wi-Fi, el cable de red o el router.',
    intencion: 'ONT_PON_SIN_INTERNET',
  },
  // ONT apagada
  {
    pregunta: 'Mi ONT no enciende.',
    respuesta:
      'Primero verifica que el adaptador de corriente esté conectado correctamente a la ONT y al enchufe. Prueba otro enchufe. Si no enciende ningún indicador, puede haber problema de alimentación o del equipo.',
    intencion: 'ONT_APAGADA',
  },
  {
    pregunta: 'Todas las luces de mi ONT están apagadas.',
    respuesta:
      'Revisa la fuente de alimentación y el enchufe. Si la ONT continúa completamente apagada, puede tratarse de un problema eléctrico o una falla del equipo.',
    intencion: 'ONT_APAGADA',
  },
  {
    pregunta: 'Se apagó la ONT de repente.',
    respuesta:
      'Verifica si hubo un corte de energía y que el adaptador no se haya desconectado. Si hay energía y la ONT no vuelve a encender, se debe realizar una revisión.',
    intencion: 'ONT_APAGADA',
  },
  // Luces normales sin internet
  {
    pregunta: 'Tengo todas las luces normales pero no tengo internet.',
    respuesta:
      'Si la ONT muestra conexión óptica normal, podemos descartar inicialmente una pérdida de señal óptica. Hay que revisar router, Ethernet, Wi-Fi y si otros dispositivos presentan el mismo problema.',
    intencion: 'ONT_OK_SIN_INTERNET',
  },
  {
    pregunta: 'Por cable tengo internet pero por Wi-Fi no.',
    respuesta:
      'En ese caso la fibra probablemente está bien y el problema está en la red inalámbrica o la configuración del router.',
    intencion: 'WIFI_FALLA',
  },
  // Wi-Fi
  {
    pregunta: 'El internet funciona pero el Wi-Fi está lento.',
    respuesta:
      'La velocidad por Wi-Fi puede verse afectada por distancia, paredes, interferencias y cantidad de dispositivos. Compara primero la conexión por cable Ethernet.',
    intencion: 'WIFI_LENTO',
  },
  {
    pregunta: '¿Por qué tengo buena señal pero internet lento?',
    respuesta:
      'Muchas barras de Wi-Fi indican intensidad de señal, no necesariamente velocidad. Puede haber interferencias, saturación de dispositivos o un problema con el servicio.',
    intencion: 'WIFI_LENTO',
  },
  {
    pregunta: 'El Wi-Fi se desconecta a cada rato.',
    respuesta:
      'Verifica si la desconexión ocurre solo por Wi-Fi o también por cable. Si solo sucede por Wi-Fi, revisamos la red inalámbrica y el router.',
    intencion: 'WIFI_INTERMITENTE',
  },
  {
    pregunta: 'No aparece mi red Wi-Fi.',
    respuesta:
      'Revisa que el Wi-Fi esté habilitado en el router y que los indicadores correspondientes estén funcionando. Si ningún dispositivo encuentra la red, puede ser necesario revisar la configuración del equipo.',
    intencion: 'WIFI_NO_SSID',
  },
  // Reinicio
  {
    pregunta: '¿Puedo reiniciar la ONT?',
    respuesta:
      'Sí, cuando el procedimiento de soporte lo indique. Desconecta la alimentación, espera unos segundos y vuelve a conectar. Espera a que los indicadores se estabilicen.',
    intencion: 'ONT_REINICIO',
  },
  {
    pregunta: '¿Qué pasa si reinicio la ONT?',
    respuesta:
      'Reiniciar la ONT interrumpe temporalmente la conexión mientras el equipo vuelve a iniciar y registrarse en la red. Normalmente no elimina la configuración del equipo.',
    intencion: 'ONT_REINICIO',
  },
  // Fibra
  {
    pregunta: '¿Puedo doblar el cable de fibra?',
    respuesta:
      'No se debe doblar, aplastar ni manipular excesivamente el cable de fibra: puede afectar la señal óptica.',
    intencion: 'FIBRA_CABLE',
  },
  {
    pregunta: 'Moví la ONT y ahora está en rojo.',
    respuesta:
      'Verifica que el cable de fibra no haya quedado doblado, tensionado o desconectado. Si el LOS quedó rojo después de mover el equipo, revisa la conexión óptica.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'Se rompió el cable de fibra.',
    respuesta:
      'No intentes repararlo manualmente. La fibra óptica requiere herramientas y procedimientos específicos. Se debe solicitar revisión técnica.',
    intencion: 'FIBRA_CABLE',
  },
  {
    pregunta: '¿Puedo desconectar el cable de fibra de la ONT?',
    respuesta:
      'No es recomendable desconectarlo si no es necesario. La fibra es delicada y una manipulación incorrecta puede afectar la señal óptica.',
    intencion: 'FIBRA_CABLE',
  },
  // Conceptos
  {
    pregunta: '¿La ONT es lo mismo que el módem?',
    respuesta:
      'En FTTH la “cajita” de fibra suele ser la ONT (Optical Network Terminal). A veces la gente la llama módem; en HFC el módem/cable módem es otro equipo. Si me dices si tienes fibra (ONT) o coax (modem), te oriento mejor.',
    intencion: 'ONT_CONCEPTO',
  },
  {
    pregunta: '¿Cuál es la diferencia entre ONT y router?',
    respuesta:
      'La ONT termina la fibra óptica en el domicilio. El router (o Wi-Fi del gateway) reparte la red a tus dispositivos. A veces vienen integrados en un solo equipo; en otros casos son dos cajas.',
    intencion: 'ONT_CONCEPTO',
  },
  {
    pregunta: '¿Dónde está la ONT?',
    respuesta:
      'Normalmente es la caja blanca/gris donde llega el cable de fibra del domicilio (a veces cerca del tablero o en un rincón). Busca indicadores POWER, PON y LOS.',
    intencion: 'ONT_CONCEPTO',
  },
  {
    pregunta: '¿Qué significa POWER?',
    respuesta: 'POWER indica que la ONT está recibiendo alimentación eléctrica.',
    intencion: 'ONT_LED_POWER',
  },
  {
    pregunta: '¿Qué significa LAN?',
    respuesta:
      'LAN indica actividad/conexión mediante el puerto Ethernet, según el modelo del equipo.',
    intencion: 'ONT_LED_LAN',
  },
  {
    pregunta: '¿Qué significa WLAN?',
    respuesta:
      'WLAN / Wi-Fi indica el estado de la red inalámbrica, si el equipo dispone de Wi-Fi.',
    intencion: 'ONT_LED_WLAN',
  },
  {
    pregunta: '¿Qué significa TEL o PHONE?',
    respuesta:
      'TEL / PHONE indica el estado del servicio de telefonía, si está disponible en el equipo.',
    intencion: 'ONT_LED_TEL',
  },
  // Causa / solución / significado / diagnóstico
  {
    pregunta: '¿Por qué se puso rojo el LOS?',
    respuesta:
      'Suele indicar pérdida o ausencia de señal óptica. Puede deberse a fibra desconectada, doblada, dañada, falla en la red o corte reciente. Revisa el cable y, si sigue rojo, continúa el diagnóstico técnico.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: '¿Qué hago si el LOS está rojo?',
    respuesta:
      'Confirma que sea el indicador LOS, verifica que la fibra esté bien conectada y sin dobleces, reinicia la ONT si el procedimiento lo indica y espera. Si sigue rojo, valida masivo y escala a visita técnica según 997.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: '¿Qué significa que LOS esté parpadeando?',
    respuesta:
      'LOS parpadeando o en rojo normalmente apunta a pérdida de señal óptica. No es un estado “normal” de servicio; hay que revisar fibra y enlace.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: '¿Cómo sé si perdí señal óptica?',
    respuesta:
      'Revisa la ONT: si LOS está rojo o parpadeando, o si PON no queda fija/registrada, es señal de problema óptico. POWER debe estar encendido para poder interpretar el resto.',
    intencion: 'ONT_DIAGNOSTICO',
  },
  {
    pregunta: '¿Cómo sé si el problema es la fibra o el router?',
    respuesta:
      'Mira primero los LEDs de la ONT. Si LOS está rojo o PON no registra, prioriza fibra/ONT. Si PON está OK y LOS apagada, prueba por cable Ethernet: si cable falla también, no es solo Wi‑Fi; si cable funciona y Wi‑Fi no, el foco es el router/inalámbrico.',
    intencion: 'ONT_DIAGNOSTICO',
  },
  {
    pregunta: '¿Cómo sé si mi ONT está funcionando?',
    respuesta:
      'En general: POWER encendido, PON registrada (suele verde fija) y LOS apagada (sin rojo). Luego confirma navegación por cable y por Wi‑Fi.',
    intencion: 'ONT_DIAGNOSTICO',
  },
  // Reinicio extra
  {
    pregunta: '¿Cuánto tiempo debo apagar la ONT?',
    respuesta:
      'Desconecta la alimentación unos 10–30 segundos (o lo que indique el procedimiento), vuelve a conectar y espera a que se estabilicen POWER, PON y LOS.',
    intencion: 'ONT_REINICIO',
  },
  {
    pregunta: '¿Reiniciar la ONT borra la configuración?',
    respuesta:
      'Un reinicio por alimentación normalmente no borra la configuración; solo reinicia el equipo y corta el servicio unos minutos mientras se registra de nuevo.',
    intencion: 'ONT_REINICIO',
  },
  {
    pregunta: 'Ya reinicié la ONT, ¿qué hago ahora?',
    respuesta:
      'Revisa de nuevo los LEDs. Si LOS sigue rojo, no insistas solo reiniciando: verifica fibra y continúa con masivo/visita. Si LEDs OK pero no navegas, pasa a router/Wi‑Fi/Ethernet.',
    intencion: 'ONT_REINICIO',
  },
  {
    pregunta: 'Reinicié todo tres veces y sigue sin funcionar.',
    respuesta:
      'Si ya reiniciaste varias veces sin cambio, dejemos de repetir el mismo paso. Dime cómo quedaron LOS y PON (o si hay luz roja) y seguimos con diagnóstico o escalamiento técnico.',
    intencion: 'ONT_ESCALAMIENTO',
  },
  // Fibra extra
  {
    pregunta: 'Se desconectó el cable de fibra, ¿qué hago?',
    respuesta:
      'Si puedes reconectarlo con cuidado en el puerto óptico sin forzar ni doblar el cable, hazlo y espera a que se estabilicen PON/LOS. Si no encaja bien, está dañado o no sabes cómo, solicita revisión técnica: no fuerces el conector.',
    intencion: 'FIBRA_CABLE',
  },
  {
    pregunta: '¿Puedo volver a conectar la fibra yo mismo?',
    respuesta:
      'Solo si el conector está limpio, accesible y sabes encajarlo sin forzar. La fibra es delicada: si hay resistencia, daño o dudas, mejor visita técnica.',
    intencion: 'FIBRA_CABLE',
  },
  // Sin mencionar ONT
  {
    pregunta: 'No tengo internet, ¿qué pasó?',
    respuesta:
      'Empecemos por triaje: ¿falla en todos los equipos? ¿Wi‑Fi o cable? Mira la cajita de fibra (ONT): ¿hay luz roja (LOS)? ¿PON? ¿POWER? Con eso vemos si es óptica, router o servicio.',
    intencion: 'SIN_INTERNET_TRIAJE',
  },
  {
    pregunta: 'Tengo Wi-Fi pero no tengo internet.',
    respuesta:
      'Estás asociado a la red Wi‑Fi, pero sin acceso a Internet. Prueba por cable Ethernet. Revisa también LEDs de la ONT (LOS/PON). Si la óptica está mal, el Wi‑Fi “conectado” no navegará.',
    intencion: 'WIFI_SIN_INTERNET',
  },
  {
    pregunta: 'Aparece conectado pero no navega.',
    respuesta:
      'Conectado al Wi‑Fi ≠ tener Internet. Verifica ONT (LOS/PON), prueba por cable y si otros dispositivos fallan igual. Así separamos red local vs servicio/óptica.',
    intencion: 'WIFI_SIN_INTERNET',
  },
  // Post-evento
  {
    pregunta: 'Se fue la luz y después no volvió el internet.',
    respuesta:
      'Tras un corte, espera a que la ONT encienda y se registre (POWER, PON, LOS). Si queda LOS rojo o no navega con LEDs raros, revisa fibra/alimentación y continúa diagnóstico; a veces hace falta visita si no se recupera.',
    intencion: 'ONT_POST_EVENTO',
  },
  {
    pregunta: 'Hubo un corte de luz y ahora tengo LOS rojo.',
    respuesta:
      'Tras el corte puede tardar en recuperar señal. Verifica fibra conectada y reinicia la ONT una vez. Si LOS permanece rojo, trata como pérdida de señal óptica (masivo / visita según 997).',
    intencion: 'ONT_POST_EVENTO',
  },
  {
    pregunta: 'Desde que moví la cajita se fue el internet.',
    respuesta:
      'Al mover la ONT a menudo se tensa, desconecta o dobla la fibra. Revisa el cable óptico y los LEDs (especialmente LOS). Si quedó rojo o sin PON, no fuerces el cable: puede necesitar revisión.',
    intencion: 'ONT_POST_EVENTO',
  },
  {
    pregunta: 'Después de una tormenta no tengo internet.',
    respuesta:
      'Tras tormenta/corte puede haber falla de energía, equipo o red. Revisa si la ONT tiene POWER y cómo están PON/LOS. Si LOS rojo o el equipo no prende, continúa con diagnóstico/escalamiento.',
    intencion: 'ONT_POST_EVENTO',
  },
  // Visita técnica
  {
    pregunta: '¿Necesito un técnico?',
    respuesta:
      'Depende del diagnóstico. Si LOS sigue rojo tras verificar fibra y reinicio, o hay fibra dañada/ONT sin energía sin solución en domicilio, normalmente sí corresponde visita técnica según el procedimiento.',
    intencion: 'ONT_VISITA_TECNICA',
  },
  {
    pregunta: '¿Qué pasa si el LOS sigue rojo?',
    respuesta:
      'Si tras validar conexión de fibra y reinicio el LOS continúa rojo, no se soluciona solo en chat: se valida masivo del sector y, si no hay masivo, se deriva a visita técnica (ruta Sin Internet Fibra / 997).',
    intencion: 'ONT_VISITA_TECNICA',
  },
  {
    pregunta: '¿Si la fibra está dañada tienen que venir a domicilio?',
    respuesta:
      'Sí: la fibra no se repara “casero”. Si está rota, aplastada o el conector falló, se gestiona revisión/reparación en domicilio según procedimiento.',
    intencion: 'ONT_VISITA_TECNICA',
  },
  // Técnicas / concepto
  {
    pregunta: '¿Qué es una ONT?',
    respuesta:
      'La ONT (Optical Network Terminal) es el equipo que recibe la fibra óptica en tu domicilio y convierte la señal para tu red (router/Wi‑Fi). Es la “cajita” de fibra.',
    intencion: 'ONT_CONCEPTO',
  },
  {
    pregunta: '¿Qué significa pérdida de señal óptica?',
    respuesta:
      'Significa que la ONT no está recibiendo bien la luz/señal por la fibra. En LEDs suele verse como LOS rojo/parpadeante o PON que no registra.',
    intencion: 'ONT_CONCEPTO',
  },
  {
    pregunta: '¿La ONT necesita estar conectada al router?',
    respuesta:
      'Sí, para repartir Internet a tus dispositivos (salvo que la ONT ya sea un gateway con Wi‑Fi integrado). La fibra llega a la ONT; del LAN sale Ethernet hacia el router o hacia tus equipos.',
    intencion: 'ONT_CONCEPTO',
  },
  // Coloquial / mal escrito
  {
    pregunta: 'porque esta rojo el los',
    respuesta:
      'Si el LOS está rojo, normalmente es pérdida de señal óptica. Revisa que la fibra esté conectada y sin dobleces; si sigue así, hay que seguir diagnóstico técnico.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'q significa los rojo',
    respuesta:
      'LOS rojo indica que la ONT no está recibiendo bien la señal de fibra. Hay que revisar el cable óptico y el enlace.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: 'xq no tengo internet',
    respuesta:
      'Puede ser óptica (LOS/PON), alimentación de la ONT, router/Wi‑Fi o el servicio. Dime qué luces ves en la cajita o si falla por cable también y lo acotamos.',
    intencion: 'SIN_INTERNET_TRIAJE',
  },
  {
    pregunta: 'reinicie y sigue igual',
    respuesta:
      'Si ya reiniciaste y no cambió, miramos LEDs: ¿LOS rojo? ¿PON? Si LOS sigue malo, no repetimos reinicios: pasamos a fibra/masivo/visita.',
    intencion: 'ONT_ESCALAMIENTO',
  },
  {
    pregunta: 'tengo wifi pero no internet',
    respuesta:
      'Estás en la red Wi‑Fi pero sin salida a Internet. Prueba por cable y revisa luces de la ONT (LOS/PON) para ver si el problema es óptico o del router.',
    intencion: 'WIFI_SIN_INTERNET',
  },
  // Indirectas
  {
    pregunta: 'Todas las luces están verdes menos una que está roja.',
    respuesta:
      'Esa roja suele ser crítica. ¿Dice LOS? Si es LOS, apunta a pérdida de señal óptica. Si es otro LED, dime el nombre del indicador y el color (fijo o parpadeo) para no asumir.',
    intencion: 'ONT_INDIRECTA',
  },
  {
    pregunta: 'Tengo Wi-Fi, pero ningún celular tiene internet.',
    respuesta:
      'La red Wi‑Fi está visible, pero no hay acceso a Internet en los celulares. Revisemos ONT (LOS/PON) y una prueba por cable: así separamos Wi‑Fi local vs servicio/fibra.',
    intencion: 'WIFI_SIN_INTERNET',
  },
  {
    pregunta: 'La PON está verde y el LOS apagado, pero no navego.',
    respuesta:
      'Eso suele descartar pérdida óptica grave: el problema puede estar en router, Wi‑Fi, Ethernet o el servicio. Probemos por cable y si falla en todos los equipos.',
    intencion: 'ONT_PON_SIN_INTERNET',
  },
  {
    pregunta: 'porq se fue el internet',
    respuesta:
      'Puede ser corte de señal, ONT, router o falla de red. Mira la cajita: ¿luz roja LOS? ¿prendió después de un corte de luz? Con ese dato orientamos el siguiente paso.',
    intencion: 'SIN_INTERNET_TRIAJE',
  },
  {
    pregunta: 'porke no tengo internet',
    respuesta:
      'Triaje rápido: ¿todos los equipos? ¿Wi‑Fi o cable? ¿Cómo están las luces de la ONT (POWER, PON, LOS)? Con eso vemos la causa más probable.',
    intencion: 'SIN_INTERNET_TRIAJE',
  },
  {
    pregunta: 'no tengo interner',
    respuesta:
      'Sin Internet: revisa primero la ONT (¿enciende? ¿LOS rojo? ¿PON?) y si falla también por cable. Cuéntame qué luces ves y seguimos.',
    intencion: 'SIN_INTERNET_TRIAJE',
  },
  {
    pregunta: 'esta rojo ese foco',
    respuesta:
      'Ese “foco” es un LED de la ONT. Si es LOS, indica problema de señal óptica. Confírmame si dice LOS u otro nombre.',
    intencion: 'ONT_LOS_ROJO',
  },
  {
    pregunta: '¿Cómo solicito un técnico?',
    respuesta:
      'Tras el diagnóstico en domicilio (LEDs, fibra, reinicio cuando aplique), si corresponde visita se gestiona según el procedimiento operativo (p. ej. Sin Internet Fibra / Somos Clave 997), tipificando en Andes.',
    intencion: 'ONT_VISITA_TECNICA',
  },
  {
    pregunta: '¿Por qué el internet funciona por cable pero no por Wi-Fi?',
    respuesta:
      'La fibra/ONT probablemente está bien; el problema está en la red inalámbrica (cobertura, interferencia, configuración del router). Enfócate en Wi‑Fi, no en cambiar la fibra.',
    intencion: 'WIFI_FALLA',
  },
  {
    pregunta: '¿Por qué mi internet se corta cada cierto tiempo?',
    respuesta:
      'Puede ser óptica intermitente, Wi‑Fi inestable o equipo. Pregunta si también se corta por cable y cómo se comportan PON/LOS en el momento de la caída.',
    intencion: 'SIN_INTERNET_TRIAJE',
  },
]

/** Respuestas canónicas por intención (para expandir frases realistas) */
const RESPUESTA_POR_INTENCION = {
  ONT_LOS_ROJO:
    'Si la luz LOS está roja o parpadeando, normalmente indica pérdida o ausencia de señal óptica. Verifica que el cable de fibra esté bien conectado y que no esté doblado, aplastado o dañado. Si continúa en rojo, sigue el diagnóstico técnico (masivo / visita según procedimiento 997).',
  ONT_PON:
    'La luz PON indica el estado de conexión de la ONT con la red óptica. Si está apagada, la ONT podría no estar registrándose o hay problema de señal; revisa también el indicador LOS.',
  ONT_APAGADA:
    'Si la ONT no prende o todas las luces están apagadas, verifica el adaptador de corriente y el enchufe. Prueba otro tomacorriente. Si no enciende ningún indicador, puede ser falla de alimentación o del equipo.',
  WIFI_SIN_INTERNET:
    'Estar conectado al Wi‑Fi no garantiza Internet. Revisa luces de la ONT (LOS/PON) y prueba por cable Ethernet para separar falla óptica de falla inalámbrica.',
  FIBRA_CABLE:
    'La fibra no se debe doblar, aplastar ni forzar. Si se dobló, desconectó o rompió, no la repares “casero”: verifica conexión con cuidado o solicita revisión técnica.',
  ONT_REINICIO:
    'Para reiniciar la ONT: desconecta la alimentación, espera unos segundos y vuelve a conectar. Espera a que se estabilicen las luces. Normalmente no borra la configuración. Si reinicias y LOS sigue rojo, no insistas solo reiniciando.',
  SIN_INTERNET_TRIAJE:
    'Sin Internet: ¿falla en todos los equipos? ¿Wi‑Fi o cable? Mira la cajita (ONT): POWER, PON y si hay luz roja (LOS). Con eso vemos si es óptica, router o servicio.',
  ONT_PON_SIN_INTERNET:
    'Si PON está verde y LOS apagada pero no navegas, la óptica suele estar estable: revisa router, Wi‑Fi y prueba por cable Ethernet.',
}

/**
 * Frases realistas: formal / sin ¿? / cortas / coloquial / typos.
 * Se convierten en ejemplos Q&A adicionales (sin duplicar pregunta exacta).
 */
const FRASES_REALISTAS = [
  {
    intencion: 'ONT_LOS_ROJO',
    frases: [
      'Por qué tengo el LOS rojo',
      'Por qué está rojo el LOS',
      'Qué significa el LOS rojo',
      'Qué hago si el LOS está rojo',
      'Por qué mi ONT está en rojo',
      'Por qué no tengo internet y el LOS está rojo',
      'Cómo soluciono el LOS rojo',
      'Porque esta rojo el los',
      'Porque no tengo internet el los esta rojo',
      'LOS rojo',
      'LOS en rojo',
      'luz LOS roja',
      'luz roja en la ONT',
      'ONT en rojo',
      'ONT roja',
      'tengo el LOS rojo',
      'mi LOS está rojo',
      'el LOS está parpadeando',
      'tengo una luz roja',
      'la cajita está roja',
      'la cajita de internet está roja',
      'se prendió el LOS',
      'se puso rojo el LOS',
      'se me fue el internet y está rojo',
      'no tengo internet está rojo el LOS',
      'se puso rojo de la nada',
      'está parpadeando rojo',
      'la cajita está parpadeando',
      'no me funciona y está rojo',
      'se cayó el internet y quedó rojo',
      'el internet murió y está rojo',
      'tengo rojo en la cajita',
      'está rojo ese foco',
      'qué hago está rojo',
      'sigue rojo',
      'todavía está rojo',
      'ya reinicié y sigue rojo',
      'porque esta rojo el los',
      'porq esta rojo el los',
      'xq esta rojo el los',
      'mi los esta en rojo',
      'el los esta rojo',
      'k significa los rojo',
      'q hago si esta rojo',
      'no tengo wifi y esta rojo',
      'se fue mi internet y esta rojo',
    ],
  },
  {
    intencion: 'SIN_INTERNET_TRIAJE',
    frases: [
      'no tengo internet',
      'porque no tengo internet',
      'no me funciona el internet',
      'se me fue el internet',
      'se cayó el internet',
      'estoy sin internet',
      'no tengo señal',
      'no puedo navegar',
      'no me carga nada',
      'no abre ninguna página',
      'no tengo conexión',
      'se perdió la conexión',
      'mi internet dejó de funcionar',
      'desde hace rato no tengo internet',
      'de repente me quedé sin internet',
      'después del corte de luz no tengo internet',
      'reinicié y sigo sin internet',
      'todos los equipos están sin internet',
      'ningún celular tiene internet',
      'xq no tengo internet',
      'porq se fue el internet',
      'no tengo interner',
      'no tengo intenet',
      'no tengo interned',
    ],
  },
  {
    intencion: 'WIFI_SIN_INTERNET',
    frases: [
      'el wifi aparece pero no navega',
      'Por qué tengo wifi pero no internet',
      'wifi conectado pero sin internet',
      'tengo wifi pero no navega',
      'aparece conectado y no funciona',
      'conectado sin internet',
      'el wifi está conectado pero no carga nada',
      'porque tengo wifi y no tengo internet',
      'porq aparece conectado pero no navega',
    ],
  },
  {
    intencion: 'ONT_PON',
    frases: [
      'Por qué está apagado el PON',
      'Qué significa PON apagado',
      'mi PON está apagado',
      'PON apagado',
      'no prende el PON',
      'la luz PON no enciende',
      'porque no prende la luz PON',
      'porq mi pon esta apagado',
    ],
  },
  {
    intencion: 'ONT_APAGADA',
    frases: [
      'Por qué no prende mi ONT',
      'mi ONT no prende',
      'ONT apagada',
      'todas las luces están apagadas',
      'la cajita no enciende',
      'no prende la cajita',
      'se apagó la ONT',
      'porque se apagó',
      'no enciende nada',
    ],
  },
  {
    intencion: 'FIBRA_CABLE',
    frases: [
      'Se puede doblar la fibra',
      'puedo doblar el cable de fibra',
      'fibra doblada',
      'cable de fibra doblado',
      'se dobló la fibra',
      'moví la fibra y perdí internet',
      'se desconectó la fibra',
      'se rompió el cable de fibra',
      'creo que dañé la fibra',
      'no llega señal por la fibra',
    ],
  },
  {
    intencion: 'ONT_REINICIO',
    frases: [
      'Cómo reinicio la ONT',
      'como reinicio la ont',
      'reiniciar ONT',
      'quiero reiniciar la cajita',
      'puedo apagar la ONT',
      'ya reinicié',
      'reinicié y sigue igual',
      'apagué y prendí y no funciona',
      'ya reinicie todo y sigo sin internet',
    ],
  },
]

function normFraseKey(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function frasesIntencion(id) {
  return (FRASES_REALISTAS.find((b) => b.intencion === id)?.frases || []).map(normFraseKey)
}

function ejemplosDesdeFrasesRealistas(ya) {
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

/** Pares pregunta→respuesta (base + frases realistas sin ¿?, typos, coloquial) */
export const EJEMPLOS_ONT_FTTH = [
  ...EJEMPLOS_ONT_FTTH_BASE,
  ...ejemplosDesdeFrasesRealistas(EJEMPLOS_ONT_FTTH_BASE),
]

const VAR_LOS = [
  'luz los roja',
  'los rojo',
  'los en rojo',
  'led los',
  'los parpadeando',
  'los parpadea',
  'cajita roja',
  'caja de internet roja',
  'luz roja ont',
  'ont en rojo',
  'ont roja',
  'modem en rojo',
  'fibra en rojo',
  'señal optica roja',
  'perdida de señal optica',
  'sin señal optica',
  'ont offline',
  'por que no tengo internet y el los esta en rojo',
  'por que mi los esta en rojo',
  'por que se puso rojo el los',
  'por que tengo el los rojo',
  'por que la luz los esta roja',
  'por que esta parpadeando el los',
  'por que mi ont tiene el los rojo',
  'por que la cajita de internet tiene una luz roja',
  'por que se prendio la luz roja de la ont',
  'por que mi internet se fue y ahora el los esta rojo',
  'por que me quede sin internet y aparece los rojo',
  'por que no navego si el los esta rojo',
  'por que el los empezo a parpadear',
  'por que despues de un corte de luz quedo el los rojo',
  'por que despues de mover la ont se puso rojo el los',
  'por que mi fibra aparece con los rojo',
  'se me fue el internet y la cajita esta con una luz roja',
  'esta parpadeando rojo esa vaina',
  'esta rojo el cosito de la fibra',
  'mi internet murio y el los esta rojo',
  'como arreglo el los rojo',
  'que hago si el los esta rojo',
  'como saco la luz roja',
  'reinicie y sigue rojo',
  'desconecte y conecte y sigue el los rojo',
  'eso rojo es malo',
  'se me puso rojo de la nada',
  'porque esta rojo el los',
  'porq esta rojo el los',
  'xq esta rojo el los',
  'mi los esta en rojo',
  'el los esta rojo',
  'k significa los rojo',
  'q significa los rojo',
  'q hago si esta rojo',
  'que hago si esta rojo',
  'que hago esta rojo',
  'como soluciono el los rojo',
  'tengo el los rojo',
  'se prendio el los',
  'se puso rojo el los',
  'sigue rojo',
  'todavia esta rojo',
  'ya reinicie y sigue rojo',
  'esta rojo ese foco',
  'tengo rojo en la cajita',
  'la cajita esta parpadeando',
  'no me funciona y esta rojo',
  'se cayo el internet y quedo rojo',
  'no tengo wifi y esta rojo',
  'se fue mi internet y esta rojo',
  'se me fue el internet y esta rojo',
  'no tengo internet esta rojo el los',
  'esta parpadeando rojo',
  'porque no tengo internet el los esta rojo',
  'luz roja en la ont',
  'tengo una luz roja',
  'que significa que los este rojo',
  'que significa que los este parpadeando',
  'luz roja no se apaga',
  'que hago si la luz roja no se apaga',
  ...frasesIntencion('ONT_LOS_ROJO'),
]

const VAR_PON = [
  'luz pon',
  'pon apagada',
  'pon apagado',
  'pon verde',
  'pon parpadeando',
  'pon rojo',
  'que significa pon',
  'la pon deberia estar verde',
  'por que mi pon esta apagado',
  'por que no prende la luz pon',
  'por que el pon esta parpadeando',
  'por que tengo pon rojo',
  'que pasa si el pon esta apagado',
  'que significa que mi pon este parpadeando',
  'que hago si la pon esta apagada',
  'mi pon esta apagado',
  'no prende el pon',
  'la luz pon no enciende',
  'porque no prende la luz pon',
  'porq mi pon esta apagado',
  'que significa pon verde',
  'que significa pon apagado',
  'la pon no queda fija',
  'pon parpadea',
  ...frasesIntencion('ONT_PON'),
]

const VAR_PON_SIN_NET = [
  'pon verde sin internet',
  'pon verde pero no navego',
  'pon verde pero no tengo internet',
  'pon verde los apagado sin internet',
  'luces normales sin internet',
  'todas las luces normales pero no navega',
  'la pon esta verde pero no me carga nada',
  'todas las luces estan normales pero no tengo internet',
  'luces ok sin internet',
  'pon verde los apagado pero no navego',
]

const VAR_APAGADA = [
  'ont no enciende',
  'ont no prende',
  'ont apagada',
  'todas las luces apagadas',
  'se apago la ont',
  'ont sin energia',
  'por que mi ont no prende',
  'por que todas las luces de mi ont estan apagadas',
  'por que mi ont se apago',
  'que hago si la ont no prende',
  'la cajita no enciende',
  'no prende la cajita',
  'mi cajita no prende',
  'no enciende nada',
  'porque se apago',
  'desconecte la ont y ahora no prende',
  ...frasesIntencion('ONT_APAGADA'),
]

const VAR_WIFI = [
  'wifi lento',
  'wifi se desconecta',
  'no aparece mi red wifi',
  'buena señal pero internet lento',
  'por cable si por wifi no',
  'wifi no navega',
  'conectado al wifi pero sin internet',
  'wifi conectado pero sin internet',
  'tengo wifi pero no navega',
  'aparece conectado y no funciona',
  'conectado sin internet',
  'el wifi esta conectado pero no carga nada',
  'porque tengo wifi y no tengo internet',
  'porq aparece conectado pero no navega',
  'tengo wifi pero no internet',
  'internet funciona por cable pero no por wifi',
  'wifi se cae cuando conecto varios',
  'poca señal wifi',
  'wifi cerca si lejos no',
]

const VAR_REINICIO = [
  'reiniciar ont',
  'puedo reiniciar la ont',
  'que pasa si reinicio la ont',
  'como reinicio la ont',
  'reset ont',
  'apagar y prender ont',
  'cuanto tiempo apagar la ont',
  'reiniciar borra configuracion',
  'ya reinicie la ont',
  'reinicie y sigue igual',
  'apague y prendi y no funciona',
  'ya reinicie todo y sigo sin internet',
  'quiero reiniciar la cajita',
  'puedo apagar la ont',
  'tengo que apagar tambien el router',
  'reinicie todo tres veces',
  'ya reinicie',
  ...frasesIntencion('ONT_REINICIO'),
]

const VAR_FIBRA = [
  'doblar cable de fibra',
  'cable de fibra roto',
  'desconectar fibra',
  'mova la ont',
  'fibra danada',
  'por que se perdio la señal de fibra',
  'por que mi fibra no tiene señal',
  'por que la ont no recibe señal',
  'donde va conectado el cable de fibra',
  'puedo sacar el cable de fibra',
  'puedo mover la fibra',
  'se doblo la fibra',
  'movi la fibra y perdi internet',
  'se desconecto la fibra',
  'creo que dañe la fibra',
  'no llega señal por la fibra',
  'puedo volver a conectar la fibra',
  'fibra doblada',
  'cable de fibra doblado',
  'se puede doblar la fibra',
  ...frasesIntencion('FIBRA_CABLE'),
]

const VAR_SIN_INTERNET = [
  'no tengo internet',
  'por que no tengo internet',
  'se me fue el internet',
  'no puedo navegar',
  'no carga ninguna pagina',
  'no abre ninguna pagina',
  'se cayo mi internet',
  'se cayo el internet',
  'estoy sin internet',
  'no tengo señal',
  'perdi la conexion',
  'se perdio la conexion',
  'no tengo conexion',
  'internet dejo de funcionar',
  'mi internet dejo de funcionar',
  'sin conexion',
  'no tengo wifi',
  'aparece conectado pero no tengo internet',
  'no tengo internet que paso',
  'no me carga nada',
  'estoy sin servicio',
  'el internet esta muerto',
  'ningun celular tiene internet',
  'mi pc tampoco tiene conexion',
  'desde hace rato no tengo internet',
  'de repente me quede sin internet',
  'xq no tengo internet',
  'porq se fue el internet',
  'porke no tengo internet',
  'porque no tengo internet',
  'no tengo interner',
  'no tengo intenet',
  'no tengo interned',
  'no me funciona el internet',
  'todos los equipos estan sin internet',
  'reinicie y sigo sin internet',
  'despues del corte de luz no tengo internet',
  ...frasesIntencion('SIN_INTERNET_TRIAJE'),
]

const VAR_POST_EVENTO = [
  'se fue la luz y despues no volvio el internet',
  'corte de luz y ahora los rojo',
  'despues del corte de luz no tengo internet',
  'movi el router y perdi internet',
  'movi la cajita y se fue el internet',
  'desde que movi la cajita se fue el internet',
  'despues de una tormenta no tengo internet',
  'despues de mover los muebles se desconecto la fibra',
  'desde ayer tengo el los rojo',
  'funcionaba en la mañana y ahora no',
  'hubo una caida de internet y desde ahi el los esta rojo',
  'despues de reiniciar quedo parpadeando',
  'cambie el cable y quedo sin señal',
]

const VAR_VISITA = [
  'necesito un tecnico',
  'necesito visita tecnica',
  'por que necesito una visita tecnica',
  'pueden revisar mi fibra',
  'como solicito un tecnico',
  'pueden revisar la ont',
  'que revisa el tecnico',
  'me tienen que cambiar la ont',
  'pueden cambiarme el cable de fibra',
  'cuando se necesita cambiar la ont',
  'si la fibra esta dañada tienen que venir',
  'que pasa si el los sigue rojo',
  'como se si mi equipo esta dañado',
]

const VAR_DIAGNOSTICO = [
  'como se si mi ont esta funcionando',
  'como se si tengo señal de fibra',
  'como se si el problema es la fibra',
  'como se si el problema es el router',
  'como puedo saber si perdi señal optica',
  'como puedo revisar la ont',
  'como se si el pon esta funcionando',
  'como se si mi internet esta llegando a la ont',
  'como identificar una falla de fibra',
  'como se si el cable de fibra esta dañado',
  'todas las luces estan verdes menos una que esta roja',
]

/** Docs RAG indexables */
export const DOCS_ONT_FTTH = [
  {
    id: 'ont-los-rojo',
    titulo: 'Luz LOS en rojo / pérdida de señal óptica (ONT)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → ONT / LOS',
    intencion: 'ONT_LOS_ROJO',
    sinonimos: [
      'los',
      'ont',
      'luz roja',
      'sin internet',
      'fibra',
      ...VAR_LOS,
    ],
    contenido: [
      'Si la luz LOS está roja o parpadeando, normalmente indica pérdida o ausencia de señal óptica en la ONT.',
      'Pasos iniciales: 1) Confirma que el indicador rojo sea LOS (no otro LED). 2) Verifica que el cable de fibra esté bien conectado. 3) Revisa que no esté doblado, aplastado, tensionado o dañado. 4) Si el procedimiento lo indica, reinicia la ONT (desconectar alimentación, esperar, reconectar) y espera a que se estabilicen las luces.',
      'Si tras verificar conexión y reiniciar el LOS sigue rojo: no se soluciona solo con reinicio; continuar diagnóstico de señal de fibra.',
      'Operativo VTR: verifica masivo del sector. Si no hay masivo → visita técnica según ruta Sin Internet Fibra / dispositivos offline (Somos Clave 997).',
      SC_997,
      'Habla natural: “cajita roja”, “modem en rojo”, “fibra en rojo” suelen referirse a la ONT con LOS.',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-pon',
    titulo: 'Luz PON en la ONT (qué significa / apagada / verde)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → ONT / PON',
    intencion: 'ONT_PON',
    sinonimos: ['pon', ...VAR_PON],
    contenido: [
      'La luz PON indica el estado de conexión de la ONT con la red de fibra óptica.',
      'En muchos modelos, PON verde fija = ONT registrada/conectada a la red (varía según modelo).',
      'Si PON está apagada: la ONT podría no registrarse o hay problema de señal óptica; revisa también LOS.',
      'Si PON parpadea: puede estar en proceso de registro o con inestabilidad; observa si se fija o si aparece LOS.',
      'Si PON está en rojo (según modelo): trata como falla de enlace óptico y cruza con LOS / procedimiento 997.',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-pon-sin-internet',
    titulo: 'PON normal / luces OK pero sin Internet',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Diagnóstico',
    intencion: 'ONT_PON_SIN_INTERNET',
    sinonimos: [...VAR_PON_SIN_NET, 'luces normales sin internet', 'ont ok sin navegar'],
    contenido: [
      'Si PON está verde y LOS apagada, la óptica suele estar estable: el problema puede estar en router, Wi-Fi, Ethernet o el servicio.',
      'Pregunta: ¿falla en todos los dispositivos o en uno? ¿Wi-Fi o cable? ¿Reiniciaron ONT/router?',
      'Prueba por Ethernet directo al router/gateway. Si por cable funciona y por Wi-Fi no → foco Wi-Fi.',
      'Si por cable tampoco navega con óptica OK → continuar Internet degradado / sin internet del procedimiento 997 (validar estado comercial, sincronismo, etc.).',
      SC_997,
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-apagada',
    titulo: 'ONT no enciende / todas las luces apagadas',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → ONT alimentación',
    intencion: 'ONT_APAGADA',
    sinonimos: [...VAR_APAGADA, 'power apagado', 'sin luz ont'],
    contenido: [
      'Verifica adaptador de corriente en ONT y enchufe; prueba otro tomacorriente / evita zapatillas defectuosas si aplica.',
      'Si no enciende ningún indicador (ni POWER): posible falla de alimentación o del equipo → revisión.',
      'Si se apagó de repente: descartar corte eléctrico y conector suelto.',
      'POWER encendido indica que la ONT recibe energía; si POWER OK pero LOS rojo, ve a diagnóstico de señal óptica.',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-leds-glosario',
    titulo: 'Significado de luces ONT (POWER, PON, LOS, LAN, WLAN, TEL)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Luces ONT',
    intencion: 'ONT_LEDS',
    sinonimos: [
      'que significa power',
      'que significa pon',
      'que significa los',
      'que significa lan',
      'que significa wlan',
      'que significa tel',
      'luces ont',
      'indicadores ont',
      'leds ont',
      'glosario luces',
      'que significan las luces',
      'que significan las luces de la ont',
      'significado de las luces',
      'que quiere decir cada luz',
      'explicame las luces de la ont',
      'para que sirve cada luz',
    ],
    contenido: [
      'POWER: la ONT recibe alimentación eléctrica.',
      'PON: estado de conexión de la ONT con la red óptica.',
      'LOS: posible pérdida o ausencia de señal óptica (rojo/parpadeo = alerta).',
      'LAN: actividad/conexión por puerto Ethernet (según modelo).',
      'WLAN / Wi-Fi: estado de la red inalámbrica si el equipo la tiene.',
      'TEL / PHONE: estado de telefonía si está disponible.',
      'Pide al cliente el nombre del LED y el color (fijo/parpadeo) para diagnosticar.',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-reinicio',
    titulo: 'Reinicio de ONT (cómo y qué esperar)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Reinicio',
    intencion: 'ONT_REINICIO',
    sinonimos: [...VAR_REINICIO],
    contenido: [
      'Sí se puede reiniciar cuando el procedimiento lo indique: desconectar alimentación, esperar unos segundos, reconectar y esperar estabilización de LEDs.',
      'El reinicio corta temporalmente el servicio; normalmente no borra la configuración.',
      'Si tras reinicio LOS sigue rojo → no insistir solo en reinicios; pasar a señal óptica / masivo / visita (997).',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-fibra-cable',
    titulo: 'Cable de fibra óptica (no doblar / dañado / desconectar)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Fibra',
    intencion: 'FIBRA_CABLE',
    sinonimos: [...VAR_FIBRA],
    contenido: [
      'No doblar, aplastar ni manipular en exceso el cable de fibra: afecta la señal óptica.',
      'Si se rompió: no reparar “casero”; solicitar revisión técnica.',
      'No desconectar la fibra de la ONT salvo que el procedimiento lo pida.',
      'Si al mover la ONT queda LOS rojo: revisar conector y curvatura del patch óptico.',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-wifi',
    titulo: 'Wi-Fi lento, se cae o no aparece (con óptica OK)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Wi-Fi',
    intencion: 'WIFI_FALLA',
    sinonimos: [...VAR_WIFI, 'internet lento wifi', 'senal wifi'],
    contenido: [
      'Compara siempre Wi-Fi vs cable Ethernet. Si cable OK y Wi-Fi no → foco inalámbrico.',
      'Lento con “muchas barras”: intensidad ≠ velocidad; interferencias, distancia, paredes, saturación.',
      'Se desconecta: ¿solo Wi-Fi o también cable? Si solo Wi-Fi → router/inalámbrico.',
      'No aparece SSID: Wi-Fi habilitado en equipo, LEDs WLAN, prueba desde otro dispositivo.',
      'Si óptica/LOS/PON malos, prioriza diagnóstico ONT antes de Wi-Fi.',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-wifi-sin-internet',
    titulo: 'Wi-Fi conectado pero sin Internet',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Wi-Fi vs Internet',
    intencion: 'WIFI_SIN_INTERNET',
    sinonimos: [
      'wifi conectado pero sin internet',
      'tengo wifi pero no internet',
      'aparece conectado pero no navega',
      'conectado sin internet',
      'wifi pero no navega',
      'ningun celular tiene internet',
      'aparece conectado y no funciona',
      'el wifi aparece pero no navega',
      ...frasesIntencion('WIFI_SIN_INTERNET'),
    ],
    contenido: [
      'Estar asociado al Wi-Fi no garantiza acceso a Internet.',
      'Paso 1: mira ONT — si LOS rojo o PON mala, el problema es óptico, no “el Wi-Fi”.',
      'Paso 2: prueba por cable Ethernet. Si cable tampoco navega → servicio/router/ONT. Si cable sí y Wi-Fi no → foco inalámbrico.',
      'Paso 3: ¿falla en todos los dispositivos o solo en uno?',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-concepto',
    titulo: 'Qué es la ONT (vs módem / router) y dónde está',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Conceptos',
    intencion: 'ONT_CONCEPTO',
    sinonimos: [
      'que es ont',
      'que es la ont',
      'donde esta la ont',
      'ont o modem',
      'diferencia ont router',
      'cajita de internet',
      'cajita de fibra',
      'puedo apagar la ont',
      'como se si la ont esta conectada',
      'como se si mi fibra esta funcionando',
      'que significa perdida de señal optica',
      'que es una señal pon',
      'la ont necesita estar conectada al router',
      'diferencia fibra optica y ethernet',
      'para que sirve la ont',
      'como funciona una ont',
    ],
    contenido: [
      'ONT = Optical Network Terminal: termina la fibra en el domicilio (“cajita” de fibra).',
      'No es lo mismo que un cable módem HFC, aunque el cliente diga “módem”.',
      'Router/Wi-Fi reparte Internet a los dispositivos; a veces va integrado.',
      'Cómo saber si la fibra “está bien”: POWER OK, PON registrada (suele verde fija), LOS apagada (no roja).',
      'Apagar la ONT corta el servicio; solo si el procedimiento lo indica (reinicio).',
      'Pérdida de señal óptica = la ONT no recibe bien la luz por la fibra (suele verse como LOS rojo o PON sin registro).',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-diagnostico',
    titulo: 'Cómo diagnosticar ONT / fibra / router',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Diagnóstico',
    intencion: 'ONT_DIAGNOSTICO',
    sinonimos: [...VAR_DIAGNOSTICO],
    contenido: [
      'ONT OK típico: POWER encendido, PON registrada, LOS apagada.',
      'Sospecha fibra: LOS rojo/parpadea, PON no fija, falla tras mover cable/muebles.',
      'Sospecha router/Wi-Fi: óptica OK + cable Ethernet navega + Wi-Fi no (o solo algunos dispositivos).',
      'Si “todas verdes menos una roja”: pregunta el nombre del LED antes de concluir; si es LOS → señal óptica.',
      'Si reinició 2–3 veces sin cambio: no repetir indefinidamente; pasar a masivo/visita según LEDs.',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-post-evento',
    titulo: 'Sin Internet después de un evento (corte de luz, mover ONT, tormenta)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Post-evento',
    intencion: 'ONT_POST_EVENTO',
    sinonimos: [...VAR_POST_EVENTO],
    contenido: [
      'Tras corte de luz: espera arranque de ONT y estabilización de LEDs; un reinicio puede ayudar si quedó a medias.',
      'Si tras corte queda LOS rojo: verifica fibra y reinicia una vez; si persiste → ruta óptica / 997.',
      'Tras mover la cajita/muebles: revisa que la fibra no quedó doblada, tensionada o desconectada.',
      'Tras tormenta: valida POWER y LEDs; puede haber daño de equipo o red.',
      'Contexto temporal (“desde ayer”, “funcionaba en la mañana”) ayuda a priorizar masivo vs domicilio.',
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-visita-tecnica',
    titulo: 'Cuándo pedir visita técnica (ONT / fibra / LOS persistente)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Escalamiento',
    intencion: 'ONT_VISITA_TECNICA',
    sinonimos: [...VAR_VISITA, 'escalamiento tecnico', 'visita domicilio fibra'],
    contenido: [
      'Visita suele corresponder si: LOS sigue rojo tras validar fibra y reinicio; fibra dañada/rota; ONT sin energía sin solución en domicilio; óptica no recupera.',
      'Antes: descarta masivo del sector cuando el procedimiento lo indique.',
      'El técnico revisa señal óptica, conectores, patch, instalación y estado del equipo; puede requerir cambio de ONT o reparación de fibra según hallazgo.',
      'Si el cliente ya reinició varias veces sin cambio y LOS/óptica sigue mal → no insistir en reinicios; escalar.',
      SC_997,
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
  {
    id: 'ont-sin-internet-general',
    titulo: 'Sin Internet — guía rápida de triaje (ONT / Wi-Fi / todos los equipos)',
    categoria: 'TÉCNICO',
    tipo: 'micro',
    seccionPortal: 'Soporte FTTH → Triaje',
    intencion: 'SIN_INTERNET_TRIAJE',
    sinonimos: [...VAR_SIN_INTERNET],
    contenido: [
      'Triaje rápido: 1) ¿Falla en todos los dispositivos? 2) ¿Wi-Fi o cable? 3) Mira LEDs de la ONT: ¿LOS rojo? ¿PON? ¿POWER?',
      'Si LOS rojo/parpadea → trata como pérdida de señal óptica (doc Luz LOS en rojo).',
      'Si PON OK / LOS apagada y no navega → router/Wi-Fi/servicio (doc PON normal sin Internet).',
      'Si ONT apagada → alimentación.',
      'Valida estado comercial activo y masivos cuando corresponda.',
      'Lenguaje natural sin “ONT”: “se me fue el internet”, “no me carga nada”, “xq no tengo internet” → mismo triaje.',
      SC_997,
    ],
    fuente: 'entrenamiento-ont-ftth',
  },
]

/** Convierte ejemplos Q&A a docs micro adicionales (refuerzo de matching) */
export function docsEjemplosOntADocs() {
  return EJEMPLOS_ONT_FTTH.map((ej, i) => {
    const pregNorm = String(ej.pregunta)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    // Evitar tokens genéricos (internet, tengo…) que contaminan el ranking
    const STOP_EJ = new Set([
      'que',
      'como',
      'por',
      'para',
      'una',
      'unos',
      'este',
      'esta',
      'esto',
      'tiene',
      'tengo',
      'tiene',
      'pero',
      'cuando',
      'donde',
      'cual',
      'mi',
      'mis',
      'con',
      'sin',
      'del',
      'las',
      'los',
      'una',
      'unos',
    ])
    const claves = pregNorm
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_EJ.has(w))
      .filter((w) => !['internet', 'significa', 'despues', 'tambien'].includes(w))
      .slice(0, 8)
    return {
      id: `ont-ej-${String(i + 1).padStart(3, '0')}`,
      titulo: ej.pregunta.replace(/\?+$/, '').slice(0, 90),
      categoria: 'TÉCNICO',
      tipo: 'micro',
      seccionPortal: 'Entrenamiento ONT/FTTH',
      intencion: ej.intencion,
      sinonimos: [ej.pregunta, pregNorm, ej.intencion, ...claves],
      contenido: [ej.respuesta],
      fuente: 'entrenamiento-ont-ftth-ejemplos',
      ejemploPregunta: ej.pregunta,
    }
  })
}

export function docsOntFtthCompletos() {
  return [...DOCS_ONT_FTTH, ...docsEjemplosOntADocs()]
}
