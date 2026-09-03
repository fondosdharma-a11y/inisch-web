/* Campus INISCH · trabajador de servicio
   Guarda la interfaz para que el campus abra aunque no haya conexion.
   Los DATOS del alumno nunca se guardan aqui: siempre se piden al servidor. */
var CACHE = "inisch-campus-v1";
var BASE = [
  "/campus/dashboard.html", "/campus/lecciones.html", "/campus/leccion.html",
  "/campus/mi-pelicula.html", "/campus/bitacora.html", "/campus/practica.html",
  "/campus/certificados.html", "/campus/perfil.html", "/campus/login.html",
  "/campus/css/campus.css", "/campus/js/campus-core.js",
  "/campus/js/supabase-config.js", "/assets/mandala.png", "/assets/favicon.png"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(BASE.map(function(u){
      return c.add(u).catch(function(){});   // si alguno falla, no rompemos la instalacion
    }));
  }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  // Nunca guardamos datos del alumno ni peticiones de autenticacion
  if (url.hostname.indexOf("supabase.co") >= 0) return;
  if (url.hostname.indexOf("googletagmanager") >= 0) return;
  if (url.origin !== location.origin) return;

  // La interfaz: primero la red, y si no hay, lo guardado
  e.respondWith(
    fetch(req).then(function(res){
      if (res && res.status === 200){
        var copia = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copia); });
      }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(m){
        return m || caches.match("/campus/dashboard.html");
      });
    })
  );
});
