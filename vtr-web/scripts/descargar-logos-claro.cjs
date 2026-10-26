/**
 * Script para descargar logos de canales de Claro
 * Intenta descargar logos desde la página oficial de Claro
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const canalesClaro = require('../public/claro-grilla-completa.json');

async function descargarLogosClaro() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navegando a la guía de canales de Claro...');
    await page.goto('https://www.clarochile.cl/personas/servicios/servicios-hogar/television/guia-de-canales/', {
      waitUntil: 'networkidle',
    });

    await page.waitForTimeout(3000);

    // Hacer clic en "Ver Canales TV"
    const botonVerCanales = await page.locator('text=Ver Canales TV').first();
    if (await botonVerCanales.isVisible()) {
      await botonVerCanales.click();
      console.log('Clic en "Ver Canales TV"');
      await page.waitForTimeout(5000);
    }

    // Buscar todas las imágenes que podrían ser logos de canales
    const logosInfo = await page.evaluate(() => {
      const resultados = [];
      const imagenes = document.querySelectorAll('img');

      imagenes.forEach((img) => {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');
        const className = img.getAttribute('class');

        // Filtrar imágenes que parecen ser logos de canales
        if (src && (alt || className?.includes('logo') || className?.includes('canal'))) {
          resultados.push({
            src,
            alt,
            className,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }
      });

      return resultados;
    });

    console.log(`Se encontraron ${logosInfo.length} imágenes potenciales`);

    // Crear directorio para logos
    const logosDir = path.join(__dirname, '..', 'public', 'claro-logos');
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    // Guardar información de logos
    fs.writeFileSync(
      path.join(logosDir, 'logos-info.json'),
      JSON.stringify(logosInfo, null, 2)
    );

    console.log('Información de logos guardada en claro-logos/logos-info.json');

    // Intentar descargar algunos logos como ejemplo
    let descargados = 0;
    for (const logo of logosInfo.slice(0, 10)) {
      try {
        if (logo.src && !logo.src.startsWith('data:')) {
          const response = await page.goto(logo.src);
          if (response && response.ok()) {
            const buffer = await response.body();
            const fileName = logo.alt
              ? logo.alt.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
              : `logo_${descargados}`;
            const filePath = path.join(logosDir, `${fileName}.png`);
            fs.writeFileSync(filePath, buffer);
            console.log(`Descargado: ${fileName}`);
            descargados++;
          }
        }
      } catch (e) {
        console.log(`Error al descargar ${logo.alt || logo.src}: ${e.message}`);
      }
    }

    console.log(`Se descargaron ${descargados} logos de ejemplo`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

descargarLogosClaro();
