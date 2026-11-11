// CodeSnag: type the trigger (default "/") + letters in any textbox to insert a saved snippet.
// Respects the trigger character, the insert toggle, and the per-site disable list.
(function () {
  var KEY = 'codesnag_snippets';
  var SETTINGS_KEY = 'codesnag_settings';
  var box = null, currentEl = null, currentQuery = '';

  function isEditable(el) {
    if (!el) return false;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') {
      var t = (el.type || 'text').toLowerCase();
      return ['text', 'search', 'url', 'email', ''].indexOf(t) >= 0;
    }
    return !!el.isContentEditable;
  }

  function getText(el) { return el.isContentEditable ? el.innerText : el.value; }
  function caretPos(el) {
    if (el.isContentEditable) {
      var sel = window.getSelection();
      return sel && sel.focusOffset != null ? sel.focusOffset : 0;
    }
    return el.selectionStart || 0;
  }

  function closeBox() { if (box) { box.remove(); box = null; } currentEl = null; }

  function showMatches(el, query, snippets, settings) {
    closeBox();
    var q = query.toLowerCase();
    var matches = snippets.filter(function (s) {
      return ((s.shortcut || '') + ' ' + (s.title || '')).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 6);
    if (!matches.length) return;
    currentEl = el;
    box = document.createElement('div');
    box.style.cssText = 'position:fixed;z-index:2147483647;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.18);width:340px;max-height:260px;overflow:auto;font-family:sans-serif';
    var r = el.getBoundingClientRect();
    box.style.left = Math.min(r.left, window.innerWidth - 360) + 'px';
    box.style.top = (r.bottom + 6) + 'px';
    box.innerHTML = '<div style="padding:8px 10px;font-size:12px;color:#6b7280;border-bottom:1px solid #f3f4f6">CodeSnag — press Enter to insert</div>';
    matches.forEach(function (s) {
      var row = document.createElement('div');
      row.style.cssText = 'padding:9px 10px;cursor:pointer;border-bottom:1px solid #f3f4f6';
      row.innerHTML = '<b style="font-size:13px;color:#111"></b> <span style="font-size:11px;color:#fff;background:#16a34a;border-radius:4px;padding:1px 5px"></span><div style="font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>';
      row.querySelector('b').textContent = (s.shortcut ? '/' + s.shortcut + ' — ' : '') + (s.title || 'Untitled');
      row.querySelector('span').textContent = s.language || 'Other';
      row.querySelector('div').textContent = (s.code || '').split('\n')[0] || '';
      row.addEventListener('mousedown', function (ev) { ev.preventDefault(); insertSnippet(el, s, settings); });
      row.addEventListener('mouseenter', function () { row.style.background = '#f0fdf4'; });
      row.addEventListener('mouseleave', function () { row.style.background = ''; });
      box.appendChild(row);
    });
    document.body.appendChild(box);
  }

  function insertSnippet(el, s, settings) {
    var trigger = (settings && settings.trigger) || '/';
    var text = getText(el);
    var pos = caretPos(el);
    // Remove the trigger + typed query before the caret, then insert code.
    var before = text.slice(0, pos);
    var idx = before.lastIndexOf(trigger);
    var newBefore = idx >= 0 ? before.slice(0, idx) : before;
    var after = text.slice(pos);
    var code = s.code || '';
    if (el.isContentEditable) {
      el.focus();
      document.execCommand('selectAll', false, null);
      // Simpler path for contenteditable: append at caret via selection
      var sel = window.getSelection();
      if (sel && sel.rangeCount) {
        var range = sel.getRangeAt(0);
        range.deleteFromDocument();
        range.insertNode(document.createTextNode(code));
      }
    } else {
      el.value = newBefore + code + after;
      var newPos = newBefore.length + code.length;
      el.setSelectionRange(newPos, newPos);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    closeBox();
    el.focus();
  }

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!isEditable(el)) return;
    chrome.storage.local.get([SETTINGS_KEY, KEY]).then(function (r) {
      var settings = Object.assign({ trigger: '/', googleCard: true, insertEnabled: true, disabledSites: [] }, r[SETTINGS_KEY] || {});
      if (!settings.insertEnabled) { closeBox(); return; }
      var disabled = settings.disabledSites || [];
      if (disabled.some(function (d) { return d && location.hostname.indexOf(d) >= 0; })) { closeBox(); return; }
      var trigger = settings.trigger || '/';
      var text = getText(el);
      var pos = caretPos(el);
      var before = text.slice(0, pos);
      var idx = before.lastIndexOf(trigger);
      if (idx < 0 || idx < before.length - 30) { closeBox(); return; }
      var query = before.slice(idx + 1);
      if (!/^[a-zA-Z0-9_-]*$/.test(query)) { closeBox(); return; }
      currentQuery = query;
      var snippets = Array.isArray(r[KEY]) ? r[KEY] : [];
      if (!query) { closeBox(); return; }
      showMatches(el, query, snippets, settings);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeBox();
  });
  document.addEventListener('click', function (e) {
    if (box && !box.contains(e.target)) closeBox();
  });
})();
