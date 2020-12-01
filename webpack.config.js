const webpack = require("webpack");

module.exports = {
  entry: "./src/index.jsx",
  output: {
    filename: "dist/bundle.js",
    library: "react-pdf-module",
    libraryTarget: "commonjs2",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["es2015", "react", "stage-0"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: false,
    }),
  ],
};
