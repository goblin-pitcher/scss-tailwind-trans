const { formatCssProp, waterfallBailExec } = require("../../common");
const { cssToTailwindMap } = require("./const");
const splitComposeDecl = require('./split-compose-decl');
const specialAnalysis = require("./special-analysis");
const sizeAnalysis = require("./size-analysis");
const colorAnalysis = require("./color-analysis");

const fuzzyAnalysis = (pair, options) => {
  const checkSuccess = (info) => info && info.success;
  const funcArr = [specialAnalysis, sizeAnalysis];
  if (options.approxColor) {
    funcArr.push(colorAnalysis);
  }
  return waterfallBailExec(funcArr, checkSuccess)(...pair, options);
};

const getTransResult = (cssPropPairs, options) => {
  const transProps = cssPropPairs.map((pair) => {
    const propInfo = { key: pair[0], value: pair[1] };
    const prop = formatCssProp(...pair);
    if (prop in cssToTailwindMap) {
      return { isTailwind: true, value: cssToTailwindMap[prop], propInfo };
    }
    // 无法直接转换为tailwind的属性，进行模糊匹配
    const { success, tailwind } = fuzzyAnalysis(pair, options);
    if (success) {
      return { isTailwind: true, value: tailwind, propInfo };
    }
    return { isTailwind: false, value: null, propInfo };
  });
  const isTrans = transProps.some((obj) => obj.isTailwind);
  return { isTrans, props: transProps };
};

const cssTranslateToTailwind = (decl, options) => {
  const text = formatCssProp(decl.prop, decl.value);
  const rtn = getTransResult(splitComposeDecl(decl), options);
  rtn.text = text;
  // {isTrans: false, props: [], text: ''}
  return rtn;
};

module.exports = cssTranslateToTailwind;
