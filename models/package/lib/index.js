"use strict";

const path = require("path");
const { mkdirpSync } = require("fs-extra");
const npminstall = require("npminstall");

const { isObject } = require("@wwei-cli/utils");
const formatPath = require("@wwei-cli/format-path");
const {
  getDefaultRegistry,
  getLatestVersion,
} = require("@wwei-cli/get-npm-info");

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
    // 缓存路径 node_modules
    this.storeDir = options.storeDir;
    // package name
    this.packageName = options.packageName;
    // package version
    this.packageVersion = options.packageVersion;
    // 缓存包路径前缀
    this.cacheFilePathPrefix = options.packageName.replace("/", "+");
  }
  get cacheFilePath() {
    return `${this.storeDir}/.store/${this.cacheFilePathPrefix}@${this.packageVersion}/node_modules/${this.packageName}`;
  }
  async prepare() {
    const { pathExistsSync } = await import("path-exists");

    if (this.storeDir && !pathExistsSync(this.storeDir)) {
      // 创建缓存目录
      mkdirpSync(this.storeDir);
    }
    // 获取最新的版本号
    if (this.packageVersion === "latest") {
      this.packageVersion = await getLatestVersion(this.packageName);
    }
  }
  // 判断package是否存在
  async exists() {
    const { pathExistsSync } = await import("path-exists");
    if (this.storeDir) {
      // 缓存的包
      await this.prepare();
      return pathExistsSync(this.cacheFilePath);
    } else {
      return pathExistsSync(this.targetPath);
    }
  }
  // 安装 package
  install() {
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }
  // 拼装最新的缓存路径
  getLatestCacheFilePath(packageVersion) {
    return `${this.storeDir}/.store/${this.cacheFilePathPrefix}@${packageVersion}/node_modules/${this.packageName}`;
  }
  // 更新 package
  async update() {
    const { pathExistsSync } = await import("path-exists");

    // 1.拿到最新版本号
    const latestVersion = await getLatestVersion(this.packageName);
    // 拼装最新的路径
    const latestCacheFilePath = this.getLatestCacheFilePath(latestVersion);
    if (!pathExistsSync(latestCacheFilePath)) {
      // 没有最新的文件路径 需要进行安装
      this.packageVersion = latestVersion;
      return npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestVersion,
          },
        ],
      });
    }
  }
  // 获取文件入口路径
  async getRootFilePath() {
    const { packageDirectorySync } = await import("pkg-dir");
    const pkgDir = packageDirectorySync({ cwd: this.targetPath });
    if (pkgDir) {
      const pkg = require(path.resolve(pkgDir, "package.json"));
      if (pkg && pkg.main) {
        return formatPath(path.resolve(pkgDir, pkg.main));
      }
    }
    return null;
  }
}

module.exports = Package;
