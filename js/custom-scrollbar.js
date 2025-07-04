// Custom Scrollbar-Funktionalität für alle Seiten
function initCustomScrollbar() {
  let scrollInterval = null;
  
  function startScroll(direction) {
    const main = document.getElementById('main-scroll-inner');
    if (!main || main.style.display === 'none') return;
    
    scrollInterval = setInterval(() => {
      main.scrollBy({ top: direction * 30, behavior: 'auto' });
    }, 30);
  }
  
  function stopScroll() {
    if (scrollInterval) clearInterval(scrollInterval);
    scrollInterval = null;
  }
  
  const upArrow = document.getElementById('scrollbar-arrow-up');
  const downArrow = document.getElementById('scrollbar-arrow-down');
  
  if (upArrow && downArrow) {
    // Up Arrow Events
    upArrow.addEventListener('mousedown', () => startScroll(-1));
    upArrow.addEventListener('touchstart', e => { e.preventDefault(); startScroll(-1); });
    upArrow.addEventListener('mouseup', stopScroll);
    upArrow.addEventListener('mouseleave', stopScroll);
    upArrow.addEventListener('touchend', stopScroll);
    upArrow.addEventListener('touchcancel', stopScroll);
    
    // Down Arrow Events
    downArrow.addEventListener('mousedown', () => startScroll(1));
    downArrow.addEventListener('touchstart', e => { e.preventDefault(); startScroll(1); });
    downArrow.addEventListener('mouseup', stopScroll);
    downArrow.addEventListener('mouseleave', stopScroll);
    downArrow.addEventListener('touchend', stopScroll);
    downArrow.addEventListener('touchcancel', stopScroll);
  }
}

// Initialisiere Scrollbar wenn DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomScrollbar);
} else {
  initCustomScrollbar();
}
