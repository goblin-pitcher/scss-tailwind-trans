const { isDef } = require("../../../common");
const paddingAndMarginRules = (key, value) => {
  if (!["padding", "margin"].includes(key)) return null;
  let [t, r, b, l] = value.split(/\s+/);
  if (!isDef(r)) {
    r = b = l = t;
  }
  if (!isDef(b)) {
    b = t;
    l = r;
  }
  if (!isDef(l)) {
    l = r;
  }
  return [
    [`${key}-top`, t],
    [`${key}-right`, r],
    [`${key}-bottom`, b],
    [`${key}-left`, l],
  ];
};

exports.propFuncArr = [paddingAndMarginRules]
