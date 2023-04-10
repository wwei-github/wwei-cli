"use strict";

const { isObject } = require("@wwei-cli/utils");

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package类options参数不能为空");
    }
    if (!isObject(options)) {
      throw new Error("Package类options参数必须是对象");
    }
    console.log("options", options);
    // package 路径
    this.targetPath = options.targetPath;
    // package 存储路径
    this.storePath = options.storePath;
    // package name
    this.packageName = options.PackageName;
    // package version
    this.packageVersion = options.packageVersion;
  }
  // 判断package是否存在
  exists() {}
  // 安装 package
  install() {}
  // 更新 package
  update() {}
}

module.exports = Package;
