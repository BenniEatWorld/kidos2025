// index_4containers.js - JavaScript für 4-Container-Layout

// === LOGIN FUNCTIONALITY === 
function showLogin() {
  const modal = document.getElementById('start-login-modal');
  if (modal) {
    modal.style.display = 'flex';
    const input = document.getElementById('pw-input');
    if (input) input.focus();
  }
}

function closeLogin() {
  const modal = document.getElementById('start-login-modal');
  if (modal) {
    modal.style.display = 'none';
    const input = document.getElementById('pw-input');
    const error = document.getElementById('pw-error');
    if (input) input.value = '';
    if (error) error.textContent = '';
  }
}

function checkPassword() {
  const input = document.getElementById('pw-input');
  const error = document.getElementById('pw-error');
  if (!input || !error) return;
  
  const password = input.value.trim();
  
  if (password === '') {
    error.textContent = 'Bitte geben Sie ein Passwort ein.';
    return;
  }
  
  // Hier würde die echte Passwort-Validierung stehen
  if (password === 'kidos2025') {
    error.textContent = '';
    closeLogin();
    // Öffne kidos2025.htm in einem Modal
    openKidosModal();
  } else {
    error.textContent = 'Falsches Passwort.';
    input.value = '';
    input.focus();
  }
}

// === KIDOS MODAL FUNCTIONALITY ===
function openKidosModal() {
  // Erstelle Modal HTML
  const modalHTML = `
    <div id="kidos-modal" class="kidos-modal-bg">
      <div class="kidos-modal-box">
        <div class="kidos-modal-header">
          <h2>Kidos 2025 - Geschützter Bereich</h2>
          <button onclick="closeKidosModal()" class="close-btn">&times;</button>
        </div>
        <div class="kidos-modal-content">
          <iframe src="kidos2025.htm" frameborder="0" style="width: 100%; height: 100%;"></iframe>
        </div>
      </div>
    </div>
  `;
  
  // Füge Modal zum Body hinzu
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Zeige Modal an
  const modal = document.getElementById('kidos-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeKidosModal() {
  const modal = document.getElementById('kidos-modal');
  if (modal) {
    modal.remove();
  }
}

// === SMOOTH SCROLLING === 
function initSmoothScrolling() {
  const links = document.querySelectorAll('.menu-link[href^="#tile-"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Scrolle im Main-Container direkt
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
          const offsetTop = targetElement.offsetTop - 20; // 20px Abstand
          
          mainContainer.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// === MODAL CLOSE ON CLICK OUTSIDE ===
function initModalClickOutside() {
  const modal = document.getElementById('start-login-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeLogin();
      }
    });
  }
}

// === KEYBOARD SHORTCUTS ===
function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // ESC schließt Login-Modal
    if (e.key === 'Escape') {
      const modal = document.getElementById('start-login-modal');
      if (modal && modal.style.display === 'flex') {
        closeLogin();
      }
    }
  });
}

// === RESPONSIVE MENU BEHAVIOR ===
function initResponsiveMenu() {
  // Menu automatisch umbrechen bei kleinen Bildschirmen
  // Das CSS macht das bereits mit flex-wrap: wrap
  console.log('Responsive menu behavior initialized');
}

// === CONTAINER HEIGHT MANAGEMENT ===
function updateContainerHeights() {
  // Bei diesem Layout ist das nicht nötig, da Flexbox das automatisch regelt
  // Aber wir können hier Debug-Info ausgeben
  const header = document.querySelector('.header-container');
  const menu = document.querySelector('.menu-container');
  const main = document.querySelector('.main-container');
  const footer = document.querySelector('.footer-container');
  
  if (header && menu && main && footer) {
    console.log('Container heights:', {
      header: header.offsetHeight + 'px',
      menu: menu.offsetHeight + 'px',
      main: main.offsetHeight + 'px',
      footer: footer.offsetHeight + 'px',
      total: window.innerHeight + 'px'
    });
  }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
  console.log('4-Container layout initialized');
  
  initSmoothScrolling();
  initModalClickOutside();
  initKeyboardShortcuts();
  initResponsiveMenu();
  updateContainerHeights();
  
  // Update heights on resize
  window.addEventListener('resize', updateContainerHeights);
  
  console.log('All 4-container functionality initialized');
});

// === GLOBAL FUNCTIONS (für Kompatibilität) ===
window.showLogin = showLogin;
window.closeLogin = closeLogin;
window.checkPassword = checkPassword;
