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
    window.location.href = 'app/kidos2025.htm';
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
  
  const tiles = document.querySelectorAll('.tile');
  
  // Entferne alle bestehenden Links (außer Overflow-Button)
  const overflowBtn = document.getElementById('menu-overflow-btn');
  menu.innerHTML = '';
  if (overflowBtn) menu.appendChild(overflowBtn);
  
  const menuLinks = [];
  
  tiles.forEach((tile, i) => {
    const h2 = tile.querySelector('h2');
    if (h2) {
      // Kachel bekommt eine ID, falls nicht vorhanden
      tile.id = tile.id || 'tile-scroll-' + (i + 1);
      
      const a = document.createElement('a');
      a.textContent = h2.textContent;
      a.href = '#' + tile.id;
      
      a.onclick = (e) => {
        e.preventDefault();
        const main = document.getElementById('main-scroll-inner');
        const rect = tile.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        // Scroll-Offset: Headerhöhe (120px) + etwas Abstand
        const scrollTop = main.scrollTop + rect.top - mainRect.top - 16;
        main.scrollTo({ top: scrollTop, behavior: 'smooth' });
      };
      
      menuLinks.push(a);
    }
  });
  
  // Füge alle Links zum Menü hinzu
  menuLinks.forEach(link => {
    menu.insertBefore(link, overflowBtn);
  });
  
  // Prüfe Overflow nach dem Hinzufügen
  setTimeout(() => {
    handleMenuOverflow();
  }, 100);
}

// Overflow-Handling für das Menü
function handleMenuOverflow() {
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!menu || !overflowBtn || !dropdown) return;
  
  const menuLinks = Array.from(menu.querySelectorAll('a'));
  const menuRect = menu.getBoundingClientRect();
  const availableWidth = menuRect.width - 32; // Abzug für Padding
  const overflowBtnWidth = 50; // Reduzierte geschätzte Breite
  
  // Reset: Alle Links zurück ins Hauptmenü
  dropdown.innerHTML = '';
  overflowBtn.style.display = 'none';
  dropdown.style.opacity = '0';
  dropdown.style.visibility = 'hidden';
  
  menuLinks.forEach(link => {
    if (!menu.contains(link)) {
      menu.insertBefore(link, overflowBtn);
    }
  });
  
  // Warte kurz, damit die Elemente gerendert sind
  setTimeout(() => {
    let totalWidth = 0;
    const visibleLinks = [];
    const hiddenLinks = [];
    
    // Messe die tatsächliche Breite jedes Links
    for (let i = 0; i < menuLinks.length; i++) {
      const link = menuLinks[i];
      const linkRect = link.getBoundingClientRect();
      const linkWidth = linkRect.width + 32; // 2em gap zwischen Links
      
      // Prüfe ob dieser Link noch passt (+ Platz für Overflow-Button falls nötig)
      const wouldNeedOverflow = i < menuLinks.length - 1; // Nicht der letzte Link
      const requiredSpace = wouldNeedOverflow ? overflowBtnWidth : 0;
      
      if (totalWidth + linkWidth + requiredSpace <= availableWidth) {
        visibleLinks.push(link);
        totalWidth += linkWidth;
      } else {
        // Alle restlichen Links verstecken
        for (let j = i; j < menuLinks.length; j++) {
          hiddenLinks.push(menuLinks[j]);
        }
        break;
      }
    }
    
    // Versteckte Links ins Dropdown verschieben
    if (hiddenLinks.length > 0) {
      overflowBtn.style.display = 'block';
      
      // Positioniere das Dropdown richtig
      const btnRect = overflowBtn.getBoundingClientRect();
      dropdown.style.top = (btnRect.bottom + 8) + 'px';
      dropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
      
      hiddenLinks.forEach(link => {
        const dropdownLink = link.cloneNode(true);
        dropdownLink.onclick = link.onclick; // Event-Handler kopieren
        dropdown.appendChild(dropdownLink);
        link.remove();
      });
      
      // Event-Listener für Hover (nur einmal setzen)
      overflowBtn.removeEventListener('mouseenter', showDropdown);
      overflowBtn.removeEventListener('mouseleave', hideDropdownDelayed);
      dropdown.removeEventListener('mouseleave', hideDropdown);
      
      overflowBtn.addEventListener('mouseenter', showDropdown);
      overflowBtn.addEventListener('mouseleave', hideDropdownDelayed);
      dropdown.addEventListener('mouseleave', hideDropdown);
    }
  }, 50);
}

// Dropdown anzeigen
function showDropdown() {
  const dropdown = document.getElementById('menu-dropdown');
  dropdown.style.opacity = '1';
  dropdown.style.visibility = 'visible';
  dropdown.style.transform = 'translateY(0)';
}

// Dropdown mit Verzögerung verstecken
function hideDropdownDelayed() {
  setTimeout(() => {
    const dropdown = document.getElementById('menu-dropdown');
    if (!dropdown.matches(':hover')) {
      hideDropdown();
    }
  }, 100);
}

// Dropdown verstecken
function hideDropdown() {
  const dropdown = document.getElementById('menu-dropdown');
  dropdown.style.opacity = '0';
  dropdown.style.visibility = 'hidden';
  dropdown.style.transform = 'translateY(-10px)';
}

// Event-Listener für alle Arten von Größenänderungen
function setupMenuResizeListeners() {
  let resizeTimeout;
  
  function recalculateMenu() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      handleMenuOverflow();
    }, 100);
  }
  
  // Standard Resize-Event
  window.addEventListener('resize', recalculateMenu);
  
  // Fenster-State-Änderungen (Maximieren/Minimieren/Wiederherstellen)
  window.addEventListener('beforeunload', recalculateMenu);
  
  // Visibility-Change (Tab-Wechsel, Fenster-Focus)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(recalculateMenu, 200);
    }
  });
  
  // Focus-Events für Fenster-State-Änderungen
  window.addEventListener('focus', () => {
    setTimeout(recalculateMenu, 200);
  });
  
  // Orientation-Change für mobile Geräte
  window.addEventListener('orientationchange', () => {
    setTimeout(recalculateMenu, 300);
  });
  
  // ResizeObserver als modernere Alternative (falls verfügbar)
  if (window.ResizeObserver) {
    const headerObserver = new ResizeObserver(() => {
      recalculateMenu();
    });
    
    const header = document.querySelector('header');
    if (header) {
      headerObserver.observe(header);
    }
  }
  
  // Mutation Observer für DOM-Änderungen am Menü
  if (window.MutationObserver) {
    const menuObserver = new MutationObserver(() => {
      recalculateMenu();
    });
    
    const menu = document.getElementById('tile-menu');
    if (menu) {
      menuObserver.observe(menu, { 
        childList: true, 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
      });
    }
  }
}

// Rufe Setup-Funktion auf
setupMenuResizeListeners();

// Menü wird von tile-loader.js aufgerufen, wenn Tiles geladen sind
document.addEventListener('DOMContentLoaded', () => {
  // Fallback: Versuche Menü nach 2 Sekunden zu erstellen, falls es noch nicht da ist
  setTimeout(() => {
    if (document.getElementById('tile-menu').children.length === 0) {
      createTileMenu();
    }
  }, 2000);
  
  // Prüfe Menü-Overflow nach dem vollständigen Laden der Seite
  window.addEventListener('load', () => {
    setTimeout(() => {
      handleMenuOverflow();
    }, 500);
  });
});
