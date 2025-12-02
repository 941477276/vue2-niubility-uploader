const fs = require('fs');
const path = require('path');
const packageJson = require(`./package.json`);

fs.writeFileSync(path.resolve(__dirname, './src/version.js'), `
  // 该文件由 vue.config.js 自动生成，请勿手动修改；
  export const version = "${packageJson.version}";
`, 'utf-8');

module.exports = {
  publicPath: './',
}
