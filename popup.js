// CodeSnag popup: search, view, copy, edit, delete, export/import. Local only.
var S = window.CodeSnagStore;
var all = [], filterLang = 'All', editingId = null;

function langList() {
  var langs = ['All'];
  all.forEach(function (s) { if (s.language && langs.indexOf(s.language) < 0) langs.push(s.language); });
  return langs;
}

function render() {
  var q = document.getElementById('search').value;
  var results = S.search(all, q);
  if (filterLang !== 'All') results = results.filter(function (s) { return s.language === filterLang; });
  var list = document.getElementById('list');
  list.innerHTML = '';
  document.getElementById('count').textContent = all.length + ' snippet' + (all.length === 1 ? '' : 's') + ' · ' + (S.storageBytes(all) / 1024).toFixed(1) + ' KB';
  var warn = document.getElementById('warn');
  if (S.storageBytes(all) > 8 * 1024 * 1024) { warn.style.display = 'block'; warn.textContent = 'Library is almost full (browser limit ~10 MB). Export your snippets as a backup.'; }
  else warn.style.display = 'none';
  if (!results.length) { list.innerHTML = '<div class="empty">No snippets match. Save one from any code block, or add it with “+ New snippet”.</div>'; return; }
  results.forEach(function (sn) {
    var card = document.createElement('div'); card.className = 'card';
    var h = document.createElement('h3'); h.textContent = sn.title || 'Untitled';
    card.appendChild(h);
    var meta = document.createElement('div'); meta.className = 'meta';
    var badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = sn.language || 'Other'; meta.appendChild(badge); meta.appendChild(document.createTextNode(' '));
    if (sn.shortcut) { var sc = document.createElement('span'); sc.className = 'shortcut'; sc.textContent = '/' + sn.shortcut; meta.appendChild(sc); meta.appendChild(document.createTextNode(' ')); }
    meta.appendChild(document.createTextNode((sn.sourceUrl ? new URL(sn.sourceUrl).hostname + ' · ' : '') + new Date(sn.updatedAt || sn.createdAt || Date.now()).toLocaleDateString()));
    if (sn.isExample) meta.appendChild(document.createTextNode(' · example'));
    card.appendChild(meta);
    var pre = document.createElement('pre'); pre.textContent = sn.code || ''; card.appendChild(pre);
    var act = document.createElement('div'); act.className = 'actions';
    var copy = document.createElement('button'); copy.className = 'primary'; copy.textContent = 'Copy';
    copy.onclick = function () { navigator.clipboard.writeText(sn.code || '').then(function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1200); }); };
    var edit = document.createElement('button'); edit.textContent = 'Edit';
    edit.onclick = function () { openEditor(sn); };
    var del = document.createElement('button'); del.textContent = 'Delete';
    del.onclick = function () { if (confirm('Delete "' + (sn.title || 'snippet') + '"?')) { all = all.filter(function (x) { return x.id !== sn.id; }); S.saveSnippets(all).then(load); } };
    act.appendChild(copy); act.appendChild(edit); act.appendChild(del); card.appendChild(act);
    list.appendChild(card);
  });
  var f = document.getElementById('filters'); f.innerHTML = '';
  langList().forEach(function (l) {
    var b = document.createElement('button'); b.textContent = l; if (l === filterLang) b.className = 'active';
    b.onclick = function () { filterLang = l; render(); }; f.appendChild(b);
  });
}

function openEditor(sn) {
  editingId = sn ? sn.id : null;
  document.getElementById('editor').style.display = 'block';
  document.getElementById('edTitle').value = sn ? sn.title || '' : '';
  document.getElementById('edLang').value = sn ? sn.language || '' : '';
  document.getElementById('edShortcut').value = sn ? sn.shortcut || '' : '';
  document.getElementById('edTags').value = sn ? (sn.tags || []).join(', ') : '';
  document.getElementById('edCode').value = sn ? sn.code || '' : '';
  document.getElementById('edTitle').focus();
}

function load() { S.getAll().then(function (r) { all = r.snippets; render(); }); }

document.getElementById('search').addEventListener('input', render);
document.getElementById('newBtn').addEventListener('click', function () { openEditor(null); });
document.getElementById('edCancel').addEventListener('click', function () { document.getElementById('editor').style.display = 'none'; editingId = null; });
document.getElementById('edSave').addEventListener('click', function () {
  var code = document.getElementById('edCode').value;
  if (!code.trim()) { alert('Paste some code first.'); return; }
  var now = Date.now();
  var data = {
    title: document.getElementById('edTitle').value.trim() || 'Untitled snippet',
    language: document.getElementById('edLang').value.trim() || 'Other',
    shortcut: document.getElementById('edShortcut').value.trim().replace(/^\//, ''),
    tags: document.getElementById('edTags').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
    code: code
  };
  if (editingId) {
    all = all.map(function (s) { return s.id === editingId ? Object.assign({}, s, data, { updatedAt: now, isExample: false }) : s; });
  } else {
    all.unshift(Object.assign({ id: S.uid(), sourceUrl: '', sourceTitle: '', createdAt: now, updatedAt: now, isExample: false }, data));
  }
  S.saveSnippets(all).then(function () { document.getElementById('editor').style.display = 'none'; editingId = null; load(); });
});
document.getElementById('exportBtn').addEventListener('click', function () {
  var blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'codesnag-library.json'; a.click();
});
document.getElementById('importBtn').addEventListener('click', function () { document.getElementById('importFile').click(); });
document.getElementById('importFile').addEventListener('change', function (e) {
  var file = e.target.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error('not an array');
      var existing = {};
      all.forEach(function (s) { existing[s.id] = true; });
      imported.forEach(function (s) { if (s && s.code && !existing[s.id]) all.push(s); });
      S.saveSnippets(all).then(load);
    } catch (err) { alert('That file is not a valid CodeSnag export.'); }
  };
  reader.readAsText(file);
});
load();
