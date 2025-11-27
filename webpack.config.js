const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/quiz/",   // IMPORTANT for GitHub Pages
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },

      // Allow `.sqlite3` to be copied if imported (not needed anymore)
      {
        test: /\.sqlite3$/,
        type: "asset/resource",
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",   // clean HTML, no script tags
      publicPath: "/quiz/",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/sqlite.worker.js", to: "" },
        { from: "public/sql-wasm.wasm", to: "" },
        { from: "public/example.sqlite3", to: "" }
      ]
  })
  ],

  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"),
    },
    port: 3000,
    hot: true,
    open: true,
  },

  devtool: "source-map",
};
