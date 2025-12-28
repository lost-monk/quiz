import { createDbWorker } from "sql.js-httpvfs";
// Get the current environment mode (set by Webpack)
const ENV = process.env.NODE_ENV;

// GitHub Pages automatically sets PUBLIC_URL = "/quiz"
const base = process.env.PUBLIC_URL || "";

// Final URLs
const workerUrl = `${base}/sqlite.worker.js`;
const wasmUrl = `${base}/sql-wasm.wasm`;
let workerPromise: ReturnType<typeof createDbWorker> | null = null;
let dbUrl: string;
if (ENV === 'production') {
  // Production: Use the reliable, uncompressed Raw GitHub link
  console.log("[sqliteHelper] Using PRODUCTION DB URL (Raw GitHub)");
  dbUrl = "https://raw.githubusercontent.com/lost-monk/quiz/gh-pages/example.db-data";
} else {
  // Development: Use the local URL served by webpack-dev-server
  console.log("[sqliteHelper] Using DEVELOPMENT DB URL (Local Server)");
  dbUrl = `${base}/example.db-data`;
}

async function initWorker(): Promise<ReturnType<typeof createDbWorker>> {
  if (workerPromise) {
    return workerPromise; // This is a Promise<WorkerHttpvfs>
  }

  // Initialize the worker and store the promise
  const dbConfig: any = {

    serverMode: "full-no-cors", // Full server mode for complex queries
    url: dbUrl, // URL to the SQLite database (public folder)
    requestChunkSize: 4096, // Chunk size to manage memory usage
    contentLength: 24576, // Total size of the database file in bytes
    // This setting forces the worker to trust the config and ignore server checks.
    suppressRangeRequests: true,
    // Tell the library to ignore Content-Encoding headers
    suppressContentEncoding: true,
  };

  // Store the initialization promise
  workerPromise = createDbWorker(
    [
      {
        from: "inline",
        config: dbConfig,
      },
    ],
    workerUrl.toString(),
    wasmUrl.toString()
  );

  try {
    const worker = await workerPromise;
    console.log("[sqliteHelper] DB worker initialized successfully.");
    return worker;
  } catch (err) {
    workerPromise = null;
    console.error("[sqliteHelper] DB worker initialization failed:", err);
    throw err;
  }
}

export async function queryDatabase(query: string): Promise<any> {
  console.log("[sqliteHelper] queryDatabase called:", query, "dbUrl:", dbUrl);
  console.log("[sqliteHelper] initializing DB worker...", workerUrl.toString(), wasmUrl.toString());
  const worker = await initWorker();

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
