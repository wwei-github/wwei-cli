"use strict";

const Command = require("@wwei-cli/command");
const log = require("@wwei-cli/log");

class InitCommand extends Command {
  init() {
    this.force = !!this._options.force;
    this.projectName = this._argv[0] || "";
    log.verbose("init projectName:", this.projectName);
    log.verbose("init force:", this.force);
  }

  exec() {
    console.log("exec");
  }
}

function init(argv) {
  return new InitCommand(argv);
}

module.exports = init;
