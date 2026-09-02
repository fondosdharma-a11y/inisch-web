// ============================================================
// INISCH CAMPUS — Utilidades de autenticacion compartidas
// ============================================================

function campusNotConfigured() {
  return !supabaseClient;
}

function showNotConfiguredBanner(el) {
  if (!el) return;
  el.innerHTML = 'El campus todavia no esta conectado a la base de datos. Configura <code>docs/campus/js/supabase-config.js</code> con tus llaves de Supabase para activarlo.';
  el.style.display = 'block';
}

async function requireSession(redirectTo) {
  if (campusNotConfigured()) return null;
  const { data } = await supabaseClient.auth.getSession();
  const session = data ? data.session : null;
  if (!session) {
    window.location.href = redirectTo || 'login.html';
    return null;
  }
  return session;
}

async function logout() {
  if (campusNotConfigured()) { window.location.href = 'login.html'; return; }
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function () {
  var logoutBtn = document.querySelector('[data-action="logout"]');
  if (logoutBtn) logoutBtn.addEventListener('click', function (e) { e.preventDefault(); logout(); });
});
