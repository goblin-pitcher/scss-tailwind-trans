const fs = require("fs");
const path = require('path')
const { configPath } = require("./const");

const initConfig = () => {
  const tempPath = path.resolve(__dirname, "./config-template.js");
  const content = fs.readFileSync(tempPath, "utf8");
  fs.writeFileSync(configPath, content, "utf8");
};
module.exports = initConfig;
