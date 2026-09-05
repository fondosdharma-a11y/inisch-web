/* ============================================================
   INISCH CAMPUS · Nucleo compartido
   - Construye la barra lateral y superior en cada pagina
   - Resuelve sesion (Supabase real o modo demostracion)
   - Capa de datos unica: DB.get / DB.save / DB.list / DB.remove
   ============================================================ */
(function(){
  "use strict";

  var DEMO = (typeof CAMPUS_CONFIGURED === "undefined") || !CAMPUS_CONFIGURED;
  var LS = "inisch-demo:";

  /* ---------- tema claro / oscuro ---------- */
  var TKEY = "inisch-theme";
  function temaActual(){ try{ return localStorage.getItem(TKEY) || "dark"; }catch(e){ return "dark"; } }
  function aplicarTema(t){ document.documentElement.setAttribute("data-theme", t); }
  aplicarTema(temaActual());

  /* ---------- utilidades ---------- */
  function el(t, c, h){ var e=document.createElement(t); if(c) e.className=c; if(h!=null) e.innerHTML=h; return e; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(m){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; }); }
  function toast(msg){
    var t = document.querySelector(".toast");
    if(!t){ t = el("div","toast"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function(){ t.classList.remove("show"); }, 2600);
  }
  function initials(name){
    if(!name) return "··";
    var p = name.trim().split(/\s+/);
    return ((p[0]||"")[0]||"" ).toUpperCase() + ((p[1]||"")[0]||"").toUpperCase();
  }

  /* ---------- almacen demo ---------- */
  function dget(k, def){
    try{ var v = localStorage.getItem(LS+k); return v ? JSON.parse(v) : def; }
    catch(e){ return def; }
  }
  function dset(k, v){ try{ localStorage.setItem(LS+k, JSON.stringify(v)); }catch(e){} }
  function uid(){ return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  /* ---------- sesion ---------- */
  var USER = null;

  function demoUser(){
    var u = dget("user", null);
    if(!u){ u = { id:"demo", full_name:"Alumno de prueba", email:"demo@inisch.com", demo:true }; dset("user",u); }
    u.demo = true; return u;
  }

  /* ------------------------------------------------------------
     ¿La URL trae una respuesta de inicio de sesión social?
     Google devuelve ?code= (PKCE) o #access_token= (implícito).
     La biblioteca necesita un instante para canjearlo por sesión.
     ------------------------------------------------------------ */
  function hayRespuestaOAuth(){
    return /[?&](code|error|error_description)=/.test(location.search) ||
           /[#&](access_token|error|error_description)=/.test(location.hash);
  }

  /* Pide la sesión y, si venimos de un proveedor social, espera a que
     la biblioteca termine de canjear el código antes de rendirse. */
  function obtenerSesion(intentos){
    return supabaseClient.auth.getSession().then(function(r){
      var s = r && r.data && r.data.session;
      if (s) return s;
      if (intentos > 0){
        return new Promise(function(ok){ setTimeout(ok, 350); })
                 .then(function(){ return obtenerSesion(intentos - 1); });
      }
      return null;
    });
  }

  /* Corta un bucle de redirección en seco.
     Si rebotamos entre campus y login 3 veces en 20 segundos, paramos
     y explicamos qué pasa, en vez de dejar la pestaña dando vueltas. */
  function irALogin(){
    var CLAVE = "inisch-rebote";
    try {
      var d = JSON.parse(sessionStorage.getItem(CLAVE) || '{"n":0,"t":0}');
      var ahora = Date.now();
      if (ahora - d.t > 20000) d = { n:0, t:ahora };
      d.n++; d.t = ahora;
      sessionStorage.setItem(CLAVE, JSON.stringify(d));
      if (d.n >= 3){ sessionStorage.removeItem(CLAVE); return pantallaBucle(); }
    } catch(e){}
    location.replace("login.html");
  }

  function pantallaBucle(){
    document.body.innerHTML =
      '<div style="max-width:520px;margin:14vh auto;padding:0 26px;text-align:center;' +
      'font-family:system-ui,-apple-system,sans-serif;color:#C3D5D9">' +
        '<div style="font-size:34px;margin-bottom:16px">⟳</div>' +
        '<h1 style="font-size:23px;margin-bottom:14px;color:#F2F8F9">No pudimos abrir tu sesión</h1>' +
        '<p style="line-height:1.65;font-size:15.5px">Tu sesión quedó en un estado inconsistente y el campus ' +
        'entró en un ciclo. Vamos a limpiarla para que puedas entrar de nuevo.</p>' +
        '<button id="bc-limpiar" style="margin-top:24px;padding:12px 24px;border-radius:22px;cursor:pointer;' +
        'border:1px solid #D8B45A;background:transparent;color:#D8B45A;font-size:15px">Limpiar y volver a entrar</button>' +
        '<p style="margin-top:22px;font-size:13px;opacity:.7">Si vuelve a pasar, escríbenos por WhatsApp al +52 33 1470 1563.</p>' +
      '</div>';
    document.body.style.background = "#0A1518";
    document.getElementById("bc-limpiar").addEventListener("click", function(){
      try {
        Object.keys(localStorage).forEach(function(k){
          if (k.indexOf("sb-") === 0 || k.indexOf("supabase") >= 0) localStorage.removeItem(k);
        });
        sessionStorage.clear();
      } catch(e){}
      if (typeof supabaseClient !== "undefined" && supabaseClient.auth){
        supabaseClient.auth.signOut().finally(function(){ location.replace("login.html"); });
      } else location.replace("login.html");
    });
  }

  function resolveUser(cb){
    if (DEMO){ USER = demoUser(); return cb(USER); }

    /* cb se llama UNA sola vez y FUERA de la cadena de promesas.
       Antes, un error al dibujar la pantalla caía en el .catch de abajo,
       se interpretaba como "no hay sesión" y mandaba al login. El login
       veía la sesión y devolvía al campus: bucle infinito. */
    var entregado = false;
    function entregar(u){
      if (entregado) return;
      entregado = true;
      USER = u;
      setTimeout(function(){ cb(u); }, 0);
    }

    function armar(s){
      var m = (s && s.user && s.user.user_metadata) || {};
      return {
        id: s.user.id,
        email: s.user.email,
        full_name: m.full_name || m.name || m.user_name || m.preferred_username || s.user.email,
        avatar: m.avatar_url || m.picture || null,
        demo: false
      };
    }

    var deOAuth = hayRespuestaOAuth();
    obtenerSesion(deOAuth ? 12 : 0).then(function(s){
      if (!s) return entregar(null);

      // Limpiar los parámetros del proveedor para que un refresco no los reprocese
      if (deOAuth && history.replaceState){
        try { history.replaceState(null, "", location.pathname); } catch(e){}
      }

      var ahora = Math.floor(Date.now()/1000);
      if (s.expires_at && (s.expires_at - ahora) < 120){
        return supabaseClient.auth.refreshSession().then(function(r2){
          entregar(armar((r2 && r2.data && r2.data.session) || s));
        }).catch(function(){ entregar(armar(s)); });
      }
      entregar(armar(s));
    }).catch(function(e){
      console.error("No se pudo resolver la sesión:", e);
      entregar(null);
    });
  }

  /* Ejecuta varias promesas sin que una sola falla tumbe la pantalla.
     Devuelve el valor por defecto de la que falle. */
  var FALLOS = [];
  function todas(lista, pordefecto){
    return Promise.all(lista.map(function(p, i){
      return Promise.resolve(p).catch(function(e){
        var m = (e && (e.message || e.error_description || e.hint)) || String(e);
        console.warn("Consulta fallida (" + i + "):", e);
        FALLOS.push(m);
        avisarFallo();
        return (pordefecto && pordefecto[i] !== undefined) ? pordefecto[i] : [];
      });
    }));
  }

  /* Si algo falla al leer datos, el alumno debe enterarse.
     Antes la pestaña se quedaba en "Cargando..." para siempre. */
  var avisoPuesto = false;
  function avisarFallo(){
    if (avisoPuesto || !FALLOS.length) return;
    avisoPuesto = true;
    setTimeout(function(){
      var c = document.querySelector(".content");
      if (!c) return;
      var d = el("div","nudge");
      d.style.marginBottom = "18px";
      d.innerHTML = '<span class="n-ic">&#9888;</span><div class="n-txt">' +
        '<b>No pudimos cargar parte de tu informacion.</b> ' +
        'Puede ser un problema de conexion. Recarga la pagina; si sigue igual, escribenos por WhatsApp al +52 33 1470 1563.' +
        '<br><span class="tiny soft">Detalle: ' + esc(FALLOS[0]).slice(0,160) + '</span></div>' +
        '<button class="btn-o btn-sm" onclick="location.reload()">Recargar</button>';
      c.insertBefore(d, c.firstChild);
    }, 400);
  }

  function signOut(){
    if (DEMO){ location.href = "login.html"; return; }
    supabaseClient.auth.signOut().then(function(){ location.href="login.html"; });
  }

  /* ---------- capa de datos ---------- */
  var DB = {
    // lista de registros de una tabla del alumno
    list: function(table, opts){
      opts = opts || {};
      if (DEMO){
        var rows = dget("t:"+table, []);
        if (opts.order) rows = rows.slice().sort(function(a,b){
          var x=a[opts.order]||"", y=b[opts.order]||"";
          return opts.desc ? (x<y?1:x>y?-1:0) : (x>y?1:x<y?-1:0);
        });
        if (opts.eq) rows = rows.filter(function(r){
          for(var k in opts.eq){ if(String(r[k])!==String(opts.eq[k])) return false; } return true; });
        return Promise.resolve(rows);
      }
      var q = supabaseClient.from(table).select("*").eq("student_id", USER.id);
      if (opts.eq) for (var k in opts.eq) q = q.eq(k, opts.eq[k]);
      if (opts.order) q = q.order(opts.order, { ascending: !opts.desc });
      return q.then(function(r){ if(r.error) throw r.error; return r.data||[]; });
    },
    // inserta o actualiza (si trae id)
    save: function(table, row){
      if (DEMO){
        var rows = dget("t:"+table, []);
        if (row.id){
          for (var i=0;i<rows.length;i++) if(rows[i].id===row.id){ rows[i]=Object.assign(rows[i],row); dset("t:"+table,rows); return Promise.resolve(rows[i]); }
        }
        row.id = row.id || uid();
        row.created_at = row.created_at || new Date().toISOString();
        rows.push(row); dset("t:"+table, rows);
        return Promise.resolve(row);
      }
      row.student_id = USER.id;
      var p = row.id
        ? supabaseClient.from(table).update(row).eq("id", row.id).select().single()
        : supabaseClient.from(table).insert(row).select().single();
      return p.then(function(r){ if(r.error) throw r.error; return r.data; });
    },
    remove: function(table, id){
      if (DEMO){
        var rows = dget("t:"+table, []).filter(function(r){ return r.id!==id; });
        dset("t:"+table, rows); return Promise.resolve();
      }
      return supabaseClient.from(table).delete().eq("id", id)
        .then(function(r){ if(r.error) throw r.error; });
    },
    // catalogo publico (cursos y lecciones)
    catalog: function(){
      if (DEMO) return Promise.resolve(DEMO_CATALOG());
      return supabaseClient.from("courses").select("*").order("order_index")
        .then(function(c){
          if(c.error) throw c.error;
          return supabaseClient.from("lessons").select("*").order("order_index")
            .then(function(l){
              if(l.error) throw l.error;
              var courses = c.data||[], lessons = l.data||[];
              courses.forEach(function(co){
                co.lessons = lessons.filter(function(le){ return le.course_id===co.id; });
              });
              return courses;
            });
        });
    },
    progress: function(){
      if (DEMO) return Promise.resolve(dget("t:progress", []));
      return supabaseClient.from("progress").select("*").eq("student_id", USER.id)
        .then(function(r){ if(r.error) throw r.error; return r.data||[]; });
    },
    toggleProgress: function(lesson_id, done){
      if (DEMO){
        var rows = dget("t:progress", []);
        if (done){ if(!rows.some(function(r){return r.lesson_id===lesson_id;}))
          rows.push({ id:uid(), lesson_id:lesson_id, completed_at:new Date().toISOString() }); }
        else rows = rows.filter(function(r){ return r.lesson_id!==lesson_id; });
        dset("t:progress", rows); return Promise.resolve();
      }
      if (done) return supabaseClient.from("progress")
        .insert({ student_id:USER.id, lesson_id:lesson_id })
        .then(function(r){ if(r.error && r.error.code!=="23505") throw r.error; });
      return supabaseClient.from("progress").delete()
        .eq("student_id", USER.id).eq("lesson_id", lesson_id)
        .then(function(r){ if(r.error) throw r.error; });
    }
  };

  function DEMO_CATALOG(){
    return [{
      id:"c1", etapa:1, title:"Taller Intensivo del SCH",
      description:"Guía de Interiorización Personal del Sistema Código Holográfico",
      lessons:[
        {id:"l1",title:"Bienvenida y presentación del Sistema",content:"Qué es el Sistema Código Holográfico, de dónde surge y cómo se va a trabajar.",order_index:1},
        {id:"l2",title:"El observador consciente",content:"De sentirse víctima de las circunstancias a asumir el rol de observador de tu propia realidad.",order_index:2},
        {id:"l3",title:"La película de tu vida",content:"Cómo se formó tu película entre los 2 y los 10 años. El proyector interno.",order_index:3},
        {id:"l4",title:"Control, expectativas y apego",content:"Las tres raíces del sufrimiento cotidiano y cómo empezar a soltarlas.",order_index:4},
        {id:"l5",title:"El auténtico perdón",content:"El perdón como comprensión y compasión, no como olvido ni justificación.",order_index:5},
        {id:"l6",title:"El Amor Real",content:"Comprensión, Compasión y Bondad como los tres componentes del Amor Real.",order_index:6}
      ]
    }];
  }

  /* ---------- interfaz: barra lateral ---------- */
  var NAV = [
    { lbl:"Mi proceso" },
    { h:"dashboard.html",  ic:"◈", t:"Inicio" },
    { h:"lecciones.html",  ic:"▤", t:"Mis lecciones" },
    { lbl:"Herramientas" },
    { h:"mi-pelicula.html",ic:"🎥", t:"Mi Película" },
    { h:"bitacora.html",   ic:"✎", t:"Bitácora" },
    { h:"practica.html",   ic:"◉", t:"Práctica" },
    { lbl:"Mi cuenta" },
    { h:"certificados.html", ic:"✦", t:"Certificados" },
    { h:"perfil.html",     ic:"☺", t:"Mi perfil" },
    { h:"instructores.html", ic:"◈", t:"Instructores", soloInstructor:true },
    { h:"herramientas.html", ic:"⚙", t:"Herramientas", soloInstructor:true }
  ];

  function buildChrome(pageTitle){
    var page = (location.pathname.split("/").pop() || "dashboard.html");

    var shell = el("div","shell");
    var side  = el("aside","side");

    var top = el("a","side-top");
    top.href = "dashboard.html";
    top.innerHTML = '<img src="../assets/mandala.png" alt="INISCH">' +
      '<div><div class="st-n">INISCH</div><div class="st-s">Campus</div></div>';
    side.appendChild(top);

    var nav = el("nav","side-nav");
    NAV.forEach(function(it){
      if (it.lbl){ nav.appendChild(el("div","side-lbl", esc(it.lbl))); return; }
      var a = el("a", it.h===page ? "on" : "");
      a.href = it.h;
      a.innerHTML = '<span class="ic">'+it.ic+'</span><span>'+esc(it.t)+'</span>';
      if (it.soloInstructor){
        a.style.display = "none";           // oculto hasta confirmar el rol
        a.setAttribute("data-instructor","1");
      }
      nav.appendChild(a);
    });
    side.appendChild(nav);

    var foot = el("div","side-foot");
    foot.innerHTML = '<a href="../index.html">← Volver al sitio</a>';
    side.appendChild(foot);

    var main = el("div","main");
    var tb = el("header","topbar");
    tb.innerHTML =
      '<div style="display:flex;align-items:center;gap:14px">' +
        '<button class="burger" aria-label="Menú">&#9776;</button>' +
        '<span class="tb-title">'+esc(pageTitle||"")+'</span>' +
      '</div>' +
      '<div class="tb-right">' +
        '<button class="tb-theme" id="cx-tema" title="Cambiar tema"></button>' +
        '<button class="btn-o btn-sm" id="cx-out">Salir</button>' +
        '<div class="avatar" id="cx-av">··</div>' +
      '</div>';
    main.appendChild(tb);

    var content = el("main","content");
    content.id = "cx-content";
    main.appendChild(content);

    var bd = el("div","side-backdrop");

    shell.appendChild(side); shell.appendChild(main);
    document.body.appendChild(shell); document.body.appendChild(bd);

    // menu movil
    var burger = tb.querySelector(".burger");
    function shut(){ side.classList.remove("open"); bd.classList.remove("open"); }
    burger.addEventListener("click", function(){
      side.classList.toggle("open"); bd.classList.toggle("open");
    });
    bd.addEventListener("click", shut);
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") shut(); });

    tb.querySelector("#cx-out").addEventListener("click", signOut);

    var bt = tb.querySelector("#cx-tema");
    function pintarTema(){ bt.innerHTML = temaActual() === "dark" ? "\u2600" : "\u263D"; }
    pintarTema();
    bt.addEventListener("click", function(){
      var n = temaActual() === "dark" ? "light" : "dark";
      try{ localStorage.setItem(TKEY, n); }catch(e){}
      aplicarTema(n); pintarTema();
    });

    return content;
  }

  /* ---------- arranque ---------- */
  function boot(pageTitle, render){
    var content = buildChrome(pageTitle);
    resolveUser(function(u){
      if (!u){ irALogin(); return; }
      try { sessionStorage.removeItem("inisch-rebote"); } catch(e){}
      var av = document.getElementById("cx-av");
      if (av) av.textContent = initials(u.full_name);

      if (DEMO){
        var b = el("div","banner demo");
        b.innerHTML = '<span>⚠</span><div><b>Modo demostración.</b> Estás recorriendo el campus sin conexión a la base de datos. ' +
          'Lo que escribas se guarda solo en este navegador. Para activarlo de verdad, pega tus claves de Supabase en ' +
          '<code>campus/js/supabase-config.js</code>.</div>';
        content.appendChild(b);
      }
      if (!DEMO){
        esInstructor().then(function(si){
          if (!si) return;
          var e2 = document.querySelectorAll('[data-instructor="1"]');
          for (var i=0;i<e2.length;i++) e2[i].style.display = "";
        }).catch(function(){});
      }

      /* Puerta de acceso: sin inscripción activa no se entra.
         La página de perfil queda abierta para que pueda ver sus datos y salir. */
      var abierta = (page === "perfil.html");
      tieneAcceso().catch(function(){ return null; }).then(function(ok){
        if (ok === false && !abierta){
          var lat = document.querySelector(".side nav");
          if (lat) lat.style.display = "none";
          pantallaSinAcceso(content);
          return;
        }
        try {
          render(content, u);
        } catch(e){
          console.error("Error al dibujar la pantalla:", e);
          var d = el("div","card");
          d.innerHTML = '<b>No pudimos mostrar esta seccion</b>' +
            '<p class="muted" style="margin-top:8px;font-size:15px">Ocurrio un error al construir la pagina. ' +
            'Recarga para intentarlo de nuevo.</p>' +
            '<p class="tiny soft" style="margin-top:8px">Detalle: ' + esc(String(e && e.message || e)).slice(0,200) + '</p>' +
            '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">' +
            '<button class="btn-p btn-sm" onclick="location.reload()">Recargar</button>' +
            '<a class="btn-o btn-sm" href="dashboard.html">Ir al inicio</a></div>';
          content.appendChild(d);
        }
      });
    });
  }

  function reveal(scope){
    var els = (scope||document).querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)){ for(var i=0;i<els.length;i++) els[i].classList.add("in"); return; }
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    },{threshold:.06});
    for (var j=0;j<els.length;j++){
      if (els[j].getBoundingClientRect().top < innerHeight*.95) els[j].classList.add("in");
      else io.observe(els[j]);
    }
  }

  /* ---------- anillo de progreso ---------- */
  function ring(pct, label){
    var r=52, c=2*Math.PI*r, off=c*(1-pct/100);
    return '<div class="ring"><svg width="118" height="118" viewBox="0 0 118 118">' +
      '<circle cx="59" cy="59" r="'+r+'" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="7"/>' +
      '<circle cx="59" cy="59" r="'+r+'" fill="none" stroke="url(#rg)" stroke-width="7" stroke-linecap="round" ' +
      'stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/>' +
      '<defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#6FB2C4"/><stop offset="100%" stop-color="#D8B45A"/>' +
      '</linearGradient></defs></svg>' +
      '<div class="rt"><div class="rn">'+Math.round(pct)+'%</div><div class="rl">'+esc(label||"")+'</div></div></div>';
  }

  /* ---------- utilidades compartidas ---------- */
  function fechaLarga(f, en){
    if (!f) return "";
    var M  = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    var MM = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var p = String(f).slice(0,10).split("-");
    var d = parseInt(p[2],10), m = parseInt(p[1],10)-1, y = p[0];
    return en ? (MM[m] + " " + d + ", " + y) : (d + " de " + M[m] + " de " + y);
  }
  /* ¿Tiene inscripción activa o es instructor? */
  function tieneAcceso(){
    if (DEMO) return Promise.resolve(true);
    return supabaseClient.rpc("tiene_acceso")
      .then(function(r){ if (r.error) throw r.error; return !!r.data; })
      .catch(function(e){
        console.warn("No se pudo verificar el acceso:", e);
        return null;   // null = no pudimos saber; no bloqueamos por un fallo de red
      });
  }

  function pantallaSinAcceso(content){
    content.innerHTML =
      '<div class="card" style="text-align:center;padding:clamp(40px,7vw,64px) 26px;max-width:620px;margin:0 auto">' +
        '<img src="../assets/mandala.png" alt="" style="width:72px;height:72px;border-radius:50%;margin-bottom:22px">' +
        '<h1 style="font-size:clamp(22px,4vw,28px);line-height:1.2;margin-bottom:14px">Tu cuenta está creada</h1>' +
        '<p class="muted" style="font-size:15.5px;line-height:1.7;margin-bottom:8px">' +
          'El campus se abre al confirmarse tu inscripción al <b>Taller Intensivo</b>. ' +
          'Ahí encontrarás tus lecciones, Mi Película, la Bitácora y la Práctica.</p>' +
        '<p class="muted" style="font-size:15.5px;line-height:1.7">' +
          'Si ya pagaste, escríbenos y lo activamos enseguida: a veces tarda unas horas.</p>' +
        '<div style="display:flex;gap:11px;justify-content:center;flex-wrap:wrap;margin-top:26px">' +
          '<a class="btn-p btn-sm" href="../taller.html">Ver el Taller Intensivo</a>' +
          '<a class="btn-o btn-sm" target="_blank" rel="noopener" ' +
            'href="https://wa.me/523314701563?text=' +
            encodeURIComponent("Hola, ya pagué el Taller Intensivo y me gustaría activar mi acceso al campus. Mi correo es: " + (USER.email||"")) +
            '">Ya pagué, activar mi acceso</a>' +
        '</div>' +
        '<p class="tiny soft" style="margin-top:24px">Sesión iniciada como ' + esc(USER.email||"") + ' · ' +
          '<a href="#" id="sa-out" style="color:var(--gold)">salir</a></p>' +
      '</div>';
    var o = document.getElementById("sa-out");
    if (o) o.addEventListener("click", function(e){ e.preventDefault(); signOut(); });
  }

  function esInstructor(){
    if (DEMO) return Promise.resolve(false);
    return supabaseClient.from("profiles").select("role").eq("id", USER.id).single()
      .then(function(r){ return !!(r.data && (r.data.role === "instructor" || r.data.role === "admin")); })
      .catch(function(){ return false; });
  }
  function param(n){
    var m = new RegExp("[?&]" + n + "=([^&#]*)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  window.Campus = {
    fechaLarga: fechaLarga, esInstructor: esInstructor, param: param,
    tema: temaActual, aplicarTema: aplicarTema,
    DEMO: DEMO, boot: boot, DB: DB, todas: todas, toast: toast, esc: esc, el: el,
    reveal: reveal, ring: ring, signOut: signOut, initials: initials,
    user: function(){ return USER; }
  };
})();
