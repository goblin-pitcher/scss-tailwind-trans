const fs = require("fs");
// const path = require("path");
const Spider = require("../Spider");
const MaxOccurs = require("../MaxOccurs");

const homeUrl = "https://www.tailwindcss.cn";
// const writePath = path.resolve(__dirname, "../assets/tailwind-map.json");

const getNodeData = (node) => node.firstChild.data;

const getFetchInfo = async () => {
  const tailWindHomeSpider = new Spider(`${homeUrl}/docs`);
  const eleList = await tailWindHomeSpider.get("ul li.mt-8>ul li");
  const arrList = Array.from(eleList);
  const findTexts = ["Box Sizing", "用户选择"];
  const sliceIndex = findTexts.map((text, index) => {
    const findIndex = arrList.findIndex((ele) => {
      return getNodeData(ele.firstChild.lastChild) === text;
    });
    if (findIndex < 0) {
      return index ? arrList.length : 0;
    }
    return findIndex;
  });
  const findList = arrList.slice(sliceIndex[0], sliceIndex[1] + 1);
  const fetchList = findList
    .map((ele) => {
      return ele.firstChild.attribs.href;
    })
    .filter(Boolean);
  return {
    origin: homeUrl,
    list: fetchList,
  };
};

const getFetchFunc = (url) => async () => {
  const sp = new Spider(url);
  const trEle = await sp.get("#class-reference+* table tbody tr");
  return trEle;
};

const getTrInfo = (trNode) => {
  const { children } = trNode;
  const keyNode = children[0];
  const valueNode = children[1];
  return {
    [getNodeData(keyNode)]: getNodeData(valueNode).replace(/\n/g, " "),
  };
};

const getTailwindMapPath = async (writePath, refresh) => {
  if (!refresh) {
    if (fs.existsSync(writePath)) return writePath;
  }
  const fetchInfo = await getFetchInfo();
  const { origin, list } = fetchInfo;
  const cbList = list.map((url) => {
    const src = `${origin}${url}`;
    return getFetchFunc(src);
  });
  // 爬取信息时，请求的最大并发数限制为10
  const occurs = new MaxOccurs({ max: 10, taskList: cbList });
  const resultList = await occurs.run();
  const trList = resultList.reduce((arr, item, index) => {
    if (item.status === MaxOccurs.REJECT) {
      console.log("抓取信息失败：", `url::${list[index]};`, item.reason);
      return arr;
    }
    return arr.concat(Array.from(item.value));
  }, []);
  const objInfo = trList.reduce((obj, tr) => {
    return { ...obj, ...getTrInfo(tr) };
  }, {});

  fs.writeFileSync(
    writePath,
    JSON.stringify(objInfo, (key, val) => val, 2),
    "utf8"
  );
  return writePath;
};

module.exports = getTailwindMapPath
