"use strict";

const fs = require("fs");
const fse = require("fs-extra");
const inquirer = require("inquirer");
const semver = require("semver");

const Command = require("@wwei-cli/command");
const log = require("@wwei-cli/log");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";
class InitCommand extends Command {
  init() {
    this.force = !!this._options.force;
    this.projectName = this._argv[0] || "";
    log.verbose("init projectName:", this.projectName);
    log.verbose("init force:", this.force);
  }

  async exec() {
    try {
      const projectInfo = await this.prepare();
      log.verbose("projectInfo:", projectInfo);

      this.downloadTemplate();
    } catch (e) {
      log.error(e.message);
    }
  }

  async prepare() {
    // 1. 判断目录是否为空
    const localPath = process.cwd();
    if (!this.isDirEmpty(localPath)) {
      let ifContinue = false;
      if (!this.force) {
        ifContinue = await inquirer.prompt({
          type: "confirm",
          name: "ifContinue",
          message: "是否清除目录文件继续创建项目？",
          default: false,
        });
      }
      // 2. 是否继续创建,二次确认
      if (ifContinue || this.force) {
        ifContinue = await inquirer.prompt({
          type: "confirm",
          name: "ifContinue",
          message: "是否确认清除目录里所有文件？",
          default: false,
        });
      }
      if (!ifContinue) return;
      if (ifContinue) {
        fse.emptyDirSync(localPath);
      }
    }

    return await this.getProjectInfo();
  }

  async getProjectInfo() {
    let projectInfo = {};
    // 获取项目信息
    const { projectType } = await inquirer.prompt({
      type: "list",
      name: "projectType",
      message: "请选择要创建的类型",
      choices: [
        {
          name: "项目",
          value: TYPE_PROJECT,
        },
        {
          name: "组件",
          value: TYPE_COMPONENT,
        },
      ],
    });
    if (projectType === "project") {
      const project = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "请输入项目名称",
          validate: function (e) {
            // 校验
            const done = this.async();
            setTimeout(function () {
              if (
                !/^[a-zA-Z]+([-|_][a-zA-Z][a-zA-Z0-9]*)*[a-zA-Z0-9]*$/.test(e)
              ) {
                done("请输入符合规范的项目名！");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: (e) => {
            // 更改返回值
            return e;
          },
        },
        {
          type: "input",
          name: "projectVersion",
          message: "请输入项目版本号",
          default: "1.0.0",
          validate: function (e) {
            // 校验
            const done = this.async();
            setTimeout(function () {
              if (!!!semver.valid(e)) {
                done("请输入符合规范的版本号！");
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: (e) => {
            // 更改返回值
            const version = semver.valid(e);
            return !!version ? version : e;
          },
        },
      ]);
      projectInfo = { projectType, ...project };
    } else if (projectType === "component") {
    }
    // 3. 下载模版
    // 4. 安装模版
    return projectInfo;
  }

  downloadTemplate() {
    // 1.通过接口请求模版信息
    // 1.1 使用egg搭建模板系统
    // 1.2 通过npm存储模版
    // 1.3 在mongodb数据库中保存信息
    // 1.4 egg.js在数据库中获取信息
  }

  isDirEmpty(localPath) {
    let filePath = fs.readdirSync(localPath) || [];
    // 过滤逻辑
    filePath = filePath.filter(
      (file) => !file.startsWith(".") || ["node_modules"].includes(file)
    );
    return !filePath.length;
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
