// Einfache Test-Implementierung für Menu-Overflow
function simpleMenuOverflow() {
  const menu = document.getElementById('tile-menu');
  const overflowBtn = document.getElementById('menu-overflow-btn');
  const dropdown = document.getElementById('menu-dropdown');
  
  if (!menu || !overflowBtn || !dropdown) {
    console.log('Elements missing:', {menu: !!menu, overflowBtn: !!overflowBtn, dropdown: !!dropdown});
    return;
  }
  
  console.log('=== SIMPLE MENU OVERFLOW TEST ===');
  
  // Erstelle Test-Links falls keine vorhanden
  const existingLinks = menu.querySelectorAll('a');
  if (existingLinks.length === 0) {
    console.log('No links found, creating test links...');
    const testTexts = ['Link 1', 'Sehr langer Link 2 mit viel Text', 'Link 3', 'Noch ein längerer Link 4', 'Link 5', 'Link 6'];
    
    testTexts.forEach((text, i) => {
      const a = document.createElement('a');
      a.textContent = text;
      a.href = '#test' + i;
      a.style.cssText = 'color: var(--accent-1); text-decoration: none; padding: 0.3em 0.8em; opacity: 0.8; border-radius: 4px; flex-shrink: 0; white-space: nowrap;';
      menu.insertBefore(a, overflowBtn);
    });
  }
  
  // Messe verfügbaren Platz
  const menuRect = menu.getBoundingClientRect();
  const availableWidth = menuRect.width - 80; // Sicherheitsabstand
  console.log('Available width:', availableWidth);
  
  // Sammle alle Links
  const allLinks = Array.from(menu.querySelectorAll('a'));
  console.log('Found links:', allLinks.length);
  
  // Reset Dropdown
  dropdown.innerHTML = '';
  overflowBtn.style.display = 'none';
  
  // Berechne wie viele Links passen
  let totalWidth = 0;
  let visibleCount = 0;
  
  for (let i = 0; i < allLinks.length; i++) {
    const link = allLinks[i];
    const linkWidth = link.getBoundingClientRect().width + 16; // Gap
    
    if (totalWidth + linkWidth + 60 <= availableWidth) { // 60px für Overflow-Button
      totalWidth += linkWidth;
      visibleCount++;
      console.log(`Link ${i} ("${link.textContent}") fits: ${linkWidth}px, total: ${totalWidth}px`);
    } else {
      console.log(`Link ${i} ("${link.textContent}") doesn't fit: ${linkWidth}px would exceed ${availableWidth}px`);
      break;
    }
  }
  
  console.log(`Result: ${visibleCount} visible, ${allLinks.length - visibleCount} hidden`);
  
  // Verschiebe überschüssige Links ins Dropdown
  if (visibleCount < allLinks.length) {
    console.log('Showing overflow button');
    overflowBtn.style.display = 'block';
    
    for (let i = visibleCount; i < allLinks.length; i++) {
      const link = allLinks[i];
      console.log(`Moving to dropdown: "${link.textContent}"`);
      
      const dropdownLink = document.createElement('a');
      dropdownLink.textContent = link.textContent;
      dropdownLink.href = link.href;
      dropdownLink.onclick = link.onclick;
      dropdownLink.style.cssText = 'display: block; padding: 0.6em 1em; color: var(--accent-1); text-decoration: none; opacity: 0.8;';
      
      dropdown.appendChild(dropdownLink);
      link.remove();
    }
    
    // Hover-Events für Dropdown
    overflowBtn.onmouseenter = () => {
      dropdown.style.opacity = '1';
      dropdown.style.visibility = 'visible';
    };
    
    overflowBtn.onmouseleave = () => {
      setTimeout(() => {
        if (!dropdown.matches(':hover')) {
          dropdown.style.opacity = '0';
          dropdown.style.visibility = 'hidden';
        }
      }, 200);
    };
    
    dropdown.onmouseleave = () => {
      dropdown.style.opacity = '0';
      dropdown.style.visibility = 'hidden';
    };
  }
}

// Mache die Funktion global verfügbar
window.simpleMenuOverflow = simpleMenuOverflow;

console.log('Simple menu overflow function loaded. Call window.simpleMenuOverflow() to test.');
