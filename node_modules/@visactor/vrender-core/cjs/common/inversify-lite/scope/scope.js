"use strict";

var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))((function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            var value;
            result.done ? resolve(result.value) : (value = result.value, value instanceof P ? value : new P((function(resolve) {
                resolve(value);
            }))).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    }));
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.saveToScope = exports.tryGetFromScope = void 0;

const literal_types_1 = require("../constants/literal_types"), async_1 = require("../utils/async"), tryGetFromScope = (requestScope, binding) => binding.scope === literal_types_1.BindingScopeEnum.Singleton && binding.activated ? binding.cache : binding.scope === literal_types_1.BindingScopeEnum.Request && requestScope.has(binding.id) ? requestScope.get(binding.id) : null;

exports.tryGetFromScope = tryGetFromScope;

const saveToScope = (requestScope, binding, result) => {
    binding.scope === literal_types_1.BindingScopeEnum.Singleton && _saveToSingletonScope(binding, result), 
    binding.scope === literal_types_1.BindingScopeEnum.Request && _saveToRequestScope(requestScope, binding, result);
};

exports.saveToScope = saveToScope;

const _saveToRequestScope = (requestScope, binding, result) => {
    requestScope.has(binding.id) || requestScope.set(binding.id, result);
}, _saveToSingletonScope = (binding, result) => {
    binding.cache = result, binding.activated = !0, (0, async_1.isPromise)(result) && _saveAsyncResultToSingletonScope(binding, result);
}, _saveAsyncResultToSingletonScope = (binding, asyncResult) => __awaiter(void 0, void 0, void 0, (function*() {
    try {
        const result = yield asyncResult;
        binding.cache = result;
    } catch (ex) {
        throw binding.cache = null, binding.activated = !1, ex;
    }
}));
//# sourceMappingURL=scope.js.map
