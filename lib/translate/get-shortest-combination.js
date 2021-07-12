const { addSafely, getAssetsObj } = require("../common");

const addArrSafely = addSafely("array");
const addObjSafely = addSafely("object");

const getShortestCombinationFunc = (classComposeObj) => {
  // const checkObjTemp = { checkList: new Set(), value: null };
  const composeObj = Object.entries(classComposeObj).reduce(
    (obj, [key, value]) => {
      value.forEach((prop) => {
        const st = new Set(value);
        st.delete(prop);
        addArrSafely(obj, prop, { checkList: [...st], value: key });
      });
      return obj;
    },
    {}
  );
  const getMaybeArr = (oriArr, addItem) => {
    const checkArr = composeObj[addItem];
    const extraArr = (checkArr || []).reduce((arr, { checkList, value }) => {
      const checkSet = new Set(oriArr);
      if (checkList.every((item) => checkSet.has(item))) {
        checkList.forEach((it) => checkSet.delete(it));
        arr.push([...checkSet, value]);
      }
      return arr;
    }, []);
    return extraArr.concat([[...oriArr, addItem]]);
  };
  // 动态规划-迭代
  return (classArr) => {
    if (!classArr.length) return [];
    classArr = [...new Set(classArr)];
    let rtn = [[classArr.shift()]];
    while (classArr.length) {
      const addItem = classArr.shift();
      rtn = rtn.reduce((rstArr, arr) => {
        return rstArr.concat(getMaybeArr(arr, addItem));
      }, []);
    }
    const lenArr = rtn.map((arr) => arr.length);
    const minLen = Math.min(...lenArr);
    return rtn.find((arr) => arr.length === minLen);
    // 看情况，是否需要根据首字母进行排序： arr.sort((a,b)=>a.localeCompare(b))
  };
};

const getShortestCombination = getShortestCombinationFunc(
  getAssetsObj("class-compose")
);

exports.getShortestCombinationFunc = getShortestCombinationFunc;

module.exports = getShortestCombination;
