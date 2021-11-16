const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = class MyPlugins {
  constructor(options) {
    this.options = options;
    this.name = this.constructor.name;
  }
  apply(compiler) {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
          this.name,
          (data, callback) => {
            const { mode, output, name } = compilation.options;
            const { publicPath, path } = output;
            console.log(mode, name, publicPath);
            console.log(path);
            console.log(data.outputName)
            data.html = data.html.replace('</head>', '<link href="./fake.css" rel="stylesheet">\n</head>')
            callback()
          }
        );

    });

  }
};
