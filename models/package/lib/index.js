"use strict";

const path = require("path");

const { isObject } = require("@wwei-cli/utils");
const formatPath = require("@wwei-cli/format-path");

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package类options参数不能为空");
    }
    if (!isObject(options)) {
      throw new Error("Package类options参数必须是对象");
    }
    // package 路径
    this.targetPath = options.targetPath;
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
  // 获取文件入口路径
  async getRootFilePath() {
    const { packageDirectorySync } = await import("pkg-dir");
    const pkgDir = packageDirectorySync(this.targetPath);
    if (pkgDir) {
      const pkg = require(path.resolve(pkgDir, "package.json"));
      if (pkg && pkg.main) {
        console.log(pkgDir);
        return formatPath(path.resolve(pkgDir, pkg.main));
      }
    }
    return null;
  }
}

module.exports = Package;
