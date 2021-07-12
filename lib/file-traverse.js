const fs = require("fs");
const path = require("path");
const { typeOf, isDefArr, classifyMatchArr } = require("./common");

const nulFunc = () => null;
// 文件遍历器（层次遍历）
class FileTraverse {
  constructor(options) {
    this._includeInfo = classifyMatchArr(options.include || []);
    this._ignoreInfo = classifyMatchArr(options.ignore || []);
    this._visit = options.visit || nulFunc;
  }

  _getChildren(pathName) {
    const stat = fs.statSync(pathName);
    if (!stat.isDirectory()) return [];
    return fs
      .readdirSync(pathName)
      .map((cPathName) => path.join(pathName, cPathName));
  }
  _toCheck(opt, pathName) {
    const { str = [], reg = [] } = opt;
    const checkStr = str.some((item) => pathName.endsWith(item));
    const checkReg = reg.some((item) => item.test(pathName));
    return checkStr || checkReg;
  }
  _toInclude(pathName) {
    const { str, reg } = this._includeInfo;
    if (!isDefArr(str) && !isDefArr(reg)) return true;
    return this._toCheck(this._includeInfo, pathName);
  }
  _toIgnore(pathName) {
    return this._toCheck(this._ignoreInfo, pathName);
  }
  traverse(root) {
    let checkArr = [root];
    let checkItem = null;
    while (checkArr.length) {
      checkItem = checkArr.shift();
      if (this._toIgnore(checkItem)) continue;
      const children = this._getChildren(checkItem);
      if (isDefArr(children)) {
        checkArr = checkArr.concat(children);
      }
      if (this._toInclude(checkItem)) {
        this._visit(checkItem);
      }
    }
  }
}

module.exports = FileTraverse;
