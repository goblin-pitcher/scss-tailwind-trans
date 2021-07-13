const getNearNum = (val) => (step) => {
  const positive = val < 0 ? -1 : 1;
  return positive * Math.round(Math.abs(val) / step) * step;
};

const fontSizeRemRule = (key, val, rem) => {
  if (key !== "font-size") return null;
  const calcRemVal = val / rem;
  const remVal = Math.abs(calcRemVal);
  const getNearRemVal = getNearNum(remVal);
  if (remVal < 0.75) {
    return null;
  } else if (remVal <= 1.25) {
    return getNearRemVal(0.125);
  } else if (remVal <= 1.5) {
    return getNearRemVal(0.25);
  } else if (remVal <= 2.25) {
    return getNearRemVal(0.375);
  } else if (remVal <= 4.5) {
    return getNearRemVal(0.75);
  } else if (remVal <= 6) {
    return getNearRemVal(1.5);
  }
  return getNearRemVal(2);
};

const lineHeightRemRule = (key, val, rem) => {
  if (key !== "line-height") return null;
  const calcRemVal = val / rem;
  const remVal = Math.abs(calcRemVal);
  const getNearRemVal = getNearNum(remVal);
  if (remVal < 0.75) return null;
  return getNearRemVal(0.25);
};

const defSizeRemRule = (key, val, rem) => {
  const calcRemVal = val / rem;
  const remVal = Math.abs(calcRemVal);
  const getNearRemVal = getNearNum(calcRemVal);
  if (remVal < 0.125) {
    return null;
  } else if (remVal <= 1) {
    return getNearRemVal(0.125);
  } else if (remVal <= 3) {
    return getNearRemVal(0.25);
  } else if (remVal <= 4) {
    return getNearRemVal(0.5);
  } else if (remVal <= 16) {
    return getNearRemVal(1);
  } else if (remVal <= 20) {
    return getNearRemVal(2);
  }
  return getNearRemVal(4);
};

const lineHeightNumberRule = (key, val) => {
  if (key !== "line-height") return null;
  const numVal = Math.abs(val);
  const getNearNumVal = getNearNum(val);
  if (numVal < 1) {
    return null;
  } else if (numVal <= 1.25) {
    return getNearNumVal(0.25);
  } else if (numVal <= 1.625) {
    return getNearNumVal(0.125);
  }
  return getNearNumVal(0.375);
};

const opacityNumberRule = (key, val) => {
  if (key !== "opacity") return null;
  return getNearNum(val)(0.05);
};

exports.fontSizeRemRule = fontSizeRemRule;
exports.lineHeightRemRule = lineHeightRemRule;
exports.defSizeRemRule = defSizeRemRule;
exports.lineHeightNumberRule = lineHeightNumberRule;
exports.remFuncArr = [fontSizeRemRule, lineHeightRemRule, defSizeRemRule];
exports.numFuncArr = [lineHeightNumberRule, opacityNumberRule];
