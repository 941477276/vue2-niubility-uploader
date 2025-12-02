const fs = require('fs');
const path = require('path');
const getWebpackConfig = require('./webpack.commonjs.prod.common');

const baseDir =  path.resolve(__dirname, './src/components/uploader');
const localeDirPath = path.join(baseDir, './locale');
const localeEntries =  {};
fs.readdirSync(localeDirPath)
  .forEach((fileName) => {
    const fullPath = path.join(localeDirPath, fileName);
    const parsedFilename = path.parse(fileName);
    let entryKeyBase = '/locale';
    if (fs.statSync(fullPath).isDirectory()) {
      entryKeyBase += '/' + fileName;
      fs.readdirSync(fullPath).forEach((childFileName) => {
        const parsedChildFilename = path.parse(childFileName);
        localeEntries[entryKeyBase + '/' + parsedChildFilename.name] = path.resolve(fullPath, `./${childFileName}`);
      });
    } else {
      localeEntries[entryKeyBase + '/' + parsedFilename.name] = fullPath;
    }
  });
console.log('localeEntries', localeEntries);

module.exports = getWebpackConfig({
  entry: localeEntries,
  externals: [
    {
      deepmerge: 'deepmerge',
      vue: 'vue',
    },
    function (context, request, callback) {
      // 语言文件及/local/index.js不打包进文件中
      if ((request.startsWith('./index') || request.startsWith('./lang')) && context.endsWith('locale')) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ],
});
