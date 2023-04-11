"use strict";

const Package = require("@wwei-cli/package");
const log = require("@wwei-cli/log");

const SETTINGS = {
  init: "@wwei-cli/init",
};

async function exec() {
  const homePath = process.env.CLI_HOME_PATH;
  const targetPath = process.env.CLI_TARGET_PATH;
  log.verbose("homePath", homePath);
  log.verbose("targetPath", targetPath);
  // 拿到command
  const cmdObj = arguments[arguments.length - 1];
  // 命令的名字
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";
  const pkg = new Package({
    targetPath,
    packageName,
    packageVersion,
  });
  console.log(await pkg.getRootFilePath());
}

module.exports = exec;
