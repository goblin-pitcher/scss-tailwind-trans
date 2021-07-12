const fs = require("fs");
const { addSafely, parallelExec, splitCssProp } = require("../common");
const getPropInfoArr = (str) => {
  const splitArr = str.split(":");
  if (splitArr.length < 2) {
    console.warn(`字段出错存在错误：${str}`);
    return ["", ""];
  }
  return splitArr.map((str) => str.trim());
};
const getCssPropKey = (str) => getPropInfoArr(str)[0];
const checkVariable = (value) => value.startsWith("--tw");

const addArrSafely = addSafely("array");
const addObjSafely = addSafely("object");

const composeMixinProp = (mixinCssPropMap) => {
  const joinKey = "<====>";
  return Object.entries(mixinCssPropMap).reduce((obj, [key, arr]) => {
    const composeObj = arr.reduce((ob, { data, mixinProps }) => {
      const genKey = mixinProps.join(joinKey);
      if (!(genKey in ob)) {
        ob[genKey] = { data: {}, mixinProps };
      }
      Object.assign(ob[genKey].data, data);
      return ob;
    }, {});
    obj[key] = Object.values(composeObj);
    return obj;
  }, {});
};

const variableMapCollector = () => {
  const variableMap = {};
  const rtnFunc = (valueList, item) => {
    if (valueList.every(checkVariable)) {
      valueList.forEach((value) => {
        const key = getCssPropKey(value);
        key && addObjSafely(variableMap, key, item);
      });
      return true;
    }
    return false;
  };
  rtnFunc.getMap = () => variableMap;
  rtnFunc.getName = () => "variable-map";
  return rtnFunc;
};

const variableEffectMapCollector = () => {
  const variableEffectMap = {};
  const rtnFunc = (valueList, item) => {
    const variables = valueList.filter(checkVariable);
    if (0 < variables.length && variables.length < valueList.length) {
      variables.forEach((str) => {
        const key = getCssPropKey(str);
        key && addObjSafely(variableEffectMap, key, item);
      });
      return true;
    }
    return false;
  };
  rtnFunc.getMap = () => variableEffectMap;
  rtnFunc.getName = () => "variable-effect-map";
  return rtnFunc;
};

const cssTailwindMapCollector = () => {
  const cssTailwindMap = {};
  const rtnFunc = (valueList, item) => {
    const cssList = valueList.filter((value) => !checkVariable(value));
    if (0 < cssList.length) {
      cssList.forEach((str) => {
        const key = getCssPropKey(str);
        key && addObjSafely(cssTailwindMap, key, item);
      });
      return true;
    }
    return false;
  };
  rtnFunc.getMap = () => cssTailwindMap;
  rtnFunc.getName = () => "css-tailwind-map";
  return rtnFunc;
};

const mixinCssPropMapCollector = () => {
  let mixinCssPropMap = {};
  const rtnFunc = (valueList, item) => {
    const cssList = valueList.filter((value) => !checkVariable(value));
    if (1 < cssList.length) {
      let cssObj = {};
      let mixinProps = [];
      const className = Object.keys(item)[0];
      cssList.forEach((str) => {
        const arr = getPropInfoArr(str);
        mixinProps.push(arr[0]);
        cssObj[arr[0]] = arr[1];
      });
      cssList.forEach((str) => {
        const key = getCssPropKey(str);
        key &&
          addArrSafely(mixinCssPropMap, key, {
            data: {
              [className]: cssObj,
            },
            mixinProps,
          });
      });
      mixinCssPropMap = composeMixinProp(mixinCssPropMap);
      return true;
    }
    return false;
  };
  rtnFunc.getMap = () => mixinCssPropMap;
  rtnFunc.getName = () => "mixin-css-prop-map";
  return rtnFunc;
};

const tailwindInfoClassify = (filePath) => {
  const jsonData = fs.readFileSync(filePath, "utf8");
  const obj = JSON.parse(jsonData);
  const variableMapFunc = variableMapCollector();
  const variableEffectMapFunc = variableEffectMapCollector();
  const cssTailwindMapFunc = cssTailwindMapCollector();
  const mixinCssPropMapFunc = mixinCssPropMapCollector();
  const funcArr = [
    variableMapFunc,
    variableEffectMapFunc,
    cssTailwindMapFunc,
    mixinCssPropMapFunc,
  ];
  const parallelHandler = parallelExec(funcArr);
  const filterUncheckStr = (value) =>
    value.replace(/@keyframes.+?\{.+\};?/g, "");
  Object.entries(obj).forEach(([key, value]) => {
    const item = { [key]: value };
    const valueList = splitCssProp(filterUncheckStr(value));
    parallelHandler(valueList, item);
  });
  return funcArr.reduce((obj, func) => {
    const key = func.getName();
    const value = func.getMap();
    obj[key] = value;
    return obj;
  }, {});
};

module.exports = tailwindInfoClassify;
