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
  const existingLinks = menu.querySelectorAll('a');
  existingLinks.forEach(link => link.remove());
  
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
  
  // Debug: Erzwinge eine weitere Überprüfung nach 1 Sekunde
  setTimeout(() => {
    console.log('Forced overflow check after 1 second');
    handleMenuOverflow();
  }, 1000);
}

// Overflow-Handling für das Menü
function handleMenuOverflow() {
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!menu || !overflowBtn || !dropdown) {
    return;
  }
  
  // Sammle alle Links aus Menü UND Dropdown
  const menuLinks = Array.from(menu.querySelectorAll('a'));
  const dropdownLinks = Array.from(dropdown.querySelectorAll('a'));
  const allLinks = [...menuLinks, ...dropdownLinks];
  
  if (allLinks.length === 0) {
    return;
  }
  
  // Reset: Verstecke Overflow-Button und leere Dropdown
  overflowBtn.style.display = 'none';
  dropdown.innerHTML = '';
  dropdown.style.opacity = '0';
  dropdown.style.visibility = 'hidden';
  
  // Füge alle Links zurück ins Hauptmenü ein
  allLinks.forEach(link => {
    if (!menu.contains(link)) {
      // Erstelle neuen Link im Menü
      const menuLink = document.createElement('a');
      menuLink.textContent = link.textContent;
      menuLink.href = link.href;
      menuLink.onclick = link.onclick;
      menu.insertBefore(menuLink, overflowBtn);
    }
  });
  
  // Warte auf nächsten Frame für korrekte Measurements
  requestAnimationFrame(() => {
    const menuRect = menu.getBoundingClientRect();
    const availableWidth = menuRect.width - 40; // Padding berücksichtigen
    const overflowBtnWidth = 60;
    
    const currentLinks = Array.from(menu.querySelectorAll('a'));
    let totalWidth = 0;
    let visibleCount = 0;
    
    // Berechne wie viele Links sichtbar bleiben können
    for (let i = 0; i < currentLinks.length; i++) {
      const link = currentLinks[i];
      const linkWidth = link.getBoundingClientRect().width + 24; // Gap zwischen Links
      
      // Wenn es nicht der letzte Link ist, prüfe ob noch Platz für Overflow-Button ist
      const isLastLink = i === currentLinks.length - 1;
      const needsOverflowSpace = !isLastLink;
      const requiredSpace = needsOverflowSpace ? overflowBtnWidth : 0;
      
      if (totalWidth + linkWidth + requiredSpace <= availableWidth) {
        totalWidth += linkWidth;
        visibleCount++;
      } else {
        break;
      }
    }
    
    // Wenn nicht alle Links sichtbar sind, verschiebe überschüssige ins Dropdown
    if (visibleCount < currentLinks.length) {
      overflowBtn.style.display = 'block';
      
      // Verstecke überschüssige Links und füge sie zum Dropdown hinzu
      for (let i = visibleCount; i < currentLinks.length; i++) {
        const link = currentLinks[i];
        
        // Erstelle Dropdown-Link
        const dropdownLink = document.createElement('a');
        dropdownLink.textContent = link.textContent;
        dropdownLink.href = link.href;
        dropdownLink.onclick = link.onclick;
        dropdown.appendChild(dropdownLink);
        
        // Entferne aus Menü
        link.remove();
      }
      
      // Positioniere Dropdown
      requestAnimationFrame(() => {
        const btnRect = overflowBtn.getBoundingClientRect();
        dropdown.style.top = (btnRect.bottom + 8) + 'px';
        dropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
      });
      
      // Event-Listener für Hover
      overflowBtn.onmouseenter = showDropdown;
      overflowBtn.onmouseleave = hideDropdownDelayed;
      dropdown.onmouseleave = hideDropdown;
    }
  });
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

// Debug-Funktionen (können aus der Konsole aufgerufen werden)
window.debugMenu = function() {
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  console.log('=== MENU DEBUG ===');
  console.log('Menu element:', menu);
  console.log('Menu width:', menu?.getBoundingClientRect().width);
  console.log('Menu links:', menu?.querySelectorAll('a').length);
  console.log('Overflow button:', overflowBtn);
  console.log('Overflow button display:', overflowBtn?.style.display);
  console.log('Dropdown:', dropdown);
  console.log('Dropdown links:', dropdown?.querySelectorAll('a').length);
  
  // Liste alle Menü-Links auf
  const links = menu?.querySelectorAll('a');
  if (links) {
    links.forEach((link, i) => {
      const rect = link.getBoundingClientRect();
      console.log(`Link ${i}: "${link.textContent}" width: ${rect.width}`);
    });
  }
};

window.testOverflow = function() {
  console.log('=== TESTING OVERFLOW ===');
  handleMenuOverflow();
};

// Test-Funktion: Erstelle ein Menü mit vielen Links zum Testen
window.createTestMenu = function() {
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  
  if (!menu || !overflowBtn) return;
  
  // Entferne alle Links
  const existingLinks = menu.querySelectorAll('a');
  existingLinks.forEach(link => link.remove());
  
  // Erstelle viele Test-Links
  const testLinks = [
    'Erster Link',
    'Zweiter Link mit langem Text',
    'Dritter Link',
    'Vierter sehr langer Link Name',
    'Fünfter Link',
    'Sechster Link',
    'Siebter Link mit noch längerem Text',
    'Achter Link'
  ];
  
  testLinks.forEach((text, i) => {
    const a = document.createElement('a');
    a.textContent = text;
    a.href = '#test' + i;
    a.onclick = (e) => {
      e.preventDefault();
      console.log('Clicked:', text);
    };
    menu.insertBefore(a, overflowBtn);
  });
  
  console.log('Test menu created with', testLinks.length, 'links');
  
  // Führe Overflow-Handling aus
  setTimeout(() => {
    handleMenuOverflow();
  }, 100);
};
