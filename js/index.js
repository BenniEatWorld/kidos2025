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

// ===== EINFACHES DROPDOWN-MENÜ =====

let menuCreated = false;

// Erstelle einfaches Dropdown-Menü
function createSimpleDropdownMenu() {
  console.log('=== createSimpleDropdownMenu called ===');
  
  if (menuCreated) {
    console.log('Menu already created');
    return;
  }
  
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!menu || !overflowBtn || !dropdown) {
    console.log('Menu elements not found');
    return;
  }
  
  const tiles = document.querySelectorAll('.tile');
  console.log('Found', tiles.length, 'tiles for menu');
  
  // Prüfe jede Tile auf h2-Inhalte
  tiles.forEach((tile, i) => {
    const h2 = tile.querySelector('h2');
    console.log(`Tile ${i + 1}:`, h2 ? `"${h2.textContent.trim()}"` : 'no h2 found');
  });
  
  if (tiles.length === 0) {
    console.log('No tiles found yet');
    return;
  }
  
  // Entferne alle bestehenden Links
  menu.querySelectorAll('a').forEach(link => link.remove());
  dropdown.innerHTML = '';
  
  // Sammle alle Tile-Überschriften
  const menuItems = [];
  tiles.forEach((tile, i) => {
    const h2 = tile.querySelector('h2');
    if (h2 && h2.textContent.trim()) {
      tile.id = tile.id || 'tile-scroll-' + (i + 1);
      menuItems.push({
        text: h2.textContent.trim(),
        targetId: tile.id,
        tile: tile
      });
    }
  });
  
  console.log('Collected', menuItems.length, 'menu items');
  
  if (menuItems.length === 0) {
    console.log('No menu items found');
    return;
  }
  
  // Zeige Dropdown-Button (bereits im HTML sichtbar)
  overflowBtn.style.display = 'block';
  // Behalte Hamburger-Icon bei
  overflowBtn.innerHTML = '<span>&#9776;</span>';
  
  // Erstelle Dropdown-Links
  menuItems.forEach(item => {
    const link = document.createElement('a');
    link.textContent = item.text;
    link.href = '#' + item.targetId;
    
    link.onclick = (e) => {
      e.preventDefault();
      
      // Schließe Dropdown
      hideDropdown();
      
      // Scrolle zu Tile
      const main = document.getElementById('main-scroll-inner');
      const rect = item.tile.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      const scrollTop = main.scrollTop + rect.top - mainRect.top - 20;
      main.scrollTo({ top: scrollTop, behavior: 'smooth' });
      
      console.log('Scrolled to:', item.text);
    };
    
    dropdown.appendChild(link);
  });
  
  // Setup Dropdown-Events
  setupDropdownEvents();
  
  // Positioniere Dropdown
  positionDropdown();
  
  menuCreated = true;
  console.log('Simple dropdown menu created with', menuItems.length, 'items');
}

// Dropdown anzeigen
function showDropdown() {
  const dropdown = document.getElementById('menu-dropdown');
  dropdown.style.opacity = '1';
  dropdown.style.visibility = 'visible';
  dropdown.style.transform = 'translateX(-50%) translateY(0)';
}

// Dropdown verstecken
function hideDropdown() {
  const dropdown = document.getElementById('menu-dropdown');
  dropdown.style.opacity = '0';
  dropdown.style.visibility = 'hidden';
  dropdown.style.transform = 'translateX(-50%) translateY(-10px)';
}

// Dropdown-Position aktualisieren
function positionDropdown() {
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  // Positionierung wird über CSS gehandhabt (zentriert)
  if (overflowBtn && dropdown) {
    const btnRect = overflowBtn.getBoundingClientRect();
    dropdown.style.top = (btnRect.bottom + 5) + 'px';
    // left und transform werden über CSS gesetzt für Zentrierung
  }
}

// Setup einfache Dropdown-Events
function setupDropdownEvents() {
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!overflowBtn || !dropdown) return;
  
  let hoverTimeout;
  
  // Button-Click
  overflowBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropdown.style.opacity === '1') {
      hideDropdown();
    } else {
      showDropdown();
    }
  };
  
  // Button-Hover
  overflowBtn.onmouseenter = () => {
    clearTimeout(hoverTimeout);
    showDropdown();
  };
  
  overflowBtn.onmouseleave = () => {
    hoverTimeout = setTimeout(() => {
      if (!dropdown.matches(':hover')) {
        hideDropdown();
      }
    }, 200);
  };
  
  // Dropdown-Hover
  dropdown.onmouseenter = () => {
    clearTimeout(hoverTimeout);
  };
  
  dropdown.onmouseleave = () => {
    hideDropdown();
  };
  
  // Click außerhalb schließt Dropdown
  document.addEventListener('click', (e) => {
    if (!overflowBtn.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  });
  
  console.log('Dropdown events setup complete');
}

// Window-Resize-Handler
window.addEventListener('resize', () => {
  positionDropdown();
});

// Sofortige Menü-Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing menu immediately');
  
  // Zeige Hamburger-Button sofort an
  const overflowBtn = document.getElementById('menu-overflow-btn');
  if (overflowBtn) {
    overflowBtn.style.display = 'block';
    overflowBtn.innerHTML = '<span>&#9776;</span>';
    console.log('Hamburger menu button shown immediately');
    
    // Setup basic click event auch ohne Inhalte
    overflowBtn.onclick = () => {
      const dropdown = document.getElementById('menu-dropdown');
      if (dropdown.children.length === 0) {
        dropdown.innerHTML = '<div style="padding: 1em; color: var(--accent-1); opacity: 0.7;">Menü wird geladen...</div>';
      }
      toggleDropdown();
    };
  }
  
  // Versuche Menü zu erstellen
  setTimeout(() => {
    createSimpleDropdownMenu();
  }, 100);
  
  // Fallback nach längerem Warten
  setTimeout(() => {
    if (!menuCreated) {
      console.log('Fallback menu creation after 3 seconds');
      createSimpleDropdownMenu();
    }
  }, 3000);
});

// Nach Page-Load nochmal versuchen
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!menuCreated) {
      console.log('Page loaded: trying to create menu');
      createSimpleDropdownMenu();
    }
  }, 500);
});

// Manueller Trigger für Tests
window.createMenu = function() {
  menuCreated = false;
  createSimpleDropdownMenu();
};

// Debug-Funktion
window.debugSimpleMenu = function() {
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  const tiles = document.querySelectorAll('.tile');
  
  console.log('=== SIMPLE MENU DEBUG ===');
  console.log('Menu created:', menuCreated);
  console.log('Menu element:', menu);
  console.log('Overflow button:', overflowBtn, 'display:', overflowBtn?.style.display);
  console.log('Dropdown:', dropdown, 'items:', dropdown?.children.length);
  console.log('Tiles found:', tiles.length);
  
  tiles.forEach((tile, i) => {
    const h2 = tile.querySelector('h2');
    console.log(`Tile ${i}: "${h2?.textContent || 'NO H2'}" id: ${tile.id}`);
  });
};
