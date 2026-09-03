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

  function resolveUser(cb){
    if (DEMO){ USER = demoUser(); return cb(USER); }
    supabaseClient.auth.getSession().then(function(r){
      var s = r && r.data && r.data.session;
      if(!s){ USER = null; return cb(null); }
      var m = s.user.user_metadata || {};
      USER = { id:s.user.id, email:s.user.email, full_name: m.full_name || s.user.email, demo:false };
      cb(USER);
    }).catch(function(){ USER=null; cb(null); });
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
      id:"c1", etapa:1, title:"Etapa 1: Iniciación — El Despertar",
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
    { h:"perfil.html",     ic:"☺", t:"Mi perfil" }
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
    return content;
  }

  /* ---------- arranque ---------- */
  function boot(pageTitle, render){
    var content = buildChrome(pageTitle);
    resolveUser(function(u){
      if (!u){ location.href = "login.html"; return; }
      var av = document.getElementById("cx-av");
      if (av) av.textContent = initials(u.full_name);

      if (DEMO){
        var b = el("div","banner demo");
        b.innerHTML = '<span>⚠</span><div><b>Modo demostración.</b> Estás recorriendo el campus sin conexión a la base de datos. ' +
          'Lo que escribas se guarda solo en este navegador. Para activarlo de verdad, pega tus claves de Supabase en ' +
          '<code>campus/js/supabase-config.js</code>.</div>';
        content.appendChild(b);
      }
      try { render(content, u); } catch(e){ console.error(e); toast("Ocurrió un error al cargar."); }
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

  window.Campus = {
    DEMO: DEMO, boot: boot, DB: DB, toast: toast, esc: esc, el: el,
    reveal: reveal, ring: ring, signOut: signOut, initials: initials,
    user: function(){ return USER; }
  };
})();
