// lib/Generator.js
const { getRepoList, getTagList } = require('./http');
const path = require('path');
const inquirer = require('inquirer');
const util = require('util')
const downloadGitRepo = require('download-git-repo') // 不支持 Promise

class Generator {
    constructor(name, targetDir) {
        // 目录名称
        this.name = name;
        // 创建位置
        this.targetDir = targetDir;
        this.downloadGitRepo = util.promisify(downloadGitRepo);   // promise化处理
    }

    // 核心创建逻辑
    // 1.获取模版名字
    // 2.获取tag版本
    // 3.下载模版
    async create() {
        // 1）获取模板名称
        const repo = await this.getTemplateName();
        const tag = await this.getTemplateTag();
        await this.uploadTemplate(repo, tag);
        console.log(this.chooseTemplateName, this.chooseTemplateTag)
    }
    // 获取模版信息
    async getTemplateName() {
        let result = await this.getInfo(getRepoList, '获取模版中，请稍等...');
        const { repo } = await inquirer.prompt({
            name: 'repo',
            type: 'list',
            choices: result,
            message: '请选择模板:'
        })
        this.chooseTemplateName = repo;
        return repo
    }
    // 获取版本信息
    async getTemplateTag() {
        let result = await this.getInfo(getTagList, '获取版本中，请稍等...', this.chooseTemplateName);
        const { tag } = await inquirer.prompt({
            name: 'tag',
            type: 'list',
            choices: result,
            message: '请选择版本号:'
        })
        this.chooseTemplateTag = tag;
        return tag
    }
    async uploadTemplate(repo, tag) {
        // 1）拼接下载地址
        const requestUrl = `zhurong-cli/${repo}${tag ? '#' + tag : ''}`;

        // 2）调用下载方法
        await this.getInfo(
            this.downloadGitRepo, // 远程下载方法
            '下载模版中...', // 加载提示信息
            requestUrl, // 参数1: 下载地址
            path.resolve(process.cwd(), this.targetDir)) // 参数2: 创建位置
    }
    async getInfo(fn, message, ...args) {
        console.log(message);
        try {
            let result = await fn(...args);
            if (!result) return
            let TemplateList = result.map(item => item.name);
            return TemplateList
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = Generator;
