const fs = require("fs");
const path = require("path");
const sass = require("sass");
// 简易的scss-Loader
class SimpleScssLoader {
  constructor(options) {
    const prependData = options.prependData || [];
    this._prependStr = prependData.map((str) => `${str};\n`).join("");
    this._alias = options.alias || {};
  }
  _aliasHandler = (filePath) => (url, prev, done) => {
    const alias = this._alias;
    let file = url;
    if (alias) {
      Object.entries(alias).reduce((rst, [keyword, value]) => {
        if (rst) return rst;
        if (url.startsWith(keyword)) {
          file = path.resolve(value, url.replace(keyword, "."));
          rst = true;
        }
        return rst;
      }, false);
    }
    if (!path.isAbsolute(file)) {
      const { dir } = path.parse(prev === "stdin" ? filePath : prev);
      file = path.resolve(dir, url);
    }
    if (!file.endsWith(".scss")) {
      file += ".scss";
    }
    done({
      file,
    });
  };

  load(filePath) {
    let resolve = null;
    let reject = null;
    const p = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const data = this._getFileContent(filePath);
    sass.render(
      {
        data,
        importer: [this._aliasHandler(filePath)],
      },
      function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.stringify(result.css.toString()));
        }
      }
    );
    return p;
  }

  _getFileContent(filePath) {
    const data = fs.readFileSync(filePath, "utf8");
    return this._prependStr + data;
  }
}

module.exports = SimpleScssLoader;
