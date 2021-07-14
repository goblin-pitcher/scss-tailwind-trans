const scssTrans = require("./src");
const initConfig = require("./src/init-config");
const genTailwindResource = require("./src/gen-tailwind-resource");
const { splitCssProp, formatCssProp } = require("./lib/common");

exports.scssTrans = scssTrans;
exports.initConfig = initConfig;
exports.genTailwindResource = genTailwindResource;

exports.splitCssProp = splitCssProp;
exports.formatCssProp = formatCssProp;
