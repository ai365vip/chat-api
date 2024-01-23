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

import { BindingScopeEnum } from "../constants/literal_types";

import { isPromise } from "../utils/async";

export const tryGetFromScope = (requestScope, binding) => binding.scope === BindingScopeEnum.Singleton && binding.activated ? binding.cache : binding.scope === BindingScopeEnum.Request && requestScope.has(binding.id) ? requestScope.get(binding.id) : null;

export const saveToScope = (requestScope, binding, result) => {
    binding.scope === BindingScopeEnum.Singleton && _saveToSingletonScope(binding, result), 
    binding.scope === BindingScopeEnum.Request && _saveToRequestScope(requestScope, binding, result);
};

const _saveToRequestScope = (requestScope, binding, result) => {
    requestScope.has(binding.id) || requestScope.set(binding.id, result);
}, _saveToSingletonScope = (binding, result) => {
    binding.cache = result, binding.activated = !0, isPromise(result) && _saveAsyncResultToSingletonScope(binding, result);
}, _saveAsyncResultToSingletonScope = (binding, asyncResult) => __awaiter(void 0, void 0, void 0, (function*() {
    try {
        const result = yield asyncResult;
        binding.cache = result;
    } catch (ex) {
        throw binding.cache = null, binding.activated = !1, ex;
    }
}));
//# sourceMappingURL=scope.js.map
