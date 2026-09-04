# lichen 🌿

**An offline-first notes app**, built with Angular 22 and Supabase. Write markdown-style notes — headings, checklists, bullet and numbered lists — that save instantly to your device and sync in the background the moment you're back online.

This is the web companion to [Lichen for Android](#origin), sharing the same Supabase backend and data model, rebuilt from the ground up in Angular as a demonstration of the same product on a different stack.

> 🔗 **Live app:** _[https://a-thread.github.io/lichen/#/](https://a-thread.github.io/lichen/#/)_

---

## Why this exists

Most "offline-first" demos fake it — show a spinner, retry on reconnect, call it a day. Lichen actually treats the network as optional: every read and write hits an IndexedDB cache first, and a background sync queue reconciles with Supabase whenever the connection allows. Close your laptop mid-sentence, reopen it three days later with no wifi, and your note is exactly where you left it.

## Features

- **Block-based markdown editor** — headings, bold/italic/code, bullet lists, numbered lists, and checklists, with a live Write/Preview toggle
- **Smart list continuation** — press Enter inside a list or checklist and it continues automatically; Backspace on an empty item collapses it back to plain text
- **Read-only note view** — opening a note shows a clean rendered view first; Edit switches to the editor, and closing with unsaved changes prompts a discard confirmation
- **List management** — search by title/body, sort by title or date, toggle between grid and list layouts
- **Quick delete with undo** — delete a note from the list and undo it from the confirmation toast before it syncs away
- **Import & export** — import a `.txt` file as a new note; export a single note or your entire library as plain text, in a format shared with the Android app
- **True offline-first** — IndexedDB-backed local cache with a background sync queue; the app is fully usable with no connection
- **Full auth flow** — sign up with email confirmation, sign in, forgot/reset password, all backed by Supabase Auth
- **System, light & dark themes** — a deliberate, hand-tuned palette (not framework defaults), persisted across sessions
- **Installable PWA** — add it to your home screen and it behaves like a native app

## Tech stack

| Layer         | Choice                                                                            |
| ------------- | --------------------------------------------------------------------------------- |
| Framework     | Angular 22 — zoneless change detection, standalone components, signals throughout |
| Backend       | Supabase (Postgres, Auth, Realtime)                                               |
| Local storage | IndexedDB                                                                         |
| Styling       | Hand-authored SCSS with CSS custom properties (no UI framework)                   |
| Hosting       | GitHub Pages, deployed via GitHub Actions                                         |

## Architecture notes

A few decisions worth calling out for anyone reading the code:

- **Zoneless, signals-first.** No `zone.js` in the bundle. All state that can change outside a direct template event — async calls, `window` event listeners — lives in Angular signals, so change detection stays correct without the zone.js patching layer Angular has relied on since 2016.
- **The editor engine is a genuine port, not a rewrite.** The block parser, the auto-continue/collapse-on-Enter logic, and the formatting toolbar's selection-aware toggles were ported line-for-line from the Android app's Kotlin implementation into TypeScript — same behavior, same edge cases, two platforms.
- **One Supabase project, two clients.** The web and Android apps read and write the exact same `notes` table. Nothing about the schema or sync model is web-specific.

## Project structure

```
src/app/
  core/
    editor/           # block parser, input transform, toolbar actions — the editor engine
    auth.service.ts   # Supabase auth wrapper + route guard
    notes.service.ts  # offline-first read/write + background sync
    theme.service.ts  # system/light/dark mode, persisted
    notes-sort.ts      # sort modes + comparator
    export-format.ts   # import/export text format, shared with the Android app
    download-file.ts   # browser-side file download helper
    toast.service.ts   # snackbar-style notifications (undo delete, import/export status)
  features/
    auth/          # sign in, sign up, forgot/reset password
    note-editor/    # read-only view, write/preview editor, formatting toolbar
    notes-list/     # home screen — search, sort, grid/list toggle, import/export menu
    about/          # app info screen
  shared/
    icon/            # hand-drawn inline-SVG icon set used throughout the app
    toast/           # toast/snackbar host component
    confirm-dialog/  # reusable confirm/cancel modal (discard changes, etc.)
```

## Getting started

```bash
npm install
```

Copy your Supabase project URL and anon key into `src/environments/environment.ts`, then:

```bash
npm run dev
```

In your Supabase dashboard, add your local dev URL (e.g. `http://localhost:4200`) and your
deployed URL under **Auth → URL Configuration** — sign-up confirmation and password-reset emails
need those redirect URLs to work.

## Deploying

Pushes to `main` deploy automatically via GitHub Actions. Add `SUPABASE_URL` and
`SUPABASE_ANON_KEY` as repo secrets first — they're injected at build time so real credentials
never get committed.

## What's not here yet

This now covers essentially the full Android feature set — editor, offline sync, auth, search/sort/grid,
import/export, read-only view — end-to-end. The remaining gaps are deliberate rather than missing work:
no swipe-to-delete gesture (the list's delete icon covers that on both touch and mouse), and no
multi-device conflict resolution beyond last-write-wins.

## Origin

Lichen started as an Android app (Kotlin, Jetpack Compose) — a notes app I actually use daily.
This web version exists to prove the same product idea translates cleanly to a different stack,
sharing the same backend rather than starting from scratch.
