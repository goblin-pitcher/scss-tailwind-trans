// todo::: 继续增加规则。。
const conflictCombinationMap = new Map([
  [/p(x|y)\-/, [/^p\-/]],
  [/p(l|r)\-/, [/^px?\-/]],
  [/p(t|b)\-/, [/^py?\-/]],
  [/m(x|y)\-/, [/^m\-/]],
  [/m(l|r)\-/, [/^mx?\-/]],
  [/m(t|b)\-/, [/^my?\-/]],
]);
const getTailwindPrefix = (str) => str.split("-")[0] + "-";
const splitTailwindCombination = (arr) => {
  const arrSet = new Set(arr);
  let checkRegArr = [];
  const conflictArr = [];
  arr.forEach((item) => {
    let prefix = "";
    if (item.startsWith("-")) {
      prefix = "-";
      item = item.substr(1);
    }
    if (
      checkRegArr.map((str) => new RegExp(str)).some((reg) => reg.test(item))
    ) {
      conflictArr.push(prefix + item);
      arrSet.delete(prefix + item);
    } else {
      const findVal = [...conflictCombinationMap].find(([reg]) =>
        reg.test(item)
      );
      if(findVal) {
        checkRegArr = checkRegArr.concat(findVal[1]);
      }
    }
  });
  if (conflictArr.length) {
    return [[...arrSet], ...splitTailwindCombination(conflictArr)];
  }
  return [[...arrSet]];
};

module.exports = splitTailwindCombination;
