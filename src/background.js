// CodeSnag background service worker. No network requests, ever.
var SNIPPETS_KEY = 'codesnag_snippets';
var SETTINGS_KEY = 'codesnag_settings';

var EXAMPLES = [
  {
    title: 'Connect to MySQL in Python',
    code: "import mysql.connector\n\nconn = mysql.connector.connect(\n    host='localhost', user='root',\n    password='your_password', database='mydb'\n)\ncur = conn.cursor()\ncur.execute('SELECT * FROM users')\nprint(cur.fetchall())",
    language: 'Python', shortcut: 'mysql', tags: ['python', 'mysql', 'database'],
    sourceUrl: '', sourceTitle: 'CodeSnag example', isExample: true
  },
  {
    title: 'Debounce a function in JavaScript',
    code: "function debounce(fn, wait) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), wait);\n  };\n}",
    language: 'JavaScript', shortcut: 'debounce', tags: ['javascript', 'function'],
    sourceUrl: '', sourceTitle: 'CodeSnag example', isExample: true
  },
  {
    title: 'Pagination in SQL',
    code: "SELECT id, name\nFROM users\nORDER BY id\nLIMIT 10 OFFSET 20;",
    language: 'SQL', shortcut: 'paginate', tags: ['sql', 'pagination'],
    sourceUrl: '', sourceTitle: 'CodeSnag example', isExample: true
  }
];

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.storage.local.get([SNIPPETS_KEY, SETTINGS_KEY]).then(function (r) {
      var now = Date.now();
      if (!Array.isArray(r[SNIPPETS_KEY]) || r[SNIPPETS_KEY].length === 0) {
        var seeded = EXAMPLES.map(function (e, i) {
          return Object.assign({}, e, {
            id: 'sn_example_' + (i + 1),
            createdAt: now, updatedAt: now
          });
        });
        chrome.storage.local.set({ [SNIPPETS_KEY]: seeded });
      }
      if (!r[SETTINGS_KEY]) {
        chrome.storage.local.set({ [SETTINGS_KEY]: { trigger: '/', googleCard: true, insertEnabled: true, disabledSites: [] } });
      }
    });
  }
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId !== 'codesnag-save-selection' || !info.selectionText) return;
  chrome.storage.local.get([SNIPPETS_KEY]).then(function (r) {
    var list = Array.isArray(r[SNIPPETS_KEY]) ? r[SNIPPETS_KEY] : [];
    var now = Date.now();
    list.unshift({
      id: 'sn_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      title: (tab && tab.title ? tab.title : 'Saved snippet').slice(0, 80),
      code: info.selectionText.slice(0, 20000),
      language: 'Other', shortcut: '', tags: [],
      sourceUrl: (tab && tab.url) || '', sourceTitle: (tab && tab.title) || '',
      createdAt: now, updatedAt: now, isExample: false
    });
    return chrome.storage.local.set({ [SNIPPETS_KEY]: list });
  });
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: 'codesnag-save-selection',
    title: 'Save selection to CodeSnag',
    contexts: ['selection']
  });
});
