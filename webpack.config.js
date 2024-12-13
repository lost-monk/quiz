const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx", // Entry point for the app
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js", // Output file for bundled JavaScript
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"], // File extensions to resolve
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader", // Use ts-loader to transpile TypeScript files
        exclude: /node_modules/,
      },
      // Handle CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /sqlite\.worker\.js$/, // Handle worker files (sqlite.worker.js)
        use: { loader: 'worker-loader' },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"), // Serve static files from 'public' folder
    },
    port: 3000, // Port to run the development server
    hot: true, // Enable Hot Module Replacement (HMR)
    open: true, // Open the browser automatically when the server starts
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", // HTML template to inject the JS bundle
    }),
  ],
  devtool: "source-map", // Source maps for debugging
};
