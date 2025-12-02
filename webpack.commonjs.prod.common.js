const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ASSET_PATH = process.env.ASSET_PATH || './';

module.exports = function (webpackConfig = {}) {
  return {
    mode: 'production',
    optimization: {
      minimize: false
    },
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: '[name].js',
      chunkFilename: '[id].js',
      libraryTarget: 'commonjs2',
      // libraryExport: 'default',
      publicPath: ASSET_PATH
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/'),
      }
    },
    target: 'web',
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        // 解析图片(css中包含图片)
        {
          test: /\.(png|jpg|gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
              },
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    // 转换为ES5语法
                    targets: {
                      ie: '10'
                    },
                    // 将ES6模块转换为其他模块类型
                    // modules: 'umd',
                    // modules: 'commonjs', // 改为 commonjs2
                    // 按需添加polyfill
                    useBuiltIns: 'usage',
                    corejs: 3
                  }
                ]
              ],
              plugins: [
                // 转换async/await
                '@babel/plugin-transform-runtime',
                // 确保转换所有现代语法
                // '@babel/plugin-transform-arrow-functions',
                // '@babel/plugin-transform-block-scoping'
              ]
            }
          }
        },
        {
          test: /\.scss$/,           // 匹配.scss结尾的文件
          use: [
            MiniCssExtractPlugin.loader,
            // 'style-loader',           // 将CSS注入DOM
            'css-loader',             // 转换CSS为CommonJS模块
            'sass-loader'             // 编译SCSS为CSS
          ]
        },
        // 解析css
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        }
      ]
    },
    ...webpackConfig,
    plugins: [
      new VueLoaderPlugin(),
      new UglifyJsPlugin({
        parallel: true,
        uglifyOptions: {
          compress: {
            // 移除console语句
            drop_console: true,
          }
        }
      }),
      ...(webpackConfig.plugins || []),
    ]
  }
}
