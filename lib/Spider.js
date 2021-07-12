const fetch = require("node-fetch");
const cheerio = require("cheerio");
// 爬取网站数据
class Spider {
  constructor(options) {
    if (typeof options === "string") {
      this._url = options;
    } else {
      this._url = options.url;
    }
    this._p = null;
    this._query = null;
    this._init();
  }
  async _init() {
    try {
      this._p = fetch(this._url)
        .then((res) => res.text())
        .then((body) => {
          this._query = cheerio.load(body);
        });
    } catch (err) {
      this._p = null;
      console.log(err);
    }
  }
  get(selector) {
    if (!this._p) {
      throw new Error("获取页面失败");
    }
    return this._p.then(() => this._query(selector));
  }
  execMethod(name, ...args) {
    if (!this._p) {
      throw new Error("获取页面失败");
    }
    return this._p.then(() => this._query[name](...args));
  }
}

module.exports = Spider;
