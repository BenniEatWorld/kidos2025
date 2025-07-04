// Passwort-Hash für die Anwendung
const PASSWORT_HASH = "a87dc46c10998d49038499595ea919acf69a290eba2fa756d4e9fcb0ea10e257";

// Login-Funktionen
function showLogin() {
  document.getElementById('start-login-modal').style.display = 'block';
  setTimeout(() => {
    document.getElementById('pw-input').focus();
  }, 200);
}

function closeLogin() {
  document.getElementById('start-login-modal').style.display = 'none';
  document.getElementById('pw-input').value = '';
  document.getElementById('pw-error').textContent = '';
}

async function checkPassword() {
  const input = document.getElementById('pw-input').value;
  const errorDiv = document.getElementById('pw-error');
  const hash = await sha256(input);
  if (hash === PASSWORT_HASH) {
    window.location.href = 'kidos2025.htm';
  } else {
    errorDiv.textContent = 'Falsches Passwort!';
  }
}

// Hilfsfunktion: SHA-256-Hash als Hex-String berechnen
async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Dynamisches Menü für Kachelüberschriften
function createTileMenu() {
  const menu = document.getElementById('tile-menu');
  if (!menu) return;
  
  // Warte, bis die Kachelüberschriften geladen sind
  setTimeout(() => {
    const tiles = document.querySelectorAll('.tile');
    menu.innerHTML = '';
    
    tiles.forEach((tile, i) => {
      const h2 = tile.querySelector('h2');
      if (h2) {
        // Kachel bekommt eine ID, falls nicht vorhanden
        tile.id = tile.id || 'tile-scroll-' + (i + 1);
        
        const a = document.createElement('a');
        a.textContent = h2.textContent;
        a.href = '#' + tile.id;
        a.style.cssText = 'color:var(--accent-1);text-decoration:none;opacity:0.7;padding:0 0.2em;transition:opacity 0.18s;cursor:pointer;font-weight:400;';
        
        a.onmouseenter = () => a.style.opacity = '1';
        a.onmouseleave = () => a.style.opacity = '0.7';
        
        a.onclick = (e) => {
          e.preventDefault();
          const main = document.getElementById('main-scroll-inner');
          const rect = tile.getBoundingClientRect();
          const mainRect = main.getBoundingClientRect();
          // Scroll-Offset: Headerhöhe (70px) + etwas Abstand
          const scrollTop = main.scrollTop + rect.top - mainRect.top - 16;
          main.scrollTo({ top: scrollTop, behavior: 'smooth' });
        };
        
        menu.appendChild(a);
      }
    });
  }, 400); // nach dem Laden der Kacheltexte
}

// Nach dem Laden der Kacheltexte erneut aufrufen
document.addEventListener('DOMContentLoaded', createTileMenu);
setTimeout(createTileMenu, 1200);
