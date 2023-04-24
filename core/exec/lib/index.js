"use strict";

const path = require("path");
const cp = require("child_process");
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
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach((item) => {
        if (
          cmd.hasOwnProperty(item) &&
          item !== "parent" &&
          !item.startsWith("_")
        ) {
          o[item] = cmd[item];
        }
      });
      args[args.length - 1] = o;
      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`;
      const child = spawn("node", ["-e", code], {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      child.on("error", (err) => {
        log.error("error", err);
        process.exit(0);
      });
      child.on("exit", (e) => {
        log.verbose("exit", "命令执行完毕");
        process.exit(e);
      });
    } catch (e) {
      log.error("error", e.message);
    }
  }
}

function spawn(command, argv, options) {
  const win32 = process.platform === "win32";
  command = win32 ? "cmd" : command;
  argv = win32 ? ["/c"].concat(command, argv) : argv;
  return cp.spawn(command, argv, options);
}

module.exports = exec;
