const { formatCssProp } = require("../../common");
const { analysisResultTemp } = require("./const");

const specialObj = {
  "flex: 1;": "flex-auto",
  [formatCssProp("font-weight", "normal")]: "font-normal",
  [formatCssProp("font-weight", "bold")]: "font-bold"
};

const specialAnalysis = (key, value, options) => {
  const fail = { ...analysisResultTemp };
  const cssProp = formatCssProp(key, value);
  if (cssProp in specialObj) {
    return {
      ...analysisResultTemp,
      success: true,
      tailwind: specialObj[cssProp],
    };
  }
  return fail;
};

module.exports = specialAnalysis;
