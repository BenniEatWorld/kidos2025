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

// ===== NEUES ROBUST MENU SYSTEM =====

// Globale Menu-Zustandsvariablen
let menuInitialized = false;
let menuData = []; // Original-Menüdaten aus Tiles
let currentMenuState = null; // Aktueller Anzeigezustand

// 1. Menü-Daten aus Tiles sammeln (nur einmal!)
function collectMenuData() {
  if (menuInitialized) {
    console.log('Menu already initialized, skipping data collection');
    return;
  }
  
  const tiles = document.querySelectorAll('.tile');
  menuData = [];
  
  tiles.forEach((tile, i) => {
    const h2 = tile.querySelector('h2');
    if (h2 && h2.textContent.trim()) {
      // Kachel bekommt eine ID, falls nicht vorhanden
      tile.id = tile.id || 'tile-scroll-' + (i + 1);
      
      menuData.push({
        id: tile.id,
        text: h2.textContent.trim(),
        index: i,
        onclick: () => {
          const main = document.getElementById('main-scroll-inner');
          const rect = tile.getBoundingClientRect();
          const mainRect = main.getBoundingClientRect();
          const scrollTop = main.scrollTop + rect.top - mainRect.top - 16;
          main.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
      });
    }
  });
  
  menuInitialized = true;
  console.log('Menu data collected:', menuData.length, 'items');
  
  // Nach Sammlung sofort rendern
  renderMenu();
}

// 2. Menü in DOM rendern (basierend auf menuData)
function renderMenu() {
  if (!menuInitialized || menuData.length === 0) {
    console.log('Cannot render menu: not initialized or no data');
    return;
  }
  
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  
  if (!menu || !overflowBtn) {
    console.log('Menu elements not found');
    return;
  }
  
  // Komplett leeren (außer Overflow-Button)
  const existingLinks = menu.querySelectorAll('a');
  existingLinks.forEach(link => link.remove());
  
  // Dropdown auch leeren
  const dropdown = document.getElementById('menu-dropdown');
  if (dropdown) {
    dropdown.innerHTML = '';
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
  }
  
  // Overflow-Button verstecken
  overflowBtn.style.display = 'none';
  
  // Alle Links aus menuData erstellen
  menuData.forEach(item => {
    const link = document.createElement('a');
    link.textContent = item.text;
    link.href = '#' + item.id;
    link.onclick = (e) => {
      e.preventDefault();
      item.onclick();
    };
    
    // Link vor Overflow-Button einfügen
    menu.insertBefore(link, overflowBtn);
  });
  
  console.log('Menu rendered with', menuData.length, 'links');
  
  // Nach dem Rendern: Overflow prüfen
  setTimeout(() => {
    calculateOverflow();
  }, 100);
}

// 3. Overflow berechnen und Dropdown füllen
function calculateOverflow() {
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!menu || !overflowBtn || !dropdown) return;
  
  const menuRect = menu.getBoundingClientRect();
  const availableWidth = menuRect.width - 80; // Sicherheitsabstand
  const overflowBtnWidth = 70;
  
  const links = Array.from(menu.querySelectorAll('a'));
  let totalWidth = 0;
  let visibleCount = 0;
  
  // Berechne wie viele Links passen
  for (let i = 0; i < links.length; i++) {
    const linkWidth = links[i].getBoundingClientRect().width + 32; // Gap
    const needsOverflow = i < links.length - 1;
    const spaceNeeded = needsOverflow ? overflowBtnWidth : 0;
    
    if (totalWidth + linkWidth + spaceNeeded <= availableWidth) {
      totalWidth += linkWidth;
      visibleCount++;
    } else {
      break;
    }
  }
  
  console.log(`Overflow calculation: ${visibleCount} of ${links.length} links visible`);
  
  // Wenn Overflow nötig
  if (visibleCount < links.length) {
    // Overflow-Button anzeigen
    overflowBtn.style.display = 'block';
    
    // Überschüssige Links ins Dropdown verschieben
    for (let i = visibleCount; i < links.length; i++) {
      const originalLink = links[i];
      
      // Dropdown-Link erstellen
      const dropdownLink = document.createElement('a');
      dropdownLink.textContent = originalLink.textContent;
      dropdownLink.href = originalLink.href;
      dropdownLink.onclick = originalLink.onclick;
      
      dropdown.appendChild(dropdownLink);
      originalLink.remove();
    }
    
    // Dropdown positionieren
    setTimeout(() => {
      const btnRect = overflowBtn.getBoundingClientRect();
      dropdown.style.top = (btnRect.bottom + 4) + 'px';
      dropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
    }, 10);
    
    // Hover-Events für Dropdown
    setupDropdownHover();
    
    console.log(`Overflow setup: ${dropdown.children.length} items in dropdown`);
  }
}

// 4. Einfache Dropdown-Hover-Funktionalität
function setupDropdownHover() {
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!overflowBtn || !dropdown) return;
  
  let hideTimeout;
  
  const show = () => {
    clearTimeout(hideTimeout);
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'translateY(0)';
  };
  
  const hide = () => {
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'translateY(-10px)';
  };
  
  const scheduleHide = () => {
    hideTimeout = setTimeout(() => {
      if (!overflowBtn.matches(':hover') && !dropdown.matches(':hover')) {
        hide();
      }
    }, 200);
  };
  
  // Event-Listener (vorherige entfernen)
  overflowBtn.onmouseenter = show;
  overflowBtn.onmouseleave = scheduleHide;
  dropdown.onmouseenter = () => clearTimeout(hideTimeout);
  dropdown.onmouseleave = hide;
}

// 5. Resize-Handler (nur bei tatsächlicher Größenänderung)
let lastWindowWidth = window.innerWidth;

function handleResize() {
  const currentWidth = window.innerWidth;
  if (Math.abs(currentWidth - lastWindowWidth) > 50) { // Nur bei signifikanter Änderung
    console.log('Significant window resize detected, recalculating menu');
    lastWindowWidth = currentWidth;
    
    // Menü komplett neu rendern
    setTimeout(() => {
      renderMenu();
    }, 100);
  }
}

// Resize-Listener mit Debouncing
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 250);
});

// ===== INITIALIZATION =====

// Von tile-loader.js aufgerufen
function createTileMenu() {
  console.log('createTileMenu called');
  if (!menuInitialized) {
    collectMenuData();
  } else {
    console.log('Menu already initialized, just rendering');
    renderMenu();
  }
}

// Fallback-Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  
  // Fallback nach 3 Sekunden
  setTimeout(() => {
    if (!menuInitialized) {
      console.log('Fallback: Initializing menu after 3 seconds');
      collectMenuData();
    }
  }, 3000);
});

// Debug-Funktionen
window.debugMenu = function() {
  console.log('=== MENU DEBUG ===');
  console.log('Initialized:', menuInitialized);
  console.log('Menu data:', menuData);
  console.log('Current DOM links:', document.querySelectorAll('#tile-menu a').length);
  console.log('Dropdown links:', document.querySelectorAll('#menu-dropdown a').length);
  console.log('Overflow button visible:', document.getElementById('menu-overflow-btn').style.display !== 'none');
};

window.refreshMenu = function() {
  console.log('=== MANUAL MENU REFRESH ===');
  menuInitialized = false;
  menuData = [];
  collectMenuData();
};

window.testMenuResize = function() {
  console.log('=== TESTING MENU RESIZE ===');
  renderMenu();
};
