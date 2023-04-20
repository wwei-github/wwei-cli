"use strict";

const semver = require("semver");
const colors = require("colors");

const log = require("@wwei-cli/log");

const LOW_NODE_VERSION = "12.0.0";

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error("参数不能为空");
    }
    if (!Array.isArray(argv)) {
      throw new Error("参数必须是数组");
    }
    this._argv = argv;
    // 暂时不知道为什么要两层promise
    const runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain
        .then(() => this.checkNodeVersion())
        .then(() => this.initArgv())
        .then(() => this.init())
        .then(() => this.exec())
        .catch((err) => log.error("error", err.message));
    });
  }
  initArgv() {
    this._cmd = this._argv.pop();
    this._options = this._argv.pop();
  }
  checkNodeVersion() {
    const version = process.version;
    const lowNodeVersion = LOW_NODE_VERSION;
    if (!semver.gte(version, lowNodeVersion)) {
      throw new Error(
        colors.red(
          `当前Node版本: ${colors.green(
            version
          )}  wwei-cli 需要Node版本 >= ${colors.blue(lowNodeVersion)}`
        )
      );
    }
  }
  init() {
    throw new Error("必须实现init方法");
  }

  exec() {
    throw new Error("必须实现exec方法");
  }
}

module.exports = Command;
