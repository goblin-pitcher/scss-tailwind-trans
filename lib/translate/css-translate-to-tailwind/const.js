const { getAssetsObj, objTraverse } = require("../../common");

const cssToTailwindMap = getAssetsObj("css-to-tailwind");
const tailwindMap = objTraverse(cssToTailwindMap);
const colorMap = getAssetsObj("color-map");
const cssTailwindMap = getAssetsObj("css-tailwind-map");

// =======================模板==========================
const analysisResultTemp = Object.freeze({
  success: false,
  tailwind: null,
});

exports.cssToTailwindMap = cssToTailwindMap;
exports.tailwindMap = tailwindMap;
exports.colorMap = colorMap;
exports.cssTailwindMap = cssTailwindMap;
exports.analysisResultTemp = analysisResultTemp;
