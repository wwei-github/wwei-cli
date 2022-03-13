#! /usr/bin/env node

// #! 符号的名称叫 Shebang，用于指定脚本的解释程序
// Node CLI 应用入口文件必须要有这样的文件头
// 如果是Linux 或者 macOS 系统下还需要修改此文件的读写权限为 755
// 具体就是通过 chmod 755 cli.js 实现修改

const { version } = require('./package.json');
const inquirer = require('inquirer');    //在node提示框中输入信息
const path = require('path')
const ejs = require('ejs')
const { program } = require('commander');
const fs = require('fs-extra');   // fs的扩展，支持promise
const figlet = require('figlet');
const Spinnies = require('spinnies');
const configList = require('./fileConfig/configData');
const { npmRun, checkYarnVersion } = require('./utils')
const colors = require('colors');

const spinner = { interval: 160, frames: ['🍇', '🍈', '🍉', '🍋', '🚀', '🤔', '🐮'] }
const spinnie = new Spinnies({ spinner });
/* 
 * 控制台打印logo
*/
console.log(
    colors.rainbow(
        figlet.textSync('Hi,wwei', {
            font: 'Dr Pepper',
            horizontalLayout: 'default',
            verticalLayout: 'default',
            width: 80,
            whitespaceBreak: true
        })
    )
) 

/*
 * 脚手架命令
*/
program
    .version(version)
    .command('create <project-name>')
    .description('create a new project')
    .action(name => {
        // 打印命令行输入的值
        configList[0].default = name;
    })
    .option('-d, --debug', '-d 命令说明');

program.parse(process.argv);

const options = program.opts();
if (options.debug) {
    console.log('debug:', options.debug);
    return
};
try {
    inquirer.prompt(configList).then(async answers => {

        const usePackType = answers.usePackType

        const project_name = answers.name;    //项目名称


        const catalogueConfig = path.join(__dirname, 'template/template_React');  // 模版文件目录
        const cwd = process.cwd();  // process.cwd() 对应控制台所在目录
        const project_file = path.join(cwd, project_name); // 获取项目文件夹路径

        if (usePackType === 'yarn' && !checkYarnVersion(usePackType, project_file, ['--version'])) {
            console.log("请检查yarn是否安装！".underline.bgBrightRed)
            process.exit(1);
        }

        // 安装方式
        const installType = usePackType === 'yarn' ? 'add' : 'install';


        // 判断是否已经创建过同名的项目文件夹
        if (fs.existsSync(project_file)) {
            await inquirer.prompt([
                {
                    type: "confirm",
                    name: "IsRemove",
                    message: "是否删除重复的文件夹？",
                    default: "Y"
                }
            ]).then(async res => {
                if (res.IsRemove) {
                    await fs.remove(project_file);
                }
            })
        }

        // 先配置目录结构
        spinnie.add('catalogueConfig', { text: '创建目录结构ing...' });
        fs.copySync(catalogueConfig, project_file);
        spinnie.succeed('catalogueConfig', { text: '创建目录结构成功!' });


        npmRun(usePackType, project_file,
            ['init', '-y'],
            {
                start: 'npm初始化ing...',
                end: 'npm init end...',
            })

        if (answers.useFrame === 'react') {
            npmRun(usePackType, project_file,
                [installType, 'react', 'react-dom', 'react-router-dom', 'recoil'],
                {
                    start: 'React初始化ing...',
                    end: 'React安装完成...',
                });
        }

        if (answers.usePack === 'webpack') {
            npmRun(usePackType, project_file,
                [installType, 'webpack', 'webpack-cli', 'webpack-dev-server',
                    'webpack-merge', 'scripty', 'mini-css-extract-plugin', 'html-webpack-plugin',
                    'clean-webpack-plugin', 'yargs-parser', 'css-loader', 'postcss-loader', '-D'],
                {
                    start: 'webpack初始化ing...',
                    end: 'webpack安装完成...',
                });

            // 将script脚本放到相应的位置
            const clientFile = path.join(__dirname, 'template/scripts/client');
            const clientFileTo = path.join(project_file, 'scripts/client');
            fs.copySync(clientFile, clientFileTo);

            const packageFile = path.join(project_file, 'package.json');
            const packageObj = fs.readJsonSync(packageFile);
            packageObj.scripts = {
                "client:dev": "scripty",
                "client:prod": "scripty",
                "client:server": "scripty"
            }
            // 向package写入命令行
            fs.writeJsonSync(packageFile, packageObj)


            // 将webpack放到相应的位置
            const webpackFile = path.join(__dirname, 'template/webpack');
            const webpackFileTo = path.join(project_file, 'config');
            fs.copySync(webpackFile, webpackFileTo);

            const webpackConfig = path.join(webpackFileTo, 'webpack.config.js');
            const webpackConfigTo = path.join(project_file, 'webpack.config.js');
            fs.moveSync(webpackConfig, webpackConfigTo); // 将webpack.config.js 文件移动到根目录下


        }

        if (answers.useLanguage === 'ts') {
            npmRun(usePackType, project_file,
                [installType, 'typescript',],
                {
                    start: 'TypeScript初始化ing...',
                    end: 'TypeScript安装完成...',
                });
            // 将TypeSctipt配置放到相应的位置
            const tsFile = path.join(__dirname, 'template/typescript');
            fs.copySync(tsFile, project_file);
        }

        if (answers.useCompile === 'babel') {
            npmRun(usePackType, project_file,
                [installType, '@babel/core', '@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript',
                    'babel-loader'],
                {
                    start: 'babel初始化ing...',
                    end: 'babel安装完成...',
                });
            // 将TypeSctipt配置放到相应的位置
            const tsFile = path.join(__dirname, 'template/babel');
            fs.copySync(tsFile, project_file);
        }

        npmRun(usePackType, project_file, [installType, '@soda/friendly-errors-webpack-plugin', '--save-dev'], {
            start: '其他依赖安装ing...',
            end: '其他依赖安装完成...',
        });

    })
} catch (err) {
    console.log(`error:${err}`.red);
    process.exit(1);
}




