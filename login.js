const { chromium } = require('playwright');
const fs = require('fs');
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
    await page.waitForTimeout(3000);

    const cookies = await context.cookies();

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

    const path = require('path');
    const filePath = path.join(__dirname, 'cookies.txt');
    fs.writeFileSync(filePath, netscapeCookies);
    console.log("✅ cookies.txt zapisany w formacie Netscape");
  } catch (err) {
    console.error("❌ Błąd logowania:", err);
  }

  await browser.close();
})();
