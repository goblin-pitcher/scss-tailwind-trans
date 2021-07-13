const { formatCssProp, waterfallBailExec, isDef } = require("../../../common");
const {
  cssToTailwindMap,
  cssTailwindMap,
  analysisResultTemp,
} = require("../const");

const { remFuncArr, numFuncArr } = require("./size-rule");

// 暂时只对px和%进行处理
const matchSizeReg = /(?<value>[0-9]*\.?[0-9]*)(?<unit>px|%)/;

const checkIsTransSize = (str) => {
  return matchSizeReg.test(str) || Number.isFinite(+str);
};

const defNumberTransFunc = (key, value, rem) => {
  const checkFuncArr = [...numFuncArr];
  return waterfallBailExec(checkFuncArr, isDef)(key, value, rem);
};
const transPureNumber = (
  key,
  value,
  { rem, numberTransFunc = defNumberTransFunc }
) => {
  const transVal = numberTransFunc(key, value, rem);
  return isDef(transVal) ? transVal : value;
};

const defRemTransFunc = (key, value, rem) => {
  const checkFuncArr = [...remFuncArr];
  return waterfallBailExec(checkFuncArr, isDef)(key, value, rem);
};

const transPercent = (key, val, { percentFixNum }) => {
  const rate = Math.pow(10, percentFixNum);
  return `${Math.round(Math.val * rate) / rate}%`;
};

const transPxToRem = (
  key,
  val,
  { rem = 16, remTransFunc = defRemTransFunc }
) => {
  const remVal = remTransFunc(key, val, rem);
  // 比如0.5px，会被转换成0rem，显然不符合需求，因此直接返回值
  if (val && !remVal) return `${val}px`;
  return `${remVal}rem`;
};

const transSize = (key, sizeStr, options) => {
  if (Number.isFinite(+sizeStr)) {
    if (+sizeStr === 0) {
      return "0px";
    }
    return transPureNumber(key, sizeStr, options);
  }
  const matchAllSize = new RegExp(matchSizeReg, "g");
  return sizeStr.replace(matchAllSize, (str, size, unit) => {
    if (unit === "%") {
      return transPercent(key, size, options);
    } else if (unit === "px") {
      return transPxToRem(key, size, options);
    }
    return str;
  });
};

const findTailwind = (key, value) => {
  const cssProp = formatCssProp(key, value);
  if (key === "font-size") {
    // tailwind的font-size还自带line-height
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
  const transValue = transSize(key, value, { rem, remStep, percentFixNum });
  // if (transValue === value) return fail;
  // 若转换后的值没找到对应的tailwind属性，则使用转换前的值找一次
  const tailwind = findTailwind(key, transValue) || findTailwind(key, value);
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
