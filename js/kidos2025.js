// Kidos2025.htm spezifische Funktionen
function loadContent(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Ladevorgang fehlgeschlagen");
      return response.text();
    })
    .then(html => {
      document.getElementById("center-content").innerHTML = html;

      // Setze die richtige JSON-Datei für jede Seite
      if (url === "EB.htm") {
        window.fragebogenDatei = 'json/FRA_STD.json';
      } else if (url === "EIN.htm") {
        window.fragebogenDatei = 'json/EIN_STD.json';
      } else {
        window.fragebogenDatei = undefined;
      }

      if (url === "EB.htm" || url === "EIN.htm") {
        const script = document.createElement("script");
        script.src = "app.js";
        script.defer = true;
        document.body.appendChild(script);
      }

      window.scrollTo(0, 0);
    })
    .catch(err => {
      document.getElementById("center-content").innerHTML =
        `<p style="color: red;">Fehler beim Laden: ${err.message}</p>`;
    });
}
