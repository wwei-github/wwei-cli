const { join, resolve } = require('path');

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
    mode: "production",
    output: {
        assetModuleFilename: "images/[name].[contenthash:5].bundle[ext]",
        filename: "scripts/[name].[contenthash:5].bundle.js",
        publicPath: '/assets'
        // publicPath:'xxx.com/'  // 配置静态文件的访问地址
    },
    optimization: {
        minimizer: [
            new CssMinimizerPlugin(),
        ],
        runtimeChunk: {
            name: 'runtime'
        },
        splitChunks: {
            chunks: 'async',
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests:3,
            name:false,
            minSize: {
                javascript: 100000,
                style: 100000,
            }
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "配置名字",
            filename: "index.html",
            template: resolve(__dirname, "../src/index.prod.html"),
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
            }
        })
    ]
}