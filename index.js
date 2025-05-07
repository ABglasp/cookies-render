const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

const possiblePaths = [
  path.join(__dirname, 'cookies.txt'),
  path.join('/tmp', 'cookies.txt'),
  path.join(process.cwd(), 'cookies.txt'),
];

// 🔍 Próba odczytu cookies z kilku ścieżek
function sendCookies(res) {
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const data = fs.readFileSync(p, 'utf-8');
        console.log(`✅ cookies.txt znaleziony i odczytany z: ${p}`);
        res.setHeader('Content-Type', 'text/plain');
        return res.send(data);
      } catch (err) {
        console.error(`❌ Błąd odczytu cookies.txt z ${p}:`, err.message);
        return res.status(500).send('❌ Błąd odczytu cookies.txt');
      }
    } else {
      console.log(`🔍 cookies.txt nie znaleziony w: ${p}`);
    }
  }

  console.warn('❌ cookies.txt nie znaleziony w żadnej znanej lokalizacji.');
  res.status(404).send('❌ cookies.txt nie znaleziony');
}

// 👉 Strona testowa
app.get('/', (req, res) => {
  console.log('➡️ GET / — Strona testowa');
  res.send('✅ Serwer cookies działa');
});

// 👉 Endpoint cookies
app.get('/cookies', async (req, res) => {
  console.log('➡️ GET /cookies — próba odczytu cookies.txt');
  const exists = possiblePaths.some(p => fs.existsSync(p));

  if (!exists) {
    console.warn('❗ cookies.txt nie istnieje — uruchamiam generowanie');
    await generateCookies();
    setTimeout(() => sendCookies(res), 3000);
  } else {
    sendCookies(res);
  }
});

// 👉 Endpoint generowania cookies
app.get('/generate', async (req, res) => {
  console.log('➡️ GET /generate — uruchamiam generowanie cookies');
  await generateCookies()
    .then(() => res.send('✅ cookies.txt wygenerowany'))
    .catch(() => res.status(500).send('❌ Błąd generowania cookies'));
});

// 👉 Wywołanie login.js
function generateCookies() {
  console.log('🔄 Wywołanie login.js...');
  return new Promise((resolve, reject) => {
    exec('node login.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Błąd generowania cookies:', error.message);
        return reject();
      }
      console.log('✅ login.js zakończony:\n' + stdout);
      resolve();
    });
  });
}

// 🔁 Auto-refresh cookies co 10 minut
setInterval(() => {
  console.log('🔁 Auto-refresh cookies...');
  fetch(`http://localhost:${PORT}/generate`)
    .then(res => console.log(`✅ Auto-refresh status: ${res.status}`))
    .catch(err => console.error('❌ Auto-refresh error:', err.message));
}, 1000 * 60 * 10);

// 🔄 Self-ping co 3 minuty
setInterval(() => {
  fetch(`http://localhost:${PORT}/`)
    .then(res => console.log(`🔃 Self-ping: ${res.status}`))
    .catch(err => console.error('❌ Self-ping error:', err.message));
}, 1000 * 60 * 3);

// 🚀 Start serwera
app.listen(PORT, () => {
  console.log(`✅ Serwer cookies działa na porcie ${PORT}`);
});
