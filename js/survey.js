// Survey JavaScript - Gemeinsame Funktionen für EB.htm und EIN.htm

// Funktion zum Setzen der Fragebogen-Datei basierend auf der aktuellen Seite
function setSurveyDataFile() {
  const currentPage = window.location.pathname.toLowerCase();
  
  if (currentPage.includes('eb.htm')) {
    window.fragebogenDatei = '../json/EB_STD.json';
  } else if (currentPage.includes('ein.htm')) {
    window.fragebogenDatei = '../json/EIN_STD.json';
  }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  setSurveyDataFile();
});
