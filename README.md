# Quiz — React + TypeScript + Vite

- A lightweight trivia/quiz app that reads question data from CSV/SQLite in `public/` and presents questions via the React UI in `src/`.

Try it out
- Live demo: [https://lost-monk.github.io/quiz/](https://lost-monk.github.io/quiz/)

Purpose
- A lightweight trivia/quiz app that reads question data from CSV/SQLite in `public/` and presents questions via the React UI in `src/`.
- A lightweight trivia/quiz app that reads question data from CSV/SQLite in `public/` and presents questions via the React UI in `src/`.

Quick start

Prerequisites:
- Node 18+ and npm (or pnpm/yarn)

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Build and preview production bundle:

```bash
npm run build
npm run preview
```

Additional packages

- Install packages used by the app:

```bash
npm install posthog-js react-datepicker sql.js-httpvfs
```

Common commands

```bash
npm run build
npm run dev
```

Project layout (key files)
- `src/` — React app source
- `src/components/` — UI components (quiz card, header, progress, share modal)
- `src/hooks/` — custom hooks (quiz logic, sharing, tracking)
- `src/sqliteHelper.ts` — SQLite helper used by the app
- `public/` — static assets and data files (`data.csv`, `trivia_3000.csv`, example sqlite files)
- `scripts/` — helper scripts (e.g. `import_questions.py` to import CSVs)

Data & scripts
- CSV files: `public/data.csv`, `public/trivia_3000.csv` — sample question datasets.
- Example SQLite files in `public/` are provided for demonstration. Use `scripts/import_questions.py` to convert or import CSVs into your own DB if needed.

Running utility scripts (Python)
```bash
python3 scripts/import_questions.py path/to/questions.csv
```

Notes
- The app entry is `src/main.tsx` / `src/index.tsx` depending on config.
- ESLint and TypeScript configs are present; consider enabling type-checked ESLint rules for production.

Troubleshooting
- If the dev server fails to start, ensure Node and package manager versions meet the prerequisites, then run `npm install` again.
- For data import problems, check Python version (3.8+) and that CSV columns match the expected schema used by `import_questions.py`.

Contributing
- Open an issue or submit a PR. Keep changes focused and add tests where applicable.

License
- This repo doesn't include an explicit license file. Add one if you plan to publish.

For details about specific files, see the `src/` folder and `scripts/` utilities.
