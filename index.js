const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

const POSSIBLE_PATHS = [
  path.join(__dirname, 'cookies.txt'),
  path.join('/opt/render/project/src', 'cookies.txt'),
  path.join('/tmp', 'cookies.txt')
];

function findCookiesPath() {
  for (const p of POSSIBLE_PATHS) {
    if (fs.existsSync(p)) {
      console.log(`✅ cookies.txt znaleziony w: ${p}`);
      return p;
    }
  }
  console.warn('⚠️ cookies.txt nie znaleziony – używam domyślnej ścieżki');
  return POSSIBLE_PATHS[0];
}

function sendCookies(res) {
  const foundPath = findCookiesPath();
  try {
    const data = fs.readFileSync(foundPath, 'utf-8');
    console.log(`📤 Wysyłam cookies.txt (${data.length} bajtów) z ${foundPath}`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(data);
  } catch (err) {
    console.error('❌ Błąd odczytu cookies.txt:', err.message);
    res.status(500).send('❌ Błąd odczytu cookies.txt');
  }
}

function generateCookies() {
  console.log('🔄 Wywołanie login.js...');
  return new Promise((resolve, reject) => {
    exec('node login.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Błąd generowania cookies:', error.message);
        return reject(error);
      }
      console.log('✅ login.js zakończony:\n' + stdout);
      const saved = POSSIBLE_PATHS.find(p => fs.existsSync(p));
      if (saved) {
        console.log(`✅ cookies.txt został zapisany w: ${saved}`);
        resolve();
      } else {
        console.warn('⚠️ login.js się wykonał, ale cookies.txt nie znaleziony – coś poszło nie tak');
        reject(new Error('Cookies not saved'));
      }
    });
  });
}

// Strona testowa
app.get('/', (req, res) => {
  console.log('➡️ GET / — Strona testowa');
  res.send('✅ Serwer cookies działa');
});

// Endpoint do pobierania cookies
app.get('/cookies', async (req, res) => {
  console.log('➡️ GET /cookies — próba odczytu cookies.txt');

  const existing = POSSIBLE_PATHS.find(p => fs.existsSync(p));
  if (existing) {
    sendCookies(res);
  } else {
    console.log('⚠️ cookies.txt nie znaleziony – próbuję go wygenerować...');
    await generateCookies()
      .then(() => sendCookies(res))
      .catch(() => res.status(500).send('❌ Nie udało się wygenerować cookies.txt'));
  }
});

// Endpoint ręcznego generowania cookies
app.get('/generate', async (req, res) => {
  console.log('➡️ GET /generate — wymuszam wygenerowanie cookies.txt');
  await generateCookies()
    .then(() => res.send('✅ cookies.txt wygenerowany'))
    .catch(() => res.status(500).send('❌ Błąd generowania cookies'));
});

// Auto-refresh co 10 minut
setInterval(() => {
  console.log('🔁 Auto-refresh cookies...');
  fetch(`http://localhost:${PORT}/generate`)
    .then(res => console.log(`🟢 Auto-refresh status: ${res.status}`))
    .catch(err => console.error('❌ Auto-refresh error:', err.message));
}, 1000 * 60 * 10);

// Self-ping co 3 minuty
setInterval(() => {
  fetch(`http://localhost:${PORT}/`)
    .then(res => console.log(`🔃 Self-ping: ${res.status}`))
    .catch(err => console.error('❌ Self-ping error:', err.message));
}, 1000 * 60 * 3);

// Start
app.listen(PORT, () => {
  console.log(`✅ Serwer cookies działa na porcie ${PORT}`);
});
