import isFunction from "./isFunction";

const constant = value => isFunction(value) ? value : () => value;

export default constant;
//# sourceMappingURL=constant.js.map