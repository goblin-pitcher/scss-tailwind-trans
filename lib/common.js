const fs = require("fs");
const path = require("path");

const addSafely = (type = "object") => {
  let struct = Object;
  let addFunc = (obj, key, val) => Object.assign(obj[key], val);
  if (type === "array") {
    struct = Array;
    addFunc = (obj, key, val) => obj[key].push(val);
  }
  return (obj, key, value) => {
    if (!(key in obj)) {
      obj[key] = new struct();
    }
    addFunc(obj, key, value);
  };
};

const parallelExec =
  (funcArr) =>
  (...args) =>
    funcArr.map((func) => func(...args));

const waterfallBailExec =
  (funcArr, check = (a) => a) =>
  (...args) => {
    return funcArr.reduce((rst, func) => {
      if (check(rst)) return rst;
      rst = func(...args);
      return rst;
    }, null);
  };

const splitCssProp = (str) =>
  str
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `${s};`);

const getCssPair = (prop) =>
  prop
    .replace(/;$/, "")
    .split(":")
    .map((item) => item.trim());

const formatCssProp = (key, value) => `${key}: ${value};`;

const beautyStringify = (value) => JSON.stringify(value, (key, val) => val, 2);

const getAssetsObj = (filePath) => {
  const absolutePath = path.resolve(__dirname, "../assets", `${filePath}.json`);
  const data = fs.readFileSync(absolutePath);
  return JSON.parse(data);
};

const fixHexColor = (hexColor) => {
  hexColor = hexColor.toLowerCase();
  if (hexColor.length === 7) return hexColor;
  if (hexColor.length < 7) {
    const arr = hexColor.substr(1, 3).split("");
    const colorMain = arr
      .map((item) => [item, item])
      .flat()
      .join("");
    return `#${colorMain}`;
  }
  return hexColor.substr(0, 7);
};

const objTraverse = (obj) => {
  return Object.entries(obj).reduce((obj, [key, value]) => {
    obj[value] = key;
    return obj;
  }, {});
};

const typeOf = (val) =>
  Object.prototype.toString
    .call(val)
    .match(/\[.+?\s(.+?)\]/)[1]
    .replace(/^\w/, (item) => item.toLowerCase());

const isDef = (item) => !!(item || item === 0);
const isDefArr = (item) => !!(Array.isArray(item) && item.length);

const classifyMatchArr = (arr) => {
  const classifyObj = { str: [], reg: [] };
  arr.forEach((item) => {
    if (typeOf(item) === "regExp") {
      classifyObj.reg.unshift(item);
    }
    if (typeOf(item) === "string") {
      classifyObj.str.unshift(item);
    }
  });
  return classifyObj;
};

exports.addSafely = addSafely;
exports.parallelExec = parallelExec;
exports.waterfallBailExec = waterfallBailExec;
exports.splitCssProp = splitCssProp;
exports.getCssPair = getCssPair;
exports.beautyStringify = beautyStringify;
exports.getAssetsObj = getAssetsObj;
exports.formatCssProp = formatCssProp;
exports.fixHexColor = fixHexColor;
exports.objTraverse = objTraverse;
exports.typeOf = typeOf;
exports.isDef = isDef;
exports.isDefArr = isDefArr;
exports.classifyMatchArr = classifyMatchArr;
