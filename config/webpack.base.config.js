const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const {VueLoaderPlugin} = require('vue-loader')
const HtmlWebpackPliugin = require('html-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    app: './src/index.js',
    login: './src/login/index.js'
  },
  output: {
    filename: '[name].[chunkhash].bundle.js',
    chunkFilename: '[id].[chunkhash].chunk.js',
    path: path.resolve(__dirname, '../build/'),
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        // include: [path.resolve(__dirname, '../src/')],
        include: [path.resolve(__dirname, '../src'), path.resolve(__dirname, '../node_modules/kfb-view/'), path.resolve(__dirname, '../config')],
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true,
            removeComments: false,
            collapseWhitespace: false,
          },
        }],
        exclude: [path.resolve(__dirname, '../index.html'), path.resolve(__dirname, '../login.html')],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({root: loader.resourcePath}),
                require('autoprefixer')(),
              ],
            },
          },
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({root: loader.resourcePath}),
                require('autoprefixer')(),
              ],
            },
          },
          {
            loader: 'sass-loader',
            options: {outputStyle: 'compressed'},
          }
        ],
      }, //sass的配置
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          /* name: '[name].[hash:7].[ext]', */
          outputPath: 'assets/img',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          /* name: '[name].[hash:7].[ext]', */
          outputPath: 'assets/fonts',
        },
      },
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn|en-gb/),
    //加载vue-loader
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),
    new HtmlWebpackPliugin({
      filename: path.resolve(__dirname, '../build/login.html'),
      template: path.resolve(__dirname, '../login.html'),
      chunks: ['appvendors', 'login'],
      inject: 'body'
    }),
    new HtmlWebpackPliugin({
      filename: path.resolve(__dirname, '../build/index.html'),
      template: path.resolve(__dirname, '../index.html'),
      chunksSortMode: 'manual',
      chunks: ['appvendors', 'app'],
      inject: 'body'
    }),
    new HtmlWebpackPliugin({
      template: 'src/browser/index.html',
      filename: 'browser/index.html',
      inject: false,
    }),
  ],
  node: {
    net: 'empty',
  }
}
