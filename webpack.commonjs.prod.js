const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getWebpackConfig = require('./webpack.commonjs.prod.common');

/**
 * 打包commonjs格式的js
 */
module.exports = getWebpackConfig({
  entry: {
    index: path.resolve(__dirname, './src/components/uploader/FileUploader.vue')
  },
  externals: [
    {
      vue: 'vue',
      deepmerge: 'deepmerge'
    },
    function (context, request, callback) {
      /* if (request.startsWith('./') && context.endsWith('locale')) {
        return callback(null, 'commonjs ' + request);
      } */
      // localeMixin不打包进组件中，因为localeMixin中导入了语言文件
      if (request.endsWith('/locale/localeMixin')) {
        return callback(null, 'commonjs ' + './locale/localeMixin');
      }
      callback();
    }
  ],
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../lib/vue2-niubility-uploader.css', // 从 .js 文件中提取出来的 .css 文件的名称
    })
  ]
});
