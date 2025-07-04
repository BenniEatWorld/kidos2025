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

// Overflow-Handling für das Menü mit verbessertem Caching
let lastMenuWidth = null;
let lastLinkCount = null;
let menuOverflowInProgress = false;

function handleMenuOverflow() {
  // Verhindere mehrfache gleichzeitige Aufrufe
  if (menuOverflowInProgress) {
    console.log('Menu overflow already in progress, skipping');
    return;
  }
  
  menuOverflowInProgress = true;
  
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!menu || !overflowBtn || !dropdown) {
    menuOverflowInProgress = false;
    return;
  }
  
  // Sammle alle Links aus Menü UND Dropdown
  const menuLinks = Array.from(menu.querySelectorAll('a'));
  const dropdownLinks = Array.from(dropdown.querySelectorAll('a'));
  const allLinks = [...menuLinks, ...dropdownLinks];
  
  if (allLinks.length === 0) {
    console.log('No links found for menu overflow');
    menuOverflowInProgress = false;
    return;
  }
  
  // Prüfe ob sich etwas geändert hat
  const currentMenuWidth = menu.getBoundingClientRect().width;
  const currentLinkCount = allLinks.length;
  
  if (lastMenuWidth === currentMenuWidth && lastLinkCount === currentLinkCount) {
    console.log('Menu unchanged, skipping overflow calculation');
    menuOverflowInProgress = false;
    return;
  }
  
  console.log('Calculating menu overflow for', currentLinkCount, 'links, width:', currentMenuWidth);
  
  lastMenuWidth = currentMenuWidth;
  lastLinkCount = currentLinkCount;
  
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
    
    console.log('Menu calculation: visible', visibleCount, 'of', currentLinks.length, 'links');
    
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
      
      // Event-Listener für Hover - vereinfacht
      setupDropdownEvents(overflowBtn, dropdown);
    }
    
    menuOverflowInProgress = false;
  });
}
    return;
  }
  
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!menu || !overflowBtn || !dropdown) {
    return;
  }
  
  menuOverflowInProgress = true;
  
  // Sammle alle Links aus Menü UND Dropdown für Link-Count
  const menuLinks = Array.from(menu.querySelectorAll('a'));
  const dropdownLinks = Array.from(dropdown.querySelectorAll('a'));
  const totalLinkCount = menuLinks.length + dropdownLinks.length;
  
  // Warte auf nächsten Frame für korrekte Measurements
  requestAnimationFrame(() => {
    const menuRect = menu.getBoundingClientRect();
    const currentWidth = Math.round(menuRect.width);
    
    // Prüfe ob sich die relevanten Eigenschaften geändert haben
    const widthChanged = lastMenuWidth !== currentWidth;
    const linkCountChanged = lastLinkCount !== totalLinkCount;
    
    // Wenn sich nichts Wesentliches geändert hat, überspringe die Neuberechnung
    if (!widthChanged && !linkCountChanged && totalLinkCount > 0) {
      menuOverflowInProgress = false;
      return;
    }
    
    console.log(`Menu overflow recalculation: width=${currentWidth} (was ${lastMenuWidth}), links=${totalLinkCount} (was ${lastLinkCount})`);
    
    // Aktualisiere Cache-Werte
    lastMenuWidth = currentWidth;
    lastLinkCount = totalLinkCount;
    
    const allLinks = [...menuLinks, ...dropdownLinks];
    
    if (allLinks.length === 0) {
      menuOverflowInProgress = false;
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
    
    // Kurze Verzögerung für DOM-Update
    setTimeout(() => {
      performOverflowCalculation(menu, overflowBtn, dropdown);
      menuOverflowInProgress = false;
    }, 50);
  });
}

function performOverflowCalculation(menu, overflowBtn, dropdown) {
  const menuRect = menu.getBoundingClientRect();
  const availableWidth = menuRect.width - 100; // Mehr Sicherheitsabstand
  
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
      dropdown.style.top = (btnRect.bottom + 2) + 'px';
      dropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
    });
    
    // Event-Listener für Hover - komplett neue Implementierung
    setupDropdownEvents(overflowBtn, dropdown);
  }
}
  
  if (allLinks.length === 0) {
    menuOverflowInProgress = false;
    return;
  }
  
  // Reset nur bei tatsächlicher Änderung
  overflowBtn.style.display = 'none';
  dropdown.innerHTML = '';
  dropdown.style.opacity = '0';
  dropdown.style.visibility = 'hidden';
  
  // Füge alle Links zurück ins Hauptmenü ein
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
    const availableWidth = currentWidth - 80; // Padding + Sicherheitsabstand
    
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
        dropdownLink.onclick = (e) => {
          // Führe Original-Click-Handler aus
          if (link.onclick) link.onclick(e);
          // Schließe Dropdown nach Click
          hideDropdown();
        };
        dropdown.appendChild(dropdownLink);
        
        // Entferne aus Menü
        link.remove();
      }
      
      // Positioniere Dropdown direkt unter dem Button
      requestAnimationFrame(() => {
        const btnRect = overflowBtn.getBoundingClientRect();
        dropdown.style.top = (btnRect.bottom + 2) + 'px';
        dropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
      });
    
    // Event-Listener für Hover - komplett neue Implementierung
    setupDropdownEvents(overflowBtn, dropdown);
  }
}

// Dropdown-Timing-Variable
let dropdownTimeout = null;

// Dropdown anzeigen (vereinfacht)
function showDropdown() {
  const dropdown = document.getElementById('menu-dropdown');
  if (dropdown) {
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'translateY(0)';
  }
}

// Dropdown verstecken (vereinfacht)
function hideDropdown() {
  clearTimeout(dropdownTimeout);
  const dropdown = document.getElementById('menu-dropdown');
  if (dropdown) {
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'translateY(-10px)';
  }
}

// Event-Listener für alle Arten von Größenänderungen (vereinfacht)
function setupMenuResizeListeners() {
  let resizeTimeout;
  
  function recalculateMenu() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!menuOverflowInProgress) {
        handleMenuOverflow();
      }
    }, 150);
  }
  
  // Standard Resize-Event
  window.addEventListener('resize', recalculateMenu);
  
  // Focus-Events für Fenster-State-Änderungen
  window.addEventListener('focus', () => {
    setTimeout(recalculateMenu, 200);
  });
  
  // Orientation-Change für mobile Geräte
  window.addEventListener('orientationchange', () => {
    setTimeout(recalculateMenu, 300);
  });
  
  // ResizeObserver nur für Header (weniger störend)
  if (window.ResizeObserver) {
    const headerObserver = new ResizeObserver((entries) => {
      // Nur wenn sich die Breite tatsächlich geändert hat
      for (let entry of entries) {
        if (entry.contentBoxSize && entry.contentBoxSize[0]) {
          recalculateMenu();
          break;
        }
      }
    });
    
    const header = document.querySelector('header');
    if (header) {
      headerObserver.observe(header);
    }
  }
}

// Rufe Setup-Funktion auf (temporär deaktiviert wegen Flackern)
// setupMenuResizeListeners();

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
  
  // Extra: Trigger nach 5 Sekunden für sicherheit (deaktiviert wegen Flackern)
  setTimeout(() => {
    console.log('Final menu overflow check after 5 seconds');
    const menu = document.getElementById('tile-menu');
    const links = menu?.querySelectorAll('a');
    console.log('Final check: menu has', links?.length || 0, 'links');
    // Nur einmal ausführen, nicht bei jedem Hover
    // if (links && links.length > 0) {
    //   handleMenuOverflow();
    // }
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

// Dropdown Event-Setup (vereinfacht und robust)
let dropdownTimeout = null;
let isDropdownActive = false;

function setupDropdownEvents(overflowBtn, dropdown) {
  // Entferne alle bestehenden Event-Listener
  overflowBtn.onmouseenter = null;
  overflowBtn.onmouseleave = null;
  dropdown.onmouseenter = null;
  dropdown.onmouseleave = null;
  
  // Einfache, direkte Event-Handler
  overflowBtn.onmouseenter = () => {
    clearTimeout(dropdownTimeout);
    isDropdownActive = true;
    showDropdown();
  };
  
  overflowBtn.onmouseleave = () => {
    scheduleHideDropdown();
  };
  
  dropdown.onmouseenter = () => {
    clearTimeout(dropdownTimeout);
    isDropdownActive = true;
  };
  
  dropdown.onmouseleave = () => {
    scheduleHideDropdown();
  };
}

// Dropdown verstecken mit Verzögerung
function scheduleHideDropdown() {
  clearTimeout(dropdownTimeout);
  dropdownTimeout = setTimeout(() => {
    isDropdownActive = false;
    hideDropdown();
  }, 300); // Längere Verzögerung für bessere UX
}

// Dropdown-Timing-Variablen
let dropdownHideTimeout = null;

// Globaler Click-Handler für Dropdown
document.addEventListener('click', (e) => {
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (overflowBtn && dropdown && 
      !overflowBtn.contains(e.target) && 
      !dropdown.contains(e.target)) {
    hideDropdown();
  }
});

// Debug-Funktion für manuelles Testen des Dropdowns
window.testDropdown = function() {
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  console.log('=== DROPDOWN TEST ===');
  console.log('Overflow Button:', overflowBtn);
  console.log('Dropdown:', dropdown);
  console.log('Button display:', overflowBtn?.style.display);
  console.log('Dropdown opacity:', dropdown?.style.opacity);
  console.log('Dropdown visibility:', dropdown?.style.visibility);
  
  if (overflowBtn && dropdown) {
    overflowBtn.style.display = 'block';
    dropdown.innerHTML = '<a href="#test">Test Link</a>';
    setupDropdownEvents(overflowBtn, dropdown);
    console.log('Dropdown setup complete - try hovering over the button');
  }
};

// Manueller Trigger für Menu-Overflow (für Tests)
window.manualMenuOverflow = function() {
  console.log('Manual menu overflow triggered');
  lastMenuWidth = null;
  lastLinkCount = null;
  handleMenuOverflow();
};

// Einfacher Resize-Listener nur für echte Größenänderungen
window.addEventListener('resize', () => {
  setTimeout(() => {
    console.log('Window resized, triggering menu overflow');
    window.manualMenuOverflow();
  }, 300);
});
