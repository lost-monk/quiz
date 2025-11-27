const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/quiz/"
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
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.sqlite3$/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  new CopyWebpackPlugin({
    patterns: [
      { from: path.resolve(__dirname, "public/sqlite.worker.js"), to: "" },
      { from: path.resolve(__dirname, "public/sql-wasm.wasm"), to: "" },
      { from: path.resolve(__dirname, "public/example.sqlite3"), to: "" },
    ],
  }),
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
