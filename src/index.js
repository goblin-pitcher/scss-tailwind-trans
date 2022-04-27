const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const SimpleScssLoader = require("../lib/SimpleScssLoader");
const tailwindTransPlugin = require("../lib/tailwind-trans-plugin");
const FileTraverse = require("../lib/file-traverse");

const mkdirAndWriteFileSync = (writePath, ...extraArgs) => {
  const parseInfo = path.parse(writePath);
  const {dir, name, ext} = parseInfo;
  const tapPathArr = path.relative(process.cwd(), dir).split(/\\+/).filter(Boolean);
  tapPathArr.reduce((p, dirName)=>{
    const dirFileSet = new Set(fs.readdirSync(p))
    if(!dirFileSet.has(dirName)) {
      fs.mkdirSync(path.join(p, dirName))
    }
    p = path.join(p, dirName)
    return p
  }, process.cwd())
  fs.writeFileSync(writePath, ...extraArgs)
}

const parseOutputName = (filePath, relativePath) => {
  if (!path.isAbsolute(filePath)) {
    const dirname = path.dirname(relativePath);
    filePath = path.resolve(dirname, filePath);
  }
  const { name } = path.parse(relativePath);
  return filePath.replace(/\[name\]/g, name);
};

const parseFile = (scssLoader, postcssLoader) => async (filePath) => {
  try {
    const scssContent = await scssLoader.load(filePath);
    const result = await postcssLoader.process(JSON.parse(scssContent), {});
    return result.css;
  } catch (err) {
    console.log(err);
  }
};

const scssTransTailwind = (options = {}) => {
  const { scss: scssOpts, postcss: postcssOpts, file: fileOpts } = options;
  const scssLoader = new SimpleScssLoader(scssOpts);
  const postcssLoader = postcss([tailwindTransPlugin(postcssOpts)]);
  const parseFileFunc = parseFile(scssLoader, postcssLoader);
  const visit = (filePath) => {
    // console.log(filePath);
    parseFileFunc(filePath).then((rst) => {
      if (!rst) return;
      const optUrl = parseOutputName(fileOpts.to, filePath);
      mkdirAndWriteFileSync(optUrl, rst);
    });
  };
  const fileTraverse = new FileTraverse({
    include: fileOpts.include,
    exclude: fileOpts.exclude,
    visit,
  });
  []
    .concat(fileOpts.from)
    .map((rootPath) => {
      if (path.isAbsolute(rootPath)) {
        return rootPath;
      }
      return path.resolve(process.cwd(), rootPath);
    })
    .forEach((root) => {
      fileTraverse.traverse(root);
    });
};

module.exports = scssTransTailwind;
