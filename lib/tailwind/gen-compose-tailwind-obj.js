const { splitCssProp } = require("../common");

const genCssToTailwindObj = (dataObj) => {
  const tailwindToCssObj = Object.values(dataObj).reduce((obj, item) => {
    Object.assign(obj, item);
    return obj;
  }, {});
  return Object.entries(tailwindToCssObj).reduce((obj, [key, value]) => {
    obj[value] = key;
    return obj;
  }, {});
};

const genComposeObj = (dataObj) => {
  const entries = Object.entries(dataObj);
  const getComposeArr = (str) => {
    const keyArr = splitCssProp(str);
    let classArr = [];
    if (keyArr.length > 1) {
      keyArr.reduce((stop, key) => {
        if (stop) return true;
        if (key in dataObj) {
          classArr.push(dataObj[key]);
        } else {
          classArr = [];
          return true;
        }
        return stop;
      }, false);
    }
    return classArr.length ? classArr : null;
  };
  return entries.reduce((obj, [key, value]) => {
    const composeArr = getComposeArr(key);
    if (composeArr) {
      obj[value] = composeArr;
    }
    return obj;
  }, {});
};

const genComposeTailwindObj = (cssTailwindObj) => {
  return genComposeObj(genCssToTailwindObj(cssTailwindObj));
};
genComposeTailwindObj.getName = () => "class-compose";
module.exports = genComposeTailwindObj;
