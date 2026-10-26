/**
 * Script para procesar la lista de canales de Claro y generar las grillas
 * Basado en la lista oficial proporcionada por el usuario
 */

const fs = require('fs');
const path = require('path');

// Lista completa de canales de Claro con sus diales
const canalesClaro = [
  // Niños
  { dial: 2, nombre: 'Discovery Kids' },
  { dial: 4, nombre: 'Kiddo' },
  { dial: 6, nombre: 'Disney Junior' },
  { dial: 7, nombre: 'El canal del Payaso Plim Plim' },
  { dial: 9, nombre: 'Disney Channel' },
  { dial: 10, nombre: 'Cartoon Network' },
  { dial: 11, nombre: 'ETC TV' },
  { dial: 13, nombre: 'Cartoonito' },
  { dial: 15, nombre: 'Mi Música Hits' },
  { dial: 16, nombre: 'NTV' },
  // HD niños
  { dial: 502, nombre: 'Discovery Kids HD' },
  { dial: 506, nombre: 'Disney Junior HD' },
  { dial: 509, nombre: 'Disney Channel HD' },
  { dial: 510, nombre: 'Cartoon Network HD' },
  { dial: 511, nombre: 'ETC TV HD' },
  { dial: 513, nombre: 'Cartoonito HD' },
  { dial: 516, nombre: 'NTV HD' },
  { dial: 519, nombre: 'Mega 2' },

  // Lifestyle
  { dial: 21, nombre: 'Discovery Home & Health' },
  { dial: 22, nombre: 'Food Network' },
  { dial: 23, nombre: 'El Gourmet' },
  { dial: 128, nombre: 'Love Nature' },
  { dial: 129, nombre: 'TLC' },
  { dial: 131, nombre: 'HGTV' },
  // HD lifestyle
  { dial: 521, nombre: 'Discovery Home & Health' },
  { dial: 522, nombre: 'Food Network HD' },
  { dial: 523, nombre: 'El Gourmet HD' },
  { dial: 622, nombre: 'Love Nature HD' },
  { dial: 631, nombre: 'HGTV HD' },

  // General
  { dial: 28, nombre: 'Canal Claro' },
  { dial: 30, nombre: 'Esne' },
  { dial: 31, nombre: 'Enlace' },
  { dial: 32, nombre: 'Cámara de Diputados TV' },
  { dial: 35, nombre: 'CNN Internacional' },
  { dial: 36, nombre: 'CNN En Español' },
  { dial: 37, nombre: 'CNN Chile' },
  { dial: 38, nombre: '24 Horas' },
  { dial: 54, nombre: 'Mega Noticias' },
  { dial: 109, nombre: 'KidOO' },
  { dial: 118, nombre: 'REC TV' },
  { dial: 119, nombre: 'Claro Cinema' },
  { dial: 518, nombre: 'Vive' },
  { dial: 647, nombre: 'Mega Ficción' },
  // HD general
  { dial: 525, nombre: 'TV Senado' },
  { dial: 527, nombre: '13 Realities' },
  { dial: 528, nombre: 'ESNE' },
  { dial: 529, nombre: 'T13 en Vivo' },
  { dial: 533, nombre: 'CNN Internacional' },
  { dial: 535, nombre: 'CNN En Español' },
  { dial: 536, nombre: 'CNN Chile' },
  { dial: 537, nombre: 'Bío Bío TV HD' },
  { dial: 538, nombre: '24 Horas HD' },
  { dial: 539, nombre: 'France 24 HD' },
  { dial: 540, nombre: 'Cámara de Diputados TV' },
  { dial: 542, nombre: 'Mega Noticias' },
  { dial: 546, nombre: 'Marga Marga TV' },
  { dial: 588, nombre: '13 Cultura' },
  { dial: 588, nombre: '13 Teleseries' },
  { dial: 616, nombre: 'TVN3' },
  { dial: 618, nombre: 'REC TV' },
  { dial: 648, nombre: 'Carolina TV' },
  { dial: 657, nombre: 'MTV' },
  { dial: 659, nombre: 'MTV 00s HD' },

  // Cine/Series
  { dial: 90, nombre: 'HBO' },
  { dial: 91, nombre: 'Cinemax' },
  { dial: 92, nombre: 'TNT' },
  { dial: 93, nombre: 'Cinecanal' },
  { dial: 94, nombre: 'A3 Series' },
  { dial: 98, nombre: 'Cine Premium' },
  { dial: 100, nombre: 'Star Channel' },
  { dial: 101, nombre: 'FX' },
  { dial: 102, nombre: 'Universal TV' },
  { dial: 103, nombre: 'Studio Universal' },
  { dial: 105, nombre: 'Warner' },
  { dial: 111, nombre: 'Space' },
  { dial: 112, nombre: 'TCM' },
  { dial: 113, nombre: 'AMC' },
  { dial: 115, nombre: 'USA Network' },
  { dial: 134, nombre: 'TNT Novelas' },
  { dial: 138, nombre: 'AMC Series' },
  { dial: 142, nombre: 'Az Corazon' },
  { dial: 143, nombre: 'Telemundo' },
  { dial: 145, nombre: 'Zona Latina' },
  { dial: 150, nombre: 'Via X' },
  { dial: 151, nombre: 'HTV' },
  // HD cine/series
  { dial: 590, nombre: 'HBO HD' },
  { dial: 591, nombre: 'Cinemax HD' },
  { dial: 592, nombre: 'TNT HD' },
  { dial: 593, nombre: 'Cinecanal HD' },
  { dial: 595, nombre: 'Film and Art' },
  { dial: 598, nombre: 'Star Channel HD' },
  { dial: 600, nombre: 'FX HD' },
  { dial: 601, nombre: 'Universal TV' },
  { dial: 602, nombre: 'Studio Universal HD' },
  { dial: 603, nombre: 'Warner HD' },
  { dial: 605, nombre: 'Space HD' },
  { dial: 599, nombre: 'TCM' },
  { dial: 613, nombre: 'AMC HD' },
  { dial: 615, nombre: 'USA Network HD' },
  { dial: 612, nombre: 'A3 series HD' },
  { dial: 642, nombre: 'AMC Series' },
  { dial: 643, nombre: 'Telemundo HD' },
  { dial: 649, nombre: 'Zona Latina' },
  { dial: 650, nombre: 'Via X 2 HD' },
  { dial: 652, nombre: 'HTV' },

  // Deportes
  { dial: 153, nombre: 'ClaroSports' },
  { dial: 169, nombre: 'Discovery Turbo' },
  { dial: 170, nombre: 'ESPN' },
  { dial: 174, nombre: 'ESPN 2' },
  { dial: 175, nombre: 'ESPN 3' },
  { dial: 176, nombre: 'ESPN 5' },
  { dial: 177, nombre: 'ESPN Premium' },
  { dial: 178, nombre: 'ESPN 6' },
  { dial: 179, nombre: 'TNT Sports' },
  { dial: 189, nombre: 'TNT Sports Premium SD' },
  { dial: 190, nombre: 'Teletrak' },
  { dial: 197, nombre: 'HBO Family' },
  // HD deportes
  { dial: 469, nombre: 'Claro Sports HD' },
  { dial: 470, nombre: 'Discovery Turbo HD' },
  { dial: 471, nombre: 'Teletrak HD' },
  { dial: 473, nombre: 'ESPN 4' },
  { dial: 474, nombre: 'ESPN HD' },
  { dial: 475, nombre: 'ESPN 2 HD' },
  { dial: 476, nombre: 'ESPN 3 HD' },
  { dial: 477, nombre: 'ESPN 5 HD' },
  { dial: 478, nombre: 'ESPN Premium HD' },
  { dial: 479, nombre: 'ESPN 6 HD' },
  { dial: 489, nombre: 'TNT Sports 3' },
  { dial: 490, nombre: 'TNT Sports Premium HD' },
  { dial: 491, nombre: 'TNT Sports Premium SD' },

  // Documentales/Naturaleza
  { dial: 120, nombre: 'Discovery Channel' },
  { dial: 121, nombre: 'Discovery Science' },
  { dial: 122, nombre: 'Nat Geo' },
  { dial: 123, nombre: 'Bío Bío TV' },
  { dial: 124, nombre: 'ARTV' },
  { dial: 126, nombre: '13C' },
  { dial: 132, nombre: 'Investigation Discovery (ID)' },
  { dial: 133, nombre: 'TNT Series' },
  { dial: 134, nombre: 'Adult Swim' },
  { dial: 135, nombre: 'E!' },
  // HD documentales
  { dial: 620, nombre: 'Discovery Channel HD' },
  { dial: 621, nombre: 'Discovery Science HD' },
  { dial: 625, nombre: 'Nat Geo HD' },
  { dial: 626, nombre: '13C HD' },
  { dial: 632, nombre: 'Investigation Discovery (ID)' },
  { dial: 633, nombre: 'TNT Series HD' },
  { dial: 634, nombre: 'Adult Swim HD' },
  { dial: 635, nombre: 'TNT Novelas HD' },
  { dial: 637, nombre: 'TLC' },
  { dial: 638, nombre: 'E!' },

  // Premium HBO
  { dial: 260, nombre: 'HBO Signature' },
  { dial: 261, nombre: 'HBO 2' },
  { dial: 262, nombre: 'HBO Plus' },
  { dial: 263, nombre: 'HBO Pop' },
  { dial: 265, nombre: 'HBO Xtreme' },
  { dial: 266, nombre: 'Universal Premiere' },
  { dial: 280, nombre: 'Universal Cinema' },
  { dial: 282, nombre: 'Universal Reality' },
  { dial: 283, nombre: 'Universal Comedy' },
  { dial: 284, nombre: 'Universal Crime' },
  // HD HBO
  { dial: 760, nombre: 'HBO family HD' },
  { dial: 761, nombre: 'HBO Signature HD' },
  { dial: 762, nombre: 'HBO 2 HD' },
  { dial: 763, nombre: 'HBO POP HD' },
  { dial: 765, nombre: 'HBO Mundi' },
  { dial: 766, nombre: 'HBO xtreme HD' },
  { dial: 767, nombre: 'HBO Mundi HD' },
  { dial: 780, nombre: 'Universal Premiere' },
  { dial: 782, nombre: 'Universal Cinema' },
  { dial: 783, nombre: 'Universal Reality' },
  { dial: 784, nombre: 'Universal Comedy' },
  { dial: 785, nombre: 'Universal Crime' },

  // Adultos
  { dial: 300, nombre: 'Playboy' },
  { dial: 301, nombre: 'Venus' },
  { dial: 302, nombre: 'sextreme' },
  { dial: 800, nombre: 'Playboy' },
  { dial: 801, nombre: 'Venus' },
  { dial: 802, nombre: 'sextreme' },

  // Otros
  { dial: 512, nombre: 'Tevex' },
  { dial: 527, nombre: '13 Realities' },
  { dial: 543, nombre: 'UChile TV' },
  { dial: 587, nombre: 'Kanal D' },
  { dial: 639, nombre: '13 Pop' },
  { dial: 641, nombre: 'Canal País' },
  { dial: 586, nombre: 'Mega Ficción HD' },
  { dial: 589, nombre: 'RCN Telenovelas' },
];

// Función para detectar si es HD
const esHD = (nombre) => nombre.includes('HD');

// Función para generar el array formato de grilla
const generarGrilla = (canales) => {
  return canales
    .filter(c => c.dial && c.nombre)
    .map(c => [c.dial, c.nombre]);
};

// Generar grilla completa
const grillaCompleta = generarGrilla(canalesClaro);

console.log(`Total de canales: ${grillaCompleta.length}`);
console.log(`Total HD: ${canalesClaro.filter(c => esHD(c.nombre)).length}`);
console.log(`Total SD: ${canalesClaro.filter(c => !esHD(c.nombre)).length}`);

// Guardar como JSON para referencia
const outputPath = path.join(__dirname, '..', 'public', 'claro-grilla-completa.json');
fs.writeFileSync(outputPath, JSON.stringify(canalesClaro, null, 2));
console.log(`Grilla guardada en ${outputPath}`);

// Generar formato para grillaCanales.js
const formatoJS = grillaCompleta
  .map(([dial, nombre]) => `  [${dial}, '${nombre}'],`)
  .join('\n');

console.log('\n=== Formato para grillaCanales.js ===');
console.log(formatoJS);
