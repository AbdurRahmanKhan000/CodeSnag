var S = window.CodeSnagStore;
var settings = S.defaultSettings();
function load() {
  S.getAll().then(function (r) {
    settings = r.settings;
    document.getElementById('insertEnabled').checked = !!settings.insertEnabled;
    document.getElementById('trigger').value = settings.trigger || '/';
    document.getElementById('googleCard').checked = !!settings.googleCard;
    document.getElementById('disabledSites').value = (settings.disabledSites || []).join('\n');
    document.getElementById('stats').textContent = r.snippets.length + ' snippets · ' + (S.storageBytes(r.snippets) / 1024).toFixed(1) + ' KB stored locally';
  });
}
document.getElementById('saveBtn').addEventListener('click', function () {
  settings.insertEnabled = document.getElementById('insertEnabled').checked;
  settings.trigger = document.getElementById('trigger').value || '/';
  settings.googleCard = document.getElementById('googleCard').checked;
  settings.disabledSites = document.getElementById('disabledSites').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  S.saveSettings(settings).then(function () { document.getElementById('saved').textContent = 'Saved.'; setTimeout(function () { document.getElementById('saved').textContent = ''; }, 2000); });
});
document.getElementById('deleteAll').addEventListener('click', function () {
  if (confirm('Delete ALL snippets? Export first if you want a backup.')) S.saveSnippets([]).then(load);
});
document.getElementById('exportBtn').addEventListener('click', function () {
  S.getAll().then(function (r) {
    var blob = new Blob([JSON.stringify(r.snippets, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'codesnag-library.json'; a.click();
  });
});
document.getElementById('importBtn').addEventListener('click', function () { document.getElementById('importFile').click(); });
document.getElementById('importFile').addEventListener('change', function (e) {
  var file = e.target.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var imported = JSON.parse(reader.result);
      S.getAll().then(function (r) {
        var all = r.snippets; var ids = {}; all.forEach(function (s) { ids[s.id] = true; });
        imported.forEach(function (s) { if (s && s.code && !ids[s.id]) all.push(s); });
        S.saveSnippets(all).then(load);
      });
    } catch (err) { alert('That file is not a valid CodeSnag export.'); }
  };
  reader.readAsText(file);
});
load();
