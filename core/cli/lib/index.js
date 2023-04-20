#! /usr/bin/env node
"use strict";
// require 加载资源类型
// .js 正常加载，必须有module.exports
// .json 会调用JSON.parse()对内容进行解析
// 其他类型 会按照js文件格式进行加载，如果内容是js代码，则可以被成功加载
const Commander = require("commander");
const colors = require("colors");
const userHome = require("user-home");
const path = require("path");

const log = require("@wwei-cli/log");
const init = require("@wwei-cli/init");
const exec = require("@wwei-cli/exec");

const pkg = require("../package.json");
const constants = require("./const");

const program = new Commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    log.error("Error", colors.red(e.message));
    if (program.debug) {
      console.log(e);
    }
  }
}

function registerCommand() {
  program
    .version(pkg.version)
    .name(Object.keys(pkg.bin)[0])
    .usage(`<command> [options]`)
    .option("-d, --debug", "是否开启debug模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定调试文件路径", "");

  program
    .command("init")
    .description("初始化项目")
    .argument("[projectName]", "项目名称")
    .option("-f, --force", "是否强制初始化项目", false)
    .action(exec);

  // 监听debug
  program.on("option:debug", function (obj) {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL;
  });

  // 调试路径监听
  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program.opts().targetPath;
  });

  // 监听错误command
  program.on("command:*", function (obj) {
    const allCommand = program.commands.map((command) => command.name());
    log.error("未知命令：", colors.red(obj[0]));
    log.info("可用命令：", colors.green(allCommand.join(",")));
  });

  program.configureOutput({
    // 此处使输出变得容易区分
    // writeOut: (str) => process.stdout.write(log.info(str)),
    // writeErr: (str) => process.stdout.write(`${str}`),
    // 将错误高亮显示
    outputError: (str, write) => write(`\x1b[31m${str}\x1b[0m`),
  });

  program.parse(process.argv);

  // 判断没有输入command，提示help  必须放在parse后面才能获取到
  if (program.args && program.args.length === 0) {
    program.outputHelp();
  }
}

// 初始化检查
async function prepare() {
  checkPkgVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkNpmVersion();
}

async function checkNpmVersion() {
  const npmName = pkg.name;
  const version = pkg.version;
  const { getNpmSemverVersion } = require("@wwei-cli/get-npm-info");
  const lastVersion = await getNpmSemverVersion(version, npmName);
  if (lastVersion) {
    log.warn(
      "更新提示",
      `${npmName} 当前版本: ${colors.blue(version)}, 最新版本: ${colors.red(
        lastVersion
      )}, 请手动进行更新: npm install ${npmName} -g`
    );
  }
}

async function checkEnv() {
  const dotenvPath = path.join(userHome, ".env");
  const { pathExistsSync } = await import("path-exists");

  if (pathExistsSync(dotenvPath)) {
    require("dotenv").config({ path: dotenvPath }); //拿到用户主目录下的env
  }
  createDefaultEnv();
}

function createDefaultEnv() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig.cliHome = path.join(userHome, constants.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

async function checkUserHome() {
  const { pathExistsSync } = await import("path-exists");

  if (!userHome || !pathExistsSync(userHome)) {
    throw new Error(colors.red("用户主目录不存在！"));
  }
}

async function checkRoot() {
  const rootCheck = await (await import("root-check")).default;
  rootCheck();
}



function checkPkgVersion() {
  log.info("version", pkg.version);
}
module.exports = core;
