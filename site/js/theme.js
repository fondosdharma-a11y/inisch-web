(function(){
  function currentTheme(){ return localStorage.getItem('inisch-theme') || 'light'; }
  function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); }
  function updateBtn(btn, theme){
    if(!btn) return;
    btn.textContent = theme === 'light' ? '\u263D' : '\u2600';
    btn.setAttribute('aria-label', theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    btn.setAttribute('title', theme === 'light' ? 'Modo oscuro' : 'Modo claro');
  }
  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.querySelector('.theme-toggle');
    var theme = currentTheme();
    applyTheme(theme);
    updateBtn(btn, theme);
    if(btn){
      btn.addEventListener('click', function(){
        var next = currentTheme() === 'light' ? 'dark' : 'light';
        localStorage.setItem('inisch-theme', next);
        applyTheme(next);
        updateBtn(btn, next);
      });
    }
  });
})();
