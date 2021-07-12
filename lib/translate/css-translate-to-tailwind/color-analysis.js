const { tailwindMap, colorMap, analysisResultTemp } = require("./const");
// const keywordMap = {
//   background: "bg",
//   border: "border",
//   "box-shadow": "ring-offset",
//   color: "text",
// };
const regHexColor = /^#[0-9a-fA-F]+$/;
const regRgbColor = /^rgba?\(.+?\)$/;

const parseArrToHexColor = (arr) => {
  return "#" + arr.map((val) => val.toString(16).toLowerCase()).join("");
};
const parseHexColorToArr = (color) => {
  const r = color[1] + color[2];
  const g = color[3] + color[4];
  const b = color[5] + color[6];
  return {
    color: [r, g, b].map((str) => parseInt(str, 16)),
    opacity: 1,
  };
};

const parseRgbColorToArr = (color) => {
  const rgba = color.match(/rgba?\((.+?)\)/)[1];
  const [r, g, b, a] = rgba.split(",").map(Number);
  return {
    color: [r, g, b],
    opacity: a,
  };
};

const rgbMap = Object.entries(colorMap).reduce((mp, [key, value]) => {
  if (regHexColor.test(key)) {
    mp.set(parseHexColorToArr(key).color, value);
  }
  return mp;
}, new Map());

const rgbNearWeight = (rgb1, rgb2) => {
  return rgb1.reduce((weight, val, index) => {
    return weight + Math.abs(val - rgb2[index]);
  }, 0);
};
const checkColorConfig = (str) => {
  return str === "transparent" || str === "currentColor";
};
const checkColor = (str) => {
  return (
    checkColorConfig(str) || regHexColor.test(str) || regRgbColor.test(str)
  );
};
const transToNearTailwindColor = (color) => {
  if (checkColorConfig(color)) {
    return { color, opacity: 1 };
  }
  let info = {};
  if (regHexColor.test(color)) {
    info = parseHexColorToArr(color);
  } else {
    info = parseRgbColorToArr(color);
  }
  // todo::: 没有很好的颜色hash算法，只能遍历去计算方差，寻找最接近的颜色
  const weightArr = [];
  rgbMap.forEach((val, arr) => {
    weightArr.push({ weight: rgbNearWeight(info.color, arr), arr });
  });
  const nearInfo = weightArr.reduce(
    (info, item) => {
      if (item.weight < info.weight) {
        return item;
      }
      return info;
    },
    { weight: Infinity, arr: null }
  );
  // todo:: 或许应该判断最接近颜色的方差，如果大于某个值，就用原本的颜色
  const nearColor = nearInfo.arr ? parseArrToHexColor(nearInfo.arr) : color;
  return {
    color: nearColor,
    opacity: info.opacity,
  };
};

const searchTailwindKeyPrefix = (key) => {
  let transKey = key;
  if (key.startsWith("background")) {
    return "bg";
  } else if (key.startsWith("box-shadow")) {
    return "ring-offset";
  } else if (key === "color") {
    return "text";
  }
  return "";
};

const colorAnalysis = (key, value) => {
  const failCb = { ...analysisResultTemp };
  if (!checkColor(value)) return failCb;
  const prefix = searchTailwindKeyPrefix(key);
  if (!prefix) return failCb;
  const transVal = transToNearTailwindColor(value);
  const { color } = transVal;
  if (color in colorMap) {
    const tailwind = `${prefix}-${colorMap[color]}`;
    if (tailwind in tailwindMap) {
      return {
        ...analysisResultTemp,
        success: true,
        tailwind,
      };
    }
  }
  return failCb;
};

module.exports = colorAnalysis;
