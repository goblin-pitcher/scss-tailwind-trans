const path = require('path');

// 需要转换的模块名
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
    // 最小rem步长，tailwind目前rem的最小步长为0.125rem
    remStep: 0.125,
    // 计算百分比时，暴露的小数点后位数
    percentFixNum: 6,
    // 是否强行将颜色转换为相近的tailwind颜色
    approxColor: true,
  },
  file: {
    // 需要转换的文件夹路径
    from: todoList.map(name => `./components/${name}`),
    // 转换的文件类型
    include: [/\.scss$/],
    // 若to是相对路径，则相对于检测的文件以to路径进行输出
    // 若to是绝对路径，to即为输出路径
    to: './opt-[name].css',
  },
};
