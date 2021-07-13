const { parallelExec } = require("../../../common");
const { propFuncArr } = require("./compose-prop-rules");
const splitComposeDecl = (decl) => {
  const key = decl.prop;
  const value = decl.value;
  const transResult = parallelExec([...propFuncArr])(key, value).filter(
    Boolean
  ).flat();
  return [[key, value], ...transResult];
};

module.exports = splitComposeDecl;
