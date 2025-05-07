const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("🔐 Logowanie do YouTube...");
    await page.goto('https://accounts.google.com/');

    await page.fill('input[type="email"]', process.env.YT_EMAIL);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    await page.fill('input[type="password"]', process.env.YT_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000); // można zwiększyć do 10s

    const cookies = await context.cookies();

    // Zamiana cookies na format Netscape
    const netscapeCookies = cookies.map(cookie => {
      const domain = cookie.domain.startsWith('.') ? cookie.domain : '.' + cookie.domain;
      const flag = cookie.domain.startsWith('.') ? 'TRUE' : 'FALSE';
      const path = cookie.path;
      const secure = cookie.secure ? 'TRUE' : 'FALSE';
      const expiration = Math.floor(Date.now() / 1000) + 3600; // ważność 1h
      const name = cookie.name;
      const value = cookie.value;

      return `${domain}\t${flag}\t${path}\t${secure}\t${expiration}\t${name}\t${value}`;
    }).join('\n');

    // Zapis do trwałej lokalizacji na Render
    const filePath = path.join('/tmp', 'cookies.txt');
    fs.writeFileSync(filePath, netscapeCookies);
    console.log(`✅ cookies.txt zapisany do ${filePath}`);
  } catch (err) {
    console.error('❌ Błąd logowania:', err);
  }

  await browser.close();
})();
