const { join, resolve } = require('path');

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode:"development",
    output:{
        assetModuleFilename:"images/[name][ext]",
        filename:"scripts/[name],bundle.js"
    },
    devServer: {
        static:{
            directory: join(__dirname,"../dist"),
        },
        historyApiFallback: true,
        port:8000,
        // quiet:true,   // 配合 friendly-error-webpack-plugin 
    },
    devtool: "source-map",
    plugins:[
        new HtmlWebpackPlugin({
            title:"配置名字",
            filename:"index.html",
            template:resolve(__dirname,"../src/index.dev.html"),
        })
    ]
}