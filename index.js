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

// const Generator = require('./lib/Generator');
// const npminstall = require('npminstall');

/* 
 * 控制台打印logo
*/
console.log(
    figlet.textSync('Hi,wwei', {
        font: 'Dr Pepper',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    })
)
/*
 * 脚手架命令
*/
let project_default = 'my-project';
program
    .version(version)
    .command('create <project-name>')
    .description('create a new project')
    .action(name => {
        // 打印命令行输入的值
        project_default = name;
        console.log("project name is " + name)
    })
    .option('-d, --debug', '-d 命令说明');

program.parse(process.argv);

const options = program.opts();
if (options.debug) {
    console.log('debug:', options.debug);
    return
};

inquirer.prompt([
    {
        type: 'input', //type： input, number, confirm, list, checkbox ... 
        name: 'name', // key 名
        message: '项目命名：', // 提示信息
        default: project_default// 默认值
    }
]).then(async answers => {
    const project_name = answers.name;    //项目名称

    // 模版文件目录
    const destUrl = path.join(__dirname, 'template');
    // 生成文件目录
    // process.cwd() 对应控制台所在目录
    const cwd = process.cwd();
    const project_file = path.join(cwd, project_name); // 获取项目文件夹路径
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
    fs.copy(destUrl, project_file)
        .then(() => {
            console.log('success!')
            // npminstall({
            //     root: project_file,
            // });
        })
        .catch(err => console.error(err))
})


