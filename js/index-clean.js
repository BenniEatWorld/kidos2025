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
  
  console.log('Menu created with', menuLinks.length, 'links');
  
  // Prüfe Overflow nach dem Hinzufügen - nur einmal!
  setTimeout(() => {
    handleMenuOverflow();
  }, 200);
}

// Vereinfachtes Overflow-Handling ohne Flackern
let overflowProcessed = false;

function handleMenuOverflow() {
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!menu || !overflowBtn || !dropdown) {
    return;
  }
  
  const menuLinks = Array.from(menu.querySelectorAll('a'));
  const dropdownLinks = Array.from(dropdown.querySelectorAll('a'));
  const allLinks = [...menuLinks, ...dropdownLinks];
  
  if (allLinks.length === 0) {
    console.log('No links found for menu overflow');
    return;
  }
  
  console.log('Processing menu overflow for', allLinks.length, 'links');
  
  // Reset: Verstecke Overflow-Button und leere Dropdown
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
  
  // Berechne Overflow nach DOM-Update
  requestAnimationFrame(() => {
    const menuRect = menu.getBoundingClientRect();
    const availableWidth = menuRect.width - 100; // Großzügiger Sicherheitsabstand
    
    const currentLinks = Array.from(menu.querySelectorAll('a'));
    let totalWidth = 0;
    let visibleCount = 0;
    
    // Berechne wie viele Links sichtbar bleiben können
    for (let i = 0; i < currentLinks.length; i++) {
      const link = currentLinks[i];
      const linkWidth = link.getBoundingClientRect().width + 32; // Gap zwischen Links
      
      // Wenn nicht der letzte Link, prüfe ob noch Platz für Overflow-Button ist
      const needsOverflowSpace = i < currentLinks.length - 1;
      const requiredSpace = needsOverflowSpace ? 70 : 0; // Platz für Overflow-Button
      
      if (totalWidth + linkWidth + requiredSpace <= availableWidth) {
        totalWidth += linkWidth;
        visibleCount++;
      } else {
        break;
      }
    }
    
    console.log('Menu fit analysis: showing', visibleCount, 'of', currentLinks.length, 'links');
    
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
      setTimeout(() => {
        const btnRect = overflowBtn.getBoundingClientRect();
        dropdown.style.top = (btnRect.bottom + 4) + 'px';
        dropdown.style.right = (window.innerWidth - btnRect.right) + 'px';
      }, 10);
      
      // Einfache Hover-Events
      setupSimpleDropdownEvents(overflowBtn, dropdown);
      
      console.log('Overflow button shown with', dropdown.children.length, 'items in dropdown');
    }
    
    overflowProcessed = true;
  });
}

// Vereinfachte Dropdown-Events ohne Flackern
function setupSimpleDropdownEvents(overflowBtn, dropdown) {
  let hoverTimeout;
  
  // Button Hover
  overflowBtn.onmouseenter = () => {
    clearTimeout(hoverTimeout);
    dropdown.style.opacity = '1';
    dropdown.style.visibility = 'visible';
    dropdown.style.transform = 'translateY(0)';
  };
  
  overflowBtn.onmouseleave = () => {
    hoverTimeout = setTimeout(() => {
      if (!dropdown.matches(':hover')) {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(-10px)';
      }
    }, 150);
  };
  
  // Dropdown Hover
  dropdown.onmouseenter = () => {
    clearTimeout(hoverTimeout);
  };
  
  dropdown.onmouseleave = () => {
    dropdown.style.opacity = '0';
    dropdown.style.visibility = 'hidden';
    dropdown.style.transform = 'translateY(-10px)';
  };
}

// Einfacher Resize-Listener (nicht zu aggressiv)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (overflowProcessed) {
      console.log('Window resized, recalculating menu');
      overflowProcessed = false;
      handleMenuOverflow();
    }
  }, 300);
});

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
  overflowProcessed = false;
  handleMenuOverflow();
};

window.forceMenuRefresh = function() {
  console.log('=== FORCING MENU REFRESH ===');
  overflowProcessed = false;
  createTileMenu();
};
