// CodeSnag: on Google search, show the user's OWN saved snippets that match the query.
// Nothing from any community, nothing fetched from the web. Fails silently if Google changes its layout.
(function () {
  var KEY = 'codesnag_snippets';
  var SETTINGS_KEY = 'codesnag_settings';
  try {
    var params = new URLSearchParams(location.search);
    var q = (params.get('q') || '').trim();
    if (!q) return;
    chrome.storage.local.get([SETTINGS_KEY, KEY]).then(function (r) {
      var settings = Object.assign({ trigger: '/', googleCard: true, insertEnabled: true, disabledSites: [] }, r[SETTINGS_KEY] || {});
      if (!settings.googleCard) return;
      var snippets = Array.isArray(r[KEY]) ? r[KEY] : [];
      var words = q.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 2; });
      var matches = snippets.filter(function (s) {
        var hay = ((s.title || '') + ' ' + (s.shortcut || '') + ' ' + (s.tags || []).join(' ') + ' ' + (s.code || '')).toLowerCase();
        return words.some(function (w) { return hay.indexOf(w) >= 0; });
      }).slice(0, 3);
      if (!matches.length) return;
      var anchor = document.querySelector('#search') || document.querySelector('#center_col') || document.querySelector('main');
      if (!anchor || document.getElementById('codesnag-google-card')) return;
      var card = document.createElement('div');
      card.id = 'codesnag-google-card';
      card.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-left:4px solid #16a34a;border-radius:10px;padding:14px 16px;margin:0 0 16px;font-family:Arial,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.08)';
      var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<b style="font-size:15px;color:#111">CodeSnag — your saved answers</b>' +
        '<span style="font-size:12px;color:#6b7280">Saved only on this device</span></div>';
      matches.forEach(function (s) {
        html += '<div style="margin-bottom:10px"><div style="font-size:13px;color:#111;font-weight:bold"></div>' +
          '<pre style="background:#1f2937;color:#e5e7eb;padding:10px;border-radius:8px;font:12px monospace;white-space:pre-wrap;max-height:140px;overflow:auto;margin:6px 0"></pre>' +
          '<button data-copy style="background:#16a34a;color:#fff;border:0;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px">Copy code</button></div>';
      });
      card.innerHTML = html;
      matches.forEach(function (s, i) {
        var blocks = card.querySelectorAll('pre');
        if (blocks[i]) blocks[i].textContent = s.code || '';
      });
      var btns = card.querySelectorAll('[data-copy]');
      btns.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          navigator.clipboard.writeText(matches[i].code || '').then(function () { btn.textContent = 'Copied'; });
        });
      });
      anchor.prepend(card);
    });
  } catch (e) { /* fail silently — Google layout changes must never break search */ }
})();
