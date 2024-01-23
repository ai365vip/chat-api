"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isString_1 = __importDefault(require("./isString")), get = (obj, path, defaultValue) => {
    const paths = (0, isString_1.default)(path) ? path.split(".") : path;
    for (let p = 0; p < paths.length; p++) obj = obj ? obj[paths[p]] : void 0;
    return void 0 === obj ? defaultValue : obj;
};

exports.default = get;
//# sourceMappingURL=get.js.map