/* Menu movil INISCH.
   Construye el panel clonando los enlaces de .navlinks,
   asi no hay que duplicar el markup en cada pagina. */
(function(){

  function build(){
    var toggle = document.querySelector('.navtoggle');
    var links  = document.querySelector('.navlinks');
    if (!toggle || !links) return;
    if (document.querySelector('.mobile-menu')) return;

    var isEN = (document.documentElement.getAttribute('lang')||'es').toLowerCase().indexOf('en') === 0;

    var backdrop = document.createElement('div');
    backdrop.className = 'mm-backdrop';

    var panel = document.createElement('nav');
    panel.className = 'mobile-menu';
    panel.setAttribute('aria-label', isEN ? 'Mobile menu' : 'Menu movil');

    var close = document.createElement('button');
    close.className = 'mm-close';
    close.innerHTML = '&times;';
    close.setAttribute('aria-label', isEN ? 'Close menu' : 'Cerrar menu');
    panel.appendChild(close);

    // Clonar los enlaces de la barra principal
    var items = links.querySelectorAll('a');
    for (var i = 0; i < items.length; i++){
      panel.appendChild(items[i].cloneNode(true));
    }

    // Agregar el boton de campus (que se oculta en movil)
    var campus = document.querySelector('.btn-campus');
    if (campus){
      var c = campus.cloneNode(true);
      c.className = 'mm-campus';
      panel.appendChild(c);
    }

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    function open(){
      panel.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('mm-lock');
      toggle.setAttribute('aria-expanded','true');
      close.focus();
    }
    function shut(){
      panel.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('mm-lock');
      toggle.setAttribute('aria-expanded','false');
    }

    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label', isEN ? 'Open menu' : 'Abrir menu');

    toggle.addEventListener('click', function(e){
      e.preventDefault();
      if (panel.classList.contains('open')) shut(); else open();
    });
    close.addEventListener('click', shut);
    backdrop.addEventListener('click', shut);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && panel.classList.contains('open')) shut();
    });
    // Cerrar al navegar
    panel.addEventListener('click', function(e){
      if (e.target.tagName === 'A') shut();
    });
    // Si se agranda la ventana, cerrar
    window.addEventListener('resize', function(){
      if (window.innerWidth > 860 && panel.classList.contains('open')) shut();
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
