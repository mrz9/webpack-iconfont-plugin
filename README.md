# webpack-iconfont-plugin

webpack下载iconfont插件，`development`模式下，自动在页面插入`iconfont.css`；`production`模式下会自动下载字体文件到本地`static`目录，并插入`iconfont.css`到页面。

> 原则上兼容所有webpack项目，依赖`html-webpack-plugin`

## 使用说明
1. 更目录创建`.iconfont.js`文件
```javascript
// .iconfont.js
module.exports = {
    url: 'http://at.alicdn.com/t/font_2515947_yfrfaz71e5a.css'
}
```
2. 安装插件
```
  npm i -D webpack-iconfont-plugin
```
3. 修改配置文件，以`nuxt.config.js`为例
```javascript
// nuxt.config.js
const IconfontPlugin = require('webpack-iconfont-plugin')

export default {
  build: {
    plugins: [new IconfontPlugin()]
  }
}
```