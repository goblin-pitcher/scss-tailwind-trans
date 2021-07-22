const { isDef } = require("../../../common");
const paddingAndMarginRules = (key, value) => {
  if (!["padding", "margin"].includes(key)) return null;
  let [t, r, b, l] = value.split(/\s+/);
  // margin: 10px;类似这种的话就直接匹配
  if (!isDef(r)) {
    return null;
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

const borderRules = (key, value) => {
  const regBorder = /^border\-?(?<direction>top|right|bottom|left)?$/;
  const keyMatch = key.match(regBorder);
  if (!keyMatch) return null;
  const widthReg = /\d*\.?\d*px/;
  const styleReg = /solid|dashed|dotted|double|none/;
  const colorReg = /(#[0-9a-fA-F]+)|(rgba?\(.+?\))/;
  let [width, style, color] = [widthReg, styleReg, colorReg].map((reg) => {
    const val = value.match(reg);
    return val && val[0];
  });
  const direction = keyMatch.groups.direction;
  const borderWidth = ["border", direction, "width"].filter(Boolean).join("-");
  const borderStyle = ["border", "style"].join("-");
  const borderColor = ["border", "color"].join("-");
  if (direction && (!style || style === "none")) {
    return [[borderWidth, "0px"]];
  }
  width = width || "0px";
  style = style || "solid";
  color = color || "#000000";
  return [
    [borderWidth, width],
    [borderStyle, style],
    [borderColor, color],
  ];
};
exports.propFuncArr = [paddingAndMarginRules, borderRules];
