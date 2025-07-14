// === LOGIN CHECK ===
function checkPassword() {
  const input = document.getElementById('pw-input');
  const error = document.getElementById('pw-error');
  const password = input ? input.value : '';
  // Dummy-Passwort, hier anpassen!
  if (password === 'kidos2025') {
    closeLogin();
    showKidosModal();
  } else {
    if (error) error.textContent = 'Falsches Passwort!';
    if (input) input.value = '';
    if (input) input.focus();
  }
}
// === KIDOS MODAL ===
function showKidosModal() {
  const modal = document.getElementById('kidos-modal');
  if (modal) {
    // Iframe immer zurücksetzen auf kidos2025.html
    const iframe = modal.querySelector('iframe');
    if (iframe) iframe.src = 'kidos2025.html';
    modal.style.display = 'flex';
  }
}

function closeKidosModal() {
  const modal = document.getElementById('kidos-modal');
  if (modal) modal.style.display = 'none';
}
window.showKidosModal = showKidosModal;
window.closeKidosModal = closeKidosModal;
window.checkPassword = checkPassword;
// === LOGIN MODAL ===
function showLogin() {
  const modal = document.getElementById('start-login-modal');
  if (modal) modal.style.display = 'flex';
  const input = document.getElementById('pw-input');
  if (input) input.focus();
}

function closeLogin() {
  const modal = document.getElementById('start-login-modal');
  if (modal) modal.style.display = 'none';
  const input = document.getElementById('pw-input');
  if (input) input.value = '';
  const error = document.getElementById('pw-error');
  if (error) error.textContent = '';
}

window.showLogin = showLogin;
window.closeLogin = closeLogin;
// === TILE MODAL ===
function showTileModal(tileId) {
  const tile = document.getElementById(tileId);
  if (!tile) return;
  const content = tile.querySelector('.tile-content');
  if (!content) return;

  // Modal-HTML wie Impressum-Modal
  const modalHtml = `
    <div id="tile-modal" class="impressum-modal">
      <div class="impressum-modal-content">
        <button onclick="closeTileModal()" class="impressum-close-btn">&times;</button>
        <div class="tile-modal-content">${content.innerHTML}</div>
      </div>
    </div>
  `;
  // Modal einfügen
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeTileModal() {
  const modal = document.getElementById('tile-modal');
  if (modal) modal.remove();
}

// Event-Listener für alle Tiles
function initTileModalClicks() {
  document.querySelectorAll('.tile').forEach(tile => {
    tile.style.cursor = 'pointer';
    tile.addEventListener('click', function (e) {
      // Keine Modals öffnen, wenn auf einen Link geklickt wird
      if (e.target.tagName === 'A') return;
      showTileModal(this.id);
    });
  });
}

// === TILE CONTENT TRUNCATION ===
// CSS-only Truncation + JS-Overlay
document.addEventListener('DOMContentLoaded', function() {
  initTileModalClicks();
});

window.showTileModal = showTileModal;
window.closeTileModal = closeTileModal;