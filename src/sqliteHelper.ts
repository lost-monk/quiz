import { createDbWorker } from "sql.js-httpvfs";
// 1. Get environment variables the "Vite Way"
const IS_PROD = import.meta.env.PROD;
// Vite uses BASE_URL to handle your "public" path (e.g., "/quiz/")
const BASE = import.meta.env.BASE_URL;

// 2. Resolve Worker and WASM URLs
// In Vite, creating a new URL like this tells the build tool to 
// track the file and provide a stable path.
const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url
);
const wasmUrl = new URL(
  "sql.js-httpvfs/dist/sql-wasm.wasm",
  import.meta.url
);

let workerPromise: ReturnType<typeof createDbWorker> | null = null;
let dbUrl: string;
if (IS_PROD) {
  console.log("[sqliteHelper] Using PRODUCTION DB URL (Raw GitHub)");
  dbUrl = "https://raw.githubusercontent.com/lost-monk/quiz/gh-pages/example.db-data";
} else {
  console.log("[sqliteHelper] Using DEVELOPMENT DB URL (Local Server)");
  // If your db file is in /public/example.db-data, this will resolve correctly
  dbUrl = `${BASE}example.db-data`;
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
