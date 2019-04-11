const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = env => {
  const config = require('./webpack.base.config');
  const appendProduction = () => {
    config.optimization = {
      // production模式下自动开启
      minimize: true,
      minimizer: [
        new UglifyJsPlugin({
          test: /\.js($|\?)/i,
          // 是否启用缓存
          cache: true,
          // 启用并行化
          parallel: true,
          uglifyOptions: {
            // 支持ie8
            ie8: false,
            // enable work around safari 10/11 bugs in loop scoping and await,
            // 在循环作用域内能绕过safari 10/11 bugs并等待
            safari10: true,
            // ecma版本
            ecma: 5,
            warnings: true,
            parse: {},
            compress: true,
            output: {
              comments: false,
              beautify: false,
            },
            mangle: {},
          },
        }),
      ],
      runtimeChunk: {
        // 返回运行时的chunk名称，可用来修改最后输出的chunk块的name
        name: entrypoint => `${entrypoint.name}`,
      },
      splitChunks: {
        chunks: 'all',
        minSize: 10,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        cacheGroups: {
          appvendors: {
            chunks: 'initial',
            // 设置split chunk的文件名称，只适用于chunks: "initial",其他情况报错
            filename: '[name].[chunkhash].bundle.js',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            name: 'appvendors',
          },
          default: false,
        },
      },
    }
    config.plugins = config.plugins.concat([
      // 生产环境
      // 因为chunks命名都是chunkhash相关，因此需要先清空dist
      new CleanWebpackPlugin(['build/'], {
        root: path.resolve(__dirname, '../')
      }),
    ])
  }
  // 通过变量来判断 什么模式
  if (env.NODE_ENV === 'development') {
    config.devServer = {
      contentBase: path.resolve(__dirname, '../'),
      host: "0.0.0.0",
      port: 9090,
      inline: true,
      historyApiFallback: true,
      watchOptions: {
        // if you're using Docker you may need this
        // aggregateTimeout: 300,
        // poll: 1000,
        ignored: /node_modules/,
      },
      proxy: {
        '/api': {
          target:'http://192.168.1.91:8082',
          secure: false,
          changeOrigin: true,
        },
        '/image.php': {

          target: 'http://192.168.1.91:8082',
          secure: false,
          changeOrigin: true,
        }
      },
    }
    config.devtool = "eval-source-map" //按原始代码打包，便于开发排错
  } else if (env.NODE_ENV === 'bundle') {
    appendProduction();
  } else if (env.NODE_ENV === 'production') {
    appendProduction();
  }
  return config
}
