## .scss文件转tailwind风格css工具

### 背景

公司组件库升级，样式由scss转换为tailwind风格的css写法，纯手工转换工作量巨大，因此开发转换工具，重复性工作交由程序执行。

### 思路

首先分析IO，I为.scss文件，O为htailwind 风格的.css文件。.scss文件我们可以通过scss loader转换为原生css，其实核心工作就是原生css到tailwind css的转换。

[tailwind css官网](https://www.tailwindcss.cn/docs)提供了各个css样式所对应的tailwindp css配置，假设将所有配置对照表爬取下来，再逐一对照样式进行转换。

总结下来，大体工作如下：

1. .scss文件解析为css
2. 遍历css配置，将其转换为tailwind风格的css
3. 写入文件

### scss转css

这一步可以通过sass+postcss将scss转换为ast树，再通过自定义的插件进行内容转换。

loader部分的使用代码地址为[SimpleScssLoader](https://github.com/goblin-pitcher/scss-tailwind-trans/blob/master/lib/SimpleScssLoader.js)，对应转换插件地址为[tailwind-trans-plugin](https://github.com/goblin-pitcher/scss-tailwind-trans/blob/master/lib/tailwind-trans-plugin.js)。

需要注意的是转换后的css中保留了转换前css配置的注释，便于验证转换的正确性。

### css配置转tailwind配置

首先分析，如果将css配置转换成tailwind配置的工作交由**人工**完成，应如何实现？

假设要转换`padding-top: 8px`,我们首先能知道`padding-top`属于padding配置，应在tailwind官网的[padding配置](https://www.tailwindcss.cn/docs/padding)列表中查找，但tailwind官方并没有给太多`px`单位的配置，我们需要将`px`转换为`rem`，再进行配置的寻找。同时这带来了一个问题：`px`转换成`rem`需要知道根节点的`font-size`，我们需要让转换过程是一个**可配置**的过程。

同样以`padding-top: 8px`为例，假设该属性所在的class同样存在配置`padding-bottom: 8px`，若根节点`font-size`是`16px`，那么可以得到`pt-2`和`pb-2`两天tailwind配置，而这两条配置是可以合并成`p-2`的，因此我们需要一个**合并机制**。

既然有了合并，那假设有`padding: 2px 4px 6px 8px`，这在tailwind中同样无法直接转换，需要将其拆分为`padding-top|right|bottom|left`，分别进行转换，因此我们还需要一个**拆分机制**。

若配置是`padding-top: 9px`又该如何处理？此时`padding-top`等于`0.5625rem`，tailwind中没有对应的配置项。对于这种情况，是否能有一个**可配置**的**近似处理机制**，能够根据不同的需求对其进行取近似值。

整理以上，我们将转换过程的步骤总结如下：

1. 爬取并分类tailwind官网上的css配置对照表，用于配置的比对
2. 拆分复合css配置（如`padding`、`flex`等）
3. 将原子css配置在爬取的对照表中找对应的tailwind配置
   1. 若无法找到，查询用户配置的**直接转换表**里找是否存在对应项，存在则返回配置结果
   2. 若无法找到，则尝试进行取近似值的处理
   3. 若依旧无法找到，则返回css配置
4. 对转换后的tailwind配置进行合并，取最优合并结果(配置最少则可认为最优)。

以上步骤对应的代码如下：

+ 步骤1的官网信息爬取对应文件[spider](https://github.com/goblin-pitcher/scss-tailwind-trans/blob/master/src/gen-tailwind-resource.js)
+ 步骤2、3、4对应文件夹[translate](https://github.com/goblin-pitcher/scss-tailwind-trans/tree/master/lib/translate)
  + 转换部分主要是[css-translate-to-tailwind](https://github.com/goblin-pitcher/scss-tailwind-trans/tree/master/lib/translate/css-translate-to-tailwind)
  + 转换部分目前取近似值的主要是**大小**和**颜色**，大小可通过外部传入的`remTransFunc`方法转换，默认方法是取最近的值。颜色取近似值主要是计算r、g、b三者与对应tailwind颜色r、b、g的**方差**最小者。

### 写入文件

这个没什么好说的，工具做了路径判断，写入的文件夹不存在就创建该文件夹，需要注意的是，file.to配置的路径是相对于file.from的路径，**不是绝对路径**



### 用法

````txt
npm i git+https://github.com/goblin-pitcher/scss-tailwind-trans.git -D
========
npx scss-to-tailwind init // 自动创建配置文件，各配置用法见注释
npx scss-to-tailwind run // 开始执行转换
// 从官网爬转换表，组件内置了一份转换表，若后续需要更新就执行fetch重新爬取
npx scss-to-tailwind fetch 
````

默认配置参见[配置](https://github.com/goblin-pitcher/scss-tailwind-trans/blob/master/src/config-template.js)

### 效果展示

转换前：

![before](https://s1.ax1x.com/2022/04/27/LqBrfP.png)

转换后:

![after](https://s1.ax1x.com/2022/04/27/LqBvkR.png)