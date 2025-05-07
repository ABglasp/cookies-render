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
    console.log('➡️ Logowanie do YouTube...');
    await page.goto('https://accounts.google.com/');

    await page.fill('input[type="email"]', process.env.YT_EMAIL);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    await page.fill('input[type="password"]', process.env.YT_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);

    console.log('✅ Formularz logowania zakończony');

    const cookies = await context.cookies();

    // Tworzenie cookies w formacie Netscape
    const netscapeCookies = cookies.map(cookie => {
      const domain = cookie.domain.startsWith('.') ? cookie.domain : '.' + cookie.domain;
      const flag = cookie.domain.startsWith('.') ? 'TRUE' : 'FALSE';
      const secure = cookie.secure ? 'TRUE' : 'FALSE';
      const expiration = Math.floor(Date.now() / 1000) + 3600;
      return `${domain}\t${flag}\t${cookie.path}\t${secure}\t${expiration}\t${cookie.name}\t${cookie.value}`;
    }).join('\n');

    const paths = [
      path.join(__dirname, 'cookies.txt'),
      path.join('/tmp', 'cookies.txt'),
    ];

    let success = false;
    for (const p of paths) {
      try {
        fs.writeFileSync(p, netscapeCookies);
        console.log(`✅ cookies.txt zapisany w: ${p}`);
        success = true;
        break;
      } catch (err) {
        console.warn(`❌ Nie udało się zapisać w: ${p} — ${err.message}`);
      }
    }

    if (!success) {
      console.error('❌ Nie udało się zapisać cookies.txt w żadnej lokalizacji.');
    }

  } catch (err) {
    console.error('❌ Błąd logowania:', err.message);
  }

  await browser.close();
})();
