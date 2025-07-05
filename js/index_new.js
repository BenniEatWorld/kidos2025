// index_new.js - Vereinfachtes JavaScript für die neue Index-Seite

// === LOGIN FUNCTIONALITY === 
function showLogin() {
  const modal = document.getElementById('start-login-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('pw-input').focus();
  }
}

function closeLogin() {
  const modal = document.getElementById('start-login-modal');
  if (modal) {
    modal.style.display = 'none';
    document.getElementById('pw-input').value = '';
    document.getElementById('pw-error').textContent = '';
  }
}

function checkPassword() {
  const input = document.getElementById('pw-input');
  const error = document.getElementById('pw-error');
  const password = input.value.trim();
  
  if (password === '') {
    error.textContent = 'Bitte geben Sie ein Passwort ein.';
    return;
  }
  
  // Hier würde die echte Passwort-Validierung stehen
  if (password === 'kidos2025') {
    error.textContent = '';
    closeLogin();
    // Hier könnte man zur geschützten Seite weiterleiten
    alert('Login erfolgreich!');
  } else {
    error.textContent = 'Falsches Passwort.';
    input.value = '';
    input.focus();
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
        const container = document.getElementById('main-scroll-inner');
        const offsetTop = targetElement.offsetTop - 20; // 20px Abstand
        
        container.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
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

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
  console.log('Index page loaded');
  
  initSmoothScrolling();
  initModalClickOutside();
  initKeyboardShortcuts();
  
  console.log('All functionality initialized');
});

// === GLOBAL FUNCTIONS (für Kompatibilität) ===
window.showLogin = showLogin;
window.closeLogin = closeLogin;
window.checkPassword = checkPassword;
