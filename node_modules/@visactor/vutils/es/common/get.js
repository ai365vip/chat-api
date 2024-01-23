import isString from "./isString";

const get = (obj, path, defaultValue) => {
    const paths = isString(path) ? path.split(".") : path;
    for (let p = 0; p < paths.length; p++) obj = obj ? obj[paths[p]] : void 0;
    return void 0 === obj ? defaultValue : obj;
};

export default get;
//# sourceMappingURL=get.js.map