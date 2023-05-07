"use strict";

const fs = require("fs");
const fse = require("fs-extra");
const inquirer = require("inquirer");
const semver = require("semver");
const userHome = require("user-home");
const path = require("path");
const { globSync } = require("glob");
const ejs = require("ejs");

const Command = require("@wwei-cli/command");
const log = require("@wwei-cli/log");
const Package = require("@wwei-cli/package");
const { sleep, spinner, spawnSync, spawn } = require("@wwei-cli/utils");

const getProjectTemplate = require("./getProjectTemplate.js");

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

const TYPE_TEMPLATE_NORMAL = "normal"; // 标准
const TYPE_TEMPLATE_CUSTOM = "custom"; // 自定义

const COMMAND_CONFIG = ["npm", "cnpm", "yarn"];

class InitCommand extends Command {
  init() {
    this.force = !!this._options.force;
    this.projectName = this._argv[0] || "";
    log.verbose("init projectName:", this.projectName);
    log.verbose("init force:", this.force);
  }

  async exec() {
    try {
      this.projectInfo = await this.prepare();
      log.verbose("projectInfo:", this.projectInfo);

      await this.downloadTemplate();
      await this.installTemplate();
    } catch (e) {
      log.error(e.message);
      if (process.env.LOG_LEVEL === "verbose") {
        console.log(e);
      }
    }
  }

  async prepare() {
    // 0. 判断模版是否存在
    this.projectTemplates = await this.getTemplate();
    // 1. 判断目录是否为空
    const localPath = process.cwd();
    if (!this.isDirEmpty(localPath)) {
      let isEmpty = { ifContinue: false };
      if (!this.force) {
        isEmpty = await inquirer.prompt({
          type: "confirm",
          name: "ifContinue",
          message: "是否清除目录文件继续创建项目？",
          default: false,
        });
      }
      // 2. 是否继续创建,二次确认
      if (isEmpty.ifContinue || this.force) {
        isEmpty = await inquirer.prompt({
          type: "confirm",
          name: "ifContinue",
          message: "是否确认清除目录里所有文件？",
          default: false,
        });
      }

      if (!isEmpty.ifContinue) {
        return process.exit(0);
      }
      if (isEmpty.ifContinue) {
        fse.emptyDirSync(localPath);
      }
    }

    return await this.getProjectInfo();
  }

  async getTemplate() {
    try {
      const templates = await getProjectTemplate();
      if (!templates || templates.length == 0) {
        throw new Error("没有模版数据！");
      }
      return templates;
    } catch (e) {
      throw new Error("getTemplate " + e.message);
    }
  }

  async getProjectInfo() {
    function isValidProjectName(projectName) {
      return /^[a-zA-Z]+([-|_][a-zA-Z][a-zA-Z0-9]*)*[a-zA-Z0-9]*$/.test(
        projectName
      );
    }
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
    this.projectTemplates = this.projectTemplates.filter(
      (t) => t.tag === projectType
    );

    const title = projectType === "project" ? "项目" : "组件";

    const promptArray = [];
    if (isValidProjectName(this.projectName)) {
      projectInfo.projectName = this.projectName;
    } else {
      promptArray.push({
        type: "input",
        name: "projectName",
        message: `请输入${title}名称`,
        default: "",
        validate: function (e) {
          // 校验
          const done = this.async();
          setTimeout(function () {
            if (!isValidProjectName(e)) {
              done(`请输入符合规范的${title}名！`);
              return;
            }
            done(null, true);
          }, 0);
        },
        filter: (e) => {
          // 更改返回值
          return e;
        },
      });
    }

    promptArray.push(
      {
        type: "input",
        name: "projectVersion",
        message: `请输入${title}版本号`,
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
      {
        type: "list",
        name: "choiceTemplate",
        message: `请选择${title}模板`,
        choices: this.getChoiceTemplate(),
      }
    );

    if (projectType === "project") {
      const project = await inquirer.prompt(promptArray);
      projectInfo = { ...projectInfo, projectType, ...project };
    } else if (projectType === "component") {
      const descriptionPrompt = {
        type: "input",
        name: "componentDescription",
        message: `请输入${title}描述`,
        default: "",
        validate: function (e) {
          // 校验
          const done = this.async();
          setTimeout(function () {
            if (!e) {
              done(`请输入${title}描述！`);
              return;
            }
            done(null, true);
          }, 0);
        },
      };
      promptArray.push(descriptionPrompt);
      const project = await inquirer.prompt(promptArray);
      projectInfo = { ...projectInfo, projectType, ...project };
    }
    if (projectInfo.projectName) {
      // 转换驼峰形式的命名
      projectInfo.className = require("kebab-case")(
        projectInfo.projectName
      ).replace(/^-/, "");
    }
    if (projectInfo.projectVersion) {
      projectInfo.version = projectInfo.projectVersion;
    }
    if (projectInfo.componentDescription) {
      projectInfo.description = projectInfo.componentDescription;
    }
    return projectInfo;
  }

  async downloadTemplate() {
    // 1.通过接口请求模版信息
    // 1.1 使用egg搭建模板系统
    // 1.2 通过npm存储模版
    // 1.3 在mongodb数据库中保存信息
    // 1.4 egg.js在数据库中获取信息
    const { choiceTemplate } = this.projectInfo;
    this.choiceTemplateInfo = this.projectTemplates.find(
      (i) => i.npmName === choiceTemplate
    );
    const { npmName, version } = this.choiceTemplateInfo;
    const targetPath = path.resolve(userHome, ".wwei-cli", "template");
    const storeDir = path.resolve(targetPath, "node_modules");
    const template = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });
    this.templatePackageInfo = template;

    if (!(await template.exists())) {
      const loading = spinner({ text: "下载中..." });
      try {
        loading.start();
        await template.install();
      } catch (e) {
        throw new Error(e);
      } finally {
        loading.stop(true);
        if (await template.exists()) {
          log.success("模版下载成功");
          this.templatePath = template.cacheFilePath;
        }
      }
    } else {
      const loading = spinner({ text: "更新中..." });
      try {
        loading.start();
        await template.update();
      } catch (e) {
        throw new Error(e);
      } finally {
        loading.stop(true);
        if (await template.exists()) {
          log.success("模版更新成功");
          this.templatePath = template.cacheFilePath;
        }
      }
    }
  }

  isDirEmpty(localPath) {
    let filePath = fs.readdirSync(localPath) || [];
    // 过滤逻辑
    filePath = filePath.filter(
      (file) => !file.startsWith(".") || ["node_modules"].includes(file)
    );
    return !filePath.length;
  }

  getChoiceTemplate() {
    return this.projectTemplates.map((template) => ({
      name: template.title,
      value: template.npmName,
    }));
  }

  async installTemplate() {
    if (this.choiceTemplateInfo) {
      // 没有模版类型，安装标注模版
      if (!this.choiceTemplateInfo.type) {
        this.choiceTemplateInfo.type = TYPE_TEMPLATE_NORMAL;
      }
      if (this.choiceTemplateInfo.type === TYPE_TEMPLATE_NORMAL) {
        await this.installTemplateNormal();
      } else if (this.choiceTemplateInfo.type === TYPE_TEMPLATE_CUSTOM) {
        await this.installTemplateCustom();
      }
    } else {
      throw new Error("无法识别模版信息");
    }
  }

  checkCommand(command) {
    return COMMAND_CONFIG.includes(command) ? command : null;
  }

  async execCommand(command, errMessage) {
    if (command) {
      const cmdArray = command.split(" ");
      const cmd = this.checkCommand(cmdArray[0]);
      if (!cmd) {
        throw new Error(`命令command: ${command}不存在`);
      }
      const options = cmdArray.slice(1);
      const res = await spawnSync(cmd, options, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      if (res !== 0) {
        throw new Error(errMessage);
      }
    }
  }

  ejsRender(options) {
    const cwd = process.cwd();
    const projectInfo = this.projectInfo;
    const result = globSync("**", {
      cwd,
      ignore: options.ignore,
      nodir: true,
    });
    const absolutePath = result.map((p) => path.join(cwd, p));
    return Promise.all(
      absolutePath.map((p) => {
        return new Promise((resolve, reject) => {
          ejs.renderFile(p, projectInfo, {}, function (err, str) {
            if (err) return reject(err);
            if (str) {
              fse.writeFileSync(p, str);
              resolve();
            }
          });
        });
      })
    );
  }

  async installTemplateNormal() {
    const loading = spinner({ text: "模版安装中..." });
    loading.start();
    const targetPath = process.cwd(); // 执行命令的当前目录
    const storePath = path.resolve(this.templatePath, "template"); // 模版缓存目录
    try {
      await fse.ensureDirSync(targetPath);
      await fse.ensureDirSync(storePath);
      fse.copySync(storePath, targetPath);
    } catch (e) {
      throw new Error(e);
    } finally {
      loading.stop(true);
      log.success("模版安装成功");
    }

    const templateIgnore = this.choiceTemplateInfo.ignore || [];
    const ignore = ["**/node_modules/**", ...templateIgnore];
    try {
      await this.ejsRender({ ignore });
    } catch (e) {
      throw new Error(e);
    }
    log.success("模版信息渲染成功");

    const { installCommand, startCommand } = this.choiceTemplateInfo;
    // 安装依赖
    await this.execCommand(installCommand, "安装依赖失败");
    // 运行项目
    await this.execCommand(startCommand, "运行项目失败");
  }
  async installTemplateCustom() {
    const rootFilePath = await this.templatePackageInfo.getRootFilePath();
    if (fse.existsSync(rootFilePath)) {
      log.notice("开始自定义模版安装");
      const options = {
        ...this.choiceTemplateInfo,
        cwd: process.cwd(),
        className: this.projectInfo.className,
        projectVersion: this.projectInfo.projectVersion,
        templatePath: this.templatePath,
        targetPath: process.cwd(),
      };
      const code = `require('${rootFilePath}')(${JSON.stringify(options)})`;
      await spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
    } else {
      log.error("自定义模版入口文件不存在！");
    }
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
