const fs = require("fs");
const fetch = require("node-fetch");
const { beautyStringify, fixHexColor } = require("../common");
// const path = require("path");

const url = "http://10.122.48.229:4000/config.95a9efba.json";
const regHexColor = /^#[0-9a-fA-F]{3,6}/;

const getColorObj = async (writePath, isRefresh) => {
  if (!isRefresh && fs.existsSync(writePath)) return;
  const contentObj = await fetch(url).then((res) => res.json());
  const colorMap = Object.entries(contentObj.theme.colors).reduce(
    (obj, [key, value]) => {
      if (regHexColor.test(value) && value.length < 7) {
        value = fixHexColor(value);
      }
      obj[value] = key;
      return obj;
    },
    {}
  );
  fs.writeFileSync(writePath, beautyStringify(colorMap), "utf8");
  return writePath;
};

module.exports = getColorObj;
