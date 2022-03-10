const path = require('path');
const fs = require('fs');
const axios = require('axios');

const FILENAME = '.iconfont.js';

module.exports = class IconfontPlugin {
  constructor(options) {
    this.options = options;
    this.name = this.constructor.name;
    this.loading = false;
  }
  apply(compiler) {
    const { context } = compiler;
    const iconfontFilePath = path.resolve(context, FILENAME);
    if (fs.existsSync(iconfontFilePath)) {
      const iconfont = require(iconfontFilePath);
      if (!iconfont.url) {
        throw new Error(`.iconfont.js文件未提供url字段`);
      }

      compiler.hooks.compilation.tap(this.name, (compilation) => {
        const HtmlWebpackPlugin = (compiler.options.plugins || []).find(
          (plugin) => plugin.constructor.name === "HtmlWebpackPlugin"
        );
        if (HtmlWebpackPlugin) {
          const hook = HtmlWebpackPlugin.constructor.getHooks(compilation).afterTemplateExecution;
          hook.tapAsync(
            this.name,
            (data, callback) => {
              const { mode, output } = compilation.options;
              const { publicPath } = output;
              const { url } = iconfont;
              // 开发模式直接用线上地址
              if (mode === 'development') {
                data.html = data.html.replace('</head>', `<link href="${url}" rel="stylesheet">\n</head>`);
                callback()
              } else {
                // 生产模式需要下载字体文件
                const iconfontFileUrl = `${publicPath}${!publicPath.endsWith('/') ? '/' : ''}static/font/iconfont.css`
                // ssr会执行两次
                if (!this.loading) {
                  this.loading = true;
                  console.log('正在下载字体文件')
                  const outputPath = compilation.outputOptions.path;
                  this.FONT_DIR = path.resolve(outputPath, './static/font')
                  this.mkdirsSync(this.FONT_DIR)
                  this.request(url).then(() => {
                    
                    data.html = data.html.replace('</head>', `<link href="${iconfontFileUrl}" rel="stylesheet">\n</head>`);
                    console.log('插入字体完成')
                    callback()
                  })
                } else {
                  data.html = data.html.replace('</head>', `<link href="${iconfontFileUrl}" rel="stylesheet">\n</head>`);
                  callback()
                }
              }
            }
          );
        }
      });
    }

  }
  request(url) {
    return new Promise((resolve, reject) => {
      const regString = (s) => {
        const reg = /url\s*\(('\s*[A-Za-z0-9\-\_\.\/\:]+\s*)?/gi
        s = s.match(reg)
        return s
      }

      axios.get(url).then(rs => {
        const { data } = rs;
        const urlArr = Array.from(new Set(regString(data)));

        // 替换掉前面的字符提取出最终的pure url, 多线程request到本地
        const loop = []
        urlArr.forEach((item) => {
          item = item.replace("url('", 'http:')
          const suffix = item.substring(item.lastIndexOf('.') + 1)
          loop.push(this.load(item, `iconfont.${suffix}`))
        })

        const fontname = /.*?com\/t\/(.*)/.exec(urlArr[0])[1].split('.')[0]
        const body = data
          .replace(fontname, 'iconfont')
          .replace(/\/\/at.alicdn.com\/t/gi, '.');
        // 最后写入字体目录
        fs.writeFileSync(path.resolve(this.FONT_DIR, 'iconfont.css'), body)
        Promise.all(loop).then(() => {
          resolve();
        })
      })
    })
  }
  mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true
    } else if (this.mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
  load(url, filename) {
    return axios(url, { responseType: 'stream' }).then(res => {
      res.data.pipe(fs.createWriteStream(
        filename ? path.resolve(this.FONT_DIR, filename) : ''
      ))
    })
  }
};