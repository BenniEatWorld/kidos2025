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
    if (file && file.toLowerCase().startsWith('ein')) return 'json/EIN_STD.json';
    return 'json/FRA_STD.json';
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

// ========== CUSTOM SCROLLBAR LOGIK ========== //
(function setupCustomScrollbar() {
  const mainInner = document.getElementById('main-scroll-inner');
  const bar = document.getElementById('custom-scrollbar');
  const track = document.getElementById('custom-scrollbar-track');
  const thumb = document.getElementById('custom-scrollbar-thumb');
  const arrowUp = document.getElementById('scrollbar-arrow-up');
  const arrowDown = document.getElementById('scrollbar-arrow-down');
  if (!mainInner || !bar || !track || !thumb || !arrowUp || !arrowDown) return;

  // Aktivieren
  bar.setAttribute('aria-hidden', 'false');
  bar.style.pointerEvents = 'auto';

  // Hilfsfunktionen
  function updateThumb() {
    const scrollH = mainInner.scrollHeight;
    const clientH = mainInner.clientHeight;
    const scrollT = mainInner.scrollTop;
    const trackH = track.offsetHeight;
    // Thumb-Höhe proportional zum sichtbaren Bereich
    const thumbH = Math.max(trackH * clientH / scrollH, 36);
    const maxThumbTop = trackH - thumbH;
    const maxScroll = scrollH - clientH;
    const thumbTop = maxScroll > 0 ? (scrollT / maxScroll) * maxThumbTop : 0;
    thumb.style.height = thumbH + 'px';
    thumb.style.top = thumbTop + 'px';
  }

  function scrollToThumbPos(y) {
    const trackRect = track.getBoundingClientRect();
    const thumbH = thumb.offsetHeight;
    const clickY = y - trackRect.top - thumbH/2;
    const maxThumbTop = track.offsetHeight - thumbH;
    const ratio = Math.max(0, Math.min(1, clickY / maxThumbTop));
    const maxScroll = mainInner.scrollHeight - mainInner.clientHeight;
    mainInner.scrollTop = ratio * maxScroll;
  }

  // Scrollbar synchronisieren
  mainInner.addEventListener('scroll', updateThumb);
  window.addEventListener('resize', updateThumb);
  setTimeout(updateThumb, 100);

  // Thumb Dragging
  let drag = false, dragOffset = 0;
  thumb.addEventListener('mousedown', e => {
    drag = true;
    dragOffset = e.clientY - thumb.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    const trackRect = track.getBoundingClientRect();
    let y = e.clientY - trackRect.top - dragOffset;
    const maxThumbTop = track.offsetHeight - thumb.offsetHeight;
    y = Math.max(0, Math.min(maxThumbTop, y));
    const ratio = y / maxThumbTop;
    const maxScroll = mainInner.scrollHeight - mainInner.clientHeight;
    mainInner.scrollTop = ratio * maxScroll;
  });
  document.addEventListener('mouseup', () => {
    drag = false;
    document.body.style.userSelect = '';
  });

  // Klick auf Track
  track.addEventListener('mousedown', e => {
    if (e.target === thumb) return;
    scrollToThumbPos(e.clientY);
  });

  // Pfeile
  function scrollByStep(dir) {
    mainInner.scrollBy({ top: dir * 40, behavior: 'smooth' });
  }
  arrowUp.addEventListener('mousedown', () => scrollByStep(-1));
  arrowDown.addEventListener('mousedown', () => scrollByStep(1));

  // Touch-Support (optional)
  thumb.addEventListener('touchstart', e => {
    drag = true;
    dragOffset = e.touches[0].clientY - thumb.getBoundingClientRect().top;
    e.preventDefault();
  });
  document.addEventListener('touchmove', e => {
    if (!drag) return;
    const trackRect = track.getBoundingClientRect();
    let y = e.touches[0].clientY - trackRect.top - dragOffset;
    const maxThumbTop = track.offsetHeight - thumb.offsetHeight;
    y = Math.max(0, Math.min(maxThumbTop, y));
    const ratio = y / maxThumbTop;
    const maxScroll = mainInner.scrollHeight - mainInner.clientHeight;
    mainInner.scrollTop = ratio * maxScroll;
  }, {passive:false});
  document.addEventListener('touchend', () => { drag = false; });

  // Initialisieren
  setTimeout(updateThumb, 300);
  setInterval(updateThumb, 500);
})();
// ========== ENDE CUSTOM SCROLLBAR LOGIK ==========