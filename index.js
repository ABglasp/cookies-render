const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

// 🟢 Główna strona testowa
app.get('/', (req, res) => {
  res.send('🟢 Serwer cookies działa');
});

// 📄 Endpoint do pobierania cookies.txt
app.get('/cookies', (req, res) => {
  const filePath = path.join(__dirname, 'cookies.txt');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Plik cookies.txt nie istnieje.');
  }
});

// 🔄 Endpoint do generowania cookies
app.get('/generate', (req, res) => {
  exec('node login.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Błąd generowania cookies: ${error.message}`);
      return res.status(500).send('Błąd generowania cookies');
    }
    console.log(stdout);
    res.send('✅ cookies.txt wygenerowany');
  });
});

// ⏱ Self-ping co 3 minuty
setInterval(() => {
  fetch(`http://localhost:${PORT}`)
    .then(res => console.log(`🔄 Self-ping status: ${res.status}`))
    .catch(err => console.error('❌ Self-ping błąd:', err.message));
}, 180000); // 3 minuty

// ▶ Start
app.listen(PORT, () => {
  console.log(`🟢 Serwer cookies działa na porcie ${PORT}`);
});
