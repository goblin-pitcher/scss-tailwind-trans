const { formatCssProp } = require("../../common");
const {
  cssToTailwindMap,
  cssTailwindMap,
  analysisResultTemp,
} = require("./const");
// 暂时只对px和%进行处理
const matchSizeReg = /(?<value>[0-9]*\.?[0-9]*)(?<unit>px|%)/;

const checkIsTransSize = (str) => {
  return matchSizeReg.test(str) || parseFloat(str) === 0;
};
const transPercent = (val, { percentFixNum }) => {
  const rate = Math.pow(10, percentFixNum);
  return `${Math.round(Math.val * rate) / rate}%`;
};

const transPxToRem = (val, { rem = 16, remStep = 0.125 }) => {
  const remVal = Math.round(val / rem / remStep) * remStep;
  // 比如0.5px，会被转换成0rem，显然不符合需求，因此直接返回值
  if (val && !remVal) return `${val}px`;
  return `${remVal}rem`;
};

const transSize = (sizeStr, { rem, remStep, percentFixNum }) => {
  if (parseFloat(sizeStr) === 0) {
    return "0px";
  }
  const matchAllSize = new RegExp(matchSizeReg, "g");
  return sizeStr.replace(matchAllSize, (str, size, unit) => {
    if (unit === "%") {
      return transPercent(size, { percentFixNum });
    } else if (unit === "px") {
      return transPxToRem(size, { rem, remStep });
    }
    return str;
  });
};

const findTailwind = (key, value) => {
  const cssProp = formatCssProp(key, value);
  if (key === "font-size") {
    const fontSizeObj = cssTailwindMap["font-size"];
    const findVal = Object.entries(fontSizeObj).reduce(
      (rst, [key, propValue]) => {
        if (propValue.includes(cssProp)) {
          return key;
        }
        return rst;
      },
      null
    );
    if (findVal) return findVal;
  } else if (cssProp in cssToTailwindMap) {
    return cssToTailwindMap[cssProp];
  }
  return null;
};

const sizeAnalysis = (key, value, options) => {
  const fail = { ...analysisResultTemp };
  if (!checkIsTransSize(value)) return fail;
  const { rem, remStep, percentFixNum } = options;
  const transValue = transSize(value, { rem, remStep, percentFixNum });
  if (transValue === value) return fail;
  const tailwind = findTailwind(key, transValue);
  if (tailwind) {
    return {
      ...analysisResultTemp,
      success: true,
      tailwind,
    };
  }
  return fail;
};

module.exports = sizeAnalysis;
