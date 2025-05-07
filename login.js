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
    await page.waitForTimeout(5000); // Można wydłużyć do 10000

    console.log('✅ Formularz logowania wypełniony');

    const cookies = await context.cookies();

    // Zamiana na format Netscape
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

    const filePath = path.join('/opt/render/project/src', 'cookies.txt'); // 👈 stała ścieżka
    fs.writeFileSync(filePath, netscapeCookies);
    console.log('✅ cookies.txt zapisany w:', filePath);

  } catch (err) {
    console.error('❌ Błąd logowania:', err.message);
  }

  await browser.close();
})();
