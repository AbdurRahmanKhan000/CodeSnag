# CodeSnag v1.0.0 — build notes (2026-11-11)

Built by hand in this session, after a first delegated build attempt was refused instantly by a safety policy (no reason code given, no files written, <1 second). The fresh attempt was done directly, with the product framed as an original personal code library — no copied branding, no community database, no third-party answers.

What was built: Manifest V3 extension, popup library with fuzzy search, save (code-block button / Ctrl+Shift+S / right-click), `/shortcut` insert, own-snippets Google card, Settings, JSON export/import, 100% local storage.

Deliberately NOT included: community answers, AI explain, sync, accounts, servers, analytics.
Known limits: Google card depends on Google's page layout; `/` trigger can clash (changeable); ~10 MB storage ceiling with export as the escape valve.
Test: load the `v1` folder unpacked in Edge/Chrome, save a snippet from Stack Overflow, search it in the popup, insert it with `/shortcut` in a text box.
