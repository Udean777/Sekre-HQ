const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Return IPv4 address that is not an internal/localhost address
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const envPath = path.join(__dirname, '../.env');
const currentIp = getLocalIp();
const newUrl = `http://${currentIp}:8080/`;

console.log(`📡 Ditemukan IP lokal: ${currentIp}`);

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Update existing value or add a new one
if (envContent.includes('EXPO_PUBLIC_API_URL=')) {
  envContent = envContent.replace(
    /^EXPO_PUBLIC_API_URL=.*$/m,
    `EXPO_PUBLIC_API_URL=${newUrl}`
  );
} else {
  if (envContent.length > 0 && !envContent.endsWith('\n')) {
    envContent += '\n';
  }
  envContent += `EXPO_PUBLIC_API_URL=${newUrl}\n`;
}

fs.writeFileSync(envPath, envContent, 'utf8');
console.log(`✅ Berhasil memperbarui EXPO_PUBLIC_API_URL menjadi ${newUrl} di dalam file .env`);
