const postcss = require("postcss");
const AtRule = require("postcss/lib/at-rule");
const Comment = require("postcss/lib/comment");
const Declaration = require("postcss/lib/declaration");

const {
  cssTranslateToTailwind,
  getShortestCombination,
  splitTailwindCombination,
} = require("./translate");

const { formatCssProp } = require("./common");

const genTailwindAApply = (classArr, options = {}) => {
  if (!classArr.length) return [];
  const combination = getShortestCombination(classArr);
  const splitApplyArr = splitTailwindCombination(combination);
  const rtn = splitApplyArr.map((arr) => {
    const params = arr.join(" ");
    return new AtRule({
      name: "apply",
      params,
      ...options,
    });
  });
  return rtn;
};

const genComment = (props, options = {}) => {
  if (!props.length) return [];
  const rawsGap = options.rawsGap || "\n";
  const joinStr = rawsGap + "  ";
  delete options.rawsGap;
  let defRaws = {};
  if ("rawsGap" in options) {
    defRaws = { before: rawsGap, left: joinStr + " ", right: rawsGap };
  }
  const text = "   " + props.join(joinStr);
  const comment = new Comment({
    text,
    raws: defRaws,
    ...options,
  });
  return [comment];
};

const genDecl = (declArr, options = {}) => {
  return declArr.map((decl) => {
    return new Declaration({
      ...options,
      ...decl,
      prop: decl.key
    });
  });
};

const plugin = postcss.plugin("tailwind-trans-plugin", (options = {}) => {
  return (root) => {
    const { autograph } = options;
    if (autograph) {
      genComment([autograph], {
        raws: { left: " ", right: " " },
      }).forEach((comment) => {
        root.prepend(comment);
      });
    }
    root.walkRules((rule) => {
      const tailwindArr = [];
      const propArr = [];
      const splitPropArr = [];
      const extraPropArr = []
      const cacheSet = new Set();
      const prependData = (val) => rule.prepend(val);
      const appendData = (val) => rule.append(val);
      rule.walkDecls((decl) => {
        const cacheVal = `${decl.prop}=${decl.value}`;
        if (cacheSet.has(cacheVal)) {
          decl.remove();
          return;
        }
        const { isTrans, props, text } = cssTranslateToTailwind(decl, options);
        cacheSet.add(cacheVal);
        if (isTrans) {
          // tailwindArr.push(value);
          propArr.push(text);
          props.forEach(({ isTailwind, value, propInfo }) => {
            if (isTailwind) {
              tailwindArr.push(value);
            } else {
              const { key, value, isSplitProp } = propInfo;
              if(isSplitProp) {
                extraPropArr.push({key, value})
              } else {
                splitPropArr.push(formatCssProp(key, value));
              }
            }
          });
          decl.remove();
        }
      });
      const defTab = rule.raws.before + "\t";
      const applyOptions = { raws: { before: defTab } };
      genTailwindAApply(tailwindArr, applyOptions).forEach(prependData);
      const commentOptions = { rawsGap: defTab };
      if (splitPropArr.length) {
        genComment(["拆分的复合属性"]).forEach(appendData);
        genComment(splitPropArr, commentOptions).forEach(appendData);
        const declOptions = { raws: { before: defTab } };
        genDecl(extraPropArr, declOptions).forEach(appendData);
      }
      if (propArr.length) {
        genComment(["转换为tailwind后移除的属性::"]).forEach(appendData);
        genComment(propArr, commentOptions).forEach(appendData);
      }
    });
  };
});

module.exports = plugin;
