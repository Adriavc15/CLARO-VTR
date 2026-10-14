import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECTIONS = [
  { name: 'dashboard', url: 'http://localhost:5173', wait: 5000 },
  { name: 'noticias', url: 'http://localhost:5173#noticias', wait: 3000 },
  { name: 'planes', url: 'http://localhost:5173#planes', wait: 3000 },
  { name: 'streaming', url: 'http://localhost:5173#streaming', wait: 3000 },
  { name: 'grilla', url: 'http://localhost:5173#grilla', wait: 3000 },
  { name: 'modem', url: 'http://localhost:5173#modem', wait: 3000 },
  { name: 'pasos', url: 'http://localhost:5173#pasos', wait: 3000 },
  { name: 'systems', url: 'http://localhost:5173#systems', wait: 3000 },
  { name: 'tipificaciones', url: 'http://localhost:5173#tipificaciones', wait: 3000 },
  { name: 'links', url: 'http://localhost:5173#links', wait: 3000 },
  { name: 'apex', url: 'http://localhost:5173#apex', wait: 5000 },
  { name: 'androidtv', url: 'http://localhost:5173#androidtv', wait: 5000 },
  { name: 'genesys', url: 'http://localhost:5173#genesys', wait: 5000 },
  { name: 'andes', url: 'http://localhost:5173#andes', wait: 5000 },
  { name: 'medidor', url: 'http://localhost:5173#medidor', wait: 5000 },
  { name: 'formularios', url: 'http://localhost:5173/formularios', wait: 5000 },
];

const screenshotsDir = path.join(__dirname, '../public/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewport({ width: 1920, height: 1080 });

  for (const section of SECTIONS) {
    console.log(`Capturing: ${section.name}...`);

    await page.goto(section.url, { waitUntil: 'networkidle2', timeout: 120000 });
    await new Promise(resolve => setTimeout(resolve, section.wait));

    // Wait for body to be visible
    await page.waitForSelector('body', { timeout: 10000 });

    const screenshotPath = path.join(screenshotsDir, `${section.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    console.log(`  Saved: ${screenshotPath}`);
  }

  await browser.close();
  console.log('All screenshots captured!');
})();
