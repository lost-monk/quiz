# quiz
Hosting a quiz website using SQLite and `sql.js-httpvfs`.

## Quick start (development)

These instructions assume you have Node.js and npm or yarn installed.

1. Install dependencies

```bash
npm install
# or
yarn install
```

2. Copy runtime assets into `public/` (required so the dev server can serve the web worker and wasm file)

```bash
cp node_modules/sql.js-httpvfs/dist/sqlite.worker.js public/
cp node_modules/sql.js-httpvfs/dist/sql-wasm.wasm public/
```

3. Ensure the SQLite database file is available in `public/` (dev mode expects `/example.sqlite3`)

If you have an `example.sqlite3` in the repository build/public folder already, you're good. Otherwise copy it into `public/`:

```bash
# If you have a prepared DB elsewhere
cp path/to/example.sqlite3 public/
```

4. Start the dev server

```bash
npm start
# or
yarn start
```

5. Open the app in your browser (usually `http://localhost:3000/`) and open DevTools → Console and Network for debugging.

## Build for production

```bash
npm run build
# or
yarn build
```

Serve the contents of `build/` with a static server.

## Notes & troubleshooting

- The project uses `sql.js-httpvfs` which loads a web worker and a wasm binary at runtime. The dev server does not automatically serve files from `node_modules`, so we copy `sqlite.worker.js` and `sql-wasm.wasm` into `public/` (step 2). Alternatively you can host those files on a CDN and update `src/sqliteHelper.ts` to point to the CDN URLs.
- Dev mode expects the DB at `/example.sqlite3`. If the categories/questions do not load, check DevTools → Network for requests to:
	- `/sqlite.worker.js`
	- `/sql-wasm.wasm`
	- `/example.sqlite3`

	All three should return HTTP 200. If you see 404, copy the missing file into `public/`.
- If the worker initialization hangs, you can add a timeout wrapper around `createDbWorker` to surface a clear error. See `src/sqliteHelper.ts` for current debug logs that print the query being executed and worker initialization steps.

## Files of interest

- `src/sqliteHelper.ts` — initializes `sql.js-httpvfs` and provides `queryDatabase(query)` helper.
- `src/App.tsx` — React UI that calls `queryDatabase("SELECT * FROM categories")` on mount and renders the quiz UI.
- `sqlite.schema` — SQL schema and sample data used to create `example.sqlite3`.

If you want, I can also add an npm script to copy the `dist` files into `public/` automatically (e.g. `postinstall` or a `prepare-assets` script). Would you like me to add that? 
