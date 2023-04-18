"use strict";

const semver = require("semver");

async function getNpmInfo(pkgName, registry) {
  if (!pkgName) return null;
  let urlJoin = (await import("url-join")).default;
  let axios = (await import("axios")).default;

  const registryUrl = registry || getDefaultRegistry();
  return axios
    .get(urlJoin(registryUrl, pkgName))
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return null;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function getDefaultRegistry(isNpm = true) {
  return isNpm
    ? "https://registry.npmjs.org"
    : "http://registry.npm.taobao.org";
}

async function getNpmVersions(pkgName, registry) {
  const data = await getNpmInfo(pkgName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}
async function getSemverVersions(baseVersion, pkgName, registry) {
  const versions = await getNpmVersions(pkgName, registry);
  return versions
    .filter((version) => semver.satisfies(version, `>${baseVersion}`))
    .sort((a, b) => semver.gt(b, a));
}
async function getNpmSemverVersion(baseVersion, pkgName, registry) {
  const versions = await getSemverVersions(baseVersion, pkgName, registry);
  if (versions && versions.length > 0) {
    return versions[0];
  }
  return null;
}

async function getLatestVersion(pkgName, registry) {
  const versions = await getSemverVersions(pkgName, registry);
  if (versions && versions.length > 0) {
    return versions.sort((a, b) => semver.gt(b, a))[0];
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getLatestVersion,
};
