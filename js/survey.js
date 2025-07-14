// Survey JavaScript - Gemeinsame Funktionen für EB.htm und EIN.htm

// Funktion zum Setzen der Fragebogen-Datei basierend auf der aktuellen Seite
function setSurveyDataFile() {
  // Immer absolut zum Server-Root auflösen, damit es im Iframe und direkt funktioniert
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/eb.html') || path.endsWith('eb.html')) {
    window.fragebogenDatei = 'data/FRA_STD.json';
  } else if (path.endsWith('/ein.html') || path.endsWith('ein.html')) {
    window.fragebogenDatei = 'data/EIN_STD.json';
  }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  setSurveyDataFile();
});
