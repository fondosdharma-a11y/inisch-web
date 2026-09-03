(function(){
  var KEY = 'inisch-theme';
  function currentTheme(){ return localStorage.getItem(KEY) || 'light'; }
  function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); }
  function isEN(){
    var l = (document.documentElement.getAttribute('lang')||'es').toLowerCase();
    return l.indexOf('en') === 0;
  }
  function labelFor(theme){
    if (isEN()) return theme === 'light' ? 'Dark' : 'Light';
    return theme === 'light' ? 'Oscuro' : 'Claro';
  }
  function titleFor(theme){
    if (isEN()) return theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    return theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
  }
  function paint(btn, theme){
    if(!btn) return;
    btn.innerHTML = '<span class="tt-icon" aria-hidden="true">' +
      (theme === 'light' ? '\u263D' : '\u2600') + '</span>' +
      '<span class="tt-label">' + labelFor(theme) + '</span>';
    btn.setAttribute('aria-label', titleFor(theme));
    btn.setAttribute('title', titleFor(theme));
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
  function init(){
    var theme = currentTheme();
    applyTheme(theme);
    var btns = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < btns.length; i++){
      (function(btn){
        paint(btn, currentTheme());
        btn.addEventListener('click', function(){
          var next = currentTheme() === 'light' ? 'dark' : 'light';
          localStorage.setItem(KEY, next);
          applyTheme(next);
          var all = document.querySelectorAll('.theme-toggle');
          for (var j = 0; j < all.length; j++){ paint(all[j], next); }
        });
      })(btns[i]);
    }
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
