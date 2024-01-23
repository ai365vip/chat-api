"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.ExpressionFunction = void 0;

class ExpressionFunction {
    static instance() {
        return ExpressionFunction.instance_ || (ExpressionFunction.instance_ = new ExpressionFunction), 
        ExpressionFunction.instance_;
    }
    constructor() {
        this.functions = {};
    }
    registerFunction(name, fun) {
        name && fun && (this.functions[name] = fun);
    }
    unregisterFunction(name) {
        name && delete this.functions[name];
    }
    getFunction(name) {
        return this.functions[name] || null;
    }
    getFunctionNameList() {
        return Object.keys(this.functions);
    }
}

exports.ExpressionFunction = ExpressionFunction;
//# sourceMappingURL=expression-function.js.map