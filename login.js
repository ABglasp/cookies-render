const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
  console.log('🚀 Start login.js');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('➡️ Otwieram stronę logowania YouTube...');
    await page.goto('https://accounts.google.com/');

    await page.fill('input[type="email"]', process.env.YT_EMAIL);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    await page.fill('input[type="password"]', process.env.YT_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);

    console.log('✅ Zalogowano – pobieram cookies...');

    const cookies = await context.cookies();

    const netscapeCookies = cookies.map(cookie => {
      const domain = cookie.domain.startsWith('.') ? cookie.domain : '.' + cookie.domain;
      const flag = cookie.domain.startsWith('.') ? 'TRUE' : 'FALSE';
      const path = cookie.path;
      const secure = cookie.secure ? 'TRUE' : 'FALSE';
      const expiration = Math.floor(Date.now() / 1000) + 3600;
      return `${domain}\t${flag}\t${path}\t${secure}\t${expiration}\t${cookie.name}\t${cookie.value}`;
    }).join('\n');

    // Główna i trwała ścieżka na Render
    const filePath = path.join('/opt/render/project/src', 'cookies.txt');
    fs.writeFileSync(filePath, netscapeCookies);
    console.log(`✅ cookies.txt zapisany w: ${filePath} (${netscapeCookies.length} znaków)`);

  } catch (err) {
    console.error('❌ Błąd podczas logowania lub zapisu cookies:', err.message);
  }

  await browser.close();
})();
