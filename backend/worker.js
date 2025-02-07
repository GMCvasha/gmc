const https = require('https');

const keepServerActive = (url) => {
  const req = https.get(url, (res) => {
    console.log(`Pinged ${url} - Status: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.error(`Error pinging ${url}:`, err.message);
  });

  req.end();
};

setInterval(() => keepServerActive('https://gmc-l83v.onrender.com/api/events'), 720000);
