"use strict";

const path = require("path");
const Package = require("@wwei-cli/package");
const log = require("@wwei-cli/log");

const SETTINGS = {
  init: "@wwei-cli/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
  const homePath = process.env.CLI_HOME_PATH;
  let targetPath = process.env.CLI_TARGET_PATH;
  log.verbose("homePath", homePath);
  log.verbose("targetPath", targetPath);
  // 拿到command
  const cmdObj = arguments[arguments.length - 1];
  // 命令的名字
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  let storeDir = "";
  let pkg = "";
  if (!targetPath) {
    // 默认目录下初始化
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    log.verbose("targetPath", targetPath);
    log.verbose("storeDir", storeDir);

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });
    if (await pkg.exists()) {
      // 更新package
      await pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    // 在指定目录初始化
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }
  const rootFile = await pkg.getRootFilePath();
  if (rootFile) {
    try {
      require(rootFile).call(null, Array.from(arguments));
    } catch (e) {
      log.error("error", e.message);
    }
  }
}

module.exports = exec;
