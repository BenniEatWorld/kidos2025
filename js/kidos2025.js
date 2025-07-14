// Kidos2025.htm spezifische Funktionen
function loadContent(url) {
  // Bestimme den Titel basierend auf der URL
  let title = 'Kidos 2025 - Geschützter Bereich';
  if (url === 'eb.html') {
    title = 'Kidos 2025 - Entwicklungsbericht';
  } else if (url === 'ein.html') {
    title = 'Kidos 2025 - Entwicklungseinschätzung';
  }
  
  // Aktualisiere den Modal-Titel im Haupt-Modal
  const modalTitle = parent.document.querySelector('.kidos-modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = title;
  }
  
  // Lade den neuen Inhalt im aktuellen Iframe
  window.location.href = url;
}
