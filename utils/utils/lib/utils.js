'use strict';

const cp = require("child_process");
const Spinner = require("cli-spinner").Spinner;

function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

function spinner({ text } = { text: "加载中..." }) {
  const obj = new Spinner({
    text: `%s ${text}`,
    stream: process.stderr,
    onTick: function (msg) {
      this.clearLine(this.stream);
      this.stream.write(msg);
    },
  });
  return obj;
}

function sleep(time = 2000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function spawn(command, argv, options) {
  const win32 = process.platform === "win32";
  argv = win32 ? ["/c"].concat(command, argv) : argv;
  command = win32 ? "cmd" : command;
  return cp.spawn(command, argv, options);
}

function spawnSync(command, argv, options) {
  return new Promise((resolve, reject) => {
    const cp = spawn(command, argv, options);
    cp.on("error", reject);
    cp.on("exit", resolve);
  });
}

module.exports = { isObject, spinner, sleep, spawn, spawnSync };

