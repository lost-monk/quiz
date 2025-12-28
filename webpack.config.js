const path = require("path");
const webpack = require("webpack");
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
    new webpack.DefinePlugin({
      // This injects the variable into your app code.
      // It sets process.env.PUBLIC_URL to the string value "/quiz".
      "process.env.PUBLIC_URL": JSON.stringify("/quiz") 
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",   // clean HTML, no script tags
      publicPath: "/quiz/",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/sqlite.worker.js", to: "" },
        { from: "public/sql-wasm.wasm", to: "" },
        { from: "public/example.db-data", to: "" }
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
