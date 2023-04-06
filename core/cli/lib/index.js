#! /usr/bin/env node
"use strict";
// require 加载资源类型
// .js 正常加载，必须有module.exports
// .json 会调用JSON.parse()对内容进行解析
// 其他类型 会按照js文件格式进行加载，如果内容是js代码，则可以被成功加载

const semver = require("semver");
const colors = require("colors");
const userHome = require("user-home");
const minimist = require("minimist");
const path = require("path");

const log = require("@wwei-cli/log");
const pkg = require("../package.json");
const constants = require("./const");

let args;

async function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
    await checkNpmVersion();
  } catch (e) {
    log.error("Error", e.message);
  }
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
  log.verbose("环境变量", process.env.CLI_HOME_PATH);
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

function checkInputArgs() {
  args = minimist(process.argv.slice(2));
  checkArgs();
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }
  log.level = process.env.LOG_LEVEL;
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

function checkNodeVersion() {
  const version = process.version;
  const lowNodeVersion = constants.LOW_NODE_VERSION;
  if (!semver.gte(version, lowNodeVersion)) {
    throw new Error(
      colors.red(
        `当前Node版本: ${colors.green(
          version
        )}, wwei-cli 需要Node版本 >= ${colors.blue(lowNodeVersion)}`
      )
    );
  }
}

function checkPkgVersion() {
  log.info("version", pkg.version);
}
module.exports = core;
