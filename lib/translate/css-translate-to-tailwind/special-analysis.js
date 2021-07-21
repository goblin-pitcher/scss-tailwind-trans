const { formatCssProp, fixHexColor } = require("../../common");
const { analysisResultTemp, regHexColor } = require("./const");
// "border-solid": "border-style: solid;",
// "border-dashed": "border-style: dashed;",
// "border-dotted": "border-style: dotted;",
// "border-double": "border-style: double;",
// "border-none": "border-style: none;",
const specialObj = {
  "flex: 1;": "flex-auto",
  // border优先用border-属性，而非divide-
  [formatCssProp('border-style', 'solid')]: 'border-solid',
  [formatCssProp('border-style', 'dashed')]: 'border-dashed',
  [formatCssProp('border-style', 'dotted')]: 'border-dotted',
  [formatCssProp('border-style', 'double')]: 'border-double',
  [formatCssProp('border-style', 'none')]: 'border-none',
  [formatCssProp("font-weight", "normal")]: "font-normal",
  [formatCssProp("font-weight", "bold")]: "font-bold",
};

const getTransVal = (transObj, key, value) => {
  if(regHexColor.test(value)) {
    value = fixHexColor(value)
  }
  const testProps = [formatCssProp(key, value)]
  // 写了background: #fff; 能自动验证 background-color: #fff;
  if(key==='background-color') {
    testProps.push(formatCssProp(key.replace('-color', ''), value))
  }
  return testProps.reduce((value, prop)=>{
    if(value) return value;
    return transObj[prop]
  }, undefined)
}

const specialAnalysis = (key, value, options = {}) => {
  if(regHexColor.test(value)) {
    value = value.toLocaleLowerCase();
  }
  const fail = { ...analysisResultTemp };
  // const cssProp = formatCssProp(key, value);
  const extraTransObj = (options.extend && options.extend.translate) || {};
  const transObj = {
    ...specialObj,
    ...extraTransObj,
  };
  const tailwind = getTransVal(transObj, key, value);
  if (tailwind) {
    return {
      ...analysisResultTemp,
      success: true,
      tailwind,
    };
  }
  return fail;
};

module.exports = specialAnalysis;
