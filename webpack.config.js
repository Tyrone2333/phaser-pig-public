var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
// var BrowserSyncPlugin = require('browser-sync-webpack-plugin')
// var CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PROJECT_PATH = process.cwd(); // 项目目录

var definePlugin = new webpack.DefinePlugin({
    // 'process.env': config.dev.env
    'process.env': JSON.stringify({
        NODE_ENV: 'development',
        BASE_URL: 'http://localhost:8800/pigApi',
    }),

    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
    WEBGL_RENDERER: true, // I did this to make webpack work, but I'm not really sure it should always be true
    CANVAS_RENDERER: true // I did this to make webpack work, but I'm not really sure it should always be true
})

module.exports = function (env, argv) {
    return {
        entry: {
            app: [
                path.resolve(__dirname, 'src/index.js')
            ],
            // vendor: ['phaser']
            // vendor: [
            //     path.resolve(__dirname, 'src/index-lib.js')
            // ]
        },
        devtool: 'cheap-source-map',
        output: {
            pathinfo: true,
            // path: path.resolve(__dirname, 'dev'),
            publicPath: '/',
            library: '[name]',
            libraryTarget: 'umd',
            filename: '[name].js'
        },
        watch: true,
        plugins: [
            definePlugin,
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './src/index.html',
                chunks: ['vendor', 'app'],
                chunksSortMode: 'manual',
                minify: {
                    removeAttributeQuotes: false,
                    collapseWhitespace: false,
                    html5: false,
                    minifyCSS: false,
                    minifyJS: false,
                    minifyURLs: false,
                    removeComments: false,
                    removeEmptyAttributes: false
                },
                hash: false
            }),
            // 从webpack v4开始，extract-text-webpack-plugin 不应该用于 css,请改用 mini-css-extract-plugin。
            new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: '[name].css',
                chunkFilename: '[id].css',
            }),
            // new BrowserSyncPlugin({
            //     host: process.env.IP || 'localhost',
            //     port: process.env.PORT || 3000,
            //     server: {
            //         baseDir: ['./', './dev']
            //     },
            //     open:false
            // })
        ],
        module: {
            rules: [
                {
                    // test 表示测试什么文件类型
                    test: /\.css$/,
                    // 使用 'style-loader','css-loader'
                    // use: ['style-loader', 'css-loader']
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
                    /**
                     * 这个 url-loader 并没有打包上图片,因为入口在 index.js,html 没有进去,目前只能把小图以 require 的形式转为 base64
                     * <img class="qrcode" src=" ${ require('../resource/image/qrcode.png') } " alt="">
                     */
                    // test: /\.(png|jpg|gif|svg)$/,
                    test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                    include: [path.join(PROJECT_PATH, './src/'), path.join(PROJECT_PATH, './resource/')],
                    // exclude: [config.VENDORS_PATH],
                    use: [{
                        // 图片文件小于8k时编译成dataUrl直接嵌入页面，超过8k回退使用file-loader
                        loader: 'url-loader',
                        options: {
                            limit: 19 * 1024,
                            name: './img/[name].[ext]', // 回退使用file-loader时的名称
                            fallback: 'file-loader', // 当超过8192byte时，会回退使用file-loader
                        }
                    }]
                },
                {test: /\.js$/, use: ['babel-loader'], include: path.join(__dirname, 'src')},
                // {test: /phaser-split\.js$/, use: ['expose-loader?Phaser']},
                // {test: [/\.vert$/, /\.frag$/], use: 'raw-loader'}
            ]
        },
        devServer: {
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,
            port: 3000,
            host: '0.0.0.0',
            // disableHostcheck: true,
            // proxy: {
            //     '/test/*': {
            //         target: 'http://localhost',
            //         changeOrigin: true,
            //         secure: false
            //     }
            // }
        },

        /* node: {
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