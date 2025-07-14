// Kacheltexte aus TXT-Dateien automatisch erkennen und laden
(function loadTilesAuto() {
  // Sucht data/tile1.txt, data/tile2.txt, ... bis keine Datei mehr existiert (404)
  let idx = 1;
  let tileFiles = [];
  
  function tryNext() {
    const file = `data/tile${idx}.txt`;
    fetch(file, { cache: 'no-store' })
      .then(r => {
        if (r.ok) {
          tileFiles.push(file);
          idx++;
          tryNext();
        } else {
          // Wenn keine weitere Datei, dann laden und einfügen
          insertTiles(tileFiles);
        }
      })
      .catch(() => {
        insertTiles(tileFiles);
      });
  }
  
  function insertTiles(files) {
    // Array zum Sammeln der Überschriften für das Menü
    let tileHeadings = [];
    
    // Hilfsfunktion: Links und E-Mails im Text erkennen und ersetzen
    function linkify(text) {
      // Zuerst Überschriften (## ...) erkennen und ersetzen
      text = text.replace(/^##\s*(.+)$/gm, function(match, heading) {
        return `\n<h3 style="color:var(--accent-2);font-size:1.13em;margin-top:1.2em;margin-bottom:0px;font-weight:600;letter-spacing:0.01em;">${heading}</h3>\n`;
      });
      
      // E-Mail-Adressen erkennen und schützen
      const EMAIL_PLACEHOLDER = '###EMAIL###';
      let emails = [];
      text = text.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, function(email) {
        emails.push(email);
        return EMAIL_PLACEHOLDER;
      });
      
      // Dann URLs (http, https, www, domain.tld/...)
      text = text.replace(/(https?:\/\/[\S<]+|www\.[\S<]+|\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?)/gi, function(url) {
        let href = url;
        if (!href.match(/^(https?:\/\/|www\.)/i)) href = 'http://' + href;
        
        // Sichtbare Darstellung: nur Domain (ohne Pfad)
        let display = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
        let domain = display.split('/')[0];
        display = domain;
        
        // Icon für externe Links (Unicode: ↗)
        let icon = '';
        try {
          let linkUrl = new URL(href, window.location.origin);
          let isExternal = linkUrl.hostname !== window.location.hostname;
          if (isExternal) {
            icon = '<span style="font-size:0.98em;opacity:0.65;vertical-align:0.05em;margin-right:0.22em;">&#8599;</span>';
          }
        } catch(e) {}
        
        return `${icon}<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-2);text-decoration:underline dotted;opacity:0.78;font-weight:400;transition:opacity 0.18s;" title="${url}" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.78'">${display}</a>`;
      });
      
      // Platzhalter wieder durch E-Mail-Links ersetzen
      let i = 0;
      text = text.replace(new RegExp(EMAIL_PLACEHOLDER, 'g'), function() {
        const email = emails[i++];
        // E-Mail-Adresse komplett anzeigen
        let display = email;
        return `<a href="mailto:${email}" style="color:var(--accent-2);text-decoration:underline dotted;opacity:0.78;font-weight:400;transition:opacity 0.18s;" title="${email}" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.78'">${display}</a>`;
      });
      
      // Hashtags erkennen und als solche stylen
      text = text.replace(/(^|\s)(#[\wäöüÄÖÜß-]{2,})/g, function(match, space, tag) {
        const cleanTag = tag.substring(1); // ohne #
        const url = `https://www.instagram.com/explore/tags/${encodeURIComponent(cleanTag)}/`;
        return space + `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-1);background:rgba(0,0,0,0.07);border-radius:4px;padding:0.05em 0.32em 0.05em 0.22em;font-weight:500;font-size:0.98em;letter-spacing:0.01em;text-decoration:none;opacity:0.82;transition:opacity 0.18s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.82'">${tag}</a>`;
      });
      
      return text;
    }
    
    // Hilfsfunktion: Überschrift aus Text extrahieren
    function extractHeading(text) {
      const lines = text.trim().split('\n');
      const firstLine = lines[0]?.trim();
      // Wenn die erste Zeile nicht leer ist, verwende sie als Überschrift
      return firstLine || 'Unbenannt';
    }
    
    // Hilfsfunktion: Menü-Links mit Tile-Überschriften aktualisieren
    function updateMenuLinks(headings) {
      headings.forEach((heading, index) => {
        const menuLink = document.querySelector(`a[href="#tile-${index + 1}"]`);
        if (menuLink) {
          menuLink.textContent = heading;
        }
      });
    }
    
    // Für jede Datei: Inhalt laden und in die Kachel einfügen
    const tileSection = document.querySelector('.tile-section');
    tileSection.innerHTML = '';
    files.forEach((file, i) => {
      fetch(file)
        .then(r => r.ok ? r.text() : '')
        .then(txt => {
          const lines = txt.split('\n');
          const title = lines[0] || '';
          const body = lines.slice(1).join('\n').trim();
          let html = '';
          if (title) {
            html += `<h2 style=\"color:var(--accent-2);margin-bottom:1em;\">${linkify(title)}</h2>`;
          }
          if (body) {
            let htmlBody = '';
            let parts = body.split(/(##.+)/g);
            parts.forEach(part => {
              if (part.startsWith('##')) {
                htmlBody += linkify(part) + '';
              } else if (part.trim() !== '') {
                htmlBody += part.split(/\n\s*\n/).map(p => `<p>${linkify(p.trim())}</p>`).join('');
              }
            });
            html += htmlBody;
          }
          // Kachel-HTML erzeugen
          const tileDiv = document.createElement('div');
          tileDiv.className = 'tile';
          tileDiv.id = 'tile-' + (i + 1);
          tileDiv.innerHTML = `<img class=\"tile-bg\" src=\"\" alt=\"\" /><div class=\"tile-content\" id=\"tile-content-${i + 1}\">${html}</div>`;
          tileSection.appendChild(tileDiv);
          // Überschrift zur Liste der Tile-Überschriften hinzufügen
          tileHeadings.push(extractHeading(txt));
        })
        .catch(err => {
          console.log('Error loading tile', i + 1, ':', err);
        });
    });
    setTimeout(() => {
      updateMenuLinks(tileHeadings);
      // Menü dynamisch erzeugen
      const menuContainer = document.querySelector('.menu-container');
      // Speichere Login-Link, falls vorhanden
      const loginLink = menuContainer.querySelector('.login-link');
      menuContainer.innerHTML = '';
      tileHeadings.forEach((heading, i) => {
        const a = document.createElement('a');
        a.href = `#tile-${i + 1}`;
        a.className = 'menu-link';
        a.textContent = heading;
        menuContainer.appendChild(a);
      });
      if (loginLink) {
        loginLink.addEventListener('click', function(e) {
          e.preventDefault();
          if (typeof showLogin === 'function') showLogin();
        });
        menuContainer.appendChild(loginLink);
      }
      // Sanftes Scrollen für Menü-Links
      menuContainer.querySelectorAll('.menu-link:not(.login-link)').forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href && href.startsWith('#tile-')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Nach dem Scrollen sicherstellen, dass das Tile wirklich ganz oben ist (Workaround für Scroll-Ende-Problem)
              setTimeout(() => {
                const rect = target.getBoundingClientRect();
                // Prüfen, ob das Tile nicht ganz oben ist (z.B. weil Seite zu kurz)
                if (rect.top !== 0) {
                  // Zielposition berechnen (relativ zum Dokument)
                  const scrollY = window.scrollY + rect.top;
                  window.scrollTo({ top: scrollY, behavior: 'auto' });
                }
              }, 400); // Timeout passend zur Scroll-Animation
            }
          }
        });
      });
      if (typeof startTileBackgroundsIndividually === 'function') {
        startTileBackgroundsIndividually();
      }
    }, 800);
  }
  
  tryNext();
})();
