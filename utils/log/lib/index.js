"use strict";

const log = require("npmlog");

log.level = process.env.LOG_LEVEL || "info"; // 打印等级更改
log.heading = "wwei-cli"; // 打印前缀
log.headingStyle = { fg: "red", bg: "" }; // 前缀样式
log.addLevel("success", 2000, { fg: "green" }); // 自定义打印

module.exports = log;
