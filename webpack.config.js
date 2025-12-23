const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

var config = {
  context: path.resolve(__dirname, "src"),

  entry: {
    app: "./index.js",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "dist.js",
  },

  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: [path.resolve(__dirname, "node_modules/@browserai/browserai")],
        type: "javascript/esm",
        use: {
          loader: "babel-loader",
          options: {
            sourceType: "unambiguous",
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: ["@babel/plugin-syntax-dynamic-import"],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  resolve: {
    extensions: [".mjs", ".js", ".json"],
    fallback: {
      path: require.resolve("path-browserify"),
      url: require.resolve("url/"),
      fs: false,
    },
  },



  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "*.html", to: "" },
        { from: "css", to: "css" },
        { from: "js", to: "js" },
        { from: "icons", to: "icons" },
      ],
    }),

  ],

  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    open: true,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false, 
      },
    },
  },

  stats: {
    warnings: true,
  },
};

module.exports = config;
