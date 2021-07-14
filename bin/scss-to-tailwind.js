#!/usr/bin/env node

const fs = require("fs");
const parser = require("yargs-parser");
const { configPath } = require("../src/const");
const { _: commands, ...argv } = parser(process.argv.slice(2), {
  // 配置暂时只支持配置文件
  alias: {},
});

if (commands[0] === "fetch") {
  const { genTailwindResource } = require("../index.js");
  genTailwindResource();
} else if (commands[0] === "init") {
  const { initConfig } = require("../index.js");
  initConfig();
} else if (commands[0] === "run") {
  if (!fs.existsSync(configPath)) {
    throw new Error("请先执行:: scss-to-tailwind init");
  }
  const config = require(configPath);
  const { scssTrans } = require("../index.js");
  scssTrans(config);
}
