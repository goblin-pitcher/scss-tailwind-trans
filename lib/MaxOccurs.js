// 最大并发数控制
class MaxOccur {
  static FULFILLED = "fulfilled";
  static REJECT = "reject";
  constructor(options) {
    this._maxOccur = options.max;
    this._taskList = [...(options.taskList || [])];
    this._args = options.args;
    this._result = Array(this._taskList.length).fill(null);
    this._activeTaskNum = 0;
    this._count = 0;
  }
  _next(fulfilledCb) {
    if (this._activeTaskNum >= this._maxOccur) return;
    const task = this._taskList.shift();
    if (!task) {
      if (!this._activeTaskNum) {
        fulfilledCb(this._result);
      }
      return;
    }
    const count = this._count++;
    this._activeTaskNum++;
    task(this._args)
      .then((res) => {
        this._result[count] = { status: MaxOccur.FULFILLED, value: res };
      })
      .catch((err) => {
        this._result[count] = { status: MaxOccur.REJECT, reason: err };
      })
      .finally(() => {
        this._activeTaskNum--;
        this._next(fulfilledCb);
      });
  }
  run() {
    let limit = Math.min(this._maxOccur, this._taskList.length);
    if (!limit) {
      return Promise.resolve(this._result);
    }
    let resolve = null;
    const p = new Promise((res) => {
      resolve = res;
    });
    while (limit > 0) {
      this._next(resolve);
      limit--;
    }
    return p;
  }
}

module.exports = MaxOccur;
