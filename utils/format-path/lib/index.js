"use strict";

const path = require("path");

function formatPath(p) {
  if (p && typeof p === "string") {
    const sep = path.sep;
    if (sep === "/") {
      // macOs
      return p;
    } else {
      // window
      return p.replace(/\\/g, "/");
    }
  }
  return p;
}

module.exports = formatPath;
