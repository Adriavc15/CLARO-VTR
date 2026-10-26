/**
 * Script para extraer canales y logos de la guía de canales de Claro
 * Este script usa Playwright para navegar y extraer la información
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function extraerCanalesClaro() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Navegando a la guía de canales de Claro...');
    await page.goto('https://www.clarochile.cl/personas/servicios/servicios-hogar/television/guia-de-canales/', {
      waitUntil: 'networkidle',
    });

    // Esperar a que cargue el botón de "Ver Canales TV"
    await page.waitForTimeout(3000);

    // Hacer clic en "Ver Canales TV"
    const botonVerCanales = await page.locator('text=Ver Canales TV').first();
    if (await botonVerCanales.isVisible()) {
      await botonVerCanales.click();
      console.log('Clic en "Ver Canales TV"');
      await page.waitForTimeout(5000);
    }

    // Intentar encontrar la grilla de canales
    // Buscar elementos que contengan información de canales
    const canales = await page.evaluate(() => {
      const resultados = [];

      // Buscar elementos que tengan información de canales
      // La estructura puede variar, así que buscamos patrones comunes
      const elementos = document.querySelectorAll('[class*="canal"], [class*="channel"], [class*="logo"], img[alt*="canal"], img[alt*="channel"]');

      elementos.forEach((el) => {
        const texto = el.textContent?.trim();
        const alt = el.getAttribute('alt');
        const src = el.getAttribute('src');

        if (texto || alt) {
          resultados.push({
            texto,
            alt,
            src,
            html: el.outerHTML.substring(0, 200),
          });
        }
      });

      return resultados;
    });

    console.log(`Se encontraron ${canales.length} elementos potenciales de canales`);
    console.log('Primeros 10 resultados:');
    canales.slice(0, 10).forEach((c, i) => {
      console.log(`${i + 1}. Texto: ${c.texto || c.alt}`);
      console.log(`   Src: ${c.src}`);
    });

    // Guardar resultados
    const outputPath = path.join(__dirname, '..', 'public', 'claro-canales-extraidos.json');
    fs.writeFileSync(outputPath, JSON.stringify(canales, null, 2));
    console.log(`Resultados guardados en ${outputPath}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

extraerCanalesClaro();
