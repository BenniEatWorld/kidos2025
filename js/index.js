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

// Overflow-Handling für das Menü (vereinfacht und funktional)
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
  
  // Füge alle Links zurück ins Hauptmenü ein (neuen Link erstellen für saubere Zuordnung)
  menuLinks.forEach(link => link.remove());
  allLinks.forEach(originalLink => {
    const menuLink = document.createElement('a');
    menuLink.textContent = originalLink.textContent;
    menuLink.href = originalLink.href;
    menuLink.onclick = originalLink.onclick;
    menu.insertBefore(menuLink, overflowBtn);
  });
  
  // Warte auf nächsten Frame für korrekte Measurements
  requestAnimationFrame(() => {
    const menuRect = menu.getBoundingClientRect();
    const availableWidth = menuRect.width - 80; // Padding + Sicherheitsabstand
    
    const currentLinks = Array.from(menu.querySelectorAll('a'));
    let totalWidth = 0;
    let visibleCount = 0;
    
    // Berechne wie viele Links sichtbar bleiben können
    for (let i = 0; i < currentLinks.length; i++) {
      const link = currentLinks[i];
      const linkWidth = link.getBoundingClientRect().width + 24; // Gap zwischen Links
      
      // Prüfe ob noch Platz für diesen Link ist (plus 60px für Overflow-Button falls nötig)
      const needsOverflowSpace = i < currentLinks.length - 1;
      const requiredSpace = needsOverflowSpace ? 60 : 0;
      
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
      
      // Positioniere Dropdown direkt unter dem Button
      requestAnimationFrame(() => {
        const btnRect = overflowBtn.getBoundingClientRect();
        dropdown.style.top = (btnRect.bottom + 2) + 'px'; // Nur 2px Gap
        dropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
      });
      
      // Event-Listener für Hover - komplett neue Implementierung
      setupDropdownEvents(overflowBtn, dropdown);
    }
  });
}

// Dropdown anzeigen
function showDropdown() {
  const dropdown = document.getElementById('menu-dropdown');
  if (dropdown) {
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'translateY(0)';
  }
}

// Dropdown mit Verzögerung verstecken
function hideDropdownDelayed() {
  clearTimeout(dropdownHideTimeout);
  dropdownHideTimeout = setTimeout(() => {
    const dropdown = document.getElementById('menu-dropdown');
    const overflowBtn = document.getElementById('menu-overflow-btn');
    
    // Prüfe ob Maus noch über Button oder Dropdown ist
    if (dropdown && overflowBtn) {
      const isOverDropdown = dropdown.matches(':hover');
      const isOverButton = overflowBtn.matches(':hover');
      
      if (!isOverDropdown && !isOverButton) {
        hideDropdown();
      }
    }
  }, 200); // Längere Verzögerung für bessere UX
}

// Dropdown sofort verstecken
function hideDropdown() {
  clearTimeout(dropdownHideTimeout);
  
  const dropdown = document.getElementById('menu-dropdown');
  if (dropdown) {
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'translateY(-10px)';
  }
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
  console.log('DOM loaded, setting up menu...');
  
  // Fallback: Versuche Menü nach 2 Sekunden zu erstellen, falls es noch nicht da ist
  setTimeout(() => {
    const menu = document.getElementById('tile-menu');
    if (menu && menu.querySelectorAll('a').length === 0) {
      console.log('No menu found after 2 seconds, trying to create...');
      createTileMenu();
    } else {
      console.log('Menu already exists with', menu?.querySelectorAll('a').length, 'links');
      // Trigger overflow handling
      handleMenuOverflow();
    }
  }, 2000);
  
  // Prüfe Menü-Overflow nach dem vollständigen Laden der Seite
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('Page fully loaded, checking menu overflow...');
      handleMenuOverflow();
    }, 500);
  });
  
  // Extra: Trigger nach 5 Sekunden für sicherheit
  setTimeout(() => {
    console.log('Final menu overflow check after 5 seconds');
    const menu = document.getElementById('tile-menu');
    const links = menu?.querySelectorAll('a');
    console.log('Final check: menu has', links?.length || 0, 'links');
    if (links && links.length > 0) {
      handleMenuOverflow();
    }
  }, 5000);
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

// Dropdown Event-Setup (verhindert Event-Listener-Anhäufung)
let currentDropdownListeners = [];

function setupDropdownEvents(overflowBtn, dropdown) {
  // Entferne alle bestehenden Event-Listener
  currentDropdownListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  currentDropdownListeners = [];
  
  // Definiere Event-Handler-Funktionen
  const showHandler = () => {
    clearTimeout(dropdownHideTimeout);
    showDropdown();
  };
  
  const hideHandler = () => {
    hideDropdownDelayed();
  };
  
  // Füge neue Event-Listener hinzu und tracke sie
  const addListener = (element, event, handler) => {
    element.addEventListener(event, handler);
    currentDropdownListeners.push({ element, event, handler });
  };
  
  addListener(overflowBtn, 'mouseenter', showHandler);
  addListener(overflowBtn, 'mouseleave', hideHandler);
  addListener(dropdown, 'mouseenter', showHandler);
  addListener(dropdown, 'mouseleave', hideHandler);
  
  // Zusätzlich: Click außerhalb versteckt Dropdown
  const documentClickHandler = (e) => {
    if (!overflowBtn.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  };
  
  addListener(document, 'click', documentClickHandler);
}

// Dropdown-Timing-Variablen
let dropdownHideTimeout = null;
