// CodeSnag: "Save to CodeSnag" button on code blocks + Ctrl+Shift+S for a selection.
// Original code, written for CodeSnag. No network.
(function () {
  var KEY = 'codesnag_snippets';

  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:2147483647;background:#16a34a;color:#fff;font:14px sans-serif;padding:10px 14px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.25)';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2500);
  }

  function guessLanguage(el) {
    var cls = (el.className || '') + ' ' + ((el.querySelector('code') || {}).className || '');
    var m = cls.match(/language-([a-z0-9+#-]+)|lang-([a-z0-9+#-]+)/i);
    if (m) return (m[1] || m[2] || 'Other');
    if (/stackoverflow\.com/.test(location.hostname)) return 'Other';
    return 'Other';
  }

  function saveSnippet(code, title) {
    if (!code || !code.trim()) return;
    chrome.storage.local.get([KEY]).then(function (r) {
      var list = Array.isArray(r[KEY]) ? r[KEY] : [];
      var now = Date.now();
      list.unshift({
        id: 'sn_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 8),
        title: (title || document.title || 'Saved snippet').slice(0, 80),
        code: code.slice(0, 20000), language: 'Other', shortcut: '', tags: [],
        sourceUrl: location.href, sourceTitle: document.title || '',
        createdAt: now, updatedAt: now, isExample: false
      });
      return chrome.storage.local.set({ [KEY]: list });
    }).then(function () { toast('Saved to CodeSnag'); });
  }

  function openModal(code, lang) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;font-family:sans-serif';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:12px;padding:20px;width:520px;max-width:92vw;box-shadow:0 12px 40px rgba(0,0,0,.3)">' +
      '<h3 style="margin:0 0 4px;font-size:18px;color:#111">Save to CodeSnag</h3>' +
      '<p style="margin:0 0 12px;color:#666;font-size:13px">Saved only on this device. Nothing is uploaded.</p>' +
      '<label style="font-size:13px;color:#333">Title</label>' +
      '<input id="cs-title" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;margin:4px 0 10px;box-sizing:border-box" value="">' +
      '<label style="font-size:13px;color:#333">Language</label>' +
      '<input id="cs-lang" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;margin:4px 0 10px;box-sizing:border-box" value="">' +
      '<pre style="background:#1f2937;color:#e5e7eb;padding:10px;border-radius:8px;max-height:160px;overflow:auto;font:12px monospace;white-space:pre-wrap"></pre>' +
      '<div style="text-align:right;margin-top:12px"><button id="cs-cancel" style="padding:8px 14px;border:1px solid #d1d5db;background:#fff;border-radius:6px;margin-right:8px;cursor:pointer">Cancel</button>' +
      '<button id="cs-save" style="padding:8px 16px;border:0;background:#16a34a;color:#fff;border-radius:6px;cursor:pointer">Save snippet</button></div></div>';
    overlay.querySelector('#cs-title').value = (document.title || 'Saved snippet').slice(0, 80);
    overlay.querySelector('#cs-lang').value = lang || 'Other';
    overlay.querySelector('pre').textContent = code.slice(0, 2000);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#cs-cancel').addEventListener('click', function () { overlay.remove(); });
    overlay.querySelector('#cs-save').addEventListener('click', function () {
      var title = overlay.querySelector('#cs-title').value || 'Saved snippet';
      chrome.storage.local.get([KEY]).then(function (r) {
        var list = Array.isArray(r[KEY]) ? r[KEY] : [];
        var now = Date.now();
        list.unshift({ id: 'sn_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 8),
          title: title.slice(0, 80), code: code.slice(0, 20000),
          language: overlay.querySelector('#cs-lang').value || 'Other', shortcut: '', tags: [],
          sourceUrl: location.href, sourceTitle: document.title || '',
          createdAt: now, updatedAt: now, isExample: false });
        return chrome.storage.local.set({ [KEY]: list });
      }).then(function () { overlay.remove(); toast('Saved to CodeSnag'); });
    });
    document.body.appendChild(overlay);
  }

  // Hover button on <pre> blocks
  document.addEventListener('mouseover', function (e) {
    var pre = e.target.closest && e.target.closest('pre');
    if (!pre || pre.querySelector(':scope > .cs-save-btn')) return;
    if (pre.getBoundingClientRect().height < 40) return;
    var btn = document.createElement('button');
    btn.textContent = '+ Save to CodeSnag';
    btn.className = 'cs-save-btn';
    btn.style.cssText = 'position:absolute;top:6px;right:6px;z-index:9999;background:#16a34a;color:#fff;border:0;border-radius:6px;padding:5px 9px;font:12px sans-serif;cursor:pointer';
    var pos = getComputedStyle(pre).position;
    if (pos === 'static') pre.style.position = 'relative';
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var codeEl = pre.querySelector('code');
      openModal(codeEl ? codeEl.innerText : pre.innerText, guessLanguage(pre));
    });
    pre.appendChild(btn);
    pre.addEventListener('mouseleave', function () { btn.remove(); }, { once: true });
  });

  // Ctrl+Shift+S saves the current selection
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      var sel = window.getSelection();
      if (sel && sel.toString().trim()) { e.preventDefault(); saveSnippet(sel.toString(), document.title); }
    }
  });
})();
