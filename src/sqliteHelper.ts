import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL("sql.js-httpvfs/dist/sqlite.worker.js", import.meta.url);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

export async function queryDatabase(query: string): Promise<any> {
  const worker = await createDbWorker(
    [
      {
        from: "inline", // Load the database from a URL
        config: {
          serverMode: "full", // Full server mode for complex queries
          url: "/example.sqlite3", // URL to the SQLite database (public folder)
          requestChunkSize: 4096, // Chunk size to manage memory usage
        },
      },
    ],
    workerUrl.toString(),
    wasmUrl.toString()
  );

  // Query the database and return the result
  const result = await worker.db.query(query);
  return result;
}
