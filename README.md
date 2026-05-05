# Modulplan-Generator

A browser-based course schedule generator for BAMF Berufssprachkurse (BSK).
Generates a professional Word (.docx) document with the full course timetable.

## Features

- Select up to 2 weekdays per week
- Set individual time slots per day
- German national holidays pre-selected, local holidays optional
- Module sequence: 36 active days → 18 modules (2 days each)
  - Day 1 of course: `Modul 1` (no Einzelcoaching)
  - All other days: `Modul X & Einzelcoaching`
  - Cancelled days are skipped — sequence never breaks
- Editable module names, persisted in localStorage
- One-click `.docx` download

## Project structure

```
modulplan-generator/
├── index.html                  # Single-page app shell
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                 # Bootstrap & tab navigation
│   ├── state.js                # Central app state
│   ├── schedule.js             # Core schedule logic & topic sequence
│   ├── holidays.js             # German national & local holidays
│   ├── modules.js              # Module name persistence (localStorage)
│   ├── utils.js                # Shared date helpers
│   ├── ui/
│   │   ├── setup.js            # Kursdetails tab
│   │   ├── moduleEditor.js     # Module & Themen tab
│   │   └── preview.js          # Vorschau tab
│   ├── docx/
│   │   └── generator.js        # Word document builder (docx-js)
│   └── styles/
│       └── main.css
```

## Getting started

```bash
npm install
npm run dev       # Development server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Usage

1. **Kursdetails** — enter course name, description, weekdays, times and start date
2. **Module & Themen** — edit module names (auto-saved to browser storage)
3. **Vorschau** — review the full schedule, then click **Dokument erstellen** to download the `.docx`

## Tech stack

- Vanilla JS (ES modules) + [Vite](https://vitejs.dev/)
- [docx](https://docx.js.org/) for Word document generation
- No UI framework — lightweight by design
