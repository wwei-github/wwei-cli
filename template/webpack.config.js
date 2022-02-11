const merge = require('webpack-merge');
const { join, resolve } = require('path');   // resolve 解析路径  join 拼接路径
const argv = require('yargs-parser')(process.argv.slice(2));  // 获取命令中的参数,数组去掉前两个，将剩余的参数转为对象形式

const _mode = argv.mode || 'development';
const _modeFlag = _mode === "production";
const _mergeConfig = require(`./config/webpack.${_mode}.js`); // 获取生产或者开发环境下的配置文件

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// css 解析
const cssLoaders = [
    MiniCssExtractPlugin.loader,
    {
        loader: "css-loader",
        options: {
            // importLoader: 1,  // 处理@import("index.css")引入css
        }
    },
    {
        loader: "postcss-loader",
    }
];

const webpackBaseConfig = {
    entry: {
        app: resolve("./src/index.tsx"),
    },
    output: {
        path: join(__dirname, './dist/assets')
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                include: [resolve('./src')],
                exclude: /node_modules/,
                loader: "babel-loader",
            },
            {
                test: /\.(css|scss)$/,
                use: cssLoaders
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|webp)$/,
                type: "asset",
            }
        ]
    },
    resolve: {
        alias: {
            "@api": resolve("./src/api"),
            "@assets": resolve("./src/assets"),
            "@components": resolve("./src/components"),
            "@hooks": resolve("./src/hooks"),
            "@models": resolve("./src/models"),
            "@utils": resolve("./src/utils"),
            "@models": resolve("./src/models"),
            "@pages": resolve("./src/pages"),
            "@recoil": resolve("./src/recoil"),
            "@routes": resolve("./src/routes"),
        },
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: _modeFlag ? "styles/[name].[contenthash:5].css" : "styles/[name].css",
            chunkFilename: _modeFlag ? "styles/[id].[contenthash:5].css" : "styles/[id].css",
            ignoreOrder: true,
        })
    ]
}

module.exports = merge.default(webpackBaseConfig, _mergeConfig)