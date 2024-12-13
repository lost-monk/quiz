// import React, { useState, useEffect } from 'react';
// import ReactDOM from 'react-dom/client';

// // import * as SQL from 'sql.js';
// import * as Httpvfs from 'sql.js-httpvfs';

// const workerUrl = new URL('sql.js-httpvfs/dist/sqlite.worker.js', import.meta.url);
// const wasmUrl = new URL('sql.js-httpvfs/dist/sql-wasm.wasm', import.meta.url);

// function App() {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const worker = await Httpvfs.createDbWorker([
//         {
//           from: 'inline',
//           config: {
//             serverMode: 'full',
//             url: './example.sqlite3', // Replace with your database URL
//           },
//         },
//       ], workerUrl.toString(), wasmUrl.toString());
//       const db = await worker.init();
//       const stmt = db.prepare('SELECT * FROM mytable');
//       const result = stmt.all();
//       setData(result);
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h1>Data from SQLite Database</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Column1</th>
//             <th>Column2</th>
//             {/* Add more columns as needed */}
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row) => (
//             <tr key={row.id}>
//               <td>{row.column1}</td>
//               <td>{row.column2}</td>
//               {/* Add more columns as needed */}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);