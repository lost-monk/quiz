import { createDbWorker } from "sql.js-httpvfs";

// Serve the worker and wasm from `public/` so the dev server can load them.
// Files will be copied to `public/sqlite.worker.js` and `public/sql-wasm.wasm`.
// Use root-relative string paths so webpack doesn't try to bundle these files.
const workerUrl = '/sqlite.worker.js';
const wasmUrl = '/sql-wasm.wasm';
const dbUrl = process.env.NODE_ENV === "production"
  ? `${process.env.PUBLIC_URL}/example.sqlite3`
  : "/example.sqlite3";

export async function queryDatabase(query: string): Promise<any> {
  console.log("[sqliteHelper] queryDatabase called:", query, "dbUrl:", dbUrl);
  console.log("[sqliteHelper] initializing DB worker...", workerUrl.toString(), wasmUrl.toString());
  let worker: any;
  try {
    worker = await createDbWorker(
      [
        {
          from: "inline", // Load the database from a URL
          config: {
            serverMode: "full", // Full server mode for complex queries
            url: dbUrl, // URL to the SQLite database (public folder)
            requestChunkSize: 4096, // Chunk size to manage memory usage
          },
        },
      ],
      workerUrl.toString(),
      wasmUrl.toString()
    );
    console.log("[sqliteHelper] DB worker initialized");
  } catch (err) {
    console.error("[sqliteHelper] DB worker initialization failed:", err);
    throw err;
  }

  // Query the database and log the query + result for debugging, then return
  try {
    const result = await worker.db.query(query);
    console.log("[sqliteHelper] SQL Query:", query);
    console.log("[sqliteHelper] Result:", result);
    return result;
  } catch (err) {
    console.error("[sqliteHelper] Query error:", err, "-- query:", query);
    throw err;
  }
}
