const path = require('path');
const { formatCssProp } = require('meg-scss-trans');
// formatCssProp: (key: String, value: String) => `${key}: ${value};`

// 需要转换的模块名
// 转换指令：：npx scss-to-tailwind run
const todoList = [
  'card-frame',
  'cascader',
  'collapse',
  'color-picker',
  'container',
  'contextmenu',
  'dialog',
  'double-card',
  'drawer',
  'dropdown',
  'form',
  'input',
  'input-number',
  'layout',
  'loading',
];
module.exports = {
  scss: {
    // 同scss-loader的prependData配置
    // prependData: ['@import "~@/scss/theme-default/var.scss"'],
    // 配置别名
    alias: {
      '~@': path.resolve('./'),
    },
  },
  postcss: {
    // 转换后的文件添加签名
    autograph: '!===<css>===!    添加标识,方便检索脚本转换的css文件',
    // 跟页面font-size,用于px to rem计算
    rem: 16,
    // number值转换为tailwind相关的number, 参数 (key: String, value: Number, rem): Number
    // numberTransFunc: Function,
    // px to rem 转换方法，参数 (key: String, value: Number, rem): Number
    // remTransFunc: Function,
    // 计算百分比时，暴露的小数点后位数
    percentFixNum: 6,
    // 是否强行将颜色转换为相近的tailwind颜色
    // 目前分析的规则和志刚定的规则不一致，暂时设为false
    approxColor: false,
    // todo::: 后续应支持tailwind的拓展配置
    // extend: Object
    extend: {
      // 需要直接翻译的属性
      translate: {
        // "outline: none": 'outline-none', // 这么写也可以，但是需要注意空格和分号
        [formatCssProp('outline', 'none')]: 'outline-none',
        [formatCssProp('list-style', 'none')]: 'list-none',
        // 以下颜色规则仅供参考
        // 'color: #21539b;': 'text-primary',
        // 'color: #869abb;': ['text-black', 'text-opacity-10'],
        // 'color: #c7ced8;': ['text-black', 'text-opacity-20'],
        // 'color: #a1a8b4;': ['text-black', 'text-opacity-30'],
        // 'color: #435068;': ['text-black', 'text-opacity-60'],
        // 'border-color: #000000;': 'border-black',
        // 'border-color: #21539b;': 'border-primary',
        // 'border-color: #bec2ca;': 'border-primary-300',
        // 'border-color: rgba(210, 214, 222, 0.5);': 'border-opacity-50',

        // 'background: #e6f2ff;': 'bg-primary-100',
        // 'background: #a1a8b4;': 'bg-gray-100',
        // 'background: #869abb;': ['bg-black', 'bg-opacity-20'],
        // 'background: #f7f8f9;': 'bg-gray-400',
      },
      // todo:: tailwind的extend拓展
      // tailwind: {
      // }
    },
  },
  file: {
    // 需要转换的文件夹路径
    from: todoList.map(name => `./components/${name}`),
    // 转换的文件类型
    include: [/index\.scss$/],
    // 若to是相对路径，则相对于检测的文件以to路径进行输出
    // 若to是绝对路径，to即为输出路径
    to: './opt-[name].css',
  },
};
