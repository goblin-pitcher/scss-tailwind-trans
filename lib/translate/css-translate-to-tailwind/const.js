const { getAssetsObj } = require("../../common");

const cssToTailwindMap = getAssetsObj("css-to-tailwind");
const tailwindMap = getAssetsObj("tailwind-map");
const colorMap = getAssetsObj("color-map");
const cssTailwindMap = getAssetsObj("css-tailwind-map");
const variableMap = getAssetsObj('variable-map');

// =======================模板==========================
const analysisResultTemp = Object.freeze({
  success: false,
  tailwind: null,
});

const regHexColor = /^#[0-9a-fA-F]+$/;
const regRgbColor = /^rgba?\(.+?\)$/;

exports.cssToTailwindMap = cssToTailwindMap;
exports.tailwindMap = tailwindMap;
exports.colorMap = colorMap;
exports.cssTailwindMap = cssTailwindMap;
exports.variableMap = variableMap;
exports.analysisResultTemp = analysisResultTemp;
exports.regHexColor = regHexColor;
exports.regRgbColor = regRgbColor;
