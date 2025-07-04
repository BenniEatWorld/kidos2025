// Zufällige dezente Hintergrundbilder für die Kacheln
const tileImages = [
  'img/Bild1.jpg', 'img/Bild2.jpg', 'img/Bild3.jpg', 'img/Bild4.jpg', 'img/Bild5.jpg',
  'img/Bild6.jpg', 'img/Bild7.jpg', 'img/Bild8.jpg', 'img/Bild9.jpg', 'img/Bild10.jpg',
  'img/Bild11.jpg', 'img/Bild12.jpg', 'img/Bild13.jpg', 'img/Bild14.jpg', 'img/Bild15.jpg',
  'img/Bild16.jpg', 'img/Bild17.jpg', 'img/Bild18.jpg', 'img/Bild19.jpg', 'img/Bild20.jpg',
  'img/Bild21.jpg', 'img/Bild22.jpg', 'img/Bild23.jpg', 'img/Bild24.jpg', 'img/Bild25.jpg'
];

function randomInterval() {
  // 17 bis 23 Sekunden in ms
  return 17000 + Math.floor(Math.random() * 6000);
}

function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Für jede Kachel ein eigenes Intervall und keine Dopplung pro Runde
function startTileBackgroundsIndividually() {
  const tiles = document.querySelectorAll('.tile');
  let lastImages = [];
  
  function setAllTiles() {
    // Neue zufällige, nicht doppelte Bilder für alle Kacheln
    let imgs = shuffle(tileImages).slice(0, tiles.length);
    lastImages = imgs;
    tiles.forEach((tile, i) => setTile(tile, imgs[i]));
  }
  
  function setTile(tile, imgSrc) {
    const img = tile.querySelector('.tile-bg');
    if (!img) return;
    
    img.style.transition = 'opacity 1.2s, filter 0.7s';
    img.style.opacity = '0';
    
    setTimeout(() => {
      img.src = imgSrc;
      img.onload = () => {
        img.style.opacity = '0.18';
      };
    }, 600);
  }
  
  // Initial alle setzen
  setAllTiles();
  
  // Für jede Kachel eigenes Intervall starten
  tiles.forEach((tile, i) => {
    function next() {
      // Neues Bild, das aktuell in keiner anderen Kachel ist
      let available = tileImages.filter(src => !lastImages.includes(src) || lastImages[i] === src);
      // Falls alle Bilder belegt, nimm alle außer das aktuelle
      if (available.length === 0) {
        available = tileImages.filter(src => src !== lastImages[i]);
      }
      
      const imgSrc = shuffle(available)[0];
      lastImages[i] = imgSrc;
      setTile(tile, imgSrc);
      setTimeout(next, randomInterval());
    }
    
    setTimeout(next, randomInterval());
  });
}

// Starte die Hintergrundbilder-Rotation
startTileBackgroundsIndividually();
