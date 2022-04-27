const { tailwindMap, colorMap, analysisResultTemp, regHexColor, regRgbColor } = require("./const");
const { fixHexColor } = require("../../common");
// const keywordMap = {
//   background: "bg",
//   border: "border",
//   "box-shadow": "ring-offset",
//   color: "text",
// };

const parseArrToHexColor = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return "#" + arr.map((val) => val.toString(16).toLowerCase()).join("");
};
const parseHexColorToArr = (color) => {
  color = fixHexColor(color);
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

const rgbMap = Object.keys(colorMap).reduce((obj, prefix) => {
  const transVal = Object.entries(colorMap[prefix]).reduce(
    (mp, [key, value]) => {
      if (regHexColor.test(key)) {
        mp.set(parseHexColorToArr(key).color, value);
      }
      return mp;
    },
    new Map()
  );
  obj[prefix] = transVal;
  return obj;
}, {});

const rgbNearWeight = (rgb1, rgb2) => {
  return rgb1.reduce((weight, val, index) => {
    return weight + Math.abs(val - rgb2[index]);
  }, 0);
};

const getNearColor = (key, color) => {
  // todo::: 没有很好的颜色hash算法，只能遍历去计算方差，寻找最接近的颜色
  if (!(key in rgbMap)) return color;
  if(typeof color === 'string') return color;
  const weightArr = [];
  rgbMap[key].forEach((val, arr) => {
    weightArr.push({ weight: rgbNearWeight(color, arr), arr });
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
  return nearColor;
};
const checkColorConfig = (str) => {
  return str === "transparent" || str.toLowerCase() === "currentcolor";
};
const checkColor = (str) => {
  return (
    checkColorConfig(str) || regHexColor.test(str) || regRgbColor.test(str)
  );
};
const parseColorInfo = (color) => {
  if (checkColorConfig(color)) {
    return { color, opacity: 1 };
  }
  let info = {};
  if (regHexColor.test(color)) {
    info = parseHexColorToArr(color);
  } else {
    info = parseRgbColorToArr(color);
  }

  return info;
};

const searchTailwindKeyPrefix = (key) => {
  let transKey = key;
  if (key.startsWith("background")) {
    return "bg";
  } else if (key.startsWith("box-shadow")) {
    return "ring-offset";
  } else if (key === "color") {
    return "text";
  } else if (key.startsWith("border")) {
    return "border";
  }
  return "";
};

const colorAnalysis = (key, value, options = {}) => {
  const failCb = { ...analysisResultTemp };
  if (!checkColor(value)) return failCb;
  const prefix = searchTailwindKeyPrefix(key);
  if (!prefix) return failCb;
  const transVal = parseColorInfo(value);
  if (options.approxColor) {
    transVal.color = getNearColor(prefix, transVal.color);
    transVal.opacity = Math.round((transVal.opacity * 100) / 5) * 5;
  }
  const { opacity } = transVal;
  let color = parseArrToHexColor(transVal.color);
  if (prefix in colorMap) {
    const tailwindColor = colorMap[prefix][color];
    const tailwindOpacity = `${prefix}-opacity-${opacity * 100}`;
    if (tailwindColor && (opacity === 1 || tailwindOpacity in tailwindMap)) {
      const tailwind = [tailwindColor];
      if (opacity !== 1) {
        tailwind.push(tailwindOpacity);
      }

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
