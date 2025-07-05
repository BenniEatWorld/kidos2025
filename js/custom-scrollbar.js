// Custom Scrollbar-Funktionalität für alle Seiten
function initCustomScrollbar() {
  let scrollInterval = null;
  let isDragging = false;
  let startY = 0;
  let startScrollTop = 0;

  const main = document.getElementById('main-scroll-inner');
  const scrollbar = document.getElementById('custom-scrollbar');
  const track = document.getElementById('custom-scrollbar-track');
  const thumb = document.getElementById('custom-scrollbar-thumb');
  const upArrow = document.getElementById('scrollbar-arrow-up');
  const downArrow = document.getElementById('scrollbar-arrow-down');

  if (!main || !scrollbar || !track || !thumb || !upArrow || !downArrow) {
    console.log('Scrollbar elements not found');
    return;
  }

  // Update thumb position and size
  function updateThumb() {
    const scrollHeight = main.scrollHeight;
    const clientHeight = main.clientHeight;
    const scrollTop = main.scrollTop;
    
    if (scrollHeight <= clientHeight) {
      thumb.style.display = 'none';
      return;
    }
    
    thumb.style.display = 'block';
    
    const thumbHeight = Math.max((clientHeight / scrollHeight) * track.clientHeight, 30);
    const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (track.clientHeight - thumbHeight);
    
    thumb.style.height = thumbHeight + 'px';
    thumb.style.top = thumbTop + 'px';
  }

  // Scroll functions
  function startScroll(direction) {
    scrollInterval = setInterval(() => {
      main.scrollBy({ top: direction * 30, behavior: 'auto' });
      updateThumb();
    }, 30);
  }
  
  function stopScroll() {
    if (scrollInterval) clearInterval(scrollInterval);
    scrollInterval = null;
  }

  // Drag functionality
  function startDrag(e) {
    isDragging = true;
    startY = e.clientY || e.touches[0].clientY;
    startScrollTop = main.scrollTop;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopDrag);
    e.preventDefault();
  }

  function onDrag(e) {
    if (!isDragging) return;
    
    const currentY = e.clientY || e.touches[0].clientY;
    const deltaY = currentY - startY;
    const scrollRatio = deltaY / track.clientHeight;
    const maxScroll = main.scrollHeight - main.clientHeight;
    
    main.scrollTop = startScrollTop + (scrollRatio * maxScroll);
    updateThumb();
    e.preventDefault();
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
  }

  // Event listeners
  upArrow.addEventListener('mousedown', () => startScroll(-1));
  upArrow.addEventListener('touchstart', e => { e.preventDefault(); startScroll(-1); });
  upArrow.addEventListener('mouseup', stopScroll);
  upArrow.addEventListener('mouseleave', stopScroll);
  upArrow.addEventListener('touchend', stopScroll);
  upArrow.addEventListener('touchcancel', stopScroll);
  
  downArrow.addEventListener('mousedown', () => startScroll(1));
  downArrow.addEventListener('touchstart', e => { e.preventDefault(); startScroll(1); });
  downArrow.addEventListener('mouseup', stopScroll);
  downArrow.addEventListener('mouseleave', stopScroll);
  downArrow.addEventListener('touchend', stopScroll);
  downArrow.addEventListener('touchcancel', stopScroll);

  thumb.addEventListener('mousedown', startDrag);
  thumb.addEventListener('touchstart', startDrag);

  // Track click to jump
  track.addEventListener('click', (e) => {
    if (e.target === thumb) return;
    
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scrollRatio = clickY / track.clientHeight;
    const maxScroll = main.scrollHeight - main.clientHeight;
    
    main.scrollTop = scrollRatio * maxScroll;
    updateThumb();
  });

  // Update on scroll
  main.addEventListener('scroll', updateThumb);
  window.addEventListener('resize', updateThumb);

  // Initial update
  updateThumb();
}

// Initialisiere Scrollbar wenn DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomScrollbar);
} else {
  initCustomScrollbar();
}
