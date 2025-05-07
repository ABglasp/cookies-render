const chromium = require('playwright').chromium;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
  console.log('🚀 Start login.js');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('➡️ Otwieranie strony logowania Google...');
    await page.goto('https://accounts.google.com/');
    console.log(`🔗 Adres po wejściu: ${page.url()}`);

    console.log('📝 Wpisywanie adresu email...');
    await page.fill('input[type="email"]', process.env.YT_EMAIL);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    console.log(`📍 Adres po emailu: ${page.url()}`);

    console.log('🔐 Wpisywanie hasła...');
    await page.fill('input[type="password"]', process.env.YT_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    console.log(`📍 Adres po haśle: ${page.url()}`);

    console.log('📡 Pobieranie cookies...');
    const cookies = await context.cookies();
    console.log(`🧁 Liczba cookies: ${cookies.length}`);

    if (cookies.length === 0) {
      console.warn('⚠️ Brak cookies – możliwe problemy z logowaniem (CAPTCHA?)');
    }

    const netscapeCookies = cookies.map(cookie => {
      const domain = cookie.domain.startsWith('.') ? cookie.domain : '.' + cookie.domain;
      const flag = cookie.domain.startsWith('.') ? 'TRUE' : 'FALSE';
      const path = cookie.path;
      const secure = cookie.secure ? 'TRUE' : 'FALSE';
      const expiration = Math.floor(Date.now() / 1000) + 3600;
      const name = cookie.name;
      const value = cookie.value;
      return [domain, flag, path, secure, expiration, name, value].join('\t');
    }).join('\n');

    const locations = [
      path.join(__dirname, 'cookies.txt'),
      '/tmp/cookies.txt',
      path.join(process.cwd(), 'cookies.txt')
    ];

    let saved = false;
    for (const filePath of locations) {
      try {
        fs.writeFileSync(filePath, netscapeCookies);
        console.log(`✅ cookies.txt zapisany w: ${filePath}`);
        saved = true;
        break;
      } catch (err) {
        console.error(`❌ Nie udało się zapisać do ${filePath}: ${err.message}`);
      }
    }

    if (!saved) {
      console.error('❌ Nie udało się zapisać cookies.txt w żadnej lokalizacji!');
    }

  } catch (err) {
    console.error('❌ Błąd logowania:', err);
  }

  await browser.close();
  console.log('🔚 Zamykanie przeglądarki');
})();
