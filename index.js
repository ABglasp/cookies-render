const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;
const COOKIES_PATH = path.join('/tmp', 'cookies.txt');

// Główna strona testowa
app.get('/', (req, res) => {
  res.send('✅ Serwer cookies działa');
});

// Endpoint pobierania cookies.txt
app.get('/cookies', async (req, res) => {
  if (!fs.existsSync(COOKIES_PATH)) {
    console.log('❗ Brak cookies.txt – generuję nowe');
    await generateCookies();
    setTimeout(() => sendCookies(res), 2000); // Poczekaj na zapis pliku
  } else {
    sendCookies(res);
  }
});

function sendCookies(res) {
  try {
    const data = fs.readFileSync(COOKIES_PATH, 'utf-8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(data);
  } catch (err) {
    res.status(500).send('❌ Błąd odczytu cookies.txt');
  }
}

// Endpoint generowania cookies
app.get('/generate', async (req, res) => {
  await generateCookies()
    .then(() => res.send('✅ cookies.txt wygenerowany'))
    .catch(() => res.status(500).send('❌ Błąd generowania cookies'));
});

// Główna funkcja generowania
function generateCookies() {
  return new Promise((resolve, reject) => {
    exec('node login.js', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Błąd generowania:', error.message);
        return reject();
      }
      console.log(stdout);
      resolve();
    });
  });
}

// Auto-generate co 10 minut
setInterval(() => {
  console.log('🔁 Auto-refresh cookies...');
  fetch(`http://localhost:${PORT}/generate`)
    .then(res => console.log(`✅ Auto-refresh status: ${res.status}`))
    .catch(err => console.error('❌ Auto-refresh error:', err.message));
}, 1000 * 60 * 10); // 10 minut

// Self-ping co 3 minuty
setInterval(() => {
  fetch(`http://localhost:${PORT}/`)
    .then(res => console.log(`🔃 Self-ping: ${res.status}`))
    .catch(err => console.error('❌ Self-ping error:', err.message));
}, 1000 * 60 * 3);

// Start serwera
app.listen(PORT, () => {
  console.log(`✅ Serwer cookies działa na porcie ${PORT}`);
});
