// Impressum Modal Funktionalität
function loadImpressum() {
  // Nur laden wenn noch nicht vorhanden
  if (document.getElementById('impressum-modal')) {
    return Promise.resolve();
  }
  
  return fetch('templates/impressum.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
    })
    .catch(error => {
      console.error('Fehler beim Laden des Impressums:', error);
    });
}

function showImpressum() {
  loadImpressum().then(() => {
    const modal = document.getElementById('impressum-modal');
    if (modal) {
      modal.style.display = 'block';
    }
  });
}

// Global verfügbare Funktion für Impressum-Links
window.showImpressum = showImpressum;
