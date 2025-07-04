if (location.protocol === 'file:') {
  alert('Bitte starte diese Seite über HTTP (z. B. mit "python -m http.server")');
  throw new Error('HTTP erforderlich');
}

(function () {
  let config, savedRatings = {};
  const ratingLabels = [
    "irrelevant / nicht bewertbar",
    "trifft nicht zu",
    "trifft eher nicht zu",
    "trifft zu",
    "trifft eher zu",
    "trifft voll zu"
  ];

  // Ermittelt die zu ladende JSON-Datei anhand window.fragebogenDatei oder Fallback
  function getFragebogenDatei() {
    if (window.fragebogenDatei) return window.fragebogenDatei;
    // Fallback: nach Dateiname unterscheiden
    const file = location.pathname.split('/').pop();
    if (file && file.toLowerCase().startsWith('ein')) return '../json/EIN_STD.json';
    return '../json/FRA_STD.json';
  }

  function start() {
    const jsonFile = getFragebogenDatei();
    fetch(jsonFile)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(js => {
        config = js;
        savedRatings = JSON.parse(localStorage.getItem('ratings') || '{}');
        initForm();
        renderTable();
      })
      .catch(e => alert('Fehler beim Laden der Konfiguration: ' + e));

    setupButtons();
  }

  function initForm() {
    const sv = JSON.parse(localStorage.getItem('surveyData') || '{}');
    ['name', 'age', 'educator', 'date'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (sv[id]) el.value = sv[id];
      el.addEventListener('change', () => {
        const data = {
          name: document.getElementById('name')?.value.trim(),
          age: +document.getElementById('age')?.value,
          educator: document.getElementById('educator')?.value.trim(),
          date: document.getElementById('date')?.value
        };
        if (data.name && !isNaN(data.age) && data.educator && data.date) {
          localStorage.setItem('surveyData', JSON.stringify(data));
        }
      });
    });
  }

  function renderTable() {
    const tbody = document.querySelector('#rating-table tbody');
    if (!tbody || !config?.kategorien) return;
    tbody.innerHTML = '';
    let sid = 1;

    if (!Array.isArray(config.kategorien)) return;
    config.kategorien.forEach(cat => {
      // Kompatibilität: "kategorie" oder "name"
      const catName = cat.kategorie || cat.name || '';
      const trCat = document.createElement('tr');
      trCat.className = 'category-row';
      trCat.innerHTML = `<th colspan="7">${catName}</th>`;
      tbody.appendChild(trCat);

      const subs = Array.isArray(cat.unterkategorien) ? cat.unterkategorien : [];
      subs.forEach(sub => {
        // Kompatibilität: "unterkategorie" oder "name"
        const subName = sub.unterkategorie || sub.name || '';
        const trSub = document.createElement('tr');
        trSub.className = 'subcategory-row';
        trSub.innerHTML = `<th colspan="7">${subName}</th>`;
        tbody.appendChild(trSub);

        const aussagen = Array.isArray(sub.aussagen) ? sub.aussagen : [];
        aussagen.forEach(text => {
          const tr = document.createElement('tr');
          const tdA = document.createElement('td');
          tdA.textContent = text;
          tr.appendChild(tdA);

          ratingLabels.forEach((_, idx) => {
            const td = document.createElement('td');
            const inp = document.createElement('input');
            inp.type = 'radio';
            inp.name = 'rating-' + sid;
            inp.value = idx;
            if (savedRatings[sid] == idx) inp.checked = true;
            inp.addEventListener('change', () => {
              savedRatings[sid] = idx;
              localStorage.setItem('ratings', JSON.stringify(savedRatings));
            });
            td.appendChild(inp);
            tr.appendChild(td);
          });

          tbody.appendChild(tr);
          sid++;
        });
      });
    });
  }

  function setupButtons() {
    document.getElementById('clear-btn')?.addEventListener('click', () => {
      if (confirm("Möchtest du die Eingaben wirklich zurücksetzen?")) {
        ['name', 'age', 'educator', 'date'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        localStorage.removeItem('surveyData');
        localStorage.removeItem('ratings');
        savedRatings = {};
        renderTable();
      }
    });

    document.getElementById('load-btn')?.addEventListener('click', () => {
      document.getElementById('load-file')?.click();
    });

    document.getElementById('load-file')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        parseCSV(reader.result);
        e.target.value = '';
      };
      reader.readAsText(file, 'utf-8');
    });

    document.getElementById('export-btn')?.addEventListener('click', () => {
      const survey = JSON.parse(localStorage.getItem('surveyData') || '{}');
      const now = new Date();
      const dateIso = survey.date || now.toISOString().slice(0, 10);
      const datePart = dateIso.replace(/-/g, '');
      const timePart = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, '0')).join('');
      const namePart = survey.name?.trim().replace(/\s+/g, '_') || 'unbekannt';
      const filename = `${datePart}${timePart}_${namePart}.csv`;

      const rows = [];
      rows.push(['Name', survey.name || '', 'Alter', survey.age || '', 'Pädagog*in', survey.educator || '', 'Erhebungsdatum', survey.date || dateIso]);
      rows.push([]);

      let sid = 1;
      config.kategorien.forEach(cat => {
        rows.push([`Kategorie: ${cat.name}`]);
        cat.unterkategorien.forEach(sub => {
          rows.push([`Unterkategorie: ${sub.name}`]);
          rows.push(['Aussage', 'Bewertung']);
          sub.aussagen.forEach(text => {
            const idx = savedRatings[sid];
            const ratingText = (idx != null) ? ratingLabels[idx] : '';
            rows.push([text, ratingText]);
            sid++;
          });
          rows.push([]);
        });
        rows.push([]);
      });

      const csv = '\uFEFF' + rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(';')).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  window.requestAnimationFrame(() => start());
})();