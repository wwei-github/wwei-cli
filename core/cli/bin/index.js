#! /usr/bin/env node

const importLocal = require("import-local");
if (importLocal(__filename)) {
  require("npmlog").info("cli", "当前使用的是 node_modules 本地安装的脚手架");
} else {
  require("../lib")(process.argv.slice(2));
}
