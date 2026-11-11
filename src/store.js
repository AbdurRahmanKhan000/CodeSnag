// CodeSnag shared storage + search helpers (popup + options).
// No network. All data lives in chrome.storage.local on this device.
(function () {
  var SNIPPETS_KEY = 'codesnag_snippets';
  var SETTINGS_KEY = 'codesnag_settings';

  function defaultSettings() {
    return { trigger: '/', googleCard: true, insertEnabled: true, disabledSites: [] };
  }

  function uid() {
    return 'sn_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function getAll() {
    return chrome.storage.local.get([SNIPPETS_KEY, SETTINGS_KEY]).then(function (r) {
      return {
        snippets: Array.isArray(r[SNIPPETS_KEY]) ? r[SNIPPETS_KEY] : [],
        settings: Object.assign(defaultSettings(), r[SETTINGS_KEY] || {})
      };
    });
  }

  function saveSnippets(list) {
    return chrome.storage.local.set({ [SNIPPETS_KEY]: list });
  }

  function saveSettings(s) {
    return chrome.storage.local.set({ [SETTINGS_KEY]: s });
  }

  // Fuzzy-ish search: title/shortcut/tags/language score highest, code matches too.
  function score(snippet, q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return 1;
    var words = q.split(/\s+/);
    var total = 0;
    words.forEach(function (w) {
      var hay = {
        title: (snippet.title || '').toLowerCase(),
        shortcut: (snippet.shortcut || '').toLowerCase(),
        language: (snippet.language || '').toLowerCase(),
        tags: (snippet.tags || []).join(' ').toLowerCase(),
        code: (snippet.code || '').toLowerCase()
      };
      if (hay.title.indexOf(w) === 0) total += 10;
      else if (hay.title.indexOf(w) >= 0) total += 6;
      if (hay.shortcut.indexOf(w) === 0) total += 9;
      else if (hay.shortcut.indexOf(w) >= 0) total += 5;
      if (hay.language.indexOf(w) === 0) total += 5;
      if (hay.tags.indexOf(w) >= 0) total += 4;
      if (hay.code.indexOf(w) >= 0) total += 2;
    });
    return total;
  }

  function search(snippets, q) {
    q = (q || '').trim();
    if (!q) return snippets.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    return snippets
      .map(function (s) { return { s: s, score: score(s, q) }; })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (x) { return x.s; });
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function storageBytes(snippets) {
    try { return new Blob([JSON.stringify(snippets)]).size; } catch (e) { return JSON.stringify(snippets).length; }
  }

  // Expose for popup/options (plain script tag, no modules in MV3 popup).
  window.CodeSnagStore = {
    getAll: getAll, saveSnippets: saveSnippets, saveSettings: saveSettings,
    search: search, score: score, escapeHtml: escapeHtml, storageBytes: storageBytes,
    uid: uid, defaultSettings: defaultSettings
  };
})();
