const fs = require("fs");
const path = require("path");
const { beautyStringify } = require("../lib/common");
const getTailwindMapPath = require("../lib/tailwind/get-tailwind-map-path");
const getColorObj = require("../lib/tailwind/get-color-obj");
const tailwindInfoClassify = require("../lib/tailwind/tailwind-info-classify");
const genComposeTailwindObj = require("../lib/tailwind/gen-compose-tailwind-obj");

const writeFileToAssets = (name, value) => {
  if (!name || !value) return;
  fs.writeFileSync(
    path.resolve(__dirname, "../assets", `${name}.json`),
    beautyStringify(value),
    "utf8"
  );
};
getColorObj(path.resolve(__dirname, "../assets/color-map.json"));

const genTailwindResource = () => {
  getTailwindMapPath(
    path.resolve(__dirname, "../assets/tailwind-map.json")
  ).then((filePath) => {
    const classifyObj = tailwindInfoClassify(filePath);
    Object.entries(classifyObj).forEach(([key, value]) => {
      writeFileToAssets(key, value);
    });
    const cssTailWindMap = classifyObj["css-tailwind-map"];

    writeFileToAssets(
      genComposeTailwindObj.getName(),
      genComposeTailwindObj(cssTailWindMap)
    );
    const cssToTailwind = Object.values(cssTailWindMap).reduce((rtn, obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        rtn[value] = key;
      });
      return rtn;
    }, {});
    writeFileToAssets("css-to-tailwind", cssToTailwind);
    console.log("执行完毕");
  });
};

module.exports = genTailwindResource;
