const {
  analysisResultTemp,
  cssToTailwindMap,
  variableMap,
} = require("./const");
const { formatCssProp, getCssPair } = require("../../common");

const transOriginPercent = (value) => {
  const splitValue = value.split(/\s+/);
  if (splitValue.length > 2) return value;
  const transArr = splitValue.map((val, index) => {
    if (val === "50%") return "center";
    if (!index) {
      if (["0px", "0%", "0"].includes(val)) return "left";
      if (val === "100%") return "right";
    } else {
      if (["0px", "0%", "0"].includes(val)) return "bottom";
      if (val === "100%") return "top";
    }
    return val;
  });
  return transArr.join(" ");
};

const parseOriginDef = (regArr, checkArr) => {
  let rst = "center";
  checkArr.forEach((key) => {
    if (regArr.includes(key)) {
      rst = key;
    }
  });
  return rst;
};

const parseOriginVal = (value) => {
  value = transOriginPercent(value);
  const originXReg = /left|right|center/g;
  const originYReg = /top|bottom|center/g;
  let xProp = value.match(originXReg);
  if (xProp) {
    xProp = parseOriginDef(xProp, ["left", "right"]);
  }
  let yProp = value.match(originYReg);
  if (yProp) {
    yProp = parseOriginDef(yProp, ["top", "bottom"]);
  }
  console.log(xProp, yProp);
  // 三个属性时不能用left\top表示
  // 两个属性时，必须一个表示x方向，一个表示y方向，否则失效
  const len = value.split(/\s+/).length;
  if (len > 2 || (len === 2 && !(xProp && yProp)) || !(xProp || yProp)) {
    return value;
  }
  let props = [yProp, xProp].filter((item) => item && item !== "center");
  if (!props.length) props = ["center"];
  return props.join(" ");
};

const originTrans = (key, value, options) => {
  if (key !== "transform-origin") return null;
  const propStr = parseOriginVal(value);
  const cssProp = formatCssProp(key, propStr);
  if (cssProp in cssToTailwindMap) {
    return cssToTailwindMap[cssProp];
  }
  return null;
};

const classifyTransformProp = (value) => {
  // transform
  if (value === "none") {
    return { none: true };
  }
  const translateReg =
    /translate(?<threeD>3d)?(?<direction>X|Y)?\((?<val>.+?)\)/;
  const rotateReg = /rotate\((?<val>.+?)\)/;
  const skewReg = /skew(?<direction>X|Y)?\((?<val>.+?)\)/;
  const scaleReg = /scale(?<direction>X|Y)?\((?<val>.+?)\)/;
  const getInfo = (reg) => {
    const matchVal = value.match(reg);
    if (!matchVal) return null;
    return matchVal.groups;
  };
  const [translate, rotate, skew, scale] = [
    translateReg,
    rotateReg,
    skewReg,
    scaleReg,
  ].map(getInfo);
  const parseObj = {
    translate,
    rotate,
    skew,
    scale,
  };
  return Object.entries(parseObj).reduce((obj, [key, val]) => {
    if (val) {
      obj[key] = val;
    }
    return obj;
  }, {});
};

const parseVal = (value) => {
  let [x, y, z = 0] = value.split(/\s+/);
  if (!y) {
    y = x;
  }
  return {
    x,
    y,
    z,
  };
};
const findTwVariable = (rem) => (key, value) => {
  if (!(key in variableMap)) return null;
  const searchObj = variableMap[key];
  if (value.endsWith("px")) {
    value = `${parseFloat(value) / rem}rem`;
  }
  return (
    Object.keys(searchObj).find((key) => {
      const [_, val] = getCssPair(searchObj[key]);
      if (!parseFloat(val) && !parseFloat(value)) {
        return true;
      }
      return val === value;
    }) || null
  );
};
const parseTransformVal = (key, propInfo, options = { rem: 16 }) => {
  const findVar = findTwVariable(options.rem);
  const { x, y, z } = parseVal(propInfo.val);
  // const direction = propInfo.direction&&propInfo.direction.toLowerCase()
  // const tailwindKey = ['--tw', key, direction].filter(Boolean).join('-')
  // tailwind没有z不为0的属性
  if (z) return null;
  if (key === "rotate") {
    if (x !== y) return null;
    const tailwindKey = `--tw-${key}`;
    return [findVar(tailwindKey, x)];
  }
  const findVal = [x, y].map((val, index) => {
    const direction = index ? "y" : "x";
    const tailwindKey = `--tw-${key}-${direction}`;
    return findVar(tailwindKey, val);
  });
  if (findVal.some((item) => !item)) return null;
  return findVal;
};

const transfromTrans = (key, value, options) => {
  if (key !== "transform") return null;
  const propObj = classifyTransformProp(value);
  if (propObj.none) return "transform-none";
  const transObj = Object.entries(propObj).reduce((obj, [k, val]) => {
    obj[k] = parseTransformVal(k, val, options);
    return obj;
  }, {});
  const values = Object.values(transObj).flat();
  if (values.some((item) => !item)) return null;
  const tranformProp =
    propObj.translate && propObj.translate.threeD
      ? "transform-gpu"
      : "transform";
  return [tranformProp].concat(values);
};

const transformAnalysis = (key, value, options) => {
  const failCb = { ...analysisResultTemp };
  const originVal = originTrans(key, value, options);
  const transformVal = transfromTrans(key, value, options);
  const tailwind = originVal || transformVal;
  if (tailwind) {
    return {
      ...analysisResultTemp,
      success: true,
      tailwind,
    };
  }
  return failCb;
};

module.exports = transformAnalysis;
