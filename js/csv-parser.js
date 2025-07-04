// CSV Parser für Survey-Daten

// CSV Parser Logik
function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines[0] ? lines[0].split(';').map(h => h.replace(/^"|"$/g, '')) : [];
  
  if (headers.length === 0) {
    alert('CSV-Datei ist leer oder hat kein gültiges Format.');
    return;
  }

  // Parse survey data from CSV
  const surveyData = {};
  const ratings = {};
  
  // Find survey data rows (first few rows typically contain metadata)
  for (let i = 1; i < Math.min(10, lines.length); i++) {
    const row = lines[i].split(';').map(cell => cell.replace(/^"|"$/g, ''));
    
    if (row[0] === 'Name' && row[1]) surveyData.name = row[1];
    if (row[0] === 'Alter' || (row[2] === 'Alter' && row[3])) surveyData.age = parseInt(row[3]) || parseInt(row[1]);
    if (row[0] === 'Pädagog*in' || (row[4] === 'Pädagog*in' && row[5])) surveyData.educator = row[5] || row[1];
    if (row[0] === 'Erhebungsdatum' || (row[6] === 'Erhebungsdatum' && row[7])) surveyData.date = row[7] || row[1];
  }

  // Find rating data
  let statementCounter = 1;
  let inRatingSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const row = lines[i].split(';').map(cell => cell.replace(/^"|"$/g, ''));
    
    // Skip header and metadata rows
    if (row[0] === 'Aussage' && row[1] === 'Bewertung') {
      inRatingSection = true;
      continue;
    }
    
    if (inRatingSection && row[0] && row[1] && !row[0].startsWith('Kategorie:') && !row[0].startsWith('Unterkategorie:')) {
      const ratingText = row[1];
      const ratingLabels = [
        "irrelevant / nicht bewertbar",
        "trifft nicht zu", 
        "trifft eher nicht zu",
        "trifft zu",
        "trifft eher zu",
        "trifft voll zu"
      ];
      
      const ratingIndex = ratingLabels.indexOf(ratingText);
      if (ratingIndex !== -1) {
        ratings[statementCounter] = ratingIndex;
      }
      statementCounter++;
    }
    
    // Reset when encountering empty row or new category
    if (row[0] === '' || row[0].startsWith('Kategorie:')) {
      inRatingSection = false;
    }
  }

  // Update form with loaded data
  if (surveyData.name) {
    const nameEl = document.getElementById('name');
    if (nameEl) nameEl.value = surveyData.name;
  }
  
  if (surveyData.age) {
    const ageEl = document.getElementById('age');
    if (ageEl) ageEl.value = surveyData.age;
  }
  
  if (surveyData.educator) {
    const educatorEl = document.getElementById('educator');
    if (educatorEl) educatorEl.value = surveyData.educator;
  }
  
  if (surveyData.date) {
    const dateEl = document.getElementById('date');
    if (dateEl) dateEl.value = surveyData.date;
  }

  // Store data
  localStorage.setItem('surveyData', JSON.stringify(surveyData));
  localStorage.setItem('ratings', JSON.stringify(ratings));

  // Re-render table to show loaded ratings
  if (typeof renderTable === 'function') {
    renderTable();
  }

  alert('CSV-Daten erfolgreich geladen!');
}
