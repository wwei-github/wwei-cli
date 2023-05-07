const request = require("@wwei-cli/request");

module.exports = function getProjectTemplate() {
  return request("/getProjectTemplate");
};
