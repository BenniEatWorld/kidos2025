// Kacheltexte aus TXT-Dateien automatisch erkennen und laden
(function loadTilesAuto() {
  // Sucht txt/tile1.txt, txt/tile2.txt, ... bis keine Datei mehr existiert (404)
  let idx = 1;
  let tileFiles = [];
  
  function tryNext() {
    const file = `txt/tile${idx}.txt`;
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
    
    // Für jede Datei: Inhalt laden und in die Kachel einfügen
    files.forEach((file, i) => {
      fetch(file)
        .then(r => r.ok ? r.text() : '')
        .then(txt => {
          const lines = txt.split('\n');
          const title = lines[0] || '';
          const body = lines.slice(1).join('\n').trim();
          let html = '';
          
          if (title) {
            html += `<h2 style="color:var(--accent-2);margin-bottom:1em;">${linkify(title)}</h2>`;
          }
          
          if (body) {
            // Überschriften und Absätze erkennen: Nach jedem <h3> einen neuen <p> öffnen
            let htmlBody = '';
            let parts = body.split(/(##.+)/g);
            parts.forEach(part => {
              if (part.startsWith('##')) {
                htmlBody += linkify(part) + '';
              } else if (part.trim() !== '') {
                // Text nach Überschrift oder zwischen Absätzen
                htmlBody += part.split(/\n\s*\n/).map(p => `<p>${linkify(p.trim())}</p>`).join('');
              }
            });
            html += htmlBody;
          }
          
          const el = document.getElementById('tile-content-' + (i + 1));
          if (el) el.innerHTML = html;
        });
        
        // Menü nach dem Laden aller Tiles erstellen
        setTimeout(() => {
          if (typeof createTileMenu === 'function') {
            createTileMenu();
          }
          // Overflow-Handling nach Menü-Erstellung
          setTimeout(() => {
            if (typeof handleMenuOverflow === 'function') {
              handleMenuOverflow();
            }
          }, 300);
        }, 200);
    });
  }
  
  tryNext();
})();
