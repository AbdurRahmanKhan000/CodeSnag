# CodeSnag — v1.0.0

**Never Google the same code twice. Save code once, find it in seconds, insert it anywhere.**

CodeSnag is a personal code library that lives inside your browser. It is an original extension by Abdur Rahman Khan (ARK Ecosystem), built for developers and students who keep re-searching for the same small piece of code.

## What it does
- **Save in 1 click** — hover any code block on Stack Overflow, GitHub or any page and press “+ Save to CodeSnag”. Or select code anywhere and press Ctrl+Shift+S, or right-click → “Save selection to CodeSnag”.
- **Find it fast** — click the CodeSnag icon. Fuzzy search matches title, shortcut, tags, language, and words inside the code. Filter by language.
- **Insert anywhere** — type `/` + letters in any text box (e.g. `/mysql`) and pick a snippet to insert it at the cursor. Change the trigger character or turn insert off in Settings; disable it per site.
- **Your own answers on Google** — when a Google search matches your saved snippets, a clean card at the top of the results shows your own snippets, with a Copy button. Only your snippets, never anyone else's.
- **Edit / delete / copy** every snippet. **Export / import** the whole library as JSON.
- **100% local** — snippets live only in `chrome.storage.local` on your device. No account, no server, no tracking, no ads. See PRIVACY.md and docs/privacy-policy.html.

## Install (load unpacked)
1. Edge: `edge://extensions` (Chrome: `chrome://extensions`) → turn on Developer mode.
2. Click “Load unpacked” and choose the `v1` folder in this package.
3. Pin CodeSnag to the toolbar. To update later, extract a new ZIP over the same folder and press Reload — do NOT remove the extension, or the browser will delete your local library.

## First run
Three clearly-marked example snippets are seeded on first install (MySQL in Python, debounce in JavaScript, SQL pagination). Delete them like any other snippet.

## Limits, honestly
- Browser storage ceiling is about 10 MB. The popup warns at 8 MB — export a JSON backup before then.
- The Google card reads Google's results page layout; if Google changes it, the card may stop appearing until an update. Search and insert keep working.
- The `/` trigger can clash with sites that use `/` for their own search. Change the trigger or disable CodeSnag for that site in Settings.

## Files
- `v1/` — the extension (manifest.json at its root)
- `docs/privacy-policy.html` — GitHub-Pages-ready privacy policy
- `store-images/` — 5 store images, each made at its exact size

## Changelog
See CHANGELOG.md. v1.0.0 — 2026-11-11.
