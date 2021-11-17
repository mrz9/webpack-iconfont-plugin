// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const ora = require('ora');

module.exports = class MrzPlugin {
  constructor(options) {
    this.options = options;
    this.name = this.constructor.name;
    this.loading = false;
  }
  apply(compiler) {
    const { options } = compiler;
    // console.log(options.plugins)
    // console.log(options.plugins.HtmlWebpackPlugin)
    compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
      const HtmlWebpackPlugin = (compiler.options.plugins || []).find(
        (plugin) => plugin.constructor.name === "HtmlWebpackPlugin"
      );
      if (HtmlWebpackPlugin) {
          console.log("HtmlWebpackPlugin", HtmlWebpackPlugin);
          const hooks = HtmlWebpackPlugin.constructor.getHooks(compilation);
          Object.keys(hooks).forEach((hook) => {
            console.log("hook ", hook);
            hooks[hook].tapAsync(this.name, (data, cb) => {
              console.log("in ", hook, typeof cb);
              typeof cb === "function" && cb();
            });
          });
      }
    });
    // compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
    //   HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(
    //     this.name,
    //     (data, callback) => {
    //       console.log('loading', this.loading)
    //       const { mode, output, name } = compilation.options;
    //       const { publicPath, path } = output;
    //       console.log(mode, name, publicPath);
    //       console.log(path);
    //       console.log(data.outputName)
    //       console.log(data.headTags)
    //       data.html = data.html.replace('</head>', '<link href="./fake.css" rel="stylesheet">\n</head>')
    //       if (mode === 'production' && !this.loading) {
    //         this.loading = true;
    //         const spinner = ora('Loading unicorns').start();
    //         setTimeout(() => {
    //           spinner.color = 'yellow';
    //           spinner.text = 'Loading rainbows';
    //           setTimeout(() => {
    //             spinner.succeed('done!')
    //             callback()
    //           }, 2000)
    //         }, 2000)
    //       } else {
    //         callback()
    //       }
    //     }
    //   );

    // });
  }
};
