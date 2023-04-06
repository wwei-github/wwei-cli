'use strict';

function requireESM(moduleName) {
  const esmRequire = require("esm")(module);
  const esmModule = esmRequire(moduleName);
  return esmModule.default || esmModule;
}
  
module.exports = { requireESM };

