var path = require('path')
var webpack = require('webpack')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const PROJECT_PATH = process.cwd(); // 项目目录


// Phaser webpack config
// var phaserModule = path.join(__dirname, '/node_modules/phaser/')
// var phaser = path.join(phaserModule, 'src/phaser.js')

var definePlugin = new webpack.DefinePlugin({
    'process.env': JSON.stringify({
        NODE_ENV: 'production',
        BASE_URL: 'http://undefined.ga:8800/pigApi',
    }),
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
  WEBGL_RENDERER: true, // I did this to make webpack work, but I'm not really sure it should always be true
  CANVAS_RENDERER: true // I did this to make webpack work, but I'm not really sure it should always be true
})

module.exports = function () {
    return {
        entry: {
            app: [
                path.resolve(__dirname, 'src/index.js')
            ],
            //vendor: ['pixi']

        },
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: './',
            filename: 'js/bundle.js'
        },
        plugins: [
            definePlugin,
            new CleanWebpackPlugin(['build']),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            /*new webpack.optimize.UglifyJsPlugin({
              drop_console: true,
              minimize: true,
              output: {
                comments: false
              }
            }),*/
            //new webpack.optimize.CommonsChunkPlugin({ name: 'vendor' /* chunkName= */, filename: 'js/vendor.bundle.js' /* filename= */ }),
            new HtmlWebpackPlugin({
                filename: 'index.html', // path.resolve(__dirname, 'build', 'index.html'),
                template: './src/index.html',
                chunks: ['vendor', 'app'],
                chunksSortMode: 'manual',
                minify: {
                    removeAttributeQuotes: true,
                    collapseWhitespace: true,
                    html5: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: true,
                    removeComments: true,
                    removeEmptyAttributes: true
                },
                hash: true
            }),
            new CopyWebpackPlugin([
                // { from: 'assets', to: 'assets' },
                // { from: 'resource', to: 'resource' }
            ]),
            // 不需要在文件名加 hash,HtmlWebpackPlugin 已经会在引入文件的后面加 hash
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: '[name].css',
                chunkFilename: '[id].css',
            }),

        ],
        module: {
            rules: [
                {
                    // test 表示测试什么文件类型
                    test:/\.css$/,
                    // 使用 'style-loader','css-loader'
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader"
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader' // translates CSS into CommonJS
                        }, {
                            loader: 'less-loader' // compiles Less to CSS
                        }]
                },
                {
                    test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                    include: [ path.join(PROJECT_PATH, './src/'),path.join(PROJECT_PATH, './resource/') ],
                    // exclude: [config.VENDORS_PATH],
                    use: [{ // 图片文件小于8k时编译成dataUrl直接嵌入页面，超过8k回退使用file-loader
                        loader: 'url-loader',
                        options: {
                            limit: 19*1024, // 8k
                            name: './img/[name].[ext]', // 回退使用file-loader时的名称
                            fallback: 'file-loader', // 当超过8192byte时，会回退使用file-loader
                        }
                    }]
                },
                { test: /\.js$/, use: ['babel-loader'], include: path.join(__dirname, 'src') },
                // { test: /phaser-split\.js$/, use: 'raw-loader' },
                // { test: [/\.vert$/, /\.frag$/], use: 'raw-loader' }
            ]
        },
        optimization: {
            minimize: true
        }
        /*node: {
          fs: 'empty',
          net: 'empty',
          tls: 'empty'
        },
        resolve: {
          alias: {
            'phaser': phaser,

          }
        }*/
    }
}
